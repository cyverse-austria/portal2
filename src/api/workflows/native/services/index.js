/**
 * Service Registration Implementations
 *
 * This module exports individual service registration implementations
 * that handle the specific requirements for each CyVerse service.
 *
 * Each service implementation:
 * - Validates user and service data
 * - Makes appropriate calls to portal-conductor APIs
 * - Provides detailed logging without sensitive data
 * - Returns standardized response format
 */

const atmosphere = require('./atmosphere')
const coge = require('./coge')
const discoveryEnvironment = require('./discoveryEnvironment')
const sciApps = require('./sciApps')
const vice = require('./vice')

/**
 * Map of approval keys to their corresponding service implementations
 * This ensures that approval keys match exactly with what's stored in the database
 */
const serviceImplementations = {
    ATMOSPHERE: atmosphere,
    COGE: coge,
    DISCOVERY_ENVIRONMENT: discoveryEnvironment,
    SCI_APPS: sciApps,
    VICE: vice,
}

/**
 * Get list of supported approval keys
 * @returns {string[]} Array of supported approval keys
 */
function getSupportedServices() {
    return Object.keys(serviceImplementations)
}

/**
 * Check if a service approval key is supported
 * @param {string} approvalKey - Service approval key to check
 * @returns {boolean} True if service is supported
 */
function isServiceSupported(approvalKey) {
    return approvalKey in serviceImplementations
}

/**
 * Get service implementation for a given approval key
 * @param {string} approvalKey - Service approval key
 * @returns {Object} Service implementation module
 * @throws {Error} If service is not supported
 */
function getServiceImplementation(approvalKey) {
    if (!isServiceSupported(approvalKey)) {
        throw new Error(`Unsupported service approval key: ${approvalKey}`)
    }
    return serviceImplementations[approvalKey]
}

module.exports = {
    serviceImplementations,
    getSupportedServices,
    isServiceSupported,
    getServiceImplementation,
}
