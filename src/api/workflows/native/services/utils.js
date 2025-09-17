const axios = require('axios')
const { logger } = require('../../../lib/logging')
const config = require('../../../lib/config')
const { joinUrl } = require('../../../lib/url')

/**
 * Portal-Conductor API client utilities for service registration
 *
 * This module provides reusable functions for calling portal-conductor's
 * granular endpoints, following the DRY principle and ensuring consistent
 * error handling and logging.
 */

/**
 * Get portal-conductor base URL from configuration
 * @returns {string} Base URL for portal-conductor API
 * @throws {Error} If portal-conductor URL is not configured
 */
function getPortalConductorUrl() {
    const { url: baseUrl } = config.getPortalConductorConfig()
    if (!baseUrl) {
        throw new Error('PORTAL_CONDUCTOR_URL configuration is not set')
    }
    return baseUrl
}

/**
 * Make an HTTP request to portal-conductor with proper error handling
 * @param {string} method - HTTP method (GET, POST, DELETE, etc.)
 * @param {string} endpoint - API endpoint relative to base URL
 * @param {Object} data - Request body data (for POST/PUT requests)
 * @param {Object} options - Additional axios options
 * @returns {Promise<Object>} Response data
 * @throws {Error} If request fails
 */
async function makeRequest(method, endpoint, data = null, options = {}) {
    const baseUrl = getPortalConductorUrl()
    const url = joinUrl(baseUrl, endpoint)

    const requestConfig = {
        method,
        url,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    }

    if (data) {
        requestConfig.data = data
    }

    try {
        logger.debug(`Portal-conductor request: ${method} ${endpoint}`)
        const response = await axios(requestConfig)
        logger.debug(`Portal-conductor response: ${response.status}`)
        return response.data
    } catch (error) {
        const errorMessage = error.response?.data?.detail || error.message
        logger.error(`Portal-conductor request failed: ${method} ${endpoint} - ${errorMessage}`)
        throw new Error(`Portal-conductor API error: ${errorMessage}`)
    }
}

/**
 * Add a user to an LDAP group via portal-conductor
 * @param {string} username - Username to add to group
 * @param {string} groupname - LDAP group name
 * @returns {Promise<Object>} Response data
 */
async function addUserToLdapGroup(username, groupname) {
    return await makeRequest('POST', `ldap/users/${username}/groups/${groupname}`)
}

/**
 * Get all LDAP groups for a user via portal-conductor
 * @param {string} username - Username to lookup
 * @returns {Promise<string[]>} List of group names
 */
async function getUserLdapGroups(username) {
    return await makeRequest('GET', `ldap/users/${username}/groups`)
}

/**
 * Remove a user from an LDAP group via portal-conductor
 * @param {string} username - Username to remove from group
 * @param {string} groupname - LDAP group name
 * @returns {Promise<Object>} Response data
 */
async function removeUserFromLdapGroup(username, groupname) {
    return await makeRequest('DELETE', `ldap/users/${username}/groups/${groupname}`)
}

/**
 * Register a user for datastore service access via portal-conductor
 * @param {string} username - Username to register
 * @param {string} irodsPath - iRODS path for the service
 * @param {string|null} irodsUser - Optional iRODS user for the service
 * @returns {Promise<Object>} Response data
 */
async function registerDatastoreService(username, irodsPath, irodsUser = null) {
    const requestData = { irods_path: irodsPath }
    if (irodsUser) {
        requestData.irods_user = irodsUser
    }

    return await makeRequest('POST', `datastore/users/${username}/services`, requestData)
}

/**
 * Add a user to a mailing list via portal-conductor
 * @param {string} listname - Mailing list name
 * @param {string} email - Email address to add
 * @returns {Promise<Object>} Response data
 */
async function addToMailingList(listname, email) {
    return await makeRequest('POST', `mailinglists/${listname}/members`, { email })
}

/**
 * Remove a user from a mailing list via portal-conductor
 * @param {string} listname - Mailing list name
 * @param {string} email - Email address to remove
 * @returns {Promise<Object>} Response data
 */
async function removeFromMailingList(listname, email) {
    return await makeRequest('DELETE', `mailinglists/${listname}/members/${email}`)
}

/**
 * Set VICE job limits for a user via portal-conductor
 * @param {string} username - Username to set limits for
 * @param {string} limit - Job limit value
 * @returns {Promise<Object>} Response data
 */
async function setJobLimits(username, limit) {
    return await makeRequest('POST', `terrain/users/${username}/job-limits`, { limit })
}

/**
 * Validate that a user and service are provided for registration
 * @param {Object} user - User object
 * @param {Object} service - Service object
 * @throws {Error} If user or service is missing
 */
function validateRegistrationRequest(user, service) {
    if (!user || !user.username || !user.email) {
        throw new Error('User information is required for service registration')
    }
    if (!service || !service.approval_key) {
        throw new Error('Service information is required for service registration')
    }
}

/**
 * Log successful service registration (without sensitive data)
 * @param {Object} user - User object
 * @param {Object} service - Service object
 * @param {string} action - Action performed
 */
function logServiceRegistration(user, service, action) {
    logger.info(`Service registration: ${action} for service ${service.approval_key} and user ${user.username}`)
}

/**
 * Log service registration error (without sensitive data)
 * @param {Object} user - User object
 * @param {Object} service - Service object
 * @param {string} action - Action attempted
 * @param {Error} error - Error that occurred
 */
function logServiceRegistrationError(user, service, action, error) {
    logger.error(`Service registration failed: ${action} for service ${service.approval_key} and user ${user.username} - ${error.message}`)
}

module.exports = {
    addUserToLdapGroup,
    getUserLdapGroups,
    removeUserFromLdapGroup,
    registerDatastoreService,
    addToMailingList,
    removeFromMailingList,
    setJobLimits,
    validateRegistrationRequest,
    logServiceRegistration,
    logServiceRegistrationError
}