const { WS_SERVICE_ACCESS_REQUEST_STATUS_UPDATE, WS_WORKSHOP_ENROLLMENT_REQUEST_STATUS_UPDATE } = require('../../constants/client');

function notifyClientOfServiceRequestStatusChange(ws, request) {
    // Send websocket event to client 
    if (ws) {
        ws.send(JSON.stringify({ 
            type: WS_SERVICE_ACCESS_REQUEST_STATUS_UPDATE,
            data: {
                requestId: request.id,
                serviceId: request.service.id,
                status: request.status
            }
        }))
    }
}

function notifyClientOfWorkshopRequestStatusChange(ws, request) {
    // Send websocket event to client 
    if (ws) {
        ws.send(JSON.stringify({ 
            type: WS_WORKSHOP_ENROLLMENT_REQUEST_STATUS_UPDATE,
            data: {
                requestId: request.id,
                workshopId: request.workshop.id,
                status: request.status
            }
        }))
    }
}

module.exports = { notifyClientOfServiceRequestStatusChange, notifyClientOfWorkshopRequestStatusChange };