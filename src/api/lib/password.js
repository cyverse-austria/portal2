const crypto = require('crypto')

// Ported from UP1 /account/models/user.py
function checkLDAPPassword(hash, secret) {
    // Checks the OpenLDAP tagged digest against the given password
    // Taken from this gist: https://gist.github.com/rca/7217540

    // Strip off the hash label
    digest_salt_b64 = hash.substr(6)

    // The password+salt buffer is also base64-encoded
    // Decode and split the digest and salt
    digest_salt = Buffer.from(digest_salt_b64, 'base64').toString()
    digest = digest_salt.substr(0, 20)
    salt = digest_salt.substr(20)

    const sha = crypto.createHash('sha1')
    sha.update(secret + salt)

    return digest == sha.digest()
}

// Check Django-hashed password
// From https://stackoverflow.com/questions/17544537/django-pbkdf2-sha256-js-implementation
function checkDjangoPassword(hash, secret) {
    const parts = hash.split('$')
    if (parts.length < 4) {
        console.log('checkDjangoPassword: invalid hash format')
        return false
    }

    const iterations = parts[1] * 1
    const salt = parts[2]
    return (
        crypto
            .pbkdf2Sync(secret, Buffer.from(salt), iterations, 32, 'sha256')
            .toString('base64') === parts[3]
    )
}

// Migrated from v1: /account/serializers/password_change.py
function checkPassword(hash, secret) {
    if (hash.startsWith('{SSHA}')) {
        return checkLDAPPassword(hash, secret)
    }

    return checkDjangoPassword(hash, secret)
}

function encodePassword(secret) {
    const salt = 'Bf3IBq3m4YXf' //FIXME move to config file?
    return [
        'pbkdf2_sha256',
        '36000',
        salt,
        crypto
            .pbkdf2Sync(secret, Buffer.from(salt), 36000, 32, 'sha256')
            .toString('base64'),
    ].join('$')
}

module.exports = {
    checkLDAPPassword,
    checkDjangoPassword,
    checkPassword,
    encodePassword,
}
