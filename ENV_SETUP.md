# Configuration Guide

This document explains how to set up configuration for the Portal2 application.

## Quick Start

1. **Copy the configuration template and customize:**
   ```bash
   cp config.template.json config.json
   # Edit config.json with your configuration values
   ```

2. **Fill in required values** (see [Required Configuration](#required-configuration) below)

3. **Start the application:**
   ```bash
   npm run dev
   ```

## Configuration System

The application uses JSON configuration files:
- `config.json` - Primary configuration file (NOT committed to git)
- `config.template.json` - Template with example values
- Set `CONFIG_PATH` environment variable to specify a custom config file location

## Required Configuration

These settings **must** be configured in your `config.json` file for the application to start:

### Database Configuration
```json
{
  "db": {
    "user": "your_db_username",
    "password": "your_db_password"
  }
}
```

### Session Security
```json
{
  "session": {
    "secret": "your_very_long_secure_session_secret_here"
  }
}
```

### Authentication (Keycloak)
```json
{
  "keycloak": {
    "realm": "your_realm",
    "authUrl": "https://your-keycloak.org/auth/",
    "client": "your_client_id",
    "secret": "your_client_secret"
  }
}
```

### Base URLs
```json
{
  "ui": {
    "baseUrl": "http://localhost:3000"
  }
}
```

### Custom Configuration File Location

You can specify a custom configuration file location:
```bash
# Use custom config file location
CONFIG_PATH=/path/to/custom/config.json
```

## Configuration Sections

All configuration is stored in JSON format in the `config.json` file. See `config.template.json` for the complete structure and default values.

### 🖥️ Server Configuration
- `server.port` - Main application port (default: 3000)
- Environment: Set `NODE_ENV=production` for production deployment

### 🔗 URL Configuration  
- `ui.baseUrl` - Frontend base URL (**required**)
- `ui.wsBaseUrl` - WebSocket base URL

### 🗄️ Database Configuration (**required**)
- `db.host` - PostgreSQL host
- `db.port` - PostgreSQL port (default: 5432)
- `db.name` - Database name
- `db.user` - Database username
- `db.password` - Database password
- `db.sessionTable` - Session table name (default: "session")
- `db.logging` - Enable query logging (optional, default: false)

### 🔐 Authentication & Security (**required**)
- `session.secret` - Session signing secret
- `session.ttl` - Session timeout in seconds (default: 86400)
- `session.secureCookie` - Use secure cookies (true for HTTPS)
- `keycloak.*` - Keycloak configuration (realm, authUrl, client, secret)
- `security.hmacKey` - HMAC key for token generation
- `honeypot.divisor` - Anti-spam honeypot divisor (default: 7)

### 🌐 External Services
- `terrain.url` - DE Terrain API URL
- `terrain.user` - Terrain service account username
- `terrain.password` - Terrain service account password
- `portalConductor.url` - User/service workflow conductor

### 📧 Email Configuration
- `smtp.*` - SMTP server settings
- `bcc.*` - BCC recipients for different email types
- `support.email` - Support email address

### 💬 Integrations
- `intercom.*` - Intercom chat widget configuration
- `mailman.*` - Mailing list integration
- `features.mailmanEnabled` - Enable/disable mailman integration
- `external.googleAnalyticsId` - GA tracking ID
- `sentry.dsn` - Error tracking

### 👤 User Profile Settings
- `profile.updatePeriod` - Days between required profile updates
- `profile.warningPeriod` - Days before showing update warning
- `profile.*Text` - User-facing messages

### 🧪 Development & Testing
- `development.nativeWorkflowImageId` - Docker image for workflows

## Environment-Specific Setup

### Development Setup
```bash
# Copy and customize the configuration template
cp config.template.json config.json

# Edit config.json with your local settings:
# - Local database credentials
# - Development Keycloak settings  
# - Disable external services
# - Set appropriate base URLs
```

### Production Setup
```bash
# Copy and customize the configuration template
cp config.template.json config.json

# Edit config.json with production values:
# - Production database and URLs
# - Real Keycloak configuration
# - Strong session secrets
# - External service credentials
```

### Docker Setup
```bash
# Use environment-specific compose files
docker-compose -f docker-compose.yml -f docker-compose.local.yml up
```

## Security Best Practices

### 🔒 Secret Management
- **Never commit `config.json`** - It's in `.gitignore`
- Use strong, random values for `session.secret` and `security.hmacKey`
- Rotate secrets regularly in production
- Use environment-specific secrets (different for dev/staging/prod)

### 🛡️ Production Security
- Set `session.secureCookie: true` for HTTPS
- Use `NODE_ENV=production`
- Use real certificates and secure endpoints

### 🔍 Secret Generation
Generate secure secrets with:
```bash
# Generate a session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use openssl
openssl rand -hex 32
```

## Validation

The application validates configuration on startup and will:
- ✅ Show success message with loaded configuration
- ❌ Exit with clear error if required variables are missing
- ⚠️ Show warnings for optional missing variables
- 🔍 Validate URL formats and data types

## Troubleshooting

### Configuration Not Loading
```bash
# Check if config.json exists
ls -la config.json

# Test configuration loading
node -e "const config = require('./src/api/lib/config'); config.init(); console.log('DB Host:', config.getDbConfig().host)"
```

### Missing Required Variables
```bash
# Check startup logs for specific missing variables
npm run dev 2>&1 | grep "Missing required"
```

### URL Format Errors
```json
// Ensure URLs are properly formatted with protocol
{
  "ui": {
    "baseUrl": "http://localhost:3000"  // ✅ Good
  }
}

// ❌ Missing protocol would be:
{
  "ui": {
    "baseUrl": "localhost:3000"
  }
}
```

## Files Reference

- `config.json` - Your configuration file (copy and customize from config.template.json, not committed to git)

## Next Steps

After setting up your environment:

1. Start the development server: `npm run dev`
2. Check the startup logs for validation messages
3. Visit `http://localhost:3000` to test the application
4. Review the configuration guide for any optional features you want to enable