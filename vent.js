'use strict';
const E = Symbol('events');
const methods = 'on,once,off,emit'.split(',');

module.exports = class Vent {
  on(e, cb, ctx, vents = this[E] || def(this)[E]) {
    if(e in vents)
      !vents[e].some(x => x.cb === cb && x.ctx === ctx) && vents[e].push({ cb, ctx });
    else
      vents[e] = [{ cb, ctx }];
    return this;
  }

  once(e, cb, ctx) {
    let fn = (...argv) => { cb.apply(ctx, argv), this.off(e, fn); };
    return this.on(e, fn, this);
  }

  emit(e, ...argv) {
    this[E] && e in this[E] && this[E][e].forEach(x => x.cb.apply(x.ctx, argv));
    return this;
  }

  off(e, cb, arr, vents=this[E]) {
    if (!vents||!e) return vents ? def(this) : this;
    if('function'==typeof e)
      cb = e, arr = Object.keys(vents);
    else
      arr = [e];
    arr.forEach(cb ? e => e in vents && drop(vents[e], cb) : e => delete vents[e]);
    return this
  }

  static get store() {
    return ctx => ctx[E]
  }

  static extend(ctx) {
    methods.forEach(name => Object.defineProperty(ctx, name, Object.getOwnPropertyDescriptor(Vent.prototype, name)));
    return ctx
  }
};

function drop(chanel, cb, i = -1) {
    while(++i < chanel.length)
      cb === chanel[i].cb && chanel.splice(i, 1) && i--;
  }

function def(ctx) {
    Object.defineProperty(ctx, E, { value: Object.create(null), configurable: !0, writable: !0 });
    return ctx
  }
