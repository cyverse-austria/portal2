/**
 * Safely joins URL parts, ensuring no double slashes in paths
 * @param {string} baseUrl - The base URL (may or may not have trailing slash)
 * @param {...string} paths - Path segments to join
 * @returns {string} - Properly formatted URL
 */
function joinUrl(baseUrl, ...paths) {
    // Remove trailing slash from baseUrl if present
    const cleanBase = baseUrl.replace(/\/+$/, '')

    // Clean each path segment - remove leading/trailing slashes and filter empty segments
    const cleanPaths = paths
        .filter(path => path && typeof path === 'string')
        .map(path => path.replace(/^\/+|\/+$/g, ''))

    // Join all parts with single slashes
    return cleanBase + (cleanPaths.length > 0 ? '/' + cleanPaths.join('/') : '')
}

module.exports = { joinUrl }
