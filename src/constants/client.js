// Client-safe constants that don't depend on server configuration
module.exports = {
  // Cookie Names
  ACCOUNT_UPDATE_REMINDER_COOKIE: 'account_update_reminder',
  WELCOME_BANNER_COOKIE: 'welcome_banner',

  // Websocket Events
  WS_CONNECTED: 'WS_CONNECTED',
  WS_SERVICE_ACCESS_REQUEST_STATUS_UPDATE: 'WS_SERVICE_ACCESS_REQUEST_STATUS_UPDATE',
  WS_WORKSHOP_ENROLLMENT_REQUEST_STATUS_UPDATE: 'WS_WORKSHOP_ENROLLMENT_REQUEST_STATUS_UPDATE'
}