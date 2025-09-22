const {
    registerDatastoreService,
    validateRegistrationRequest,
    logServiceRegistration,
    logServiceRegistrationError,
} = require('./utils')

/**
 * SciApps service registration implementation
 *
 * SciApps users need:
 * - Access to sci_data iRODS collection with maizecode user permissions
 */

/**
 * Register a user for SciApps service access
 * @param {Object} user - User object with username and email
 * @param {Object} service - Service object with approval_key
 * @returns {Promise<Object>} Registration result
 * @throws {Error} If registration fails
 */
async function registerSciAppsUser(user, service) {
    validateRegistrationRequest(user, service)

    try {
        const results = {}

        // Register user for SciApps data access in iRODS with maizecode user
        logServiceRegistration(user, service, 'registering datastore access')
        const datastoreResult = await registerDatastoreService(
            user.username,
            'sci_data',
            'maizecode'
        )
        results.datastore = datastoreResult

        logServiceRegistration(
            user,
            service,
            'registration completed successfully'
        )
        return {
            success: true,
            service: 'SCI_APPS',
            user: user.username,
            actions: results,
        }
    } catch (error) {
        logServiceRegistrationError(
            user,
            service,
            'sciapps registration',
            error
        )
        throw error
    }
}

module.exports = {
    register: registerSciAppsUser,
}
