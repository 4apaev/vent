'use strict';
module.exports = vent;
function vent(obj, $ = Object.create(null)) {

  return define(obj,

      function on(e, cb, ctx) {
          e.match(/\S+/g).forEach(x => ($[x]||($[x]=[])).push({ cb, ctx }))
          return this;
        },

    function once(e, cb, ctx) {
        let fn = (e, ...argv) => { cb.apply(ctx, argv); this.off(e, fn); }
        return this.on(e, fn, this);
      },

    function emit(e, ...argv) {
        $[e] && $[e].forEach(x => x.cb.apply(x.ctx, argv));
        return this;
      },

    function off(e, cb, arr) {
        if(e) {
          if('function'==typeof e)
            arr = Object.keys($), cb = e;
          else
            arr = e.match(/\S+/g);
          arr.forEach(cb ? x => x in $ && remove($[x], o => cb===o.cb) : x => delete $[x]);
        } else {
          $ = Object.create(null);
        }
        return this
      })
  }


function remove(list, cb, ctx) {
    let buf = [], i = -1;
    while (++i < list.length) {
      if (cb.call(ctx, list[i], i, list)) {
        buf.push(list.splice(i, 1)[0]), i--;
      }}
    return buf;
  }

function define(obj, ...argv) {
  argv.forEach(value => Object.defineProperty(obj, value.name, { value, configurable: !0, writable: !0}));
  return obj;
}
