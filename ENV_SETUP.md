# Environment Configuration Guide

This document explains how to set up environment variables for the Portal2 application.

## Quick Start

1. **Copy the .env file and customize:**
   ```bash
   cp .env .env.custom
   # Edit .env.custom with your configuration values
   # Then rename it to .env when ready
   ```

2. **Fill in required values** (see [Required Variables](#required-variables) below)

3. **Start the application:**
   ```bash
   npm run dev
   ```

## Configuration File

The application uses a single `.env` file for configuration:
- `.env` - Contains all environment variables (NOT committed to git)
- Copy and customize the provided `.env` file for your environment

## Required Variables

These variables **must** be set for the application to start:

### Database Configuration
```bash
DB_USER=your_db_username
DB_PASSWORD=your_db_password
```

### Session Security
```bash
SESSION_SECRET=your_very_long_secure_session_secret_here
```

### Authentication (Keycloak)
```bash
KEYCLOAK_REALM=your_realm
KEYCLOAK_AUTH_URL=https://your-keycloak.org/auth/
KEYCLOAK_CLIENT=your_client_id
KEYCLOAK_SECRET=your_client_secret
```

### Base URLs
```bash
UI_BASE_URL=http://localhost:3000  # or your production URL
```

## Configuration Sections

### 🖥️ Server Configuration
- `SERVER_PORT` - Main application port (default: 3000)
- `WS_PORT` - WebSocket port (default: 3001)
- `NODE_ENV` - Environment (development/production)

### 🔗 URL Configuration  
- `UI_BASE_URL` - Frontend base URL
- `API_BASE_URL` - API base URL
- `WS_BASE_URL` - WebSocket base URL

### 🗄️ Database Configuration
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name
- `DB_USER` - Database username (**required**)
- `DB_PASSWORD` - Database password (**required**)
- `DB_SESSION_TABLE` - Session table name (default: "session")
- `DB_LOGGING` - Enable query logging (true/false)

### 🔐 Authentication & Security
- `SESSION_SECRET` - Session signing secret (**required**)
- `SESSION_TTL` - Session timeout in seconds (default: 86400)
- `SESSION_SECURE_COOKIE` - Use secure cookies (true for HTTPS)
- `KEYCLOAK_*` - Keycloak configuration (**required**)
- `HMAC_KEY` - HMAC key for token generation
- `HONEYPOT_DIVISOR` - Anti-spam honeypot divisor (default: 7)

### 🌐 External Services
- `TERRAIN_URL` - DE Terrain API URL
- `TERRAIN_USER` - Terrain service account username
- `TERRAIN_PASSWORD` - Terrain service account password
- `PORTAL_CONDUCTOR_URL` - User/service workflow conductor

### 📧 Email Configuration
- `SMTP_*` - SMTP server settings
- `BCC_*` - BCC recipients for different email types
- `SUPPORT_EMAIL` - Support email address

### 💬 Integrations
- `INTERCOM_*` - Intercom chat widget configuration
- `MAILMAN_*` - Mailing list integration
- `MAILCHIMP_*` - Newsletter integration
- `GOOGLE_ANALYTICS_ID` - GA tracking ID
- `SENTRY_DSN` - Error tracking

### 👤 User Profile Settings
- `PROFILE_UPDATE_PERIOD` - Days between required profile updates
- `PROFILE_WARNING_PERIOD` - Days before showing update warning
- `PROFILE_*_TEXT` - User-facing messages

### 🧪 Development & Testing
- `DEBUG_USER` - Username to emulate (bypasses auth)
- `NATIVE_WORKFLOW_IMAGE_ID` - Docker image for workflows

## Environment-Specific Setup

### Development Setup
```bash
# Copy and customize the provided .env file
cp .env .env.development

# Edit .env.development with your local settings:
# - Local database credentials
# - Development Keycloak settings  
# - Disable external services
# - Enable debug features

# Rename when ready
mv .env.development .env
```

### Production Setup
```bash
# Copy and customize the provided .env file
cp .env .env.production

# Edit .env.production with production values:
# - Production database and URLs
# - Real Keycloak configuration
# - Strong session secrets
# - External service credentials

# Rename when ready
mv .env.production .env
```

### Docker Setup
```bash
# Use environment-specific compose files
docker-compose -f docker-compose.yml -f docker-compose.local.yml up
```

## Security Best Practices

### 🔒 Secret Management
- **Never commit `.env`** - It's in `.gitignore`
- Use strong, random values for `SESSION_SECRET` and `HMAC_KEY`
- Rotate secrets regularly in production
- Use environment-specific secrets (different for dev/staging/prod)

### 🛡️ Production Security
- Set `SESSION_SECURE_COOKIE=true` for HTTPS
- Use `NODE_ENV=production`
- Don't set `DEBUG_USER` in production
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
# Check if .env files exist
ls -la .env*

# Test environment loading
node -e "require('./src/lib/env'); console.log('DB_HOST:', process.env.DB_HOST)"
```

### Missing Required Variables
```bash
# Check startup logs for specific missing variables
npm run dev 2>&1 | grep "Missing required"
```

### URL Format Errors
```bash
# Ensure URLs are properly formatted with protocol
UI_BASE_URL=http://localhost:3000  # ✅ Good
UI_BASE_URL=localhost:3000         # ❌ Missing protocol
```

## Files Reference

- `.env` - Your environment configuration (copy and customize, not committed to git)

## Next Steps

After setting up your environment:

1. Start the development server: `npm run dev`
2. Check the startup logs for validation messages
3. Visit `http://localhost:3000` to test the application
4. Review the configuration guide for any optional features you want to enable