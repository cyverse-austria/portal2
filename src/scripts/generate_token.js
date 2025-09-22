#!/usr/bin/env node
const { generateToken } = require('../api/lib/hmac')

const key = process.argv[2]
console.log(generateToken(key))
