const {
    setJobLimits,
    validateRegistrationRequest,
    logServiceRegistration,
    logServiceRegistrationError,
} = require('./utils')

/**
 * VICE service registration implementation
 *
 * VICE users need:
 * - Concurrent job limits set via Terrain API (default: 2)
 */

/**
 * Register a user for VICE service access
 * @param {Object} user - User object with username and email
 * @param {Object} service - Service object with approval_key
 * @returns {Promise<Object>} Registration result
 * @throws {Error} If registration fails
 */
async function registerViceUser(user, service) {
    validateRegistrationRequest(user, service)

    try {
        const results = {}

        // Set VICE job limits for the user (default: 2 concurrent jobs)
        logServiceRegistration(user, service, 'setting job limits')
        const jobLimitsResult = await setJobLimits(user.username, 2)
        results.jobLimits = jobLimitsResult

        logServiceRegistration(
            user,
            service,
            'registration completed successfully'
        )
        return {
            success: true,
            service: 'VICE',
            user: user.username,
            actions: results,
        }
    } catch (error) {
        logServiceRegistrationError(user, service, 'vice registration', error)
        throw error
    }
}

module.exports = {
    register: registerViceUser,
}
