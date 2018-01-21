'use strict'
const RecordService = require('../service')

test('prepareErrorResponse functions properly', () => {
  const service = new RecordService('test', './test/credentials.json', './test/services.json', './test/parameters.json', './test/settingDefaults.json')
  expect(service.prepareErrorResponse(new Error('test'))).toEqual({ status: false, errors: new Error('test') })
})

test('prepareSuccessResponse functions properly', () => {
  const service = new RecordService('test', './test/credentials.json', './test/services.json', './test/parameters.json', './test/settingDefaults.json')
  expect(service.prepareSuccessResponse('test')).toEqual({ status: true, record: 'test' })
})

module.exports = RecordService
