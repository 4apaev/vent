'use strict';

class Vent {
  constructor() {}

  on(e, cb, ctx) {
    this.vents||defineVents(this);
    if(this.vents[e])
      !this.vents[e].some(entry => entry.cb === cb && entry.ctx === ctx) && this.vents[e].push({ cb, ctx })
    else
      this.vents[e] = [{ cb, ctx }]
    return this;
  }

  once(e, cb, ctx) {
    let fn = (...argv) => {
      cb.apply(ctx, argv); this.off(e, fn);
    }
    return this.on(e, fn, this);
  }

  emit(e, ...argv) {
    this.vents && this.vents[e] && this.vents[e].forEach(x => x.cb.apply(x.ctx, argv));
    return this;
  }

  off(e, cb, arr) {
    if (this.vents) {
      if(e) {
        if('function'==typeof e)
          cb = e, arr = Object.keys(this.vents)
        else
          arr = [e]
        arr.forEach(cb
          ? name => name in this.vents && remove(this.vents[name], cb)
          : name => delete this.vents[name]);
      } else {
        defineVents(this)
      }}
    return this
  }
}

module.exports = Vent;

function remove(list, cb) {
  let i = -1, n = list.length
  while (++i < n) {
    if(cb === list[i].cb) {
      list.splice(i, 1);
      n--;
    }}}

function defineVents(obj) {
    return Object.defineProperty(obj, 'vents', { value: Object.create(null), configurable: !0, writable: !0 })
  }
