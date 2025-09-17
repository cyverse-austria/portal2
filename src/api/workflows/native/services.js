const { logger } = require('../../lib/logging')
const { getServiceImplementation, isServiceSupported } = require('./services/index')

/**
 * Service Registration Workflow Router
 *
 * This module routes service registration requests to the appropriate
 * service-specific implementation based on the approval key.
 *
 * Benefits of this approach:
 * - Clear separation of concerns per service
 * - Easier to maintain and extend
 * - Service-specific error handling and logging
 * - Better compliance with DRY principle
 */

async function serviceRegistrationWorkflow(request) {
    const user = request.user
    const service = request.service

    if (!user || !service) {
        throw new Error('serviceRegistrationWorkflow: Missing required property')
    }

    const approvalKey = service.approval_key
    if (!approvalKey) {
        throw new Error('Service approval key is required')
    }

    logger.info(
        `Running service registration workflow for service ${service.name} (${approvalKey}) and user ${user.username}`
    )

    // Check if the service is supported
    if (!isServiceSupported(approvalKey)) {
        const errorMessage = `Unknown service approval key: ${approvalKey}`
        logger.error(errorMessage)
        throw new Error(errorMessage)
    }

    try {
        // Get the service-specific implementation
        const serviceImpl = getServiceImplementation(approvalKey)

        // Execute the service-specific registration logic
        const result = await serviceImpl.register(user, service)

        logger.info(
            `Service registration workflow completed successfully for service ${service.name} and user ${user.username}`
        )

        return result

    } catch (error) {
        logger.error(
            `Service registration workflow failed for service ${service.name} and user ${user.username}: ${error.message}`
        )
        throw error
    }
}

module.exports = { serviceRegistrationWorkflow }
