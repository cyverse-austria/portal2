const router = require('express').Router()
const axios = require('axios')
const https = require('https')
const { logger } = require('./lib/logging')
const { requireAdmin, asyncHandler } = require('./lib/auth')
const config = require('./lib/config')

/**
 * Get portal-conductor base URL from configuration
 */
function getPortalConductorUrl() {
    const { url: baseUrl } = config.getPortalConductorConfig()
    if (!baseUrl) {
        throw new Error(
            'Portal-conductor URL is not configured in portal2.json (portalConductor.url)'
        )
    }
    return baseUrl
}

/**
 * Get portal-conductor auth credentials from configuration
 */
function getPortalConductorAuth() {
    const { auth } = config.getPortalConductorConfig()
    if (!auth || !auth.username || !auth.password) {
        throw new Error(
            'Portal-conductor credentials not configured in portal2.json (portalConductor.auth.username/password)'
        )
    }
    return { username: auth.username, password: auth.password }
}

/**
 * Get portal-conductor SSL configuration
 */
function getPortalConductorSslConfig() {
    const { ssl = {} } = config.getPortalConductorConfig()
    return {
        rejectUnauthorized:
            ssl.rejectUnauthorized !== undefined
                ? ssl.rejectUnauthorized
                : false,
        ...ssl,
    }
}

/**
 * Create axios config with SSL support
 */
function createAxiosConfig(auth) {
    const sslConfig = getPortalConductorSslConfig()
    const axiosConfig = {
        auth,
        timeout: 30000,
    }

    // Add HTTPS agent if SSL config is present
    if (!sslConfig.rejectUnauthorized) {
        axiosConfig.httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        })
    }

    return axiosConfig
}

// List analyses filtered by status (ADMIN ONLY)
router.get(
    '/analyses',
    requireAdmin,
    asyncHandler(async (req, res) => {
        const status = req.query.status || 'Running'
        logger.info(`Listing analyses with status: ${status}`)

        const conductorUrl = getPortalConductorUrl()
        const auth = getPortalConductorAuth()
        const axiosConfig = createAxiosConfig(auth)

        try {
            const response = await axios.get(`${conductorUrl}/async/analyses`, {
                ...axiosConfig,
                params: { status },
            })

            res.json(response.data)
        } catch (error) {
            const statusCode = error.response?.status || 'unknown'
            const errorDetail = error.response?.data || error.message
            logger.error(
                `Failed to fetch analyses from portal-conductor (HTTP ${statusCode}): ${JSON.stringify(
                    errorDetail
                )}`
            )
            throw error // Re-throw to let asyncHandler handle it
        }
    })
)

// Get analysis details including parameters (ADMIN ONLY)
router.get(
    '/analyses/:analysisId/details',
    requireAdmin,
    asyncHandler(async (req, res) => {
        const { analysisId } = req.params
        logger.info(`Fetching details for analysis: ${analysisId}`)

        const conductorUrl = getPortalConductorUrl()
        const auth = getPortalConductorAuth()
        const axiosConfig = createAxiosConfig(auth)

        try {
            const response = await axios.get(
                `${conductorUrl}/async/analyses/${analysisId}/details`,
                axiosConfig
            )

            res.json(response.data)
        } catch (error) {
            const statusCode = error.response?.status || 'unknown'
            const errorDetail = error.response?.data || error.message
            logger.error(
                `Failed to fetch analysis details from portal-conductor (HTTP ${statusCode}): ${JSON.stringify(
                    errorDetail
                )}`
            )
            throw error // Re-throw to let asyncHandler handle it
        }
    })
)

module.exports = router
