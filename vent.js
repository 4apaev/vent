'use strict';

const E = Symbol('events');
const { keys, create, defineProperty, getOwnPropertyDescriptor } = Object;

module.exports = class Vent {
  on(e, cb, ctx) {
    let vents = this[E]||(this[E]=create(null));
    
    if (e in vents)
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
    let vents = this[E];
    vents && e in vents && vents[e].forEach(x => x.cb.apply(x.ctx, argv));
    return this;
  }
  
  off(e, cb) {
    let arr, vents=this[E];
    
    if (!vents||!e) {
      vents && (this[E]=create(null));
      return this;
    }
    
    if('function'==typeof e)
      cb = e, arr = keys(vents);
    else
      arr = [e];
    
    let handler = cb
      ? e => e in vents && Vent.drop(vents[e], cb)
      : e => delete vents[e];
    
    arr.forEach(handler);
    return this
  }
  
  static drop(chanel, cb, i = -1) {
    while(++i < chanel.length)
      cb === chanel[i].cb && chanel.splice(i, 1) && i--;
  }
  
  static extend(o) {
    'on,once,off,emit'.split(',').forEach(name => defineProperty(o, name, getOwnPropertyDescriptor(Vent.prototype, name)));
    return o
  }
};
