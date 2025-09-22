// Server-side constants that use configuration
// NOTE: this module can only be used server-side due to use of configuration manager
const config = require('../api/lib/config')

const uiConfig = config.getUiConfig()
const terrainConfig = config.getTerrainConfig()

module.exports = {
    // Front-end URLs
    UI_REQUESTS_URL: `${uiConfig.baseUrl}/requests`,
    UI_PASSWORD_URL: `${uiConfig.baseUrl}/password`,
    UI_CONFIRM_EMAIL_URL: `${uiConfig.baseUrl}/confirm_email`,
    UI_WORKSHOPS_URL: `${uiConfig.baseUrl}/workshops`,
    UI_SERVICES_URL: `${uiConfig.baseUrl}/services`,
    UI_ADMIN_SERVICE_ACCESS_REQUEST_URL: `${uiConfig.baseUrl}/administrative/requests`,
    UI_ADMIN_FORM_SUBMISSION_URL: `${uiConfig.baseUrl}/administrative/submissions`,
    UI_ACCOUNT_REVIEW_URL: `${uiConfig.baseUrl}/account?reviewMode=1`,

    // External URLs
    EXT_ADMIN_VICE_ACCESS_REQUEST_API_URL: `${terrainConfig.url}/admin/settings/concurrent-job-limits`,
    EXT_ADMIN_VICE_ACCESS_REQUEST_URL: 'https://de.cyverse.org/admin/vice',
}
