'use strict';

let log = console.log.bind(console)
let is = require('is')
let assert = require('assert')
let Vent = require('./_vent')
let methods = 'on,once,off,emit'.split(',');

let fail = assert.fail.bind(assert, 1, 0, 'fail: must not be invoked')
let noop = assert.fail.bind(assert, 1, 0, 'noop: must not be invoked')
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
  let ev = new Vent;


  it('should return vents object',   () => is.obj.assert(ev))
  it('emit should be an function',   () => is.func.assert(ev.emit))
  it('off should be an function',    () => is.func.assert(ev.off))
  it('on should be an function',     () => is.func.assert(ev.on))
  it('on should be once function',   () => is.func.assert(ev.once))
})

describe('Vent:on', () => {
  it('should not throw when called with a string and a function', run('on', new Vent, 'ping', log))
  it('should not throw when called with a string, a function and an object', run('on', new Vent, 'ping', log, {}))
  it('should not duplicate handlers', () => {

    let ev = new Vent
    let n = 0
    let duplicated = () => n+=1

    ev.on('a', duplicated)
      .on('a', duplicated)

    ev.emit('a')
    assert.equal(1, n)
  })
})

describe('Vent:off', () => {
 let ev = new Vent;
 ev.on('ping', log);
 it('should not throw when called with not registered event',    run('off', ev, 'kong'));
 it('should not throw when called with not registered function', run('off', ev, 'ping', noop));
 it('should not throw when called with a string and a function', run('off', ev, 'ping', log));
})

//describe('Vent:get store', () => {
//  let getter, vents, ev = new Vent;
//  ev.on('ping', log)
//
//  it('should create event getter', () => {
//    is.func.assert(getter = Vent.store)
//  });
//
//  it('should return event object', () => {
//    is.Obj.assert(vents = getter(ev))
//  });
//
//  it('should contain ping chanel', () => {
//    is.own.assert(vents,'ping')
//    is.arr.assert(vents.ping)
//  });
//})
//

describe('Vent:emit', () => {
  let ev = new Vent
  beforeEach(() => ev.off());

  it('should emit ping event and invoke callback', done => ev.on('ping', yep).emit('ping',done))

  it('should invoke in context', done => {
    let cx = {}
    ev.on('ping', function() {
      assert.equal(cx, this);
      done();
    }, cx).emit('ping');
  });

  it('should invoke none', () => ev
    .on('ping', noop)
    .on('pong', noop)
    .off()
    .emit('ping')
    .emit('pong'));

  it('should invoke all but specified callback', done => ev
    .on('ping', yep)
    .on('ping', noop)
    .off('ping', noop)
    .emit('ping', done));

  it('should invoke all but specified event',    done => ev
    .on('pong', yep)
    .on('ping', noop)
    .on('ping', fail)
    .off('ping')
    .emit('ping')
    .emit('pong', done));

  it('should remove all fails', done => ev
    .on('pong', yep)
    .on('pong', fail)
    .on('ping', fail)
    .on('bong', fail)
    .off(fail)
    .emit('ping')
    .emit('bong')
    .emit('pong', done));
})

describe('Vent:once', () => {
  let ev = new Vent
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

describe('Vent:extend', () => {
  class A {}
  Vent.extend(A.prototype);

  methods.forEach(x => {
      let msg = `A.prototype should have ${x} method`
      it(msg, () => is.func.assert(A.prototype[x], msg))
    })

})
