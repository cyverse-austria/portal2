// cURL is used for HTTP requests instead of native request libraries
const fs = require('fs')
const { exec, execFile, execSync } = require('child_process')
var crypto = require('crypto')
const config = require('../../lib/config')

function terrainSubmitViceAccessRequest(token, user, usage) {
    const data = {
        name: user.first_name + ' ' + user.last_name,
        email: user.email,
        intended_use: usage,
        concurrent_jobs: 2, //FIXME hardcoded
    }

    return runFile('curl', [
        '--request',
        'POST',
        '--location',
        '--header',
        `Authorization: Bearer ${token}`,
        '--header',
        'Content-Type: application/json',
        '--data',
        JSON.stringify(data),
        `${config.getTerrainConfig().url}/requests/vice`
    ])
}

module.exports = {
    terrainSubmitViceAccessRequest,
}
