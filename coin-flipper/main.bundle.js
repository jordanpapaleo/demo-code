(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/shim");

require("regenerator/runtime");

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"core-js/shim":85,"regenerator/runtime":86}],2:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var $ = require('./$');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = $.toObject($this)
      , length = $.toLength(O.length)
      , index  = $.toIndex(fromIndex, length)
      , value;
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index;
    } return !IS_INCLUDES && -1;
  };
};
},{"./$":22}],3:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var $   = require('./$')
  , ctx = require('./$.ctx');
module.exports = function(TYPE){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
  return function($this, callbackfn, that){
    var O      = Object($.assertDefined($this))
      , self   = $.ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = $.toLength(self.length)
      , index  = 0
      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./$":22,"./$.ctx":11}],4:[function(require,module,exports){
var $ = require('./$');
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
assert.def = $.assertDefined;
assert.fn = function(it){
  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
module.exports = assert;
},{"./$":22}],5:[function(require,module,exports){
var $        = require('./$')
  , enumKeys = require('./$.enum-keys');
// 19.1.2.1 Object.assign(target, source, ...)
/* eslint-disable no-unused-vars */
module.exports = Object.assign || function assign(target, source){
/* eslint-enable no-unused-vars */
  var T = Object($.assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = $.ES5Object(arguments[i++])
      , keys   = enumKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$":22,"./$.enum-keys":14}],6:[function(require,module,exports){
var $        = require('./$')
  , TAG      = require('./$.wks')('toStringTag')
  , toString = {}.toString;
function cof(it){
  return toString.call(it).slice(8, -1);
}
cof.classof = function(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
};
cof.set = function(it, tag, stat){
  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
};
module.exports = cof;
},{"./$":22,"./$.wks":36}],7:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , safe     = require('./$.uid').safe
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , step     = require('./$.iter').step
  , has      = $.has
  , set      = $.set
  , isObject = $.isObject
  , hide     = $.hide
  , isFrozen = Object.isFrozen || $.core.Object.isFrozen
  , ID       = safe('id')
  , O1       = safe('O1')
  , LAST     = safe('last')
  , FIRST    = safe('first')
  , ITER     = safe('iter')
  , SIZE     = $.DESC ? safe('size') : 'size'
  , id       = 0;

function fastKey(it, create){
  // return primitive with prefix
  if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
  // can't set id to frozen object
  if(isFrozen(it))return 'F';
  if(!has(it, ID)){
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, ID, ++id);
  // return object id with prefix
  } return 'O' + it[ID];
}

function getEntry(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index != 'F')return that[O1][index];
  // frozen object case
  for(entry = that[FIRST]; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
}

module.exports = {
  getConstructor: function(NAME, IS_MAP, ADDER){
    function C(){
      var that     = assert.inst(this, C, NAME)
        , iterable = arguments[0];
      set(that, O1, $.create(null));
      set(that, SIZE, 0);
      set(that, LAST, undefined);
      set(that, FIRST, undefined);
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    }
    $.mix(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that[FIRST] = that[LAST] = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that[O1][entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that[FIRST] == entry)that[FIRST] = next;
          if(that[LAST] == entry)that[LAST] = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        var f = ctx(callbackfn, arguments[1], 3)
          , entry;
        while(entry = entry ? entry.n : this[FIRST]){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if($.DESC)$.setDesc(C.prototype, 'size', {
      get: function(){
        return assert.def(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index != 'F')that[O1][index] = entry;
    } return that;
  },
  getEntry: getEntry,
  // add .keys, .values, .entries, [@@iterator]
  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
  setIter: function(C, NAME, IS_MAP){
    require('./$.iter-define')(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        iter.o = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);
  }
};
},{"./$":22,"./$.assert":4,"./$.ctx":11,"./$.for-of":15,"./$.iter":21,"./$.iter-define":19,"./$.uid":34}],8:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def')
  , forOf = require('./$.for-of');
module.exports = function(NAME){
  $def($def.P, NAME, {
    toJSON: function toJSON(){
      var arr = [];
      forOf(this, false, arr.push, arr);
      return arr;
    }
  });
};
},{"./$.def":12,"./$.for-of":15}],9:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , safe      = require('./$.uid').safe
  , assert    = require('./$.assert')
  , forOf     = require('./$.for-of')
  , _has      = $.has
  , isObject  = $.isObject
  , hide      = $.hide
  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
  , id        = 0
  , ID        = safe('id')
  , WEAK      = safe('weak')
  , LEAK      = safe('leak')
  , method    = require('./$.array-methods')
  , find      = method(5)
  , findIndex = method(6);
function findFrozen(store, key){
  return find(store.array, function(it){
    return it[0] === key;
  });
}
// fallback for frozen keys
function leakStore(that){
  return that[LEAK] || hide(that, LEAK, {
    array: [],
    get: function(key){
      var entry = findFrozen(this, key);
      if(entry)return entry[1];
    },
    has: function(key){
      return !!findFrozen(this, key);
    },
    set: function(key, value){
      var entry = findFrozen(this, key);
      if(entry)entry[1] = value;
      else this.array.push([key, value]);
    },
    'delete': function(key){
      var index = findIndex(this.array, function(it){
        return it[0] === key;
      });
      if(~index)this.array.splice(index, 1);
      return !!~index;
    }
  })[LEAK];
}

module.exports = {
  getConstructor: function(NAME, IS_MAP, ADDER){
    function C(){
      $.set(assert.inst(this, C, NAME), ID, id++);
      var iterable = arguments[0];
      if(iterable != undefined)forOf(iterable, IS_MAP, this[ADDER], this);
    }
    $.mix(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        if(isFrozen(key))return leakStore(this)['delete'](key);
        return _has(key, WEAK) && _has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        if(isFrozen(key))return leakStore(this).has(key);
        return _has(key, WEAK) && _has(key[WEAK], this[ID]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    if(isFrozen(assert.obj(key))){
      leakStore(that).set(key, value);
    } else {
      _has(key, WEAK) || hide(key, WEAK, {});
      key[WEAK][that[ID]] = value;
    } return that;
  },
  leakStore: leakStore,
  WEAK: WEAK,
  ID: ID
};
},{"./$":22,"./$.array-methods":3,"./$.assert":4,"./$.for-of":15,"./$.uid":34}],10:[function(require,module,exports){
'use strict';
var $     = require('./$')
  , $def  = require('./$.def')
  , BUGGY = require('./$.iter').BUGGY
  , forOf = require('./$.for-of')
  , species = require('./$.species')
  , assertInstance = require('./$.assert').inst;

module.exports = function(NAME, methods, common, IS_MAP, IS_WEAK){
  var Base  = $.g[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  function fixMethod(KEY, CHAIN){
    var method = proto[KEY];
    if($.FW)proto[KEY] = function(a, b){
      var result = method.call(this, a === 0 ? 0 : a, b);
      return CHAIN ? this : result;
    };
  }
  if(!$.isFunction(C) || !(IS_WEAK || !BUGGY && proto.forEach && proto.entries)){
    // create collection constructor
    C = common.getConstructor(NAME, IS_MAP, ADDER);
    $.mix(C.prototype, methods);
  } else {
    var inst  = new C
      , chain = inst[ADDER](IS_WEAK ? {} : -0, 1)
      , buggyZero;
    // wrap for init collections from iterable
    if(!require('./$.iter-detect')(function(iter){ new C(iter); })){ // eslint-disable-line no-new
      C = function(){
        assertInstance(this, C, NAME);
        var that     = new Base
          , iterable = arguments[0];
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      };
      C.prototype = proto;
      if($.FW)proto.constructor = C;
    }
    IS_WEAK || inst.forEach(function(val, key){
      buggyZero = 1 / key === -Infinity;
    });
    // fix converting -0 key to +0
    if(buggyZero){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    // + fix .add & .set for chaining
    if(buggyZero || chain !== inst)fixMethod(ADDER, true);
  }

  require('./$.cof').set(C, NAME);

  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);
  species(C);
  species($.core[NAME]); // for wrapper

  if(!IS_WEAK)common.setIter(C, NAME, IS_MAP);

  return C;
};
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.for-of":15,"./$.iter":21,"./$.iter-detect":20,"./$.species":28}],11:[function(require,module,exports){
// Optional / simple context binding
var assertFunction = require('./$.assert').fn;
module.exports = function(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.assert":4}],12:[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction;
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
global.core = core;
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    if(type & $def.B && own)exp = ctx(out, global);
    else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own){
      if(isGlobal)target[key] = out;
      else delete target[key] && $.hide(target, key, out);
    }
    // export
    if(exports[key] != out)$.hide(exports, key, exp);
  }
}
module.exports = $def;
},{"./$":22}],13:[function(require,module,exports){
var $        = require('./$')
  , document = $.g.document
  , isObject = $.isObject
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$":22}],14:[function(require,module,exports){
var $ = require('./$');
module.exports = function(it){
  var keys       = $.getKeys(it)
    , getDesc    = $.getDesc
    , getSymbols = $.getSymbols;
  if(getSymbols)$.each.call(getSymbols(it), function(key){
    if(getDesc(it, key).enumerable)keys.push(key);
  });
  return keys;
};
},{"./$":22}],15:[function(require,module,exports){
var ctx  = require('./$.ctx')
  , get  = require('./$.iter').get
  , call = require('./$.iter-call');
module.exports = function(iterable, entries, fn, that){
  var iterator = get(iterable)
    , f        = ctx(fn, that, entries ? 2 : 1)
    , step;
  while(!(step = iterator.next()).done){
    if(call(iterator, f, step.value, entries) === false){
      return call.close(iterator);
    }
  }
};
},{"./$.ctx":11,"./$.iter":21,"./$.iter-call":18}],16:[function(require,module,exports){
module.exports = function($){
  $.FW   = true;
  $.path = $.g;
  return $;
};
},{}],17:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
};
},{}],18:[function(require,module,exports){
var assertObject = require('./$.assert').obj;
function close(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)assertObject(ret.call(iterator));
}
function call(iterator, fn, value, entries){
  try {
    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
  } catch(e){
    close(iterator);
    throw e;
  }
}
call.close = close;
module.exports = call;
},{"./$.assert":4}],19:[function(require,module,exports){
var $def            = require('./$.def')
  , $               = require('./$')
  , cof             = require('./$.cof')
  , $iter           = require('./$.iter')
  , SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , FF_ITERATOR     = '@@iterator'
  , KEYS            = 'keys'
  , VALUES          = 'values'
  , Iterators       = $iter.Iterators;
module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
  $iter.create(Constructor, NAME, next);
  function createMethod(kind){
    function $$(that){
      return new Constructor(that, kind);
    }
    switch(kind){
      case KEYS: return function keys(){ return $$(this); };
      case VALUES: return function values(){ return $$(this); };
    } return function entries(){ return $$(this); };
  }
  var TAG      = NAME + ' Iterator'
    , proto    = Base.prototype
    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , _default = _native || createMethod(DEFAULT)
    , methods, key;
  // Fix native
  if(_native){
    var IteratorPrototype = $.getProto(_default.call(new Base));
    // Set @@toStringTag to native iterators
    cof.set(IteratorPrototype, TAG, true);
    // FF fix
    if($.FW && $.has(proto, FF_ITERATOR))$iter.set(IteratorPrototype, $.that);
  }
  // Define iterator
  if($.FW)$iter.set(proto, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG]  = $.that;
  if(DEFAULT){
    methods = {
      keys:    IS_SET            ? _default : createMethod(KEYS),
      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if(FORCE)for(key in methods){
      if(!(key in proto))$.hide(proto, key, methods[key]);
    } else $def($def.P + $def.F * $iter.BUGGY, NAME, methods);
  }
};
},{"./$":22,"./$.cof":6,"./$.def":12,"./$.iter":21,"./$.wks":36}],20:[function(require,module,exports){
var SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , SAFE_CLOSING    = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }
module.exports = function(exec){
  if(!SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[SYMBOL_ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[SYMBOL_ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":36}],21:[function(require,module,exports){
'use strict';
var $                 = require('./$')
  , cof               = require('./$.cof')
  , assertObject      = require('./$.assert').obj
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = {}
  , IteratorPrototype = {};
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}

module.exports = {
  // Safari has buggy iterators w/o `next`
  BUGGY: 'keys' in [] && !('next' in [].keys()),
  Iterators: Iterators,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol
      , SYM    = Symbol && Symbol.iterator || FF_ITERATOR;
    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
  },
  get: function(it){
    var Symbol  = $.g.Symbol
      , ext     = it[Symbol && Symbol.iterator || FF_ITERATOR]
      , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
    return assertObject(getIter.call(it));
  },
  set: setIterator,
  create: function(Constructor, NAME, next, proto){
    Constructor.prototype = $.create(proto || IteratorPrototype, {next: $.desc(1, next)});
    cof.set(Constructor, NAME + ' Iterator');
  }
};
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.wks":36}],22:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value));
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  it: function(it){
    return it;
  },
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  setDescs:   Object.defineProperties,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  assertDefined: assertDefined,
  // Dummy, fix for not array-like ES3 string in es5 module
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  mix: function(target, src){
    for(var key in src)hide(target, key, src[key]);
    return target;
  },
  each: [].forEach
});
/* eslint-disable no-undef */
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":16}],23:[function(require,module,exports){
var $ = require('./$');
module.exports = function(object, el){
  var O      = $.toObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./$":22}],24:[function(require,module,exports){
var $            = require('./$')
  , assertObject = require('./$.assert').obj;
module.exports = function ownKeys(it){
  assertObject(it);
  var keys       = $.getNames(it)
    , getSymbols = $.getSymbols;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"./$":22,"./$.assert":4}],25:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , invoke = require('./$.invoke')
  , assertFunction = require('./$.assert').fn;
module.exports = function(/* ...pargs */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = $.path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !_length)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(_length > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"./$":22,"./$.assert":4,"./$.invoke":17}],26:[function(require,module,exports){
'use strict';
module.exports = function(regExp, replace, isStatic){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  };
};
},{}],27:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var $      = require('./$')
  , assert = require('./$.assert');
function check(O, proto){
  assert.obj(O);
  assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
}
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
    ? function(buggy, set){
        try {
          set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
          set({}, []);
        } catch(e){ buggy = true; }
        return function setPrototypeOf(O, proto){
          check(O, proto);
          if(buggy)O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }()
    : undefined),
  check: check
};
},{"./$":22,"./$.assert":4,"./$.ctx":11}],28:[function(require,module,exports){
var $       = require('./$')
  , SPECIES = require('./$.wks')('species');
module.exports = function(C){
  if($.DESC && !(SPECIES in C))$.setDesc(C, SPECIES, {
    configurable: true,
    get: $.that
  });
};
},{"./$":22,"./$.wks":36}],29:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
var $ = require('./$');
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String($.assertDefined(that))
      , i = $.toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$":22}],30:[function(require,module,exports){
// http://wiki.ecmascript.org/doku.php?id=strawman:string_padding
var $      = require('./$')
  , repeat = require('./$.string-repeat');

module.exports = function(that, minLength, fillChar, left){
  // 1. Let O be CheckObjectCoercible(this value).
  // 2. Let S be ToString(O).
  var S = String($.assertDefined(that));
  // 4. If intMinLength is undefined, return S.
  if(minLength === undefined)return S;
  // 4. Let intMinLength be ToInteger(minLength).
  var intMinLength = $.toInteger(minLength);
  // 5. Let fillLen be the number of characters in S minus intMinLength.
  var fillLen = intMinLength - S.length;
  // 6. If fillLen < 0, then throw a RangeError exception.
  // 7. If fillLen is +∞, then throw a RangeError exception.
  if(fillLen < 0 || fillLen === Infinity){
    throw new RangeError('Cannot satisfy string length ' + minLength + ' for string: ' + S);
  }
  // 8. Let sFillStr be the string represented by fillStr.
  // 9. If sFillStr is undefined, let sFillStr be a space character.
  var sFillStr = fillChar === undefined ? ' ' : String(fillChar);
  // 10. Let sFillVal be a String made of sFillStr, repeated until fillLen is met.
  var sFillVal = repeat.call(sFillStr, Math.ceil(fillLen / sFillStr.length));
  // truncate if we overflowed
  if(sFillVal.length > fillLen)sFillVal = left
    ? sFillVal.slice(sFillVal.length - fillLen)
    : sFillVal.slice(0, fillLen);
  // 11. Return a string made from sFillVal, followed by S.
  // 11. Return a String made from S, followed by sFillVal.
  return left ? sFillVal.concat(S) : S.concat(sFillVal);
};
},{"./$":22,"./$.string-repeat":31}],31:[function(require,module,exports){
'use strict';
var $ = require('./$');

module.exports = function repeat(count){
  var str = String($.assertDefined(this))
    , res = ''
    , n   = $.toInteger(count);
  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
  return res;
};
},{"./$":22}],32:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , cof    = require('./$.cof')
  , invoke = require('./$.invoke')
  , cel    = require('./$.dom-create')
  , global             = $.g
  , isFunction         = $.isFunction
  , html               = $.html
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , postMessage        = global.postMessage
  , addEventListener   = global.addEventListener
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if($.has(queue, id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!isFunction(setTask) || !isFunction(clearTask)){
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(cof(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    };
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$":22,"./$.cof":6,"./$.ctx":11,"./$.dom-create":13,"./$.invoke":17}],33:[function(require,module,exports){
module.exports = function(exec){
  try {
    exec();
    return false;
  } catch(e){
    return true;
  }
};
},{}],34:[function(require,module,exports){
var sid = 0;
function uid(key){
  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":22}],35:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var $           = require('./$')
  , UNSCOPABLES = require('./$.wks')('unscopables');
if($.FW && !(UNSCOPABLES in []))$.hide(Array.prototype, UNSCOPABLES, {});
module.exports = function(key){
  if($.FW)[][UNSCOPABLES][key] = true;
};
},{"./$":22,"./$.wks":36}],36:[function(require,module,exports){
var global = require('./$').g
  , store  = {};
module.exports = function(name){
  return store[name] || (store[name] =
    global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};
},{"./$":22,"./$.uid":34}],37:[function(require,module,exports){
var $                = require('./$')
  , cel              = require('./$.dom-create')
  , cof              = require('./$.cof')
  , $def             = require('./$.def')
  , invoke           = require('./$.invoke')
  , arrayMethod      = require('./$.array-methods')
  , IE_PROTO         = require('./$.uid').safe('__proto__')
  , assert           = require('./$.assert')
  , assertObject     = assert.obj
  , ObjectProto      = Object.prototype
  , A                = []
  , slice            = A.slice
  , indexOf          = A.indexOf
  , classof          = cof.classof
  , has              = $.has
  , defineProperty   = $.setDesc
  , getOwnDescriptor = $.getDesc
  , defineProperties = $.setDescs
  , isFunction       = $.isFunction
  , toObject         = $.toObject
  , toLength         = $.toLength
  , IE8_DOM_DEFINE   = false
  , $indexOf         = require('./$.array-includes')(false)
  , $forEach         = arrayMethod(0)
  , $map             = arrayMethod(1)
  , $filter          = arrayMethod(2)
  , $some            = arrayMethod(3)
  , $every           = arrayMethod(4);

if(!$.DESC){
  try {
    IE8_DOM_DEFINE = defineProperty(cel('div'), 'x',
      {get: function(){ return 8; }}
    ).x == 8;
  } catch(e){ /* empty */ }
  $.setDesc = function(O, P, Attributes){
    if(IE8_DOM_DEFINE)try {
      return defineProperty(O, P, Attributes);
    } catch(e){ /* empty */ }
    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
    if('value' in Attributes)assertObject(O)[P] = Attributes.value;
    return O;
  };
  $.getDesc = function(O, P){
    if(IE8_DOM_DEFINE)try {
      return getOwnDescriptor(O, P);
    } catch(e){ /* empty */ }
    if(has(O, P))return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
  };
  $.setDescs = defineProperties = function(O, Properties){
    assertObject(O);
    var keys   = $.getKeys(Properties)
      , length = keys.length
      , i = 0
      , P;
    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
    return O;
  };
}
$def($def.S + $def.F * !$.DESC, 'Object', {
  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $.getDesc,
  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  defineProperty: $.setDesc,
  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
  defineProperties: defineProperties
});

  // IE 8- don't enum bug keys
var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' +
            'toLocaleString,toString,valueOf').split(',')
  // Additional keys for getOwnPropertyNames
  , keys2 = keys1.concat('length', 'prototype')
  , keysLen1 = keys1.length;

// Create object with `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = cel('iframe')
    , i      = keysLen1
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  $.html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict.prototype[keys1[i]];
  return createDict();
};
function createGetKeys(names, length){
  return function(object){
    var O      = toObject(object)
      , i      = 0
      , result = []
      , key;
    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while(length > i)if(has(O, key = names[i++])){
      ~indexOf.call(result, key) || result.push(key);
    }
    return result;
  };
}
function isPrimitive(it){ return !$.isObject(it); }
function Empty(){}
$def($def.S, 'Object', {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  getPrototypeOf: $.getProto = $.getProto || function(O){
    O = Object(assert.def(O));
    if(has(O, IE_PROTO))return O[IE_PROTO];
    if(isFunction(O.constructor) && O instanceof O.constructor){
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  },
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  create: $.create = $.create || function(O, /*?*/Properties){
    var result;
    if(O !== null){
      Empty.prototype = assertObject(O);
      result = new Empty();
      Empty.prototype = null;
      // add "__proto__" for Object.getPrototypeOf shim
      result[IE_PROTO] = O;
    } else result = createDict();
    return Properties === undefined ? result : defineProperties(result, Properties);
  },
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
  seal: $.it, // <- cap
  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
  freeze: $.it, // <- cap
  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
  preventExtensions: $.it, // <- cap
  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
  isSealed: isPrimitive, // <- cap
  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
  isFrozen: isPrimitive, // <- cap
  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
  isExtensible: $.isObject // <- cap
});

// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
$def($def.P, 'Function', {
  bind: function(that /*, args... */){
    var fn       = assert.fn(this)
      , partArgs = slice.call(arguments, 1);
    function bound(/* args... */){
      var args = partArgs.concat(slice.call(arguments));
      return invoke(fn, args, this instanceof bound ? $.create(fn.prototype) : that);
    }
    if(fn.prototype)bound.prototype = fn.prototype;
    return bound;
  }
});

// Fix for not array-like ES3 string
function arrayMethodFix(fn){
  return function(){
    return fn.apply($.ES5Object(this), arguments);
  };
}
if(!(0 in Object('z') && 'z'[0] == 'z')){
  $.ES5Object = function(it){
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
}
$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
  slice: arrayMethodFix(slice),
  join: arrayMethodFix(A.join)
});

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
$def($def.S, 'Array', {
  isArray: function(arg){
    return cof(arg) == 'Array';
  }
});
function createArrayReduce(isRight){
  return function(callbackfn, memo){
    assert.fn(callbackfn);
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = isRight ? length - 1 : 0
      , i      = isRight ? -1 : 1;
    if(arguments.length < 2)for(;;){
      if(index in O){
        memo = O[index];
        index += i;
        break;
      }
      index += i;
      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
    }
    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
      memo = callbackfn(memo, O[index], index, this);
    }
    return memo;
  };
}
$def($def.P, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: $.each = $.each || function forEach(callbackfn/*, that = undefined */){
    return $forEach(this, callbackfn, arguments[1]);
  },
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn/*, that = undefined */){
    return $map(this, callbackfn, arguments[1]);
  },
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn/*, that = undefined */){
    return $filter(this, callbackfn, arguments[1]);
  },
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn/*, that = undefined */){
    return $some(this, callbackfn, arguments[1]);
  },
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn/*, that = undefined */){
    return $every(this, callbackfn, arguments[1]);
  },
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: createArrayReduce(false),
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: createArrayReduce(true),
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: indexOf = indexOf || function indexOf(el /*, fromIndex = 0 */){
    return $indexOf(this, el, arguments[1]);
  },
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function(el, fromIndex /* = @[*-1] */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, $.toInteger(fromIndex));
    if(index < 0)index = toLength(length + index);
    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
    return -1;
  }
});

// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
$def($def.P, 'String', {trim: require('./$.replacer')(/^\s*([\s\S]*\S)?\s*$/, '$1')});

// 20.3.3.1 / 15.9.4.4 Date.now()
$def($def.S, 'Date', {now: function(){
  return +new Date;
}});

function lz(num){
  return num > 9 ? num : '0' + num;
}

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
// PhantomJS and old webkit had a broken Date implementation.
var date       = new Date(-5e13 - 1)
  , brokenDate = !(date.toISOString && date.toISOString() == '0385-07-25T07:06:39.999Z'
      && require('./$.throws')(function(){ new Date(NaN).toISOString(); }));
$def($def.P + $def.F * brokenDate, 'Date', {toISOString: function(){
  if(!isFinite(this))throw RangeError('Invalid time value');
  var d = this
    , y = d.getUTCFullYear()
    , m = d.getUTCMilliseconds()
    , s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
}});

if(classof(function(){ return arguments; }()) == 'Object')cof.classof = function(it){
  var tag = classof(it);
  return tag == 'Object' && isFunction(it.callee) ? 'Arguments' : tag;
};
},{"./$":22,"./$.array-includes":2,"./$.array-methods":3,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.dom-create":13,"./$.invoke":17,"./$.replacer":26,"./$.throws":33,"./$.uid":34}],38:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  copyWithin: function copyWithin(target/* = 0 */, start /* = 0, end = @length */){
    var O     = Object($.assertDefined(this))
      , len   = $.toLength(O.length)
      , to    = toIndex(target, len)
      , from  = toIndex(start, len)
      , end   = arguments[2]
      , fin   = end === undefined ? len : toIndex(end, len)
      , count = Math.min(fin - from, len - to)
      , inc   = 1;
    if(from < to && to < from + count){
      inc  = -1;
      from = from + count - 1;
      to   = to   + count - 1;
    }
    while(count-- > 0){
      if(from in O)O[to] = O[from];
      else delete O[to];
      to   += inc;
      from += inc;
    } return O;
  }
});
require('./$.unscope')('copyWithin');
},{"./$":22,"./$.def":12,"./$.unscope":35}],39:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  fill: function fill(value /*, start = 0, end = @length */){
    var O      = Object($.assertDefined(this))
      , length = $.toLength(O.length)
      , index  = toIndex(arguments[1], length)
      , end    = arguments[2]
      , endPos = end === undefined ? length : toIndex(end, length);
    while(endPos > index)O[index++] = value;
    return O;
  }
});
require('./$.unscope')('fill');
},{"./$":22,"./$.def":12,"./$.unscope":35}],40:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var KEY    = 'findIndex'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(6);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":3,"./$.def":12,"./$.unscope":35}],41:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var KEY    = 'find'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(5);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  find: function find(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":3,"./$.def":12,"./$.unscope":35}],42:[function(require,module,exports){
var $     = require('./$')
  , ctx   = require('./$.ctx')
  , $def  = require('./$.def')
  , $iter = require('./$.iter')
  , call  = require('./$.iter-call');
$def($def.S + $def.F * !require('./$.iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = Object($.assertDefined(arrayLike))
      , mapfn   = arguments[1]
      , mapping = mapfn !== undefined
      , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
      , index   = 0
      , length, result, step, iterator;
    if($iter.is(O)){
      iterator = $iter.get(O);
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result   = new (typeof this == 'function' ? this : Array);
      for(; !(step = iterator.next()).done; index++){
        result[index] = mapping ? call(iterator, f, [step.value, index], true) : step.value;
      }
    } else {
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
      for(; length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});
},{"./$":22,"./$.ctx":11,"./$.def":12,"./$.iter":21,"./$.iter-call":18,"./$.iter-detect":20}],43:[function(require,module,exports){
var $          = require('./$')
  , setUnscope = require('./$.unscope')
  , ITER       = require('./$.uid').safe('iter')
  , $iter      = require('./$.iter')
  , step       = $iter.step
  , Iterators  = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , kind  = iter.k
    , index = iter.i++;
  if(!O || index >= O.length){
    iter.o = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$":22,"./$.iter":21,"./$.iter-define":19,"./$.uid":34,"./$.unscope":35}],44:[function(require,module,exports){
var $def = require('./$.def');
$def($def.S, 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */){
    var index  = 0
      , length = arguments.length
      // strange IE quirks mode bug -> use typeof instead of isFunction
      , result = new (typeof this == 'function' ? this : Array)(length);
    while(length > index)result[index] = arguments[index++];
    result.length = length;
    return result;
  }
});
},{"./$.def":12}],45:[function(require,module,exports){
require('./$.species')(Array);
},{"./$.species":28}],46:[function(require,module,exports){
var $             = require('./$')
  , HAS_INSTANCE  = require('./$.wks')('hasInstance')
  , FunctionProto = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if(!(HAS_INSTANCE in FunctionProto))$.setDesc(FunctionProto, HAS_INSTANCE, {value: function(O){
  if(!$.isFunction(this) || !$.isObject(O))return false;
  if(!$.isObject(this.prototype))return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while(O = $.getProto(O))if(this.prototype === O)return true;
  return false;
}});
},{"./$":22,"./$.wks":36}],47:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , NAME = 'name'
  , setDesc = $.setDesc
  , FunctionProto = Function.prototype;
// 19.2.4.2 name
NAME in FunctionProto || $.FW && $.DESC && setDesc(FunctionProto, NAME, {
  configurable: true,
  get: function(){
    var match = String(this).match(/^\s*function ([^ (]*)/)
      , name  = match ? match[1] : '';
    $.has(this, NAME) || setDesc(this, NAME, $.desc(5, name));
    return name;
  },
  set: function(value){
    $.has(this, NAME) || setDesc(this, NAME, $.desc(0, value));
  }
});
},{"./$":22}],48:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.1 Map Objects
require('./$.collection')('Map', {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./$.collection":10,"./$.collection-strong":7}],49:[function(require,module,exports){
var Infinity = 1 / 0
  , $def  = require('./$.def')
  , E     = Math.E
  , pow   = Math.pow
  , abs   = Math.abs
  , exp   = Math.exp
  , log   = Math.log
  , sqrt  = Math.sqrt
  , ceil  = Math.ceil
  , floor = Math.floor
  , EPSILON   = pow(2, -52)
  , EPSILON32 = pow(2, -23)
  , MAX32     = pow(2, 127) * (2 - EPSILON32)
  , MIN32     = pow(2, -126);
function roundTiesToEven(n){
  return n + 1 / EPSILON - 1 / EPSILON;
}

// 20.2.2.28 Math.sign(x)
function sign(x){
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
}
// 20.2.2.5 Math.asinh(x)
function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
}
// 20.2.2.14 Math.expm1(x)
function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
}

$def($def.S, 'Math', {
  // 20.2.2.3 Math.acosh(x)
  acosh: function acosh(x){
    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  },
  // 20.2.2.5 Math.asinh(x)
  asinh: asinh,
  // 20.2.2.7 Math.atanh(x)
  atanh: function atanh(x){
    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
  },
  // 20.2.2.9 Math.cbrt(x)
  cbrt: function cbrt(x){
    return sign(x = +x) * pow(abs(x), 1 / 3);
  },
  // 20.2.2.11 Math.clz32(x)
  clz32: function clz32(x){
    return (x >>>= 0) ? 31 - floor(log(x + 0.5) * Math.LOG2E) : 32;
  },
  // 20.2.2.12 Math.cosh(x)
  cosh: function cosh(x){
    return (exp(x = +x) + exp(-x)) / 2;
  },
  // 20.2.2.14 Math.expm1(x)
  expm1: expm1,
  // 20.2.2.16 Math.fround(x)
  fround: function fround(x){
    var $abs  = abs(x)
      , $sign = sign(x)
      , a, result;
    if($abs < MIN32)return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if(result > MAX32 || result != result)return $sign * Infinity;
    return $sign * result;
  },
  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
  hypot: function hypot(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , len1 = arguments.length
      , len2 = len1
      , args = Array(len1)
      , larg = -Infinity
      , arg;
    while(len1--){
      arg = args[len1] = +arguments[len1];
      if(arg == Infinity || arg == -Infinity)return Infinity;
      if(arg > larg)larg = arg;
    }
    larg = arg || 1;
    while(len2--)sum += pow(args[len2] / larg, 2);
    return larg * sqrt(sum);
  },
  // 20.2.2.18 Math.imul(x, y)
  imul: function imul(x, y){
    var UInt16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UInt16 & xn
      , yl = UInt16 & yn;
    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
  },
  // 20.2.2.20 Math.log1p(x)
  log1p: function log1p(x){
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
  },
  // 20.2.2.21 Math.log10(x)
  log10: function log10(x){
    return log(x) / Math.LN10;
  },
  // 20.2.2.22 Math.log2(x)
  log2: function log2(x){
    return log(x) / Math.LN2;
  },
  // 20.2.2.28 Math.sign(x)
  sign: sign,
  // 20.2.2.30 Math.sinh(x)
  sinh: function sinh(x){
    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  },
  // 20.2.2.33 Math.tanh(x)
  tanh: function tanh(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  },
  // 20.2.2.34 Math.trunc(x)
  trunc: function trunc(it){
    return (it > 0 ? floor : ceil)(it);
  }
});
},{"./$.def":12}],50:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , isObject   = $.isObject
  , isFunction = $.isFunction
  , NUMBER     = 'Number'
  , $Number    = $.g[NUMBER]
  , Base       = $Number
  , proto      = $Number.prototype;
function toPrimitive(it){
  var fn, val;
  if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
  if(isFunction(fn = it.toString) && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to number");
}
function toNumber(it){
  if(isObject(it))it = toPrimitive(it);
  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
    var binary = false;
    switch(it.charCodeAt(1)){
      case 66 : case 98  : binary = true;
      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
    }
  } return +it;
}
if($.FW && !($Number('0o1') && $Number('0b1'))){
  $Number = function Number(it){
    return this instanceof $Number ? new Base(toNumber(it)) : toNumber(it);
  };
  $.each.call($.DESC ? $.getNames(Base) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6 (in case, if modules with ES6 Number statics required before):
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ).split(','), function(key){
      if($.has(Base, key) && !$.has($Number, key)){
        $.setDesc($Number, key, $.getDesc(Base, key));
      }
    }
  );
  $Number.prototype = proto;
  proto.constructor = $Number;
  $.hide($.g, NUMBER, $Number);
}
},{"./$":22}],51:[function(require,module,exports){
var $     = require('./$')
  , $def  = require('./$.def')
  , abs   = Math.abs
  , floor = Math.floor
  , _isFinite = $.g.isFinite
  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991;
function isInteger(it){
  return !$.isObject(it) && _isFinite(it) && floor(it) === it;
}
$def($def.S, 'Number', {
  // 20.1.2.1 Number.EPSILON
  EPSILON: Math.pow(2, -52),
  // 20.1.2.2 Number.isFinite(number)
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  },
  // 20.1.2.3 Number.isInteger(number)
  isInteger: isInteger,
  // 20.1.2.4 Number.isNaN(number)
  isNaN: function isNaN(number){
    return number != number;
  },
  // 20.1.2.5 Number.isSafeInteger(number)
  isSafeInteger: function isSafeInteger(number){
    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
  },
  // 20.1.2.6 Number.MAX_SAFE_INTEGER
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  // 20.1.2.10 Number.MIN_SAFE_INTEGER
  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
  // 20.1.2.12 Number.parseFloat(string)
  parseFloat: parseFloat,
  // 20.1.2.13 Number.parseInt(string, radix)
  parseInt: parseInt
});
},{"./$":22,"./$.def":12}],52:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":5,"./$.def":12}],53:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $def = require('./$.def');
$def($def.S, 'Object', {
  is: function is(x, y){
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }
});
},{"./$.def":12}],54:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def = require('./$.def');
$def($def.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.def":12,"./$.set-proto":27}],55:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
function wrapObjectMethod(METHOD, MODE){
  var fn  = ($.core.Object || {})[METHOD] || Object[METHOD]
    , f   = 0
    , o   = {};
  o[METHOD] = MODE == 1 ? function(it){
    return isObject(it) ? fn(it) : it;
  } : MODE == 2 ? function(it){
    return isObject(it) ? fn(it) : true;
  } : MODE == 3 ? function(it){
    return isObject(it) ? fn(it) : false;
  } : MODE == 4 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : MODE == 5 ? function getPrototypeOf(it){
    return fn(Object($.assertDefined(it)));
  } : function(it){
    return fn(toObject(it));
  };
  try {
    fn('z');
  } catch(e){
    f = 1;
  }
  $def($def.S + $def.F * f, 'Object', o);
}
wrapObjectMethod('freeze', 1);
wrapObjectMethod('seal', 1);
wrapObjectMethod('preventExtensions', 1);
wrapObjectMethod('isFrozen', 2);
wrapObjectMethod('isSealed', 2);
wrapObjectMethod('isExtensible', 3);
wrapObjectMethod('getOwnPropertyDescriptor', 4);
wrapObjectMethod('getPrototypeOf', 5);
wrapObjectMethod('keys');
wrapObjectMethod('getOwnPropertyNames');
},{"./$":22,"./$.def":12}],56:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var $   = require('./$')
  , cof = require('./$.cof')
  , tmp = {};
tmp[require('./$.wks')('toStringTag')] = 'z';
if($.FW && cof(tmp) != 'z')$.hide(Object.prototype, 'toString', function toString(){
  return '[object ' + cof.classof(this) + ']';
});
},{"./$":22,"./$.cof":6,"./$.wks":36}],57:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , setProto = require('./$.set-proto').set
  , species  = require('./$.species')
  , SPECIES  = require('./$.wks')('species')
  , RECORD   = require('./$.uid').safe('record')
  , PROMISE  = 'Promise'
  , global   = $.g
  , process  = global.process
  , asap     = process && process.nextTick || require('./$.task').set
  , P        = global[PROMISE]
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj;

var useNative = function(){
  var test, works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = isFunction(P) && isFunction(P.resolve) && P.resolve(test = new P(function(){})) == test;
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
function getConstructor(C){
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
function isThenable(it){
  var then;
  if(isObject(it))then = it.then;
  return isFunction(then) ? then : false;
}
function notify(record){
  var chain = record.c;
  if(chain.length)asap(function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    function run(react){
      var cb = ok ? react.ok : react.fail
        , ret, then;
      try {
        if(cb){
          if(!ok)record.h = true;
          ret = cb === true ? value : cb(value);
          if(ret === react.P){
            react.rej(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(ret)){
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch(err){
        react.rej(err);
      }
    }
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
  });
}
function isUnhandled(promise){
  var record = promise[RECORD]
    , chain  = record.a || record.c
    , i      = 0
    , react;
  if(record.h)return false;
  while(chain.length > i){
    react = chain[i++];
    if(react.fail || !isUnhandled(react.P))return false;
  } return true;
}
function $reject(value){
  var record = this
    , promise;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  setTimeout(function(){
    asap(function(){
      if(isUnhandled(promise = record.p)){
        if(cof(process) == 'process'){
          process.emit('unhandledRejection', value, promise);
        } else if(global.console && isFunction(console.error)){
          console.error('Unhandled promise rejection', value);
        }
      }
      record.a = undefined;
    });
  }, 1);
  notify(record);
}
function $resolve(value){
  var record = this
    , then, wrapper;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(then = isThenable(value)){
      wrapper = {r: record, d: false}; // wrap
      then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
    } else {
      record.v = value;
      record.s = 1;
      notify(record);
    }
  } catch(err){
    $reject.call(wrapper || {r: record, d: false}, err); // wrap
  }
}

// constructor polyfill
if(!useNative){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, P, PROMISE),       // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  $.mix(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function(res, rej){
        react.res = assertFunction(res);
        react.rej = assertFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      if(record.a)record.a.push(react);
      record.s && notify(record);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
cof.set(P, PROMISE);
species(P);
species($.core[PROMISE]); // for wrapper

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    return new (getConstructor(this))(function(res, rej){
      rej(r);
    });
  },
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    return isObject(x) && RECORD in x && $.getProto(x) === this.prototype
      ? x : new (getConstructor(this))(function(res){
        res(x);
      });
  }
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(res, rej){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });
      else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C = getConstructor(this);
    return new C(function(res, rej){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(res, rej);
      });
    });
  }
});
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.ctx":11,"./$.def":12,"./$.for-of":15,"./$.iter-detect":20,"./$.set-proto":27,"./$.species":28,"./$.task":32,"./$.uid":34,"./$.wks":36}],58:[function(require,module,exports){
var $         = require('./$')
  , $def      = require('./$.def')
  , setProto  = require('./$.set-proto')
  , $iter     = require('./$.iter')
  , ITERATOR  = require('./$.wks')('iterator')
  , ITER      = require('./$.uid').safe('iter')
  , step      = $iter.step
  , assert    = require('./$.assert')
  , isObject  = $.isObject
  , getProto  = $.getProto
  , $Reflect  = $.g.Reflect
  , _apply    = Function.apply
  , assertObject = assert.obj
  , _isExtensible = Object.isExtensible || $.isObject
  , _preventExtensions = Object.preventExtensions || $.it
  // IE TP has broken Reflect.enumerate
  , buggyEnumerate = !($Reflect && $Reflect.enumerate && ITERATOR in $Reflect.enumerate({}));

function Enumerate(iterated){
  $.set(this, ITER, {o: iterated, k: undefined, i: 0});
}
$iter.create(Enumerate, 'Object', function(){
  var iter = this[ITER]
    , keys = iter.k
    , key;
  if(keys == undefined){
    iter.k = keys = [];
    for(key in iter.o)keys.push(key);
  }
  do {
    if(iter.i >= keys.length)return step(1);
  } while(!((key = keys[iter.i++]) in iter.o));
  return step(0, key);
});

var reflect = {
  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
  apply: function apply(target, thisArgument, argumentsList){
    return _apply.call(target, thisArgument, argumentsList);
  },
  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
  construct: function construct(target, argumentsList /*, newTarget*/){
    var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
      , instance = $.create(isObject(proto) ? proto : Object.prototype)
      , result   = _apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  },
  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
  defineProperty: function defineProperty(target, propertyKey, attributes){
    assertObject(target);
    try {
      $.setDesc(target, propertyKey, attributes);
      return true;
    } catch(e){
      return false;
    }
  },
  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = $.getDesc(assertObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  },
  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
  get: function get(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = $.getDesc(assertObject(target), propertyKey), proto;
    if(desc)return $.has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return isObject(proto = getProto(target))
      ? get(proto, propertyKey, receiver)
      : undefined;
  },
  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
    return $.getDesc(assertObject(target), propertyKey);
  },
  // 26.1.8 Reflect.getPrototypeOf(target)
  getPrototypeOf: function getPrototypeOf(target){
    return getProto(assertObject(target));
  },
  // 26.1.9 Reflect.has(target, propertyKey)
  has: function has(target, propertyKey){
    return propertyKey in target;
  },
  // 26.1.10 Reflect.isExtensible(target)
  isExtensible: function isExtensible(target){
    return _isExtensible(assertObject(target));
  },
  // 26.1.11 Reflect.ownKeys(target)
  ownKeys: require('./$.own-keys'),
  // 26.1.12 Reflect.preventExtensions(target)
  preventExtensions: function preventExtensions(target){
    assertObject(target);
    try {
      _preventExtensions(target);
      return true;
    } catch(e){
      return false;
    }
  },
  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
  set: function set(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , ownDesc  = $.getDesc(assertObject(target), propertyKey)
      , existingDescriptor, proto;
    if(!ownDesc){
      if(isObject(proto = getProto(target))){
        return set(proto, propertyKey, V, receiver);
      }
      ownDesc = $.desc(0);
    }
    if($.has(ownDesc, 'value')){
      if(ownDesc.writable === false || !isObject(receiver))return false;
      existingDescriptor = $.getDesc(receiver, propertyKey) || $.desc(0);
      existingDescriptor.value = V;
      $.setDesc(receiver, propertyKey, existingDescriptor);
      return true;
    }
    return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
  }
};
// 26.1.14 Reflect.setPrototypeOf(target, proto)
if(setProto)reflect.setPrototypeOf = function setPrototypeOf(target, proto){
  setProto.check(target, proto);
  try {
    setProto.set(target, proto);
    return true;
  } catch(e){
    return false;
  }
};

$def($def.G, {Reflect: {}});

$def($def.S + $def.F * buggyEnumerate, 'Reflect', {
  // 26.1.5 Reflect.enumerate(target)
  enumerate: function enumerate(target){
    return new Enumerate(assertObject(target));
  }
});

$def($def.S, 'Reflect', reflect);
},{"./$":22,"./$.assert":4,"./$.def":12,"./$.iter":21,"./$.own-keys":24,"./$.set-proto":27,"./$.uid":34,"./$.wks":36}],59:[function(require,module,exports){
var $       = require('./$')
  , cof     = require('./$.cof')
  , $RegExp = $.g.RegExp
  , Base    = $RegExp
  , proto   = $RegExp.prototype
  , re      = /a/g
  // "new" creates a new object
  , CORRECT_NEW = new $RegExp(re) !== re
  // RegExp allows a regex with flags as the pattern
  , ALLOWS_RE_WITH_FLAGS = function(){
    try {
      return $RegExp(re, 'i') == '/a/i';
    } catch(e){ /* empty */ }
  }();
if($.FW && $.DESC){
  if(!CORRECT_NEW || !ALLOWS_RE_WITH_FLAGS){
    $RegExp = function RegExp(pattern, flags){
      var patternIsRegExp  = cof(pattern) == 'RegExp'
        , flagsIsUndefined = flags === undefined;
      if(!(this instanceof $RegExp) && patternIsRegExp && flagsIsUndefined)return pattern;
      return CORRECT_NEW
        ? new Base(patternIsRegExp && !flagsIsUndefined ? pattern.source : pattern, flags)
        : new Base(patternIsRegExp ? pattern.source : pattern
          , patternIsRegExp && flagsIsUndefined ? pattern.flags : flags);
    };
    $.each.call($.getNames(Base), function(key){
      key in $RegExp || $.setDesc($RegExp, key, {
        configurable: true,
        get: function(){ return Base[key]; },
        set: function(it){ Base[key] = it; }
      });
    });
    proto.constructor = $RegExp;
    $RegExp.prototype = proto;
    $.hide($.g, 'RegExp', $RegExp);
  }
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
    configurable: true,
    get: require('./$.replacer')(/^.*\/(\w*)$/, '$1')
  });
}
require('./$.species')($RegExp);
},{"./$":22,"./$.cof":6,"./$.replacer":26,"./$.species":28}],60:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./$.collection":10,"./$.collection-strong":7}],61:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(false);
$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos){
    return $at(this, pos);
  }
});
},{"./$.def":12,"./$.string-at":29}],62:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def')
  , toLength = $.toLength;

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.endsWith(/./); }), 'String', {
  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
  endsWith: function endsWith(searchString /*, endPosition = @length */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that = String($.assertDefined(this))
      , endPosition = arguments[1]
      , len = toLength(that.length)
      , end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    searchString += '';
    return that.slice(end - searchString.length, end) === searchString;
  }
});
},{"./$":22,"./$.cof":6,"./$.def":12,"./$.throws":33}],63:[function(require,module,exports){
var $def    = require('./$.def')
  , toIndex = require('./$').toIndex
  , fromCharCode = String.fromCharCode
  , $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$def($def.S + $def.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x){ // eslint-disable-line no-unused-vars
    var res = []
      , len = arguments.length
      , i   = 0
      , code;
    while(len > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"./$":22,"./$.def":12}],64:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
  includes: function includes(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    return !!~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
  }
});
},{"./$":22,"./$.cof":6,"./$.def":12}],65:[function(require,module,exports){
var set   = require('./$').set
  , $at   = require('./$.string-at')(true)
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return step(1);
  point = $at(O, index);
  iter.i += point.length;
  return step(0, point);
});
},{"./$":22,"./$.iter":21,"./$.iter-define":19,"./$.string-at":29,"./$.uid":34}],66:[function(require,module,exports){
var $    = require('./$')
  , $def = require('./$.def');

$def($def.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite){
    var tpl = $.toObject(callSite.raw)
      , len = $.toLength(tpl.length)
      , sln = arguments.length
      , res = []
      , i   = 0;
    while(len > i){
      res.push(String(tpl[i++]));
      if(i < sln)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"./$":22,"./$.def":12}],67:[function(require,module,exports){
var $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./$.string-repeat')
});
},{"./$.def":12,"./$.string-repeat":31}],68:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.startsWith(/./); }), 'String', {
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function startsWith(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that  = String($.assertDefined(this))
      , index = $.toLength(Math.min(arguments[1], that.length));
    searchString += '';
    return that.slice(index, index + searchString.length) === searchString;
  }
});
},{"./$":22,"./$.cof":6,"./$.def":12,"./$.throws":33}],69:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $        = require('./$')
  , setTag   = require('./$.cof').set
  , uid      = require('./$.uid')
  , $def     = require('./$.def')
  , keyOf    = require('./$.keyof')
  , enumKeys = require('./$.enum-keys')
  , assertObject = require('./$.assert').obj
  , has      = $.has
  , $create  = $.create
  , getDesc  = $.getDesc
  , setDesc  = $.setDesc
  , desc     = $.desc
  , getNames = $.getNames
  , toObject = $.toObject
  , $Symbol  = $.g.Symbol
  , setter   = false
  , TAG      = uid('tag')
  , HIDDEN   = uid('hidden')
  , SymbolRegistry = {}
  , AllSymbols = {}
  , useNative = $.isFunction($Symbol);

function wrap(tag){
  var sym = AllSymbols[tag] = $.set($create($Symbol.prototype), TAG, tag);
  $.DESC && setter && setDesc(Object.prototype, tag, {
    configurable: true,
    set: function(value){
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setDesc(this, tag, desc(1, value));
    }
  });
  return sym;
}

function defineProperty(it, key, D){
  if(D && has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))setDesc(it, HIDDEN, desc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D.enumerable = false;
    }
  } return setDesc(it, key, D);
}
function defineProperties(it, P){
  assertObject(it);
  var keys = enumKeys(P = toObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)defineProperty(it, key = keys[i++], P[key]);
  return it;
}
function create(it, P){
  return P === undefined ? $create(it) : defineProperties($create(it), P);
}
function getOwnPropertyDescriptor(it, key){
  var D = getDesc(it = toObject(it), key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
}
function getOwnPropertyNames(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
  return result;
}
function getOwnPropertySymbols(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
}

// 19.4.1.1 Symbol([description])
if(!useNative){
  $Symbol = function Symbol(description){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor');
    return wrap(uid(description));
  };
  $.hide($Symbol.prototype, 'toString', function(){
    return this[TAG];
  });

  $.create     = create;
  $.setDesc    = defineProperty;
  $.getDesc    = getOwnPropertyDescriptor;
  $.setDescs   = defineProperties;
  $.getNames   = getOwnPropertyNames;
  $.getSymbols = getOwnPropertySymbols;
}

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
    'species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), function(it){
    var sym = require('./$.wks')(it);
    symbolStatics[it] = useNative ? sym : wrap(sym);
  }
);

setter = true;

$def($def.G + $def.W, {Symbol: $Symbol});

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * !useNative, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: getOwnPropertySymbols
});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag($.g.JSON, 'JSON', true);
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.enum-keys":14,"./$.keyof":23,"./$.uid":34,"./$.wks":36}],70:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , weak      = require('./$.collection-weak')
  , leakStore = weak.leakStore
  , ID        = weak.ID
  , WEAK      = weak.WEAK
  , has       = $.has
  , isObject  = $.isObject
  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
  , tmp       = {};

// 23.3 WeakMap Objects
var WeakMap = require('./$.collection')('WeakMap', {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      if(isFrozen(key))return leakStore(this).get(key);
      if(has(key, WEAK))return key[WEAK][this[ID]];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
}, weak, true, true);

// IE11 WeakMap frozen keys fix
if($.FW && new WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  $.each.call(['delete', 'has', 'get', 'set'], function(key){
    var method = WeakMap.prototype[key];
    WeakMap.prototype[key] = function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && isFrozen(a)){
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    };
  });
}
},{"./$":22,"./$.collection":10,"./$.collection-weak":9}],71:[function(require,module,exports){
'use strict';
var weak = require('./$.collection-weak');

// 23.4 WeakSet Objects
require('./$.collection')('WeakSet', {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"./$.collection":10,"./$.collection-weak":9}],72:[function(require,module,exports){
// https://github.com/domenic/Array.prototype.includes
var $def      = require('./$.def')
  , $includes = require('./$.array-includes')(true);
$def($def.P, 'Array', {
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments[1]);
  }
});
require('./$.unscope')('includes');
},{"./$.array-includes":2,"./$.def":12,"./$.unscope":35}],73:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Map');
},{"./$.collection-to-json":8}],74:[function(require,module,exports){
// https://gist.github.com/WebReflection/9353781
var $       = require('./$')
  , $def    = require('./$.def')
  , ownKeys = require('./$.own-keys');

$def($def.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
    var O      = $.toObject(object)
      , result = {};
    $.each.call(ownKeys(O), function(key){
      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
    });
    return result;
  }
});
},{"./$":22,"./$.def":12,"./$.own-keys":24}],75:[function(require,module,exports){
// http://goo.gl/XkBrjD
var $    = require('./$')
  , $def = require('./$.def');
function createObjectToArray(isEntries){
  return function(object){
    var O      = $.toObject(object)
      , keys   = $.getKeys(O)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
    else while(length > i)result[i] = O[keys[i++]];
    return result;
  };
}
$def($def.S, 'Object', {
  values:  createObjectToArray(false),
  entries: createObjectToArray(true)
});
},{"./$":22,"./$.def":12}],76:[function(require,module,exports){
// https://gist.github.com/kangax/9698100
var $def = require('./$.def');
$def($def.S, 'RegExp', {
  escape: require('./$.replacer')(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
});
},{"./$.def":12,"./$.replacer":26}],77:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Set');
},{"./$.collection-to-json":8}],78:[function(require,module,exports){
// https://github.com/mathiasbynens/String.prototype.at
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(true);
$def($def.P, 'String', {
  at: function at(pos){
    return $at(this, pos);
  }
});
},{"./$.def":12,"./$.string-at":29}],79:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  lpad: function lpad(n){
    return $pad(this, n, arguments[1], true);
  }
});
},{"./$.def":12,"./$.string-pad":30}],80:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  rpad: function rpad(n){
    return $pad(this, n, arguments[1], false);
  }
});
},{"./$.def":12,"./$.string-pad":30}],81:[function(require,module,exports){
// JavaScript 1.6 / Strawman array statics shim
var $       = require('./$')
  , $def    = require('./$.def')
  , $Array  = $.core.Array || Array
  , statics = {};
function setStatics(keys, length){
  $.each.call(keys.split(','), function(key){
    if(length == undefined && key in $Array)statics[key] = $Array[key];
    else if(key in [])statics[key] = require('./$.ctx')(Function.call, [][key], length);
  });
}
setStatics('pop,reverse,shift,keys,values,entries', 1);
setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
           'reduce,reduceRight,copyWithin,fill,turn');
$def($def.S, 'Array', statics);
},{"./$":22,"./$.ctx":11,"./$.def":12}],82:[function(require,module,exports){
require('./es6.array.iterator');
var $           = require('./$')
  , Iterators   = require('./$.iter').Iterators
  , ITERATOR    = require('./$.wks')('iterator')
  , ArrayValues = Iterators.Array
  , NodeList    = $.g.NodeList;
if($.FW && NodeList && !(ITERATOR in NodeList.prototype)){
  $.hide(NodeList.prototype, ITERATOR, ArrayValues);
}
Iterators.NodeList = ArrayValues;
},{"./$":22,"./$.iter":21,"./$.wks":36,"./es6.array.iterator":43}],83:[function(require,module,exports){
var $def  = require('./$.def')
  , $task = require('./$.task');
$def($def.G + $def.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./$.def":12,"./$.task":32}],84:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var $         = require('./$')
  , $def      = require('./$.def')
  , invoke    = require('./$.invoke')
  , partial   = require('./$.partial')
  , navigator = $.g.navigator
  , MSIE      = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
function wrap(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      $.isFunction(fn) ? fn : Function(fn)
    ), time);
  } : set;
}
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout:  wrap($.g.setTimeout),
  setInterval: wrap($.g.setInterval)
});
},{"./$":22,"./$.def":12,"./$.invoke":17,"./$.partial":25}],85:[function(require,module,exports){
require('./modules/es5');
require('./modules/es6.symbol');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.object.statics-accept-primitives');
require('./modules/es6.function.name');
require('./modules/es6.function.has-instance');
require('./modules/es6.number.constructor');
require('./modules/es6.number.statics');
require('./modules/es6.math');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.iterator');
require('./modules/es6.array.species');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.regexp');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.reflect');
require('./modules/es7.array.includes');
require('./modules/es7.string.at');
require('./modules/es7.string.lpad');
require('./modules/es7.string.rpad');
require('./modules/es7.regexp.escape');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.to-array');
require('./modules/es7.map.to-json');
require('./modules/es7.set.to-json');
require('./modules/js.array.statics');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/$').core;

},{"./modules/$":22,"./modules/es5":37,"./modules/es6.array.copy-within":38,"./modules/es6.array.fill":39,"./modules/es6.array.find":41,"./modules/es6.array.find-index":40,"./modules/es6.array.from":42,"./modules/es6.array.iterator":43,"./modules/es6.array.of":44,"./modules/es6.array.species":45,"./modules/es6.function.has-instance":46,"./modules/es6.function.name":47,"./modules/es6.map":48,"./modules/es6.math":49,"./modules/es6.number.constructor":50,"./modules/es6.number.statics":51,"./modules/es6.object.assign":52,"./modules/es6.object.is":53,"./modules/es6.object.set-prototype-of":54,"./modules/es6.object.statics-accept-primitives":55,"./modules/es6.object.to-string":56,"./modules/es6.promise":57,"./modules/es6.reflect":58,"./modules/es6.regexp":59,"./modules/es6.set":60,"./modules/es6.string.code-point-at":61,"./modules/es6.string.ends-with":62,"./modules/es6.string.from-code-point":63,"./modules/es6.string.includes":64,"./modules/es6.string.iterator":65,"./modules/es6.string.raw":66,"./modules/es6.string.repeat":67,"./modules/es6.string.starts-with":68,"./modules/es6.symbol":69,"./modules/es6.weak-map":70,"./modules/es6.weak-set":71,"./modules/es7.array.includes":72,"./modules/es7.map.to-json":73,"./modules/es7.object.get-own-property-descriptors":74,"./modules/es7.object.to-array":75,"./modules/es7.regexp.escape":76,"./modules/es7.set.to-json":77,"./modules/es7.string.at":78,"./modules/es7.string.lpad":79,"./modules/es7.string.rpad":80,"./modules/js.array.statics":81,"./modules/web.dom.iterable":82,"./modules/web.immediate":83,"./modules/web.timers":84}],86:[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);

    generator._invoke = makeInvokeMethod(
      innerFn, self || null,
      new Context(tryLocsList || [])
    );

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    return new Promise(function(resolve, reject) {
      var generator = wrap(innerFn, outerFn, self, tryLocsList);
      var callNext = step.bind(generator, "next");
      var callThrow = step.bind(generator, "throw");

      function step(method, arg) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
          return;
        }

        var info = record.arg;
        if (info.done) {
          resolve(info.value);
        } else {
          Promise.resolve(info.value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  function defineGeneratorMethod(method) {
    Gp[method] = function(arg) {
      return this._invoke(method, arg);
    };
  }
  defineGeneratorMethod("next");
  defineGeneratorMethod("throw");
  defineGeneratorMethod("return");

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          return this.complete(entry.completion, entry.afterLoc);
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],87:[function(require,module,exports){
module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":1}],88:[function(require,module,exports){
module.exports = require("babel-core/polyfill");

},{"babel-core/polyfill":87}],89:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Curves = FamousPlatform.transitions.Curves;
var Famous = FamousPlatform.core.Famous;
var Transitionable = FamousPlatform.transitions.Transitionable;

var Timeline = (function () {
  function Timeline() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Timeline);

    this.pathSet = [];
    this.timescale = options.timescale || 1;
    this.currentTime = new Transitionable(0);
  }

  _createClass(Timeline, [{
    key: "registerPath",

    /*
          pathData = {
            handler : function(value) {
              console.log(value);
            },
            path : [
              [0, [0, 0, 0]],
              [5000, [100, 100, 100]]
            ]
          }
    */

    value: function registerPath(pathData) {
      this.pathSet.push(pathData);
    }
  }, {
    key: "set",
    value: function set(time, transition, callback) {
      var _this = this;

      if (transition) {
        this.inTransition = true;
        Famous.requestUpdateOnNextTick(this);
        this.currentTime.set(time, transition, function () {
          _this.inTransition = false;
          Famous.requestUpdateOnNextTick(_this);
          if (callback) {
            callback();
          }
        });
      } else {
        this.currentTime.set(time);
        this.inTransition = false;
        Famous.requestUpdateOnNextTick(this);
      }
    }
  }, {
    key: "onUpdate",
    value: function onUpdate(time) {
      //go through the pathSet, and basically execute the function

      time = this.currentTime.get() * this.timescale;

      for (var i = 0; i < this.pathSet.length; i++) {
        var res = [];
        var pathData = this.pathSet[i];

        for (var j = 0; j < pathData.path.length; j++) {
          var _res = [];
          var currStep = pathData.path[j];
          var nextStep = pathData.path[j + 1];

          //currently mid path, calculate and apply.
          if (nextStep && currStep[0] <= time && nextStep[0] >= time) {
            var percentDone = (time - currStep[0]) / (nextStep[0] - currStep[0]);
            var state = currStep[2] ? currStep[2](percentDone) : Curves.linear(percentDone);

            if (currStep[1] instanceof Array) {
              for (var k = 0; k < currStep[1].length; k++) {
                _res[k] = currStep[1][k] + (nextStep[1][k] - currStep[1][k]) * state;
              }
            } else {
              _res = currStep[1] + (nextStep[1] - currStep[1]) * state;
            }
            pathData.handler(_res);
          }

          //we are passed last step, set object to final state.
          if (!nextStep && currStep[0] < time) {
            pathData.handler(currStep[1]);
          }
        }
      }

      if (this.inTransition) {
        Famous.requestUpdateOnNextTick(this);
      }
    }
  }]);

  return Timeline;
})();

exports["default"] = Timeline;
module.exports = exports["default"];

},{}],90:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Base class which contains all modifiers and contains no visual components.
 */

var Align = FamousPlatform.components.Align;
var MountPoint = FamousPlatform.components.MountPoint;
var Opacity = FamousPlatform.components.Opacity;
var Origin = FamousPlatform.components.Origin;
var Position = FamousPlatform.components.Position;
var Rotation = FamousPlatform.components.Rotation;
var Scale = FamousPlatform.components.Scale;
var Size = FamousPlatform.components.Size;

var Modifier = (function () {
  function Modifier(node) {
    _classCallCheck(this, Modifier);

    this.node = node;
  }

  _createClass(Modifier, [{
    key: "addChild",
    value: function addChild() {
      return this.node.addChild();
    }
  }, {
    key: "validateAlign",

    // ---------------------------------------------------------------------------
    // helpers for align
    value: function validateAlign() {
      if (!this.align) this.align = new Align(this.node);
    }
  }, {
    key: "haltAlign",
    value: function haltAlign() {
      this.validateAlign();
      this.align.halt();
      return this;
    }
  }, {
    key: "getAlignValue",

    // Align getters
    value: function getAlignValue() {
      this.validateAlign();
      return this.align.getValue();
    }
  }, {
    key: "getAlignX",
    value: function getAlignX() {
      this.validateAlign();
      return this.align.getX();
    }
  }, {
    key: "getAlignY",
    value: function getAlignY() {
      this.validateAlign();
      return this.align.getY();
    }
  }, {
    key: "getAlignZ",
    value: function getAlignZ() {
      this.validateAlign();
      return this.align.getZ();
    }
  }, {
    key: "setAlignValue",

    // Align setters
    value: function setAlignValue() {
      var _align;

      this.validateAlign();
      (_align = this.align).setValue.apply(_align, arguments);
      return this;
    }
  }, {
    key: "setAlign",
    value: function setAlign() {
      var _align2;

      this.validateAlign();
      (_align2 = this.align).set.apply(_align2, arguments);
      return this;
    }
  }, {
    key: "setAlignX",
    value: function setAlignX() {
      var _align3;

      this.validateAlign();
      (_align3 = this.align).setX.apply(_align3, arguments);
      return this;
    }
  }, {
    key: "setAlignY",
    value: function setAlignY() {
      var _align4;

      this.validateAlign();
      (_align4 = this.align).setY.apply(_align4, arguments);
      return this;
    }
  }, {
    key: "setAlignZ",
    value: function setAlignZ() {
      var _align5;

      this.validateAlign();
      (_align5 = this.align).setZ.apply(_align5, arguments);
      return this;
    }
  }, {
    key: "validateMountPoint",

    // ---------------------------------------------------------------------------
    // helpers for mount point
    value: function validateMountPoint() {
      if (!this.mountpoint) this.mountpoint = new MountPoint(this.node);
    }
  }, {
    key: "haltMountPoint",
    value: function haltMountPoint() {
      this.validateMountPoint();
      this.mountpoint.halt();
      return this;
    }
  }, {
    key: "getMountPointValue",

    // MountPoint getters
    value: function getMountPointValue() {
      this.validateMountPoint();
      return this.mountpoint.getValue();
    }
  }, {
    key: "getMountPointX",
    value: function getMountPointX() {
      this.validateMountPoint();
      return this.mountpoint.getX();
    }
  }, {
    key: "getMountPointY",
    value: function getMountPointY() {
      this.validateMountPoint();
      return this.mountpoint.getY();
    }
  }, {
    key: "getMountPointZ",
    value: function getMountPointZ() {
      this.validateMountPoint();
      return this.mountpoint.getZ();
    }
  }, {
    key: "setMountPointValue",

    // MountPoint setters
    value: function setMountPointValue() {
      var _mountpoint;

      this.validateMountPoint();
      (_mountpoint = this.mountpoint).setValue.apply(_mountpoint, arguments);
      return this;
    }
  }, {
    key: "setMountPoint",
    value: function setMountPoint() {
      var _mountpoint2;

      this.validateMountPoint();
      (_mountpoint2 = this.mountpoint).set.apply(_mountpoint2, arguments);
      return this;
    }
  }, {
    key: "setMountPointX",
    value: function setMountPointX() {
      var _mountpoint3;

      this.validateMountPoint();
      (_mountpoint3 = this.mountpoint).setX.apply(_mountpoint3, arguments);
      return this;
    }
  }, {
    key: "setMountPointY",
    value: function setMountPointY() {
      var _mountpoint4;

      this.validateMountPoint();
      (_mountpoint4 = this.mountpoint).setY.apply(_mountpoint4, arguments);
      return this;
    }
  }, {
    key: "setMountPointZ",
    value: function setMountPointZ() {
      var _mountpoint5;

      this.validateMountPoint();
      (_mountpoint5 = this.mountpoint).setZ.apply(_mountpoint5, arguments);
      return this;
    }
  }, {
    key: "validateOpacity",

    // ---------------------------------------------------------------------------
    // helpers for opacity
    value: function validateOpacity() {
      if (!this.opacity) this.opacity = new Opacity(this.node);
    }
  }, {
    key: "haltOpacity",
    value: function haltOpacity() {
      this.validateOpacity();
      this.opacity.halt();
      return this;
    }
  }, {
    key: "getOpacityValue",

    // Opacity getters
    value: function getOpacityValue() {
      this.validateOpacity();
      return this.opacity.getValue();
    }
  }, {
    key: "getOpacity",
    value: function getOpacity() {
      this.validateOpacity();
      return this.opacity.get();
    }
  }, {
    key: "setOpacityValue",

    // Opacity setters
    value: function setOpacityValue() {
      var _opacity;

      this.validateOpacity();
      (_opacity = this.opacity).setValue.apply(_opacity, arguments);
      return this;
    }
  }, {
    key: "setOpacity",
    value: function setOpacity() {
      var _opacity2;

      this.validateOpacity();
      (_opacity2 = this.opacity).set.apply(_opacity2, arguments);
      return this;
    }
  }, {
    key: "validateOrigin",

    // ---------------------------------------------------------------------------
    // helpers for origin
    value: function validateOrigin() {
      if (!this.origin) this.origin = new Origin(this.node);
    }
  }, {
    key: "haltOrigin",
    value: function haltOrigin() {
      this.validateOrigin();
      this.origin.halt();
      return this;
    }
  }, {
    key: "getOriginValue",

    // Origin getters
    value: function getOriginValue() {
      this.validateOrigin();
      return this.origin.getValue();
    }
  }, {
    key: "getOriginX",
    value: function getOriginX() {
      this.validateOrigin();
      return this.origin.getX();
    }
  }, {
    key: "getOriginY",
    value: function getOriginY() {
      this.validateOrigin();
      return this.origin.getY();
    }
  }, {
    key: "getOriginZ",
    value: function getOriginZ() {
      this.validateOrigin();
      return this.origin.getZ();
    }
  }, {
    key: "setOriginValue",

    // Origin setters
    value: function setOriginValue() {
      var _origin;

      this.validateOrigin();
      (_origin = this.origin).setValue.apply(_origin, arguments);
      return this;
    }
  }, {
    key: "setOrigin",
    value: function setOrigin() {
      var _origin2;

      this.validateOrigin();
      (_origin2 = this.origin).set.apply(_origin2, arguments);
      return this;
    }
  }, {
    key: "setOriginX",
    value: function setOriginX() {
      var _origin3;

      this.validateOrigin();
      (_origin3 = this.origin).setX.apply(_origin3, arguments);
      return this;
    }
  }, {
    key: "setOriginY",
    value: function setOriginY() {
      var _origin4;

      this.validateOrigin();
      (_origin4 = this.origin).setY.apply(_origin4, arguments);
      return this;
    }
  }, {
    key: "setOriginZ",
    value: function setOriginZ() {
      var _origin5;

      this.validateOrigin();
      (_origin5 = this.origin).setZ.apply(_origin5, arguments);
      return this;
    }
  }, {
    key: "validatePosition",

    // ---------------------------------------------------------------------------
    // helpers for position
    value: function validatePosition() {
      if (!this.position) this.position = new Position(this.node);
    }
  }, {
    key: "haltPosition",
    value: function haltPosition() {
      this.validatePosition();
      this.position.halt();
      return this;
    }
  }, {
    key: "getPositionValue",

    // Position getters
    value: function getPositionValue() {
      this.validatePosition();
      return this.position.getValue();
    }
  }, {
    key: "getPositionX",
    value: function getPositionX() {
      this.validatePosition();
      return this.position.getX();
    }
  }, {
    key: "getPositionY",
    value: function getPositionY() {
      this.validatePosition();
      return this.position.getY();
    }
  }, {
    key: "getPositionZ",
    value: function getPositionZ() {
      this.validatePosition();
      return this.position.getZ();
    }
  }, {
    key: "setPositionValue",

    // Position setters
    value: function setPositionValue() {
      var _position;

      this.validatePosition();
      (_position = this.position).setValue.apply(_position, arguments);
      return this;
    }
  }, {
    key: "setPosition",
    value: function setPosition() {
      var _position2;

      this.validatePosition();
      (_position2 = this.position).set.apply(_position2, arguments);
      return this;
    }
  }, {
    key: "setPositionX",
    value: function setPositionX() {
      var _position3;

      this.validatePosition();
      (_position3 = this.position).setX.apply(_position3, arguments);
      return this;
    }
  }, {
    key: "setPositionY",
    value: function setPositionY() {
      var _position4;

      this.validatePosition();
      (_position4 = this.position).setY.apply(_position4, arguments);
      return this;
    }
  }, {
    key: "setPositionZ",
    value: function setPositionZ() {
      var _position5;

      this.validatePosition();
      (_position5 = this.position).setZ.apply(_position5, arguments);
      return this;
    }
  }, {
    key: "validateRotation",

    // ---------------------------------------------------------------------------
    // helpers for rotation
    value: function validateRotation() {
      if (!this.rotation) this.rotation = new Rotation(this.node);
    }
  }, {
    key: "haltRotation",
    value: function haltRotation() {
      this.validateRotation();
      this.rotation.halt();
      return this;
    }
  }, {
    key: "getRotationValue",

    // Rotation getters
    value: function getRotationValue() {
      this.validateRotation();
      return this.rotation.getValue();
    }
  }, {
    key: "getRotationX",
    value: function getRotationX() {
      this.validateRotation();
      return this.rotation.getX();
    }
  }, {
    key: "getRotationY",
    value: function getRotationY() {
      this.validateRotation();
      return this.rotation.getY();
    }
  }, {
    key: "getRotationZ",
    value: function getRotationZ() {
      this.validateRotation();
      return this.rotation.getZ();
    }
  }, {
    key: "setRotationValue",

    // Rotation setters
    value: function setRotationValue() {
      var _rotation;

      this.validateRotation();
      (_rotation = this.rotation).setValue.apply(_rotation, arguments);
      return this;
    }
  }, {
    key: "setRotation",
    value: function setRotation() {
      var _rotation2;

      this.validateRotation();
      (_rotation2 = this.rotation).set.apply(_rotation2, arguments);
      return this;
    }
  }, {
    key: "setRotationX",
    value: function setRotationX() {
      var _rotation3;

      this.validateRotation();
      (_rotation3 = this.rotation).setX.apply(_rotation3, arguments);
      return this;
    }
  }, {
    key: "setRotationY",
    value: function setRotationY() {
      var _rotation4;

      this.validateRotation();
      (_rotation4 = this.rotation).setY.apply(_rotation4, arguments);
      return this;
    }
  }, {
    key: "setRotationZ",
    value: function setRotationZ() {
      var _rotation5;

      this.validateRotation();
      (_rotation5 = this.rotation).setZ.apply(_rotation5, arguments);
      return this;
    }
  }, {
    key: "validateScale",

    // ---------------------------------------------------------------------------
    // helpers for scale
    value: function validateScale() {
      if (!this.scale) this.scale = new Scale(this.node);
    }
  }, {
    key: "haltScale",
    value: function haltScale() {
      this.validateScale();
      this.scale.halt();
      return this;
    }
  }, {
    key: "getScaleValue",

    // Scale getters
    value: function getScaleValue() {
      this.validateScale();
      return this.scale.getValue();
    }
  }, {
    key: "getScaleX",
    value: function getScaleX() {
      this.validateScale();
      return this.scale.getX();
    }
  }, {
    key: "getScaleY",
    value: function getScaleY() {
      this.validateScale();
      return this.scale.getY();
    }
  }, {
    key: "getScaleZ",
    value: function getScaleZ() {
      this.validateScale();
      return this.scale.getZ();
    }
  }, {
    key: "setScaleValue",

    // Scale setters
    value: function setScaleValue() {
      var _scale;

      this.validateScale();
      (_scale = this.scale).setValue.apply(_scale, arguments);
      return this;
    }
  }, {
    key: "setScale",
    value: function setScale() {
      var _scale2;

      if (window.miketest) debugger;
      this.validateScale();
      (_scale2 = this.scale).set.apply(_scale2, arguments);
      return this;
    }
  }, {
    key: "setScaleX",
    value: function setScaleX() {
      var _scale3;

      this.validateScale();
      (_scale3 = this.scale).setX.apply(_scale3, arguments);
      return this;
    }
  }, {
    key: "setScaleY",
    value: function setScaleY() {
      var _scale4;

      this.validateScale();
      (_scale4 = this.scale).setY.apply(_scale4, arguments);
      return this;
    }
  }, {
    key: "setScaleZ",
    value: function setScaleZ() {
      var _scale5;

      this.validateScale();
      (_scale5 = this.scale).setZ.apply(_scale5, arguments);
      return this;
    }
  }, {
    key: "validateSize",

    // ---------------------------------------------------------------------------
    // helpers for size
    value: function validateSize() {
      if (!this.size) this.size = new Size(this.node);
    }
  }, {
    key: "haltSize",
    value: function haltSize() {
      this.validateSize();
      this.size.halt();
      return this;
    }
  }, {
    key: "getSizeValue",

    // Size getters
    value: function getSizeValue() {
      this.validateSize();
      return this.size.getValue();
    }
  }, {
    key: "getSize",
    value: function getSize() {
      this.validateSize();
      return this.size.get();
    }
  }, {
    key: "setSizeValue",

    // Size setters
    value: function setSizeValue() {
      var _size;

      this.validateSize();
      (_size = this.size).setValue.apply(_size, arguments);
      return this;
    }
  }, {
    key: "setDifferentialSize",
    value: function setDifferentialSize() {
      var _size2;

      this.validateSize();
      (_size2 = this.size).setDifferential.apply(_size2, arguments);
      return this;
    }
  }, {
    key: "setProportionalSize",
    value: function setProportionalSize() {
      var _size3;

      this.validateSize();
      (_size3 = this.size).setProportional.apply(_size3, arguments);
      return this;
    }
  }, {
    key: "setAbsoluteSize",
    value: function setAbsoluteSize() {
      var _size4;

      this.validateSize();
      (_size4 = this.size).setAbsolute.apply(_size4, arguments);
      return this;
    }
  }, {
    key: "setSizeMode",
    value: function setSizeMode(x, y, z) {
      this.node.setSizeMode(x, y, z);
      return this;
    }
  }, {
    key: "setSizeModeAbsolute",
    value: function setSizeModeAbsolute() {
      this.node.setSizeMode(Size.ABSOLUTE, Size.ABSOLUTE, Size.ABSOLUTE);
      return this;
    }
  }, {
    key: "setSizeModeRelative",
    value: function setSizeModeRelative() {
      this.node.setSizeMode(Size.RELATIVE, Size.RELATIVE, Size.RELATIVE);
      return this;
    }
  }, {
    key: "setSizeModeRender",
    value: function setSizeModeRender() {
      this.node.setSizeMode(Size.RENDER, Size.RENDER, Size.RENDER);
      return this;
    }
  }], [{
    key: "RELATIVE_SIZE",

    // ---------------------------------------------------------------------------
    // helpers for Size enums
    get: function () {
      return Size.RELATIVE;
    }
  }, {
    key: "ABSOLUTE_SIZE",
    get: function () {
      return Size.ABSOLUTE;
    }
  }, {
    key: "RENDER_SIZE",
    get: function () {
      return Size.RENDER;
    }
  }, {
    key: "DEFAULT_SIZE",
    get: function () {
      return Size.DEFAULT;
    }
  }]);

  return Modifier;
})();

exports["default"] = Modifier;
module.exports = exports["default"];

},{}],91:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/**
 * View class that extends Modifier and should be used for visual elements.
 */

var _Modifier2 = require('./Modifier');

var _Modifier3 = _interopRequireDefault(_Modifier2);

var DOMElement = FamousPlatform.domRenderables.DOMElement;
var EventEmitter = FamousPlatform.components.EventEmitter;
var EventHandler = FamousPlatform.components.EventHandler;
var Mesh = FamousPlatform.webglRenderables.Mesh;
var Node = FamousPlatform.core.Node;
var PointLight = FamousPlatform.webglRenderables.PointLight;

var EventMap = [
// UI Events (http://www.w3.org/TR/uievents/)
'abort', 'beforeinput', 'blur', 'click', 'compositionend', 'compositionstart', 'compositionupdate', 'dblclick', 'focus', 'focusin', 'focusout', 'input', 'keydown', 'keyup', 'load', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll', 'select', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'unload', 'wheel'];

var View = (function (_Modifier) {
  function View(node, options) {
    _classCallCheck(this, View);

    _get(Object.getPrototypeOf(View.prototype), 'constructor', this).call(this, node);
    this.options = options;
  }

  _inherits(View, _Modifier);

  _createClass(View, [{
    key: 'validateDOM',

    //HTML STUFF
    value: function validateDOM(options) {
      var _this2 = this;

      if (!this.el) {
        this._events = {};
        this.el = new DOMElement(this.node, options);
        this.el.onReceive = function (event, payload) {
          if (_this2._events[event]) {
            _this2._events[event](payload);
          }
        };
      }
    }
  }, {
    key: 'createDOMElement',
    value: function createDOMElement(options) {
      this.validateDOM(options);
      return this;
    }
  }, {
    key: 'setDOMContent',
    value: function setDOMContent(content) {
      this.validateDOM();
      this.el.setContent(content);
      return this;
    }
  }, {
    key: 'setDOMClasses',
    value: function setDOMClasses(classes) {
      this.validateDOM();
      for (var i = 0; i < classes.length; i++) {
        this.el.addClass(classes[i]);
      }
      return this;
    }
  }, {
    key: 'setDOMAttributes',
    value: function setDOMAttributes(attributes) {
      this.validateDOM();
      for (var attrName in attributes) {
        this.el.setAttribute(attrName, attributes[attrName]);
      }
      return this;
    }
  }, {
    key: 'setDOMProperties',
    value: function setDOMProperties(properties) {
      this.validateDOM();
      for (var propertyName in properties) {
        this.el.setProperty(propertyName, properties[propertyName]);
      }
      return this;
    }
  }, {
    key: 'on',

    //dom events
    value: function on(evName, fn) {
      if (EventMap.indexOf(evName) > -1) {
        //dom Event
        this.validateDOM();
        this.node.addUIEvent(evName);
        this._events[evName] = fn;
      } else {
        if (!this.eventHandler) this.eventHandler = new EventHandler(this.node);
        this.eventHandler.on(evName, fn);
      }
      return this;
    }
  }, {
    key: 'emit',

    //events between views!
    value: function emit(ev, payload) {
      if (!this.eventEmitter) this.eventEmitter = new EventEmitter(this.node);
      this.eventEmitter.emit(ev, payload);
    }
  }, {
    key: 'validateMesh',

    //gl stuff
    value: function validateMesh() {
      if (!this.mesh) this.mesh = new Mesh(this.node);
    }
  }, {
    key: 'setGeometry',
    value: function setGeometry(geometry, options) {
      this.validateMesh();
      this.geometry = geometry;
      this.mesh.setGeometry(geometry, options);
      return this;
    }
  }, {
    key: 'setBaseColor',
    value: function setBaseColor(color) {
      this.validateMesh();
      this.mesh.setBaseColor(color);
      return this;
    }
  }]);

  return View;
})(_Modifier3['default']);

exports['default'] = View;
module.exports = exports['default'];

},{"./Modifier":90}],92:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Compositor = FamousPlatform.renderers.Compositor;
var ThreadManager = FamousPlatform.renderers.ThreadManager;
var Engine = FamousPlatform.engine.Engine;
var Famous = FamousPlatform.core.Famous;

var FamousEngineInit = (function () {
  /**
   * Boilerplate code to setup the Famous Engine.
   * @method  constructor
   */

  function FamousEngineInit() {
    _classCallCheck(this, FamousEngineInit);

    this._initialized = false;
  }

  _createClass(FamousEngineInit, [{
    key: "init",
    value: function init() {
      if (this._initialized) return;
      this._initialized = true;
      // TODO: temporary eslint fix until it gets rolled into platform as a default
      /*eslint-disable */
      FamousPlatform.stylesheets;
      /*eslint-enable */

      // Boilerplate
      /*eslint-disable */
      // let compositor = new Compositor();
      // let engine = new Engine();
      // let threadmanger = new ThreadManager(Famous.getChannel(), compositor, engine);
      /*eslint-enable */

      // TODO: temporary fix until we get an update of famous > 20150504 that works
      /*eslint-disable */
      var compositor = new Compositor();
      var threadmanger = new ThreadManager(Famous, compositor);
      var engine = new FamousPlatform.engine();
      engine.update(threadmanger);
      /*eslint-enable */
      // END: temporary fix
    }
  }]);

  return FamousEngineInit;
})();

var FamousEngine = new FamousEngineInit();

exports["default"] = FamousEngine;
module.exports = exports["default"];

},{}],93:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _View2 = require('famous-creative/display/View');

var _View3 = _interopRequireDefault(_View2);

var Curves = FamousPlatform.transitions.Curves;

var Card = (function (_View) {
    function Card(node, options) {
        _classCallCheck(this, Card);

        _get(Object.getPrototypeOf(Card.prototype), 'constructor', this).call(this, node, options);
        this.model = options.model;

        var perspective = 600;
        var zTransform = this.model.i * 350;

        this.setSizeMode(1, 1);
        this.setAbsoluteSize(350, 220);
        this.setMountPoint(0.5, 0);
        this.setAlign(0.5, 0);
        this.setOrigin(0.5, 0.5, 0.5);
        this.setScale(0.5, 0.5, 0.5);
        this.setPosition(-window.innerWidth, 300, zTransform);

        this.createDOMElement({
            properties: {
                'zIndex': zTransform,
                '-webkit-perspective': perspective,
                '-moz-perspective': perspective,
                'perspective': perspective
            }
        });

        // this.addCardBack(); Pulled per Sander
        this.addCardFront();
        this.loadCard();
    }

    _inherits(Card, _View);

    _createClass(Card, [{
        key: 'addCardBack',
        value: function addCardBack() {
            var cardBack = new _View3['default'](this.node.addChild());
            cardBack.setSizeMode(0, 0);
            cardBack.setProportionalSize(1, 1);
            cardBack.createDOMElement({
                tagName: 'img',
                classes: [['card-img-back']],
                properties: {
                    'backface-visibility': 'visible'
                }
            });
            cardBack.setDOMAttributes({
                'src': this.model.back
            });
        }
    }, {
        key: 'addCardFront',
        value: function addCardFront() {
            var cardFront = new _View3['default'](this.node.addChild());
            cardFront.setSizeMode(0, 0);
            cardFront.setProportionalSize(1, 1);
            cardFront.createDOMElement({
                tagName: 'img',
                classes: ['card-img-front'],
                properties: {}
            });
            cardFront.setDOMAttributes({
                'src': this.model.front
            });
        }
    }, {
        key: 'loadCard',
        value: function loadCard() {
            var _this = this;

            this.model.rotation = {
                x: 0,
                y: 0,
                z: 0
            };

            this.model.position = {
                x: 0,
                y: 300,
                z: this.getPositionZ()
            };

            switch (this.model.i) {
                case 0:
                    this.model.rotation.z = -9 * Math.PI / 180;
                    this.model.position.x = 30;
                    this.model.position.y = 250;
                    break;
                case 1:
                    this.model.rotation.z = 0.5 * Math.PI / 180;
                    this.model.position.x = 20;
                    this.model.position.y = 312;
                    break;
                case 2:
                    this.model.rotation.z = 30 * Math.PI / 180;
                    this.model.position.x = -20;
                    this.model.position.y = 355;
                    break;
                case 3:
                    this.model.rotation.z = -23 * Math.PI / 180;
                    this.model.position.x = -30;
                    this.model.position.y = 245;
                    break;
                default:
                    break;
            }

            // I want a slight delay after the app loads
            setTimeout(function () {
                _this.setPositionX(0, {
                    curve: Curves.easeInOut,
                    duration: 650
                }, function () {
                    // I want a slight delay after the animation is done
                    setTimeout(function () {
                        var options = { curve: 'outBack', duration: 500 };
                        _this.setRotationZ(_this.model.rotation.z, options);
                        _this.setPositionX(_this.model.position.x, options);
                        _this.setPositionY(_this.model.position.y, options);
                    }, 75);
                });
            }, 250);
        }
    }]);

    return Card;
})(_View3['default']);

exports.Card = Card;

// 'backface-visibility': 'hidden'

},{"famous-creative/display/View":91}],94:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = {
    COIN_POS: window.innerHeight - 265,
    COIN_CENTER: window.innerHeight - 215
};
module.exports = exports["default"];

},{}],95:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _View2 = require('famous-creative/display/View');

var _View3 = _interopRequireDefault(_View2);

var Curves = FamousPlatform.transitions.Curves;

var Hand = (function (_View) {
    function Hand(node, options) {
        _classCallCheck(this, Hand);

        _get(Object.getPrototypeOf(Hand.prototype), 'constructor', this).call(this, node, options);

        this.setSizeMode(1, 1);
        this.setAbsoluteSize(70, 75);
        this.setPositionY(296);
        this.setPositionZ(3000);
        this.setMountPoint(0.5, 0);
        this.setAlign(0.5, 0);

        this.model = options.model;

        this.createDOMElement({
            tagName: 'img',
            properties: {
                'zIndex': 3000
            }
        });

        this.setDOMAttributes({
            'src': this.model.imgPath
        });

        this.setEvents();
        this.startAnimation();
    }

    _inherits(Hand, _View);

    _createClass(Hand, [{
        key: 'setEvents',
        value: function setEvents() {
            var _this = this;

            this.on('dragging', function (message) {
                if (message === 'start') {
                    _this.stopAnimation();
                }
            });

            this.on('resetApp', function () {
                _this.restartAnimation();
            });
        }
    }, {
        key: 'startAnimation',
        value: function startAnimation() {
            this.isHalted = false;
            this.animateHand();
        }
    }, {
        key: 'stopAnimation',
        value: function stopAnimation() {
            this.isHalted = true;
            this.haltOpacity();
            this.haltPosition();
        }
    }, {
        key: 'restartAnimation',
        value: function restartAnimation() {
            this.isHalted = false;
            this.resetHand();
        }
    }, {
        key: 'animateHand',
        value: function animateHand() {
            if (this.isHalted) {
                return;
            }

            var _this = this;
            var duration = 1200;

            this.setPositionY(196, {
                duration: duration,
                curve: Curves.linear
            }, function () {
                _this.resetHand();
            });

            // Start the opacity half way through the animation
            setTimeout(function () {
                _this.setOpacity(0, {
                    curve: Curves.linear,
                    duration: duration / 2
                });
            }, duration / 2);
        }
    }, {
        key: 'resetHand',
        value: function resetHand() {
            if (this.isHalted) {
                return;
            }

            var _this = this;
            this.setPositionY(296, {
                duration: 0
            }, function () {
                //TODO BUG:  Callbacks are not working correctly
                setTimeout(function () {
                    _this.setOpacity(1, { duration: 100 }, function () {
                        //TODO BUG:  Callbacks are not working correctly
                        // A quick pause after the animation completes
                        setTimeout(function () {
                            _this.animateHand();
                        }, 200);
                    });
                }, 900);
            });
        }
    }]);

    return Hand;
})(_View3['default']);

exports.Hand = Hand;

},{"famous-creative/display/View":91}],96:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var PhysicsEngine = FamousPlatform.physics.PhysicsEngine;

var Physics = {
    _simulation: new PhysicsEngine()
};

Physics.getSimulation = function () {
    return this._simulation;
};

Physics.magnifyForce = function (v) {
    var width = window.innerWidth;
    var ratio = 1;

    if (width < 320) {
        ratio = 1.6;
    } else if (width < 428) {
        ratio = 1.5;
    } else if (width < 768) {
        ratio = 1.15;
    }

    return ratio * v;
};

Physics.dampenForce = function (v) {
    var width = window.innerWidth;
    var ratio = 1;

    if (width < 320) {
        ratio = 0.55;
    } else if (width < 428) {
        ratio = 0.6;
    } else if (width < 768) {
        ratio = 0.85;
    }

    return ratio * v;
};

exports["default"] = Physics;
module.exports = exports["default"];

},{}],97:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ENUMS = require('./Enums');

var _ENUMS2 = _interopRequireDefault(_ENUMS);

var _Physics = require('./PhysicsService');

var _Physics2 = _interopRequireDefault(_Physics);

var _View2 = require('famous-creative/display/View');

var _View3 = _interopRequireDefault(_View2);

//Famous Components
var Famous = FamousPlatform.core.Famous;
var GestureHandler = FamousPlatform.components.GestureHandler;
var Curves = FamousPlatform.transitions.Curves;

//Physics Components
var Sphere = FamousPlatform.physics.Sphere;
var Vec3 = FamousPlatform.math.Vec3;

var Ring = (function (_View) {
    function Ring(node, options) {
        _classCallCheck(this, Ring);

        _get(Object.getPrototypeOf(Ring.prototype), 'constructor', this).call(this, node, options);

        this.model = options || {};
        this.model.ringSize = this._getRingSize();
        this.model.ringColor = this._getRingColor();
        this.model.size = this.model.ringSize * 35;

        //Position
        this.setAlign(0.5, 0);
        this.setMountPoint(0.5, 0.5, 0.5);
        this.setOrigin(0.5, 0.5, 0.5);
        this.setPositionY(200);
        this.setPositionZ(-500);

        // Sizing
        this.setSizeModeAbsolute();
        this.setAbsoluteSize(this.model.size, this.model.size);

        //Display
        this.setOpacity(0);
        this.setScale(0.25, 0.25);
        this.createDOMElement({
            properties: {
                width: '100%',
                height: '100%',
                border: this.model.ringSize + 'px solid ' + this.model.ringColor,
                borderRadius: '50%',
                'z-index': -500
            },
            classes: ['ring']
        });

        //Eventing
        this.setEvents();
        this._initPhysics();
    }

    _inherits(Ring, _View);

    _createClass(Ring, [{
        key: '_getRingColor',
        value: function _getRingColor() {
            var colors = ['#329978', '#0089e0', '#3980a8', '#da695b'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }, {
        key: '_getRingSize',
        value: function _getRingSize() {
            var ringSizes = [1, 2, 3];
            return ringSizes[Math.floor(Math.random() * ringSizes.length)];
        }
    }, {
        key: 'setEvents',
        value: function setEvents() {
            var _this2 = this;

            this.on('risingTide', (function (message) {
                if (!this.hasOwnProperty('hasChanged')) {
                    this.hasChanged = false;
                }

                if (this.hasChanged) {
                    return;
                }

                var yPos = this.getPositionY();
                var size = this.getSize();

                var bottomEdge = yPos + size[1];

                if (bottomEdge > message) {
                    this.hasChanged = true;

                    this.setDOMProperties({
                        borderColor: 'black'
                    });

                    this.setScale(1.05, 1.05, 1.05, {
                        duration: 100
                    }, (function () {
                        this.setScale(0.95, 0.95, 0.95, {
                            duration: 100
                        });
                    }).bind(this));
                }
            }).bind(this));

            this.on('mousedown', function () {
                _this2.pop();
            });

            this.gestures = new GestureHandler(this.node, [{
                event: 'tap',
                callback: function callback(e) {
                    _this2.pop();
                }
            }]);
        }
    }, {
        key: 'activateBlackhole',
        value: function activateBlackhole() {
            this.isBlackholeActive = true;
        }
    }, {
        key: 'activatePhysics',
        value: function activatePhysics() {
            this.isPhysicsActive = true;
        }
    }, {
        key: 'pop',
        value: function pop() {
            var _this3 = this;

            var duration = 75;
            this.isBreathing = false;
            this.haltOpacity();
            this.haltScale();

            this.setOpacity(0, {
                duration: duration * 2
            });

            this.setScale(1.2, 1.2, 1.2, {
                duration: duration
            }, function () {
                _this3.setScale(0, 0, 0, {
                    duration: duration / 2
                }, function () {
                    _this3.isPhysicsActive = false;
                    _this3._recycle();
                });
            });
        }
    }, {
        key: '_initPhysics',
        value: function _initPhysics() {
            var _this4 = this;

            this.world = _Physics2['default'].getSimulation();
            this.isBlackholeActive = false;
            this.isBreathing = true;
            this.isPhysicsActive = false;

            this.scaling = {
                state: Math.random() > 0.5 ? 0 : 1,
                val: 1,
                max: 0.1,
                rate: Math.random() * 0.005
            };

            var updater = {
                onUpdate: function onUpdate(t) {
                    _this4.world.update(t);
                    _this4._update();

                    Famous.requestUpdateOnNextTick(updater);
                }
            };

            Famous.requestUpdateOnNextTick(updater);

            this.sphere = new Sphere({
                mass: 10,
                radius: this.model.size * 0.5,
                position: new Vec3(0, 200, 0)
            });
        }
    }, {
        key: '_update',
        value: function _update() {
            var _this5 = this;

            if (this.isPhysicsActive) {
                var p = this.sphere.getPosition();
                var v = this.sphere.getVelocity();
                var dx = p.x - 0;
                var dy = p.y - 500;

                var distanceFromCenter = Math.sqrt(dx * dx + dy * dy) - this.model.size / 2;
                var blackholeRadius = 30;
                var maxV = 1500;

                if (this.isBlackholeActive && distanceFromCenter < blackholeRadius) {
                    this.emit('spinRing', {});
                    this.isPhysicsActive = false;

                    this.sphere.setVelocity(0, 0, 0);
                    this.setPositionY(_ENUMS2['default'].COIN_CENTER, {
                        curve: Curves.easeOut,
                        duration: 50
                    });
                    this.setPositionX(0, {
                        curves: Curves.linear,
                        duration: 250
                    }, function () {
                        _this5.setScale(0.1, 0.1, 0.1, { duration: 100 }, function () {
                            _this5._recycle();
                        });
                    });
                } else if (p.y > window.innerHeight + 100) {
                    this._recycle();
                } else if (p.y > _ENUMS2['default'].COIN_CENTER + 70 && v.y < 15 && v.x < 15) {
                    // Prevents the hanging bubbles
                    this.pop();
                } else if (v.x > maxV || v.x < -maxV || v.y > maxV || v.y < -maxV) {
                    this.pop();
                } else {
                    this.setPosition(p.x, p.y, p.z);

                    //Breathing
                    if (this.isBreathing) {
                        if (this.scaling.state === 0) {
                            this.scaling.val += this.scaling.rate; //scale in
                        } else {
                            this.scaling.val -= this.scaling.rate; //scale out
                        }

                        if (this.scaling.val >= 1 + this.scaling.max) {
                            this.scaling.state = 1;
                        } else if (this.scaling.val <= 1 - this.scaling.max) {
                            this.scaling.state = 0;
                        }

                        this.haltScale();
                        this.setScale(this.scaling.val, this.scaling.val, this.scaling.val, { duration: 10 });
                    }
                }
            }
        }
    }, {
        key: '_recycle',
        value: function _recycle() {
            var windowHalf = window.innerWidth / 2;
            var xPos = Math.random() * (windowHalf * 2) - windowHalf;
            var yPos = Math.random() * -700 - 200;

            this.sphere.setPosition(xPos, yPos, 0);
            this.sphere.setVelocity(0, 0, 0);
            this.scale.set(1, 1, 1, { duration: 10 });
            this.setOpacity(1);
            this.isPhysicsActive = true;
            this.isBreathing = true;
            this.setDOMProperties({
                'border-color': '#000000'
            });
        }
    }]);

    return Ring;
})(_View3['default']);

exports.Ring = Ring;

},{"./Enums":94,"./PhysicsService":96,"famous-creative/display/View":91}],98:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Physics = require('./PhysicsService');

var _Physics2 = _interopRequireDefault(_Physics);

var _View2 = require('famous-creative/display/View');

var _View3 = _interopRequireDefault(_View2);

//Famous Components
var Famous = FamousPlatform.core.Famous;

//Physics Components
var RotationalDrag = FamousPlatform.physics.RotationalDrag;
var Sphere = FamousPlatform.physics.Sphere;

var SpinningRing = (function (_View) {
    function SpinningRing(node, options) {
        _classCallCheck(this, SpinningRing);

        _get(Object.getPrototypeOf(SpinningRing.prototype), 'constructor', this).call(this, node, options);

        this.model = options || {};

        //Position
        this.setAlign(0.5, 0);
        this.setMountPoint(0.5, 0.5, 0.5);
        this.setOrigin(0.5, 0.5, 0.5);
        this.setPositionY(window.innerHeight * 1.1);

        //Sizing
        if (this.model.i === 0) {
            //Outer ring
            this.model.sizeX = 90;
            this.model.sizeY = 90;
        } else if (this.model.i === 1) {
            //Inner ring
            this.model.sizeX = 78;
            this.model.sizeY = 78;
        }

        this.setSizeModeAbsolute();
        this.setAbsoluteSize(this.model.sizeX, this.model.sizeY);

        //Display
        this.setOpacity(0);
        this.createDOMElement({
            tagName: 'img',
            attributes: {
                'src': this.model.svgPath
            },
            classes: ['spinning-ring']
        });

        //Eventing
        this.setEvents();
        this._initPhysics();
    }

    _inherits(SpinningRing, _View);

    _createClass(SpinningRing, [{
        key: 'setEvents',
        value: function setEvents() {
            var _this2 = this;

            this.on('spinRing', function () {
                var opacity = _this2.getOpacity();
                if (opacity !== 1) {
                    _this2.setOpacity(1, {
                        duration: 200
                    });
                }

                _this2.spinRing();
            });
        }
    }, {
        key: 'spinRing',
        value: function spinRing() {
            //TODO Allow rotational args to be passed
            if (this.model.i === 0) {
                this.sphere.setAngularVelocity(5, 15, 10);
            } else if (this.model.i === 1) {
                this.sphere.setAngularVelocity(25, 10, 15);
            }
        }
    }, {
        key: '_initPhysics',
        value: function _initPhysics() {
            var _this3 = this;

            this.world = _Physics2['default'].getSimulation();

            var updater = {
                onUpdate: function onUpdate(t) {
                    _this3.world.update(t);
                    _this3._update();

                    Famous.requestUpdateOnNextTick(updater);
                }
            };

            Famous.requestUpdateOnNextTick(updater);

            this.sphere = new Sphere({
                mass: 100,
                radius: this.model.sizeX * 0.5
            });

            //A behavior that slows angular velocity by applying torque.
            this.rotationalDrag = new RotationalDrag([this.sphere], {
                max: 50000,
                strength: 500000
            });

            this.world.add([this.sphere, this.rotationalDrag]);
        }
    }, {
        key: '_update',
        value: function _update() {
            var v = this.sphere.getAngularVelocity();
            var q = this.sphere.getOrientation(); //Returns a quaternion

            if (v.x < 1 && v.y < 1 && v.z < 1) {
                this.setRotation(0, 0, 0, {
                    duration: 2000
                });
            } else {
                var rotation = {};
                q.toEuler(rotation);
                this.setRotation(rotation.x, rotation.y, rotation.z);
            }
        }
    }]);

    return SpinningRing;
})(_View3['default']);

exports.SpinningRing = SpinningRing;

},{"./PhysicsService":96,"famous-creative/display/View":91}],99:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _View6 = require('famous-creative/display/View');

var _View7 = _interopRequireDefault(_View6);

var TopText = (function (_View) {
    function TopText(node, options) {
        _classCallCheck(this, TopText);

        _get(Object.getPrototypeOf(TopText.prototype), 'constructor', this).call(this, node, options);

        this.createDOMElement({
            properties: {
                'font-size': '60px',
                'text-align': 'center',
                'font-weight': '200'
            },
            content: 'Try<br>simple'
        });

        this.setSizeMode(0, 1);
        this.setProportionalSize(1, null);
        this.setAbsoluteSize(null, 200);
        this.setOpacity(1);
        this.setPositionY(33);
    }

    _inherits(TopText, _View);

    return TopText;
})(_View7['default']);

exports.TopText = TopText;

var TagLine = (function (_View2) {
    function TagLine(node, options) {
        _classCallCheck(this, TagLine);

        _get(Object.getPrototypeOf(TagLine.prototype), 'constructor', this).call(this, node, options);

        this.createDOMElement({
            properties: {
                'font-size': '50px',
                'text-align': 'center',
                'line-height': '1em',
                'color': '#FFFFFF'
            },
            content: 'All your cards<br><strong>one coin</strong>'
        });

        this.setSizeMode(0, 1);
        this.setProportionalSize(1, null);
        this.setAbsoluteSize(null, 100);
        this.setOpacity(1);
        this.setPositionY(-100);
    }

    _inherits(TagLine, _View2);

    return TagLine;
})(_View7['default']);

exports.TagLine = TagLine;

var Coin = (function (_View3) {
    function Coin(node, options) {
        _classCallCheck(this, Coin);

        _get(Object.getPrototypeOf(Coin.prototype), 'constructor', this).call(this, node, options);

        this.createDOMElement({
            properties: {
                'font-size': '48px',
                'text-align': 'center',
                'line-height': '1em',
                'color': '#000000'
            },
            content: 'coin'
        });

        this.setSizeMode(0, 1);
        this.setProportionalSize(1, null);
        this.setAbsoluteSize(null, 50);
        this.setOpacity(1);
        this.setPositionY(window.innerHeight * 1.3);
    }

    _inherits(Coin, _View3);

    return Coin;
})(_View7['default']);

exports.Coin = Coin;

var GetYours = (function (_View4) {
    function GetYours(node, options) {
        _classCallCheck(this, GetYours);

        _get(Object.getPrototypeOf(GetYours.prototype), 'constructor', this).call(this, node, options);

        this.createDOMElement({
            properties: {
                'font-size': '42px',
                'text-align': 'center',
                'line-height': '1em',
                'color': '#FFFFFF'
            },
            content: 'Get yours first'
        });

        this.setSizeMode(0, 1);
        this.setProportionalSize(1, null);
        this.setAbsoluteSize(null, 50);
        this.setOpacity(1);
        this.setPositionY(window.innerHeight * 1.4);
    }

    _inherits(GetYours, _View4);

    return GetYours;
})(_View7['default']);

exports.GetYours = GetYours;

var PreOrder = (function (_View5) {
    function PreOrder(node, options) {
        _classCallCheck(this, PreOrder);

        _get(Object.getPrototypeOf(PreOrder.prototype), 'constructor', this).call(this, node, options);

        this.createDOMElement({
            properties: {
                'background-color': '#000000',
                'border-radius': '4px',
                'color': '#FFFFFF',
                'font-size': '22px',
                'font-weight': '700',
                'line-height': '40px',
                'overflow': 'hidden',
                'text-align': 'center',
                'text-transform': 'uppercase'
            },
            content: 'Pre-order now',
            classes: ['txt-preorder']
        });

        this.setAlign(0.5, 0);
        this.setMountPoint(0.5, 0);
        this.setOpacity(1);
        this.setSizeModeAbsolute();
        this.setAbsoluteSize(220, 40);
        this.setPositionY(window.innerHeight * 1.5);
    }

    _inherits(PreOrder, _View5);

    return PreOrder;
})(_View7['default']);

exports.PreOrder = PreOrder;

},{"famous-creative/display/View":91}],100:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _TopText$TagLine$GetYours$PreOrder$Coin = require('./TextViews');

var _View2 = require('famous-creative/display/View');

var _View3 = _interopRequireDefault(_View2);

var _Timeline = require('famous-creative/animation/Timeline');

var _Timeline2 = _interopRequireDefault(_Timeline);

var _Hand = require('./Hand');

var _Card = require('./Card');

var _Ring = require('./Ring');

var _SpinningRing = require('./SpinningRing');

var _ENUMS = require('./Enums');

var _ENUMS2 = _interopRequireDefault(_ENUMS);

var _Physics = require('./PhysicsService');

var _Physics2 = _interopRequireDefault(_Physics);

//Famous Components
var GestureHandler = FamousPlatform.components.GestureHandler;
var Curves = FamousPlatform.transitions.Curves;

//Physics Components
var Gravity1D = FamousPlatform.physics.Gravity1D;
var Gravity3D = FamousPlatform.physics.Gravity3D;
var Vec3 = FamousPlatform.math.Vec3;
var Drag = FamousPlatform.physics.Drag;

var App = (function (_View) {
    function App(node, options) {
        _classCallCheck(this, App);

        _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this, node, options);

        this.setAlign(0.5, 0.5);
        this.setMountPoint(0.5, 0.5);

        this.setSizeMode(0, 0);
        this.setAbsoluteSize(1, 1);

        this.createDOMElement({
            properties: {
                'overflow': 'hidden'
            }
        });

        this.initTimeline();

        this.render();
        this.renderSpinningRings();
        this.renderRings();

        this.setEvents();
        this.registerTimelinePaths();
        this.initWorld();
    }

    _inherits(App, _View);

    _createClass(App, [{
        key: 'initTimeline',
        value: function initTimeline() {
            this.timeline = new _Timeline2['default']({ timescale: 1 });
            this.time = {};
            this.time.start = 0;
            this.time.step1 = this.time.start + 1500; // Card scale apex
            this.time.step2 = this.time.step1 + 500; // Card scale basin
            this.time.step3 = this.time.step2 + 500; // Stage one done: Coin card has scaled back to a resting point
            this.time.step4 = this.time.step3 + 1000; // Coin card scale and flip starting
            this.time.step5 = this.time.step4 + 1000; // Coin card scale and flip apex
            this.time.step6 = this.time.step5 + 250; // Coin card scale and flip almost done
            this.time.step7 = this.time.step6 + 250; // End state text starts moving in
            this.time.step8 = this.time.step7 + 1000; // Stage two done: Tag line and coin card are moving up and out
            this.time.end = this.time.step8 + 1000; // Finis
        }
    }, {
        key: 'initWorld',
        value: function initWorld() {
            this.world = _Physics2['default'].getSimulation();
            this.ringBodies = [];

            for (var i = 0; i < this.rings.length; i++) {
                this.ringBodies.push(this.rings[i].sphere);
            }

            this.drag = new Drag(this.ringBodies, {
                max: _Physics2['default'].dampenForce(7500),
                strength: _Physics2['default'].dampenForce(7500),
                type: Drag.Linear
            });

            this.world.add(this.ringBodies, this.drag);
        }
    }, {
        key: 'phyAddRepulsion',
        value: function phyAddRepulsion() {
            var ringRepulsions = [];
            for (var i = 0; i < this.ringBodies.length; i++) {
                ringRepulsions.push(new Gravity3D(this.ringBodies[i], this.ringBodies, {
                    strength: _Physics2['default'].dampenForce(-1000) //Negative Repulsion pushes away
                }));
            }

            this.world.add(ringRepulsions);
        }
    }, {
        key: 'phyAdd1dGravity',
        value: function phyAdd1dGravity() {
            this.gravity1d = new Gravity1D(this.ringBodies, {
                acceleration: new Vec3(0, _Physics2['default'].dampenForce(750), 0)
            });

            this.world.add([this.gravity1d]);
        }
    }, {
        key: 'phyAdd3dGravity',
        value: function phyAdd3dGravity() {
            this.gravity3d = new Gravity3D(null, this.ringBodies, {
                strength: _Physics2['default'].dampenForce(50000000),
                anchor: new Vec3(0, _ENUMS2['default'].COIN_POS, 0)
            });

            this.world.add([this.gravity3d]);
        }
    }, {
        key: 'loadRings',
        value: function loadRings() {
            var _this2 = this;

            var _this = this;
            var dampenedVelocity = _Physics2['default'].dampenForce(1000);

            this.rings.forEach(function (ring) {
                ring.setOpacity(1);

                var vx = Math.random() * (dampenedVelocity * 2) - dampenedVelocity;
                var vy = Math.random() * (dampenedVelocity * 2) - dampenedVelocity;

                ring.sphere.setVelocity(vx, vy, 0);
                ring.activatePhysics();

                ring.setScale(1.1, 1.1, 1.1, {
                    duration: 750
                }, function () {
                    ring.setScale(1, 1, 1, {
                        duration: 50
                    });
                });

                setTimeout(function () {
                    ring.activateBlackhole();
                }, _this2.time.step6);

                setTimeout(function () {
                    ring.setDOMProperties({
                        'border-color': '#000000'
                    });
                }, _this2.time.end);
            });

            setTimeout(function () {
                _this.phyAdd1dGravity();
                _this.phyAddRepulsion();
            }, 850);

            setTimeout(function () {
                _this.phyAdd3dGravity();
            }, this.time.step6);
        }
    }, {
        key: 'render',
        value: function render() {
            this.renderBlueScreen();
            this.renderTopText();
            this.renderCards();
            this.renderHand();
            this.renderTagLine();
            this.renderCoin();
            this.renderGetYours();
            this.renderPreOrder();
        }
    }, {
        key: 'renderBlueScreen',
        value: function renderBlueScreen() {
            this.blueScreen = new _View3['default'](this.node.addChild());

            this.blueScreen.createDOMElement({
                properties: {
                    'background-color': 'rgb(22, 139, 221)',
                    'z-index': -1000
                },
                classes: ['blue-screen']
            });

            this.blueScreen.setSizeMode(0, 0);
            this.blueScreen.setProportionalSize(1, 1);
            this.blueScreen.setAlign(0, 0, 0);
            this.blueScreen.setPosition(0, window.innerHeight, -1000);
        }
    }, {
        key: 'renderTopText',
        value: function renderTopText() {
            this.topText = new _TopText$TagLine$GetYours$PreOrder$Coin.TopText(this.node.addChild());
        }
    }, {
        key: 'renderHand',
        value: function renderHand() {
            this.hand = new _Hand.Hand(this.node.addChild(), {
                tagName: 'img',
                model: {
                    imgPath: 'assets/svg/hand.svg'
                }
            });
        }
    }, {
        key: 'renderCards',
        value: function renderCards() {
            var _this = this;

            this.cards = [];
            var cardsSrc = [{ front: 'assets/images/gift.png', back: 'assets/svg/cardBack.svg' }, { front: 'assets/images/credit.png', back: 'assets/svg/cardBack.svg' }, { front: 'assets/images/membership.png', back: 'assets/svg/cardBack.svg' }, { front: 'assets/images/debit.png', back: 'assets/svg/cardBack.svg' }, { front: 'assets/svg/coinFront.svg', back: 'assets/svg/coinBack.svg' }];

            cardsSrc.forEach(function (card, i) {
                var cardNode = new _Card.Card(_this.node.addChild(), {
                    tagName: 'div',
                    model: {
                        front: card.front,
                        back: card.back,
                        i: i
                    }
                });

                if (i === cardsSrc.length - 1) {
                    cardNode.setOpacity(0);
                }

                _this.cards.push(cardNode);
            });
        }
    }, {
        key: 'renderTagLine',
        value: function renderTagLine() {
            this.tagLine = new _TopText$TagLine$GetYours$PreOrder$Coin.TagLine(this.node.addChild());
        }
    }, {
        key: 'renderSpinningRings',
        value: function renderSpinningRings() {
            var svgPaths = ['assets/svg/outerCircle.svg', 'assets/svg/innerCircle.svg'];

            this.spinningRings = [];

            for (var i = 0; i < svgPaths.length; i++) {
                var ring = new _SpinningRing.SpinningRing(this.node.addChild(), {
                    i: i,
                    svgPath: svgPaths[i]
                });

                this.spinningRings.push(ring);
            }
        }
    }, {
        key: 'renderCoin',
        value: function renderCoin() {
            this.coin = new _TopText$TagLine$GetYours$PreOrder$Coin.Coin(this.node.addChild());
        }
    }, {
        key: 'renderGetYours',
        value: function renderGetYours() {
            this.getYours = new _TopText$TagLine$GetYours$PreOrder$Coin.GetYours(this.node.addChild());
        }
    }, {
        key: 'renderPreOrder',
        value: function renderPreOrder() {
            this.preOrder = new _TopText$TagLine$GetYours$PreOrder$Coin.PreOrder(this.node.addChild(), {
                tag: 'button'
            });

            this.shimmer = new _View3['default'](this.preOrder.addChild());
            this.shimmer.createDOMElement({
                properties: {
                    'background': 'linear-gradient(80deg, rgba(0,0,0,0) 30%,rgba(180,180,180,0.3) 45%,rgba(180,180,180,0.3) 55%, rgba(0,0,0,0) 70%)',
                    'zIndex': 10
                },
                classes: ['shimmer']
            });

            this.shimmer.setPosition(-240, -40, 10);
        }
    }, {
        key: 'renderRings',
        value: function renderRings() {
            this.rings = [];

            var ringCount = 0;

            if (window.innerWidth < 320) {
                ringCount = 7;
            } else if (window.innerWidth < 428) {
                ringCount = 10;
            } else if (window.innerWidth < 768) {
                ringCount = 15;
            } else if (window.innerWidth < 992) {
                ringCount = 20;
            } else {
                ringCount = 30;
            }

            ringCount = 150;
            for (var i = 0; i < ringCount; i++) {
                var ring = new _Ring.Ring(this.node.addChild());
                this.rings.push(ring);
            }
        }
    }, {
        key: 'translateShimmer',
        value: function translateShimmer() {
            setTimeout((function () {
                this.shimmer.setPositionX(240, {
                    duration: 1500,
                    curve: Curves.easeInOut
                }, (function () {
                    this.shimmer.setPositionX(-240);
                    this.translateShimmer();
                }).bind(this));
            }).bind(this), 3000);
        }
    }, {
        key: 'setEvents',
        value: function setEvents() {
            var _this3 = this;

            var isScrubbing = false;
            var hasFinished = false;

            setInterval(function () {
                if (_this3.rings && _this3.rings.length > 0) {
                    var ring = _this3.rings[Math.floor(Math.random() * _this3.rings.length)];
                    ring.pop();
                }
            }, 500);

            this.on('mousedown', function (e) {
                if (!hasFinished) {
                    _this3.emit('dragging', 'start');
                    isScrubbing = true;
                }
            });

            this.on('mousemove', function (e) {
                if (isScrubbing) {
                    _this3.mouseMovement = {
                        x: e.clientX,
                        y: e.clientY
                    };
                    _this3.scrubTimeline(_this3.mouseMovement.movement);
                }
            });

            this.on('mouseup', function (e) {
                isScrubbing = false;
                var duration = undefined;
                _this3.mouseMovement = null;

                if (_this3.currentTime > _this3.time.step1 / 2) {
                    // FINISH the time line
                    duration = _this3.time.end - _this3.currentTime;
                    _this3.currentTime = _this3.time.end;
                    hasFinished = true;
                } else {
                    //RESET the time line
                    duration = _this3.currentTime;
                    _this3.emit('resetApp', { duration: duration });
                    _this3.currentTime = 0;
                }
                _this3.timeline.set(_this3.currentTime, { duration: duration });
            });

            this.gestures = new GestureHandler(this.node, [{
                event: 'drag',
                callback: function callback(e) {
                    var duration = undefined;

                    if (e.status === 'move') {
                        _this3.emit('dragging', 'start');
                        _this3.scrubTimelineGesture(e);
                    } else if (e.status === 'end') {
                        if (_this3.currentTime > _this3.time.step1 / 2) {
                            //Math.abs(e.centerVelocity.y) > 250  ||
                            duration = _this3.time.end - _this3.currentTime;
                            _this3.currentTime = _this3.time.end;
                        } else {
                            duration = _this3.currentTime;
                            _this3.currentTime = 0;
                            _this3.emit('resetApp', { duration: duration });
                        }

                        _this3.timeline.set(_this3.currentTime, { duration: duration });
                    }
                }
            }]);
        }
    }, {
        key: 'mouseMovement',
        set: function (position) {
            if (!position) {
                delete this.mouseProperties;
            } else if (!this.mouseProperties) {
                this.mouseProperties = {
                    _lastPosition: position,
                    movement: {
                        x: 0,
                        y: 0
                    }
                };
            } else {
                this.mouseProperties.movement.x = this.mouseProperties._lastPosition.x - position.x;
                this.mouseProperties.movement.y = this.mouseProperties._lastPosition.y - position.y;
                this.mouseProperties._lastPosition = position;
            }
        },
        get: function () {
            if (!this.mouseProperties) {
                this.mouseProperties = {
                    _lastPosition: undefined,
                    movement: {
                        x: undefined,
                        y: undefined
                    }
                };
            }

            return this.mouseProperties;
        }
    }, {
        key: 'addCoinSpringEvent',
        value: function addCoinSpringEvent() {
            var _this = this;
            var coinCard = _this.cards[_this.cards.length - 1];
            var viewPortCenter = {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            };

            var appSize = this.getSize();
            var cardSize = coinCard.getSize();
            var cardPosition = {
                x: coinCard.position.getX(),
                y: coinCard.getPositionY()
            };
            var cardCenter = {
                x: viewPortCenter.x,
                y: viewPortCenter.y - appSize[1] / 2 + (cardSize[1] / 2 + cardPosition.y)
            };

            function releaseSpring(e) {
                coinCard.setRotationY(0, {
                    curve: Curves.spring,
                    duration: 1000
                });

                coinCard.setRotationX(0, {
                    curve: Curves.spring,
                    duration: 1000
                });
            }

            this.on('mouseleave', releaseSpring);
            this.on('mouseout', releaseSpring);

            this.on('mousemove', function (e) {
                var offset = {
                    x: e.clientX - cardCenter.x,
                    y: e.clientY - cardCenter.y
                };

                var maxOffsetX = 145;
                var maxOffsetY = 140;

                if (offset.x > -maxOffsetX && offset.x < maxOffsetX && offset.y > -maxOffsetY && offset.y < maxOffsetY) {

                    //We Flip the X and Y here because the card has a rotation of 90 degrees, which flips its axis
                    coinCard.setRotationY(offset.x * Math.PI / 3 / 180);
                    coinCard.setRotationX(offset.y * Math.PI / 4 / 180);
                } else {

                    coinCard.setRotationY(0, {
                        curve: Curves.spring,
                        duration: 1000
                    });

                    coinCard.setRotationX(0, {
                        curve: Curves.spring,
                        duration: 1000
                    });
                }
            });
        }
    }, {
        key: 'addGyroscopeEvent',
        value: function addGyroscopeEvent() {
            var _this4 = this;

            window.addEventListener('deviceorientation', function (e) {
                var rotX = e.beta * -Math.PI / 180;
                var rotY = e.gamma * Math.PI / 180;
                _this4.cards[4].haltRotation();
                _this4.cards[4].setRotation(rotX, rotY, 90 * Math.PI / 180, {
                    duration: 100
                });
            }, false);
        }
    }, {
        key: 'registerTimelinePaths',
        value: function registerTimelinePaths() {
            var _this5 = this;

            this.currentTime = 0; //Used in timeline scrubbing

            /*--------------------- RINGS  ---------------------*/
            this.timeline.registerPath({
                handler: function handler(time) {
                    if (!_this5.hasOwnProperty('initializedRings')) {
                        _this5.initializedRings = false;
                    }

                    if (!_this5.initializedRing && time >= _this5.time.step3 - 50) {
                        _this5.loadRings();
                        _this5.initializedRing = true;
                    }
                },
                path: [[0, 0], [this.time.end, this.time.end]]
            });

            /*--------------------- BLUE SCREEN ---------------------*/
            this.timeline.registerPath({
                handler: function handler(val) {
                    var _blueScreen;

                    (_blueScreen = _this5.blueScreen).setPosition.apply(_blueScreen, _toConsumableArray(val));
                },
                path: [[this.time.start, [0, window.innerHeight]], [this.time.step3, [0, window.innerHeight]], [this.time.step5, [0, 0]]]
            });

            this.timeline.registerPath({
                handler: function handler(time) {
                    if (!_this5.hasOwnProperty('hasRisen')) {
                        _this5.hasRisen = false;
                    }

                    if (time >= _this5.time.step3 && time <= _this5.time.step5) {
                        _this5.emit('risingTide', _this5.blueScreen.getPositionY());
                    }
                },
                path: [[0, 0], [this.time.end, this.time.end]]
            });

            /*--------------------- TOP TEXT ---------------------*/
            this.timeline.registerPath({
                handler: (function (val) {
                    var _topText;

                    (_topText = this.topText).setPosition.apply(_topText, _toConsumableArray(val));
                }).bind(this),
                path: [[this.time.start, [0, this.topText.getPositionY()]], [this.time.step1, [0, -200]] // The element is 200px tall, this puts it out of view
                ]
            });

            this.timeline.registerPath({
                handler: (function (val) {
                    this.topText.setOpacity([val]);
                }).bind(this),
                path: [[this.time.start, 1], [this.time.step1 / 3, 1], // Timing delay
                [this.time.step1, 0]]
            });

            /*--------------------- HAND ---------------------*/
            this.timeline.registerPath({
                handler: (function (val) {
                    var _hand;

                    (_hand = this.hand).setPosition.apply(_hand, _toConsumableArray(val));
                }).bind(this),
                path: [[this.time.start, [0, this.hand.getPositionY()]], [this.time.step1, [0, -75]] // The element is 75px tall, this moves it out of view at the top
                ]
            });

            /*--------------------- TAG LINE ---------------------*/
            this.timeline.registerPath({
                handler: (function (val) {
                    var _tagLine;

                    (_tagLine = this.tagLine).setPosition.apply(_tagLine, _toConsumableArray(val));
                }).bind(this),
                path: [[this.time.start, [0, this.tagLine.getPositionY()]], [this.time.step4, [0, this.tagLine.getPositionY()]], [this.time.step6, [0, 50]], // The element is 100px tall, this puts it out of view
                [this.time.step7, [0, 40]], [this.time.step8 - 500, [0, -200]]]
            });

            var _loop = function (i, j) {
                var coin = _this5.spinningRings[i];
                var startingYPos = coin.getPositionY();

                _this5.timeline.registerPath({
                    handler: function handler(val) {
                        coin.setPosition.apply(coin, _toConsumableArray(val));
                    },
                    path: [[_this5.time.start, [0, startingYPos]], [_this5.time.step7, [0, startingYPos]], [_this5.time.step8, [0, _ENUMS2['default'].COIN_CENTER], Curves.easeOut]]
                });

                _this5.timeline.registerPath({
                    handler: function handler(time) {
                        if (!_this5.hasOwnProperty('hasLoadedRings')) {
                            _this5.hasLoadedRings = false;
                        }

                        if (!_this5.hasLoadedRings && time >= _this5.time.step7) {
                            _this5.emit('spinRing', {});
                            _this5.hasLoadedRings = true;
                        }
                    },
                    path: [[0, 0], [_this5.time.end, _this5.time.end]]
                });
            };

            /*--------------------- SPINNING RINGS ---------------------*/
            for (var i = 0, j = this.spinningRings.length; i < j; i++) {
                _loop(i, j);
            }

            /*--------------------- COIN TEXT ---------------------*/
            this.timeline.registerPath({
                handler: function handler(val) {
                    var _coin;

                    (_coin = _this5.coin).setPosition.apply(_coin, _toConsumableArray(val));
                },
                path: [[this.time.start, [0, this.coin.getPositionY()]], [this.time.step7 + 50, [0, this.coin.getPositionY()]], [this.time.step8 + 50, [0, window.innerHeight - 175], Curves.easeOut]]
            });

            /*--------------------- GET YOURS ---------------------*/
            this.timeline.registerPath({
                handler: function handler(val) {
                    var _getYours;

                    (_getYours = _this5.getYours).setPosition.apply(_getYours, _toConsumableArray(val));
                },
                path: [[this.time.start, [0, this.getYours.getPositionY()]], [this.time.step7 + 75, [0, this.getYours.getPositionY()]], [this.time.step8 + 75, [0, window.innerHeight - 120], Curves.easeOut]]
            });

            /*--------------------- PRE ORDER ---------------------*/
            this.timeline.registerPath({
                handler: function handler(val) {
                    var _preOrder;

                    (_preOrder = _this5.preOrder).setPosition.apply(_preOrder, _toConsumableArray(val));
                },
                path: [[this.time.start, [0, this.preOrder.getPositionY()]], [this.time.step7 + 200, [0, this.preOrder.getPositionY()]], [this.time.step8 + 200, [0, window.innerHeight - 65], Curves.easeOut]]
            });

            var _loop2 = function (i, j) {
                var card = _this5.cards[i];

                var timeSegments = _this5.getCardTimeSegments(card);

                _this5.timeline.registerPath({
                    handler: function handler(val) {
                        card.setPosition.apply(card, _toConsumableArray(Array.isArray(val) ? val : [val]));
                    },
                    path: timeSegments.cardPosition
                });

                _this5.timeline.registerPath({
                    handler: function handler(val) {
                        card.setScale.apply(card, _toConsumableArray(Array.isArray(val) ? val : [val]));
                    },
                    path: timeSegments.cardScale
                });

                _this5.timeline.registerPath({
                    handler: function handler(val) {
                        card.setRotation.apply(card, _toConsumableArray(Array.isArray(val) ? val : [val]));
                    },
                    path: timeSegments.cardRotation
                });

                _this5.timeline.registerPath({
                    handler: function handler(val) {
                        card.setOpacity(val);
                    },
                    path: timeSegments.cardOpacity
                });
            };

            /*--------------------- CARDS ---------------------*/
            for (var i = 0, j = this.cards.length; i < j; i++) {
                _loop2(i, j);
            }

            this.timeline.registerPath({
                handler: function handler(time) {
                    if (time >= _this5.time.end) {
                        _this5.addCoinSpringEvent();
                        _this5.addGyroscopeEvent();
                        _this5.translateShimmer();
                    }
                },
                path: [[0, 0], [this.time.end, this.time.end]]
            });
        }
    }, {
        key: 'getCardTimeSegments',
        value: function getCardTimeSegments(card) {
            var currentPosition = [card.model.position.x, card.model.position.y, card.model.position.z];
            var currentRotation = [card.model.rotation.x, card.model.rotation.y, card.model.rotation.z];
            var timeSegments = {
                cardScale: [],
                cardRotation: [],
                cardOpacity: [],
                cardPosition: []
            };

            timeSegments.cardPosition = [[this.time.start, currentPosition], [this.time.step1 / 2, [0, 250, card.model.position.z]], [this.time.step1, [0, 75, card.model.position.z]]];

            switch (card.model.i) {
                case 0:
                    //GIFT
                    timeSegments.cardScale = [[this.time.start, [0.5, 0.5, 0.5]], [300, [0.5, 0.5, 0.5]], // Delay
                    [this.time.step1 / 2, [1, 1, 1]], [this.time.step1, [0.5, 0.5, 0.5]]];
                    timeSegments.cardRotation = [[this.time.start, currentRotation], [300, currentRotation], // Delay
                    [this.time.step1, [360 * Math.PI / 180, 0, -270 * Math.PI / 180]]];
                    timeSegments.cardOpacity = [[this.time.start, 1], [this.time.step1 - 1, 1], [this.time.step1, 0]];
                    break;
                case 1:
                    // CREDIT
                    timeSegments.cardScale = [[this.time.start, [0.5, 0.5, 0.5]], [200, [0.5, 0.5, 0.5]], // Delay
                    [this.time.step1 / 2, [1, 1, 1]], [this.time.step1, [0.5, 0.5, 0.5]]];
                    timeSegments.cardRotation = [[this.time.start, currentRotation], [200, currentRotation], // Delay
                    [this.time.step1, [-360 * Math.PI / 180, 0, 90 * Math.PI / 180]]];
                    timeSegments.cardOpacity = [[this.time.start, 1], [this.time.step1 - 1, 1], [this.time.step1, 0]];
                    break;
                case 2:
                    //MEMBERSHIP
                    timeSegments.cardScale = [[this.time.start, [0.5, 0.5, 0.5]], [100, [0.5, 0.5, 0.5]], // Delay
                    [this.time.step1 / 2, [1, 1, 1]], [this.time.step1, [0.5, 0.5, 0.5]]];
                    timeSegments.cardRotation = [[this.time.start, currentRotation], [100, currentRotation], // Delay
                    [this.time.step1, [360 * Math.PI / 180, 0, -270 * Math.PI / 180]]];
                    timeSegments.cardOpacity = [[0, 1], [this.time.step1 - 1, 1], [this.time.step1, 0]];
                    break;
                case 3:
                    //DEBIT
                    timeSegments.cardScale = [[this.time.start, [0.5, 0.5, 0.5]], [this.time.step1 / 2, [1, 1, 1]], [this.time.step1, [0.5, 0.5, 0.5]]];
                    timeSegments.cardRotation = [[this.time.start, currentRotation], [this.time.step1, [-360 * Math.PI / 180, 0, 90 * Math.PI / 180]]];
                    timeSegments.cardOpacity = [[this.time.start, 1], [this.time.step1 - 1, 1], [this.time.step1, 0]];
                    break;
                case 4:
                    //COIN
                    timeSegments.cardScale = [[this.time.start, [0.5, 0.5, 0.5]], [this.time.step1 / 2, [1, 1, 1]], [this.time.step1, [0.5, 0.5, 0.5]], [this.time.step2, [0.3, 0.3, 0.3]], [this.time.step3, [0.5, 0.5, 0.5]], [this.time.step3 + 50, [0.5, 0.5, 0.5]], [this.time.step4, [0.62, 0.62, 0.62]], [this.time.step5, [0.75, 0.75, 0.75]]];
                    timeSegments.cardRotation = [[0, currentRotation], [this.time.step1, [-360 * Math.PI / 180, 0, 90 * Math.PI / 180]], [this.time.step2, [-540 * Math.PI / 180, 0, 90 * Math.PI / 180]], [this.time.step3, [-360 * Math.PI / 180, 0, 90 * Math.PI / 180]], [this.time.step3 + 50, [-360 * Math.PI / 180, 0, 90 * Math.PI / 180]], [this.time.step4, [-270 * Math.PI / 180, 0, 90 * Math.PI / 180]], [this.time.step5, [0 * Math.PI / 180, 0, 90 * Math.PI / 180]], [this.time.step6, [15 * Math.PI / 180, 0, 90 * Math.PI / 180]], [this.time.step7, [0 * Math.PI / 180, 0, 90 * Math.PI / 180]]];
                    timeSegments.cardOpacity = [[0, 0], [this.time.step1 - 1, 0], [this.time.step1, 1]];
                    timeSegments.cardPosition = [[this.time.start, currentPosition], [this.time.step1 / 2, [0, 250, 0]], [this.time.step1, [0, 75, 0], Curves.outBack], [this.time.step3, [0, 75, 0]], [this.time.step3 + 50, [0, 75, 0]], [this.time.step4, [0, 300, 0]], [this.time.step5, [0, 200, 0]], [this.time.step7, [0, 200, 0]], [this.time.step8 - 500, [0, 50, 0], Curves.easeOut]];
                    break;
            }

            return timeSegments;
        }
    }, {
        key: 'scrubTimelineGesture',
        value: function scrubTimelineGesture(e) {
            if (this.currentTime >= 0 && this.currentTime <= this.time.end) {
                this.currentTime += e.centerDelta.y * -4;
            }

            if (this.currentTime < 0) {
                this.currentTime = 0;
            }

            if (this.currentTime > this.time.end) {
                this.currentTime = this.time.end;
            }

            this.timeline.set(this.currentTime);
        }
    }, {
        key: 'scrubTimeline',
        value: function scrubTimeline(mouseMovement) {
            // 4 is used to speed up the scrubbing rate by a factor of 4 from the gesture movement
            if (this.currentTime >= 0 && this.currentTime <= this.time.end) {
                this.currentTime += mouseMovement.y * 4;
            }

            //The previous math can leave values that are outside of the working value range
            if (this.currentTime < 0) {
                this.currentTime = 0;
            }

            if (this.currentTime > this.time.end) {
                this.currentTime = this.time.end;
            }
            this.timeline.set(this.currentTime);
        }
    }]);

    return App;
})(_View3['default']);

exports.App = App;

var rootNode = FamousPlatform.core.Famous.createContext('body');
var camera = new FamousPlatform.components.Camera(rootNode);
camera.setDepth(20000);

window.app = new App(rootNode.addChild(), {
    properties: {}
});

},{"./Card":93,"./Enums":94,"./Hand":95,"./PhysicsService":96,"./Ring":97,"./SpinningRing":98,"./TextViews":99,"famous-creative/animation/Timeline":89,"famous-creative/display/View":91}],101:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _FamousEngine = require('famous-creative/scaffolding/FamousEngine');

var _FamousEngine2 = _interopRequireDefault(_FamousEngine);

'use strict';

_FamousEngine2['default'].init();

require('babelify/polyfill');
require('./app/index');

},{"./app/index":100,"babelify/polyfill":88,"famous-creative/scaffolding/FamousEngine":92}]},{},[101])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbGliL2JhYmVsL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXJyYXktbWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXNzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi1zdHJvbmcuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvbGxlY3Rpb24tdG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi13ZWFrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jdHguanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmRlZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZG9tLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZW51bS1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5mb3Itb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmZ3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pbnZva2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItY2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlci1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pdGVyLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQua2V5b2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLm93bi1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5wYXJ0aWFsLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5yZXBsYWNlci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc2V0LXByb3RvLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnN0cmluZy1wYWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnN0cmluZy1yZXBlYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnRhc2suanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnRocm93cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudWlkLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC51bnNjb3BlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC53a3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuY29weS13aXRoaW4uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5maW5kLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZpbmQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmZ1bmN0aW9uLmhhcy1pbnN0YW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5mdW5jdGlvbi5uYW1lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm1hcC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXRoLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm51bWJlci5jb25zdHJ1Y3Rvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIuc3RhdGljcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC5pcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnByb21pc2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVmbGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWdleHAuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc2V0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5jb2RlLXBvaW50LWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5lbmRzLXdpdGguanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLmZyb20tY29kZS1wb2ludC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5yYXcuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLnJlcGVhdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuc3RhcnRzLXdpdGguanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LndlYWstbWFwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LndlYWstc2V0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3Lm1hcC50by1qc29uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3Lm9iamVjdC50by1hcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5yZWdleHAuZXNjYXBlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnNldC50by1qc29uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnN0cmluZy5hdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zdHJpbmcubHBhZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zdHJpbmcucnBhZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2pzLmFycmF5LnN0YXRpY3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLmltbWVkaWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi50aW1lcnMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvcmVnZW5lcmF0b3IvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9wb2x5ZmlsbC5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2ZjLWNvbnRlbnQvY29pbi1mbGlwcGVyL25vZGVfbW9kdWxlcy9mYW1vdXMtY3JlYXRpdmUvYW5pbWF0aW9uL1RpbWVsaW5lLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvZmMtY29udGVudC9jb2luLWZsaXBwZXIvbm9kZV9tb2R1bGVzL2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L01vZGlmaWVyLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvZmMtY29udGVudC9jb2luLWZsaXBwZXIvbm9kZV9tb2R1bGVzL2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L1ZpZXcuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9mYy1jb250ZW50L2NvaW4tZmxpcHBlci9ub2RlX21vZHVsZXMvZmFtb3VzLWNyZWF0aXZlL3NjYWZmb2xkaW5nL0ZhbW91c0VuZ2luZS5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2ZjLWNvbnRlbnQvY29pbi1mbGlwcGVyL3NyYy9hcHAvQ2FyZC5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2ZjLWNvbnRlbnQvY29pbi1mbGlwcGVyL3NyYy9hcHAvRW51bXMuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9mYy1jb250ZW50L2NvaW4tZmxpcHBlci9zcmMvYXBwL0hhbmQuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9mYy1jb250ZW50L2NvaW4tZmxpcHBlci9zcmMvYXBwL1BoeXNpY3NTZXJ2aWNlLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvZmMtY29udGVudC9jb2luLWZsaXBwZXIvc3JjL2FwcC9SaW5nLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvZmMtY29udGVudC9jb2luLWZsaXBwZXIvc3JjL2FwcC9TcGlubmluZ1JpbmcuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9mYy1jb250ZW50L2NvaW4tZmxpcHBlci9zcmMvYXBwL1RleHRWaWV3cy5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2ZjLWNvbnRlbnQvY29pbi1mbGlwcGVyL3NyYy9hcHAvaW5kZXguanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9mYy1jb250ZW50L2NvaW4tZmxpcHBlci9zcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BqQkE7QUFDQTs7QUNEQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNEQSxJQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLE1B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QyxFQUFHLENBQUMsQ0FBQyxFQUMxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUN2QixDQUFDO0FBQ0YsMEJBQU07QUFBQSxBQUNWLHFCQUFLLENBQUM7O0FBQ0YsZ0NBQVksQ0FBQyxTQUFTLEdBQUcsQ0FDckIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUUsRUFBRSxHQUFFLEVBQUUsR0FBRSxDQUFDLENBQUMsRUFDL0IsQ0FBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ2xDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFFLEVBQUUsR0FBRSxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQ2xDLENBQUM7QUFDRixnQ0FBWSxDQUFDLFlBQVksR0FBRyxDQUN4QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxFQUNsQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUcsQ0FBQyxFQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBRSxDQUFDLENBQ3ZFLENBQUM7QUFDRixnQ0FBWSxDQUFDLFdBQVcsR0FBRyxDQUN2QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUNwQixDQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsRUFDMUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FDdkIsQ0FBQztBQUNGLDBCQUFNO0FBQUEsQUFDVixxQkFBSyxDQUFDOztBQUNGLGdDQUFZLENBQUMsU0FBUyxHQUFHLENBQ3JCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFFLEVBQUUsR0FBRSxFQUFFLEdBQUUsQ0FBQyxDQUFDLEVBQy9CLENBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUNsQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRSxFQUFFLEdBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQyxFQUMvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRSxFQUFFLEdBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQyxFQUMvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRSxFQUFFLEdBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQyxFQUMvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUUsRUFBRSxHQUFFLEVBQUUsR0FBRSxDQUFDLENBQUMsRUFDcEMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUcsRUFBRSxJQUFHLEVBQUUsSUFBRyxDQUFDLENBQUMsRUFDbEMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUcsRUFBRSxJQUFHLEVBQUUsSUFBRyxDQUFDLENBQUMsQ0FDckMsQ0FBQztBQUNGLGdDQUFZLENBQUMsWUFBWSxHQUFHLENBQ3hCLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxFQUNwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUcsQ0FBQyxFQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBRSxDQUFDLEVBQ3BFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsRUFBRyxDQUFDLEVBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFFLENBQUMsRUFDcEUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxFQUFHLENBQUMsRUFBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUUsQ0FBQyxFQUNwRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsRUFBRSxDQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxFQUFHLENBQUMsRUFBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUUsQ0FBQyxFQUN6RSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUcsQ0FBQyxFQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBRSxDQUFDLEVBQ3BFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUcsQ0FBQyxFQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBRSxDQUFDLEVBQ2pFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUcsQ0FBQyxFQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBRSxDQUFDLEVBQ2xFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUcsQ0FBQyxFQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBRSxDQUFDLENBQ3BFLENBQUM7QUFDRixnQ0FBWSxDQUFDLFdBQVcsR0FBRyxDQUN2QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDTixDQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsRUFDMUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FDdkIsQ0FBQztBQUNGLGdDQUFZLENBQUMsWUFBWSxHQUFHLENBQ3hCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLEVBQ2xDLENBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUNwQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQzdDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQzdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUNsQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUM5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUM5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUM5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUN0RCxDQUFDO0FBQ0YsMEJBQU07QUFBQSxhQUNiOztBQUVELG1CQUFPLFlBQVksQ0FBQztTQUN2Qjs7O2VBRW1CLDhCQUFDLENBQUMsRUFBRTtBQUNwQixnQkFBRyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQzNELG9CQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzVDOztBQUVELGdCQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFO0FBQ3JCLG9CQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzthQUN4Qjs7QUFFRCxnQkFBRyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ2pDLG9CQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2FBQ3BDOztBQUVELGdCQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDdkM7OztlQUVZLHVCQUFDLGFBQWEsRUFBRTs7QUFFekIsZ0JBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUMzRCxvQkFBSSxDQUFDLFdBQVcsSUFBSSxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMzQzs7O0FBR0QsZ0JBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUU7QUFDckIsb0JBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO2FBQ3hCOztBQUVELGdCQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDakMsb0JBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7YUFDcEM7QUFDRCxnQkFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3ZDOzs7V0FyMEJRLEdBQUc7OztRQUFILEdBQUcsR0FBSCxHQUFHOztBQXcwQmhCLElBQU0sUUFBUSxHQUFLLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwRSxJQUFJLE1BQU0sR0FBRyxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVELE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXZCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFO0FBQ3RDLGNBQVUsRUFBRSxFQUVYO0NBQ0osQ0FBQyxDQUFDOzs7Ozs7OzRCQ2wyQnNCLDBDQUEwQzs7OztBQUZuRSxZQUFZLENBQUM7O0FBR2IsMEJBQWEsSUFBSSxFQUFFLENBQUM7O0FBRXBCLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzdCLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxucmVxdWlyZShcImNvcmUtanMvc2hpbVwiKTtcblxucmVxdWlyZShcInJlZ2VuZXJhdG9yL3J1bnRpbWVcIik7XG5cbmlmIChnbG9iYWwuX2JhYmVsUG9seWZpbGwpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwib25seSBvbmUgaW5zdGFuY2Ugb2YgYmFiZWwvcG9seWZpbGwgaXMgYWxsb3dlZFwiKTtcbn1cbmdsb2JhbC5fYmFiZWxQb2x5ZmlsbCA9IHRydWU7IiwiLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxyXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xyXG52YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKElTX0lOQ0xVREVTKXtcclxuICByZXR1cm4gZnVuY3Rpb24oJHRoaXMsIGVsLCBmcm9tSW5kZXgpe1xyXG4gICAgdmFyIE8gICAgICA9ICQudG9PYmplY3QoJHRoaXMpXHJcbiAgICAgICwgbGVuZ3RoID0gJC50b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgLCBpbmRleCAgPSAkLnRvSW5kZXgoZnJvbUluZGV4LCBsZW5ndGgpXHJcbiAgICAgICwgdmFsdWU7XHJcbiAgICBpZihJU19JTkNMVURFUyAmJiBlbCAhPSBlbCl3aGlsZShsZW5ndGggPiBpbmRleCl7XHJcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcclxuICAgICAgaWYodmFsdWUgIT0gdmFsdWUpcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2UgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKXtcclxuICAgICAgaWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleDtcclxuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcclxuICB9O1xyXG59OyIsIi8vIDAgLT4gQXJyYXkjZm9yRWFjaFxyXG4vLyAxIC0+IEFycmF5I21hcFxyXG4vLyAyIC0+IEFycmF5I2ZpbHRlclxyXG4vLyAzIC0+IEFycmF5I3NvbWVcclxuLy8gNCAtPiBBcnJheSNldmVyeVxyXG4vLyA1IC0+IEFycmF5I2ZpbmRcclxuLy8gNiAtPiBBcnJheSNmaW5kSW5kZXhcclxudmFyICQgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjdHggPSByZXF1aXJlKCcuLyQuY3R4Jyk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVFlQRSl7XHJcbiAgdmFyIElTX01BUCAgICAgICAgPSBUWVBFID09IDFcclxuICAgICwgSVNfRklMVEVSICAgICA9IFRZUEUgPT0gMlxyXG4gICAgLCBJU19TT01FICAgICAgID0gVFlQRSA9PSAzXHJcbiAgICAsIElTX0VWRVJZICAgICAgPSBUWVBFID09IDRcclxuICAgICwgSVNfRklORF9JTkRFWCA9IFRZUEUgPT0gNlxyXG4gICAgLCBOT19IT0xFUyAgICAgID0gVFlQRSA9PSA1IHx8IElTX0ZJTkRfSU5ERVg7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBjYWxsYmFja2ZuLCB0aGF0KXtcclxuICAgIHZhciBPICAgICAgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKCR0aGlzKSlcclxuICAgICAgLCBzZWxmICAgPSAkLkVTNU9iamVjdChPKVxyXG4gICAgICAsIGYgICAgICA9IGN0eChjYWxsYmFja2ZuLCB0aGF0LCAzKVxyXG4gICAgICAsIGxlbmd0aCA9ICQudG9MZW5ndGgoc2VsZi5sZW5ndGgpXHJcbiAgICAgICwgaW5kZXggID0gMFxyXG4gICAgICAsIHJlc3VsdCA9IElTX01BUCA/IEFycmF5KGxlbmd0aCkgOiBJU19GSUxURVIgPyBbXSA6IHVuZGVmaW5lZFxyXG4gICAgICAsIHZhbCwgcmVzO1xyXG4gICAgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihOT19IT0xFUyB8fCBpbmRleCBpbiBzZWxmKXtcclxuICAgICAgdmFsID0gc2VsZltpbmRleF07XHJcbiAgICAgIHJlcyA9IGYodmFsLCBpbmRleCwgTyk7XHJcbiAgICAgIGlmKFRZUEUpe1xyXG4gICAgICAgIGlmKElTX01BUClyZXN1bHRbaW5kZXhdID0gcmVzOyAgICAgICAgICAgIC8vIG1hcFxyXG4gICAgICAgIGVsc2UgaWYocmVzKXN3aXRjaChUWVBFKXtcclxuICAgICAgICAgIGNhc2UgMzogcmV0dXJuIHRydWU7ICAgICAgICAgICAgICAgICAgICAvLyBzb21lXHJcbiAgICAgICAgICBjYXNlIDU6IHJldHVybiB2YWw7ICAgICAgICAgICAgICAgICAgICAgLy8gZmluZFxyXG4gICAgICAgICAgY2FzZSA2OiByZXR1cm4gaW5kZXg7ICAgICAgICAgICAgICAgICAgIC8vIGZpbmRJbmRleFxyXG4gICAgICAgICAgY2FzZSAyOiByZXN1bHQucHVzaCh2YWwpOyAgICAgICAgICAgICAgIC8vIGZpbHRlclxyXG4gICAgICAgIH0gZWxzZSBpZihJU19FVkVSWSlyZXR1cm4gZmFsc2U7ICAgICAgICAgIC8vIGV2ZXJ5XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBJU19GSU5EX0lOREVYID8gLTEgOiBJU19TT01FIHx8IElTX0VWRVJZID8gSVNfRVZFUlkgOiByZXN1bHQ7XHJcbiAgfTtcclxufTsiLCJ2YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xyXG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLCBtc2cxLCBtc2cyKXtcclxuICBpZighY29uZGl0aW9uKXRocm93IFR5cGVFcnJvcihtc2cyID8gbXNnMSArIG1zZzIgOiBtc2cxKTtcclxufVxyXG5hc3NlcnQuZGVmID0gJC5hc3NlcnREZWZpbmVkO1xyXG5hc3NlcnQuZm4gPSBmdW5jdGlvbihpdCl7XHJcbiAgaWYoISQuaXNGdW5jdGlvbihpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcclxuICByZXR1cm4gaXQ7XHJcbn07XHJcbmFzc2VydC5vYmogPSBmdW5jdGlvbihpdCl7XHJcbiAgaWYoISQuaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcclxuICByZXR1cm4gaXQ7XHJcbn07XHJcbmFzc2VydC5pbnN0ID0gZnVuY3Rpb24oaXQsIENvbnN0cnVjdG9yLCBuYW1lKXtcclxuICBpZighKGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKXRocm93IFR5cGVFcnJvcihuYW1lICsgXCI6IHVzZSB0aGUgJ25ldycgb3BlcmF0b3IhXCIpO1xyXG4gIHJldHVybiBpdDtcclxufTtcclxubW9kdWxlLmV4cG9ydHMgPSBhc3NlcnQ7IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGVudW1LZXlzID0gcmVxdWlyZSgnLi8kLmVudW0ta2V5cycpO1xyXG4vLyAxOS4xLjIuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlLCAuLi4pXHJcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCBzb3VyY2Upe1xyXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXHJcbiAgdmFyIFQgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKHRhcmdldCkpXHJcbiAgICAsIGwgPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAsIGkgPSAxO1xyXG4gIHdoaWxlKGwgPiBpKXtcclxuICAgIHZhciBTICAgICAgPSAkLkVTNU9iamVjdChhcmd1bWVudHNbaSsrXSlcclxuICAgICAgLCBrZXlzICAgPSBlbnVtS2V5cyhTKVxyXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXHJcbiAgICAgICwgaiAgICAgID0gMFxyXG4gICAgICAsIGtleTtcclxuICAgIHdoaWxlKGxlbmd0aCA+IGopVFtrZXkgPSBrZXlzW2orK11dID0gU1trZXldO1xyXG4gIH1cclxuICByZXR1cm4gVDtcclxufTsiLCJ2YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgVEFHICAgICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ3RvU3RyaW5nVGFnJylcclxuICAsIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XHJcbmZ1bmN0aW9uIGNvZihpdCl7XHJcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcclxufVxyXG5jb2YuY2xhc3NvZiA9IGZ1bmN0aW9uKGl0KXtcclxuICB2YXIgTywgVDtcclxuICByZXR1cm4gaXQgPT0gdW5kZWZpbmVkID8gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogJ051bGwnXHJcbiAgICA6IHR5cGVvZiAoVCA9IChPID0gT2JqZWN0KGl0KSlbVEFHXSkgPT0gJ3N0cmluZycgPyBUIDogY29mKE8pO1xyXG59O1xyXG5jb2Yuc2V0ID0gZnVuY3Rpb24oaXQsIHRhZywgc3RhdCl7XHJcbiAgaWYoaXQgJiYgISQuaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKSQuaGlkZShpdCwgVEFHLCB0YWcpO1xyXG59O1xyXG5tb2R1bGUuZXhwb3J0cyA9IGNvZjsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjdHggICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxyXG4gICwgc2FmZSAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZVxyXG4gICwgYXNzZXJ0ICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcclxuICAsIGZvck9mICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXHJcbiAgLCBzdGVwICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJykuc3RlcFxyXG4gICwgaGFzICAgICAgPSAkLmhhc1xyXG4gICwgc2V0ICAgICAgPSAkLnNldFxyXG4gICwgaXNPYmplY3QgPSAkLmlzT2JqZWN0XHJcbiAgLCBoaWRlICAgICA9ICQuaGlkZVxyXG4gICwgaXNGcm96ZW4gPSBPYmplY3QuaXNGcm96ZW4gfHwgJC5jb3JlLk9iamVjdC5pc0Zyb3plblxyXG4gICwgSUQgICAgICAgPSBzYWZlKCdpZCcpXHJcbiAgLCBPMSAgICAgICA9IHNhZmUoJ08xJylcclxuICAsIExBU1QgICAgID0gc2FmZSgnbGFzdCcpXHJcbiAgLCBGSVJTVCAgICA9IHNhZmUoJ2ZpcnN0JylcclxuICAsIElURVIgICAgID0gc2FmZSgnaXRlcicpXHJcbiAgLCBTSVpFICAgICA9ICQuREVTQyA/IHNhZmUoJ3NpemUnKSA6ICdzaXplJ1xyXG4gICwgaWQgICAgICAgPSAwO1xyXG5cclxuZnVuY3Rpb24gZmFzdEtleShpdCwgY3JlYXRlKXtcclxuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XHJcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcclxuICAvLyBjYW4ndCBzZXQgaWQgdG8gZnJvemVuIG9iamVjdFxyXG4gIGlmKGlzRnJvemVuKGl0KSlyZXR1cm4gJ0YnO1xyXG4gIGlmKCFoYXMoaXQsIElEKSl7XHJcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBpZFxyXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xyXG4gICAgLy8gYWRkIG1pc3Npbmcgb2JqZWN0IGlkXHJcbiAgICBoaWRlKGl0LCBJRCwgKytpZCk7XHJcbiAgLy8gcmV0dXJuIG9iamVjdCBpZCB3aXRoIHByZWZpeFxyXG4gIH0gcmV0dXJuICdPJyArIGl0W0lEXTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RW50cnkodGhhdCwga2V5KXtcclxuICAvLyBmYXN0IGNhc2VcclxuICB2YXIgaW5kZXggPSBmYXN0S2V5KGtleSksIGVudHJ5O1xyXG4gIGlmKGluZGV4ICE9ICdGJylyZXR1cm4gdGhhdFtPMV1baW5kZXhdO1xyXG4gIC8vIGZyb3plbiBvYmplY3QgY2FzZVxyXG4gIGZvcihlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcclxuICAgIGlmKGVudHJ5LmsgPT0ga2V5KXJldHVybiBlbnRyeTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGdldENvbnN0cnVjdG9yOiBmdW5jdGlvbihOQU1FLCBJU19NQVAsIEFEREVSKXtcclxuICAgIGZ1bmN0aW9uIEMoKXtcclxuICAgICAgdmFyIHRoYXQgICAgID0gYXNzZXJ0Lmluc3QodGhpcywgQywgTkFNRSlcclxuICAgICAgICAsIGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICBzZXQodGhhdCwgTzEsICQuY3JlYXRlKG51bGwpKTtcclxuICAgICAgc2V0KHRoYXQsIFNJWkUsIDApO1xyXG4gICAgICBzZXQodGhhdCwgTEFTVCwgdW5kZWZpbmVkKTtcclxuICAgICAgc2V0KHRoYXQsIEZJUlNULCB1bmRlZmluZWQpO1xyXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xyXG4gICAgfVxyXG4gICAgJC5taXgoQy5wcm90b3R5cGUsIHtcclxuICAgICAgLy8gMjMuMS4zLjEgTWFwLnByb3RvdHlwZS5jbGVhcigpXHJcbiAgICAgIC8vIDIzLjIuMy4yIFNldC5wcm90b3R5cGUuY2xlYXIoKVxyXG4gICAgICBjbGVhcjogZnVuY3Rpb24gY2xlYXIoKXtcclxuICAgICAgICBmb3IodmFyIHRoYXQgPSB0aGlzLCBkYXRhID0gdGhhdFtPMV0sIGVudHJ5ID0gdGhhdFtGSVJTVF07IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xyXG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XHJcbiAgICAgICAgICBpZihlbnRyeS5wKWVudHJ5LnAgPSBlbnRyeS5wLm4gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBkZWxldGUgZGF0YVtlbnRyeS5pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhhdFtGSVJTVF0gPSB0aGF0W0xBU1RdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoYXRbU0laRV0gPSAwO1xyXG4gICAgICB9LFxyXG4gICAgICAvLyAyMy4xLjMuMyBNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXHJcbiAgICAgIC8vIDIzLjIuMy40IFNldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxyXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgICB2YXIgdGhhdCAgPSB0aGlzXHJcbiAgICAgICAgICAsIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KTtcclxuICAgICAgICBpZihlbnRyeSl7XHJcbiAgICAgICAgICB2YXIgbmV4dCA9IGVudHJ5Lm5cclxuICAgICAgICAgICAgLCBwcmV2ID0gZW50cnkucDtcclxuICAgICAgICAgIGRlbGV0ZSB0aGF0W08xXVtlbnRyeS5pXTtcclxuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xyXG4gICAgICAgICAgaWYocHJldilwcmV2Lm4gPSBuZXh0O1xyXG4gICAgICAgICAgaWYobmV4dCluZXh0LnAgPSBwcmV2O1xyXG4gICAgICAgICAgaWYodGhhdFtGSVJTVF0gPT0gZW50cnkpdGhhdFtGSVJTVF0gPSBuZXh0O1xyXG4gICAgICAgICAgaWYodGhhdFtMQVNUXSA9PSBlbnRyeSl0aGF0W0xBU1RdID0gcHJldjtcclxuICAgICAgICAgIHRoYXRbU0laRV0tLTtcclxuICAgICAgICB9IHJldHVybiAhIWVudHJ5O1xyXG4gICAgICB9LFxyXG4gICAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxuICAgICAgLy8gMjMuMS4zLjUgTWFwLnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICAgIGZvckVhY2g6IGZ1bmN0aW9uIGZvckVhY2goY2FsbGJhY2tmbiAvKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdLCAzKVxyXG4gICAgICAgICAgLCBlbnRyeTtcclxuICAgICAgICB3aGlsZShlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoaXNbRklSU1RdKXtcclxuICAgICAgICAgIGYoZW50cnkudiwgZW50cnkuaywgdGhpcyk7XHJcbiAgICAgICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcclxuICAgICAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgLy8gMjMuMS4zLjcgTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxyXG4gICAgICAvLyAyMy4yLjMuNyBTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcclxuICAgICAgaGFzOiBmdW5jdGlvbiBoYXMoa2V5KXtcclxuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh0aGlzLCBrZXkpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGlmKCQuREVTQykkLnNldERlc2MoQy5wcm90b3R5cGUsICdzaXplJywge1xyXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcmV0dXJuIGFzc2VydC5kZWYodGhpc1tTSVpFXSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIEM7XHJcbiAgfSxcclxuICBkZWY6IGZ1bmN0aW9uKHRoYXQsIGtleSwgdmFsdWUpe1xyXG4gICAgdmFyIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KVxyXG4gICAgICAsIHByZXYsIGluZGV4O1xyXG4gICAgLy8gY2hhbmdlIGV4aXN0aW5nIGVudHJ5XHJcbiAgICBpZihlbnRyeSl7XHJcbiAgICAgIGVudHJ5LnYgPSB2YWx1ZTtcclxuICAgIC8vIGNyZWF0ZSBuZXcgZW50cnlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoYXRbTEFTVF0gPSBlbnRyeSA9IHtcclxuICAgICAgICBpOiBpbmRleCA9IGZhc3RLZXkoa2V5LCB0cnVlKSwgLy8gPC0gaW5kZXhcclxuICAgICAgICBrOiBrZXksICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0ga2V5XHJcbiAgICAgICAgdjogdmFsdWUsICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXHJcbiAgICAgICAgcDogcHJldiA9IHRoYXRbTEFTVF0sICAgICAgICAgIC8vIDwtIHByZXZpb3VzIGVudHJ5XHJcbiAgICAgICAgbjogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgIC8vIDwtIG5leHQgZW50cnlcclxuICAgICAgICByOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gcmVtb3ZlZFxyXG4gICAgICB9O1xyXG4gICAgICBpZighdGhhdFtGSVJTVF0pdGhhdFtGSVJTVF0gPSBlbnRyeTtcclxuICAgICAgaWYocHJldilwcmV2Lm4gPSBlbnRyeTtcclxuICAgICAgdGhhdFtTSVpFXSsrO1xyXG4gICAgICAvLyBhZGQgdG8gaW5kZXhcclxuICAgICAgaWYoaW5kZXggIT0gJ0YnKXRoYXRbTzFdW2luZGV4XSA9IGVudHJ5O1xyXG4gICAgfSByZXR1cm4gdGhhdDtcclxuICB9LFxyXG4gIGdldEVudHJ5OiBnZXRFbnRyeSxcclxuICAvLyBhZGQgLmtleXMsIC52YWx1ZXMsIC5lbnRyaWVzLCBbQEBpdGVyYXRvcl1cclxuICAvLyAyMy4xLjMuNCwgMjMuMS4zLjgsIDIzLjEuMy4xMSwgMjMuMS4zLjEyLCAyMy4yLjMuNSwgMjMuMi4zLjgsIDIzLjIuMy4xMCwgMjMuMi4zLjExXHJcbiAgc2V0SXRlcjogZnVuY3Rpb24oQywgTkFNRSwgSVNfTUFQKXtcclxuICAgIHJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKEMsIE5BTUUsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcclxuICAgICAgc2V0KHRoaXMsIElURVIsIHtvOiBpdGVyYXRlZCwgazoga2luZH0pO1xyXG4gICAgfSwgZnVuY3Rpb24oKXtcclxuICAgICAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxyXG4gICAgICAgICwga2luZCAgPSBpdGVyLmtcclxuICAgICAgICAsIGVudHJ5ID0gaXRlci5sO1xyXG4gICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcclxuICAgICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XHJcbiAgICAgIC8vIGdldCBuZXh0IGVudHJ5XHJcbiAgICAgIGlmKCFpdGVyLm8gfHwgIShpdGVyLmwgPSBlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IGl0ZXIub1tGSVJTVF0pKXtcclxuICAgICAgICAvLyBvciBmaW5pc2ggdGhlIGl0ZXJhdGlvblxyXG4gICAgICAgIGl0ZXIubyA9IHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4gc3RlcCgxKTtcclxuICAgICAgfVxyXG4gICAgICAvLyByZXR1cm4gc3RlcCBieSBraW5kXHJcbiAgICAgIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgZW50cnkuayk7XHJcbiAgICAgIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgZW50cnkudik7XHJcbiAgICAgIHJldHVybiBzdGVwKDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7XHJcbiAgICB9LCBJU19NQVAgPyAnZW50cmllcycgOiAndmFsdWVzJyAsICFJU19NQVAsIHRydWUpO1xyXG4gIH1cclxufTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXHJcbnZhciAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgZm9yT2YgPSByZXF1aXJlKCcuLyQuZm9yLW9mJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTkFNRSl7XHJcbiAgJGRlZigkZGVmLlAsIE5BTUUsIHtcclxuICAgIHRvSlNPTjogZnVuY3Rpb24gdG9KU09OKCl7XHJcbiAgICAgIHZhciBhcnIgPSBbXTtcclxuICAgICAgZm9yT2YodGhpcywgZmFsc2UsIGFyci5wdXNoLCBhcnIpO1xyXG4gICAgICByZXR1cm4gYXJyO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBzYWZlICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZVxyXG4gICwgYXNzZXJ0ICAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXHJcbiAgLCBmb3JPZiAgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcclxuICAsIF9oYXMgICAgICA9ICQuaGFzXHJcbiAgLCBpc09iamVjdCAgPSAkLmlzT2JqZWN0XHJcbiAgLCBoaWRlICAgICAgPSAkLmhpZGVcclxuICAsIGlzRnJvemVuICA9IE9iamVjdC5pc0Zyb3plbiB8fCAkLmNvcmUuT2JqZWN0LmlzRnJvemVuXHJcbiAgLCBpZCAgICAgICAgPSAwXHJcbiAgLCBJRCAgICAgICAgPSBzYWZlKCdpZCcpXHJcbiAgLCBXRUFLICAgICAgPSBzYWZlKCd3ZWFrJylcclxuICAsIExFQUsgICAgICA9IHNhZmUoJ2xlYWsnKVxyXG4gICwgbWV0aG9kICAgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKVxyXG4gICwgZmluZCAgICAgID0gbWV0aG9kKDUpXHJcbiAgLCBmaW5kSW5kZXggPSBtZXRob2QoNik7XHJcbmZ1bmN0aW9uIGZpbmRGcm96ZW4oc3RvcmUsIGtleSl7XHJcbiAgcmV0dXJuIGZpbmQoc3RvcmUuYXJyYXksIGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpdFswXSA9PT0ga2V5O1xyXG4gIH0pO1xyXG59XHJcbi8vIGZhbGxiYWNrIGZvciBmcm96ZW4ga2V5c1xyXG5mdW5jdGlvbiBsZWFrU3RvcmUodGhhdCl7XHJcbiAgcmV0dXJuIHRoYXRbTEVBS10gfHwgaGlkZSh0aGF0LCBMRUFLLCB7XHJcbiAgICBhcnJheTogW10sXHJcbiAgICBnZXQ6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHZhciBlbnRyeSA9IGZpbmRGcm96ZW4odGhpcywga2V5KTtcclxuICAgICAgaWYoZW50cnkpcmV0dXJuIGVudHJ5WzFdO1xyXG4gICAgfSxcclxuICAgIGhhczogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgcmV0dXJuICEhZmluZEZyb3plbih0aGlzLCBrZXkpO1xyXG4gICAgfSxcclxuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XHJcbiAgICAgIHZhciBlbnRyeSA9IGZpbmRGcm96ZW4odGhpcywga2V5KTtcclxuICAgICAgaWYoZW50cnkpZW50cnlbMV0gPSB2YWx1ZTtcclxuICAgICAgZWxzZSB0aGlzLmFycmF5LnB1c2goW2tleSwgdmFsdWVdKTtcclxuICAgIH0sXHJcbiAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgdmFyIGluZGV4ID0gZmluZEluZGV4KHRoaXMuYXJyYXksIGZ1bmN0aW9uKGl0KXtcclxuICAgICAgICByZXR1cm4gaXRbMF0gPT09IGtleTtcclxuICAgICAgfSk7XHJcbiAgICAgIGlmKH5pbmRleCl0aGlzLmFycmF5LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIHJldHVybiAhIX5pbmRleDtcclxuICAgIH1cclxuICB9KVtMRUFLXTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgZ2V0Q29uc3RydWN0b3I6IGZ1bmN0aW9uKE5BTUUsIElTX01BUCwgQURERVIpe1xyXG4gICAgZnVuY3Rpb24gQygpe1xyXG4gICAgICAkLnNldChhc3NlcnQuaW5zdCh0aGlzLCBDLCBOQU1FKSwgSUQsIGlkKyspO1xyXG4gICAgICB2YXIgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGlzW0FEREVSXSwgdGhpcyk7XHJcbiAgICB9XHJcbiAgICAkLm1peChDLnByb3RvdHlwZSwge1xyXG4gICAgICAvLyAyMy4zLjMuMiBXZWFrTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxyXG4gICAgICAvLyAyMy40LjMuMyBXZWFrU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXHJcbiAgICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcclxuICAgICAgICBpZihpc0Zyb3plbihrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcylbJ2RlbGV0ZSddKGtleSk7XHJcbiAgICAgICAgcmV0dXJuIF9oYXMoa2V5LCBXRUFLKSAmJiBfaGFzKGtleVtXRUFLXSwgdGhpc1tJRF0pICYmIGRlbGV0ZSBrZXlbV0VBS11bdGhpc1tJRF1dO1xyXG4gICAgICB9LFxyXG4gICAgICAvLyAyMy4zLjMuNCBXZWFrTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxyXG4gICAgICAvLyAyMy40LjMuNCBXZWFrU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXHJcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSl7XHJcbiAgICAgICAgaWYoIWlzT2JqZWN0KGtleSkpcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGlmKGlzRnJvemVuKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKS5oYXMoa2V5KTtcclxuICAgICAgICByZXR1cm4gX2hhcyhrZXksIFdFQUspICYmIF9oYXMoa2V5W1dFQUtdLCB0aGlzW0lEXSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIEM7XHJcbiAgfSxcclxuICBkZWY6IGZ1bmN0aW9uKHRoYXQsIGtleSwgdmFsdWUpe1xyXG4gICAgaWYoaXNGcm96ZW4oYXNzZXJ0Lm9iaihrZXkpKSl7XHJcbiAgICAgIGxlYWtTdG9yZSh0aGF0KS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBfaGFzKGtleSwgV0VBSykgfHwgaGlkZShrZXksIFdFQUssIHt9KTtcclxuICAgICAga2V5W1dFQUtdW3RoYXRbSURdXSA9IHZhbHVlO1xyXG4gICAgfSByZXR1cm4gdGhhdDtcclxuICB9LFxyXG4gIGxlYWtTdG9yZTogbGVha1N0b3JlLFxyXG4gIFdFQUs6IFdFQUssXHJcbiAgSUQ6IElEXHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIEJVR0dZID0gcmVxdWlyZSgnLi8kLml0ZXInKS5CVUdHWVxyXG4gICwgZm9yT2YgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcclxuICAsIHNwZWNpZXMgPSByZXF1aXJlKCcuLyQuc3BlY2llcycpXHJcbiAgLCBhc3NlcnRJbnN0YW5jZSA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5pbnN0O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOQU1FLCBtZXRob2RzLCBjb21tb24sIElTX01BUCwgSVNfV0VBSyl7XHJcbiAgdmFyIEJhc2UgID0gJC5nW05BTUVdXHJcbiAgICAsIEMgICAgID0gQmFzZVxyXG4gICAgLCBBRERFUiA9IElTX01BUCA/ICdzZXQnIDogJ2FkZCdcclxuICAgICwgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlXHJcbiAgICAsIE8gICAgID0ge307XHJcbiAgZnVuY3Rpb24gZml4TWV0aG9kKEtFWSwgQ0hBSU4pe1xyXG4gICAgdmFyIG1ldGhvZCA9IHByb3RvW0tFWV07XHJcbiAgICBpZigkLkZXKXByb3RvW0tFWV0gPSBmdW5jdGlvbihhLCBiKXtcclxuICAgICAgdmFyIHJlc3VsdCA9IG1ldGhvZC5jYWxsKHRoaXMsIGEgPT09IDAgPyAwIDogYSwgYik7XHJcbiAgICAgIHJldHVybiBDSEFJTiA/IHRoaXMgOiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gIH1cclxuICBpZighJC5pc0Z1bmN0aW9uKEMpIHx8ICEoSVNfV0VBSyB8fCAhQlVHR1kgJiYgcHJvdG8uZm9yRWFjaCAmJiBwcm90by5lbnRyaWVzKSl7XHJcbiAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBjb25zdHJ1Y3RvclxyXG4gICAgQyA9IGNvbW1vbi5nZXRDb25zdHJ1Y3RvcihOQU1FLCBJU19NQVAsIEFEREVSKTtcclxuICAgICQubWl4KEMucHJvdG90eXBlLCBtZXRob2RzKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIGluc3QgID0gbmV3IENcclxuICAgICAgLCBjaGFpbiA9IGluc3RbQURERVJdKElTX1dFQUsgPyB7fSA6IC0wLCAxKVxyXG4gICAgICAsIGJ1Z2d5WmVybztcclxuICAgIC8vIHdyYXAgZm9yIGluaXQgY29sbGVjdGlvbnMgZnJvbSBpdGVyYWJsZVxyXG4gICAgaWYoIXJlcXVpcmUoJy4vJC5pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpeyBuZXcgQyhpdGVyKTsgfSkpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xyXG4gICAgICBDID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBhc3NlcnRJbnN0YW5jZSh0aGlzLCBDLCBOQU1FKTtcclxuICAgICAgICB2YXIgdGhhdCAgICAgPSBuZXcgQmFzZVxyXG4gICAgICAgICAgLCBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xyXG4gICAgICAgIHJldHVybiB0aGF0O1xyXG4gICAgICB9O1xyXG4gICAgICBDLnByb3RvdHlwZSA9IHByb3RvO1xyXG4gICAgICBpZigkLkZXKXByb3RvLmNvbnN0cnVjdG9yID0gQztcclxuICAgIH1cclxuICAgIElTX1dFQUsgfHwgaW5zdC5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwga2V5KXtcclxuICAgICAgYnVnZ3laZXJvID0gMSAvIGtleSA9PT0gLUluZmluaXR5O1xyXG4gICAgfSk7XHJcbiAgICAvLyBmaXggY29udmVydGluZyAtMCBrZXkgdG8gKzBcclxuICAgIGlmKGJ1Z2d5WmVybyl7XHJcbiAgICAgIGZpeE1ldGhvZCgnZGVsZXRlJyk7XHJcbiAgICAgIGZpeE1ldGhvZCgnaGFzJyk7XHJcbiAgICAgIElTX01BUCAmJiBmaXhNZXRob2QoJ2dldCcpO1xyXG4gICAgfVxyXG4gICAgLy8gKyBmaXggLmFkZCAmIC5zZXQgZm9yIGNoYWluaW5nXHJcbiAgICBpZihidWdneVplcm8gfHwgY2hhaW4gIT09IGluc3QpZml4TWV0aG9kKEFEREVSLCB0cnVlKTtcclxuICB9XHJcblxyXG4gIHJlcXVpcmUoJy4vJC5jb2YnKS5zZXQoQywgTkFNRSk7XHJcblxyXG4gIE9bTkFNRV0gPSBDO1xyXG4gICRkZWYoJGRlZi5HICsgJGRlZi5XICsgJGRlZi5GICogKEMgIT0gQmFzZSksIE8pO1xyXG4gIHNwZWNpZXMoQyk7XHJcbiAgc3BlY2llcygkLmNvcmVbTkFNRV0pOyAvLyBmb3Igd3JhcHBlclxyXG5cclxuICBpZighSVNfV0VBSyljb21tb24uc2V0SXRlcihDLCBOQU1FLCBJU19NQVApO1xyXG5cclxuICByZXR1cm4gQztcclxufTsiLCIvLyBPcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcclxudmFyIGFzc2VydEZ1bmN0aW9uID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLmZuO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xyXG4gIGFzc2VydEZ1bmN0aW9uKGZuKTtcclxuICBpZih+bGVuZ3RoICYmIHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XHJcbiAgc3dpdGNoKGxlbmd0aCl7XHJcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcclxuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XHJcbiAgICB9O1xyXG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xyXG4gICAgfTtcclxuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xyXG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcclxuICAgIH07XHJcbiAgfSByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XHJcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxufTsiLCJ2YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBnbG9iYWwgICAgID0gJC5nXHJcbiAgLCBjb3JlICAgICAgID0gJC5jb3JlXHJcbiAgLCBpc0Z1bmN0aW9uID0gJC5pc0Z1bmN0aW9uO1xyXG5mdW5jdGlvbiBjdHgoZm4sIHRoYXQpe1xyXG4gIHJldHVybiBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XHJcbiAgfTtcclxufVxyXG5nbG9iYWwuY29yZSA9IGNvcmU7XHJcbi8vIHR5cGUgYml0bWFwXHJcbiRkZWYuRiA9IDE7ICAvLyBmb3JjZWRcclxuJGRlZi5HID0gMjsgIC8vIGdsb2JhbFxyXG4kZGVmLlMgPSA0OyAgLy8gc3RhdGljXHJcbiRkZWYuUCA9IDg7ICAvLyBwcm90b1xyXG4kZGVmLkIgPSAxNjsgLy8gYmluZFxyXG4kZGVmLlcgPSAzMjsgLy8gd3JhcFxyXG5mdW5jdGlvbiAkZGVmKHR5cGUsIG5hbWUsIHNvdXJjZSl7XHJcbiAgdmFyIGtleSwgb3duLCBvdXQsIGV4cFxyXG4gICAgLCBpc0dsb2JhbCA9IHR5cGUgJiAkZGVmLkdcclxuICAgICwgdGFyZ2V0ICAgPSBpc0dsb2JhbCA/IGdsb2JhbCA6IHR5cGUgJiAkZGVmLlNcclxuICAgICAgICA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pLnByb3RvdHlwZVxyXG4gICAgLCBleHBvcnRzICA9IGlzR2xvYmFsID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XHJcbiAgaWYoaXNHbG9iYWwpc291cmNlID0gbmFtZTtcclxuICBmb3Ioa2V5IGluIHNvdXJjZSl7XHJcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcclxuICAgIG93biA9ICEodHlwZSAmICRkZWYuRikgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXQ7XHJcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxyXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcclxuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XHJcbiAgICBpZih0eXBlICYgJGRlZi5CICYmIG93billeHAgPSBjdHgob3V0LCBnbG9iYWwpO1xyXG4gICAgZWxzZSBleHAgPSB0eXBlICYgJGRlZi5QICYmIGlzRnVuY3Rpb24ob3V0KSA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xyXG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxyXG4gICAgaWYodGFyZ2V0ICYmICFvd24pe1xyXG4gICAgICBpZihpc0dsb2JhbCl0YXJnZXRba2V5XSA9IG91dDtcclxuICAgICAgZWxzZSBkZWxldGUgdGFyZ2V0W2tleV0gJiYgJC5oaWRlKHRhcmdldCwga2V5LCBvdXQpO1xyXG4gICAgfVxyXG4gICAgLy8gZXhwb3J0XHJcbiAgICBpZihleHBvcnRzW2tleV0gIT0gb3V0KSQuaGlkZShleHBvcnRzLCBrZXksIGV4cCk7XHJcbiAgfVxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gJGRlZjsiLCJ2YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgZG9jdW1lbnQgPSAkLmcuZG9jdW1lbnRcclxuICAsIGlzT2JqZWN0ID0gJC5pc09iamVjdFxyXG4gIC8vIGluIG9sZCBJRSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0J1xyXG4gICwgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xyXG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XHJcbn07IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XHJcbiAgdmFyIGtleXMgICAgICAgPSAkLmdldEtleXMoaXQpXHJcbiAgICAsIGdldERlc2MgICAgPSAkLmdldERlc2NcclxuICAgICwgZ2V0U3ltYm9scyA9ICQuZ2V0U3ltYm9scztcclxuICBpZihnZXRTeW1ib2xzKSQuZWFjaC5jYWxsKGdldFN5bWJvbHMoaXQpLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgaWYoZ2V0RGVzYyhpdCwga2V5KS5lbnVtZXJhYmxlKWtleXMucHVzaChrZXkpO1xyXG4gIH0pO1xyXG4gIHJldHVybiBrZXlzO1xyXG59OyIsInZhciBjdHggID0gcmVxdWlyZSgnLi8kLmN0eCcpXHJcbiAgLCBnZXQgID0gcmVxdWlyZSgnLi8kLml0ZXInKS5nZXRcclxuICAsIGNhbGwgPSByZXF1aXJlKCcuLyQuaXRlci1jYWxsJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0KXtcclxuICB2YXIgaXRlcmF0b3IgPSBnZXQoaXRlcmFibGUpXHJcbiAgICAsIGYgICAgICAgID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpXHJcbiAgICAsIHN0ZXA7XHJcbiAgd2hpbGUoIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lKXtcclxuICAgIGlmKGNhbGwoaXRlcmF0b3IsIGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpID09PSBmYWxzZSl7XHJcbiAgICAgIHJldHVybiBjYWxsLmNsb3NlKGl0ZXJhdG9yKTtcclxuICAgIH1cclxuICB9XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkKXtcclxuICAkLkZXICAgPSB0cnVlO1xyXG4gICQucGF0aCA9ICQuZztcclxuICByZXR1cm4gJDtcclxufTsiLCIvLyBGYXN0IGFwcGx5XHJcbi8vIGh0dHA6Ly9qc3BlcmYubG5raXQuY29tL2Zhc3QtYXBwbHkvNVxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCBhcmdzLCB0aGF0KXtcclxuICB2YXIgdW4gPSB0aGF0ID09PSB1bmRlZmluZWQ7XHJcbiAgc3dpdGNoKGFyZ3MubGVuZ3RoKXtcclxuICAgIGNhc2UgMDogcmV0dXJuIHVuID8gZm4oKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQpO1xyXG4gICAgY2FzZSAxOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0pO1xyXG4gICAgY2FzZSAyOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xyXG4gICAgY2FzZSAzOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xyXG4gICAgY2FzZSA0OiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10pO1xyXG4gICAgY2FzZSA1OiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10sIGFyZ3NbNF0pO1xyXG4gIH0gcmV0dXJuICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzKTtcclxufTsiLCJ2YXIgYXNzZXJ0T2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9iajtcclxuZnVuY3Rpb24gY2xvc2UoaXRlcmF0b3Ipe1xyXG4gIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XHJcbiAgaWYocmV0ICE9PSB1bmRlZmluZWQpYXNzZXJ0T2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XHJcbn1cclxuZnVuY3Rpb24gY2FsbChpdGVyYXRvciwgZm4sIHZhbHVlLCBlbnRyaWVzKXtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGVudHJpZXMgPyBmbihhc3NlcnRPYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XHJcbiAgfSBjYXRjaChlKXtcclxuICAgIGNsb3NlKGl0ZXJhdG9yKTtcclxuICAgIHRocm93IGU7XHJcbiAgfVxyXG59XHJcbmNhbGwuY2xvc2UgPSBjbG9zZTtcclxubW9kdWxlLmV4cG9ydHMgPSBjYWxsOyIsInZhciAkZGVmICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICQgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjb2YgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcclxuICAsICRpdGVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJylcclxuICAsIFNZTUJPTF9JVEVSQVRPUiA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxyXG4gICwgRkZfSVRFUkFUT1IgICAgID0gJ0BAaXRlcmF0b3InXHJcbiAgLCBLRVlTICAgICAgICAgICAgPSAna2V5cydcclxuICAsIFZBTFVFUyAgICAgICAgICA9ICd2YWx1ZXMnXHJcbiAgLCBJdGVyYXRvcnMgICAgICAgPSAkaXRlci5JdGVyYXRvcnM7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0Upe1xyXG4gICRpdGVyLmNyZWF0ZShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XHJcbiAgZnVuY3Rpb24gY3JlYXRlTWV0aG9kKGtpbmQpe1xyXG4gICAgZnVuY3Rpb24gJCQodGhhdCl7XHJcbiAgICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhhdCwga2luZCk7XHJcbiAgICB9XHJcbiAgICBzd2l0Y2goa2luZCl7XHJcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKXsgcmV0dXJuICQkKHRoaXMpOyB9O1xyXG4gICAgICBjYXNlIFZBTFVFUzogcmV0dXJuIGZ1bmN0aW9uIHZhbHVlcygpeyByZXR1cm4gJCQodGhpcyk7IH07XHJcbiAgICB9IHJldHVybiBmdW5jdGlvbiBlbnRyaWVzKCl7IHJldHVybiAkJCh0aGlzKTsgfTtcclxuICB9XHJcbiAgdmFyIFRBRyAgICAgID0gTkFNRSArICcgSXRlcmF0b3InXHJcbiAgICAsIHByb3RvICAgID0gQmFzZS5wcm90b3R5cGVcclxuICAgICwgX25hdGl2ZSAgPSBwcm90b1tTWU1CT0xfSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdXHJcbiAgICAsIF9kZWZhdWx0ID0gX25hdGl2ZSB8fCBjcmVhdGVNZXRob2QoREVGQVVMVClcclxuICAgICwgbWV0aG9kcywga2V5O1xyXG4gIC8vIEZpeCBuYXRpdmVcclxuICBpZihfbmF0aXZlKXtcclxuICAgIHZhciBJdGVyYXRvclByb3RvdHlwZSA9ICQuZ2V0UHJvdG8oX2RlZmF1bHQuY2FsbChuZXcgQmFzZSkpO1xyXG4gICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xyXG4gICAgY29mLnNldChJdGVyYXRvclByb3RvdHlwZSwgVEFHLCB0cnVlKTtcclxuICAgIC8vIEZGIGZpeFxyXG4gICAgaWYoJC5GVyAmJiAkLmhhcyhwcm90bywgRkZfSVRFUkFUT1IpKSRpdGVyLnNldChJdGVyYXRvclByb3RvdHlwZSwgJC50aGF0KTtcclxuICB9XHJcbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXHJcbiAgaWYoJC5GVykkaXRlci5zZXQocHJvdG8sIF9kZWZhdWx0KTtcclxuICAvLyBQbHVnIGZvciBsaWJyYXJ5XHJcbiAgSXRlcmF0b3JzW05BTUVdID0gX2RlZmF1bHQ7XHJcbiAgSXRlcmF0b3JzW1RBR10gID0gJC50aGF0O1xyXG4gIGlmKERFRkFVTFQpe1xyXG4gICAgbWV0aG9kcyA9IHtcclxuICAgICAga2V5czogICAgSVNfU0VUICAgICAgICAgICAgPyBfZGVmYXVsdCA6IGNyZWF0ZU1ldGhvZChLRVlTKSxcclxuICAgICAgdmFsdWVzOiAgREVGQVVMVCA9PSBWQUxVRVMgPyBfZGVmYXVsdCA6IGNyZWF0ZU1ldGhvZChWQUxVRVMpLFxyXG4gICAgICBlbnRyaWVzOiBERUZBVUxUICE9IFZBTFVFUyA/IF9kZWZhdWx0IDogY3JlYXRlTWV0aG9kKCdlbnRyaWVzJylcclxuICAgIH07XHJcbiAgICBpZihGT1JDRSlmb3Ioa2V5IGluIG1ldGhvZHMpe1xyXG4gICAgICBpZighKGtleSBpbiBwcm90bykpJC5oaWRlKHByb3RvLCBrZXksIG1ldGhvZHNba2V5XSk7XHJcbiAgICB9IGVsc2UgJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAkaXRlci5CVUdHWSwgTkFNRSwgbWV0aG9kcyk7XHJcbiAgfVxyXG59OyIsInZhciBTWU1CT0xfSVRFUkFUT1IgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcclxuICAsIFNBRkVfQ0xPU0lORyAgICA9IGZhbHNlO1xyXG50cnkge1xyXG4gIHZhciByaXRlciA9IFs3XVtTWU1CT0xfSVRFUkFUT1JdKCk7XHJcbiAgcml0ZXJbJ3JldHVybiddID0gZnVuY3Rpb24oKXsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcclxuICBBcnJheS5mcm9tKHJpdGVyLCBmdW5jdGlvbigpeyB0aHJvdyAyOyB9KTtcclxufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMpe1xyXG4gIGlmKCFTQUZFX0NMT1NJTkcpcmV0dXJuIGZhbHNlO1xyXG4gIHZhciBzYWZlID0gZmFsc2U7XHJcbiAgdHJ5IHtcclxuICAgIHZhciBhcnIgID0gWzddXHJcbiAgICAgICwgaXRlciA9IGFycltTWU1CT0xfSVRFUkFUT1JdKCk7XHJcbiAgICBpdGVyLm5leHQgPSBmdW5jdGlvbigpeyBzYWZlID0gdHJ1ZTsgfTtcclxuICAgIGFycltTWU1CT0xfSVRFUkFUT1JdID0gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXI7IH07XHJcbiAgICBleGVjKGFycik7XHJcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG4gIHJldHVybiBzYWZlO1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGNvZiAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCBhc3NlcnRPYmplY3QgICAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5vYmpcclxuICAsIFNZTUJPTF9JVEVSQVRPUiAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXHJcbiAgLCBGRl9JVEVSQVRPUiAgICAgICA9ICdAQGl0ZXJhdG9yJ1xyXG4gICwgSXRlcmF0b3JzICAgICAgICAgPSB7fVxyXG4gICwgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcclxuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcclxuc2V0SXRlcmF0b3IoSXRlcmF0b3JQcm90b3R5cGUsICQudGhhdCk7XHJcbmZ1bmN0aW9uIHNldEl0ZXJhdG9yKE8sIHZhbHVlKXtcclxuICAkLmhpZGUoTywgU1lNQk9MX0lURVJBVE9SLCB2YWx1ZSk7XHJcbiAgLy8gQWRkIGl0ZXJhdG9yIGZvciBGRiBpdGVyYXRvciBwcm90b2NvbFxyXG4gIGlmKEZGX0lURVJBVE9SIGluIFtdKSQuaGlkZShPLCBGRl9JVEVSQVRPUiwgdmFsdWUpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAvLyBTYWZhcmkgaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXHJcbiAgQlVHR1k6ICdrZXlzJyBpbiBbXSAmJiAhKCduZXh0JyBpbiBbXS5rZXlzKCkpLFxyXG4gIEl0ZXJhdG9yczogSXRlcmF0b3JzLFxyXG4gIHN0ZXA6IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcclxuICAgIHJldHVybiB7dmFsdWU6IHZhbHVlLCBkb25lOiAhIWRvbmV9O1xyXG4gIH0sXHJcbiAgaXM6IGZ1bmN0aW9uKGl0KXtcclxuICAgIHZhciBPICAgICAgPSBPYmplY3QoaXQpXHJcbiAgICAgICwgU3ltYm9sID0gJC5nLlN5bWJvbFxyXG4gICAgICAsIFNZTSAgICA9IFN5bWJvbCAmJiBTeW1ib2wuaXRlcmF0b3IgfHwgRkZfSVRFUkFUT1I7XHJcbiAgICByZXR1cm4gU1lNIGluIE8gfHwgU1lNQk9MX0lURVJBVE9SIGluIE8gfHwgJC5oYXMoSXRlcmF0b3JzLCBjb2YuY2xhc3NvZihPKSk7XHJcbiAgfSxcclxuICBnZXQ6IGZ1bmN0aW9uKGl0KXtcclxuICAgIHZhciBTeW1ib2wgID0gJC5nLlN5bWJvbFxyXG4gICAgICAsIGV4dCAgICAgPSBpdFtTeW1ib2wgJiYgU3ltYm9sLml0ZXJhdG9yIHx8IEZGX0lURVJBVE9SXVxyXG4gICAgICAsIGdldEl0ZXIgPSBleHQgfHwgaXRbU1lNQk9MX0lURVJBVE9SXSB8fCBJdGVyYXRvcnNbY29mLmNsYXNzb2YoaXQpXTtcclxuICAgIHJldHVybiBhc3NlcnRPYmplY3QoZ2V0SXRlci5jYWxsKGl0KSk7XHJcbiAgfSxcclxuICBzZXQ6IHNldEl0ZXJhdG9yLFxyXG4gIGNyZWF0ZTogZnVuY3Rpb24oQ29uc3RydWN0b3IsIE5BTUUsIG5leHQsIHByb3RvKXtcclxuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9ICQuY3JlYXRlKHByb3RvIHx8IEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogJC5kZXNjKDEsIG5leHQpfSk7XHJcbiAgICBjb2Yuc2V0KENvbnN0cnVjdG9yLCBOQU1FICsgJyBJdGVyYXRvcicpO1xyXG4gIH1cclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciBnbG9iYWwgPSB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpXHJcbiAgLCBjb3JlICAgPSB7fVxyXG4gICwgZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHlcclxuICAsIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHlcclxuICAsIGNlaWwgID0gTWF0aC5jZWlsXHJcbiAgLCBmbG9vciA9IE1hdGguZmxvb3JcclxuICAsIG1heCAgID0gTWF0aC5tYXhcclxuICAsIG1pbiAgID0gTWF0aC5taW47XHJcbi8vIFRoZSBlbmdpbmUgd29ya3MgZmluZSB3aXRoIGRlc2NyaXB0b3JzPyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5LlxyXG52YXIgREVTQyA9ICEhZnVuY3Rpb24oKXtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiAyOyB9fSkuYSA9PSAyO1xyXG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxufSgpO1xyXG52YXIgaGlkZSA9IGNyZWF0ZURlZmluZXIoMSk7XHJcbi8vIDcuMS40IFRvSW50ZWdlclxyXG5mdW5jdGlvbiB0b0ludGVnZXIoaXQpe1xyXG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xyXG59XHJcbmZ1bmN0aW9uIGRlc2MoYml0bWFwLCB2YWx1ZSl7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVudW1lcmFibGUgIDogIShiaXRtYXAgJiAxKSxcclxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcclxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcclxuICAgIHZhbHVlICAgICAgIDogdmFsdWVcclxuICB9O1xyXG59XHJcbmZ1bmN0aW9uIHNpbXBsZVNldChvYmplY3QsIGtleSwgdmFsdWUpe1xyXG4gIG9iamVjdFtrZXldID0gdmFsdWU7XHJcbiAgcmV0dXJuIG9iamVjdDtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGVEZWZpbmVyKGJpdG1hcCl7XHJcbiAgcmV0dXJuIERFU0MgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xyXG4gICAgcmV0dXJuICQuc2V0RGVzYyhvYmplY3QsIGtleSwgZGVzYyhiaXRtYXAsIHZhbHVlKSk7XHJcbiAgfSA6IHNpbXBsZVNldDtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNPYmplY3QoaXQpe1xyXG4gIHJldHVybiBpdCAhPT0gbnVsbCAmJiAodHlwZW9mIGl0ID09ICdvYmplY3QnIHx8IHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nKTtcclxufVxyXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGl0KXtcclxuICByZXR1cm4gdHlwZW9mIGl0ID09ICdmdW5jdGlvbic7XHJcbn1cclxuZnVuY3Rpb24gYXNzZXJ0RGVmaW5lZChpdCl7XHJcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcclxuICByZXR1cm4gaXQ7XHJcbn1cclxuXHJcbnZhciAkID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuZncnKSh7XHJcbiAgZzogZ2xvYmFsLFxyXG4gIGNvcmU6IGNvcmUsXHJcbiAgaHRtbDogZ2xvYmFsLmRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcclxuICAvLyBodHRwOi8vanNwZXJmLmNvbS9jb3JlLWpzLWlzb2JqZWN0XHJcbiAgaXNPYmplY3Q6ICAgaXNPYmplY3QsXHJcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcclxuICBpdDogZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGl0O1xyXG4gIH0sXHJcbiAgdGhhdDogZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH0sXHJcbiAgLy8gNy4xLjQgVG9JbnRlZ2VyXHJcbiAgdG9JbnRlZ2VyOiB0b0ludGVnZXIsXHJcbiAgLy8gNy4xLjE1IFRvTGVuZ3RoXHJcbiAgdG9MZW5ndGg6IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXHJcbiAgfSxcclxuICB0b0luZGV4OiBmdW5jdGlvbihpbmRleCwgbGVuZ3RoKXtcclxuICAgIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcclxuICAgIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xyXG4gIH0sXHJcbiAgaGFzOiBmdW5jdGlvbihpdCwga2V5KXtcclxuICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xyXG4gIH0sXHJcbiAgY3JlYXRlOiAgICAgT2JqZWN0LmNyZWF0ZSxcclxuICBnZXRQcm90bzogICBPYmplY3QuZ2V0UHJvdG90eXBlT2YsXHJcbiAgREVTQzogICAgICAgREVTQyxcclxuICBkZXNjOiAgICAgICBkZXNjLFxyXG4gIGdldERlc2M6ICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXHJcbiAgc2V0RGVzYzogICAgZGVmaW5lUHJvcGVydHksXHJcbiAgc2V0RGVzY3M6ICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMsXHJcbiAgZ2V0S2V5czogICAgT2JqZWN0LmtleXMsXHJcbiAgZ2V0TmFtZXM6ICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMsXHJcbiAgZ2V0U3ltYm9sczogT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyxcclxuICBhc3NlcnREZWZpbmVkOiBhc3NlcnREZWZpbmVkLFxyXG4gIC8vIER1bW15LCBmaXggZm9yIG5vdCBhcnJheS1saWtlIEVTMyBzdHJpbmcgaW4gZXM1IG1vZHVsZVxyXG4gIEVTNU9iamVjdDogT2JqZWN0LFxyXG4gIHRvT2JqZWN0OiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gJC5FUzVPYmplY3QoYXNzZXJ0RGVmaW5lZChpdCkpO1xyXG4gIH0sXHJcbiAgaGlkZTogaGlkZSxcclxuICBkZWY6IGNyZWF0ZURlZmluZXIoMCksXHJcbiAgc2V0OiBnbG9iYWwuU3ltYm9sID8gc2ltcGxlU2V0IDogaGlkZSxcclxuICBtaXg6IGZ1bmN0aW9uKHRhcmdldCwgc3JjKXtcclxuICAgIGZvcih2YXIga2V5IGluIHNyYyloaWRlKHRhcmdldCwga2V5LCBzcmNba2V5XSk7XHJcbiAgICByZXR1cm4gdGFyZ2V0O1xyXG4gIH0sXHJcbiAgZWFjaDogW10uZm9yRWFjaFxyXG59KTtcclxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cclxuaWYodHlwZW9mIF9fZSAhPSAndW5kZWZpbmVkJylfX2UgPSBjb3JlO1xyXG5pZih0eXBlb2YgX19nICE9ICd1bmRlZmluZWQnKV9fZyA9IGdsb2JhbDsiLCJ2YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgZWwpe1xyXG4gIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KG9iamVjdClcclxuICAgICwga2V5cyAgID0gJC5nZXRLZXlzKE8pXHJcbiAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXHJcbiAgICAsIGluZGV4ICA9IDBcclxuICAgICwga2V5O1xyXG4gIHdoaWxlKGxlbmd0aCA+IGluZGV4KWlmKE9ba2V5ID0ga2V5c1tpbmRleCsrXV0gPT09IGVsKXJldHVybiBrZXk7XHJcbn07IiwidmFyICQgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBhc3NlcnRPYmplY3QgPSByZXF1aXJlKCcuLyQuYXNzZXJ0Jykub2JqO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG93bktleXMoaXQpe1xyXG4gIGFzc2VydE9iamVjdChpdCk7XHJcbiAgdmFyIGtleXMgICAgICAgPSAkLmdldE5hbWVzKGl0KVxyXG4gICAgLCBnZXRTeW1ib2xzID0gJC5nZXRTeW1ib2xzO1xyXG4gIHJldHVybiBnZXRTeW1ib2xzID8ga2V5cy5jb25jYXQoZ2V0U3ltYm9scyhpdCkpIDoga2V5cztcclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgaW52b2tlID0gcmVxdWlyZSgnLi8kLmludm9rZScpXHJcbiAgLCBhc3NlcnRGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5mbjtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigvKiAuLi5wYXJncyAqLyl7XHJcbiAgdmFyIGZuICAgICA9IGFzc2VydEZ1bmN0aW9uKHRoaXMpXHJcbiAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICwgcGFyZ3MgID0gQXJyYXkobGVuZ3RoKVxyXG4gICAgLCBpICAgICAgPSAwXHJcbiAgICAsIF8gICAgICA9ICQucGF0aC5fXHJcbiAgICAsIGhvbGRlciA9IGZhbHNlO1xyXG4gIHdoaWxlKGxlbmd0aCA+IGkpaWYoKHBhcmdzW2ldID0gYXJndW1lbnRzW2krK10pID09PSBfKWhvbGRlciA9IHRydWU7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgdmFyIHRoYXQgICAgPSB0aGlzXHJcbiAgICAgICwgX2xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgLCBqID0gMCwgayA9IDAsIGFyZ3M7XHJcbiAgICBpZighaG9sZGVyICYmICFfbGVuZ3RoKXJldHVybiBpbnZva2UoZm4sIHBhcmdzLCB0aGF0KTtcclxuICAgIGFyZ3MgPSBwYXJncy5zbGljZSgpO1xyXG4gICAgaWYoaG9sZGVyKWZvcig7bGVuZ3RoID4gajsgaisrKWlmKGFyZ3Nbal0gPT09IF8pYXJnc1tqXSA9IGFyZ3VtZW50c1trKytdO1xyXG4gICAgd2hpbGUoX2xlbmd0aCA+IGspYXJncy5wdXNoKGFyZ3VtZW50c1trKytdKTtcclxuICAgIHJldHVybiBpbnZva2UoZm4sIGFyZ3MsIHRoYXQpO1xyXG4gIH07XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHJlZ0V4cCwgcmVwbGFjZSwgaXNTdGF0aWMpe1xyXG4gIHZhciByZXBsYWNlciA9IHJlcGxhY2UgPT09IE9iamVjdChyZXBsYWNlKSA/IGZ1bmN0aW9uKHBhcnQpe1xyXG4gICAgcmV0dXJuIHJlcGxhY2VbcGFydF07XHJcbiAgfSA6IHJlcGxhY2U7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBTdHJpbmcoaXNTdGF0aWMgPyBpdCA6IHRoaXMpLnJlcGxhY2UocmVnRXhwLCByZXBsYWNlcik7XHJcbiAgfTtcclxufTsiLCIvLyBXb3JrcyB3aXRoIF9fcHJvdG9fXyBvbmx5LiBPbGQgdjggY2FuJ3Qgd29yayB3aXRoIG51bGwgcHJvdG8gb2JqZWN0cy5cclxuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cclxudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBhc3NlcnQgPSByZXF1aXJlKCcuLyQuYXNzZXJ0Jyk7XHJcbmZ1bmN0aW9uIGNoZWNrKE8sIHByb3RvKXtcclxuICBhc3NlcnQub2JqKE8pO1xyXG4gIGFzc2VydChwcm90byA9PT0gbnVsbCB8fCAkLmlzT2JqZWN0KHByb3RvKSwgcHJvdG8sIFwiOiBjYW4ndCBzZXQgYXMgcHJvdG90eXBlIVwiKTtcclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBzZXQ6IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCAoJ19fcHJvdG9fXycgaW4ge30gLy8gZXNsaW50LWRpc2FibGUtbGluZVxyXG4gICAgPyBmdW5jdGlvbihidWdneSwgc2V0KXtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgc2V0ID0gcmVxdWlyZSgnLi8kLmN0eCcpKEZ1bmN0aW9uLmNhbGwsICQuZ2V0RGVzYyhPYmplY3QucHJvdG90eXBlLCAnX19wcm90b19fJykuc2V0LCAyKTtcclxuICAgICAgICAgIHNldCh7fSwgW10pO1xyXG4gICAgICAgIH0gY2F0Y2goZSl7IGJ1Z2d5ID0gdHJ1ZTsgfVxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihPLCBwcm90byl7XHJcbiAgICAgICAgICBjaGVjayhPLCBwcm90byk7XHJcbiAgICAgICAgICBpZihidWdneSlPLl9fcHJvdG9fXyA9IHByb3RvO1xyXG4gICAgICAgICAgZWxzZSBzZXQoTywgcHJvdG8pO1xyXG4gICAgICAgICAgcmV0dXJuIE87XHJcbiAgICAgICAgfTtcclxuICAgICAgfSgpXHJcbiAgICA6IHVuZGVmaW5lZCksXHJcbiAgY2hlY2s6IGNoZWNrXHJcbn07IiwidmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vJC53a3MnKSgnc3BlY2llcycpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEMpe1xyXG4gIGlmKCQuREVTQyAmJiAhKFNQRUNJRVMgaW4gQykpJC5zZXREZXNjKEMsIFNQRUNJRVMsIHtcclxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIGdldDogJC50aGF0XHJcbiAgfSk7XHJcbn07IiwiLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XHJcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxyXG52YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFRPX1NUUklORyl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoYXQsIHBvcyl7XHJcbiAgICB2YXIgcyA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhhdCkpXHJcbiAgICAgICwgaSA9ICQudG9JbnRlZ2VyKHBvcylcclxuICAgICAgLCBsID0gcy5sZW5ndGhcclxuICAgICAgLCBhLCBiO1xyXG4gICAgaWYoaSA8IDAgfHwgaSA+PSBsKXJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcclxuICAgIGEgPSBzLmNoYXJDb2RlQXQoaSk7XHJcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsXHJcbiAgICAgIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxyXG4gICAgICAgID8gVE9fU1RSSU5HID8gcy5jaGFyQXQoaSkgOiBhXHJcbiAgICAgICAgOiBUT19TVFJJTkcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XHJcbiAgfTtcclxufTsiLCIvLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1zdHJhd21hbjpzdHJpbmdfcGFkZGluZ1xyXG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIHJlcGVhdCA9IHJlcXVpcmUoJy4vJC5zdHJpbmctcmVwZWF0Jyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRoYXQsIG1pbkxlbmd0aCwgZmlsbENoYXIsIGxlZnQpe1xyXG4gIC8vIDEuIExldCBPIGJlIENoZWNrT2JqZWN0Q29lcmNpYmxlKHRoaXMgdmFsdWUpLlxyXG4gIC8vIDIuIExldCBTIGJlIFRvU3RyaW5nKE8pLlxyXG4gIHZhciBTID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGF0KSk7XHJcbiAgLy8gNC4gSWYgaW50TWluTGVuZ3RoIGlzIHVuZGVmaW5lZCwgcmV0dXJuIFMuXHJcbiAgaWYobWluTGVuZ3RoID09PSB1bmRlZmluZWQpcmV0dXJuIFM7XHJcbiAgLy8gNC4gTGV0IGludE1pbkxlbmd0aCBiZSBUb0ludGVnZXIobWluTGVuZ3RoKS5cclxuICB2YXIgaW50TWluTGVuZ3RoID0gJC50b0ludGVnZXIobWluTGVuZ3RoKTtcclxuICAvLyA1LiBMZXQgZmlsbExlbiBiZSB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgaW4gUyBtaW51cyBpbnRNaW5MZW5ndGguXHJcbiAgdmFyIGZpbGxMZW4gPSBpbnRNaW5MZW5ndGggLSBTLmxlbmd0aDtcclxuICAvLyA2LiBJZiBmaWxsTGVuIDwgMCwgdGhlbiB0aHJvdyBhIFJhbmdlRXJyb3IgZXhjZXB0aW9uLlxyXG4gIC8vIDcuIElmIGZpbGxMZW4gaXMgK+KIniwgdGhlbiB0aHJvdyBhIFJhbmdlRXJyb3IgZXhjZXB0aW9uLlxyXG4gIGlmKGZpbGxMZW4gPCAwIHx8IGZpbGxMZW4gPT09IEluZmluaXR5KXtcclxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdDYW5ub3Qgc2F0aXNmeSBzdHJpbmcgbGVuZ3RoICcgKyBtaW5MZW5ndGggKyAnIGZvciBzdHJpbmc6ICcgKyBTKTtcclxuICB9XHJcbiAgLy8gOC4gTGV0IHNGaWxsU3RyIGJlIHRoZSBzdHJpbmcgcmVwcmVzZW50ZWQgYnkgZmlsbFN0ci5cclxuICAvLyA5LiBJZiBzRmlsbFN0ciBpcyB1bmRlZmluZWQsIGxldCBzRmlsbFN0ciBiZSBhIHNwYWNlIGNoYXJhY3Rlci5cclxuICB2YXIgc0ZpbGxTdHIgPSBmaWxsQ2hhciA9PT0gdW5kZWZpbmVkID8gJyAnIDogU3RyaW5nKGZpbGxDaGFyKTtcclxuICAvLyAxMC4gTGV0IHNGaWxsVmFsIGJlIGEgU3RyaW5nIG1hZGUgb2Ygc0ZpbGxTdHIsIHJlcGVhdGVkIHVudGlsIGZpbGxMZW4gaXMgbWV0LlxyXG4gIHZhciBzRmlsbFZhbCA9IHJlcGVhdC5jYWxsKHNGaWxsU3RyLCBNYXRoLmNlaWwoZmlsbExlbiAvIHNGaWxsU3RyLmxlbmd0aCkpO1xyXG4gIC8vIHRydW5jYXRlIGlmIHdlIG92ZXJmbG93ZWRcclxuICBpZihzRmlsbFZhbC5sZW5ndGggPiBmaWxsTGVuKXNGaWxsVmFsID0gbGVmdFxyXG4gICAgPyBzRmlsbFZhbC5zbGljZShzRmlsbFZhbC5sZW5ndGggLSBmaWxsTGVuKVxyXG4gICAgOiBzRmlsbFZhbC5zbGljZSgwLCBmaWxsTGVuKTtcclxuICAvLyAxMS4gUmV0dXJuIGEgc3RyaW5nIG1hZGUgZnJvbSBzRmlsbFZhbCwgZm9sbG93ZWQgYnkgUy5cclxuICAvLyAxMS4gUmV0dXJuIGEgU3RyaW5nIG1hZGUgZnJvbSBTLCBmb2xsb3dlZCBieSBzRmlsbFZhbC5cclxuICByZXR1cm4gbGVmdCA/IHNGaWxsVmFsLmNvbmNhdChTKSA6IFMuY29uY2F0KHNGaWxsVmFsKTtcclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkID0gcmVxdWlyZSgnLi8kJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlcGVhdChjb3VudCl7XHJcbiAgdmFyIHN0ciA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAsIHJlcyA9ICcnXHJcbiAgICAsIG4gICA9ICQudG9JbnRlZ2VyKGNvdW50KTtcclxuICBpZihuIDwgMCB8fCBuID09IEluZmluaXR5KXRocm93IFJhbmdlRXJyb3IoXCJDb3VudCBjYW4ndCBiZSBuZWdhdGl2ZVwiKTtcclxuICBmb3IoO24gPiAwOyAobiA+Pj49IDEpICYmIChzdHIgKz0gc3RyKSlpZihuICYgMSlyZXMgKz0gc3RyO1xyXG4gIHJldHVybiByZXM7XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGN0eCAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxyXG4gICwgY29mICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCBpbnZva2UgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcclxuICAsIGNlbCAgICA9IHJlcXVpcmUoJy4vJC5kb20tY3JlYXRlJylcclxuICAsIGdsb2JhbCAgICAgICAgICAgICA9ICQuZ1xyXG4gICwgaXNGdW5jdGlvbiAgICAgICAgID0gJC5pc0Z1bmN0aW9uXHJcbiAgLCBodG1sICAgICAgICAgICAgICAgPSAkLmh0bWxcclxuICAsIHByb2Nlc3MgICAgICAgICAgICA9IGdsb2JhbC5wcm9jZXNzXHJcbiAgLCBzZXRUYXNrICAgICAgICAgICAgPSBnbG9iYWwuc2V0SW1tZWRpYXRlXHJcbiAgLCBjbGVhclRhc2sgICAgICAgICAgPSBnbG9iYWwuY2xlYXJJbW1lZGlhdGVcclxuICAsIHBvc3RNZXNzYWdlICAgICAgICA9IGdsb2JhbC5wb3N0TWVzc2FnZVxyXG4gICwgYWRkRXZlbnRMaXN0ZW5lciAgID0gZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXJcclxuICAsIE1lc3NhZ2VDaGFubmVsICAgICA9IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbFxyXG4gICwgY291bnRlciAgICAgICAgICAgID0gMFxyXG4gICwgcXVldWUgICAgICAgICAgICAgID0ge31cclxuICAsIE9OUkVBRFlTVEFURUNIQU5HRSA9ICdvbnJlYWR5c3RhdGVjaGFuZ2UnXHJcbiAgLCBkZWZlciwgY2hhbm5lbCwgcG9ydDtcclxuZnVuY3Rpb24gcnVuKCl7XHJcbiAgdmFyIGlkID0gK3RoaXM7XHJcbiAgaWYoJC5oYXMocXVldWUsIGlkKSl7XHJcbiAgICB2YXIgZm4gPSBxdWV1ZVtpZF07XHJcbiAgICBkZWxldGUgcXVldWVbaWRdO1xyXG4gICAgZm4oKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gbGlzdG5lcihldmVudCl7XHJcbiAgcnVuLmNhbGwoZXZlbnQuZGF0YSk7XHJcbn1cclxuLy8gTm9kZS5qcyAwLjkrICYgSUUxMCsgaGFzIHNldEltbWVkaWF0ZSwgb3RoZXJ3aXNlOlxyXG5pZighaXNGdW5jdGlvbihzZXRUYXNrKSB8fCAhaXNGdW5jdGlvbihjbGVhclRhc2spKXtcclxuICBzZXRUYXNrID0gZnVuY3Rpb24oZm4pe1xyXG4gICAgdmFyIGFyZ3MgPSBbXSwgaSA9IDE7XHJcbiAgICB3aGlsZShhcmd1bWVudHMubGVuZ3RoID4gaSlhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xyXG4gICAgcXVldWVbKytjb3VudGVyXSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIGludm9rZShpc0Z1bmN0aW9uKGZuKSA/IGZuIDogRnVuY3Rpb24oZm4pLCBhcmdzKTtcclxuICAgIH07XHJcbiAgICBkZWZlcihjb3VudGVyKTtcclxuICAgIHJldHVybiBjb3VudGVyO1xyXG4gIH07XHJcbiAgY2xlYXJUYXNrID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcclxuICB9O1xyXG4gIC8vIE5vZGUuanMgMC44LVxyXG4gIGlmKGNvZihwcm9jZXNzKSA9PSAncHJvY2Vzcycpe1xyXG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY3R4KHJ1biwgaWQsIDEpKTtcclxuICAgIH07XHJcbiAgLy8gTW9kZXJuIGJyb3dzZXJzLCBza2lwIGltcGxlbWVudGF0aW9uIGZvciBXZWJXb3JrZXJzXHJcbiAgLy8gSUU4IGhhcyBwb3N0TWVzc2FnZSwgYnV0IGl0J3Mgc3luYyAmIHR5cGVvZiBpdHMgcG9zdE1lc3NhZ2UgaXMgb2JqZWN0XHJcbiAgfSBlbHNlIGlmKGFkZEV2ZW50TGlzdGVuZXIgJiYgaXNGdW5jdGlvbihwb3N0TWVzc2FnZSkgJiYgIWdsb2JhbC5pbXBvcnRTY3JpcHRzKXtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBwb3N0TWVzc2FnZShpZCwgJyonKTtcclxuICAgIH07XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdG5lciwgZmFsc2UpO1xyXG4gIC8vIFdlYldvcmtlcnNcclxuICB9IGVsc2UgaWYoaXNGdW5jdGlvbihNZXNzYWdlQ2hhbm5lbCkpe1xyXG4gICAgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcclxuICAgIHBvcnQgICAgPSBjaGFubmVsLnBvcnQyO1xyXG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaXN0bmVyO1xyXG4gICAgZGVmZXIgPSBjdHgocG9ydC5wb3N0TWVzc2FnZSwgcG9ydCwgMSk7XHJcbiAgLy8gSUU4LVxyXG4gIH0gZWxzZSBpZihPTlJFQURZU1RBVEVDSEFOR0UgaW4gY2VsKCdzY3JpcHQnKSl7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgaHRtbC5hcHBlbmRDaGlsZChjZWwoJ3NjcmlwdCcpKVtPTlJFQURZU1RBVEVDSEFOR0VdID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBodG1sLnJlbW92ZUNoaWxkKHRoaXMpO1xyXG4gICAgICAgIHJ1bi5jYWxsKGlkKTtcclxuICAgICAgfTtcclxuICAgIH07XHJcbiAgLy8gUmVzdCBvbGQgYnJvd3NlcnNcclxuICB9IGVsc2Uge1xyXG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIHNldFRpbWVvdXQoY3R4KHJ1biwgaWQsIDEpLCAwKTtcclxuICAgIH07XHJcbiAgfVxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHNldDogICBzZXRUYXNrLFxyXG4gIGNsZWFyOiBjbGVhclRhc2tcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMpe1xyXG4gIHRyeSB7XHJcbiAgICBleGVjKCk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSBjYXRjaChlKXtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufTsiLCJ2YXIgc2lkID0gMDtcclxuZnVuY3Rpb24gdWlkKGtleSl7XHJcbiAgcmV0dXJuICdTeW1ib2woJyArIGtleSArICcpXycgKyAoKytzaWQgKyBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygzNik7XHJcbn1cclxudWlkLnNhZmUgPSByZXF1aXJlKCcuLyQnKS5nLlN5bWJvbCB8fCB1aWQ7XHJcbm1vZHVsZS5leHBvcnRzID0gdWlkOyIsIi8vIDIyLjEuMy4zMSBBcnJheS5wcm90b3R5cGVbQEB1bnNjb3BhYmxlc11cclxudmFyICQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIFVOU0NPUEFCTEVTID0gcmVxdWlyZSgnLi8kLndrcycpKCd1bnNjb3BhYmxlcycpO1xyXG5pZigkLkZXICYmICEoVU5TQ09QQUJMRVMgaW4gW10pKSQuaGlkZShBcnJheS5wcm90b3R5cGUsIFVOU0NPUEFCTEVTLCB7fSk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcclxuICBpZigkLkZXKVtdW1VOU0NPUEFCTEVTXVtrZXldID0gdHJ1ZTtcclxufTsiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi8kJykuZ1xyXG4gICwgc3RvcmUgID0ge307XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XHJcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XHJcbiAgICBnbG9iYWwuU3ltYm9sICYmIGdsb2JhbC5TeW1ib2xbbmFtZV0gfHwgcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ1N5bWJvbC4nICsgbmFtZSkpO1xyXG59OyIsInZhciAkICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGNlbCAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZG9tLWNyZWF0ZScpXHJcbiAgLCBjb2YgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCAkZGVmICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBpbnZva2UgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmludm9rZScpXHJcbiAgLCBhcnJheU1ldGhvZCAgICAgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKVxyXG4gICwgSUVfUFJPVE8gICAgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdfX3Byb3RvX18nKVxyXG4gICwgYXNzZXJ0ICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxyXG4gICwgYXNzZXJ0T2JqZWN0ICAgICA9IGFzc2VydC5vYmpcclxuICAsIE9iamVjdFByb3RvICAgICAgPSBPYmplY3QucHJvdG90eXBlXHJcbiAgLCBBICAgICAgICAgICAgICAgID0gW11cclxuICAsIHNsaWNlICAgICAgICAgICAgPSBBLnNsaWNlXHJcbiAgLCBpbmRleE9mICAgICAgICAgID0gQS5pbmRleE9mXHJcbiAgLCBjbGFzc29mICAgICAgICAgID0gY29mLmNsYXNzb2ZcclxuICAsIGhhcyAgICAgICAgICAgICAgPSAkLmhhc1xyXG4gICwgZGVmaW5lUHJvcGVydHkgICA9ICQuc2V0RGVzY1xyXG4gICwgZ2V0T3duRGVzY3JpcHRvciA9ICQuZ2V0RGVzY1xyXG4gICwgZGVmaW5lUHJvcGVydGllcyA9ICQuc2V0RGVzY3NcclxuICAsIGlzRnVuY3Rpb24gICAgICAgPSAkLmlzRnVuY3Rpb25cclxuICAsIHRvT2JqZWN0ICAgICAgICAgPSAkLnRvT2JqZWN0XHJcbiAgLCB0b0xlbmd0aCAgICAgICAgID0gJC50b0xlbmd0aFxyXG4gICwgSUU4X0RPTV9ERUZJTkUgICA9IGZhbHNlXHJcbiAgLCAkaW5kZXhPZiAgICAgICAgID0gcmVxdWlyZSgnLi8kLmFycmF5LWluY2x1ZGVzJykoZmFsc2UpXHJcbiAgLCAkZm9yRWFjaCAgICAgICAgID0gYXJyYXlNZXRob2QoMClcclxuICAsICRtYXAgICAgICAgICAgICAgPSBhcnJheU1ldGhvZCgxKVxyXG4gICwgJGZpbHRlciAgICAgICAgICA9IGFycmF5TWV0aG9kKDIpXHJcbiAgLCAkc29tZSAgICAgICAgICAgID0gYXJyYXlNZXRob2QoMylcclxuICAsICRldmVyeSAgICAgICAgICAgPSBhcnJheU1ldGhvZCg0KTtcclxuXHJcbmlmKCEkLkRFU0Mpe1xyXG4gIHRyeSB7XHJcbiAgICBJRThfRE9NX0RFRklORSA9IGRlZmluZVByb3BlcnR5KGNlbCgnZGl2JyksICd4JyxcclxuICAgICAge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDg7IH19XHJcbiAgICApLnggPT0gODtcclxuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XHJcbiAgJC5zZXREZXNjID0gZnVuY3Rpb24oTywgUCwgQXR0cmlidXRlcyl7XHJcbiAgICBpZihJRThfRE9NX0RFRklORSl0cnkge1xyXG4gICAgICByZXR1cm4gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyk7XHJcbiAgICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XHJcbiAgICBpZignZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCEnKTtcclxuICAgIGlmKCd2YWx1ZScgaW4gQXR0cmlidXRlcylhc3NlcnRPYmplY3QoTylbUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xyXG4gICAgcmV0dXJuIE87XHJcbiAgfTtcclxuICAkLmdldERlc2MgPSBmdW5jdGlvbihPLCBQKXtcclxuICAgIGlmKElFOF9ET01fREVGSU5FKXRyeSB7XHJcbiAgICAgIHJldHVybiBnZXRPd25EZXNjcmlwdG9yKE8sIFApO1xyXG4gICAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG4gICAgaWYoaGFzKE8sIFApKXJldHVybiAkLmRlc2MoIU9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoTywgUCksIE9bUF0pO1xyXG4gIH07XHJcbiAgJC5zZXREZXNjcyA9IGRlZmluZVByb3BlcnRpZXMgPSBmdW5jdGlvbihPLCBQcm9wZXJ0aWVzKXtcclxuICAgIGFzc2VydE9iamVjdChPKTtcclxuICAgIHZhciBrZXlzICAgPSAkLmdldEtleXMoUHJvcGVydGllcylcclxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAsIGkgPSAwXHJcbiAgICAgICwgUDtcclxuICAgIHdoaWxlKGxlbmd0aCA+IGkpJC5zZXREZXNjKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xyXG4gICAgcmV0dXJuIE87XHJcbiAgfTtcclxufVxyXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICEkLkRFU0MsICdPYmplY3QnLCB7XHJcbiAgLy8gMTkuMS4yLjYgLyAxNS4yLjMuMyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXHJcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAkLmdldERlc2MsXHJcbiAgLy8gMTkuMS4yLjQgLyAxNS4yLjMuNiBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcclxuICBkZWZpbmVQcm9wZXJ0eTogJC5zZXREZXNjLFxyXG4gIC8vIDE5LjEuMi4zIC8gMTUuMi4zLjcgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcylcclxuICBkZWZpbmVQcm9wZXJ0aWVzOiBkZWZpbmVQcm9wZXJ0aWVzXHJcbn0pO1xyXG5cclxuICAvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXHJcbnZhciBrZXlzMSA9ICgnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSwnICtcclxuICAgICAgICAgICAgJ3RvTG9jYWxlU3RyaW5nLHRvU3RyaW5nLHZhbHVlT2YnKS5zcGxpdCgnLCcpXHJcbiAgLy8gQWRkaXRpb25hbCBrZXlzIGZvciBnZXRPd25Qcm9wZXJ0eU5hbWVzXHJcbiAgLCBrZXlzMiA9IGtleXMxLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpXHJcbiAgLCBrZXlzTGVuMSA9IGtleXMxLmxlbmd0aDtcclxuXHJcbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXHJcbnZhciBjcmVhdGVEaWN0ID0gZnVuY3Rpb24oKXtcclxuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xyXG4gIHZhciBpZnJhbWUgPSBjZWwoJ2lmcmFtZScpXHJcbiAgICAsIGkgICAgICA9IGtleXNMZW4xXHJcbiAgICAsIGd0ICAgICA9ICc+J1xyXG4gICAgLCBpZnJhbWVEb2N1bWVudDtcclxuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAkLmh0bWwuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcclxuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXHJcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcclxuICAvLyBodG1sLnJlbW92ZUNoaWxkKGlmcmFtZSk7XHJcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcclxuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XHJcbiAgaWZyYW1lRG9jdW1lbnQud3JpdGUoJzxzY3JpcHQ+ZG9jdW1lbnQuRj1PYmplY3Q8L3NjcmlwdCcgKyBndCk7XHJcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcclxuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcclxuICB3aGlsZShpLS0pZGVsZXRlIGNyZWF0ZURpY3QucHJvdG90eXBlW2tleXMxW2ldXTtcclxuICByZXR1cm4gY3JlYXRlRGljdCgpO1xyXG59O1xyXG5mdW5jdGlvbiBjcmVhdGVHZXRLZXlzKG5hbWVzLCBsZW5ndGgpe1xyXG4gIHJldHVybiBmdW5jdGlvbihvYmplY3Qpe1xyXG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcclxuICAgICAgLCBpICAgICAgPSAwXHJcbiAgICAgICwgcmVzdWx0ID0gW11cclxuICAgICAgLCBrZXk7XHJcbiAgICBmb3Ioa2V5IGluIE8paWYoa2V5ICE9IElFX1BST1RPKWhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7XHJcbiAgICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXHJcbiAgICB3aGlsZShsZW5ndGggPiBpKWlmKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSl7XHJcbiAgICAgIH5pbmRleE9mLmNhbGwocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH07XHJcbn1cclxuZnVuY3Rpb24gaXNQcmltaXRpdmUoaXQpeyByZXR1cm4gISQuaXNPYmplY3QoaXQpOyB9XHJcbmZ1bmN0aW9uIEVtcHR5KCl7fVxyXG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtcclxuICAvLyAxOS4xLjIuOSAvIDE1LjIuMy4yIE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxyXG4gIGdldFByb3RvdHlwZU9mOiAkLmdldFByb3RvID0gJC5nZXRQcm90byB8fCBmdW5jdGlvbihPKXtcclxuICAgIE8gPSBPYmplY3QoYXNzZXJ0LmRlZihPKSk7XHJcbiAgICBpZihoYXMoTywgSUVfUFJPVE8pKXJldHVybiBPW0lFX1BST1RPXTtcclxuICAgIGlmKGlzRnVuY3Rpb24oTy5jb25zdHJ1Y3RvcikgJiYgTyBpbnN0YW5jZW9mIE8uY29uc3RydWN0b3Ipe1xyXG4gICAgICByZXR1cm4gTy5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XHJcbiAgICB9IHJldHVybiBPIGluc3RhbmNlb2YgT2JqZWN0ID8gT2JqZWN0UHJvdG8gOiBudWxsO1xyXG4gIH0sXHJcbiAgLy8gMTkuMS4yLjcgLyAxNS4yLjMuNCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxyXG4gIGdldE93blByb3BlcnR5TmFtZXM6ICQuZ2V0TmFtZXMgPSAkLmdldE5hbWVzIHx8IGNyZWF0ZUdldEtleXMoa2V5czIsIGtleXMyLmxlbmd0aCwgdHJ1ZSksXHJcbiAgLy8gMTkuMS4yLjIgLyAxNS4yLjMuNSBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXHJcbiAgY3JlYXRlOiAkLmNyZWF0ZSA9ICQuY3JlYXRlIHx8IGZ1bmN0aW9uKE8sIC8qPyovUHJvcGVydGllcyl7XHJcbiAgICB2YXIgcmVzdWx0O1xyXG4gICAgaWYoTyAhPT0gbnVsbCl7XHJcbiAgICAgIEVtcHR5LnByb3RvdHlwZSA9IGFzc2VydE9iamVjdChPKTtcclxuICAgICAgcmVzdWx0ID0gbmV3IEVtcHR5KCk7XHJcbiAgICAgIEVtcHR5LnByb3RvdHlwZSA9IG51bGw7XHJcbiAgICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2Ygc2hpbVxyXG4gICAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcclxuICAgIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XHJcbiAgICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZGVmaW5lUHJvcGVydGllcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xyXG4gIH0sXHJcbiAgLy8gMTkuMS4yLjE0IC8gMTUuMi4zLjE0IE9iamVjdC5rZXlzKE8pXHJcbiAga2V5czogJC5nZXRLZXlzID0gJC5nZXRLZXlzIHx8IGNyZWF0ZUdldEtleXMoa2V5czEsIGtleXNMZW4xLCBmYWxzZSksXHJcbiAgLy8gMTkuMS4yLjE3IC8gMTUuMi4zLjggT2JqZWN0LnNlYWwoTylcclxuICBzZWFsOiAkLml0LCAvLyA8LSBjYXBcclxuICAvLyAxOS4xLjIuNSAvIDE1LjIuMy45IE9iamVjdC5mcmVlemUoTylcclxuICBmcmVlemU6ICQuaXQsIC8vIDwtIGNhcFxyXG4gIC8vIDE5LjEuMi4xNSAvIDE1LjIuMy4xMCBPYmplY3QucHJldmVudEV4dGVuc2lvbnMoTylcclxuICBwcmV2ZW50RXh0ZW5zaW9uczogJC5pdCwgLy8gPC0gY2FwXHJcbiAgLy8gMTkuMS4yLjEzIC8gMTUuMi4zLjExIE9iamVjdC5pc1NlYWxlZChPKVxyXG4gIGlzU2VhbGVkOiBpc1ByaW1pdGl2ZSwgLy8gPC0gY2FwXHJcbiAgLy8gMTkuMS4yLjEyIC8gMTUuMi4zLjEyIE9iamVjdC5pc0Zyb3plbihPKVxyXG4gIGlzRnJvemVuOiBpc1ByaW1pdGl2ZSwgLy8gPC0gY2FwXHJcbiAgLy8gMTkuMS4yLjExIC8gMTUuMi4zLjEzIE9iamVjdC5pc0V4dGVuc2libGUoTylcclxuICBpc0V4dGVuc2libGU6ICQuaXNPYmplY3QgLy8gPC0gY2FwXHJcbn0pO1xyXG5cclxuLy8gMTkuMi4zLjIgLyAxNS4zLjQuNSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCh0aGlzQXJnLCBhcmdzLi4uKVxyXG4kZGVmKCRkZWYuUCwgJ0Z1bmN0aW9uJywge1xyXG4gIGJpbmQ6IGZ1bmN0aW9uKHRoYXQgLyosIGFyZ3MuLi4gKi8pe1xyXG4gICAgdmFyIGZuICAgICAgID0gYXNzZXJ0LmZuKHRoaXMpXHJcbiAgICAgICwgcGFydEFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XHJcbiAgICBmdW5jdGlvbiBib3VuZCgvKiBhcmdzLi4uICovKXtcclxuICAgICAgdmFyIGFyZ3MgPSBwYXJ0QXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcclxuICAgICAgcmV0dXJuIGludm9rZShmbiwgYXJncywgdGhpcyBpbnN0YW5jZW9mIGJvdW5kID8gJC5jcmVhdGUoZm4ucHJvdG90eXBlKSA6IHRoYXQpO1xyXG4gICAgfVxyXG4gICAgaWYoZm4ucHJvdG90eXBlKWJvdW5kLnByb3RvdHlwZSA9IGZuLnByb3RvdHlwZTtcclxuICAgIHJldHVybiBib3VuZDtcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gRml4IGZvciBub3QgYXJyYXktbGlrZSBFUzMgc3RyaW5nXHJcbmZ1bmN0aW9uIGFycmF5TWV0aG9kRml4KGZuKXtcclxuICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiBmbi5hcHBseSgkLkVTNU9iamVjdCh0aGlzKSwgYXJndW1lbnRzKTtcclxuICB9O1xyXG59XHJcbmlmKCEoMCBpbiBPYmplY3QoJ3onKSAmJiAneidbMF0gPT0gJ3onKSl7XHJcbiAgJC5FUzVPYmplY3QgPSBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XHJcbiAgfTtcclxufVxyXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqICgkLkVTNU9iamVjdCAhPSBPYmplY3QpLCAnQXJyYXknLCB7XHJcbiAgc2xpY2U6IGFycmF5TWV0aG9kRml4KHNsaWNlKSxcclxuICBqb2luOiBhcnJheU1ldGhvZEZpeChBLmpvaW4pXHJcbn0pO1xyXG5cclxuLy8gMjIuMS4yLjIgLyAxNS40LjMuMiBBcnJheS5pc0FycmF5KGFyZylcclxuJGRlZigkZGVmLlMsICdBcnJheScsIHtcclxuICBpc0FycmF5OiBmdW5jdGlvbihhcmcpe1xyXG4gICAgcmV0dXJuIGNvZihhcmcpID09ICdBcnJheSc7XHJcbiAgfVxyXG59KTtcclxuZnVuY3Rpb24gY3JlYXRlQXJyYXlSZWR1Y2UoaXNSaWdodCl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKGNhbGxiYWNrZm4sIG1lbW8pe1xyXG4gICAgYXNzZXJ0LmZuKGNhbGxiYWNrZm4pO1xyXG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KHRoaXMpXHJcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICwgaW5kZXggID0gaXNSaWdodCA/IGxlbmd0aCAtIDEgOiAwXHJcbiAgICAgICwgaSAgICAgID0gaXNSaWdodCA/IC0xIDogMTtcclxuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPCAyKWZvcig7Oyl7XHJcbiAgICAgIGlmKGluZGV4IGluIE8pe1xyXG4gICAgICAgIG1lbW8gPSBPW2luZGV4XTtcclxuICAgICAgICBpbmRleCArPSBpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGluZGV4ICs9IGk7XHJcbiAgICAgIGFzc2VydChpc1JpZ2h0ID8gaW5kZXggPj0gMCA6IGxlbmd0aCA+IGluZGV4LCAnUmVkdWNlIG9mIGVtcHR5IGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZScpO1xyXG4gICAgfVxyXG4gICAgZm9yKDtpc1JpZ2h0ID8gaW5kZXggPj0gMCA6IGxlbmd0aCA+IGluZGV4OyBpbmRleCArPSBpKWlmKGluZGV4IGluIE8pe1xyXG4gICAgICBtZW1vID0gY2FsbGJhY2tmbihtZW1vLCBPW2luZGV4XSwgaW5kZXgsIHRoaXMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1lbW87XHJcbiAgfTtcclxufVxyXG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xyXG4gIC8vIDIyLjEuMy4xMCAvIDE1LjQuNC4xOCBBcnJheS5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxyXG4gIGZvckVhY2g6ICQuZWFjaCA9ICQuZWFjaCB8fCBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICByZXR1cm4gJGZvckVhY2godGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcclxuICB9LFxyXG4gIC8vIDIyLjEuMy4xNSAvIDE1LjQuNC4xOSBBcnJheS5wcm90b3R5cGUubWFwKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXHJcbiAgbWFwOiBmdW5jdGlvbiBtYXAoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgIHJldHVybiAkbWFwKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XHJcbiAgfSxcclxuICAvLyAyMi4xLjMuNyAvIDE1LjQuNC4yMCBBcnJheS5wcm90b3R5cGUuZmlsdGVyKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXHJcbiAgZmlsdGVyOiBmdW5jdGlvbiBmaWx0ZXIoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgIHJldHVybiAkZmlsdGVyKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XHJcbiAgfSxcclxuICAvLyAyMi4xLjMuMjMgLyAxNS40LjQuMTcgQXJyYXkucHJvdG90eXBlLnNvbWUoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcclxuICBzb21lOiBmdW5jdGlvbiBzb21lKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICByZXR1cm4gJHNvbWUodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcclxuICB9LFxyXG4gIC8vIDIyLjEuMy41IC8gMTUuNC40LjE2IEFycmF5LnByb3RvdHlwZS5ldmVyeShjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxyXG4gIGV2ZXJ5OiBmdW5jdGlvbiBldmVyeShjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgcmV0dXJuICRldmVyeSh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xyXG4gIH0sXHJcbiAgLy8gMjIuMS4zLjE4IC8gMTUuNC40LjIxIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UoY2FsbGJhY2tmbiBbLCBpbml0aWFsVmFsdWVdKVxyXG4gIHJlZHVjZTogY3JlYXRlQXJyYXlSZWR1Y2UoZmFsc2UpLFxyXG4gIC8vIDIyLjEuMy4xOSAvIDE1LjQuNC4yMiBBcnJheS5wcm90b3R5cGUucmVkdWNlUmlnaHQoY2FsbGJhY2tmbiBbLCBpbml0aWFsVmFsdWVdKVxyXG4gIHJlZHVjZVJpZ2h0OiBjcmVhdGVBcnJheVJlZHVjZSh0cnVlKSxcclxuICAvLyAyMi4xLjMuMTEgLyAxNS40LjQuMTQgQXJyYXkucHJvdG90eXBlLmluZGV4T2Yoc2VhcmNoRWxlbWVudCBbLCBmcm9tSW5kZXhdKVxyXG4gIGluZGV4T2Y6IGluZGV4T2YgPSBpbmRleE9mIHx8IGZ1bmN0aW9uIGluZGV4T2YoZWwgLyosIGZyb21JbmRleCA9IDAgKi8pe1xyXG4gICAgcmV0dXJuICRpbmRleE9mKHRoaXMsIGVsLCBhcmd1bWVudHNbMV0pO1xyXG4gIH0sXHJcbiAgLy8gMjIuMS4zLjE0IC8gMTUuNC40LjE1IEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZihzZWFyY2hFbGVtZW50IFssIGZyb21JbmRleF0pXHJcbiAgbGFzdEluZGV4T2Y6IGZ1bmN0aW9uKGVsLCBmcm9tSW5kZXggLyogPSBAWyotMV0gKi8pe1xyXG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KHRoaXMpXHJcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICwgaW5kZXggID0gbGVuZ3RoIC0gMTtcclxuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPiAxKWluZGV4ID0gTWF0aC5taW4oaW5kZXgsICQudG9JbnRlZ2VyKGZyb21JbmRleCkpO1xyXG4gICAgaWYoaW5kZXggPCAwKWluZGV4ID0gdG9MZW5ndGgobGVuZ3RoICsgaW5kZXgpO1xyXG4gICAgZm9yKDtpbmRleCA+PSAwOyBpbmRleC0tKWlmKGluZGV4IGluIE8paWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBpbmRleDtcclxuICAgIHJldHVybiAtMTtcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gMjEuMS4zLjI1IC8gMTUuNS40LjIwIFN0cmluZy5wcm90b3R5cGUudHJpbSgpXHJcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge3RyaW06IHJlcXVpcmUoJy4vJC5yZXBsYWNlcicpKC9eXFxzKihbXFxzXFxTXSpcXFMpP1xccyokLywgJyQxJyl9KTtcclxuXHJcbi8vIDIwLjMuMy4xIC8gMTUuOS40LjQgRGF0ZS5ub3coKVxyXG4kZGVmKCRkZWYuUywgJ0RhdGUnLCB7bm93OiBmdW5jdGlvbigpe1xyXG4gIHJldHVybiArbmV3IERhdGU7XHJcbn19KTtcclxuXHJcbmZ1bmN0aW9uIGx6KG51bSl7XHJcbiAgcmV0dXJuIG51bSA+IDkgPyBudW0gOiAnMCcgKyBudW07XHJcbn1cclxuXHJcbi8vIDIwLjMuNC4zNiAvIDE1LjkuNS40MyBEYXRlLnByb3RvdHlwZS50b0lTT1N0cmluZygpXHJcbi8vIFBoYW50b21KUyBhbmQgb2xkIHdlYmtpdCBoYWQgYSBicm9rZW4gRGF0ZSBpbXBsZW1lbnRhdGlvbi5cclxudmFyIGRhdGUgICAgICAgPSBuZXcgRGF0ZSgtNWUxMyAtIDEpXHJcbiAgLCBicm9rZW5EYXRlID0gIShkYXRlLnRvSVNPU3RyaW5nICYmIGRhdGUudG9JU09TdHJpbmcoKSA9PSAnMDM4NS0wNy0yNVQwNzowNjozOS45OTlaJ1xyXG4gICAgICAmJiByZXF1aXJlKCcuLyQudGhyb3dzJykoZnVuY3Rpb24oKXsgbmV3IERhdGUoTmFOKS50b0lTT1N0cmluZygpOyB9KSk7XHJcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogYnJva2VuRGF0ZSwgJ0RhdGUnLCB7dG9JU09TdHJpbmc6IGZ1bmN0aW9uKCl7XHJcbiAgaWYoIWlzRmluaXRlKHRoaXMpKXRocm93IFJhbmdlRXJyb3IoJ0ludmFsaWQgdGltZSB2YWx1ZScpO1xyXG4gIHZhciBkID0gdGhpc1xyXG4gICAgLCB5ID0gZC5nZXRVVENGdWxsWWVhcigpXHJcbiAgICAsIG0gPSBkLmdldFVUQ01pbGxpc2Vjb25kcygpXHJcbiAgICAsIHMgPSB5IDwgMCA/ICctJyA6IHkgPiA5OTk5ID8gJysnIDogJyc7XHJcbiAgcmV0dXJuIHMgKyAoJzAwMDAwJyArIE1hdGguYWJzKHkpKS5zbGljZShzID8gLTYgOiAtNCkgK1xyXG4gICAgJy0nICsgbHooZC5nZXRVVENNb250aCgpICsgMSkgKyAnLScgKyBseihkLmdldFVUQ0RhdGUoKSkgK1xyXG4gICAgJ1QnICsgbHooZC5nZXRVVENIb3VycygpKSArICc6JyArIGx6KGQuZ2V0VVRDTWludXRlcygpKSArXHJcbiAgICAnOicgKyBseihkLmdldFVUQ1NlY29uZHMoKSkgKyAnLicgKyAobSA+IDk5ID8gbSA6ICcwJyArIGx6KG0pKSArICdaJztcclxufX0pO1xyXG5cclxuaWYoY2xhc3NvZihmdW5jdGlvbigpeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdPYmplY3QnKWNvZi5jbGFzc29mID0gZnVuY3Rpb24oaXQpe1xyXG4gIHZhciB0YWcgPSBjbGFzc29mKGl0KTtcclxuICByZXR1cm4gdGFnID09ICdPYmplY3QnICYmIGlzRnVuY3Rpb24oaXQuY2FsbGVlKSA/ICdBcmd1bWVudHMnIDogdGFnO1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgdG9JbmRleCA9ICQudG9JbmRleDtcclxuJGRlZigkZGVmLlAsICdBcnJheScsIHtcclxuICAvLyAyMi4xLjMuMyBBcnJheS5wcm90b3R5cGUuY29weVdpdGhpbih0YXJnZXQsIHN0YXJ0LCBlbmQgPSB0aGlzLmxlbmd0aClcclxuICBjb3B5V2l0aGluOiBmdW5jdGlvbiBjb3B5V2l0aGluKHRhcmdldC8qID0gMCAqLywgc3RhcnQgLyogPSAwLCBlbmQgPSBAbGVuZ3RoICovKXtcclxuICAgIHZhciBPICAgICA9IE9iamVjdCgkLmFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICwgbGVuICAgPSAkLnRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAsIHRvICAgID0gdG9JbmRleCh0YXJnZXQsIGxlbilcclxuICAgICAgLCBmcm9tICA9IHRvSW5kZXgoc3RhcnQsIGxlbilcclxuICAgICAgLCBlbmQgICA9IGFyZ3VtZW50c1syXVxyXG4gICAgICAsIGZpbiAgID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB0b0luZGV4KGVuZCwgbGVuKVxyXG4gICAgICAsIGNvdW50ID0gTWF0aC5taW4oZmluIC0gZnJvbSwgbGVuIC0gdG8pXHJcbiAgICAgICwgaW5jICAgPSAxO1xyXG4gICAgaWYoZnJvbSA8IHRvICYmIHRvIDwgZnJvbSArIGNvdW50KXtcclxuICAgICAgaW5jICA9IC0xO1xyXG4gICAgICBmcm9tID0gZnJvbSArIGNvdW50IC0gMTtcclxuICAgICAgdG8gICA9IHRvICAgKyBjb3VudCAtIDE7XHJcbiAgICB9XHJcbiAgICB3aGlsZShjb3VudC0tID4gMCl7XHJcbiAgICAgIGlmKGZyb20gaW4gTylPW3RvXSA9IE9bZnJvbV07XHJcbiAgICAgIGVsc2UgZGVsZXRlIE9bdG9dO1xyXG4gICAgICB0byAgICs9IGluYztcclxuICAgICAgZnJvbSArPSBpbmM7XHJcbiAgICB9IHJldHVybiBPO1xyXG4gIH1cclxufSk7XHJcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2NvcHlXaXRoaW4nKTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIHRvSW5kZXggPSAkLnRvSW5kZXg7XHJcbiRkZWYoJGRlZi5QLCAnQXJyYXknLCB7XHJcbiAgLy8gMjIuMS4zLjYgQXJyYXkucHJvdG90eXBlLmZpbGwodmFsdWUsIHN0YXJ0ID0gMCwgZW5kID0gdGhpcy5sZW5ndGgpXHJcbiAgZmlsbDogZnVuY3Rpb24gZmlsbCh2YWx1ZSAvKiwgc3RhcnQgPSAwLCBlbmQgPSBAbGVuZ3RoICovKXtcclxuICAgIHZhciBPICAgICAgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIGxlbmd0aCA9ICQudG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChhcmd1bWVudHNbMV0sIGxlbmd0aClcclxuICAgICAgLCBlbmQgICAgPSBhcmd1bWVudHNbMl1cclxuICAgICAgLCBlbmRQb3MgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbmd0aCA6IHRvSW5kZXgoZW5kLCBsZW5ndGgpO1xyXG4gICAgd2hpbGUoZW5kUG9zID4gaW5kZXgpT1tpbmRleCsrXSA9IHZhbHVlO1xyXG4gICAgcmV0dXJuIE87XHJcbiAgfVxyXG59KTtcclxucmVxdWlyZSgnLi8kLnVuc2NvcGUnKSgnZmlsbCcpOyIsIid1c2Ugc3RyaWN0JztcclxuLy8gMjIuMS4zLjkgQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleChwcmVkaWNhdGUsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbnZhciBLRVkgICAgPSAnZmluZEluZGV4J1xyXG4gICwgJGRlZiAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBmb3JjZWQgPSB0cnVlXHJcbiAgLCAkZmluZCAgPSByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpKDYpO1xyXG4vLyBTaG91bGRuJ3Qgc2tpcCBob2xlc1xyXG5pZihLRVkgaW4gW10pQXJyYXkoMSlbS0VZXShmdW5jdGlvbigpeyBmb3JjZWQgPSBmYWxzZTsgfSk7XHJcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogZm9yY2VkLCAnQXJyYXknLCB7XHJcbiAgZmluZEluZGV4OiBmdW5jdGlvbiBmaW5kSW5kZXgoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgIHJldHVybiAkZmluZCh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xyXG4gIH1cclxufSk7XHJcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoS0VZKTsiLCIndXNlIHN0cmljdCc7XHJcbi8vIDIyLjEuMy44IEFycmF5LnByb3RvdHlwZS5maW5kKHByZWRpY2F0ZSwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxudmFyIEtFWSAgICA9ICdmaW5kJ1xyXG4gICwgJGRlZiAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBmb3JjZWQgPSB0cnVlXHJcbiAgLCAkZmluZCAgPSByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpKDUpO1xyXG4vLyBTaG91bGRuJ3Qgc2tpcCBob2xlc1xyXG5pZihLRVkgaW4gW10pQXJyYXkoMSlbS0VZXShmdW5jdGlvbigpeyBmb3JjZWQgPSBmYWxzZTsgfSk7XHJcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogZm9yY2VkLCAnQXJyYXknLCB7XHJcbiAgZmluZDogZnVuY3Rpb24gZmluZChjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgcmV0dXJuICRmaW5kKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XHJcbiAgfVxyXG59KTtcclxucmVxdWlyZSgnLi8kLnVuc2NvcGUnKShLRVkpOyIsInZhciAkICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjdHggICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxyXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICRpdGVyID0gcmVxdWlyZSgnLi8kLml0ZXInKVxyXG4gICwgY2FsbCAgPSByZXF1aXJlKCcuLyQuaXRlci1jYWxsJyk7XHJcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogIXJlcXVpcmUoJy4vJC5pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpeyBBcnJheS5mcm9tKGl0ZXIpOyB9KSwgJ0FycmF5Jywge1xyXG4gIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxuICBmcm9tOiBmdW5jdGlvbiBmcm9tKGFycmF5TGlrZS8qLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZCovKXtcclxuICAgIHZhciBPICAgICAgID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZChhcnJheUxpa2UpKVxyXG4gICAgICAsIG1hcGZuICAgPSBhcmd1bWVudHNbMV1cclxuICAgICAgLCBtYXBwaW5nID0gbWFwZm4gIT09IHVuZGVmaW5lZFxyXG4gICAgICAsIGYgICAgICAgPSBtYXBwaW5nID8gY3R4KG1hcGZuLCBhcmd1bWVudHNbMl0sIDIpIDogdW5kZWZpbmVkXHJcbiAgICAgICwgaW5kZXggICA9IDBcclxuICAgICAgLCBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XHJcbiAgICBpZigkaXRlci5pcyhPKSl7XHJcbiAgICAgIGl0ZXJhdG9yID0gJGl0ZXIuZ2V0KE8pO1xyXG4gICAgICAvLyBzdHJhbmdlIElFIHF1aXJrcyBtb2RlIGJ1ZyAtPiB1c2UgdHlwZW9mIGluc3RlYWQgb2YgaXNGdW5jdGlvblxyXG4gICAgICByZXN1bHQgICA9IG5ldyAodHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyA/IHRoaXMgOiBBcnJheSk7XHJcbiAgICAgIGZvcig7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKyl7XHJcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBjYWxsKGl0ZXJhdG9yLCBmLCBbc3RlcC52YWx1ZSwgaW5kZXhdLCB0cnVlKSA6IHN0ZXAudmFsdWU7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHN0cmFuZ2UgSUUgcXVpcmtzIG1vZGUgYnVnIC0+IHVzZSB0eXBlb2YgaW5zdGVhZCBvZiBpc0Z1bmN0aW9uXHJcbiAgICAgIHJlc3VsdCA9IG5ldyAodHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyA/IHRoaXMgOiBBcnJheSkobGVuZ3RoID0gJC50b0xlbmd0aChPLmxlbmd0aCkpO1xyXG4gICAgICBmb3IoOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XHJcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBmKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcbn0pOyIsInZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIHNldFVuc2NvcGUgPSByZXF1aXJlKCcuLyQudW5zY29wZScpXHJcbiAgLCBJVEVSICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ2l0ZXInKVxyXG4gICwgJGl0ZXIgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJylcclxuICAsIHN0ZXAgICAgICAgPSAkaXRlci5zdGVwXHJcbiAgLCBJdGVyYXRvcnMgID0gJGl0ZXIuSXRlcmF0b3JzO1xyXG5cclxuLy8gMjIuMS4zLjQgQXJyYXkucHJvdG90eXBlLmVudHJpZXMoKVxyXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxyXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXHJcbi8vIDIyLjEuMy4zMCBBcnJheS5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxyXG5yZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xyXG4gICQuc2V0KHRoaXMsIElURVIsIHtvOiAkLnRvT2JqZWN0KGl0ZXJhdGVkKSwgaTogMCwgazoga2luZH0pO1xyXG4vLyAyMi4xLjUuMi4xICVBcnJheUl0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcclxufSwgZnVuY3Rpb24oKXtcclxuICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXHJcbiAgICAsIE8gICAgID0gaXRlci5vXHJcbiAgICAsIGtpbmQgID0gaXRlci5rXHJcbiAgICAsIGluZGV4ID0gaXRlci5pKys7XHJcbiAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xyXG4gICAgaXRlci5vID0gdW5kZWZpbmVkO1xyXG4gICAgcmV0dXJuIHN0ZXAoMSk7XHJcbiAgfVxyXG4gIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgaW5kZXgpO1xyXG4gIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xyXG4gIHJldHVybiBzdGVwKDAsIFtpbmRleCwgT1tpbmRleF1dKTtcclxufSwgJ3ZhbHVlcycpO1xyXG5cclxuLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxyXG5JdGVyYXRvcnMuQXJndW1lbnRzID0gSXRlcmF0b3JzLkFycmF5O1xyXG5cclxuc2V0VW5zY29wZSgna2V5cycpO1xyXG5zZXRVbnNjb3BlKCd2YWx1ZXMnKTtcclxuc2V0VW5zY29wZSgnZW50cmllcycpOyIsInZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG4kZGVmKCRkZWYuUywgJ0FycmF5Jywge1xyXG4gIC8vIDIyLjEuMi4zIEFycmF5Lm9mKCAuLi5pdGVtcylcclxuICBvZjogZnVuY3Rpb24gb2YoLyogLi4uYXJncyAqLyl7XHJcbiAgICB2YXIgaW5kZXggID0gMFxyXG4gICAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgLy8gc3RyYW5nZSBJRSBxdWlya3MgbW9kZSBidWcgLT4gdXNlIHR5cGVvZiBpbnN0ZWFkIG9mIGlzRnVuY3Rpb25cclxuICAgICAgLCByZXN1bHQgPSBuZXcgKHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXkpKGxlbmd0aCk7XHJcbiAgICB3aGlsZShsZW5ndGggPiBpbmRleClyZXN1bHRbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4KytdO1xyXG4gICAgcmVzdWx0Lmxlbmd0aCA9IGxlbmd0aDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG59KTsiLCJyZXF1aXJlKCcuLyQuc3BlY2llcycpKEFycmF5KTsiLCJ2YXIgJCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBIQVNfSU5TVEFOQ0UgID0gcmVxdWlyZSgnLi8kLndrcycpKCdoYXNJbnN0YW5jZScpXHJcbiAgLCBGdW5jdGlvblByb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xyXG4vLyAxOS4yLjMuNiBGdW5jdGlvbi5wcm90b3R5cGVbQEBoYXNJbnN0YW5jZV0oVilcclxuaWYoIShIQVNfSU5TVEFOQ0UgaW4gRnVuY3Rpb25Qcm90bykpJC5zZXREZXNjKEZ1bmN0aW9uUHJvdG8sIEhBU19JTlNUQU5DRSwge3ZhbHVlOiBmdW5jdGlvbihPKXtcclxuICBpZighJC5pc0Z1bmN0aW9uKHRoaXMpIHx8ICEkLmlzT2JqZWN0KE8pKXJldHVybiBmYWxzZTtcclxuICBpZighJC5pc09iamVjdCh0aGlzLnByb3RvdHlwZSkpcmV0dXJuIE8gaW5zdGFuY2VvZiB0aGlzO1xyXG4gIC8vIGZvciBlbnZpcm9ubWVudCB3L28gbmF0aXZlIGBAQGhhc0luc3RhbmNlYCBsb2dpYyBlbm91Z2ggYGluc3RhbmNlb2ZgLCBidXQgYWRkIHRoaXM6XHJcbiAgd2hpbGUoTyA9ICQuZ2V0UHJvdG8oTykpaWYodGhpcy5wcm90b3R5cGUgPT09IE8pcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59fSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBOQU1FID0gJ25hbWUnXHJcbiAgLCBzZXREZXNjID0gJC5zZXREZXNjXHJcbiAgLCBGdW5jdGlvblByb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xyXG4vLyAxOS4yLjQuMiBuYW1lXHJcbk5BTUUgaW4gRnVuY3Rpb25Qcm90byB8fCAkLkZXICYmICQuREVTQyAmJiBzZXREZXNjKEZ1bmN0aW9uUHJvdG8sIE5BTUUsIHtcclxuICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgZ2V0OiBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1hdGNoID0gU3RyaW5nKHRoaXMpLm1hdGNoKC9eXFxzKmZ1bmN0aW9uIChbXiAoXSopLylcclxuICAgICAgLCBuYW1lICA9IG1hdGNoID8gbWF0Y2hbMV0gOiAnJztcclxuICAgICQuaGFzKHRoaXMsIE5BTUUpIHx8IHNldERlc2ModGhpcywgTkFNRSwgJC5kZXNjKDUsIG5hbWUpKTtcclxuICAgIHJldHVybiBuYW1lO1xyXG4gIH0sXHJcbiAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAkLmhhcyh0aGlzLCBOQU1FKSB8fCBzZXREZXNjKHRoaXMsIE5BTUUsICQuZGVzYygwLCB2YWx1ZSkpO1xyXG4gIH1cclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tc3Ryb25nJyk7XHJcblxyXG4vLyAyMy4xIE1hcCBPYmplY3RzXHJcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ01hcCcsIHtcclxuICAvLyAyMy4xLjMuNiBNYXAucHJvdG90eXBlLmdldChrZXkpXHJcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcclxuICAgIHZhciBlbnRyeSA9IHN0cm9uZy5nZXRFbnRyeSh0aGlzLCBrZXkpO1xyXG4gICAgcmV0dXJuIGVudHJ5ICYmIGVudHJ5LnY7XHJcbiAgfSxcclxuICAvLyAyMy4xLjMuOSBNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxyXG4gIHNldDogZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpe1xyXG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xyXG4gIH1cclxufSwgc3Ryb25nLCB0cnVlKTsiLCJ2YXIgSW5maW5pdHkgPSAxIC8gMFxyXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIEUgICAgID0gTWF0aC5FXHJcbiAgLCBwb3cgICA9IE1hdGgucG93XHJcbiAgLCBhYnMgICA9IE1hdGguYWJzXHJcbiAgLCBleHAgICA9IE1hdGguZXhwXHJcbiAgLCBsb2cgICA9IE1hdGgubG9nXHJcbiAgLCBzcXJ0ICA9IE1hdGguc3FydFxyXG4gICwgY2VpbCAgPSBNYXRoLmNlaWxcclxuICAsIGZsb29yID0gTWF0aC5mbG9vclxyXG4gICwgRVBTSUxPTiAgID0gcG93KDIsIC01MilcclxuICAsIEVQU0lMT04zMiA9IHBvdygyLCAtMjMpXHJcbiAgLCBNQVgzMiAgICAgPSBwb3coMiwgMTI3KSAqICgyIC0gRVBTSUxPTjMyKVxyXG4gICwgTUlOMzIgICAgID0gcG93KDIsIC0xMjYpO1xyXG5mdW5jdGlvbiByb3VuZFRpZXNUb0V2ZW4obil7XHJcbiAgcmV0dXJuIG4gKyAxIC8gRVBTSUxPTiAtIDEgLyBFUFNJTE9OO1xyXG59XHJcblxyXG4vLyAyMC4yLjIuMjggTWF0aC5zaWduKHgpXHJcbmZ1bmN0aW9uIHNpZ24oeCl7XHJcbiAgcmV0dXJuICh4ID0gK3gpID09IDAgfHwgeCAhPSB4ID8geCA6IHggPCAwID8gLTEgOiAxO1xyXG59XHJcbi8vIDIwLjIuMi41IE1hdGguYXNpbmgoeClcclxuZnVuY3Rpb24gYXNpbmgoeCl7XHJcbiAgcmV0dXJuICFpc0Zpbml0ZSh4ID0gK3gpIHx8IHggPT0gMCA/IHggOiB4IDwgMCA/IC1hc2luaCgteCkgOiBsb2coeCArIHNxcnQoeCAqIHggKyAxKSk7XHJcbn1cclxuLy8gMjAuMi4yLjE0IE1hdGguZXhwbTEoeClcclxuZnVuY3Rpb24gZXhwbTEoeCl7XHJcbiAgcmV0dXJuICh4ID0gK3gpID09IDAgPyB4IDogeCA+IC0xZS02ICYmIHggPCAxZS02ID8geCArIHggKiB4IC8gMiA6IGV4cCh4KSAtIDE7XHJcbn1cclxuXHJcbiRkZWYoJGRlZi5TLCAnTWF0aCcsIHtcclxuICAvLyAyMC4yLjIuMyBNYXRoLmFjb3NoKHgpXHJcbiAgYWNvc2g6IGZ1bmN0aW9uIGFjb3NoKHgpe1xyXG4gICAgcmV0dXJuICh4ID0gK3gpIDwgMSA/IE5hTiA6IGlzRmluaXRlKHgpID8gbG9nKHggLyBFICsgc3FydCh4ICsgMSkgKiBzcXJ0KHggLSAxKSAvIEUpICsgMSA6IHg7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuNSBNYXRoLmFzaW5oKHgpXHJcbiAgYXNpbmg6IGFzaW5oLFxyXG4gIC8vIDIwLjIuMi43IE1hdGguYXRhbmgoeClcclxuICBhdGFuaDogZnVuY3Rpb24gYXRhbmgoeCl7XHJcbiAgICByZXR1cm4gKHggPSAreCkgPT0gMCA/IHggOiBsb2coKDEgKyB4KSAvICgxIC0geCkpIC8gMjtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi45IE1hdGguY2JydCh4KVxyXG4gIGNicnQ6IGZ1bmN0aW9uIGNicnQoeCl7XHJcbiAgICByZXR1cm4gc2lnbih4ID0gK3gpICogcG93KGFicyh4KSwgMSAvIDMpO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjExIE1hdGguY2x6MzIoeClcclxuICBjbHozMjogZnVuY3Rpb24gY2x6MzIoeCl7XHJcbiAgICByZXR1cm4gKHggPj4+PSAwKSA/IDMxIC0gZmxvb3IobG9nKHggKyAwLjUpICogTWF0aC5MT0cyRSkgOiAzMjtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4xMiBNYXRoLmNvc2goeClcclxuICBjb3NoOiBmdW5jdGlvbiBjb3NoKHgpe1xyXG4gICAgcmV0dXJuIChleHAoeCA9ICt4KSArIGV4cCgteCkpIC8gMjtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4xNCBNYXRoLmV4cG0xKHgpXHJcbiAgZXhwbTE6IGV4cG0xLFxyXG4gIC8vIDIwLjIuMi4xNiBNYXRoLmZyb3VuZCh4KVxyXG4gIGZyb3VuZDogZnVuY3Rpb24gZnJvdW5kKHgpe1xyXG4gICAgdmFyICRhYnMgID0gYWJzKHgpXHJcbiAgICAgICwgJHNpZ24gPSBzaWduKHgpXHJcbiAgICAgICwgYSwgcmVzdWx0O1xyXG4gICAgaWYoJGFicyA8IE1JTjMyKXJldHVybiAkc2lnbiAqIHJvdW5kVGllc1RvRXZlbigkYWJzIC8gTUlOMzIgLyBFUFNJTE9OMzIpICogTUlOMzIgKiBFUFNJTE9OMzI7XHJcbiAgICBhID0gKDEgKyBFUFNJTE9OMzIgLyBFUFNJTE9OKSAqICRhYnM7XHJcbiAgICByZXN1bHQgPSBhIC0gKGEgLSAkYWJzKTtcclxuICAgIGlmKHJlc3VsdCA+IE1BWDMyIHx8IHJlc3VsdCAhPSByZXN1bHQpcmV0dXJuICRzaWduICogSW5maW5pdHk7XHJcbiAgICByZXR1cm4gJHNpZ24gKiByZXN1bHQ7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMTcgTWF0aC5oeXBvdChbdmFsdWUxWywgdmFsdWUyWywg4oCmIF1dXSlcclxuICBoeXBvdDogZnVuY3Rpb24gaHlwb3QodmFsdWUxLCB2YWx1ZTIpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiAgICB2YXIgc3VtICA9IDBcclxuICAgICAgLCBsZW4xID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAsIGxlbjIgPSBsZW4xXHJcbiAgICAgICwgYXJncyA9IEFycmF5KGxlbjEpXHJcbiAgICAgICwgbGFyZyA9IC1JbmZpbml0eVxyXG4gICAgICAsIGFyZztcclxuICAgIHdoaWxlKGxlbjEtLSl7XHJcbiAgICAgIGFyZyA9IGFyZ3NbbGVuMV0gPSArYXJndW1lbnRzW2xlbjFdO1xyXG4gICAgICBpZihhcmcgPT0gSW5maW5pdHkgfHwgYXJnID09IC1JbmZpbml0eSlyZXR1cm4gSW5maW5pdHk7XHJcbiAgICAgIGlmKGFyZyA+IGxhcmcpbGFyZyA9IGFyZztcclxuICAgIH1cclxuICAgIGxhcmcgPSBhcmcgfHwgMTtcclxuICAgIHdoaWxlKGxlbjItLSlzdW0gKz0gcG93KGFyZ3NbbGVuMl0gLyBsYXJnLCAyKTtcclxuICAgIHJldHVybiBsYXJnICogc3FydChzdW0pO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjE4IE1hdGguaW11bCh4LCB5KVxyXG4gIGltdWw6IGZ1bmN0aW9uIGltdWwoeCwgeSl7XHJcbiAgICB2YXIgVUludDE2ID0gMHhmZmZmXHJcbiAgICAgICwgeG4gPSAreFxyXG4gICAgICAsIHluID0gK3lcclxuICAgICAgLCB4bCA9IFVJbnQxNiAmIHhuXHJcbiAgICAgICwgeWwgPSBVSW50MTYgJiB5bjtcclxuICAgIHJldHVybiAwIHwgeGwgKiB5bCArICgoVUludDE2ICYgeG4gPj4+IDE2KSAqIHlsICsgeGwgKiAoVUludDE2ICYgeW4gPj4+IDE2KSA8PCAxNiA+Pj4gMCk7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMjAgTWF0aC5sb2cxcCh4KVxyXG4gIGxvZzFwOiBmdW5jdGlvbiBsb2cxcCh4KXtcclxuICAgIHJldHVybiAoeCA9ICt4KSA+IC0xZS04ICYmIHggPCAxZS04ID8geCAtIHggKiB4IC8gMiA6IGxvZygxICsgeCk7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMjEgTWF0aC5sb2cxMCh4KVxyXG4gIGxvZzEwOiBmdW5jdGlvbiBsb2cxMCh4KXtcclxuICAgIHJldHVybiBsb2coeCkgLyBNYXRoLkxOMTA7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMjIgTWF0aC5sb2cyKHgpXHJcbiAgbG9nMjogZnVuY3Rpb24gbG9nMih4KXtcclxuICAgIHJldHVybiBsb2coeCkgLyBNYXRoLkxOMjtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4yOCBNYXRoLnNpZ24oeClcclxuICBzaWduOiBzaWduLFxyXG4gIC8vIDIwLjIuMi4zMCBNYXRoLnNpbmgoeClcclxuICBzaW5oOiBmdW5jdGlvbiBzaW5oKHgpe1xyXG4gICAgcmV0dXJuIGFicyh4ID0gK3gpIDwgMSA/IChleHBtMSh4KSAtIGV4cG0xKC14KSkgLyAyIDogKGV4cCh4IC0gMSkgLSBleHAoLXggLSAxKSkgKiAoRSAvIDIpO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjMzIE1hdGgudGFuaCh4KVxyXG4gIHRhbmg6IGZ1bmN0aW9uIHRhbmgoeCl7XHJcbiAgICB2YXIgYSA9IGV4cG0xKHggPSAreClcclxuICAgICAgLCBiID0gZXhwbTEoLXgpO1xyXG4gICAgcmV0dXJuIGEgPT0gSW5maW5pdHkgPyAxIDogYiA9PSBJbmZpbml0eSA/IC0xIDogKGEgLSBiKSAvIChleHAoeCkgKyBleHAoLXgpKTtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4zNCBNYXRoLnRydW5jKHgpXHJcbiAgdHJ1bmM6IGZ1bmN0aW9uIHRydW5jKGl0KXtcclxuICAgIHJldHVybiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XHJcbiAgfVxyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGlzT2JqZWN0ICAgPSAkLmlzT2JqZWN0XHJcbiAgLCBpc0Z1bmN0aW9uID0gJC5pc0Z1bmN0aW9uXHJcbiAgLCBOVU1CRVIgICAgID0gJ051bWJlcidcclxuICAsICROdW1iZXIgICAgPSAkLmdbTlVNQkVSXVxyXG4gICwgQmFzZSAgICAgICA9ICROdW1iZXJcclxuICAsIHByb3RvICAgICAgPSAkTnVtYmVyLnByb3RvdHlwZTtcclxuZnVuY3Rpb24gdG9QcmltaXRpdmUoaXQpe1xyXG4gIHZhciBmbiwgdmFsO1xyXG4gIGlmKGlzRnVuY3Rpb24oZm4gPSBpdC52YWx1ZU9mKSAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XHJcbiAgaWYoaXNGdW5jdGlvbihmbiA9IGl0LnRvU3RyaW5nKSAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XHJcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gbnVtYmVyXCIpO1xyXG59XHJcbmZ1bmN0aW9uIHRvTnVtYmVyKGl0KXtcclxuICBpZihpc09iamVjdChpdCkpaXQgPSB0b1ByaW1pdGl2ZShpdCk7XHJcbiAgaWYodHlwZW9mIGl0ID09ICdzdHJpbmcnICYmIGl0Lmxlbmd0aCA+IDIgJiYgaXQuY2hhckNvZGVBdCgwKSA9PSA0OCl7XHJcbiAgICB2YXIgYmluYXJ5ID0gZmFsc2U7XHJcbiAgICBzd2l0Y2goaXQuY2hhckNvZGVBdCgxKSl7XHJcbiAgICAgIGNhc2UgNjYgOiBjYXNlIDk4ICA6IGJpbmFyeSA9IHRydWU7XHJcbiAgICAgIGNhc2UgNzkgOiBjYXNlIDExMSA6IHJldHVybiBwYXJzZUludChpdC5zbGljZSgyKSwgYmluYXJ5ID8gMiA6IDgpO1xyXG4gICAgfVxyXG4gIH0gcmV0dXJuICtpdDtcclxufVxyXG5pZigkLkZXICYmICEoJE51bWJlcignMG8xJykgJiYgJE51bWJlcignMGIxJykpKXtcclxuICAkTnVtYmVyID0gZnVuY3Rpb24gTnVtYmVyKGl0KXtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgJE51bWJlciA/IG5ldyBCYXNlKHRvTnVtYmVyKGl0KSkgOiB0b051bWJlcihpdCk7XHJcbiAgfTtcclxuICAkLmVhY2guY2FsbCgkLkRFU0MgPyAkLmdldE5hbWVzKEJhc2UpIDogKFxyXG4gICAgICAvLyBFUzM6XHJcbiAgICAgICdNQVhfVkFMVUUsTUlOX1ZBTFVFLE5hTixORUdBVElWRV9JTkZJTklUWSxQT1NJVElWRV9JTkZJTklUWSwnICtcclxuICAgICAgLy8gRVM2IChpbiBjYXNlLCBpZiBtb2R1bGVzIHdpdGggRVM2IE51bWJlciBzdGF0aWNzIHJlcXVpcmVkIGJlZm9yZSk6XHJcbiAgICAgICdFUFNJTE9OLGlzRmluaXRlLGlzSW50ZWdlcixpc05hTixpc1NhZmVJbnRlZ2VyLE1BWF9TQUZFX0lOVEVHRVIsJyArXHJcbiAgICAgICdNSU5fU0FGRV9JTlRFR0VSLHBhcnNlRmxvYXQscGFyc2VJbnQsaXNJbnRlZ2VyJ1xyXG4gICAgKS5zcGxpdCgnLCcpLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICBpZigkLmhhcyhCYXNlLCBrZXkpICYmICEkLmhhcygkTnVtYmVyLCBrZXkpKXtcclxuICAgICAgICAkLnNldERlc2MoJE51bWJlciwga2V5LCAkLmdldERlc2MoQmFzZSwga2V5KSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICApO1xyXG4gICROdW1iZXIucHJvdG90eXBlID0gcHJvdG87XHJcbiAgcHJvdG8uY29uc3RydWN0b3IgPSAkTnVtYmVyO1xyXG4gICQuaGlkZSgkLmcsIE5VTUJFUiwgJE51bWJlcik7XHJcbn0iLCJ2YXIgJCAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIGFicyAgID0gTWF0aC5hYnNcclxuICAsIGZsb29yID0gTWF0aC5mbG9vclxyXG4gICwgX2lzRmluaXRlID0gJC5nLmlzRmluaXRlXHJcbiAgLCBNQVhfU0FGRV9JTlRFR0VSID0gMHgxZmZmZmZmZmZmZmZmZjsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MTtcclxuZnVuY3Rpb24gaXNJbnRlZ2VyKGl0KXtcclxuICByZXR1cm4gISQuaXNPYmplY3QoaXQpICYmIF9pc0Zpbml0ZShpdCkgJiYgZmxvb3IoaXQpID09PSBpdDtcclxufVxyXG4kZGVmKCRkZWYuUywgJ051bWJlcicsIHtcclxuICAvLyAyMC4xLjIuMSBOdW1iZXIuRVBTSUxPTlxyXG4gIEVQU0lMT046IE1hdGgucG93KDIsIC01MiksXHJcbiAgLy8gMjAuMS4yLjIgTnVtYmVyLmlzRmluaXRlKG51bWJlcilcclxuICBpc0Zpbml0ZTogZnVuY3Rpb24gaXNGaW5pdGUoaXQpe1xyXG4gICAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnbnVtYmVyJyAmJiBfaXNGaW5pdGUoaXQpO1xyXG4gIH0sXHJcbiAgLy8gMjAuMS4yLjMgTnVtYmVyLmlzSW50ZWdlcihudW1iZXIpXHJcbiAgaXNJbnRlZ2VyOiBpc0ludGVnZXIsXHJcbiAgLy8gMjAuMS4yLjQgTnVtYmVyLmlzTmFOKG51bWJlcilcclxuICBpc05hTjogZnVuY3Rpb24gaXNOYU4obnVtYmVyKXtcclxuICAgIHJldHVybiBudW1iZXIgIT0gbnVtYmVyO1xyXG4gIH0sXHJcbiAgLy8gMjAuMS4yLjUgTnVtYmVyLmlzU2FmZUludGVnZXIobnVtYmVyKVxyXG4gIGlzU2FmZUludGVnZXI6IGZ1bmN0aW9uIGlzU2FmZUludGVnZXIobnVtYmVyKXtcclxuICAgIHJldHVybiBpc0ludGVnZXIobnVtYmVyKSAmJiBhYnMobnVtYmVyKSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xyXG4gIH0sXHJcbiAgLy8gMjAuMS4yLjYgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcclxuICBNQVhfU0FGRV9JTlRFR0VSOiBNQVhfU0FGRV9JTlRFR0VSLFxyXG4gIC8vIDIwLjEuMi4xMCBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUlxyXG4gIE1JTl9TQUZFX0lOVEVHRVI6IC1NQVhfU0FGRV9JTlRFR0VSLFxyXG4gIC8vIDIwLjEuMi4xMiBOdW1iZXIucGFyc2VGbG9hdChzdHJpbmcpXHJcbiAgcGFyc2VGbG9hdDogcGFyc2VGbG9hdCxcclxuICAvLyAyMC4xLjIuMTMgTnVtYmVyLnBhcnNlSW50KHN0cmluZywgcmFkaXgpXHJcbiAgcGFyc2VJbnQ6IHBhcnNlSW50XHJcbn0pOyIsIi8vIDE5LjEuMy4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UpXHJcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHthc3NpZ246IHJlcXVpcmUoJy4vJC5hc3NpZ24nKX0pOyIsIi8vIDE5LjEuMy4xMCBPYmplY3QuaXModmFsdWUxLCB2YWx1ZTIpXHJcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtcclxuICBpczogZnVuY3Rpb24gaXMoeCwgeSl7XHJcbiAgICByZXR1cm4geCA9PT0geSA/IHggIT09IDAgfHwgMSAvIHggPT09IDEgLyB5IDogeCAhPSB4ICYmIHkgIT0geTtcclxuICB9XHJcbn0pOyIsIi8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXHJcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtzZXRQcm90b3R5cGVPZjogcmVxdWlyZSgnLi8kLnNldC1wcm90bycpLnNldH0pOyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgaXNPYmplY3QgPSAkLmlzT2JqZWN0XHJcbiAgLCB0b09iamVjdCA9ICQudG9PYmplY3Q7XHJcbmZ1bmN0aW9uIHdyYXBPYmplY3RNZXRob2QoTUVUSE9ELCBNT0RFKXtcclxuICB2YXIgZm4gID0gKCQuY29yZS5PYmplY3QgfHwge30pW01FVEhPRF0gfHwgT2JqZWN0W01FVEhPRF1cclxuICAgICwgZiAgID0gMFxyXG4gICAgLCBvICAgPSB7fTtcclxuICBvW01FVEhPRF0gPSBNT0RFID09IDEgPyBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogaXQ7XHJcbiAgfSA6IE1PREUgPT0gMiA/IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiB0cnVlO1xyXG4gIH0gOiBNT0RFID09IDMgPyBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogZmFsc2U7XHJcbiAgfSA6IE1PREUgPT0gNCA/IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcclxuICAgIHJldHVybiBmbih0b09iamVjdChpdCksIGtleSk7XHJcbiAgfSA6IE1PREUgPT0gNSA/IGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKGl0KXtcclxuICAgIHJldHVybiBmbihPYmplY3QoJC5hc3NlcnREZWZpbmVkKGl0KSkpO1xyXG4gIH0gOiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gZm4odG9PYmplY3QoaXQpKTtcclxuICB9O1xyXG4gIHRyeSB7XHJcbiAgICBmbigneicpO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICBmID0gMTtcclxuICB9XHJcbiAgJGRlZigkZGVmLlMgKyAkZGVmLkYgKiBmLCAnT2JqZWN0Jywgbyk7XHJcbn1cclxud3JhcE9iamVjdE1ldGhvZCgnZnJlZXplJywgMSk7XHJcbndyYXBPYmplY3RNZXRob2QoJ3NlYWwnLCAxKTtcclxud3JhcE9iamVjdE1ldGhvZCgncHJldmVudEV4dGVuc2lvbnMnLCAxKTtcclxud3JhcE9iamVjdE1ldGhvZCgnaXNGcm96ZW4nLCAyKTtcclxud3JhcE9iamVjdE1ldGhvZCgnaXNTZWFsZWQnLCAyKTtcclxud3JhcE9iamVjdE1ldGhvZCgnaXNFeHRlbnNpYmxlJywgMyk7XHJcbndyYXBPYmplY3RNZXRob2QoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIDQpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdnZXRQcm90b3R5cGVPZicsIDUpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdrZXlzJyk7XHJcbndyYXBPYmplY3RNZXRob2QoJ2dldE93blByb3BlcnR5TmFtZXMnKTsiLCIndXNlIHN0cmljdCc7XHJcbi8vIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxyXG52YXIgJCAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGNvZiA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgdG1wID0ge307XHJcbnRtcFtyZXF1aXJlKCcuLyQud2tzJykoJ3RvU3RyaW5nVGFnJyldID0gJ3onO1xyXG5pZigkLkZXICYmIGNvZih0bXApICE9ICd6JykkLmhpZGUoT2JqZWN0LnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKXtcclxuICByZXR1cm4gJ1tvYmplY3QgJyArIGNvZi5jbGFzc29mKHRoaXMpICsgJ10nO1xyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjdHggICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxyXG4gICwgY29mICAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcclxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBhc3NlcnQgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxyXG4gICwgZm9yT2YgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcclxuICAsIHNldFByb3RvID0gcmVxdWlyZSgnLi8kLnNldC1wcm90bycpLnNldFxyXG4gICwgc3BlY2llcyAgPSByZXF1aXJlKCcuLyQuc3BlY2llcycpXHJcbiAgLCBTUEVDSUVTICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnc3BlY2llcycpXHJcbiAgLCBSRUNPUkQgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdyZWNvcmQnKVxyXG4gICwgUFJPTUlTRSAgPSAnUHJvbWlzZSdcclxuICAsIGdsb2JhbCAgID0gJC5nXHJcbiAgLCBwcm9jZXNzICA9IGdsb2JhbC5wcm9jZXNzXHJcbiAgLCBhc2FwICAgICA9IHByb2Nlc3MgJiYgcHJvY2Vzcy5uZXh0VGljayB8fCByZXF1aXJlKCcuLyQudGFzaycpLnNldFxyXG4gICwgUCAgICAgICAgPSBnbG9iYWxbUFJPTUlTRV1cclxuICAsIGlzRnVuY3Rpb24gICAgID0gJC5pc0Z1bmN0aW9uXHJcbiAgLCBpc09iamVjdCAgICAgICA9ICQuaXNPYmplY3RcclxuICAsIGFzc2VydEZ1bmN0aW9uID0gYXNzZXJ0LmZuXHJcbiAgLCBhc3NlcnRPYmplY3QgICA9IGFzc2VydC5vYmo7XHJcblxyXG52YXIgdXNlTmF0aXZlID0gZnVuY3Rpb24oKXtcclxuICB2YXIgdGVzdCwgd29ya3MgPSBmYWxzZTtcclxuICBmdW5jdGlvbiBQMih4KXtcclxuICAgIHZhciBzZWxmID0gbmV3IFAoeCk7XHJcbiAgICBzZXRQcm90byhzZWxmLCBQMi5wcm90b3R5cGUpO1xyXG4gICAgcmV0dXJuIHNlbGY7XHJcbiAgfVxyXG4gIHRyeSB7XHJcbiAgICB3b3JrcyA9IGlzRnVuY3Rpb24oUCkgJiYgaXNGdW5jdGlvbihQLnJlc29sdmUpICYmIFAucmVzb2x2ZSh0ZXN0ID0gbmV3IFAoZnVuY3Rpb24oKXt9KSkgPT0gdGVzdDtcclxuICAgIHNldFByb3RvKFAyLCBQKTtcclxuICAgIFAyLnByb3RvdHlwZSA9ICQuY3JlYXRlKFAucHJvdG90eXBlLCB7Y29uc3RydWN0b3I6IHt2YWx1ZTogUDJ9fSk7XHJcbiAgICAvLyBhY3R1YWwgRmlyZWZveCBoYXMgYnJva2VuIHN1YmNsYXNzIHN1cHBvcnQsIHRlc3QgdGhhdFxyXG4gICAgaWYoIShQMi5yZXNvbHZlKDUpLnRoZW4oZnVuY3Rpb24oKXt9KSBpbnN0YW5jZW9mIFAyKSl7XHJcbiAgICAgIHdvcmtzID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBjYXRjaChlKXsgd29ya3MgPSBmYWxzZTsgfVxyXG4gIHJldHVybiB3b3JrcztcclxufSgpO1xyXG5cclxuLy8gaGVscGVyc1xyXG5mdW5jdGlvbiBnZXRDb25zdHJ1Y3RvcihDKXtcclxuICB2YXIgUyA9IGFzc2VydE9iamVjdChDKVtTUEVDSUVTXTtcclxuICByZXR1cm4gUyAhPSB1bmRlZmluZWQgPyBTIDogQztcclxufVxyXG5mdW5jdGlvbiBpc1RoZW5hYmxlKGl0KXtcclxuICB2YXIgdGhlbjtcclxuICBpZihpc09iamVjdChpdCkpdGhlbiA9IGl0LnRoZW47XHJcbiAgcmV0dXJuIGlzRnVuY3Rpb24odGhlbikgPyB0aGVuIDogZmFsc2U7XHJcbn1cclxuZnVuY3Rpb24gbm90aWZ5KHJlY29yZCl7XHJcbiAgdmFyIGNoYWluID0gcmVjb3JkLmM7XHJcbiAgaWYoY2hhaW4ubGVuZ3RoKWFzYXAoZnVuY3Rpb24oKXtcclxuICAgIHZhciB2YWx1ZSA9IHJlY29yZC52XHJcbiAgICAgICwgb2sgICAgPSByZWNvcmQucyA9PSAxXHJcbiAgICAgICwgaSAgICAgPSAwO1xyXG4gICAgZnVuY3Rpb24gcnVuKHJlYWN0KXtcclxuICAgICAgdmFyIGNiID0gb2sgPyByZWFjdC5vayA6IHJlYWN0LmZhaWxcclxuICAgICAgICAsIHJldCwgdGhlbjtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZihjYil7XHJcbiAgICAgICAgICBpZighb2spcmVjb3JkLmggPSB0cnVlO1xyXG4gICAgICAgICAgcmV0ID0gY2IgPT09IHRydWUgPyB2YWx1ZSA6IGNiKHZhbHVlKTtcclxuICAgICAgICAgIGlmKHJldCA9PT0gcmVhY3QuUCl7XHJcbiAgICAgICAgICAgIHJlYWN0LnJlaihUeXBlRXJyb3IoJ1Byb21pc2UtY2hhaW4gY3ljbGUnKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYodGhlbiA9IGlzVGhlbmFibGUocmV0KSl7XHJcbiAgICAgICAgICAgIHRoZW4uY2FsbChyZXQsIHJlYWN0LnJlcywgcmVhY3QucmVqKTtcclxuICAgICAgICAgIH0gZWxzZSByZWFjdC5yZXMocmV0KTtcclxuICAgICAgICB9IGVsc2UgcmVhY3QucmVqKHZhbHVlKTtcclxuICAgICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICAgIHJlYWN0LnJlaihlcnIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB3aGlsZShjaGFpbi5sZW5ndGggPiBpKXJ1bihjaGFpbltpKytdKTsgLy8gdmFyaWFibGUgbGVuZ3RoIC0gY2FuJ3QgdXNlIGZvckVhY2hcclxuICAgIGNoYWluLmxlbmd0aCA9IDA7XHJcbiAgfSk7XHJcbn1cclxuZnVuY3Rpb24gaXNVbmhhbmRsZWQocHJvbWlzZSl7XHJcbiAgdmFyIHJlY29yZCA9IHByb21pc2VbUkVDT1JEXVxyXG4gICAgLCBjaGFpbiAgPSByZWNvcmQuYSB8fCByZWNvcmQuY1xyXG4gICAgLCBpICAgICAgPSAwXHJcbiAgICAsIHJlYWN0O1xyXG4gIGlmKHJlY29yZC5oKXJldHVybiBmYWxzZTtcclxuICB3aGlsZShjaGFpbi5sZW5ndGggPiBpKXtcclxuICAgIHJlYWN0ID0gY2hhaW5baSsrXTtcclxuICAgIGlmKHJlYWN0LmZhaWwgfHwgIWlzVW5oYW5kbGVkKHJlYWN0LlApKXJldHVybiBmYWxzZTtcclxuICB9IHJldHVybiB0cnVlO1xyXG59XHJcbmZ1bmN0aW9uICRyZWplY3QodmFsdWUpe1xyXG4gIHZhciByZWNvcmQgPSB0aGlzXHJcbiAgICAsIHByb21pc2U7XHJcbiAgaWYocmVjb3JkLmQpcmV0dXJuO1xyXG4gIHJlY29yZC5kID0gdHJ1ZTtcclxuICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxyXG4gIHJlY29yZC52ID0gdmFsdWU7XHJcbiAgcmVjb3JkLnMgPSAyO1xyXG4gIHJlY29yZC5hID0gcmVjb3JkLmMuc2xpY2UoKTtcclxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICBhc2FwKGZ1bmN0aW9uKCl7XHJcbiAgICAgIGlmKGlzVW5oYW5kbGVkKHByb21pc2UgPSByZWNvcmQucCkpe1xyXG4gICAgICAgIGlmKGNvZihwcm9jZXNzKSA9PSAncHJvY2Vzcycpe1xyXG4gICAgICAgICAgcHJvY2Vzcy5lbWl0KCd1bmhhbmRsZWRSZWplY3Rpb24nLCB2YWx1ZSwgcHJvbWlzZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmKGdsb2JhbC5jb25zb2xlICYmIGlzRnVuY3Rpb24oY29uc29sZS5lcnJvcikpe1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZWNvcmQuYSA9IHVuZGVmaW5lZDtcclxuICAgIH0pO1xyXG4gIH0sIDEpO1xyXG4gIG5vdGlmeShyZWNvcmQpO1xyXG59XHJcbmZ1bmN0aW9uICRyZXNvbHZlKHZhbHVlKXtcclxuICB2YXIgcmVjb3JkID0gdGhpc1xyXG4gICAgLCB0aGVuLCB3cmFwcGVyO1xyXG4gIGlmKHJlY29yZC5kKXJldHVybjtcclxuICByZWNvcmQuZCA9IHRydWU7XHJcbiAgcmVjb3JkID0gcmVjb3JkLnIgfHwgcmVjb3JkOyAvLyB1bndyYXBcclxuICB0cnkge1xyXG4gICAgaWYodGhlbiA9IGlzVGhlbmFibGUodmFsdWUpKXtcclxuICAgICAgd3JhcHBlciA9IHtyOiByZWNvcmQsIGQ6IGZhbHNlfTsgLy8gd3JhcFxyXG4gICAgICB0aGVuLmNhbGwodmFsdWUsIGN0eCgkcmVzb2x2ZSwgd3JhcHBlciwgMSksIGN0eCgkcmVqZWN0LCB3cmFwcGVyLCAxKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZWNvcmQudiA9IHZhbHVlO1xyXG4gICAgICByZWNvcmQucyA9IDE7XHJcbiAgICAgIG5vdGlmeShyZWNvcmQpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2goZXJyKXtcclxuICAgICRyZWplY3QuY2FsbCh3cmFwcGVyIHx8IHtyOiByZWNvcmQsIGQ6IGZhbHNlfSwgZXJyKTsgLy8gd3JhcFxyXG4gIH1cclxufVxyXG5cclxuLy8gY29uc3RydWN0b3IgcG9seWZpbGxcclxuaWYoIXVzZU5hdGl2ZSl7XHJcbiAgLy8gMjUuNC4zLjEgUHJvbWlzZShleGVjdXRvcilcclxuICBQID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcil7XHJcbiAgICBhc3NlcnRGdW5jdGlvbihleGVjdXRvcik7XHJcbiAgICB2YXIgcmVjb3JkID0ge1xyXG4gICAgICBwOiBhc3NlcnQuaW5zdCh0aGlzLCBQLCBQUk9NSVNFKSwgICAgICAgLy8gPC0gcHJvbWlzZVxyXG4gICAgICBjOiBbXSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gYXdhaXRpbmcgcmVhY3Rpb25zXHJcbiAgICAgIGE6IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBjaGVja2VkIGluIGlzVW5oYW5kbGVkIHJlYWN0aW9uc1xyXG4gICAgICBzOiAwLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gc3RhdGVcclxuICAgICAgZDogZmFsc2UsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGRvbmVcclxuICAgICAgdjogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXHJcbiAgICAgIGg6IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBoYW5kbGVkIHJlamVjdGlvblxyXG4gICAgfTtcclxuICAgICQuaGlkZSh0aGlzLCBSRUNPUkQsIHJlY29yZCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBleGVjdXRvcihjdHgoJHJlc29sdmUsIHJlY29yZCwgMSksIGN0eCgkcmVqZWN0LCByZWNvcmQsIDEpKTtcclxuICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgJHJlamVjdC5jYWxsKHJlY29yZCwgZXJyKTtcclxuICAgIH1cclxuICB9O1xyXG4gICQubWl4KFAucHJvdG90eXBlLCB7XHJcbiAgICAvLyAyNS40LjUuMyBQcm9taXNlLnByb3RvdHlwZS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKVxyXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCl7XHJcbiAgICAgIHZhciBTID0gYXNzZXJ0T2JqZWN0KGFzc2VydE9iamVjdCh0aGlzKS5jb25zdHJ1Y3RvcilbU1BFQ0lFU107XHJcbiAgICAgIHZhciByZWFjdCA9IHtcclxuICAgICAgICBvazogICBpc0Z1bmN0aW9uKG9uRnVsZmlsbGVkKSA/IG9uRnVsZmlsbGVkIDogdHJ1ZSxcclxuICAgICAgICBmYWlsOiBpc0Z1bmN0aW9uKG9uUmVqZWN0ZWQpICA/IG9uUmVqZWN0ZWQgIDogZmFsc2VcclxuICAgICAgfTtcclxuICAgICAgdmFyIHByb21pc2UgPSByZWFjdC5QID0gbmV3IChTICE9IHVuZGVmaW5lZCA/IFMgOiBQKShmdW5jdGlvbihyZXMsIHJlail7XHJcbiAgICAgICAgcmVhY3QucmVzID0gYXNzZXJ0RnVuY3Rpb24ocmVzKTtcclxuICAgICAgICByZWFjdC5yZWogPSBhc3NlcnRGdW5jdGlvbihyZWopO1xyXG4gICAgICB9KTtcclxuICAgICAgdmFyIHJlY29yZCA9IHRoaXNbUkVDT1JEXTtcclxuICAgICAgcmVjb3JkLmMucHVzaChyZWFjdCk7XHJcbiAgICAgIGlmKHJlY29yZC5hKXJlY29yZC5hLnB1c2gocmVhY3QpO1xyXG4gICAgICByZWNvcmQucyAmJiBub3RpZnkocmVjb3JkKTtcclxuICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICB9LFxyXG4gICAgLy8gMjUuNC41LjEgUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2gob25SZWplY3RlZClcclxuICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0ZWQpe1xyXG4gICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIGV4cG9ydFxyXG4kZGVmKCRkZWYuRyArICRkZWYuVyArICRkZWYuRiAqICF1c2VOYXRpdmUsIHtQcm9taXNlOiBQfSk7XHJcbmNvZi5zZXQoUCwgUFJPTUlTRSk7XHJcbnNwZWNpZXMoUCk7XHJcbnNwZWNpZXMoJC5jb3JlW1BST01JU0VdKTsgLy8gZm9yIHdyYXBwZXJcclxuXHJcbi8vIHN0YXRpY3NcclxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCBQUk9NSVNFLCB7XHJcbiAgLy8gMjUuNC40LjUgUHJvbWlzZS5yZWplY3QocilcclxuICByZWplY3Q6IGZ1bmN0aW9uIHJlamVjdChyKXtcclxuICAgIHJldHVybiBuZXcgKGdldENvbnN0cnVjdG9yKHRoaXMpKShmdW5jdGlvbihyZXMsIHJlail7XHJcbiAgICAgIHJlaihyKTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgLy8gMjUuNC40LjYgUHJvbWlzZS5yZXNvbHZlKHgpXHJcbiAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZSh4KXtcclxuICAgIHJldHVybiBpc09iamVjdCh4KSAmJiBSRUNPUkQgaW4geCAmJiAkLmdldFByb3RvKHgpID09PSB0aGlzLnByb3RvdHlwZVxyXG4gICAgICA/IHggOiBuZXcgKGdldENvbnN0cnVjdG9yKHRoaXMpKShmdW5jdGlvbihyZXMpe1xyXG4gICAgICAgIHJlcyh4KTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG59KTtcclxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhKHVzZU5hdGl2ZSAmJiByZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXtcclxuICBQLmFsbChpdGVyKVsnY2F0Y2gnXShmdW5jdGlvbigpe30pO1xyXG59KSksIFBST01JU0UsIHtcclxuICAvLyAyNS40LjQuMSBQcm9taXNlLmFsbChpdGVyYWJsZSlcclxuICBhbGw6IGZ1bmN0aW9uIGFsbChpdGVyYWJsZSl7XHJcbiAgICB2YXIgQyAgICAgID0gZ2V0Q29uc3RydWN0b3IodGhpcylcclxuICAgICAgLCB2YWx1ZXMgPSBbXTtcclxuICAgIHJldHVybiBuZXcgQyhmdW5jdGlvbihyZXMsIHJlail7XHJcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgdmFsdWVzLnB1c2gsIHZhbHVlcyk7XHJcbiAgICAgIHZhciByZW1haW5pbmcgPSB2YWx1ZXMubGVuZ3RoXHJcbiAgICAgICAgLCByZXN1bHRzICAgPSBBcnJheShyZW1haW5pbmcpO1xyXG4gICAgICBpZihyZW1haW5pbmcpJC5lYWNoLmNhbGwodmFsdWVzLCBmdW5jdGlvbihwcm9taXNlLCBpbmRleCl7XHJcbiAgICAgICAgQy5yZXNvbHZlKHByb21pc2UpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSB2YWx1ZTtcclxuICAgICAgICAgIC0tcmVtYWluaW5nIHx8IHJlcyhyZXN1bHRzKTtcclxuICAgICAgICB9LCByZWopO1xyXG4gICAgICB9KTtcclxuICAgICAgZWxzZSByZXMocmVzdWx0cyk7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIC8vIDI1LjQuNC40IFByb21pc2UucmFjZShpdGVyYWJsZSlcclxuICByYWNlOiBmdW5jdGlvbiByYWNlKGl0ZXJhYmxlKXtcclxuICAgIHZhciBDID0gZ2V0Q29uc3RydWN0b3IodGhpcyk7XHJcbiAgICByZXR1cm4gbmV3IEMoZnVuY3Rpb24ocmVzLCByZWope1xyXG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIGZ1bmN0aW9uKHByb21pc2Upe1xyXG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKHJlcywgcmVqKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn0pOyIsInZhciAkICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBzZXRQcm90byAgPSByZXF1aXJlKCcuLyQuc2V0LXByb3RvJylcclxuICAsICRpdGVyICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJylcclxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxyXG4gICwgSVRFUiAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ2l0ZXInKVxyXG4gICwgc3RlcCAgICAgID0gJGl0ZXIuc3RlcFxyXG4gICwgYXNzZXJ0ICAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXHJcbiAgLCBpc09iamVjdCAgPSAkLmlzT2JqZWN0XHJcbiAgLCBnZXRQcm90byAgPSAkLmdldFByb3RvXHJcbiAgLCAkUmVmbGVjdCAgPSAkLmcuUmVmbGVjdFxyXG4gICwgX2FwcGx5ICAgID0gRnVuY3Rpb24uYXBwbHlcclxuICAsIGFzc2VydE9iamVjdCA9IGFzc2VydC5vYmpcclxuICAsIF9pc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8ICQuaXNPYmplY3RcclxuICAsIF9wcmV2ZW50RXh0ZW5zaW9ucyA9IE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyB8fCAkLml0XHJcbiAgLy8gSUUgVFAgaGFzIGJyb2tlbiBSZWZsZWN0LmVudW1lcmF0ZVxyXG4gICwgYnVnZ3lFbnVtZXJhdGUgPSAhKCRSZWZsZWN0ICYmICRSZWZsZWN0LmVudW1lcmF0ZSAmJiBJVEVSQVRPUiBpbiAkUmVmbGVjdC5lbnVtZXJhdGUoe30pKTtcclxuXHJcbmZ1bmN0aW9uIEVudW1lcmF0ZShpdGVyYXRlZCl7XHJcbiAgJC5zZXQodGhpcywgSVRFUiwge286IGl0ZXJhdGVkLCBrOiB1bmRlZmluZWQsIGk6IDB9KTtcclxufVxyXG4kaXRlci5jcmVhdGUoRW51bWVyYXRlLCAnT2JqZWN0JywgZnVuY3Rpb24oKXtcclxuICB2YXIgaXRlciA9IHRoaXNbSVRFUl1cclxuICAgICwga2V5cyA9IGl0ZXIua1xyXG4gICAgLCBrZXk7XHJcbiAgaWYoa2V5cyA9PSB1bmRlZmluZWQpe1xyXG4gICAgaXRlci5rID0ga2V5cyA9IFtdO1xyXG4gICAgZm9yKGtleSBpbiBpdGVyLm8pa2V5cy5wdXNoKGtleSk7XHJcbiAgfVxyXG4gIGRvIHtcclxuICAgIGlmKGl0ZXIuaSA+PSBrZXlzLmxlbmd0aClyZXR1cm4gc3RlcCgxKTtcclxuICB9IHdoaWxlKCEoKGtleSA9IGtleXNbaXRlci5pKytdKSBpbiBpdGVyLm8pKTtcclxuICByZXR1cm4gc3RlcCgwLCBrZXkpO1xyXG59KTtcclxuXHJcbnZhciByZWZsZWN0ID0ge1xyXG4gIC8vIDI2LjEuMSBSZWZsZWN0LmFwcGx5KHRhcmdldCwgdGhpc0FyZ3VtZW50LCBhcmd1bWVudHNMaXN0KVxyXG4gIGFwcGx5OiBmdW5jdGlvbiBhcHBseSh0YXJnZXQsIHRoaXNBcmd1bWVudCwgYXJndW1lbnRzTGlzdCl7XHJcbiAgICByZXR1cm4gX2FwcGx5LmNhbGwodGFyZ2V0LCB0aGlzQXJndW1lbnQsIGFyZ3VtZW50c0xpc3QpO1xyXG4gIH0sXHJcbiAgLy8gMjYuMS4yIFJlZmxlY3QuY29uc3RydWN0KHRhcmdldCwgYXJndW1lbnRzTGlzdCBbLCBuZXdUYXJnZXRdKVxyXG4gIGNvbnN0cnVjdDogZnVuY3Rpb24gY29uc3RydWN0KHRhcmdldCwgYXJndW1lbnRzTGlzdCAvKiwgbmV3VGFyZ2V0Ki8pe1xyXG4gICAgdmFyIHByb3RvICAgID0gYXNzZXJ0LmZuKGFyZ3VtZW50cy5sZW5ndGggPCAzID8gdGFyZ2V0IDogYXJndW1lbnRzWzJdKS5wcm90b3R5cGVcclxuICAgICAgLCBpbnN0YW5jZSA9ICQuY3JlYXRlKGlzT2JqZWN0KHByb3RvKSA/IHByb3RvIDogT2JqZWN0LnByb3RvdHlwZSlcclxuICAgICAgLCByZXN1bHQgICA9IF9hcHBseS5jYWxsKHRhcmdldCwgaW5zdGFuY2UsIGFyZ3VtZW50c0xpc3QpO1xyXG4gICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiBpbnN0YW5jZTtcclxuICB9LFxyXG4gIC8vIDI2LjEuMyBSZWZsZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIGF0dHJpYnV0ZXMpXHJcbiAgZGVmaW5lUHJvcGVydHk6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIGF0dHJpYnV0ZXMpe1xyXG4gICAgYXNzZXJ0T2JqZWN0KHRhcmdldCk7XHJcbiAgICB0cnkge1xyXG4gICAgICAkLnNldERlc2ModGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcyk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaChlKXtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8gMjYuMS40IFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSlcclxuICBkZWxldGVQcm9wZXJ0eTogZnVuY3Rpb24gZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSl7XHJcbiAgICB2YXIgZGVzYyA9ICQuZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpO1xyXG4gICAgcmV0dXJuIGRlc2MgJiYgIWRlc2MuY29uZmlndXJhYmxlID8gZmFsc2UgOiBkZWxldGUgdGFyZ2V0W3Byb3BlcnR5S2V5XTtcclxuICB9LFxyXG4gIC8vIDI2LjEuNiBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3BlcnR5S2V5IFssIHJlY2VpdmVyXSlcclxuICBnZXQ6IGZ1bmN0aW9uIGdldCh0YXJnZXQsIHByb3BlcnR5S2V5LyosIHJlY2VpdmVyKi8pe1xyXG4gICAgdmFyIHJlY2VpdmVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDMgPyB0YXJnZXQgOiBhcmd1bWVudHNbMl1cclxuICAgICAgLCBkZXNjID0gJC5nZXREZXNjKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSksIHByb3RvO1xyXG4gICAgaWYoZGVzYylyZXR1cm4gJC5oYXMoZGVzYywgJ3ZhbHVlJylcclxuICAgICAgPyBkZXNjLnZhbHVlXHJcbiAgICAgIDogZGVzYy5nZXQgPT09IHVuZGVmaW5lZFxyXG4gICAgICAgID8gdW5kZWZpbmVkXHJcbiAgICAgICAgOiBkZXNjLmdldC5jYWxsKHJlY2VpdmVyKTtcclxuICAgIHJldHVybiBpc09iamVjdChwcm90byA9IGdldFByb3RvKHRhcmdldCkpXHJcbiAgICAgID8gZ2V0KHByb3RvLCBwcm9wZXJ0eUtleSwgcmVjZWl2ZXIpXHJcbiAgICAgIDogdW5kZWZpbmVkO1xyXG4gIH0sXHJcbiAgLy8gMjYuMS43IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpXHJcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSl7XHJcbiAgICByZXR1cm4gJC5nZXREZXNjKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSk7XHJcbiAgfSxcclxuICAvLyAyNi4xLjggUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0YXJnZXQpXHJcbiAgZ2V0UHJvdG90eXBlT2Y6IGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKHRhcmdldCl7XHJcbiAgICByZXR1cm4gZ2V0UHJvdG8oYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xyXG4gIH0sXHJcbiAgLy8gMjYuMS45IFJlZmxlY3QuaGFzKHRhcmdldCwgcHJvcGVydHlLZXkpXHJcbiAgaGFzOiBmdW5jdGlvbiBoYXModGFyZ2V0LCBwcm9wZXJ0eUtleSl7XHJcbiAgICByZXR1cm4gcHJvcGVydHlLZXkgaW4gdGFyZ2V0O1xyXG4gIH0sXHJcbiAgLy8gMjYuMS4xMCBSZWZsZWN0LmlzRXh0ZW5zaWJsZSh0YXJnZXQpXHJcbiAgaXNFeHRlbnNpYmxlOiBmdW5jdGlvbiBpc0V4dGVuc2libGUodGFyZ2V0KXtcclxuICAgIHJldHVybiBfaXNFeHRlbnNpYmxlKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcclxuICB9LFxyXG4gIC8vIDI2LjEuMTEgUmVmbGVjdC5vd25LZXlzKHRhcmdldClcclxuICBvd25LZXlzOiByZXF1aXJlKCcuLyQub3duLWtleXMnKSxcclxuICAvLyAyNi4xLjEyIFJlZmxlY3QucHJldmVudEV4dGVuc2lvbnModGFyZ2V0KVxyXG4gIHByZXZlbnRFeHRlbnNpb25zOiBmdW5jdGlvbiBwcmV2ZW50RXh0ZW5zaW9ucyh0YXJnZXQpe1xyXG4gICAgYXNzZXJ0T2JqZWN0KHRhcmdldCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBfcHJldmVudEV4dGVuc2lvbnModGFyZ2V0KTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGNhdGNoKGUpe1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyAyNi4xLjEzIFJlZmxlY3Quc2V0KHRhcmdldCwgcHJvcGVydHlLZXksIFYgWywgcmVjZWl2ZXJdKVxyXG4gIHNldDogZnVuY3Rpb24gc2V0KHRhcmdldCwgcHJvcGVydHlLZXksIFYvKiwgcmVjZWl2ZXIqLyl7XHJcbiAgICB2YXIgcmVjZWl2ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgNCA/IHRhcmdldCA6IGFyZ3VtZW50c1szXVxyXG4gICAgICAsIG93bkRlc2MgID0gJC5nZXREZXNjKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSlcclxuICAgICAgLCBleGlzdGluZ0Rlc2NyaXB0b3IsIHByb3RvO1xyXG4gICAgaWYoIW93bkRlc2Mpe1xyXG4gICAgICBpZihpc09iamVjdChwcm90byA9IGdldFByb3RvKHRhcmdldCkpKXtcclxuICAgICAgICByZXR1cm4gc2V0KHByb3RvLCBwcm9wZXJ0eUtleSwgViwgcmVjZWl2ZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIG93bkRlc2MgPSAkLmRlc2MoMCk7XHJcbiAgICB9XHJcbiAgICBpZigkLmhhcyhvd25EZXNjLCAndmFsdWUnKSl7XHJcbiAgICAgIGlmKG93bkRlc2Mud3JpdGFibGUgPT09IGZhbHNlIHx8ICFpc09iamVjdChyZWNlaXZlcikpcmV0dXJuIGZhbHNlO1xyXG4gICAgICBleGlzdGluZ0Rlc2NyaXB0b3IgPSAkLmdldERlc2MocmVjZWl2ZXIsIHByb3BlcnR5S2V5KSB8fCAkLmRlc2MoMCk7XHJcbiAgICAgIGV4aXN0aW5nRGVzY3JpcHRvci52YWx1ZSA9IFY7XHJcbiAgICAgICQuc2V0RGVzYyhyZWNlaXZlciwgcHJvcGVydHlLZXksIGV4aXN0aW5nRGVzY3JpcHRvcik7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG93bkRlc2Muc2V0ID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IChvd25EZXNjLnNldC5jYWxsKHJlY2VpdmVyLCBWKSwgdHJ1ZSk7XHJcbiAgfVxyXG59O1xyXG4vLyAyNi4xLjE0IFJlZmxlY3Quc2V0UHJvdG90eXBlT2YodGFyZ2V0LCBwcm90bylcclxuaWYoc2V0UHJvdG8pcmVmbGVjdC5zZXRQcm90b3R5cGVPZiA9IGZ1bmN0aW9uIHNldFByb3RvdHlwZU9mKHRhcmdldCwgcHJvdG8pe1xyXG4gIHNldFByb3RvLmNoZWNrKHRhcmdldCwgcHJvdG8pO1xyXG4gIHRyeSB7XHJcbiAgICBzZXRQcm90by5zZXQodGFyZ2V0LCBwcm90byk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9IGNhdGNoKGUpe1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxufTtcclxuXHJcbiRkZWYoJGRlZi5HLCB7UmVmbGVjdDoge319KTtcclxuXHJcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogYnVnZ3lFbnVtZXJhdGUsICdSZWZsZWN0Jywge1xyXG4gIC8vIDI2LjEuNSBSZWZsZWN0LmVudW1lcmF0ZSh0YXJnZXQpXHJcbiAgZW51bWVyYXRlOiBmdW5jdGlvbiBlbnVtZXJhdGUodGFyZ2V0KXtcclxuICAgIHJldHVybiBuZXcgRW51bWVyYXRlKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcclxuICB9XHJcbn0pO1xyXG5cclxuJGRlZigkZGVmLlMsICdSZWZsZWN0JywgcmVmbGVjdCk7IiwidmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY29mICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgJFJlZ0V4cCA9ICQuZy5SZWdFeHBcclxuICAsIEJhc2UgICAgPSAkUmVnRXhwXHJcbiAgLCBwcm90byAgID0gJFJlZ0V4cC5wcm90b3R5cGVcclxuICAsIHJlICAgICAgPSAvYS9nXHJcbiAgLy8gXCJuZXdcIiBjcmVhdGVzIGEgbmV3IG9iamVjdFxyXG4gICwgQ09SUkVDVF9ORVcgPSBuZXcgJFJlZ0V4cChyZSkgIT09IHJlXHJcbiAgLy8gUmVnRXhwIGFsbG93cyBhIHJlZ2V4IHdpdGggZmxhZ3MgYXMgdGhlIHBhdHRlcm5cclxuICAsIEFMTE9XU19SRV9XSVRIX0ZMQUdTID0gZnVuY3Rpb24oKXtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiAkUmVnRXhwKHJlLCAnaScpID09ICcvYS9pJztcclxuICAgIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxuICB9KCk7XHJcbmlmKCQuRlcgJiYgJC5ERVNDKXtcclxuICBpZighQ09SUkVDVF9ORVcgfHwgIUFMTE9XU19SRV9XSVRIX0ZMQUdTKXtcclxuICAgICRSZWdFeHAgPSBmdW5jdGlvbiBSZWdFeHAocGF0dGVybiwgZmxhZ3Mpe1xyXG4gICAgICB2YXIgcGF0dGVybklzUmVnRXhwICA9IGNvZihwYXR0ZXJuKSA9PSAnUmVnRXhwJ1xyXG4gICAgICAgICwgZmxhZ3NJc1VuZGVmaW5lZCA9IGZsYWdzID09PSB1bmRlZmluZWQ7XHJcbiAgICAgIGlmKCEodGhpcyBpbnN0YW5jZW9mICRSZWdFeHApICYmIHBhdHRlcm5Jc1JlZ0V4cCAmJiBmbGFnc0lzVW5kZWZpbmVkKXJldHVybiBwYXR0ZXJuO1xyXG4gICAgICByZXR1cm4gQ09SUkVDVF9ORVdcclxuICAgICAgICA/IG5ldyBCYXNlKHBhdHRlcm5Jc1JlZ0V4cCAmJiAhZmxhZ3NJc1VuZGVmaW5lZCA/IHBhdHRlcm4uc291cmNlIDogcGF0dGVybiwgZmxhZ3MpXHJcbiAgICAgICAgOiBuZXcgQmFzZShwYXR0ZXJuSXNSZWdFeHAgPyBwYXR0ZXJuLnNvdXJjZSA6IHBhdHRlcm5cclxuICAgICAgICAgICwgcGF0dGVybklzUmVnRXhwICYmIGZsYWdzSXNVbmRlZmluZWQgPyBwYXR0ZXJuLmZsYWdzIDogZmxhZ3MpO1xyXG4gICAgfTtcclxuICAgICQuZWFjaC5jYWxsKCQuZ2V0TmFtZXMoQmFzZSksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGtleSBpbiAkUmVnRXhwIHx8ICQuc2V0RGVzYygkUmVnRXhwLCBrZXksIHtcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gQmFzZVtrZXldOyB9LFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24oaXQpeyBCYXNlW2tleV0gPSBpdDsgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgcHJvdG8uY29uc3RydWN0b3IgPSAkUmVnRXhwO1xyXG4gICAgJFJlZ0V4cC5wcm90b3R5cGUgPSBwcm90bztcclxuICAgICQuaGlkZSgkLmcsICdSZWdFeHAnLCAkUmVnRXhwKTtcclxuICB9XHJcbiAgLy8gMjEuMi41LjMgZ2V0IFJlZ0V4cC5wcm90b3R5cGUuZmxhZ3MoKVxyXG4gIGlmKC8uL2cuZmxhZ3MgIT0gJ2cnKSQuc2V0RGVzYyhwcm90bywgJ2ZsYWdzJywge1xyXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgZ2V0OiByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvXi4qXFwvKFxcdyopJC8sICckMScpXHJcbiAgfSk7XHJcbn1cclxucmVxdWlyZSgnLi8kLnNwZWNpZXMnKSgkUmVnRXhwKTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi1zdHJvbmcnKTtcclxuXHJcbi8vIDIzLjIgU2V0IE9iamVjdHNcclxucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnU2V0Jywge1xyXG4gIC8vIDIzLjIuMy4xIFNldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxyXG4gIGFkZDogZnVuY3Rpb24gYWRkKHZhbHVlKXtcclxuICAgIHJldHVybiBzdHJvbmcuZGVmKHRoaXMsIHZhbHVlID0gdmFsdWUgPT09IDAgPyAwIDogdmFsdWUsIHZhbHVlKTtcclxuICB9XHJcbn0sIHN0cm9uZyk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgJGF0ICA9IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKShmYWxzZSk7XHJcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xyXG4gIC8vIDIxLjEuMy4zIFN0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXQocG9zKVxyXG4gIGNvZGVQb2ludEF0OiBmdW5jdGlvbiBjb2RlUG9pbnRBdChwb3Mpe1xyXG4gICAgcmV0dXJuICRhdCh0aGlzLCBwb3MpO1xyXG4gIH1cclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjb2YgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCB0b0xlbmd0aCA9ICQudG9MZW5ndGg7XHJcblxyXG4vLyBzaG91bGQgdGhyb3cgZXJyb3Igb24gcmVnZXhcclxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAhcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7ICdxJy5lbmRzV2l0aCgvLi8pOyB9KSwgJ1N0cmluZycsIHtcclxuICAvLyAyMS4xLjMuNiBTdHJpbmcucHJvdG90eXBlLmVuZHNXaXRoKHNlYXJjaFN0cmluZyBbLCBlbmRQb3NpdGlvbl0pXHJcbiAgZW5kc1dpdGg6IGZ1bmN0aW9uIGVuZHNXaXRoKHNlYXJjaFN0cmluZyAvKiwgZW5kUG9zaXRpb24gPSBAbGVuZ3RoICovKXtcclxuICAgIGlmKGNvZihzZWFyY2hTdHJpbmcpID09ICdSZWdFeHAnKXRocm93IFR5cGVFcnJvcigpO1xyXG4gICAgdmFyIHRoYXQgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIGVuZFBvc2l0aW9uID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICwgbGVuID0gdG9MZW5ndGgodGhhdC5sZW5ndGgpXHJcbiAgICAgICwgZW5kID0gZW5kUG9zaXRpb24gPT09IHVuZGVmaW5lZCA/IGxlbiA6IE1hdGgubWluKHRvTGVuZ3RoKGVuZFBvc2l0aW9uKSwgbGVuKTtcclxuICAgIHNlYXJjaFN0cmluZyArPSAnJztcclxuICAgIHJldHVybiB0aGF0LnNsaWNlKGVuZCAtIHNlYXJjaFN0cmluZy5sZW5ndGgsIGVuZCkgPT09IHNlYXJjaFN0cmluZztcclxuICB9XHJcbn0pOyIsInZhciAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCB0b0luZGV4ID0gcmVxdWlyZSgnLi8kJykudG9JbmRleFxyXG4gICwgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZVxyXG4gICwgJGZyb21Db2RlUG9pbnQgPSBTdHJpbmcuZnJvbUNvZGVQb2ludDtcclxuXHJcbi8vIGxlbmd0aCBzaG91bGQgYmUgMSwgb2xkIEZGIHByb2JsZW1cclxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAoISEkZnJvbUNvZGVQb2ludCAmJiAkZnJvbUNvZGVQb2ludC5sZW5ndGggIT0gMSksICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4yLjIgU3RyaW5nLmZyb21Db2RlUG9pbnQoLi4uY29kZVBvaW50cylcclxuICBmcm9tQ29kZVBvaW50OiBmdW5jdGlvbiBmcm9tQ29kZVBvaW50KHgpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiAgICB2YXIgcmVzID0gW11cclxuICAgICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICwgaSAgID0gMFxyXG4gICAgICAsIGNvZGU7XHJcbiAgICB3aGlsZShsZW4gPiBpKXtcclxuICAgICAgY29kZSA9ICthcmd1bWVudHNbaSsrXTtcclxuICAgICAgaWYodG9JbmRleChjb2RlLCAweDEwZmZmZikgIT09IGNvZGUpdGhyb3cgUmFuZ2VFcnJvcihjb2RlICsgJyBpcyBub3QgYSB2YWxpZCBjb2RlIHBvaW50Jyk7XHJcbiAgICAgIHJlcy5wdXNoKGNvZGUgPCAweDEwMDAwXHJcbiAgICAgICAgPyBmcm9tQ2hhckNvZGUoY29kZSlcclxuICAgICAgICA6IGZyb21DaGFyQ29kZSgoKGNvZGUgLT0gMHgxMDAwMCkgPj4gMTApICsgMHhkODAwLCBjb2RlICUgMHg0MDAgKyAweGRjMDApXHJcbiAgICAgICk7XHJcbiAgICB9IHJldHVybiByZXMuam9pbignJyk7XHJcbiAgfVxyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGNvZiAgPSByZXF1aXJlKCcuLyQuY29mJylcclxuICAsICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcblxyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcclxuICAvLyAyMS4xLjMuNyBTdHJpbmcucHJvdG90eXBlLmluY2x1ZGVzKHNlYXJjaFN0cmluZywgcG9zaXRpb24gPSAwKVxyXG4gIGluY2x1ZGVzOiBmdW5jdGlvbiBpbmNsdWRlcyhzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XHJcbiAgICBpZihjb2Yoc2VhcmNoU3RyaW5nKSA9PSAnUmVnRXhwJyl0aHJvdyBUeXBlRXJyb3IoKTtcclxuICAgIHJldHVybiAhIX5TdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoaXMpKS5pbmRleE9mKHNlYXJjaFN0cmluZywgYXJndW1lbnRzWzFdKTtcclxuICB9XHJcbn0pOyIsInZhciBzZXQgICA9IHJlcXVpcmUoJy4vJCcpLnNldFxyXG4gICwgJGF0ICAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykodHJ1ZSlcclxuICAsIElURVIgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ2l0ZXInKVxyXG4gICwgJGl0ZXIgPSByZXF1aXJlKCcuLyQuaXRlcicpXHJcbiAgLCBzdGVwICA9ICRpdGVyLnN0ZXA7XHJcblxyXG4vLyAyMS4xLjMuMjcgU3RyaW5nLnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXHJcbnJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKFN0cmluZywgJ1N0cmluZycsIGZ1bmN0aW9uKGl0ZXJhdGVkKXtcclxuICBzZXQodGhpcywgSVRFUiwge286IFN0cmluZyhpdGVyYXRlZCksIGk6IDB9KTtcclxuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxyXG59LCBmdW5jdGlvbigpe1xyXG4gIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cclxuICAgICwgTyAgICAgPSBpdGVyLm9cclxuICAgICwgaW5kZXggPSBpdGVyLmlcclxuICAgICwgcG9pbnQ7XHJcbiAgaWYoaW5kZXggPj0gTy5sZW5ndGgpcmV0dXJuIHN0ZXAoMSk7XHJcbiAgcG9pbnQgPSAkYXQoTywgaW5kZXgpO1xyXG4gIGl0ZXIuaSArPSBwb2ludC5sZW5ndGg7XHJcbiAgcmV0dXJuIHN0ZXAoMCwgcG9pbnQpO1xyXG59KTsiLCJ2YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG5cclxuJGRlZigkZGVmLlMsICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4yLjQgU3RyaW5nLnJhdyhjYWxsU2l0ZSwgLi4uc3Vic3RpdHV0aW9ucylcclxuICByYXc6IGZ1bmN0aW9uIHJhdyhjYWxsU2l0ZSl7XHJcbiAgICB2YXIgdHBsID0gJC50b09iamVjdChjYWxsU2l0ZS5yYXcpXHJcbiAgICAgICwgbGVuID0gJC50b0xlbmd0aCh0cGwubGVuZ3RoKVxyXG4gICAgICAsIHNsbiA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgLCByZXMgPSBbXVxyXG4gICAgICAsIGkgICA9IDA7XHJcbiAgICB3aGlsZShsZW4gPiBpKXtcclxuICAgICAgcmVzLnB1c2goU3RyaW5nKHRwbFtpKytdKSk7XHJcbiAgICAgIGlmKGkgPCBzbG4pcmVzLnB1c2goU3RyaW5nKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgfSByZXR1cm4gcmVzLmpvaW4oJycpO1xyXG4gIH1cclxufSk7IiwidmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcblxyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcclxuICAvLyAyMS4xLjMuMTMgU3RyaW5nLnByb3RvdHlwZS5yZXBlYXQoY291bnQpXHJcbiAgcmVwZWF0OiByZXF1aXJlKCcuLyQuc3RyaW5nLXJlcGVhdCcpXHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY29mICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuXHJcbi8vIHNob3VsZCB0aHJvdyBlcnJvciBvbiByZWdleFxyXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqICFyZXF1aXJlKCcuLyQudGhyb3dzJykoZnVuY3Rpb24oKXsgJ3EnLnN0YXJ0c1dpdGgoLy4vKTsgfSksICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4zLjE4IFN0cmluZy5wcm90b3R5cGUuc3RhcnRzV2l0aChzZWFyY2hTdHJpbmcgWywgcG9zaXRpb24gXSlcclxuICBzdGFydHNXaXRoOiBmdW5jdGlvbiBzdGFydHNXaXRoKHNlYXJjaFN0cmluZyAvKiwgcG9zaXRpb24gPSAwICovKXtcclxuICAgIGlmKGNvZihzZWFyY2hTdHJpbmcpID09ICdSZWdFeHAnKXRocm93IFR5cGVFcnJvcigpO1xyXG4gICAgdmFyIHRoYXQgID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgLCBpbmRleCA9ICQudG9MZW5ndGgoTWF0aC5taW4oYXJndW1lbnRzWzFdLCB0aGF0Lmxlbmd0aCkpO1xyXG4gICAgc2VhcmNoU3RyaW5nICs9ICcnO1xyXG4gICAgcmV0dXJuIHRoYXQuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoU3RyaW5nLmxlbmd0aCkgPT09IHNlYXJjaFN0cmluZztcclxuICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxyXG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgc2V0VGFnICAgPSByZXF1aXJlKCcuLyQuY29mJykuc2V0XHJcbiAgLCB1aWQgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKVxyXG4gICwgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIGtleU9mICAgID0gcmVxdWlyZSgnLi8kLmtleW9mJylcclxuICAsIGVudW1LZXlzID0gcmVxdWlyZSgnLi8kLmVudW0ta2V5cycpXHJcbiAgLCBhc3NlcnRPYmplY3QgPSByZXF1aXJlKCcuLyQuYXNzZXJ0Jykub2JqXHJcbiAgLCBoYXMgICAgICA9ICQuaGFzXHJcbiAgLCAkY3JlYXRlICA9ICQuY3JlYXRlXHJcbiAgLCBnZXREZXNjICA9ICQuZ2V0RGVzY1xyXG4gICwgc2V0RGVzYyAgPSAkLnNldERlc2NcclxuICAsIGRlc2MgICAgID0gJC5kZXNjXHJcbiAgLCBnZXROYW1lcyA9ICQuZ2V0TmFtZXNcclxuICAsIHRvT2JqZWN0ID0gJC50b09iamVjdFxyXG4gICwgJFN5bWJvbCAgPSAkLmcuU3ltYm9sXHJcbiAgLCBzZXR0ZXIgICA9IGZhbHNlXHJcbiAgLCBUQUcgICAgICA9IHVpZCgndGFnJylcclxuICAsIEhJRERFTiAgID0gdWlkKCdoaWRkZW4nKVxyXG4gICwgU3ltYm9sUmVnaXN0cnkgPSB7fVxyXG4gICwgQWxsU3ltYm9scyA9IHt9XHJcbiAgLCB1c2VOYXRpdmUgPSAkLmlzRnVuY3Rpb24oJFN5bWJvbCk7XHJcblxyXG5mdW5jdGlvbiB3cmFwKHRhZyl7XHJcbiAgdmFyIHN5bSA9IEFsbFN5bWJvbHNbdGFnXSA9ICQuc2V0KCRjcmVhdGUoJFN5bWJvbC5wcm90b3R5cGUpLCBUQUcsIHRhZyk7XHJcbiAgJC5ERVNDICYmIHNldHRlciAmJiBzZXREZXNjKE9iamVjdC5wcm90b3R5cGUsIHRhZywge1xyXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgIGlmKGhhcyh0aGlzLCBISURERU4pICYmIGhhcyh0aGlzW0hJRERFTl0sIHRhZykpdGhpc1tISURERU5dW3RhZ10gPSBmYWxzZTtcclxuICAgICAgc2V0RGVzYyh0aGlzLCB0YWcsIGRlc2MoMSwgdmFsdWUpKTtcclxuICAgIH1cclxuICB9KTtcclxuICByZXR1cm4gc3ltO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBEKXtcclxuICBpZihEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpKXtcclxuICAgIGlmKCFELmVudW1lcmFibGUpe1xyXG4gICAgICBpZighaGFzKGl0LCBISURERU4pKXNldERlc2MoaXQsIEhJRERFTiwgZGVzYygxLCB7fSkpO1xyXG4gICAgICBpdFtISURERU5dW2tleV0gPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSlpdFtISURERU5dW2tleV0gPSBmYWxzZTtcclxuICAgICAgRC5lbnVtZXJhYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSByZXR1cm4gc2V0RGVzYyhpdCwga2V5LCBEKTtcclxufVxyXG5mdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKGl0LCBQKXtcclxuICBhc3NlcnRPYmplY3QoaXQpO1xyXG4gIHZhciBrZXlzID0gZW51bUtleXMoUCA9IHRvT2JqZWN0KFApKVxyXG4gICAgLCBpICAgID0gMFxyXG4gICAgLCBsID0ga2V5cy5sZW5ndGhcclxuICAgICwga2V5O1xyXG4gIHdoaWxlKGwgPiBpKWRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XHJcbiAgcmV0dXJuIGl0O1xyXG59XHJcbmZ1bmN0aW9uIGNyZWF0ZShpdCwgUCl7XHJcbiAgcmV0dXJuIFAgPT09IHVuZGVmaW5lZCA/ICRjcmVhdGUoaXQpIDogZGVmaW5lUHJvcGVydGllcygkY3JlYXRlKGl0KSwgUCk7XHJcbn1cclxuZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xyXG4gIHZhciBEID0gZ2V0RGVzYyhpdCA9IHRvT2JqZWN0KGl0KSwga2V5KTtcclxuICBpZihEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICEoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkpRC5lbnVtZXJhYmxlID0gdHJ1ZTtcclxuICByZXR1cm4gRDtcclxufVxyXG5mdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KXtcclxuICB2YXIgbmFtZXMgID0gZ2V0TmFtZXModG9PYmplY3QoaXQpKVxyXG4gICAgLCByZXN1bHQgPSBbXVxyXG4gICAgLCBpICAgICAgPSAwXHJcbiAgICAsIGtleTtcclxuICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWlmKCFoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYga2V5ICE9IEhJRERFTilyZXN1bHQucHVzaChrZXkpO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGl0KXtcclxuICB2YXIgbmFtZXMgID0gZ2V0TmFtZXModG9PYmplY3QoaXQpKVxyXG4gICAgLCByZXN1bHQgPSBbXVxyXG4gICAgLCBpICAgICAgPSAwXHJcbiAgICAsIGtleTtcclxuICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWlmKGhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSlyZXN1bHQucHVzaChBbGxTeW1ib2xzW2tleV0pO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxyXG5pZighdXNlTmF0aXZlKXtcclxuICAkU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKGRlc2NyaXB0aW9uKXtcclxuICAgIGlmKHRoaXMgaW5zdGFuY2VvZiAkU3ltYm9sKXRocm93IFR5cGVFcnJvcignU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yJyk7XHJcbiAgICByZXR1cm4gd3JhcCh1aWQoZGVzY3JpcHRpb24pKTtcclxuICB9O1xyXG4gICQuaGlkZSgkU3ltYm9sLnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiB0aGlzW1RBR107XHJcbiAgfSk7XHJcblxyXG4gICQuY3JlYXRlICAgICA9IGNyZWF0ZTtcclxuICAkLnNldERlc2MgICAgPSBkZWZpbmVQcm9wZXJ0eTtcclxuICAkLmdldERlc2MgICAgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XHJcbiAgJC5zZXREZXNjcyAgID0gZGVmaW5lUHJvcGVydGllcztcclxuICAkLmdldE5hbWVzICAgPSBnZXRPd25Qcm9wZXJ0eU5hbWVzO1xyXG4gICQuZ2V0U3ltYm9scyA9IGdldE93blByb3BlcnR5U3ltYm9scztcclxufVxyXG5cclxudmFyIHN5bWJvbFN0YXRpY3MgPSB7XHJcbiAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXHJcbiAgJ2Zvcic6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICByZXR1cm4gaGFzKFN5bWJvbFJlZ2lzdHJ5LCBrZXkgKz0gJycpXHJcbiAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxyXG4gICAgICA6IFN5bWJvbFJlZ2lzdHJ5W2tleV0gPSAkU3ltYm9sKGtleSk7XHJcbiAgfSxcclxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcclxuICBrZXlGb3I6IGZ1bmN0aW9uIGtleUZvcihrZXkpe1xyXG4gICAgcmV0dXJuIGtleU9mKFN5bWJvbFJlZ2lzdHJ5LCBrZXkpO1xyXG4gIH0sXHJcbiAgdXNlU2V0dGVyOiBmdW5jdGlvbigpeyBzZXR0ZXIgPSB0cnVlOyB9LFxyXG4gIHVzZVNpbXBsZTogZnVuY3Rpb24oKXsgc2V0dGVyID0gZmFsc2U7IH1cclxufTtcclxuLy8gMTkuNC4yLjIgU3ltYm9sLmhhc0luc3RhbmNlXHJcbi8vIDE5LjQuMi4zIFN5bWJvbC5pc0NvbmNhdFNwcmVhZGFibGVcclxuLy8gMTkuNC4yLjQgU3ltYm9sLml0ZXJhdG9yXHJcbi8vIDE5LjQuMi42IFN5bWJvbC5tYXRjaFxyXG4vLyAxOS40LjIuOCBTeW1ib2wucmVwbGFjZVxyXG4vLyAxOS40LjIuOSBTeW1ib2wuc2VhcmNoXHJcbi8vIDE5LjQuMi4xMCBTeW1ib2wuc3BlY2llc1xyXG4vLyAxOS40LjIuMTEgU3ltYm9sLnNwbGl0XHJcbi8vIDE5LjQuMi4xMiBTeW1ib2wudG9QcmltaXRpdmVcclxuLy8gMTkuNC4yLjEzIFN5bWJvbC50b1N0cmluZ1RhZ1xyXG4vLyAxOS40LjIuMTQgU3ltYm9sLnVuc2NvcGFibGVzXHJcbiQuZWFjaC5jYWxsKChcclxuICAgICdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsaXRlcmF0b3IsbWF0Y2gscmVwbGFjZSxzZWFyY2gsJyArXHJcbiAgICAnc3BlY2llcyxzcGxpdCx0b1ByaW1pdGl2ZSx0b1N0cmluZ1RhZyx1bnNjb3BhYmxlcydcclxuICApLnNwbGl0KCcsJyksIGZ1bmN0aW9uKGl0KXtcclxuICAgIHZhciBzeW0gPSByZXF1aXJlKCcuLyQud2tzJykoaXQpO1xyXG4gICAgc3ltYm9sU3RhdGljc1tpdF0gPSB1c2VOYXRpdmUgPyBzeW0gOiB3cmFwKHN5bSk7XHJcbiAgfVxyXG4pO1xyXG5cclxuc2V0dGVyID0gdHJ1ZTtcclxuXHJcbiRkZWYoJGRlZi5HICsgJGRlZi5XLCB7U3ltYm9sOiAkU3ltYm9sfSk7XHJcblxyXG4kZGVmKCRkZWYuUywgJ1N5bWJvbCcsIHN5bWJvbFN0YXRpY3MpO1xyXG5cclxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCAnT2JqZWN0Jywge1xyXG4gIC8vIDE5LjEuMi4yIE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcclxuICBjcmVhdGU6IGNyZWF0ZSxcclxuICAvLyAxOS4xLjIuNCBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcclxuICBkZWZpbmVQcm9wZXJ0eTogZGVmaW5lUHJvcGVydHksXHJcbiAgLy8gMTkuMS4yLjMgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcylcclxuICBkZWZpbmVQcm9wZXJ0aWVzOiBkZWZpbmVQcm9wZXJ0aWVzLFxyXG4gIC8vIDE5LjEuMi42IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcclxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6IGdldE93blByb3BlcnR5RGVzY3JpcHRvcixcclxuICAvLyAxOS4xLjIuNyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxyXG4gIGdldE93blByb3BlcnR5TmFtZXM6IGdldE93blByb3BlcnR5TmFtZXMsXHJcbiAgLy8gMTkuMS4yLjggT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhPKVxyXG4gIGdldE93blByb3BlcnR5U3ltYm9sczogZ2V0T3duUHJvcGVydHlTeW1ib2xzXHJcbn0pO1xyXG5cclxuLy8gMTkuNC4zLjUgU3ltYm9sLnByb3RvdHlwZVtAQHRvU3RyaW5nVGFnXVxyXG5zZXRUYWcoJFN5bWJvbCwgJ1N5bWJvbCcpO1xyXG4vLyAyMC4yLjEuOSBNYXRoW0BAdG9TdHJpbmdUYWddXHJcbnNldFRhZyhNYXRoLCAnTWF0aCcsIHRydWUpO1xyXG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxyXG5zZXRUYWcoJC5nLkpTT04sICdKU09OJywgdHJ1ZSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIHdlYWsgICAgICA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXdlYWsnKVxyXG4gICwgbGVha1N0b3JlID0gd2Vhay5sZWFrU3RvcmVcclxuICAsIElEICAgICAgICA9IHdlYWsuSURcclxuICAsIFdFQUsgICAgICA9IHdlYWsuV0VBS1xyXG4gICwgaGFzICAgICAgID0gJC5oYXNcclxuICAsIGlzT2JqZWN0ICA9ICQuaXNPYmplY3RcclxuICAsIGlzRnJvemVuICA9IE9iamVjdC5pc0Zyb3plbiB8fCAkLmNvcmUuT2JqZWN0LmlzRnJvemVuXHJcbiAgLCB0bXAgICAgICAgPSB7fTtcclxuXHJcbi8vIDIzLjMgV2Vha01hcCBPYmplY3RzXHJcbnZhciBXZWFrTWFwID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnV2Vha01hcCcsIHtcclxuICAvLyAyMy4zLjMuMyBXZWFrTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxyXG4gIGdldDogZnVuY3Rpb24gZ2V0KGtleSl7XHJcbiAgICBpZihpc09iamVjdChrZXkpKXtcclxuICAgICAgaWYoaXNGcm96ZW4oa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpLmdldChrZXkpO1xyXG4gICAgICBpZihoYXMoa2V5LCBXRUFLKSlyZXR1cm4ga2V5W1dFQUtdW3RoaXNbSURdXTtcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIDIzLjMuMy41IFdlYWtNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxyXG4gIHNldDogZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpe1xyXG4gICAgcmV0dXJuIHdlYWsuZGVmKHRoaXMsIGtleSwgdmFsdWUpO1xyXG4gIH1cclxufSwgd2VhaywgdHJ1ZSwgdHJ1ZSk7XHJcblxyXG4vLyBJRTExIFdlYWtNYXAgZnJvemVuIGtleXMgZml4XHJcbmlmKCQuRlcgJiYgbmV3IFdlYWtNYXAoKS5zZXQoKE9iamVjdC5mcmVlemUgfHwgT2JqZWN0KSh0bXApLCA3KS5nZXQodG1wKSAhPSA3KXtcclxuICAkLmVhY2guY2FsbChbJ2RlbGV0ZScsICdoYXMnLCAnZ2V0JywgJ3NldCddLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgdmFyIG1ldGhvZCA9IFdlYWtNYXAucHJvdG90eXBlW2tleV07XHJcbiAgICBXZWFrTWFwLnByb3RvdHlwZVtrZXldID0gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgIC8vIHN0b3JlIGZyb3plbiBvYmplY3RzIG9uIGxlYWt5IG1hcFxyXG4gICAgICBpZihpc09iamVjdChhKSAmJiBpc0Zyb3plbihhKSl7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGxlYWtTdG9yZSh0aGlzKVtrZXldKGEsIGIpO1xyXG4gICAgICAgIHJldHVybiBrZXkgPT0gJ3NldCcgPyB0aGlzIDogcmVzdWx0O1xyXG4gICAgICAvLyBzdG9yZSBhbGwgdGhlIHJlc3Qgb24gbmF0aXZlIHdlYWttYXBcclxuICAgICAgfSByZXR1cm4gbWV0aG9kLmNhbGwodGhpcywgYSwgYik7XHJcbiAgICB9O1xyXG4gIH0pO1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgd2VhayA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXdlYWsnKTtcclxuXHJcbi8vIDIzLjQgV2Vha1NldCBPYmplY3RzXHJcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ1dlYWtTZXQnLCB7XHJcbiAgLy8gMjMuNC4zLjEgV2Vha1NldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxyXG4gIGFkZDogZnVuY3Rpb24gYWRkKHZhbHVlKXtcclxuICAgIHJldHVybiB3ZWFrLmRlZih0aGlzLCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgfVxyXG59LCB3ZWFrLCBmYWxzZSwgdHJ1ZSk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL2RvbWVuaWMvQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzXHJcbnZhciAkZGVmICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICRpbmNsdWRlcyA9IHJlcXVpcmUoJy4vJC5hcnJheS1pbmNsdWRlcycpKHRydWUpO1xyXG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xyXG4gIGluY2x1ZGVzOiBmdW5jdGlvbiBpbmNsdWRlcyhlbCAvKiwgZnJvbUluZGV4ID0gMCAqLyl7XHJcbiAgICByZXR1cm4gJGluY2x1ZGVzKHRoaXMsIGVsLCBhcmd1bWVudHNbMV0pO1xyXG4gIH1cclxufSk7XHJcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2luY2x1ZGVzJyk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxyXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbi10by1qc29uJykoJ01hcCcpOyIsIi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL1dlYlJlZmxlY3Rpb24vOTM1Mzc4MVxyXG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBvd25LZXlzID0gcmVxdWlyZSgnLi8kLm93bi1rZXlzJyk7XHJcblxyXG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtcclxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKG9iamVjdCl7XHJcbiAgICB2YXIgTyAgICAgID0gJC50b09iamVjdChvYmplY3QpXHJcbiAgICAgICwgcmVzdWx0ID0ge307XHJcbiAgICAkLmVhY2guY2FsbChvd25LZXlzKE8pLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICAkLnNldERlc2MocmVzdWx0LCBrZXksICQuZGVzYygwLCAkLmdldERlc2MoTywga2V5KSkpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxufSk7IiwiLy8gaHR0cDovL2dvby5nbC9Ya0JyakRcclxudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuZnVuY3Rpb24gY3JlYXRlT2JqZWN0VG9BcnJheShpc0VudHJpZXMpe1xyXG4gIHJldHVybiBmdW5jdGlvbihvYmplY3Qpe1xyXG4gICAgdmFyIE8gICAgICA9ICQudG9PYmplY3Qob2JqZWN0KVxyXG4gICAgICAsIGtleXMgICA9ICQuZ2V0S2V5cyhPKVxyXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXHJcbiAgICAgICwgaSAgICAgID0gMFxyXG4gICAgICAsIHJlc3VsdCA9IEFycmF5KGxlbmd0aClcclxuICAgICAgLCBrZXk7XHJcbiAgICBpZihpc0VudHJpZXMpd2hpbGUobGVuZ3RoID4gaSlyZXN1bHRbaV0gPSBba2V5ID0ga2V5c1tpKytdLCBPW2tleV1dO1xyXG4gICAgZWxzZSB3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IE9ba2V5c1tpKytdXTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfTtcclxufVxyXG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtcclxuICB2YWx1ZXM6ICBjcmVhdGVPYmplY3RUb0FycmF5KGZhbHNlKSxcclxuICBlbnRyaWVzOiBjcmVhdGVPYmplY3RUb0FycmF5KHRydWUpXHJcbn0pOyIsIi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2thbmdheC85Njk4MTAwXHJcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG4kZGVmKCRkZWYuUywgJ1JlZ0V4cCcsIHtcclxuICBlc2NhcGU6IHJlcXVpcmUoJy4vJC5yZXBsYWNlcicpKC8oW1xcXFxcXC1bXFxde30oKSorPy4sXiR8XSkvZywgJ1xcXFwkMScsIHRydWUpXHJcbn0pOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cclxucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tdG8tanNvbicpKCdTZXQnKTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vbWF0aGlhc2J5bmVucy9TdHJpbmcucHJvdG90eXBlLmF0XHJcbid1c2Ugc3RyaWN0JztcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICRhdCAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykodHJ1ZSk7XHJcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xyXG4gIGF0OiBmdW5jdGlvbiBhdChwb3Mpe1xyXG4gICAgcmV0dXJuICRhdCh0aGlzLCBwb3MpO1xyXG4gIH1cclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgJHBhZCA9IHJlcXVpcmUoJy4vJC5zdHJpbmctcGFkJyk7XHJcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xyXG4gIGxwYWQ6IGZ1bmN0aW9uIGxwYWQobil7XHJcbiAgICByZXR1cm4gJHBhZCh0aGlzLCBuLCBhcmd1bWVudHNbMV0sIHRydWUpO1xyXG4gIH1cclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgJHBhZCA9IHJlcXVpcmUoJy4vJC5zdHJpbmctcGFkJyk7XHJcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xyXG4gIHJwYWQ6IGZ1bmN0aW9uIHJwYWQobil7XHJcbiAgICByZXR1cm4gJHBhZCh0aGlzLCBuLCBhcmd1bWVudHNbMV0sIGZhbHNlKTtcclxuICB9XHJcbn0pOyIsIi8vIEphdmFTY3JpcHQgMS42IC8gU3RyYXdtYW4gYXJyYXkgc3RhdGljcyBzaGltXHJcbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICRBcnJheSAgPSAkLmNvcmUuQXJyYXkgfHwgQXJyYXlcclxuICAsIHN0YXRpY3MgPSB7fTtcclxuZnVuY3Rpb24gc2V0U3RhdGljcyhrZXlzLCBsZW5ndGgpe1xyXG4gICQuZWFjaC5jYWxsKGtleXMuc3BsaXQoJywnKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgIGlmKGxlbmd0aCA9PSB1bmRlZmluZWQgJiYga2V5IGluICRBcnJheSlzdGF0aWNzW2tleV0gPSAkQXJyYXlba2V5XTtcclxuICAgIGVsc2UgaWYoa2V5IGluIFtdKXN0YXRpY3Nba2V5XSA9IHJlcXVpcmUoJy4vJC5jdHgnKShGdW5jdGlvbi5jYWxsLCBbXVtrZXldLCBsZW5ndGgpO1xyXG4gIH0pO1xyXG59XHJcbnNldFN0YXRpY3MoJ3BvcCxyZXZlcnNlLHNoaWZ0LGtleXMsdmFsdWVzLGVudHJpZXMnLCAxKTtcclxuc2V0U3RhdGljcygnaW5kZXhPZixldmVyeSxzb21lLGZvckVhY2gsbWFwLGZpbHRlcixmaW5kLGZpbmRJbmRleCxpbmNsdWRlcycsIDMpO1xyXG5zZXRTdGF0aWNzKCdqb2luLHNsaWNlLGNvbmNhdCxwdXNoLHNwbGljZSx1bnNoaWZ0LHNvcnQsbGFzdEluZGV4T2YsJyArXHJcbiAgICAgICAgICAgJ3JlZHVjZSxyZWR1Y2VSaWdodCxjb3B5V2l0aGluLGZpbGwsdHVybicpO1xyXG4kZGVmKCRkZWYuUywgJ0FycmF5Jywgc3RhdGljcyk7IiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcclxudmFyICQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIEl0ZXJhdG9ycyAgID0gcmVxdWlyZSgnLi8kLml0ZXInKS5JdGVyYXRvcnNcclxuICAsIElURVJBVE9SICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXHJcbiAgLCBBcnJheVZhbHVlcyA9IEl0ZXJhdG9ycy5BcnJheVxyXG4gICwgTm9kZUxpc3QgICAgPSAkLmcuTm9kZUxpc3Q7XHJcbmlmKCQuRlcgJiYgTm9kZUxpc3QgJiYgIShJVEVSQVRPUiBpbiBOb2RlTGlzdC5wcm90b3R5cGUpKXtcclxuICAkLmhpZGUoTm9kZUxpc3QucHJvdG90eXBlLCBJVEVSQVRPUiwgQXJyYXlWYWx1ZXMpO1xyXG59XHJcbkl0ZXJhdG9ycy5Ob2RlTGlzdCA9IEFycmF5VmFsdWVzOyIsInZhciAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgJHRhc2sgPSByZXF1aXJlKCcuLyQudGFzaycpO1xyXG4kZGVmKCRkZWYuRyArICRkZWYuQiwge1xyXG4gIHNldEltbWVkaWF0ZTogICAkdGFzay5zZXQsXHJcbiAgY2xlYXJJbW1lZGlhdGU6ICR0YXNrLmNsZWFyXHJcbn0pOyIsIi8vIGllOS0gc2V0VGltZW91dCAmIHNldEludGVydmFsIGFkZGl0aW9uYWwgcGFyYW1ldGVycyBmaXhcclxudmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIGludm9rZSAgICA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxyXG4gICwgcGFydGlhbCAgID0gcmVxdWlyZSgnLi8kLnBhcnRpYWwnKVxyXG4gICwgbmF2aWdhdG9yID0gJC5nLm5hdmlnYXRvclxyXG4gICwgTVNJRSAgICAgID0gISFuYXZpZ2F0b3IgJiYgL01TSUUgLlxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTsgLy8gPC0gZGlydHkgaWU5LSBjaGVja1xyXG5mdW5jdGlvbiB3cmFwKHNldCl7XHJcbiAgcmV0dXJuIE1TSUUgPyBmdW5jdGlvbihmbiwgdGltZSAvKiwgLi4uYXJncyAqLyl7XHJcbiAgICByZXR1cm4gc2V0KGludm9rZShcclxuICAgICAgcGFydGlhbCxcclxuICAgICAgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpLFxyXG4gICAgICAkLmlzRnVuY3Rpb24oZm4pID8gZm4gOiBGdW5jdGlvbihmbilcclxuICAgICksIHRpbWUpO1xyXG4gIH0gOiBzZXQ7XHJcbn1cclxuJGRlZigkZGVmLkcgKyAkZGVmLkIgKyAkZGVmLkYgKiBNU0lFLCB7XHJcbiAgc2V0VGltZW91dDogIHdyYXAoJC5nLnNldFRpbWVvdXQpLFxyXG4gIHNldEludGVydmFsOiB3cmFwKCQuZy5zZXRJbnRlcnZhbClcclxufSk7IiwicmVxdWlyZSgnLi9tb2R1bGVzL2VzNScpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN5bWJvbCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24nKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3QuaXMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZicpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcycpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmZ1bmN0aW9uLm5hbWUnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5mdW5jdGlvbi5oYXMtaW5zdGFuY2UnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5udW1iZXIuY29uc3RydWN0b3InKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5udW1iZXIuc3RhdGljcycpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm1hdGgnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuZnJvbS1jb2RlLXBvaW50Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLnJhdycpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5jb2RlLXBvaW50LWF0Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmVuZHMtd2l0aCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5pbmNsdWRlcycpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5yZXBlYXQnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuc3RhcnRzLXdpdGgnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5mcm9tJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkub2YnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvcicpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LnNwZWNpZXMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5jb3B5LXdpdGhpbicpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZpbGwnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5maW5kJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZmluZC1pbmRleCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZ2V4cCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnByb21pc2UnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5tYXAnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zZXQnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi53ZWFrLW1hcCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LndlYWstc2V0Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYucmVmbGVjdCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuc3RyaW5nLmF0Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuc3RyaW5nLmxwYWQnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5zdHJpbmcucnBhZCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnJlZ2V4cC5lc2NhcGUnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9ycycpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3Lm9iamVjdC50by1hcnJheScpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3Lm1hcC50by1qc29uJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuc2V0LnRvLWpzb24nKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2pzLmFycmF5LnN0YXRpY3MnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL3dlYi50aW1lcnMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL3dlYi5pbW1lZGlhdGUnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcclxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL21vZHVsZXMvJCcpLmNvcmU7XHJcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIGh0dHBzOi8vcmF3LmdpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvbWFzdGVyL0xJQ0VOU0UgZmlsZS4gQW5cbiAqIGFkZGl0aW9uYWwgZ3JhbnQgb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpblxuICogdGhlIHNhbWUgZGlyZWN0b3J5LlxuICovXG5cbiEoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID1cbiAgICB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuXG4gIHZhciBpbk1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCI7XG4gIHZhciBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgaWYgKHJ1bnRpbWUpIHtcbiAgICBpZiAoaW5Nb2R1bGUpIHtcbiAgICAgIC8vIElmIHJlZ2VuZXJhdG9yUnVudGltZSBpcyBkZWZpbmVkIGdsb2JhbGx5IGFuZCB3ZSdyZSBpbiBhIG1vZHVsZSxcbiAgICAgIC8vIG1ha2UgdGhlIGV4cG9ydHMgb2JqZWN0IGlkZW50aWNhbCB0byByZWdlbmVyYXRvclJ1bnRpbWUuXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IHJ1bnRpbWU7XG4gICAgfVxuICAgIC8vIERvbid0IGJvdGhlciBldmFsdWF0aW5nIHRoZSByZXN0IG9mIHRoaXMgZmlsZSBpZiB0aGUgcnVudGltZSB3YXNcbiAgICAvLyBhbHJlYWR5IGRlZmluZWQgZ2xvYmFsbHkuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRGVmaW5lIHRoZSBydW50aW1lIGdsb2JhbGx5IChhcyBleHBlY3RlZCBieSBnZW5lcmF0ZWQgY29kZSkgYXMgZWl0aGVyXG4gIC8vIG1vZHVsZS5leHBvcnRzIChpZiB3ZSdyZSBpbiBhIG1vZHVsZSkgb3IgYSBuZXcsIGVtcHR5IG9iamVjdC5cbiAgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWUgPSBpbk1vZHVsZSA/IG1vZHVsZS5leHBvcnRzIDoge307XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUoKG91dGVyRm4gfHwgR2VuZXJhdG9yKS5wcm90b3R5cGUpO1xuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKFxuICAgICAgaW5uZXJGbiwgc2VsZiB8fCBudWxsLFxuICAgICAgbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pXG4gICAgKTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cbiAgcnVudGltZS53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID0gR2VuZXJhdG9yLnByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgcnVudGltZS5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIHJ1bnRpbWUuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBnZW5lcmF0b3IgPSB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KTtcbiAgICAgIHZhciBjYWxsTmV4dCA9IHN0ZXAuYmluZChnZW5lcmF0b3IsIFwibmV4dFwiKTtcbiAgICAgIHZhciBjYWxsVGhyb3cgPSBzdGVwLmJpbmQoZ2VuZXJhdG9yLCBcInRocm93XCIpO1xuXG4gICAgICBmdW5jdGlvbiBzdGVwKG1ldGhvZCwgYXJnKSB7XG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG4gICAgICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgICAgICByZXNvbHZlKGluZm8udmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFByb21pc2UucmVzb2x2ZShpbmZvLnZhbHVlKS50aGVuKGNhbGxOZXh0LCBjYWxsVGhyb3cpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNhbGxOZXh0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIGlmIChtZXRob2QgPT09IFwicmV0dXJuXCIgfHxcbiAgICAgICAgICAgICAgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiICYmIGRlbGVnYXRlLml0ZXJhdG9yW21ldGhvZF0gPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgIC8vIEEgcmV0dXJuIG9yIHRocm93ICh3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gdGhyb3dcbiAgICAgICAgICAgIC8vIG1ldGhvZCkgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICAgIHZhciByZXR1cm5NZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXTtcbiAgICAgICAgICAgIGlmIChyZXR1cm5NZXRob2QpIHtcbiAgICAgICAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKHJldHVybk1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGFyZyk7XG4gICAgICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJldHVybiBtZXRob2QgdGhyZXcgYW4gZXhjZXB0aW9uLCBsZXQgdGhhdFxuICAgICAgICAgICAgICAgIC8vIGV4Y2VwdGlvbiBwcmV2YWlsIG92ZXIgdGhlIG9yaWdpbmFsIHJldHVybiBvciB0aHJvdy5cbiAgICAgICAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgICAgIC8vIENvbnRpbnVlIHdpdGggdGhlIG91dGVyIHJldHVybiwgbm93IHRoYXQgdGhlIGRlbGVnYXRlXG4gICAgICAgICAgICAgIC8vIGl0ZXJhdG9yIGhhcyBiZWVuIHRlcm1pbmF0ZWQuXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChcbiAgICAgICAgICAgIGRlbGVnYXRlLml0ZXJhdG9yW21ldGhvZF0sXG4gICAgICAgICAgICBkZWxlZ2F0ZS5pdGVyYXRvcixcbiAgICAgICAgICAgIGFyZ1xuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIExpa2UgcmV0dXJuaW5nIGdlbmVyYXRvci50aHJvdyh1bmNhdWdodCksIGJ1dCB3aXRob3V0IHRoZVxuICAgICAgICAgICAgLy8gb3ZlcmhlYWQgb2YgYW4gZXh0cmEgZnVuY3Rpb24gY2FsbC5cbiAgICAgICAgICAgIG1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEZWxlZ2F0ZSBnZW5lcmF0b3IgcmFuIGFuZCBoYW5kbGVkIGl0cyBvd24gZXhjZXB0aW9ucyBzb1xuICAgICAgICAgIC8vIHJlZ2FyZGxlc3Mgb2Ygd2hhdCB0aGUgbWV0aG9kIHdhcywgd2UgY29udGludWUgYXMgaWYgaXQgaXNcbiAgICAgICAgICAvLyBcIm5leHRcIiB3aXRoIGFuIHVuZGVmaW5lZCBhcmcuXG4gICAgICAgICAgbWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuICAgICAgICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgICAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuICAgICAgICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCkge1xuICAgICAgICAgICAgY29udGV4dC5zZW50ID0gYXJnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgY29udGV4dC5zZW50O1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGFyZykpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgICAgbWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICB2YXIgaW5mbyA9IHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dC5kZWxlZ2F0ZSAmJiBtZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaW5mbztcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihhcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZGVmaW5lR2VuZXJhdG9yTWV0aG9kKG1ldGhvZCkge1xuICAgIEdwW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgIH07XG4gIH1cbiAgZGVmaW5lR2VuZXJhdG9yTWV0aG9kKFwibmV4dFwiKTtcbiAgZGVmaW5lR2VuZXJhdG9yTWV0aG9kKFwidGhyb3dcIik7XG4gIGRlZmluZUdlbmVyYXRvck1ldGhvZChcInJldHVyblwiKTtcblxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICBydW50aW1lLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgcnVudGltZS52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgdGhpcy5zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIC8vIFByZS1pbml0aWFsaXplIGF0IGxlYXN0IDIwIHRlbXBvcmFyeSB2YXJpYWJsZXMgdG8gZW5hYmxlIGhpZGRlblxuICAgICAgLy8gY2xhc3Mgb3B0aW1pemF0aW9ucyBmb3Igc2ltcGxlIGdlbmVyYXRvcnMuXG4gICAgICBmb3IgKHZhciB0ZW1wSW5kZXggPSAwLCB0ZW1wTmFtZTtcbiAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgdGVtcE5hbWUgPSBcInRcIiArIHRlbXBJbmRleCkgfHwgdGVtcEluZGV4IDwgMjA7XG4gICAgICAgICAgICsrdGVtcEluZGV4KSB7XG4gICAgICAgIHRoaXNbdGVtcE5hbWVdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuICAgICAgICByZXR1cm4gISFjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG59KShcbiAgLy8gQW1vbmcgdGhlIHZhcmlvdXMgdHJpY2tzIGZvciBvYnRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbFxuICAvLyBvYmplY3QsIHRoaXMgc2VlbXMgdG8gYmUgdGhlIG1vc3QgcmVsaWFibGUgdGVjaG5pcXVlIHRoYXQgZG9lcyBub3RcbiAgLy8gdXNlIGluZGlyZWN0IGV2YWwgKHdoaWNoIHZpb2xhdGVzIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5KS5cbiAgdHlwZW9mIGdsb2JhbCA9PT0gXCJvYmplY3RcIiA/IGdsb2JhbCA6XG4gIHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgPyB3aW5kb3cgOlxuICB0eXBlb2Ygc2VsZiA9PT0gXCJvYmplY3RcIiA/IHNlbGYgOiB0aGlzXG4pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9saWIvYmFiZWwvcG9seWZpbGxcIik7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJiYWJlbC1jb3JlL3BvbHlmaWxsXCIpO1xuIiwiY29uc3QgQ3VydmVzID0gRmFtb3VzUGxhdGZvcm0udHJhbnNpdGlvbnMuQ3VydmVzO1xuY29uc3QgRmFtb3VzID0gRmFtb3VzUGxhdGZvcm0uY29yZS5GYW1vdXM7XG5jb25zdCBUcmFuc2l0aW9uYWJsZSA9IEZhbW91c1BsYXRmb3JtLnRyYW5zaXRpb25zLlRyYW5zaXRpb25hYmxlO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lbGluZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucGF0aFNldCA9IFtdO1xuICAgIHRoaXMudGltZXNjYWxlID0gb3B0aW9ucy50aW1lc2NhbGUgfHwgMTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gbmV3IFRyYW5zaXRpb25hYmxlKDApO1xuICB9XG5cbiAgLypcbiAgICAgICAgcGF0aERhdGEgPSB7XG4gICAgICAgICAgaGFuZGxlciA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXRoIDogW1xuICAgICAgICAgICAgWzAsIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbNTAwMCwgWzEwMCwgMTAwLCAxMDBdXVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAqL1xuXG4gIHJlZ2lzdGVyUGF0aChwYXRoRGF0YSkge1xuICAgIHRoaXMucGF0aFNldC5wdXNoKHBhdGhEYXRhKTtcbiAgfVxuXG4gIHNldCh0aW1lLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICB0aGlzLmluVHJhbnNpdGlvbiA9IHRydWU7XG4gICAgICBGYW1vdXMucmVxdWVzdFVwZGF0ZU9uTmV4dFRpY2sodGhpcyk7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lLnNldCh0aW1lLCB0cmFuc2l0aW9uLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuaW5UcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgICAgIEZhbW91cy5yZXF1ZXN0VXBkYXRlT25OZXh0VGljayh0aGlzKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3VycmVudFRpbWUuc2V0KHRpbWUpO1xuICAgICAgdGhpcy5pblRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICAgIEZhbW91cy5yZXF1ZXN0VXBkYXRlT25OZXh0VGljayh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBvblVwZGF0ZSh0aW1lKSB7XG4gICAgLy9nbyB0aHJvdWdoIHRoZSBwYXRoU2V0LCBhbmQgYmFzaWNhbGx5IGV4ZWN1dGUgdGhlIGZ1bmN0aW9uXG5cbiAgICB0aW1lID0gdGhpcy5jdXJyZW50VGltZS5nZXQoKSAqIHRoaXMudGltZXNjYWxlO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhdGhTZXQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCByZXMgPSBbXTtcbiAgICAgIGxldCBwYXRoRGF0YSA9IHRoaXMucGF0aFNldFtpXTtcblxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwYXRoRGF0YS5wYXRoLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGxldCByZXMgPSBbXTtcbiAgICAgICAgbGV0IGN1cnJTdGVwID0gcGF0aERhdGEucGF0aFtqXTtcbiAgICAgICAgbGV0IG5leHRTdGVwID0gcGF0aERhdGEucGF0aFtqICsgMV07XG5cbiAgICAgICAgLy9jdXJyZW50bHkgbWlkIHBhdGgsIGNhbGN1bGF0ZSBhbmQgYXBwbHkuXG4gICAgICAgIGlmIChuZXh0U3RlcCAmJiBjdXJyU3RlcFswXSA8PSB0aW1lICYmIG5leHRTdGVwWzBdID49IHRpbWUpIHtcbiAgICAgICAgICBsZXQgcGVyY2VudERvbmUgPSAodGltZSAtIGN1cnJTdGVwWzBdKSAvIChuZXh0U3RlcFswXSAtIGN1cnJTdGVwWzBdKTtcbiAgICAgICAgICBsZXQgc3RhdGUgPSBjdXJyU3RlcFsyXSA/IGN1cnJTdGVwWzJdKHBlcmNlbnREb25lKSA6IEN1cnZlcy5saW5lYXIocGVyY2VudERvbmUpO1xuXG4gICAgICAgICAgaWYgKGN1cnJTdGVwWzFdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgY3VyclN0ZXBbMV0ubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgcmVzW2tdID0gY3VyclN0ZXBbMV1ba10gKyAobmV4dFN0ZXBbMV1ba10gLSBjdXJyU3RlcFsxXVtrXSkgKiBzdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzID0gY3VyclN0ZXBbMV0gKyAobmV4dFN0ZXBbMV0gLSBjdXJyU3RlcFsxXSkgKiBzdGF0ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGF0aERhdGEuaGFuZGxlcihyZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy93ZSBhcmUgcGFzc2VkIGxhc3Qgc3RlcCwgc2V0IG9iamVjdCB0byBmaW5hbCBzdGF0ZS5cbiAgICAgICAgaWYgKCFuZXh0U3RlcCAmJiBjdXJyU3RlcFswXSA8IHRpbWUpIHtcbiAgICAgICAgICBwYXRoRGF0YS5oYW5kbGVyKGN1cnJTdGVwWzFdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmluVHJhbnNpdGlvbikge1xuICAgICAgRmFtb3VzLnJlcXVlc3RVcGRhdGVPbk5leHRUaWNrKHRoaXMpO1xuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBCYXNlIGNsYXNzIHdoaWNoIGNvbnRhaW5zIGFsbCBtb2RpZmllcnMgYW5kIGNvbnRhaW5zIG5vIHZpc3VhbCBjb21wb25lbnRzLlxuICovXG5cbmNvbnN0IEFsaWduID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5BbGlnbjtcbmNvbnN0IE1vdW50UG9pbnQgPSBGYW1vdXNQbGF0Zm9ybS5jb21wb25lbnRzLk1vdW50UG9pbnQ7XG5jb25zdCBPcGFjaXR5ID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5PcGFjaXR5O1xuY29uc3QgT3JpZ2luID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5PcmlnaW47XG5jb25zdCBQb3NpdGlvbiA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuUG9zaXRpb247XG5jb25zdCBSb3RhdGlvbiA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuUm90YXRpb247XG5jb25zdCBTY2FsZSA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuU2NhbGU7XG5jb25zdCBTaXplID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5TaXplO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RpZmllciB7XG4gIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xuICB9XG5cbiAgYWRkQ2hpbGQoKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZS5hZGRDaGlsZCgpO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIFNpemUgZW51bXNcbiAgc3RhdGljIGdldCBSRUxBVElWRV9TSVpFKCkge1xuICAgIHJldHVybiBTaXplLlJFTEFUSVZFO1xuICB9XG4gIHN0YXRpYyBnZXQgQUJTT0xVVEVfU0laRSgpIHtcbiAgICByZXR1cm4gU2l6ZS5BQlNPTFVURTtcbiAgfVxuICBzdGF0aWMgZ2V0IFJFTkRFUl9TSVpFKCkge1xuICAgIHJldHVybiBTaXplLlJFTkRFUjtcbiAgfVxuICBzdGF0aWMgZ2V0IERFRkFVTFRfU0laRSgpIHtcbiAgICByZXR1cm4gU2l6ZS5ERUZBVUxUO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIGFsaWduXG4gIHZhbGlkYXRlQWxpZ24oKSB7XG4gICAgaWYgKCF0aGlzLmFsaWduKSB0aGlzLmFsaWduID0gbmV3IEFsaWduKHRoaXMubm9kZSk7XG4gIH1cbiAgaGFsdEFsaWduKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHRoaXMuYWxpZ24uaGFsdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIEFsaWduIGdldHRlcnNcbiAgZ2V0QWxpZ25WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICByZXR1cm4gdGhpcy5hbGlnbi5nZXRWYWx1ZSgpO1xuICB9XG4gIGdldEFsaWduWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICByZXR1cm4gdGhpcy5hbGlnbi5nZXRYKCk7XG4gIH1cblxuICBnZXRBbGlnblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaWduKCk7XG4gICAgcmV0dXJuIHRoaXMuYWxpZ24uZ2V0WSgpO1xuICB9XG4gIGdldEFsaWduWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICByZXR1cm4gdGhpcy5hbGlnbi5nZXRaKCk7XG4gIH1cbiAgLy8gQWxpZ24gc2V0dGVyc1xuICBzZXRBbGlnblZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHRoaXMuYWxpZ24uc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRBbGlnbigpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICB0aGlzLmFsaWduLnNldCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldEFsaWduWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICB0aGlzLmFsaWduLnNldFgoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRBbGlnblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaWduKCk7XG4gICAgdGhpcy5hbGlnbi5zZXRZKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0QWxpZ25aKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHRoaXMuYWxpZ24uc2V0WiguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIG1vdW50IHBvaW50XG4gIHZhbGlkYXRlTW91bnRQb2ludCgpIHtcbiAgICBpZiAoIXRoaXMubW91bnRwb2ludCkgdGhpcy5tb3VudHBvaW50ID0gbmV3IE1vdW50UG9pbnQodGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0TW91bnRQb2ludCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHRoaXMubW91bnRwb2ludC5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gTW91bnRQb2ludCBnZXR0ZXJzXG4gIGdldE1vdW50UG9pbnRWYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHJldHVybiB0aGlzLm1vdW50cG9pbnQuZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRNb3VudFBvaW50WCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHJldHVybiB0aGlzLm1vdW50cG9pbnQuZ2V0WCgpO1xuICB9XG4gIGdldE1vdW50UG9pbnRZKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgcmV0dXJuIHRoaXMubW91bnRwb2ludC5nZXRZKCk7XG4gIH1cbiAgZ2V0TW91bnRQb2ludFooKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1vdW50UG9pbnQoKTtcbiAgICByZXR1cm4gdGhpcy5tb3VudHBvaW50LmdldFooKTtcbiAgfVxuICAvLyBNb3VudFBvaW50IHNldHRlcnNcbiAgc2V0TW91bnRQb2ludFZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgdGhpcy5tb3VudHBvaW50LnNldFZhbHVlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0TW91bnRQb2ludCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHRoaXMubW91bnRwb2ludC5zZXQoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRNb3VudFBvaW50WCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHRoaXMubW91bnRwb2ludC5zZXRYKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0TW91bnRQb2ludFkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1vdW50UG9pbnQoKTtcbiAgICB0aGlzLm1vdW50cG9pbnQuc2V0WSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE1vdW50UG9pbnRaKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgdGhpcy5tb3VudHBvaW50LnNldFooLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciBvcGFjaXR5XG4gIHZhbGlkYXRlT3BhY2l0eSgpIHtcbiAgICBpZiAoIXRoaXMub3BhY2l0eSkgdGhpcy5vcGFjaXR5ID0gbmV3IE9wYWNpdHkodGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0T3BhY2l0eSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3BhY2l0eSgpO1xuICAgIHRoaXMub3BhY2l0eS5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gT3BhY2l0eSBnZXR0ZXJzXG4gIGdldE9wYWNpdHlWYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3BhY2l0eSgpO1xuICAgIHJldHVybiB0aGlzLm9wYWNpdHkuZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRPcGFjaXR5KCkge1xuICAgIHRoaXMudmFsaWRhdGVPcGFjaXR5KCk7XG4gICAgcmV0dXJuIHRoaXMub3BhY2l0eS5nZXQoKTtcbiAgfVxuICAvLyBPcGFjaXR5IHNldHRlcnNcbiAgc2V0T3BhY2l0eVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcGFjaXR5KCk7XG4gICAgdGhpcy5vcGFjaXR5LnNldFZhbHVlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0T3BhY2l0eSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3BhY2l0eSgpO1xuICAgIHRoaXMub3BhY2l0eS5zZXQoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciBvcmlnaW5cbiAgdmFsaWRhdGVPcmlnaW4oKSB7XG4gICAgaWYgKCF0aGlzLm9yaWdpbikgdGhpcy5vcmlnaW4gPSBuZXcgT3JpZ2luKHRoaXMubm9kZSk7XG4gIH1cbiAgaGFsdE9yaWdpbigpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgdGhpcy5vcmlnaW4uaGFsdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIE9yaWdpbiBnZXR0ZXJzXG4gIGdldE9yaWdpblZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRPcmlnaW5YKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uZ2V0WCgpO1xuICB9XG4gIGdldE9yaWdpblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5nZXRZKCk7XG4gIH1cbiAgZ2V0T3JpZ2luWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLmdldFooKTtcbiAgfVxuICAvLyBPcmlnaW4gc2V0dGVyc1xuICBzZXRPcmlnaW5WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgdGhpcy5vcmlnaW4uc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRPcmlnaW4oKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHRoaXMub3JpZ2luLnNldCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE9yaWdpblgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHRoaXMub3JpZ2luLnNldFgoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRPcmlnaW5ZKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICB0aGlzLm9yaWdpbi5zZXRZKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0T3JpZ2luWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgdGhpcy5vcmlnaW4uc2V0WiguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIHBvc2l0aW9uXG4gIHZhbGlkYXRlUG9zaXRpb24oKSB7XG4gICAgaWYgKCF0aGlzLnBvc2l0aW9uKSB0aGlzLnBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKHRoaXMubm9kZSk7XG4gIH1cbiAgaGFsdFBvc2l0aW9uKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHRoaXMucG9zaXRpb24uaGFsdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIFBvc2l0aW9uIGdldHRlcnNcbiAgZ2V0UG9zaXRpb25WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5nZXRWYWx1ZSgpO1xuICB9XG4gIGdldFBvc2l0aW9uWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5nZXRYKCk7XG4gIH1cbiAgZ2V0UG9zaXRpb25ZKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmdldFkoKTtcbiAgfVxuICBnZXRQb3NpdGlvblooKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24uZ2V0WigpO1xuICB9XG4gIC8vIFBvc2l0aW9uIHNldHRlcnNcbiAgc2V0UG9zaXRpb25WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICB0aGlzLnBvc2l0aW9uLnNldFZhbHVlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0UG9zaXRpb24oKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRQb3NpdGlvblgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgdGhpcy5wb3NpdGlvbi5zZXRYKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0UG9zaXRpb25ZKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHRoaXMucG9zaXRpb24uc2V0WSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFBvc2l0aW9uWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICB0aGlzLnBvc2l0aW9uLnNldFooLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciByb3RhdGlvblxuICB2YWxpZGF0ZVJvdGF0aW9uKCkge1xuICAgIGlmICghdGhpcy5yb3RhdGlvbikgdGhpcy5yb3RhdGlvbiA9IG5ldyBSb3RhdGlvbih0aGlzLm5vZGUpO1xuICB9XG4gIGhhbHRSb3RhdGlvbigpIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICB0aGlzLnJvdGF0aW9uLmhhbHQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvLyBSb3RhdGlvbiBnZXR0ZXJzXG4gIGdldFJvdGF0aW9uVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMucm90YXRpb24uZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRSb3RhdGlvblgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMucm90YXRpb24uZ2V0WCgpO1xuICB9XG4gIGdldFJvdGF0aW9uWSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5yb3RhdGlvbi5nZXRZKCk7XG4gIH1cbiAgZ2V0Um90YXRpb25aKCkge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHJldHVybiB0aGlzLnJvdGF0aW9uLmdldFooKTtcbiAgfVxuICAvLyBSb3RhdGlvbiBzZXR0ZXJzXG4gIHNldFJvdGF0aW9uVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgdGhpcy5yb3RhdGlvbi5zZXRWYWx1ZSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFJvdGF0aW9uKCkge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHRoaXMucm90YXRpb24uc2V0KC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0Um90YXRpb25YKCkge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHRoaXMucm90YXRpb24uc2V0WCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFJvdGF0aW9uWSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICB0aGlzLnJvdGF0aW9uLnNldFkoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRSb3RhdGlvblooKSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgdGhpcy5yb3RhdGlvbi5zZXRaKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gaGVscGVycyBmb3Igc2NhbGVcbiAgdmFsaWRhdGVTY2FsZSgpIHtcbiAgICBpZiAoIXRoaXMuc2NhbGUpIHRoaXMuc2NhbGUgPSBuZXcgU2NhbGUodGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0U2NhbGUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgdGhpcy5zY2FsZS5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gU2NhbGUgZ2V0dGVyc1xuICBnZXRTY2FsZVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHJldHVybiB0aGlzLnNjYWxlLmdldFZhbHVlKCk7XG4gIH1cbiAgZ2V0U2NhbGVYKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHJldHVybiB0aGlzLnNjYWxlLmdldFgoKTtcbiAgfVxuICBnZXRTY2FsZVkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGUuZ2V0WSgpO1xuICB9XG4gIGdldFNjYWxlWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2NhbGUoKTtcbiAgICByZXR1cm4gdGhpcy5zY2FsZS5nZXRaKCk7XG4gIH1cbiAgLy8gU2NhbGUgc2V0dGVyc1xuICBzZXRTY2FsZVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHRoaXMuc2NhbGUuc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRTY2FsZSgpIHtcbiAgICAgIGlmKHdpbmRvdy5taWtldGVzdCkgZGVidWdnZXI7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgdGhpcy5zY2FsZS5zZXQoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRTY2FsZVgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgdGhpcy5zY2FsZS5zZXRYKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0U2NhbGVZKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHRoaXMuc2NhbGUuc2V0WSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFNjYWxlWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2NhbGUoKTtcbiAgICB0aGlzLnNjYWxlLnNldFooLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciBzaXplXG4gIHZhbGlkYXRlU2l6ZSgpIHtcbiAgICBpZiAoIXRoaXMuc2l6ZSkgdGhpcy5zaXplID0gbmV3IFNpemUodGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0U2l6ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2l6ZSgpO1xuICAgIHRoaXMuc2l6ZS5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gU2l6ZSBnZXR0ZXJzXG4gIGdldFNpemVWYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2l6ZSgpO1xuICAgIHJldHVybiB0aGlzLnNpemUuZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRTaXplKCkge1xuICAgIHRoaXMudmFsaWRhdGVTaXplKCk7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZS5nZXQoKTtcbiAgfVxuICAvLyBTaXplIHNldHRlcnNcbiAgc2V0U2l6ZVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVTaXplKCk7XG4gICAgdGhpcy5zaXplLnNldFZhbHVlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0RGlmZmVyZW50aWFsU2l6ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2l6ZSgpO1xuICAgIHRoaXMuc2l6ZS5zZXREaWZmZXJlbnRpYWwoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRQcm9wb3J0aW9uYWxTaXplKCkge1xuICAgIHRoaXMudmFsaWRhdGVTaXplKCk7XG4gICAgdGhpcy5zaXplLnNldFByb3BvcnRpb25hbCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldEFic29sdXRlU2l6ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2l6ZSgpO1xuICAgIHRoaXMuc2l6ZS5zZXRBYnNvbHV0ZSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFNpemVNb2RlKHgsIHksIHopIHtcbiAgICB0aGlzLm5vZGUuc2V0U2l6ZU1vZGUoeCwgeSwgeik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0U2l6ZU1vZGVBYnNvbHV0ZSgpIHtcbiAgICB0aGlzLm5vZGUuc2V0U2l6ZU1vZGUoU2l6ZS5BQlNPTFVURSwgU2l6ZS5BQlNPTFVURSwgU2l6ZS5BQlNPTFVURSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0U2l6ZU1vZGVSZWxhdGl2ZSgpIHtcbiAgICB0aGlzLm5vZGUuc2V0U2l6ZU1vZGUoU2l6ZS5SRUxBVElWRSwgU2l6ZS5SRUxBVElWRSwgU2l6ZS5SRUxBVElWRSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0U2l6ZU1vZGVSZW5kZXIoKSB7XG4gICAgdGhpcy5ub2RlLnNldFNpemVNb2RlKFNpemUuUkVOREVSLCBTaXplLlJFTkRFUiwgU2l6ZS5SRU5ERVIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iLCIvKipcbiAqIFZpZXcgY2xhc3MgdGhhdCBleHRlbmRzIE1vZGlmaWVyIGFuZCBzaG91bGQgYmUgdXNlZCBmb3IgdmlzdWFsIGVsZW1lbnRzLlxuICovXG5cbmltcG9ydCBNb2RpZmllciBmcm9tICcuL01vZGlmaWVyJztcblxuY29uc3QgRE9NRWxlbWVudCA9IEZhbW91c1BsYXRmb3JtLmRvbVJlbmRlcmFibGVzLkRPTUVsZW1lbnQ7XG5jb25zdCBFdmVudEVtaXR0ZXIgPSBGYW1vdXNQbGF0Zm9ybS5jb21wb25lbnRzLkV2ZW50RW1pdHRlcjtcbmNvbnN0IEV2ZW50SGFuZGxlciA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuRXZlbnRIYW5kbGVyO1xuY29uc3QgTWVzaCA9IEZhbW91c1BsYXRmb3JtLndlYmdsUmVuZGVyYWJsZXMuTWVzaDtcbmNvbnN0IE5vZGUgPSBGYW1vdXNQbGF0Zm9ybS5jb3JlLk5vZGU7XG5jb25zdCBQb2ludExpZ2h0ID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xSZW5kZXJhYmxlcy5Qb2ludExpZ2h0O1xuXG5jb25zdCBFdmVudE1hcCA9IFtcbiAgLy8gVUkgRXZlbnRzIChodHRwOi8vd3d3LnczLm9yZy9UUi91aWV2ZW50cy8pXG4gICdhYm9ydCcsXG4gICdiZWZvcmVpbnB1dCcsXG4gICdibHVyJyxcbiAgJ2NsaWNrJyxcbiAgJ2NvbXBvc2l0aW9uZW5kJyxcbiAgJ2NvbXBvc2l0aW9uc3RhcnQnLFxuICAnY29tcG9zaXRpb251cGRhdGUnLFxuICAnZGJsY2xpY2snLFxuICAnZm9jdXMnLFxuICAnZm9jdXNpbicsXG4gICdmb2N1c291dCcsXG4gICdpbnB1dCcsXG4gICdrZXlkb3duJyxcbiAgJ2tleXVwJyxcbiAgJ2xvYWQnLFxuICAnbW91c2Vkb3duJyxcbiAgJ21vdXNlZW50ZXInLFxuICAnbW91c2VsZWF2ZScsXG4gICdtb3VzZW1vdmUnLFxuICAnbW91c2VvdXQnLFxuICAnbW91c2VvdmVyJyxcbiAgJ21vdXNldXAnLFxuICAncmVzaXplJyxcbiAgJ3Njcm9sbCcsXG4gICdzZWxlY3QnLFxuICAndG91Y2hjYW5jZWwnLFxuICAndG91Y2hlbmQnLFxuICAndG91Y2htb3ZlJyxcbiAgJ3RvdWNoc3RhcnQnLFxuICAndW5sb2FkJyxcbiAgJ3doZWVsJ1xuXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlldyBleHRlbmRzIE1vZGlmaWVye1xuICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgc3VwZXIobm9kZSk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIC8vSFRNTCBTVFVGRlxuICB2YWxpZGF0ZURPTShvcHRpb25zKSB7XG4gICAgaWYgKCF0aGlzLmVsKSB7XG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICAgIHRoaXMuZWwgPSBuZXcgRE9NRWxlbWVudCh0aGlzLm5vZGUsIG9wdGlvbnMpO1xuICAgICAgdGhpcy5lbC5vblJlY2VpdmUgPSAoZXZlbnQsIHBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50c1tldmVudF0pIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHNbZXZlbnRdKHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZURPTUVsZW1lbnQob3B0aW9ucykge1xuICAgIHRoaXMudmFsaWRhdGVET00ob3B0aW9ucyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRET01Db250ZW50KGNvbnRlbnQpIHtcbiAgICB0aGlzLnZhbGlkYXRlRE9NKCk7XG4gICAgdGhpcy5lbC5zZXRDb250ZW50KGNvbnRlbnQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0RE9NQ2xhc3NlcyhjbGFzc2VzKSB7XG4gICAgdGhpcy52YWxpZGF0ZURPTSgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5lbC5hZGRDbGFzcyhjbGFzc2VzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0RE9NQXR0cmlidXRlcyhhdHRyaWJ1dGVzKSB7XG4gICAgdGhpcy52YWxpZGF0ZURPTSgpO1xuICAgIGZvciAobGV0IGF0dHJOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyaWJ1dGVzW2F0dHJOYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldERPTVByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIHRoaXMudmFsaWRhdGVET00oKTtcbiAgICBmb3IgKGxldCBwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgdGhpcy5lbC5zZXRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUsIHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy9kb20gZXZlbnRzXG4gIG9uKGV2TmFtZSwgZm4pIHtcbiAgICBpZiAoRXZlbnRNYXAuaW5kZXhPZihldk5hbWUpID4gLTEpIHtcbiAgICAgIC8vZG9tIEV2ZW50XG4gICAgICB0aGlzLnZhbGlkYXRlRE9NKCk7XG4gICAgICB0aGlzLm5vZGUuYWRkVUlFdmVudChldk5hbWUpO1xuICAgICAgdGhpcy5fZXZlbnRzW2V2TmFtZV0gPSBmbjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLmV2ZW50SGFuZGxlcikgdGhpcy5ldmVudEhhbmRsZXIgPSBuZXcgRXZlbnRIYW5kbGVyKHRoaXMubm9kZSk7XG4gICAgICB0aGlzLmV2ZW50SGFuZGxlci5vbihldk5hbWUsIGZuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvL2V2ZW50cyBiZXR3ZWVuIHZpZXdzIVxuICBlbWl0KGV2LCBwYXlsb2FkKSB7XG4gICAgaWYgKCF0aGlzLmV2ZW50RW1pdHRlcikgdGhpcy5ldmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKHRoaXMubm9kZSk7XG4gICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChldiwgcGF5bG9hZCk7XG4gIH1cblxuICAvL2dsIHN0dWZmXG4gIHZhbGlkYXRlTWVzaCgpIHtcbiAgICBpZiAoIXRoaXMubWVzaCkgdGhpcy5tZXNoID0gbmV3IE1lc2godGhpcy5ub2RlKTtcbiAgfVxuXG4gIHNldEdlb21ldHJ5KGdlb21ldHJ5LCBvcHRpb25zKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICB0aGlzLmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG4gICAgdGhpcy5tZXNoLnNldEdlb21ldHJ5KGdlb21ldHJ5LCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEJhc2VDb2xvcihjb2xvcikge1xuICAgIHRoaXMudmFsaWRhdGVNZXNoKCk7XG4gICAgdGhpcy5tZXNoLnNldEJhc2VDb2xvcihjb2xvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuXG4iLCJjb25zdCBDb21wb3NpdG9yID0gRmFtb3VzUGxhdGZvcm0ucmVuZGVyZXJzLkNvbXBvc2l0b3I7XG5jb25zdCBUaHJlYWRNYW5hZ2VyID0gRmFtb3VzUGxhdGZvcm0ucmVuZGVyZXJzLlRocmVhZE1hbmFnZXI7XG5jb25zdCBFbmdpbmUgPSBGYW1vdXNQbGF0Zm9ybS5lbmdpbmUuRW5naW5lO1xuY29uc3QgRmFtb3VzID0gRmFtb3VzUGxhdGZvcm0uY29yZS5GYW1vdXM7XG5cbmNsYXNzIEZhbW91c0VuZ2luZUluaXQge1xuICAvKipcbiAgICogQm9pbGVycGxhdGUgY29kZSB0byBzZXR1cCB0aGUgRmFtb3VzIEVuZ2luZS5cbiAgICogQG1ldGhvZCAgY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG4gIH1cblxuICBpbml0KCkge1xuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgcmV0dXJuO1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAvLyBUT0RPOiB0ZW1wb3JhcnkgZXNsaW50IGZpeCB1bnRpbCBpdCBnZXRzIHJvbGxlZCBpbnRvIHBsYXRmb3JtIGFzIGEgZGVmYXVsdFxuICAgIC8qZXNsaW50LWRpc2FibGUgKi9cbiAgICBGYW1vdXNQbGF0Zm9ybS5zdHlsZXNoZWV0cztcbiAgICAvKmVzbGludC1lbmFibGUgKi9cblxuICAgIC8vIEJvaWxlcnBsYXRlXG4gICAgLyplc2xpbnQtZGlzYWJsZSAqL1xuICAgIC8vIGxldCBjb21wb3NpdG9yID0gbmV3IENvbXBvc2l0b3IoKTtcbiAgICAvLyBsZXQgZW5naW5lID0gbmV3IEVuZ2luZSgpO1xuICAgIC8vIGxldCB0aHJlYWRtYW5nZXIgPSBuZXcgVGhyZWFkTWFuYWdlcihGYW1vdXMuZ2V0Q2hhbm5lbCgpLCBjb21wb3NpdG9yLCBlbmdpbmUpO1xuICAgIC8qZXNsaW50LWVuYWJsZSAqL1xuXG4gICAgLy8gVE9ETzogdGVtcG9yYXJ5IGZpeCB1bnRpbCB3ZSBnZXQgYW4gdXBkYXRlIG9mIGZhbW91cyA+IDIwMTUwNTA0IHRoYXQgd29ya3NcbiAgICAvKmVzbGludC1kaXNhYmxlICovXG4gICAgbGV0IGNvbXBvc2l0b3IgPSBuZXcgQ29tcG9zaXRvcigpO1xuICAgIGxldCB0aHJlYWRtYW5nZXIgPSBuZXcgVGhyZWFkTWFuYWdlcihGYW1vdXMsIGNvbXBvc2l0b3IpO1xuICAgIGxldCBlbmdpbmUgPSBuZXcgRmFtb3VzUGxhdGZvcm0uZW5naW5lKCk7XG4gICAgZW5naW5lLnVwZGF0ZSh0aHJlYWRtYW5nZXIpO1xuICAgIC8qZXNsaW50LWVuYWJsZSAqL1xuICAgIC8vIEVORDogdGVtcG9yYXJ5IGZpeFxuICB9XG59XG5cbmxldCBGYW1vdXNFbmdpbmUgPSBuZXcgRmFtb3VzRW5naW5lSW5pdCgpO1xuXG5leHBvcnQgZGVmYXVsdCBGYW1vdXNFbmdpbmU7XG4iLCJpbXBvcnQgVmlldyAgICAgICAgICAgICBmcm9tICdmYW1vdXMtY3JlYXRpdmUvZGlzcGxheS9WaWV3JztcblxuY29uc3QgQ3VydmVzID0gRmFtb3VzUGxhdGZvcm0udHJhbnNpdGlvbnMuQ3VydmVzO1xuXG5leHBvcnQgY2xhc3MgQ2FyZCBleHRlbmRzIFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKG5vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIobm9kZSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMubW9kZWwgPSBvcHRpb25zLm1vZGVsO1xuXG4gICAgICAgIGxldCBwZXJzcGVjdGl2ZSA9IDYwMDtcbiAgICAgICAgbGV0IHpUcmFuc2Zvcm0gPSB0aGlzLm1vZGVsLmkgKiAzNTA7XG5cbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZSgxLCAxKTtcbiAgICAgICAgdGhpcy5zZXRBYnNvbHV0ZVNpemUoMzUwLCAyMjApO1xuICAgICAgICB0aGlzLnNldE1vdW50UG9pbnQoLjUsIDApO1xuICAgICAgICB0aGlzLnNldEFsaWduKC41LCAwKTtcbiAgICAgICAgdGhpcy5zZXRPcmlnaW4oLjUsIC41LCAuNSk7XG4gICAgICAgIHRoaXMuc2V0U2NhbGUoLjUsIC41LCAuNSk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24oLXdpbmRvdy5pbm5lcldpZHRoLCAzMDAsIHpUcmFuc2Zvcm0pO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ3pJbmRleCc6IHpUcmFuc2Zvcm0sXG4gICAgICAgICAgICAgICAgJy13ZWJraXQtcGVyc3BlY3RpdmUnOiBwZXJzcGVjdGl2ZSxcbiAgICAgICAgICAgICAgICAnLW1vei1wZXJzcGVjdGl2ZSc6IHBlcnNwZWN0aXZlLFxuICAgICAgICAgICAgICAgICdwZXJzcGVjdGl2ZSc6IHBlcnNwZWN0aXZlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHRoaXMuYWRkQ2FyZEJhY2soKTsgUHVsbGVkIHBlciBTYW5kZXJcbiAgICAgICAgdGhpcy5hZGRDYXJkRnJvbnQoKTtcbiAgICAgICAgdGhpcy5sb2FkQ2FyZCgpO1xuICAgIH1cblxuICAgIGFkZENhcmRCYWNrKCkge1xuICAgICAgICBsZXQgY2FyZEJhY2sgPSBuZXcgVmlldyh0aGlzLm5vZGUuYWRkQ2hpbGQoKSk7XG4gICAgICAgIGNhcmRCYWNrLnNldFNpemVNb2RlKDAsIDApO1xuICAgICAgICBjYXJkQmFjay5zZXRQcm9wb3J0aW9uYWxTaXplKDEsIDEpO1xuICAgICAgICBjYXJkQmFjay5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHRhZ05hbWU6ICdpbWcnLFxuICAgICAgICAgICAgY2xhc3NlczogW1snY2FyZC1pbWctYmFjayddXSxcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAnYmFja2ZhY2UtdmlzaWJpbGl0eSc6ICd2aXNpYmxlJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY2FyZEJhY2suc2V0RE9NQXR0cmlidXRlcyh7XG4gICAgICAgICAgICAnc3JjJzogdGhpcy5tb2RlbC5iYWNrXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZENhcmRGcm9udCgpIHtcbiAgICAgICAgbGV0IGNhcmRGcm9udCA9IG5ldyBWaWV3KHRoaXMubm9kZS5hZGRDaGlsZCgpKTtcbiAgICAgICAgY2FyZEZyb250LnNldFNpemVNb2RlKDAsIDApO1xuICAgICAgICBjYXJkRnJvbnQuc2V0UHJvcG9ydGlvbmFsU2l6ZSgxLCAxKTtcbiAgICAgICAgY2FyZEZyb250LmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgdGFnTmFtZTogJ2ltZycsXG4gICAgICAgICAgICBjbGFzc2VzOiBbJ2NhcmQtaW1nLWZyb250J10sXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgLy8gJ2JhY2tmYWNlLXZpc2liaWxpdHknOiAnaGlkZGVuJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY2FyZEZyb250LnNldERPTUF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgJ3NyYyc6IHRoaXMubW9kZWwuZnJvbnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbG9hZENhcmQoKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLm1vZGVsLnJvdGF0aW9uID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB6OiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5tb2RlbC5wb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAzMDAsXG4gICAgICAgICAgICB6OiB0aGlzLmdldFBvc2l0aW9uWigpXG4gICAgICAgIH07XG5cbiAgICAgICAgc3dpdGNoKHRoaXMubW9kZWwuaSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwucm90YXRpb24ueiA9ICgtOSAqIE1hdGguUEkpIC8gMTgwO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwucG9zaXRpb24ueCA9IDMwO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwucG9zaXRpb24ueSA9IDI1MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnJvdGF0aW9uLnogPSAoLjUgKiBNYXRoLlBJKSAvIDE4MDtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnBvc2l0aW9uLnggPSAyMDtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnBvc2l0aW9uLnkgPSAzMTI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5yb3RhdGlvbi56ID0gKDMwICogTWF0aC5QSSkgLyAxODA7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5wb3NpdGlvbi54ID0gLTIwO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuIHBvc2l0aW9uLnkgPSAzNTU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5yb3RhdGlvbi56ID0gKC0yMyAqIE1hdGguUEkpIC8gMTgwO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwucG9zaXRpb24ueCA9IC0zMDtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnBvc2l0aW9uLnkgPSAyNDU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSSB3YW50IGEgc2xpZ2h0IGRlbGF5IGFmdGVyIHRoZSBhcHAgbG9hZHNcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLnNldFBvc2l0aW9uWCgwLCB7XG4gICAgICAgICAgICAgICAgY3VydmU6IEN1cnZlcy5lYXNlSW5PdXQsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDY1MFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy8gSSB3YW50IGEgc2xpZ2h0IGRlbGF5IGFmdGVyIHRoZSBhbmltYXRpb24gaXMgZG9uZVxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IGN1cnZlOiAnb3V0QmFjaycsIGR1cmF0aW9uOiA1MDAgfTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0Um90YXRpb25aKF90aGlzLm1vZGVsLnJvdGF0aW9uLnosIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRQb3NpdGlvblgoX3RoaXMubW9kZWwucG9zaXRpb24ueCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFBvc2l0aW9uWShfdGhpcy5tb2RlbC5wb3NpdGlvbi55LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LCA3NSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgMjUwKTtcbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gICAgQ09JTl9QT1M6IHdpbmRvdy5pbm5lckhlaWdodCAtIDI2NSxcbiAgICBDT0lOX0NFTlRFUjogd2luZG93LmlubmVySGVpZ2h0IC0gMjE1XG59O1xuIiwiaW1wb3J0IFZpZXcgICAgICAgICAgICAgZnJvbSAnZmFtb3VzLWNyZWF0aXZlL2Rpc3BsYXkvVmlldyc7XG5cbmNvbnN0IEN1cnZlcyAgICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0udHJhbnNpdGlvbnMuQ3VydmVzO1xuXG5leHBvcnQgY2xhc3MgSGFuZCBleHRlbmRzIFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKG5vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIobm9kZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZSgxLCAxKTtcbiAgICAgICAgdGhpcy5zZXRBYnNvbHV0ZVNpemUoNzAsIDc1KTtcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvblkoMjk2KTtcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvblooMzAwMCk7XG4gICAgICAgIHRoaXMuc2V0TW91bnRQb2ludCguNSwgMCk7XG4gICAgICAgIHRoaXMuc2V0QWxpZ24oLjUsIDApO1xuXG4gICAgICAgIHRoaXMubW9kZWwgPSBvcHRpb25zLm1vZGVsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICB0YWdOYW1lOiAnaW1nJyxcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAnekluZGV4JzogMzAwMFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldERPTUF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgJ3NyYyc6IHRoaXMubW9kZWwuaW1nUGF0aFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldEV2ZW50cygpO1xuICAgICAgICB0aGlzLnN0YXJ0QW5pbWF0aW9uKCk7XG4gICAgfVxuXG5cbiAgICBzZXRFdmVudHMoKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLm9uKCdkcmFnZ2luZycsIGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGlmKG1lc3NhZ2UgPT09ICdzdGFydCcpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zdG9wQW5pbWF0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMub24oJ3Jlc2V0QXBwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfdGhpcy5yZXN0YXJ0QW5pbWF0aW9uKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXJ0QW5pbWF0aW9uKCkge1xuICAgICAgICB0aGlzLmlzSGFsdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYW5pbWF0ZUhhbmQoKTtcbiAgICB9XG5cbiAgICBzdG9wQW5pbWF0aW9uKCkge1xuICAgICAgICB0aGlzLmlzSGFsdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5oYWx0T3BhY2l0eSgpO1xuICAgICAgICB0aGlzLmhhbHRQb3NpdGlvbigpO1xuICAgIH1cblxuICAgIHJlc3RhcnRBbmltYXRpb24oKSB7XG4gICAgICAgIHRoaXMuaXNIYWx0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZXNldEhhbmQoKTtcbiAgICB9XG5cbiAgICBhbmltYXRlSGFuZCgpIHtcbiAgICAgICAgaWYodGhpcy5pc0hhbHRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICBsZXQgZHVyYXRpb24gPSAxMjAwO1xuXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25ZKDE5Niwge1xuICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICBjdXJ2ZTogQ3VydmVzLmxpbmVhclxuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLnJlc2V0SGFuZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTdGFydCB0aGUgb3BhY2l0eSBoYWxmIHdheSB0aHJvdWdoIHRoZSBhbmltYXRpb25cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLnNldE9wYWNpdHkoMCwge1xuICAgICAgICAgICAgICAgIGN1cnZlOiBDdXJ2ZXMubGluZWFyLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiAvIDJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBkdXJhdGlvbiAvIDIpO1xuICAgIH1cblxuICAgIHJlc2V0SGFuZCgpIHtcbiAgICAgICAgaWYodGhpcy5pc0hhbHRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWSgyOTYsIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiAwXG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9UT0RPIEJVRzogIENhbGxiYWNrcyBhcmUgbm90IHdvcmtpbmcgY29ycmVjdGx5XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldE9wYWNpdHkoMSwgeyBkdXJhdGlvbjogMTAwfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vVE9ETyBCVUc6ICBDYWxsYmFja3MgYXJlIG5vdCB3b3JraW5nIGNvcnJlY3RseVxuICAgICAgICAgICAgICAgICAgICAvLyBBIHF1aWNrIHBhdXNlIGFmdGVyIHRoZSBhbmltYXRpb24gY29tcGxldGVzXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5hbmltYXRlSGFuZCgpO1xuICAgICAgICAgICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgOTAwKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiY29uc3QgUGh5c2ljc0VuZ2luZSAgICA9IEZhbW91c1BsYXRmb3JtLnBoeXNpY3MuUGh5c2ljc0VuZ2luZTtcblxubGV0IFBoeXNpY3MgPSB7XG4gICAgX3NpbXVsYXRpb246IG5ldyBQaHlzaWNzRW5naW5lKClcbn07XG5cblBoeXNpY3MuZ2V0U2ltdWxhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9zaW11bGF0aW9uO1xufTtcblxuUGh5c2ljcy5tYWduaWZ5Rm9yY2UgPSBmdW5jdGlvbih2KSB7XG4gICAgbGV0IHdpZHRoID0gIHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIGxldCByYXRpbyA9IDE7XG5cbiAgICBpZih3aWR0aCA8IDMyMCkge1xuICAgICAgICByYXRpbyA9IDEuNjtcbiAgICB9IGVsc2UgaWYod2lkdGggPCA0MjgpIHtcbiAgICAgICAgcmF0aW8gPSAxLjU7XG4gICAgfSBlbHNlIGlmKHdpZHRoIDwgNzY4KSB7XG4gICAgICAgIHJhdGlvID0gMS4xNTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmF0aW8gKiB2O1xufTtcblxuUGh5c2ljcy5kYW1wZW5Gb3JjZSA9IGZ1bmN0aW9uKHYpIHtcbiAgICBsZXQgd2lkdGggPSAgd2luZG93LmlubmVyV2lkdGg7XG4gICAgbGV0IHJhdGlvID0gMTtcblxuICAgIGlmKHdpZHRoIDwgMzIwKSB7XG4gICAgICAgIHJhdGlvID0gLjU1O1xuICAgIH0gZWxzZSBpZih3aWR0aCA8IDQyOCkge1xuICAgICAgICByYXRpbyA9IC42O1xuICAgIH0gZWxzZSBpZih3aWR0aCA8IDc2OCkge1xuICAgICAgICByYXRpbyA9IC44NTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmF0aW8gKiB2O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGh5c2ljcztcbiIsImltcG9ydCBFTlVNUyAgICAgICAgICAgZnJvbSAnLi9FbnVtcyc7XG5pbXBvcnQgUGh5c2ljcyAgICAgICAgIGZyb20gJy4vUGh5c2ljc1NlcnZpY2UnO1xuaW1wb3J0IFZpZXcgICAgICAgICAgICBmcm9tICdmYW1vdXMtY3JlYXRpdmUvZGlzcGxheS9WaWV3JztcblxuLy9GYW1vdXMgQ29tcG9uZW50c1xuY29uc3QgRmFtb3VzICAgICAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS5jb3JlLkZhbW91cztcbmNvbnN0IEdlc3R1cmVIYW5kbGVyICAgID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5HZXN0dXJlSGFuZGxlcjtcbmNvbnN0IEN1cnZlcyAgICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0udHJhbnNpdGlvbnMuQ3VydmVzO1xuXG4vL1BoeXNpY3MgQ29tcG9uZW50c1xuY29uc3QgU3BoZXJlICAgICAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS5waHlzaWNzLlNwaGVyZTtcbmNvbnN0IFZlYzMgICAgICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0ubWF0aC5WZWMzO1xuXG5leHBvcnQgY2xhc3MgUmluZyBleHRlbmRzIFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKG5vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIobm9kZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5tb2RlbCAgICAgICAgICAgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB0aGlzLm1vZGVsLnJpbmdTaXplICA9IHRoaXMuX2dldFJpbmdTaXplKCk7XG4gICAgICAgIHRoaXMubW9kZWwucmluZ0NvbG9yID0gdGhpcy5fZ2V0UmluZ0NvbG9yKCk7XG4gICAgICAgIHRoaXMubW9kZWwuc2l6ZSAgICAgID0gdGhpcy5tb2RlbC5yaW5nU2l6ZSAqIDM1O1xuXG4gICAgICAgIC8vUG9zaXRpb25cbiAgICAgICAgdGhpcy5zZXRBbGlnbiguNSwgMCk7XG4gICAgICAgIHRoaXMuc2V0TW91bnRQb2ludCguNSwgLjUsIC41KTtcbiAgICAgICAgdGhpcy5zZXRPcmlnaW4oLjUsIC41LCAuNSk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25ZKDIwMCk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25aKC01MDApO1xuXG4gICAgICAgIC8vIFNpemluZ1xuICAgICAgICB0aGlzLnNldFNpemVNb2RlQWJzb2x1dGUoKTtcbiAgICAgICAgdGhpcy5zZXRBYnNvbHV0ZVNpemUodGhpcy5tb2RlbC5zaXplLCB0aGlzLm1vZGVsLnNpemUpO1xuXG4gICAgICAgIC8vRGlzcGxheVxuICAgICAgICB0aGlzLnNldE9wYWNpdHkoMCk7XG4gICAgICAgIHRoaXMuc2V0U2NhbGUoLjI1LCAuMjUpO1xuICAgICAgICB0aGlzLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICAgICAgYm9yZGVyOiB0aGlzLm1vZGVsLnJpbmdTaXplICsgJ3B4IHNvbGlkICcgKyB0aGlzLm1vZGVsLnJpbmdDb2xvcixcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxuICAgICAgICAgICAgICAgICd6LWluZGV4JzogLTUwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsYXNzZXM6IFsncmluZyddXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vRXZlbnRpbmdcbiAgICAgICAgdGhpcy5zZXRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5faW5pdFBoeXNpY3MoKTtcbiAgICB9XG5cbiAgICBfZ2V0UmluZ0NvbG9yKCkge1xuICAgICAgICBjb25zdCBjb2xvcnMgPSBbJyMzMjk5NzgnLCAnIzAwODllMCcsICcjMzk4MGE4JywgJyNkYTY5NWInXTtcbiAgICAgICAgcmV0dXJuIGNvbG9yc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjb2xvcnMubGVuZ3RoKV07XG4gICAgfVxuXG4gICAgX2dldFJpbmdTaXplKCkge1xuICAgICAgICBjb25zdCByaW5nU2l6ZXMgPSBbMSwgMiwgM107XG4gICAgICAgIHJldHVybiByaW5nU2l6ZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcmluZ1NpemVzLmxlbmd0aCldO1xuICAgIH1cblxuICAgIHNldEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy5vbigncmlzaW5nVGlkZScsIGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmhhc093blByb3BlcnR5KCdoYXNDaGFuZ2VkJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5oYXNDaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgeVBvcyA9IHRoaXMuZ2V0UG9zaXRpb25ZKCk7XG4gICAgICAgICAgICBsZXQgc2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpO1xuXG4gICAgICAgICAgICBsZXQgYm90dG9tRWRnZSA9IHlQb3MgKyBzaXplWzFdO1xuXG4gICAgICAgICAgICBpZihib3R0b21FZGdlID4gbWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFzQ2hhbmdlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldERPTVByb3BlcnRpZXMoe1xuICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJ2JsYWNrJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTY2FsZSgxLjA1LCAxLjA1LCAxLjA1LCB7XG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDBcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTY2FsZSguOTUsIC45NSwgLjk1LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5vbignbW91c2Vkb3duJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wb3AoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5nZXN0dXJlcyA9IG5ldyBHZXN0dXJlSGFuZGxlcih0aGlzLm5vZGUsIFt7XG4gICAgICAgICAgICBldmVudDogJ3RhcCcsXG4gICAgICAgICAgICBjYWxsYmFjazogKGUpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XSk7XG4gICAgfVxuXG4gICAgYWN0aXZhdGVCbGFja2hvbGUoKSB7XG4gICAgICAgIHRoaXMuaXNCbGFja2hvbGVBY3RpdmUgPSB0cnVlO1xuICAgIH1cblxuICAgIGFjdGl2YXRlUGh5c2ljcygpIHtcbiAgICAgICAgdGhpcy5pc1BoeXNpY3NBY3RpdmUgPSB0cnVlO1xuICAgIH1cblxuICAgIHBvcCgpIHtcbiAgICAgICAgbGV0IGR1cmF0aW9uID0gNzU7XG4gICAgICAgIHRoaXMuaXNCcmVhdGhpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5oYWx0T3BhY2l0eSgpO1xuICAgICAgICB0aGlzLmhhbHRTY2FsZSgpO1xuXG4gICAgICAgIHRoaXMuc2V0T3BhY2l0eSgwLCB7XG4gICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gKiAyXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0U2NhbGUoMS4yLCAxLjIsIDEuMiwge1xuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uXG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U2NhbGUoMCwgMCwgMCwge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbiAvIDJcbiAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzUGh5c2ljc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlY3ljbGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfaW5pdFBoeXNpY3MoKSB7XG4gICAgICAgIHRoaXMud29ybGQgICAgICAgICAgICAgPSBQaHlzaWNzLmdldFNpbXVsYXRpb24oKTtcbiAgICAgICAgdGhpcy5pc0JsYWNraG9sZUFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzQnJlYXRoaW5nICAgICAgID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1BoeXNpY3NBY3RpdmUgICA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuc2NhbGluZyA9IHtcbiAgICAgICAgICAgIHN0YXRlOiAoTWF0aC5yYW5kb20oKSA+IDAuNSkgPyAwIDogMSxcbiAgICAgICAgICAgIHZhbDogMSxcbiAgICAgICAgICAgIG1heDogLjEsXG4gICAgICAgICAgICByYXRlOiBNYXRoLnJhbmRvbSgpICogLjAwNVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB1cGRhdGVyID0ge1xuICAgICAgICAgICAgb25VcGRhdGU6ICh0KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy53b3JsZC51cGRhdGUodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XG5cbiAgICAgICAgICAgICAgICBGYW1vdXMucmVxdWVzdFVwZGF0ZU9uTmV4dFRpY2sodXBkYXRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgRmFtb3VzLnJlcXVlc3RVcGRhdGVPbk5leHRUaWNrKHVwZGF0ZXIpO1xuXG4gICAgICAgIHRoaXMuc3BoZXJlID0gbmV3IFNwaGVyZSh7XG4gICAgICAgICAgICBtYXNzOiAxMCxcbiAgICAgICAgICAgIHJhZGl1czogdGhpcy5tb2RlbC5zaXplICogLjUsXG4gICAgICAgICAgICBwb3NpdGlvbjogbmV3IFZlYzMoMCwgMjAwLCAwKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfdXBkYXRlKCkge1xuICAgICAgICBpZih0aGlzLmlzUGh5c2ljc0FjdGl2ZSkge1xuICAgICAgICAgICAgbGV0IHAgPSB0aGlzLnNwaGVyZS5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgbGV0IHYgPSB0aGlzLnNwaGVyZS5nZXRWZWxvY2l0eSgpO1xuICAgICAgICAgICAgbGV0IGR4ID0gcC54IC0gMDtcbiAgICAgICAgICAgIGxldCBkeSA9IHAueSAtIDUwMDtcblxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlRnJvbUNlbnRlciA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSkgLSB0aGlzLm1vZGVsLnNpemUgLyAyO1xuICAgICAgICAgICAgbGV0IGJsYWNraG9sZVJhZGl1cyA9IDMwO1xuICAgICAgICAgICAgbGV0IG1heFYgPSAxNTAwO1xuXG4gICAgICAgICAgICBpZih0aGlzLmlzQmxhY2tob2xlQWN0aXZlICYmIGRpc3RhbmNlRnJvbUNlbnRlciA8IGJsYWNraG9sZVJhZGl1cykge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnc3BpblJpbmcnLCB7fSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1BoeXNpY3NBY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc3BoZXJlLnNldFZlbG9jaXR5KDAsIDAsIDApO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb25ZKEVOVU1TLkNPSU5fQ0VOVEVSLCB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnZlOiBDdXJ2ZXMuZWFzZU91dCxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDUwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvblgoMCwge1xuICAgICAgICAgICAgICAgICAgICBjdXJ2ZXM6IEN1cnZlcy5saW5lYXIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAyNTBcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U2NhbGUoMC4xLCAwLjEsIDAuMSwgeyBkdXJhdGlvbjogMTAwIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlY3ljbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYocC55ID4gd2luZG93LmlubmVySGVpZ2h0ICsgMTAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjeWNsZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHAueSA+IEVOVU1TLkNPSU5fQ0VOVEVSICsgNzAgJiYgdi55IDwgMTUgJiYgdi54IDwgMTUpIHsgLy8gUHJldmVudHMgdGhlIGhhbmdpbmcgYnViYmxlc1xuICAgICAgICAgICAgICAgIHRoaXMucG9wKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYodi54ID4gbWF4ViB8fCB2LnggPCAtbWF4ViB8fCB2LnkgPiBtYXhWIHx8IHYueSA8IC1tYXhWKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3AoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihwLngsIHAueSwgcC56KTtcblxuICAgICAgICAgICAgICAgIC8vQnJlYXRoaW5nXG4gICAgICAgICAgICAgICAgaWYodGhpcy5pc0JyZWF0aGluZykge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnNjYWxpbmcuc3RhdGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NhbGluZy52YWwgKz0gdGhpcy5zY2FsaW5nLnJhdGU7IC8vc2NhbGUgaW5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NhbGluZy52YWwgLT0gdGhpcy5zY2FsaW5nLnJhdGU7IC8vc2NhbGUgb3V0XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnNjYWxpbmcudmFsID49IDEgKyB0aGlzLnNjYWxpbmcubWF4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjYWxpbmcuc3RhdGUgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYodGhpcy5zY2FsaW5nLnZhbCA8PSAxIC0gdGhpcy5zY2FsaW5nLm1heCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2FsaW5nLnN0YXRlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFsdFNjYWxlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U2NhbGUodGhpcy5zY2FsaW5nLnZhbCwgdGhpcy5zY2FsaW5nLnZhbCwgdGhpcy5zY2FsaW5nLnZhbCwgeyBkdXJhdGlvbjogMTB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcmVjeWNsZSgpIHtcbiAgICAgICAgbGV0IHdpbmRvd0hhbGYgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIDI7XG4gICAgICAgIGxldCB4UG9zID0gTWF0aC5yYW5kb20oKSAqICh3aW5kb3dIYWxmICogMikgLSB3aW5kb3dIYWxmO1xuICAgICAgICBsZXQgeVBvcyA9IE1hdGgucmFuZG9tKCkgKiAtNzAwIC0gMjAwO1xuXG4gICAgICAgIHRoaXMuc3BoZXJlLnNldFBvc2l0aW9uKHhQb3MsIHlQb3MsIDApO1xuICAgICAgICB0aGlzLnNwaGVyZS5zZXRWZWxvY2l0eSgwLCAwLCAwKTtcbiAgICAgICAgdGhpcy5zY2FsZS5zZXQoMSwgMSwgMSwge2R1cmF0aW9uOiAxMH0pO1xuICAgICAgICB0aGlzLnNldE9wYWNpdHkoMSk7XG4gICAgICAgIHRoaXMuaXNQaHlzaWNzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc0JyZWF0aGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuc2V0RE9NUHJvcGVydGllcyh7XG4gICAgICAgICAgICAnYm9yZGVyLWNvbG9yJzogJyMwMDAwMDAnXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCBQaHlzaWNzICAgICAgICAgIGZyb20gJy4vUGh5c2ljc1NlcnZpY2UnO1xuaW1wb3J0IFZpZXcgICAgICAgICAgICAgZnJvbSAnZmFtb3VzLWNyZWF0aXZlL2Rpc3BsYXkvVmlldyc7XG5cbi8vRmFtb3VzIENvbXBvbmVudHNcbmNvbnN0IEZhbW91cyAgICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0uY29yZS5GYW1vdXM7XG5cbi8vUGh5c2ljcyBDb21wb25lbnRzXG5jb25zdCBSb3RhdGlvbmFsRHJhZyAgICA9IEZhbW91c1BsYXRmb3JtLnBoeXNpY3MuUm90YXRpb25hbERyYWc7XG5jb25zdCBTcGhlcmUgICAgICAgICAgICA9IEZhbW91c1BsYXRmb3JtLnBoeXNpY3MuU3BoZXJlO1xuXG5leHBvcnQgY2xhc3MgU3Bpbm5pbmdSaW5nIGV4dGVuZHMgVmlldyB7XG4gICAgY29uc3RydWN0b3Iobm9kZSwgb3B0aW9ucykge1xuICAgICAgICBzdXBlcihub2RlLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLm1vZGVsID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgICAvL1Bvc2l0aW9uXG4gICAgICAgIHRoaXMuc2V0QWxpZ24oLjUsIDApO1xuICAgICAgICB0aGlzLnNldE1vdW50UG9pbnQoLjUsIC41LCAuNSk7XG4gICAgICAgIHRoaXMuc2V0T3JpZ2luKC41LCAuNSwgLjUpO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWSh3aW5kb3cuaW5uZXJIZWlnaHQgKiAxLjEpO1xuXG4gICAgICAgIC8vU2l6aW5nXG4gICAgICAgIGlmKHRoaXMubW9kZWwuaSA9PT0gMCkgeyAgICAgICAgICAgIC8vT3V0ZXIgcmluZ1xuICAgICAgICAgICAgdGhpcy5tb2RlbC5zaXplWCA9IDkwO1xuICAgICAgICAgICAgdGhpcy5tb2RlbC5zaXplWSA9IDkwO1xuICAgICAgICB9IGVsc2UgaWYodGhpcy5tb2RlbC5pID09PSAxKSB7ICAgICAvL0lubmVyIHJpbmdcbiAgICAgICAgICAgIHRoaXMubW9kZWwuc2l6ZVggPSA3ODtcbiAgICAgICAgICAgIHRoaXMubW9kZWwuc2l6ZVkgPSA3ODtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U2l6ZU1vZGVBYnNvbHV0ZSgpO1xuICAgICAgICB0aGlzLnNldEFic29sdXRlU2l6ZSh0aGlzLm1vZGVsLnNpemVYLCB0aGlzLm1vZGVsLnNpemVZKTtcblxuICAgICAgICAvL0Rpc3BsYXlcbiAgICAgICAgdGhpcy5zZXRPcGFjaXR5KDApO1xuICAgICAgICB0aGlzLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgdGFnTmFtZTogJ2ltZycsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgJ3NyYyc6IHRoaXMubW9kZWwuc3ZnUGF0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsYXNzZXM6IFsnc3Bpbm5pbmctcmluZyddXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vRXZlbnRpbmdcbiAgICAgICAgdGhpcy5zZXRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5faW5pdFBoeXNpY3MoKTtcbiAgICB9XG5cbiAgICBzZXRFdmVudHMoKSB7XG4gICAgICAgIHRoaXMub24oJ3NwaW5SaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG9wYWNpdHkgPSB0aGlzLmdldE9wYWNpdHkoKTtcbiAgICAgICAgICAgIGlmKG9wYWNpdHkgIT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE9wYWNpdHkoMSwge1xuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMjAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc3BpblJpbmcoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3BpblJpbmcoKSB7XG4gICAgICAgIC8vVE9ETyBBbGxvdyByb3RhdGlvbmFsIGFyZ3MgdG8gYmUgcGFzc2VkXG4gICAgICAgIGlmKHRoaXMubW9kZWwuaSA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zcGhlcmUuc2V0QW5ndWxhclZlbG9jaXR5KDUsIDE1LCAxMCk7XG4gICAgICAgIH0gZWxzZSBpZih0aGlzLm1vZGVsLmkgPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuc3BoZXJlLnNldEFuZ3VsYXJWZWxvY2l0eSgyNSwgMTAsIDE1KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9pbml0UGh5c2ljcygpIHtcbiAgICAgICAgdGhpcy53b3JsZCA9IFBoeXNpY3MuZ2V0U2ltdWxhdGlvbigpO1xuXG4gICAgICAgIHZhciB1cGRhdGVyID0ge1xuICAgICAgICAgICAgb25VcGRhdGU6ICh0KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy53b3JsZC51cGRhdGUodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XG5cbiAgICAgICAgICAgICAgICBGYW1vdXMucmVxdWVzdFVwZGF0ZU9uTmV4dFRpY2sodXBkYXRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgRmFtb3VzLnJlcXVlc3RVcGRhdGVPbk5leHRUaWNrKHVwZGF0ZXIpO1xuXG4gICAgICAgIHRoaXMuc3BoZXJlID0gbmV3IFNwaGVyZSh7XG4gICAgICAgICAgICBtYXNzOiAxMDAsXG4gICAgICAgICAgICByYWRpdXM6IHRoaXMubW9kZWwuc2l6ZVggKiAuNVxuICAgICAgICB9KTtcblxuICAgICAgICAvL0EgYmVoYXZpb3IgdGhhdCBzbG93cyBhbmd1bGFyIHZlbG9jaXR5IGJ5IGFwcGx5aW5nIHRvcnF1ZS5cbiAgICAgICAgdGhpcy5yb3RhdGlvbmFsRHJhZyA9IG5ldyBSb3RhdGlvbmFsRHJhZyhbdGhpcy5zcGhlcmVdLCB7XG4gICAgICAgICAgICBtYXg6IDUwMDAwLFxuICAgICAgICAgICAgc3RyZW5ndGg6IDUwMDAwMFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndvcmxkLmFkZChbdGhpcy5zcGhlcmUsIHRoaXMucm90YXRpb25hbERyYWddKTtcbiAgICB9XG5cbiAgICBfdXBkYXRlKCkge1xuICAgICAgICBsZXQgdiA9IHRoaXMuc3BoZXJlLmdldEFuZ3VsYXJWZWxvY2l0eSgpO1xuICAgICAgICBsZXQgcSA9IHRoaXMuc3BoZXJlLmdldE9yaWVudGF0aW9uKCk7IC8vUmV0dXJucyBhIHF1YXRlcm5pb25cblxuICAgICAgICBpZih2LnggPCAxICYmIHYueSA8IDEgJiYgdi56IDwgMSkge1xuICAgICAgICAgICAgdGhpcy5zZXRSb3RhdGlvbigwLCAwLCAwLCB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDIwMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHJvdGF0aW9uID0ge307XG4gICAgICAgICAgICBxLnRvRXVsZXIocm90YXRpb24pO1xuICAgICAgICAgICAgdGhpcy5zZXRSb3RhdGlvbihyb3RhdGlvbi54LCByb3RhdGlvbi55LCByb3RhdGlvbi56KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCBWaWV3ICAgICAgICAgICAgIGZyb20gJ2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L1ZpZXcnO1xuXG5leHBvcnQgY2xhc3MgVG9wVGV4dCBleHRlbmRzIFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKG5vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIobm9kZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAnZm9udC1zaXplJzogJzYwcHgnLFxuICAgICAgICAgICAgICAgICd0ZXh0LWFsaWduJzogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgJ2ZvbnQtd2VpZ2h0JzogJzIwMCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZW50OiAnVHJ5PGJyPnNpbXBsZSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZSgwLCAxKTtcbiAgICAgICAgdGhpcy5zZXRQcm9wb3J0aW9uYWxTaXplKDEsIG51bGwpO1xuICAgICAgICB0aGlzLnNldEFic29sdXRlU2l6ZShudWxsLCAyMDApO1xuICAgICAgICB0aGlzLnNldE9wYWNpdHkoMSk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25ZKDMzKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUYWdMaW5lIGV4dGVuZHMgVmlldyB7XG4gICAgY29uc3RydWN0b3Iobm9kZSwgb3B0aW9ucykge1xuICAgICAgICBzdXBlcihub2RlLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICdmb250LXNpemUnOiAnNTBweCcsXG4gICAgICAgICAgICAgICAgJ3RleHQtYWxpZ24nOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAnbGluZS1oZWlnaHQnOiAnMWVtJyxcbiAgICAgICAgICAgICAgICAnY29sb3InOiAnI0ZGRkZGRidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZW50OiAnQWxsIHlvdXIgY2FyZHM8YnI+PHN0cm9uZz5vbmUgY29pbjwvc3Ryb25nPidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZSgwLCAxKTtcbiAgICAgICAgdGhpcy5zZXRQcm9wb3J0aW9uYWxTaXplKDEsIG51bGwpO1xuICAgICAgICB0aGlzLnNldEFic29sdXRlU2l6ZShudWxsLCAxMDApO1xuICAgICAgICB0aGlzLnNldE9wYWNpdHkoMSk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25ZKC0xMDApO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvaW4gZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5vZGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ2ZvbnQtc2l6ZSc6ICc0OHB4JyxcbiAgICAgICAgICAgICAgICAndGV4dC1hbGlnbic6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICdsaW5lLWhlaWdodCc6ICcxZW0nLFxuICAgICAgICAgICAgICAgICdjb2xvcic6ICcjMDAwMDAwJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICdjb2luJ1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFNpemVNb2RlKDAsIDEpO1xuICAgICAgICB0aGlzLnNldFByb3BvcnRpb25hbFNpemUoMSwgbnVsbCk7XG4gICAgICAgIHRoaXMuc2V0QWJzb2x1dGVTaXplKG51bGwsIDUwKTtcbiAgICAgICAgdGhpcy5zZXRPcGFjaXR5KDEpO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWSh3aW5kb3cuaW5uZXJIZWlnaHQgKiAxLjMpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdldFlvdXJzIGV4dGVuZHMgVmlldyB7XG4gICAgY29uc3RydWN0b3Iobm9kZSwgb3B0aW9ucykge1xuICAgICAgICBzdXBlcihub2RlLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICdmb250LXNpemUnOiAnNDJweCcsXG4gICAgICAgICAgICAgICAgJ3RleHQtYWxpZ24nOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAnbGluZS1oZWlnaHQnOiAnMWVtJyxcbiAgICAgICAgICAgICAgICAnY29sb3InOiAnI0ZGRkZGRidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZW50OiAnR2V0IHlvdXJzIGZpcnN0J1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFNpemVNb2RlKDAsIDEpO1xuICAgICAgICB0aGlzLnNldFByb3BvcnRpb25hbFNpemUoMSwgbnVsbCk7XG4gICAgICAgIHRoaXMuc2V0QWJzb2x1dGVTaXplKG51bGwsIDUwKTtcbiAgICAgICAgdGhpcy5zZXRPcGFjaXR5KDEpO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWSh3aW5kb3cuaW5uZXJIZWlnaHQgKiAxLjQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByZU9yZGVyIGV4dGVuZHMgVmlldyB7XG4gICAgY29uc3RydWN0b3Iobm9kZSwgb3B0aW9ucykge1xuICAgICAgICBzdXBlcihub2RlLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyMwMDAwMDAnLFxuICAgICAgICAgICAgICAgICdib3JkZXItcmFkaXVzJzogJzRweCcsXG4gICAgICAgICAgICAgICAgJ2NvbG9yJzogJyNGRkZGRkYnLFxuICAgICAgICAgICAgICAgICdmb250LXNpemUnOiAnMjJweCcsXG4gICAgICAgICAgICAgICAgJ2ZvbnQtd2VpZ2h0JzogJzcwMCcsXG4gICAgICAgICAgICAgICAgJ2xpbmUtaGVpZ2h0JzogJzQwcHgnLFxuICAgICAgICAgICAgICAgICdvdmVyZmxvdyc6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICd0ZXh0LWFsaWduJzogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgJ3RleHQtdHJhbnNmb3JtJzogJ3VwcGVyY2FzZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZW50OiAnUHJlLW9yZGVyIG5vdycsXG4gICAgICAgICAgICBjbGFzc2VzOiBbJ3R4dC1wcmVvcmRlciddXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0QWxpZ24oLjUsIDApO1xuICAgICAgICB0aGlzLnNldE1vdW50UG9pbnQoLjUsIDApO1xuICAgICAgICB0aGlzLnNldE9wYWNpdHkoMSk7XG4gICAgICAgIHRoaXMuc2V0U2l6ZU1vZGVBYnNvbHV0ZSgpO1xuICAgICAgICB0aGlzLnNldEFic29sdXRlU2l6ZSgyMjAsIDQwKTtcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvblkod2luZG93LmlubmVySGVpZ2h0ICogMS41KTtcbiAgICB9XG59XG4iLCJpbXBvcnQge1RvcFRleHQsIFRhZ0xpbmUsIEdldFlvdXJzLCBQcmVPcmRlciwgQ29pbn0gZnJvbSAnLi9UZXh0Vmlld3MnO1xuaW1wb3J0IFZpZXcgICAgICAgICAgICAgZnJvbSAnZmFtb3VzLWNyZWF0aXZlL2Rpc3BsYXkvVmlldyc7XG5pbXBvcnQgVGltZWxpbmUgICAgICAgICBmcm9tICdmYW1vdXMtY3JlYXRpdmUvYW5pbWF0aW9uL1RpbWVsaW5lJztcbmltcG9ydCB7SGFuZH0gICAgICAgICAgIGZyb20gJy4vSGFuZCc7XG5pbXBvcnQge0NhcmR9ICAgICAgICAgICBmcm9tICcuL0NhcmQnO1xuaW1wb3J0IHtSaW5nfSAgICAgICAgICAgZnJvbSAnLi9SaW5nJztcbmltcG9ydCB7U3Bpbm5pbmdSaW5nfSAgIGZyb20gJy4vU3Bpbm5pbmdSaW5nJztcbmltcG9ydCBFTlVNUyAgICAgICAgICAgIGZyb20gJy4vRW51bXMnO1xuaW1wb3J0IFBoeXNpY3MgICAgICAgICAgZnJvbSAnLi9QaHlzaWNzU2VydmljZSc7XG5cbi8vRmFtb3VzIENvbXBvbmVudHNcbmNvbnN0IEdlc3R1cmVIYW5kbGVyID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5HZXN0dXJlSGFuZGxlcjtcbmNvbnN0IEN1cnZlcyAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0udHJhbnNpdGlvbnMuQ3VydmVzO1xuXG4vL1BoeXNpY3MgQ29tcG9uZW50c1xuY29uc3QgR3Jhdml0eTFEICAgICAgPSBGYW1vdXNQbGF0Zm9ybS5waHlzaWNzLkdyYXZpdHkxRDtcbmNvbnN0IEdyYXZpdHkzRCAgICAgID0gRmFtb3VzUGxhdGZvcm0ucGh5c2ljcy5HcmF2aXR5M0Q7XG5jb25zdCBWZWMzICAgICAgICAgICA9IEZhbW91c1BsYXRmb3JtLm1hdGguVmVjMztcbmNvbnN0IERyYWcgICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0ucGh5c2ljcy5EcmFnO1xuXG5leHBvcnQgY2xhc3MgQXBwIGV4dGVuZHMgVmlldyB7XG4gICAgY29uc3RydWN0b3Iobm9kZSwgb3B0aW9ucykge1xuICAgICAgICBzdXBlcihub2RlLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLnNldEFsaWduKC41LCAuNSk7XG4gICAgICAgIHRoaXMuc2V0TW91bnRQb2ludCguNSwgLjUpO1xuXG4gICAgICAgIHRoaXMuc2V0U2l6ZU1vZGUoMCwgMCk7XG4gICAgICAgIHRoaXMuc2V0QWJzb2x1dGVTaXplKDEsIDEpO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pbml0VGltZWxpbmUoKTtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB0aGlzLnJlbmRlclNwaW5uaW5nUmluZ3MoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJSaW5ncygpO1xuXG4gICAgICAgIHRoaXMuc2V0RXZlbnRzKCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJUaW1lbGluZVBhdGhzKCk7XG4gICAgICAgIHRoaXMuaW5pdFdvcmxkKCk7XG4gICAgfVxuXG4gICAgaW5pdFRpbWVsaW5lKCkge1xuICAgICAgICB0aGlzLnRpbWVsaW5lID0gbmV3IFRpbWVsaW5lKHsgdGltZXNjYWxlOiAxIH0pO1xuICAgICAgICB0aGlzLnRpbWUgPSB7fTtcbiAgICAgICAgdGhpcy50aW1lLnN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy50aW1lLnN0ZXAxID0gdGhpcy50aW1lLnN0YXJ0ICsgMTUwMDsgLy8gQ2FyZCBzY2FsZSBhcGV4XG4gICAgICAgIHRoaXMudGltZS5zdGVwMiA9IHRoaXMudGltZS5zdGVwMSArIDUwMDsgIC8vIENhcmQgc2NhbGUgYmFzaW5cbiAgICAgICAgdGhpcy50aW1lLnN0ZXAzID0gdGhpcy50aW1lLnN0ZXAyICsgNTAwOyAgLy8gU3RhZ2Ugb25lIGRvbmU6IENvaW4gY2FyZCBoYXMgc2NhbGVkIGJhY2sgdG8gYSByZXN0aW5nIHBvaW50XG4gICAgICAgIHRoaXMudGltZS5zdGVwNCA9IHRoaXMudGltZS5zdGVwMyArIDEwMDA7IC8vIENvaW4gY2FyZCBzY2FsZSBhbmQgZmxpcCBzdGFydGluZ1xuICAgICAgICB0aGlzLnRpbWUuc3RlcDUgPSB0aGlzLnRpbWUuc3RlcDQgKyAxMDAwOyAvLyBDb2luIGNhcmQgc2NhbGUgYW5kIGZsaXAgYXBleFxuICAgICAgICB0aGlzLnRpbWUuc3RlcDYgPSB0aGlzLnRpbWUuc3RlcDUgKyAyNTA7ICAvLyBDb2luIGNhcmQgc2NhbGUgYW5kIGZsaXAgYWxtb3N0IGRvbmVcbiAgICAgICAgdGhpcy50aW1lLnN0ZXA3ID0gdGhpcy50aW1lLnN0ZXA2ICsgMjUwOyAgLy8gRW5kIHN0YXRlIHRleHQgc3RhcnRzIG1vdmluZyBpblxuICAgICAgICB0aGlzLnRpbWUuc3RlcDggPSB0aGlzLnRpbWUuc3RlcDcgKyAxMDAwOyAvLyBTdGFnZSB0d28gZG9uZTogVGFnIGxpbmUgYW5kIGNvaW4gY2FyZCBhcmUgbW92aW5nIHVwIGFuZCBvdXRcbiAgICAgICAgdGhpcy50aW1lLmVuZCAgID0gdGhpcy50aW1lLnN0ZXA4ICsgMTAwMDsgLy8gRmluaXNcbiAgICB9XG5cbiAgICBpbml0V29ybGQoKSB7XG4gICAgICAgIHRoaXMud29ybGQgPSBQaHlzaWNzLmdldFNpbXVsYXRpb24oKTtcbiAgICAgICAgdGhpcy5yaW5nQm9kaWVzID0gW107XG5cbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMucmluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucmluZ0JvZGllcy5wdXNoKHRoaXMucmluZ3NbaV0uc3BoZXJlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJhZyA9IG5ldyBEcmFnKHRoaXMucmluZ0JvZGllcywge1xuICAgICAgICAgICAgbWF4OiBQaHlzaWNzLmRhbXBlbkZvcmNlKDc1MDApLFxuICAgICAgICAgICAgc3RyZW5ndGg6IFBoeXNpY3MuZGFtcGVuRm9yY2UoNzUwMCksXG4gICAgICAgICAgICB0eXBlOiBEcmFnLkxpbmVhclxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndvcmxkLmFkZCh0aGlzLnJpbmdCb2RpZXMsIHRoaXMuZHJhZyk7XG4gICAgfVxuXG4gICAgcGh5QWRkUmVwdWxzaW9uKCkge1xuICAgICAgICBsZXQgcmluZ1JlcHVsc2lvbnMgPSBbXTtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMucmluZ0JvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmluZ1JlcHVsc2lvbnMucHVzaChuZXcgR3Jhdml0eTNEKHRoaXMucmluZ0JvZGllc1tpXSwgdGhpcy5yaW5nQm9kaWVzLCB7XG4gICAgICAgICAgICAgICAgc3RyZW5ndGg6IFBoeXNpY3MuZGFtcGVuRm9yY2UoLTFlMykgLy9OZWdhdGl2ZSBSZXB1bHNpb24gcHVzaGVzIGF3YXlcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKHJpbmdSZXB1bHNpb25zKTtcbiAgICB9XG5cbiAgICBwaHlBZGQxZEdyYXZpdHkoKSB7XG4gICAgICAgIHRoaXMuZ3Jhdml0eTFkID0gbmV3IEdyYXZpdHkxRCh0aGlzLnJpbmdCb2RpZXMsIHtcbiAgICAgICAgICAgIGFjY2VsZXJhdGlvbjogbmV3IFZlYzMoMCwgUGh5c2ljcy5kYW1wZW5Gb3JjZSg3NTApLCAwKVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndvcmxkLmFkZChbdGhpcy5ncmF2aXR5MWRdKTtcbiAgICB9XG5cbiAgICBwaHlBZGQzZEdyYXZpdHkoKSB7XG4gICAgICAgIHRoaXMuZ3Jhdml0eTNkID0gbmV3IEdyYXZpdHkzRChudWxsLCB0aGlzLnJpbmdCb2RpZXMsIHtcbiAgICAgICAgICAgIHN0cmVuZ3RoOiBQaHlzaWNzLmRhbXBlbkZvcmNlKDVlNyksXG4gICAgICAgICAgICBhbmNob3I6IG5ldyBWZWMzKDAsIEVOVU1TLkNPSU5fUE9TLCAwKVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndvcmxkLmFkZChbdGhpcy5ncmF2aXR5M2RdKTtcbiAgICB9XG5cbiAgICBsb2FkUmluZ3MoKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgbGV0IGRhbXBlbmVkVmVsb2NpdHkgPSBQaHlzaWNzLmRhbXBlbkZvcmNlKDEwMDApO1xuXG4gICAgICAgIHRoaXMucmluZ3MuZm9yRWFjaCgocmluZykgPT4ge1xuICAgICAgICAgICAgcmluZy5zZXRPcGFjaXR5KDEpO1xuXG4gICAgICAgICAgICBsZXQgdnggPSBNYXRoLnJhbmRvbSgpICogKGRhbXBlbmVkVmVsb2NpdHkgKiAyKSAtIGRhbXBlbmVkVmVsb2NpdHk7XG4gICAgICAgICAgICBsZXQgdnkgPSBNYXRoLnJhbmRvbSgpICogKGRhbXBlbmVkVmVsb2NpdHkgKiAyKSAtIGRhbXBlbmVkVmVsb2NpdHk7XG5cbiAgICAgICAgICAgIHJpbmcuc3BoZXJlLnNldFZlbG9jaXR5KHZ4LCB2eSwgMCk7XG4gICAgICAgICAgICByaW5nLmFjdGl2YXRlUGh5c2ljcygpO1xuXG4gICAgICAgICAgICByaW5nLnNldFNjYWxlKDEuMSwgMS4xLCAxLjEsIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogNzUwXG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmluZy5zZXRTY2FsZSgxLCAxLCAxLCB7XG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA1MFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmluZy5hY3RpdmF0ZUJsYWNraG9sZSgpO1xuICAgICAgICAgICAgfSwgdGhpcy50aW1lLnN0ZXA2KTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByaW5nLnNldERPTVByb3BlcnRpZXMoe1xuICAgICAgICAgICAgICAgICAgICAnYm9yZGVyLWNvbG9yJzogJyMwMDAwMDAnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzLnRpbWUuZW5kKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLnBoeUFkZDFkR3Jhdml0eSgpO1xuICAgICAgICAgICAgX3RoaXMucGh5QWRkUmVwdWxzaW9uKCk7XG4gICAgICAgIH0sIDg1MCk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLnBoeUFkZDNkR3Jhdml0eSgpO1xuICAgICAgICB9LCB0aGlzLnRpbWUuc3RlcDYpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJCbHVlU2NyZWVuKCk7XG4gICAgICAgIHRoaXMucmVuZGVyVG9wVGV4dCgpO1xuICAgICAgICB0aGlzLnJlbmRlckNhcmRzKCk7XG4gICAgICAgIHRoaXMucmVuZGVySGFuZCgpO1xuICAgICAgICB0aGlzLnJlbmRlclRhZ0xpbmUoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJDb2luKCk7XG4gICAgICAgIHRoaXMucmVuZGVyR2V0WW91cnMoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJQcmVPcmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlckJsdWVTY3JlZW4oKSB7XG4gICAgICAgIHRoaXMuYmx1ZVNjcmVlbiA9IG5ldyBWaWV3KHRoaXMubm9kZS5hZGRDaGlsZCgpKTtcblxuICAgICAgICB0aGlzLmJsdWVTY3JlZW4uY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAncmdiKDIyLCAxMzksIDIyMSknLFxuICAgICAgICAgICAgICAgICd6LWluZGV4JzogLTEwMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjbGFzc2VzOiBbJ2JsdWUtc2NyZWVuJ11cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ibHVlU2NyZWVuLnNldFNpemVNb2RlKDAsIDApO1xuICAgICAgICB0aGlzLmJsdWVTY3JlZW4uc2V0UHJvcG9ydGlvbmFsU2l6ZSgxLCAxKTtcbiAgICAgICAgdGhpcy5ibHVlU2NyZWVuLnNldEFsaWduKDAsIDAsIDApO1xuICAgICAgICB0aGlzLmJsdWVTY3JlZW4uc2V0UG9zaXRpb24oMCwgd2luZG93LmlubmVySGVpZ2h0LCAtMTAwMCk7XG4gICAgfVxuXG4gICAgcmVuZGVyVG9wVGV4dCgpIHtcbiAgICAgICAgdGhpcy50b3BUZXh0ID0gbmV3IFRvcFRleHQodGhpcy5ub2RlLmFkZENoaWxkKCkpO1xuICAgIH1cblxuICAgIHJlbmRlckhhbmQoKSB7XG4gICAgICAgIHRoaXMuaGFuZCA9IG5ldyBIYW5kKHRoaXMubm9kZS5hZGRDaGlsZCgpLCB7XG4gICAgICAgICAgICB0YWdOYW1lOiAnaW1nJyxcbiAgICAgICAgICAgIG1vZGVsOiB7XG4gICAgICAgICAgICAgICAgaW1nUGF0aDogJ2Fzc2V0cy9zdmcvaGFuZC5zdmcnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlckNhcmRzKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5jYXJkcyA9IFtdO1xuICAgICAgICBsZXQgY2FyZHNTcmMgPSBbXG4gICAgICAgICAgICB7IGZyb250OiAnYXNzZXRzL2ltYWdlcy9naWZ0LnBuZycsICAgICAgIGJhY2s6ICdhc3NldHMvc3ZnL2NhcmRCYWNrLnN2Zyd9LFxuICAgICAgICAgICAgeyBmcm9udDogJ2Fzc2V0cy9pbWFnZXMvY3JlZGl0LnBuZycsICAgICBiYWNrOiAnYXNzZXRzL3N2Zy9jYXJkQmFjay5zdmcnfSxcbiAgICAgICAgICAgIHsgZnJvbnQ6ICdhc3NldHMvaW1hZ2VzL21lbWJlcnNoaXAucG5nJywgYmFjazogJ2Fzc2V0cy9zdmcvY2FyZEJhY2suc3ZnJ30sXG4gICAgICAgICAgICB7IGZyb250OiAnYXNzZXRzL2ltYWdlcy9kZWJpdC5wbmcnLCAgICAgIGJhY2s6ICdhc3NldHMvc3ZnL2NhcmRCYWNrLnN2Zyd9LFxuICAgICAgICAgICAgeyBmcm9udDogJ2Fzc2V0cy9zdmcvY29pbkZyb250LnN2ZycsICAgICBiYWNrOiAnYXNzZXRzL3N2Zy9jb2luQmFjay5zdmcnfVxuICAgICAgICBdO1xuXG4gICAgICAgIGNhcmRzU3JjLmZvckVhY2goZnVuY3Rpb24oY2FyZCwgaSkge1xuICAgICAgICAgICAgbGV0IGNhcmROb2RlID0gbmV3IENhcmQoX3RoaXMubm9kZS5hZGRDaGlsZCgpLCB7XG4gICAgICAgICAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgICAgICAgICAgbW9kZWw6IHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbnQ6IGNhcmQuZnJvbnQsXG4gICAgICAgICAgICAgICAgICAgIGJhY2s6IGNhcmQuYmFjayxcbiAgICAgICAgICAgICAgICAgICAgaTogaVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZihpID09PSBjYXJkc1NyYy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgY2FyZE5vZGUuc2V0T3BhY2l0eSgwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX3RoaXMuY2FyZHMucHVzaChjYXJkTm9kZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlclRhZ0xpbmUoKSB7XG4gICAgICAgIHRoaXMudGFnTGluZSA9IG5ldyBUYWdMaW5lKHRoaXMubm9kZS5hZGRDaGlsZCgpKTtcbiAgICB9XG5cbiAgICByZW5kZXJTcGlubmluZ1JpbmdzKCkge1xuICAgICAgICBsZXQgc3ZnUGF0aHMgPSBbXG4gICAgICAgICAgICAnYXNzZXRzL3N2Zy9vdXRlckNpcmNsZS5zdmcnLFxuICAgICAgICAgICAgJ2Fzc2V0cy9zdmcvaW5uZXJDaXJjbGUuc3ZnJ1xuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuc3Bpbm5pbmdSaW5ncyA9IFtdO1xuXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdmdQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IHJpbmcgPSBuZXcgU3Bpbm5pbmdSaW5nKHRoaXMubm9kZS5hZGRDaGlsZCgpLCB7XG4gICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICBzdmdQYXRoOiBzdmdQYXRoc1tpXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuc3Bpbm5pbmdSaW5ncy5wdXNoKHJpbmcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyQ29pbigpIHtcbiAgICAgICAgdGhpcy5jb2luID0gbmV3IENvaW4odGhpcy5ub2RlLmFkZENoaWxkKCkpO1xuICAgIH1cblxuICAgIHJlbmRlckdldFlvdXJzKCkge1xuICAgICAgICB0aGlzLmdldFlvdXJzID0gbmV3IEdldFlvdXJzKHRoaXMubm9kZS5hZGRDaGlsZCgpKTtcbiAgICB9XG5cbiAgICByZW5kZXJQcmVPcmRlcigpIHtcbiAgICAgICAgdGhpcy5wcmVPcmRlciA9IG5ldyBQcmVPcmRlcih0aGlzLm5vZGUuYWRkQ2hpbGQoKSwge1xuICAgICAgICAgICAgdGFnOiAnYnV0dG9uJ1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNoaW1tZXIgPSBuZXcgVmlldyh0aGlzLnByZU9yZGVyLmFkZENoaWxkKCkpO1xuICAgICAgICB0aGlzLnNoaW1tZXIuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQnOiAnbGluZWFyLWdyYWRpZW50KDgwZGVnLCByZ2JhKDAsMCwwLDApIDMwJSxyZ2JhKDE4MCwxODAsMTgwLDAuMykgNDUlLHJnYmEoMTgwLDE4MCwxODAsMC4zKSA1NSUsIHJnYmEoMCwwLDAsMCkgNzAlKScsXG4gICAgICAgICAgICAgICAgJ3pJbmRleCc6IDEwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xhc3NlczogWydzaGltbWVyJ11cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zaGltbWVyLnNldFBvc2l0aW9uKC0yNDAsIC00MCwgMTApO1xuICAgIH1cblxuICAgIHJlbmRlclJpbmdzKCkge1xuICAgICAgICB0aGlzLnJpbmdzID0gW107XG5cbiAgICAgICAgbGV0IHJpbmdDb3VudCA9IDA7XG5cbiAgICAgICAgaWYod2luZG93LmlubmVyV2lkdGggPCAzMjApIHtcbiAgICAgICAgICAgIHJpbmdDb3VudCA9IDc7XG4gICAgICAgIH0gZWxzZSBpZih3aW5kb3cuaW5uZXJXaWR0aCA8IDQyOCkge1xuICAgICAgICAgICAgcmluZ0NvdW50ID0gMTA7XG4gICAgICAgIH0gZWxzZSBpZih3aW5kb3cuaW5uZXJXaWR0aCA8IDc2OCkge1xuICAgICAgICAgICAgcmluZ0NvdW50ID0gMTU7XG4gICAgICAgIH0gZWxzZSBpZih3aW5kb3cuaW5uZXJXaWR0aCA8IDk5Mikge1xuICAgICAgICAgICAgcmluZ0NvdW50ID0gMjA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByaW5nQ291bnQgPSAzMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJpbmdDb3VudCA9IDE1MDtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHJpbmdDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgcmluZyA9IG5ldyBSaW5nKHRoaXMubm9kZS5hZGRDaGlsZCgpKTtcbiAgICAgICAgICAgIHRoaXMucmluZ3MucHVzaChyaW5nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRyYW5zbGF0ZVNoaW1tZXIoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNoaW1tZXIuc2V0UG9zaXRpb25YKDI0MCwge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxNTAwLFxuICAgICAgICAgICAgICAgIGN1cnZlOiBDdXJ2ZXMuZWFzZUluT3V0XG4gICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNoaW1tZXIuc2V0UG9zaXRpb25YKC0yNDApO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlU2hpbW1lcigpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCAzMDAwKTtcbiAgICB9XG5cbiAgICBzZXRFdmVudHMoKSB7XG4gICAgICAgIGxldCBpc1NjcnViYmluZyA9IGZhbHNlO1xuICAgICAgICBsZXQgaGFzRmluaXNoZWQgPSBmYWxzZTtcblxuICAgICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZih0aGlzLnJpbmdzICYmIHRoaXMucmluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGxldCByaW5nID0gdGhpcy5yaW5nc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLnJpbmdzLmxlbmd0aCldO1xuICAgICAgICAgICAgICAgIHJpbmcucG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG5cbiAgICAgICAgdGhpcy5vbignbW91c2Vkb3duJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmKCFoYXNGaW5pc2hlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnZHJhZ2dpbmcnLCAnc3RhcnQnKTtcbiAgICAgICAgICAgICAgICBpc1NjcnViYmluZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMub24oJ21vdXNlbW92ZScsIChlKSA9PiB7XG4gICAgICAgICAgICBpZihpc1NjcnViYmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMubW91c2VNb3ZlbWVudCA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogZS5jbGllbnRYLFxuICAgICAgICAgICAgICAgICAgICB5OiBlLmNsaWVudFlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuc2NydWJUaW1lbGluZSh0aGlzLm1vdXNlTW92ZW1lbnQubW92ZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm9uKCdtb3VzZXVwJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlzU2NydWJiaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgZHVyYXRpb247XG4gICAgICAgICAgICB0aGlzLm1vdXNlTW92ZW1lbnQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZih0aGlzLmN1cnJlbnRUaW1lID4gKHRoaXMudGltZS5zdGVwMSAvIDIpKSB7IC8vIEZJTklTSCB0aGUgdGltZSBsaW5lXG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPSB0aGlzLnRpbWUuZW5kIC0gdGhpcy5jdXJyZW50VGltZTtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy50aW1lLmVuZDtcbiAgICAgICAgICAgICAgICBoYXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgeyAgLy9SRVNFVCB0aGUgdGltZSBsaW5lXG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgncmVzZXRBcHAnLCB7IGR1cmF0aW9uIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50aW1lbGluZS5zZXQodGhpcy5jdXJyZW50VGltZSwgeyBkdXJhdGlvbiB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5nZXN0dXJlcyA9IG5ldyBHZXN0dXJlSGFuZGxlcih0aGlzLm5vZGUsICBbe1xuICAgICAgICAgICAgZXZlbnQ6ICdkcmFnJyxcbiAgICAgICAgICAgIGNhbGxiYWNrOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBkdXJhdGlvbjtcblxuICAgICAgICAgICAgICAgIGlmKGUuc3RhdHVzID09PSAnbW92ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdkcmFnZ2luZycsICdzdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjcnViVGltZWxpbmVHZXN0dXJlKGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihlLnN0YXR1cyA9PT0gJ2VuZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50VGltZSA+ICh0aGlzLnRpbWUuc3RlcDEgLyAyKSkgeyAvL01hdGguYWJzKGUuY2VudGVyVmVsb2NpdHkueSkgPiAyNTAgIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiA9IHRoaXMudGltZS5lbmQgLSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMudGltZS5lbmQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgncmVzZXRBcHAnLCB7IGR1cmF0aW9uIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lbGluZS5zZXQodGhpcy5jdXJyZW50VGltZSwgeyBkdXJhdGlvbiB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfV0pO1xuICAgIH1cblxuICAgIHNldCBtb3VzZU1vdmVtZW50KHBvc2l0aW9uKSB7XG4gICAgICAgIGlmKCFwb3NpdGlvbikge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMubW91c2VQcm9wZXJ0aWVzO1xuICAgICAgICB9IGVsc2UgaWYoIXRoaXMubW91c2VQcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICB0aGlzLm1vdXNlUHJvcGVydGllcyA9IHtcbiAgICAgICAgICAgICAgICBfbGFzdFBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICAgICAgICAgICAgICBtb3ZlbWVudDoge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubW91c2VQcm9wZXJ0aWVzLm1vdmVtZW50LnggPSB0aGlzLm1vdXNlUHJvcGVydGllcy5fbGFzdFBvc2l0aW9uLnggLSBwb3NpdGlvbi54O1xuICAgICAgICAgICAgdGhpcy5tb3VzZVByb3BlcnRpZXMubW92ZW1lbnQueSA9IHRoaXMubW91c2VQcm9wZXJ0aWVzLl9sYXN0UG9zaXRpb24ueSAtIHBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLm1vdXNlUHJvcGVydGllcy5fbGFzdFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgbW91c2VNb3ZlbWVudCgpIHtcbiAgICAgICAgaWYoIXRoaXMubW91c2VQcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICB0aGlzLm1vdXNlUHJvcGVydGllcyA9IHtcbiAgICAgICAgICAgICAgICBfbGFzdFBvc2l0aW9uOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgbW92ZW1lbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICB5OiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2VQcm9wZXJ0aWVzO1xuICAgIH1cblxuICAgIGFkZENvaW5TcHJpbmdFdmVudCgpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICBjb25zdCBjb2luQ2FyZCA9IF90aGlzLmNhcmRzW190aGlzLmNhcmRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBjb25zdCB2aWV3UG9ydENlbnRlciA9IHtcbiAgICAgICAgICAgIHg6IHdpbmRvdy5pbm5lcldpZHRoIC8gMixcbiAgICAgICAgICAgIHk6IHdpbmRvdy5pbm5lckhlaWdodCAvIDJcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBhcHBTaXplID0gdGhpcy5nZXRTaXplKCk7XG4gICAgICAgIGNvbnN0IGNhcmRTaXplID0gY29pbkNhcmQuZ2V0U2l6ZSgpO1xuICAgICAgICBjb25zdCBjYXJkUG9zaXRpb24gPSB7XG4gICAgICAgICAgICB4OiBjb2luQ2FyZC5wb3NpdGlvbi5nZXRYKCksXG4gICAgICAgICAgICB5OiBjb2luQ2FyZC5nZXRQb3NpdGlvblkoKVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjYXJkQ2VudGVyID0ge1xuICAgICAgICAgICAgeDogdmlld1BvcnRDZW50ZXIueCxcbiAgICAgICAgICAgIHk6ICh2aWV3UG9ydENlbnRlci55IC0gKGFwcFNpemVbMV0gLyAyKSkgKyAoKGNhcmRTaXplWzFdIC8gMikgKyBjYXJkUG9zaXRpb24ueSlcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiByZWxlYXNlU3ByaW5nKGUpIHtcbiAgICAgICAgICAgIGNvaW5DYXJkLnNldFJvdGF0aW9uWSgwLCB7XG4gICAgICAgICAgICAgICAgY3VydmU6IEN1cnZlcy5zcHJpbmcsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDEwMDBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb2luQ2FyZC5zZXRSb3RhdGlvblgoMCwge1xuICAgICAgICAgICAgICAgIGN1cnZlOiBDdXJ2ZXMuc3ByaW5nLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub24oJ21vdXNlbGVhdmUnLCByZWxlYXNlU3ByaW5nKTtcbiAgICAgICAgdGhpcy5vbignbW91c2VvdXQnLCByZWxlYXNlU3ByaW5nKTtcblxuICAgICAgICB0aGlzLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0ge1xuICAgICAgICAgICAgICAgIHg6IGUuY2xpZW50WCAtIGNhcmRDZW50ZXIueCxcbiAgICAgICAgICAgICAgICB5OiBlLmNsaWVudFkgLSBjYXJkQ2VudGVyLnlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxldCBtYXhPZmZzZXRYID0gMTQ1O1xuICAgICAgICAgICAgbGV0IG1heE9mZnNldFkgPSAxNDA7XG5cbiAgICAgICAgICAgIGlmKG9mZnNldC54ID4gLW1heE9mZnNldFggJiYgb2Zmc2V0LnggPCBtYXhPZmZzZXRYICYmIG9mZnNldC55ID4gLW1heE9mZnNldFkgJiYgb2Zmc2V0LnkgPCBtYXhPZmZzZXRZKSB7XG5cbiAgICAgICAgICAgICAgICAvL1dlIEZsaXAgdGhlIFggYW5kIFkgaGVyZSBiZWNhdXNlIHRoZSBjYXJkIGhhcyBhIHJvdGF0aW9uIG9mIDkwIGRlZ3JlZXMsIHdoaWNoIGZsaXBzIGl0cyBheGlzXG4gICAgICAgICAgICAgICAgY29pbkNhcmQuc2V0Um90YXRpb25ZKCgoKG9mZnNldC54ICogTWF0aC5QSSkgLyAzKSAvIDE4MCkpO1xuICAgICAgICAgICAgICAgIGNvaW5DYXJkLnNldFJvdGF0aW9uWCgoKChvZmZzZXQueSAqIE1hdGguUEkpIC8gNCkgLyAxODApKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBjb2luQ2FyZC5zZXRSb3RhdGlvblkoMCwge1xuICAgICAgICAgICAgICAgICAgICBjdXJ2ZTogQ3VydmVzLnNwcmluZyxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDEwMDBcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvaW5DYXJkLnNldFJvdGF0aW9uWCgwLCB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnZlOiBDdXJ2ZXMuc3ByaW5nLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRHeXJvc2NvcGVFdmVudCgpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZW9yaWVudGF0aW9uJywgKGUpID0+IHtcbiAgICAgICAgICAgIGxldCByb3RYID0gZS5iZXRhICogLU1hdGguUEkvMTgwO1xuICAgICAgICAgICAgbGV0IHJvdFkgPSBlLmdhbW1hICogTWF0aC5QSS8xODA7XG4gICAgICAgICAgICB0aGlzLmNhcmRzWzRdLmhhbHRSb3RhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5jYXJkc1s0XS5zZXRSb3RhdGlvbihyb3RYLCByb3RZLCAoOTAgKiBNYXRoLlBJIC8gMTgwKSwge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJUaW1lbGluZVBhdGhzKCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDsgLy9Vc2VkIGluIHRpbWVsaW5lIHNjcnViYmluZ1xuXG4gICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFJJTkdTICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmhhc093blByb3BlcnR5KCdpbml0aWFsaXplZFJpbmdzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplZFJpbmdzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuaW5pdGlhbGl6ZWRSaW5nICYmIHRpbWUgPj0gdGhpcy50aW1lLnN0ZXAzIC0gNTApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkUmluZ3MoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplZFJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgWzAsIDBdLFxuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuZW5kLCB0aGlzLnRpbWUuZW5kXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLSBCTFVFIFNDUkVFTiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ibHVlU2NyZWVuLnNldFBvc2l0aW9uKC4uLnZhbCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIFswLCB3aW5kb3cuaW5uZXJIZWlnaHRdXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAzLCBbMCwgd2luZG93LmlubmVySGVpZ2h0XV0sXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNSwgWzAsIDBdXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmhhc093blByb3BlcnR5KCdoYXNSaXNlbicpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFzUmlzZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZih0aW1lID49IHRoaXMudGltZS5zdGVwMyAmJiB0aW1lIDw9IHRoaXMudGltZS5zdGVwNSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3Jpc2luZ1RpZGUnLCB0aGlzLmJsdWVTY3JlZW4uZ2V0UG9zaXRpb25ZKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgWzAsIDBdLFxuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuZW5kLCB0aGlzLnRpbWUuZW5kXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLSBUT1AgVEVYVCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvcFRleHQuc2V0UG9zaXRpb24oLi4udmFsKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBbMCwgdGhpcy50b3BUZXh0LmdldFBvc2l0aW9uWSgpXV0sXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgWzAsIC0yMDBdXSAvLyBUaGUgZWxlbWVudCBpcyAyMDBweCB0YWxsLCB0aGlzIHB1dHMgaXQgb3V0IG9mIHZpZXdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b3BUZXh0LnNldE9wYWNpdHkoW3ZhbF0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIDFdLFxuICAgICAgICAgICAgICAgIFsodGhpcy50aW1lLnN0ZXAxIC8gMyksIDFdLCAvLyBUaW1pbmcgZGVsYXlcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCAwXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLSBIQU5EIC0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZC5zZXRQb3NpdGlvbiguLi52YWwpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIFswLCB0aGlzLmhhbmQuZ2V0UG9zaXRpb25ZKCldXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbMCwgLTc1XV0gLy8gVGhlIGVsZW1lbnQgaXMgNzVweCB0YWxsLCB0aGlzIG1vdmVzIGl0IG91dCBvZiB2aWV3IGF0IHRoZSB0b3BcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0gVEFHIExJTkUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdMaW5lLnNldFBvc2l0aW9uKC4uLnZhbCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgWzAsIHRoaXMudGFnTGluZS5nZXRQb3NpdGlvblkoKV1dLFxuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDQsIFswLCB0aGlzLnRhZ0xpbmUuZ2V0UG9zaXRpb25ZKCldXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA2LCBbMCwgNTBdXSwgLy8gVGhlIGVsZW1lbnQgaXMgMTAwcHggdGFsbCwgdGhpcyBwdXRzIGl0IG91dCBvZiB2aWV3XG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNywgWzAsIDQwXV0sXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwOCAtIDUwMCwgWzAsIC0yMDBdXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTUElOTklORyBSSU5HUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICAgICAgICBmb3IobGV0IGkgPSAwLCBqID0gdGhpcy5zcGlubmluZ1JpbmdzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgbGV0IGNvaW4gPSB0aGlzLnNwaW5uaW5nUmluZ3NbaV07XG4gICAgICAgICAgICBsZXQgc3RhcnRpbmdZUG9zID0gY29pbi5nZXRQb3NpdGlvblkoKTtcblxuICAgICAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICBjb2luLnNldFBvc2l0aW9uKC4uLnZhbCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIFswLCBzdGFydGluZ1lQb3NdXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNywgWzAsIHN0YXJ0aW5nWVBvc11dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA4LCBbMCwgRU5VTVMuQ09JTl9DRU5URVJdLCBDdXJ2ZXMuZWFzZU91dF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgICAgIGhhbmRsZXI6ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKCF0aGlzLmhhc093blByb3BlcnR5KCdoYXNMb2FkZWRSaW5ncycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhhc0xvYWRlZFJpbmdzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZighdGhpcy5oYXNMb2FkZWRSaW5ncyAmJiB0aW1lID49IHRoaXMudGltZS5zdGVwNykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdzcGluUmluZycsIHt9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFzTG9hZGVkUmluZ3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgICAgIFswLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5lbmQsIHRoaXMudGltZS5lbmRdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDT0lOIFRFWFQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29pbi5zZXRQb3NpdGlvbiguLi52YWwpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBbMCwgdGhpcy5jb2luLmdldFBvc2l0aW9uWSgpXV0sXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNyArIDUwLCBbMCwgdGhpcy5jb2luLmdldFBvc2l0aW9uWSgpXV0sXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwOCArIDUwLCBbMCwgd2luZG93LmlubmVySGVpZ2h0IC0gMTc1XSwgQ3VydmVzLmVhc2VPdXRdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEdFVCBZT1VSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRZb3Vycy5zZXRQb3NpdGlvbiguLi52YWwpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBbMCwgdGhpcy5nZXRZb3Vycy5nZXRQb3NpdGlvblkoKV1dLFxuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDcgKyA3NSwgWzAsIHRoaXMuZ2V0WW91cnMuZ2V0UG9zaXRpb25ZKCldXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA4ICsgNzUsIFswLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAxMjBdLCBDdXJ2ZXMuZWFzZU91dF1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0gUFJFIE9SREVSIC0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZU9yZGVyLnNldFBvc2l0aW9uKC4uLnZhbCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIFswLCB0aGlzLnByZU9yZGVyLmdldFBvc2l0aW9uWSgpXV0sXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNyArIDIwMCwgWzAsIHRoaXMucHJlT3JkZXIuZ2V0UG9zaXRpb25ZKCldXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA4ICsgMjAwLCBbMCwgd2luZG93LmlubmVySGVpZ2h0IC0gNjVdLCBDdXJ2ZXMuZWFzZU91dF1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ0FSRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAgICAgZm9yKGxldCBpID0gMCwgaiA9IHRoaXMuY2FyZHMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgY2FyZCA9IHRoaXMuY2FyZHNbaV07XG5cbiAgICAgICAgICAgIGxldCB0aW1lU2VnbWVudHMgPSB0aGlzLmdldENhcmRUaW1lU2VnbWVudHMoY2FyZCk7XG5cbiAgICAgICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5zZXRQb3NpdGlvbiguLi4oQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsIDogW3ZhbF0pKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhdGg6IHRpbWVTZWdtZW50cy5jYXJkUG9zaXRpb25cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQuc2V0U2NhbGUoLi4uKEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbCA6IFt2YWxdKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXRoOiB0aW1lU2VnbWVudHMuY2FyZFNjYWxlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXJkLnNldFJvdGF0aW9uKC4uLihBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwgOiBbdmFsXSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGF0aDogdGltZVNlZ21lbnRzLmNhcmRSb3RhdGlvblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5zZXRPcGFjaXR5KHZhbCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXRoOiB0aW1lU2VnbWVudHMuY2FyZE9wYWNpdHlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZih0aW1lID49IHRoaXMudGltZS5lbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDb2luU3ByaW5nRXZlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRHeXJvc2NvcGVFdmVudCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZVNoaW1tZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFswLCAwXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLmVuZCwgdGhpcy50aW1lLmVuZF1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0Q2FyZFRpbWVTZWdtZW50cyhjYXJkKSB7XG4gICAgICAgIGxldCBjdXJyZW50UG9zaXRpb24gPSBbY2FyZC5tb2RlbC5wb3NpdGlvbi54LCBjYXJkLm1vZGVsLnBvc2l0aW9uLnksIGNhcmQubW9kZWwucG9zaXRpb24uel07XG4gICAgICAgIGxldCBjdXJyZW50Um90YXRpb24gPSBbY2FyZC5tb2RlbC5yb3RhdGlvbi54LCBjYXJkLm1vZGVsLnJvdGF0aW9uLnksIGNhcmQubW9kZWwucm90YXRpb24uel07XG4gICAgICAgIGxldCB0aW1lU2VnbWVudHMgPSB7XG4gICAgICAgICAgICBjYXJkU2NhbGU6IFtdLFxuICAgICAgICAgICAgY2FyZFJvdGF0aW9uOiBbXSxcbiAgICAgICAgICAgIGNhcmRPcGFjaXR5OiBbXSxcbiAgICAgICAgICAgIGNhcmRQb3NpdGlvbjogW11cbiAgICAgICAgfTtcblxuICAgICAgICB0aW1lU2VnbWVudHMuY2FyZFBvc2l0aW9uID0gW1xuICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgY3VycmVudFBvc2l0aW9uXSxcbiAgICAgICAgICAgIFsodGhpcy50aW1lLnN0ZXAxIC8gMiksIFswLCAyNTAsIGNhcmQubW9kZWwucG9zaXRpb24uel1dLFxuICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgWzAsIDc1LCBjYXJkLm1vZGVsLnBvc2l0aW9uLnpdXVxuICAgICAgICBdO1xuXG4gICAgICAgIHN3aXRjaChjYXJkLm1vZGVsLmkpIHtcbiAgICAgICAgICAgIGNhc2UgMDogLy9HSUZUXG4gICAgICAgICAgICAgICAgdGltZVNlZ21lbnRzLmNhcmRTY2FsZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgWy41LCAuNSwgLjVdXSxcbiAgICAgICAgICAgICAgICAgICAgWzMwMCwgWy41LCAuNSwgLjVdXSwgLy8gRGVsYXlcbiAgICAgICAgICAgICAgICAgICAgWyh0aGlzLnRpbWUuc3RlcDEgLyAyKSwgWzEsIDEsIDFdXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgWy41LCAuNSwgLjVdXVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgdGltZVNlZ21lbnRzLmNhcmRSb3RhdGlvbiA9IFtcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgY3VycmVudFJvdGF0aW9uXSxcbiAgICAgICAgICAgICAgICAgICAgWzMwMCwgY3VycmVudFJvdGF0aW9uXSwgLy8gRGVsYXlcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgWygzNjAgKiBNYXRoLlBJIC8gMTgwKSwgMCwgKC0yNzAgKiBNYXRoLlBJIC8gMTgwKV1dXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB0aW1lU2VnbWVudHMuY2FyZE9wYWNpdHkgPSBbXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIDFdLFxuICAgICAgICAgICAgICAgICAgICBbKHRoaXMudGltZS5zdGVwMSAtIDEpLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgMF1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOiAvLyBDUkVESVRcbiAgICAgICAgICAgICAgICB0aW1lU2VnbWVudHMuY2FyZFNjYWxlID0gW1xuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBbLjUsIC41LCAuNV1dLFxuICAgICAgICAgICAgICAgICAgICBbMjAwLCBbLjUsIC41LCAuNV1dLCAvLyBEZWxheVxuICAgICAgICAgICAgICAgICAgICBbKHRoaXMudGltZS5zdGVwMSAvIDIpLCBbMSwgMSwgMV1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbLjUsIC41LCAuNV1dXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB0aW1lU2VnbWVudHMuY2FyZFJvdGF0aW9uID0gW1xuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBjdXJyZW50Um90YXRpb25dLFxuICAgICAgICAgICAgICAgICAgICBbMjAwLCBjdXJyZW50Um90YXRpb25dLCAvLyBEZWxheVxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbKC0zNjAgKiBNYXRoLlBJIC8gMTgwKSwgMCwgKDkwICogTWF0aC5QSSAvIDE4MCldXVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgdGltZVNlZ21lbnRzLmNhcmRPcGFjaXR5ID0gW1xuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCAxXSxcbiAgICAgICAgICAgICAgICAgICAgWyh0aGlzLnRpbWUuc3RlcDEgLSAxKSwgMV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDEsIDBdXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjogLy9NRU1CRVJTSElQXG4gICAgICAgICAgICAgICAgdGltZVNlZ21lbnRzLmNhcmRTY2FsZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgWy41LCAuNSwgLjVdXSxcbiAgICAgICAgICAgICAgICAgICAgWzEwMCwgWy41LCAuNSwgLjVdXSwgLy8gRGVsYXlcbiAgICAgICAgICAgICAgICAgICAgWyh0aGlzLnRpbWUuc3RlcDEgLyAyKSwgWzEsIDEsIDFdXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgWy41LCAuNSwgLjVdXVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgdGltZVNlZ21lbnRzLmNhcmRSb3RhdGlvbiA9IFtcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgY3VycmVudFJvdGF0aW9uXSxcbiAgICAgICAgICAgICAgICAgICAgWzEwMCwgY3VycmVudFJvdGF0aW9uXSwgLy8gRGVsYXlcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgWygzNjAgKiBNYXRoLlBJIC8gMTgwKSwgMCwgKC0yNzAgKiBNYXRoLlBJIC8gMTgwKV1dXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB0aW1lU2VnbWVudHMuY2FyZE9wYWNpdHkgPSBbXG4gICAgICAgICAgICAgICAgICAgIFswLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgWyh0aGlzLnRpbWUuc3RlcDEgLSAxKSwgMV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDEsIDBdXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzogLy9ERUJJVFxuICAgICAgICAgICAgICAgIHRpbWVTZWdtZW50cy5jYXJkU2NhbGUgPSBbXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIFsuNSwgLjUsIC41XV0sXG4gICAgICAgICAgICAgICAgICAgIFsodGhpcy50aW1lLnN0ZXAxIC8gMiksIFsxLCAxLCAxXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDEsIFsuNSwgLjUsIC41XV1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIHRpbWVTZWdtZW50cy5jYXJkUm90YXRpb24gPSBbXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIGN1cnJlbnRSb3RhdGlvbl0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDEsIFsoLTM2MCAqIE1hdGguUEkgLyAxODApLCAwLCAoOTAgKiBNYXRoLlBJIC8gMTgwKV1dXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB0aW1lU2VnbWVudHMuY2FyZE9wYWNpdHkgPSBbXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIDFdLFxuICAgICAgICAgICAgICAgICAgICBbKHRoaXMudGltZS5zdGVwMSAtIDEpLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgMF1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OiAvL0NPSU5cbiAgICAgICAgICAgICAgICB0aW1lU2VnbWVudHMuY2FyZFNjYWxlID0gW1xuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBbLjUsIC41LCAuNV1dLFxuICAgICAgICAgICAgICAgICAgICBbKHRoaXMudGltZS5zdGVwMSAvIDIpLCBbMSwgMSwgMV1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbLjUsIC41LCAuNV1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAyLCBbLjMsIC4zLCAuM11dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAzLCBbLjUsIC41LCAuNV1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAzICsgNTAsIFsuNSwgLjUsIC41XV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDQsIFsuNjIsIC42MiwgLjYyXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDUsIFsuNzUsIC43NSwgLjc1XV1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIHRpbWVTZWdtZW50cy5jYXJkUm90YXRpb24gPSBbXG4gICAgICAgICAgICAgICAgICAgIFswLCBjdXJyZW50Um90YXRpb25dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbKC0zNjAgKiBNYXRoLlBJIC8gMTgwKSwgMCwgKDkwICogTWF0aC5QSSAvIDE4MCldXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMiwgWygtNTQwICogTWF0aC5QSSAvIDE4MCksIDAsICg5MCAqIE1hdGguUEkgLyAxODApXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDMsIFsoLTM2MCAqIE1hdGguUEkgLyAxODApLCAwLCAoOTAgKiBNYXRoLlBJIC8gMTgwKV1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAzICsgNTAsIFsoLTM2MCAqIE1hdGguUEkgLyAxODApLCAwLCAoOTAgKiBNYXRoLlBJIC8gMTgwKV1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA0LCBbKC0yNzAgKiBNYXRoLlBJIC8gMTgwKSwgMCwgKDkwICogTWF0aC5QSSAvIDE4MCldXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNSwgWygwICogTWF0aC5QSSAvIDE4MCksIDAsICg5MCAqIE1hdGguUEkgLyAxODApXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDYsIFsoMTUgKiBNYXRoLlBJIC8gMTgwKSwgMCwgKDkwICogTWF0aC5QSSAvIDE4MCldXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNywgWygwICogTWF0aC5QSSAvIDE4MCksIDAsICg5MCAqIE1hdGguUEkgLyAxODApXV1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIHRpbWVTZWdtZW50cy5jYXJkT3BhY2l0eSA9IFtcbiAgICAgICAgICAgICAgICAgICAgWzAsIDBdLFxuICAgICAgICAgICAgICAgICAgICBbKHRoaXMudGltZS5zdGVwMSAtIDEpLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgMV1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIHRpbWVTZWdtZW50cy5jYXJkUG9zaXRpb24gPSBbXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIGN1cnJlbnRQb3NpdGlvbl0sXG4gICAgICAgICAgICAgICAgICAgIFsodGhpcy50aW1lLnN0ZXAxIC8gMiksIFswLCAyNTAsIDBdXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgWzAsIDc1LCAwXSwgQ3VydmVzLm91dEJhY2tdLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAzLCBbMCwgNzUsIDBdXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMyArIDUwLCBbMCwgNzUsIDBdXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNCwgWzAsIDMwMCwgMF1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA1LCBbMCwgMjAwLCAwXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDcsIFswLCAyMDAsIDBdXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwOCAtIDUwMCwgWzAsIDUwLCAwXSwgQ3VydmVzLmVhc2VPdXRdXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aW1lU2VnbWVudHM7XG4gICAgfVxuXG4gICAgc2NydWJUaW1lbGluZUdlc3R1cmUoZSkge1xuICAgICAgICBpZih0aGlzLmN1cnJlbnRUaW1lID49IDAgJiYgdGhpcy5jdXJyZW50VGltZSA8PSB0aGlzLnRpbWUuZW5kKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lICs9IGUuY2VudGVyRGVsdGEueSAqIC00O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5jdXJyZW50VGltZSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5jdXJyZW50VGltZSA+IHRoaXMudGltZS5lbmQpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLnRpbWUuZW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50aW1lbGluZS5zZXQodGhpcy5jdXJyZW50VGltZSk7XG4gICAgfVxuXG4gICAgc2NydWJUaW1lbGluZShtb3VzZU1vdmVtZW50KSB7XG4gICAgICAgIC8vIDQgaXMgdXNlZCB0byBzcGVlZCB1cCB0aGUgc2NydWJiaW5nIHJhdGUgYnkgYSBmYWN0b3Igb2YgNCBmcm9tIHRoZSBnZXN0dXJlIG1vdmVtZW50XG4gICAgICAgIGlmKHRoaXMuY3VycmVudFRpbWUgPj0gMCAmJiB0aGlzLmN1cnJlbnRUaW1lIDw9IHRoaXMudGltZS5lbmQpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWUgKz0gbW91c2VNb3ZlbWVudC55ICogNDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vVGhlIHByZXZpb3VzIG1hdGggY2FuIGxlYXZlIHZhbHVlcyB0aGF0IGFyZSBvdXRzaWRlIG9mIHRoZSB3b3JraW5nIHZhbHVlIHJhbmdlXG4gICAgICAgIGlmKHRoaXMuY3VycmVudFRpbWUgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMuY3VycmVudFRpbWUgPiB0aGlzLnRpbWUuZW5kKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy50aW1lLmVuZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRpbWVsaW5lLnNldCh0aGlzLmN1cnJlbnRUaW1lKTtcbiAgICB9XG59XG5cbmNvbnN0IHJvb3ROb2RlICAgPSBGYW1vdXNQbGF0Zm9ybS5jb3JlLkZhbW91cy5jcmVhdGVDb250ZXh0KCdib2R5Jyk7XG5sZXQgY2FtZXJhID0gbmV3IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuQ2FtZXJhKHJvb3ROb2RlKTtcbmNhbWVyYS5zZXREZXB0aCgyMDAwMCk7XG5cbndpbmRvdy5hcHAgPSBuZXcgQXBwKHJvb3ROb2RlLmFkZENoaWxkKCksIHtcbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IEZhbW91c0VuZ2luZSBmcm9tICdmYW1vdXMtY3JlYXRpdmUvc2NhZmZvbGRpbmcvRmFtb3VzRW5naW5lJztcbkZhbW91c0VuZ2luZS5pbml0KCk7XG5cbnJlcXVpcmUoJ2JhYmVsaWZ5L3BvbHlmaWxsJyk7XG5yZXF1aXJlKCcuL2FwcC9pbmRleCcpO1xuIl19
