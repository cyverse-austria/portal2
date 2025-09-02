/**
 * Centralized environment variable loader
 * This module should be imported at the very top of entry points
 * to ensure .env file is loaded before any other modules
 */

const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Export a flag to indicate env has been loaded
module.exports = {
    loaded: true
};