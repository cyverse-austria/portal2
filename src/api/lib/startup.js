const config = require('./config');

/**
 * Validate application startup configuration
 * This should be called early in the application lifecycle
 */
function validateStartupConfiguration() {
    // Get logger with fallback - ensure we always have a working logger
    let logger = console;
    try {
        const { logger: winLogger } = require('./logging');
        if (winLogger && winLogger.info && winLogger.error) {
            logger = winLogger;
        }
    } catch (error) {
        // Keep using console fallback
    }
    
    try {
        // Initialize and validate configuration
        config.init();
        
        // Test database configuration
        const dbConfig = config.getDbConfig();
        logger.info(`Database configuration validated: ${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`);
        
        // Test authentication configuration
        const keycloakConfig = config.getKeycloakConfig();
        logger.info(`Keycloak configuration validated: ${keycloakConfig.realm} @ ${keycloakConfig.authUrl}`);
        
        // Test session configuration
        const sessionConfig = config.getSessionConfig();
        logger.info(`Session configuration validated: TTL=${sessionConfig.ttl}s, Secure=${sessionConfig.secureCookie}`);
        
        // Test UI configuration
        const uiConfig = config.getUiConfig();
        logger.info(`UI configuration validated: ${uiConfig.baseUrl}`);
        
        // Test optional external service configurations
        const portalConductorConfig = config.getPortalConductorConfig();
        if (portalConductorConfig.url) {
            logger.info(`Portal Conductor URL configured: ${portalConductorConfig.url}`);
        } else {
            logger.warn('Portal Conductor URL not configured - some workflows may fail');
        }
        
        const terrainConfig = config.getTerrainConfig();
        if (terrainConfig.url) {
            logger.info(`Terrain URL configured: ${terrainConfig.url}`);
        } else {
            logger.warn('Terrain URL not configured - VICE access requests may fail');
        }
        
        // Test feature flags
        const features = config.getFeatures();
        logger.info(`Feature flags: Intercom=${features.intercomEnabled}, Mailman=${features.mailmanEnabled}`);
        
        // Test optional integrations
        const sentryConfig = config.getSentryConfig();
        if (sentryConfig.dsn) {
            logger.info('Sentry error tracking configured');
        } else {
            logger.info('Sentry error tracking not configured');
        }
        
        const debugConfig = config.getDebugConfig();
        if (debugConfig.user) {
            logger.warn(`DEBUG MODE: Emulating user ${debugConfig.user}`);
        }
        
        logger.info('✓ Application configuration validation completed successfully');
        return true;
    } catch (error) {
        logger.error('✗ Configuration validation failed:', error.message);
        throw error;
    }
}

module.exports = {
    validateStartupConfiguration
};