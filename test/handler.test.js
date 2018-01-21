'use strict'

test('genericHandler invokes serviceCall', (done) => {
  const genericHandler = require('../handler.js').genericHandlerFunction
  const mockServiceCall = () => done()
  const mockServiceConstructor = () => ({})
  genericHandler(undefined, undefined, undefined, mockServiceCall, mockServiceConstructor)
})

test('genericHandler invokes error handler on error', (done) => {
  const genericHandler = require('../handler.js').genericHandlerFunction
  const mockServiceCall = () => { throw new Error('test error') }
  const mockServiceConstructor = () => ({ prepareErrorResponse: (error) => expect(error).toEqual(new Error('test error')) })
  const mockCallback = () => done()
  genericHandler(undefined, undefined, mockCallback, mockServiceCall, mockServiceConstructor)
})
