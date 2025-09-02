const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// for (const key of Object.keys(process.env).sort())
//     console.log(key + ':', process.env[key])

const REQUIRED_PARAMS = [
  'UI_BASE_URL',
  'WS_BASE_URL',
  'API_BASE_URL',
  //TODO finish
]

const PUBLIC_PARAMS = [
  'UI_BASE_URL',
  'WS_BASE_URL',
  'GOOGLE_ANALYTICS_ID',
  'SENTRY_DSN',
  'BCC_NEW_ACCOUNT_CONFIRMATION',
  'BCC_PASSWORD_CHANGE_REQUEST',
  'BCC_SERVICE_ACCESS_GRANTED',
  'BCC_WORKSHOP_ENROLLMENT_REQUEST',
  'INTERCOM_ENABLED',
  'INTERCOM_APP_ID',
  'INTERCOM_TOKEN',
  'INTERCOM_COMPANY_ID',
  'TERRAIN_URL',
  'FAQ_URL',
  'HONEYPOT_DIVISOR'
]

// Verify that required configuration params are set
for (const p of REQUIRED_PARAMS) {
  if (!(p in process.env) || typeof process.env[p] === 'undefined')
    throw('Missing required configuration parameter: ' + p)
}

// Instead of appending NEXT_PUBLIC to config params accessible by frontend
const publicRuntimeConfig = {}
for (const p of PUBLIC_PARAMS) {
  publicRuntimeConfig[p] = process.env[p]
}

module.exports = withBundleAnalyzer({
  publicRuntimeConfig
})

