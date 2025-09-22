const models = require('../models')
const AccessRequest = models.api_accessrequest
const WorkshopParticipant = models.api_userworkshop
const {
    emailWorkshopEnrollmentRequest,
    emailWorkshopEnrollmentConfirmation,
} = require('../lib/email')
const { logger } = require('../lib/logging')
const serviceApprovers = require('./service')

async function approveRequest(request) {
    if (!request.workshop || !request.user)
        throw 'workshop:approveRequest: Missing required property'

    if (request.auto_approve) await request.approve()
    else {
        // Check if user has a pre-approved email address
        const userEmails = request.user.emails.map(e => e.email)
        const workshopEmails = request.workshop.emails.map(e => e.email)
        if (userEmails.find(e => workshopEmails.includes(e)))
            await request.approve('User was pre-approved')
        else {
            // User is not pre-approved, send an email to the instructor for manual approval
            await request.pend('Sent enrollment request to instructor')
            await emailWorkshopEnrollmentRequest(request)
        }
    }

    logger.info(
        `approve: Set workshop enrollment request ${request.id} status to "${request.status}"`
    )
}

// Expects a request object with a user and workshop incl. services
async function grantRequest(request) {
    const user = request.user
    const workshop = request.workshop
    if (!user || !workshop || !workshop.services)
        throw 'workshop:grantRequest: Missing required property'

    await request.grant()
    logger.info(
        `grant: Set workshop enrollment request ${request.id} status to "${request.status}"`
    )

    // Add user to workshop participants
    const [participant, created] = await WorkshopParticipant.findOrCreate({
        where: {
            workshop_id: workshop.id,
            user_id: user.id,
        },
        defaults: {
            workshop_enrollment_request_id: request.id,
        },
    })
    //TODO check for error

    // Send enrollment notification email to user
    await emailWorkshopEnrollmentConfirmation(request)

    // Grant access to all services used in workshop
    for (let service of workshop.services) {
        logger.info(
            `grant: Grant access to service ${service.name} for workshop enrollment request ${request.id}`
        )
        let serviceRequest = await AccessRequest.findOne({
            where: {
                service_id: service.id,
                user_id: user.id,
            },
        })
        if (!serviceRequest) {
            serviceRequest = await AccessRequest.create({
                service_id: service.id,
                user_id: user.id,
                auto_approve: true,
                status: AccessRequest.constants.STATUS_REQUESTED,
                message: AccessRequest.constants.MESSAGE_REQUESTED,
            })
        }

        if (!serviceRequest.isGranted()) {
            serviceRequest.service = service
            serviceRequest.user = user
            serviceApprovers.grantRequest(serviceRequest)
        }
    }
}

module.exports = { approveRequest, grantRequest }
