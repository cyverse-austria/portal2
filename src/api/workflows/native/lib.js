const config = require('../../lib/config')
const { joinUrl } = require('../../lib/url')

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

module.exports = {
    terrainSubmitViceAccessRequest,
}
