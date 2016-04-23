'use strict';

'use strict';
let log = console.log.bind(console)
let assert = require('assert')
let Emitter = require('./vent')
let slice = [].slice.call.bind([].slice)

let noop = assert.fail.bind(assert, 1, 0, 'must not be invoked')
let yep = cb => cb()

function run(method, x) {
  let args = slice(arguments, 2)
  return function() {
    try { x[method].apply(x, args) }
    catch(e) { assert.fail(0, e, e.toString()) }}}

describe('constructor', () => {
  let ev = new Emitter;

  it('should return vents object',   () => assert.equal('object',   typeof ev))
  it('emit should be an function',   () => assert.equal('function', typeof ev.emit))
  it('off should be an function',    () => assert.equal('function', typeof ev.off))
  it('on should be an function',     () => assert.equal('function', typeof ev.on))
  it('on should be once function',   () => assert.equal('function', typeof ev.once))
})

describe('on', () => {
  it('should not throw when called with a string and a function', run('on', new Emitter, 'ping', log))
  it('should not throw when called with a string, a function and an object', run('on', new Emitter, 'ping', log, {}))
})

describe('off', () => {
  let ev = new Emitter
  ev.on('ping', log);
  it('should not throw when called with not registered event',    run('off', ev, 'kong'))
  it('should not throw when called with not registered function', run('off', ev, 'ping', noop))
  it('should not throw when called with a string and a function', run('off', ev, 'ping', log))
})

describe('emit', () => {
  let ev = new Emitter
  beforeEach(() => ev.off())

  it('should emit ping event and invoke callback', function(done) {
    ev.on('ping', yep).emit('ping',done)
  })

  it('should invoke in context', function(done) {
    let cx = {}
    ev.on('ping', function() {
      assert.equal(cx, this)
      done()
    }, cx).emit('ping')
  })

  it('should invoke none', function() {
    ev.on('ping', noop)
      .on('ping', noop)
      .on('pong', noop)
      .on('pong', noop)
    .off()
      .emit('ping')
      .emit('pong')
  })

  it('should invoke all but specified callback', function(done) {
    ev.on('ping', yep)
      .on('ping', noop)
    .off('ping', noop)
      .emit('ping', done)
  })

  it('should invoke all but specified event', function(done) {
    ev.on('pong', yep)
      .on('ping', noop)
      .on('ping', noop)
    .off('ping')
      .emit('ping')
      .emit('pong', done)
  })
})

describe('once', () => {

  let ev = new Emitter

  it('should invoke once', function(){

    let i = 0

    ev.once('ping', () => i +=1 )
      .emit('ping')
      .emit('ping');
    assert.equal(i, 1)
  })

  it('should invoke in context', function() {
    let cx = {}
    let i = 0
    ev.once('ping', function() {
      assert.equal(cx, this)
      i +=1
    }, cx)
      .emit('ping')
      .emit('ping');

    assert.equal(i, 1)
  })
})
