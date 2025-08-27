// cURL is used for HTTP requests instead of native request libraries
const fs = require('fs')
const { exec, execFile, execSync } = require('child_process')
var crypto = require('crypto')

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
        `${process.env.TERRAIN_URL}/requests/vice`, //FIXME define URL in constants.js
    ])
}

module.exports = {
    terrainSubmitViceAccessRequest,
}
