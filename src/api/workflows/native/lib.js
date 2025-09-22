const config = require('../../lib/config')
const { joinUrl } = require('../../lib/url')
const { modifyUserLdapAttribute } = require('./services/utils')

async function terrainSubmitViceAccessRequest(token, user, usage) {
    const data = {
        name: user.first_name + ' ' + user.last_name,
        email: user.email,
        intended_use: usage,
        concurrent_jobs: 2, //FIXME hardcoded
    }

    const response = await fetch(
        joinUrl(config.getTerrainConfig().url, 'requests', 'vice'),
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }
    )

    return response
}

/**
 * Modify a user's LDAP attribute (wrapper for backward compatibility)
 * @param {string} username - Username to modify
 * @param {string} attribute - LDAP attribute name (e.g., 'mail', 'givenName', 'sn', 'cn')
 * @param {string} value - New value for the attribute
 * @returns {Promise<Object>} Response data
 */
async function ldapModify(username, attribute, value) {
    return await modifyUserLdapAttribute(username, attribute, value)
}

module.exports = {
    terrainSubmitViceAccessRequest,
    ldapModify,
}
