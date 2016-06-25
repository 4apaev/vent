'use strict';

let log = console.log.bind(console)
let assert = require('assert')
let vent = require('./vent')

let noop = assert.fail.bind(assert, 1, 0, 'must not be invoked')
let yep = cb => cb()

function run(method, x, ...args) {
  return function() {
    try {
      x[method].apply(x, args)
    } catch(e) {
      assert.fail(0, e, e.toString())
    }
  }
}

describe('Vent:constructor', () => {
  let ev = vent({});
  it('should return vents object',   () => assert.equal('object',   typeof ev));
  it('emit should be an function',   () => assert.equal('function', typeof ev.emit));
  it('off should be an function',    () => assert.equal('function', typeof ev.off));
  it('on should be an function',     () => assert.equal('function', typeof ev.on));
  it('on should be once function',   () => assert.equal('function', typeof ev.once));
})

describe('Vent:on', () => {
  it('should not throw when called with a string and a function', run('on', vent({}), 'ping', log))
  it('should not throw when called with a string, a function and an object', run('on', vent({}), 'ping', log, {}))
  it('should not duplicate handlers', () => {

    let ev = vent({})
    let n = 0
    let duplicated = () => n+=1

    ev.on('a', duplicated)
      .on('a', duplicated)

    ev.emit('a')
    assert.equal(1, n)
  })
})

describe('Vent:off', () => {
  let ev = vent({});
  ev.on('ping', log);
  it('should not throw when called with not registered event',    run('off', ev, 'kong'));
  it('should not throw when called with not registered function', run('off', ev, 'ping', noop));
  it('should not throw when called with a string and a function', run('off', ev, 'ping', log));
})

describe('Vent:emit', () => {
  let ev = vent({})
  beforeEach(() => ev.off());

  it('should emit ping event and invoke callback', done => ev.on('ping', yep).emit('ping',done))

  it('should invoke in context', done => {
    let cx = {}
    ev.on('ping', function() {
      assert.equal(cx, this);
      done();
    }, cx).emit('ping');
  });

  it('should invoke none',                         () => ev.on('ping', noop).on('ping', noop).on('pong', noop).on('pong', noop).off().emit('ping').emit('pong'));
  it('should invoke all but specified callback', done => ev.on('ping', yep).on('ping', noop).off('ping', noop).emit('ping', done));
  it('should invoke all but specified event',    done => ev.on('pong', yep).on('ping', noop).on('ping', noop).off('ping').emit('ping').emit('pong', done));
})

describe('Vent:once', () => {
  let ev = vent({})
  it('should invoke once', () => {
    let i = 0
    ev.once('ping', () => i +=1 ).emit('ping').emit('ping');
    assert.equal(i, 1)
  })

  it('should invoke in context', () => {
    let cx = {}, i = 0;
    ev.once('ping', function() {
      assert.equal(cx, this);
      i +=1
    }, cx).emit('ping').emit('ping');
    assert.equal(i, 1)
  })
})


describe('Vent:on multi', () => {
  let ev = vent({}), expected = 0;
  it('should add multiple events', () => {
    ev.on('ping pong', () => expected+=1).emit('ping').emit('pong');
    assert.equal(expected, 2);
  })
})

describe('Vent:off multi', () => {
  let ev = vent({}), expected = 0;
  it('should add multiple events', () => {
    ev.on('ping pong bong', () => expected+=1).emit('ping').emit('pong');
    assert.equal(expected, 2);
    ev.off('ping pong').emit('ping').emit('pong').emit('bong');
    assert.equal(expected, 3)
  })
})
