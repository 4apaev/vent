'use strict';

let log = console.log.bind(console)
let is = require('is')
let assert = require('assert')
let Vent = require('./vent')
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
  it('once should be an function',   () => is.func.assert(ev.once))
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
      .emit('a')
    assert.equal(1, n)
  })
})


describe('Vent:on:multiple', () => {

  it('should not duplicate handlers', () => {
    let ev = new Vent, n = 0, duplicated = () => n+=1;

    ev.on('ping,pong', duplicated)
      .on('ping,pong', duplicated)
      .emit('ping,pong');

    assert.equal(2, n)
  })
})

describe('Vent:off', () => {
  let evt = new Vent;
  evt.on('ping', log);

  it('should not throw when called with not registered event',    run('off', evt, 'kong'));
  it('should not throw when called with not registered function', run('off', evt, 'ping', noop));
  it('should not throw when called with a string and a function', run('off', evt, 'ping', log));


  it('should remove specified listener for specified event', () => {

    let ev = new Vent;
    let dict = { a: 0, b: 0, c: 0 }

    let a = () => dict.a+=1
    let b = () => dict.b+=1
    let c = () => dict.c+=1

    ev
      .on('ping', a)
      .on('ping', b)
      .on('ping', c)
      .on('pong', a)

    ev
      .emit('ping')
      .off('ping', a)
      .emit('ping');

    assert.equal(1, dict.a)
    assert.equal(2, dict.b)
    assert.equal(2, dict.c)


    ev.emit('pong');
    assert.equal(2, dict.a)
  });

  it('should remove specified listener for all events', () => {


    let a=0, b=0, c=0, ev = new Vent;

    let fa = () => a+=1
    let fb = () => b+=1
    let fc = () => c+=1

    ev
      .on('ping', fa)
      .on('ping', fb)
      .on('ping', fc)

      .on('pong', fa)
      .on('pong', fb)

      .emit('ping')
      .emit('pong');

    assert.equal(2, a)
    assert.equal(2, b)
    assert.equal(1, c)

    ev
      .off(fa)
      .emit('ping')
      .emit('pong');

    assert.equal(2, a)
    assert.equal(4, b)
    assert.equal(2, c)

  });

  it('should remove all listeners', () => {
    let a=0, b=0, ev = new Vent;
    let fa = () => a+=1
    let fb = () => b+=1

    ev
      .on('ping', fa)
      .on('ping', fb)

      .on('pong', fa)
      .on('pong', fb)

      .emit('ping')
      .emit('pong');

    assert.equal(2, a)
    assert.equal(2, b)

    ev
      .off()
      .emit('ping')
      .emit('pong');

    assert.equal(2, a)
    assert.equal(2, b)

  });

  it('should remove all listeners for specified event', () => {

    let a=0, b=0, c=0, ev = new Vent;
    ev
      .on('ping', () => a+=1)
      .on('ping', () => b+=1)
      .on('pong', () => c+=1)

      .emit('ping')
      .emit('pong');

    assert.equal(1, a)
    assert.equal(1, b)
    assert.equal(1, c)

    ev
      .off('ping')

      .emit('ping')
      .emit('pong');

    assert.equal(1, a)
    assert.equal(1, b)
    assert.equal(2, c);

  });
});

describe('Vent:off:multiple', () => {
  it('should remove specified listener for specified event', () => {

    let ev = new Vent;
    let dict = { a: 0, b: 0, c: 0 }

    let a = () => dict.a+=1
    let b = () => dict.b+=1
    let c = () => dict.c+=1

    ev
      .on('ping,pong', a)
      .on('ping', b)
      .on('ping', c)

    ev
      .emit('ping')
      .off('ping', a)
      .emit('ping');

    assert.equal(1, dict.a)
    assert.equal(2, dict.b)
    assert.equal(2, dict.c)

    ev.emit('pong');
    assert.equal(2, dict.a)
  });

  it('should remove specified listener for all events', () => {
    let a=0, b=0, c=0, ev = new Vent;
    let fa = () => a+=1
    let fb = () => b+=1
    let fc = () => c+=1

    ev
      .on('ping,pong', fa)
      .on('ping,pong', fb)
      .on('ping', fc)
      .emit('ping,pong')

    assert.equal(2, a)
    assert.equal(2, b)
    assert.equal(1, c)

    ev
      .off(fa)
      .emit('ping,pong');

    assert.equal(2, a)
    assert.equal(4, b)
    assert.equal(2, c)
  });

  it('should remove all listeners', () => {
    let a=0, b=0, ev = new Vent;
    let fa = () => a+=1
    let fb = () => b+=1

    ev
      .on('ping,pong', fa)
      .on('ping,pong', fb)
      .emit('ping,pong');

    assert.equal(2, a)
    assert.equal(2, b)

    ev.off().emit('ping,pong');

    assert.equal(2, a)
    assert.equal(2, b)

  });

  it('should remove all listeners for specified event', () => {

    let a=0, b=0, c=0, ev = new Vent;
    ev
      .on('ping', () => a+=1)
      .on('ping', () => b+=1)
      .on('pong', () => c+=1)
      .emit('ping,pong');

    assert.equal(1, a)
    assert.equal(1, b)
    assert.equal(1, c)

    ev
      .off('ping')
      .emit('ping,pong');
    assert.equal(1, a)
    assert.equal(1, b)
    assert.equal(2, c);

  });
});
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

describe('Vent:emit:multiple', () => {
  let ev = new Vent
  beforeEach(() => ev.off());


  it('should invoke none', () => ev
    .on('ping,pong', noop)
    .off()
    .emit('ping,pong'));

  it('should remove all fails', done => ev
    .on('pong', yep)
    .on('ping,pong,bong', fail)
    .off(fail)
    .emit('ping,bong')
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
