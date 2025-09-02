const crypto = require('crypto')
const axios = require('axios')
const { logger } = require('../../lib/logging')
const config = require('../../lib/config')
const models = require('../../models')
const MailingList = models.api_mailinglist
const EmailAddress = models.account_emailaddress
const EmailAddressToMailingList = models.api_emailaddressmailinglist

async function serviceRegistrationWorkflow(request) {
    const user = request.user
    const service = request.service
    if (!user || !service)
        throw 'serviceRegistrationWorkflow: Missing required property'

    logger.info(
        `Running native workflow for service ${service.name} and user ${user.username}`
    )

    const { url: baseUrl } = config.getPortalConductorConfig()
    if (!baseUrl) {
        throw new Error('PORTAL_CONDUCTOR_URL configuration is not set')
    }

    const requestBody = {
        user: {
            username: user.username,
            email: user.email,
        },
        service: {
            approval_key: service.approval_key,
        },
    }

    try {
        const response = await axios.post(
            `${baseUrl}/services/register`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
        logger.info(
            `Service registration request successful for service ${service.name} and user ${user.username}`
        )
        return response.data
    } catch (error) {
        logger.error(
            `Service registration request failed for service ${service.name} and user ${user.username}:`,
            error.message
        )
        throw error
    }
}

module.exports = { serviceRegistrationWorkflow }
