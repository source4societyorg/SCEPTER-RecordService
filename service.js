'use strict'

const DynamoDB = require('@source4society/scepter-dynamodb-lib')
const uuidv4 = require('uuid/v4')
const immutable = require('immutable')
const utilities = require('@source4society/scepter-utility-lib')

class RecordService {
  constructor (
    stage = 'dev', 
    credentialPath = './credentials.json', 
    servicesPath = './services.json', 
    parametersPath = './parameters.json', 
  ) {
    this.credentials = immutable.fromJS(require(credentialPath))
    this.parameters = immutable.fromJS(require(parametersPath))
    this.services = immutable.fromJS(require(servicesPath))
    this.dynamoDB = new DynamoDB()
    this.dynamoDB.setConfiguration(this.credentials, stage)
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //upsertUniqueRecord
  //
  upsertUniqueRecord (tableName, recordType, countRecordType, idField, recordData, callback) {    
    this.standardParametersCheck('tableName', tableName)    
    this.standardParametersCheck('recordType', recordType)    
    this.standardParametersCheck('countRecordType', countRecordType)    
    this.standardParametersCheck('idField', idField)    
    this.standardParametersCheck('recordData', recordData)    
    recordData = this.processUniqueData(recordData, recordType, idField) 
    utilities.initiateSequence(this.upsertUniqueRecordSequence(callback, tableName, recordData, recordType, countRecordType, idField), callback)
  }

  standardParametersCheck (paramName, parameter) {
    if (utilities.isEmpty(parameter)) {
      throw new Error( paramName + ' must be specified')
    }
  }

  processUniqueData (recordData, recordType, idField) {
    this.standardParametersCheck('created timestamp', recordData.created)
    recordData[idField] = utilities.valueOrDefault(recordData[idField], assignUid())
    recordData.recordType = recordType
    recordData.enabled = utilities.valueOrDefault(recordData.enabled, true)
    recordData['enabled-recordType'] = recordData.enabled + '-' + recordType
    return recordData
  }

  assignUid () {
    return uuidv4()
  }

  *upsertUniqueRecordSequence (finalCallback, tableName, recordData, recordType, countRecordType, idField) { 
    let callback = yield;
    let result = yield this.performRecordUpsert(tableName, recordData, callback)
    let countData = yield this.readRecord(tableName, recordType, countRecordType, callback)
    result = yield this.updateRecordCount(countData, tableName, countRecordType, recordType, 'increment', callback) 
    finalCallback(undefined, { recordId: recordData[idField] })   
  }

  performRecordUpsert (tableName, recordData, callback) {
    this.dynamoDB.putItem(tableName, recordData, callback)
  }

  updateRecordCount (countRecord, tableName, countRecordType, recordType, mode, callback) {
    let enabledRecords = utilities.getInOrDefault(countRecord, ['Item', 'enabledRecords'], 0)
    let updatedEnabledRecords = utilities.ifTrueElseDefault(mode !== 'increment', (enabledRecords - 1), enabledRecords + 1)
    let userCountRecord = {
      enabledRecords: updatedEnabledRecords,
      recordType: countRecordType,
      recordId: recordType
    }
    let options = { 
      ConditionExpression: 'enabledRecords = :enabledRecords', 
      ExpressionAttributeValues: { ':enabledRecords': enabledRecords } 
    } 
    this.dynamoDB.putItem(tableName, userCountRecord, callback, options)         
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
 
  upsertDataRecord (tableName, recordData, callback) {    
    this.standardParametersCheck('tableName', tableName)    
    this.standardParametersCheck('recordData', recordData)    
    recordData = this.processData(recordData, recordType) 
    this.performRecordUpsert(tableName, recordData, callback)
  }
 
  //////////////////////////////////////////////////////////////////////////////////////////////
  // readRecord
  readRecord (tableName, recordId, recordType, callback) {
    this.standardParametersCheck('tableName', tableName)    
    this.standardParametersCheck('recordId', recordId)    
    this.standardParametersCheck('recordType', recordType)   
    this.dynamoDB.getItem(tableName, { recordId: recordId, recordType: recordType }, null, callback )
  }
  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  // fetchRecordsByType
  fetchRecordsByType (tableName, recordType, callback, options, keyExpression) {
    this.standardParametersCheck('tableName', tableName)    
    this.standardParametersCheck('recordType', recordType)   
    keyExpression = utilities.valueOrDefault(keyExpression, 'recordType = :recordType')
    options = utilities.valueOrDefault(options, { IndexName: 'recordType-index', ExpressionAttributeValues: {':recordType': recordType} }) 
    this.dynamoDB.query(tableName, keyExpression, callback, options)
  }
  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  // disableUniqueRecord
  disableUniqueRecord (tableName, recordId, recordType, countRecordType, callback) {
    this.standardParametersCheck('tableName', tableName)    
    this.standardParametersCheck('recordId', recordId)    
    this.standardParametersCheck('recordType', recordType)   
    this.standardParametersCheck('countRecordType', countRecordType)   
    utilities.initiateSequence(this.disableRecordSequence(callback, tableName, recordId, recordType, countRecordType), callback)
  }

  *disableRecordSequence (finalCallback, tableName, recordId, recordType, countRecordType) { 
    let callback = yield;
    let result = yield this.performRecordUpdate(
      tableName, 
      { recordId: recordId, recordType: recordType }, 
      "set #enabled = :enabledValue, #enabledRecordType'=:enabledRTValue", { 
        ExpressionAttributeNames: { '#enabled': 'enabled', '#enabledRecordType': 'enabled-recordType' }, 
        ExpressionAttributeValues: { ':enabledValue': false, ':enabledRTValue': 'false-' + recordType }
      },
      callback
    )
    let countData = yield this.readRecord(tableName, recordType, countRecordType, callback)
    result = yield this.updateRecordCount(countData, tableName, countRecordType, recordType, 'decrement', callback) 
    finalCallback(undefined, { recordId: recordData[idField] })   
  }

  performRecordUpdate (tableName, keyExpression, updateStatement, callback, options) {
    this.standardParametersCheck('tableName', tableName)    
    this.standardParametersCheck('keyExpression', keyExpression)    
    this.standardParametersCheck('updateStatement', updateStatement)   
    this.dynamoDB.updateItem( tableName, keyExpression, updateStatement, callback)
  }
  //////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  // deleteUniqueRecord
  deleteUniqueRecord (tableName, recordId, recordType, countRecordType, callback) {
    this.standardParametersCheck('tableName', tableName)    
    this.standardParametersCheck('recordId', recordId)    
    this.standardParametersCheck('recordType', recordType)   
    this.standardParametersCheck('countRecordType', countRecordType)   
    utilities.initiateSequence(this.deleteUniqueRecordSequence(callback, tableName, recordId, recordType, countRecordType), callback)
  }

  *deleteUniqueRecordSequence (finalCallback, tableName, recordId, recordType, countRecordType) { 
    let callback = yield;
    let result = yield this.deleteRecord(tableName, recordId, recordType, callback)
    let countData = yield this.readRecord(tableName, recordType, countRecordType, callback)
    result = yield this.updateRecordCount(countData, tableName, countRecordType, recordType, 'decrement', callback) 
    finalCallback(undefined, { recordId: recordData[idField] })   
  }
  /////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////
  // deleteRecord
  deleteRecord (tableName, recordId, recordType, callback, keyExpression) {
    this.standardParametersCheck('tableName', tableName)    
    this.standardParametersCheck('recordId', recordId)    
    this.standardParametersCheck('recordType', recordType)   
    keyExpression = utilities.valueOrDefault(keyExpression, { recordId: recordId, recordType: recordType })
    this.dynamoDB.deleteItem( tableName, keyExpression, callback)
  }
  /////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////
  //
  // Responses
  //
  prepareErrorResponse (error) {    
    return { status: false, errors: error }
  }

  prepareSuccessResponse (data) {
    return { status: true, record: data }
  }
};

module.exports = RecordService
