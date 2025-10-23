const router = require('express').Router()
const { logger } = require('./lib/logging')
const { requireAdmin, isAdmin, getUser, asyncHandler } = require('./lib/auth')
const config = require('./lib/config')
const { generateToken } = require('./lib/hmac')
const { emailPasswordReset } = require('./lib/email')
const { encodePassword } = require('./lib/password')
const { ldapModify } = require('./workflows/native/lib.js')
const {
    userPasswordUpdateWorkflow,
    userDeletionWorkflow,
    userCreationWorkflow,
} = require('./workflows/native/user.js')
const {
    validateLdapPassword,
    getUserLdapInfo,
    makeRequest,
} = require('./workflows/native/services/utils')
const sequelize = require('sequelize')
const models = require('./models')
const User = models.account_user
const RestrictedUsername = models.account_restrictedusername
const PasswordResetRequest = models.account_passwordresetrequest
const EmailAddress = models.account_emailaddress
const Workshop = models.api_workshop
const WorkshopOrganizer = models.api_workshoporganizer
const { UI_ACCOUNT_REVIEW_URL } = require('../constants/server')

//TODO move into module
const likeAny = (key, vals) =>
    sequelize.where(sequelize.fn('lower', sequelize.col(key)), {
        [sequelize.Op.like]: { [sequelize.Op.any]: vals.map(k => `%${k}%`) },
    })

// Get/search all users (STAFF AND WORKSHOP ORGANIZER ONLY)
router.get(
    '/',
    getUser,
    asyncHandler(async (req, res) => {
        // Check permission
        if (!req.user || !req.user.is_staff) {
            // staff
            if (!Workshop.findOne({ where: { creator_id: req.user.id } })) {
                // workshop host
                if (
                    !WorkshopOrganizer.findOne({
                        where: { organizer_id: req.user.id },
                    })
                ) {
                    // workshop organizer
                    return res.status(403).send('Permission denied')
                }
            }
        }

        const offset = req.query.offset
        const limit = req.query.limit || 10
        const keyword = req.query.keyword
        const keywords =
            keyword &&
            keyword
                .split(' ')
                .filter(k => k)
                .map(k => k.toLowerCase())

        const { count, rows } = await User.unscoped().findAndCountAll({
            where: keyword
                ? sequelize.or(
                      { id: isNaN(keyword) ? 0 : keyword },
                      likeAny('first_name', keywords),
                      likeAny('last_name', keywords),
                      likeAny('username', keywords),
                      likeAny('email', keywords),
                      likeAny('institution', keywords),
                      likeAny('occupation.name', keywords),
                      likeAny('region.name', keywords),
                      likeAny('region.country.name', keywords)
                  )
                : null,
            include: [
                'occupation',
                {
                    model: models.account_region,
                    as: 'region',

                    include: ['country'],
                },
            ],
            attributes: [
                'id',
                'username',
                'first_name',
                'last_name',
                'email',
                'institution',
                'date_joined',
            ],
            order: [['id', 'DESC']],
            offset: offset,
            limit: limit,
            distinct: true,
            subQuery: false,
        })

        res.status(200).json({ count, results: rows })
    })
)

// Get current user based on token
router.get('/mine', getUser, (req, res) => {
    res.status(200).json(req.user)
})

// Get individual user (STAFF ONLY)
router.get(
    '/:usernameOrId(\\w+)',
    requireAdmin,
    asyncHandler(async (req, res) => {
        const usernameOrId = req.params.usernameOrId
        const scope = req.query.scope || 'defaultScope'

        const user = await User.scope(scope).findOne({
            where: sequelize.or(
                { id: isNaN(usernameOrId) ? 0 : usernameOrId },
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('username')),
                    usernameOrId.toLowerCase()
                )
            ),
        })
        if (!user) return res.status(404).send('User not found')

        res.status(200).json(user)
    })
)

// For Profile Update Reminder: https://cyverse.atlassian.net/wiki/spaces/CNS/pages/1166475265/Profile+Update+Reminder
router.get(
    '/:usernameOrId(\\w+)/status',
    getUser,
    asyncHandler(async (req, res) => {
        const usernameOrId = req.params.usernameOrId

        if (
            !req.user.is_staff &&
            req.user.username != usernameOrId &&
            req.user.id != usernameOrId
        )
            return res.status(403).send('Permission denied')

        const user = await User.findOne({
            where: sequelize.or(
                { id: isNaN(usernameOrId) ? 0 : usernameOrId },
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('username')),
                    usernameOrId.toLowerCase()
                )
            ),
        })
        if (!user) return res.status(404).send('User not found')

        const profileConfig = config.getProfileConfig()
        const daysSinceUpdate =
            (Date.now() - new Date(user.updated_at)) / (24 * 60 * 60 * 1000)
        res.status(200).json({
            updated_at: user.updated_at,
            update_required: daysSinceUpdate > profileConfig.updatePeriod,
            warning_required:
                daysSinceUpdate <= profileConfig.updatePeriod &&
                daysSinceUpdate >
                    profileConfig.updatePeriod - profileConfig.warningPeriod,
            update_period: profileConfig.updatePeriod,
            warning_period: profileConfig.warningPeriod,
            update_text: profileConfig.updateText,
            warning_text: profileConfig.warningText,
            update_url: UI_ACCOUNT_REVIEW_URL,
        })
    })
)

// Get individual user's history (STAFF ONLY)
router.get(
    '/:id(\\d+)/history',
    requireAdmin,
    asyncHandler(async (req, res) => {
        const services = await models.api_service.findAll()
        const workshops = await models.api_workshop.findAll()
        const forms = await models.api_form.findAll()
        const user = await User.findByPk(req.params.id, {
            include: [
                'password_reset_requests',
                'password_resets',
                'form_submissions',
                {
                    model: models.api_accessrequest,
                    as: 'access_requests',
                    include: ['logs'],
                },
                {
                    model: models.api_workshopenrollmentrequest,
                    as: 'enrollment_requests',
                    include: ['logs'],
                },
            ],
        })

        let history = []

        history.push({ date: user.date_joined, message: `Account created` })

        history = history.concat(
            user.password_reset_requests.map(r => {
                return {
                    date: r.created_at,
                    message: `Password reset request (HMAC ${r.key})`,
                }
            })
        )
        history = history.concat(
            user.password_resets.map(r => {
                return {
                    date: r.created_at,
                    message: `Password set/reset (HMAC ${r.key})`,
                }
            })
        )
        history = history.concat(
            user.access_requests.map(r => {
                const service = services.find(s => s.id == r.service_id)
                return {
                    date: r.created_at,
                    message:
                        `Access requested for service ${service.name}` +
                        (r.auto_approve ? ' (auto approve)' : ''),
                }
            })
        )
        for (const request of user.access_requests) {
            history = history.concat(
                request.logs.map(l => {
                    const service = services.find(
                        s => s.id == request.service_id
                    )
                    return {
                        date: l.created_at,
                        message: `${l.message} for service ${service.name}`,
                    }
                })
            )
        }
        history = history.concat(
            user.enrollment_requests.map(r => {
                const workshop = workshops.find(w => w.id == r.workshop_id)
                return {
                    date: r.created_at,
                    message:
                        `Enrollment requested for workshop ${workshop.title}` +
                        (r.auto_approve ? ' (auto approve)' : ''),
                }
            })
        )
        for (const request of user.enrollment_requests) {
            history = history.concat(
                request.logs.map(l => {
                    const workshop = workshops.find(
                        w => w.id == request.workshop_id
                    )
                    return {
                        date: l.created_at,
                        message: `${l.message} for workshop ${workshop.title}`,
                    }
                })
            )
        }
        history = history.concat(
            user.form_submissions.map(r => {
                const form = forms.find(f => f.id == r.form_id)
                return {
                    date: r.created_at,
                    message: `Submission for form ${form.name}`,
                }
            })
        )

        history.sort((a, b) => new Date(b.date) - new Date(a.date))

        res.status(200).json(history)
    })
)

// Get individual user's LDAP record for debug (STAFF ONLY)
router.get(
    '/:id(\\d+)/ldap',
    requireAdmin,
    asyncHandler(async (req, res) => {
        const user = await User.findByPk(req.params.id)
        try {
            const ldapInfo = await getUserLdapInfo(user.username)

            // Format the LDAP info as a readable string for the frontend dialog
            const formattedRecord = [
                `Username: ${ldapInfo.username || 'N/A'}`,
                `Full Name: ${ldapInfo.common_name || 'N/A'}`,
                `Email: ${ldapInfo.email || 'N/A'}`,
                `UID Number: ${ldapInfo.uid_number || 'N/A'}`,
                `GID Number: ${ldapInfo.gid_number || 'N/A'}`,
                `Home Directory: ${ldapInfo.home_directory || 'N/A'}`,
                `Login Shell: ${ldapInfo.login_shell || 'N/A'}`,
                `Department: ${ldapInfo.department || 'N/A'}`,
                `Organization: ${ldapInfo.organization || 'N/A'}`,
                `Title: ${ldapInfo.title || 'N/A'}`,
                `Shadow Last Change: ${ldapInfo.shadow_last_change || 'N/A'}`,
                `Shadow Min Days: ${ldapInfo.shadow_min || 'N/A'}`,
                `Shadow Max Days: ${ldapInfo.shadow_max || 'N/A'}`,
                `Shadow Warning Days: ${ldapInfo.shadow_warning || 'N/A'}`,
                `Shadow Inactive Days: ${ldapInfo.shadow_inactive || 'N/A'}`,
                `Object Classes: ${
                    ldapInfo.object_classes
                        ? ldapInfo.object_classes.join(', ')
                        : 'N/A'
                }`,
            ].join('\n')

            res.status(200).send(formattedRecord)
        } catch (error) {
            logger.error(
                `Failed to get LDAP info for user ${user.username}:`,
                error
            )
            res.status(500).send('An error occurred')
        }
    })
)

// Update user permission (STAFF ONLY)
router.post(
    '/:id(\\d+)/permission',
    requireAdmin,
    asyncHandler(async (req, res) => {
        const permission = req.body.permission

        const user = await User.findByPk(req.params.id)
        if (!user) return res.status(404).send('User not found')

        if (user.is_superuser && !req.user.is_superuser)
            return res
                .status(403)
                .send(
                    "Only superuser can modify another superuser's permission"
                )
        if (permission == 'superuser' && !req.user.is_superuser)
            return res
                .status(403)
                .send('Only a superuser can grant superuser permission')
        if (
            permission == 'staff' &&
            !req.user.is_superuser &&
            !req.user.is_staff
        )
            return res
                .status(403)
                .send('Only a superuser/staff can grant staff permission')

        user.is_superuser = permission == 'superuser'
        user.is_staff = permission == 'staff'

        await user.save()
        await user.reload()

        res.status(200).send('success')
    })
)

/*
 * Update user
 *
 * If body is empty then will just return the user
 */
router.post(
    '/:id(\\d+)',
    getUser,
    asyncHandler(async (req, res) => {
        const id = req.params.id
        const fields = req.body

        // Check permission -- user can only update their own record unless admin
        if (id != req.user.id && !isAdmin(req))
            return res.status(403).send('Permission denied')

        let user = await User.findByPk(id)
        if (!user) return res.status(404).send('User not found')

        // Update
        const SUPPORTED_FIELDS = [
            'first_name',
            'last_name',
            'orcid_id',
            'grid_institution_id',
            'department',
            'aware_channel_id',
            'ethnicity_id',
            'funding_agency_id',
            'gender_id',
            'occupation_id',
            'research_area_id',
            'region_id',
            'settings',
            'updated_at', // for profile review page
        ]
        const updated = {}
        const timeNow = Date.now()
        if (fields) {
            for (const key in fields) {
                // Ignore any non-updateable fields
                if (
                    SUPPORTED_FIELDS.includes(key) &&
                    user.getDataValue(key) != fields[key]
                ) {
                    user[key] = fields[key]
                    user['updated_at'] = timeNow
                    updated[key] = true

                    // Special case: automatically set "institution" for backward compatibility
                    if (key == 'grid_institution_id' && fields[key]) {
                        // Validate that the value is numeric (valid ID)
                        const institutionId = parseInt(fields[key])
                        if (!isNaN(institutionId)) {
                            const institution =
                                await models.account_institution_grid.findByPk(
                                    institutionId
                                )
                            if (institution) {
                                user['institution'] = institution.name
                            }
                        }
                        // If non-numeric, skip institution lookup (user entered custom text)
                    }
                }
            }

            await user.save()
            await user.reload()
        }

        res.status(200).json(user)

        // Update LDAP (do this after response as to not delay it)
        if (updated['first_name'] || updated['last_name']) {
            if (updated['first_name'])
                await ldapModify(user.username, 'givenName', user.first_name)
            if (updated['last_name'])
                await ldapModify(user.username, 'sn', user.last_name)
            await ldapModify(
                user.username,
                'cn',
                user.first_name + ' ' + user.last_name
            )
        }
    })
)

/*
 * Update password (password change in Account page)
 *
 * For password reset see src/api/public.js:/users/password
 */
router.post(
    '/password',
    getUser,
    asyncHandler(async (req, res) => {
        const fields = req.body
        if (!fields || !('password' in fields) || !('oldPassword' in fields))
            return res.status(400).send('Missing required field')

        // Re-fetch user unscoped for updating
        const user = await User.unscoped().findByPk(req.user.id, {
            include: ['occupation'],
        })

        // Validate old password against LDAP (source of truth)
        const isPasswordValid = await validateLdapPassword(
            user.username,
            fields.oldPassword
        )
        if (!isPasswordValid) return res.status(400).send('Incorrect password')

        // Update password in DB
        user.password = encodePassword(fields.password)
        await user.save()

        // Update password in LDAP/portal-conductor (do before response to handle errors properly)
        logger.info(`Updating password for user ${user.username}`)
        user.password = fields.password // kludgey, but use raw password
        try {
            await userPasswordUpdateWorkflow(user)
        } catch (error) {
            logger.error(
                `Portal-conductor password update failed for ${user.username}: ${error.message}`
            )
            // Note: DB password was already updated, but LDAP/iRODS failed
            // This is a partial failure state that should be reported to the user
            return res
                .status(500)
                .send(
                    'Password updated in database but failed to update in external systems. Please contact support.'
                )
        }

        res.status(200).send('success')
    })
)

/*
 * Get reset password link for user (STAFF ONLY)
 *
 * Similar to POST /users/reset_password in public.js but for Admin user page.
 * If no HMAC given then one is returned.  If HMAC given then password reset email is sent.
 */
router.post(
    '/:id(\\d+)/reset_password',
    requireAdmin,
    asyncHandler(async (req, res) => {
        let hmac = req.body.hmac // optional

        const user = await User.unscoped().findByPk(req.params.id)

        const emailAddress = await EmailAddress.findOne({
            where: {
                user_id: user.id,
                primary: true,
            },
        })
        emailAddress.user = user // kinda kludgey but emailPasswordReset() expects an EmailAddress object

        if (!hmac) hmac = generateToken(emailAddress.id)

        const passwordResetRequest = PasswordResetRequest.create({
            user_id: user.id,
            username: user.username,
            email_address_id: emailAddress.id,
            email: emailAddress.email,
            key: hmac,
        })
        if (!passwordResetRequest)
            return res.status(500).send('Error creating password reset request')

        res.status(200).send(hmac)

        // Send email after response as to not delay it
        if ('hmac' in req.body) await emailPasswordReset(emailAddress, hmac)
    })
)

/*
 * Admin password reset with portal-conductor integration (STAFF ONLY)
 *
 * Resets a user's password across all systems using portal-conductor workflow.
 * Ensures user exists in datastore, resets password, and validates the new password.
 */
router.post(
    '/:id(\\d+)/admin_password_reset',
    requireAdmin,
    asyncHandler(async (req, res) => {
        const { password } = req.body
        if (!password) {
            return res.status(400).send('Password is required')
        }

        const user = await User.unscoped().findByPk(req.params.id, {
            include: ['occupation'],
        })
        if (!user) return res.status(404).send('User not found')

        logger.info(
            `Admin password reset initiated for user ${user.username} by ${req.user.username}`
        )

        try {
            // Step 1: Check if user exists in datastore, create if not
            try {
                const existsResponse = await makeRequest(
                    'GET',
                    `datastore/users/${user.username}/exists`
                )
                if (existsResponse.exists) {
                    logger.info(
                        `User ${user.username} already exists in datastore`
                    )
                } else {
                    logger.info(
                        `User ${user.username} not found in datastore, creating account`
                    )

                    // Generate numeric uidNumber for LDAP using user ID + offset
                    const config = require('./lib/config')
                    const securityConfig = config.getSecurityConfig()
                    const uidNumberOffset =
                        securityConfig?.uidNumberOffset || 2831
                    const uidNumber = user.id + uidNumberOffset

                    const requestBody = {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        username: user.username,
                        user_uid: uidNumber.toString(),
                        password: password,
                        department: user.department,
                        organization: user.institution,
                        title: user.occupation?.name,
                    }

                    await makeRequest('POST', 'datastore/users', requestBody)
                    logger.info(`User ${user.username} created in datastore`)
                }
            } catch (error) {
                logger.error(
                    `Failed to check/create user in datastore: ${error.message}`
                )
                throw error
            }

            // Step 2: Reset password across all systems
            logger.info(`Resetting password for user ${user.username}`)
            await makeRequest('POST', `users/${user.username}/password`, {
                password: password,
            })

            // Step 3: Validate the new password works
            logger.info(`Validating new password for user ${user.username}`)
            const validationResponse = await makeRequest(
                'POST',
                `users/${user.username}/validate`,
                {
                    password: password,
                }
            )

            if (!validationResponse.valid) {
                throw new Error('Password validation failed after reset')
            }

            // Step 4: Update password in local database
            user.password = encodePassword(password)
            await user.save()

            logger.info(
                `Password reset completed successfully for user ${user.username}`
            )
            res.status(200).json({
                success: true,
                message: 'Password reset successfully across all systems',
            })
        } catch (error) {
            logger.error(
                `Admin password reset failed for ${user.username}: ${error.message}`
            )
            res.status(500).json({
                success: false,
                message: `Password reset failed: ${error.message}`,
            })
        }
    })
)

// Delete user (SUPERUSER ONLY)
router.delete(
    '/:id(\\d+)',
    getUser,
    asyncHandler(async (req, res) => {
        const id = req.params.id

        if (!req.user.is_superuser)
            return res.status(403).send('Permission denied')

        if (id == req.user.id)
            return res.status(403).send('Cannot delete yourself')

        let user = await User.unscoped().findByPk(id, {
            include: [
                {
                    model: models.account_emailaddress,
                    as: 'emails',
                    include: [
                        {
                            model: models.api_mailinglist,
                            as: 'mailing_lists',
                        },
                    ],
                },
            ],
        })
        if (!user) return res.status(404).send('User not found')

        if (user.is_staff || user.is_superuser)
            return res.status(403).send('Cannot delete privileged user')

        // Submit user deletion workflow to remove user from subsystems (LDAP, IRODS, etc)
        await userDeletionWorkflow(user)

        // Remove user from database
        logger.info(`Deleting user ${user.username} id=${user.id}`)
        const opts = { where: { user_id: user.id } }

        //TODO remove these tables eventually (leftover from v1 and no longer used)
        await models.django_cyverse_auth_token.destroy(opts)
        await models.django_admin_log.destroy(opts)
        await models.warden_atmosphereinternationalrequest.destroy(opts)
        await models.warden_atmospherestudentrequest.destroy(opts)

        //TODO add associations in models/index.js to cascade delete these
        await models.account_passwordreset.destroy(opts)
        await models.account_passwordresetrequest.destroy(opts)
        await models.api_userservice.destroy(opts)
        await models.api_workshoporganizer.destroy({
            where: { organizer_id: user.id },
        })

        // Manually delete these as safety measure (cascade should handle but being explicit)
        await models.api_workshopenrollmentrequest.destroy(opts)
        await models.api_formsubmission.destroy(opts)

        await user.destroy()

        res.status(200).send('success')
    })
)

// Get restricted usernames
router.get(
    '/restricted',
    requireAdmin,
    asyncHandler(async (req, res) => {
        const usernames = await RestrictedUsername.findAll({
            attributes: ['id', 'username'],
            order: [['username', 'ASC']],
            // limit: 10
        })

        res.status(200).json(usernames)
    })
)

// Add restricted username
router.put(
    '/restricted/:username(\\S+)',
    requireAdmin,
    asyncHandler(async (req, res) => {
        const [username, created] = await RestrictedUsername.findOrCreate({
            where: { username: req.params.username },
        })
        res.status(201).json(username)
    })
)

// Delete restricted username
router.delete(
    '/restricted/:username(\\S+)',
    requireAdmin,
    asyncHandler(async (req, res) => {
        const username = await RestrictedUsername.findOne({
            where: { username: req.params.username },
        })
        if (!username)
            return res.status(404).send('Restricted username not found')

        await username.destroy()

        res.status(200).send('success')
    })
)

module.exports = router
