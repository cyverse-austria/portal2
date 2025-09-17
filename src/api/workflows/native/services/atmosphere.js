const {
    registerDatastoreService,
    addToMailingList,
    validateRegistrationRequest,
    logServiceRegistration,
    logServiceRegistrationError
} = require('./utils')

/**
 * Atmosphere service registration implementation
 *
 * Atmosphere users need:
 * - Access to atmosphere_data iRODS collection
 * - Subscription to atmosphere-users mailing list
 */

/**
 * Register a user for Atmosphere service access
 * @param {Object} user - User object with username and email
 * @param {Object} service - Service object with approval_key
 * @returns {Promise<Object>} Registration result
 * @throws {Error} If registration fails
 */
async function registerAtmosphereUser(user, service) {
    validateRegistrationRequest(user, service)

    try {
        const results = {}

        // Register user for Atmosphere data access in iRODS
        logServiceRegistration(user, service, 'registering datastore access')
        const datastoreResult = await registerDatastoreService(
            user.username,
            'atmosphere_data'
        )
        results.datastore = datastoreResult

        // Add user to Atmosphere mailing list
        logServiceRegistration(user, service, 'adding to mailing list')
        const mailingListResult = await addToMailingList(
            'atmosphere-users',
            user.email
        )
        results.mailingList = mailingListResult

        logServiceRegistration(user, service, 'registration completed successfully')
        return {
            success: true,
            service: 'ATMOSPHERE',
            user: user.username,
            actions: results
        }

    } catch (error) {
        logServiceRegistrationError(user, service, 'atmosphere registration', error)
        throw error
    }
}

module.exports = {
    register: registerAtmosphereUser
}