const fs = require('fs')
const path = require('path')

/**
 * Centralized configuration manager with lazy initialization
 * Reads configuration from JSON file with environment variable override support
 */
class ConfigManager {
    constructor() {
        this._config = null
        this._initialized = false
        this._configPath =
            process.env.CONFIG_PATH ||
            path.resolve(process.cwd(), 'portal2.json')
    }

    /**
     * Initialize configuration once
     * Reads from JSON file only
     */
    init() {
        if (this._initialized) return

        try {
            // Load configuration from JSON file
            this._config = this._loadFromJsonFile()

            this._initialized = true
            this._validateConfig()
        } catch (error) {
            throw new Error(`Failed to load configuration: ${error.message}`)
        }
    }

    /**
     * Load configuration from JSON file
     * @private
     */
    _loadFromJsonFile() {
        if (!fs.existsSync(this._configPath)) {
            throw new Error(`Configuration file not found: ${this._configPath}`)
        }

        try {
            const configData = fs.readFileSync(this._configPath, 'utf8')
            const config = JSON.parse(configData)

            // Add computed values
            config.server.isDevelopment = process.env.NODE_ENV !== 'production'

            return config
        } catch (error) {
            throw new Error(
                `Failed to parse configuration file: ${error.message}`
            )
        }
    }

    /**
     * Validate that required configuration is present
     * @private
     */
    _validateConfig() {
        // Critical configuration that must be present
        const required = [
            ['db.host', this._config.db?.host],
            ['db.port', this._config.db?.port],
            ['db.name', this._config.db?.name],
            ['db.user', this._config.db?.user],
            ['db.password', this._config.db?.password],
            ['session.secret', this._config.session?.secret],
            ['keycloak.realm', this._config.keycloak?.realm],
            ['keycloak.authUrl', this._config.keycloak?.authUrl],
            ['keycloak.client', this._config.keycloak?.client],
            ['keycloak.secret', this._config.keycloak?.secret],
            ['ui.baseUrl', this._config.ui?.baseUrl],
        ]

        // Portal conductor password is required if portal conductor config exists
        if (
            this._config.portalConductor?.url &&
            !this._config.portalConductor?.auth?.password
        ) {
            required.push([
                'portalConductor.auth.password',
                this._config.portalConductor?.auth?.password,
            ])
        }

        const missing = required
            .filter(([, value]) => !value)
            .map(([key]) => key)

        if (missing.length > 0) {
            throw new Error(
                `Missing required configuration: ${missing.join(', ')}`
            )
        }

        // Validate configuration types and formats
        this._validateTypes()
    }

    /**
     * Validate configuration value types and formats
     * @private
     */
    _validateTypes() {
        const errors = []

        // Validate DB port is a number
        if (this._config.db?.port && isNaN(this._config.db.port)) {
            errors.push('db.port must be a number')
        }

        // Validate server port is a number
        if (this._config.server?.port && isNaN(this._config.server.port)) {
            errors.push('server.port must be a number')
        }

        // Validate URLs
        const urlFields = [
            ['ui.baseUrl', this._config.ui?.baseUrl],
            ['ui.wsBaseUrl', this._config.ui?.wsBaseUrl],
            ['keycloak.authUrl', this._config.keycloak?.authUrl],
        ]

        urlFields.forEach(([name, url]) => {
            if (url && !this._isValidUrl(url)) {
                errors.push(`${name} must be a valid URL`)
            }
        })

        // Validate optional URLs
        const optionalUrls = [
            ['terrain.url', this._config.terrain?.url],
            ['portalConductor.url', this._config.portalConductor?.url],
            ['sentry.dsn', this._config.sentry?.dsn],
        ]

        optionalUrls.forEach(([name, url]) => {
            if (url && !this._isValidUrl(url)) {
                errors.push(`${name} must be a valid URL if provided`)
            }
        })

        if (errors.length > 0) {
            throw new Error(
                `Configuration validation errors: ${errors.join(', ')}`
            )
        }
    }

    /**
     * Check if a string is a valid URL
     * @private
     */
    _isValidUrl(string) {
        try {
            new URL(string)
            return true
        } catch (_) {
            return false
        }
    }

    /**
     * Get database configuration
     * @returns {Object} Database configuration object
     */
    getDbConfig() {
        this.init()
        return this._config.db
    }

    /**
     * Get server configuration
     * @returns {Object} Server configuration object
     */
    getServerConfig() {
        this.init()
        return this._config.server
    }

    /**
     * Get session configuration
     * @returns {Object} Session configuration object
     */
    getSessionConfig() {
        this.init()
        return this._config.session
    }

    /**
     * Get Keycloak configuration
     * @returns {Object} Keycloak configuration object
     */
    getKeycloakConfig() {
        this.init()
        return this._config.keycloak
    }

    /**
     * Get portal conductor configuration
     * @returns {Object} Portal conductor configuration object
     */
    getPortalConductorConfig() {
        this.init()
        return this._config.portalConductor
    }

    /**
     * Get terrain configuration
     * @returns {Object} Terrain configuration object
     */
    getTerrainConfig() {
        this.init()
        return this._config.terrain
    }

    /**
     * Get UI configuration
     * @returns {Object} UI configuration object
     */
    getUiConfig() {
        this.init()
        return this._config.ui
    }

    /**
     * Get profile configuration
     * @returns {Object} Profile configuration object
     */
    getProfileConfig() {
        this.init()
        return this._config.profile
    }

    /**
     * Get feature flags
     * @returns {Object} Feature flags object
     */
    getFeatures() {
        this.init()
        return this._config.features
    }

    /**
     * Get Sentry configuration
     * @returns {Object} Sentry configuration object
     */
    getSentryConfig() {
        this.init()
        return this._config.sentry
    }

    /**
     * Get Intercom configuration
     * @returns {Object} Intercom configuration object
     */
    getIntercomConfig() {
        this.init()
        return this._config.intercom
    }

    /**
     * Get BCC email configuration
     * @returns {Object} BCC email configuration object
     */
    getBccConfig() {
        this.init()
        return this._config.bcc
    }

    /**
     * Get honeypot configuration
     * @returns {Object} Honeypot configuration object
     */
    getHoneypotConfig() {
        this.init()
        return this._config.honeypot
    }

    /**
     * Get security configuration
     * @returns {Object} Security configuration object
     */
    getSecurityConfig() {
        this.init()
        return this._config.security
    }

    /**
     * Get all configuration
     * @returns {Object} Complete configuration object
     */
    getAll() {
        this.init()
        return this._config
    }
}

// Export singleton instance
const configManager = new ConfigManager()
module.exports = configManager
