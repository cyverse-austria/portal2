# CyVerse User Portal (Portal2)

The CyVerse User Portal is a Next.js application for user account and resource management, built with React and Express.js.

## Technology Stack

- **Frontend**: Next.js 12.3.4, React 17, Material-UI v6
- **Backend**: Express.js with WebSocket support
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: Keycloak integration
- **Build System**: Next.js with custom Express server

## Requirements

- Node.js 20.x
- PostgreSQL 8.5+
- NGINX (for production)

## Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/cyverse-de/portal2.git
cd portal2

# Install dependencies
npm install

# Copy configuration template
cp portal2.template.json portal2.json
# Edit portal2.json with your configuration

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Using Docker/Podman

```bash
# Build the image
podman build -t portal2 .

# Run the container with mounted config file
podman run -p 3000:3000 -v ./portal2.json:/app/portal2.json:ro portal2
```

# Ubuntu 20.04 Installation

## Install packages
```
sudo apt update
sudo apt install nodejs npm postgresql postgresql-contrib nginx
```

## Setup database

### Create user and database
```
sudo su postgres
createuser portal_db_reader
createdb portal
```

### Create empty database or Restore from dump
```
# Create empty database
psql -d portal -f ./portal.sql

# Restore from dump (portal_dumpl.sql must be generated)
psql -d portal -f portal_dump.sql
```

### Import GRID institutions (for newly created database)
Download latest GRID database from https://www.grid.ac/downloads
```
src/scripts/import_grid_institutions.py /path/to/grid.csv
```

## Install code and dependencies
```
mkdir /opt/dev
cd /opt/dev
git clone git@gitlab.com:cyverse/portal2.git

cd portal2
npm install
```

## Configuration

The application uses JSON configuration files. Copy `portal2.template.json` to `portal2.json` and update the configuration values.

### Required Configuration

Edit your `portal2.json` file with the required settings:

```json
{
  "server": {
    "port": 3000
  },
  "ui": {
    "baseUrl": "https://your-domain.com",
    "wsBaseUrl": "wss://your-domain.com/ws"
  },
  "db": {
    "host": "your-db-host",
    "port": 5432,
    "name": "portal",
    "user": "portal",
    "password": "your-password"
  },
  "keycloak": {
    "realm": "YourRealm",
    "authUrl": "https://your-keycloak.com/auth/",
    "client": "your-client-id",
    "secret": "your-client-secret"
  },
  "session": {
    "secret": "your-session-secret"
  },
  "security": {
    "hmacKey": "your-hmac-key"
  },
  "external": {
    "googleAnalyticsId": "your-ga-id"
  },
  "sentry": {
    "dsn": "your-sentry-dsn"
  },
  "bcc": {
    "newAccountConfirmation": "admin@your-domain.com"
  },
  "features": {
    "intercomEnabled": false
  }
}
```

## Production Deployment

### Build and Deploy
```bash
# Build the application
npm run build

# Install PM2 process manager
npm install pm2@latest -g

# Start the application with PM2
pm2 start npm --name portal2 -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup   # Follow the instructions output by this command
```

### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build production application
npm start        # Start production server
npm run format   # Format code with Prettier
```

## Docker Development

The application includes a multi-stage Dockerfile for containerized deployment:

```bash
# Build Docker image
docker build -t portal2 .

# Run with environment file
docker run -p 3000:3000 -v ./portal2.json:/app/portal2.json:ro portal2

# Using Podman (alternative)
podman build -t portal2 .
podman run -p 3000:3000 -v ./portal2.json:/app/portal2.json:ro portal2
```

### Environment Variables for Docker

Create a `portal2.json` file for container deployment with all required settings. The container runs as a non-root user (`nodejs`) for security. Mount your configuration file into the container at `/app/portal2.json`.

## Development

### Project Structure

```
├── src/
│   ├── server.js           # Express server entry point
│   ├── api/               # API routes
│   ├── models/            # Sequelize database models
│   └── ...
├── pages/                 # Next.js pages
├── public/                # Static assets
├── .next/                 # Next.js build output (generated)
├── package.json           # Dependencies and scripts
└── next.config.js         # Next.js configuration
```

### Key Dependencies

- **Next.js**: React framework for SSR/SSG
- **Express.js**: Custom server for API routes and WebSocket
- **Sequelize**: PostgreSQL ORM
- **Material-UI**: Component library
- **Keycloak**: Authentication integration
- **Winston**: Logging framework

## Setup webserver

### Open ports
```
sudo ufw allow 80
sudo ufw allow 443
```

### Configure NGINX

Edit `/etc/nginx/sites-available/hostname` config file with content below,

Then enable
```
ln -s /etc/nginx/sites-available/portal /etc/nginx/sites-enabled/hostname
```

```
server {
    listen 80;
    return 301 https://hostname$request_uri;
}

server {
    listen 443 ssl;
    server_name hostname;

    ssl_certificate /etc/ssl/certs/hostname.org.pem;
    ssl_certificate_key /etc/ssl/private/hostname.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-Proto https; # needed to work with Node set("trust proxy", true)
        proxy_set_header X-Forwarded-For $remote_addr;
    }

    location /ws {
        rewrite /ws/(.*) /$1 break;
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

### Restart NGINX
```
sudo service nginx restart
```
