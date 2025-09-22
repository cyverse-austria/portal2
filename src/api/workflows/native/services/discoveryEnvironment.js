const {
    addUserToLdapGroup,
    addToMailingList,
    validateRegistrationRequest,
    logServiceRegistration,
    logServiceRegistrationError,
} = require('./utils')

/**
 * Discovery Environment service registration implementation
 *
 * Discovery Environment users need:
 * - Membership in de-preview-access LDAP group
 * - Subscription to de-users mailing list
 * - Subscription to datastore-users mailing list
 */

/**
 * Register a user for Discovery Environment service access
 * @param {Object} user - User object with username and email
 * @param {Object} service - Service object with approval_key
 * @returns {Promise<Object>} Registration result
 * @throws {Error} If registration fails
 */
async function registerDiscoveryEnvironmentUser(user, service) {
    validateRegistrationRequest(user, service)

    try {
        const results = {}

        // Add user to DE preview access LDAP group
        logServiceRegistration(user, service, 'adding to LDAP group')
        const ldapResult = await addUserToLdapGroup(
            user.username,
            'de-preview-access'
        )
        results.ldapGroup = ldapResult

        // Add user to DE users mailing list
        logServiceRegistration(user, service, 'adding to de-users mailing list')
        const deMailingListResult = await addToMailingList(
            'de-users',
            user.email
        )
        results.deMailingList = deMailingListResult

        // Add user to datastore users mailing list
        logServiceRegistration(
            user,
            service,
            'adding to datastore-users mailing list'
        )
        const datastoreMailingListResult = await addToMailingList(
            'datastore-users',
            user.email
        )
        results.datastoreMailingList = datastoreMailingListResult

        logServiceRegistration(
            user,
            service,
            'registration completed successfully'
        )
        return {
            success: true,
            service: 'DISCOVERY_ENVIRONMENT',
            user: user.username,
            actions: results,
        }
    } catch (error) {
        logServiceRegistrationError(
            user,
            service,
            'discovery environment registration',
            error
        )
        throw error
    }
}

module.exports = {
    register: registerDiscoveryEnvironmentUser,
}
