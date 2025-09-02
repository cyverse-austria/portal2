const axios = require('axios')
const { logger } = require('../../lib/logging')
const config = require('../../lib/config')

async function userCreationWorkflow(user) {
    if (!user) throw 'Missing required property'

    logger.info(`Running native workflow for user ${user.username}: creation`)

    const { url: baseUrl } = config.getPortalConductorConfig()
    if (!baseUrl) {
        throw new Error('PORTAL_CONDUCTOR_URL configuration is not set')
    }

    const requestBody = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        user_id: user.username,
        password: user.password,
        department: user.department,
        organization: user.institution,
        title: user.occupation.name
    }

    try {
        const response = await axios.post(`${baseUrl}/users`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        logger.info(`User creation request successful for ${user.username}`)
        return response.data
    } catch (error) {
        logger.error(`User creation request failed for ${user.username}:`, error.message)
        throw error
    }
}

async function userPasswordUpdateWorkflow(user) {
    if (!user) throw 'Missing required property'

    logger.info(
        `Running native workflow for user ${user.username}: password update`
    )

    const { url: baseUrl } = config.getPortalConductorConfig()
    if (!baseUrl) {
        throw new Error('PORTAL_CONDUCTOR_URL configuration is not set')
    }

    try {
        const response = await axios.post(`${baseUrl}/users/${user.username}/password`, null, {
            params: {
                password: user.password
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
        logger.info(`User password update request successful for ${user.username}`)
        return response.data
    } catch (error) {
        logger.error(`User password update request failed for ${user.username}:`, error.message)
        throw error
    }
}

// Based on v1 portal:/account/views/user.py:perform_destroy()
async function userDeletionWorkflow(user) {
    if (!user || !user.emails) throw 'Missing required property'

    logger.info(`Running native workflow for user ${user.username}: deletion`)

    const { url: baseUrl } = config.getPortalConductorConfig()
    if (!baseUrl) {
        throw new Error('PORTAL_CONDUCTOR_URL configuration is not set')
    }

    try {
        const response = await axios.delete(`${baseUrl}/users/${user.username}`)
        logger.info(`User deletion request successful for ${user.username}`)
        return response.data
    } catch (error) {
        logger.error(`User deletion request failed for ${user.username}:`, error.message)
        throw error
    }
}

module.exports = {
    userCreationWorkflow,
    userDeletionWorkflow,
    userPasswordUpdateWorkflow,
}
