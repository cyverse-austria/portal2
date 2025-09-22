import { isAscii } from 'validator'
const bannedPasswords = require('../banned-passwords.json')

const validatePassword = value => {
    if (String(value).length < 6)
        return 'Passwords must be at least 6 characters long'
    if (String(value).indexOf(' ') >= 0)
        return 'Passwords may not contain spaces'
    if (!isAscii(value))
        return 'Passwords may not contain special characters such as symbols or accented letters'
    if (bannedPasswords.includes(value))
        return 'This is a commonly used password, please choose a different one'

    return null
}

// Sort US first
const sortCountries = (a, b) => {
    if (a.code == 'US') return -1
    if (b.code == 'US') return 1
    return a.name.localeCompare(b.name)
}

export { validatePassword, sortCountries }
