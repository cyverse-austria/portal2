const {
    registerDatastoreService,
    validateRegistrationRequest,
    logServiceRegistration,
    logServiceRegistrationError,
} = require('./utils')

/**
 * COGE service registration implementation
 *
 * COGE users need:
 * - Access to coge_data iRODS collection
 */

/**
 * Register a user for COGE service access
 * @param {Object} user - User object with username and email
 * @param {Object} service - Service object with approval_key
 * @returns {Promise<Object>} Registration result
 * @throws {Error} If registration fails
 */
async function registerCogeUser(user, service) {
    validateRegistrationRequest(user, service)

    try {
        const results = {}

        // Register user for COGE data access in iRODS
        logServiceRegistration(user, service, 'registering datastore access')
        const datastoreResult = await registerDatastoreService(
            user.username,
            'coge_data'
        )
        results.datastore = datastoreResult

        logServiceRegistration(
            user,
            service,
            'registration completed successfully'
        )
        return {
            success: true,
            service: 'COGE',
            user: user.username,
            actions: results,
        }
    } catch (error) {
        logServiceRegistrationError(user, service, 'coge registration', error)
        throw error
    }
}

module.exports = {
    register: registerCogeUser,
}
