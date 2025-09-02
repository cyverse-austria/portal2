/**
 * Centralized configuration manager with lazy initialization
 * Ensures configuration is loaded once and available before use
 */
class ConfigManager {
  constructor() {
    this._config = null;
    this._initialized = false;
  }

  /**
   * Initialize configuration once
   * Environment variables should already be loaded by dotenv
   */
  init() {
    if (this._initialized) return;
    
    // Environment variables should already be loaded via dotenv in entry points
    // No fallback needed - dotenv handles .env loading
    
    this._config = {
      // Database Configuration
      db: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        logging: process.env.DB_LOGGING === 'true',
        sessionTable: process.env.DB_SESSION_TABLE || 'session'
      },
      // Server Configuration
      server: {
        port: parseInt(process.env.SERVER_PORT) || 3000,
        isDevelopment: process.env.NODE_ENV !== 'production'
      },
      // Session Configuration
      session: {
        secret: process.env.SESSION_SECRET,
        ttl: parseInt(process.env.SESSION_TTL) || 86400,
        secureCookie: process.env.SESSION_SECURE_COOKIE === 'true'
      },
      // Authentication Configuration
      keycloak: {
        realm: process.env.KEYCLOAK_REALM,
        authUrl: process.env.KEYCLOAK_AUTH_URL,
        client: process.env.KEYCLOAK_CLIENT,
        secret: process.env.KEYCLOAK_SECRET
      },
      // External Services
      portalConductor: {
        url: process.env.PORTAL_CONDUCTOR_URL
      },
      terrain: {
        url: process.env.TERRAIN_URL,
        user: process.env.TERRAIN_USER,
        password: process.env.TERRAIN_PASSWORD
      },
      // UI Configuration
      ui: {
        baseUrl: process.env.UI_BASE_URL,
        wsBaseUrl: process.env.WS_BASE_URL
      },
      // Profile Configuration
      profile: {
        updatePeriod: parseInt(process.env.PROFILE_UPDATE_PERIOD) || 365,
        warningPeriod: parseInt(process.env.PROFILE_WARNING_PERIOD) || 30,
        updateText: process.env.PROFILE_UPDATE_TEXT,
        warningText: process.env.PROFILE_WARNING_TEXT
      },
      // Feature Flags
      features: {
        intercomEnabled: process.env.INTERCOM_ENABLED === 'true',
        mailmanEnabled: process.env.MAILMAN_ENABLED === 'true'
      },
      // External Integrations
      sentry: {
        dsn: process.env.SENTRY_DSN
      },
      intercom: {
        appId: process.env.INTERCOM_APP_ID,
        token: process.env.INTERCOM_TOKEN,
        companyId: process.env.INTERCOM_COMPANY_ID
      },
      // Email Configuration
      bcc: {
        newAccountConfirmation: process.env.BCC_NEW_ACCOUNT_CONFIRMATION,
        passwordChangeRequest: process.env.BCC_PASSWORD_CHANGE_REQUEST,
        serviceAccessGranted: process.env.BCC_SERVICE_ACCESS_GRANTED,
        workshopEnrollmentRequest: process.env.BCC_WORKSHOP_ENROLLMENT_REQUEST
      },
      // Security
      honeypot: {
        divisor: parseInt(process.env.HONEYPOT_DIVISOR) || 7
      }
    };
    
    this._initialized = true;
    this._validateConfig();
  }

  /**
   * Validate that required configuration is present
   * @private
   */
  _validateConfig() {
    // Critical configuration that must be present
    const required = {
      'DB_HOST': this._config.db.host,
      'DB_PORT': this._config.db.port,
      'DB_NAME': this._config.db.name,
      'DB_USER': this._config.db.user,
      'DB_PASSWORD': this._config.db.password,
      'SESSION_SECRET': this._config.session.secret,
      'KEYCLOAK_REALM': this._config.keycloak.realm,
      'KEYCLOAK_AUTH_URL': this._config.keycloak.authUrl,
      'KEYCLOAK_CLIENT': this._config.keycloak.client,
      'KEYCLOAK_SECRET': this._config.keycloak.secret,
      'UI_BASE_URL': this._config.ui.baseUrl
    };

    const missing = Object.entries(required)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }

    // Validate configuration types and formats
    this._validateTypes();
  }

  /**
   * Validate configuration value types and formats
   * @private
   */
  _validateTypes() {
    const errors = [];

    // Validate DB port is a number
    if (isNaN(this._config.db.port)) {
      errors.push('DB_PORT must be a number');
    }

    // Validate server port is a number
    if (isNaN(this._config.server.port)) {
      errors.push('SERVER_PORT must be a number');
    }

    // Validate URLs
    const urlFields = [
      ['UI_BASE_URL', this._config.ui.baseUrl],
      ['WS_BASE_URL', this._config.ui.wsBaseUrl],
      ['KEYCLOAK_AUTH_URL', this._config.keycloak.authUrl]
    ];

    urlFields.forEach(([name, url]) => {
      if (url && !this._isValidUrl(url)) {
        errors.push(`${name} must be a valid URL`);
      }
    });

    // Validate optional URLs
    const optionalUrls = [
      ['TERRAIN_URL', this._config.terrain.url],
      ['PORTAL_CONDUCTOR_URL', this._config.portalConductor.url],
      ['SENTRY_DSN', this._config.sentry.dsn]
    ];

    optionalUrls.forEach(([name, url]) => {
      if (url && !this._isValidUrl(url)) {
        errors.push(`${name} must be a valid URL if provided`);
      }
    });

    if (errors.length > 0) {
      throw new Error(`Configuration validation errors: ${errors.join(', ')}`);
    }
  }

  /**
   * Check if a string is a valid URL
   * @private
   */
  _isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Get database configuration
   * @returns {Object} Database configuration object
   */
  getDbConfig() {
    this.init();
    return this._config.db;
  }

  /**
   * Get server configuration
   * @returns {Object} Server configuration object
   */
  getServerConfig() {
    this.init();
    return this._config.server;
  }

  /**
   * Get session configuration
   * @returns {Object} Session configuration object
   */
  getSessionConfig() {
    this.init();
    return this._config.session;
  }

  /**
   * Get Keycloak configuration
   * @returns {Object} Keycloak configuration object
   */
  getKeycloakConfig() {
    this.init();
    return this._config.keycloak;
  }

  /**
   * Get portal conductor configuration
   * @returns {Object} Portal conductor configuration object
   */
  getPortalConductorConfig() {
    this.init();
    return this._config.portalConductor;
  }

  /**
   * Get terrain configuration
   * @returns {Object} Terrain configuration object
   */
  getTerrainConfig() {
    this.init();
    return this._config.terrain;
  }

  /**
   * Get UI configuration
   * @returns {Object} UI configuration object
   */
  getUiConfig() {
    this.init();
    return this._config.ui;
  }

  /**
   * Get profile configuration
   * @returns {Object} Profile configuration object
   */
  getProfileConfig() {
    this.init();
    return this._config.profile;
  }

  /**
   * Get feature flags
   * @returns {Object} Feature flags object
   */
  getFeatures() {
    this.init();
    return this._config.features;
  }

  /**
   * Get Sentry configuration
   * @returns {Object} Sentry configuration object
   */
  getSentryConfig() {
    this.init();
    return this._config.sentry;
  }

  /**
   * Get Intercom configuration
   * @returns {Object} Intercom configuration object
   */
  getIntercomConfig() {
    this.init();
    return this._config.intercom;
  }

  /**
   * Get BCC email configuration
   * @returns {Object} BCC email configuration object
   */
  getBccConfig() {
    this.init();
    return this._config.bcc;
  }

  /**
   * Get honeypot configuration
   * @returns {Object} Honeypot configuration object
   */
  getHoneypotConfig() {
    this.init();
    return this._config.honeypot;
  }


  /**
   * Get all configuration
   * @returns {Object} Complete configuration object
   */
  getAll() {
    this.init();
    return this._config;
  }
}

// Export singleton instance
const configManager = new ConfigManager();
module.exports = configManager;