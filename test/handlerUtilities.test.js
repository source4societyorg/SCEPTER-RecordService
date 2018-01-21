'use strict'
const RecordService = require('../service')
test('constructRecordService returns an instance of RecordService', () => {
  const handlerUtilities = require('../handlerUtilities')
  let service = handlerUtilities.constructRecordService('test', './test/credentials.json', './test/parameters.json', './test/services.json')
  expect(service).toBeInstanceOf(RecordService)
})
