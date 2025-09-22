/*
 * Backend API Client Adapter
 *
 * Could someday be turned into an npm package for external users.
 *
 */

const axios = require('axios')
const qs = require('qs')

class PortalAPI {
    constructor(params) {
        this.baseUrl = params ? params.baseUrl : '/api'
        this.token = params ? params.token : null
    }

    request(options) {
        if (!options.headers) options.headers = {}
        options.headers['Content-Type'] = 'application/json'
        if (this.token)
            options.headers['Authorization'] = `Bearer ${this.token}`

        options.timeout = 30 * 1000

        // Add custom parameter serializer to encode spaces with %20 instead of '+'
        options.paramsSerializer = params => qs.stringify(params)

        //console.log(`axios request: token ${this.token != null}, ${options.method} ${options.url}`)
        return axios.request(options)
    }

    async get(path, params) {
        // params can contain optional "offset" & "limit" properties
        const res = await this.request({
            method: 'get',
            url: `${this.baseUrl}${path}`,
            params,
        })
        return res.data
    }

    async put(path, data) {
        const res = await this.request({
            method: 'put',
            url: `${this.baseUrl}${path}`,
            data,
        })
        return res.data
    }

    async post(path, data) {
        const res = await this.request({
            method: 'post',
            url: `${this.baseUrl}${path}`,
            data,
        })
        return res.data
    }

    async delete(path) {
        const res = await this.request({
            method: 'delete',
            url: `${this.baseUrl}${path}`,
        })
        return res.data
    }

    /*
     * User endpoints
     */

    async user(id) {
        return await this.get(`/users/${id || 'mine'}`)
    }

    async userHistory(id) {
        return await this.get(`/users/${id}/history`)
    }

    async userLDAP(id) {
        return await this.get(`/users/${id}/ldap`)
    }

    async users(params) {
        return await this.get(`/users`, params)
    }

    async checkUsername(username) {
        return await this.post(`/exists`, { username })
    }

    async checkEmail(email) {
        return await this.post(`/exists`, { email })
    }

    async createUser(params) {
        return await this.put(`/users`, params)
    }

    async deleteUser(id) {
        return await this.delete(`/users/${id}`)
    }

    async updateUser(id, params) {
        return await this.post(`/users/${id}`, params)
    }

    async updatePermission(id, params) {
        return await this.post(`/users/${id}/permission`, params)
    }

    async createPassword(params) {
        return await this.put(`/users/password`, params)
    }

    async updatePassword(params) {
        return await this.post(`/users/password`, params)
    }

    async resetPassword(params) {
        return await this.post(`/users/reset_password`, params)
    }

    async adminResetPassword(id, params) {
        return await this.post(`/users/${id}/reset_password`, params)
    }

    async restrictedUsernames() {
        return await this.get(`/users/restricted`)
    }

    async createRestrictedUsername(username) {
        return await this.put(`/users/restricted/${username}`)
    }

    async deleteRestrictedUsername(id) {
        return await this.delete(`/users/restricted/${id}`)
    }

    /*
     * Mailing list endpoints
     */

    async mailingLists(params) {
        return await this.get(`/mailing_lists`, params)
    }

    async createMailingList(params) {
        return await this.put(`/mailing_lists`, params)
    }

    async deleteMailingList(id) {
        return await this.delete(`/mailing_lists/${id}`)
    }

    async updateMailingListSubscription(id, params) {
        return await this.post(`/mailing_lists/${id}/subscriptions`, params)
    }

    async createEmailAddress(params) {
        return await this.put(`/mailing_lists/email_addresses`, params)
    }

    async updateEmailAddress(id, params) {
        return await this.post(`/mailing_lists/email_addresses/${id}`, params)
    }

    async deleteEmailAddress(id) {
        return await this.delete(`/mailing_lists/email_addresses/${id}`)
    }

    /*
     * Service endpoints
     */

    async services(params) {
        return await this.get(`/services`, params)
    }

    async service(id) {
        return await this.get(`/services/${id}`)
    }

    async updateService(id, fields) {
        return await this.post(`/services/${id}`, fields)
    }

    async serviceRequests(params) {
        return await this.get(`/services/requests`, params)
    }

    async serviceRequest(id) {
        return await this.get(`/services/requests/${id}`)
    }

    async createServiceRequest(id, answers) {
        return await this.put(`/services/${id}/requests`, { answers })
    }

    async updateServiceRequest(id, fields) {
        return await this.post(`/services/requests/${id}`, fields)
    }

    async createServiceQuestion(serviceId, params) {
        return await this.put(`/services/${serviceId}/questions`, params)
    }

    async deleteServiceQuestion(serviceId, questionId) {
        return await this.delete(
            `/services/${serviceId}/questions/${questionId}`
        )
    }

    async createServiceContact(serviceId, params) {
        return await this.put(`/services/${serviceId}/contacts`, params)
    }

    async deleteServiceContact(serviceId, contactId) {
        return await this.delete(`/services/${serviceId}/contacts/${contactId}`)
    }

    async createServiceResource(serviceId, params) {
        return await this.put(`/services/${serviceId}/resources`, params)
    }

    async deleteServiceResource(serviceId, resourceId) {
        return await this.delete(
            `/services/${serviceId}/resources/${resourceId}`
        )
    }

    async createServiceForm(serviceId, formId) {
        return await this.put(`/services/${serviceId}/forms`, { formId })
    }

    async deleteServiceForm(serviceId, formId) {
        return await this.delete(`/services/${serviceId}/forms/${formId}`)
    }

    async createServiceUser(serviceId, userId) {
        return await this.put(`/services/${serviceId}/users/${userId}`)
    }

    /*
     * Workshop endpoints
     */

    async workshops() {
        return await this.get(`/workshops`)
    }

    async workshop(id) {
        return await this.get(`/workshops/${id}`)
    }

    async createWorkshop(params) {
        return await this.put(`/workshops`, params)
    }

    async deleteWorkshop(id) {
        return await this.delete(`/workshops/${id}`)
    }

    async workshopParticipants(id) {
        return await this.get(`/workshops/${id}/participants`)
    }

    async workshopEmails(id) {
        return await this.get(`/workshops/${id}/emails`)
    }

    async workshopRequests(id) {
        return await this.get(`/workshops/${id}/requests`)
    }

    async updateWorkshop(id, fields) {
        return await this.post(`/workshops/${id}`, fields)
    }

    async createWorkshopRequest(id) {
        return await this.put(`/workshops/${id}/requests`)
    }

    async updateWorkshopRequest(requestId, fields) {
        return await this.post(`/workshops/requests/${requestId}`, fields)
    }

    async createWorkshopOrganizer(workshopId, userId) {
        return await this.put(`/workshops/${workshopId}/organizers`, { userId })
    }

    async deleteWorkshopOrganizer(workshopId, userId) {
        return await this.delete(
            `/workshops/${workshopId}/organizers/${userId}`
        )
    }

    async createWorkshopContact(workshopId, params) {
        return await this.put(`/workshops/${workshopId}/contacts`, params)
    }

    async deleteWorkshopContact(workshopId, email) {
        return await this.delete(`/workshops/${workshopId}/contacts/${email}`)
    }

    async createWorkshopService(workshopId, serviceId) {
        return await this.put(`/workshops/${workshopId}/services`, {
            serviceId,
        })
    }

    async deleteWorkshopService(workshopId, serviceId) {
        return await this.delete(
            `/workshops/${workshopId}/services/${serviceId}`
        )
    }

    async createWorkshopParticipant(workshopId, userId) {
        return await this.put(`/workshops/${workshopId}/participants`, {
            userId,
        })
    }

    async deleteWorkshopParticipant(workshopId, userId) {
        return await this.delete(
            `/workshops/${workshopId}/participants/${userId}`
        )
    }

    async createWorkshopEmail(workshopId, params) {
        return await this.put(`/workshops/${workshopId}/emails`, params)
    }

    async deleteWorkshopEmail(workshopId, email) {
        return await this.delete(`/workshops/${workshopId}/emails/${email}`)
    }

    /*
     * Form endpoints
     */

    async forms() {
        return await this.get(`/forms`)
    }

    async form(id) {
        return await this.get(`/forms/${id}`)
    } // id or name

    async createForm(fields) {
        return await this.put(`/forms`, fields)
    }

    async updateForm(id, fields) {
        return await this.post(`/forms/${id}`, fields)
    }

    async submitForm(id, submission) {
        return await this.put(`/forms/${id}/submissions`, submission)
    }

    async formSubmissions(params) {
        return await this.get(`/forms/submissions`, params)
    }

    async formSubmission(id) {
        return await this.get(`/forms/submissions/${id}`)
    }

    async createFormSection(section) {
        return await this.put(`/forms/sections`, section)
    }

    async updateFormSection(id, section) {
        return await this.post(`/forms/sections/${id}`, section)
    }

    async deleteFormSection(id) {
        return await this.delete(`/forms/sections/${id}`)
    }

    async createFormField(field) {
        return await this.put(`/forms/fields`, field)
    }

    async updateFormField(id, field) {
        return await this.post(`/forms/fields/${id}`, field)
    }

    async deleteFormField(id) {
        return await this.delete(`/forms/fields/${id}`)
    }

    /*
     * Public endpoints (authorization not required)
     */

    async confirmEmailAddress(hmac) {
        return await this.post(`/confirm_email`, { hmac })
    }

    // This endpoint is no longer called directly. Instead, use the cached copy in src/user-properties.json
    // async userProperties() { return await this.get(`/users/properties`) }

    async institutions(params) {
        return await this.get(`/users/properties/institutions`, params)
    }
}

module.exports = PortalAPI
