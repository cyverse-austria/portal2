#!/usr/bin/env node

const { userCreationWorkflow } = require('../api/workflows/native/user.js')
const models = require('../api/models')

async function main() {
    const username = process.argv[2]
    if (!username) {
        console.log('Usage: run_workflow.js <username>')
        process.exit(1)
    }

    const user = await models.account_user.findOne({ where: { username } })
    if (!user) {
        console.log('User not found')
        process.exit(2)
    }

    userCreationWorkflow(user)
}

main()
