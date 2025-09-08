let withBundleAnalyzer = (config) => config;
try {
  withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
  });
} catch (error) {
  console.warn("Bundle analyzer not available:", error.message);
}

const fs = require('fs');
const path = require('path');

// Load configuration from JSON file
const configPath = process.env.CONFIG_PATH || path.resolve(process.cwd(), 'portal2.json');
let config = {};
if (fs.existsSync(configPath)) {
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configData);
  } catch (error) {
    console.warn('Failed to load portal2.json, using empty config:', error.message);
  }
} else {
  console.warn('portal2.json not found, using empty config');
}

// Helper function to get config value from JSON only
function getConfigValue(path) {
  const pathParts = path.split('.');
  let value = config;
  for (const part of pathParts) {
    if (value && typeof value === 'object') {
      value = value[part];
    } else {
      return undefined;
    }
  }
  return value;
}

// Build public runtime config from JSON config only
const publicRuntimeConfig = {
  UI_BASE_URL: getConfigValue('ui.baseUrl'),
  WS_BASE_URL: getConfigValue('ui.wsBaseUrl'),
  GOOGLE_ANALYTICS_ID: getConfigValue('external.googleAnalyticsId'),
  SENTRY_DSN: getConfigValue('sentry.dsn'),
  BCC_NEW_ACCOUNT_CONFIRMATION: getConfigValue('bcc.newAccountConfirmation'),
  BCC_PASSWORD_CHANGE_REQUEST: getConfigValue('bcc.passwordChangeRequest'),
  BCC_SERVICE_ACCESS_GRANTED: getConfigValue('bcc.serviceAccessGranted'),
  BCC_WORKSHOP_ENROLLMENT_REQUEST: getConfigValue('bcc.workshopEnrollmentRequest'),
  INTERCOM_ENABLED: getConfigValue('features.intercomEnabled'),
  INTERCOM_APP_ID: getConfigValue('intercom.appId'),
  INTERCOM_TOKEN: getConfigValue('intercom.token'),
  INTERCOM_COMPANY_ID: getConfigValue('intercom.companyId'),
  TERRAIN_URL: getConfigValue('terrain.url'),
  HONEYPOT_DIVISOR: getConfigValue('honeypot.divisor')
}

// Verify required configuration
const required = {
  UI_BASE_URL: publicRuntimeConfig.UI_BASE_URL,
  WS_BASE_URL: publicRuntimeConfig.WS_BASE_URL
};

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(`Missing required configuration: ${missing.join(', ')}`);
}

module.exports = withBundleAnalyzer({
  publicRuntimeConfig
})

