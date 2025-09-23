#!/usr/bin/env node

/**
 * Password hashing utility for Portal Conductor authentication
 *
 * This utility generates bcrypt hashes for passwords to be used in
 * the portalConductor.auth.password configuration field.
 *
 * Usage:
 *   node src/scripts/hash_password.js <password>
 *
 * Example:
 *   node src/scripts/hash_password.js mypassword123
 */

const bcrypt = require('bcrypt')

/**
 * Generate a bcrypt hash for the given password
 * @param {string} password - The plaintext password to hash
 * @returns {string} The bcrypt hash
 */
function generatePasswordHash(password) {
    const saltRounds = 12 // Same as portal-conductor default
    return bcrypt.hashSync(password, saltRounds)
}

/**
 * Main function
 */
function main() {
    // Check command line arguments
    if (process.argv.length !== 3) {
        console.error('Usage: node src/scripts/hash_password.js <password>')
        console.error('Generates a bcrypt hash for the given password')
        process.exit(1)
    }

    const password = process.argv[2]

    if (!password || password.trim().length === 0) {
        console.error('Error: Password cannot be empty')
        process.exit(1)
    }

    try {
        const hash = generatePasswordHash(password)
        console.log(`Bcrypt hash for '${password}': ${hash}`)
        console.log('')
        console.log('Copy this hash to your portal2.json configuration file:')
        console.log(`"portalConductor": {`)
        console.log(`  "auth": {`)
        console.log(`    "username": "admin",`)
        console.log(`    "password": "${hash}"`)
        console.log(`  }`)
        console.log(`}`)
        console.log('')
        console.log(
            'Remember to set the PORTAL_CONDUCTOR_PASSWORD environment variable'
        )
        console.log(`to the original password: ${password}`)
    } catch (error) {
        console.error(`Error generating hash: ${error.message}`)
        process.exit(1)
    }
}

// Run the script if called directly
if (require.main === module) {
    main()
}

module.exports = {
    generatePasswordHash,
}
