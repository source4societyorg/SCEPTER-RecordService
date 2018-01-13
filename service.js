'use strict'
const optionalRequire = require('optional-require')(require)
class HelloService {
  constructor (stage = 'dev', credentialsPath = './credentials.json', parametersPath = './parameters.json', servicesPath = './services.json') {
    this.environment = stage
    this.credentials = optionalRequire(credentialsPath)
    this.services = optionalRequire(servicesPath)
    this.parameters = optionalRequire(parametersPath)
    this.utilities = require('@source4society/scepter-utility-lib')
  }

  prepareErrorResponse (error) {
    return error
  }

  prepareSuccessResponse (data) {
    return 'Hello'
  }
}

module.exports = HelloService
