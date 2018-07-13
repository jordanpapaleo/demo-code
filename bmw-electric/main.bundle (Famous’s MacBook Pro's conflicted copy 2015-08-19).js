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

},{"core-js/shim":87,"regenerator/runtime":88}],2:[function(require,module,exports){
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
},{"./$":22,"./$.wks":38}],7:[function(require,module,exports){
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
  , isExtensible = Object.isExtensible || isObject
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
  if(!has(it, ID)){
    // can't set id to frozen object
    if(!isExtensible(it))return 'F';
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
    require('./$.mix')(C.prototype, {
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
},{"./$":22,"./$.assert":4,"./$.ctx":11,"./$.for-of":15,"./$.iter":21,"./$.iter-define":19,"./$.mix":24,"./$.uid":36}],8:[function(require,module,exports){
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
  , isExtensible = Object.isExtensible || isObject
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
    require('./$.mix')(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        if(!isExtensible(key))return leakStore(this)['delete'](key);
        return _has(key, WEAK) && _has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        if(!isExtensible(key))return leakStore(this).has(key);
        return _has(key, WEAK) && _has(key[WEAK], this[ID]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    if(!isExtensible(assert.obj(key))){
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
},{"./$":22,"./$.array-methods":3,"./$.assert":4,"./$.for-of":15,"./$.mix":24,"./$.uid":36}],10:[function(require,module,exports){
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
    if($.FW){
      var method = proto[KEY];
      require('./$.redef')(proto, KEY, function(a, b){
        var result = method.call(this, a === 0 ? 0 : a, b);
        return CHAIN ? this : result;
      });
    }
  }
  if(!$.isFunction(C) || !(IS_WEAK || !BUGGY && proto.forEach && proto.entries)){
    // create collection constructor
    C = common.getConstructor(NAME, IS_MAP, ADDER);
    require('./$.mix')(C.prototype, methods);
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
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.for-of":15,"./$.iter":21,"./$.iter-detect":20,"./$.mix":24,"./$.redef":27,"./$.species":30}],11:[function(require,module,exports){
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
  , isFunction = $.isFunction
  , $redef     = require('./$.redef');
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
    , isProto  = type & $def.P
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
    else exp = isProto && isFunction(out) ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own)$redef(target, key, out);
    // export
    if(exports[key] != out)$.hide(exports, key, exp);
    if(isProto)(exports.prototype || (exports.prototype = {}))[key] = out;
  }
}
module.exports = $def;
},{"./$":22,"./$.redef":27}],13:[function(require,module,exports){
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
  , $redef          = require('./$.redef')
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
      if(!(key in proto))$redef(proto, key, methods[key]);
    } else $def($def.P + $def.F * $iter.BUGGY, NAME, methods);
  }
};
},{"./$":22,"./$.cof":6,"./$.def":12,"./$.iter":21,"./$.redef":27,"./$.wks":38}],20:[function(require,module,exports){
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
},{"./$.wks":38}],21:[function(require,module,exports){
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
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.wks":38}],22:[function(require,module,exports){
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
var $redef = require('./$.redef');
module.exports = function(target, src){
  for(var key in src)$redef(target, key, src[key]);
  return target;
};
},{"./$.redef":27}],25:[function(require,module,exports){
var $            = require('./$')
  , assertObject = require('./$.assert').obj;
module.exports = function ownKeys(it){
  assertObject(it);
  var keys       = $.getNames(it)
    , getSymbols = $.getSymbols;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"./$":22,"./$.assert":4}],26:[function(require,module,exports){
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
},{"./$":22,"./$.assert":4,"./$.invoke":17}],27:[function(require,module,exports){
var $   = require('./$')
  , tpl = String({}.hasOwnProperty)
  , SRC = require('./$.uid').safe('src')
  , _toString = Function.toString;

function $redef(O, key, val, safe){
  if($.isFunction(val)){
    var base = O[key];
    $.hide(val, SRC, base ? String(base) : tpl.replace(/hasOwnProperty/, String(key)));
  }
  if(O === $.g){
    O[key] = val;
  } else {
    if(!safe)delete O[key];
    $.hide(O, key, val);
  }
}

// add fake Function#toString for correct work wrapped methods / constructors
// with methods similar to LoDash isNative
$redef(Function.prototype, 'toString', function toString(){
  return $.has(this, SRC) ? this[SRC] : _toString.call(this);
});

$.core.inspectSource = function(it){
  return _toString.call(it);
};

module.exports = $redef;
},{"./$":22,"./$.uid":36}],28:[function(require,module,exports){
'use strict';
module.exports = function(regExp, replace, isStatic){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  };
};
},{}],29:[function(require,module,exports){
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
},{"./$":22,"./$.assert":4,"./$.ctx":11}],30:[function(require,module,exports){
var $       = require('./$')
  , SPECIES = require('./$.wks')('species');
module.exports = function(C){
  if($.DESC && !(SPECIES in C))$.setDesc(C, SPECIES, {
    configurable: true,
    get: $.that
  });
};
},{"./$":22,"./$.wks":38}],31:[function(require,module,exports){
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
},{"./$":22}],32:[function(require,module,exports){
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
},{"./$":22,"./$.string-repeat":33}],33:[function(require,module,exports){
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
},{"./$":22}],34:[function(require,module,exports){
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
},{"./$":22,"./$.cof":6,"./$.ctx":11,"./$.dom-create":13,"./$.invoke":17}],35:[function(require,module,exports){
module.exports = function(exec){
  try {
    exec();
    return false;
  } catch(e){
    return true;
  }
};
},{}],36:[function(require,module,exports){
var sid = 0;
function uid(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++sid + Math.random()).toString(36));
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":22}],37:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var $           = require('./$')
  , UNSCOPABLES = require('./$.wks')('unscopables');
if($.FW && !(UNSCOPABLES in []))$.hide(Array.prototype, UNSCOPABLES, {});
module.exports = function(key){
  if($.FW)[][UNSCOPABLES][key] = true;
};
},{"./$":22,"./$.wks":38}],38:[function(require,module,exports){
var global = require('./$').g
  , store  = {};
module.exports = function(name){
  return store[name] || (store[name] =
    global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};
},{"./$":22,"./$.uid":36}],39:[function(require,module,exports){
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
  , html             = $.html
  , A                = []
  , _slice           = A.slice
  , _join            = A.join
  , classof          = cof.classof
  , has              = $.has
  , defineProperty   = $.setDesc
  , getOwnDescriptor = $.getDesc
  , defineProperties = $.setDescs
  , isFunction       = $.isFunction
  , toObject         = $.toObject
  , toLength         = $.toLength
  , toIndex          = $.toIndex
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
  html.appendChild(iframe);
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
      ~$indexOf(result, key) || result.push(key);
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
      , partArgs = _slice.call(arguments, 1);
    function bound(/* args... */){
      var args = partArgs.concat(_slice.call(arguments));
      return invoke(fn, args, this instanceof bound ? $.create(fn.prototype) : that);
    }
    if(fn.prototype)bound.prototype = fn.prototype;
    return bound;
  }
});

// Fix for not array-like ES3 string and DOM objects
if(!(0 in Object('z') && 'z'[0] == 'z')){
  $.ES5Object = function(it){
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
}

var buggySlice = true;
try {
  if(html)_slice.call(html);
  buggySlice = false;
} catch(e){ /* empty */ }

$def($def.P + $def.F * buggySlice, 'Array', {
  slice: function slice(begin, end){
    var len   = toLength(this.length)
      , klass = cof(this);
    end = end === undefined ? len : end;
    if(klass == 'Array')return _slice.call(this, begin, end);
    var start  = toIndex(begin, len)
      , upTo   = toIndex(end, len)
      , size   = toLength(upTo - start)
      , cloned = Array(size)
      , i      = 0;
    for(; i < size; i++)cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});

$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
  join: function join(){
    return _join.apply($.ES5Object(this), arguments);
  }
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
  indexOf: function indexOf(el /*, fromIndex = 0 */){
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
},{"./$":22,"./$.array-includes":2,"./$.array-methods":3,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.dom-create":13,"./$.invoke":17,"./$.replacer":28,"./$.throws":35,"./$.uid":36}],40:[function(require,module,exports){
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
},{"./$":22,"./$.def":12,"./$.unscope":37}],41:[function(require,module,exports){
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
},{"./$":22,"./$.def":12,"./$.unscope":37}],42:[function(require,module,exports){
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
},{"./$.array-methods":3,"./$.def":12,"./$.unscope":37}],43:[function(require,module,exports){
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
},{"./$.array-methods":3,"./$.def":12,"./$.unscope":37}],44:[function(require,module,exports){
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
},{"./$":22,"./$.ctx":11,"./$.def":12,"./$.iter":21,"./$.iter-call":18,"./$.iter-detect":20}],45:[function(require,module,exports){
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
},{"./$":22,"./$.iter":21,"./$.iter-define":19,"./$.uid":36,"./$.unscope":37}],46:[function(require,module,exports){
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
},{"./$.def":12}],47:[function(require,module,exports){
require('./$.species')(Array);
},{"./$.species":30}],48:[function(require,module,exports){
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
},{"./$":22,"./$.wks":38}],49:[function(require,module,exports){
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
},{"./$":22}],50:[function(require,module,exports){
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
},{"./$.collection":10,"./$.collection-strong":7}],51:[function(require,module,exports){
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
      , i    = 0
      , len  = arguments.length
      , args = Array(len)
      , larg = 0
      , arg;
    while(i < len){
      arg = args[i] = abs(arguments[i++]);
      if(arg == Infinity)return Infinity;
      if(arg > larg)larg = arg;
    }
    larg = larg || 1;
    while(len--)sum += pow(args[len] / larg, 2);
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
},{"./$.def":12}],52:[function(require,module,exports){
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
  require('./$.redef')($.g, NUMBER, $Number);
}
},{"./$":22,"./$.redef":27}],53:[function(require,module,exports){
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
},{"./$":22,"./$.def":12}],54:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":5,"./$.def":12}],55:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $def = require('./$.def');
$def($def.S, 'Object', {
  is: function is(x, y){
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }
});
},{"./$.def":12}],56:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def = require('./$.def');
$def($def.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.def":12,"./$.set-proto":29}],57:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
$.each.call(('freeze,seal,preventExtensions,isFrozen,isSealed,isExtensible,' +
  'getOwnPropertyDescriptor,getPrototypeOf,keys,getOwnPropertyNames').split(',')
, function(KEY, ID){
  var fn     = ($.core.Object || {})[KEY] || Object[KEY]
    , forced = 0
    , method = {};
  method[KEY] = ID == 0 ? function freeze(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 1 ? function seal(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 2 ? function preventExtensions(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 3 ? function isFrozen(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 4 ? function isSealed(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 5 ? function isExtensible(it){
    return isObject(it) ? fn(it) : false;
  } : ID == 6 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : ID == 7 ? function getPrototypeOf(it){
    return fn(Object($.assertDefined(it)));
  } : ID == 8 ? function keys(it){
    return fn(toObject(it));
  } : function getOwnPropertyNames(it){
    return fn(toObject(it));
  };
  try {
    fn('z');
  } catch(e){
    forced = 1;
  }
  $def($def.S + $def.F * forced, 'Object', method);
});
},{"./$":22,"./$.def":12}],58:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var cof = require('./$.cof')
  , tmp = {};
tmp[require('./$.wks')('toStringTag')] = 'z';
if(require('./$').FW && cof(tmp) != 'z'){
  require('./$.redef')(Object.prototype, 'toString', function toString(){
    return '[object ' + cof.classof(this) + ']';
  }, true);
}
},{"./$":22,"./$.cof":6,"./$.redef":27,"./$.wks":38}],59:[function(require,module,exports){
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
  require('./$.mix')(P.prototype, {
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
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.ctx":11,"./$.def":12,"./$.for-of":15,"./$.iter-detect":20,"./$.mix":24,"./$.set-proto":29,"./$.species":30,"./$.task":34,"./$.uid":36,"./$.wks":38}],60:[function(require,module,exports){
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
},{"./$":22,"./$.assert":4,"./$.def":12,"./$.iter":21,"./$.own-keys":25,"./$.set-proto":29,"./$.uid":36,"./$.wks":38}],61:[function(require,module,exports){
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
    require('./$.redef')($.g, 'RegExp', $RegExp);
  }
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
    configurable: true,
    get: require('./$.replacer')(/^.*\/(\w*)$/, '$1')
  });
}
require('./$.species')($RegExp);
},{"./$":22,"./$.cof":6,"./$.redef":27,"./$.replacer":28,"./$.species":30}],62:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./$.collection":10,"./$.collection-strong":7}],63:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(false);
$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos){
    return $at(this, pos);
  }
});
},{"./$.def":12,"./$.string-at":31}],64:[function(require,module,exports){
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
},{"./$":22,"./$.cof":6,"./$.def":12,"./$.throws":35}],65:[function(require,module,exports){
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
},{"./$":22,"./$.def":12}],66:[function(require,module,exports){
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
},{"./$":22,"./$.cof":6,"./$.def":12}],67:[function(require,module,exports){
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
},{"./$":22,"./$.iter":21,"./$.iter-define":19,"./$.string-at":31,"./$.uid":36}],68:[function(require,module,exports){
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
},{"./$":22,"./$.def":12}],69:[function(require,module,exports){
var $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./$.string-repeat')
});
},{"./$.def":12,"./$.string-repeat":33}],70:[function(require,module,exports){
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
},{"./$":22,"./$.cof":6,"./$.def":12,"./$.throws":35}],71:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $        = require('./$')
  , setTag   = require('./$.cof').set
  , uid      = require('./$.uid')
  , $def     = require('./$.def')
  , $redef   = require('./$.redef')
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
  , _propertyIsEnumerable = {}.propertyIsEnumerable
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
      D = $create(D, {enumerable: desc(0, false)});
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
function propertyIsEnumerable(key){
  var E = _propertyIsEnumerable.call(this, key);
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
    ? E : true;
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
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor');
    return wrap(uid(arguments[0]));
  };
  $redef($Symbol.prototype, 'toString', function(){
    return this[TAG];
  });

  $.create     = create;
  $.setDesc    = defineProperty;
  $.getDesc    = getOwnPropertyDescriptor;
  $.setDescs   = defineProperties;
  $.getNames   = getOwnPropertyNames;
  $.getSymbols = getOwnPropertySymbols;

  if($.DESC && $.FW)$redef(Object.prototype, 'propertyIsEnumerable', propertyIsEnumerable, true);
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
},{"./$":22,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.enum-keys":14,"./$.keyof":23,"./$.redef":27,"./$.uid":36,"./$.wks":38}],72:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , weak      = require('./$.collection-weak')
  , leakStore = weak.leakStore
  , ID        = weak.ID
  , WEAK      = weak.WEAK
  , has       = $.has
  , isObject  = $.isObject
  , isExtensible = Object.isExtensible || isObject
  , tmp       = {};

// 23.3 WeakMap Objects
var WeakMap = require('./$.collection')('WeakMap', {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      if(!isExtensible(key))return leakStore(this).get(key);
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
    var proto  = WeakMap.prototype
      , method = proto[key];
    require('./$.redef')(proto, key, function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && !isExtensible(a)){
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
},{"./$":22,"./$.collection":10,"./$.collection-weak":9,"./$.redef":27}],73:[function(require,module,exports){
'use strict';
var weak = require('./$.collection-weak');

// 23.4 WeakSet Objects
require('./$.collection')('WeakSet', {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"./$.collection":10,"./$.collection-weak":9}],74:[function(require,module,exports){
// https://github.com/domenic/Array.prototype.includes
var $def      = require('./$.def')
  , $includes = require('./$.array-includes')(true);
$def($def.P, 'Array', {
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments[1]);
  }
});
require('./$.unscope')('includes');
},{"./$.array-includes":2,"./$.def":12,"./$.unscope":37}],75:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Map');
},{"./$.collection-to-json":8}],76:[function(require,module,exports){
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
},{"./$":22,"./$.def":12,"./$.own-keys":25}],77:[function(require,module,exports){
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
},{"./$":22,"./$.def":12}],78:[function(require,module,exports){
// https://gist.github.com/kangax/9698100
var $def = require('./$.def');
$def($def.S, 'RegExp', {
  escape: require('./$.replacer')(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
});
},{"./$.def":12,"./$.replacer":28}],79:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Set');
},{"./$.collection-to-json":8}],80:[function(require,module,exports){
// https://github.com/mathiasbynens/String.prototype.at
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(true);
$def($def.P, 'String', {
  at: function at(pos){
    return $at(this, pos);
  }
});
},{"./$.def":12,"./$.string-at":31}],81:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  lpad: function lpad(n){
    return $pad(this, n, arguments[1], true);
  }
});
},{"./$.def":12,"./$.string-pad":32}],82:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  rpad: function rpad(n){
    return $pad(this, n, arguments[1], false);
  }
});
},{"./$.def":12,"./$.string-pad":32}],83:[function(require,module,exports){
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
},{"./$":22,"./$.ctx":11,"./$.def":12}],84:[function(require,module,exports){
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
},{"./$":22,"./$.iter":21,"./$.wks":38,"./es6.array.iterator":45}],85:[function(require,module,exports){
var $def  = require('./$.def')
  , $task = require('./$.task');
$def($def.G + $def.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./$.def":12,"./$.task":34}],86:[function(require,module,exports){
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
},{"./$":22,"./$.def":12,"./$.invoke":17,"./$.partial":26}],87:[function(require,module,exports){
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

},{"./modules/$":22,"./modules/es5":39,"./modules/es6.array.copy-within":40,"./modules/es6.array.fill":41,"./modules/es6.array.find":43,"./modules/es6.array.find-index":42,"./modules/es6.array.from":44,"./modules/es6.array.iterator":45,"./modules/es6.array.of":46,"./modules/es6.array.species":47,"./modules/es6.function.has-instance":48,"./modules/es6.function.name":49,"./modules/es6.map":50,"./modules/es6.math":51,"./modules/es6.number.constructor":52,"./modules/es6.number.statics":53,"./modules/es6.object.assign":54,"./modules/es6.object.is":55,"./modules/es6.object.set-prototype-of":56,"./modules/es6.object.statics-accept-primitives":57,"./modules/es6.object.to-string":58,"./modules/es6.promise":59,"./modules/es6.reflect":60,"./modules/es6.regexp":61,"./modules/es6.set":62,"./modules/es6.string.code-point-at":63,"./modules/es6.string.ends-with":64,"./modules/es6.string.from-code-point":65,"./modules/es6.string.includes":66,"./modules/es6.string.iterator":67,"./modules/es6.string.raw":68,"./modules/es6.string.repeat":69,"./modules/es6.string.starts-with":70,"./modules/es6.symbol":71,"./modules/es6.weak-map":72,"./modules/es6.weak-set":73,"./modules/es7.array.includes":74,"./modules/es7.map.to-json":75,"./modules/es7.object.get-own-property-descriptors":76,"./modules/es7.object.to-array":77,"./modules/es7.regexp.escape":78,"./modules/es7.set.to-json":79,"./modules/es7.string.at":80,"./modules/es7.string.lpad":81,"./modules/es7.string.rpad":82,"./modules/js.array.statics":83,"./modules/web.dom.iterable":84,"./modules/web.immediate":85,"./modules/web.timers":86}],88:[function(require,module,exports){
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
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
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

},{}],89:[function(require,module,exports){
module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":1}],90:[function(require,module,exports){
module.exports = require("babel-core/polyfill");

},{"babel-core/polyfill":89}],91:[function(require,module,exports){
module.exports = function (css, customDocument) {
  var doc = customDocument || document;
  if (doc.createStyleSheet) {
    var sheet = doc.createStyleSheet()
    sheet.cssText = css;
    return sheet.ownerNode;
  } else {
    var head = doc.getElementsByTagName('head')[0],
        style = doc.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }

    head.appendChild(style);
    return style;
  }
};

module.exports.byUrl = function(url) {
  if (document.createStyleSheet) {
    return document.createStyleSheet(url).ownerNode;
  } else {
    var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;

    head.appendChild(link);
    return link;
  }
};

},{}],92:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Curves = FamousPlatform.transitions.Curves;
var FamousEngine = FamousPlatform.core.FamousEngine;
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
        FamousEngine.requestUpdateOnNextTick(this);
        this.currentTime.set(time, transition, function () {
          _this.inTransition = false;
          FamousEngine.requestUpdateOnNextTick(_this);
          if (callback) {
            callback();
          }
        });
      } else {
        this.currentTime.set(time);
        this.inTransition = false;
        FamousEngine.requestUpdateOnNextTick(this);
      }
    }
  }, {
    key: "onUpdate",
    value: function onUpdate(time) {
      // go through the pathSet, and basically execute the function

      time = this.currentTime.get() * this.timescale;

      for (var i = 0; i < this.pathSet.length; i++) {
        var pathData = this.pathSet[i];

        for (var j = 0; j < pathData.path.length; j++) {
          var res = [];
          var currStep = pathData.path[j];
          var nextStep = pathData.path[j + 1];

          // currently mid path, calculate and apply.
          if (nextStep && currStep[0] <= time && nextStep[0] >= time) {
            var percentDone = (time - currStep[0]) / (nextStep[0] - currStep[0]);
            var state = currStep[2] ? currStep[2](percentDone) : Curves.linear(percentDone);

            if (currStep[1] instanceof Array) {
              for (var k = 0; k < currStep[1].length; k++) {
                res[k] = currStep[1][k] + (nextStep[1][k] - currStep[1][k]) * state;
              }
            } else {
              res = currStep[1] + (nextStep[1] - currStep[1]) * state;
            }
            pathData.handler(res);
          }

          // we are passed last step, set object to final state.
          if (!nextStep && currStep[0] < time) {
            pathData.handler(currStep[1]);
          }
        }
      }

      if (this.inTransition) {
        FamousEngine.requestUpdateOnNextTick(this);
      }
    }
  }]);

  return Timeline;
})();

exports["default"] = Timeline;
module.exports = exports["default"];

},{}],93:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Align = FamousPlatform.components.Align;
var FamousEngine = FamousPlatform.core.FamousEngine;
var MountPoint = FamousPlatform.components.MountPoint;
var Opacity = FamousPlatform.components.Opacity;
var Origin = FamousPlatform.components.Origin;
var Position = FamousPlatform.components.Position;
var Rotation = FamousPlatform.components.Rotation;
var Scale = FamousPlatform.components.Scale;
var Size = FamousPlatform.components.Size;

var radiansMultiplier = Math.PI / 180;
var degreesMultiplier = 180 / Math.PI;

/**
 * Converts degrees to radians.
 * @method  toRadians
 * @class   Modifier
 * @private
 * @param   {Number}  degrees  The degree value to convert.
 * @return  {Number}  The converted value in radians.
 */
function toRadians(degrees) {
  if (degrees === undefined) return null;
  return degrees * radiansMultiplier;
}

/**
 * Converts radians to degrees.
 * @method  toRadians
 * @class   Modifier
 * @private
 * @param   {Number}  radians  The radian value to convert.
 * @return  {Number}  The converted value in degrees.
 */
function toDegrees(radians) {
  if (radians === undefined) return null;
  return radians * degreesMultiplier;
}

function noConversion(value) {
  return value;
}

var Modifier = (function () {
  /**
   * Base class which contains all modifiers and contains no visual components.
   * @method  constructor
   * @class   Modifier
   * @param   {Node}    node                  The {@link Node} to attach this Modifier to.
   * @param   {Object}  <options>             Optional options.
   * @param   {Object}  <options.useDegrees>  Accept degrees when calling rotation methods, otherwise use radians.
   */

  function Modifier(node) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Modifier);

    this.node = node;
    this.options = options;
    this.id = this.node.getLocation();
    if (options.useDegrees) {
      this.setRotationVal = toRadians;
      this.getRotationVal = toDegrees;
    } else {
      this.setRotationVal = noConversion;
      this.getRotationVal = noConversion;
    }
  }

  _createClass(Modifier, [{
    key: "getChildren",

    // ---------------------------------------------------------------------------
    // Getter functions for this.node
    value: function getChildren() {
      return this.node.getChildren();
    }
  }, {
    key: "getComputedValue",
    value: function getComputedValue() {
      return this.getComputedValue();
    }
  }, {
    key: "getId",
    value: function getId() {
      return this.node.getLocation();
    }
  }, {
    key: "getParent",
    value: function getParent() {
      return this.node.getParent();
    }
  }, {
    key: "getValue",
    value: function getValue() {
      return this.node.getValue();
    }
  }, {
    key: "isMounted",

    // ---------------------------------------------------------------------------
    // State info for this.node
    value: function isMounted() {
      return this.node.isMounted();
    }
  }, {
    key: "isShown",
    value: function isShown() {
      return this.node.isShown();
    }
  }, {
    key: "addChild",

    // ---------------------------------------------------------------------------
    // Scene graph modifiers
    value: function addChild(child) {
      return this.node.addChild(child);
    }
  }, {
    key: "removeChild",
    value: function removeChild(child) {
      return this.node.removeChild(child);
    }
  }, {
    key: "attachTo",

    // Attach this node and it's subtree by setting it as a child of the passed in parent.
    value: function attachTo(parent) {
      parent.addChild(this.node);
      this.node.show();
      return this;
    }
  }, {
    key: "detach",

    // Detach this node from the scene graph by removing it as a child of its parent.
    value: function detach() {
      this.getParent().removeChild(this.node);
      return this;
    }
  }, {
    key: "hide",
    value: function hide() {
      this.node.hide();
      return this;
    }
  }, {
    key: "show",
    value: function show() {
      this.node.show();
      return this;
    }
  }, {
    key: "requestUpdate",

    // ---------------------------------------------------------------------------
    // Update functions for this.node
    value: function requestUpdate(requester) {
      FamousEngine.requestUpdate(requester || this);
      return this;
    }
  }, {
    key: "requestUpdateOnNextTick",
    value: function requestUpdateOnNextTick(requester) {
      FamousEngine.requestUpdateOnNextTick(requester || this);
      return this;
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
      var val = this.rotation.getValue();
      val.x = this.getRotationVal(val.x);
      val.y = this.getRotationVal(val.y);
      val.z = this.getRotationVal(val.z);
      return val;
    }
  }, {
    key: "getRotationX",
    value: function getRotationX() {
      this.validateRotation();
      return this.getRotationVal(this.rotation.getX());
    }
  }, {
    key: "getRotationY",
    value: function getRotationY() {
      this.validateRotation();
      return this.getRotationVal(this.rotation.getY());
    }
  }, {
    key: "getRotationZ",
    value: function getRotationZ() {
      this.validateRotation();
      return this.getRotationVal(this.rotation.getZ());
    }
  }, {
    key: "setRotationValue",

    // Rotation setters
    value: function setRotationValue() {
      var state = arguments[0] === undefined ? {} : arguments[0];

      this.validateRotation();
      state.x = this.setRotationVal(state.x);
      state.y = this.setRotationVal(state.y);
      state.z = this.setRotationVal(state.z);
      this.rotation.setValue(state);
      return this;
    }
  }, {
    key: "setRotation",
    value: function setRotation(x, y, z, options, callback) {
      this.validateRotation();
      this.rotation.set(this.setRotationVal(x), this.setRotationVal(y), this.setRotationVal(z), options, callback);
      return this;
    }
  }, {
    key: "setRotationX",
    value: function setRotationX(val, options, callback) {
      this.validateRotation();
      this.rotation.setX(this.setRotationVal(val), options, callback);
      return this;
    }
  }, {
    key: "setRotationY",
    value: function setRotationY(val, options, callback) {
      this.validateRotation();
      this.rotation.setY(this.setRotationVal(val), options, callback);
      return this;
    }
  }, {
    key: "setRotationZ",
    value: function setRotationZ(val, options, callback) {
      this.validateRotation();
      var value = this.setRotationVal(val);
      this.rotation.setZ(value, options, callback);
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
  }, {
    key: "moveTopLeft",

    // ---------------------------------------------------------------------------
    // Convenience Methods
    value: function moveTopLeft() {
      this.setAlign(0, 0, 0.5).setMountPoint(0, 0, 0.5).setOrigin(0, 0, 0.5);
      return this;
    }
  }, {
    key: "moveTopCenter",
    value: function moveTopCenter() {
      this.setAlign(0.5, 0, 0.5).setMountPoint(0.5, 0, 0.5).setOrigin(0.5, 0, 0.5);
      return this;
    }
  }, {
    key: "moveTopRight",
    value: function moveTopRight() {
      this.setAlign(1, 0, 0.5).setMountPoint(1, 0, 0.5).setOrigin(1, 0, 0.5);
      return this;
    }
  }, {
    key: "moveCenterLeft",
    value: function moveCenterLeft() {
      this.setAlign(0, 0.5, 0.5).setMountPoint(0, 0.5, 0.5).setOrigin(0, 0.5, 0.5);
      return this;
    }
  }, {
    key: "moveCenter",
    value: function moveCenter() {
      this.setAlign(0.5, 0.5, 0.5).setMountPoint(0.5, 0.5, 0.5).setOrigin(0.5, 0.5, 0.5);
      return this;
    }
  }, {
    key: "moveCenterRight",
    value: function moveCenterRight() {
      this.setAlign(1, 0.5, 0.5).setMountPoint(1, 0.5, 0.5).setOrigin(1, 0.5, 0.5);
      return this;
    }
  }, {
    key: "moveBottomLeft",
    value: function moveBottomLeft() {
      this.setAlign(0, 1, 0.5).setMountPoint(0, 1, 0.5).setOrigin(0, 1, 0.5);
      return this;
    }
  }, {
    key: "moveBottomCenter",
    value: function moveBottomCenter() {
      this.setAlign(0.5, 1, 0.5).setMountPoint(0.5, 1, 0.5).setOrigin(0.5, 1, 0.5);
      return this;
    }
  }, {
    key: "moveBottomRight",
    value: function moveBottomRight() {
      this.setAlign(1, 1, 0.5).setMountPoint(1, 1, 0.5).setOrigin(1, 1, 0.5);
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

},{}],94:[function(require,module,exports){
/**
 * View class that extends Modifier and should be used for visual elements.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _eventsEventEmitter = require('../events/EventEmitter');

var _eventsEventEmitter2 = _interopRequireDefault(_eventsEventEmitter);

var _Modifier2 = require('./Modifier');

var _Modifier3 = _interopRequireDefault(_Modifier2);

var Color = FamousPlatform.utilities.Color;
var Transitionable = FamousPlatform.transitions.Transitionable;
var DOMElement = FamousPlatform.domRenderables.DOMElement;
var DynamicGeometry = FamousPlatform.webglGeometries.DynamicGeometry;
var Geometry = FamousPlatform.webglGeometries.Geometry;
var EventMap = Object.keys(FamousPlatform.domRenderers.Events.EventMap);
var Mesh = FamousPlatform.webglRenderables.Mesh;
var OBJLoader = FamousPlatform.webglGeometries.OBJLoader;

/**
 * Converts raw text from an OBJ into a DynamicGeometry.
 * @method  objToGeometry
 * @param   {String}           rawText  The raw text from an OBJ file.
 * @return  {DynamicGeometry}  The new DynamicGeometry from the OBJ.
 */
function objToGeometry(rawText, options) {
  var buffers = OBJLoader.formatText(rawText, options);
  var geometry = new Geometry({
    buffers: [{ name: 'a_pos', data: buffers.vertices, size: 3 }, { name: 'a_normals', data: buffers.normals, size: 3 }, { name: 'a_texCoord', data: buffers.textureCoords, size: 2 }, { name: 'indices', data: buffers.indices, size: 1 }]
  });
  return geometry;
}

var View = (function (_Modifier) {
  function View(node, options) {
    _classCallCheck(this, View);

    _get(Object.getPrototypeOf(View.prototype), 'constructor', this).call(this, node, options);
  }

  _inherits(View, _Modifier);

  _createClass(View, [{
    key: 'validateDOM',

    // ---------------------------------------------------------------------------
    // DOM Creation and Modifiers
    value: function validateDOM(options) {
      var _this = this;

      if (!this.el) {
        this._events = {};
        this.el = new DOMElement(this.node, options);
        this.el.onReceive = function (event, payload) {
          if (_this._events[event]) {
            _this._events[event](payload);
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
    key: 'setDOMUnselectable',
    value: function setDOMUnselectable() {
      this.validateDOM();
      // Make this DOM unselectable. Only needs to be applied once per DOM.
      if (!this._unselectable) {
        this._unselectable = true;
        this.setDOMProperties({
          '-moz-user-select': '-moz-none',
          '-khtml-user-select': 'none',
          '-webkit-user-select': 'none',
          '-ms-user-select': 'none',
          'user-select': 'none',
          'cursor': 'pointer'
        });
      }
    }
  }, {
    key: 'setCutoutState',
    value: function setCutoutState(useCutout) {
      this.validateDOM();
      this.el.setCutoutState(useCutout);
    }
  }, {
    key: 'on',

    // ---------------------------------------------------------------------------
    // DOM Events
    value: function on(evName, fn) {
      if (EventMap.indexOf(evName) > -1) {
        // DOM Event
        this.validateDOM();
        this.node.addUIEvent(evName);
        this._events[evName] = fn;
      } else {
        _eventsEventEmitter2['default'].on(evName, fn);
      }
      return this;
    }
  }, {
    key: 'off',
    value: function off(evName, fn) {
      if (EventMap.indexOf(evName) > -1) {} else {
        _eventsEventEmitter2['default'].off(evName, fn);
      }
    }
  }, {
    key: 'trigger',

    // Global Events
    value: function trigger(evName, payload) {
      _eventsEventEmitter2['default'].trigger(evName, payload);
      return this;
    }
  }, {
    key: 'emit',
    value: function emit(evName, payload) {
      console.warn('View.emit() is deprecated. Use View.trigger() instead.');
      return this.trigger(evName, payload);
      // if (!this.eventEmitter) this.eventEmitter = new EventEmitter(this.node);
      // this.eventEmitter.emit(ev, payload);
    }
  }, {
    key: 'validateMesh',

    // ---------------------------------------------------------------------------
    // WebGL Mesh Creation and Modifiers
    value: function validateMesh() {
      if (!this.mesh) this.mesh = new Mesh(this.node);
    }
  }, {
    key: 'getMeshBaseColor',

    // Mesh Getters
    value: function getMeshBaseColor() {
      this.validateMesh();
      return this.mesh.getBaseColor();
    }
  }, {
    key: 'getMeshDrawOptions',
    value: function getMeshDrawOptions() {
      this.validateMesh();
      return this.mesh.getDrawOptions();
    }
  }, {
    key: 'getMeshFlatShading',
    value: function getMeshFlatShading() {
      this.validateMesh();
      return this.mesh.getFlatShading();
    }
  }, {
    key: 'getMeshGeometry',
    value: function getMeshGeometry() {
      this.validateMesh();
      return this.mesh.getGeometry();
    }
  }, {
    key: 'getMeshGlossiness',
    value: function getMeshGlossiness() {
      this.validateMesh();
      return this.mesh.getGlossiness();
    }
  }, {
    key: 'getMeshMaterialExpressions',
    value: function getMeshMaterialExpressions() {
      this.validateMesh();
      return this.mesh.getMaterialExpressions();
    }
  }, {
    key: 'getMeshNormals',
    value: function getMeshNormals(materialExpression) {
      this.validateMesh();
      return this.mesh.getNormals(materialExpression);
    }
  }, {
    key: 'getMeshPositionOffset',
    value: function getMeshPositionOffset(materialExpression) {
      this.validateMesh();
      return this.mesh.getPositionOffset(materialExpression);
    }
  }, {
    key: 'getMeshValue',
    value: function getMeshValue() {
      this.validateMesh();
      return this.mesh.getValue();
    }
  }, {
    key: 'setBaseColor',
    value: function setBaseColor(color, transition, callback) {
      this.validateMesh();
      if (!this.baseColor) {
        this.baseColor = Color.isColorInstance(color) ? color : new Color(color);
        this.mesh.setBaseColor(this.baseColor);
      }
      this.baseColor.set(color, transition, callback);
      return this;
    }
  }, {
    key: 'setSpecularColor',
    value: function setSpecularColor(color, strength, transition, callback) {
      this.validateMesh();
      if (!this.specularColor) {
        this.specularColor = Color.isColorInstance(color) ? color : new Color(color);
        this.mesh.setGlossiness(this.specularColor, strength);
      }
      this.specularColor.set(color, transition, callback);
      return this;
    }
  }, {
    key: 'setMeshDrawOptions',
    value: function setMeshDrawOptions(options) {
      this.validateMesh();
      this.mesh.setDrawOptions(options);
      return this;
    }
  }, {
    key: 'setMeshFlatShading',
    value: function setMeshFlatShading(bool) {
      this.validateMesh();
      this.mesh.setFlatShading(bool);
      return this;
    }
  }, {
    key: 'setMeshOptions',
    value: function setMeshOptions(options) {
      this.validateMesh();
      this.mesh.setOptions(options);
      return this;
    }
  }, {
    key: 'setMeshPositionOffset',
    value: function setMeshPositionOffset(materialExpression) {
      this.validateMesh();
      this.mesh.setPositionOffset(materialExpression);
      return this;
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
    key: 'getGeometryLength',

    // ---------------------------------------------------------------------------
    // WebGL Geometry
    // Geometry Getters
    value: function getGeometryLength() {
      return this.geometry.getLength();
    }
  }, {
    key: 'getNormals',
    value: function getNormals() {
      return this.geometry.getNormals();
    }
  }, {
    key: 'getTextureCoords',
    value: function getTextureCoords() {
      return this.geometry.getTextureCoords();
    }
  }, {
    key: 'getVertexBuffer',
    value: function getVertexBuffer(bufferName) {
      return this.geometry.getVertexBuffer(bufferName);
    }
  }, {
    key: 'getVertexPositions',
    value: function getVertexPositions() {
      return this.geometry.getVertexPositions();
    }
  }, {
    key: 'fromGeometry',

    // Geometry Setters
    value: function fromGeometry(geometry) {
      this.geometry.fromGeometry(geometry);
      this.setGeometry(this.geometry);
      return this;
    }
  }, {
    key: 'setDrawType',
    value: function setDrawType(value) {
      this.geometry.setDrawType(value);
      this.setGeometry(this.geometry);
      return this;
    }
  }, {
    key: 'setIndices',
    value: function setIndices(indices) {
      this.geometry.setIndices(indices);
      this.setGeometry(this.geometry);
      return this;
    }
  }, {
    key: 'setNormals',
    value: function setNormals(normals) {
      this.geometry.setNormals(normals);
      this.setGeometry(this.geometry);
      return this;
    }
  }, {
    key: 'setTextureCoords',
    value: function setTextureCoords(textureCoords) {
      this.geometry.setTextureCoords(textureCoords);
      this.setGeometry(this.geometry);
      return this;
    }
  }, {
    key: 'setVertexBuffer',
    value: function setVertexBuffer(bufferName, value, size) {
      this.geometry.setVertexBuffer(bufferName, value, size);
      this.setGeometry(this.geometry);
      return this;
    }
  }, {
    key: 'setVertexPositions',
    value: function setVertexPositions(vertices) {
      this.geometry.setVertexPositions(vertices);
      this.setGeometry(this.geometry);
      return this;
    }
  }, {
    key: 'validateObjs',

    // ---------------------------------------------------------------------------
    // WebGL Convenience Methods
    value: function validateObjs() {
      if (!this.objs) this.objs = {};
    }
  }, {
    key: 'setDynamicGeometry',
    value: function setDynamicGeometry(geometry, options) {
      // Intended implementation - removes geometryParent
      this.setGeometry(new DynamicGeometry(), options);
      this.fromGeometry(geometry);
      this.setGeometry(this.geometry);
      return this;
    }
  }, {
    key: 'addObj',

    /**
     * Create a new Geometry from the rawText of an OBJ.
     * @method  setObjGeometry
     * @param   {String}        objName             The name to apply
     * @param   {String}        rawText             The raw text from an OBJ file.
     * @param   {Array}         options.align       Set the Align of the Geometry.
     * @param   {Array}         options.mountpoint  Set the MountPoint of the Geometry.
     * @param   {Array}         options.origin      Set the Origin of the Geometry.
     */
    value: function addObj(objName, rawText, options) {
      this.validateObjs();
      this.objs[objName] = new View(this.addChild());
      this.objs[objName].setGeometry(objToGeometry(rawText, options));
      return this;
    }
  }, {
    key: 'hideObj',
    value: function hideObj(objName) {
      this.validateObjs();
      this.objs[objName].setOpacity(0);
      return this;
    }
  }, {
    key: 'hideObjs',
    value: function hideObjs() {
      var _this2 = this;

      this.validateObjs();
      Object.keys(this.objs).forEach(function (objName) {
        _this2.objs[objName].setOpacity(0);
      });
      return this;
    }
  }, {
    key: 'showObj',
    value: function showObj(objName) {
      this.validateObjs();
      this.objs[objName].setOpacity(1);
      return this;
    }
  }, {
    key: 'showObjs',
    value: function showObjs() {
      var _this3 = this;

      this.validateObjs();
      Object.keys(this.objs).forEach(function (objName) {
        _this3.objs[objName].setOpacity(1);
      });
      return this;
    }
  }, {
    key: 'setObjsOpacity',
    value: function setObjsOpacity(value, options, callback) {
      var _this4 = this;

      this.validateObjs();
      Object.keys(this.objs).forEach(function (objName, index) {
        if (index === 0) _this4.objs[objName].setOpacity(value, options, callback);else _this4.objs[objName].setOpacity(value, options);
      });
      return this;
    }
  }]);

  return View;
})(_Modifier3['default']);

exports['default'] = View;
module.exports = exports['default'];

// TODO: Not implemented for DOM yet

},{"../events/EventEmitter":95,"./Modifier":93}],95:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CallbackStore = FamousPlatform.utilities.CallbackStore;

var EventEmitterSingleton = (function () {
  function EventEmitterSingleton() {
    _classCallCheck(this, EventEmitterSingleton);

    this._events = new CallbackStore();
  }

  _createClass(EventEmitterSingleton, [{
    key: "on",
    value: function on(evName, callback) {
      this._events.on(evName, callback);
    }
  }, {
    key: "off",
    value: function off(evName, callback) {
      this._events.on(evName, callback);
    }
  }, {
    key: "trigger",
    value: function trigger(evName, payload) {
      this._events.trigger(evName, payload);
    }
  }]);

  return EventEmitterSingleton;
})();

var EventEmitter = new EventEmitterSingleton();

exports["default"] = EventEmitter;
module.exports = exports["default"];

},{}],96:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CoreFamousEngine = FamousPlatform.core.FamousEngine;

require('./reset.min.css');

var FamousEngineInit = (function () {
  /**
   * Boilerplate code to setup the Famous Engine.
   * @method  constructor
   */

  function FamousEngineInit() {
    _classCallCheck(this, FamousEngineInit);

    this._currentSelector = null;
    this._initialized = false;
    this._rootNode = {};
  }

  _createClass(FamousEngineInit, [{
    key: 'init',
    value: function init() {
      if (this._initialized) return this;
      this._initialized = true;

      // Boilerplate
      CoreFamousEngine.init();

      return this;
    }
  }, {
    key: 'createScene',

    /**
     * Creates a root {@link Scene} for a given selector and adds a root Node to that {@link Scene}.
     *
     * @example
     *
     *     FamousEngine
     *       .init()
     *       .createScene('#app')
     *       .createCamera();
     *     window.app = new View(FamousEngine.getRootNode());
     *
     * @method  createScene
     * @param   {String}        selector  The query selector used to instantiate the {@link Scene}. If no selector is passed then `body` is used.
     * @return  {FamousEngine}  Singleton instance of the FamousEngine.
     */
    value: function createScene(selector) {
      this._currentSelector = selector;
      CoreFamousEngine.createScene(selector);
      this.addRootNode(selector);
      return this;
    }
  }, {
    key: 'createContext',
    value: function createContext(selector) {
      console.warn('FamousEngine.createContext() is deprecated. Use FamousEngine.createScene() instead.');
      return this.createScene(selector);
    }
  }, {
    key: 'getScene',

    /**
     * Retrieve the Scene for a given selector.
     * @method  getScene
     * @param   {String}    [selector]   The query selector. Defaults to the selector used with createScene().
     * @return  {Scene}   The Famous {@link Scene} associated with the selector.
     */
    value: function getScene(selector) {
      if (!selector) selector = this._currentSelector;
      if (!CoreFamousEngine.getContext(selector)) this.createScene(selector);
      return CoreFamousEngine.getContext(selector);
    }
  }, {
    key: 'getContext',
    value: function getContext(selector) {
      console.warn('FamousEngine.getContext() is deprecated. Use FamousEngine.getScene() instead.');
      return this.getScene(selector);
    }
  }, {
    key: 'addRootNode',

    /**
     * Adds a single root {@link Node} the Famous Context for a given selector.
     * @method  addRootNode
     * @param   {String}     [selector]   The query selector. Defaults to the selector used with createScene().
     * @return  {Context}    The Famous Context associated with the selector.
     */
    value: function addRootNode(selector) {
      if (!selector) selector = this._currentSelector;
      if (!this._rootNode[selector]) this._rootNode[selector] = this.getScene(selector).addChild();
      return this;
    }
  }, {
    key: 'getRootNode',

    /**
     * Retrieve the root {@link Node} for a given selector.
     * @method  getRootNode
     * @param   {String}     [selector]  The query selector. Defaults to the selector used with createScene().
     * @return  {Node}       The root {@link Node} for a given selector.
     */
    value: function getRootNode(selector) {
      if (!selector) selector = this._currentSelector;
      if (!this._rootNode[selector]) this.addRootNode(selector);
      return this._rootNode[selector];
    }
  }, {
    key: 'addChild',

    /**
     * Add a child to the root {@link Node}.
     * @method  addChild
     * @param   {String}  [selector]  The query selector. Defaults to the selector used with createScene().
     * @return  {Node}    The new child {@link Node} that was created.
     */
    value: function addChild(selector) {
      if (!selector) selector = this._currentSelector;
      return this.getRootNode(selector).addChild();
    }
  }]);

  return FamousEngineInit;
})();

var FamousEngine = new FamousEngineInit();

exports['default'] = FamousEngine;
module.exports = exports['default'];

},{"./reset.min.css":97}],97:[function(require,module,exports){
var css = "/** Eric Meyer's Reset CSS v2.0 (http://meyerweb.com/eric/tools/css/reset/) * http://cssreset.com */html{box-sizing:border-box;}*,*:before,*:after{box-sizing:inherit;}a,abbr,acronym,address,applet,article,aside,audio,b,big,blockquote,body,canvas,caption,center,cite,code,dd,del,details,dfn,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,output,p,pre,q,ruby,s,samp,section,small,span,strike,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,tt,u,ul,var,video{border:0;font:inherit;margin:0;padding:0;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}html,body{width:100%;height:100%;}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}table{border-collapse:collapse;border-spacing:0}\n"; (require("./../../cssify"))(css); module.exports = css;
},{"./../../cssify":91}],98:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _famousCreativeDisplayView = require('famous-creative/display/View');

var _famousCreativeDisplayView2 = _interopRequireDefault(_famousCreativeDisplayView);

var _ImageService = require('./ImageService');

var _ImageService2 = _interopRequireDefault(_ImageService);

var Car = (function (_View) {
    function Car(node, options) {
        _classCallCheck(this, Car);

        _get(Object.getPrototypeOf(Car.prototype), 'constructor', this).call(this, node);

        this.model = options;

        this.setAlign(0.5, 1).setMountPoint(0.5, 1).setOrigin(0.5, 0.5);
        this.setPositionZ(1);

        this.setSizeMode(0, 1).setProportionalSize(1, null).setAbsoluteSize(null, 280);
        //this.setScale(1.2, 1.2);

        this.createDOMElement({
            tagName: 'img',
            attributes: {
                'src': 'assets/images/car/' + this.model.currentImage + '.jpg'
            },
            classes: ['car-image'],
            properties: {
                'backface-visibility': 'hidden'
            }
        });
    }

    _inherits(Car, _View);

    _createClass(Car, [{
        key: 'advanceImage',
        value: function advanceImage() {
            if (_ImageService2['default'].getCurrent() > _ImageService2['default'].getMax()) {
                this.setDOMAttributes({
                    'src': 'assets/images/car/' + _ImageService2['default'].getNext() + '.jpg'
                });
            }
        }
    }, {
        key: 'updateImage',
        value: function updateImage(img) {
            this.setDOMAttributes({
                'src': 'assets/images/car/' + img
            });
        }
    }]);

    return Car;
})(_famousCreativeDisplayView2['default']);

exports.Car = Car;

},{"./ImageService":100,"famous-creative/display/View":94}],99:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _famousCreativeDisplayView = require('famous-creative/display/View');

var _famousCreativeDisplayView2 = _interopRequireDefault(_famousCreativeDisplayView);

var _Car = require('./Car');

var _Title = require('./Title');

var FlipCard = (function (_View) {
    function FlipCard(node, options) {
        _classCallCheck(this, FlipCard);

        _get(Object.getPrototypeOf(FlipCard.prototype), 'constructor', this).call(this, node, options);

        this.model = options;

        this.setAlign(0, 0.5).setMountPoint(0, 0).setOrigin(0, 0);
        this.setPositionZ(this.model.zPos);

        //this.setSizeModeRelative().setProportionalSize(1, .5);
        this.setSizeModeAbsolute().setAbsoluteSize(420, 384);

        this.createDOMElement({
            classes: ['card-' + this.model.alphaId],
            properties: {
                'z-index': this.model.zPos,
                'background-color': 'white'
            }
        });

        this.renderCar();
        this.renderTitle();
    }

    _inherits(FlipCard, _View);

    _createClass(FlipCard, [{
        key: 'order',
        get: function () {
            return this.model.order;
        },
        set: function (i) {
            this.model.order = i;
        }
    }, {
        key: 'renderCar',
        value: function renderCar() {
            this.car = new _Car.Car(this.addChild(), {
                alphaId: this.model.alphaId,
                currentImage: this.model.image
            });
        }
    }, {
        key: 'renderTitle',
        value: function renderTitle() {
            this.title = new _Title.Title(this.addChild(), {
                alphaId: this.model.alphaId,
                text: this.model.letter
            });
        }
    }, {
        key: 'advance',
        value: function advance() {
            var zPos = undefined;

            switch (this.order) {
                case 1:
                    // Was at top, advance to next
                    zPos = 99;
                    this.setRotationX(0);
                    this.car.advanceImage();
                    this.title.updatePhrase();
                    this.order = 3;
                    break;
                case 2:
                    // Was at bottom, advance to top
                    zPos = 99;
                    this.order = 1;
                    break;
                case 3:
                    // Was at next, advance to bottom
                    zPos = 101;
                    this.order = 2;
                    break;
            }

            this.model.zPos = zPos;
            this.setPositionZ(zPos);
            this.setDOMProperties({
                'z-index': zPos
            });
        }
    }]);

    return FlipCard;
})(_famousCreativeDisplayView2['default']);

exports.FlipCard = FlipCard;

},{"./Car":98,"./Title":103,"famous-creative/display/View":94}],100:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Image = {
    _currentImage: 35, //0,
    _maxCount: 0 //35
};

Image.getCurrent = function () {
    return this._currentImage;
};

Image.getMax = function () {
    return this._maxCount;
};

Image.getNext = function () {
    this._currentImage--;
    return this._currentImage;
};

exports["default"] = Image;
module.exports = exports["default"];

},{}],101:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _famousCreativeDisplayView = require('famous-creative/display/View');

var _famousCreativeDisplayView2 = _interopRequireDefault(_famousCreativeDisplayView);

//GL Components
var Color = FamousPlatform.utilities.Color;
var Geometry = FamousPlatform.webglGeometries.Geometry;
var GeometryHelper = FamousPlatform.webglGeometries.GeometryHelper;
var OBJLoader = FamousPlatform.webglGeometries.OBJLoader;
var Material = FamousPlatform.webglMaterials.Material;
var TextureRegistry = FamousPlatform.webglMaterials.TextureRegistry;

var Logo = (function (_View) {
    function Logo(node, options) {
        var _this = this;

        _classCallCheck(this, Logo);

        _get(Object.getPrototypeOf(Logo.prototype), 'constructor', this).call(this, node, options);

        this.setAlign(0.5, 0, 0.5).setMountPoint(0.5, 0, 0.5).setOrigin(0.5, 0.5, 0.5);
        this.setSizeModeAbsolute().setAbsoluteSize(150, 150, 150);
        this.setPositionZ(200);
        this.setPositionY(125);
        this.setRotationX(Math.PI * -10 / 180);

        this.parent = new _famousCreativeDisplayView2['default'](this.addChild());
        this.quads = new _famousCreativeDisplayView2['default'](this.parent.addChild());
        this.quads.setOrigin(0.5, 0.5, 0.5);
        this.quads.setPositionZ(100);

        this.geometries = {};

        var names = ['B', 'M', 'W', 'outerRing', 'innerRing', 'cross', 'outsideCyl', 'insideCyl'];
        var quads = ['first', 'second', 'third', 'fourth'];

        names.forEach(function (name) {
            _this.geometries[name] = _this.objFactory(_this.parent.addChild(), name);
        });

        quads.forEach(function (name) {
            _this.geometries[name] = _this.objFactory(_this.quads.addChild(), name);
        });

        var color = {
            blue: '#54A9D4',
            white: '#F5F5F5',
            darkestGrey: '#222222',
            darkerGrey: '#444444',
            darkGrey: '#555555',
            gray: '#AAAAAA',
            glossy: '#bbbbdd'
        };

        this.geometries.B.setBaseColor(new Color(color.white));
        this.geometries.M.setBaseColor(new Color(color.white));
        this.geometries.W.setBaseColor(new Color(color.white));
        /*this.geometries.B.mesh.setGlossiness(glossyColor, 60);
        this.geometries.M.mesh.setGlossiness(glossyColor, 60);
        this.geometries.W.mesh.setGlossiness(glossyColor, 60);*/

        this.geometries.first.setBaseColor(new Color(color.white));
        this.geometries.second.setBaseColor(new Color(color.blue));
        this.geometries.third.setBaseColor(new Color(color.white));
        this.geometries.fourth.setBaseColor(new Color(color.blue));
        this.geometries.insideCyl.setBaseColor(new Color(color.darkestGrey));

        this.geometries.outsideCyl.setBaseColor(new Color(color.darkerGrey));
        this.geometries.innerRing.setBaseColor(new Color(color.gray));
        this.geometries.outerRing.setBaseColor(new Color(color.gray));
        /*this.geometries.outsideCyl.mesh.setGlossiness(glossyColor, 100);
        this.geometries.innerRing.mesh.setGlossiness(glossyColor, 100);
        this.geometries.outerRing.mesh.setGlossiness(glossyColor, 100);*/
    }

    _inherits(Logo, _View);

    _createClass(Logo, [{
        key: 'objFactory',
        value: function objFactory(node, name) {
            var geo = new _famousCreativeDisplayView2['default'](node);
            geo.setAlign(0.5, 0, 0.5).setMountPoint(0.5, 0, 0.5).setOrigin(0.5, 0.5, 0.5);
            geo.setSizeModeAbsolute().setAbsoluteSize(150, 150, 150);
            geo.setOpacity(0);

            OBJLoader.load('assets/obj/' + name + '.obj', function (buffers) {
                var myGeo = new Geometry({
                    buffers: [{ name: 'a_pos', data: buffers.vertices, size: 3 }, { name: 'a_normals', data: buffers.normals, size: 3 }, { name: 'indices', data: buffers.indices, size: 1 }]
                });
                geo.setGeometry(myGeo);
            });

            return geo;
        }
    }]);

    return Logo;
})(_famousCreativeDisplayView2['default']);

exports.Logo = Logo;

},{"famous-creative/display/View":94}],102:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var Phrase = {
    _phrase: 'Hello Future',
    _currentIndex: 0,
    _currentPhrase: ''
};

Phrase._letters = Phrase._phrase.split('');

Phrase._getNextLetter = function () {
    if (this._letters[this._currentIndex]) {
        var currentLetter = this._letters[this._currentIndex];
        this._currentIndex++;
        return currentLetter;
    } else {
        return false;
    }
};

Phrase.getCurrentIndex = function () {
    return this._currentIndex;
};

Phrase.getCurrentPhrase = function () {
    var letter = this._getNextLetter();
    if (letter) {
        if (letter === ' ') {
            this._currentPhrase += '<br>';
            letter = this._getNextLetter();
        }

        this._currentPhrase += letter;
    }

    return this._currentPhrase;
};

exports['default'] = Phrase;
module.exports = exports['default'];

},{}],103:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _famousCreativeDisplayView = require('famous-creative/display/View');

var _famousCreativeDisplayView2 = _interopRequireDefault(_famousCreativeDisplayView);

var _PhraseService = require('./PhraseService');

var _PhraseService2 = _interopRequireDefault(_PhraseService);

var Title = (function (_View) {
    function Title(node, options) {
        _classCallCheck(this, Title);

        _get(Object.getPrototypeOf(Title.prototype), 'constructor', this).call(this, node);

        this.model = options;

        this.setAlign(0.5, 0.5).setMountPoint(0.5, 0.5).setOrigin(0.5, 0.5);

        this.setSizeModeRelative().setProportionalSize(1, 1);

        // Flip the card backwards to be ready for the rotation up to the top position
        this.setRotationX(180 * Math.PI / 180);
        this.setPositionZ(-1);

        this.createDOMElement({
            tagName: 'h1',
            classes: ['title-text'],
            content: this.model.text,
            properties: {
                '-webkit-backface-visibility': 'hidden',
                'backface-visibility': 'hidden',
                'box-sizing': 'border-box',
                'font-size': '70px',
                'font-weight': '300',
                'margin': '0',
                'padding-top': '100px',
                'text-align': 'center',
                'text-transform': 'uppercase'
            }
        });
    }

    _inherits(Title, _View);

    _createClass(Title, [{
        key: 'updatePhrase',
        value: function updatePhrase() {
            if (_PhraseService2['default'].getCurrentIndex() === 12) {
                this.setOpacity(0);
            } else {
                this.setDOMContent(_PhraseService2['default'].getCurrentPhrase());
            }
        }
    }]);

    return Title;
})(_famousCreativeDisplayView2['default']);

exports.Title = Title;

},{"./PhraseService":102,"famous-creative/display/View":94}],104:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _famousCreativeAnimationTimeline = require('famous-creative/animation/Timeline');

var _famousCreativeAnimationTimeline2 = _interopRequireDefault(_famousCreativeAnimationTimeline);

var _famousCreativeDisplayView = require('famous-creative/display/View');

var _famousCreativeDisplayView2 = _interopRequireDefault(_famousCreativeDisplayView);

var _famousCreativeScaffoldingFamousEngine = require('famous-creative/scaffolding/FamousEngine');

var _famousCreativeScaffoldingFamousEngine2 = _interopRequireDefault(_famousCreativeScaffoldingFamousEngine);

var _FlipCard = require('./FlipCard');

var _Logo = require('./Logo');

var _ImageService = require('./ImageService');

var _ImageService2 = _interopRequireDefault(_ImageService);

var _PhraseService = require('./PhraseService');

var _PhraseService2 = _interopRequireDefault(_PhraseService);

//Famous Components
var Curves = FamousPlatform.transitions.Curves;
var Famous = FamousPlatform.core.Famous;

//GL Components
var AmbientLight = FamousPlatform.webglRenderables.AmbientLight;
var Color = FamousPlatform.utilities.Color;
var PointLight = FamousPlatform.webglRenderables.PointLight;

var App = (function (_View) {
    function App(node) {
        _classCallCheck(this, App);

        _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this, node);

        var camera = new FamousPlatform.components.Camera(this.node);
        camera.setDepth(1000);

        this.setAlign(0.5, 0.5).setMountPoint(0.5, 0.5);
        this.setSizeModeAbsolute().setAbsoluteSize(420, 768);

        this.baseZPos = {
            top: 99,
            bottom: 101,
            next: 99,
            shadow: 100
        };

        this.createDOMElement({
            properties: {
                'border': '1px solid #000000' }
        });

        this.clock = FamousPlatform.core.FamousEngine.getClock();

        this.renderFlipCards();
        this.renderShadows();
        this.renderClosingText();
        this.renderSky();
        this.renderLogo();

        this.initFlipBook();
    }

    _inherits(App, _View);

    _createClass(App, [{
        key: 'renderFlipCards',
        value: function renderFlipCards() {
            var _this = this;

            this.flipCards = [];
            var cardConfigs = [{
                alphaId: 'A',
                order: 1,
                zPos: this.baseZPos.top,
                image: _ImageService2['default'].getCurrent(),
                letter: _PhraseService2['default'].getCurrentPhrase()
            }, {
                alphaId: 'B',
                order: 2,
                zPos: this.baseZPos.bottom,
                image: _ImageService2['default'].getCurrent(),
                letter: _PhraseService2['default'].getCurrentPhrase()
            }, {
                alphaId: 'C',
                order: 3,
                zPos: this.baseZPos.next,
                image: _ImageService2['default'].getNext(),
                letter: _PhraseService2['default'].getCurrentPhrase()
            }];

            cardConfigs.forEach(function (config) {
                _this.flipCards.push(new _FlipCard.FlipCard(_this.addChild(), config));
            });

            this.flipCards[0].setRotationX(180 * Math.PI / 180);
        }
    }, {
        key: 'renderShadows',
        value: function renderShadows() {
            var properties = {
                'z-index': this.baseZPos.shadow,
                'background-color': '#000000',
                'backface-visibility': 'visible'
            };

            //SHADOW TOP
            this.shadowTop = new _famousCreativeDisplayView2['default'](this.addChild());

            this.shadowTop.setAlign(0, 0);
            this.shadowTop.setMountPoint(0, 0);
            this.shadowTop.setOpacity(0);

            this.shadowTop.setSizeModeRelative();
            this.shadowTop.setProportionalSize(1, 0.5);
            this.shadowTop.setPositionZ(this.baseZPos.shadow);
            this.shadowTop.createDOMElement({
                properties: properties,
                tagName: 'div',
                classes: ['shadow-top']
            });

            //SHADOW BOTTOM
            this.shadowBottom = new _famousCreativeDisplayView2['default'](this.addChild());

            this.shadowBottom.setAlign(0, 0.5);
            this.shadowBottom.setMountPoint(0, 0);
            this.shadowBottom.setOpacity(0.33);

            //TODO put this back once the size issue is resolved
            //this.shadowTop.setSizeModeRelative();
            //this.shadowTop.setProportionalSize(1, .5);
            this.shadowBottom.setSizeModeAbsolute();
            this.shadowBottom.setAbsoluteSize(420, 384);

            this.shadowBottom.setPositionZ(this.baseZPos.shadow);

            this.shadowBottom.createDOMElement({
                properties: properties,
                tagName: 'div',
                classes: ['shadow-bottom']
            });
        }
    }, {
        key: 'renderClosingText',
        value: function renderClosingText() {
            //CLOSING TEXT 1
            this.closingText1 = new _famousCreativeDisplayView2['default'](this.addChild());
            this.closingText1.setOpacity(0);
            this.closingText1.setPositionY(535);
            this.closingText1.setPositionZ(200);

            this.closingText1.createDOMElement({
                properties: {
                    'text-align': 'center',
                    'font-size': '26px',
                    'line-height': '1',
                    'z-index': '200'
                },
                tagName: 'div',
                content: 'SEE HOW WE BROUGHT<br>TOMMORROW TO TODAY'
            });

            //CLOSING TEXT 2
            this.closingText2 = new _famousCreativeDisplayView2['default'](this.addChild());
            this.closingText2.setOpacity(0);
            this.closingText2.setPositionY(600);
            this.closingText2.setPositionZ(200);

            this.closingText2.createDOMElement({
                properties: {
                    'text-align': 'center',
                    'font-size': '26px',
                    'line-height': '1',
                    'z-index': '200',
                    'color': 'rgb(255,255,255)'
                },
                tagName: 'div',
                content: 'HELLO FUTURE<br><strong>The all new electric BMW i3</strong>'
            });
        }
    }, {
        key: 'renderSky',
        value: function renderSky() {
            this.sky = new _famousCreativeDisplayView2['default'](this.addChild());
            this.sky.createDOMElement({
                properties: {
                    'background-color': 'rgb(255, 255, 255)',
                    'z-index': -200
                },
                classes: ['background-sky']
            });

            this.sky.setSizeModeRelative();
            this.sky.setProportionalSize(1, 1);
            this.sky.setPositionZ(-200);
        }
    }, {
        key: 'renderLogo',
        value: function renderLogo() {
            this.logo = new _Logo.Logo(this.addChild());

            this.pointLightA = new _famousCreativeDisplayView2['default'](this.node.addChild());
            this.pointLightA.pointLight = new PointLight(this.pointLightA.addChild());
            this.pointLightA.pointLight.setColor(new Color('#eeeeee'));
            this.pointLightA.setPosition(500, -500, -100);

            this.pointLightB = new _famousCreativeDisplayView2['default'](this.node.addChild());
            this.pointLightB.pointLight = new PointLight(this.pointLightB.addChild());
            this.pointLightB.pointLight.setColor(new Color('#CCCCCC'));
            this.pointLightB.setPosition(-200, -200, 50);

            this.pointLightC = new _famousCreativeDisplayView2['default'](this.node.addChild());
            this.pointLightC.pointLight = new PointLight(this.pointLightC.addChild());
            this.pointLightC.pointLight.setColor(new Color('#CCCCCC'));
            this.pointLightC.setPosition(200, 300, 1500);

            this.ambientLight = new _famousCreativeDisplayView2['default'](this.node.addChild());
            this.ambientLight.ambientLight = new AmbientLight(this.ambientLight.addChild());
            this.ambientLight.ambientLight.setColor(new Color('#555555'));
        }
    }, {
        key: 'initFlipBook',
        value: function initFlipBook() {
            this.duration = 750;
            this.clock.setTimeout(this.flipCard.bind(this), 2000);
            this.flipCount = 0;
            this.timelineInitialized = false;
        }
    }, {
        key: 'flipCard',
        value: function flipCard() {
            var _this2 = this;

            var topCard = undefined,
                bottomCard = undefined,
                nextCard = undefined;
            var flipDuration = this.duration;
            this.flipCount++;

            // Determine where each card based on its order property
            this.flipCards.forEach(function (card) {
                switch (card.order) {
                    case 1:
                        topCard = card;
                        break;
                    case 2:
                        bottomCard = card;
                        break;
                    case 3:
                        nextCard = card;
                        break;
                }
            });

            // This is to get rid of the phantom image seen at high speeds in the flip animation
            if (this.duration < 50) {
                flipDuration = 0;
                this.shadowBottom.hide();
                this.shadowTop.hide();
            } else {
                (function () {
                    // Each shadow is only active for half the time of the card flip
                    var shadowDuration = _this2.duration / 2;
                    // Fade out bottom shadow for the first half of the flip animation
                    _this2.shadowBottom.haltOpacity();
                    _this2.shadowBottom.setOpacity(0.33, { duration: 0 }, function () {
                        _this2.shadowBottom.setOpacity(0, {
                            duration: shadowDuration
                        }, function () {
                            // Fade in top shadow for the second half of the flip animation
                            _this2.shadowTop.haltOpacity();
                            _this2.shadowTop.setOpacity(0.33, {
                                duration: shadowDuration
                            });
                        });
                    });
                })();
            }

            // The bottom card gets flipped to the top
            bottomCard.setRotationX(180 * Math.PI / 180, {
                duration: flipDuration
            }, function () {
                if (_this2.duration > 50) {
                    _this2.duration *= 0.8;
                }

                if (_this2.flipCount === 10 && !_this2.timelineInitialized) {
                    _this2.registerTimelinePaths();
                }

                if (_this2.flipCount < 35) {
                    _this2.shadowTop.haltOpacity();
                    _this2.shadowTop.setOpacity(0, { duration: 0 }, function () {
                        _this2.advanceCard(nextCard);
                        _this2.advanceCard(topCard);
                        _this2.advanceCard(bottomCard);
                        _this2.clock.setTimeout(_this2.flipCard.bind(_this2), _this2.duration);
                    });
                }
            });
        }
    }, {
        key: 'advanceCard',
        value: function advanceCard(card) {
            var zPos = undefined;

            if (card.order === 1) {
                // Was at top, advance to next
                zPos = this.baseZPos.next;
                card.order = 3;
                card.setRotationX(0);
                card.car.advanceImage();
                card.title.updatePhrase();
            } else if (card.order === 2) {
                // Was at bottom, advance to top
                zPos = this.baseZPos.top;
                card.order = 1;
            } else if (card.order === 3) {
                // Was at next, advance to bottom
                zPos = this.baseZPos.bottom;
                card.order = 2;
            }

            card.setPositionZ(zPos);
            card.setDOMProperties({
                'z-index': zPos
            });
        }
    }, {
        key: 'registerTimelinePaths',
        value: function registerTimelinePaths() {
            this.timelineInitialized = true;
            this.timeline = new _famousCreativeAnimationTimeline2['default']({ timescale: 1 });
            this.registerLogo();
            this.timeline.set(20000, { duration: 20000 });
        }
    }, {
        key: 'registerLogo',
        value: function registerLogo() {
            var _this3 = this;

            var logoQuadrants = [this.logo.geometries.second, this.logo.geometries.fourth, this.logo.geometries.first, this.logo.geometries.third];

            var time = {
                a: [0, 250, 500, 750],
                end: 1750
            };

            logoQuadrants.forEach(function (quadrant, i) {
                var x = undefined,
                    y = undefined,
                    startTime = undefined;
                var offset = 400;

                switch (i) {
                    case 0:
                        // top left
                        startTime = time.a[0]; //this.time.quad.a;
                        x = -offset;
                        y = -offset;
                        break;
                    case 1:
                        // bottom right
                        startTime = time.a[1]; //this.time.quad.b;
                        x = offset;
                        y = offset;
                        break;
                    case 2:
                        // top right
                        startTime = time.a[2]; //this.time.quad.c;
                        x = offset;
                        y = -offset;
                        break;
                    case 3:
                        // bottom left
                        startTime = time.a[3]; //this.time.quad.d;
                        x = -offset;
                        y = offset;
                        break;
                }

                _this3.timeline.registerPath({
                    handler: function handler(val) {
                        quadrant.setPosition.apply(quadrant, _toConsumableArray(val));
                    },
                    path: [[0, [x, y, 0]], [startTime, [x, y, 0], Curves.inOutBack], [startTime + 1000, [0, 0, 0]]]
                });

                _this3.timeline.registerPath({
                    handler: function handler(t) {
                        if (t >= 200) {
                            quadrant.setOpacity(1, {
                                duration: 250
                            });
                        }
                    },
                    path: [[0, 0], [time.end, time.end]]
                });

                var rotX = Math.PI * 0 / 180;
                var rotY = Math.PI * 360 / 180;
                var rotZ = Math.PI * 0 / 180;

                _this3.timeline.registerPath({
                    handler: function handler(val) {
                        quadrant.setRotation.apply(quadrant, _toConsumableArray(val));
                    },
                    path: [[startTime, [rotX, rotY, rotZ]], [startTime + 1000, [0, 0, 0]]]
                });
            });

            this.registerLoadOutsideCylinder(time.end);
        }
    }, {
        key: 'registerLoadOutsideCylinder',
        value: function registerLoadOutsideCylinder(startTime) {
            var _this4 = this;

            startTime = startTime ? startTime : 0;
            var time = {
                a: [startTime],
                end: startTime + 1000
            };

            var hasScaled = false;
            this.timeline.registerPath({
                handler: function handler(t) {
                    if (!hasScaled && t >= time.a[0]) {
                        hasScaled = true;

                        _this4.logo.geometries.outsideCyl.setScale(0, 0, 0, { duration: 0 }, function () {
                            _this4.logo.geometries.outsideCyl.setScale(1, 1, 1, {
                                duration: 1000,
                                curve: Curves.outBack
                            });
                            _this4.logo.geometries.outsideCyl.setOpacity(1, {
                                duration: 800
                            });
                        });
                    }
                },
                path: [[startTime, startTime], [time.end, time.end]]
            });

            this.registerRotateAssembleLogo(time.end);
        }
    }, {
        key: 'registerRotateAssembleLogo',
        value: function registerRotateAssembleLogo(startTime) {
            var _this5 = this;

            startTime = startTime ? startTime : 0;
            var phaseDuration = 1750;
            var endTime = startTime + phaseDuration;

            this.timeline.registerPath({
                handler: function handler(val) {
                    _this5.logo.setRotationY(val);
                },
                path: [[startTime, 0, Curves.easeOut], [startTime + 500, Math.PI * 90 / 180], [startTime + 1250, Math.PI * 90 / 180, Curves.outBack], [endTime, 0]]
            });

            var isScrewed = false;
            this.timeline.registerPath({
                handler: function handler(time) {
                    if (!isScrewed && time >= startTime + 500) {
                        isScrewed = true;

                        _this5.logo.quads.setRotationZ(Math.PI * 1440 / 180, {
                            duration: 750
                        });

                        _this5.logo.quads.setPositionZ(0, {
                            duration: 750,
                            curve: Curves.inBack
                        });
                    }
                },
                path: [[startTime, startTime], [endTime, endTime]]
            });

            this.registerAddOuterRingInsideCyl(endTime);
        }
    }, {
        key: 'registerAddOuterRingInsideCyl',
        value: function registerAddOuterRingInsideCyl(startTime) {
            var _this6 = this;

            startTime = startTime ? startTime : 0;
            var phaseDuration = 1500;
            var endTime = startTime + phaseDuration;

            this.logo.geometries.outerRing.setPositionZ(1000);
            this.logo.geometries.insideCyl.setPositionZ(1000);
            this.logo.geometries.innerRing.setPositionZ(-500);

            var hasScaledDown = false;
            var hasScaledUp = false;
            this.timeline.registerPath({
                handler: function handler(time) {
                    if (!hasScaledDown && time >= startTime) {
                        hasScaledDown = true;
                        _this6.logo.geometries.outerRing.setOpacity(1, { duration: 1000 });

                        _this6.logo.geometries.outerRing.setPositionZ(0, {
                            duration: 1000,
                            curve: Curves.easeIn
                        });

                        _this6.logo.geometries.insideCyl.setOpacity(1, { duration: 750 });

                        _this6.logo.geometries.insideCyl.setPositionZ(0, {
                            duration: 750,
                            curve: Curves.easeIn
                        });
                    }

                    if (!hasScaledUp && time >= startTime + 1000) {
                        hasScaledUp = true;
                        _this6.logo.geometries.innerRing.setOpacity(1);
                        _this6.logo.geometries.innerRing.setPositionZ(0, {
                            duration: 500,
                            curve: Curves.outBack
                        });
                    }
                },
                path: [[startTime, startTime], [endTime, endTime]]
            });

            this.registerLetterEntry(endTime);
        }
    }, {
        key: 'registerLetterEntry',
        value: function registerLetterEntry(startTime) {
            startTime = startTime ? startTime : 0;
            var phaseDuration = 1500;
            var endTime = startTime + phaseDuration;

            var B = this.logo.geometries.B,
                M = this.logo.geometries.M,
                W = this.logo.geometries.W;

            B.setPositionZ(100);
            M.setPositionZ(100);
            W.setPositionZ(100);

            var hasLoadedLetters = false;
            this.timeline.registerPath({
                handler: function handler(time) {
                    if (!hasLoadedLetters && time >= startTime) {
                        hasLoadedLetters = true;

                        B.setOpacity(1, { duration: 250 });
                        B.setPositionZ(0, { duration: 250 });

                        setTimeout(function () {
                            M.setOpacity(1, { duration: 250 });
                            M.setPositionZ(0, { duration: 250 });
                        }, 250);

                        setTimeout(function () {
                            W.setOpacity(1, { duration: 250 });
                            W.setPositionZ(0, { duration: 250 });
                        }, 500);
                    }
                },
                path: [[startTime, startTime], [endTime, endTime]]
            });

            this.registerCar(endTime);
            this.registerClosingText(endTime);
            this.registerSky(endTime);
        }
    }, {
        key: 'registerCar',
        value: function registerCar(startTime) {
            var _this7 = this;

            startTime = startTime ? startTime : 0;
            var time = {
                a: [startTime, startTime + 1000],
                b: [startTime + 2000, startTime + 3000],
                end: startTime + 3000
            };

            var lastCard = this.flipCards[0];

            this.timeline.registerPath({
                handler: function handler(val) {
                    var _lastCard$car;

                    (_lastCard$car = lastCard.car).setPosition.apply(_lastCard$car, _toConsumableArray(val));
                },
                path: [[startTime, [0, 0]], [time.a[1], [400, -600], Curves.outCirc], [time.b[0], [400, -825]], [time.b[1], [0, -375], Curves.inCirc]]
            });

            var hasUpdatedImage = false;
            this.timeline.registerPath({
                handler: function handler(t) {
                    if (!hasUpdatedImage && t >= time.b[0]) {
                        hasUpdatedImage = true;
                        lastCard.car.updateImage('orange_mirrored.png');
                        lastCard.car.setScale(1, 1);
                        lastCard.car.setSizeModeAbsolute();
                        lastCard.car.setAbsoluteSize(550, 367);
                    }
                },
                path: [[0, 0], [time.end, time.end]]
            });

            var isOpacitated = false;
            this.timeline.registerPath({
                handler: function handler(t) {
                    if (!isOpacitated && t >= startTime) {
                        isOpacitated = true;
                        _this7.flipCards.forEach(function (card) {
                            card.setDOMProperties({
                                'background-color': 'rgba(0, 0, 0, 0)'
                            });
                        });

                        _this7.registerLogoDrop(t);
                    }
                },
                path: [[startTime, startTime], [time.end, time.end]]
            });
        }
    }, {
        key: 'registerLogoDrop',
        value: function registerLogoDrop(startTime) {
            var _this8 = this;

            startTime = startTime ? startTime : 0;
            var time = {
                a: [startTime + 1500, startTime + 3000],
                end: startTime + 300
            };

            var logo = {
                z: this.logo.getPositionZ(),
                y: this.logo.getPositionY(),
                x: this.logo.getPositionX()
            };

            this.timeline.registerPath({
                handler: function handler(val) {
                    var _logo;

                    (_logo = _this8.logo).setPosition.apply(_logo, _toConsumableArray(val));
                },
                path: [[startTime, [logo.x, logo.y, logo.z], Curves.easeIn], [time.a[0], [logo.x, 250, logo.z], Curves.easeOut], [time.a[1], [logo.x, 365, logo.z]]]
            });

            this.timeline.registerPath({
                handler: function handler(val) {
                    var _logo2;

                    (_logo2 = _this8.logo).setScale.apply(_logo2, _toConsumableArray(val));
                },
                path: [[startTime, [1, 1, 1], Curves.easeOut], [time.a[0], [0.7, 0.7, 0.7], Curves.easeIn], [time.a[1], [0.9, 0.9, 0.9]]]
            });
        }
    }, {
        key: 'registerSky',
        value: function registerSky(startTime) {
            var _this9 = this;

            startTime = startTime ? startTime : 0;
            var time = {
                a: [startTime, startTime + 1000],
                b: [startTime + 2000, startTime + 3000],
                end: startTime + 3000
            };

            this.timeline.registerPath({
                handler: function handler(val) {
                    _this9.sky.setDOMProperties({
                        'background-color': 'rgb(' + Math.floor(val[0]) + ', ' + Math.floor(val[1]) + ', ' + Math.floor(val[2]) + ')'
                    });
                },
                path: [[time.b[0] + 0, [255, 255, 255]], [time.b[0] + 50, [255, 248, 224]], [time.b[0] + 100, [255, 213, 78]], [time.b[0] + 150, [255, 154, 0]], [time.b[0] + 200, [229, 95, 21]], [time.b[0] + 250, [205, 41, 103]], [time.b[1], [0, 0, 0]]]
            });
        }
    }, {
        key: 'registerClosingText',
        value: function registerClosingText(startTime) {
            var _this10 = this;

            //7500
            startTime = startTime ? startTime : 0;
            var time = {
                a: [startTime + 500, startTime + 1500, startTime + 3000],
                b: [startTime + 2700, startTime + 3500]
            };

            //Closing text 1
            this.timeline.registerPath({
                handler: function handler(val) {
                    _this10.closingText1.setOpacity(val);
                },
                path: [[startTime, 0], [time.a[0], 0], [time.a[1], 1], [time.a[2], 0]]
            });

            var ypos = this.closingText1.position.getY();
            this.timeline.registerPath({
                handler: function handler(val) {
                    var _closingText1;

                    (_closingText1 = _this10.closingText1).setPosition.apply(_closingText1, _toConsumableArray(val));
                },
                path: [[startTime, [0, ypos]], [time.a[1], [0, ypos], Curves.easeOut], [time.a[2], [0, ypos + 100]]]
            });

            //Closing text 2
            this.timeline.registerPath({
                handler: function handler(val) {
                    _this10.closingText2.setOpacity(val);
                },
                path: [[startTime, 0], [time.b[0], 0], [time.b[1], 1]]
            });
        }
    }, {
        key: 'logoBreath',
        value: function logoBreath() {
            var _this11 = this;

            this.logo.setScale(1.05, 1.05, 1.05, {
                duration: 500
            }, function () {
                _this11.logo.setScale(1, 1, 1, {
                    duration: 500
                });
            });
        }
    }]);

    return App;
})(_famousCreativeDisplayView2['default']);

_famousCreativeScaffoldingFamousEngine2['default'].init();
_famousCreativeScaffoldingFamousEngine2['default'].createScene('#app');

window.app = new App(_famousCreativeScaffoldingFamousEngine2['default'].addChild('#app'));

//'overflow': 'hidden'

},{"./FlipCard":99,"./ImageService":100,"./Logo":101,"./PhraseService":102,"famous-creative/animation/Timeline":92,"famous-creative/display/View":94,"famous-creative/scaffolding/FamousEngine":96}],105:[function(require,module,exports){
'use strict';
require('babelify/polyfill');
require('./app/index');

},{"./app/index":104,"babelify/polyfill":90}]},{},[105])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbGliL2JhYmVsL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXJyYXktbWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXNzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi1zdHJvbmcuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvbGxlY3Rpb24tdG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi13ZWFrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jdHguanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmRlZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZG9tLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZW51bS1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5mb3Itb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmZ3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pbnZva2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItY2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlci1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pdGVyLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQua2V5b2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLm1peC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQub3duLWtleXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnBhcnRpYWwuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnJlZGVmLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5yZXBsYWNlci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc2V0LXByb3RvLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnN0cmluZy1wYWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnN0cmluZy1yZXBlYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnRhc2suanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnRocm93cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudWlkLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC51bnNjb3BlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC53a3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuY29weS13aXRoaW4uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5maW5kLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZpbmQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmZ1bmN0aW9uLmhhcy1pbnN0YW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5mdW5jdGlvbi5uYW1lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm1hcC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXRoLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm51bWJlci5jb25zdHJ1Y3Rvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIuc3RhdGljcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC5pcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnByb21pc2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVmbGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWdleHAuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc2V0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5jb2RlLXBvaW50LWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5lbmRzLXdpdGguanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLmZyb20tY29kZS1wb2ludC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5yYXcuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLnJlcGVhdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuc3RhcnRzLXdpdGguanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LndlYWstbWFwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LndlYWstc2V0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3Lm1hcC50by1qc29uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3Lm9iamVjdC50by1hcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5yZWdleHAuZXNjYXBlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnNldC50by1qc29uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnN0cmluZy5hdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zdHJpbmcubHBhZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zdHJpbmcucnBhZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2pzLmFycmF5LnN0YXRpY3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLmltbWVkaWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi50aW1lcnMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvcmVnZW5lcmF0b3IvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9jc3NpZnkvYnJvd3Nlci5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2Jtdy9ub2RlX21vZHVsZXMvZmFtb3VzLWNyZWF0aXZlL2FuaW1hdGlvbi9UaW1lbGluZS5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2Jtdy9ub2RlX21vZHVsZXMvZmFtb3VzLWNyZWF0aXZlL2Rpc3BsYXkvTW9kaWZpZXIuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9ibXcvbm9kZV9tb2R1bGVzL2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L1ZpZXcuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9ibXcvbm9kZV9tb2R1bGVzL2ZhbW91cy1jcmVhdGl2ZS9ldmVudHMvRXZlbnRFbWl0dGVyLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvYm13L25vZGVfbW9kdWxlcy9mYW1vdXMtY3JlYXRpdmUvc2NhZmZvbGRpbmcvRmFtb3VzRW5naW5lLmpzIiwibm9kZV9tb2R1bGVzL2ZhbW91cy1jcmVhdGl2ZS9zY2FmZm9sZGluZy9yZXNldC5taW4uY3NzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvYm13L3NyYy9hcHAvQ2FyLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvYm13L3NyYy9hcHAvRmxpcENhcmQuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9ibXcvc3JjL2FwcC9JbWFnZVNlcnZpY2UuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9ibXcvc3JjL2FwcC9Mb2dvLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvYm13L3NyYy9hcHAvUGhyYXNlU2VydmljZS5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2Jtdy9zcmMvYXBwL1RpdGxlLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvYm13L3NyYy9hcHAvaW5kZXguanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9ibXcvc3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELFlBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN2RCxZQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Ozs7O0FBS3ZELFlBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUMzRCxZQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDM0QsWUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzNELFlBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMzRCxZQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7O0FBRXJFLFlBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUNyRSxZQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDOUQsWUFBSSxDQUFDLFVB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LEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHO3FCQUNoSCxDQUFDLENBQUE7aUJBQ0w7QUFDRCxvQkFBSSxFQUFFLENBQ0YsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFDbkMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFDbkMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDbEMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDakMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUcsRUFBRSxDQUFDLENBQUMsRUFDbEMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUcsR0FBRyxDQUFDLENBQUMsRUFDbkMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUNoQzthQUNKLENBQUMsQ0FB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bnVCcEQsWUFBWSxDQUFDO0FBQ2IsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDN0IsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5yZXF1aXJlKFwiY29yZS1qcy9zaGltXCIpO1xuXG5yZXF1aXJlKFwicmVnZW5lcmF0b3IvcnVudGltZVwiKTtcblxuaWYgKGdsb2JhbC5fYmFiZWxQb2x5ZmlsbCkge1xuICB0aHJvdyBuZXcgRXJyb3IoXCJvbmx5IG9uZSBpbnN0YW5jZSBvZiBiYWJlbC9wb2x5ZmlsbCBpcyBhbGxvd2VkXCIpO1xufVxuZ2xvYmFsLl9iYWJlbFBvbHlmaWxsID0gdHJ1ZTsiLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyICQgPSByZXF1aXJlKCcuLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oSVNfSU5DTFVERVMpe1xuICByZXR1cm4gZnVuY3Rpb24oJHRoaXMsIGVsLCBmcm9tSW5kZXgpe1xuICAgIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KCR0aGlzKVxuICAgICAgLCBsZW5ndGggPSAkLnRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSAkLnRvSW5kZXgoZnJvbUluZGV4LCBsZW5ndGgpXG4gICAgICAsIHZhbHVlO1xuICAgIGlmKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKXdoaWxlKGxlbmd0aCA+IGluZGV4KXtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIGlmKHZhbHVlICE9IHZhbHVlKXJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pe1xuICAgICAgaWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59OyIsIi8vIDAgLT4gQXJyYXkjZm9yRWFjaFxuLy8gMSAtPiBBcnJheSNtYXBcbi8vIDIgLT4gQXJyYXkjZmlsdGVyXG4vLyAzIC0+IEFycmF5I3NvbWVcbi8vIDQgLT4gQXJyYXkjZXZlcnlcbi8vIDUgLT4gQXJyYXkjZmluZFxuLy8gNiAtPiBBcnJheSNmaW5kSW5kZXhcbnZhciAkICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGN0eCA9IHJlcXVpcmUoJy4vJC5jdHgnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVFlQRSl7XG4gIHZhciBJU19NQVAgICAgICAgID0gVFlQRSA9PSAxXG4gICAgLCBJU19GSUxURVIgICAgID0gVFlQRSA9PSAyXG4gICAgLCBJU19TT01FICAgICAgID0gVFlQRSA9PSAzXG4gICAgLCBJU19FVkVSWSAgICAgID0gVFlQRSA9PSA0XG4gICAgLCBJU19GSU5EX0lOREVYID0gVFlQRSA9PSA2XG4gICAgLCBOT19IT0xFUyAgICAgID0gVFlQRSA9PSA1IHx8IElTX0ZJTkRfSU5ERVg7XG4gIHJldHVybiBmdW5jdGlvbigkdGhpcywgY2FsbGJhY2tmbiwgdGhhdCl7XG4gICAgdmFyIE8gICAgICA9IE9iamVjdCgkLmFzc2VydERlZmluZWQoJHRoaXMpKVxuICAgICAgLCBzZWxmICAgPSAkLkVTNU9iamVjdChPKVxuICAgICAgLCBmICAgICAgPSBjdHgoY2FsbGJhY2tmbiwgdGhhdCwgMylcbiAgICAgICwgbGVuZ3RoID0gJC50b0xlbmd0aChzZWxmLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gMFxuICAgICAgLCByZXN1bHQgPSBJU19NQVAgPyBBcnJheShsZW5ndGgpIDogSVNfRklMVEVSID8gW10gOiB1bmRlZmluZWRcbiAgICAgICwgdmFsLCByZXM7XG4gICAgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihOT19IT0xFUyB8fCBpbmRleCBpbiBzZWxmKXtcbiAgICAgIHZhbCA9IHNlbGZbaW5kZXhdO1xuICAgICAgcmVzID0gZih2YWwsIGluZGV4LCBPKTtcbiAgICAgIGlmKFRZUEUpe1xuICAgICAgICBpZihJU19NQVApcmVzdWx0W2luZGV4XSA9IHJlczsgICAgICAgICAgICAvLyBtYXBcbiAgICAgICAgZWxzZSBpZihyZXMpc3dpdGNoKFRZUEUpe1xuICAgICAgICAgIGNhc2UgMzogcmV0dXJuIHRydWU7ICAgICAgICAgICAgICAgICAgICAvLyBzb21lXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmRcbiAgICAgICAgICBjYXNlIDY6IHJldHVybiBpbmRleDsgICAgICAgICAgICAgICAgICAgLy8gZmluZEluZGV4XG4gICAgICAgICAgY2FzZSAyOiByZXN1bHQucHVzaCh2YWwpOyAgICAgICAgICAgICAgIC8vIGZpbHRlclxuICAgICAgICB9IGVsc2UgaWYoSVNfRVZFUlkpcmV0dXJuIGZhbHNlOyAgICAgICAgICAvLyBldmVyeVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gSVNfRklORF9JTkRFWCA/IC0xIDogSVNfU09NRSB8fCBJU19FVkVSWSA/IElTX0VWRVJZIDogcmVzdWx0O1xuICB9O1xufTsiLCJ2YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbXNnMSwgbXNnMil7XG4gIGlmKCFjb25kaXRpb24pdGhyb3cgVHlwZUVycm9yKG1zZzIgPyBtc2cxICsgbXNnMiA6IG1zZzEpO1xufVxuYXNzZXJ0LmRlZiA9ICQuYXNzZXJ0RGVmaW5lZDtcbmFzc2VydC5mbiA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoISQuaXNGdW5jdGlvbihpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTtcbmFzc2VydC5vYmogPSBmdW5jdGlvbihpdCl7XG4gIGlmKCEkLmlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07XG5hc3NlcnQuaW5zdCA9IGZ1bmN0aW9uKGl0LCBDb25zdHJ1Y3RvciwgbmFtZSl7XG4gIGlmKCEoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpdGhyb3cgVHlwZUVycm9yKG5hbWUgKyBcIjogdXNlIHRoZSAnbmV3JyBvcGVyYXRvciFcIik7XG4gIHJldHVybiBpdDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IGFzc2VydDsiLCJ2YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGVudW1LZXlzID0gcmVxdWlyZSgnLi8kLmVudW0ta2V5cycpO1xuLy8gMTkuMS4yLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSwgLi4uKVxuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCBzb3VyY2Upe1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICB2YXIgVCA9IE9iamVjdCgkLmFzc2VydERlZmluZWQodGFyZ2V0KSlcbiAgICAsIGwgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBpID0gMTtcbiAgd2hpbGUobCA+IGkpe1xuICAgIHZhciBTICAgICAgPSAkLkVTNU9iamVjdChhcmd1bWVudHNbaSsrXSlcbiAgICAgICwga2V5cyAgID0gZW51bUtleXMoUylcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAgICwgaiAgICAgID0gMFxuICAgICAgLCBrZXk7XG4gICAgd2hpbGUobGVuZ3RoID4gailUW2tleSA9IGtleXNbaisrXV0gPSBTW2tleV07XG4gIH1cbiAgcmV0dXJuIFQ7XG59OyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgVEFHICAgICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ3RvU3RyaW5nVGFnJylcbiAgLCB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuZnVuY3Rpb24gY29mKGl0KXtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn1cbmNvZi5jbGFzc29mID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgTywgVDtcbiAgcmV0dXJuIGl0ID09IHVuZGVmaW5lZCA/IGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6ICdOdWxsJ1xuICAgIDogdHlwZW9mIChUID0gKE8gPSBPYmplY3QoaXQpKVtUQUddKSA9PSAnc3RyaW5nJyA/IFQgOiBjb2YoTyk7XG59O1xuY29mLnNldCA9IGZ1bmN0aW9uKGl0LCB0YWcsIHN0YXQpe1xuICBpZihpdCAmJiAhJC5oYXMoaXQgPSBzdGF0ID8gaXQgOiBpdC5wcm90b3R5cGUsIFRBRykpJC5oaWRlKGl0LCBUQUcsIHRhZyk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBjb2Y7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjdHggICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIHNhZmUgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmVcbiAgLCBhc3NlcnQgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxuICAsIGZvck9mICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgc3RlcCAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpLnN0ZXBcbiAgLCBoYXMgICAgICA9ICQuaGFzXG4gICwgc2V0ICAgICAgPSAkLnNldFxuICAsIGlzT2JqZWN0ID0gJC5pc09iamVjdFxuICAsIGhpZGUgICAgID0gJC5oaWRlXG4gICwgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBpc09iamVjdFxuICAsIElEICAgICAgID0gc2FmZSgnaWQnKVxuICAsIE8xICAgICAgID0gc2FmZSgnTzEnKVxuICAsIExBU1QgICAgID0gc2FmZSgnbGFzdCcpXG4gICwgRklSU1QgICAgPSBzYWZlKCdmaXJzdCcpXG4gICwgSVRFUiAgICAgPSBzYWZlKCdpdGVyJylcbiAgLCBTSVpFICAgICA9ICQuREVTQyA/IHNhZmUoJ3NpemUnKSA6ICdzaXplJ1xuICAsIGlkICAgICAgID0gMDtcblxuZnVuY3Rpb24gZmFzdEtleShpdCwgY3JlYXRlKXtcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxuICBpZighaXNPYmplY3QoaXQpKXJldHVybiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xuICBpZighaGFzKGl0LCBJRCkpe1xuICAgIC8vIGNhbid0IHNldCBpZCB0byBmcm96ZW4gb2JqZWN0XG4gICAgaWYoIWlzRXh0ZW5zaWJsZShpdCkpcmV0dXJuICdGJztcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBpZFxuICAgIGlmKCFjcmVhdGUpcmV0dXJuICdFJztcbiAgICAvLyBhZGQgbWlzc2luZyBvYmplY3QgaWRcbiAgICBoaWRlKGl0LCBJRCwgKytpZCk7XG4gIC8vIHJldHVybiBvYmplY3QgaWQgd2l0aCBwcmVmaXhcbiAgfSByZXR1cm4gJ08nICsgaXRbSURdO1xufVxuXG5mdW5jdGlvbiBnZXRFbnRyeSh0aGF0LCBrZXkpe1xuICAvLyBmYXN0IGNhc2VcbiAgdmFyIGluZGV4ID0gZmFzdEtleShrZXkpLCBlbnRyeTtcbiAgaWYoaW5kZXggIT0gJ0YnKXJldHVybiB0aGF0W08xXVtpbmRleF07XG4gIC8vIGZyb3plbiBvYmplY3QgY2FzZVxuICBmb3IoZW50cnkgPSB0aGF0W0ZJUlNUXTsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XG4gICAgaWYoZW50cnkuayA9PSBrZXkpcmV0dXJuIGVudHJ5O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24oTkFNRSwgSVNfTUFQLCBBRERFUil7XG4gICAgZnVuY3Rpb24gQygpe1xuICAgICAgdmFyIHRoYXQgICAgID0gYXNzZXJ0Lmluc3QodGhpcywgQywgTkFNRSlcbiAgICAgICAgLCBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgIHNldCh0aGF0LCBPMSwgJC5jcmVhdGUobnVsbCkpO1xuICAgICAgc2V0KHRoYXQsIFNJWkUsIDApO1xuICAgICAgc2V0KHRoYXQsIExBU1QsIHVuZGVmaW5lZCk7XG4gICAgICBzZXQodGhhdCwgRklSU1QsIHVuZGVmaW5lZCk7XG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xuICAgIH1cbiAgICByZXF1aXJlKCcuLyQubWl4JykoQy5wcm90b3R5cGUsIHtcbiAgICAgIC8vIDIzLjEuMy4xIE1hcC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgLy8gMjMuMi4zLjIgU2V0LnByb3RvdHlwZS5jbGVhcigpXG4gICAgICBjbGVhcjogZnVuY3Rpb24gY2xlYXIoKXtcbiAgICAgICAgZm9yKHZhciB0aGF0ID0gdGhpcywgZGF0YSA9IHRoYXRbTzFdLCBlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcbiAgICAgICAgICBpZihlbnRyeS5wKWVudHJ5LnAgPSBlbnRyeS5wLm4gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhhdFtGSVJTVF0gPSB0aGF0W0xBU1RdID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGF0W1NJWkVdID0gMDtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuMyBNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXG4gICAgICAvLyAyMy4yLjMuNCBTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcbiAgICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgICB2YXIgdGhhdCAgPSB0aGlzXG4gICAgICAgICAgLCBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSk7XG4gICAgICAgIGlmKGVudHJ5KXtcbiAgICAgICAgICB2YXIgbmV4dCA9IGVudHJ5Lm5cbiAgICAgICAgICAgICwgcHJldiA9IGVudHJ5LnA7XG4gICAgICAgICAgZGVsZXRlIHRoYXRbTzFdW2VudHJ5LmldO1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcbiAgICAgICAgICBpZihuZXh0KW5leHQucCA9IHByZXY7XG4gICAgICAgICAgaWYodGhhdFtGSVJTVF0gPT0gZW50cnkpdGhhdFtGSVJTVF0gPSBuZXh0O1xuICAgICAgICAgIGlmKHRoYXRbTEFTVF0gPT0gZW50cnkpdGhhdFtMQVNUXSA9IHByZXY7XG4gICAgICAgICAgdGhhdFtTSVpFXS0tO1xuICAgICAgICB9IHJldHVybiAhIWVudHJ5O1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjIuMy42IFNldC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgLy8gMjMuMS4zLjUgTWFwLnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gICAgICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4gLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgICAgICB2YXIgZiA9IGN0eChjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0sIDMpXG4gICAgICAgICAgLCBlbnRyeTtcbiAgICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzW0ZJUlNUXSl7XG4gICAgICAgICAgZihlbnRyeS52LCBlbnRyeS5rLCB0aGlzKTtcbiAgICAgICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcbiAgICAgICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIDIzLjEuMy43IE1hcC5wcm90b3R5cGUuaGFzKGtleSlcbiAgICAgIC8vIDIzLjIuMy43IFNldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxuICAgICAgaGFzOiBmdW5jdGlvbiBoYXMoa2V5KXtcbiAgICAgICAgcmV0dXJuICEhZ2V0RW50cnkodGhpcywga2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZigkLkRFU0MpJC5zZXREZXNjKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGFzc2VydC5kZWYodGhpc1tTSVpFXSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEM7XG4gIH0sXG4gIGRlZjogZnVuY3Rpb24odGhhdCwga2V5LCB2YWx1ZSl7XG4gICAgdmFyIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KVxuICAgICAgLCBwcmV2LCBpbmRleDtcbiAgICAvLyBjaGFuZ2UgZXhpc3RpbmcgZW50cnlcbiAgICBpZihlbnRyeSl7XG4gICAgICBlbnRyeS52ID0gdmFsdWU7XG4gICAgLy8gY3JlYXRlIG5ldyBlbnRyeVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGF0W0xBU1RdID0gZW50cnkgPSB7XG4gICAgICAgIGk6IGluZGV4ID0gZmFzdEtleShrZXksIHRydWUpLCAvLyA8LSBpbmRleFxuICAgICAgICBrOiBrZXksICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0ga2V5XG4gICAgICAgIHY6IHZhbHVlLCAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxuICAgICAgICBwOiBwcmV2ID0gdGhhdFtMQVNUXSwgICAgICAgICAgLy8gPC0gcHJldmlvdXMgZW50cnlcbiAgICAgICAgbjogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgIC8vIDwtIG5leHQgZW50cnlcbiAgICAgICAgcjogZmFsc2UgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHJlbW92ZWRcbiAgICAgIH07XG4gICAgICBpZighdGhhdFtGSVJTVF0pdGhhdFtGSVJTVF0gPSBlbnRyeTtcbiAgICAgIGlmKHByZXYpcHJldi5uID0gZW50cnk7XG4gICAgICB0aGF0W1NJWkVdKys7XG4gICAgICAvLyBhZGQgdG8gaW5kZXhcbiAgICAgIGlmKGluZGV4ICE9ICdGJyl0aGF0W08xXVtpbmRleF0gPSBlbnRyeTtcbiAgICB9IHJldHVybiB0aGF0O1xuICB9LFxuICBnZXRFbnRyeTogZ2V0RW50cnksXG4gIC8vIGFkZCAua2V5cywgLnZhbHVlcywgLmVudHJpZXMsIFtAQGl0ZXJhdG9yXVxuICAvLyAyMy4xLjMuNCwgMjMuMS4zLjgsIDIzLjEuMy4xMSwgMjMuMS4zLjEyLCAyMy4yLjMuNSwgMjMuMi4zLjgsIDIzLjIuMy4xMCwgMjMuMi4zLjExXG4gIHNldEl0ZXI6IGZ1bmN0aW9uKEMsIE5BTUUsIElTX01BUCl7XG4gICAgcmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoQywgTkFNRSwgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xuICAgICAgc2V0KHRoaXMsIElURVIsIHtvOiBpdGVyYXRlZCwgazoga2luZH0pO1xuICAgIH0sIGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXG4gICAgICAgICwga2luZCAgPSBpdGVyLmtcbiAgICAgICAgLCBlbnRyeSA9IGl0ZXIubDtcbiAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XG4gICAgICAvLyBnZXQgbmV4dCBlbnRyeVxuICAgICAgaWYoIWl0ZXIubyB8fCAhKGl0ZXIubCA9IGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogaXRlci5vW0ZJUlNUXSkpe1xuICAgICAgICAvLyBvciBmaW5pc2ggdGhlIGl0ZXJhdGlvblxuICAgICAgICBpdGVyLm8gPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBzdGVwKDEpO1xuICAgICAgfVxuICAgICAgLy8gcmV0dXJuIHN0ZXAgYnkga2luZFxuICAgICAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBlbnRyeS5rKTtcbiAgICAgIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgZW50cnkudik7XG4gICAgICByZXR1cm4gc3RlcCgwLCBbZW50cnkuaywgZW50cnkudl0pO1xuICAgIH0sIElTX01BUCA/ICdlbnRyaWVzJyA6ICd2YWx1ZXMnICwgIUlTX01BUCwgdHJ1ZSk7XG4gIH1cbn07IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxudmFyICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgZm9yT2YgPSByZXF1aXJlKCcuLyQuZm9yLW9mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUpe1xuICAkZGVmKCRkZWYuUCwgTkFNRSwge1xuICAgIHRvSlNPTjogZnVuY3Rpb24gdG9KU09OKCl7XG4gICAgICB2YXIgYXJyID0gW107XG4gICAgICBmb3JPZih0aGlzLCBmYWxzZSwgYXJyLnB1c2gsIGFycik7XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH1cbiAgfSk7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIHNhZmUgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlXG4gICwgYXNzZXJ0ICAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXG4gICwgZm9yT2YgICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgX2hhcyAgICAgID0gJC5oYXNcbiAgLCBpc09iamVjdCAgPSAkLmlzT2JqZWN0XG4gICwgaGlkZSAgICAgID0gJC5oaWRlXG4gICwgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBpc09iamVjdFxuICAsIGlkICAgICAgICA9IDBcbiAgLCBJRCAgICAgICAgPSBzYWZlKCdpZCcpXG4gICwgV0VBSyAgICAgID0gc2FmZSgnd2VhaycpXG4gICwgTEVBSyAgICAgID0gc2FmZSgnbGVhaycpXG4gICwgbWV0aG9kICAgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKVxuICAsIGZpbmQgICAgICA9IG1ldGhvZCg1KVxuICAsIGZpbmRJbmRleCA9IG1ldGhvZCg2KTtcbmZ1bmN0aW9uIGZpbmRGcm96ZW4oc3RvcmUsIGtleSl7XG4gIHJldHVybiBmaW5kKHN0b3JlLmFycmF5LCBmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIGl0WzBdID09PSBrZXk7XG4gIH0pO1xufVxuLy8gZmFsbGJhY2sgZm9yIGZyb3plbiBrZXlzXG5mdW5jdGlvbiBsZWFrU3RvcmUodGhhdCl7XG4gIHJldHVybiB0aGF0W0xFQUtdIHx8IGhpZGUodGhhdCwgTEVBSywge1xuICAgIGFycmF5OiBbXSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGtleSl7XG4gICAgICB2YXIgZW50cnkgPSBmaW5kRnJvemVuKHRoaXMsIGtleSk7XG4gICAgICBpZihlbnRyeSlyZXR1cm4gZW50cnlbMV07XG4gICAgfSxcbiAgICBoYXM6IGZ1bmN0aW9uKGtleSl7XG4gICAgICByZXR1cm4gISFmaW5kRnJvemVuKHRoaXMsIGtleSk7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgICAgdmFyIGVudHJ5ID0gZmluZEZyb3plbih0aGlzLCBrZXkpO1xuICAgICAgaWYoZW50cnkpZW50cnlbMV0gPSB2YWx1ZTtcbiAgICAgIGVsc2UgdGhpcy5hcnJheS5wdXNoKFtrZXksIHZhbHVlXSk7XG4gICAgfSxcbiAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcbiAgICAgIHZhciBpbmRleCA9IGZpbmRJbmRleCh0aGlzLmFycmF5LCBmdW5jdGlvbihpdCl7XG4gICAgICAgIHJldHVybiBpdFswXSA9PT0ga2V5O1xuICAgICAgfSk7XG4gICAgICBpZih+aW5kZXgpdGhpcy5hcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgcmV0dXJuICEhfmluZGV4O1xuICAgIH1cbiAgfSlbTEVBS107XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24oTkFNRSwgSVNfTUFQLCBBRERFUil7XG4gICAgZnVuY3Rpb24gQygpe1xuICAgICAgJC5zZXQoYXNzZXJ0Lmluc3QodGhpcywgQywgTkFNRSksIElELCBpZCsrKTtcbiAgICAgIHZhciBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGlzW0FEREVSXSwgdGhpcyk7XG4gICAgfVxuICAgIHJlcXVpcmUoJy4vJC5taXgnKShDLnByb3RvdHlwZSwge1xuICAgICAgLy8gMjMuMy4zLjIgV2Vha01hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcbiAgICAgIC8vIDIzLjQuMy4zIFdlYWtTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcbiAgICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgICBpZighaXNPYmplY3Qoa2V5KSlyZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmKCFpc0V4dGVuc2libGUoa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpWydkZWxldGUnXShrZXkpO1xuICAgICAgICByZXR1cm4gX2hhcyhrZXksIFdFQUspICYmIF9oYXMoa2V5W1dFQUtdLCB0aGlzW0lEXSkgJiYgZGVsZXRlIGtleVtXRUFLXVt0aGlzW0lEXV07XG4gICAgICB9LFxuICAgICAgLy8gMjMuMy4zLjQgV2Vha01hcC5wcm90b3R5cGUuaGFzKGtleSlcbiAgICAgIC8vIDIzLjQuMy40IFdlYWtTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSl7XG4gICAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcbiAgICAgICAgaWYoIWlzRXh0ZW5zaWJsZShrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcykuaGFzKGtleSk7XG4gICAgICAgIHJldHVybiBfaGFzKGtleSwgV0VBSykgJiYgX2hhcyhrZXlbV0VBS10sIHRoaXNbSURdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gQztcbiAgfSxcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcbiAgICBpZighaXNFeHRlbnNpYmxlKGFzc2VydC5vYmooa2V5KSkpe1xuICAgICAgbGVha1N0b3JlKHRoYXQpLnNldChrZXksIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgX2hhcyhrZXksIFdFQUspIHx8IGhpZGUoa2V5LCBXRUFLLCB7fSk7XG4gICAgICBrZXlbV0VBS11bdGhhdFtJRF1dID0gdmFsdWU7XG4gICAgfSByZXR1cm4gdGhhdDtcbiAgfSxcbiAgbGVha1N0b3JlOiBsZWFrU3RvcmUsXG4gIFdFQUs6IFdFQUssXG4gIElEOiBJRFxufTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgQlVHR1kgPSByZXF1aXJlKCcuLyQuaXRlcicpLkJVR0dZXG4gICwgZm9yT2YgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcbiAgLCBzcGVjaWVzID0gcmVxdWlyZSgnLi8kLnNwZWNpZXMnKVxuICAsIGFzc2VydEluc3RhbmNlID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLmluc3Q7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTkFNRSwgbWV0aG9kcywgY29tbW9uLCBJU19NQVAsIElTX1dFQUspe1xuICB2YXIgQmFzZSAgPSAkLmdbTkFNRV1cbiAgICAsIEMgICAgID0gQmFzZVxuICAgICwgQURERVIgPSBJU19NQVAgPyAnc2V0JyA6ICdhZGQnXG4gICAgLCBwcm90byA9IEMgJiYgQy5wcm90b3R5cGVcbiAgICAsIE8gICAgID0ge307XG4gIGZ1bmN0aW9uIGZpeE1ldGhvZChLRVksIENIQUlOKXtcbiAgICBpZigkLkZXKXtcbiAgICAgIHZhciBtZXRob2QgPSBwcm90b1tLRVldO1xuICAgICAgcmVxdWlyZSgnLi8kLnJlZGVmJykocHJvdG8sIEtFWSwgZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHZhciByZXN1bHQgPSBtZXRob2QuY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEsIGIpO1xuICAgICAgICByZXR1cm4gQ0hBSU4gPyB0aGlzIDogcmVzdWx0O1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIGlmKCEkLmlzRnVuY3Rpb24oQykgfHwgIShJU19XRUFLIHx8ICFCVUdHWSAmJiBwcm90by5mb3JFYWNoICYmIHByb3RvLmVudHJpZXMpKXtcbiAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuICAgIEMgPSBjb21tb24uZ2V0Q29uc3RydWN0b3IoTkFNRSwgSVNfTUFQLCBBRERFUik7XG4gICAgcmVxdWlyZSgnLi8kLm1peCcpKEMucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaW5zdCAgPSBuZXcgQ1xuICAgICAgLCBjaGFpbiA9IGluc3RbQURERVJdKElTX1dFQUsgPyB7fSA6IC0wLCAxKVxuICAgICAgLCBidWdneVplcm87XG4gICAgLy8gd3JhcCBmb3IgaW5pdCBjb2xsZWN0aW9ucyBmcm9tIGl0ZXJhYmxlXG4gICAgaWYoIXJlcXVpcmUoJy4vJC5pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpeyBuZXcgQyhpdGVyKTsgfSkpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICAgICAgQyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGFzc2VydEluc3RhbmNlKHRoaXMsIEMsIE5BTUUpO1xuICAgICAgICB2YXIgdGhhdCAgICAgPSBuZXcgQmFzZVxuICAgICAgICAgICwgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGF0W0FEREVSXSwgdGhhdCk7XG4gICAgICAgIHJldHVybiB0aGF0O1xuICAgICAgfTtcbiAgICAgIEMucHJvdG90eXBlID0gcHJvdG87XG4gICAgICBpZigkLkZXKXByb3RvLmNvbnN0cnVjdG9yID0gQztcbiAgICB9XG4gICAgSVNfV0VBSyB8fCBpbnN0LmZvckVhY2goZnVuY3Rpb24odmFsLCBrZXkpe1xuICAgICAgYnVnZ3laZXJvID0gMSAvIGtleSA9PT0gLUluZmluaXR5O1xuICAgIH0pO1xuICAgIC8vIGZpeCBjb252ZXJ0aW5nIC0wIGtleSB0byArMFxuICAgIGlmKGJ1Z2d5WmVybyl7XG4gICAgICBmaXhNZXRob2QoJ2RlbGV0ZScpO1xuICAgICAgZml4TWV0aG9kKCdoYXMnKTtcbiAgICAgIElTX01BUCAmJiBmaXhNZXRob2QoJ2dldCcpO1xuICAgIH1cbiAgICAvLyArIGZpeCAuYWRkICYgLnNldCBmb3IgY2hhaW5pbmdcbiAgICBpZihidWdneVplcm8gfHwgY2hhaW4gIT09IGluc3QpZml4TWV0aG9kKEFEREVSLCB0cnVlKTtcbiAgfVxuXG4gIHJlcXVpcmUoJy4vJC5jb2YnKS5zZXQoQywgTkFNRSk7XG5cbiAgT1tOQU1FXSA9IEM7XG4gICRkZWYoJGRlZi5HICsgJGRlZi5XICsgJGRlZi5GICogKEMgIT0gQmFzZSksIE8pO1xuICBzcGVjaWVzKEMpO1xuICBzcGVjaWVzKCQuY29yZVtOQU1FXSk7IC8vIGZvciB3cmFwcGVyXG5cbiAgaWYoIUlTX1dFQUspY29tbW9uLnNldEl0ZXIoQywgTkFNRSwgSVNfTUFQKTtcblxuICByZXR1cm4gQztcbn07IiwiLy8gT3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYXNzZXJ0RnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYXNzZXJ0JykuZm47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xuICBhc3NlcnRGdW5jdGlvbihmbik7XG4gIGlmKH5sZW5ndGggJiYgdGhhdCA9PT0gdW5kZWZpbmVkKXJldHVybiBmbjtcbiAgc3dpdGNoKGxlbmd0aCl7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH0gcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn07IiwidmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGdsb2JhbCAgICAgPSAkLmdcbiAgLCBjb3JlICAgICAgID0gJC5jb3JlXG4gICwgaXNGdW5jdGlvbiA9ICQuaXNGdW5jdGlvblxuICAsICRyZWRlZiAgICAgPSByZXF1aXJlKCcuLyQucmVkZWYnKTtcbmZ1bmN0aW9uIGN0eChmbiwgdGhhdCl7XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufVxuZ2xvYmFsLmNvcmUgPSBjb3JlO1xuLy8gdHlwZSBiaXRtYXBcbiRkZWYuRiA9IDE7ICAvLyBmb3JjZWRcbiRkZWYuRyA9IDI7ICAvLyBnbG9iYWxcbiRkZWYuUyA9IDQ7ICAvLyBzdGF0aWNcbiRkZWYuUCA9IDg7ICAvLyBwcm90b1xuJGRlZi5CID0gMTY7IC8vIGJpbmRcbiRkZWYuVyA9IDMyOyAvLyB3cmFwXG5mdW5jdGlvbiAkZGVmKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBrZXksIG93biwgb3V0LCBleHBcbiAgICAsIGlzR2xvYmFsID0gdHlwZSAmICRkZWYuR1xuICAgICwgaXNQcm90byAgPSB0eXBlICYgJGRlZi5QXG4gICAgLCB0YXJnZXQgICA9IGlzR2xvYmFsID8gZ2xvYmFsIDogdHlwZSAmICRkZWYuU1xuICAgICAgICA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pLnByb3RvdHlwZVxuICAgICwgZXhwb3J0cyAgPSBpc0dsb2JhbCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pO1xuICBpZihpc0dsb2JhbClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gISh0eXBlICYgJGRlZi5GKSAmJiB0YXJnZXQgJiYga2V5IGluIHRhcmdldDtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICBpZih0eXBlICYgJGRlZi5CICYmIG93billeHAgPSBjdHgob3V0LCBnbG9iYWwpO1xuICAgIGVsc2UgZXhwID0gaXNQcm90byAmJiBpc0Z1bmN0aW9uKG91dCkgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICAvLyBleHRlbmQgZ2xvYmFsXG4gICAgaWYodGFyZ2V0ICYmICFvd24pJHJlZGVmKHRhcmdldCwga2V5LCBvdXQpO1xuICAgIC8vIGV4cG9ydFxuICAgIGlmKGV4cG9ydHNba2V5XSAhPSBvdXQpJC5oaWRlKGV4cG9ydHMsIGtleSwgZXhwKTtcbiAgICBpZihpc1Byb3RvKShleHBvcnRzLnByb3RvdHlwZSB8fCAoZXhwb3J0cy5wcm90b3R5cGUgPSB7fSkpW2tleV0gPSBvdXQ7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gJGRlZjsiLCJ2YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGRvY3VtZW50ID0gJC5nLmRvY3VtZW50XG4gICwgaXNPYmplY3QgPSAkLmlzT2JqZWN0XG4gIC8vIGluIG9sZCBJRSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0J1xuICAsIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59OyIsInZhciAkID0gcmVxdWlyZSgnLi8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIGtleXMgICAgICAgPSAkLmdldEtleXMoaXQpXG4gICAgLCBnZXREZXNjICAgID0gJC5nZXREZXNjXG4gICAgLCBnZXRTeW1ib2xzID0gJC5nZXRTeW1ib2xzO1xuICBpZihnZXRTeW1ib2xzKSQuZWFjaC5jYWxsKGdldFN5bWJvbHMoaXQpLCBmdW5jdGlvbihrZXkpe1xuICAgIGlmKGdldERlc2MoaXQsIGtleSkuZW51bWVyYWJsZSlrZXlzLnB1c2goa2V5KTtcbiAgfSk7XG4gIHJldHVybiBrZXlzO1xufTsiLCJ2YXIgY3R4ICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIGdldCAgPSByZXF1aXJlKCcuLyQuaXRlcicpLmdldFxuICAsIGNhbGwgPSByZXF1aXJlKCcuLyQuaXRlci1jYWxsJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhYmxlLCBlbnRyaWVzLCBmbiwgdGhhdCl7XG4gIHZhciBpdGVyYXRvciA9IGdldChpdGVyYWJsZSlcbiAgICAsIGYgICAgICAgID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpXG4gICAgLCBzdGVwO1xuICB3aGlsZSghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpe1xuICAgIGlmKGNhbGwoaXRlcmF0b3IsIGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpID09PSBmYWxzZSl7XG4gICAgICByZXR1cm4gY2FsbC5jbG9zZShpdGVyYXRvcik7XG4gICAgfVxuICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJCl7XG4gICQuRlcgICA9IHRydWU7XG4gICQucGF0aCA9ICQuZztcbiAgcmV0dXJuICQ7XG59OyIsIi8vIEZhc3QgYXBwbHlcbi8vIGh0dHA6Ly9qc3BlcmYubG5raXQuY29tL2Zhc3QtYXBwbHkvNVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgYXJncywgdGhhdCl7XG4gIHZhciB1biA9IHRoYXQgPT09IHVuZGVmaW5lZDtcbiAgc3dpdGNoKGFyZ3MubGVuZ3RoKXtcbiAgICBjYXNlIDA6IHJldHVybiB1biA/IGZuKClcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCk7XG4gICAgY2FzZSAxOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdKTtcbiAgICBjYXNlIDI6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gICAgY2FzZSA0OiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKTtcbiAgICBjYXNlIDU6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10sIGFyZ3NbNF0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10sIGFyZ3NbNF0pO1xuICB9IHJldHVybiAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncyk7XG59OyIsInZhciBhc3NlcnRPYmplY3QgPSByZXF1aXJlKCcuLyQuYXNzZXJ0Jykub2JqO1xuZnVuY3Rpb24gY2xvc2UoaXRlcmF0b3Ipe1xuICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xuICBpZihyZXQgIT09IHVuZGVmaW5lZClhc3NlcnRPYmplY3QocmV0LmNhbGwoaXRlcmF0b3IpKTtcbn1cbmZ1bmN0aW9uIGNhbGwoaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGVudHJpZXMgPyBmbihhc3NlcnRPYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIH0gY2F0Y2goZSl7XG4gICAgY2xvc2UoaXRlcmF0b3IpO1xuICAgIHRocm93IGU7XG4gIH1cbn1cbmNhbGwuY2xvc2UgPSBjbG9zZTtcbm1vZHVsZS5leHBvcnRzID0gY2FsbDsiLCJ2YXIgJGRlZiAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJHJlZGVmICAgICAgICAgID0gcmVxdWlyZSgnLi8kLnJlZGVmJylcbiAgLCAkICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNvZiAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsICRpdGVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJylcbiAgLCBTWU1CT0xfSVRFUkFUT1IgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBGRl9JVEVSQVRPUiAgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBLRVlTICAgICAgICAgICAgPSAna2V5cydcbiAgLCBWQUxVRVMgICAgICAgICAgPSAndmFsdWVzJ1xuICAsIEl0ZXJhdG9ycyAgICAgICA9ICRpdGVyLkl0ZXJhdG9ycztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0Upe1xuICAkaXRlci5jcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuICBmdW5jdGlvbiBjcmVhdGVNZXRob2Qoa2luZCl7XG4gICAgZnVuY3Rpb24gJCQodGhhdCl7XG4gICAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoYXQsIGtpbmQpO1xuICAgIH1cbiAgICBzd2l0Y2goa2luZCl7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCl7IHJldHVybiAkJCh0aGlzKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiAkJCh0aGlzKTsgfTtcbiAgICB9IHJldHVybiBmdW5jdGlvbiBlbnRyaWVzKCl7IHJldHVybiAkJCh0aGlzKTsgfTtcbiAgfVxuICB2YXIgVEFHICAgICAgPSBOQU1FICsgJyBJdGVyYXRvcidcbiAgICAsIHByb3RvICAgID0gQmFzZS5wcm90b3R5cGVcbiAgICAsIF9uYXRpdmUgID0gcHJvdG9bU1lNQk9MX0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxuICAgICwgX2RlZmF1bHQgPSBfbmF0aXZlIHx8IGNyZWF0ZU1ldGhvZChERUZBVUxUKVxuICAgICwgbWV0aG9kcywga2V5O1xuICAvLyBGaXggbmF0aXZlXG4gIGlmKF9uYXRpdmUpe1xuICAgIHZhciBJdGVyYXRvclByb3RvdHlwZSA9ICQuZ2V0UHJvdG8oX2RlZmF1bHQuY2FsbChuZXcgQmFzZSkpO1xuICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcbiAgICBjb2Yuc2V0KEl0ZXJhdG9yUHJvdG90eXBlLCBUQUcsIHRydWUpO1xuICAgIC8vIEZGIGZpeFxuICAgIGlmKCQuRlcgJiYgJC5oYXMocHJvdG8sIEZGX0lURVJBVE9SKSkkaXRlci5zZXQoSXRlcmF0b3JQcm90b3R5cGUsICQudGhhdCk7XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmKCQuRlcpJGl0ZXIuc2V0KHByb3RvLCBfZGVmYXVsdCk7XG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcbiAgSXRlcmF0b3JzW05BTUVdID0gX2RlZmF1bHQ7XG4gIEl0ZXJhdG9yc1tUQUddICA9ICQudGhhdDtcbiAgaWYoREVGQVVMVCl7XG4gICAgbWV0aG9kcyA9IHtcbiAgICAgIGtleXM6ICAgIElTX1NFVCAgICAgICAgICAgID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoS0VZUyksXG4gICAgICB2YWx1ZXM6ICBERUZBVUxUID09IFZBTFVFUyA/IF9kZWZhdWx0IDogY3JlYXRlTWV0aG9kKFZBTFVFUyksXG4gICAgICBlbnRyaWVzOiBERUZBVUxUICE9IFZBTFVFUyA/IF9kZWZhdWx0IDogY3JlYXRlTWV0aG9kKCdlbnRyaWVzJylcbiAgICB9O1xuICAgIGlmKEZPUkNFKWZvcihrZXkgaW4gbWV0aG9kcyl7XG4gICAgICBpZighKGtleSBpbiBwcm90bykpJHJlZGVmKHByb3RvLCBrZXksIG1ldGhvZHNba2V5XSk7XG4gICAgfSBlbHNlICRkZWYoJGRlZi5QICsgJGRlZi5GICogJGl0ZXIuQlVHR1ksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG59OyIsInZhciBTWU1CT0xfSVRFUkFUT1IgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBTQUZFX0NMT1NJTkcgICAgPSBmYWxzZTtcbnRyeSB7XG4gIHZhciByaXRlciA9IFs3XVtTWU1CT0xfSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uKCl7IFNBRkVfQ0xPU0lORyA9IHRydWU7IH07XG4gIEFycmF5LmZyb20ocml0ZXIsIGZ1bmN0aW9uKCl7IHRocm93IDI7IH0pO1xufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcbiAgaWYoIVNBRkVfQ0xPU0lORylyZXR1cm4gZmFsc2U7XG4gIHZhciBzYWZlID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIGFyciAgPSBbN11cbiAgICAgICwgaXRlciA9IGFycltTWU1CT0xfSVRFUkFUT1JdKCk7XG4gICAgaXRlci5uZXh0ID0gZnVuY3Rpb24oKXsgc2FmZSA9IHRydWU7IH07XG4gICAgYXJyW1NZTUJPTF9JVEVSQVRPUl0gPSBmdW5jdGlvbigpeyByZXR1cm4gaXRlcjsgfTtcbiAgICBleGVjKGFycik7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgcmV0dXJuIHNhZmU7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY29mICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCBhc3NlcnRPYmplY3QgICAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5vYmpcbiAgLCBTWU1CT0xfSVRFUkFUT1IgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEZGX0lURVJBVE9SICAgICAgID0gJ0BAaXRlcmF0b3InXG4gICwgSXRlcmF0b3JzICAgICAgICAgPSB7fVxuICAsIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxuc2V0SXRlcmF0b3IoSXRlcmF0b3JQcm90b3R5cGUsICQudGhhdCk7XG5mdW5jdGlvbiBzZXRJdGVyYXRvcihPLCB2YWx1ZSl7XG4gICQuaGlkZShPLCBTWU1CT0xfSVRFUkFUT1IsIHZhbHVlKTtcbiAgLy8gQWRkIGl0ZXJhdG9yIGZvciBGRiBpdGVyYXRvciBwcm90b2NvbFxuICBpZihGRl9JVEVSQVRPUiBpbiBbXSkkLmhpZGUoTywgRkZfSVRFUkFUT1IsIHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIFNhZmFyaSBoYXMgYnVnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcbiAgQlVHR1k6ICdrZXlzJyBpbiBbXSAmJiAhKCduZXh0JyBpbiBbXS5rZXlzKCkpLFxuICBJdGVyYXRvcnM6IEl0ZXJhdG9ycyxcbiAgc3RlcDogZnVuY3Rpb24oZG9uZSwgdmFsdWUpe1xuICAgIHJldHVybiB7dmFsdWU6IHZhbHVlLCBkb25lOiAhIWRvbmV9O1xuICB9LFxuICBpczogZnVuY3Rpb24oaXQpe1xuICAgIHZhciBPICAgICAgPSBPYmplY3QoaXQpXG4gICAgICAsIFN5bWJvbCA9ICQuZy5TeW1ib2xcbiAgICAgICwgU1lNICAgID0gU3ltYm9sICYmIFN5bWJvbC5pdGVyYXRvciB8fCBGRl9JVEVSQVRPUjtcbiAgICByZXR1cm4gU1lNIGluIE8gfHwgU1lNQk9MX0lURVJBVE9SIGluIE8gfHwgJC5oYXMoSXRlcmF0b3JzLCBjb2YuY2xhc3NvZihPKSk7XG4gIH0sXG4gIGdldDogZnVuY3Rpb24oaXQpe1xuICAgIHZhciBTeW1ib2wgID0gJC5nLlN5bWJvbFxuICAgICAgLCBleHQgICAgID0gaXRbU3ltYm9sICYmIFN5bWJvbC5pdGVyYXRvciB8fCBGRl9JVEVSQVRPUl1cbiAgICAgICwgZ2V0SXRlciA9IGV4dCB8fCBpdFtTWU1CT0xfSVRFUkFUT1JdIHx8IEl0ZXJhdG9yc1tjb2YuY2xhc3NvZihpdCldO1xuICAgIHJldHVybiBhc3NlcnRPYmplY3QoZ2V0SXRlci5jYWxsKGl0KSk7XG4gIH0sXG4gIHNldDogc2V0SXRlcmF0b3IsXG4gIGNyZWF0ZTogZnVuY3Rpb24oQ29uc3RydWN0b3IsIE5BTUUsIG5leHQsIHByb3RvKXtcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSAkLmNyZWF0ZShwcm90byB8fCBJdGVyYXRvclByb3RvdHlwZSwge25leHQ6ICQuZGVzYygxLCBuZXh0KX0pO1xuICAgIGNvZi5zZXQoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdsb2JhbCA9IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKClcbiAgLCBjb3JlICAgPSB7fVxuICAsIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XG4gICwgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eVxuICAsIGNlaWwgID0gTWF0aC5jZWlsXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yXG4gICwgbWF4ICAgPSBNYXRoLm1heFxuICAsIG1pbiAgID0gTWF0aC5taW47XG4vLyBUaGUgZW5naW5lIHdvcmtzIGZpbmUgd2l0aCBkZXNjcmlwdG9ycz8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eS5cbnZhciBERVNDID0gISFmdW5jdGlvbigpe1xuICB0cnkge1xuICAgIHJldHVybiBkZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gMjsgfX0pLmEgPT0gMjtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxufSgpO1xudmFyIGhpZGUgPSBjcmVhdGVEZWZpbmVyKDEpO1xuLy8gNy4xLjQgVG9JbnRlZ2VyXG5mdW5jdGlvbiB0b0ludGVnZXIoaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn1cbmZ1bmN0aW9uIGRlc2MoYml0bWFwLCB2YWx1ZSl7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxuICB9O1xufVxuZnVuY3Rpb24gc2ltcGxlU2V0KG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59XG5mdW5jdGlvbiBjcmVhdGVEZWZpbmVyKGJpdG1hcCl7XG4gIHJldHVybiBERVNDID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgICByZXR1cm4gJC5zZXREZXNjKG9iamVjdCwga2V5LCBkZXNjKGJpdG1hcCwgdmFsdWUpKTtcbiAgfSA6IHNpbXBsZVNldDtcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoaXQpe1xuICByZXR1cm4gaXQgIT09IG51bGwgJiYgKHR5cGVvZiBpdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2YgaXQgPT0gJ2Z1bmN0aW9uJyk7XG59XG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gYXNzZXJ0RGVmaW5lZChpdCl7XG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn1cblxudmFyICQgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5mdycpKHtcbiAgZzogZ2xvYmFsLFxuICBjb3JlOiBjb3JlLFxuICBodG1sOiBnbG9iYWwuZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAvLyBodHRwOi8vanNwZXJmLmNvbS9jb3JlLWpzLWlzb2JqZWN0XG4gIGlzT2JqZWN0OiAgIGlzT2JqZWN0LFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpdDogZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiBpdDtcbiAgfSxcbiAgdGhhdDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgLy8gNy4xLjQgVG9JbnRlZ2VyXG4gIHRvSW50ZWdlcjogdG9JbnRlZ2VyLFxuICAvLyA3LjEuMTUgVG9MZW5ndGhcbiAgdG9MZW5ndGg6IGZ1bmN0aW9uKGl0KXtcbiAgICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxuICB9LFxuICB0b0luZGV4OiBmdW5jdGlvbihpbmRleCwgbGVuZ3RoKXtcbiAgICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gICAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XG4gIH0sXG4gIGhhczogZnVuY3Rpb24oaXQsIGtleSl7XG4gICAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG4gIH0sXG4gIGNyZWF0ZTogICAgIE9iamVjdC5jcmVhdGUsXG4gIGdldFByb3RvOiAgIE9iamVjdC5nZXRQcm90b3R5cGVPZixcbiAgREVTQzogICAgICAgREVTQyxcbiAgZGVzYzogICAgICAgZGVzYyxcbiAgZ2V0RGVzYzogICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgc2V0RGVzYzogICAgZGVmaW5lUHJvcGVydHksXG4gIHNldERlc2NzOiAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzLFxuICBnZXRLZXlzOiAgICBPYmplY3Qua2V5cyxcbiAgZ2V0TmFtZXM6ICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMsXG4gIGdldFN5bWJvbHM6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXG4gIGFzc2VydERlZmluZWQ6IGFzc2VydERlZmluZWQsXG4gIC8vIER1bW15LCBmaXggZm9yIG5vdCBhcnJheS1saWtlIEVTMyBzdHJpbmcgaW4gZXM1IG1vZHVsZVxuICBFUzVPYmplY3Q6IE9iamVjdCxcbiAgdG9PYmplY3Q6IGZ1bmN0aW9uKGl0KXtcbiAgICByZXR1cm4gJC5FUzVPYmplY3QoYXNzZXJ0RGVmaW5lZChpdCkpO1xuICB9LFxuICBoaWRlOiBoaWRlLFxuICBkZWY6IGNyZWF0ZURlZmluZXIoMCksXG4gIHNldDogZ2xvYmFsLlN5bWJvbCA/IHNpbXBsZVNldCA6IGhpZGUsXG4gIGVhY2g6IFtdLmZvckVhY2hcbn0pO1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbmlmKHR5cGVvZiBfX2UgIT0gJ3VuZGVmaW5lZCcpX19lID0gY29yZTtcbmlmKHR5cGVvZiBfX2cgIT0gJ3VuZGVmaW5lZCcpX19nID0gZ2xvYmFsOyIsInZhciAkID0gcmVxdWlyZSgnLi8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgZWwpe1xuICB2YXIgTyAgICAgID0gJC50b09iamVjdChvYmplY3QpXG4gICAgLCBrZXlzICAgPSAkLmdldEtleXMoTylcbiAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgLCBpbmRleCAgPSAwXG4gICAgLCBrZXk7XG4gIHdoaWxlKGxlbmd0aCA+IGluZGV4KWlmKE9ba2V5ID0ga2V5c1tpbmRleCsrXV0gPT09IGVsKXJldHVybiBrZXk7XG59OyIsInZhciAkcmVkZWYgPSByZXF1aXJlKCcuLyQucmVkZWYnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XHJcbiAgZm9yKHZhciBrZXkgaW4gc3JjKSRyZWRlZih0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xyXG4gIHJldHVybiB0YXJnZXQ7XHJcbn07IiwidmFyICQgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgYXNzZXJ0T2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9iajtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gb3duS2V5cyhpdCl7XG4gIGFzc2VydE9iamVjdChpdCk7XG4gIHZhciBrZXlzICAgICAgID0gJC5nZXROYW1lcyhpdClcbiAgICAsIGdldFN5bWJvbHMgPSAkLmdldFN5bWJvbHM7XG4gIHJldHVybiBnZXRTeW1ib2xzID8ga2V5cy5jb25jYXQoZ2V0U3ltYm9scyhpdCkpIDoga2V5cztcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgaW52b2tlID0gcmVxdWlyZSgnLi8kLmludm9rZScpXG4gICwgYXNzZXJ0RnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYXNzZXJ0JykuZm47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKC8qIC4uLnBhcmdzICovKXtcbiAgdmFyIGZuICAgICA9IGFzc2VydEZ1bmN0aW9uKHRoaXMpXG4gICAgLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBwYXJncyAgPSBBcnJheShsZW5ndGgpXG4gICAgLCBpICAgICAgPSAwXG4gICAgLCBfICAgICAgPSAkLnBhdGguX1xuICAgICwgaG9sZGVyID0gZmFsc2U7XG4gIHdoaWxlKGxlbmd0aCA+IGkpaWYoKHBhcmdzW2ldID0gYXJndW1lbnRzW2krK10pID09PSBfKWhvbGRlciA9IHRydWU7XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICB2YXIgdGhhdCAgICA9IHRoaXNcbiAgICAgICwgX2xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgICwgaiA9IDAsIGsgPSAwLCBhcmdzO1xuICAgIGlmKCFob2xkZXIgJiYgIV9sZW5ndGgpcmV0dXJuIGludm9rZShmbiwgcGFyZ3MsIHRoYXQpO1xuICAgIGFyZ3MgPSBwYXJncy5zbGljZSgpO1xuICAgIGlmKGhvbGRlcilmb3IoO2xlbmd0aCA+IGo7IGorKylpZihhcmdzW2pdID09PSBfKWFyZ3Nbal0gPSBhcmd1bWVudHNbaysrXTtcbiAgICB3aGlsZShfbGVuZ3RoID4gaylhcmdzLnB1c2goYXJndW1lbnRzW2srK10pO1xuICAgIHJldHVybiBpbnZva2UoZm4sIGFyZ3MsIHRoYXQpO1xuICB9O1xufTsiLCJ2YXIgJCAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIHRwbCA9IFN0cmluZyh7fS5oYXNPd25Qcm9wZXJ0eSlcclxuICAsIFNSQyA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdzcmMnKVxyXG4gICwgX3RvU3RyaW5nID0gRnVuY3Rpb24udG9TdHJpbmc7XHJcblxyXG5mdW5jdGlvbiAkcmVkZWYoTywga2V5LCB2YWwsIHNhZmUpe1xyXG4gIGlmKCQuaXNGdW5jdGlvbih2YWwpKXtcclxuICAgIHZhciBiYXNlID0gT1trZXldO1xyXG4gICAgJC5oaWRlKHZhbCwgU1JDLCBiYXNlID8gU3RyaW5nKGJhc2UpIDogdHBsLnJlcGxhY2UoL2hhc093blByb3BlcnR5LywgU3RyaW5nKGtleSkpKTtcclxuICB9XHJcbiAgaWYoTyA9PT0gJC5nKXtcclxuICAgIE9ba2V5XSA9IHZhbDtcclxuICB9IGVsc2Uge1xyXG4gICAgaWYoIXNhZmUpZGVsZXRlIE9ba2V5XTtcclxuICAgICQuaGlkZShPLCBrZXksIHZhbCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBhZGQgZmFrZSBGdW5jdGlvbiN0b1N0cmluZyBmb3IgY29ycmVjdCB3b3JrIHdyYXBwZWQgbWV0aG9kcyAvIGNvbnN0cnVjdG9yc1xyXG4vLyB3aXRoIG1ldGhvZHMgc2ltaWxhciB0byBMb0Rhc2ggaXNOYXRpdmVcclxuJHJlZGVmKEZ1bmN0aW9uLnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKXtcclxuICByZXR1cm4gJC5oYXModGhpcywgU1JDKSA/IHRoaXNbU1JDXSA6IF90b1N0cmluZy5jYWxsKHRoaXMpO1xyXG59KTtcclxuXHJcbiQuY29yZS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24oaXQpe1xyXG4gIHJldHVybiBfdG9TdHJpbmcuY2FsbChpdCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9ICRyZWRlZjsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHJlZ0V4cCwgcmVwbGFjZSwgaXNTdGF0aWMpe1xuICB2YXIgcmVwbGFjZXIgPSByZXBsYWNlID09PSBPYmplY3QocmVwbGFjZSkgPyBmdW5jdGlvbihwYXJ0KXtcbiAgICByZXR1cm4gcmVwbGFjZVtwYXJ0XTtcbiAgfSA6IHJlcGxhY2U7XG4gIHJldHVybiBmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIFN0cmluZyhpc1N0YXRpYyA/IGl0IDogdGhpcykucmVwbGFjZShyZWdFeHAsIHJlcGxhY2VyKTtcbiAgfTtcbn07IiwiLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgYXNzZXJ0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpO1xuZnVuY3Rpb24gY2hlY2soTywgcHJvdG8pe1xuICBhc3NlcnQub2JqKE8pO1xuICBhc3NlcnQocHJvdG8gPT09IG51bGwgfHwgJC5pc09iamVjdChwcm90byksIHByb3RvLCBcIjogY2FuJ3Qgc2V0IGFzIHByb3RvdHlwZSFcIik7XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICA/IGZ1bmN0aW9uKGJ1Z2d5LCBzZXQpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHNldCA9IHJlcXVpcmUoJy4vJC5jdHgnKShGdW5jdGlvbi5jYWxsLCAkLmdldERlc2MoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XG4gICAgICAgICAgc2V0KHt9LCBbXSk7XG4gICAgICAgIH0gY2F0Y2goZSl7IGJ1Z2d5ID0gdHJ1ZTsgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pe1xuICAgICAgICAgIGNoZWNrKE8sIHByb3RvKTtcbiAgICAgICAgICBpZihidWdneSlPLl9fcHJvdG9fXyA9IHByb3RvO1xuICAgICAgICAgIGVsc2Ugc2V0KE8sIHByb3RvKTtcbiAgICAgICAgICByZXR1cm4gTztcbiAgICAgICAgfTtcbiAgICAgIH0oKVxuICAgIDogdW5kZWZpbmVkKSxcbiAgY2hlY2s6IGNoZWNrXG59OyIsInZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBTUEVDSUVTID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEMpe1xuICBpZigkLkRFU0MgJiYgIShTUEVDSUVTIGluIEMpKSQuc2V0RGVzYyhDLCBTUEVDSUVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogJC50aGF0XG4gIH0pO1xufTsiLCIvLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxudmFyICQgPSByZXF1aXJlKCcuLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVE9fU1RSSU5HKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoYXQsIHBvcyl7XG4gICAgdmFyIHMgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoYXQpKVxuICAgICAgLCBpID0gJC50b0ludGVnZXIocG9zKVxuICAgICAgLCBsID0gcy5sZW5ndGhcbiAgICAgICwgYSwgYjtcbiAgICBpZihpIDwgMCB8fCBpID49IGwpcmV0dXJuIFRPX1NUUklORyA/ICcnIDogdW5kZWZpbmVkO1xuICAgIGEgPSBzLmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbFxuICAgICAgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXG4gICAgICAgID8gVE9fU1RSSU5HID8gcy5jaGFyQXQoaSkgOiBhXG4gICAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTsiLCIvLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1zdHJhd21hbjpzdHJpbmdfcGFkZGluZ1xudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgcmVwZWF0ID0gcmVxdWlyZSgnLi8kLnN0cmluZy1yZXBlYXQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0aGF0LCBtaW5MZW5ndGgsIGZpbGxDaGFyLCBsZWZ0KXtcbiAgLy8gMS4gTGV0IE8gYmUgQ2hlY2tPYmplY3RDb2VyY2libGUodGhpcyB2YWx1ZSkuXG4gIC8vIDIuIExldCBTIGJlIFRvU3RyaW5nKE8pLlxuICB2YXIgUyA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhhdCkpO1xuICAvLyA0LiBJZiBpbnRNaW5MZW5ndGggaXMgdW5kZWZpbmVkLCByZXR1cm4gUy5cbiAgaWYobWluTGVuZ3RoID09PSB1bmRlZmluZWQpcmV0dXJuIFM7XG4gIC8vIDQuIExldCBpbnRNaW5MZW5ndGggYmUgVG9JbnRlZ2VyKG1pbkxlbmd0aCkuXG4gIHZhciBpbnRNaW5MZW5ndGggPSAkLnRvSW50ZWdlcihtaW5MZW5ndGgpO1xuICAvLyA1LiBMZXQgZmlsbExlbiBiZSB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgaW4gUyBtaW51cyBpbnRNaW5MZW5ndGguXG4gIHZhciBmaWxsTGVuID0gaW50TWluTGVuZ3RoIC0gUy5sZW5ndGg7XG4gIC8vIDYuIElmIGZpbGxMZW4gPCAwLCB0aGVuIHRocm93IGEgUmFuZ2VFcnJvciBleGNlcHRpb24uXG4gIC8vIDcuIElmIGZpbGxMZW4gaXMgK+KIniwgdGhlbiB0aHJvdyBhIFJhbmdlRXJyb3IgZXhjZXB0aW9uLlxuICBpZihmaWxsTGVuIDwgMCB8fCBmaWxsTGVuID09PSBJbmZpbml0eSl7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0Nhbm5vdCBzYXRpc2Z5IHN0cmluZyBsZW5ndGggJyArIG1pbkxlbmd0aCArICcgZm9yIHN0cmluZzogJyArIFMpO1xuICB9XG4gIC8vIDguIExldCBzRmlsbFN0ciBiZSB0aGUgc3RyaW5nIHJlcHJlc2VudGVkIGJ5IGZpbGxTdHIuXG4gIC8vIDkuIElmIHNGaWxsU3RyIGlzIHVuZGVmaW5lZCwgbGV0IHNGaWxsU3RyIGJlIGEgc3BhY2UgY2hhcmFjdGVyLlxuICB2YXIgc0ZpbGxTdHIgPSBmaWxsQ2hhciA9PT0gdW5kZWZpbmVkID8gJyAnIDogU3RyaW5nKGZpbGxDaGFyKTtcbiAgLy8gMTAuIExldCBzRmlsbFZhbCBiZSBhIFN0cmluZyBtYWRlIG9mIHNGaWxsU3RyLCByZXBlYXRlZCB1bnRpbCBmaWxsTGVuIGlzIG1ldC5cbiAgdmFyIHNGaWxsVmFsID0gcmVwZWF0LmNhbGwoc0ZpbGxTdHIsIE1hdGguY2VpbChmaWxsTGVuIC8gc0ZpbGxTdHIubGVuZ3RoKSk7XG4gIC8vIHRydW5jYXRlIGlmIHdlIG92ZXJmbG93ZWRcbiAgaWYoc0ZpbGxWYWwubGVuZ3RoID4gZmlsbExlbilzRmlsbFZhbCA9IGxlZnRcbiAgICA/IHNGaWxsVmFsLnNsaWNlKHNGaWxsVmFsLmxlbmd0aCAtIGZpbGxMZW4pXG4gICAgOiBzRmlsbFZhbC5zbGljZSgwLCBmaWxsTGVuKTtcbiAgLy8gMTEuIFJldHVybiBhIHN0cmluZyBtYWRlIGZyb20gc0ZpbGxWYWwsIGZvbGxvd2VkIGJ5IFMuXG4gIC8vIDExLiBSZXR1cm4gYSBTdHJpbmcgbWFkZSBmcm9tIFMsIGZvbGxvd2VkIGJ5IHNGaWxsVmFsLlxuICByZXR1cm4gbGVmdCA/IHNGaWxsVmFsLmNvbmNhdChTKSA6IFMuY29uY2F0KHNGaWxsVmFsKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgPSByZXF1aXJlKCcuLyQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXBlYXQoY291bnQpe1xuICB2YXIgc3RyID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcbiAgICAsIHJlcyA9ICcnXG4gICAgLCBuICAgPSAkLnRvSW50ZWdlcihjb3VudCk7XG4gIGlmKG4gPCAwIHx8IG4gPT0gSW5maW5pdHkpdGhyb3cgUmFuZ2VFcnJvcihcIkNvdW50IGNhbid0IGJlIG5lZ2F0aXZlXCIpO1xuICBmb3IoO24gPiAwOyAobiA+Pj49IDEpICYmIChzdHIgKz0gc3RyKSlpZihuICYgMSlyZXMgKz0gc3RyO1xuICByZXR1cm4gcmVzO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjdHggICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBjb2YgICAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCBpbnZva2UgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcbiAgLCBjZWwgICAgPSByZXF1aXJlKCcuLyQuZG9tLWNyZWF0ZScpXG4gICwgZ2xvYmFsICAgICAgICAgICAgID0gJC5nXG4gICwgaXNGdW5jdGlvbiAgICAgICAgID0gJC5pc0Z1bmN0aW9uXG4gICwgaHRtbCAgICAgICAgICAgICAgID0gJC5odG1sXG4gICwgcHJvY2VzcyAgICAgICAgICAgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBzZXRUYXNrICAgICAgICAgICAgPSBnbG9iYWwuc2V0SW1tZWRpYXRlXG4gICwgY2xlYXJUYXNrICAgICAgICAgID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlXG4gICwgcG9zdE1lc3NhZ2UgICAgICAgID0gZ2xvYmFsLnBvc3RNZXNzYWdlXG4gICwgYWRkRXZlbnRMaXN0ZW5lciAgID0gZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXJcbiAgLCBNZXNzYWdlQ2hhbm5lbCAgICAgPSBnbG9iYWwuTWVzc2FnZUNoYW5uZWxcbiAgLCBjb3VudGVyICAgICAgICAgICAgPSAwXG4gICwgcXVldWUgICAgICAgICAgICAgID0ge31cbiAgLCBPTlJFQURZU1RBVEVDSEFOR0UgPSAnb25yZWFkeXN0YXRlY2hhbmdlJ1xuICAsIGRlZmVyLCBjaGFubmVsLCBwb3J0O1xuZnVuY3Rpb24gcnVuKCl7XG4gIHZhciBpZCA9ICt0aGlzO1xuICBpZigkLmhhcyhxdWV1ZSwgaWQpKXtcbiAgICB2YXIgZm4gPSBxdWV1ZVtpZF07XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgICBmbigpO1xuICB9XG59XG5mdW5jdGlvbiBsaXN0bmVyKGV2ZW50KXtcbiAgcnVuLmNhbGwoZXZlbnQuZGF0YSk7XG59XG4vLyBOb2RlLmpzIDAuOSsgJiBJRTEwKyBoYXMgc2V0SW1tZWRpYXRlLCBvdGhlcndpc2U6XG5pZighaXNGdW5jdGlvbihzZXRUYXNrKSB8fCAhaXNGdW5jdGlvbihjbGVhclRhc2spKXtcbiAgc2V0VGFzayA9IGZ1bmN0aW9uKGZuKXtcbiAgICB2YXIgYXJncyA9IFtdLCBpID0gMTtcbiAgICB3aGlsZShhcmd1bWVudHMubGVuZ3RoID4gaSlhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xuICAgIHF1ZXVlWysrY291bnRlcl0gPSBmdW5jdGlvbigpe1xuICAgICAgaW52b2tlKGlzRnVuY3Rpb24oZm4pID8gZm4gOiBGdW5jdGlvbihmbiksIGFyZ3MpO1xuICAgIH07XG4gICAgZGVmZXIoY291bnRlcik7XG4gICAgcmV0dXJuIGNvdW50ZXI7XG4gIH07XG4gIGNsZWFyVGFzayA9IGZ1bmN0aW9uKGlkKXtcbiAgICBkZWxldGUgcXVldWVbaWRdO1xuICB9O1xuICAvLyBOb2RlLmpzIDAuOC1cbiAgaWYoY29mKHByb2Nlc3MpID09ICdwcm9jZXNzJyl7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGN0eChydW4sIGlkLCAxKSk7XG4gICAgfTtcbiAgLy8gTW9kZXJuIGJyb3dzZXJzLCBza2lwIGltcGxlbWVudGF0aW9uIGZvciBXZWJXb3JrZXJzXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzIG9iamVjdFxuICB9IGVsc2UgaWYoYWRkRXZlbnRMaXN0ZW5lciAmJiBpc0Z1bmN0aW9uKHBvc3RNZXNzYWdlKSAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMpe1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgcG9zdE1lc3NhZ2UoaWQsICcqJyk7XG4gICAgfTtcbiAgICBhZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdG5lciwgZmFsc2UpO1xuICAvLyBXZWJXb3JrZXJzXG4gIH0gZWxzZSBpZihpc0Z1bmN0aW9uKE1lc3NhZ2VDaGFubmVsKSl7XG4gICAgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcbiAgICBwb3J0ICAgID0gY2hhbm5lbC5wb3J0MjtcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGxpc3RuZXI7XG4gICAgZGVmZXIgPSBjdHgocG9ydC5wb3N0TWVzc2FnZSwgcG9ydCwgMSk7XG4gIC8vIElFOC1cbiAgfSBlbHNlIGlmKE9OUkVBRFlTVEFURUNIQU5HRSBpbiBjZWwoJ3NjcmlwdCcpKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoY2VsKCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGh0bWwucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIHJ1bi5jYWxsKGlkKTtcbiAgICAgIH07XG4gICAgfTtcbiAgLy8gUmVzdCBvbGQgYnJvd3NlcnNcbiAgfSBlbHNlIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHNldFRpbWVvdXQoY3R4KHJ1biwgaWQsIDEpLCAwKTtcbiAgICB9O1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiAgIHNldFRhc2ssXG4gIGNsZWFyOiBjbGVhclRhc2tcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcbiAgdHJ5IHtcbiAgICBleGVjKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59OyIsInZhciBzaWQgPSAwO1xuZnVuY3Rpb24gdWlkKGtleSl7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK3NpZCArIE1hdGgucmFuZG9tKCkpLnRvU3RyaW5nKDM2KSk7XG59XG51aWQuc2FmZSA9IHJlcXVpcmUoJy4vJCcpLmcuU3ltYm9sIHx8IHVpZDtcbm1vZHVsZS5leHBvcnRzID0gdWlkOyIsIi8vIDIyLjEuMy4zMSBBcnJheS5wcm90b3R5cGVbQEB1bnNjb3BhYmxlc11cbnZhciAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgVU5TQ09QQUJMRVMgPSByZXF1aXJlKCcuLyQud2tzJykoJ3Vuc2NvcGFibGVzJyk7XG5pZigkLkZXICYmICEoVU5TQ09QQUJMRVMgaW4gW10pKSQuaGlkZShBcnJheS5wcm90b3R5cGUsIFVOU0NPUEFCTEVTLCB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIGlmKCQuRlcpW11bVU5TQ09QQUJMRVNdW2tleV0gPSB0cnVlO1xufTsiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi8kJykuZ1xuICAsIHN0b3JlICA9IHt9O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgZ2xvYmFsLlN5bWJvbCAmJiBnbG9iYWwuU3ltYm9sW25hbWVdIHx8IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07IiwidmFyICQgICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNlbCAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZG9tLWNyZWF0ZScpXG4gICwgY29mICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsICRkZWYgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBpbnZva2UgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmludm9rZScpXG4gICwgYXJyYXlNZXRob2QgICAgICA9IHJlcXVpcmUoJy4vJC5hcnJheS1tZXRob2RzJylcbiAgLCBJRV9QUk9UTyAgICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ19fcHJvdG9fXycpXG4gICwgYXNzZXJ0ICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxuICAsIGFzc2VydE9iamVjdCAgICAgPSBhc3NlcnQub2JqXG4gICwgT2JqZWN0UHJvdG8gICAgICA9IE9iamVjdC5wcm90b3R5cGVcbiAgLCBodG1sICAgICAgICAgICAgID0gJC5odG1sXG4gICwgQSAgICAgICAgICAgICAgICA9IFtdXG4gICwgX3NsaWNlICAgICAgICAgICA9IEEuc2xpY2VcbiAgLCBfam9pbiAgICAgICAgICAgID0gQS5qb2luXG4gICwgY2xhc3NvZiAgICAgICAgICA9IGNvZi5jbGFzc29mXG4gICwgaGFzICAgICAgICAgICAgICA9ICQuaGFzXG4gICwgZGVmaW5lUHJvcGVydHkgICA9ICQuc2V0RGVzY1xuICAsIGdldE93bkRlc2NyaXB0b3IgPSAkLmdldERlc2NcbiAgLCBkZWZpbmVQcm9wZXJ0aWVzID0gJC5zZXREZXNjc1xuICAsIGlzRnVuY3Rpb24gICAgICAgPSAkLmlzRnVuY3Rpb25cbiAgLCB0b09iamVjdCAgICAgICAgID0gJC50b09iamVjdFxuICAsIHRvTGVuZ3RoICAgICAgICAgPSAkLnRvTGVuZ3RoXG4gICwgdG9JbmRleCAgICAgICAgICA9ICQudG9JbmRleFxuICAsIElFOF9ET01fREVGSU5FICAgPSBmYWxzZVxuICAsICRpbmRleE9mICAgICAgICAgPSByZXF1aXJlKCcuLyQuYXJyYXktaW5jbHVkZXMnKShmYWxzZSlcbiAgLCAkZm9yRWFjaCAgICAgICAgID0gYXJyYXlNZXRob2QoMClcbiAgLCAkbWFwICAgICAgICAgICAgID0gYXJyYXlNZXRob2QoMSlcbiAgLCAkZmlsdGVyICAgICAgICAgID0gYXJyYXlNZXRob2QoMilcbiAgLCAkc29tZSAgICAgICAgICAgID0gYXJyYXlNZXRob2QoMylcbiAgLCAkZXZlcnkgICAgICAgICAgID0gYXJyYXlNZXRob2QoNCk7XG5cbmlmKCEkLkRFU0Mpe1xuICB0cnkge1xuICAgIElFOF9ET01fREVGSU5FID0gZGVmaW5lUHJvcGVydHkoY2VsKCdkaXYnKSwgJ3gnLFxuICAgICAge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDg7IH19XG4gICAgKS54ID09IDg7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgJC5zZXREZXNjID0gZnVuY3Rpb24oTywgUCwgQXR0cmlidXRlcyl7XG4gICAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcbiAgICAgIHJldHVybiBkZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gICAgaWYoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKXRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gICAgaWYoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKWFzc2VydE9iamVjdChPKVtQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gICAgcmV0dXJuIE87XG4gIH07XG4gICQuZ2V0RGVzYyA9IGZ1bmN0aW9uKE8sIFApe1xuICAgIGlmKElFOF9ET01fREVGSU5FKXRyeSB7XG4gICAgICByZXR1cm4gZ2V0T3duRGVzY3JpcHRvcihPLCBQKTtcbiAgICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gICAgaWYoaGFzKE8sIFApKXJldHVybiAkLmRlc2MoIU9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoTywgUCksIE9bUF0pO1xuICB9O1xuICAkLnNldERlc2NzID0gZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uKE8sIFByb3BlcnRpZXMpe1xuICAgIGFzc2VydE9iamVjdChPKTtcbiAgICB2YXIga2V5cyAgID0gJC5nZXRLZXlzKFByb3BlcnRpZXMpXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgICAsIGkgPSAwXG4gICAgICAsIFA7XG4gICAgd2hpbGUobGVuZ3RoID4gaSkkLnNldERlc2MoTywgUCA9IGtleXNbaSsrXSwgUHJvcGVydGllc1tQXSk7XG4gICAgcmV0dXJuIE87XG4gIH07XG59XG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICEkLkRFU0MsICdPYmplY3QnLCB7XG4gIC8vIDE5LjEuMi42IC8gMTUuMi4zLjMgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICQuZ2V0RGVzYyxcbiAgLy8gMTkuMS4yLjQgLyAxNS4yLjMuNiBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6ICQuc2V0RGVzYyxcbiAgLy8gMTkuMS4yLjMgLyAxNS4yLjMuNyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiBkZWZpbmVQcm9wZXJ0aWVzXG59KTtcblxuICAvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG52YXIga2V5czEgPSAoJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsJyArXG4gICAgICAgICAgICAndG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZicpLnNwbGl0KCcsJylcbiAgLy8gQWRkaXRpb25hbCBrZXlzIGZvciBnZXRPd25Qcm9wZXJ0eU5hbWVzXG4gICwga2V5czIgPSBrZXlzMS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKVxuICAsIGtleXNMZW4xID0ga2V5czEubGVuZ3RoO1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbigpe1xuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xuICB2YXIgaWZyYW1lID0gY2VsKCdpZnJhbWUnKVxuICAgICwgaSAgICAgID0ga2V5c0xlbjFcbiAgICAsIGd0ICAgICA9ICc+J1xuICAgICwgaWZyYW1lRG9jdW1lbnQ7XG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBodG1sLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKCc8c2NyaXB0PmRvY3VtZW50LkY9T2JqZWN0PC9zY3JpcHQnICsgZ3QpO1xuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcbiAgd2hpbGUoaS0tKWRlbGV0ZSBjcmVhdGVEaWN0LnByb3RvdHlwZVtrZXlzMVtpXV07XG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XG59O1xuZnVuY3Rpb24gY3JlYXRlR2V0S2V5cyhuYW1lcywgbGVuZ3RoKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCl7XG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcbiAgICAgICwgaSAgICAgID0gMFxuICAgICAgLCByZXN1bHQgPSBbXVxuICAgICAgLCBrZXk7XG4gICAgZm9yKGtleSBpbiBPKWlmKGtleSAhPSBJRV9QUk9UTyloYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAgIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcbiAgICB3aGlsZShsZW5ndGggPiBpKWlmKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSl7XG4gICAgICB+JGluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShpdCl7IHJldHVybiAhJC5pc09iamVjdChpdCk7IH1cbmZ1bmN0aW9uIEVtcHR5KCl7fVxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XG4gIC8vIDE5LjEuMi45IC8gMTUuMi4zLjIgT2JqZWN0LmdldFByb3RvdHlwZU9mKE8pXG4gIGdldFByb3RvdHlwZU9mOiAkLmdldFByb3RvID0gJC5nZXRQcm90byB8fCBmdW5jdGlvbihPKXtcbiAgICBPID0gT2JqZWN0KGFzc2VydC5kZWYoTykpO1xuICAgIGlmKGhhcyhPLCBJRV9QUk9UTykpcmV0dXJuIE9bSUVfUFJPVE9dO1xuICAgIGlmKGlzRnVuY3Rpb24oTy5jb25zdHJ1Y3RvcikgJiYgTyBpbnN0YW5jZW9mIE8uY29uc3RydWN0b3Ipe1xuICAgICAgcmV0dXJuIE8uY29uc3RydWN0b3IucHJvdG90eXBlO1xuICAgIH0gcmV0dXJuIE8gaW5zdGFuY2VvZiBPYmplY3QgPyBPYmplY3RQcm90byA6IG51bGw7XG4gIH0sXG4gIC8vIDE5LjEuMi43IC8gMTUuMi4zLjQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogJC5nZXROYW1lcyA9ICQuZ2V0TmFtZXMgfHwgY3JlYXRlR2V0S2V5cyhrZXlzMiwga2V5czIubGVuZ3RoLCB0cnVlKSxcbiAgLy8gMTkuMS4yLjIgLyAxNS4yLjMuNSBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG4gIGNyZWF0ZTogJC5jcmVhdGUgPSAkLmNyZWF0ZSB8fCBmdW5jdGlvbihPLCAvKj8qL1Byb3BlcnRpZXMpe1xuICAgIHZhciByZXN1bHQ7XG4gICAgaWYoTyAhPT0gbnVsbCl7XG4gICAgICBFbXB0eS5wcm90b3R5cGUgPSBhc3NlcnRPYmplY3QoTyk7XG4gICAgICByZXN1bHQgPSBuZXcgRW1wdHkoKTtcbiAgICAgIEVtcHR5LnByb3RvdHlwZSA9IG51bGw7XG4gICAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHNoaW1cbiAgICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xuICAgIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XG4gICAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRlZmluZVByb3BlcnRpZXMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcbiAgfSxcbiAgLy8gMTkuMS4yLjE0IC8gMTUuMi4zLjE0IE9iamVjdC5rZXlzKE8pXG4gIGtleXM6ICQuZ2V0S2V5cyA9ICQuZ2V0S2V5cyB8fCBjcmVhdGVHZXRLZXlzKGtleXMxLCBrZXlzTGVuMSwgZmFsc2UpLFxuICAvLyAxOS4xLjIuMTcgLyAxNS4yLjMuOCBPYmplY3Quc2VhbChPKVxuICBzZWFsOiAkLml0LCAvLyA8LSBjYXBcbiAgLy8gMTkuMS4yLjUgLyAxNS4yLjMuOSBPYmplY3QuZnJlZXplKE8pXG4gIGZyZWV6ZTogJC5pdCwgLy8gPC0gY2FwXG4gIC8vIDE5LjEuMi4xNSAvIDE1LjIuMy4xMCBPYmplY3QucHJldmVudEV4dGVuc2lvbnMoTylcbiAgcHJldmVudEV4dGVuc2lvbnM6ICQuaXQsIC8vIDwtIGNhcFxuICAvLyAxOS4xLjIuMTMgLyAxNS4yLjMuMTEgT2JqZWN0LmlzU2VhbGVkKE8pXG4gIGlzU2VhbGVkOiBpc1ByaW1pdGl2ZSwgLy8gPC0gY2FwXG4gIC8vIDE5LjEuMi4xMiAvIDE1LjIuMy4xMiBPYmplY3QuaXNGcm96ZW4oTylcbiAgaXNGcm96ZW46IGlzUHJpbWl0aXZlLCAvLyA8LSBjYXBcbiAgLy8gMTkuMS4yLjExIC8gMTUuMi4zLjEzIE9iamVjdC5pc0V4dGVuc2libGUoTylcbiAgaXNFeHRlbnNpYmxlOiAkLmlzT2JqZWN0IC8vIDwtIGNhcFxufSk7XG5cbi8vIDE5LjIuMy4yIC8gMTUuMy40LjUgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQodGhpc0FyZywgYXJncy4uLilcbiRkZWYoJGRlZi5QLCAnRnVuY3Rpb24nLCB7XG4gIGJpbmQ6IGZ1bmN0aW9uKHRoYXQgLyosIGFyZ3MuLi4gKi8pe1xuICAgIHZhciBmbiAgICAgICA9IGFzc2VydC5mbih0aGlzKVxuICAgICAgLCBwYXJ0QXJncyA9IF9zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgZnVuY3Rpb24gYm91bmQoLyogYXJncy4uLiAqLyl7XG4gICAgICB2YXIgYXJncyA9IHBhcnRBcmdzLmNvbmNhdChfc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICAgIHJldHVybiBpbnZva2UoZm4sIGFyZ3MsIHRoaXMgaW5zdGFuY2VvZiBib3VuZCA/ICQuY3JlYXRlKGZuLnByb3RvdHlwZSkgOiB0aGF0KTtcbiAgICB9XG4gICAgaWYoZm4ucHJvdG90eXBlKWJvdW5kLnByb3RvdHlwZSA9IGZuLnByb3RvdHlwZTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH1cbn0pO1xuXG4vLyBGaXggZm9yIG5vdCBhcnJheS1saWtlIEVTMyBzdHJpbmcgYW5kIERPTSBvYmplY3RzXG5pZighKDAgaW4gT2JqZWN0KCd6JykgJiYgJ3onWzBdID09ICd6Jykpe1xuICAkLkVTNU9iamVjdCA9IGZ1bmN0aW9uKGl0KXtcbiAgICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XG4gIH07XG59XG5cbnZhciBidWdneVNsaWNlID0gdHJ1ZTtcbnRyeSB7XG4gIGlmKGh0bWwpX3NsaWNlLmNhbGwoaHRtbCk7XG4gIGJ1Z2d5U2xpY2UgPSBmYWxzZTtcbn0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cblxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiBidWdneVNsaWNlLCAnQXJyYXknLCB7XG4gIHNsaWNlOiBmdW5jdGlvbiBzbGljZShiZWdpbiwgZW5kKXtcbiAgICB2YXIgbGVuICAgPSB0b0xlbmd0aCh0aGlzLmxlbmd0aClcbiAgICAgICwga2xhc3MgPSBjb2YodGhpcyk7XG4gICAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiBlbmQ7XG4gICAgaWYoa2xhc3MgPT0gJ0FycmF5JylyZXR1cm4gX3NsaWNlLmNhbGwodGhpcywgYmVnaW4sIGVuZCk7XG4gICAgdmFyIHN0YXJ0ICA9IHRvSW5kZXgoYmVnaW4sIGxlbilcbiAgICAgICwgdXBUbyAgID0gdG9JbmRleChlbmQsIGxlbilcbiAgICAgICwgc2l6ZSAgID0gdG9MZW5ndGgodXBUbyAtIHN0YXJ0KVxuICAgICAgLCBjbG9uZWQgPSBBcnJheShzaXplKVxuICAgICAgLCBpICAgICAgPSAwO1xuICAgIGZvcig7IGkgPCBzaXplOyBpKyspY2xvbmVkW2ldID0ga2xhc3MgPT0gJ1N0cmluZydcbiAgICAgID8gdGhpcy5jaGFyQXQoc3RhcnQgKyBpKVxuICAgICAgOiB0aGlzW3N0YXJ0ICsgaV07XG4gICAgcmV0dXJuIGNsb25lZDtcbiAgfVxufSk7XG5cbiRkZWYoJGRlZi5QICsgJGRlZi5GICogKCQuRVM1T2JqZWN0ICE9IE9iamVjdCksICdBcnJheScsIHtcbiAgam9pbjogZnVuY3Rpb24gam9pbigpe1xuICAgIHJldHVybiBfam9pbi5hcHBseSgkLkVTNU9iamVjdCh0aGlzKSwgYXJndW1lbnRzKTtcbiAgfVxufSk7XG5cbi8vIDIyLjEuMi4yIC8gMTUuNC4zLjIgQXJyYXkuaXNBcnJheShhcmcpXG4kZGVmKCRkZWYuUywgJ0FycmF5Jywge1xuICBpc0FycmF5OiBmdW5jdGlvbihhcmcpe1xuICAgIHJldHVybiBjb2YoYXJnKSA9PSAnQXJyYXknO1xuICB9XG59KTtcbmZ1bmN0aW9uIGNyZWF0ZUFycmF5UmVkdWNlKGlzUmlnaHQpe1xuICByZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2tmbiwgbWVtbyl7XG4gICAgYXNzZXJ0LmZuKGNhbGxiYWNrZm4pO1xuICAgIHZhciBPICAgICAgPSB0b09iamVjdCh0aGlzKVxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gaXNSaWdodCA/IGxlbmd0aCAtIDEgOiAwXG4gICAgICAsIGkgICAgICA9IGlzUmlnaHQgPyAtMSA6IDE7XG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA8IDIpZm9yKDs7KXtcbiAgICAgIGlmKGluZGV4IGluIE8pe1xuICAgICAgICBtZW1vID0gT1tpbmRleF07XG4gICAgICAgIGluZGV4ICs9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaW5kZXggKz0gaTtcbiAgICAgIGFzc2VydChpc1JpZ2h0ID8gaW5kZXggPj0gMCA6IGxlbmd0aCA+IGluZGV4LCAnUmVkdWNlIG9mIGVtcHR5IGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZScpO1xuICAgIH1cbiAgICBmb3IoO2lzUmlnaHQgPyBpbmRleCA+PSAwIDogbGVuZ3RoID4gaW5kZXg7IGluZGV4ICs9IGkpaWYoaW5kZXggaW4gTyl7XG4gICAgICBtZW1vID0gY2FsbGJhY2tmbihtZW1vLCBPW2luZGV4XSwgaW5kZXgsIHRoaXMpO1xuICAgIH1cbiAgICByZXR1cm4gbWVtbztcbiAgfTtcbn1cbiRkZWYoJGRlZi5QLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMy4xMCAvIDE1LjQuNC4xOCBBcnJheS5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxuICBmb3JFYWNoOiAkLmVhY2ggPSAkLmVhY2ggfHwgZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgIHJldHVybiAkZm9yRWFjaCh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xuICB9LFxuICAvLyAyMi4xLjMuMTUgLyAxNS40LjQuMTkgQXJyYXkucHJvdG90eXBlLm1hcChjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxuICBtYXA6IGZ1bmN0aW9uIG1hcChjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgIHJldHVybiAkbWFwKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy43IC8gMTUuNC40LjIwIEFycmF5LnByb3RvdHlwZS5maWx0ZXIoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcbiAgZmlsdGVyOiBmdW5jdGlvbiBmaWx0ZXIoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICByZXR1cm4gJGZpbHRlcih0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xuICB9LFxuICAvLyAyMi4xLjMuMjMgLyAxNS40LjQuMTcgQXJyYXkucHJvdG90eXBlLnNvbWUoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcbiAgc29tZTogZnVuY3Rpb24gc29tZShjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgIHJldHVybiAkc29tZSh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xuICB9LFxuICAvLyAyMi4xLjMuNSAvIDE1LjQuNC4xNiBBcnJheS5wcm90b3R5cGUuZXZlcnkoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcbiAgZXZlcnk6IGZ1bmN0aW9uIGV2ZXJ5KGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRldmVyeSh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xuICB9LFxuICAvLyAyMi4xLjMuMTggLyAxNS40LjQuMjEgQXJyYXkucHJvdG90eXBlLnJlZHVjZShjYWxsYmFja2ZuIFssIGluaXRpYWxWYWx1ZV0pXG4gIHJlZHVjZTogY3JlYXRlQXJyYXlSZWR1Y2UoZmFsc2UpLFxuICAvLyAyMi4xLjMuMTkgLyAxNS40LjQuMjIgQXJyYXkucHJvdG90eXBlLnJlZHVjZVJpZ2h0KGNhbGxiYWNrZm4gWywgaW5pdGlhbFZhbHVlXSlcbiAgcmVkdWNlUmlnaHQ6IGNyZWF0ZUFycmF5UmVkdWNlKHRydWUpLFxuICAvLyAyMi4xLjMuMTEgLyAxNS40LjQuMTQgQXJyYXkucHJvdG90eXBlLmluZGV4T2Yoc2VhcmNoRWxlbWVudCBbLCBmcm9tSW5kZXhdKVxuICBpbmRleE9mOiBmdW5jdGlvbiBpbmRleE9mKGVsIC8qLCBmcm9tSW5kZXggPSAwICovKXtcbiAgICByZXR1cm4gJGluZGV4T2YodGhpcywgZWwsIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy4xNCAvIDE1LjQuNC4xNSBBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2Yoc2VhcmNoRWxlbWVudCBbLCBmcm9tSW5kZXhdKVxuICBsYXN0SW5kZXhPZjogZnVuY3Rpb24oZWwsIGZyb21JbmRleCAvKiA9IEBbKi0xXSAqLyl7XG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KHRoaXMpXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSBsZW5ndGggLSAxO1xuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPiAxKWluZGV4ID0gTWF0aC5taW4oaW5kZXgsICQudG9JbnRlZ2VyKGZyb21JbmRleCkpO1xuICAgIGlmKGluZGV4IDwgMClpbmRleCA9IHRvTGVuZ3RoKGxlbmd0aCArIGluZGV4KTtcbiAgICBmb3IoO2luZGV4ID49IDA7IGluZGV4LS0paWYoaW5kZXggaW4gTylpZihPW2luZGV4XSA9PT0gZWwpcmV0dXJuIGluZGV4O1xuICAgIHJldHVybiAtMTtcbiAgfVxufSk7XG5cbi8vIDIxLjEuMy4yNSAvIDE1LjUuNC4yMCBTdHJpbmcucHJvdG90eXBlLnRyaW0oKVxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7dHJpbTogcmVxdWlyZSgnLi8kLnJlcGxhY2VyJykoL15cXHMqKFtcXHNcXFNdKlxcUyk/XFxzKiQvLCAnJDEnKX0pO1xuXG4vLyAyMC4zLjMuMSAvIDE1LjkuNC40IERhdGUubm93KClcbiRkZWYoJGRlZi5TLCAnRGF0ZScsIHtub3c6IGZ1bmN0aW9uKCl7XG4gIHJldHVybiArbmV3IERhdGU7XG59fSk7XG5cbmZ1bmN0aW9uIGx6KG51bSl7XG4gIHJldHVybiBudW0gPiA5ID8gbnVtIDogJzAnICsgbnVtO1xufVxuXG4vLyAyMC4zLjQuMzYgLyAxNS45LjUuNDMgRGF0ZS5wcm90b3R5cGUudG9JU09TdHJpbmcoKVxuLy8gUGhhbnRvbUpTIGFuZCBvbGQgd2Via2l0IGhhZCBhIGJyb2tlbiBEYXRlIGltcGxlbWVudGF0aW9uLlxudmFyIGRhdGUgICAgICAgPSBuZXcgRGF0ZSgtNWUxMyAtIDEpXG4gICwgYnJva2VuRGF0ZSA9ICEoZGF0ZS50b0lTT1N0cmluZyAmJiBkYXRlLnRvSVNPU3RyaW5nKCkgPT0gJzAzODUtMDctMjVUMDc6MDY6MzkuOTk5WidcbiAgICAgICYmIHJlcXVpcmUoJy4vJC50aHJvd3MnKShmdW5jdGlvbigpeyBuZXcgRGF0ZShOYU4pLnRvSVNPU3RyaW5nKCk7IH0pKTtcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogYnJva2VuRGF0ZSwgJ0RhdGUnLCB7dG9JU09TdHJpbmc6IGZ1bmN0aW9uKCl7XG4gIGlmKCFpc0Zpbml0ZSh0aGlzKSl0aHJvdyBSYW5nZUVycm9yKCdJbnZhbGlkIHRpbWUgdmFsdWUnKTtcbiAgdmFyIGQgPSB0aGlzXG4gICAgLCB5ID0gZC5nZXRVVENGdWxsWWVhcigpXG4gICAgLCBtID0gZC5nZXRVVENNaWxsaXNlY29uZHMoKVxuICAgICwgcyA9IHkgPCAwID8gJy0nIDogeSA+IDk5OTkgPyAnKycgOiAnJztcbiAgcmV0dXJuIHMgKyAoJzAwMDAwJyArIE1hdGguYWJzKHkpKS5zbGljZShzID8gLTYgOiAtNCkgK1xuICAgICctJyArIGx6KGQuZ2V0VVRDTW9udGgoKSArIDEpICsgJy0nICsgbHooZC5nZXRVVENEYXRlKCkpICtcbiAgICAnVCcgKyBseihkLmdldFVUQ0hvdXJzKCkpICsgJzonICsgbHooZC5nZXRVVENNaW51dGVzKCkpICtcbiAgICAnOicgKyBseihkLmdldFVUQ1NlY29uZHMoKSkgKyAnLicgKyAobSA+IDk5ID8gbSA6ICcwJyArIGx6KG0pKSArICdaJztcbn19KTtcblxuaWYoY2xhc3NvZihmdW5jdGlvbigpeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdPYmplY3QnKWNvZi5jbGFzc29mID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgdGFnID0gY2xhc3NvZihpdCk7XG4gIHJldHVybiB0YWcgPT0gJ09iamVjdCcgJiYgaXNGdW5jdGlvbihpdC5jYWxsZWUpID8gJ0FyZ3VtZW50cycgOiB0YWc7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgdG9JbmRleCA9ICQudG9JbmRleDtcbiRkZWYoJGRlZi5QLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMy4zIEFycmF5LnByb3RvdHlwZS5jb3B5V2l0aGluKHRhcmdldCwgc3RhcnQsIGVuZCA9IHRoaXMubGVuZ3RoKVxuICBjb3B5V2l0aGluOiBmdW5jdGlvbiBjb3B5V2l0aGluKHRhcmdldC8qID0gMCAqLywgc3RhcnQgLyogPSAwLCBlbmQgPSBAbGVuZ3RoICovKXtcbiAgICB2YXIgTyAgICAgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxuICAgICAgLCBsZW4gICA9ICQudG9MZW5ndGgoTy5sZW5ndGgpXG4gICAgICAsIHRvICAgID0gdG9JbmRleCh0YXJnZXQsIGxlbilcbiAgICAgICwgZnJvbSAgPSB0b0luZGV4KHN0YXJ0LCBsZW4pXG4gICAgICAsIGVuZCAgID0gYXJndW1lbnRzWzJdXG4gICAgICAsIGZpbiAgID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB0b0luZGV4KGVuZCwgbGVuKVxuICAgICAgLCBjb3VudCA9IE1hdGgubWluKGZpbiAtIGZyb20sIGxlbiAtIHRvKVxuICAgICAgLCBpbmMgICA9IDE7XG4gICAgaWYoZnJvbSA8IHRvICYmIHRvIDwgZnJvbSArIGNvdW50KXtcbiAgICAgIGluYyAgPSAtMTtcbiAgICAgIGZyb20gPSBmcm9tICsgY291bnQgLSAxO1xuICAgICAgdG8gICA9IHRvICAgKyBjb3VudCAtIDE7XG4gICAgfVxuICAgIHdoaWxlKGNvdW50LS0gPiAwKXtcbiAgICAgIGlmKGZyb20gaW4gTylPW3RvXSA9IE9bZnJvbV07XG4gICAgICBlbHNlIGRlbGV0ZSBPW3RvXTtcbiAgICAgIHRvICAgKz0gaW5jO1xuICAgICAgZnJvbSArPSBpbmM7XG4gICAgfSByZXR1cm4gTztcbiAgfVxufSk7XG5yZXF1aXJlKCcuLyQudW5zY29wZScpKCdjb3B5V2l0aGluJyk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b0luZGV4ID0gJC50b0luZGV4O1xuJGRlZigkZGVmLlAsICdBcnJheScsIHtcbiAgLy8gMjIuMS4zLjYgQXJyYXkucHJvdG90eXBlLmZpbGwodmFsdWUsIHN0YXJ0ID0gMCwgZW5kID0gdGhpcy5sZW5ndGgpXG4gIGZpbGw6IGZ1bmN0aW9uIGZpbGwodmFsdWUgLyosIHN0YXJ0ID0gMCwgZW5kID0gQGxlbmd0aCAqLyl7XG4gICAgdmFyIE8gICAgICA9IE9iamVjdCgkLmFzc2VydERlZmluZWQodGhpcykpXG4gICAgICAsIGxlbmd0aCA9ICQudG9MZW5ndGgoTy5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9IHRvSW5kZXgoYXJndW1lbnRzWzFdLCBsZW5ndGgpXG4gICAgICAsIGVuZCAgICA9IGFyZ3VtZW50c1syXVxuICAgICAgLCBlbmRQb3MgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbmd0aCA6IHRvSW5kZXgoZW5kLCBsZW5ndGgpO1xuICAgIHdoaWxlKGVuZFBvcyA+IGluZGV4KU9baW5kZXgrK10gPSB2YWx1ZTtcbiAgICByZXR1cm4gTztcbiAgfVxufSk7XG5yZXF1aXJlKCcuLyQudW5zY29wZScpKCdmaWxsJyk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gMjIuMS4zLjkgQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleChwcmVkaWNhdGUsIHRoaXNBcmcgPSB1bmRlZmluZWQpXG52YXIgS0VZICAgID0gJ2ZpbmRJbmRleCdcbiAgLCAkZGVmICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBmb3JjZWQgPSB0cnVlXG4gICwgJGZpbmQgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKSg2KTtcbi8vIFNob3VsZG4ndCBza2lwIGhvbGVzXG5pZihLRVkgaW4gW10pQXJyYXkoMSlbS0VZXShmdW5jdGlvbigpeyBmb3JjZWQgPSBmYWxzZTsgfSk7XG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGZvcmNlZCwgJ0FycmF5Jywge1xuICBmaW5kSW5kZXg6IGZ1bmN0aW9uIGZpbmRJbmRleChjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgIHJldHVybiAkZmluZCh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xuICB9XG59KTtcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoS0VZKTsiLCIndXNlIHN0cmljdCc7XG4vLyAyMi4xLjMuOCBBcnJheS5wcm90b3R5cGUuZmluZChwcmVkaWNhdGUsIHRoaXNBcmcgPSB1bmRlZmluZWQpXG52YXIgS0VZICAgID0gJ2ZpbmQnXG4gICwgJGRlZiAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgZm9yY2VkID0gdHJ1ZVxuICAsICRmaW5kICA9IHJlcXVpcmUoJy4vJC5hcnJheS1tZXRob2RzJykoNSk7XG4vLyBTaG91bGRuJ3Qgc2tpcCBob2xlc1xuaWYoS0VZIGluIFtdKUFycmF5KDEpW0tFWV0oZnVuY3Rpb24oKXsgZm9yY2VkID0gZmFsc2U7IH0pO1xuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiBmb3JjZWQsICdBcnJheScsIHtcbiAgZmluZDogZnVuY3Rpb24gZmluZChjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgIHJldHVybiAkZmluZCh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xuICB9XG59KTtcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoS0VZKTsiLCJ2YXIgJCAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGN0eCAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkaXRlciA9IHJlcXVpcmUoJy4vJC5pdGVyJylcbiAgLCBjYWxsICA9IHJlcXVpcmUoJy4vJC5pdGVyLWNhbGwnKTtcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogIXJlcXVpcmUoJy4vJC5pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpeyBBcnJheS5mcm9tKGl0ZXIpOyB9KSwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gIGZyb206IGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlLyosIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKi8pe1xuICAgIHZhciBPICAgICAgID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZChhcnJheUxpa2UpKVxuICAgICAgLCBtYXBmbiAgID0gYXJndW1lbnRzWzFdXG4gICAgICAsIG1hcHBpbmcgPSBtYXBmbiAhPT0gdW5kZWZpbmVkXG4gICAgICAsIGYgICAgICAgPSBtYXBwaW5nID8gY3R4KG1hcGZuLCBhcmd1bWVudHNbMl0sIDIpIDogdW5kZWZpbmVkXG4gICAgICAsIGluZGV4ICAgPSAwXG4gICAgICAsIGxlbmd0aCwgcmVzdWx0LCBzdGVwLCBpdGVyYXRvcjtcbiAgICBpZigkaXRlci5pcyhPKSl7XG4gICAgICBpdGVyYXRvciA9ICRpdGVyLmdldChPKTtcbiAgICAgIC8vIHN0cmFuZ2UgSUUgcXVpcmtzIG1vZGUgYnVnIC0+IHVzZSB0eXBlb2YgaW5zdGVhZCBvZiBpc0Z1bmN0aW9uXG4gICAgICByZXN1bHQgICA9IG5ldyAodHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyA/IHRoaXMgOiBBcnJheSk7XG4gICAgICBmb3IoOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7IGluZGV4Kyspe1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IGNhbGwoaXRlcmF0b3IsIGYsIFtzdGVwLnZhbHVlLCBpbmRleF0sIHRydWUpIDogc3RlcC52YWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc3RyYW5nZSBJRSBxdWlya3MgbW9kZSBidWcgLT4gdXNlIHR5cGVvZiBpbnN0ZWFkIG9mIGlzRnVuY3Rpb25cbiAgICAgIHJlc3VsdCA9IG5ldyAodHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyA/IHRoaXMgOiBBcnJheSkobGVuZ3RoID0gJC50b0xlbmd0aChPLmxlbmd0aCkpO1xuICAgICAgZm9yKDsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IGYoT1tpbmRleF0sIGluZGV4KSA6IE9baW5kZXhdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQubGVuZ3RoID0gaW5kZXg7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufSk7IiwidmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIHNldFVuc2NvcGUgPSByZXF1aXJlKCcuLyQudW5zY29wZScpXG4gICwgSVRFUiAgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdpdGVyJylcbiAgLCAkaXRlciAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXInKVxuICAsIHN0ZXAgICAgICAgPSAkaXRlci5zdGVwXG4gICwgSXRlcmF0b3JzICA9ICRpdGVyLkl0ZXJhdG9ycztcblxuLy8gMjIuMS4zLjQgQXJyYXkucHJvdG90eXBlLmVudHJpZXMoKVxuLy8gMjIuMS4zLjEzIEFycmF5LnByb3RvdHlwZS5rZXlzKClcbi8vIDIyLjEuMy4yOSBBcnJheS5wcm90b3R5cGUudmFsdWVzKClcbi8vIDIyLjEuMy4zMCBBcnJheS5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoQXJyYXksICdBcnJheScsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcbiAgJC5zZXQodGhpcywgSVRFUiwge286ICQudG9PYmplY3QoaXRlcmF0ZWQpLCBpOiAwLCBrOiBraW5kfSk7XG4vLyAyMi4xLjUuMi4xICVBcnJheUl0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cbiAgICAsIE8gICAgID0gaXRlci5vXG4gICAgLCBraW5kICA9IGl0ZXIua1xuICAgICwgaW5kZXggPSBpdGVyLmkrKztcbiAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xuICAgIGl0ZXIubyA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gc3RlcCgxKTtcbiAgfVxuICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGluZGV4KTtcbiAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBPW2luZGV4XSk7XG4gIHJldHVybiBzdGVwKDAsIFtpbmRleCwgT1tpbmRleF1dKTtcbn0sICd2YWx1ZXMnKTtcblxuLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxuSXRlcmF0b3JzLkFyZ3VtZW50cyA9IEl0ZXJhdG9ycy5BcnJheTtcblxuc2V0VW5zY29wZSgna2V5cycpO1xuc2V0VW5zY29wZSgndmFsdWVzJyk7XG5zZXRVbnNjb3BlKCdlbnRyaWVzJyk7IiwidmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG4kZGVmKCRkZWYuUywgJ0FycmF5Jywge1xuICAvLyAyMi4xLjIuMyBBcnJheS5vZiggLi4uaXRlbXMpXG4gIG9mOiBmdW5jdGlvbiBvZigvKiAuLi5hcmdzICovKXtcbiAgICB2YXIgaW5kZXggID0gMFxuICAgICAgLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgICAvLyBzdHJhbmdlIElFIHF1aXJrcyBtb2RlIGJ1ZyAtPiB1c2UgdHlwZW9mIGluc3RlYWQgb2YgaXNGdW5jdGlvblxuICAgICAgLCByZXN1bHQgPSBuZXcgKHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXkpKGxlbmd0aCk7XG4gICAgd2hpbGUobGVuZ3RoID4gaW5kZXgpcmVzdWx0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCsrXTtcbiAgICByZXN1bHQubGVuZ3RoID0gbGVuZ3RoO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pOyIsInJlcXVpcmUoJy4vJC5zcGVjaWVzJykoQXJyYXkpOyIsInZhciAkICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBIQVNfSU5TVEFOQ0UgID0gcmVxdWlyZSgnLi8kLndrcycpKCdoYXNJbnN0YW5jZScpXG4gICwgRnVuY3Rpb25Qcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbi8vIDE5LjIuMy42IEZ1bmN0aW9uLnByb3RvdHlwZVtAQGhhc0luc3RhbmNlXShWKVxuaWYoIShIQVNfSU5TVEFOQ0UgaW4gRnVuY3Rpb25Qcm90bykpJC5zZXREZXNjKEZ1bmN0aW9uUHJvdG8sIEhBU19JTlNUQU5DRSwge3ZhbHVlOiBmdW5jdGlvbihPKXtcbiAgaWYoISQuaXNGdW5jdGlvbih0aGlzKSB8fCAhJC5pc09iamVjdChPKSlyZXR1cm4gZmFsc2U7XG4gIGlmKCEkLmlzT2JqZWN0KHRoaXMucHJvdG90eXBlKSlyZXR1cm4gTyBpbnN0YW5jZW9mIHRoaXM7XG4gIC8vIGZvciBlbnZpcm9ubWVudCB3L28gbmF0aXZlIGBAQGhhc0luc3RhbmNlYCBsb2dpYyBlbm91Z2ggYGluc3RhbmNlb2ZgLCBidXQgYWRkIHRoaXM6XG4gIHdoaWxlKE8gPSAkLmdldFByb3RvKE8pKWlmKHRoaXMucHJvdG90eXBlID09PSBPKXJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59fSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIE5BTUUgPSAnbmFtZSdcbiAgLCBzZXREZXNjID0gJC5zZXREZXNjXG4gICwgRnVuY3Rpb25Qcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbi8vIDE5LjIuNC4yIG5hbWVcbk5BTUUgaW4gRnVuY3Rpb25Qcm90byB8fCAkLkZXICYmICQuREVTQyAmJiBzZXREZXNjKEZ1bmN0aW9uUHJvdG8sIE5BTUUsIHtcbiAgY29uZmlndXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIG1hdGNoID0gU3RyaW5nKHRoaXMpLm1hdGNoKC9eXFxzKmZ1bmN0aW9uIChbXiAoXSopLylcbiAgICAgICwgbmFtZSAgPSBtYXRjaCA/IG1hdGNoWzFdIDogJyc7XG4gICAgJC5oYXModGhpcywgTkFNRSkgfHwgc2V0RGVzYyh0aGlzLCBOQU1FLCAkLmRlc2MoNSwgbmFtZSkpO1xuICAgIHJldHVybiBuYW1lO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAkLmhhcyh0aGlzLCBOQU1FKSB8fCBzZXREZXNjKHRoaXMsIE5BTUUsICQuZGVzYygwLCB2YWx1ZSkpO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tc3Ryb25nJyk7XG5cbi8vIDIzLjEgTWFwIE9iamVjdHNcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ01hcCcsIHtcbiAgLy8gMjMuMS4zLjYgTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpe1xuICAgIHZhciBlbnRyeSA9IHN0cm9uZy5nZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52O1xuICB9LFxuICAvLyAyMy4xLjMuOSBNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcbiAgICByZXR1cm4gc3Ryb25nLmRlZih0aGlzLCBrZXkgPT09IDAgPyAwIDoga2V5LCB2YWx1ZSk7XG4gIH1cbn0sIHN0cm9uZywgdHJ1ZSk7IiwidmFyIEluZmluaXR5ID0gMSAvIDBcbiAgLCAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIEUgICAgID0gTWF0aC5FXG4gICwgcG93ICAgPSBNYXRoLnBvd1xuICAsIGFicyAgID0gTWF0aC5hYnNcbiAgLCBleHAgICA9IE1hdGguZXhwXG4gICwgbG9nICAgPSBNYXRoLmxvZ1xuICAsIHNxcnQgID0gTWF0aC5zcXJ0XG4gICwgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3JcbiAgLCBFUFNJTE9OICAgPSBwb3coMiwgLTUyKVxuICAsIEVQU0lMT04zMiA9IHBvdygyLCAtMjMpXG4gICwgTUFYMzIgICAgID0gcG93KDIsIDEyNykgKiAoMiAtIEVQU0lMT04zMilcbiAgLCBNSU4zMiAgICAgPSBwb3coMiwgLTEyNik7XG5mdW5jdGlvbiByb3VuZFRpZXNUb0V2ZW4obil7XG4gIHJldHVybiBuICsgMSAvIEVQU0lMT04gLSAxIC8gRVBTSUxPTjtcbn1cblxuLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxuZnVuY3Rpb24gc2lnbih4KXtcbiAgcmV0dXJuICh4ID0gK3gpID09IDAgfHwgeCAhPSB4ID8geCA6IHggPCAwID8gLTEgOiAxO1xufVxuLy8gMjAuMi4yLjUgTWF0aC5hc2luaCh4KVxuZnVuY3Rpb24gYXNpbmgoeCl7XG4gIHJldHVybiAhaXNGaW5pdGUoeCA9ICt4KSB8fCB4ID09IDAgPyB4IDogeCA8IDAgPyAtYXNpbmgoLXgpIDogbG9nKHggKyBzcXJ0KHggKiB4ICsgMSkpO1xufVxuLy8gMjAuMi4yLjE0IE1hdGguZXhwbTEoeClcbmZ1bmN0aW9uIGV4cG0xKHgpe1xuICByZXR1cm4gKHggPSAreCkgPT0gMCA/IHggOiB4ID4gLTFlLTYgJiYgeCA8IDFlLTYgPyB4ICsgeCAqIHggLyAyIDogZXhwKHgpIC0gMTtcbn1cblxuJGRlZigkZGVmLlMsICdNYXRoJywge1xuICAvLyAyMC4yLjIuMyBNYXRoLmFjb3NoKHgpXG4gIGFjb3NoOiBmdW5jdGlvbiBhY29zaCh4KXtcbiAgICByZXR1cm4gKHggPSAreCkgPCAxID8gTmFOIDogaXNGaW5pdGUoeCkgPyBsb2coeCAvIEUgKyBzcXJ0KHggKyAxKSAqIHNxcnQoeCAtIDEpIC8gRSkgKyAxIDogeDtcbiAgfSxcbiAgLy8gMjAuMi4yLjUgTWF0aC5hc2luaCh4KVxuICBhc2luaDogYXNpbmgsXG4gIC8vIDIwLjIuMi43IE1hdGguYXRhbmgoeClcbiAgYXRhbmg6IGZ1bmN0aW9uIGF0YW5oKHgpe1xuICAgIHJldHVybiAoeCA9ICt4KSA9PSAwID8geCA6IGxvZygoMSArIHgpIC8gKDEgLSB4KSkgLyAyO1xuICB9LFxuICAvLyAyMC4yLjIuOSBNYXRoLmNicnQoeClcbiAgY2JydDogZnVuY3Rpb24gY2JydCh4KXtcbiAgICByZXR1cm4gc2lnbih4ID0gK3gpICogcG93KGFicyh4KSwgMSAvIDMpO1xuICB9LFxuICAvLyAyMC4yLjIuMTEgTWF0aC5jbHozMih4KVxuICBjbHozMjogZnVuY3Rpb24gY2x6MzIoeCl7XG4gICAgcmV0dXJuICh4ID4+Pj0gMCkgPyAzMSAtIGZsb29yKGxvZyh4ICsgMC41KSAqIE1hdGguTE9HMkUpIDogMzI7XG4gIH0sXG4gIC8vIDIwLjIuMi4xMiBNYXRoLmNvc2goeClcbiAgY29zaDogZnVuY3Rpb24gY29zaCh4KXtcbiAgICByZXR1cm4gKGV4cCh4ID0gK3gpICsgZXhwKC14KSkgLyAyO1xuICB9LFxuICAvLyAyMC4yLjIuMTQgTWF0aC5leHBtMSh4KVxuICBleHBtMTogZXhwbTEsXG4gIC8vIDIwLjIuMi4xNiBNYXRoLmZyb3VuZCh4KVxuICBmcm91bmQ6IGZ1bmN0aW9uIGZyb3VuZCh4KXtcbiAgICB2YXIgJGFicyAgPSBhYnMoeClcbiAgICAgICwgJHNpZ24gPSBzaWduKHgpXG4gICAgICAsIGEsIHJlc3VsdDtcbiAgICBpZigkYWJzIDwgTUlOMzIpcmV0dXJuICRzaWduICogcm91bmRUaWVzVG9FdmVuKCRhYnMgLyBNSU4zMiAvIEVQU0lMT04zMikgKiBNSU4zMiAqIEVQU0lMT04zMjtcbiAgICBhID0gKDEgKyBFUFNJTE9OMzIgLyBFUFNJTE9OKSAqICRhYnM7XG4gICAgcmVzdWx0ID0gYSAtIChhIC0gJGFicyk7XG4gICAgaWYocmVzdWx0ID4gTUFYMzIgfHwgcmVzdWx0ICE9IHJlc3VsdClyZXR1cm4gJHNpZ24gKiBJbmZpbml0eTtcbiAgICByZXR1cm4gJHNpZ24gKiByZXN1bHQ7XG4gIH0sXG4gIC8vIDIwLjIuMi4xNyBNYXRoLmh5cG90KFt2YWx1ZTFbLCB2YWx1ZTJbLCDigKYgXV1dKVxuICBoeXBvdDogZnVuY3Rpb24gaHlwb3QodmFsdWUxLCB2YWx1ZTIpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgdmFyIHN1bSAgPSAwXG4gICAgICAsIGkgICAgPSAwXG4gICAgICAsIGxlbiAgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgICAsIGFyZ3MgPSBBcnJheShsZW4pXG4gICAgICAsIGxhcmcgPSAwXG4gICAgICAsIGFyZztcbiAgICB3aGlsZShpIDwgbGVuKXtcbiAgICAgIGFyZyA9IGFyZ3NbaV0gPSBhYnMoYXJndW1lbnRzW2krK10pO1xuICAgICAgaWYoYXJnID09IEluZmluaXR5KXJldHVybiBJbmZpbml0eTtcbiAgICAgIGlmKGFyZyA+IGxhcmcpbGFyZyA9IGFyZztcbiAgICB9XG4gICAgbGFyZyA9IGxhcmcgfHwgMTtcbiAgICB3aGlsZShsZW4tLSlzdW0gKz0gcG93KGFyZ3NbbGVuXSAvIGxhcmcsIDIpO1xuICAgIHJldHVybiBsYXJnICogc3FydChzdW0pO1xuICB9LFxuICAvLyAyMC4yLjIuMTggTWF0aC5pbXVsKHgsIHkpXG4gIGltdWw6IGZ1bmN0aW9uIGltdWwoeCwgeSl7XG4gICAgdmFyIFVJbnQxNiA9IDB4ZmZmZlxuICAgICAgLCB4biA9ICt4XG4gICAgICAsIHluID0gK3lcbiAgICAgICwgeGwgPSBVSW50MTYgJiB4blxuICAgICAgLCB5bCA9IFVJbnQxNiAmIHluO1xuICAgIHJldHVybiAwIHwgeGwgKiB5bCArICgoVUludDE2ICYgeG4gPj4+IDE2KSAqIHlsICsgeGwgKiAoVUludDE2ICYgeW4gPj4+IDE2KSA8PCAxNiA+Pj4gMCk7XG4gIH0sXG4gIC8vIDIwLjIuMi4yMCBNYXRoLmxvZzFwKHgpXG4gIGxvZzFwOiBmdW5jdGlvbiBsb2cxcCh4KXtcbiAgICByZXR1cm4gKHggPSAreCkgPiAtMWUtOCAmJiB4IDwgMWUtOCA/IHggLSB4ICogeCAvIDIgOiBsb2coMSArIHgpO1xuICB9LFxuICAvLyAyMC4yLjIuMjEgTWF0aC5sb2cxMCh4KVxuICBsb2cxMDogZnVuY3Rpb24gbG9nMTAoeCl7XG4gICAgcmV0dXJuIGxvZyh4KSAvIE1hdGguTE4xMDtcbiAgfSxcbiAgLy8gMjAuMi4yLjIyIE1hdGgubG9nMih4KVxuICBsb2cyOiBmdW5jdGlvbiBsb2cyKHgpe1xuICAgIHJldHVybiBsb2coeCkgLyBNYXRoLkxOMjtcbiAgfSxcbiAgLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxuICBzaWduOiBzaWduLFxuICAvLyAyMC4yLjIuMzAgTWF0aC5zaW5oKHgpXG4gIHNpbmg6IGZ1bmN0aW9uIHNpbmgoeCl7XG4gICAgcmV0dXJuIGFicyh4ID0gK3gpIDwgMSA/IChleHBtMSh4KSAtIGV4cG0xKC14KSkgLyAyIDogKGV4cCh4IC0gMSkgLSBleHAoLXggLSAxKSkgKiAoRSAvIDIpO1xuICB9LFxuICAvLyAyMC4yLjIuMzMgTWF0aC50YW5oKHgpXG4gIHRhbmg6IGZ1bmN0aW9uIHRhbmgoeCl7XG4gICAgdmFyIGEgPSBleHBtMSh4ID0gK3gpXG4gICAgICAsIGIgPSBleHBtMSgteCk7XG4gICAgcmV0dXJuIGEgPT0gSW5maW5pdHkgPyAxIDogYiA9PSBJbmZpbml0eSA/IC0xIDogKGEgLSBiKSAvIChleHAoeCkgKyBleHAoLXgpKTtcbiAgfSxcbiAgLy8gMjAuMi4yLjM0IE1hdGgudHJ1bmMoeClcbiAgdHJ1bmM6IGZ1bmN0aW9uIHRydW5jKGl0KXtcbiAgICByZXR1cm4gKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgaXNPYmplY3QgICA9ICQuaXNPYmplY3RcbiAgLCBpc0Z1bmN0aW9uID0gJC5pc0Z1bmN0aW9uXG4gICwgTlVNQkVSICAgICA9ICdOdW1iZXInXG4gICwgJE51bWJlciAgICA9ICQuZ1tOVU1CRVJdXG4gICwgQmFzZSAgICAgICA9ICROdW1iZXJcbiAgLCBwcm90byAgICAgID0gJE51bWJlci5wcm90b3R5cGU7XG5mdW5jdGlvbiB0b1ByaW1pdGl2ZShpdCl7XG4gIHZhciBmbiwgdmFsO1xuICBpZihpc0Z1bmN0aW9uKGZuID0gaXQudmFsdWVPZikgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICBpZihpc0Z1bmN0aW9uKGZuID0gaXQudG9TdHJpbmcpICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gbnVtYmVyXCIpO1xufVxuZnVuY3Rpb24gdG9OdW1iZXIoaXQpe1xuICBpZihpc09iamVjdChpdCkpaXQgPSB0b1ByaW1pdGl2ZShpdCk7XG4gIGlmKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyAmJiBpdC5sZW5ndGggPiAyICYmIGl0LmNoYXJDb2RlQXQoMCkgPT0gNDgpe1xuICAgIHZhciBiaW5hcnkgPSBmYWxzZTtcbiAgICBzd2l0Y2goaXQuY2hhckNvZGVBdCgxKSl7XG4gICAgICBjYXNlIDY2IDogY2FzZSA5OCAgOiBiaW5hcnkgPSB0cnVlO1xuICAgICAgY2FzZSA3OSA6IGNhc2UgMTExIDogcmV0dXJuIHBhcnNlSW50KGl0LnNsaWNlKDIpLCBiaW5hcnkgPyAyIDogOCk7XG4gICAgfVxuICB9IHJldHVybiAraXQ7XG59XG5pZigkLkZXICYmICEoJE51bWJlcignMG8xJykgJiYgJE51bWJlcignMGIxJykpKXtcbiAgJE51bWJlciA9IGZ1bmN0aW9uIE51bWJlcihpdCl7XG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiAkTnVtYmVyID8gbmV3IEJhc2UodG9OdW1iZXIoaXQpKSA6IHRvTnVtYmVyKGl0KTtcbiAgfTtcbiAgJC5lYWNoLmNhbGwoJC5ERVNDID8gJC5nZXROYW1lcyhCYXNlKSA6IChcbiAgICAgIC8vIEVTMzpcbiAgICAgICdNQVhfVkFMVUUsTUlOX1ZBTFVFLE5hTixORUdBVElWRV9JTkZJTklUWSxQT1NJVElWRV9JTkZJTklUWSwnICtcbiAgICAgIC8vIEVTNiAoaW4gY2FzZSwgaWYgbW9kdWxlcyB3aXRoIEVTNiBOdW1iZXIgc3RhdGljcyByZXF1aXJlZCBiZWZvcmUpOlxuICAgICAgJ0VQU0lMT04saXNGaW5pdGUsaXNJbnRlZ2VyLGlzTmFOLGlzU2FmZUludGVnZXIsTUFYX1NBRkVfSU5URUdFUiwnICtcbiAgICAgICdNSU5fU0FGRV9JTlRFR0VSLHBhcnNlRmxvYXQscGFyc2VJbnQsaXNJbnRlZ2VyJ1xuICAgICkuc3BsaXQoJywnKSwgZnVuY3Rpb24oa2V5KXtcbiAgICAgIGlmKCQuaGFzKEJhc2UsIGtleSkgJiYgISQuaGFzKCROdW1iZXIsIGtleSkpe1xuICAgICAgICAkLnNldERlc2MoJE51bWJlciwga2V5LCAkLmdldERlc2MoQmFzZSwga2V5KSk7XG4gICAgICB9XG4gICAgfVxuICApO1xuICAkTnVtYmVyLnByb3RvdHlwZSA9IHByb3RvO1xuICBwcm90by5jb25zdHJ1Y3RvciA9ICROdW1iZXI7XG4gIHJlcXVpcmUoJy4vJC5yZWRlZicpKCQuZywgTlVNQkVSLCAkTnVtYmVyKTtcbn0iLCJ2YXIgJCAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgYWJzICAgPSBNYXRoLmFic1xuICAsIGZsb29yID0gTWF0aC5mbG9vclxuICAsIF9pc0Zpbml0ZSA9ICQuZy5pc0Zpbml0ZVxuICAsIE1BWF9TQUZFX0lOVEVHRVIgPSAweDFmZmZmZmZmZmZmZmZmOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxO1xuZnVuY3Rpb24gaXNJbnRlZ2VyKGl0KXtcbiAgcmV0dXJuICEkLmlzT2JqZWN0KGl0KSAmJiBfaXNGaW5pdGUoaXQpICYmIGZsb29yKGl0KSA9PT0gaXQ7XG59XG4kZGVmKCRkZWYuUywgJ051bWJlcicsIHtcbiAgLy8gMjAuMS4yLjEgTnVtYmVyLkVQU0lMT05cbiAgRVBTSUxPTjogTWF0aC5wb3coMiwgLTUyKSxcbiAgLy8gMjAuMS4yLjIgTnVtYmVyLmlzRmluaXRlKG51bWJlcilcbiAgaXNGaW5pdGU6IGZ1bmN0aW9uIGlzRmluaXRlKGl0KXtcbiAgICByZXR1cm4gdHlwZW9mIGl0ID09ICdudW1iZXInICYmIF9pc0Zpbml0ZShpdCk7XG4gIH0sXG4gIC8vIDIwLjEuMi4zIE51bWJlci5pc0ludGVnZXIobnVtYmVyKVxuICBpc0ludGVnZXI6IGlzSW50ZWdlcixcbiAgLy8gMjAuMS4yLjQgTnVtYmVyLmlzTmFOKG51bWJlcilcbiAgaXNOYU46IGZ1bmN0aW9uIGlzTmFOKG51bWJlcil7XG4gICAgcmV0dXJuIG51bWJlciAhPSBudW1iZXI7XG4gIH0sXG4gIC8vIDIwLjEuMi41IE51bWJlci5pc1NhZmVJbnRlZ2VyKG51bWJlcilcbiAgaXNTYWZlSW50ZWdlcjogZnVuY3Rpb24gaXNTYWZlSW50ZWdlcihudW1iZXIpe1xuICAgIHJldHVybiBpc0ludGVnZXIobnVtYmVyKSAmJiBhYnMobnVtYmVyKSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xuICB9LFxuICAvLyAyMC4xLjIuNiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxuICBNQVhfU0FGRV9JTlRFR0VSOiBNQVhfU0FGRV9JTlRFR0VSLFxuICAvLyAyMC4xLjIuMTAgTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVJcbiAgTUlOX1NBRkVfSU5URUdFUjogLU1BWF9TQUZFX0lOVEVHRVIsXG4gIC8vIDIwLjEuMi4xMiBOdW1iZXIucGFyc2VGbG9hdChzdHJpbmcpXG4gIHBhcnNlRmxvYXQ6IHBhcnNlRmxvYXQsXG4gIC8vIDIwLjEuMi4xMyBOdW1iZXIucGFyc2VJbnQoc3RyaW5nLCByYWRpeClcbiAgcGFyc2VJbnQ6IHBhcnNlSW50XG59KTsiLCIvLyAxOS4xLjMuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlKVxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHthc3NpZ246IHJlcXVpcmUoJy4vJC5hc3NpZ24nKX0pOyIsIi8vIDE5LjEuMy4xMCBPYmplY3QuaXModmFsdWUxLCB2YWx1ZTIpXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xuICBpczogZnVuY3Rpb24gaXMoeCwgeSl7XG4gICAgcmV0dXJuIHggPT09IHkgPyB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geSA6IHggIT0geCAmJiB5ICE9IHk7XG4gIH1cbn0pOyIsIi8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge3NldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuLyQuc2V0LXByb3RvJykuc2V0fSk7IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGlzT2JqZWN0ID0gJC5pc09iamVjdFxuICAsIHRvT2JqZWN0ID0gJC50b09iamVjdDtcbiQuZWFjaC5jYWxsKCgnZnJlZXplLHNlYWwscHJldmVudEV4dGVuc2lvbnMsaXNGcm96ZW4saXNTZWFsZWQsaXNFeHRlbnNpYmxlLCcgK1xuICAnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLGdldFByb3RvdHlwZU9mLGtleXMsZ2V0T3duUHJvcGVydHlOYW1lcycpLnNwbGl0KCcsJylcbiwgZnVuY3Rpb24oS0VZLCBJRCl7XG4gIHZhciBmbiAgICAgPSAoJC5jb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXVxuICAgICwgZm9yY2VkID0gMFxuICAgICwgbWV0aG9kID0ge307XG4gIG1ldGhvZFtLRVldID0gSUQgPT0gMCA/IGZ1bmN0aW9uIGZyZWV6ZShpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xuICB9IDogSUQgPT0gMSA/IGZ1bmN0aW9uIHNlYWwoaXQpe1xuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBpdDtcbiAgfSA6IElEID09IDIgPyBmdW5jdGlvbiBwcmV2ZW50RXh0ZW5zaW9ucyhpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xuICB9IDogSUQgPT0gMyA/IGZ1bmN0aW9uIGlzRnJvemVuKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogdHJ1ZTtcbiAgfSA6IElEID09IDQgPyBmdW5jdGlvbiBpc1NlYWxlZChpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IHRydWU7XG4gIH0gOiBJRCA9PSA1ID8gZnVuY3Rpb24gaXNFeHRlbnNpYmxlKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogZmFsc2U7XG4gIH0gOiBJRCA9PSA2ID8gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICAgIHJldHVybiBmbih0b09iamVjdChpdCksIGtleSk7XG4gIH0gOiBJRCA9PSA3ID8gZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YoaXQpe1xuICAgIHJldHVybiBmbihPYmplY3QoJC5hc3NlcnREZWZpbmVkKGl0KSkpO1xuICB9IDogSUQgPT0gOCA/IGZ1bmN0aW9uIGtleXMoaXQpe1xuICAgIHJldHVybiBmbih0b09iamVjdChpdCkpO1xuICB9IDogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XG4gICAgcmV0dXJuIGZuKHRvT2JqZWN0KGl0KSk7XG4gIH07XG4gIHRyeSB7XG4gICAgZm4oJ3onKTtcbiAgfSBjYXRjaChlKXtcbiAgICBmb3JjZWQgPSAxO1xuICB9XG4gICRkZWYoJGRlZi5TICsgJGRlZi5GICogZm9yY2VkLCAnT2JqZWN0JywgbWV0aG9kKTtcbn0pOyIsIid1c2Ugc3RyaWN0Jztcbi8vIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsIHRtcCA9IHt9O1xudG1wW3JlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKV0gPSAneic7XG5pZihyZXF1aXJlKCcuLyQnKS5GVyAmJiBjb2YodG1wKSAhPSAneicpe1xuICByZXF1aXJlKCcuLyQucmVkZWYnKShPYmplY3QucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpe1xuICAgIHJldHVybiAnW29iamVjdCAnICsgY29mLmNsYXNzb2YodGhpcykgKyAnXSc7XG4gIH0sIHRydWUpO1xufSIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3R4ICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBjb2YgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgYXNzZXJ0ICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcbiAgLCBmb3JPZiAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHNldFByb3RvID0gcmVxdWlyZSgnLi8kLnNldC1wcm90bycpLnNldFxuICAsIHNwZWNpZXMgID0gcmVxdWlyZSgnLi8kLnNwZWNpZXMnKVxuICAsIFNQRUNJRVMgID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJylcbiAgLCBSRUNPUkQgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdyZWNvcmQnKVxuICAsIFBST01JU0UgID0gJ1Byb21pc2UnXG4gICwgZ2xvYmFsICAgPSAkLmdcbiAgLCBwcm9jZXNzICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgYXNhcCAgICAgPSBwcm9jZXNzICYmIHByb2Nlc3MubmV4dFRpY2sgfHwgcmVxdWlyZSgnLi8kLnRhc2snKS5zZXRcbiAgLCBQICAgICAgICA9IGdsb2JhbFtQUk9NSVNFXVxuICAsIGlzRnVuY3Rpb24gICAgID0gJC5pc0Z1bmN0aW9uXG4gICwgaXNPYmplY3QgICAgICAgPSAkLmlzT2JqZWN0XG4gICwgYXNzZXJ0RnVuY3Rpb24gPSBhc3NlcnQuZm5cbiAgLCBhc3NlcnRPYmplY3QgICA9IGFzc2VydC5vYmo7XG5cbnZhciB1c2VOYXRpdmUgPSBmdW5jdGlvbigpe1xuICB2YXIgdGVzdCwgd29ya3MgPSBmYWxzZTtcbiAgZnVuY3Rpb24gUDIoeCl7XG4gICAgdmFyIHNlbGYgPSBuZXcgUCh4KTtcbiAgICBzZXRQcm90byhzZWxmLCBQMi5wcm90b3R5cGUpO1xuICAgIHJldHVybiBzZWxmO1xuICB9XG4gIHRyeSB7XG4gICAgd29ya3MgPSBpc0Z1bmN0aW9uKFApICYmIGlzRnVuY3Rpb24oUC5yZXNvbHZlKSAmJiBQLnJlc29sdmUodGVzdCA9IG5ldyBQKGZ1bmN0aW9uKCl7fSkpID09IHRlc3Q7XG4gICAgc2V0UHJvdG8oUDIsIFApO1xuICAgIFAyLnByb3RvdHlwZSA9ICQuY3JlYXRlKFAucHJvdG90eXBlLCB7Y29uc3RydWN0b3I6IHt2YWx1ZTogUDJ9fSk7XG4gICAgLy8gYWN0dWFsIEZpcmVmb3ggaGFzIGJyb2tlbiBzdWJjbGFzcyBzdXBwb3J0LCB0ZXN0IHRoYXRcbiAgICBpZighKFAyLnJlc29sdmUoNSkudGhlbihmdW5jdGlvbigpe30pIGluc3RhbmNlb2YgUDIpKXtcbiAgICAgIHdvcmtzID0gZmFsc2U7XG4gICAgfVxuICB9IGNhdGNoKGUpeyB3b3JrcyA9IGZhbHNlOyB9XG4gIHJldHVybiB3b3Jrcztcbn0oKTtcblxuLy8gaGVscGVyc1xuZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3IoQyl7XG4gIHZhciBTID0gYXNzZXJ0T2JqZWN0KEMpW1NQRUNJRVNdO1xuICByZXR1cm4gUyAhPSB1bmRlZmluZWQgPyBTIDogQztcbn1cbmZ1bmN0aW9uIGlzVGhlbmFibGUoaXQpe1xuICB2YXIgdGhlbjtcbiAgaWYoaXNPYmplY3QoaXQpKXRoZW4gPSBpdC50aGVuO1xuICByZXR1cm4gaXNGdW5jdGlvbih0aGVuKSA/IHRoZW4gOiBmYWxzZTtcbn1cbmZ1bmN0aW9uIG5vdGlmeShyZWNvcmQpe1xuICB2YXIgY2hhaW4gPSByZWNvcmQuYztcbiAgaWYoY2hhaW4ubGVuZ3RoKWFzYXAoZnVuY3Rpb24oKXtcbiAgICB2YXIgdmFsdWUgPSByZWNvcmQudlxuICAgICAgLCBvayAgICA9IHJlY29yZC5zID09IDFcbiAgICAgICwgaSAgICAgPSAwO1xuICAgIGZ1bmN0aW9uIHJ1bihyZWFjdCl7XG4gICAgICB2YXIgY2IgPSBvayA/IHJlYWN0Lm9rIDogcmVhY3QuZmFpbFxuICAgICAgICAsIHJldCwgdGhlbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmKGNiKXtcbiAgICAgICAgICBpZighb2spcmVjb3JkLmggPSB0cnVlO1xuICAgICAgICAgIHJldCA9IGNiID09PSB0cnVlID8gdmFsdWUgOiBjYih2YWx1ZSk7XG4gICAgICAgICAgaWYocmV0ID09PSByZWFjdC5QKXtcbiAgICAgICAgICAgIHJlYWN0LnJlaihUeXBlRXJyb3IoJ1Byb21pc2UtY2hhaW4gY3ljbGUnKSk7XG4gICAgICAgICAgfSBlbHNlIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHJldCkpe1xuICAgICAgICAgICAgdGhlbi5jYWxsKHJldCwgcmVhY3QucmVzLCByZWFjdC5yZWopO1xuICAgICAgICAgIH0gZWxzZSByZWFjdC5yZXMocmV0KTtcbiAgICAgICAgfSBlbHNlIHJlYWN0LnJlaih2YWx1ZSk7XG4gICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgIHJlYWN0LnJlaihlcnIpO1xuICAgICAgfVxuICAgIH1cbiAgICB3aGlsZShjaGFpbi5sZW5ndGggPiBpKXJ1bihjaGFpbltpKytdKTsgLy8gdmFyaWFibGUgbGVuZ3RoIC0gY2FuJ3QgdXNlIGZvckVhY2hcbiAgICBjaGFpbi5sZW5ndGggPSAwO1xuICB9KTtcbn1cbmZ1bmN0aW9uIGlzVW5oYW5kbGVkKHByb21pc2Upe1xuICB2YXIgcmVjb3JkID0gcHJvbWlzZVtSRUNPUkRdXG4gICAgLCBjaGFpbiAgPSByZWNvcmQuYSB8fCByZWNvcmQuY1xuICAgICwgaSAgICAgID0gMFxuICAgICwgcmVhY3Q7XG4gIGlmKHJlY29yZC5oKXJldHVybiBmYWxzZTtcbiAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSl7XG4gICAgcmVhY3QgPSBjaGFpbltpKytdO1xuICAgIGlmKHJlYWN0LmZhaWwgfHwgIWlzVW5oYW5kbGVkKHJlYWN0LlApKXJldHVybiBmYWxzZTtcbiAgfSByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uICRyZWplY3QodmFsdWUpe1xuICB2YXIgcmVjb3JkID0gdGhpc1xuICAgICwgcHJvbWlzZTtcbiAgaWYocmVjb3JkLmQpcmV0dXJuO1xuICByZWNvcmQuZCA9IHRydWU7XG4gIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXG4gIHJlY29yZC52ID0gdmFsdWU7XG4gIHJlY29yZC5zID0gMjtcbiAgcmVjb3JkLmEgPSByZWNvcmQuYy5zbGljZSgpO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgYXNhcChmdW5jdGlvbigpe1xuICAgICAgaWYoaXNVbmhhbmRsZWQocHJvbWlzZSA9IHJlY29yZC5wKSl7XG4gICAgICAgIGlmKGNvZihwcm9jZXNzKSA9PSAncHJvY2Vzcycpe1xuICAgICAgICAgIHByb2Nlc3MuZW1pdCgndW5oYW5kbGVkUmVqZWN0aW9uJywgdmFsdWUsIHByb21pc2UpO1xuICAgICAgICB9IGVsc2UgaWYoZ2xvYmFsLmNvbnNvbGUgJiYgaXNGdW5jdGlvbihjb25zb2xlLmVycm9yKSl7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZWNvcmQuYSA9IHVuZGVmaW5lZDtcbiAgICB9KTtcbiAgfSwgMSk7XG4gIG5vdGlmeShyZWNvcmQpO1xufVxuZnVuY3Rpb24gJHJlc29sdmUodmFsdWUpe1xuICB2YXIgcmVjb3JkID0gdGhpc1xuICAgICwgdGhlbiwgd3JhcHBlcjtcbiAgaWYocmVjb3JkLmQpcmV0dXJuO1xuICByZWNvcmQuZCA9IHRydWU7XG4gIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXG4gIHRyeSB7XG4gICAgaWYodGhlbiA9IGlzVGhlbmFibGUodmFsdWUpKXtcbiAgICAgIHdyYXBwZXIgPSB7cjogcmVjb3JkLCBkOiBmYWxzZX07IC8vIHdyYXBcbiAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgY3R4KCRyZXNvbHZlLCB3cmFwcGVyLCAxKSwgY3R4KCRyZWplY3QsIHdyYXBwZXIsIDEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVjb3JkLnYgPSB2YWx1ZTtcbiAgICAgIHJlY29yZC5zID0gMTtcbiAgICAgIG5vdGlmeShyZWNvcmQpO1xuICAgIH1cbiAgfSBjYXRjaChlcnIpe1xuICAgICRyZWplY3QuY2FsbCh3cmFwcGVyIHx8IHtyOiByZWNvcmQsIGQ6IGZhbHNlfSwgZXJyKTsgLy8gd3JhcFxuICB9XG59XG5cbi8vIGNvbnN0cnVjdG9yIHBvbHlmaWxsXG5pZighdXNlTmF0aXZlKXtcbiAgLy8gMjUuNC4zLjEgUHJvbWlzZShleGVjdXRvcilcbiAgUCA9IGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3Ipe1xuICAgIGFzc2VydEZ1bmN0aW9uKGV4ZWN1dG9yKTtcbiAgICB2YXIgcmVjb3JkID0ge1xuICAgICAgcDogYXNzZXJ0Lmluc3QodGhpcywgUCwgUFJPTUlTRSksICAgICAgIC8vIDwtIHByb21pc2VcbiAgICAgIGM6IFtdLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBhd2FpdGluZyByZWFjdGlvbnNcbiAgICAgIGE6IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBjaGVja2VkIGluIGlzVW5oYW5kbGVkIHJlYWN0aW9uc1xuICAgICAgczogMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHN0YXRlXG4gICAgICBkOiBmYWxzZSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gZG9uZVxuICAgICAgdjogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXG4gICAgICBoOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gaGFuZGxlZCByZWplY3Rpb25cbiAgICB9O1xuICAgICQuaGlkZSh0aGlzLCBSRUNPUkQsIHJlY29yZCk7XG4gICAgdHJ5IHtcbiAgICAgIGV4ZWN1dG9yKGN0eCgkcmVzb2x2ZSwgcmVjb3JkLCAxKSwgY3R4KCRyZWplY3QsIHJlY29yZCwgMSkpO1xuICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICRyZWplY3QuY2FsbChyZWNvcmQsIGVycik7XG4gICAgfVxuICB9O1xuICByZXF1aXJlKCcuLyQubWl4JykoUC5wcm90b3R5cGUsIHtcbiAgICAvLyAyNS40LjUuMyBQcm9taXNlLnByb3RvdHlwZS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKVxuICAgIHRoZW46IGZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpe1xuICAgICAgdmFyIFMgPSBhc3NlcnRPYmplY3QoYXNzZXJ0T2JqZWN0KHRoaXMpLmNvbnN0cnVjdG9yKVtTUEVDSUVTXTtcbiAgICAgIHZhciByZWFjdCA9IHtcbiAgICAgICAgb2s6ICAgaXNGdW5jdGlvbihvbkZ1bGZpbGxlZCkgPyBvbkZ1bGZpbGxlZCA6IHRydWUsXG4gICAgICAgIGZhaWw6IGlzRnVuY3Rpb24ob25SZWplY3RlZCkgID8gb25SZWplY3RlZCAgOiBmYWxzZVxuICAgICAgfTtcbiAgICAgIHZhciBwcm9taXNlID0gcmVhY3QuUCA9IG5ldyAoUyAhPSB1bmRlZmluZWQgPyBTIDogUCkoZnVuY3Rpb24ocmVzLCByZWope1xuICAgICAgICByZWFjdC5yZXMgPSBhc3NlcnRGdW5jdGlvbihyZXMpO1xuICAgICAgICByZWFjdC5yZWogPSBhc3NlcnRGdW5jdGlvbihyZWopO1xuICAgICAgfSk7XG4gICAgICB2YXIgcmVjb3JkID0gdGhpc1tSRUNPUkRdO1xuICAgICAgcmVjb3JkLmMucHVzaChyZWFjdCk7XG4gICAgICBpZihyZWNvcmQuYSlyZWNvcmQuYS5wdXNoKHJlYWN0KTtcbiAgICAgIHJlY29yZC5zICYmIG5vdGlmeShyZWNvcmQpO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfSxcbiAgICAvLyAyNS40LjUuMSBQcm9taXNlLnByb3RvdHlwZS5jYXRjaChvblJlamVjdGVkKVxuICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0ZWQpe1xuICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIGV4cG9ydFxuJGRlZigkZGVmLkcgKyAkZGVmLlcgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCB7UHJvbWlzZTogUH0pO1xuY29mLnNldChQLCBQUk9NSVNFKTtcbnNwZWNpZXMoUCk7XG5zcGVjaWVzKCQuY29yZVtQUk9NSVNFXSk7IC8vIGZvciB3cmFwcGVyXG5cbi8vIHN0YXRpY3NcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogIXVzZU5hdGl2ZSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuNSBQcm9taXNlLnJlamVjdChyKVxuICByZWplY3Q6IGZ1bmN0aW9uIHJlamVjdChyKXtcbiAgICByZXR1cm4gbmV3IChnZXRDb25zdHJ1Y3Rvcih0aGlzKSkoZnVuY3Rpb24ocmVzLCByZWope1xuICAgICAgcmVqKHIpO1xuICAgIH0pO1xuICB9LFxuICAvLyAyNS40LjQuNiBQcm9taXNlLnJlc29sdmUoeClcbiAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZSh4KXtcbiAgICByZXR1cm4gaXNPYmplY3QoeCkgJiYgUkVDT1JEIGluIHggJiYgJC5nZXRQcm90byh4KSA9PT0gdGhpcy5wcm90b3R5cGVcbiAgICAgID8geCA6IG5ldyAoZ2V0Q29uc3RydWN0b3IodGhpcykpKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgIHJlcyh4KTtcbiAgICAgIH0pO1xuICB9XG59KTtcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogISh1c2VOYXRpdmUgJiYgcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7XG4gIFAuYWxsKGl0ZXIpWydjYXRjaCddKGZ1bmN0aW9uKCl7fSk7XG59KSksIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjEgUHJvbWlzZS5hbGwoaXRlcmFibGUpXG4gIGFsbDogZnVuY3Rpb24gYWxsKGl0ZXJhYmxlKXtcbiAgICB2YXIgQyAgICAgID0gZ2V0Q29uc3RydWN0b3IodGhpcylcbiAgICAgICwgdmFsdWVzID0gW107XG4gICAgcmV0dXJuIG5ldyBDKGZ1bmN0aW9uKHJlcywgcmVqKXtcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgdmFsdWVzLnB1c2gsIHZhbHVlcyk7XG4gICAgICB2YXIgcmVtYWluaW5nID0gdmFsdWVzLmxlbmd0aFxuICAgICAgICAsIHJlc3VsdHMgICA9IEFycmF5KHJlbWFpbmluZyk7XG4gICAgICBpZihyZW1haW5pbmcpJC5lYWNoLmNhbGwodmFsdWVzLCBmdW5jdGlvbihwcm9taXNlLCBpbmRleCl7XG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgIC0tcmVtYWluaW5nIHx8IHJlcyhyZXN1bHRzKTtcbiAgICAgICAgfSwgcmVqKTtcbiAgICAgIH0pO1xuICAgICAgZWxzZSByZXMocmVzdWx0cyk7XG4gICAgfSk7XG4gIH0sXG4gIC8vIDI1LjQuNC40IFByb21pc2UucmFjZShpdGVyYWJsZSlcbiAgcmFjZTogZnVuY3Rpb24gcmFjZShpdGVyYWJsZSl7XG4gICAgdmFyIEMgPSBnZXRDb25zdHJ1Y3Rvcih0aGlzKTtcbiAgICByZXR1cm4gbmV3IEMoZnVuY3Rpb24ocmVzLCByZWope1xuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBmdW5jdGlvbihwcm9taXNlKXtcbiAgICAgICAgQy5yZXNvbHZlKHByb21pc2UpLnRoZW4ocmVzLCByZWopO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn0pOyIsInZhciAkICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIHNldFByb3RvICA9IHJlcXVpcmUoJy4vJC5zZXQtcHJvdG8nKVxuICAsICRpdGVyICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJylcbiAgLCBJVEVSQVRPUiAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBJVEVSICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnaXRlcicpXG4gICwgc3RlcCAgICAgID0gJGl0ZXIuc3RlcFxuICAsIGFzc2VydCAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxuICAsIGlzT2JqZWN0ICA9ICQuaXNPYmplY3RcbiAgLCBnZXRQcm90byAgPSAkLmdldFByb3RvXG4gICwgJFJlZmxlY3QgID0gJC5nLlJlZmxlY3RcbiAgLCBfYXBwbHkgICAgPSBGdW5jdGlvbi5hcHBseVxuICAsIGFzc2VydE9iamVjdCA9IGFzc2VydC5vYmpcbiAgLCBfaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCAkLmlzT2JqZWN0XG4gICwgX3ByZXZlbnRFeHRlbnNpb25zID0gT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zIHx8ICQuaXRcbiAgLy8gSUUgVFAgaGFzIGJyb2tlbiBSZWZsZWN0LmVudW1lcmF0ZVxuICAsIGJ1Z2d5RW51bWVyYXRlID0gISgkUmVmbGVjdCAmJiAkUmVmbGVjdC5lbnVtZXJhdGUgJiYgSVRFUkFUT1IgaW4gJFJlZmxlY3QuZW51bWVyYXRlKHt9KSk7XG5cbmZ1bmN0aW9uIEVudW1lcmF0ZShpdGVyYXRlZCl7XG4gICQuc2V0KHRoaXMsIElURVIsIHtvOiBpdGVyYXRlZCwgazogdW5kZWZpbmVkLCBpOiAwfSk7XG59XG4kaXRlci5jcmVhdGUoRW51bWVyYXRlLCAnT2JqZWN0JywgZnVuY3Rpb24oKXtcbiAgdmFyIGl0ZXIgPSB0aGlzW0lURVJdXG4gICAgLCBrZXlzID0gaXRlci5rXG4gICAgLCBrZXk7XG4gIGlmKGtleXMgPT0gdW5kZWZpbmVkKXtcbiAgICBpdGVyLmsgPSBrZXlzID0gW107XG4gICAgZm9yKGtleSBpbiBpdGVyLm8pa2V5cy5wdXNoKGtleSk7XG4gIH1cbiAgZG8ge1xuICAgIGlmKGl0ZXIuaSA+PSBrZXlzLmxlbmd0aClyZXR1cm4gc3RlcCgxKTtcbiAgfSB3aGlsZSghKChrZXkgPSBrZXlzW2l0ZXIuaSsrXSkgaW4gaXRlci5vKSk7XG4gIHJldHVybiBzdGVwKDAsIGtleSk7XG59KTtcblxudmFyIHJlZmxlY3QgPSB7XG4gIC8vIDI2LjEuMSBSZWZsZWN0LmFwcGx5KHRhcmdldCwgdGhpc0FyZ3VtZW50LCBhcmd1bWVudHNMaXN0KVxuICBhcHBseTogZnVuY3Rpb24gYXBwbHkodGFyZ2V0LCB0aGlzQXJndW1lbnQsIGFyZ3VtZW50c0xpc3Qpe1xuICAgIHJldHVybiBfYXBwbHkuY2FsbCh0YXJnZXQsIHRoaXNBcmd1bWVudCwgYXJndW1lbnRzTGlzdCk7XG4gIH0sXG4gIC8vIDI2LjEuMiBSZWZsZWN0LmNvbnN0cnVjdCh0YXJnZXQsIGFyZ3VtZW50c0xpc3QgWywgbmV3VGFyZ2V0XSlcbiAgY29uc3RydWN0OiBmdW5jdGlvbiBjb25zdHJ1Y3QodGFyZ2V0LCBhcmd1bWVudHNMaXN0IC8qLCBuZXdUYXJnZXQqLyl7XG4gICAgdmFyIHByb3RvICAgID0gYXNzZXJ0LmZuKGFyZ3VtZW50cy5sZW5ndGggPCAzID8gdGFyZ2V0IDogYXJndW1lbnRzWzJdKS5wcm90b3R5cGVcbiAgICAgICwgaW5zdGFuY2UgPSAkLmNyZWF0ZShpc09iamVjdChwcm90bykgPyBwcm90byA6IE9iamVjdC5wcm90b3R5cGUpXG4gICAgICAsIHJlc3VsdCAgID0gX2FwcGx5LmNhbGwodGFyZ2V0LCBpbnN0YW5jZSwgYXJndW1lbnRzTGlzdCk7XG4gICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiBpbnN0YW5jZTtcbiAgfSxcbiAgLy8gMjYuMS4zIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIGF0dHJpYnV0ZXMpe1xuICAgIGFzc2VydE9iamVjdCh0YXJnZXQpO1xuICAgIHRyeSB7XG4gICAgICAkLnNldERlc2ModGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSxcbiAgLy8gMjYuMS40IFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSlcbiAgZGVsZXRlUHJvcGVydHk6IGZ1bmN0aW9uIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXkpe1xuICAgIHZhciBkZXNjID0gJC5nZXREZXNjKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSk7XG4gICAgcmV0dXJuIGRlc2MgJiYgIWRlc2MuY29uZmlndXJhYmxlID8gZmFsc2UgOiBkZWxldGUgdGFyZ2V0W3Byb3BlcnR5S2V5XTtcbiAgfSxcbiAgLy8gMjYuMS42IFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcGVydHlLZXkgWywgcmVjZWl2ZXJdKVxuICBnZXQ6IGZ1bmN0aW9uIGdldCh0YXJnZXQsIHByb3BlcnR5S2V5LyosIHJlY2VpdmVyKi8pe1xuICAgIHZhciByZWNlaXZlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAzID8gdGFyZ2V0IDogYXJndW1lbnRzWzJdXG4gICAgICAsIGRlc2MgPSAkLmdldERlc2MoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KSwgcHJvdG87XG4gICAgaWYoZGVzYylyZXR1cm4gJC5oYXMoZGVzYywgJ3ZhbHVlJylcbiAgICAgID8gZGVzYy52YWx1ZVxuICAgICAgOiBkZXNjLmdldCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgIDogZGVzYy5nZXQuY2FsbChyZWNlaXZlcik7XG4gICAgcmV0dXJuIGlzT2JqZWN0KHByb3RvID0gZ2V0UHJvdG8odGFyZ2V0KSlcbiAgICAgID8gZ2V0KHByb3RvLCBwcm9wZXJ0eUtleSwgcmVjZWl2ZXIpXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgfSxcbiAgLy8gMjYuMS43IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpe1xuICAgIHJldHVybiAkLmdldERlc2MoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KTtcbiAgfSxcbiAgLy8gMjYuMS44IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YodGFyZ2V0KVxuICBnZXRQcm90b3R5cGVPZjogZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YodGFyZ2V0KXtcbiAgICByZXR1cm4gZ2V0UHJvdG8oYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xuICB9LFxuICAvLyAyNi4xLjkgUmVmbGVjdC5oYXModGFyZ2V0LCBwcm9wZXJ0eUtleSlcbiAgaGFzOiBmdW5jdGlvbiBoYXModGFyZ2V0LCBwcm9wZXJ0eUtleSl7XG4gICAgcmV0dXJuIHByb3BlcnR5S2V5IGluIHRhcmdldDtcbiAgfSxcbiAgLy8gMjYuMS4xMCBSZWZsZWN0LmlzRXh0ZW5zaWJsZSh0YXJnZXQpXG4gIGlzRXh0ZW5zaWJsZTogZnVuY3Rpb24gaXNFeHRlbnNpYmxlKHRhcmdldCl7XG4gICAgcmV0dXJuIF9pc0V4dGVuc2libGUoYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xuICB9LFxuICAvLyAyNi4xLjExIFJlZmxlY3Qub3duS2V5cyh0YXJnZXQpXG4gIG93bktleXM6IHJlcXVpcmUoJy4vJC5vd24ta2V5cycpLFxuICAvLyAyNi4xLjEyIFJlZmxlY3QucHJldmVudEV4dGVuc2lvbnModGFyZ2V0KVxuICBwcmV2ZW50RXh0ZW5zaW9uczogZnVuY3Rpb24gcHJldmVudEV4dGVuc2lvbnModGFyZ2V0KXtcbiAgICBhc3NlcnRPYmplY3QodGFyZ2V0KTtcbiAgICB0cnkge1xuICAgICAgX3ByZXZlbnRFeHRlbnNpb25zKHRhcmdldCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSxcbiAgLy8gMjYuMS4xMyBSZWZsZWN0LnNldCh0YXJnZXQsIHByb3BlcnR5S2V5LCBWIFssIHJlY2VpdmVyXSlcbiAgc2V0OiBmdW5jdGlvbiBzZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSwgVi8qLCByZWNlaXZlciovKXtcbiAgICB2YXIgcmVjZWl2ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgNCA/IHRhcmdldCA6IGFyZ3VtZW50c1szXVxuICAgICAgLCBvd25EZXNjICA9ICQuZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpXG4gICAgICAsIGV4aXN0aW5nRGVzY3JpcHRvciwgcHJvdG87XG4gICAgaWYoIW93bkRlc2Mpe1xuICAgICAgaWYoaXNPYmplY3QocHJvdG8gPSBnZXRQcm90byh0YXJnZXQpKSl7XG4gICAgICAgIHJldHVybiBzZXQocHJvdG8sIHByb3BlcnR5S2V5LCBWLCByZWNlaXZlcik7XG4gICAgICB9XG4gICAgICBvd25EZXNjID0gJC5kZXNjKDApO1xuICAgIH1cbiAgICBpZigkLmhhcyhvd25EZXNjLCAndmFsdWUnKSl7XG4gICAgICBpZihvd25EZXNjLndyaXRhYmxlID09PSBmYWxzZSB8fCAhaXNPYmplY3QocmVjZWl2ZXIpKXJldHVybiBmYWxzZTtcbiAgICAgIGV4aXN0aW5nRGVzY3JpcHRvciA9ICQuZ2V0RGVzYyhyZWNlaXZlciwgcHJvcGVydHlLZXkpIHx8ICQuZGVzYygwKTtcbiAgICAgIGV4aXN0aW5nRGVzY3JpcHRvci52YWx1ZSA9IFY7XG4gICAgICAkLnNldERlc2MocmVjZWl2ZXIsIHByb3BlcnR5S2V5LCBleGlzdGluZ0Rlc2NyaXB0b3IpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBvd25EZXNjLnNldCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiAob3duRGVzYy5zZXQuY2FsbChyZWNlaXZlciwgViksIHRydWUpO1xuICB9XG59O1xuLy8gMjYuMS4xNCBSZWZsZWN0LnNldFByb3RvdHlwZU9mKHRhcmdldCwgcHJvdG8pXG5pZihzZXRQcm90bylyZWZsZWN0LnNldFByb3RvdHlwZU9mID0gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YodGFyZ2V0LCBwcm90byl7XG4gIHNldFByb3RvLmNoZWNrKHRhcmdldCwgcHJvdG8pO1xuICB0cnkge1xuICAgIHNldFByb3RvLnNldCh0YXJnZXQsIHByb3RvKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbiRkZWYoJGRlZi5HLCB7UmVmbGVjdDoge319KTtcblxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiBidWdneUVudW1lcmF0ZSwgJ1JlZmxlY3QnLCB7XG4gIC8vIDI2LjEuNSBSZWZsZWN0LmVudW1lcmF0ZSh0YXJnZXQpXG4gIGVudW1lcmF0ZTogZnVuY3Rpb24gZW51bWVyYXRlKHRhcmdldCl7XG4gICAgcmV0dXJuIG5ldyBFbnVtZXJhdGUoYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xuICB9XG59KTtcblxuJGRlZigkZGVmLlMsICdSZWZsZWN0JywgcmVmbGVjdCk7IiwidmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNvZiAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCAkUmVnRXhwID0gJC5nLlJlZ0V4cFxuICAsIEJhc2UgICAgPSAkUmVnRXhwXG4gICwgcHJvdG8gICA9ICRSZWdFeHAucHJvdG90eXBlXG4gICwgcmUgICAgICA9IC9hL2dcbiAgLy8gXCJuZXdcIiBjcmVhdGVzIGEgbmV3IG9iamVjdFxuICAsIENPUlJFQ1RfTkVXID0gbmV3ICRSZWdFeHAocmUpICE9PSByZVxuICAvLyBSZWdFeHAgYWxsb3dzIGEgcmVnZXggd2l0aCBmbGFncyBhcyB0aGUgcGF0dGVyblxuICAsIEFMTE9XU19SRV9XSVRIX0ZMQUdTID0gZnVuY3Rpb24oKXtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuICRSZWdFeHAocmUsICdpJykgPT0gJy9hL2knO1xuICAgIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgfSgpO1xuaWYoJC5GVyAmJiAkLkRFU0Mpe1xuICBpZighQ09SUkVDVF9ORVcgfHwgIUFMTE9XU19SRV9XSVRIX0ZMQUdTKXtcbiAgICAkUmVnRXhwID0gZnVuY3Rpb24gUmVnRXhwKHBhdHRlcm4sIGZsYWdzKXtcbiAgICAgIHZhciBwYXR0ZXJuSXNSZWdFeHAgID0gY29mKHBhdHRlcm4pID09ICdSZWdFeHAnXG4gICAgICAgICwgZmxhZ3NJc1VuZGVmaW5lZCA9IGZsYWdzID09PSB1bmRlZmluZWQ7XG4gICAgICBpZighKHRoaXMgaW5zdGFuY2VvZiAkUmVnRXhwKSAmJiBwYXR0ZXJuSXNSZWdFeHAgJiYgZmxhZ3NJc1VuZGVmaW5lZClyZXR1cm4gcGF0dGVybjtcbiAgICAgIHJldHVybiBDT1JSRUNUX05FV1xuICAgICAgICA/IG5ldyBCYXNlKHBhdHRlcm5Jc1JlZ0V4cCAmJiAhZmxhZ3NJc1VuZGVmaW5lZCA/IHBhdHRlcm4uc291cmNlIDogcGF0dGVybiwgZmxhZ3MpXG4gICAgICAgIDogbmV3IEJhc2UocGF0dGVybklzUmVnRXhwID8gcGF0dGVybi5zb3VyY2UgOiBwYXR0ZXJuXG4gICAgICAgICAgLCBwYXR0ZXJuSXNSZWdFeHAgJiYgZmxhZ3NJc1VuZGVmaW5lZCA/IHBhdHRlcm4uZmxhZ3MgOiBmbGFncyk7XG4gICAgfTtcbiAgICAkLmVhY2guY2FsbCgkLmdldE5hbWVzKEJhc2UpLCBmdW5jdGlvbihrZXkpe1xuICAgICAga2V5IGluICRSZWdFeHAgfHwgJC5zZXREZXNjKCRSZWdFeHAsIGtleSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24oKXsgcmV0dXJuIEJhc2Vba2V5XTsgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbihpdCl7IEJhc2Vba2V5XSA9IGl0OyB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBwcm90by5jb25zdHJ1Y3RvciA9ICRSZWdFeHA7XG4gICAgJFJlZ0V4cC5wcm90b3R5cGUgPSBwcm90bztcbiAgICByZXF1aXJlKCcuLyQucmVkZWYnKSgkLmcsICdSZWdFeHAnLCAkUmVnRXhwKTtcbiAgfVxuICAvLyAyMS4yLjUuMyBnZXQgUmVnRXhwLnByb3RvdHlwZS5mbGFncygpXG4gIGlmKC8uL2cuZmxhZ3MgIT0gJ2cnKSQuc2V0RGVzYyhwcm90bywgJ2ZsYWdzJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IHJlcXVpcmUoJy4vJC5yZXBsYWNlcicpKC9eLipcXC8oXFx3KikkLywgJyQxJylcbiAgfSk7XG59XG5yZXF1aXJlKCcuLyQuc3BlY2llcycpKCRSZWdFeHApOyIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi1zdHJvbmcnKTtcblxuLy8gMjMuMiBTZXQgT2JqZWN0c1xucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnU2V0Jywge1xuICAvLyAyMy4yLjMuMSBTZXQucHJvdG90eXBlLmFkZCh2YWx1ZSlcbiAgYWRkOiBmdW5jdGlvbiBhZGQodmFsdWUpe1xuICAgIHJldHVybiBzdHJvbmcuZGVmKHRoaXMsIHZhbHVlID0gdmFsdWUgPT09IDAgPyAwIDogdmFsdWUsIHZhbHVlKTtcbiAgfVxufSwgc3Ryb25nKTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRhdCAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykoZmFsc2UpO1xuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XG4gIC8vIDIxLjEuMy4zIFN0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXQocG9zKVxuICBjb2RlUG9pbnRBdDogZnVuY3Rpb24gY29kZVBvaW50QXQocG9zKXtcbiAgICByZXR1cm4gJGF0KHRoaXMsIHBvcyk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjb2YgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIHRvTGVuZ3RoID0gJC50b0xlbmd0aDtcblxuLy8gc2hvdWxkIHRocm93IGVycm9yIG9uIHJlZ2V4XG4kZGVmKCRkZWYuUCArICRkZWYuRiAqICFyZXF1aXJlKCcuLyQudGhyb3dzJykoZnVuY3Rpb24oKXsgJ3EnLmVuZHNXaXRoKC8uLyk7IH0pLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjMuNiBTdHJpbmcucHJvdG90eXBlLmVuZHNXaXRoKHNlYXJjaFN0cmluZyBbLCBlbmRQb3NpdGlvbl0pXG4gIGVuZHNXaXRoOiBmdW5jdGlvbiBlbmRzV2l0aChzZWFyY2hTdHJpbmcgLyosIGVuZFBvc2l0aW9uID0gQGxlbmd0aCAqLyl7XG4gICAgaWYoY29mKHNlYXJjaFN0cmluZykgPT0gJ1JlZ0V4cCcpdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgdmFyIHRoYXQgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxuICAgICAgLCBlbmRQb3NpdGlvbiA9IGFyZ3VtZW50c1sxXVxuICAgICAgLCBsZW4gPSB0b0xlbmd0aCh0aGF0Lmxlbmd0aClcbiAgICAgICwgZW5kID0gZW5kUG9zaXRpb24gPT09IHVuZGVmaW5lZCA/IGxlbiA6IE1hdGgubWluKHRvTGVuZ3RoKGVuZFBvc2l0aW9uKSwgbGVuKTtcbiAgICBzZWFyY2hTdHJpbmcgKz0gJyc7XG4gICAgcmV0dXJuIHRoYXQuc2xpY2UoZW5kIC0gc2VhcmNoU3RyaW5nLmxlbmd0aCwgZW5kKSA9PT0gc2VhcmNoU3RyaW5nO1xuICB9XG59KTsiLCJ2YXIgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIHRvSW5kZXggPSByZXF1aXJlKCcuLyQnKS50b0luZGV4XG4gICwgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZVxuICAsICRmcm9tQ29kZVBvaW50ID0gU3RyaW5nLmZyb21Db2RlUG9pbnQ7XG5cbi8vIGxlbmd0aCBzaG91bGQgYmUgMSwgb2xkIEZGIHByb2JsZW1cbiRkZWYoJGRlZi5TICsgJGRlZi5GICogKCEhJGZyb21Db2RlUG9pbnQgJiYgJGZyb21Db2RlUG9pbnQubGVuZ3RoICE9IDEpLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjIuMiBTdHJpbmcuZnJvbUNvZGVQb2ludCguLi5jb2RlUG9pbnRzKVxuICBmcm9tQ29kZVBvaW50OiBmdW5jdGlvbiBmcm9tQ29kZVBvaW50KHgpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgdmFyIHJlcyA9IFtdXG4gICAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgICwgaSAgID0gMFxuICAgICAgLCBjb2RlO1xuICAgIHdoaWxlKGxlbiA+IGkpe1xuICAgICAgY29kZSA9ICthcmd1bWVudHNbaSsrXTtcbiAgICAgIGlmKHRvSW5kZXgoY29kZSwgMHgxMGZmZmYpICE9PSBjb2RlKXRocm93IFJhbmdlRXJyb3IoY29kZSArICcgaXMgbm90IGEgdmFsaWQgY29kZSBwb2ludCcpO1xuICAgICAgcmVzLnB1c2goY29kZSA8IDB4MTAwMDBcbiAgICAgICAgPyBmcm9tQ2hhckNvZGUoY29kZSlcbiAgICAgICAgOiBmcm9tQ2hhckNvZGUoKChjb2RlIC09IDB4MTAwMDApID4+IDEwKSArIDB4ZDgwMCwgY29kZSAlIDB4NDAwICsgMHhkYzAwKVxuICAgICAgKTtcbiAgICB9IHJldHVybiByZXMuam9pbignJyk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjb2YgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XG4gIC8vIDIxLjEuMy43IFN0cmluZy5wcm90b3R5cGUuaW5jbHVkZXMoc2VhcmNoU3RyaW5nLCBwb3NpdGlvbiA9IDApXG4gIGluY2x1ZGVzOiBmdW5jdGlvbiBpbmNsdWRlcyhzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XG4gICAgaWYoY29mKHNlYXJjaFN0cmluZykgPT0gJ1JlZ0V4cCcpdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgcmV0dXJuICEhflN0cmluZygkLmFzc2VydERlZmluZWQodGhpcykpLmluZGV4T2Yoc2VhcmNoU3RyaW5nLCBhcmd1bWVudHNbMV0pO1xuICB9XG59KTsiLCJ2YXIgc2V0ICAgPSByZXF1aXJlKCcuLyQnKS5zZXRcbiAgLCAkYXQgICA9IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKSh0cnVlKVxuICAsIElURVIgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ2l0ZXInKVxuICAsICRpdGVyID0gcmVxdWlyZSgnLi8kLml0ZXInKVxuICAsIHN0ZXAgID0gJGl0ZXIuc3RlcDtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24oaXRlcmF0ZWQpe1xuICBzZXQodGhpcywgSVRFUiwge286IFN0cmluZyhpdGVyYXRlZCksIGk6IDB9KTtcbi8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cbiAgICAsIE8gICAgID0gaXRlci5vXG4gICAgLCBpbmRleCA9IGl0ZXIuaVxuICAgICwgcG9pbnQ7XG4gIGlmKGluZGV4ID49IE8ubGVuZ3RoKXJldHVybiBzdGVwKDEpO1xuICBwb2ludCA9ICRhdChPLCBpbmRleCk7XG4gIGl0ZXIuaSArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiBzdGVwKDAsIHBvaW50KTtcbn0pOyIsInZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUywgJ1N0cmluZycsIHtcbiAgLy8gMjEuMS4yLjQgU3RyaW5nLnJhdyhjYWxsU2l0ZSwgLi4uc3Vic3RpdHV0aW9ucylcbiAgcmF3OiBmdW5jdGlvbiByYXcoY2FsbFNpdGUpe1xuICAgIHZhciB0cGwgPSAkLnRvT2JqZWN0KGNhbGxTaXRlLnJhdylcbiAgICAgICwgbGVuID0gJC50b0xlbmd0aCh0cGwubGVuZ3RoKVxuICAgICAgLCBzbG4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgICAsIHJlcyA9IFtdXG4gICAgICAsIGkgICA9IDA7XG4gICAgd2hpbGUobGVuID4gaSl7XG4gICAgICByZXMucHVzaChTdHJpbmcodHBsW2krK10pKTtcbiAgICAgIGlmKGkgPCBzbG4pcmVzLnB1c2goU3RyaW5nKGFyZ3VtZW50c1tpXSkpO1xuICAgIH0gcmV0dXJuIHJlcy5qb2luKCcnKTtcbiAgfVxufSk7IiwidmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjMuMTMgU3RyaW5nLnByb3RvdHlwZS5yZXBlYXQoY291bnQpXG4gIHJlcGVhdDogcmVxdWlyZSgnLi8kLnN0cmluZy1yZXBlYXQnKVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNvZiAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4vLyBzaG91bGQgdGhyb3cgZXJyb3Igb24gcmVnZXhcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogIXJlcXVpcmUoJy4vJC50aHJvd3MnKShmdW5jdGlvbigpeyAncScuc3RhcnRzV2l0aCgvLi8pOyB9KSwgJ1N0cmluZycsIHtcbiAgLy8gMjEuMS4zLjE4IFN0cmluZy5wcm90b3R5cGUuc3RhcnRzV2l0aChzZWFyY2hTdHJpbmcgWywgcG9zaXRpb24gXSlcbiAgc3RhcnRzV2l0aDogZnVuY3Rpb24gc3RhcnRzV2l0aChzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XG4gICAgaWYoY29mKHNlYXJjaFN0cmluZykgPT0gJ1JlZ0V4cCcpdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgdmFyIHRoYXQgID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcbiAgICAgICwgaW5kZXggPSAkLnRvTGVuZ3RoKE1hdGgubWluKGFyZ3VtZW50c1sxXSwgdGhhdC5sZW5ndGgpKTtcbiAgICBzZWFyY2hTdHJpbmcgKz0gJyc7XG4gICAgcmV0dXJuIHRoYXQuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoU3RyaW5nLmxlbmd0aCkgPT09IHNlYXJjaFN0cmluZztcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBzZXRUYWcgICA9IHJlcXVpcmUoJy4vJC5jb2YnKS5zZXRcbiAgLCB1aWQgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKVxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJHJlZGVmICAgPSByZXF1aXJlKCcuLyQucmVkZWYnKVxuICAsIGtleU9mICAgID0gcmVxdWlyZSgnLi8kLmtleW9mJylcbiAgLCBlbnVtS2V5cyA9IHJlcXVpcmUoJy4vJC5lbnVtLWtleXMnKVxuICAsIGFzc2VydE9iamVjdCA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5vYmpcbiAgLCBoYXMgICAgICA9ICQuaGFzXG4gICwgJGNyZWF0ZSAgPSAkLmNyZWF0ZVxuICAsIGdldERlc2MgID0gJC5nZXREZXNjXG4gICwgc2V0RGVzYyAgPSAkLnNldERlc2NcbiAgLCBkZXNjICAgICA9ICQuZGVzY1xuICAsIGdldE5hbWVzID0gJC5nZXROYW1lc1xuICAsIHRvT2JqZWN0ID0gJC50b09iamVjdFxuICAsICRTeW1ib2wgID0gJC5nLlN5bWJvbFxuICAsIHNldHRlciAgID0gZmFsc2VcbiAgLCBUQUcgICAgICA9IHVpZCgndGFnJylcbiAgLCBISURERU4gICA9IHVpZCgnaGlkZGVuJylcbiAgLCBfcHJvcGVydHlJc0VudW1lcmFibGUgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZVxuICAsIFN5bWJvbFJlZ2lzdHJ5ID0ge31cbiAgLCBBbGxTeW1ib2xzID0ge31cbiAgLCB1c2VOYXRpdmUgPSAkLmlzRnVuY3Rpb24oJFN5bWJvbCk7XG5cbmZ1bmN0aW9uIHdyYXAodGFnKXtcbiAgdmFyIHN5bSA9IEFsbFN5bWJvbHNbdGFnXSA9ICQuc2V0KCRjcmVhdGUoJFN5bWJvbC5wcm90b3R5cGUpLCBUQUcsIHRhZyk7XG4gICQuREVTQyAmJiBzZXR0ZXIgJiYgc2V0RGVzYyhPYmplY3QucHJvdG90eXBlLCB0YWcsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBpZihoYXModGhpcywgSElEREVOKSAmJiBoYXModGhpc1tISURERU5dLCB0YWcpKXRoaXNbSElEREVOXVt0YWddID0gZmFsc2U7XG4gICAgICBzZXREZXNjKHRoaXMsIHRhZywgZGVzYygxLCB2YWx1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzeW07XG59XG5cbmZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIEQpe1xuICBpZihEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpKXtcbiAgICBpZighRC5lbnVtZXJhYmxlKXtcbiAgICAgIGlmKCFoYXMoaXQsIEhJRERFTikpc2V0RGVzYyhpdCwgSElEREVOLCBkZXNjKDEsIHt9KSk7XG4gICAgICBpdFtISURERU5dW2tleV0gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZihoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKWl0W0hJRERFTl1ba2V5XSA9IGZhbHNlO1xuICAgICAgRCA9ICRjcmVhdGUoRCwge2VudW1lcmFibGU6IGRlc2MoMCwgZmFsc2UpfSk7XG4gICAgfVxuICB9IHJldHVybiBzZXREZXNjKGl0LCBrZXksIEQpO1xufVxuZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhpdCwgUCl7XG4gIGFzc2VydE9iamVjdChpdCk7XG4gIHZhciBrZXlzID0gZW51bUtleXMoUCA9IHRvT2JqZWN0KFApKVxuICAgICwgaSAgICA9IDBcbiAgICAsIGwgPSBrZXlzLmxlbmd0aFxuICAgICwga2V5O1xuICB3aGlsZShsID4gaSlkZWZpbmVQcm9wZXJ0eShpdCwga2V5ID0ga2V5c1tpKytdLCBQW2tleV0pO1xuICByZXR1cm4gaXQ7XG59XG5mdW5jdGlvbiBjcmVhdGUoaXQsIFApe1xuICByZXR1cm4gUCA9PT0gdW5kZWZpbmVkID8gJGNyZWF0ZShpdCkgOiBkZWZpbmVQcm9wZXJ0aWVzKCRjcmVhdGUoaXQpLCBQKTtcbn1cbmZ1bmN0aW9uIHByb3BlcnR5SXNFbnVtZXJhYmxlKGtleSl7XG4gIHZhciBFID0gX3Byb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodGhpcywga2V5KTtcbiAgcmV0dXJuIEUgfHwgIWhhcyh0aGlzLCBrZXkpIHx8ICFoYXMoQWxsU3ltYm9scywga2V5KSB8fCBoYXModGhpcywgSElEREVOKSAmJiB0aGlzW0hJRERFTl1ba2V5XVxuICAgID8gRSA6IHRydWU7XG59XG5mdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gIHZhciBEID0gZ2V0RGVzYyhpdCA9IHRvT2JqZWN0KGl0KSwga2V5KTtcbiAgaWYoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pKUQuZW51bWVyYWJsZSA9IHRydWU7XG4gIHJldHVybiBEO1xufVxuZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XG4gIHZhciBuYW1lcyAgPSBnZXROYW1lcyh0b09iamVjdChpdCkpXG4gICAgLCByZXN1bHQgPSBbXVxuICAgICwgaSAgICAgID0gMFxuICAgICwga2V5O1xuICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWlmKCFoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYga2V5ICE9IEhJRERFTilyZXN1bHQucHVzaChrZXkpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGl0KXtcbiAgdmFyIG5hbWVzICA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSlcbiAgICAsIHJlc3VsdCA9IFtdXG4gICAgLCBpICAgICAgPSAwXG4gICAgLCBrZXk7XG4gIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaWYoaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pKXJlc3VsdC5wdXNoKEFsbFN5bWJvbHNba2V5XSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxuaWYoIXVzZU5hdGl2ZSl7XG4gICRTeW1ib2wgPSBmdW5jdGlvbiBTeW1ib2woKXtcbiAgICBpZih0aGlzIGluc3RhbmNlb2YgJFN5bWJvbCl0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvcicpO1xuICAgIHJldHVybiB3cmFwKHVpZChhcmd1bWVudHNbMF0pKTtcbiAgfTtcbiAgJHJlZGVmKCRTeW1ib2wucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzW1RBR107XG4gIH0pO1xuXG4gICQuY3JlYXRlICAgICA9IGNyZWF0ZTtcbiAgJC5zZXREZXNjICAgID0gZGVmaW5lUHJvcGVydHk7XG4gICQuZ2V0RGVzYyAgICA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgJC5zZXREZXNjcyAgID0gZGVmaW5lUHJvcGVydGllcztcbiAgJC5nZXROYW1lcyAgID0gZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgJC5nZXRTeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4gIGlmKCQuREVTQyAmJiAkLkZXKSRyZWRlZihPYmplY3QucHJvdG90eXBlLCAncHJvcGVydHlJc0VudW1lcmFibGUnLCBwcm9wZXJ0eUlzRW51bWVyYWJsZSwgdHJ1ZSk7XG59XG5cbnZhciBzeW1ib2xTdGF0aWNzID0ge1xuICAvLyAxOS40LjIuMSBTeW1ib2wuZm9yKGtleSlcbiAgJ2Zvcic6IGZ1bmN0aW9uKGtleSl7XG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxuICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXG4gICAgICA6IFN5bWJvbFJlZ2lzdHJ5W2tleV0gPSAkU3ltYm9sKGtleSk7XG4gIH0sXG4gIC8vIDE5LjQuMi41IFN5bWJvbC5rZXlGb3Ioc3ltKVxuICBrZXlGb3I6IGZ1bmN0aW9uIGtleUZvcihrZXkpe1xuICAgIHJldHVybiBrZXlPZihTeW1ib2xSZWdpc3RyeSwga2V5KTtcbiAgfSxcbiAgdXNlU2V0dGVyOiBmdW5jdGlvbigpeyBzZXR0ZXIgPSB0cnVlOyB9LFxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uKCl7IHNldHRlciA9IGZhbHNlOyB9XG59O1xuLy8gMTkuNC4yLjIgU3ltYm9sLmhhc0luc3RhbmNlXG4vLyAxOS40LjIuMyBTeW1ib2wuaXNDb25jYXRTcHJlYWRhYmxlXG4vLyAxOS40LjIuNCBTeW1ib2wuaXRlcmF0b3Jcbi8vIDE5LjQuMi42IFN5bWJvbC5tYXRjaFxuLy8gMTkuNC4yLjggU3ltYm9sLnJlcGxhY2Vcbi8vIDE5LjQuMi45IFN5bWJvbC5zZWFyY2hcbi8vIDE5LjQuMi4xMCBTeW1ib2wuc3BlY2llc1xuLy8gMTkuNC4yLjExIFN5bWJvbC5zcGxpdFxuLy8gMTkuNC4yLjEyIFN5bWJvbC50b1ByaW1pdGl2ZVxuLy8gMTkuNC4yLjEzIFN5bWJvbC50b1N0cmluZ1RhZ1xuLy8gMTkuNC4yLjE0IFN5bWJvbC51bnNjb3BhYmxlc1xuJC5lYWNoLmNhbGwoKFxuICAgICdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsaXRlcmF0b3IsbWF0Y2gscmVwbGFjZSxzZWFyY2gsJyArXG4gICAgJ3NwZWNpZXMsc3BsaXQsdG9QcmltaXRpdmUsdG9TdHJpbmdUYWcsdW5zY29wYWJsZXMnXG4gICkuc3BsaXQoJywnKSwgZnVuY3Rpb24oaXQpe1xuICAgIHZhciBzeW0gPSByZXF1aXJlKCcuLyQud2tzJykoaXQpO1xuICAgIHN5bWJvbFN0YXRpY3NbaXRdID0gdXNlTmF0aXZlID8gc3ltIDogd3JhcChzeW0pO1xuICB9XG4pO1xuXG5zZXR0ZXIgPSB0cnVlO1xuXG4kZGVmKCRkZWYuRyArICRkZWYuVywge1N5bWJvbDogJFN5bWJvbH0pO1xuXG4kZGVmKCRkZWYuUywgJ1N5bWJvbCcsIHN5bWJvbFN0YXRpY3MpO1xuXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICF1c2VOYXRpdmUsICdPYmplY3QnLCB7XG4gIC8vIDE5LjEuMi4yIE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbiAgY3JlYXRlOiBjcmVhdGUsXG4gIC8vIDE5LjEuMi40IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxuICBkZWZpbmVQcm9wZXJ0eTogZGVmaW5lUHJvcGVydHksXG4gIC8vIDE5LjEuMi4zIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXG4gIGRlZmluZVByb3BlcnRpZXM6IGRlZmluZVByb3BlcnRpZXMsXG4gIC8vIDE5LjEuMi42IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIC8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG4gIGdldE93blByb3BlcnR5TmFtZXM6IGdldE93blByb3BlcnR5TmFtZXMsXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcbiAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNcbn0pO1xuXG4vLyAxOS40LjMuNSBTeW1ib2wucHJvdG90eXBlW0BAdG9TdHJpbmdUYWddXG5zZXRUYWcoJFN5bWJvbCwgJ1N5bWJvbCcpO1xuLy8gMjAuMi4xLjkgTWF0aFtAQHRvU3RyaW5nVGFnXVxuc2V0VGFnKE1hdGgsICdNYXRoJywgdHJ1ZSk7XG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxuc2V0VGFnKCQuZy5KU09OLCAnSlNPTicsIHRydWUpOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIHdlYWsgICAgICA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXdlYWsnKVxuICAsIGxlYWtTdG9yZSA9IHdlYWsubGVha1N0b3JlXG4gICwgSUQgICAgICAgID0gd2Vhay5JRFxuICAsIFdFQUsgICAgICA9IHdlYWsuV0VBS1xuICAsIGhhcyAgICAgICA9ICQuaGFzXG4gICwgaXNPYmplY3QgID0gJC5pc09iamVjdFxuICAsIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgaXNPYmplY3RcbiAgLCB0bXAgICAgICAgPSB7fTtcblxuLy8gMjMuMyBXZWFrTWFwIE9iamVjdHNcbnZhciBXZWFrTWFwID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnV2Vha01hcCcsIHtcbiAgLy8gMjMuMy4zLjMgV2Vha01hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcbiAgICBpZihpc09iamVjdChrZXkpKXtcbiAgICAgIGlmKCFpc0V4dGVuc2libGUoa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpLmdldChrZXkpO1xuICAgICAgaWYoaGFzKGtleSwgV0VBSykpcmV0dXJuIGtleVtXRUFLXVt0aGlzW0lEXV07XG4gICAgfVxuICB9LFxuICAvLyAyMy4zLjMuNSBXZWFrTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcbiAgc2V0OiBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSl7XG4gICAgcmV0dXJuIHdlYWsuZGVmKHRoaXMsIGtleSwgdmFsdWUpO1xuICB9XG59LCB3ZWFrLCB0cnVlLCB0cnVlKTtcblxuLy8gSUUxMSBXZWFrTWFwIGZyb3plbiBrZXlzIGZpeFxuaWYoJC5GVyAmJiBuZXcgV2Vha01hcCgpLnNldCgoT2JqZWN0LmZyZWV6ZSB8fCBPYmplY3QpKHRtcCksIDcpLmdldCh0bXApICE9IDcpe1xuICAkLmVhY2guY2FsbChbJ2RlbGV0ZScsICdoYXMnLCAnZ2V0JywgJ3NldCddLCBmdW5jdGlvbihrZXkpe1xuICAgIHZhciBwcm90byAgPSBXZWFrTWFwLnByb3RvdHlwZVxuICAgICAgLCBtZXRob2QgPSBwcm90b1trZXldO1xuICAgIHJlcXVpcmUoJy4vJC5yZWRlZicpKHByb3RvLCBrZXksIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgLy8gc3RvcmUgZnJvemVuIG9iamVjdHMgb24gbGVha3kgbWFwXG4gICAgICBpZihpc09iamVjdChhKSAmJiAhaXNFeHRlbnNpYmxlKGEpKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGxlYWtTdG9yZSh0aGlzKVtrZXldKGEsIGIpO1xuICAgICAgICByZXR1cm4ga2V5ID09ICdzZXQnID8gdGhpcyA6IHJlc3VsdDtcbiAgICAgIC8vIHN0b3JlIGFsbCB0aGUgcmVzdCBvbiBuYXRpdmUgd2Vha21hcFxuICAgICAgfSByZXR1cm4gbWV0aG9kLmNhbGwodGhpcywgYSwgYik7XG4gICAgfSk7XG4gIH0pO1xufSIsIid1c2Ugc3RyaWN0JztcbnZhciB3ZWFrID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24td2VhaycpO1xuXG4vLyAyMy40IFdlYWtTZXQgT2JqZWN0c1xucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnV2Vha1NldCcsIHtcbiAgLy8gMjMuNC4zLjEgV2Vha1NldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxuICBhZGQ6IGZ1bmN0aW9uIGFkZCh2YWx1ZSl7XG4gICAgcmV0dXJuIHdlYWsuZGVmKHRoaXMsIHZhbHVlLCB0cnVlKTtcbiAgfVxufSwgd2VhaywgZmFsc2UsIHRydWUpOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb21lbmljL0FycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xudmFyICRkZWYgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRpbmNsdWRlcyA9IHJlcXVpcmUoJy4vJC5hcnJheS1pbmNsdWRlcycpKHRydWUpO1xuJGRlZigkZGVmLlAsICdBcnJheScsIHtcbiAgaW5jbHVkZXM6IGZ1bmN0aW9uIGluY2x1ZGVzKGVsIC8qLCBmcm9tSW5kZXggPSAwICovKXtcbiAgICByZXR1cm4gJGluY2x1ZGVzKHRoaXMsIGVsLCBhcmd1bWVudHNbMV0pO1xuICB9XG59KTtcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2luY2x1ZGVzJyk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tdG8tanNvbicpKCdNYXAnKTsiLCIvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9XZWJSZWZsZWN0aW9uLzkzNTM3ODFcbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgb3duS2V5cyA9IHJlcXVpcmUoJy4vJC5vd24ta2V5cycpO1xuXG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yczogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhvYmplY3Qpe1xuICAgIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KG9iamVjdClcbiAgICAgICwgcmVzdWx0ID0ge307XG4gICAgJC5lYWNoLmNhbGwob3duS2V5cyhPKSwgZnVuY3Rpb24oa2V5KXtcbiAgICAgICQuc2V0RGVzYyhyZXN1bHQsIGtleSwgJC5kZXNjKDAsICQuZ2V0RGVzYyhPLCBrZXkpKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufSk7IiwiLy8gaHR0cDovL2dvby5nbC9Ya0JyakRcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuZnVuY3Rpb24gY3JlYXRlT2JqZWN0VG9BcnJheShpc0VudHJpZXMpe1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KXtcbiAgICB2YXIgTyAgICAgID0gJC50b09iamVjdChvYmplY3QpXG4gICAgICAsIGtleXMgICA9ICQuZ2V0S2V5cyhPKVxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgLCBpICAgICAgPSAwXG4gICAgICAsIHJlc3VsdCA9IEFycmF5KGxlbmd0aClcbiAgICAgICwga2V5O1xuICAgIGlmKGlzRW50cmllcyl3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IFtrZXkgPSBrZXlzW2krK10sIE9ba2V5XV07XG4gICAgZWxzZSB3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IE9ba2V5c1tpKytdXTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XG4gIHZhbHVlczogIGNyZWF0ZU9iamVjdFRvQXJyYXkoZmFsc2UpLFxuICBlbnRyaWVzOiBjcmVhdGVPYmplY3RUb0FycmF5KHRydWUpXG59KTsiLCIvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9rYW5nYXgvOTY5ODEwMFxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG4kZGVmKCRkZWYuUywgJ1JlZ0V4cCcsIHtcbiAgZXNjYXBlOiByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvKFtcXFxcXFwtW1xcXXt9KCkqKz8uLF4kfF0pL2csICdcXFxcJDEnLCB0cnVlKVxufSk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tdG8tanNvbicpKCdTZXQnKTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vbWF0aGlhc2J5bmVucy9TdHJpbmcucHJvdG90eXBlLmF0XG4ndXNlIHN0cmljdCc7XG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRhdCAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykodHJ1ZSk7XG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcbiAgYXQ6IGZ1bmN0aW9uIGF0KHBvcyl7XG4gICAgcmV0dXJuICRhdCh0aGlzLCBwb3MpO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRwYWQgPSByZXF1aXJlKCcuLyQuc3RyaW5nLXBhZCcpO1xuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XG4gIGxwYWQ6IGZ1bmN0aW9uIGxwYWQobil7XG4gICAgcmV0dXJuICRwYWQodGhpcywgbiwgYXJndW1lbnRzWzFdLCB0cnVlKTtcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkcGFkID0gcmVxdWlyZSgnLi8kLnN0cmluZy1wYWQnKTtcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xuICBycGFkOiBmdW5jdGlvbiBycGFkKG4pe1xuICAgIHJldHVybiAkcGFkKHRoaXMsIG4sIGFyZ3VtZW50c1sxXSwgZmFsc2UpO1xuICB9XG59KTsiLCIvLyBKYXZhU2NyaXB0IDEuNiAvIFN0cmF3bWFuIGFycmF5IHN0YXRpY3Mgc2hpbVxudmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkQXJyYXkgID0gJC5jb3JlLkFycmF5IHx8IEFycmF5XG4gICwgc3RhdGljcyA9IHt9O1xuZnVuY3Rpb24gc2V0U3RhdGljcyhrZXlzLCBsZW5ndGgpe1xuICAkLmVhY2guY2FsbChrZXlzLnNwbGl0KCcsJyksIGZ1bmN0aW9uKGtleSl7XG4gICAgaWYobGVuZ3RoID09IHVuZGVmaW5lZCAmJiBrZXkgaW4gJEFycmF5KXN0YXRpY3Nba2V5XSA9ICRBcnJheVtrZXldO1xuICAgIGVsc2UgaWYoa2V5IGluIFtdKXN0YXRpY3Nba2V5XSA9IHJlcXVpcmUoJy4vJC5jdHgnKShGdW5jdGlvbi5jYWxsLCBbXVtrZXldLCBsZW5ndGgpO1xuICB9KTtcbn1cbnNldFN0YXRpY3MoJ3BvcCxyZXZlcnNlLHNoaWZ0LGtleXMsdmFsdWVzLGVudHJpZXMnLCAxKTtcbnNldFN0YXRpY3MoJ2luZGV4T2YsZXZlcnksc29tZSxmb3JFYWNoLG1hcCxmaWx0ZXIsZmluZCxmaW5kSW5kZXgsaW5jbHVkZXMnLCAzKTtcbnNldFN0YXRpY3MoJ2pvaW4sc2xpY2UsY29uY2F0LHB1c2gsc3BsaWNlLHVuc2hpZnQsc29ydCxsYXN0SW5kZXhPZiwnICtcbiAgICAgICAgICAgJ3JlZHVjZSxyZWR1Y2VSaWdodCxjb3B5V2l0aGluLGZpbGwsdHVybicpO1xuJGRlZigkZGVmLlMsICdBcnJheScsIHN0YXRpY3MpOyIsInJlcXVpcmUoJy4vZXM2LmFycmF5Lml0ZXJhdG9yJyk7XG52YXIgJCAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIEl0ZXJhdG9ycyAgID0gcmVxdWlyZSgnLi8kLml0ZXInKS5JdGVyYXRvcnNcbiAgLCBJVEVSQVRPUiAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEFycmF5VmFsdWVzID0gSXRlcmF0b3JzLkFycmF5XG4gICwgTm9kZUxpc3QgICAgPSAkLmcuTm9kZUxpc3Q7XG5pZigkLkZXICYmIE5vZGVMaXN0ICYmICEoSVRFUkFUT1IgaW4gTm9kZUxpc3QucHJvdG90eXBlKSl7XG4gICQuaGlkZShOb2RlTGlzdC5wcm90b3R5cGUsIElURVJBVE9SLCBBcnJheVZhbHVlcyk7XG59XG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBBcnJheVZhbHVlczsiLCJ2YXIgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkdGFzayA9IHJlcXVpcmUoJy4vJC50YXNrJyk7XG4kZGVmKCRkZWYuRyArICRkZWYuQiwge1xuICBzZXRJbW1lZGlhdGU6ICAgJHRhc2suc2V0LFxuICBjbGVhckltbWVkaWF0ZTogJHRhc2suY2xlYXJcbn0pOyIsIi8vIGllOS0gc2V0VGltZW91dCAmIHNldEludGVydmFsIGFkZGl0aW9uYWwgcGFyYW1ldGVycyBmaXhcbnZhciAkICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGludm9rZSAgICA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxuICAsIHBhcnRpYWwgICA9IHJlcXVpcmUoJy4vJC5wYXJ0aWFsJylcbiAgLCBuYXZpZ2F0b3IgPSAkLmcubmF2aWdhdG9yXG4gICwgTVNJRSAgICAgID0gISFuYXZpZ2F0b3IgJiYgL01TSUUgLlxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTsgLy8gPC0gZGlydHkgaWU5LSBjaGVja1xuZnVuY3Rpb24gd3JhcChzZXQpe1xuICByZXR1cm4gTVNJRSA/IGZ1bmN0aW9uKGZuLCB0aW1lIC8qLCAuLi5hcmdzICovKXtcbiAgICByZXR1cm4gc2V0KGludm9rZShcbiAgICAgIHBhcnRpYWwsXG4gICAgICBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMiksXG4gICAgICAkLmlzRnVuY3Rpb24oZm4pID8gZm4gOiBGdW5jdGlvbihmbilcbiAgICApLCB0aW1lKTtcbiAgfSA6IHNldDtcbn1cbiRkZWYoJGRlZi5HICsgJGRlZi5CICsgJGRlZi5GICogTVNJRSwge1xuICBzZXRUaW1lb3V0OiAgd3JhcCgkLmcuc2V0VGltZW91dCksXG4gIHNldEludGVydmFsOiB3cmFwKCQuZy5zZXRJbnRlcnZhbClcbn0pOyIsInJlcXVpcmUoJy4vbW9kdWxlcy9lczUnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3ltYm9sJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24nKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LmlzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm9iamVjdC5zZXQtcHJvdG90eXBlLW9mJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnN0YXRpY3MtYWNjZXB0LXByaW1pdGl2ZXMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuZnVuY3Rpb24ubmFtZScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5mdW5jdGlvbi5oYXMtaW5zdGFuY2UnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLmNvbnN0cnVjdG9yJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm51bWJlci5zdGF0aWNzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm1hdGgnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmZyb20tY29kZS1wb2ludCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcucmF3Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuY29kZS1wb2ludC1hdCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuZW5kcy13aXRoJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5pbmNsdWRlcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcucmVwZWF0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5zdGFydHMtd2l0aCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5mcm9tJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5Lm9mJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LnNwZWNpZXMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuY29weS13aXRoaW4nKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZmlsbCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5maW5kJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZpbmQtaW5kZXgnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYucmVnZXhwJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnByb21pc2UnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWFwJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnNldCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi53ZWFrLW1hcCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi53ZWFrLXNldCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWZsZWN0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnN0cmluZy5hdCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5zdHJpbmcubHBhZCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5zdHJpbmcucnBhZCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5yZWdleHAuZXNjYXBlJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3Lm9iamVjdC50by1hcnJheScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5tYXAudG8tanNvbicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5zZXQudG8tanNvbicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2pzLmFycmF5LnN0YXRpY3MnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy93ZWIudGltZXJzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvd2ViLmltbWVkaWF0ZScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9tb2R1bGVzLyQnKS5jb3JlO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9tYXN0ZXIvTElDRU5TRSBmaWxlLiBBblxuICogYWRkaXRpb25hbCBncmFudCBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluXG4gKiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cblxuIShmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgaXRlcmF0b3JTeW1ib2wgPVxuICAgIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG5cbiAgdmFyIGluTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIjtcbiAgdmFyIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lO1xuICBpZiAocnVudGltZSkge1xuICAgIGlmIChpbk1vZHVsZSkge1xuICAgICAgLy8gSWYgcmVnZW5lcmF0b3JSdW50aW1lIGlzIGRlZmluZWQgZ2xvYmFsbHkgYW5kIHdlJ3JlIGluIGEgbW9kdWxlLFxuICAgICAgLy8gbWFrZSB0aGUgZXhwb3J0cyBvYmplY3QgaWRlbnRpY2FsIHRvIHJlZ2VuZXJhdG9yUnVudGltZS5cbiAgICAgIG1vZHVsZS5leHBvcnRzID0gcnVudGltZTtcbiAgICB9XG4gICAgLy8gRG9uJ3QgYm90aGVyIGV2YWx1YXRpbmcgdGhlIHJlc3Qgb2YgdGhpcyBmaWxlIGlmIHRoZSBydW50aW1lIHdhc1xuICAgIC8vIGFscmVhZHkgZGVmaW5lZCBnbG9iYWxseS5cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBEZWZpbmUgdGhlIHJ1bnRpbWUgZ2xvYmFsbHkgKGFzIGV4cGVjdGVkIGJ5IGdlbmVyYXRlZCBjb2RlKSBhcyBlaXRoZXJcbiAgLy8gbW9kdWxlLmV4cG9ydHMgKGlmIHdlJ3JlIGluIGEgbW9kdWxlKSBvciBhIG5ldywgZW1wdHkgb2JqZWN0LlxuICBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZSA9IGluTW9kdWxlID8gbW9kdWxlLmV4cG9ydHMgOiB7fTtcblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZSgob3V0ZXJGbiB8fCBHZW5lcmF0b3IpLnByb3RvdHlwZSk7XG5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoXG4gICAgICBpbm5lckZuLCBzZWxmIHx8IG51bGwsXG4gICAgICBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSlcbiAgICApO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBydW50aW1lLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPSBHZW5lcmF0b3IucHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcblxuICBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBydW50aW1lLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgcnVudGltZS5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGdlbmVyYXRvciA9IHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpO1xuICAgICAgdmFyIGNhbGxOZXh0ID0gc3RlcC5iaW5kKGdlbmVyYXRvciwgXCJuZXh0XCIpO1xuICAgICAgdmFyIGNhbGxUaHJvdyA9IHN0ZXAuYmluZChnZW5lcmF0b3IsIFwidGhyb3dcIik7XG5cbiAgICAgIGZ1bmN0aW9uIHN0ZXAobWV0aG9kLCBhcmcpIHtcbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGdlbmVyYXRvclttZXRob2RdLCBnZW5lcmF0b3IsIGFyZyk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcbiAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgIHJlc29sdmUoaW5mby52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKGluZm8udmFsdWUpLnRoZW4oY2FsbE5leHQsIGNhbGxUaHJvdyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FsbE5leHQoKTtcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIiB8fFxuICAgICAgICAgICAgICAobWV0aG9kID09PSBcInRocm93XCIgJiYgZGVsZWdhdGUuaXRlcmF0b3JbbWV0aG9kXSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgLy8gQSByZXR1cm4gb3IgdGhyb3cgKHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyB0aHJvd1xuICAgICAgICAgICAgLy8gbWV0aG9kKSBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICAgICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgICAgdmFyIHJldHVybk1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW1wicmV0dXJuXCJdO1xuICAgICAgICAgICAgaWYgKHJldHVybk1ldGhvZCkge1xuICAgICAgICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gocmV0dXJuTWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgYXJnKTtcbiAgICAgICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcmV0dXJuIG1ldGhvZCB0aHJldyBhbiBleGNlcHRpb24sIGxldCB0aGF0XG4gICAgICAgICAgICAgICAgLy8gZXhjZXB0aW9uIHByZXZhaWwgb3ZlciB0aGUgb3JpZ2luYWwgcmV0dXJuIG9yIHRocm93LlxuICAgICAgICAgICAgICAgIG1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICAgICAgLy8gQ29udGludWUgd2l0aCB0aGUgb3V0ZXIgcmV0dXJuLCBub3cgdGhhdCB0aGUgZGVsZWdhdGVcbiAgICAgICAgICAgICAgLy8gaXRlcmF0b3IgaGFzIGJlZW4gdGVybWluYXRlZC5cbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKFxuICAgICAgICAgICAgZGVsZWdhdGUuaXRlcmF0b3JbbWV0aG9kXSxcbiAgICAgICAgICAgIGRlbGVnYXRlLml0ZXJhdG9yLFxuICAgICAgICAgICAgYXJnXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgICAgICAgLy8gTGlrZSByZXR1cm5pbmcgZ2VuZXJhdG9yLnRocm93KHVuY2F1Z2h0KSwgYnV0IHdpdGhvdXQgdGhlXG4gICAgICAgICAgICAvLyBvdmVyaGVhZCBvZiBhbiBleHRyYSBmdW5jdGlvbiBjYWxsLlxuICAgICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIERlbGVnYXRlIGdlbmVyYXRvciByYW4gYW5kIGhhbmRsZWQgaXRzIG93biBleGNlcHRpb25zIHNvXG4gICAgICAgICAgLy8gcmVnYXJkbGVzcyBvZiB3aGF0IHRoZSBtZXRob2Qgd2FzLCB3ZSBjb250aW51ZSBhcyBpZiBpdCBpc1xuICAgICAgICAgIC8vIFwibmV4dFwiIHdpdGggYW4gdW5kZWZpbmVkIGFyZy5cbiAgICAgICAgICBtZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG4gICAgICAgICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG4gICAgICAgICAgICByZXR1cm4gaW5mbztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkKSB7XG4gICAgICAgICAgICBjb250ZXh0LnNlbnQgPSBhcmc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjb250ZXh0LnNlbnQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oYXJnKSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgICBtZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBhcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIHZhciBpbmZvID0ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGlmIChjb250ZXh0LmRlbGVnYXRlICYmIG1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBkZWZpbmVHZW5lcmF0b3JNZXRob2QobWV0aG9kKSB7XG4gICAgR3BbbWV0aG9kXSA9IGZ1bmN0aW9uKGFyZykge1xuICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgfTtcbiAgfVxuICBkZWZpbmVHZW5lcmF0b3JNZXRob2QoXCJuZXh0XCIpO1xuICBkZWZpbmVHZW5lcmF0b3JNZXRob2QoXCJ0aHJvd1wiKTtcbiAgZGVmaW5lR2VuZXJhdG9yTWV0aG9kKFwicmV0dXJuXCIpO1xuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIHJ1bnRpbWUua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBydW50aW1lLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICB0aGlzLnNlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgLy8gUHJlLWluaXRpYWxpemUgYXQgbGVhc3QgMjAgdGVtcG9yYXJ5IHZhcmlhYmxlcyB0byBlbmFibGUgaGlkZGVuXG4gICAgICAvLyBjbGFzcyBvcHRpbWl6YXRpb25zIGZvciBzaW1wbGUgZ2VuZXJhdG9ycy5cbiAgICAgIGZvciAodmFyIHRlbXBJbmRleCA9IDAsIHRlbXBOYW1lO1xuICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCB0ZW1wTmFtZSA9IFwidFwiICsgdGVtcEluZGV4KSB8fCB0ZW1wSW5kZXggPCAyMDtcbiAgICAgICAgICAgKyt0ZW1wSW5kZXgpIHtcbiAgICAgICAgdGhpc1t0ZW1wTmFtZV0gPSBudWxsO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG4gICAgICAgIHJldHVybiAhIWNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG59KShcbiAgLy8gQW1vbmcgdGhlIHZhcmlvdXMgdHJpY2tzIGZvciBvYnRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbFxuICAvLyBvYmplY3QsIHRoaXMgc2VlbXMgdG8gYmUgdGhlIG1vc3QgcmVsaWFibGUgdGVjaG5pcXVlIHRoYXQgZG9lcyBub3RcbiAgLy8gdXNlIGluZGlyZWN0IGV2YWwgKHdoaWNoIHZpb2xhdGVzIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5KS5cbiAgdHlwZW9mIGdsb2JhbCA9PT0gXCJvYmplY3RcIiA/IGdsb2JhbCA6XG4gIHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgPyB3aW5kb3cgOlxuICB0eXBlb2Ygc2VsZiA9PT0gXCJvYmplY3RcIiA/IHNlbGYgOiB0aGlzXG4pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9saWIvYmFiZWwvcG9seWZpbGxcIik7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJiYWJlbC1jb3JlL3BvbHlmaWxsXCIpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzLCBjdXN0b21Eb2N1bWVudCkge1xuICB2YXIgZG9jID0gY3VzdG9tRG9jdW1lbnQgfHwgZG9jdW1lbnQ7XG4gIGlmIChkb2MuY3JlYXRlU3R5bGVTaGVldCkge1xuICAgIHZhciBzaGVldCA9IGRvYy5jcmVhdGVTdHlsZVNoZWV0KClcbiAgICBzaGVldC5jc3NUZXh0ID0gY3NzO1xuICAgIHJldHVybiBzaGVldC5vd25lck5vZGU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGhlYWQgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgICAgc3R5bGUgPSBkb2MuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICAgIH1cblxuICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgIHJldHVybiBzdHlsZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuYnlVcmwgPSBmdW5jdGlvbih1cmwpIHtcbiAgaWYgKGRvY3VtZW50LmNyZWF0ZVN0eWxlU2hlZXQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlU3R5bGVTaGVldCh1cmwpLm93bmVyTm9kZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sXG4gICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5cbiAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICBsaW5rLmhyZWYgPSB1cmw7XG5cbiAgICBoZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgIHJldHVybiBsaW5rO1xuICB9XG59O1xuIiwiY29uc3QgQ3VydmVzID0gRmFtb3VzUGxhdGZvcm0udHJhbnNpdGlvbnMuQ3VydmVzO1xuY29uc3QgRmFtb3VzRW5naW5lID0gRmFtb3VzUGxhdGZvcm0uY29yZS5GYW1vdXNFbmdpbmU7XG5jb25zdCBUcmFuc2l0aW9uYWJsZSA9IEZhbW91c1BsYXRmb3JtLnRyYW5zaXRpb25zLlRyYW5zaXRpb25hYmxlO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lbGluZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucGF0aFNldCA9IFtdO1xuICAgIHRoaXMudGltZXNjYWxlID0gb3B0aW9ucy50aW1lc2NhbGUgfHwgMTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gbmV3IFRyYW5zaXRpb25hYmxlKDApO1xuICB9XG5cbiAgLypcbiAgICAgICAgcGF0aERhdGEgPSB7XG4gICAgICAgICAgaGFuZGxlciA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXRoIDogW1xuICAgICAgICAgICAgWzAsIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbNTAwMCwgWzEwMCwgMTAwLCAxMDBdXVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAqL1xuXG4gIHJlZ2lzdGVyUGF0aChwYXRoRGF0YSkge1xuICAgIHRoaXMucGF0aFNldC5wdXNoKHBhdGhEYXRhKTtcbiAgfVxuXG4gIHNldCh0aW1lLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICB0aGlzLmluVHJhbnNpdGlvbiA9IHRydWU7XG4gICAgICBGYW1vdXNFbmdpbmUucmVxdWVzdFVwZGF0ZU9uTmV4dFRpY2sodGhpcyk7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lLnNldCh0aW1lLCB0cmFuc2l0aW9uLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuaW5UcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgICAgIEZhbW91c0VuZ2luZS5yZXF1ZXN0VXBkYXRlT25OZXh0VGljayh0aGlzKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3VycmVudFRpbWUuc2V0KHRpbWUpO1xuICAgICAgdGhpcy5pblRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICAgIEZhbW91c0VuZ2luZS5yZXF1ZXN0VXBkYXRlT25OZXh0VGljayh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBvblVwZGF0ZSh0aW1lKSB7XG4gICAgLy8gZ28gdGhyb3VnaCB0aGUgcGF0aFNldCwgYW5kIGJhc2ljYWxseSBleGVjdXRlIHRoZSBmdW5jdGlvblxuXG4gICAgdGltZSA9IHRoaXMuY3VycmVudFRpbWUuZ2V0KCkgKiB0aGlzLnRpbWVzY2FsZTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXRoU2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgcGF0aERhdGEgPSB0aGlzLnBhdGhTZXRbaV07XG5cbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGF0aERhdGEucGF0aC5sZW5ndGg7IGorKykge1xuICAgICAgICBsZXQgcmVzID0gW107XG4gICAgICAgIGxldCBjdXJyU3RlcCA9IHBhdGhEYXRhLnBhdGhbal07XG4gICAgICAgIGxldCBuZXh0U3RlcCA9IHBhdGhEYXRhLnBhdGhbaiArIDFdO1xuXG4gICAgICAgIC8vIGN1cnJlbnRseSBtaWQgcGF0aCwgY2FsY3VsYXRlIGFuZCBhcHBseS5cbiAgICAgICAgaWYgKG5leHRTdGVwICYmIGN1cnJTdGVwWzBdIDw9IHRpbWUgJiYgbmV4dFN0ZXBbMF0gPj0gdGltZSkge1xuICAgICAgICAgIGxldCBwZXJjZW50RG9uZSA9ICh0aW1lIC0gY3VyclN0ZXBbMF0pIC8gKG5leHRTdGVwWzBdIC0gY3VyclN0ZXBbMF0pO1xuICAgICAgICAgIGxldCBzdGF0ZSA9IGN1cnJTdGVwWzJdID8gY3VyclN0ZXBbMl0ocGVyY2VudERvbmUpIDogQ3VydmVzLmxpbmVhcihwZXJjZW50RG9uZSk7XG5cbiAgICAgICAgICBpZiAoY3VyclN0ZXBbMV0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBjdXJyU3RlcFsxXS5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICByZXNba10gPSBjdXJyU3RlcFsxXVtrXSArIChuZXh0U3RlcFsxXVtrXSAtIGN1cnJTdGVwWzFdW2tdKSAqIHN0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXMgPSBjdXJyU3RlcFsxXSArIChuZXh0U3RlcFsxXSAtIGN1cnJTdGVwWzFdKSAqIHN0YXRlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXRoRGF0YS5oYW5kbGVyKHJlcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBhcmUgcGFzc2VkIGxhc3Qgc3RlcCwgc2V0IG9iamVjdCB0byBmaW5hbCBzdGF0ZS5cbiAgICAgICAgaWYgKCFuZXh0U3RlcCAmJiBjdXJyU3RlcFswXSA8IHRpbWUpIHtcbiAgICAgICAgICBwYXRoRGF0YS5oYW5kbGVyKGN1cnJTdGVwWzFdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmluVHJhbnNpdGlvbikge1xuICAgICAgRmFtb3VzRW5naW5lLnJlcXVlc3RVcGRhdGVPbk5leHRUaWNrKHRoaXMpO1xuICAgIH1cbiAgfVxufVxuIiwiY29uc3QgQWxpZ24gPSBGYW1vdXNQbGF0Zm9ybS5jb21wb25lbnRzLkFsaWduO1xuY29uc3QgRmFtb3VzRW5naW5lID0gRmFtb3VzUGxhdGZvcm0uY29yZS5GYW1vdXNFbmdpbmU7XG5jb25zdCBNb3VudFBvaW50ID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5Nb3VudFBvaW50O1xuY29uc3QgT3BhY2l0eSA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuT3BhY2l0eTtcbmNvbnN0IE9yaWdpbiA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuT3JpZ2luO1xuY29uc3QgUG9zaXRpb24gPSBGYW1vdXNQbGF0Zm9ybS5jb21wb25lbnRzLlBvc2l0aW9uO1xuY29uc3QgUm90YXRpb24gPSBGYW1vdXNQbGF0Zm9ybS5jb21wb25lbnRzLlJvdGF0aW9uO1xuY29uc3QgU2NhbGUgPSBGYW1vdXNQbGF0Zm9ybS5jb21wb25lbnRzLlNjYWxlO1xuY29uc3QgU2l6ZSA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuU2l6ZTtcblxuY29uc3QgcmFkaWFuc011bHRpcGxpZXIgPSBNYXRoLlBJIC8gMTgwO1xuY29uc3QgZGVncmVlc011bHRpcGxpZXIgPSAxODAgLyBNYXRoLlBJO1xuXG4vKipcbiAqIENvbnZlcnRzIGRlZ3JlZXMgdG8gcmFkaWFucy5cbiAqIEBtZXRob2QgIHRvUmFkaWFuc1xuICogQGNsYXNzICAgTW9kaWZpZXJcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gICB7TnVtYmVyfSAgZGVncmVlcyAgVGhlIGRlZ3JlZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybiAge051bWJlcn0gIFRoZSBjb252ZXJ0ZWQgdmFsdWUgaW4gcmFkaWFucy5cbiAqL1xuZnVuY3Rpb24gdG9SYWRpYW5zKGRlZ3JlZXMpIHtcbiAgaWYgKGRlZ3JlZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiBkZWdyZWVzICogcmFkaWFuc011bHRpcGxpZXI7XG59XG5cbi8qKlxuICogQ29udmVydHMgcmFkaWFucyB0byBkZWdyZWVzLlxuICogQG1ldGhvZCAgdG9SYWRpYW5zXG4gKiBAY2xhc3MgICBNb2RpZmllclxuICogQHByaXZhdGVcbiAqIEBwYXJhbSAgIHtOdW1iZXJ9ICByYWRpYW5zICBUaGUgcmFkaWFuIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJuICB7TnVtYmVyfSAgVGhlIGNvbnZlcnRlZCB2YWx1ZSBpbiBkZWdyZWVzLlxuICovXG5mdW5jdGlvbiB0b0RlZ3JlZXMocmFkaWFucykge1xuICBpZiAocmFkaWFucyA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIHJhZGlhbnMgKiBkZWdyZWVzTXVsdGlwbGllcjtcbn1cblxuZnVuY3Rpb24gbm9Db252ZXJzaW9uKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kaWZpZXIge1xuICAvKipcbiAgICogQmFzZSBjbGFzcyB3aGljaCBjb250YWlucyBhbGwgbW9kaWZpZXJzIGFuZCBjb250YWlucyBubyB2aXN1YWwgY29tcG9uZW50cy5cbiAgICogQG1ldGhvZCAgY29uc3RydWN0b3JcbiAgICogQGNsYXNzICAgTW9kaWZpZXJcbiAgICogQHBhcmFtICAge05vZGV9ICAgIG5vZGUgICAgICAgICAgICAgICAgICBUaGUge0BsaW5rIE5vZGV9IHRvIGF0dGFjaCB0aGlzIE1vZGlmaWVyIHRvLlxuICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgPG9wdGlvbnM+ICAgICAgICAgICAgIE9wdGlvbmFsIG9wdGlvbnMuXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICA8b3B0aW9ucy51c2VEZWdyZWVzPiAgQWNjZXB0IGRlZ3JlZXMgd2hlbiBjYWxsaW5nIHJvdGF0aW9uIG1ldGhvZHMsIG90aGVyd2lzZSB1c2UgcmFkaWFucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG5vZGUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmlkID0gdGhpcy5ub2RlLmdldExvY2F0aW9uKCk7XG4gICAgaWYgKG9wdGlvbnMudXNlRGVncmVlcykge1xuICAgICAgdGhpcy5zZXRSb3RhdGlvblZhbCA9IHRvUmFkaWFucztcbiAgICAgIHRoaXMuZ2V0Um90YXRpb25WYWwgPSB0b0RlZ3JlZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0Um90YXRpb25WYWwgPSBub0NvbnZlcnNpb247XG4gICAgICB0aGlzLmdldFJvdGF0aW9uVmFsID0gbm9Db252ZXJzaW9uO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciBTaXplIGVudW1zXG4gIHN0YXRpYyBnZXQgUkVMQVRJVkVfU0laRSgpIHsgcmV0dXJuIFNpemUuUkVMQVRJVkU7IH1cbiAgc3RhdGljIGdldCBBQlNPTFVURV9TSVpFKCkgeyByZXR1cm4gU2l6ZS5BQlNPTFVURTsgfVxuICBzdGF0aWMgZ2V0IFJFTkRFUl9TSVpFKCkgeyByZXR1cm4gU2l6ZS5SRU5ERVI7IH1cbiAgc3RhdGljIGdldCBERUZBVUxUX1NJWkUoKSB7IHJldHVybiBTaXplLkRFRkFVTFQ7IH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gR2V0dGVyIGZ1bmN0aW9ucyBmb3IgdGhpcy5ub2RlXG4gIGdldENoaWxkcmVuKCkgeyByZXR1cm4gdGhpcy5ub2RlLmdldENoaWxkcmVuKCk7IH1cbiAgZ2V0Q29tcHV0ZWRWYWx1ZSgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29tcHV0ZWRWYWx1ZSgpOyB9XG4gIGdldElkKCkgeyByZXR1cm4gdGhpcy5ub2RlLmdldExvY2F0aW9uKCk7IH1cbiAgZ2V0UGFyZW50KCkgeyByZXR1cm4gdGhpcy5ub2RlLmdldFBhcmVudCgpOyB9XG4gIGdldFZhbHVlKCkgeyByZXR1cm4gdGhpcy5ub2RlLmdldFZhbHVlKCk7IH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3RhdGUgaW5mbyBmb3IgdGhpcy5ub2RlXG4gIGlzTW91bnRlZCgpIHsgcmV0dXJuIHRoaXMubm9kZS5pc01vdW50ZWQoKTsgfVxuICBpc1Nob3duKCkgeyByZXR1cm4gdGhpcy5ub2RlLmlzU2hvd24oKTsgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTY2VuZSBncmFwaCBtb2RpZmllcnNcbiAgYWRkQ2hpbGQoY2hpbGQpIHsgcmV0dXJuIHRoaXMubm9kZS5hZGRDaGlsZChjaGlsZCk7IH1cbiAgcmVtb3ZlQ2hpbGQoY2hpbGQpIHsgcmV0dXJuIHRoaXMubm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7IH1cbiAgLy8gQXR0YWNoIHRoaXMgbm9kZSBhbmQgaXQncyBzdWJ0cmVlIGJ5IHNldHRpbmcgaXQgYXMgYSBjaGlsZCBvZiB0aGUgcGFzc2VkIGluIHBhcmVudC5cbiAgYXR0YWNoVG8ocGFyZW50KSB7XG4gICAgcGFyZW50LmFkZENoaWxkKHRoaXMubm9kZSk7XG4gICAgdGhpcy5ub2RlLnNob3coKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvLyBEZXRhY2ggdGhpcyBub2RlIGZyb20gdGhlIHNjZW5lIGdyYXBoIGJ5IHJlbW92aW5nIGl0IGFzIGEgY2hpbGQgb2YgaXRzIHBhcmVudC5cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMuZ2V0UGFyZW50KCkucmVtb3ZlQ2hpbGQodGhpcy5ub2RlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBoaWRlKCkge1xuICAgIHRoaXMubm9kZS5oaWRlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2hvdygpIHtcbiAgICB0aGlzLm5vZGUuc2hvdygpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFVwZGF0ZSBmdW5jdGlvbnMgZm9yIHRoaXMubm9kZVxuICByZXF1ZXN0VXBkYXRlKHJlcXVlc3Rlcikge1xuICAgIEZhbW91c0VuZ2luZS5yZXF1ZXN0VXBkYXRlKHJlcXVlc3RlciB8fCB0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICByZXF1ZXN0VXBkYXRlT25OZXh0VGljayhyZXF1ZXN0ZXIpIHtcbiAgICBGYW1vdXNFbmdpbmUucmVxdWVzdFVwZGF0ZU9uTmV4dFRpY2socmVxdWVzdGVyIHx8IHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIGFsaWduXG4gIHZhbGlkYXRlQWxpZ24oKSB7XG4gICAgaWYgKCF0aGlzLmFsaWduKSB0aGlzLmFsaWduID0gbmV3IEFsaWduKHRoaXMubm9kZSk7XG4gIH1cbiAgaGFsdEFsaWduKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHRoaXMuYWxpZ24uaGFsdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIEFsaWduIGdldHRlcnNcbiAgZ2V0QWxpZ25WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICByZXR1cm4gdGhpcy5hbGlnbi5nZXRWYWx1ZSgpO1xuICB9XG4gIGdldEFsaWduWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICByZXR1cm4gdGhpcy5hbGlnbi5nZXRYKCk7XG4gIH1cblxuICBnZXRBbGlnblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaWduKCk7XG4gICAgcmV0dXJuIHRoaXMuYWxpZ24uZ2V0WSgpO1xuICB9XG4gIGdldEFsaWduWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICByZXR1cm4gdGhpcy5hbGlnbi5nZXRaKCk7XG4gIH1cbiAgLy8gQWxpZ24gc2V0dGVyc1xuICBzZXRBbGlnblZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHRoaXMuYWxpZ24uc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRBbGlnbigpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICB0aGlzLmFsaWduLnNldCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldEFsaWduWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICB0aGlzLmFsaWduLnNldFgoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRBbGlnblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaWduKCk7XG4gICAgdGhpcy5hbGlnbi5zZXRZKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0QWxpZ25aKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHRoaXMuYWxpZ24uc2V0WiguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIG1vdW50IHBvaW50XG4gIHZhbGlkYXRlTW91bnRQb2ludCgpIHtcbiAgICBpZiAoIXRoaXMubW91bnRwb2ludCkgdGhpcy5tb3VudHBvaW50ID0gbmV3IE1vdW50UG9pbnQodGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0TW91bnRQb2ludCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHRoaXMubW91bnRwb2ludC5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gTW91bnRQb2ludCBnZXR0ZXJzXG4gIGdldE1vdW50UG9pbnRWYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHJldHVybiB0aGlzLm1vdW50cG9pbnQuZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRNb3VudFBvaW50WCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHJldHVybiB0aGlzLm1vdW50cG9pbnQuZ2V0WCgpO1xuICB9XG4gIGdldE1vdW50UG9pbnRZKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgcmV0dXJuIHRoaXMubW91bnRwb2ludC5nZXRZKCk7XG4gIH1cbiAgZ2V0TW91bnRQb2ludFooKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1vdW50UG9pbnQoKTtcbiAgICByZXR1cm4gdGhpcy5tb3VudHBvaW50LmdldFooKTtcbiAgfVxuICAvLyBNb3VudFBvaW50IHNldHRlcnNcbiAgc2V0TW91bnRQb2ludFZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgdGhpcy5tb3VudHBvaW50LnNldFZhbHVlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0TW91bnRQb2ludCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHRoaXMubW91bnRwb2ludC5zZXQoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRNb3VudFBvaW50WCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHRoaXMubW91bnRwb2ludC5zZXRYKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0TW91bnRQb2ludFkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1vdW50UG9pbnQoKTtcbiAgICB0aGlzLm1vdW50cG9pbnQuc2V0WSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE1vdW50UG9pbnRaKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgdGhpcy5tb3VudHBvaW50LnNldFooLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciBvcGFjaXR5XG4gIHZhbGlkYXRlT3BhY2l0eSgpIHtcbiAgICBpZiAoIXRoaXMub3BhY2l0eSkgdGhpcy5vcGFjaXR5ID0gbmV3IE9wYWNpdHkodGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0T3BhY2l0eSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3BhY2l0eSgpO1xuICAgIHRoaXMub3BhY2l0eS5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gT3BhY2l0eSBnZXR0ZXJzXG4gIGdldE9wYWNpdHlWYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3BhY2l0eSgpO1xuICAgIHJldHVybiB0aGlzLm9wYWNpdHkuZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRPcGFjaXR5KCkge1xuICAgIHRoaXMudmFsaWRhdGVPcGFjaXR5KCk7XG4gICAgcmV0dXJuIHRoaXMub3BhY2l0eS5nZXQoKTtcbiAgfVxuICAvLyBPcGFjaXR5IHNldHRlcnNcbiAgc2V0T3BhY2l0eVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcGFjaXR5KCk7XG4gICAgdGhpcy5vcGFjaXR5LnNldFZhbHVlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0T3BhY2l0eSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3BhY2l0eSgpO1xuICAgIHRoaXMub3BhY2l0eS5zZXQoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciBvcmlnaW5cbiAgdmFsaWRhdGVPcmlnaW4oKSB7XG4gICAgaWYgKCF0aGlzLm9yaWdpbikgdGhpcy5vcmlnaW4gPSBuZXcgT3JpZ2luKHRoaXMubm9kZSk7XG4gIH1cbiAgaGFsdE9yaWdpbigpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgdGhpcy5vcmlnaW4uaGFsdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIE9yaWdpbiBnZXR0ZXJzXG4gIGdldE9yaWdpblZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRPcmlnaW5YKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uZ2V0WCgpO1xuICB9XG4gIGdldE9yaWdpblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5nZXRZKCk7XG4gIH1cbiAgZ2V0T3JpZ2luWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLmdldFooKTtcbiAgfVxuICAvLyBPcmlnaW4gc2V0dGVyc1xuICBzZXRPcmlnaW5WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgdGhpcy5vcmlnaW4uc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRPcmlnaW4oKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHRoaXMub3JpZ2luLnNldCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE9yaWdpblgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHRoaXMub3JpZ2luLnNldFgoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRPcmlnaW5ZKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICB0aGlzLm9yaWdpbi5zZXRZKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0T3JpZ2luWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgdGhpcy5vcmlnaW4uc2V0WiguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIHBvc2l0aW9uXG4gIHZhbGlkYXRlUG9zaXRpb24oKSB7XG4gICAgaWYgKCF0aGlzLnBvc2l0aW9uKSB0aGlzLnBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKHRoaXMubm9kZSk7XG4gIH1cbiAgaGFsdFBvc2l0aW9uKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHRoaXMucG9zaXRpb24uaGFsdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIFBvc2l0aW9uIGdldHRlcnNcbiAgZ2V0UG9zaXRpb25WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5nZXRWYWx1ZSgpO1xuICB9XG4gIGdldFBvc2l0aW9uWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5nZXRYKCk7XG4gIH1cbiAgZ2V0UG9zaXRpb25ZKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmdldFkoKTtcbiAgfVxuICBnZXRQb3NpdGlvblooKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24uZ2V0WigpO1xuICB9XG4gIC8vIFBvc2l0aW9uIHNldHRlcnNcbiAgc2V0UG9zaXRpb25WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICB0aGlzLnBvc2l0aW9uLnNldFZhbHVlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0UG9zaXRpb24oKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRQb3NpdGlvblgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgdGhpcy5wb3NpdGlvbi5zZXRYKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0UG9zaXRpb25ZKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHRoaXMucG9zaXRpb24uc2V0WSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFBvc2l0aW9uWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICB0aGlzLnBvc2l0aW9uLnNldFooLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciByb3RhdGlvblxuICB2YWxpZGF0ZVJvdGF0aW9uKCkge1xuICAgIGlmICghdGhpcy5yb3RhdGlvbikgdGhpcy5yb3RhdGlvbiA9IG5ldyBSb3RhdGlvbih0aGlzLm5vZGUpO1xuICB9XG4gIGhhbHRSb3RhdGlvbigpIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICB0aGlzLnJvdGF0aW9uLmhhbHQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvLyBSb3RhdGlvbiBnZXR0ZXJzXG4gIGdldFJvdGF0aW9uVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgbGV0IHZhbCA9IHRoaXMucm90YXRpb24uZ2V0VmFsdWUoKTtcbiAgICB2YWwueCA9IHRoaXMuZ2V0Um90YXRpb25WYWwodmFsLngpO1xuICAgIHZhbC55ID0gdGhpcy5nZXRSb3RhdGlvblZhbCh2YWwueSk7XG4gICAgdmFsLnogPSB0aGlzLmdldFJvdGF0aW9uVmFsKHZhbC56KTtcbiAgICByZXR1cm4gdmFsO1xuICB9XG4gIGdldFJvdGF0aW9uWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5nZXRSb3RhdGlvblZhbCh0aGlzLnJvdGF0aW9uLmdldFgoKSk7XG4gIH1cbiAgZ2V0Um90YXRpb25ZKCkge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHJldHVybiB0aGlzLmdldFJvdGF0aW9uVmFsKHRoaXMucm90YXRpb24uZ2V0WSgpKTtcbiAgfVxuICBnZXRSb3RhdGlvblooKSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Um90YXRpb25WYWwodGhpcy5yb3RhdGlvbi5nZXRaKCkpO1xuICB9XG4gIC8vIFJvdGF0aW9uIHNldHRlcnNcbiAgc2V0Um90YXRpb25WYWx1ZShzdGF0ZSA9IHt9KSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgc3RhdGUueCA9IHRoaXMuc2V0Um90YXRpb25WYWwoc3RhdGUueCk7XG4gICAgc3RhdGUueSA9IHRoaXMuc2V0Um90YXRpb25WYWwoc3RhdGUueSk7XG4gICAgc3RhdGUueiA9IHRoaXMuc2V0Um90YXRpb25WYWwoc3RhdGUueik7XG4gICAgdGhpcy5yb3RhdGlvbi5zZXRWYWx1ZShzdGF0ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0Um90YXRpb24oeCwgeSwgeiwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICB0aGlzLnJvdGF0aW9uLnNldCh0aGlzLnNldFJvdGF0aW9uVmFsKHgpLCB0aGlzLnNldFJvdGF0aW9uVmFsKHkpLCB0aGlzLnNldFJvdGF0aW9uVmFsKHopLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0Um90YXRpb25YKHZhbCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICB0aGlzLnJvdGF0aW9uLnNldFgodGhpcy5zZXRSb3RhdGlvblZhbCh2YWwpLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0Um90YXRpb25ZKHZhbCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICB0aGlzLnJvdGF0aW9uLnNldFkodGhpcy5zZXRSb3RhdGlvblZhbCh2YWwpLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0Um90YXRpb25aKHZhbCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLnNldFJvdGF0aW9uVmFsKHZhbCk7XG4gICAgdGhpcy5yb3RhdGlvbi5zZXRaKHZhbHVlLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gaGVscGVycyBmb3Igc2NhbGVcbiAgdmFsaWRhdGVTY2FsZSgpIHtcbiAgICBpZiAoIXRoaXMuc2NhbGUpIHRoaXMuc2NhbGUgPSBuZXcgU2NhbGUodGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0U2NhbGUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgdGhpcy5zY2FsZS5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gU2NhbGUgZ2V0dGVyc1xuICBnZXRTY2FsZVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHJldHVybiB0aGlzLnNjYWxlLmdldFZhbHVlKCk7XG4gIH1cbiAgZ2V0U2NhbGVYKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHJldHVybiB0aGlzLnNjYWxlLmdldFgoKTtcbiAgfVxuICBnZXRTY2FsZVkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGUuZ2V0WSgpO1xuICB9XG4gIGdldFNjYWxlWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2NhbGUoKTtcbiAgICByZXR1cm4gdGhpcy5zY2FsZS5nZXRaKCk7XG4gIH1cbiAgLy8gU2NhbGUgc2V0dGVyc1xuICBzZXRTY2FsZVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHRoaXMuc2NhbGUuc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRTY2FsZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2NhbGUoKTtcbiAgICB0aGlzLnNjYWxlLnNldCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFNjYWxlWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2NhbGUoKTtcbiAgICB0aGlzLnNjYWxlLnNldFgoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRTY2FsZVkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgdGhpcy5zY2FsZS5zZXRZKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0U2NhbGVaKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHRoaXMuc2NhbGUuc2V0WiguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIHNpemVcbiAgdmFsaWRhdGVTaXplKCkge1xuICAgIGlmICghdGhpcy5zaXplKSB0aGlzLnNpemUgPSBuZXcgU2l6ZSh0aGlzLm5vZGUpO1xuICB9XG4gIGhhbHRTaXplKCkge1xuICAgIHRoaXMudmFsaWRhdGVTaXplKCk7XG4gICAgdGhpcy5zaXplLmhhbHQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvLyBTaXplIGdldHRlcnNcbiAgZ2V0U2l6ZVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVTaXplKCk7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZS5nZXRWYWx1ZSgpO1xuICB9XG4gIGdldFNpemUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNpemUoKTtcbiAgICByZXR1cm4gdGhpcy5zaXplLmdldCgpO1xuICB9XG4gIC8vIFNpemUgc2V0dGVyc1xuICBzZXRTaXplVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNpemUoKTtcbiAgICB0aGlzLnNpemUuc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXREaWZmZXJlbnRpYWxTaXplKCkge1xuICAgIHRoaXMudmFsaWRhdGVTaXplKCk7XG4gICAgdGhpcy5zaXplLnNldERpZmZlcmVudGlhbCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFByb3BvcnRpb25hbFNpemUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNpemUoKTtcbiAgICB0aGlzLnNpemUuc2V0UHJvcG9ydGlvbmFsKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0QWJzb2x1dGVTaXplKCkge1xuICAgIHRoaXMudmFsaWRhdGVTaXplKCk7XG4gICAgdGhpcy5zaXplLnNldEFic29sdXRlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0U2l6ZU1vZGUoeCwgeSwgeikge1xuICAgIHRoaXMubm9kZS5zZXRTaXplTW9kZSh4LCB5LCB6KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRTaXplTW9kZUFic29sdXRlKCkge1xuICAgIHRoaXMubm9kZS5zZXRTaXplTW9kZShTaXplLkFCU09MVVRFLCBTaXplLkFCU09MVVRFLCBTaXplLkFCU09MVVRFKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRTaXplTW9kZVJlbGF0aXZlKCkge1xuICAgIHRoaXMubm9kZS5zZXRTaXplTW9kZShTaXplLlJFTEFUSVZFLCBTaXplLlJFTEFUSVZFLCBTaXplLlJFTEFUSVZFKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRTaXplTW9kZVJlbmRlcigpIHtcbiAgICB0aGlzLm5vZGUuc2V0U2l6ZU1vZGUoU2l6ZS5SRU5ERVIsIFNpemUuUkVOREVSLCBTaXplLlJFTkRFUik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQ29udmVuaWVuY2UgTWV0aG9kc1xuICBtb3ZlVG9wTGVmdCgpIHtcbiAgICB0aGlzLnNldEFsaWduKDAsIDAsIDAuNSkuc2V0TW91bnRQb2ludCgwLCAwLCAwLjUpLnNldE9yaWdpbigwLCAwLCAwLjUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG1vdmVUb3BDZW50ZXIoKSB7XG4gICAgdGhpcy5zZXRBbGlnbigwLjUsIDAsIDAuNSkuc2V0TW91bnRQb2ludCgwLjUsIDAsIDAuNSkuc2V0T3JpZ2luKDAuNSwgMCwgMC41KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBtb3ZlVG9wUmlnaHQoKSB7XG4gICAgdGhpcy5zZXRBbGlnbigxLCAwLCAwLjUpLnNldE1vdW50UG9pbnQoMSwgMCwgMC41KS5zZXRPcmlnaW4oMSwgMCwgMC41KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBtb3ZlQ2VudGVyTGVmdCgpIHtcbiAgICB0aGlzLnNldEFsaWduKDAsIDAuNSwgMC41KS5zZXRNb3VudFBvaW50KDAsIDAuNSwgMC41KS5zZXRPcmlnaW4oMCwgMC41LCAwLjUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG1vdmVDZW50ZXIoKSB7XG4gICAgdGhpcy5zZXRBbGlnbigwLjUsIDAuNSwgMC41KS5zZXRNb3VudFBvaW50KDAuNSwgMC41LCAwLjUpLnNldE9yaWdpbigwLjUsIDAuNSwgMC41KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBtb3ZlQ2VudGVyUmlnaHQoKSB7XG4gICAgdGhpcy5zZXRBbGlnbigxLCAwLjUsIDAuNSkuc2V0TW91bnRQb2ludCgxLCAwLjUsIDAuNSkuc2V0T3JpZ2luKDEsIDAuNSwgMC41KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBtb3ZlQm90dG9tTGVmdCgpIHtcbiAgICB0aGlzLnNldEFsaWduKDAsIDEsIDAuNSkuc2V0TW91bnRQb2ludCgwLCAxLCAwLjUpLnNldE9yaWdpbigwLCAxLCAwLjUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG1vdmVCb3R0b21DZW50ZXIoKSB7XG4gICAgdGhpcy5zZXRBbGlnbigwLjUsIDEsIDAuNSkuc2V0TW91bnRQb2ludCgwLjUsIDEsIDAuNSkuc2V0T3JpZ2luKDAuNSwgMSwgMC41KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBtb3ZlQm90dG9tUmlnaHQoKSB7XG4gICAgdGhpcy5zZXRBbGlnbigxLCAxLCAwLjUpLnNldE1vdW50UG9pbnQoMSwgMSwgMC41KS5zZXRPcmlnaW4oMSwgMSwgMC41KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIiwiLyoqXG4gKiBWaWV3IGNsYXNzIHRoYXQgZXh0ZW5kcyBNb2RpZmllciBhbmQgc2hvdWxkIGJlIHVzZWQgZm9yIHZpc3VhbCBlbGVtZW50cy5cbiAqL1xuXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4uL2V2ZW50cy9FdmVudEVtaXR0ZXInO1xuaW1wb3J0IE1vZGlmaWVyIGZyb20gJy4vTW9kaWZpZXInO1xuXG5jb25zdCBDb2xvciA9IEZhbW91c1BsYXRmb3JtLnV0aWxpdGllcy5Db2xvcjtcbmNvbnN0IFRyYW5zaXRpb25hYmxlID0gRmFtb3VzUGxhdGZvcm0udHJhbnNpdGlvbnMuVHJhbnNpdGlvbmFibGU7XG5jb25zdCBET01FbGVtZW50ID0gRmFtb3VzUGxhdGZvcm0uZG9tUmVuZGVyYWJsZXMuRE9NRWxlbWVudDtcbmNvbnN0IER5bmFtaWNHZW9tZXRyeSA9IEZhbW91c1BsYXRmb3JtLndlYmdsR2VvbWV0cmllcy5EeW5hbWljR2VvbWV0cnk7XG5jb25zdCBHZW9tZXRyeSA9IEZhbW91c1BsYXRmb3JtLndlYmdsR2VvbWV0cmllcy5HZW9tZXRyeTtcbmNvbnN0IEV2ZW50TWFwID0gT2JqZWN0LmtleXMoRmFtb3VzUGxhdGZvcm0uZG9tUmVuZGVyZXJzLkV2ZW50cy5FdmVudE1hcCk7XG5jb25zdCBNZXNoID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xSZW5kZXJhYmxlcy5NZXNoO1xuY29uc3QgT0JKTG9hZGVyID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xHZW9tZXRyaWVzLk9CSkxvYWRlcjtcblxuLyoqXG4gKiBDb252ZXJ0cyByYXcgdGV4dCBmcm9tIGFuIE9CSiBpbnRvIGEgRHluYW1pY0dlb21ldHJ5LlxuICogQG1ldGhvZCAgb2JqVG9HZW9tZXRyeVxuICogQHBhcmFtICAge1N0cmluZ30gICAgICAgICAgIHJhd1RleHQgIFRoZSByYXcgdGV4dCBmcm9tIGFuIE9CSiBmaWxlLlxuICogQHJldHVybiAge0R5bmFtaWNHZW9tZXRyeX0gIFRoZSBuZXcgRHluYW1pY0dlb21ldHJ5IGZyb20gdGhlIE9CSi5cbiAqL1xuZnVuY3Rpb24gb2JqVG9HZW9tZXRyeShyYXdUZXh0LCBvcHRpb25zKSB7XG4gIGxldCBidWZmZXJzID0gT0JKTG9hZGVyLmZvcm1hdFRleHQocmF3VGV4dCwgb3B0aW9ucyk7XG4gIGxldCBnZW9tZXRyeSA9IG5ldyBHZW9tZXRyeSh7XG4gICAgYnVmZmVyczogW1xuICAgICAgeyBuYW1lOiAnYV9wb3MnLCBkYXRhOiBidWZmZXJzLnZlcnRpY2VzLCBzaXplOiAzIH0sXG4gICAgICB7IG5hbWU6ICdhX25vcm1hbHMnLCBkYXRhOiBidWZmZXJzLm5vcm1hbHMsIHNpemU6IDMgfSxcbiAgICAgIHsgbmFtZTogJ2FfdGV4Q29vcmQnLCBkYXRhOiBidWZmZXJzLnRleHR1cmVDb29yZHMsIHNpemU6IDIgfSxcbiAgICAgIHsgbmFtZTogJ2luZGljZXMnLCBkYXRhOiBidWZmZXJzLmluZGljZXMsIHNpemU6IDEgfVxuICAgIF1cbiAgfSk7XG4gIHJldHVybiBnZW9tZXRyeTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlldyBleHRlbmRzIE1vZGlmaWVye1xuICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgc3VwZXIobm9kZSwgb3B0aW9ucyk7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gRE9NIENyZWF0aW9uIGFuZCBNb2RpZmllcnNcbiAgdmFsaWRhdGVET00ob3B0aW9ucykge1xuICAgIGlmICghdGhpcy5lbCkge1xuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgICB0aGlzLmVsID0gbmV3IERPTUVsZW1lbnQodGhpcy5ub2RlLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuZWwub25SZWNlaXZlID0gKGV2ZW50LCBwYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9ldmVudHNbZXZlbnRdKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzW2V2ZW50XShwYXlsb2FkKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH1cbiAgY3JlYXRlRE9NRWxlbWVudChvcHRpb25zKSB7XG4gICAgdGhpcy52YWxpZGF0ZURPTShvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRET01Db250ZW50KGNvbnRlbnQpIHtcbiAgICB0aGlzLnZhbGlkYXRlRE9NKCk7XG4gICAgdGhpcy5lbC5zZXRDb250ZW50KGNvbnRlbnQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldERPTUNsYXNzZXMoY2xhc3Nlcykge1xuICAgIHRoaXMudmFsaWRhdGVET00oKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuZWwuYWRkQ2xhc3MoY2xhc3Nlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldERPTUF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xuICAgIHRoaXMudmFsaWRhdGVET00oKTtcbiAgICBmb3IgKGxldCBhdHRyTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgYXR0cmlidXRlc1thdHRyTmFtZV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRET01Qcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICB0aGlzLnZhbGlkYXRlRE9NKCk7XG4gICAgZm9yIChsZXQgcHJvcGVydHlOYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIHRoaXMuZWwuc2V0UHJvcGVydHkocHJvcGVydHlOYW1lLCBwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldERPTVVuc2VsZWN0YWJsZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlRE9NKCk7XG4gICAgLy8gTWFrZSB0aGlzIERPTSB1bnNlbGVjdGFibGUuIE9ubHkgbmVlZHMgdG8gYmUgYXBwbGllZCBvbmNlIHBlciBET00uXG4gICAgaWYgKCF0aGlzLl91bnNlbGVjdGFibGUpIHtcbiAgICAgIHRoaXMuX3Vuc2VsZWN0YWJsZSA9IHRydWU7XG4gICAgICB0aGlzLnNldERPTVByb3BlcnRpZXMoe1xuICAgICAgICAnLW1vei11c2VyLXNlbGVjdCc6ICctbW96LW5vbmUnLFxuICAgICAgICAnLWtodG1sLXVzZXItc2VsZWN0JzogJ25vbmUnLFxuICAgICAgICAnLXdlYmtpdC11c2VyLXNlbGVjdCc6ICdub25lJyxcbiAgICAgICAgJy1tcy11c2VyLXNlbGVjdCc6ICdub25lJyxcbiAgICAgICAgJ3VzZXItc2VsZWN0JzogJ25vbmUnLFxuICAgICAgICAnY3Vyc29yJzogJ3BvaW50ZXInXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZXRDdXRvdXRTdGF0ZSh1c2VDdXRvdXQpIHtcbiAgICB0aGlzLnZhbGlkYXRlRE9NKClcbiAgICB0aGlzLmVsLnNldEN1dG91dFN0YXRlKHVzZUN1dG91dCk7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gRE9NIEV2ZW50c1xuICBvbihldk5hbWUsIGZuKSB7XG4gICAgaWYgKEV2ZW50TWFwLmluZGV4T2YoZXZOYW1lKSA+IC0xKSB7XG4gICAgICAvLyBET00gRXZlbnRcbiAgICAgIHRoaXMudmFsaWRhdGVET00oKTtcbiAgICAgIHRoaXMubm9kZS5hZGRVSUV2ZW50KGV2TmFtZSk7XG4gICAgICB0aGlzLl9ldmVudHNbZXZOYW1lXSA9IGZuO1xuICAgIH0gZWxzZSB7XG4gICAgICBFdmVudEVtaXR0ZXIub24oZXZOYW1lLCBmbik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG9mZihldk5hbWUsIGZuKSB7XG4gICAgaWYgKEV2ZW50TWFwLmluZGV4T2YoZXZOYW1lKSA+IC0xKSB7XG4gICAgICAvLyBUT0RPOiBOb3QgaW1wbGVtZW50ZWQgZm9yIERPTSB5ZXRcbiAgICB9IGVsc2Uge1xuICAgICAgRXZlbnRFbWl0dGVyLm9mZihldk5hbWUsIGZuKTtcbiAgICB9XG4gIH1cblxuICAvLyBHbG9iYWwgRXZlbnRzXG4gIHRyaWdnZXIoZXZOYW1lLCBwYXlsb2FkKSB7XG4gICAgRXZlbnRFbWl0dGVyLnRyaWdnZXIoZXZOYW1lLCBwYXlsb2FkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBlbWl0KGV2TmFtZSwgcGF5bG9hZCkge1xuICAgIGNvbnNvbGUud2FybignVmlldy5lbWl0KCkgaXMgZGVwcmVjYXRlZC4gVXNlIFZpZXcudHJpZ2dlcigpIGluc3RlYWQuJyk7XG4gICAgcmV0dXJuIHRoaXMudHJpZ2dlcihldk5hbWUsIHBheWxvYWQpO1xuICAgIC8vIGlmICghdGhpcy5ldmVudEVtaXR0ZXIpIHRoaXMuZXZlbnRFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcih0aGlzLm5vZGUpO1xuICAgIC8vIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoZXYsIHBheWxvYWQpO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFdlYkdMIE1lc2ggQ3JlYXRpb24gYW5kIE1vZGlmaWVyc1xuICB2YWxpZGF0ZU1lc2goKSB7XG4gICAgaWYgKCF0aGlzLm1lc2gpIHRoaXMubWVzaCA9IG5ldyBNZXNoKHRoaXMubm9kZSk7XG4gIH1cbiAgLy8gTWVzaCBHZXR0ZXJzXG4gIGdldE1lc2hCYXNlQ29sb3IoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICByZXR1cm4gdGhpcy5tZXNoLmdldEJhc2VDb2xvcigpO1xuICB9XG4gIGdldE1lc2hEcmF3T3B0aW9ucygpIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIHJldHVybiB0aGlzLm1lc2guZ2V0RHJhd09wdGlvbnMoKTtcbiAgfVxuICBnZXRNZXNoRmxhdFNoYWRpbmcoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICByZXR1cm4gdGhpcy5tZXNoLmdldEZsYXRTaGFkaW5nKCk7XG4gIH1cbiAgZ2V0TWVzaEdlb21ldHJ5KCkge1xuICAgIHRoaXMudmFsaWRhdGVNZXNoKCk7XG4gICAgcmV0dXJuIHRoaXMubWVzaC5nZXRHZW9tZXRyeSgpO1xuICB9XG4gIGdldE1lc2hHbG9zc2luZXNzKCkge1xuICAgIHRoaXMudmFsaWRhdGVNZXNoKCk7XG4gICAgcmV0dXJuIHRoaXMubWVzaC5nZXRHbG9zc2luZXNzKCk7XG4gIH1cbiAgZ2V0TWVzaE1hdGVyaWFsRXhwcmVzc2lvbnMoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICByZXR1cm4gdGhpcy5tZXNoLmdldE1hdGVyaWFsRXhwcmVzc2lvbnMoKTtcbiAgfVxuICBnZXRNZXNoTm9ybWFscyhtYXRlcmlhbEV4cHJlc3Npb24pIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIHJldHVybiB0aGlzLm1lc2guZ2V0Tm9ybWFscyhtYXRlcmlhbEV4cHJlc3Npb24pO1xuICB9XG4gIGdldE1lc2hQb3NpdGlvbk9mZnNldChtYXRlcmlhbEV4cHJlc3Npb24pIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIHJldHVybiB0aGlzLm1lc2guZ2V0UG9zaXRpb25PZmZzZXQobWF0ZXJpYWxFeHByZXNzaW9uKTtcbiAgfVxuICBnZXRNZXNoVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICByZXR1cm4gdGhpcy5tZXNoLmdldFZhbHVlKCk7XG4gIH1cblxuICBzZXRCYXNlQ29sb3IoY29sb3IsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICBpZighdGhpcy5iYXNlQ29sb3IpIHtcbiAgICAgIHRoaXMuYmFzZUNvbG9yID0gKENvbG9yLmlzQ29sb3JJbnN0YW5jZShjb2xvcikpID8gY29sb3IgOiBuZXcgQ29sb3IoY29sb3IpO1xuICAgICAgdGhpcy5tZXNoLnNldEJhc2VDb2xvcih0aGlzLmJhc2VDb2xvcik7XG4gICAgfVxuICAgIHRoaXMuYmFzZUNvbG9yLnNldChjb2xvciwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0U3BlY3VsYXJDb2xvcihjb2xvciwgc3RyZW5ndGgsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICBpZighdGhpcy5zcGVjdWxhckNvbG9yKSB7XG4gICAgICB0aGlzLnNwZWN1bGFyQ29sb3IgPSAoQ29sb3IuaXNDb2xvckluc3RhbmNlKGNvbG9yKSkgPyBjb2xvciA6IG5ldyBDb2xvcihjb2xvcik7XG4gICAgICB0aGlzLm1lc2guc2V0R2xvc3NpbmVzcyh0aGlzLnNwZWN1bGFyQ29sb3IsIHN0cmVuZ3RoKTtcbiAgICB9XG4gICAgdGhpcy5zcGVjdWxhckNvbG9yLnNldChjb2xvciwgdHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0TWVzaERyYXdPcHRpb25zKG9wdGlvbnMpIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIHRoaXMubWVzaC5zZXREcmF3T3B0aW9ucyhvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRNZXNoRmxhdFNoYWRpbmcoYm9vbCkge1xuICAgIHRoaXMudmFsaWRhdGVNZXNoKCk7XG4gICAgdGhpcy5tZXNoLnNldEZsYXRTaGFkaW5nKGJvb2wpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE1lc2hPcHRpb25zKG9wdGlvbnMpIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIHRoaXMubWVzaC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE1lc2hQb3NpdGlvbk9mZnNldChtYXRlcmlhbEV4cHJlc3Npb24pIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIHRoaXMubWVzaC5zZXRQb3NpdGlvbk9mZnNldChtYXRlcmlhbEV4cHJlc3Npb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldEdlb21ldHJ5KGdlb21ldHJ5LCBvcHRpb25zKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICB0aGlzLmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG4gICAgdGhpcy5tZXNoLnNldEdlb21ldHJ5KGdlb21ldHJ5LCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBXZWJHTCBHZW9tZXRyeVxuICAvLyBHZW9tZXRyeSBHZXR0ZXJzXG4gIGdldEdlb21ldHJ5TGVuZ3RoKCkgeyByZXR1cm4gdGhpcy5nZW9tZXRyeS5nZXRMZW5ndGgoKTsgfVxuICBnZXROb3JtYWxzKCkgeyByZXR1cm4gdGhpcy5nZW9tZXRyeS5nZXROb3JtYWxzKCk7IH1cbiAgZ2V0VGV4dHVyZUNvb3JkcygpIHsgcmV0dXJuIHRoaXMuZ2VvbWV0cnkuZ2V0VGV4dHVyZUNvb3JkcygpOyB9XG4gIGdldFZlcnRleEJ1ZmZlcihidWZmZXJOYW1lKSB7IHJldHVybiB0aGlzLmdlb21ldHJ5LmdldFZlcnRleEJ1ZmZlcihidWZmZXJOYW1lKTsgfVxuICBnZXRWZXJ0ZXhQb3NpdGlvbnMoKSB7IHJldHVybiB0aGlzLmdlb21ldHJ5LmdldFZlcnRleFBvc2l0aW9ucygpOyB9XG4gIC8vIEdlb21ldHJ5IFNldHRlcnNcbiAgZnJvbUdlb21ldHJ5KGdlb21ldHJ5KSB7XG4gICAgdGhpcy5nZW9tZXRyeS5mcm9tR2VvbWV0cnkoZ2VvbWV0cnkpO1xuICAgIHRoaXMuc2V0R2VvbWV0cnkodGhpcy5nZW9tZXRyeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0RHJhd1R5cGUodmFsdWUpIHtcbiAgICB0aGlzLmdlb21ldHJ5LnNldERyYXdUeXBlKHZhbHVlKTtcbiAgICB0aGlzLnNldEdlb21ldHJ5KHRoaXMuZ2VvbWV0cnkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldEluZGljZXMoaW5kaWNlcykge1xuICAgIHRoaXMuZ2VvbWV0cnkuc2V0SW5kaWNlcyhpbmRpY2VzKTtcbiAgICB0aGlzLnNldEdlb21ldHJ5KHRoaXMuZ2VvbWV0cnkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE5vcm1hbHMobm9ybWFscykge1xuICAgIHRoaXMuZ2VvbWV0cnkuc2V0Tm9ybWFscyhub3JtYWxzKTtcbiAgICB0aGlzLnNldEdlb21ldHJ5KHRoaXMuZ2VvbWV0cnkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFRleHR1cmVDb29yZHModGV4dHVyZUNvb3Jkcykge1xuICAgIHRoaXMuZ2VvbWV0cnkuc2V0VGV4dHVyZUNvb3Jkcyh0ZXh0dXJlQ29vcmRzKTtcbiAgICB0aGlzLnNldEdlb21ldHJ5KHRoaXMuZ2VvbWV0cnkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFZlcnRleEJ1ZmZlcihidWZmZXJOYW1lLCB2YWx1ZSwgc2l6ZSkge1xuICAgIHRoaXMuZ2VvbWV0cnkuc2V0VmVydGV4QnVmZmVyKGJ1ZmZlck5hbWUsIHZhbHVlLCBzaXplKTtcbiAgICB0aGlzLnNldEdlb21ldHJ5KHRoaXMuZ2VvbWV0cnkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFZlcnRleFBvc2l0aW9ucyh2ZXJ0aWNlcykge1xuICAgIHRoaXMuZ2VvbWV0cnkuc2V0VmVydGV4UG9zaXRpb25zKHZlcnRpY2VzKTtcbiAgICB0aGlzLnNldEdlb21ldHJ5KHRoaXMuZ2VvbWV0cnkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFdlYkdMIENvbnZlbmllbmNlIE1ldGhvZHNcbiAgdmFsaWRhdGVPYmpzKCkge1xuICAgIGlmICghdGhpcy5vYmpzKSB0aGlzLm9ianMgPSB7fTtcbiAgfVxuXG4gIHNldER5bmFtaWNHZW9tZXRyeShnZW9tZXRyeSwgb3B0aW9ucykge1xuICAgIC8vIEludGVuZGVkIGltcGxlbWVudGF0aW9uIC0gcmVtb3ZlcyBnZW9tZXRyeVBhcmVudFxuICAgIHRoaXMuc2V0R2VvbWV0cnkobmV3IER5bmFtaWNHZW9tZXRyeSgpLCBvcHRpb25zKTtcbiAgICB0aGlzLmZyb21HZW9tZXRyeShnZW9tZXRyeSk7XG4gICAgdGhpcy5zZXRHZW9tZXRyeSh0aGlzLmdlb21ldHJ5KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgR2VvbWV0cnkgZnJvbSB0aGUgcmF3VGV4dCBvZiBhbiBPQkouXG4gICAqIEBtZXRob2QgIHNldE9iakdlb21ldHJ5XG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgICAgICBvYmpOYW1lICAgICAgICAgICAgIFRoZSBuYW1lIHRvIGFwcGx5XG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgICAgICByYXdUZXh0ICAgICAgICAgICAgIFRoZSByYXcgdGV4dCBmcm9tIGFuIE9CSiBmaWxlLlxuICAgKiBAcGFyYW0gICB7QXJyYXl9ICAgICAgICAgb3B0aW9ucy5hbGlnbiAgICAgICBTZXQgdGhlIEFsaWduIG9mIHRoZSBHZW9tZXRyeS5cbiAgICogQHBhcmFtICAge0FycmF5fSAgICAgICAgIG9wdGlvbnMubW91bnRwb2ludCAgU2V0IHRoZSBNb3VudFBvaW50IG9mIHRoZSBHZW9tZXRyeS5cbiAgICogQHBhcmFtICAge0FycmF5fSAgICAgICAgIG9wdGlvbnMub3JpZ2luICAgICAgU2V0IHRoZSBPcmlnaW4gb2YgdGhlIEdlb21ldHJ5LlxuICAgKi9cbiAgYWRkT2JqKG9iak5hbWUsIHJhd1RleHQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnZhbGlkYXRlT2JqcygpO1xuICAgIHRoaXMub2Jqc1tvYmpOYW1lXSA9IG5ldyBWaWV3KHRoaXMuYWRkQ2hpbGQoKSk7XG4gICAgdGhpcy5vYmpzW29iak5hbWVdLnNldEdlb21ldHJ5KG9ialRvR2VvbWV0cnkocmF3VGV4dCwgb3B0aW9ucykpXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgaGlkZU9iaihvYmpOYW1lKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9ianMoKTtcbiAgICB0aGlzLm9ianNbb2JqTmFtZV0uc2V0T3BhY2l0eSgwKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBoaWRlT2JqcygpIHtcbiAgICB0aGlzLnZhbGlkYXRlT2JqcygpO1xuICAgIE9iamVjdC5rZXlzKHRoaXMub2JqcykuZm9yRWFjaCgob2JqTmFtZSkgPT4ge1xuICAgICAgdGhpcy5vYmpzW29iak5hbWVdLnNldE9wYWNpdHkoMCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2hvd09iaihvYmpOYW1lKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9ianMoKTtcbiAgICB0aGlzLm9ianNbb2JqTmFtZV0uc2V0T3BhY2l0eSgxKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzaG93T2JqcygpIHtcbiAgICB0aGlzLnZhbGlkYXRlT2JqcygpO1xuICAgIE9iamVjdC5rZXlzKHRoaXMub2JqcykuZm9yRWFjaCgob2JqTmFtZSkgPT4ge1xuICAgICAgdGhpcy5vYmpzW29iak5hbWVdLnNldE9wYWNpdHkoMSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0T2Jqc09wYWNpdHkodmFsdWUsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9ianMoKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLm9ianMpLmZvckVhY2goKG9iak5hbWUsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoaW5kZXggPT09IDApIHRoaXMub2Jqc1tvYmpOYW1lXS5zZXRPcGFjaXR5KHZhbHVlLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgICBlbHNlIHRoaXMub2Jqc1tvYmpOYW1lXS5zZXRPcGFjaXR5KHZhbHVlLCBvcHRpb25zKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIiwiY29uc3QgQ2FsbGJhY2tTdG9yZSA9IEZhbW91c1BsYXRmb3JtLnV0aWxpdGllcy5DYWxsYmFja1N0b3JlO1xuXG5jbGFzcyBFdmVudEVtaXR0ZXJTaW5nbGV0b24ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9ldmVudHMgPSBuZXcgQ2FsbGJhY2tTdG9yZSgpO1xuICB9XG4gIG9uKGV2TmFtZSwgY2FsbGJhY2spIHtcbiAgICB0aGlzLl9ldmVudHMub24oZXZOYW1lLCBjYWxsYmFjayk7XG4gIH1cbiAgb2ZmKGV2TmFtZSwgY2FsbGJhY2spIHtcbiAgICB0aGlzLl9ldmVudHMub24oZXZOYW1lLCBjYWxsYmFjayk7XG4gIH1cbiAgdHJpZ2dlcihldk5hbWUsIHBheWxvYWQpIHtcbiAgICB0aGlzLl9ldmVudHMudHJpZ2dlcihldk5hbWUsIHBheWxvYWQpO1xuICB9XG59XG5cbmxldCBFdmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyU2luZ2xldG9uKCk7XG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50RW1pdHRlcjtcbiIsImNvbnN0IENvcmVGYW1vdXNFbmdpbmUgPSBGYW1vdXNQbGF0Zm9ybS5jb3JlLkZhbW91c0VuZ2luZTtcblxucmVxdWlyZSgnLi9yZXNldC5taW4uY3NzJyk7XG5cbmNsYXNzIEZhbW91c0VuZ2luZUluaXQge1xuICAvKipcbiAgICogQm9pbGVycGxhdGUgY29kZSB0byBzZXR1cCB0aGUgRmFtb3VzIEVuZ2luZS5cbiAgICogQG1ldGhvZCAgY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2N1cnJlbnRTZWxlY3RvciA9IG51bGw7XG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9yb290Tm9kZSA9IHt9O1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHJldHVybiB0aGlzO1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIC8vIEJvaWxlcnBsYXRlXG4gICAgQ29yZUZhbW91c0VuZ2luZS5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcm9vdCB7QGxpbmsgU2NlbmV9IGZvciBhIGdpdmVuIHNlbGVjdG9yIGFuZCBhZGRzIGEgcm9vdCBOb2RlIHRvIHRoYXQge0BsaW5rIFNjZW5lfS5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogICAgIEZhbW91c0VuZ2luZVxuICAgKiAgICAgICAuaW5pdCgpXG4gICAqICAgICAgIC5jcmVhdGVTY2VuZSgnI2FwcCcpXG4gICAqICAgICAgIC5jcmVhdGVDYW1lcmEoKTtcbiAgICogICAgIHdpbmRvdy5hcHAgPSBuZXcgVmlldyhGYW1vdXNFbmdpbmUuZ2V0Um9vdE5vZGUoKSk7XG4gICAqXG4gICAqIEBtZXRob2QgIGNyZWF0ZVNjZW5lXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgICAgICBzZWxlY3RvciAgVGhlIHF1ZXJ5IHNlbGVjdG9yIHVzZWQgdG8gaW5zdGFudGlhdGUgdGhlIHtAbGluayBTY2VuZX0uIElmIG5vIHNlbGVjdG9yIGlzIHBhc3NlZCB0aGVuIGBib2R5YCBpcyB1c2VkLlxuICAgKiBAcmV0dXJuICB7RmFtb3VzRW5naW5lfSAgU2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBGYW1vdXNFbmdpbmUuXG4gICAqL1xuICBjcmVhdGVTY2VuZShzZWxlY3Rvcikge1xuICAgIHRoaXMuX2N1cnJlbnRTZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIENvcmVGYW1vdXNFbmdpbmUuY3JlYXRlU2NlbmUoc2VsZWN0b3IpO1xuICAgIHRoaXMuYWRkUm9vdE5vZGUoc2VsZWN0b3IpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY3JlYXRlQ29udGV4dChzZWxlY3Rvcikge1xuICAgIGNvbnNvbGUud2FybignRmFtb3VzRW5naW5lLmNyZWF0ZUNvbnRleHQoKSBpcyBkZXByZWNhdGVkLiBVc2UgRmFtb3VzRW5naW5lLmNyZWF0ZVNjZW5lKCkgaW5zdGVhZC4nKTtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVTY2VuZShzZWxlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIFNjZW5lIGZvciBhIGdpdmVuIHNlbGVjdG9yLlxuICAgKiBAbWV0aG9kICBnZXRTY2VuZVxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgICBbc2VsZWN0b3JdICAgVGhlIHF1ZXJ5IHNlbGVjdG9yLiBEZWZhdWx0cyB0byB0aGUgc2VsZWN0b3IgdXNlZCB3aXRoIGNyZWF0ZVNjZW5lKCkuXG4gICAqIEByZXR1cm4gIHtTY2VuZX0gICBUaGUgRmFtb3VzIHtAbGluayBTY2VuZX0gYXNzb2NpYXRlZCB3aXRoIHRoZSBzZWxlY3Rvci5cbiAgICovXG4gIGdldFNjZW5lKHNlbGVjdG9yKSB7XG4gICAgaWYgKCFzZWxlY3Rvcikgc2VsZWN0b3IgPSB0aGlzLl9jdXJyZW50U2VsZWN0b3I7XG4gICAgaWYgKCFDb3JlRmFtb3VzRW5naW5lLmdldENvbnRleHQoc2VsZWN0b3IpKSB0aGlzLmNyZWF0ZVNjZW5lKHNlbGVjdG9yKTtcbiAgICByZXR1cm4gQ29yZUZhbW91c0VuZ2luZS5nZXRDb250ZXh0KHNlbGVjdG9yKTtcbiAgfVxuXG4gIGdldENvbnRleHQoc2VsZWN0b3IpIHtcbiAgICBjb25zb2xlLndhcm4oJ0ZhbW91c0VuZ2luZS5nZXRDb250ZXh0KCkgaXMgZGVwcmVjYXRlZC4gVXNlIEZhbW91c0VuZ2luZS5nZXRTY2VuZSgpIGluc3RlYWQuJyk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NlbmUoc2VsZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBzaW5nbGUgcm9vdCB7QGxpbmsgTm9kZX0gdGhlIEZhbW91cyBDb250ZXh0IGZvciBhIGdpdmVuIHNlbGVjdG9yLlxuICAgKiBAbWV0aG9kICBhZGRSb290Tm9kZVxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgICAgW3NlbGVjdG9yXSAgIFRoZSBxdWVyeSBzZWxlY3Rvci4gRGVmYXVsdHMgdG8gdGhlIHNlbGVjdG9yIHVzZWQgd2l0aCBjcmVhdGVTY2VuZSgpLlxuICAgKiBAcmV0dXJuICB7Q29udGV4dH0gICAgVGhlIEZhbW91cyBDb250ZXh0IGFzc29jaWF0ZWQgd2l0aCB0aGUgc2VsZWN0b3IuXG4gICAqL1xuICBhZGRSb290Tm9kZShzZWxlY3Rvcikge1xuICAgIGlmICghc2VsZWN0b3IpIHNlbGVjdG9yID0gdGhpcy5fY3VycmVudFNlbGVjdG9yO1xuICAgIGlmICghdGhpcy5fcm9vdE5vZGVbc2VsZWN0b3JdKSB0aGlzLl9yb290Tm9kZVtzZWxlY3Rvcl0gPSB0aGlzLmdldFNjZW5lKHNlbGVjdG9yKS5hZGRDaGlsZCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSByb290IHtAbGluayBOb2RlfSBmb3IgYSBnaXZlbiBzZWxlY3Rvci5cbiAgICogQG1ldGhvZCAgZ2V0Um9vdE5vZGVcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgIFtzZWxlY3Rvcl0gIFRoZSBxdWVyeSBzZWxlY3Rvci4gRGVmYXVsdHMgdG8gdGhlIHNlbGVjdG9yIHVzZWQgd2l0aCBjcmVhdGVTY2VuZSgpLlxuICAgKiBAcmV0dXJuICB7Tm9kZX0gICAgICAgVGhlIHJvb3Qge0BsaW5rIE5vZGV9IGZvciBhIGdpdmVuIHNlbGVjdG9yLlxuICAgKi9cbiAgZ2V0Um9vdE5vZGUoc2VsZWN0b3IpIHtcbiAgICBpZiAoIXNlbGVjdG9yKSBzZWxlY3RvciA9IHRoaXMuX2N1cnJlbnRTZWxlY3RvcjtcbiAgICBpZiAoIXRoaXMuX3Jvb3ROb2RlW3NlbGVjdG9yXSkgdGhpcy5hZGRSb290Tm9kZShzZWxlY3Rvcik7XG4gICAgcmV0dXJuIHRoaXMuX3Jvb3ROb2RlW3NlbGVjdG9yXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBjaGlsZCB0byB0aGUgcm9vdCB7QGxpbmsgTm9kZX0uXG4gICAqIEBtZXRob2QgIGFkZENoaWxkXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICBbc2VsZWN0b3JdICBUaGUgcXVlcnkgc2VsZWN0b3IuIERlZmF1bHRzIHRvIHRoZSBzZWxlY3RvciB1c2VkIHdpdGggY3JlYXRlU2NlbmUoKS5cbiAgICogQHJldHVybiAge05vZGV9ICAgIFRoZSBuZXcgY2hpbGQge0BsaW5rIE5vZGV9IHRoYXQgd2FzIGNyZWF0ZWQuXG4gICAqL1xuICBhZGRDaGlsZChzZWxlY3Rvcikge1xuICAgIGlmICghc2VsZWN0b3IpIHNlbGVjdG9yID0gdGhpcy5fY3VycmVudFNlbGVjdG9yO1xuICAgIHJldHVybiB0aGlzLmdldFJvb3ROb2RlKHNlbGVjdG9yKS5hZGRDaGlsZCgpO1xuICB9XG59XG5cbmxldCBGYW1vdXNFbmdpbmUgPSBuZXcgRmFtb3VzRW5naW5lSW5pdCgpO1xuXG5leHBvcnQgZGVmYXVsdCBGYW1vdXNFbmdpbmU7XG4iLCJ2YXIgY3NzID0gXCIvKiogRXJpYyBNZXllcidzIFJlc2V0IENTUyB2Mi4wIChodHRwOi8vbWV5ZXJ3ZWIuY29tL2VyaWMvdG9vbHMvY3NzL3Jlc2V0LykgKiBodHRwOi8vY3NzcmVzZXQuY29tICovaHRtbHtib3gtc2l6aW5nOmJvcmRlci1ib3g7fSosKjpiZWZvcmUsKjphZnRlcntib3gtc2l6aW5nOmluaGVyaXQ7fWEsYWJicixhY3JvbnltLGFkZHJlc3MsYXBwbGV0LGFydGljbGUsYXNpZGUsYXVkaW8sYixiaWcsYmxvY2txdW90ZSxib2R5LGNhbnZhcyxjYXB0aW9uLGNlbnRlcixjaXRlLGNvZGUsZGQsZGVsLGRldGFpbHMsZGZuLGRpdixkbCxkdCxlbSxlbWJlZCxmaWVsZHNldCxmaWdjYXB0aW9uLGZpZ3VyZSxmb290ZXIsZm9ybSxoMSxoMixoMyxoNCxoNSxoNixoZWFkZXIsaGdyb3VwLGh0bWwsaSxpZnJhbWUsaW1nLGlucyxrYmQsbGFiZWwsbGVnZW5kLGxpLG1hcmssbWVudSxuYXYsb2JqZWN0LG9sLG91dHB1dCxwLHByZSxxLHJ1YnkscyxzYW1wLHNlY3Rpb24sc21hbGwsc3BhbixzdHJpa2Usc3Ryb25nLHN1YixzdW1tYXJ5LHN1cCx0YWJsZSx0Ym9keSx0ZCx0Zm9vdCx0aCx0aGVhZCx0aW1lLHRyLHR0LHUsdWwsdmFyLHZpZGVve2JvcmRlcjowO2ZvbnQ6aW5oZXJpdDttYXJnaW46MDtwYWRkaW5nOjA7dmVydGljYWwtYWxpZ246YmFzZWxpbmV9YXJ0aWNsZSxhc2lkZSxkZXRhaWxzLGZpZ2NhcHRpb24sZmlndXJlLGZvb3RlcixoZWFkZXIsaGdyb3VwLG1lbnUsbmF2LHNlY3Rpb257ZGlzcGxheTpibG9ja31odG1sLGJvZHl7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTt9Ym9keXtsaW5lLWhlaWdodDoxfW9sLHVse2xpc3Qtc3R5bGU6bm9uZX1ibG9ja3F1b3RlLHF7cXVvdGVzOm5vbmV9YmxvY2txdW90ZTphZnRlcixibG9ja3F1b3RlOmJlZm9yZSxxOmFmdGVyLHE6YmVmb3Jle2NvbnRlbnQ6Jyc7Y29udGVudDpub25lfXRhYmxle2JvcmRlci1jb2xsYXBzZTpjb2xsYXBzZTtib3JkZXItc3BhY2luZzowfVxcblwiOyAocmVxdWlyZShcIi4vLi4vLi4vY3NzaWZ5XCIpKShjc3MpOyBtb2R1bGUuZXhwb3J0cyA9IGNzczsiLCJpbXBvcnQgVmlldyAgICAgICAgICAgICBmcm9tICdmYW1vdXMtY3JlYXRpdmUvZGlzcGxheS9WaWV3JztcbmltcG9ydCBJbWFnZSAgICAgICAgICAgIGZyb20gJy4vSW1hZ2VTZXJ2aWNlJztcblxuZXhwb3J0IGNsYXNzIENhciBleHRlbmRzIFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKG5vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIobm9kZSk7XG5cbiAgICAgICAgdGhpcy5tb2RlbCA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy5zZXRBbGlnbiguNSwgMSkuc2V0TW91bnRQb2ludCguNSwgMSkuc2V0T3JpZ2luKC41LCAuNSk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25aKDEpO1xuXG4gICAgICAgIHRoaXMuc2V0U2l6ZU1vZGUoMCwgMSkuc2V0UHJvcG9ydGlvbmFsU2l6ZSgxLCBudWxsKS5zZXRBYnNvbHV0ZVNpemUobnVsbCwgMjgwKTtcbiAgICAgICAgLy90aGlzLnNldFNjYWxlKDEuMiwgMS4yKTtcblxuICAgICAgICB0aGlzLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgdGFnTmFtZTogJ2ltZycsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgJ3NyYyc6IGBhc3NldHMvaW1hZ2VzL2Nhci8ke3RoaXMubW9kZWwuY3VycmVudEltYWdlfS5qcGdgXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xhc3NlczogWydjYXItaW1hZ2UnXSxcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAnYmFja2ZhY2UtdmlzaWJpbGl0eSc6ICdoaWRkZW4nXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkdmFuY2VJbWFnZSgpIHtcbiAgICAgICAgaWYoSW1hZ2UuZ2V0Q3VycmVudCgpID4gSW1hZ2UuZ2V0TWF4KCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RE9NQXR0cmlidXRlcyh7XG4gICAgICAgICAgICAgICAgJ3NyYyc6IGBhc3NldHMvaW1hZ2VzL2Nhci8ke0ltYWdlLmdldE5leHQoKX0uanBnYFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVJbWFnZShpbWcpIHtcbiAgICAgICAgdGhpcy5zZXRET01BdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICdzcmMnOiBgYXNzZXRzL2ltYWdlcy9jYXIvJHtpbWd9YFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgVmlldyAgICAgICAgICAgICBmcm9tICdmYW1vdXMtY3JlYXRpdmUvZGlzcGxheS9WaWV3JztcbmltcG9ydCB7Q2FyfSAgICAgICAgICAgIGZyb20gJy4vQ2FyJztcbmltcG9ydCB7VGl0bGV9ICAgICAgICAgIGZyb20gJy4vVGl0bGUnO1xuXG5leHBvcnQgY2xhc3MgRmxpcENhcmQgZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5vZGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMubW9kZWwgPSBvcHRpb25zO1xuXG4gICAgICAgIHRoaXMuc2V0QWxpZ24oMCwgLjUpLnNldE1vdW50UG9pbnQoMCwgMCkuc2V0T3JpZ2luKDAsIDApO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWih0aGlzLm1vZGVsLnpQb3MpO1xuXG4gICAgICAgIC8vdGhpcy5zZXRTaXplTW9kZVJlbGF0aXZlKCkuc2V0UHJvcG9ydGlvbmFsU2l6ZSgxLCAuNSk7XG4gICAgICAgIHRoaXMuc2V0U2l6ZU1vZGVBYnNvbHV0ZSgpLnNldEFic29sdXRlU2l6ZSg0MjAsIDM4NCk7XG5cbiAgICAgICAgdGhpcy5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIGNsYXNzZXM6IFtgY2FyZC0ke3RoaXMubW9kZWwuYWxwaGFJZH1gXSxcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6IHRoaXMubW9kZWwuelBvcyxcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICd3aGl0ZSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJDYXIoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJUaXRsZSgpO1xuICAgIH1cblxuICAgIGdldCBvcmRlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZWwub3JkZXI7XG4gICAgfVxuXG4gICAgc2V0IG9yZGVyKGkpIHtcbiAgICAgICAgdGhpcy5tb2RlbC5vcmRlciA9IGk7XG4gICAgfVxuXG4gICAgcmVuZGVyQ2FyKCkge1xuICAgICAgICB0aGlzLmNhciA9ICBuZXcgQ2FyKHRoaXMuYWRkQ2hpbGQoKSwge1xuICAgICAgICAgICAgYWxwaGFJZDogdGhpcy5tb2RlbC5hbHBoYUlkLFxuICAgICAgICAgICAgY3VycmVudEltYWdlOiB0aGlzLm1vZGVsLmltYWdlXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlclRpdGxlKCkge1xuICAgICAgICB0aGlzLnRpdGxlID0gbmV3IFRpdGxlKHRoaXMuYWRkQ2hpbGQoKSwge1xuICAgICAgICAgICAgYWxwaGFJZDogdGhpcy5tb2RlbC5hbHBoYUlkLFxuICAgICAgICAgICAgdGV4dDogdGhpcy5tb2RlbC5sZXR0ZXJcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWR2YW5jZSgpIHtcbiAgICAgICAgbGV0IHpQb3M7XG5cbiAgICAgICAgc3dpdGNoKHRoaXMub3JkZXIpIHtcbiAgICAgICAgICAgIGNhc2UgMTogLy8gV2FzIGF0IHRvcCwgYWR2YW5jZSB0byBuZXh0XG4gICAgICAgICAgICAgICAgelBvcyA9IDk5O1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0Um90YXRpb25YKDApO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FyLmFkdmFuY2VJbWFnZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMudGl0bGUudXBkYXRlUGhyYXNlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcmRlciA9IDM7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6IC8vIFdhcyBhdCBib3R0b20sIGFkdmFuY2UgdG8gdG9wXG4gICAgICAgICAgICAgICAgelBvcyA9IDk5O1xuICAgICAgICAgICAgICAgIHRoaXMub3JkZXIgPSAxO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOi8vIFdhcyBhdCBuZXh0LCBhZHZhbmNlIHRvIGJvdHRvbVxuICAgICAgICAgICAgICAgIHpQb3MgPSAxMDE7XG4gICAgICAgICAgICAgICAgdGhpcy5vcmRlciA9IDI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1vZGVsLnpQb3MgPSB6UG9zO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWih6UG9zKTtcbiAgICAgICAgdGhpcy5zZXRET01Qcm9wZXJ0aWVzKHtcbiAgICAgICAgICAgICd6LWluZGV4JzogelBvc1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJ2YXIgSW1hZ2UgPSB7XG4gICAgX2N1cnJlbnRJbWFnZTogMzUsLy8wLFxuICAgIF9tYXhDb3VudDogMC8vMzVcbn07XG5cbkltYWdlLmdldEN1cnJlbnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEltYWdlO1xufTtcblxuSW1hZ2UuZ2V0TWF4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX21heENvdW50O1xufTtcblxuSW1hZ2UuZ2V0TmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2N1cnJlbnRJbWFnZS0tO1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50SW1hZ2U7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBJbWFnZTtcbiIsImltcG9ydCBWaWV3ICAgICAgICAgICAgIGZyb20gJ2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L1ZpZXcnO1xuXG4vL0dMIENvbXBvbmVudHNcbmNvbnN0IENvbG9yICAgICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0udXRpbGl0aWVzLkNvbG9yO1xuY29uc3QgR2VvbWV0cnkgICAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS53ZWJnbEdlb21ldHJpZXMuR2VvbWV0cnk7XG5jb25zdCBHZW9tZXRyeUhlbHBlciAgICA9IEZhbW91c1BsYXRmb3JtLndlYmdsR2VvbWV0cmllcy5HZW9tZXRyeUhlbHBlcjtcbmNvbnN0IE9CSkxvYWRlciAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xHZW9tZXRyaWVzLk9CSkxvYWRlcjtcbmNvbnN0IE1hdGVyaWFsICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xNYXRlcmlhbHMuTWF0ZXJpYWw7XG5jb25zdCBUZXh0dXJlUmVnaXN0cnkgICA9IEZhbW91c1BsYXRmb3JtLndlYmdsTWF0ZXJpYWxzLlRleHR1cmVSZWdpc3RyeTtcblxuZXhwb3J0IGNsYXNzIExvZ28gZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5vZGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuc2V0QWxpZ24oMC41LCAwLCAwLjUpLnNldE1vdW50UG9pbnQoMC41LCAwLCAwLjUpLnNldE9yaWdpbigwLjUsIDAuNSwgMC41KTtcbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZUFic29sdXRlKCkuc2V0QWJzb2x1dGVTaXplKDE1MCwgMTUwLCAxNTApO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWigyMDApO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWSgxMjUpO1xuICAgICAgICB0aGlzLnNldFJvdGF0aW9uWChNYXRoLlBJICogLTEwIC8gMTgwKTtcblxuICAgICAgICB0aGlzLnBhcmVudCA9IG5ldyBWaWV3KHRoaXMuYWRkQ2hpbGQoKSk7XG4gICAgICAgIHRoaXMucXVhZHMgID0gbmV3IFZpZXcodGhpcy5wYXJlbnQuYWRkQ2hpbGQoKSk7XG4gICAgICAgIHRoaXMucXVhZHMuc2V0T3JpZ2luKDAuNSwgMC41LCAwLjUpO1xuICAgICAgICB0aGlzLnF1YWRzLnNldFBvc2l0aW9uWigxMDApO1xuXG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcyA9IHt9O1xuXG4gICAgICAgIGNvbnN0IG5hbWVzID0gWydCJywgJ00nLCAnVycsICdvdXRlclJpbmcnLCAnaW5uZXJSaW5nJywgJ2Nyb3NzJywgJ291dHNpZGVDeWwnLCAnaW5zaWRlQ3lsJ107XG4gICAgICAgIGNvbnN0IHF1YWRzID0gWydmaXJzdCcsICdzZWNvbmQnLCAndGhpcmQnLCAnZm91cnRoJ107XG5cbiAgICAgICAgbmFtZXMuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZW9tZXRyaWVzW25hbWVdID0gdGhpcy5vYmpGYWN0b3J5KHRoaXMucGFyZW50LmFkZENoaWxkKCksIG5hbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBxdWFkcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdlb21ldHJpZXNbbmFtZV0gPSB0aGlzLm9iakZhY3RvcnkodGhpcy5xdWFkcy5hZGRDaGlsZCgpLCBuYW1lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY29sb3IgPSB7XG4gICAgICAgICAgICBibHVlOiAnIzU0QTlENCcsXG4gICAgICAgICAgICB3aGl0ZTogJyNGNUY1RjUnLFxuICAgICAgICAgICAgZGFya2VzdEdyZXk6ICcjMjIyMjIyJyxcbiAgICAgICAgICAgIGRhcmtlckdyZXk6ICcjNDQ0NDQ0JyxcbiAgICAgICAgICAgIGRhcmtHcmV5OiAnIzU1NTU1NScsXG4gICAgICAgICAgICBncmF5OiAnI0FBQUFBQScsXG4gICAgICAgICAgICBnbG9zc3k6ICcjYmJiYmRkJ1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5CLnNldEJhc2VDb2xvcihuZXcgQ29sb3IoY29sb3Iud2hpdGUpKTtcbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzLk0uc2V0QmFzZUNvbG9yKG5ldyBDb2xvcihjb2xvci53aGl0ZSkpO1xuICAgICAgICB0aGlzLmdlb21ldHJpZXMuVy5zZXRCYXNlQ29sb3IobmV3IENvbG9yKGNvbG9yLndoaXRlKSk7XG4gICAgICAgIC8qdGhpcy5nZW9tZXRyaWVzLkIubWVzaC5zZXRHbG9zc2luZXNzKGdsb3NzeUNvbG9yLCA2MCk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5NLm1lc2guc2V0R2xvc3NpbmVzcyhnbG9zc3lDb2xvciwgNjApO1xuICAgICAgICB0aGlzLmdlb21ldHJpZXMuVy5tZXNoLnNldEdsb3NzaW5lc3MoZ2xvc3N5Q29sb3IsIDYwKTsqL1xuXG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5maXJzdC5zZXRCYXNlQ29sb3IobmV3IENvbG9yKGNvbG9yLndoaXRlKSk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5zZWNvbmQuc2V0QmFzZUNvbG9yKG5ldyBDb2xvcihjb2xvci5ibHVlKSk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy50aGlyZC5zZXRCYXNlQ29sb3IobmV3IENvbG9yKGNvbG9yLndoaXRlKSk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5mb3VydGguc2V0QmFzZUNvbG9yKG5ldyBDb2xvcihjb2xvci5ibHVlKSk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5pbnNpZGVDeWwuc2V0QmFzZUNvbG9yKG5ldyBDb2xvcihjb2xvci5kYXJrZXN0R3JleSkpO1xuXG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5vdXRzaWRlQ3lsLnNldEJhc2VDb2xvcihuZXcgQ29sb3IoY29sb3IuZGFya2VyR3JleSkpO1xuICAgICAgICB0aGlzLmdlb21ldHJpZXMuaW5uZXJSaW5nLnNldEJhc2VDb2xvcihuZXcgQ29sb3IoY29sb3IuZ3JheSkpO1xuICAgICAgICB0aGlzLmdlb21ldHJpZXMub3V0ZXJSaW5nLnNldEJhc2VDb2xvcihuZXcgQ29sb3IoY29sb3IuZ3JheSkpO1xuICAgICAgICAvKnRoaXMuZ2VvbWV0cmllcy5vdXRzaWRlQ3lsLm1lc2guc2V0R2xvc3NpbmVzcyhnbG9zc3lDb2xvciwgMTAwKTtcbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzLmlubmVyUmluZy5tZXNoLnNldEdsb3NzaW5lc3MoZ2xvc3N5Q29sb3IsIDEwMCk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5vdXRlclJpbmcubWVzaC5zZXRHbG9zc2luZXNzKGdsb3NzeUNvbG9yLCAxMDApOyovXG4gICAgfVxuXG4gICAgb2JqRmFjdG9yeShub2RlLCBuYW1lKSB7XG4gICAgICAgIGxldCBnZW8gPSBuZXcgVmlldyhub2RlKTtcbiAgICAgICAgZ2VvLnNldEFsaWduKDAuNSwgMCwgMC41KS5zZXRNb3VudFBvaW50KDAuNSwgMCwgMC41KS5zZXRPcmlnaW4oMC41LCAwLjUsIDAuNSk7XG4gICAgICAgIGdlby5zZXRTaXplTW9kZUFic29sdXRlKCkuc2V0QWJzb2x1dGVTaXplKDE1MCwgMTUwLCAxNTApO1xuICAgICAgICBnZW8uc2V0T3BhY2l0eSgwKTtcblxuICAgICAgICBPQkpMb2FkZXIubG9hZCgnYXNzZXRzL29iai8nICsgbmFtZSArICcub2JqJywgKGJ1ZmZlcnMpID0+IHtcbiAgICAgICAgICAgIHZhciBteUdlbyA9IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgICAgICAgICAgYnVmZmVyczogW1xuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdhX3BvcycsICAgICBkYXRhOiBidWZmZXJzLnZlcnRpY2VzLCBzaXplOiAzIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2Ffbm9ybWFscycsIGRhdGE6IGJ1ZmZlcnMubm9ybWFscywgIHNpemU6IDMgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnaW5kaWNlcycsICAgZGF0YTogYnVmZmVycy5pbmRpY2VzLCAgc2l6ZTogMSB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBnZW8uc2V0R2VvbWV0cnkobXlHZW8pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZ2VvO1xuICAgIH1cbn1cbiIsInZhciBQaHJhc2UgPSB7XG4gICAgX3BocmFzZTogJ0hlbGxvIEZ1dHVyZScsXG4gICAgX2N1cnJlbnRJbmRleDogMCxcbiAgICBfY3VycmVudFBocmFzZTogJydcbn07XG5cblBocmFzZS5fbGV0dGVycyA9IFBocmFzZS5fcGhyYXNlLnNwbGl0KCcnKTtcblxuUGhyYXNlLl9nZXROZXh0TGV0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5fbGV0dGVyc1t0aGlzLl9jdXJyZW50SW5kZXhdKSB7XG4gICAgICAgIGxldCBjdXJyZW50TGV0dGVyID0gdGhpcy5fbGV0dGVyc1t0aGlzLl9jdXJyZW50SW5kZXhdO1xuICAgICAgICB0aGlzLl9jdXJyZW50SW5kZXgrKztcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRMZXR0ZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG5cblBocmFzZS5nZXRDdXJyZW50SW5kZXggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEluZGV4O1xufTtcblxuUGhyYXNlLmdldEN1cnJlbnRQaHJhc2UgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGV0dGVyID0gdGhpcy5fZ2V0TmV4dExldHRlcigpO1xuICAgIGlmKGxldHRlcikge1xuICAgICAgICBpZihsZXR0ZXIgPT09ICcgJykge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFBocmFzZSArPSAnPGJyPic7XG4gICAgICAgICAgICBsZXR0ZXIgPSB0aGlzLl9nZXROZXh0TGV0dGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jdXJyZW50UGhyYXNlICs9IGxldHRlcjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY3VycmVudFBocmFzZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBocmFzZTtcbiIsImltcG9ydCBWaWV3ICAgICAgICAgICAgIGZyb20gJ2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L1ZpZXcnO1xuaW1wb3J0IFBocmFzZSAgICAgICAgICAgZnJvbSAnLi9QaHJhc2VTZXJ2aWNlJztcblxuZXhwb3J0IGNsYXNzIFRpdGxlIGV4dGVuZHMgVmlldyB7XG4gICAgY29uc3RydWN0b3Iobm9kZSwgb3B0aW9ucykge1xuICAgICAgICBzdXBlcihub2RlKTtcblxuICAgICAgICB0aGlzLm1vZGVsID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLnNldEFsaWduKC41LCAuNSkuc2V0TW91bnRQb2ludCguNSwgLjUpLnNldE9yaWdpbiguNSwgLjUpO1xuXG4gICAgICAgIHRoaXMuc2V0U2l6ZU1vZGVSZWxhdGl2ZSgpLnNldFByb3BvcnRpb25hbFNpemUoMSwgMSk7XG5cbiAgICAgICAgLy8gRmxpcCB0aGUgY2FyZCBiYWNrd2FyZHMgdG8gYmUgcmVhZHkgZm9yIHRoZSByb3RhdGlvbiB1cCB0byB0aGUgdG9wIHBvc2l0aW9uXG4gICAgICAgIHRoaXMuc2V0Um90YXRpb25YKCgxODAgKiBNYXRoLlBJKSAvIDE4MCk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25aKC0xKTtcblxuICAgICAgICB0aGlzLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgdGFnTmFtZTogJ2gxJyxcbiAgICAgICAgICAgIGNsYXNzZXM6IFsndGl0bGUtdGV4dCddLFxuICAgICAgICAgICAgY29udGVudDogdGhpcy5tb2RlbC50ZXh0LFxuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICctd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHknOiAnaGlkZGVuJyxcbiAgICAgICAgICAgICAgICAnYmFja2ZhY2UtdmlzaWJpbGl0eSc6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICdib3gtc2l6aW5nJzogJ2JvcmRlci1ib3gnLFxuICAgICAgICAgICAgICAgICdmb250LXNpemUnOiAnNzBweCcsXG4gICAgICAgICAgICAgICAgJ2ZvbnQtd2VpZ2h0JzogJzMwMCcsXG4gICAgICAgICAgICAgICAgJ21hcmdpbic6ICcwJyxcbiAgICAgICAgICAgICAgICAncGFkZGluZy10b3AnOiAnMTAwcHgnLFxuICAgICAgICAgICAgICAgICd0ZXh0LWFsaWduJzogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgJ3RleHQtdHJhbnNmb3JtJzogJ3VwcGVyY2FzZSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlUGhyYXNlKCkge1xuICAgICAgICBpZihQaHJhc2UuZ2V0Q3VycmVudEluZGV4KCkgPT09IDEyKSB7XG4gICAgICAgICAgICB0aGlzLnNldE9wYWNpdHkoMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldERPTUNvbnRlbnQoUGhyYXNlLmdldEN1cnJlbnRQaHJhc2UoKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgVGltZWxpbmUgICAgICAgICBmcm9tICdmYW1vdXMtY3JlYXRpdmUvYW5pbWF0aW9uL1RpbWVsaW5lJztcbmltcG9ydCBWaWV3ICAgICAgICAgICAgIGZyb20gJ2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L1ZpZXcnO1xuXG5pbXBvcnQgRmFtb3VzRW5naW5lICAgICBmcm9tICdmYW1vdXMtY3JlYXRpdmUvc2NhZmZvbGRpbmcvRmFtb3VzRW5naW5lJztcblxuaW1wb3J0IHtGbGlwQ2FyZH0gICAgICAgZnJvbSAnLi9GbGlwQ2FyZCc7XG5pbXBvcnQge0xvZ299ICAgICAgICAgICBmcm9tICcuL0xvZ28nO1xuaW1wb3J0IEltYWdlICAgICAgICAgICAgZnJvbSAnLi9JbWFnZVNlcnZpY2UnO1xuaW1wb3J0IFBocmFzZSAgICAgICAgICAgZnJvbSAnLi9QaHJhc2VTZXJ2aWNlJztcblxuLy9GYW1vdXMgQ29tcG9uZW50c1xuY29uc3QgQ3VydmVzICAgICAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS50cmFuc2l0aW9ucy5DdXJ2ZXM7XG5jb25zdCBGYW1vdXMgICAgICAgICAgICA9IEZhbW91c1BsYXRmb3JtLmNvcmUuRmFtb3VzO1xuXG4vL0dMIENvbXBvbmVudHNcbmNvbnN0IEFtYmllbnRMaWdodCAgICAgID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xSZW5kZXJhYmxlcy5BbWJpZW50TGlnaHQ7XG5jb25zdCBDb2xvciAgICAgICAgICAgICA9IEZhbW91c1BsYXRmb3JtLnV0aWxpdGllcy5Db2xvcjtcbmNvbnN0IFBvaW50TGlnaHQgICAgICAgID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xSZW5kZXJhYmxlcy5Qb2ludExpZ2h0O1xuXG5jbGFzcyBBcHAgZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlKSB7XG4gICAgICAgIHN1cGVyKG5vZGUpO1xuXG4gICAgICAgIGxldCBjYW1lcmEgPSBuZXcgRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5DYW1lcmEodGhpcy5ub2RlKTtcbiAgICAgICAgY2FtZXJhLnNldERlcHRoKDEwMDApO1xuXG4gICAgICAgIHRoaXMuc2V0QWxpZ24oLjUsIC41KS5zZXRNb3VudFBvaW50KC41LCAuNSk7XG4gICAgICAgIHRoaXMuc2V0U2l6ZU1vZGVBYnNvbHV0ZSgpLnNldEFic29sdXRlU2l6ZSg0MjAsIDc2OCk7XG5cbiAgICAgICAgdGhpcy5iYXNlWlBvcyA9IHtcbiAgICAgICAgICAgIHRvcDogOTksXG4gICAgICAgICAgICBib3R0b206IDEwMSxcbiAgICAgICAgICAgIG5leHQ6IDk5LFxuICAgICAgICAgICAgc2hhZG93OiAxMDBcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICdib3JkZXInOiAnMXB4IHNvbGlkICMwMDAwMDAnLFxuICAgICAgICAgICAgICAgIC8vJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jbG9jayA9IEZhbW91c1BsYXRmb3JtLmNvcmUuRmFtb3VzRW5naW5lLmdldENsb2NrKCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJGbGlwQ2FyZHMoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJTaGFkb3dzKCk7XG4gICAgICAgIHRoaXMucmVuZGVyQ2xvc2luZ1RleHQoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJTa3koKTtcbiAgICAgICAgdGhpcy5yZW5kZXJMb2dvKCk7XG5cbiAgICAgICAgdGhpcy5pbml0RmxpcEJvb2soKTtcbiAgICB9XG5cbiAgICByZW5kZXJGbGlwQ2FyZHMoKSB7XG4gICAgICAgIHRoaXMuZmxpcENhcmRzID0gW107XG4gICAgICAgIGxldCBjYXJkQ29uZmlncyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhbHBoYUlkOiAnQScsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDEsXG4gICAgICAgICAgICAgICAgelBvczogdGhpcy5iYXNlWlBvcy50b3AsXG4gICAgICAgICAgICAgICAgaW1hZ2U6IEltYWdlLmdldEN1cnJlbnQoKSxcbiAgICAgICAgICAgICAgICBsZXR0ZXI6IFBocmFzZS5nZXRDdXJyZW50UGhyYXNlKClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWxwaGFJZDogJ0InLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAyLFxuICAgICAgICAgICAgICAgIHpQb3M6IHRoaXMuYmFzZVpQb3MuYm90dG9tLFxuICAgICAgICAgICAgICAgIGltYWdlOiBJbWFnZS5nZXRDdXJyZW50KCksXG4gICAgICAgICAgICAgICAgbGV0dGVyOiBQaHJhc2UuZ2V0Q3VycmVudFBocmFzZSgpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFscGhhSWQ6ICdDJyxcbiAgICAgICAgICAgICAgICBvcmRlcjogMyxcbiAgICAgICAgICAgICAgICB6UG9zOiB0aGlzLmJhc2VaUG9zLm5leHQsXG4gICAgICAgICAgICAgICAgaW1hZ2U6IEltYWdlLmdldE5leHQoKSxcbiAgICAgICAgICAgICAgICBsZXR0ZXI6IFBocmFzZS5nZXRDdXJyZW50UGhyYXNlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuICAgICAgICBjYXJkQ29uZmlncy5mb3JFYWNoKChjb25maWcpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmxpcENhcmRzLnB1c2gobmV3IEZsaXBDYXJkKHRoaXMuYWRkQ2hpbGQoKSwgY29uZmlnKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZmxpcENhcmRzWzBdLnNldFJvdGF0aW9uWCgoMTgwICogTWF0aC5QSSkgLyAxODApO1xuICAgIH1cblxuICAgIHJlbmRlclNoYWRvd3MoKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7XG4gICAgICAgICAgICAnei1pbmRleCc6IHRoaXMuYmFzZVpQb3Muc2hhZG93LFxuICAgICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnIzAwMDAwMCcsXG4gICAgICAgICAgICAnYmFja2ZhY2UtdmlzaWJpbGl0eSc6ICd2aXNpYmxlJ1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vU0hBRE9XIFRPUFxuICAgICAgICB0aGlzLnNoYWRvd1RvcCA9IG5ldyBWaWV3KHRoaXMuYWRkQ2hpbGQoKSk7XG5cbiAgICAgICAgdGhpcy5zaGFkb3dUb3Auc2V0QWxpZ24oMCwgMCk7XG4gICAgICAgIHRoaXMuc2hhZG93VG9wLnNldE1vdW50UG9pbnQoMCwgMCk7XG4gICAgICAgIHRoaXMuc2hhZG93VG9wLnNldE9wYWNpdHkoMCk7XG5cbiAgICAgICAgdGhpcy5zaGFkb3dUb3Auc2V0U2l6ZU1vZGVSZWxhdGl2ZSgpO1xuICAgICAgICB0aGlzLnNoYWRvd1RvcC5zZXRQcm9wb3J0aW9uYWxTaXplKDEsIC41KTtcbiAgICAgICAgdGhpcy5zaGFkb3dUb3Auc2V0UG9zaXRpb25aKHRoaXMuYmFzZVpQb3Muc2hhZG93KTtcbiAgICAgICAgdGhpcy5zaGFkb3dUb3AuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzLFxuICAgICAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgICAgICBjbGFzc2VzOiBbJ3NoYWRvdy10b3AnXVxuICAgICAgICB9KTtcblxuICAgICAgICAvL1NIQURPVyBCT1RUT01cbiAgICAgICAgdGhpcy5zaGFkb3dCb3R0b20gPSBuZXcgVmlldyh0aGlzLmFkZENoaWxkKCkpO1xuXG4gICAgICAgIHRoaXMuc2hhZG93Qm90dG9tLnNldEFsaWduKDAsIC41KTtcbiAgICAgICAgdGhpcy5zaGFkb3dCb3R0b20uc2V0TW91bnRQb2ludCgwLCAwKTtcbiAgICAgICAgdGhpcy5zaGFkb3dCb3R0b20uc2V0T3BhY2l0eSguMzMpO1xuXG4gICAgICAgIC8vVE9ETyBwdXQgdGhpcyBiYWNrIG9uY2UgdGhlIHNpemUgaXNzdWUgaXMgcmVzb2x2ZWRcbiAgICAgICAgLy90aGlzLnNoYWRvd1RvcC5zZXRTaXplTW9kZVJlbGF0aXZlKCk7XG4gICAgICAgIC8vdGhpcy5zaGFkb3dUb3Auc2V0UHJvcG9ydGlvbmFsU2l6ZSgxLCAuNSk7XG4gICAgICAgIHRoaXMuc2hhZG93Qm90dG9tLnNldFNpemVNb2RlQWJzb2x1dGUoKTtcbiAgICAgICAgdGhpcy5zaGFkb3dCb3R0b20uc2V0QWJzb2x1dGVTaXplKDQyMCwgMzg0KTtcblxuICAgICAgICB0aGlzLnNoYWRvd0JvdHRvbS5zZXRQb3NpdGlvbloodGhpcy5iYXNlWlBvcy5zaGFkb3cpO1xuXG4gICAgICAgIHRoaXMuc2hhZG93Qm90dG9tLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgcHJvcGVydGllcyxcbiAgICAgICAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgICAgICAgY2xhc3NlczogWydzaGFkb3ctYm90dG9tJ11cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyQ2xvc2luZ1RleHQoKSB7XG4gICAgICAgIC8vQ0xPU0lORyBURVhUIDFcbiAgICAgICAgdGhpcy5jbG9zaW5nVGV4dDEgPSBuZXcgVmlldyh0aGlzLmFkZENoaWxkKCkpO1xuICAgICAgICB0aGlzLmNsb3NpbmdUZXh0MS5zZXRPcGFjaXR5KDApO1xuICAgICAgICB0aGlzLmNsb3NpbmdUZXh0MS5zZXRQb3NpdGlvblkoNTM1KTtcbiAgICAgICAgdGhpcy5jbG9zaW5nVGV4dDEuc2V0UG9zaXRpb25aKDIwMCk7XG5cbiAgICAgICAgdGhpcy5jbG9zaW5nVGV4dDEuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtYWxpZ24nOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAnZm9udC1zaXplJzogJzI2cHgnLFxuICAgICAgICAgICAgICAgICdsaW5lLWhlaWdodCc6ICcxJyxcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6ICcyMDAnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgICAgICBjb250ZW50OiAnU0VFIEhPVyBXRSBCUk9VR0hUPGJyPlRPTU1PUlJPVyBUTyBUT0RBWSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9DTE9TSU5HIFRFWFQgMlxuICAgICAgICB0aGlzLmNsb3NpbmdUZXh0MiA9IG5ldyBWaWV3KHRoaXMuYWRkQ2hpbGQoKSk7XG4gICAgICAgIHRoaXMuY2xvc2luZ1RleHQyLnNldE9wYWNpdHkoMCk7XG4gICAgICAgIHRoaXMuY2xvc2luZ1RleHQyLnNldFBvc2l0aW9uWSg2MDApO1xuICAgICAgICB0aGlzLmNsb3NpbmdUZXh0Mi5zZXRQb3NpdGlvblooMjAwKTtcblxuICAgICAgICB0aGlzLmNsb3NpbmdUZXh0Mi5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAndGV4dC1hbGlnbic6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICdmb250LXNpemUnOiAnMjZweCcsXG4gICAgICAgICAgICAgICAgJ2xpbmUtaGVpZ2h0JzogJzEnLFxuICAgICAgICAgICAgICAgICd6LWluZGV4JzogJzIwMCcsXG4gICAgICAgICAgICAgICAgJ2NvbG9yJzogJ3JnYigyNTUsMjU1LDI1NSknXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgICAgICBjb250ZW50OiAnSEVMTE8gRlVUVVJFPGJyPjxzdHJvbmc+VGhlIGFsbCBuZXcgZWxlY3RyaWMgQk1XIGkzPC9zdHJvbmc+J1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW5kZXJTa3koKSB7XG4gICAgICAgIHRoaXMuc2t5ID0gbmV3IFZpZXcodGhpcy5hZGRDaGlsZCgpKTtcbiAgICAgICAgdGhpcy5za3kuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAncmdiKDI1NSwgMjU1LCAyNTUpJyxcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6IC0yMDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjbGFzc2VzOiBbJ2JhY2tncm91bmQtc2t5J11cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5za3kuc2V0U2l6ZU1vZGVSZWxhdGl2ZSgpO1xuICAgICAgICB0aGlzLnNreS5zZXRQcm9wb3J0aW9uYWxTaXplKDEsIDEpO1xuICAgICAgICB0aGlzLnNreS5zZXRQb3NpdGlvblooLTIwMCk7XG4gICAgfVxuXG4gICAgcmVuZGVyTG9nbygpIHtcbiAgICAgICAgdGhpcy5sb2dvID0gbmV3IExvZ28odGhpcy5hZGRDaGlsZCgpKTtcblxuICAgICAgICB0aGlzLnBvaW50TGlnaHRBID0gbmV3IFZpZXcodGhpcy5ub2RlLmFkZENoaWxkKCkpO1xuICAgICAgICB0aGlzLnBvaW50TGlnaHRBLnBvaW50TGlnaHQgPSBuZXcgUG9pbnRMaWdodCh0aGlzLnBvaW50TGlnaHRBLmFkZENoaWxkKCkpO1xuICAgICAgICB0aGlzLnBvaW50TGlnaHRBLnBvaW50TGlnaHQuc2V0Q29sb3IobmV3IENvbG9yKCcjZWVlZWVlJykpO1xuICAgICAgICB0aGlzLnBvaW50TGlnaHRBLnNldFBvc2l0aW9uKDUwMCwgLTUwMCwgLTEwMCk7XG5cbiAgICAgICAgdGhpcy5wb2ludExpZ2h0QiA9IG5ldyBWaWV3KHRoaXMubm9kZS5hZGRDaGlsZCgpKTtcbiAgICAgICAgdGhpcy5wb2ludExpZ2h0Qi5wb2ludExpZ2h0ID0gbmV3IFBvaW50TGlnaHQodGhpcy5wb2ludExpZ2h0Qi5hZGRDaGlsZCgpKTtcbiAgICAgICAgdGhpcy5wb2ludExpZ2h0Qi5wb2ludExpZ2h0LnNldENvbG9yKG5ldyBDb2xvcignI0NDQ0NDQycpKTtcbiAgICAgICAgdGhpcy5wb2ludExpZ2h0Qi5zZXRQb3NpdGlvbigtMjAwLCAtMjAwLCA1MCk7XG5cbiAgICAgICAgdGhpcy5wb2ludExpZ2h0QyA9IG5ldyBWaWV3KHRoaXMubm9kZS5hZGRDaGlsZCgpKTtcbiAgICAgICAgdGhpcy5wb2ludExpZ2h0Qy5wb2ludExpZ2h0ID0gbmV3IFBvaW50TGlnaHQodGhpcy5wb2ludExpZ2h0Qy5hZGRDaGlsZCgpKTtcbiAgICAgICAgdGhpcy5wb2ludExpZ2h0Qy5wb2ludExpZ2h0LnNldENvbG9yKG5ldyBDb2xvcignI0NDQ0NDQycpKTtcbiAgICAgICAgdGhpcy5wb2ludExpZ2h0Qy5zZXRQb3NpdGlvbigyMDAsIDMwMCwgMTUwMCk7XG5cbiAgICAgICAgdGhpcy5hbWJpZW50TGlnaHQgPSBuZXcgVmlldyh0aGlzLm5vZGUuYWRkQ2hpbGQoKSk7XG4gICAgICAgIHRoaXMuYW1iaWVudExpZ2h0LmFtYmllbnRMaWdodCA9IG5ldyBBbWJpZW50TGlnaHQodGhpcy5hbWJpZW50TGlnaHQuYWRkQ2hpbGQoKSk7XG4gICAgICAgIHRoaXMuYW1iaWVudExpZ2h0LmFtYmllbnRMaWdodC5zZXRDb2xvcihuZXcgQ29sb3IoJyM1NTU1NTUnKSk7XG4gICAgfVxuXG4gICAgaW5pdEZsaXBCb29rKCkge1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gNzUwO1xuICAgICAgICB0aGlzLmNsb2NrLnNldFRpbWVvdXQodGhpcy5mbGlwQ2FyZC5iaW5kKHRoaXMpLCAyMDAwKTtcbiAgICAgICAgdGhpcy5mbGlwQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnRpbWVsaW5lSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBmbGlwQ2FyZCgpIHtcbiAgICAgICAgbGV0IHRvcENhcmQsIGJvdHRvbUNhcmQsIG5leHRDYXJkO1xuICAgICAgICBsZXQgZmxpcER1cmF0aW9uID0gdGhpcy5kdXJhdGlvbjtcbiAgICAgICAgdGhpcy5mbGlwQ291bnQrKztcblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hlcmUgZWFjaCBjYXJkIGJhc2VkIG9uIGl0cyBvcmRlciBwcm9wZXJ0eVxuICAgICAgICB0aGlzLmZsaXBDYXJkcy5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICAgICAgICAgIHN3aXRjaChjYXJkLm9yZGVyKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICB0b3BDYXJkID0gY2FyZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICBib3R0b21DYXJkID0gY2FyZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICBuZXh0Q2FyZCA9IGNhcmQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUaGlzIGlzIHRvIGdldCByaWQgb2YgdGhlIHBoYW50b20gaW1hZ2Ugc2VlbiBhdCBoaWdoIHNwZWVkcyBpbiB0aGUgZmxpcCBhbmltYXRpb25cbiAgICAgICAgaWYodGhpcy5kdXJhdGlvbiA8IDUwKSB7XG4gICAgICAgICAgICBmbGlwRHVyYXRpb24gPSAwO1xuICAgICAgICAgICAgdGhpcy5zaGFkb3dCb3R0b20uaGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5zaGFkb3dUb3AuaGlkZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRWFjaCBzaGFkb3cgaXMgb25seSBhY3RpdmUgZm9yIGhhbGYgdGhlIHRpbWUgb2YgdGhlIGNhcmQgZmxpcFxuICAgICAgICAgICAgbGV0IHNoYWRvd0R1cmF0aW9uID0gdGhpcy5kdXJhdGlvbiAvIDI7XG4gICAgICAgICAgICAvLyBGYWRlIG91dCBib3R0b20gc2hhZG93IGZvciB0aGUgZmlyc3QgaGFsZiBvZiB0aGUgZmxpcCBhbmltYXRpb25cbiAgICAgICAgICAgIHRoaXMuc2hhZG93Qm90dG9tLmhhbHRPcGFjaXR5KCk7XG4gICAgICAgICAgICB0aGlzLnNoYWRvd0JvdHRvbS5zZXRPcGFjaXR5KC4zMywgeyBkdXJhdGlvbjogMH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYWRvd0JvdHRvbS5zZXRPcGFjaXR5KDAsIHtcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IHNoYWRvd0R1cmF0aW9uXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBGYWRlIGluIHRvcCBzaGFkb3cgZm9yIHRoZSBzZWNvbmQgaGFsZiBvZiB0aGUgZmxpcCBhbmltYXRpb25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dUb3AuaGFsdE9wYWNpdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dUb3Auc2V0T3BhY2l0eSguMzMsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBzaGFkb3dEdXJhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIGJvdHRvbSBjYXJkIGdldHMgZmxpcHBlZCB0byB0aGUgdG9wXG4gICAgICAgIGJvdHRvbUNhcmQuc2V0Um90YXRpb25YKCgxODAgKiBNYXRoLlBJKSAvIDE4MCwge1xuICAgICAgICAgICAgZHVyYXRpb246IGZsaXBEdXJhdGlvblxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICBpZih0aGlzLmR1cmF0aW9uID4gNTApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmR1cmF0aW9uICo9IC44O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmZsaXBDb3VudCA9PT0gMTAgJiYgIXRoaXMudGltZWxpbmVJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJUaW1lbGluZVBhdGhzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuZmxpcENvdW50IDwgMzUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYWRvd1RvcC5oYWx0T3BhY2l0eSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93VG9wLnNldE9wYWNpdHkoMCwge2R1cmF0aW9uOiAwfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkdmFuY2VDYXJkKG5leHRDYXJkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZHZhbmNlQ2FyZCh0b3BDYXJkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZHZhbmNlQ2FyZChib3R0b21DYXJkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9jay5zZXRUaW1lb3V0KHRoaXMuZmxpcENhcmQuYmluZCh0aGlzKSwgdGhpcy5kdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkdmFuY2VDYXJkKGNhcmQpIHtcbiAgICAgICAgbGV0IHpQb3M7XG5cbiAgICAgICAgaWYoY2FyZC5vcmRlciA9PT0gMSkgeyAgICAgICAgICAvLyBXYXMgYXQgdG9wLCBhZHZhbmNlIHRvIG5leHRcbiAgICAgICAgICAgIHpQb3MgPSB0aGlzLmJhc2VaUG9zLm5leHQ7XG4gICAgICAgICAgICBjYXJkLm9yZGVyID0gMztcbiAgICAgICAgICAgIGNhcmQuc2V0Um90YXRpb25YKDApO1xuICAgICAgICAgICAgY2FyZC5jYXIuYWR2YW5jZUltYWdlKCk7XG4gICAgICAgICAgICBjYXJkLnRpdGxlLnVwZGF0ZVBocmFzZSgpO1xuICAgICAgICB9IGVsc2UgaWYoY2FyZC5vcmRlciA9PT0gMikgeyAgIC8vIFdhcyBhdCBib3R0b20sIGFkdmFuY2UgdG8gdG9wXG4gICAgICAgICAgICB6UG9zID0gdGhpcy5iYXNlWlBvcy50b3A7XG4gICAgICAgICAgICBjYXJkLm9yZGVyID0gMTtcbiAgICAgICAgfSBlbHNlIGlmKGNhcmQub3JkZXIgPT09IDMpIHsgICAvLyBXYXMgYXQgbmV4dCwgYWR2YW5jZSB0byBib3R0b21cbiAgICAgICAgICAgIHpQb3MgPSB0aGlzLmJhc2VaUG9zLmJvdHRvbTtcbiAgICAgICAgICAgIGNhcmQub3JkZXIgPSAyO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FyZC5zZXRQb3NpdGlvblooelBvcyk7XG4gICAgICAgIGNhcmQuc2V0RE9NUHJvcGVydGllcyh7XG4gICAgICAgICAgICAnei1pbmRleCc6IHpQb3NcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJUaW1lbGluZVBhdGhzKCkge1xuICAgICAgICB0aGlzLnRpbWVsaW5lSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnRpbWVsaW5lID0gbmV3IFRpbWVsaW5lKHsgdGltZXNjYWxlOiAxIH0pO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyTG9nbygpO1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnNldCgyMDAwMCwgeyBkdXJhdGlvbjogMjAwMDB9KTtcbiAgICB9XG5cbiAgICByZWdpc3RlckxvZ28oKSB7XG4gICAgICAgIGNvbnN0IGxvZ29RdWFkcmFudHMgPSBbXG4gICAgICAgICAgICB0aGlzLmxvZ28uZ2VvbWV0cmllcy5zZWNvbmQsXG4gICAgICAgICAgICB0aGlzLmxvZ28uZ2VvbWV0cmllcy5mb3VydGgsXG4gICAgICAgICAgICB0aGlzLmxvZ28uZ2VvbWV0cmllcy5maXJzdCxcbiAgICAgICAgICAgIHRoaXMubG9nby5nZW9tZXRyaWVzLnRoaXJkXG4gICAgICAgIF07XG5cbiAgICAgICAgbGV0IHRpbWUgPSB7XG4gICAgICAgICAgICBhOiBbMCwgMjUwLCA1MDAsIDc1MF0sXG4gICAgICAgICAgICBlbmQ6IDE3NTBcbiAgICAgICAgfTtcblxuICAgICAgICBsb2dvUXVhZHJhbnRzLmZvckVhY2goKHF1YWRyYW50LCBpKSA9PiB7XG4gICAgICAgICAgICBsZXQgeCwgeSwgc3RhcnRUaW1lO1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gNDAwO1xuXG4gICAgICAgICAgICBzd2l0Y2goaSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogIC8vIHRvcCBsZWZ0XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IHRpbWUuYVswXTsvL3RoaXMudGltZS5xdWFkLmE7XG4gICAgICAgICAgICAgICAgICAgIHggPSAtb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICB5ID0gLW9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiAvLyBib3R0b20gcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gdGltZS5hWzFdOy8vdGhpcy50aW1lLnF1YWQuYjtcbiAgICAgICAgICAgICAgICAgICAgeCA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgeSA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAyOiAvLyB0b3AgcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gdGltZS5hWzJdOy8vdGhpcy50aW1lLnF1YWQuYztcbiAgICAgICAgICAgICAgICAgICAgeCA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgeSA9IC1vZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzogLy8gYm90dG9tIGxlZnRcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gdGltZS5hWzNdOyAvL3RoaXMudGltZS5xdWFkLmQ7XG4gICAgICAgICAgICAgICAgICAgIHggPSAtb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICB5ID0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgICAgIGhhbmRsZXI6ICh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcXVhZHJhbnQuc2V0UG9zaXRpb24oLi4udmFsKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICAgICAgWzAsIFt4LCB5LCAwXV0sXG4gICAgICAgICAgICAgICAgICAgIFtzdGFydFRpbWUsIFt4LCB5LCAwXSwgQ3VydmVzLmluT3V0QmFja10sXG4gICAgICAgICAgICAgICAgICAgIFtzdGFydFRpbWUgKyAxMDAwLCBbMCwgMCwgMF1dXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgICAgIGhhbmRsZXI6ICh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgaWYodCA+PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgcXVhZHJhbnQuc2V0T3BhY2l0eSgxLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMjUwXG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgICAgICBbMCwgMF0sXG4gICAgICAgICAgICAgICAgICAgIFt0aW1lLmVuZCwgdGltZS5lbmRdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCByb3RYID0gTWF0aC5QSSAqIDAgLyAxODA7XG4gICAgICAgICAgICBsZXQgcm90WSA9IE1hdGguUEkgKiAzNjAgLyAxODA7XG4gICAgICAgICAgICBsZXQgcm90WiA9IE1hdGguUEkgKiAwIC8gMTgwO1xuXG4gICAgICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICAgICAgaGFuZGxlcjogKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBxdWFkcmFudC5zZXRSb3RhdGlvbiguLi52YWwpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgICAgICBbc3RhcnRUaW1lLCBbcm90WCwgcm90WSwgcm90Wl1dLFxuICAgICAgICAgICAgICAgICAgICBbc3RhcnRUaW1lICsgMTAwMCwgWzAsIDAsIDBdXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyTG9hZE91dHNpZGVDeWxpbmRlcih0aW1lLmVuZCk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJMb2FkT3V0c2lkZUN5bGluZGVyKHN0YXJ0VGltZSkge1xuICAgICAgICBzdGFydFRpbWUgPSAoc3RhcnRUaW1lKSA/IHN0YXJ0VGltZSA6IDA7XG4gICAgICAgIGxldCB0aW1lID0ge1xuICAgICAgICAgICAgYTogW3N0YXJ0VGltZV0sXG4gICAgICAgICAgICBlbmQ6IHN0YXJ0VGltZSArIDEwMDBcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgaGFzU2NhbGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICh0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNTY2FsZWQgJiYgdCA+PSB0aW1lLmFbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzU2NhbGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ28uZ2VvbWV0cmllcy5vdXRzaWRlQ3lsLnNldFNjYWxlKDAsIDAsIDAsIHtkdXJhdGlvbjogMH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nby5nZW9tZXRyaWVzLm91dHNpZGVDeWwuc2V0U2NhbGUoMSwgMSwgMSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnZlOiBDdXJ2ZXMub3V0QmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ28uZ2VvbWV0cmllcy5vdXRzaWRlQ3lsLnNldE9wYWNpdHkoMSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA4MDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFtzdGFydFRpbWUsIHN0YXJ0VGltZV0sXG4gICAgICAgICAgICAgICAgW3RpbWUuZW5kLCB0aW1lLmVuZF1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlclJvdGF0ZUFzc2VtYmxlTG9nbyh0aW1lLmVuZCk7XG4gICAgfTtcblxuICAgIHJlZ2lzdGVyUm90YXRlQXNzZW1ibGVMb2dvKHN0YXJ0VGltZSkge1xuICAgICAgICBzdGFydFRpbWUgPSAoc3RhcnRUaW1lKSA/IHN0YXJ0VGltZSA6IDA7XG4gICAgICAgIGxldCBwaGFzZUR1cmF0aW9uID0gMTc1MDtcbiAgICAgICAgbGV0IGVuZFRpbWUgPSBzdGFydFRpbWUgKyBwaGFzZUR1cmF0aW9uO1xuXG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ28uc2V0Um90YXRpb25ZKHZhbCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFtzdGFydFRpbWUsIDAsIEN1cnZlcy5lYXNlT3V0XSxcbiAgICAgICAgICAgICAgICBbc3RhcnRUaW1lICsgNTAwLCBNYXRoLlBJICogOTAgLzE4MF0sXG4gICAgICAgICAgICAgICAgW3N0YXJ0VGltZSArIDEyNTAsIE1hdGguUEkgKiA5MCAvMTgwLCBDdXJ2ZXMub3V0QmFja10sXG4gICAgICAgICAgICAgICAgW2VuZFRpbWUsIDBdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBpc1NjcmV3ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZighaXNTY3Jld2VkICYmIHRpbWUgPj0gc3RhcnRUaW1lICsgNTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzU2NyZXdlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dvLnF1YWRzLnNldFJvdGF0aW9uWihNYXRoLlBJICogMTQ0MCAvIDE4MCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDc1MFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ28ucXVhZHMuc2V0UG9zaXRpb25aKDAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJ2ZTogQ3VydmVzLmluQmFja1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFtzdGFydFRpbWUsIHN0YXJ0VGltZV0sXG4gICAgICAgICAgICAgICAgW2VuZFRpbWUsIGVuZFRpbWVdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJBZGRPdXRlclJpbmdJbnNpZGVDeWwoZW5kVGltZSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJBZGRPdXRlclJpbmdJbnNpZGVDeWwoc3RhcnRUaW1lKSB7XG4gICAgICAgIHN0YXJ0VGltZSA9IChzdGFydFRpbWUpID8gc3RhcnRUaW1lIDogMDtcbiAgICAgICAgbGV0IHBoYXNlRHVyYXRpb24gPSAxNTAwO1xuICAgICAgICBsZXQgZW5kVGltZSA9IHN0YXJ0VGltZSArIHBoYXNlRHVyYXRpb247XG5cbiAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMub3V0ZXJSaW5nLnNldFBvc2l0aW9uWigxMDAwKTtcbiAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMuaW5zaWRlQ3lsLnNldFBvc2l0aW9uWigxMDAwKTtcbiAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMuaW5uZXJSaW5nLnNldFBvc2l0aW9uWigtNTAwKTtcblxuICAgICAgICBsZXQgaGFzU2NhbGVkRG93biA9IGZhbHNlO1xuICAgICAgICBsZXQgaGFzU2NhbGVkVXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZighaGFzU2NhbGVkRG93biAmJiB0aW1lID49IHN0YXJ0VGltZSkge1xuICAgICAgICAgICAgICAgICAgICBoYXNTY2FsZWREb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMub3V0ZXJSaW5nLnNldE9wYWNpdHkoMSwgeyBkdXJhdGlvbjogMTAwMCB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ28uZ2VvbWV0cmllcy5vdXRlclJpbmcuc2V0UG9zaXRpb25aKDAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VydmU6IEN1cnZlcy5lYXNlSW5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMuaW5zaWRlQ3lsLnNldE9wYWNpdHkoMSwgeyBkdXJhdGlvbjogNzUwIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nby5nZW9tZXRyaWVzLmluc2lkZUN5bC5zZXRQb3NpdGlvblooMCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnZlOiBDdXJ2ZXMuZWFzZUluXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKCFoYXNTY2FsZWRVcCAmJiB0aW1lID49IHN0YXJ0VGltZSArIDEwMDApIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzU2NhbGVkVXAgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ28uZ2VvbWV0cmllcy5pbm5lclJpbmcuc2V0T3BhY2l0eSgxKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMuaW5uZXJSaW5nLnNldFBvc2l0aW9uWigwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogNTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VydmU6IEN1cnZlcy5vdXRCYWNrXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgW3N0YXJ0VGltZSwgc3RhcnRUaW1lXSxcbiAgICAgICAgICAgICAgICBbZW5kVGltZSwgZW5kVGltZV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlckxldHRlckVudHJ5KGVuZFRpbWUpO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyTGV0dGVyRW50cnkoc3RhcnRUaW1lKSB7XG4gICAgICAgIHN0YXJ0VGltZSA9IChzdGFydFRpbWUpID8gc3RhcnRUaW1lIDogMDtcbiAgICAgICAgbGV0IHBoYXNlRHVyYXRpb24gPSAxNTAwO1xuICAgICAgICBsZXQgZW5kVGltZSA9IHN0YXJ0VGltZSArIHBoYXNlRHVyYXRpb247XG5cbiAgICAgICAgbGV0IEIgPSB0aGlzLmxvZ28uZ2VvbWV0cmllcy5CLCBNID0gdGhpcy5sb2dvLmdlb21ldHJpZXMuTSwgVyA9IHRoaXMubG9nby5nZW9tZXRyaWVzLlc7XG5cbiAgICAgICAgQi5zZXRQb3NpdGlvblooMTAwKTtcbiAgICAgICAgTS5zZXRQb3NpdGlvblooMTAwKTtcbiAgICAgICAgVy5zZXRQb3NpdGlvblooMTAwKTtcblxuICAgICAgICBsZXQgaGFzTG9hZGVkTGV0dGVycyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCFoYXNMb2FkZWRMZXR0ZXJzICYmIHRpbWUgPj0gc3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhc0xvYWRlZExldHRlcnMgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIEIuc2V0T3BhY2l0eSgxLCB7IGR1cmF0aW9uOiAyNTB9KTtcbiAgICAgICAgICAgICAgICAgICAgQi5zZXRQb3NpdGlvblooMCwgeyBkdXJhdGlvbjogMjUwfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE0uc2V0T3BhY2l0eSgxLCB7IGR1cmF0aW9uOiAyNTB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIE0uc2V0UG9zaXRpb25aKDAsIHsgZHVyYXRpb246IDI1MH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCAyNTApO1xuXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBXLnNldE9wYWNpdHkoMSwgeyBkdXJhdGlvbjogMjUwfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBXLnNldFBvc2l0aW9uWigwLCB7IGR1cmF0aW9uOiAyNTB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFtzdGFydFRpbWUsIHN0YXJ0VGltZV0sXG4gICAgICAgICAgICAgICAgW2VuZFRpbWUsIGVuZFRpbWVdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJDYXIoZW5kVGltZSk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJDbG9zaW5nVGV4dChlbmRUaW1lKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlclNreShlbmRUaW1lKTtcbiAgICB9XG5cbiAgICByZWdpc3RlckNhcihzdGFydFRpbWUpIHtcbiAgICAgICAgc3RhcnRUaW1lID0gKHN0YXJ0VGltZSkgPyBzdGFydFRpbWUgOiAwO1xuICAgICAgICBsZXQgdGltZSA9IHtcbiAgICAgICAgICAgIGE6IFtzdGFydFRpbWUsIHN0YXJ0VGltZSArIDEwMDBdLFxuICAgICAgICAgICAgYjogW3N0YXJ0VGltZSArIDIwMDAsIHN0YXJ0VGltZSArIDMwMDBdLFxuICAgICAgICAgICAgZW5kOiBzdGFydFRpbWUgKyAzMDAwXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGxhc3RDYXJkID0gdGhpcy5mbGlwQ2FyZHNbMF07XG5cbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIGxhc3RDYXJkLmNhci5zZXRQb3NpdGlvbiguLi52YWwpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbc3RhcnRUaW1lLCBbMCwgMF1dLFxuICAgICAgICAgICAgICAgIFt0aW1lLmFbMV0sIFs0MDAsIC02MDBdLCBDdXJ2ZXMub3V0Q2lyY10sXG4gICAgICAgICAgICAgICAgW3RpbWUuYlswXSwgWzQwMCwgLTgyNV1dLFxuICAgICAgICAgICAgICAgIFt0aW1lLmJbMV0sIFswLCAtMzc1XSwgQ3VydmVzLmluQ2lyY11cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGhhc1VwZGF0ZWRJbWFnZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCFoYXNVcGRhdGVkSW1hZ2UgJiYgdCA+PSB0aW1lLmJbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzVXBkYXRlZEltYWdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdENhcmQuY2FyLnVwZGF0ZUltYWdlKCdvcmFuZ2VfbWlycm9yZWQucG5nJyk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RDYXJkLmNhci5zZXRTY2FsZSgxLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdENhcmQuY2FyLnNldFNpemVNb2RlQWJzb2x1dGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdENhcmQuY2FyLnNldEFic29sdXRlU2l6ZSg1NTAsIDM2Nyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbMCwgMF0sXG4gICAgICAgICAgICAgICAgW3RpbWUuZW5kLCB0aW1lLmVuZF1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGlzT3BhY2l0YXRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCFpc09wYWNpdGF0ZWQgJiYgdCA+PSBzdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNPcGFjaXRhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mbGlwQ2FyZHMuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkLnNldERPTVByb3BlcnRpZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJ3JnYmEoMCwgMCwgMCwgMCknXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyTG9nb0Ryb3AodCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbc3RhcnRUaW1lLCBzdGFydFRpbWVdLFxuICAgICAgICAgICAgICAgIFt0aW1lLmVuZCwgdGltZS5lbmRdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcmVnaXN0ZXJMb2dvRHJvcChzdGFydFRpbWUpIHtcbiAgICAgICAgc3RhcnRUaW1lID0gKHN0YXJ0VGltZSkgPyBzdGFydFRpbWUgOiAwO1xuICAgICAgICBsZXQgdGltZSA9IHtcbiAgICAgICAgICAgIGE6IFtzdGFydFRpbWUgKyAxNTAwLCBzdGFydFRpbWUgKyAzMDAwXSxcbiAgICAgICAgICAgIGVuZDogc3RhcnRUaW1lICsgMzAwXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGxvZ28gPSB7XG4gICAgICAgICAgICB6OiB0aGlzLmxvZ28uZ2V0UG9zaXRpb25aKCksXG4gICAgICAgICAgICB5OiB0aGlzLmxvZ28uZ2V0UG9zaXRpb25ZKCksXG4gICAgICAgICAgICB4OiB0aGlzLmxvZ28uZ2V0UG9zaXRpb25YKClcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dvLnNldFBvc2l0aW9uKC4uLnZhbCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFtzdGFydFRpbWUsICBbbG9nby54LCBsb2dvLnksIGxvZ28uel0sIEN1cnZlcy5lYXNlSW5dLFxuICAgICAgICAgICAgICAgIFt0aW1lLmFbMF0sICBbbG9nby54LCAyNTAsICAgIGxvZ28uel0sIEN1cnZlcy5lYXNlT3V0XSxcbiAgICAgICAgICAgICAgICBbdGltZS5hWzFdLCAgW2xvZ28ueCwgMzY1LCAgICBsb2dvLnpdXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dvLnNldFNjYWxlKC4uLnZhbClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgW3N0YXJ0VGltZSwgIFsxLCAxLCAxXSwgQ3VydmVzLmVhc2VPdXRdLFxuICAgICAgICAgICAgICAgIFt0aW1lLmFbMF0sIFsuNywgLjcsIC43XSwgQ3VydmVzLmVhc2VJbl0sXG4gICAgICAgICAgICAgICAgW3RpbWUuYVsxXSwgWy45LCAuOSwgLjldXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHJlZ2lzdGVyU2t5KHN0YXJ0VGltZSkge1xuICAgICAgICBzdGFydFRpbWUgPSAoc3RhcnRUaW1lKSA/IHN0YXJ0VGltZSA6IDA7XG4gICAgICAgIGxldCB0aW1lID0ge1xuICAgICAgICAgICAgYTogW3N0YXJ0VGltZSwgc3RhcnRUaW1lICsgMTAwMF0sXG4gICAgICAgICAgICBiOiBbc3RhcnRUaW1lICsgMjAwMCwgc3RhcnRUaW1lICsgMzAwMF0sXG4gICAgICAgICAgICBlbmQ6IHN0YXJ0VGltZSArIDMwMDBcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5za3kuc2V0RE9NUHJvcGVydGllcyh7XG4gICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJ3JnYignICsgTWF0aC5mbG9vcih2YWxbMF0pICsgJywgJyArIE1hdGguZmxvb3IodmFsWzFdKSArICcsICcgKyBNYXRoLmZsb29yKHZhbFsyXSkgKyAnKSdcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbdGltZS5iWzBdICsgMCwgICAgWzI1NSwgMjU1LCAyNTVdXSxcbiAgICAgICAgICAgICAgICBbdGltZS5iWzBdICsgNTAsICAgWzI1NSwgMjQ4LCAyMjRdXSxcbiAgICAgICAgICAgICAgICBbdGltZS5iWzBdICsgMTAwLCAgWzI1NSwgMjEzLCA3OF1dLFxuICAgICAgICAgICAgICAgIFt0aW1lLmJbMF0gKyAxNTAsICBbMjU1LCAxNTQsIDBdXSxcbiAgICAgICAgICAgICAgICBbdGltZS5iWzBdICsgMjAwLCAgWzIyOSwgOTUsICAyMV1dLFxuICAgICAgICAgICAgICAgIFt0aW1lLmJbMF0gKyAyNTAsICBbMjA1LCA0MSwgIDEwM11dLFxuICAgICAgICAgICAgICAgIFt0aW1lLmJbMV0sICAgICAgICBbMCwgMCwgMF1dXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcmVnaXN0ZXJDbG9zaW5nVGV4dChzdGFydFRpbWUpIHtcbiAgICAgICAgLy83NTAwXG4gICAgICAgIHN0YXJ0VGltZSA9IChzdGFydFRpbWUpID8gc3RhcnRUaW1lIDogMDtcbiAgICAgICAgbGV0IHRpbWUgPSB7XG4gICAgICAgICAgICBhOiBbc3RhcnRUaW1lICsgNTAwLCBzdGFydFRpbWUgKyAxNTAwLCBzdGFydFRpbWUgKyAzMDAwXSxcbiAgICAgICAgICAgIGI6IFtzdGFydFRpbWUgKyAyNzAwLCBzdGFydFRpbWUgKyAzNTAwXVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vQ2xvc2luZyB0ZXh0IDFcbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2luZ1RleHQxLnNldE9wYWNpdHkodmFsKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgW3N0YXJ0VGltZSwgMF0sXG4gICAgICAgICAgICAgICAgW3RpbWUuYVswXSwgMF0sXG4gICAgICAgICAgICAgICAgW3RpbWUuYVsxXSwgMV0sXG4gICAgICAgICAgICAgICAgW3RpbWUuYVsyXSwgMF1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHlwb3MgPSB0aGlzLmNsb3NpbmdUZXh0MS5wb3NpdGlvbi5nZXRZKCk7XG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NpbmdUZXh0MS5zZXRQb3NpdGlvbiguLi52YWwpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1tzdGFydFRpbWUsIFswLCB5cG9zXV0sXG4gICAgICAgICAgICAgICAgW3RpbWUuYVsxXSwgWzAsIHlwb3NdLCBDdXJ2ZXMuZWFzZU91dF0sXG4gICAgICAgICAgICAgICAgW3RpbWUuYVsyXSwgWzAsIHlwb3MgKyAxMDBdXV1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9DbG9zaW5nIHRleHQgMlxuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zaW5nVGV4dDIuc2V0T3BhY2l0eSh2YWwpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbc3RhcnRUaW1lLCAwXSxcbiAgICAgICAgICAgICAgICBbdGltZS5iWzBdLCAwXSxcbiAgICAgICAgICAgICAgICBbdGltZS5iWzFdLCAxXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBsb2dvQnJlYXRoKCkge1xuICAgICAgICB0aGlzLmxvZ28uc2V0U2NhbGUoMS4wNSwgMS4wNSwgMS4wNSwge1xuICAgICAgICAgICAgZHVyYXRpb246IDUwMFxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvZ28uc2V0U2NhbGUoMSwgMSwgMSwge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA1MDBcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5GYW1vdXNFbmdpbmUuaW5pdCgpO1xuRmFtb3VzRW5naW5lLmNyZWF0ZVNjZW5lKCcjYXBwJyk7XG5cbndpbmRvdy5hcHAgPSBuZXcgQXBwKEZhbW91c0VuZ2luZS5hZGRDaGlsZCgnI2FwcCcpKTtcbiIsIid1c2Ugc3RyaWN0JztcbnJlcXVpcmUoJ2JhYmVsaWZ5L3BvbHlmaWxsJyk7XG5yZXF1aXJlKCcuL2FwcC9pbmRleCcpO1xuIl19
