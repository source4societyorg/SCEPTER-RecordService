'use strict'
const utilities = require('@source4society/scepter-utility-lib')
const handlerUtilities = require('./handlerUtilities')

const genericHandlerFunction = (
  event,
  context,
  callback,
  serviceCall,
  constructService = handlerUtilities.constructRecordService,
  env = handlerUtilities.ENVIRONMENT,
  servicesPath = handlerUtilities.SERVICES_PATH,
  credentialsPath = handlerUtilities.CREDENTIALS_PATH,
  parametersPath = handlerUtilities.PARAMETERS_PATH,
  callbackHandler = utilities.standardCallbackHandler,
  getErrorHandlerDependency = utilities.standardErrorHandler,
  getSuccessHandlerDependency = utilities.standardSuccessHandler
) => {
  if(process.env.PROVIDER === 'azure') {
    let temp = context
    context = event
    event = temp
    callback = context.done
  }
  // inject dependencies
  const service = constructService(env, credentialsPath, servicesPath, parametersPath)
  const errorHandler = getErrorHandlerDependency(callback, service)
  const successHandler = getSuccessHandlerDependency(callback, service)

  try {
    serviceCall(service, callbackHandler, errorHandler, successHandler, event)
  } catch (error) {
    errorHandler(error)
  }
}

const updateUniqueRecordFunction = (event, context, callback, genericHandler = genericHandlerFunction) => 
  genericHandler(event, context, callback, (service, callbackHandler, errorHandler, successHandler, eventData) => {
    service.upsertUniqueRecord(eventData.tableName, eventData.recordType, eventData.countRecordType, eventData.idField, eventData.recordData, (err, data) => callbackHandler(err, data, errorHandler, successHandler)
  )}
)

const readRecordFunction = (event, context, callback, genericHandler = genericHandlerFunction) => 
  genericHandler(event, context, callback, (service, callbackHandler, errorHandler, successHandler, eventData) => {
    service.readRecord(eventData.tableName, eventData.recordId, eventData.recordType, (err, data) => callbackHandler(err, data, errorHandler, successHandler))
  }
)
 
const fetchRecordsFunction = (event, context, callback, genericHandler = genericHandlerFunction) => 
  genericHandler(event, context, callback, (service, callbackHandler, errorHandler, successHandler, eventData) => {
    service.fetchRecordsByType(eventData.tableName, eventData.recordType, (err, data) => callbackHandler(err, data, errorHandler, successHandler), eventData.options) 
  }
)

const disableUniqueRecordFunction = (event, context, callback, genericHandler = genericHandlerFunction) => 
  genericHandler(event, context, callback, (service, callbackHandler, errorHandler, successHandler, eventData) => {
    service.disableUniqueRecord(eventData.tableName, eventData.recordId, eventData.recordType, eventData.countRecordType, (err, data) => callbackHandler(err, data, errorHandler, successHandler)) 
  }
)

const deleteUniqueRecordFunction = (event, context, callback, genericHandler = genericHandlerFunction) => 
  genericHandler(event, context, callback, (service, callbackHandler, errorHandler, successHandler, eventData) => {
    service.deleteUniqueRecord(eventData.tableName, eventData.recordId, eventData.recordType, eventData.countRecordType, (err, data) => callbackHandler(err, data, errorHandler, successHandler)) 
  }
)

const deleteRecordFunction = (event, context, callback, genericHandler = genericHandlerFunction) => 
  genericHandler(event, context, callback, (service, callbackHandler, errorHandler, successHandler, eventData) => {
    service.deleteRecord(eventData.tableName, eventData.recordId, eventData.recordType, (err, data) => callbackHandler(err, data, errorHandler, successHandler)) 
  }
)

const updateDataRecordFunction = (event, context, callback, genericHandler = genericHandlerFunction) => 
  genericHandler(event, context, callback, (service, callbackHandler, errorHandler, successHandler, eventData) => 
    service.upsertDataRecord(eventData.tableName, eventData.recordData, (err, data) => callbackHandler(err, data, errorHandler, successHandler)
  )
)

module.exports.genericHandlerFunction = genericHandlerFunction
//////////////////////////////////////////////////////////////
module.exports.updateUniqueRecord = updateUniqueRecordFunction
module.exports.readRecord = readRecordFunction 
module.exports.fetchRecords = fetchRecordsFunction
module.exports.disableUniqueRecord = disableUniqueRecordFunction 
module.exports.deleteUniqueRecord = deleteUniqueRecordFunction 
module.exports.deleteRecord = deleteRecordFunction
module.exports.updateDataRecord = updateDataRecordFunction
