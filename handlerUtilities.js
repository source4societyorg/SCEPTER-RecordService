const RecordService = require('./service')
const utilities = require('@source4society/scepter-utility-lib')

const handlerUtilities = {
  constructRecordService: (environment, credentialsPath, servicesPath, parametersPath) => (
    new RecordService(environment, credentialsPath, servicesPath, parametersPath)
  ),
  ENVIRONMENT: utilities.valueOrDefault(process.env.stage, 'dev'),
  SERVICES_PATH: utilities.valueOrDefault(process.env.SERVICES_PATH, './services'),
  CREDENTIALS_PATH: utilities.valueOrDefault(process.env.CREDENTIALS_PATH, './credentials'),
  PARAMETERS_PATH: utilities.valueOrDefault(process.env.PARAMETERS_PATH, './parameters')
}

module.exports = handlerUtilities
