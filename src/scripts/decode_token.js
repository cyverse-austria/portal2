#!/usr/bin/env node
const { decodeToken } = require('../api/lib/hmac')

const hmac = process.argv[2]
console.log(decodeToken(hmac))
