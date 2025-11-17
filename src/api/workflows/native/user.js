const { logger } = require('../../lib/logging')
const { makeRequest } = require('./services/utils')

async function userCreationWorkflow(user) {
    if (!user) throw 'Missing required property'

    logger.info(`Running native workflow for user ${user.username}: creation`)

    // Generate numeric uidNumber for LDAP using user ID + offset
    const config = require('../../lib/config')
    const securityConfig = config.getSecurityConfig()
    const uidNumberOffset = securityConfig?.uidNumberOffset || 2831
    const uidNumber = user.id + uidNumberOffset

    logger.info(
        `Generating uidNumber for user ${user.username}: ${uidNumber} (id: ${user.id} + offset: ${uidNumberOffset})`
    )

    const requestBody = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        user_uid: uidNumber.toString(),
        password: user.password,
        department: user.department,
        organization: user.institution,
        title: user.occupation.name,
    }

    try {
        const response = await makeRequest('POST', 'users/', requestBody)
        logger.info(`User creation request successful for ${user.username}`)
        return response
    } catch (error) {
        logger.error(
            `User creation request failed for ${user.username}:`,
            error.message
        )
        throw error
    }
}

async function userPasswordUpdateWorkflow(user) {
    if (!user) throw 'Missing required property'

    logger.info(
        `Running native workflow for user ${user.username}: password update`
    )

    try {
        const response = await makeRequest(
            'POST',
            `users/${user.username}/password`,
            {
                password: user.password,
            }
        )
        logger.info(
            `User password update request successful for ${user.username}`
        )
        return response
    } catch (error) {
        logger.error(
            `User password update request failed for ${user.username}:`,
            error.message
        )
        throw error
    }
}

// Based on v1 portal:/account/views/user.py:perform_destroy()
async function userDeletionWorkflow(user) {
    if (!user || !user.emails) throw 'Missing required property'

    logger.info(`Running native workflow for user ${user.username}: deletion`)

    try {
        const response = await makeRequest('DELETE', `users/${user.username}`)
        logger.info(`User deletion request successful for ${user.username}`)
        return response
    } catch (error) {
        logger.error(
            `User deletion request failed for ${user.username}:`,
            error.message
        )
        throw error
    }
}

module.exports = {
    userCreationWorkflow,
    userDeletionWorkflow,
    userPasswordUpdateWorkflow,
}
