'use strict';

let $ = Symbol('events');

module.exports = class Vent {
  constructor(a,b) {
    this[$]=Object.create(null);
  }

  on(e, cb, ctx) {
      (this[$][e]||(this[$][e]=[])).push({ cb, ctx })
      return this;
    }

  once(e, cb, ctx) {
      let fn = (e, ...argv) => {
        cb.apply(ctx, argv);
        this.off(e, fn);
      }
      return this.on(e, fn, this);
    }

  emit(e, ...argv) {
    let vents = this[$][e];
    vents && vents.forEach(x => x.cb.apply(x.ctx, argv));
    return this;
  }

  off(e, cb, i=-1, x, vents) {
    if(!e)
      this[$] = Object.create(null);
    else if(!cb)
      delete this[$][e];
    else if(vents = this[$][e])
      while(x = vents[++i])
        cb === x.cb && vents.splice(i, 1);
    return this;
  }
}
