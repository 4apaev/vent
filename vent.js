'use strict';

const isEmpty = x => { for(let k in x) return !1; return !0; };
const STORE = new Map;
const SEP = ','

module.exports = class Vent {
  on(evts, cb, ctx) {
    let vents = STORE.get(this) || STORE.set(this, Object.create(null)).get(this);
    evts.split(SEP).forEach(e => {
    if (e in vents)
      !vents[e].some(x => x.cb === cb && x.ctx === ctx) && vents[e].push({ cb, ctx });
    else
      vents[e] = [{ cb, ctx }];
    })
    return this;
  }

  once(e, cb, ctx) {
    let fn = (...argv) => { cb.call(ctx, ...argv), this.off(e, fn); };
    return this.on(e, fn);
  }

  emit(evts, ...argv) {
    let vents = STORE.get(this);
    vents && evts.split(SEP).forEach(e => e in vents && vents[e].forEach(x => x.cb.call(x.ctx, ...argv)))
    return this;
  }

  off(e, cb) {
    let arr, vents = STORE.get(this);
    if (!vents||!e)
      return STORE.delete(this), this;

    if('function'==typeof e)
      cb = e, arr = Object.keys(vents);
    else
      arr = e.split(SEP);

    arr.forEach(cb ? k => {
      if (k in vents) {
        let i = -1, chanel=vents[k];
        while(++i < chanel.length)
          cb === chanel[i].cb && chanel.splice(i, 1) && i--;
        isEmpty(chanel) && delete vents[k];
      }
    } : k => delete vents[k]);

    isEmpty(vents) && STORE.delete(this);
    return this;
  }

  static extend(o) {
    [ 'on','once','off','emit' ].forEach(name => Object.defineProperty(o, name, Object.getOwnPropertyDescriptor(Vent.prototype, name)));
    return o;
  }

  static getEventStore(o) {
    return o ? STORE.get(o) : STORE;
  }
};
