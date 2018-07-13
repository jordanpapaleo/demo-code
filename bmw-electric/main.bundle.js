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

        this.setSizeMode(0, 0).setProportionalSize(1, 1);
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
            if (_ImageService2['default'].getCurrent() < _ImageService2['default'].getMax()) {
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

        this.setSizeModeRelative().setProportionalSize(1, 0.5);
        //this.setSizeModeAbsolute().setAbsoluteSize(420, 384);

        this.createDOMElement({
            classes: ['card-' + this.model.alphaId],
            properties: {
                'z-index': this.model.zPos
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
    _currentImage: 0,
    _maxCount: 35
};

Image.getCurrent = function () {
    return this._currentImage;
};

Image.getMax = function () {
    return this._maxCount;
};

Image.getNext = function () {
    this._currentImage++;
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
            top: 1,
            bottom: 3,
            next: 1,
            shadow: 2
        };

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
            this.closingText1.setPositionZ(5);

            this.closingText1.createDOMElement({
                properties: {
                    'text-align': 'center',
                    'font-size': '26px',
                    'line-height': '1',
                    'z-index': '5'
                },
                tagName: 'div',
                content: 'SEE HOW WE BROUGHT<br>TOMMORROW TO TODAY'
            });

            //CLOSING TEXT 2
            this.closingText2 = new _famousCreativeDisplayView2['default'](this.addChild());
            this.closingText2.setOpacity(0);
            this.closingText2.setPositionY(600);
            this.closingText2.setPositionZ(4);

            this.closingText2.createDOMElement({
                properties: {
                    'text-align': 'center',
                    'font-size': '26px',
                    'line-height': '1',
                    'z-index': '4',
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
                    'background-color': '#000000' },
                classes: ['background-sky']
            });

            this.sky.setOpacity(0);

            this.sky.setSizeModeRelative();
            this.sky.setProportionalSize(1, 1);
        }
    }, {
        key: 'renderLogo',
        value: function renderLogo() {
            this.logo = new _Logo.Logo(this.addChild());

            //Back Light
            this.backlight = new _famousCreativeDisplayView2['default'](this.node.addChild());
            this.backlight.pointLight = new PointLight(this.backlight.addChild());
            this.backlight.pointLight.setColor(new Color('#444444'));
            this.backlight.setPosition(0, -100, -100);

            this.ambientLight = new _famousCreativeDisplayView2['default'](this.node.addChild());
            this.ambientLight.ambientLight = new AmbientLight(this.ambientLight.addChild());
            this.ambientLight.ambientLight.setColor(new Color('#999999'));

            this.pointLightB = new _famousCreativeDisplayView2['default'](this.node.addChild());
            this.pointLightB.pointLight = new PointLight(this.pointLightB.addChild());
            this.pointLightB.pointLight.setColor(new Color('#CCCCCC'));
            this.pointLightB.setPosition(0, 150, 450);
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

            var isScrewedIn = false;
            this.timeline.registerPath({
                handler: function handler(time) {
                    if (!isScrewedIn && time >= startTime + 500) {
                        isScrewedIn = true;

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
                    _this9.sky.setOpacity(val);
                    /*this.sky.setDOMProperties({
                        'background-color': 'rgb(' + Math.floor(val[0]) + ', ' + Math.floor(val[1]) + ', ' + Math.floor(val[2]) + ')'
                    })*/
                },
                path: [[time.b[0], 0], [time.b[1], 1]]
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

},{"./FlipCard":99,"./ImageService":100,"./Logo":101,"./PhraseService":102,"famous-creative/animation/Timeline":92,"famous-creative/display/View":94,"famous-creative/scaffolding/FamousEngine":96}],105:[function(require,module,exports){
'use strict';
require('babelify/polyfill');
require('./app/index');

},{"./app/index":104,"babelify/polyfill":90}]},{},[105])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbGliL2JhYmVsL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXJyYXktbWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXNzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi1zdHJvbmcuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvbGxlY3Rpb24tdG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi13ZWFrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jdHguanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmRlZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZG9tLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZW51bS1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5mb3Itb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmZ3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pbnZva2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItY2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlci1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pdGVyLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQua2V5b2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLm1peC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQub3duLWtleXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnBhcnRpYWwuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnJlZGVmLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5yZXBsYWNlci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc2V0LXByb3RvLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnN0cmluZy1wYWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnN0cmluZy1yZXBlYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnRhc2suanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnRocm93cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudWlkLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC51bnNjb3BlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC53a3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuY29weS13aXRoaW4uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5maW5kLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZpbmQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmZ1bmN0aW9uLmhhcy1pbnN0YW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5mdW5jdGlvbi5uYW1lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm1hcC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXRoLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm51bWJlci5jb25zdHJ1Y3Rvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIuc3RhdGljcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC5pcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnByb21pc2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVmbGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWdleHAuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc2V0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5jb2RlLXBvaW50LWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5lbmRzLXdpdGguanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLmZyb20tY29kZS1wb2ludC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5yYXcuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLnJlcGVhdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuc3RhcnRzLXdpdGguanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LndlYWstbWFwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LndlYWstc2V0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LmFycmF5LmluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3Lm1hcC50by1qc29uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3Lm9iamVjdC50by1hcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5yZWdleHAuZXNjYXBlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnNldC50by1qc29uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnN0cmluZy5hdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zdHJpbmcubHBhZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zdHJpbmcucnBhZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2pzLmFycmF5LnN0YXRpY3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLmltbWVkaWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi50aW1lcnMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvcmVnZW5lcmF0b3IvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9jc3NpZnkvYnJvd3Nlci5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2ZjLWNvbnRlbnQvYm13L25vZGVfbW9kdWxlcy9mYW1vdXMtY3JlYXRpdmUvYW5pbWF0aW9uL1RpbWVsaW5lLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvZmMtY29udGVudC9ibXcvbm9kZV9tb2R1bGVzL2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L01vZGlmaWVyLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvZmMtY29udGVudC9ibXcvbm9kZV9tb2R1bGVzL2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L1ZpZXcuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9mYy1jb250ZW50L2Jtdy9ub2RlX21vZHVsZXMvZmFtb3VzLWNyZWF0aXZlL2V2ZW50cy9FdmVudEVtaXR0ZXIuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9mYy1jb250ZW50L2Jtdy9ub2RlX21vZHVsZXMvZmFtb3VzLWNyZWF0aXZlL3NjYWZmb2xkaW5nL0ZhbW91c0VuZ2luZS5qcyIsIm5vZGVfbW9kdWxlcy9mYW1vdXMtY3JlYXRpdmUvc2NhZmZvbGRpbmcvcmVzZXQubWluLmNzcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2ZjLWNvbnRlbnQvYm13L3NyYy9hcHAvQ2FyLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvZmMtY29udGVudC9ibXcvc3JjL2FwcC9GbGlwQ2FyZC5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2ZjLWNvbnRlbnQvYm13L3NyYy9hcHAvSW1hZ2VTZXJ2aWNlLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvZmMtY29udGVudC9ibXcvc3JjL2FwcC9Mb2dvLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvZmMtY29udGVudC9ibXcvc3JjL2FwcC9QaHJhc2VTZXJ2aWNlLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvZmMtY29udGVudC9ibXcvc3JjL2FwcC9UaXRsZS5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2ZjLWNvbnRlbnQvYm13L3NyYy9hcHAvaW5kZXguanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9mYy1jb250ZW50L2Jtdy9zcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkUsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBQ2tCLCtCQUFHO0FBQ3BCLFVBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkUsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBQ2dCLDZCQUFHO0FBQ2xCLFVBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0QsYUFBTyxJQUFJLENBQUM7S0FDYjs7Ozs7O1dBSVUsdUJBQUc7QUFDWixVQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkUsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBQ1kseUJBQUc7QUFDZCxVQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDN0UsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBQ1csd0JBQUc7QUFDYixVQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMs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QixnQkFBSSxFQUFFLFNBQVM7QUFDZixrQkFBTSxFQUFFLFNBQVM7U0FDcEIsQ0FBQzs7QUFFRixZQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDdkQsWUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELFlBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs7Ozs7QUFLdkQsWUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzNELFlBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMzRCxZQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDM0QsWUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNELFlBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs7QUFFckUsWUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLFlBQUksQ0FBQyxVQUFVLENBQUMs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QUFDO0FBQ3ZCLHVCQUFPLEVBQUUsaUJBQUMsR0FBRyxFQUFLO0FBQ2QsNEJBQUssWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDckM7QUFDRCxvQkFBSSxFQUFFLENBQ0YsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQ2QsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNkLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDakI7YUFDSixDQUFDLENBQUM7U0FDTjs7O2VBRVMsc0JBQUc7OztBQUNULGdCQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtBQUNqQyx3QkFBUSxFQUFFLEdBQUc7YUFDaEIsRUFBRSxZQUFNO0FBQ0wsd0JBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN4Qiw0QkFBUSxFQUFFLEdBQUc7aUJBQ2hCLENBQUMsQ0FBQTthQUNMLENBQUMsQ0FBQTtTQUNMOzs7V0EzckJDLEdBQUc7OztBQThyQlQsbURBQWEsSUFBSSxFQUFFLENBQUM7QUFDcEIsbURBQWEsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVqQyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLG1EQUFhLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDOzs7QUNwdEJwRCxZQUFZLENBQUM7QUFDYixPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUM3QixPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnJlcXVpcmUoXCJjb3JlLWpzL3NoaW1cIik7XG5cbnJlcXVpcmUoXCJyZWdlbmVyYXRvci9ydW50aW1lXCIpO1xuXG5pZiAoZ2xvYmFsLl9iYWJlbFBvbHlmaWxsKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIm9ubHkgb25lIGluc3RhbmNlIG9mIGJhYmVsL3BvbHlmaWxsIGlzIGFsbG93ZWRcIik7XG59XG5nbG9iYWwuX2JhYmVsUG9seWZpbGwgPSB0cnVlOyIsIi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2Zcbi8vIHRydWUgIC0+IEFycmF5I2luY2x1ZGVzXG52YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihJU19JTkNMVURFUyl7XG4gIHJldHVybiBmdW5jdGlvbigkdGhpcywgZWwsIGZyb21JbmRleCl7XG4gICAgdmFyIE8gICAgICA9ICQudG9PYmplY3QoJHRoaXMpXG4gICAgICAsIGxlbmd0aCA9ICQudG9MZW5ndGgoTy5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9ICQudG9JbmRleChmcm9tSW5kZXgsIGxlbmd0aClcbiAgICAgICwgdmFsdWU7XG4gICAgaWYoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpd2hpbGUobGVuZ3RoID4gaW5kZXgpe1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgaWYodmFsdWUgIT0gdmFsdWUpcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTyl7XG4gICAgICBpZihPW2luZGV4XSA9PT0gZWwpcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4O1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07IiwiLy8gMCAtPiBBcnJheSNmb3JFYWNoXG4vLyAxIC0+IEFycmF5I21hcFxuLy8gMiAtPiBBcnJheSNmaWx0ZXJcbi8vIDMgLT4gQXJyYXkjc29tZVxuLy8gNCAtPiBBcnJheSNldmVyeVxuLy8gNSAtPiBBcnJheSNmaW5kXG4vLyA2IC0+IEFycmF5I2ZpbmRJbmRleFxudmFyICQgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3R4ID0gcmVxdWlyZSgnLi8kLmN0eCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUWVBFKXtcbiAgdmFyIElTX01BUCAgICAgICAgPSBUWVBFID09IDFcbiAgICAsIElTX0ZJTFRFUiAgICAgPSBUWVBFID09IDJcbiAgICAsIElTX1NPTUUgICAgICAgPSBUWVBFID09IDNcbiAgICAsIElTX0VWRVJZICAgICAgPSBUWVBFID09IDRcbiAgICAsIElTX0ZJTkRfSU5ERVggPSBUWVBFID09IDZcbiAgICAsIE5PX0hPTEVTICAgICAgPSBUWVBFID09IDUgfHwgSVNfRklORF9JTkRFWDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBjYWxsYmFja2ZuLCB0aGF0KXtcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCgkdGhpcykpXG4gICAgICAsIHNlbGYgICA9ICQuRVM1T2JqZWN0KE8pXG4gICAgICAsIGYgICAgICA9IGN0eChjYWxsYmFja2ZuLCB0aGF0LCAzKVxuICAgICAgLCBsZW5ndGggPSAkLnRvTGVuZ3RoKHNlbGYubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSAwXG4gICAgICAsIHJlc3VsdCA9IElTX01BUCA/IEFycmF5KGxlbmd0aCkgOiBJU19GSUxURVIgPyBbXSA6IHVuZGVmaW5lZFxuICAgICAgLCB2YWwsIHJlcztcbiAgICBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKE5PX0hPTEVTIHx8IGluZGV4IGluIHNlbGYpe1xuICAgICAgdmFsID0gc2VsZltpbmRleF07XG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xuICAgICAgaWYoVFlQRSl7XG4gICAgICAgIGlmKElTX01BUClyZXN1bHRbaW5kZXhdID0gcmVzOyAgICAgICAgICAgIC8vIG1hcFxuICAgICAgICBlbHNlIGlmKHJlcylzd2l0Y2goVFlQRSl7XG4gICAgICAgICAgY2FzZSAzOiByZXR1cm4gdHJ1ZTsgICAgICAgICAgICAgICAgICAgIC8vIHNvbWVcbiAgICAgICAgICBjYXNlIDU6IHJldHVybiB2YWw7ICAgICAgICAgICAgICAgICAgICAgLy8gZmluZFxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcbiAgICAgICAgICBjYXNlIDI6IHJlc3VsdC5wdXNoKHZhbCk7ICAgICAgICAgICAgICAgLy8gZmlsdGVyXG4gICAgICAgIH0gZWxzZSBpZihJU19FVkVSWSlyZXR1cm4gZmFsc2U7ICAgICAgICAgIC8vIGV2ZXJ5XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJU19GSU5EX0lOREVYID8gLTEgOiBJU19TT01FIHx8IElTX0VWRVJZID8gSVNfRVZFUlkgOiByZXN1bHQ7XG4gIH07XG59OyIsInZhciAkID0gcmVxdWlyZSgnLi8kJyk7XG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLCBtc2cxLCBtc2cyKXtcbiAgaWYoIWNvbmRpdGlvbil0aHJvdyBUeXBlRXJyb3IobXNnMiA/IG1zZzEgKyBtc2cyIDogbXNnMSk7XG59XG5hc3NlcnQuZGVmID0gJC5hc3NlcnREZWZpbmVkO1xuYXNzZXJ0LmZuID0gZnVuY3Rpb24oaXQpe1xuICBpZighJC5pc0Z1bmN0aW9uKGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59O1xuYXNzZXJ0Lm9iaiA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoISQuaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTtcbmFzc2VydC5pbnN0ID0gZnVuY3Rpb24oaXQsIENvbnN0cnVjdG9yLCBuYW1lKXtcbiAgaWYoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl0aHJvdyBUeXBlRXJyb3IobmFtZSArIFwiOiB1c2UgdGhlICduZXcnIG9wZXJhdG9yIVwiKTtcbiAgcmV0dXJuIGl0O1xufTtcbm1vZHVsZS5leHBvcnRzID0gYXNzZXJ0OyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZW51bUtleXMgPSByZXF1aXJlKCcuLyQuZW51bS1rZXlzJyk7XG4vLyAxOS4xLjIuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlLCAuLi4pXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSl7XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG4gIHZhciBUID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCh0YXJnZXQpKVxuICAgICwgbCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGkgPSAxO1xuICB3aGlsZShsID4gaSl7XG4gICAgdmFyIFMgICAgICA9ICQuRVM1T2JqZWN0KGFyZ3VtZW50c1tpKytdKVxuICAgICAgLCBrZXlzICAgPSBlbnVtS2V5cyhTKVxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgLCBqICAgICAgPSAwXG4gICAgICAsIGtleTtcbiAgICB3aGlsZShsZW5ndGggPiBqKVRba2V5ID0ga2V5c1tqKytdXSA9IFNba2V5XTtcbiAgfVxuICByZXR1cm4gVDtcbn07IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBUQUcgICAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKVxuICAsIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5mdW5jdGlvbiBjb2YoaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufVxuY29mLmNsYXNzb2YgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBPLCBUO1xuICByZXR1cm4gaXQgPT0gdW5kZWZpbmVkID8gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogJ051bGwnXG4gICAgOiB0eXBlb2YgKFQgPSAoTyA9IE9iamVjdChpdCkpW1RBR10pID09ICdzdHJpbmcnID8gVCA6IGNvZihPKTtcbn07XG5jb2Yuc2V0ID0gZnVuY3Rpb24oaXQsIHRhZywgc3RhdCl7XG4gIGlmKGl0ICYmICEkLmhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSkkLmhpZGUoaXQsIFRBRywgdGFnKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IGNvZjsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGN0eCAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgc2FmZSAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZVxuICAsIGFzc2VydCAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXG4gICwgZm9yT2YgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcbiAgLCBzdGVwICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJykuc3RlcFxuICAsIGhhcyAgICAgID0gJC5oYXNcbiAgLCBzZXQgICAgICA9ICQuc2V0XG4gICwgaXNPYmplY3QgPSAkLmlzT2JqZWN0XG4gICwgaGlkZSAgICAgPSAkLmhpZGVcbiAgLCBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGlzT2JqZWN0XG4gICwgSUQgICAgICAgPSBzYWZlKCdpZCcpXG4gICwgTzEgICAgICAgPSBzYWZlKCdPMScpXG4gICwgTEFTVCAgICAgPSBzYWZlKCdsYXN0JylcbiAgLCBGSVJTVCAgICA9IHNhZmUoJ2ZpcnN0JylcbiAgLCBJVEVSICAgICA9IHNhZmUoJ2l0ZXInKVxuICAsIFNJWkUgICAgID0gJC5ERVNDID8gc2FmZSgnc2l6ZScpIDogJ3NpemUnXG4gICwgaWQgICAgICAgPSAwO1xuXG5mdW5jdGlvbiBmYXN0S2V5KGl0LCBjcmVhdGUpe1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XG4gIGlmKCFoYXMoaXQsIElEKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIGlkXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG9iamVjdCBpZFxuICAgIGhpZGUoaXQsIElELCArK2lkKTtcbiAgLy8gcmV0dXJuIG9iamVjdCBpZCB3aXRoIHByZWZpeFxuICB9IHJldHVybiAnTycgKyBpdFtJRF07XG59XG5cbmZ1bmN0aW9uIGdldEVudHJ5KHRoYXQsIGtleSl7XG4gIC8vIGZhc3QgY2FzZVxuICB2YXIgaW5kZXggPSBmYXN0S2V5KGtleSksIGVudHJ5O1xuICBpZihpbmRleCAhPSAnRicpcmV0dXJuIHRoYXRbTzFdW2luZGV4XTtcbiAgLy8gZnJvemVuIG9iamVjdCBjYXNlXG4gIGZvcihlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcbiAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldENvbnN0cnVjdG9yOiBmdW5jdGlvbihOQU1FLCBJU19NQVAsIEFEREVSKXtcbiAgICBmdW5jdGlvbiBDKCl7XG4gICAgICB2YXIgdGhhdCAgICAgPSBhc3NlcnQuaW5zdCh0aGlzLCBDLCBOQU1FKVxuICAgICAgICAsIGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgc2V0KHRoYXQsIE8xLCAkLmNyZWF0ZShudWxsKSk7XG4gICAgICBzZXQodGhhdCwgU0laRSwgMCk7XG4gICAgICBzZXQodGhhdCwgTEFTVCwgdW5kZWZpbmVkKTtcbiAgICAgIHNldCh0aGF0LCBGSVJTVCwgdW5kZWZpbmVkKTtcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGF0W0FEREVSXSwgdGhhdCk7XG4gICAgfVxuICAgIHJlcXVpcmUoJy4vJC5taXgnKShDLnByb3RvdHlwZSwge1xuICAgICAgLy8gMjMuMS4zLjEgTWFwLnByb3RvdHlwZS5jbGVhcigpXG4gICAgICAvLyAyMy4yLjMuMiBTZXQucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIGNsZWFyOiBmdW5jdGlvbiBjbGVhcigpe1xuICAgICAgICBmb3IodmFyIHRoYXQgPSB0aGlzLCBkYXRhID0gdGhhdFtPMV0sIGVudHJ5ID0gdGhhdFtGSVJTVF07IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKGVudHJ5LnApZW50cnkucCA9IGVudHJ5LnAubiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBkZWxldGUgZGF0YVtlbnRyeS5pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGF0W0ZJUlNUXSA9IHRoYXRbTEFTVF0gPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoYXRbU0laRV0gPSAwO1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjEuMy4zIE1hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcbiAgICAgIC8vIDIzLjIuMy40IFNldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIHZhciB0aGF0ICA9IHRoaXNcbiAgICAgICAgICAsIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KTtcbiAgICAgICAgaWYoZW50cnkpe1xuICAgICAgICAgIHZhciBuZXh0ID0gZW50cnkublxuICAgICAgICAgICAgLCBwcmV2ID0gZW50cnkucDtcbiAgICAgICAgICBkZWxldGUgdGhhdFtPMV1bZW50cnkuaV07XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYocHJldilwcmV2Lm4gPSBuZXh0O1xuICAgICAgICAgIGlmKG5leHQpbmV4dC5wID0gcHJldjtcbiAgICAgICAgICBpZih0aGF0W0ZJUlNUXSA9PSBlbnRyeSl0aGF0W0ZJUlNUXSA9IG5leHQ7XG4gICAgICAgICAgaWYodGhhdFtMQVNUXSA9PSBlbnRyeSl0aGF0W0xBU1RdID0gcHJldjtcbiAgICAgICAgICB0aGF0W1NJWkVdLS07XG4gICAgICAgIH0gcmV0dXJuICEhZW50cnk7XG4gICAgICB9LFxuICAgICAgLy8gMjMuMi4zLjYgU2V0LnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gICAgICAvLyAyMy4xLjMuNSBNYXAucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIGZvckVhY2g6IGZ1bmN0aW9uIGZvckVhY2goY2FsbGJhY2tmbiAvKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgICAgIHZhciBmID0gY3R4KGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSwgMylcbiAgICAgICAgICAsIGVudHJ5O1xuICAgICAgICB3aGlsZShlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoaXNbRklSU1RdKXtcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjcgTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKCQuREVTQykkLnNldERlc2MoQy5wcm90b3R5cGUsICdzaXplJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gYXNzZXJ0LmRlZih0aGlzW1NJWkVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gQztcbiAgfSxcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcbiAgICB2YXIgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpXG4gICAgICAsIHByZXYsIGluZGV4O1xuICAgIC8vIGNoYW5nZSBleGlzdGluZyBlbnRyeVxuICAgIGlmKGVudHJ5KXtcbiAgICAgIGVudHJ5LnYgPSB2YWx1ZTtcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoYXRbTEFTVF0gPSBlbnRyeSA9IHtcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XG4gICAgICAgIGs6IGtleSwgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBrZXlcbiAgICAgICAgdjogdmFsdWUsICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXG4gICAgICAgIHA6IHByZXYgPSB0aGF0W0xBU1RdLCAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxuICAgICAgICBuOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgLy8gPC0gbmV4dCBlbnRyeVxuICAgICAgICByOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gcmVtb3ZlZFxuICAgICAgfTtcbiAgICAgIGlmKCF0aGF0W0ZJUlNUXSl0aGF0W0ZJUlNUXSA9IGVudHJ5O1xuICAgICAgaWYocHJldilwcmV2Lm4gPSBlbnRyeTtcbiAgICAgIHRoYXRbU0laRV0rKztcbiAgICAgIC8vIGFkZCB0byBpbmRleFxuICAgICAgaWYoaW5kZXggIT0gJ0YnKXRoYXRbTzFdW2luZGV4XSA9IGVudHJ5O1xuICAgIH0gcmV0dXJuIHRoYXQ7XG4gIH0sXG4gIGdldEVudHJ5OiBnZXRFbnRyeSxcbiAgLy8gYWRkIC5rZXlzLCAudmFsdWVzLCAuZW50cmllcywgW0BAaXRlcmF0b3JdXG4gIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcbiAgc2V0SXRlcjogZnVuY3Rpb24oQywgTkFNRSwgSVNfTUFQKXtcbiAgICByZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShDLCBOQU1FLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gICAgICBzZXQodGhpcywgSVRFUiwge286IGl0ZXJhdGVkLCBrOiBraW5kfSk7XG4gICAgfSwgZnVuY3Rpb24oKXtcbiAgICAgIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cbiAgICAgICAgLCBraW5kICA9IGl0ZXIua1xuICAgICAgICAsIGVudHJ5ID0gaXRlci5sO1xuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcbiAgICAgIC8vIGdldCBuZXh0IGVudHJ5XG4gICAgICBpZighaXRlci5vIHx8ICEoaXRlci5sID0gZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiBpdGVyLm9bRklSU1RdKSl7XG4gICAgICAgIC8vIG9yIGZpbmlzaCB0aGUgaXRlcmF0aW9uXG4gICAgICAgIGl0ZXIubyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHN0ZXAoMSk7XG4gICAgICB9XG4gICAgICAvLyByZXR1cm4gc3RlcCBieSBraW5kXG4gICAgICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGVudHJ5LmspO1xuICAgICAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBlbnRyeS52KTtcbiAgICAgIHJldHVybiBzdGVwKDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7XG4gICAgfSwgSVNfTUFQID8gJ2VudHJpZXMnIDogJ3ZhbHVlcycgLCAhSVNfTUFQLCB0cnVlKTtcbiAgfVxufTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBmb3JPZiA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTkFNRSl7XG4gICRkZWYoJGRlZi5QLCBOQU1FLCB7XG4gICAgdG9KU09OOiBmdW5jdGlvbiB0b0pTT04oKXtcbiAgICAgIHZhciBhcnIgPSBbXTtcbiAgICAgIGZvck9mKHRoaXMsIGZhbHNlLCBhcnIucHVzaCwgYXJyKTtcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuICB9KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgc2FmZSAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmVcbiAgLCBhc3NlcnQgICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcbiAgLCBmb3JPZiAgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcbiAgLCBfaGFzICAgICAgPSAkLmhhc1xuICAsIGlzT2JqZWN0ICA9ICQuaXNPYmplY3RcbiAgLCBoaWRlICAgICAgPSAkLmhpZGVcbiAgLCBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGlzT2JqZWN0XG4gICwgaWQgICAgICAgID0gMFxuICAsIElEICAgICAgICA9IHNhZmUoJ2lkJylcbiAgLCBXRUFLICAgICAgPSBzYWZlKCd3ZWFrJylcbiAgLCBMRUFLICAgICAgPSBzYWZlKCdsZWFrJylcbiAgLCBtZXRob2QgICAgPSByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpXG4gICwgZmluZCAgICAgID0gbWV0aG9kKDUpXG4gICwgZmluZEluZGV4ID0gbWV0aG9kKDYpO1xuZnVuY3Rpb24gZmluZEZyb3plbihzdG9yZSwga2V5KXtcbiAgcmV0dXJuIGZpbmQoc3RvcmUuYXJyYXksIGZ1bmN0aW9uKGl0KXtcbiAgICByZXR1cm4gaXRbMF0gPT09IGtleTtcbiAgfSk7XG59XG4vLyBmYWxsYmFjayBmb3IgZnJvemVuIGtleXNcbmZ1bmN0aW9uIGxlYWtTdG9yZSh0aGF0KXtcbiAgcmV0dXJuIHRoYXRbTEVBS10gfHwgaGlkZSh0aGF0LCBMRUFLLCB7XG4gICAgYXJyYXk6IFtdLFxuICAgIGdldDogZnVuY3Rpb24oa2V5KXtcbiAgICAgIHZhciBlbnRyeSA9IGZpbmRGcm96ZW4odGhpcywga2V5KTtcbiAgICAgIGlmKGVudHJ5KXJldHVybiBlbnRyeVsxXTtcbiAgICB9LFxuICAgIGhhczogZnVuY3Rpb24oa2V5KXtcbiAgICAgIHJldHVybiAhIWZpbmRGcm96ZW4odGhpcywga2V5KTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgICB2YXIgZW50cnkgPSBmaW5kRnJvemVuKHRoaXMsIGtleSk7XG4gICAgICBpZihlbnRyeSllbnRyeVsxXSA9IHZhbHVlO1xuICAgICAgZWxzZSB0aGlzLmFycmF5LnB1c2goW2tleSwgdmFsdWVdKTtcbiAgICB9LFxuICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgdmFyIGluZGV4ID0gZmluZEluZGV4KHRoaXMuYXJyYXksIGZ1bmN0aW9uKGl0KXtcbiAgICAgICAgcmV0dXJuIGl0WzBdID09PSBrZXk7XG4gICAgICB9KTtcbiAgICAgIGlmKH5pbmRleCl0aGlzLmFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICByZXR1cm4gISF+aW5kZXg7XG4gICAgfVxuICB9KVtMRUFLXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldENvbnN0cnVjdG9yOiBmdW5jdGlvbihOQU1FLCBJU19NQVAsIEFEREVSKXtcbiAgICBmdW5jdGlvbiBDKCl7XG4gICAgICAkLnNldChhc3NlcnQuaW5zdCh0aGlzLCBDLCBOQU1FKSwgSUQsIGlkKyspO1xuICAgICAgdmFyIGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoaXNbQURERVJdLCB0aGlzKTtcbiAgICB9XG4gICAgcmVxdWlyZSgnLi8kLm1peCcpKEMucHJvdG90eXBlLCB7XG4gICAgICAvLyAyMy4zLjMuMiBXZWFrTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxuICAgICAgLy8gMjMuNC4zLjMgV2Vha1NldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcbiAgICAgICAgaWYoIWlzRXh0ZW5zaWJsZShrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcylbJ2RlbGV0ZSddKGtleSk7XG4gICAgICAgIHJldHVybiBfaGFzKGtleSwgV0VBSykgJiYgX2hhcyhrZXlbV0VBS10sIHRoaXNbSURdKSAmJiBkZWxldGUga2V5W1dFQUtdW3RoaXNbSURdXTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4zLjMuNCBXZWFrTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgICAgLy8gMjMuNC4zLjQgV2Vha1NldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxuICAgICAgaGFzOiBmdW5jdGlvbiBoYXMoa2V5KXtcbiAgICAgICAgaWYoIWlzT2JqZWN0KGtleSkpcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZighaXNFeHRlbnNpYmxlKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKS5oYXMoa2V5KTtcbiAgICAgICAgcmV0dXJuIF9oYXMoa2V5LCBXRUFLKSAmJiBfaGFzKGtleVtXRUFLXSwgdGhpc1tJRF0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBDO1xuICB9LFxuICBkZWY6IGZ1bmN0aW9uKHRoYXQsIGtleSwgdmFsdWUpe1xuICAgIGlmKCFpc0V4dGVuc2libGUoYXNzZXJ0Lm9iaihrZXkpKSl7XG4gICAgICBsZWFrU3RvcmUodGhhdCkuc2V0KGtleSwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBfaGFzKGtleSwgV0VBSykgfHwgaGlkZShrZXksIFdFQUssIHt9KTtcbiAgICAgIGtleVtXRUFLXVt0aGF0W0lEXV0gPSB2YWx1ZTtcbiAgICB9IHJldHVybiB0aGF0O1xuICB9LFxuICBsZWFrU3RvcmU6IGxlYWtTdG9yZSxcbiAgV0VBSzogV0VBSyxcbiAgSUQ6IElEXG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBCVUdHWSA9IHJlcXVpcmUoJy4vJC5pdGVyJykuQlVHR1lcbiAgLCBmb3JPZiA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHNwZWNpZXMgPSByZXF1aXJlKCcuLyQuc3BlY2llcycpXG4gICwgYXNzZXJ0SW5zdGFuY2UgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JykuaW5zdDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOQU1FLCBtZXRob2RzLCBjb21tb24sIElTX01BUCwgSVNfV0VBSyl7XG4gIHZhciBCYXNlICA9ICQuZ1tOQU1FXVxuICAgICwgQyAgICAgPSBCYXNlXG4gICAgLCBBRERFUiA9IElTX01BUCA/ICdzZXQnIDogJ2FkZCdcbiAgICAsIHByb3RvID0gQyAmJiBDLnByb3RvdHlwZVxuICAgICwgTyAgICAgPSB7fTtcbiAgZnVuY3Rpb24gZml4TWV0aG9kKEtFWSwgQ0hBSU4pe1xuICAgIGlmKCQuRlcpe1xuICAgICAgdmFyIG1ldGhvZCA9IHByb3RvW0tFWV07XG4gICAgICByZXF1aXJlKCcuLyQucmVkZWYnKShwcm90bywgS0VZLCBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG1ldGhvZC5jYWxsKHRoaXMsIGEgPT09IDAgPyAwIDogYSwgYik7XG4gICAgICAgIHJldHVybiBDSEFJTiA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgaWYoISQuaXNGdW5jdGlvbihDKSB8fCAhKElTX1dFQUsgfHwgIUJVR0dZICYmIHByb3RvLmZvckVhY2ggJiYgcHJvdG8uZW50cmllcykpe1xuICAgIC8vIGNyZWF0ZSBjb2xsZWN0aW9uIGNvbnN0cnVjdG9yXG4gICAgQyA9IGNvbW1vbi5nZXRDb25zdHJ1Y3RvcihOQU1FLCBJU19NQVAsIEFEREVSKTtcbiAgICByZXF1aXJlKCcuLyQubWl4JykoQy5wcm90b3R5cGUsIG1ldGhvZHMpO1xuICB9IGVsc2Uge1xuICAgIHZhciBpbnN0ICA9IG5ldyBDXG4gICAgICAsIGNoYWluID0gaW5zdFtBRERFUl0oSVNfV0VBSyA/IHt9IDogLTAsIDEpXG4gICAgICAsIGJ1Z2d5WmVybztcbiAgICAvLyB3cmFwIGZvciBpbml0IGNvbGxlY3Rpb25zIGZyb20gaXRlcmFibGVcbiAgICBpZighcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7IG5ldyBDKGl0ZXIpOyB9KSl7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3XG4gICAgICBDID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYXNzZXJ0SW5zdGFuY2UodGhpcywgQywgTkFNRSk7XG4gICAgICAgIHZhciB0aGF0ICAgICA9IG5ldyBCYXNlXG4gICAgICAgICAgLCBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcbiAgICAgICAgcmV0dXJuIHRoYXQ7XG4gICAgICB9O1xuICAgICAgQy5wcm90b3R5cGUgPSBwcm90bztcbiAgICAgIGlmKCQuRlcpcHJvdG8uY29uc3RydWN0b3IgPSBDO1xuICAgIH1cbiAgICBJU19XRUFLIHx8IGluc3QuZm9yRWFjaChmdW5jdGlvbih2YWwsIGtleSl7XG4gICAgICBidWdneVplcm8gPSAxIC8ga2V5ID09PSAtSW5maW5pdHk7XG4gICAgfSk7XG4gICAgLy8gZml4IGNvbnZlcnRpbmcgLTAga2V5IHRvICswXG4gICAgaWYoYnVnZ3laZXJvKXtcbiAgICAgIGZpeE1ldGhvZCgnZGVsZXRlJyk7XG4gICAgICBmaXhNZXRob2QoJ2hhcycpO1xuICAgICAgSVNfTUFQICYmIGZpeE1ldGhvZCgnZ2V0Jyk7XG4gICAgfVxuICAgIC8vICsgZml4IC5hZGQgJiAuc2V0IGZvciBjaGFpbmluZ1xuICAgIGlmKGJ1Z2d5WmVybyB8fCBjaGFpbiAhPT0gaW5zdClmaXhNZXRob2QoQURERVIsIHRydWUpO1xuICB9XG5cbiAgcmVxdWlyZSgnLi8kLmNvZicpLnNldChDLCBOQU1FKTtcblxuICBPW05BTUVdID0gQztcbiAgJGRlZigkZGVmLkcgKyAkZGVmLlcgKyAkZGVmLkYgKiAoQyAhPSBCYXNlKSwgTyk7XG4gIHNwZWNpZXMoQyk7XG4gIHNwZWNpZXMoJC5jb3JlW05BTUVdKTsgLy8gZm9yIHdyYXBwZXJcblxuICBpZighSVNfV0VBSyljb21tb24uc2V0SXRlcihDLCBOQU1FLCBJU19NQVApO1xuXG4gIHJldHVybiBDO1xufTsiLCIvLyBPcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhc3NlcnRGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5mbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFzc2VydEZ1bmN0aW9uKGZuKTtcbiAgaWYofmxlbmd0aCAmJiB0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xuICBzd2l0Y2gobGVuZ3RoKXtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfSByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgICB9O1xufTsiLCJ2YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZ2xvYmFsICAgICA9ICQuZ1xuICAsIGNvcmUgICAgICAgPSAkLmNvcmVcbiAgLCBpc0Z1bmN0aW9uID0gJC5pc0Z1bmN0aW9uXG4gICwgJHJlZGVmICAgICA9IHJlcXVpcmUoJy4vJC5yZWRlZicpO1xuZnVuY3Rpb24gY3R4KGZuLCB0aGF0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5nbG9iYWwuY29yZSA9IGNvcmU7XG4vLyB0eXBlIGJpdG1hcFxuJGRlZi5GID0gMTsgIC8vIGZvcmNlZFxuJGRlZi5HID0gMjsgIC8vIGdsb2JhbFxuJGRlZi5TID0gNDsgIC8vIHN0YXRpY1xuJGRlZi5QID0gODsgIC8vIHByb3RvXG4kZGVmLkIgPSAxNjsgLy8gYmluZFxuJGRlZi5XID0gMzI7IC8vIHdyYXBcbmZ1bmN0aW9uICRkZWYodHlwZSwgbmFtZSwgc291cmNlKXtcbiAgdmFyIGtleSwgb3duLCBvdXQsIGV4cFxuICAgICwgaXNHbG9iYWwgPSB0eXBlICYgJGRlZi5HXG4gICAgLCBpc1Byb3RvICA9IHR5cGUgJiAkZGVmLlBcbiAgICAsIHRhcmdldCAgID0gaXNHbG9iYWwgPyBnbG9iYWwgOiB0eXBlICYgJGRlZi5TXG4gICAgICAgID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCB7fSkucHJvdG90eXBlXG4gICAgLCBleHBvcnRzICA9IGlzR2xvYmFsID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XG4gIGlmKGlzR2xvYmFsKXNvdXJjZSA9IG5hbWU7XG4gIGZvcihrZXkgaW4gc291cmNlKXtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhKHR5cGUgJiAkZGVmLkYpICYmIHRhcmdldCAmJiBrZXkgaW4gdGFyZ2V0O1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIGlmKHR5cGUgJiAkZGVmLkIgJiYgb3duKWV4cCA9IGN0eChvdXQsIGdsb2JhbCk7XG4gICAgZWxzZSBleHAgPSBpc1Byb3RvICYmIGlzRnVuY3Rpb24ob3V0KSA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICBpZih0YXJnZXQgJiYgIW93bikkcmVkZWYodGFyZ2V0LCBrZXksIG91dCk7XG4gICAgLy8gZXhwb3J0XG4gICAgaWYoZXhwb3J0c1trZXldICE9IG91dCkkLmhpZGUoZXhwb3J0cywga2V5LCBleHApO1xuICAgIGlmKGlzUHJvdG8pKGV4cG9ydHMucHJvdG90eXBlIHx8IChleHBvcnRzLnByb3RvdHlwZSA9IHt9KSlba2V5XSA9IG91dDtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSAkZGVmOyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZG9jdW1lbnQgPSAkLmcuZG9jdW1lbnRcbiAgLCBpc09iamVjdCA9ICQuaXNPYmplY3RcbiAgLy8gaW4gb2xkIElFIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50IGlzICdvYmplY3QnXG4gICwgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIga2V5cyAgICAgICA9ICQuZ2V0S2V5cyhpdClcbiAgICAsIGdldERlc2MgICAgPSAkLmdldERlc2NcbiAgICAsIGdldFN5bWJvbHMgPSAkLmdldFN5bWJvbHM7XG4gIGlmKGdldFN5bWJvbHMpJC5lYWNoLmNhbGwoZ2V0U3ltYm9scyhpdCksIGZ1bmN0aW9uKGtleSl7XG4gICAgaWYoZ2V0RGVzYyhpdCwga2V5KS5lbnVtZXJhYmxlKWtleXMucHVzaChrZXkpO1xuICB9KTtcbiAgcmV0dXJuIGtleXM7XG59OyIsInZhciBjdHggID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgZ2V0ICA9IHJlcXVpcmUoJy4vJC5pdGVyJykuZ2V0XG4gICwgY2FsbCA9IHJlcXVpcmUoJy4vJC5pdGVyLWNhbGwnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0KXtcbiAgdmFyIGl0ZXJhdG9yID0gZ2V0KGl0ZXJhYmxlKVxuICAgICwgZiAgICAgICAgPSBjdHgoZm4sIHRoYXQsIGVudHJpZXMgPyAyIDogMSlcbiAgICAsIHN0ZXA7XG4gIHdoaWxlKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSl7XG4gICAgaWYoY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcykgPT09IGZhbHNlKXtcbiAgICAgIHJldHVybiBjYWxsLmNsb3NlKGl0ZXJhdG9yKTtcbiAgICB9XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkKXtcbiAgJC5GVyAgID0gdHJ1ZTtcbiAgJC5wYXRoID0gJC5nO1xuICByZXR1cm4gJDtcbn07IiwiLy8gRmFzdCBhcHBseVxuLy8gaHR0cDovL2pzcGVyZi5sbmtpdC5jb20vZmFzdC1hcHBseS81XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCBhcmdzLCB0aGF0KXtcbiAgdmFyIHVuID0gdGhhdCA9PT0gdW5kZWZpbmVkO1xuICBzd2l0Y2goYXJncy5sZW5ndGgpe1xuICAgIGNhc2UgMDogcmV0dXJuIHVuID8gZm4oKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0KTtcbiAgICBjYXNlIDE6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgY2FzZSAzOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgICBjYXNlIDQ6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10pO1xuICAgIGNhc2UgNTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSwgYXJnc1s0XSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSwgYXJnc1s0XSk7XG4gIH0gcmV0dXJuICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzKTtcbn07IiwidmFyIGFzc2VydE9iamVjdCA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5vYmo7XG5mdW5jdGlvbiBjbG9zZShpdGVyYXRvcil7XG4gIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XG4gIGlmKHJldCAhPT0gdW5kZWZpbmVkKWFzc2VydE9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xufVxuZnVuY3Rpb24gY2FsbChpdGVyYXRvciwgZm4sIHZhbHVlLCBlbnRyaWVzKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW50cmllcyA/IGZuKGFzc2VydE9iamVjdCh2YWx1ZSlbMF0sIHZhbHVlWzFdKSA6IGZuKHZhbHVlKTtcbiAgfSBjYXRjaChlKXtcbiAgICBjbG9zZShpdGVyYXRvcik7XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuY2FsbC5jbG9zZSA9IGNsb3NlO1xubW9kdWxlLmV4cG9ydHMgPSBjYWxsOyIsInZhciAkZGVmICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkcmVkZWYgICAgICAgICAgPSByZXF1aXJlKCcuLyQucmVkZWYnKVxuICAsICQgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY29mICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGl0ZXIgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXInKVxuICAsIFNZTUJPTF9JVEVSQVRPUiA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEZGX0lURVJBVE9SICAgICA9ICdAQGl0ZXJhdG9yJ1xuICAsIEtFWVMgICAgICAgICAgICA9ICdrZXlzJ1xuICAsIFZBTFVFUyAgICAgICAgICA9ICd2YWx1ZXMnXG4gICwgSXRlcmF0b3JzICAgICAgID0gJGl0ZXIuSXRlcmF0b3JzO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihCYXNlLCBOQU1FLCBDb25zdHJ1Y3RvciwgbmV4dCwgREVGQVVMVCwgSVNfU0VULCBGT1JDRSl7XG4gICRpdGVyLmNyZWF0ZShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG4gIGZ1bmN0aW9uIGNyZWF0ZU1ldGhvZChraW5kKXtcbiAgICBmdW5jdGlvbiAkJCh0aGF0KXtcbiAgICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhhdCwga2luZCk7XG4gICAgfVxuICAgIHN3aXRjaChraW5kKXtcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKXsgcmV0dXJuICQkKHRoaXMpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuICQkKHRoaXMpOyB9O1xuICAgIH0gcmV0dXJuIGZ1bmN0aW9uIGVudHJpZXMoKXsgcmV0dXJuICQkKHRoaXMpOyB9O1xuICB9XG4gIHZhciBUQUcgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xuICAgICwgcHJvdG8gICAgPSBCYXNlLnByb3RvdHlwZVxuICAgICwgX25hdGl2ZSAgPSBwcm90b1tTWU1CT0xfSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdXG4gICAgLCBfZGVmYXVsdCA9IF9uYXRpdmUgfHwgY3JlYXRlTWV0aG9kKERFRkFVTFQpXG4gICAgLCBtZXRob2RzLCBrZXk7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYoX25hdGl2ZSl7XG4gICAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0gJC5nZXRQcm90byhfZGVmYXVsdC5jYWxsKG5ldyBCYXNlKSk7XG4gICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgIGNvZi5zZXQoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XG4gICAgLy8gRkYgZml4XG4gICAgaWYoJC5GVyAmJiAkLmhhcyhwcm90bywgRkZfSVRFUkFUT1IpKSRpdGVyLnNldChJdGVyYXRvclByb3RvdHlwZSwgJC50aGF0KTtcbiAgfVxuICAvLyBEZWZpbmUgaXRlcmF0b3JcbiAgaWYoJC5GVykkaXRlci5zZXQocHJvdG8sIF9kZWZhdWx0KTtcbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxuICBJdGVyYXRvcnNbTkFNRV0gPSBfZGVmYXVsdDtcbiAgSXRlcmF0b3JzW1RBR10gID0gJC50aGF0O1xuICBpZihERUZBVUxUKXtcbiAgICBtZXRob2RzID0ge1xuICAgICAga2V5czogICAgSVNfU0VUICAgICAgICAgICAgPyBfZGVmYXVsdCA6IGNyZWF0ZU1ldGhvZChLRVlTKSxcbiAgICAgIHZhbHVlczogIERFRkFVTFQgPT0gVkFMVUVTID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoVkFMVUVTKSxcbiAgICAgIGVudHJpZXM6IERFRkFVTFQgIT0gVkFMVUVTID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoJ2VudHJpZXMnKVxuICAgIH07XG4gICAgaWYoRk9SQ0UpZm9yKGtleSBpbiBtZXRob2RzKXtcbiAgICAgIGlmKCEoa2V5IGluIHByb3RvKSkkcmVkZWYocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAkaXRlci5CVUdHWSwgTkFNRSwgbWV0aG9kcyk7XG4gIH1cbn07IiwidmFyIFNZTUJPTF9JVEVSQVRPUiA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIFNBRkVfQ0xPU0lORyAgICA9IGZhbHNlO1xudHJ5IHtcbiAgdmFyIHJpdGVyID0gWzddW1NZTUJPTF9JVEVSQVRPUl0oKTtcbiAgcml0ZXJbJ3JldHVybiddID0gZnVuY3Rpb24oKXsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24oKXsgdGhyb3cgMjsgfSk7XG59IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMpe1xuICBpZighU0FGRV9DTE9TSU5HKXJldHVybiBmYWxzZTtcbiAgdmFyIHNhZmUgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgYXJyICA9IFs3XVxuICAgICAgLCBpdGVyID0gYXJyW1NZTUJPTF9JVEVSQVRPUl0oKTtcbiAgICBpdGVyLm5leHQgPSBmdW5jdGlvbigpeyBzYWZlID0gdHJ1ZTsgfTtcbiAgICBhcnJbU1lNQk9MX0lURVJBVE9SXSA9IGZ1bmN0aW9uKCl7IHJldHVybiBpdGVyOyB9O1xuICAgIGV4ZWMoYXJyKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjb2YgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsIGFzc2VydE9iamVjdCAgICAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9ialxuICAsIFNZTUJPTF9JVEVSQVRPUiAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgRkZfSVRFUkFUT1IgICAgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBJdGVyYXRvcnMgICAgICAgICA9IHt9XG4gICwgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXG5zZXRJdGVyYXRvcihJdGVyYXRvclByb3RvdHlwZSwgJC50aGF0KTtcbmZ1bmN0aW9uIHNldEl0ZXJhdG9yKE8sIHZhbHVlKXtcbiAgJC5oaWRlKE8sIFNZTUJPTF9JVEVSQVRPUiwgdmFsdWUpO1xuICAvLyBBZGQgaXRlcmF0b3IgZm9yIEZGIGl0ZXJhdG9yIHByb3RvY29sXG4gIGlmKEZGX0lURVJBVE9SIGluIFtdKSQuaGlkZShPLCBGRl9JVEVSQVRPUiwgdmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxuICBCVUdHWTogJ2tleXMnIGluIFtdICYmICEoJ25leHQnIGluIFtdLmtleXMoKSksXG4gIEl0ZXJhdG9yczogSXRlcmF0b3JzLFxuICBzdGVwOiBmdW5jdGlvbihkb25lLCB2YWx1ZSl7XG4gICAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG4gIH0sXG4gIGlzOiBmdW5jdGlvbihpdCl7XG4gICAgdmFyIE8gICAgICA9IE9iamVjdChpdClcbiAgICAgICwgU3ltYm9sID0gJC5nLlN5bWJvbFxuICAgICAgLCBTWU0gICAgPSBTeW1ib2wgJiYgU3ltYm9sLml0ZXJhdG9yIHx8IEZGX0lURVJBVE9SO1xuICAgIHJldHVybiBTWU0gaW4gTyB8fCBTWU1CT0xfSVRFUkFUT1IgaW4gTyB8fCAkLmhhcyhJdGVyYXRvcnMsIGNvZi5jbGFzc29mKE8pKTtcbiAgfSxcbiAgZ2V0OiBmdW5jdGlvbihpdCl7XG4gICAgdmFyIFN5bWJvbCAgPSAkLmcuU3ltYm9sXG4gICAgICAsIGV4dCAgICAgPSBpdFtTeW1ib2wgJiYgU3ltYm9sLml0ZXJhdG9yIHx8IEZGX0lURVJBVE9SXVxuICAgICAgLCBnZXRJdGVyID0gZXh0IHx8IGl0W1NZTUJPTF9JVEVSQVRPUl0gfHwgSXRlcmF0b3JzW2NvZi5jbGFzc29mKGl0KV07XG4gICAgcmV0dXJuIGFzc2VydE9iamVjdChnZXRJdGVyLmNhbGwoaXQpKTtcbiAgfSxcbiAgc2V0OiBzZXRJdGVyYXRvcixcbiAgY3JlYXRlOiBmdW5jdGlvbihDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCwgcHJvdG8pe1xuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9ICQuY3JlYXRlKHByb3RvIHx8IEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogJC5kZXNjKDEsIG5leHQpfSk7XG4gICAgY29mLnNldChDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbiAgfVxufTsiLCIndXNlIHN0cmljdCc7XG52YXIgZ2xvYmFsID0gdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKVxuICAsIGNvcmUgICA9IHt9XG4gICwgZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHlcbiAgLCBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5XG4gICwgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3JcbiAgLCBtYXggICA9IE1hdGgubWF4XG4gICwgbWluICAgPSBNYXRoLm1pbjtcbi8vIFRoZSBlbmdpbmUgd29ya3MgZmluZSB3aXRoIGRlc2NyaXB0b3JzPyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5LlxudmFyIERFU0MgPSAhIWZ1bmN0aW9uKCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiAyOyB9fSkuYSA9PSAyO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG59KCk7XG52YXIgaGlkZSA9IGNyZWF0ZURlZmluZXIoMSk7XG4vLyA3LjEuNCBUb0ludGVnZXJcbmZ1bmN0aW9uIHRvSW50ZWdlcihpdCl7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufVxuZnVuY3Rpb24gZGVzYyhiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59XG5mdW5jdGlvbiBzaW1wbGVTZXQob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZURlZmluZXIoYml0bWFwKXtcbiAgcmV0dXJuIERFU0MgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICAgIHJldHVybiAkLnNldERlc2Mob2JqZWN0LCBrZXksIGRlc2MoYml0bWFwLCB2YWx1ZSkpO1xuICB9IDogc2ltcGxlU2V0O1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChpdCl7XG4gIHJldHVybiBpdCAhPT0gbnVsbCAmJiAodHlwZW9mIGl0ID09ICdvYmplY3QnIHx8IHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nKTtcbn1cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdmdW5jdGlvbic7XG59XG5mdW5jdGlvbiBhc3NlcnREZWZpbmVkKGl0KXtcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufVxuXG52YXIgJCA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmZ3Jykoe1xuICBnOiBnbG9iYWwsXG4gIGNvcmU6IGNvcmUsXG4gIGh0bWw6IGdsb2JhbC5kb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gIC8vIGh0dHA6Ly9qc3BlcmYuY29tL2NvcmUtanMtaXNvYmplY3RcbiAgaXNPYmplY3Q6ICAgaXNPYmplY3QsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGl0OiBmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIGl0O1xuICB9LFxuICB0aGF0OiBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICAvLyA3LjEuNCBUb0ludGVnZXJcbiAgdG9JbnRlZ2VyOiB0b0ludGVnZXIsXG4gIC8vIDcuMS4xNSBUb0xlbmd0aFxuICB0b0xlbmd0aDogZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG4gIH0sXG4gIHRvSW5kZXg6IGZ1bmN0aW9uKGluZGV4LCBsZW5ndGgpe1xuICAgIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcbiAgfSxcbiAgaGFzOiBmdW5jdGlvbihpdCwga2V5KXtcbiAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbiAgfSxcbiAgY3JlYXRlOiAgICAgT2JqZWN0LmNyZWF0ZSxcbiAgZ2V0UHJvdG86ICAgT2JqZWN0LmdldFByb3RvdHlwZU9mLFxuICBERVNDOiAgICAgICBERVNDLFxuICBkZXNjOiAgICAgICBkZXNjLFxuICBnZXREZXNjOiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICBzZXREZXNjOiAgICBkZWZpbmVQcm9wZXJ0eSxcbiAgc2V0RGVzY3M6ICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMsXG4gIGdldEtleXM6ICAgIE9iamVjdC5rZXlzLFxuICBnZXROYW1lczogICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgZ2V0U3ltYm9sczogT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyxcbiAgYXNzZXJ0RGVmaW5lZDogYXNzZXJ0RGVmaW5lZCxcbiAgLy8gRHVtbXksIGZpeCBmb3Igbm90IGFycmF5LWxpa2UgRVMzIHN0cmluZyBpbiBlczUgbW9kdWxlXG4gIEVTNU9iamVjdDogT2JqZWN0LFxuICB0b09iamVjdDogZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiAkLkVTNU9iamVjdChhc3NlcnREZWZpbmVkKGl0KSk7XG4gIH0sXG4gIGhpZGU6IGhpZGUsXG4gIGRlZjogY3JlYXRlRGVmaW5lcigwKSxcbiAgc2V0OiBnbG9iYWwuU3ltYm9sID8gc2ltcGxlU2V0IDogaGlkZSxcbiAgZWFjaDogW10uZm9yRWFjaFxufSk7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuaWYodHlwZW9mIF9fZSAhPSAndW5kZWZpbmVkJylfX2UgPSBjb3JlO1xuaWYodHlwZW9mIF9fZyAhPSAndW5kZWZpbmVkJylfX2cgPSBnbG9iYWw7IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBlbCl7XG4gIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KG9iamVjdClcbiAgICAsIGtleXMgICA9ICQuZ2V0S2V5cyhPKVxuICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAsIGluZGV4ICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobGVuZ3RoID4gaW5kZXgpaWYoT1trZXkgPSBrZXlzW2luZGV4KytdXSA9PT0gZWwpcmV0dXJuIGtleTtcbn07IiwidmFyICRyZWRlZiA9IHJlcXVpcmUoJy4vJC5yZWRlZicpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgc3JjKXtcclxuICBmb3IodmFyIGtleSBpbiBzcmMpJHJlZGVmKHRhcmdldCwga2V5LCBzcmNba2V5XSk7XHJcbiAgcmV0dXJuIHRhcmdldDtcclxufTsiLCJ2YXIgJCAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBhc3NlcnRPYmplY3QgPSByZXF1aXJlKCcuLyQuYXNzZXJ0Jykub2JqO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvd25LZXlzKGl0KXtcbiAgYXNzZXJ0T2JqZWN0KGl0KTtcbiAgdmFyIGtleXMgICAgICAgPSAkLmdldE5hbWVzKGl0KVxuICAgICwgZ2V0U3ltYm9scyA9ICQuZ2V0U3ltYm9scztcbiAgcmV0dXJuIGdldFN5bWJvbHMgPyBrZXlzLmNvbmNhdChnZXRTeW1ib2xzKGl0KSkgOiBrZXlzO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBpbnZva2UgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcbiAgLCBhc3NlcnRGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5mbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oLyogLi4ucGFyZ3MgKi8pe1xuICB2YXIgZm4gICAgID0gYXNzZXJ0RnVuY3Rpb24odGhpcylcbiAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIHBhcmdzICA9IEFycmF5KGxlbmd0aClcbiAgICAsIGkgICAgICA9IDBcbiAgICAsIF8gICAgICA9ICQucGF0aC5fXG4gICAgLCBob2xkZXIgPSBmYWxzZTtcbiAgd2hpbGUobGVuZ3RoID4gaSlpZigocGFyZ3NbaV0gPSBhcmd1bWVudHNbaSsrXSkgPT09IF8paG9sZGVyID0gdHJ1ZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgIHZhciB0aGF0ICAgID0gdGhpc1xuICAgICAgLCBfbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgLCBqID0gMCwgayA9IDAsIGFyZ3M7XG4gICAgaWYoIWhvbGRlciAmJiAhX2xlbmd0aClyZXR1cm4gaW52b2tlKGZuLCBwYXJncywgdGhhdCk7XG4gICAgYXJncyA9IHBhcmdzLnNsaWNlKCk7XG4gICAgaWYoaG9sZGVyKWZvcig7bGVuZ3RoID4gajsgaisrKWlmKGFyZ3Nbal0gPT09IF8pYXJnc1tqXSA9IGFyZ3VtZW50c1trKytdO1xuICAgIHdoaWxlKF9sZW5ndGggPiBrKWFyZ3MucHVzaChhcmd1bWVudHNbaysrXSk7XG4gICAgcmV0dXJuIGludm9rZShmbiwgYXJncywgdGhhdCk7XG4gIH07XG59OyIsInZhciAkICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgdHBsID0gU3RyaW5nKHt9Lmhhc093blByb3BlcnR5KVxyXG4gICwgU1JDID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ3NyYycpXHJcbiAgLCBfdG9TdHJpbmcgPSBGdW5jdGlvbi50b1N0cmluZztcclxuXHJcbmZ1bmN0aW9uICRyZWRlZihPLCBrZXksIHZhbCwgc2FmZSl7XHJcbiAgaWYoJC5pc0Z1bmN0aW9uKHZhbCkpe1xyXG4gICAgdmFyIGJhc2UgPSBPW2tleV07XHJcbiAgICAkLmhpZGUodmFsLCBTUkMsIGJhc2UgPyBTdHJpbmcoYmFzZSkgOiB0cGwucmVwbGFjZSgvaGFzT3duUHJvcGVydHkvLCBTdHJpbmcoa2V5KSkpO1xyXG4gIH1cclxuICBpZihPID09PSAkLmcpe1xyXG4gICAgT1trZXldID0gdmFsO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBpZighc2FmZSlkZWxldGUgT1trZXldO1xyXG4gICAgJC5oaWRlKE8sIGtleSwgdmFsKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzXHJcbi8vIHdpdGggbWV0aG9kcyBzaW1pbGFyIHRvIExvRGFzaCBpc05hdGl2ZVxyXG4kcmVkZWYoRnVuY3Rpb24ucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpe1xyXG4gIHJldHVybiAkLmhhcyh0aGlzLCBTUkMpID8gdGhpc1tTUkNdIDogX3RvU3RyaW5nLmNhbGwodGhpcyk7XHJcbn0pO1xyXG5cclxuJC5jb3JlLmluc3BlY3RTb3VyY2UgPSBmdW5jdGlvbihpdCl7XHJcbiAgcmV0dXJuIF90b1N0cmluZy5jYWxsKGl0KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gJHJlZGVmOyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocmVnRXhwLCByZXBsYWNlLCBpc1N0YXRpYyl7XG4gIHZhciByZXBsYWNlciA9IHJlcGxhY2UgPT09IE9iamVjdChyZXBsYWNlKSA/IGZ1bmN0aW9uKHBhcnQpe1xuICAgIHJldHVybiByZXBsYWNlW3BhcnRdO1xuICB9IDogcmVwbGFjZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGl0KXtcbiAgICByZXR1cm4gU3RyaW5nKGlzU3RhdGljID8gaXQgOiB0aGlzKS5yZXBsYWNlKHJlZ0V4cCwgcmVwbGFjZXIpO1xuICB9O1xufTsiLCIvLyBXb3JrcyB3aXRoIF9fcHJvdG9fXyBvbmx5LiBPbGQgdjggY2FuJ3Qgd29yayB3aXRoIG51bGwgcHJvdG8gb2JqZWN0cy5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBhc3NlcnQgPSByZXF1aXJlKCcuLyQuYXNzZXJ0Jyk7XG5mdW5jdGlvbiBjaGVjayhPLCBwcm90byl7XG4gIGFzc2VydC5vYmooTyk7XG4gIGFzc2VydChwcm90byA9PT0gbnVsbCB8fCAkLmlzT2JqZWN0KHByb3RvKSwgcHJvdG8sIFwiOiBjYW4ndCBzZXQgYXMgcHJvdG90eXBlIVwiKTtcbn1cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCAoJ19fcHJvdG9fXycgaW4ge30gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgID8gZnVuY3Rpb24oYnVnZ3ksIHNldCl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc2V0ID0gcmVxdWlyZSgnLi8kLmN0eCcpKEZ1bmN0aW9uLmNhbGwsICQuZ2V0RGVzYyhPYmplY3QucHJvdG90eXBlLCAnX19wcm90b19fJykuc2V0LCAyKTtcbiAgICAgICAgICBzZXQoe30sIFtdKTtcbiAgICAgICAgfSBjYXRjaChlKXsgYnVnZ3kgPSB0cnVlOyB9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihPLCBwcm90byl7XG4gICAgICAgICAgY2hlY2soTywgcHJvdG8pO1xuICAgICAgICAgIGlmKGJ1Z2d5KU8uX19wcm90b19fID0gcHJvdG87XG4gICAgICAgICAgZWxzZSBzZXQoTywgcHJvdG8pO1xuICAgICAgICAgIHJldHVybiBPO1xuICAgICAgICB9O1xuICAgICAgfSgpXG4gICAgOiB1bmRlZmluZWQpLFxuICBjaGVjazogY2hlY2tcbn07IiwidmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIFNQRUNJRVMgPSByZXF1aXJlKCcuLyQud2tzJykoJ3NwZWNpZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQyl7XG4gIGlmKCQuREVTQyAmJiAhKFNQRUNJRVMgaW4gQykpJC5zZXREZXNjKEMsIFNQRUNJRVMsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiAkLnRoYXRcbiAgfSk7XG59OyIsIi8vIHRydWUgIC0+IFN0cmluZyNhdFxuLy8gZmFsc2UgLT4gU3RyaW5nI2NvZGVQb2ludEF0XG52YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUT19TVFJJTkcpe1xuICByZXR1cm4gZnVuY3Rpb24odGhhdCwgcG9zKXtcbiAgICB2YXIgcyA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhhdCkpXG4gICAgICAsIGkgPSAkLnRvSW50ZWdlcihwb3MpXG4gICAgICAsIGwgPSBzLmxlbmd0aFxuICAgICAgLCBhLCBiO1xuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsXG4gICAgICB8fCAoYiA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhkYzAwIHx8IGIgPiAweGRmZmZcbiAgICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgICAgOiBUT19TVFJJTkcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XG4gIH07XG59OyIsIi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPXN0cmF3bWFuOnN0cmluZ19wYWRkaW5nXG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCByZXBlYXQgPSByZXF1aXJlKCcuLyQuc3RyaW5nLXJlcGVhdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRoYXQsIG1pbkxlbmd0aCwgZmlsbENoYXIsIGxlZnQpe1xuICAvLyAxLiBMZXQgTyBiZSBDaGVja09iamVjdENvZXJjaWJsZSh0aGlzIHZhbHVlKS5cbiAgLy8gMi4gTGV0IFMgYmUgVG9TdHJpbmcoTykuXG4gIHZhciBTID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGF0KSk7XG4gIC8vIDQuIElmIGludE1pbkxlbmd0aCBpcyB1bmRlZmluZWQsIHJldHVybiBTLlxuICBpZihtaW5MZW5ndGggPT09IHVuZGVmaW5lZClyZXR1cm4gUztcbiAgLy8gNC4gTGV0IGludE1pbkxlbmd0aCBiZSBUb0ludGVnZXIobWluTGVuZ3RoKS5cbiAgdmFyIGludE1pbkxlbmd0aCA9ICQudG9JbnRlZ2VyKG1pbkxlbmd0aCk7XG4gIC8vIDUuIExldCBmaWxsTGVuIGJlIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyBpbiBTIG1pbnVzIGludE1pbkxlbmd0aC5cbiAgdmFyIGZpbGxMZW4gPSBpbnRNaW5MZW5ndGggLSBTLmxlbmd0aDtcbiAgLy8gNi4gSWYgZmlsbExlbiA8IDAsIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cbiAgLy8gNy4gSWYgZmlsbExlbiBpcyAr4oieLCB0aGVuIHRocm93IGEgUmFuZ2VFcnJvciBleGNlcHRpb24uXG4gIGlmKGZpbGxMZW4gPCAwIHx8IGZpbGxMZW4gPT09IEluZmluaXR5KXtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQ2Fubm90IHNhdGlzZnkgc3RyaW5nIGxlbmd0aCAnICsgbWluTGVuZ3RoICsgJyBmb3Igc3RyaW5nOiAnICsgUyk7XG4gIH1cbiAgLy8gOC4gTGV0IHNGaWxsU3RyIGJlIHRoZSBzdHJpbmcgcmVwcmVzZW50ZWQgYnkgZmlsbFN0ci5cbiAgLy8gOS4gSWYgc0ZpbGxTdHIgaXMgdW5kZWZpbmVkLCBsZXQgc0ZpbGxTdHIgYmUgYSBzcGFjZSBjaGFyYWN0ZXIuXG4gIHZhciBzRmlsbFN0ciA9IGZpbGxDaGFyID09PSB1bmRlZmluZWQgPyAnICcgOiBTdHJpbmcoZmlsbENoYXIpO1xuICAvLyAxMC4gTGV0IHNGaWxsVmFsIGJlIGEgU3RyaW5nIG1hZGUgb2Ygc0ZpbGxTdHIsIHJlcGVhdGVkIHVudGlsIGZpbGxMZW4gaXMgbWV0LlxuICB2YXIgc0ZpbGxWYWwgPSByZXBlYXQuY2FsbChzRmlsbFN0ciwgTWF0aC5jZWlsKGZpbGxMZW4gLyBzRmlsbFN0ci5sZW5ndGgpKTtcbiAgLy8gdHJ1bmNhdGUgaWYgd2Ugb3ZlcmZsb3dlZFxuICBpZihzRmlsbFZhbC5sZW5ndGggPiBmaWxsTGVuKXNGaWxsVmFsID0gbGVmdFxuICAgID8gc0ZpbGxWYWwuc2xpY2Uoc0ZpbGxWYWwubGVuZ3RoIC0gZmlsbExlbilcbiAgICA6IHNGaWxsVmFsLnNsaWNlKDAsIGZpbGxMZW4pO1xuICAvLyAxMS4gUmV0dXJuIGEgc3RyaW5nIG1hZGUgZnJvbSBzRmlsbFZhbCwgZm9sbG93ZWQgYnkgUy5cbiAgLy8gMTEuIFJldHVybiBhIFN0cmluZyBtYWRlIGZyb20gUywgZm9sbG93ZWQgYnkgc0ZpbGxWYWwuXG4gIHJldHVybiBsZWZ0ID8gc0ZpbGxWYWwuY29uY2F0KFMpIDogUy5jb25jYXQoc0ZpbGxWYWwpO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlcGVhdChjb3VudCl7XG4gIHZhciBzdHIgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxuICAgICwgcmVzID0gJydcbiAgICAsIG4gICA9ICQudG9JbnRlZ2VyKGNvdW50KTtcbiAgaWYobiA8IDAgfHwgbiA9PSBJbmZpbml0eSl0aHJvdyBSYW5nZUVycm9yKFwiQ291bnQgY2FuJ3QgYmUgbmVnYXRpdmVcIik7XG4gIGZvcig7biA+IDA7IChuID4+Pj0gMSkgJiYgKHN0ciArPSBzdHIpKWlmKG4gJiAxKXJlcyArPSBzdHI7XG4gIHJldHVybiByZXM7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGN0eCAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIGNvZiAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsIGludm9rZSA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxuICAsIGNlbCAgICA9IHJlcXVpcmUoJy4vJC5kb20tY3JlYXRlJylcbiAgLCBnbG9iYWwgICAgICAgICAgICAgPSAkLmdcbiAgLCBpc0Z1bmN0aW9uICAgICAgICAgPSAkLmlzRnVuY3Rpb25cbiAgLCBodG1sICAgICAgICAgICAgICAgPSAkLmh0bWxcbiAgLCBwcm9jZXNzICAgICAgICAgICAgPSBnbG9iYWwucHJvY2Vzc1xuICAsIHNldFRhc2sgICAgICAgICAgICA9IGdsb2JhbC5zZXRJbW1lZGlhdGVcbiAgLCBjbGVhclRhc2sgICAgICAgICAgPSBnbG9iYWwuY2xlYXJJbW1lZGlhdGVcbiAgLCBwb3N0TWVzc2FnZSAgICAgICAgPSBnbG9iYWwucG9zdE1lc3NhZ2VcbiAgLCBhZGRFdmVudExpc3RlbmVyICAgPSBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lclxuICAsIE1lc3NhZ2VDaGFubmVsICAgICA9IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbFxuICAsIGNvdW50ZXIgICAgICAgICAgICA9IDBcbiAgLCBxdWV1ZSAgICAgICAgICAgICAgPSB7fVxuICAsIE9OUkVBRFlTVEFURUNIQU5HRSA9ICdvbnJlYWR5c3RhdGVjaGFuZ2UnXG4gICwgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XG5mdW5jdGlvbiBydW4oKXtcbiAgdmFyIGlkID0gK3RoaXM7XG4gIGlmKCQuaGFzKHF1ZXVlLCBpZCkpe1xuICAgIHZhciBmbiA9IHF1ZXVlW2lkXTtcbiAgICBkZWxldGUgcXVldWVbaWRdO1xuICAgIGZuKCk7XG4gIH1cbn1cbmZ1bmN0aW9uIGxpc3RuZXIoZXZlbnQpe1xuICBydW4uY2FsbChldmVudC5kYXRhKTtcbn1cbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIG90aGVyd2lzZTpcbmlmKCFpc0Z1bmN0aW9uKHNldFRhc2spIHx8ICFpc0Z1bmN0aW9uKGNsZWFyVGFzaykpe1xuICBzZXRUYXNrID0gZnVuY3Rpb24oZm4pe1xuICAgIHZhciBhcmdzID0gW10sIGkgPSAxO1xuICAgIHdoaWxlKGFyZ3VtZW50cy5sZW5ndGggPiBpKWFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgcXVldWVbKytjb3VudGVyXSA9IGZ1bmN0aW9uKCl7XG4gICAgICBpbnZva2UoaXNGdW5jdGlvbihmbikgPyBmbiA6IEZ1bmN0aW9uKGZuKSwgYXJncyk7XG4gICAgfTtcbiAgICBkZWZlcihjb3VudGVyKTtcbiAgICByZXR1cm4gY291bnRlcjtcbiAgfTtcbiAgY2xlYXJUYXNrID0gZnVuY3Rpb24oaWQpe1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gIH07XG4gIC8vIE5vZGUuanMgMC44LVxuICBpZihjb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY3R4KHJ1biwgaWQsIDEpKTtcbiAgICB9O1xuICAvLyBNb2Rlcm4gYnJvd3NlcnMsIHNraXAgaW1wbGVtZW50YXRpb24gZm9yIFdlYldvcmtlcnNcbiAgLy8gSUU4IGhhcyBwb3N0TWVzc2FnZSwgYnV0IGl0J3Mgc3luYyAmIHR5cGVvZiBpdHMgcG9zdE1lc3NhZ2UgaXMgb2JqZWN0XG4gIH0gZWxzZSBpZihhZGRFdmVudExpc3RlbmVyICYmIGlzRnVuY3Rpb24ocG9zdE1lc3NhZ2UpICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cyl7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBwb3N0TWVzc2FnZShpZCwgJyonKTtcbiAgICB9O1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBsaXN0bmVyLCBmYWxzZSk7XG4gIC8vIFdlYldvcmtlcnNcbiAgfSBlbHNlIGlmKGlzRnVuY3Rpb24oTWVzc2FnZUNoYW5uZWwpKXtcbiAgICBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsO1xuICAgIHBvcnQgICAgPSBjaGFubmVsLnBvcnQyO1xuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGlzdG5lcjtcbiAgICBkZWZlciA9IGN0eChwb3J0LnBvc3RNZXNzYWdlLCBwb3J0LCAxKTtcbiAgLy8gSUU4LVxuICB9IGVsc2UgaWYoT05SRUFEWVNUQVRFQ0hBTkdFIGluIGNlbCgnc2NyaXB0Jykpe1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgaHRtbC5hcHBlbmRDaGlsZChjZWwoJ3NjcmlwdCcpKVtPTlJFQURZU1RBVEVDSEFOR0VdID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaHRtbC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgcnVuLmNhbGwoaWQpO1xuICAgICAgfTtcbiAgICB9O1xuICAvLyBSZXN0IG9sZCBicm93c2Vyc1xuICB9IGVsc2Uge1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgc2V0VGltZW91dChjdHgocnVuLCBpZCwgMSksIDApO1xuICAgIH07XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6ICAgc2V0VGFzayxcbiAgY2xlYXI6IGNsZWFyVGFza1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMpe1xuICB0cnkge1xuICAgIGV4ZWMoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07IiwidmFyIHNpZCA9IDA7XG5mdW5jdGlvbiB1aWQoa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsrc2lkICsgTWF0aC5yYW5kb20oKSkudG9TdHJpbmcoMzYpKTtcbn1cbnVpZC5zYWZlID0gcmVxdWlyZSgnLi8kJykuZy5TeW1ib2wgfHwgdWlkO1xubW9kdWxlLmV4cG9ydHMgPSB1aWQ7IiwiLy8gMjIuMS4zLjMxIEFycmF5LnByb3RvdHlwZVtAQHVuc2NvcGFibGVzXVxudmFyICQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBVTlNDT1BBQkxFUyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndW5zY29wYWJsZXMnKTtcbmlmKCQuRlcgJiYgIShVTlNDT1BBQkxFUyBpbiBbXSkpJC5oaWRlKEFycmF5LnByb3RvdHlwZSwgVU5TQ09QQUJMRVMsIHt9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgaWYoJC5GVylbXVtVTlNDT1BBQkxFU11ba2V5XSA9IHRydWU7XG59OyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLyQnKS5nXG4gICwgc3RvcmUgID0ge307XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBnbG9iYWwuU3ltYm9sICYmIGdsb2JhbC5TeW1ib2xbbmFtZV0gfHwgcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTsiLCJ2YXIgJCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY2VsICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5kb20tY3JlYXRlJylcbiAgLCBjb2YgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGRlZiAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGludm9rZSAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcbiAgLCBhcnJheU1ldGhvZCAgICAgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKVxuICAsIElFX1BST1RPICAgICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnX19wcm90b19fJylcbiAgLCBhc3NlcnQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXG4gICwgYXNzZXJ0T2JqZWN0ICAgICA9IGFzc2VydC5vYmpcbiAgLCBPYmplY3RQcm90byAgICAgID0gT2JqZWN0LnByb3RvdHlwZVxuICAsIGh0bWwgICAgICAgICAgICAgPSAkLmh0bWxcbiAgLCBBICAgICAgICAgICAgICAgID0gW11cbiAgLCBfc2xpY2UgICAgICAgICAgID0gQS5zbGljZVxuICAsIF9qb2luICAgICAgICAgICAgPSBBLmpvaW5cbiAgLCBjbGFzc29mICAgICAgICAgID0gY29mLmNsYXNzb2ZcbiAgLCBoYXMgICAgICAgICAgICAgID0gJC5oYXNcbiAgLCBkZWZpbmVQcm9wZXJ0eSAgID0gJC5zZXREZXNjXG4gICwgZ2V0T3duRGVzY3JpcHRvciA9ICQuZ2V0RGVzY1xuICAsIGRlZmluZVByb3BlcnRpZXMgPSAkLnNldERlc2NzXG4gICwgaXNGdW5jdGlvbiAgICAgICA9ICQuaXNGdW5jdGlvblxuICAsIHRvT2JqZWN0ICAgICAgICAgPSAkLnRvT2JqZWN0XG4gICwgdG9MZW5ndGggICAgICAgICA9ICQudG9MZW5ndGhcbiAgLCB0b0luZGV4ICAgICAgICAgID0gJC50b0luZGV4XG4gICwgSUU4X0RPTV9ERUZJTkUgICA9IGZhbHNlXG4gICwgJGluZGV4T2YgICAgICAgICA9IHJlcXVpcmUoJy4vJC5hcnJheS1pbmNsdWRlcycpKGZhbHNlKVxuICAsICRmb3JFYWNoICAgICAgICAgPSBhcnJheU1ldGhvZCgwKVxuICAsICRtYXAgICAgICAgICAgICAgPSBhcnJheU1ldGhvZCgxKVxuICAsICRmaWx0ZXIgICAgICAgICAgPSBhcnJheU1ldGhvZCgyKVxuICAsICRzb21lICAgICAgICAgICAgPSBhcnJheU1ldGhvZCgzKVxuICAsICRldmVyeSAgICAgICAgICAgPSBhcnJheU1ldGhvZCg0KTtcblxuaWYoISQuREVTQyl7XG4gIHRyeSB7XG4gICAgSUU4X0RPTV9ERUZJTkUgPSBkZWZpbmVQcm9wZXJ0eShjZWwoJ2RpdicpLCAneCcsXG4gICAgICB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gODsgfX1cbiAgICApLnggPT0gODtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICAkLnNldERlc2MgPSBmdW5jdGlvbihPLCBQLCBBdHRyaWJ1dGVzKXtcbiAgICBpZihJRThfRE9NX0RFRklORSl0cnkge1xuICAgICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpO1xuICAgIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgICBpZignZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCEnKTtcbiAgICBpZigndmFsdWUnIGluIEF0dHJpYnV0ZXMpYXNzZXJ0T2JqZWN0KE8pW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgICByZXR1cm4gTztcbiAgfTtcbiAgJC5nZXREZXNjID0gZnVuY3Rpb24oTywgUCl7XG4gICAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcbiAgICAgIHJldHVybiBnZXRPd25EZXNjcmlwdG9yKE8sIFApO1xuICAgIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgICBpZihoYXMoTywgUCkpcmV0dXJuICQuZGVzYyghT2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChPLCBQKSwgT1tQXSk7XG4gIH07XG4gICQuc2V0RGVzY3MgPSBkZWZpbmVQcm9wZXJ0aWVzID0gZnVuY3Rpb24oTywgUHJvcGVydGllcyl7XG4gICAgYXNzZXJ0T2JqZWN0KE8pO1xuICAgIHZhciBrZXlzICAgPSAkLmdldEtleXMoUHJvcGVydGllcylcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAgICwgaSA9IDBcbiAgICAgICwgUDtcbiAgICB3aGlsZShsZW5ndGggPiBpKSQuc2V0RGVzYyhPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcbiAgICByZXR1cm4gTztcbiAgfTtcbn1cbiRkZWYoJGRlZi5TICsgJGRlZi5GICogISQuREVTQywgJ09iamVjdCcsIHtcbiAgLy8gMTkuMS4yLjYgLyAxNS4yLjMuMyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJC5nZXREZXNjLFxuICAvLyAxOS4xLjIuNCAvIDE1LjIuMy42IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxuICBkZWZpbmVQcm9wZXJ0eTogJC5zZXREZXNjLFxuICAvLyAxOS4xLjIuMyAvIDE1LjIuMy43IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXG4gIGRlZmluZVByb3BlcnRpZXM6IGRlZmluZVByb3BlcnRpZXNcbn0pO1xuXG4gIC8vIElFIDgtIGRvbid0IGVudW0gYnVnIGtleXNcbnZhciBrZXlzMSA9ICgnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSwnICtcbiAgICAgICAgICAgICd0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJykuc3BsaXQoJywnKVxuICAvLyBBZGRpdGlvbmFsIGtleXMgZm9yIGdldE93blByb3BlcnR5TmFtZXNcbiAgLCBrZXlzMiA9IGtleXMxLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpXG4gICwga2V5c0xlbjEgPSBrZXlzMS5sZW5ndGg7XG5cbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uKCl7XG4gIC8vIFRocmFzaCwgd2FzdGUgYW5kIHNvZG9teTogSUUgR0MgYnVnXG4gIHZhciBpZnJhbWUgPSBjZWwoJ2lmcmFtZScpXG4gICAgLCBpICAgICAgPSBrZXlzTGVuMVxuICAgICwgZ3QgICAgID0gJz4nXG4gICAgLCBpZnJhbWVEb2N1bWVudDtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGh0bWwuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0Oic7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2NyaXB0LXVybFxuICAvLyBjcmVhdGVEaWN0ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuT2JqZWN0O1xuICAvLyBodG1sLnJlbW92ZUNoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZURvY3VtZW50ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gIGlmcmFtZURvY3VtZW50Lm9wZW4oKTtcbiAgaWZyYW1lRG9jdW1lbnQud3JpdGUoJzxzY3JpcHQ+ZG9jdW1lbnQuRj1PYmplY3Q8L3NjcmlwdCcgKyBndCk7XG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xuICB3aGlsZShpLS0pZGVsZXRlIGNyZWF0ZURpY3QucHJvdG90eXBlW2tleXMxW2ldXTtcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcbn07XG5mdW5jdGlvbiBjcmVhdGVHZXRLZXlzKG5hbWVzLCBsZW5ndGgpe1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KXtcbiAgICB2YXIgTyAgICAgID0gdG9PYmplY3Qob2JqZWN0KVxuICAgICAgLCBpICAgICAgPSAwXG4gICAgICAsIHJlc3VsdCA9IFtdXG4gICAgICAsIGtleTtcbiAgICBmb3Ioa2V5IGluIE8paWYoa2V5ICE9IElFX1BST1RPKWhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xuICAgIHdoaWxlKGxlbmd0aCA+IGkpaWYoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKXtcbiAgICAgIH4kaW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGl0KXsgcmV0dXJuICEkLmlzT2JqZWN0KGl0KTsgfVxuZnVuY3Rpb24gRW1wdHkoKXt9XG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtcbiAgLy8gMTkuMS4yLjkgLyAxNS4yLjMuMiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTylcbiAgZ2V0UHJvdG90eXBlT2Y6ICQuZ2V0UHJvdG8gPSAkLmdldFByb3RvIHx8IGZ1bmN0aW9uKE8pe1xuICAgIE8gPSBPYmplY3QoYXNzZXJ0LmRlZihPKSk7XG4gICAgaWYoaGFzKE8sIElFX1BST1RPKSlyZXR1cm4gT1tJRV9QUk9UT107XG4gICAgaWYoaXNGdW5jdGlvbihPLmNvbnN0cnVjdG9yKSAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcil7XG4gICAgICByZXR1cm4gTy5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gICAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvIDogbnVsbDtcbiAgfSxcbiAgLy8gMTkuMS4yLjcgLyAxNS4yLjMuNCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiAkLmdldE5hbWVzID0gJC5nZXROYW1lcyB8fCBjcmVhdGVHZXRLZXlzKGtleXMyLCBrZXlzMi5sZW5ndGgsIHRydWUpLFxuICAvLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbiAgY3JlYXRlOiAkLmNyZWF0ZSA9ICQuY3JlYXRlIHx8IGZ1bmN0aW9uKE8sIC8qPyovUHJvcGVydGllcyl7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBpZihPICE9PSBudWxsKXtcbiAgICAgIEVtcHR5LnByb3RvdHlwZSA9IGFzc2VydE9iamVjdChPKTtcbiAgICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xuICAgICAgRW1wdHkucHJvdG90eXBlID0gbnVsbDtcbiAgICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2Ygc2hpbVxuICAgICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gICAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZGVmaW5lUHJvcGVydGllcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xuICB9LFxuICAvLyAxOS4xLjIuMTQgLyAxNS4yLjMuMTQgT2JqZWN0LmtleXMoTylcbiAga2V5czogJC5nZXRLZXlzID0gJC5nZXRLZXlzIHx8IGNyZWF0ZUdldEtleXMoa2V5czEsIGtleXNMZW4xLCBmYWxzZSksXG4gIC8vIDE5LjEuMi4xNyAvIDE1LjIuMy44IE9iamVjdC5zZWFsKE8pXG4gIHNlYWw6ICQuaXQsIC8vIDwtIGNhcFxuICAvLyAxOS4xLjIuNSAvIDE1LjIuMy45IE9iamVjdC5mcmVlemUoTylcbiAgZnJlZXplOiAkLml0LCAvLyA8LSBjYXBcbiAgLy8gMTkuMS4yLjE1IC8gMTUuMi4zLjEwIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhPKVxuICBwcmV2ZW50RXh0ZW5zaW9uczogJC5pdCwgLy8gPC0gY2FwXG4gIC8vIDE5LjEuMi4xMyAvIDE1LjIuMy4xMSBPYmplY3QuaXNTZWFsZWQoTylcbiAgaXNTZWFsZWQ6IGlzUHJpbWl0aXZlLCAvLyA8LSBjYXBcbiAgLy8gMTkuMS4yLjEyIC8gMTUuMi4zLjEyIE9iamVjdC5pc0Zyb3plbihPKVxuICBpc0Zyb3plbjogaXNQcmltaXRpdmUsIC8vIDwtIGNhcFxuICAvLyAxOS4xLjIuMTEgLyAxNS4yLjMuMTMgT2JqZWN0LmlzRXh0ZW5zaWJsZShPKVxuICBpc0V4dGVuc2libGU6ICQuaXNPYmplY3QgLy8gPC0gY2FwXG59KTtcblxuLy8gMTkuMi4zLjIgLyAxNS4zLjQuNSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCh0aGlzQXJnLCBhcmdzLi4uKVxuJGRlZigkZGVmLlAsICdGdW5jdGlvbicsIHtcbiAgYmluZDogZnVuY3Rpb24odGhhdCAvKiwgYXJncy4uLiAqLyl7XG4gICAgdmFyIGZuICAgICAgID0gYXNzZXJ0LmZuKHRoaXMpXG4gICAgICAsIHBhcnRBcmdzID0gX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBmdW5jdGlvbiBib3VuZCgvKiBhcmdzLi4uICovKXtcbiAgICAgIHZhciBhcmdzID0gcGFydEFyZ3MuY29uY2F0KF9zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgICAgcmV0dXJuIGludm9rZShmbiwgYXJncywgdGhpcyBpbnN0YW5jZW9mIGJvdW5kID8gJC5jcmVhdGUoZm4ucHJvdG90eXBlKSA6IHRoYXQpO1xuICAgIH1cbiAgICBpZihmbi5wcm90b3R5cGUpYm91bmQucHJvdG90eXBlID0gZm4ucHJvdG90eXBlO1xuICAgIHJldHVybiBib3VuZDtcbiAgfVxufSk7XG5cbi8vIEZpeCBmb3Igbm90IGFycmF5LWxpa2UgRVMzIHN0cmluZyBhbmQgRE9NIG9iamVjdHNcbmlmKCEoMCBpbiBPYmplY3QoJ3onKSAmJiAneidbMF0gPT0gJ3onKSl7XG4gICQuRVM1T2JqZWN0ID0gZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbiAgfTtcbn1cblxudmFyIGJ1Z2d5U2xpY2UgPSB0cnVlO1xudHJ5IHtcbiAgaWYoaHRtbClfc2xpY2UuY2FsbChodG1sKTtcbiAgYnVnZ3lTbGljZSA9IGZhbHNlO1xufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGJ1Z2d5U2xpY2UsICdBcnJheScsIHtcbiAgc2xpY2U6IGZ1bmN0aW9uIHNsaWNlKGJlZ2luLCBlbmQpe1xuICAgIHZhciBsZW4gICA9IHRvTGVuZ3RoKHRoaXMubGVuZ3RoKVxuICAgICAgLCBrbGFzcyA9IGNvZih0aGlzKTtcbiAgICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IGVuZDtcbiAgICBpZihrbGFzcyA9PSAnQXJyYXknKXJldHVybiBfc2xpY2UuY2FsbCh0aGlzLCBiZWdpbiwgZW5kKTtcbiAgICB2YXIgc3RhcnQgID0gdG9JbmRleChiZWdpbiwgbGVuKVxuICAgICAgLCB1cFRvICAgPSB0b0luZGV4KGVuZCwgbGVuKVxuICAgICAgLCBzaXplICAgPSB0b0xlbmd0aCh1cFRvIC0gc3RhcnQpXG4gICAgICAsIGNsb25lZCA9IEFycmF5KHNpemUpXG4gICAgICAsIGkgICAgICA9IDA7XG4gICAgZm9yKDsgaSA8IHNpemU7IGkrKyljbG9uZWRbaV0gPSBrbGFzcyA9PSAnU3RyaW5nJ1xuICAgICAgPyB0aGlzLmNoYXJBdChzdGFydCArIGkpXG4gICAgICA6IHRoaXNbc3RhcnQgKyBpXTtcbiAgICByZXR1cm4gY2xvbmVkO1xuICB9XG59KTtcblxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAoJC5FUzVPYmplY3QgIT0gT2JqZWN0KSwgJ0FycmF5Jywge1xuICBqb2luOiBmdW5jdGlvbiBqb2luKCl7XG4gICAgcmV0dXJuIF9qb2luLmFwcGx5KCQuRVM1T2JqZWN0KHRoaXMpLCBhcmd1bWVudHMpO1xuICB9XG59KTtcblxuLy8gMjIuMS4yLjIgLyAxNS40LjMuMiBBcnJheS5pc0FycmF5KGFyZylcbiRkZWYoJGRlZi5TLCAnQXJyYXknLCB7XG4gIGlzQXJyYXk6IGZ1bmN0aW9uKGFyZyl7XG4gICAgcmV0dXJuIGNvZihhcmcpID09ICdBcnJheSc7XG4gIH1cbn0pO1xuZnVuY3Rpb24gY3JlYXRlQXJyYXlSZWR1Y2UoaXNSaWdodCl7XG4gIHJldHVybiBmdW5jdGlvbihjYWxsYmFja2ZuLCBtZW1vKXtcbiAgICBhc3NlcnQuZm4oY2FsbGJhY2tmbik7XG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KHRoaXMpXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSBpc1JpZ2h0ID8gbGVuZ3RoIC0gMSA6IDBcbiAgICAgICwgaSAgICAgID0gaXNSaWdodCA/IC0xIDogMTtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoIDwgMilmb3IoOzspe1xuICAgICAgaWYoaW5kZXggaW4gTyl7XG4gICAgICAgIG1lbW8gPSBPW2luZGV4XTtcbiAgICAgICAgaW5kZXggKz0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpbmRleCArPSBpO1xuICAgICAgYXNzZXJ0KGlzUmlnaHQgPyBpbmRleCA+PSAwIDogbGVuZ3RoID4gaW5kZXgsICdSZWR1Y2Ugb2YgZW1wdHkgYXJyYXkgd2l0aCBubyBpbml0aWFsIHZhbHVlJyk7XG4gICAgfVxuICAgIGZvcig7aXNSaWdodCA/IGluZGV4ID49IDAgOiBsZW5ndGggPiBpbmRleDsgaW5kZXggKz0gaSlpZihpbmRleCBpbiBPKXtcbiAgICAgIG1lbW8gPSBjYWxsYmFja2ZuKG1lbW8sIE9baW5kZXhdLCBpbmRleCwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiBtZW1vO1xuICB9O1xufVxuJGRlZigkZGVmLlAsICdBcnJheScsIHtcbiAgLy8gMjIuMS4zLjEwIC8gMTUuNC40LjE4IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXG4gIGZvckVhY2g6ICQuZWFjaCA9ICQuZWFjaCB8fCBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRmb3JFYWNoKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy4xNSAvIDE1LjQuNC4xOSBBcnJheS5wcm90b3R5cGUubWFwKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXG4gIG1hcDogZnVuY3Rpb24gbWFwKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRtYXAodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcbiAgfSxcbiAgLy8gMjIuMS4zLjcgLyAxNS40LjQuMjAgQXJyYXkucHJvdG90eXBlLmZpbHRlcihjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxuICBmaWx0ZXI6IGZ1bmN0aW9uIGZpbHRlcihjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgIHJldHVybiAkZmlsdGVyKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy4yMyAvIDE1LjQuNC4xNyBBcnJheS5wcm90b3R5cGUuc29tZShjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxuICBzb21lOiBmdW5jdGlvbiBzb21lKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRzb21lKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy41IC8gMTUuNC40LjE2IEFycmF5LnByb3RvdHlwZS5ldmVyeShjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxuICBldmVyeTogZnVuY3Rpb24gZXZlcnkoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICByZXR1cm4gJGV2ZXJ5KHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy4xOCAvIDE1LjQuNC4yMSBBcnJheS5wcm90b3R5cGUucmVkdWNlKGNhbGxiYWNrZm4gWywgaW5pdGlhbFZhbHVlXSlcbiAgcmVkdWNlOiBjcmVhdGVBcnJheVJlZHVjZShmYWxzZSksXG4gIC8vIDIyLjEuMy4xOSAvIDE1LjQuNC4yMiBBcnJheS5wcm90b3R5cGUucmVkdWNlUmlnaHQoY2FsbGJhY2tmbiBbLCBpbml0aWFsVmFsdWVdKVxuICByZWR1Y2VSaWdodDogY3JlYXRlQXJyYXlSZWR1Y2UodHJ1ZSksXG4gIC8vIDIyLjEuMy4xMSAvIDE1LjQuNC4xNCBBcnJheS5wcm90b3R5cGUuaW5kZXhPZihzZWFyY2hFbGVtZW50IFssIGZyb21JbmRleF0pXG4gIGluZGV4T2Y6IGZ1bmN0aW9uIGluZGV4T2YoZWwgLyosIGZyb21JbmRleCA9IDAgKi8pe1xuICAgIHJldHVybiAkaW5kZXhPZih0aGlzLCBlbCwgYXJndW1lbnRzWzFdKTtcbiAgfSxcbiAgLy8gMjIuMS4zLjE0IC8gMTUuNC40LjE1IEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZihzZWFyY2hFbGVtZW50IFssIGZyb21JbmRleF0pXG4gIGxhc3RJbmRleE9mOiBmdW5jdGlvbihlbCwgZnJvbUluZGV4IC8qID0gQFsqLTFdICovKXtcbiAgICB2YXIgTyAgICAgID0gdG9PYmplY3QodGhpcylcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9IGxlbmd0aCAtIDE7XG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA+IDEpaW5kZXggPSBNYXRoLm1pbihpbmRleCwgJC50b0ludGVnZXIoZnJvbUluZGV4KSk7XG4gICAgaWYoaW5kZXggPCAwKWluZGV4ID0gdG9MZW5ndGgobGVuZ3RoICsgaW5kZXgpO1xuICAgIGZvcig7aW5kZXggPj0gMDsgaW5kZXgtLSlpZihpbmRleCBpbiBPKWlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gaW5kZXg7XG4gICAgcmV0dXJuIC0xO1xuICB9XG59KTtcblxuLy8gMjEuMS4zLjI1IC8gMTUuNS40LjIwIFN0cmluZy5wcm90b3R5cGUudHJpbSgpXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHt0cmltOiByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvXlxccyooW1xcc1xcU10qXFxTKT9cXHMqJC8sICckMScpfSk7XG5cbi8vIDIwLjMuMy4xIC8gMTUuOS40LjQgRGF0ZS5ub3coKVxuJGRlZigkZGVmLlMsICdEYXRlJywge25vdzogZnVuY3Rpb24oKXtcbiAgcmV0dXJuICtuZXcgRGF0ZTtcbn19KTtcblxuZnVuY3Rpb24gbHoobnVtKXtcbiAgcmV0dXJuIG51bSA+IDkgPyBudW0gOiAnMCcgKyBudW07XG59XG5cbi8vIDIwLjMuNC4zNiAvIDE1LjkuNS40MyBEYXRlLnByb3RvdHlwZS50b0lTT1N0cmluZygpXG4vLyBQaGFudG9tSlMgYW5kIG9sZCB3ZWJraXQgaGFkIGEgYnJva2VuIERhdGUgaW1wbGVtZW50YXRpb24uXG52YXIgZGF0ZSAgICAgICA9IG5ldyBEYXRlKC01ZTEzIC0gMSlcbiAgLCBicm9rZW5EYXRlID0gIShkYXRlLnRvSVNPU3RyaW5nICYmIGRhdGUudG9JU09TdHJpbmcoKSA9PSAnMDM4NS0wNy0yNVQwNzowNjozOS45OTlaJ1xuICAgICAgJiYgcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7IG5ldyBEYXRlKE5hTikudG9JU09TdHJpbmcoKTsgfSkpO1xuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiBicm9rZW5EYXRlLCAnRGF0ZScsIHt0b0lTT1N0cmluZzogZnVuY3Rpb24oKXtcbiAgaWYoIWlzRmluaXRlKHRoaXMpKXRocm93IFJhbmdlRXJyb3IoJ0ludmFsaWQgdGltZSB2YWx1ZScpO1xuICB2YXIgZCA9IHRoaXNcbiAgICAsIHkgPSBkLmdldFVUQ0Z1bGxZZWFyKClcbiAgICAsIG0gPSBkLmdldFVUQ01pbGxpc2Vjb25kcygpXG4gICAgLCBzID0geSA8IDAgPyAnLScgOiB5ID4gOTk5OSA/ICcrJyA6ICcnO1xuICByZXR1cm4gcyArICgnMDAwMDAnICsgTWF0aC5hYnMoeSkpLnNsaWNlKHMgPyAtNiA6IC00KSArXG4gICAgJy0nICsgbHooZC5nZXRVVENNb250aCgpICsgMSkgKyAnLScgKyBseihkLmdldFVUQ0RhdGUoKSkgK1xuICAgICdUJyArIGx6KGQuZ2V0VVRDSG91cnMoKSkgKyAnOicgKyBseihkLmdldFVUQ01pbnV0ZXMoKSkgK1xuICAgICc6JyArIGx6KGQuZ2V0VVRDU2Vjb25kcygpKSArICcuJyArIChtID4gOTkgPyBtIDogJzAnICsgbHoobSkpICsgJ1onO1xufX0pO1xuXG5pZihjbGFzc29mKGZ1bmN0aW9uKCl7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ09iamVjdCcpY29mLmNsYXNzb2YgPSBmdW5jdGlvbihpdCl7XG4gIHZhciB0YWcgPSBjbGFzc29mKGl0KTtcbiAgcmV0dXJuIHRhZyA9PSAnT2JqZWN0JyAmJiBpc0Z1bmN0aW9uKGl0LmNhbGxlZSkgPyAnQXJndW1lbnRzJyA6IHRhZztcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b0luZGV4ID0gJC50b0luZGV4O1xuJGRlZigkZGVmLlAsICdBcnJheScsIHtcbiAgLy8gMjIuMS4zLjMgQXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4odGFyZ2V0LCBzdGFydCwgZW5kID0gdGhpcy5sZW5ndGgpXG4gIGNvcHlXaXRoaW46IGZ1bmN0aW9uIGNvcHlXaXRoaW4odGFyZ2V0LyogPSAwICovLCBzdGFydCAvKiA9IDAsIGVuZCA9IEBsZW5ndGggKi8pe1xuICAgIHZhciBPICAgICA9IE9iamVjdCgkLmFzc2VydERlZmluZWQodGhpcykpXG4gICAgICAsIGxlbiAgID0gJC50b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgdG8gICAgPSB0b0luZGV4KHRhcmdldCwgbGVuKVxuICAgICAgLCBmcm9tICA9IHRvSW5kZXgoc3RhcnQsIGxlbilcbiAgICAgICwgZW5kICAgPSBhcmd1bWVudHNbMl1cbiAgICAgICwgZmluICAgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IHRvSW5kZXgoZW5kLCBsZW4pXG4gICAgICAsIGNvdW50ID0gTWF0aC5taW4oZmluIC0gZnJvbSwgbGVuIC0gdG8pXG4gICAgICAsIGluYyAgID0gMTtcbiAgICBpZihmcm9tIDwgdG8gJiYgdG8gPCBmcm9tICsgY291bnQpe1xuICAgICAgaW5jICA9IC0xO1xuICAgICAgZnJvbSA9IGZyb20gKyBjb3VudCAtIDE7XG4gICAgICB0byAgID0gdG8gICArIGNvdW50IC0gMTtcbiAgICB9XG4gICAgd2hpbGUoY291bnQtLSA+IDApe1xuICAgICAgaWYoZnJvbSBpbiBPKU9bdG9dID0gT1tmcm9tXTtcbiAgICAgIGVsc2UgZGVsZXRlIE9bdG9dO1xuICAgICAgdG8gICArPSBpbmM7XG4gICAgICBmcm9tICs9IGluYztcbiAgICB9IHJldHVybiBPO1xuICB9XG59KTtcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2NvcHlXaXRoaW4nKTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIHRvSW5kZXggPSAkLnRvSW5kZXg7XG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjMuNiBBcnJheS5wcm90b3R5cGUuZmlsbCh2YWx1ZSwgc3RhcnQgPSAwLCBlbmQgPSB0aGlzLmxlbmd0aClcbiAgZmlsbDogZnVuY3Rpb24gZmlsbCh2YWx1ZSAvKiwgc3RhcnQgPSAwLCBlbmQgPSBAbGVuZ3RoICovKXtcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcbiAgICAgICwgbGVuZ3RoID0gJC50b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChhcmd1bWVudHNbMV0sIGxlbmd0aClcbiAgICAgICwgZW5kICAgID0gYXJndW1lbnRzWzJdXG4gICAgICAsIGVuZFBvcyA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuZ3RoIDogdG9JbmRleChlbmQsIGxlbmd0aCk7XG4gICAgd2hpbGUoZW5kUG9zID4gaW5kZXgpT1tpbmRleCsrXSA9IHZhbHVlO1xuICAgIHJldHVybiBPO1xuICB9XG59KTtcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2ZpbGwnKTsiLCIndXNlIHN0cmljdCc7XG4vLyAyMi4xLjMuOSBBcnJheS5wcm90b3R5cGUuZmluZEluZGV4KHByZWRpY2F0ZSwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbnZhciBLRVkgICAgPSAnZmluZEluZGV4J1xuICAsICRkZWYgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGZvcmNlZCA9IHRydWVcbiAgLCAkZmluZCAgPSByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpKDYpO1xuLy8gU2hvdWxkbid0IHNraXAgaG9sZXNcbmlmKEtFWSBpbiBbXSlBcnJheSgxKVtLRVldKGZ1bmN0aW9uKCl7IGZvcmNlZCA9IGZhbHNlOyB9KTtcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogZm9yY2VkLCAnQXJyYXknLCB7XG4gIGZpbmRJbmRleDogZnVuY3Rpb24gZmluZEluZGV4KGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRmaW5kKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH1cbn0pO1xucmVxdWlyZSgnLi8kLnVuc2NvcGUnKShLRVkpOyIsIid1c2Ugc3RyaWN0Jztcbi8vIDIyLjEuMy44IEFycmF5LnByb3RvdHlwZS5maW5kKHByZWRpY2F0ZSwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbnZhciBLRVkgICAgPSAnZmluZCdcbiAgLCAkZGVmICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBmb3JjZWQgPSB0cnVlXG4gICwgJGZpbmQgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKSg1KTtcbi8vIFNob3VsZG4ndCBza2lwIGhvbGVzXG5pZihLRVkgaW4gW10pQXJyYXkoMSlbS0VZXShmdW5jdGlvbigpeyBmb3JjZWQgPSBmYWxzZTsgfSk7XG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGZvcmNlZCwgJ0FycmF5Jywge1xuICBmaW5kOiBmdW5jdGlvbiBmaW5kKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRmaW5kKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH1cbn0pO1xucmVxdWlyZSgnLi8kLnVuc2NvcGUnKShLRVkpOyIsInZhciAkICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3R4ICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRpdGVyID0gcmVxdWlyZSgnLi8kLml0ZXInKVxuICAsIGNhbGwgID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpO1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7IEFycmF5LmZyb20oaXRlcik7IH0pLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgZnJvbTogZnVuY3Rpb24gZnJvbShhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XG4gICAgdmFyIE8gICAgICAgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKGFycmF5TGlrZSkpXG4gICAgICAsIG1hcGZuICAgPSBhcmd1bWVudHNbMV1cbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcbiAgICAgICwgZiAgICAgICA9IG1hcHBpbmcgPyBjdHgobWFwZm4sIGFyZ3VtZW50c1syXSwgMikgOiB1bmRlZmluZWRcbiAgICAgICwgaW5kZXggICA9IDBcbiAgICAgICwgbGVuZ3RoLCByZXN1bHQsIHN0ZXAsIGl0ZXJhdG9yO1xuICAgIGlmKCRpdGVyLmlzKE8pKXtcbiAgICAgIGl0ZXJhdG9yID0gJGl0ZXIuZ2V0KE8pO1xuICAgICAgLy8gc3RyYW5nZSBJRSBxdWlya3MgbW9kZSBidWcgLT4gdXNlIHR5cGVvZiBpbnN0ZWFkIG9mIGlzRnVuY3Rpb25cbiAgICAgIHJlc3VsdCAgID0gbmV3ICh0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5KTtcbiAgICAgIGZvcig7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKyl7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gY2FsbChpdGVyYXRvciwgZiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSkgOiBzdGVwLnZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzdHJhbmdlIElFIHF1aXJrcyBtb2RlIGJ1ZyAtPiB1c2UgdHlwZW9mIGluc3RlYWQgb2YgaXNGdW5jdGlvblxuICAgICAgcmVzdWx0ID0gbmV3ICh0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5KShsZW5ndGggPSAkLnRvTGVuZ3RoKE8ubGVuZ3RoKSk7XG4gICAgICBmb3IoOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gZihPW2luZGV4XSwgaW5kZXgpIDogT1tpbmRleF07XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTsiLCJ2YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgc2V0VW5zY29wZSA9IHJlcXVpcmUoJy4vJC51bnNjb3BlJylcbiAgLCBJVEVSICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ2l0ZXInKVxuICAsICRpdGVyICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXG4gICwgc3RlcCAgICAgICA9ICRpdGVyLnN0ZXBcbiAgLCBJdGVyYXRvcnMgID0gJGl0ZXIuSXRlcmF0b3JzO1xuXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xuICAkLnNldCh0aGlzLCBJVEVSLCB7bzogJC50b09iamVjdChpdGVyYXRlZCksIGk6IDAsIGs6IGtpbmR9KTtcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxuICAgICwgTyAgICAgPSBpdGVyLm9cbiAgICAsIGtpbmQgID0gaXRlci5rXG4gICAgLCBpbmRleCA9IGl0ZXIuaSsrO1xuICBpZighTyB8fCBpbmRleCA+PSBPLmxlbmd0aCl7XG4gICAgaXRlci5vID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBzdGVwKDEpO1xuICB9XG4gIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgaW5kZXgpO1xuICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIE9baW5kZXhdKTtcbiAgcmV0dXJuIHN0ZXAoMCwgW2luZGV4LCBPW2luZGV4XV0pO1xufSwgJ3ZhbHVlcycpO1xuXG4vLyBhcmd1bWVudHNMaXN0W0BAaXRlcmF0b3JdIGlzICVBcnJheVByb3RvX3ZhbHVlcyUgKDkuNC40LjYsIDkuNC40LjcpXG5JdGVyYXRvcnMuQXJndW1lbnRzID0gSXRlcmF0b3JzLkFycmF5O1xuXG5zZXRVbnNjb3BlKCdrZXlzJyk7XG5zZXRVbnNjb3BlKCd2YWx1ZXMnKTtcbnNldFVuc2NvcGUoJ2VudHJpZXMnKTsiLCJ2YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcbiRkZWYoJGRlZi5TLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMi4zIEFycmF5Lm9mKCAuLi5pdGVtcylcbiAgb2Y6IGZ1bmN0aW9uIG9mKC8qIC4uLmFyZ3MgKi8pe1xuICAgIHZhciBpbmRleCAgPSAwXG4gICAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIC8vIHN0cmFuZ2UgSUUgcXVpcmtzIG1vZGUgYnVnIC0+IHVzZSB0eXBlb2YgaW5zdGVhZCBvZiBpc0Z1bmN0aW9uXG4gICAgICAsIHJlc3VsdCA9IG5ldyAodHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyA/IHRoaXMgOiBBcnJheSkobGVuZ3RoKTtcbiAgICB3aGlsZShsZW5ndGggPiBpbmRleClyZXN1bHRbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4KytdO1xuICAgIHJlc3VsdC5sZW5ndGggPSBsZW5ndGg7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufSk7IiwicmVxdWlyZSgnLi8kLnNwZWNpZXMnKShBcnJheSk7IiwidmFyICQgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIEhBU19JTlNUQU5DRSAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2hhc0luc3RhbmNlJylcbiAgLCBGdW5jdGlvblByb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuLy8gMTkuMi4zLjYgRnVuY3Rpb24ucHJvdG90eXBlW0BAaGFzSW5zdGFuY2VdKFYpXG5pZighKEhBU19JTlNUQU5DRSBpbiBGdW5jdGlvblByb3RvKSkkLnNldERlc2MoRnVuY3Rpb25Qcm90bywgSEFTX0lOU1RBTkNFLCB7dmFsdWU6IGZ1bmN0aW9uKE8pe1xuICBpZighJC5pc0Z1bmN0aW9uKHRoaXMpIHx8ICEkLmlzT2JqZWN0KE8pKXJldHVybiBmYWxzZTtcbiAgaWYoISQuaXNPYmplY3QodGhpcy5wcm90b3R5cGUpKXJldHVybiBPIGluc3RhbmNlb2YgdGhpcztcbiAgLy8gZm9yIGVudmlyb25tZW50IHcvbyBuYXRpdmUgYEBAaGFzSW5zdGFuY2VgIGxvZ2ljIGVub3VnaCBgaW5zdGFuY2VvZmAsIGJ1dCBhZGQgdGhpczpcbiAgd2hpbGUoTyA9ICQuZ2V0UHJvdG8oTykpaWYodGhpcy5wcm90b3R5cGUgPT09IE8pcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn19KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgTkFNRSA9ICduYW1lJ1xuICAsIHNldERlc2MgPSAkLnNldERlc2NcbiAgLCBGdW5jdGlvblByb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuLy8gMTkuMi40LjIgbmFtZVxuTkFNRSBpbiBGdW5jdGlvblByb3RvIHx8ICQuRlcgJiYgJC5ERVNDICYmIHNldERlc2MoRnVuY3Rpb25Qcm90bywgTkFNRSwge1xuICBjb25maWd1cmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24oKXtcbiAgICB2YXIgbWF0Y2ggPSBTdHJpbmcodGhpcykubWF0Y2goL15cXHMqZnVuY3Rpb24gKFteIChdKikvKVxuICAgICAgLCBuYW1lICA9IG1hdGNoID8gbWF0Y2hbMV0gOiAnJztcbiAgICAkLmhhcyh0aGlzLCBOQU1FKSB8fCBzZXREZXNjKHRoaXMsIE5BTUUsICQuZGVzYyg1LCBuYW1lKSk7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH0sXG4gIHNldDogZnVuY3Rpb24odmFsdWUpe1xuICAgICQuaGFzKHRoaXMsIE5BTUUpIHx8IHNldERlc2ModGhpcywgTkFNRSwgJC5kZXNjKDAsIHZhbHVlKSk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi1zdHJvbmcnKTtcblxuLy8gMjMuMSBNYXAgT2JqZWN0c1xucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnTWFwJywge1xuICAvLyAyMy4xLjMuNiBNYXAucHJvdG90eXBlLmdldChrZXkpXG4gIGdldDogZnVuY3Rpb24gZ2V0KGtleSl7XG4gICAgdmFyIGVudHJ5ID0gc3Ryb25nLmdldEVudHJ5KHRoaXMsIGtleSk7XG4gICAgcmV0dXJuIGVudHJ5ICYmIGVudHJ5LnY7XG4gIH0sXG4gIC8vIDIzLjEuMy45IE1hcC5wcm90b3R5cGUuc2V0KGtleSwgdmFsdWUpXG4gIHNldDogZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpe1xuICAgIHJldHVybiBzdHJvbmcuZGVmKHRoaXMsIGtleSA9PT0gMCA/IDAgOiBrZXksIHZhbHVlKTtcbiAgfVxufSwgc3Ryb25nLCB0cnVlKTsiLCJ2YXIgSW5maW5pdHkgPSAxIC8gMFxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgRSAgICAgPSBNYXRoLkVcbiAgLCBwb3cgICA9IE1hdGgucG93XG4gICwgYWJzICAgPSBNYXRoLmFic1xuICAsIGV4cCAgID0gTWF0aC5leHBcbiAgLCBsb2cgICA9IE1hdGgubG9nXG4gICwgc3FydCAgPSBNYXRoLnNxcnRcbiAgLCBjZWlsICA9IE1hdGguY2VpbFxuICAsIGZsb29yID0gTWF0aC5mbG9vclxuICAsIEVQU0lMT04gICA9IHBvdygyLCAtNTIpXG4gICwgRVBTSUxPTjMyID0gcG93KDIsIC0yMylcbiAgLCBNQVgzMiAgICAgPSBwb3coMiwgMTI3KSAqICgyIC0gRVBTSUxPTjMyKVxuICAsIE1JTjMyICAgICA9IHBvdygyLCAtMTI2KTtcbmZ1bmN0aW9uIHJvdW5kVGllc1RvRXZlbihuKXtcbiAgcmV0dXJuIG4gKyAxIC8gRVBTSUxPTiAtIDEgLyBFUFNJTE9OO1xufVxuXG4vLyAyMC4yLjIuMjggTWF0aC5zaWduKHgpXG5mdW5jdGlvbiBzaWduKHgpe1xuICByZXR1cm4gKHggPSAreCkgPT0gMCB8fCB4ICE9IHggPyB4IDogeCA8IDAgPyAtMSA6IDE7XG59XG4vLyAyMC4yLjIuNSBNYXRoLmFzaW5oKHgpXG5mdW5jdGlvbiBhc2luaCh4KXtcbiAgcmV0dXJuICFpc0Zpbml0ZSh4ID0gK3gpIHx8IHggPT0gMCA/IHggOiB4IDwgMCA/IC1hc2luaCgteCkgOiBsb2coeCArIHNxcnQoeCAqIHggKyAxKSk7XG59XG4vLyAyMC4yLjIuMTQgTWF0aC5leHBtMSh4KVxuZnVuY3Rpb24gZXhwbTEoeCl7XG4gIHJldHVybiAoeCA9ICt4KSA9PSAwID8geCA6IHggPiAtMWUtNiAmJiB4IDwgMWUtNiA/IHggKyB4ICogeCAvIDIgOiBleHAoeCkgLSAxO1xufVxuXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XG4gIC8vIDIwLjIuMi4zIE1hdGguYWNvc2goeClcbiAgYWNvc2g6IGZ1bmN0aW9uIGFjb3NoKHgpe1xuICAgIHJldHVybiAoeCA9ICt4KSA8IDEgPyBOYU4gOiBpc0Zpbml0ZSh4KSA/IGxvZyh4IC8gRSArIHNxcnQoeCArIDEpICogc3FydCh4IC0gMSkgLyBFKSArIDEgOiB4O1xuICB9LFxuICAvLyAyMC4yLjIuNSBNYXRoLmFzaW5oKHgpXG4gIGFzaW5oOiBhc2luaCxcbiAgLy8gMjAuMi4yLjcgTWF0aC5hdGFuaCh4KVxuICBhdGFuaDogZnVuY3Rpb24gYXRhbmgoeCl7XG4gICAgcmV0dXJuICh4ID0gK3gpID09IDAgPyB4IDogbG9nKCgxICsgeCkgLyAoMSAtIHgpKSAvIDI7XG4gIH0sXG4gIC8vIDIwLjIuMi45IE1hdGguY2JydCh4KVxuICBjYnJ0OiBmdW5jdGlvbiBjYnJ0KHgpe1xuICAgIHJldHVybiBzaWduKHggPSAreCkgKiBwb3coYWJzKHgpLCAxIC8gMyk7XG4gIH0sXG4gIC8vIDIwLjIuMi4xMSBNYXRoLmNsejMyKHgpXG4gIGNsejMyOiBmdW5jdGlvbiBjbHozMih4KXtcbiAgICByZXR1cm4gKHggPj4+PSAwKSA/IDMxIC0gZmxvb3IobG9nKHggKyAwLjUpICogTWF0aC5MT0cyRSkgOiAzMjtcbiAgfSxcbiAgLy8gMjAuMi4yLjEyIE1hdGguY29zaCh4KVxuICBjb3NoOiBmdW5jdGlvbiBjb3NoKHgpe1xuICAgIHJldHVybiAoZXhwKHggPSAreCkgKyBleHAoLXgpKSAvIDI7XG4gIH0sXG4gIC8vIDIwLjIuMi4xNCBNYXRoLmV4cG0xKHgpXG4gIGV4cG0xOiBleHBtMSxcbiAgLy8gMjAuMi4yLjE2IE1hdGguZnJvdW5kKHgpXG4gIGZyb3VuZDogZnVuY3Rpb24gZnJvdW5kKHgpe1xuICAgIHZhciAkYWJzICA9IGFicyh4KVxuICAgICAgLCAkc2lnbiA9IHNpZ24oeClcbiAgICAgICwgYSwgcmVzdWx0O1xuICAgIGlmKCRhYnMgPCBNSU4zMilyZXR1cm4gJHNpZ24gKiByb3VuZFRpZXNUb0V2ZW4oJGFicyAvIE1JTjMyIC8gRVBTSUxPTjMyKSAqIE1JTjMyICogRVBTSUxPTjMyO1xuICAgIGEgPSAoMSArIEVQU0lMT04zMiAvIEVQU0lMT04pICogJGFicztcbiAgICByZXN1bHQgPSBhIC0gKGEgLSAkYWJzKTtcbiAgICBpZihyZXN1bHQgPiBNQVgzMiB8fCByZXN1bHQgIT0gcmVzdWx0KXJldHVybiAkc2lnbiAqIEluZmluaXR5O1xuICAgIHJldHVybiAkc2lnbiAqIHJlc3VsdDtcbiAgfSxcbiAgLy8gMjAuMi4yLjE3IE1hdGguaHlwb3QoW3ZhbHVlMVssIHZhbHVlMlssIOKApiBdXV0pXG4gIGh5cG90OiBmdW5jdGlvbiBoeXBvdCh2YWx1ZTEsIHZhbHVlMil7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICB2YXIgc3VtICA9IDBcbiAgICAgICwgaSAgICA9IDBcbiAgICAgICwgbGVuICA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgICwgYXJncyA9IEFycmF5KGxlbilcbiAgICAgICwgbGFyZyA9IDBcbiAgICAgICwgYXJnO1xuICAgIHdoaWxlKGkgPCBsZW4pe1xuICAgICAgYXJnID0gYXJnc1tpXSA9IGFicyhhcmd1bWVudHNbaSsrXSk7XG4gICAgICBpZihhcmcgPT0gSW5maW5pdHkpcmV0dXJuIEluZmluaXR5O1xuICAgICAgaWYoYXJnID4gbGFyZylsYXJnID0gYXJnO1xuICAgIH1cbiAgICBsYXJnID0gbGFyZyB8fCAxO1xuICAgIHdoaWxlKGxlbi0tKXN1bSArPSBwb3coYXJnc1tsZW5dIC8gbGFyZywgMik7XG4gICAgcmV0dXJuIGxhcmcgKiBzcXJ0KHN1bSk7XG4gIH0sXG4gIC8vIDIwLjIuMi4xOCBNYXRoLmltdWwoeCwgeSlcbiAgaW11bDogZnVuY3Rpb24gaW11bCh4LCB5KXtcbiAgICB2YXIgVUludDE2ID0gMHhmZmZmXG4gICAgICAsIHhuID0gK3hcbiAgICAgICwgeW4gPSAreVxuICAgICAgLCB4bCA9IFVJbnQxNiAmIHhuXG4gICAgICAsIHlsID0gVUludDE2ICYgeW47XG4gICAgcmV0dXJuIDAgfCB4bCAqIHlsICsgKChVSW50MTYgJiB4biA+Pj4gMTYpICogeWwgKyB4bCAqIChVSW50MTYgJiB5biA+Pj4gMTYpIDw8IDE2ID4+PiAwKTtcbiAgfSxcbiAgLy8gMjAuMi4yLjIwIE1hdGgubG9nMXAoeClcbiAgbG9nMXA6IGZ1bmN0aW9uIGxvZzFwKHgpe1xuICAgIHJldHVybiAoeCA9ICt4KSA+IC0xZS04ICYmIHggPCAxZS04ID8geCAtIHggKiB4IC8gMiA6IGxvZygxICsgeCk7XG4gIH0sXG4gIC8vIDIwLjIuMi4yMSBNYXRoLmxvZzEwKHgpXG4gIGxvZzEwOiBmdW5jdGlvbiBsb2cxMCh4KXtcbiAgICByZXR1cm4gbG9nKHgpIC8gTWF0aC5MTjEwO1xuICB9LFxuICAvLyAyMC4yLjIuMjIgTWF0aC5sb2cyKHgpXG4gIGxvZzI6IGZ1bmN0aW9uIGxvZzIoeCl7XG4gICAgcmV0dXJuIGxvZyh4KSAvIE1hdGguTE4yO1xuICB9LFxuICAvLyAyMC4yLjIuMjggTWF0aC5zaWduKHgpXG4gIHNpZ246IHNpZ24sXG4gIC8vIDIwLjIuMi4zMCBNYXRoLnNpbmgoeClcbiAgc2luaDogZnVuY3Rpb24gc2luaCh4KXtcbiAgICByZXR1cm4gYWJzKHggPSAreCkgPCAxID8gKGV4cG0xKHgpIC0gZXhwbTEoLXgpKSAvIDIgOiAoZXhwKHggLSAxKSAtIGV4cCgteCAtIDEpKSAqIChFIC8gMik7XG4gIH0sXG4gIC8vIDIwLjIuMi4zMyBNYXRoLnRhbmgoeClcbiAgdGFuaDogZnVuY3Rpb24gdGFuaCh4KXtcbiAgICB2YXIgYSA9IGV4cG0xKHggPSAreClcbiAgICAgICwgYiA9IGV4cG0xKC14KTtcbiAgICByZXR1cm4gYSA9PSBJbmZpbml0eSA/IDEgOiBiID09IEluZmluaXR5ID8gLTEgOiAoYSAtIGIpIC8gKGV4cCh4KSArIGV4cCgteCkpO1xuICB9LFxuICAvLyAyMC4yLjIuMzQgTWF0aC50cnVuYyh4KVxuICB0cnVuYzogZnVuY3Rpb24gdHJ1bmMoaXQpe1xuICAgIHJldHVybiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBpc09iamVjdCAgID0gJC5pc09iamVjdFxuICAsIGlzRnVuY3Rpb24gPSAkLmlzRnVuY3Rpb25cbiAgLCBOVU1CRVIgICAgID0gJ051bWJlcidcbiAgLCAkTnVtYmVyICAgID0gJC5nW05VTUJFUl1cbiAgLCBCYXNlICAgICAgID0gJE51bWJlclxuICAsIHByb3RvICAgICAgPSAkTnVtYmVyLnByb3RvdHlwZTtcbmZ1bmN0aW9uIHRvUHJpbWl0aXZlKGl0KXtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmKGlzRnVuY3Rpb24oZm4gPSBpdC52YWx1ZU9mKSAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKGlzRnVuY3Rpb24oZm4gPSBpdC50b1N0cmluZykgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBudW1iZXJcIik7XG59XG5mdW5jdGlvbiB0b051bWJlcihpdCl7XG4gIGlmKGlzT2JqZWN0KGl0KSlpdCA9IHRvUHJpbWl0aXZlKGl0KTtcbiAgaWYodHlwZW9mIGl0ID09ICdzdHJpbmcnICYmIGl0Lmxlbmd0aCA+IDIgJiYgaXQuY2hhckNvZGVBdCgwKSA9PSA0OCl7XG4gICAgdmFyIGJpbmFyeSA9IGZhbHNlO1xuICAgIHN3aXRjaChpdC5jaGFyQ29kZUF0KDEpKXtcbiAgICAgIGNhc2UgNjYgOiBjYXNlIDk4ICA6IGJpbmFyeSA9IHRydWU7XG4gICAgICBjYXNlIDc5IDogY2FzZSAxMTEgOiByZXR1cm4gcGFyc2VJbnQoaXQuc2xpY2UoMiksIGJpbmFyeSA/IDIgOiA4KTtcbiAgICB9XG4gIH0gcmV0dXJuICtpdDtcbn1cbmlmKCQuRlcgJiYgISgkTnVtYmVyKCcwbzEnKSAmJiAkTnVtYmVyKCcwYjEnKSkpe1xuICAkTnVtYmVyID0gZnVuY3Rpb24gTnVtYmVyKGl0KXtcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mICROdW1iZXIgPyBuZXcgQmFzZSh0b051bWJlcihpdCkpIDogdG9OdW1iZXIoaXQpO1xuICB9O1xuICAkLmVhY2guY2FsbCgkLkRFU0MgPyAkLmdldE5hbWVzKEJhc2UpIDogKFxuICAgICAgLy8gRVMzOlxuICAgICAgJ01BWF9WQUxVRSxNSU5fVkFMVUUsTmFOLE5FR0FUSVZFX0lORklOSVRZLFBPU0lUSVZFX0lORklOSVRZLCcgK1xuICAgICAgLy8gRVM2IChpbiBjYXNlLCBpZiBtb2R1bGVzIHdpdGggRVM2IE51bWJlciBzdGF0aWNzIHJlcXVpcmVkIGJlZm9yZSk6XG4gICAgICAnRVBTSUxPTixpc0Zpbml0ZSxpc0ludGVnZXIsaXNOYU4saXNTYWZlSW50ZWdlcixNQVhfU0FGRV9JTlRFR0VSLCcgK1xuICAgICAgJ01JTl9TQUZFX0lOVEVHRVIscGFyc2VGbG9hdCxwYXJzZUludCxpc0ludGVnZXInXG4gICAgKS5zcGxpdCgnLCcpLCBmdW5jdGlvbihrZXkpe1xuICAgICAgaWYoJC5oYXMoQmFzZSwga2V5KSAmJiAhJC5oYXMoJE51bWJlciwga2V5KSl7XG4gICAgICAgICQuc2V0RGVzYygkTnVtYmVyLCBrZXksICQuZ2V0RGVzYyhCYXNlLCBrZXkpKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG4gICROdW1iZXIucHJvdG90eXBlID0gcHJvdG87XG4gIHByb3RvLmNvbnN0cnVjdG9yID0gJE51bWJlcjtcbiAgcmVxdWlyZSgnLi8kLnJlZGVmJykoJC5nLCBOVU1CRVIsICROdW1iZXIpO1xufSIsInZhciAkICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBhYnMgICA9IE1hdGguYWJzXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yXG4gICwgX2lzRmluaXRlID0gJC5nLmlzRmluaXRlXG4gICwgTUFYX1NBRkVfSU5URUdFUiA9IDB4MWZmZmZmZmZmZmZmZmY7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTE7XG5mdW5jdGlvbiBpc0ludGVnZXIoaXQpe1xuICByZXR1cm4gISQuaXNPYmplY3QoaXQpICYmIF9pc0Zpbml0ZShpdCkgJiYgZmxvb3IoaXQpID09PSBpdDtcbn1cbiRkZWYoJGRlZi5TLCAnTnVtYmVyJywge1xuICAvLyAyMC4xLjIuMSBOdW1iZXIuRVBTSUxPTlxuICBFUFNJTE9OOiBNYXRoLnBvdygyLCAtNTIpLFxuICAvLyAyMC4xLjIuMiBOdW1iZXIuaXNGaW5pdGUobnVtYmVyKVxuICBpc0Zpbml0ZTogZnVuY3Rpb24gaXNGaW5pdGUoaXQpe1xuICAgIHJldHVybiB0eXBlb2YgaXQgPT0gJ251bWJlcicgJiYgX2lzRmluaXRlKGl0KTtcbiAgfSxcbiAgLy8gMjAuMS4yLjMgTnVtYmVyLmlzSW50ZWdlcihudW1iZXIpXG4gIGlzSW50ZWdlcjogaXNJbnRlZ2VyLFxuICAvLyAyMC4xLjIuNCBOdW1iZXIuaXNOYU4obnVtYmVyKVxuICBpc05hTjogZnVuY3Rpb24gaXNOYU4obnVtYmVyKXtcbiAgICByZXR1cm4gbnVtYmVyICE9IG51bWJlcjtcbiAgfSxcbiAgLy8gMjAuMS4yLjUgTnVtYmVyLmlzU2FmZUludGVnZXIobnVtYmVyKVxuICBpc1NhZmVJbnRlZ2VyOiBmdW5jdGlvbiBpc1NhZmVJbnRlZ2VyKG51bWJlcil7XG4gICAgcmV0dXJuIGlzSW50ZWdlcihudW1iZXIpICYmIGFicyhudW1iZXIpIDw9IE1BWF9TQUZFX0lOVEVHRVI7XG4gIH0sXG4gIC8vIDIwLjEuMi42IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXG4gIE1BWF9TQUZFX0lOVEVHRVI6IE1BWF9TQUZFX0lOVEVHRVIsXG4gIC8vIDIwLjEuMi4xMCBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUlxuICBNSU5fU0FGRV9JTlRFR0VSOiAtTUFYX1NBRkVfSU5URUdFUixcbiAgLy8gMjAuMS4yLjEyIE51bWJlci5wYXJzZUZsb2F0KHN0cmluZylcbiAgcGFyc2VGbG9hdDogcGFyc2VGbG9hdCxcbiAgLy8gMjAuMS4yLjEzIE51bWJlci5wYXJzZUludChzdHJpbmcsIHJhZGl4KVxuICBwYXJzZUludDogcGFyc2VJbnRcbn0pOyIsIi8vIDE5LjEuMy4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UpXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge2Fzc2lnbjogcmVxdWlyZSgnLi8kLmFzc2lnbicpfSk7IiwiLy8gMTkuMS4zLjEwIE9iamVjdC5pcyh2YWx1ZTEsIHZhbHVlMilcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XG4gIGlzOiBmdW5jdGlvbiBpcyh4LCB5KXtcbiAgICByZXR1cm4geCA9PT0geSA/IHggIT09IDAgfHwgMSAvIHggPT09IDEgLyB5IDogeCAhPSB4ICYmIHkgIT0geTtcbiAgfVxufSk7IiwiLy8gMTkuMS4zLjE5IE9iamVjdC5zZXRQcm90b3R5cGVPZihPLCBwcm90bylcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7c2V0UHJvdG90eXBlT2Y6IHJlcXVpcmUoJy4vJC5zZXQtcHJvdG8nKS5zZXR9KTsiLCJ2YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgaXNPYmplY3QgPSAkLmlzT2JqZWN0XG4gICwgdG9PYmplY3QgPSAkLnRvT2JqZWN0O1xuJC5lYWNoLmNhbGwoKCdmcmVlemUsc2VhbCxwcmV2ZW50RXh0ZW5zaW9ucyxpc0Zyb3plbixpc1NlYWxlZCxpc0V4dGVuc2libGUsJyArXG4gICdnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsZ2V0UHJvdG90eXBlT2Ysa2V5cyxnZXRPd25Qcm9wZXJ0eU5hbWVzJykuc3BsaXQoJywnKVxuLCBmdW5jdGlvbihLRVksIElEKXtcbiAgdmFyIGZuICAgICA9ICgkLmNvcmUuT2JqZWN0IHx8IHt9KVtLRVldIHx8IE9iamVjdFtLRVldXG4gICAgLCBmb3JjZWQgPSAwXG4gICAgLCBtZXRob2QgPSB7fTtcbiAgbWV0aG9kW0tFWV0gPSBJRCA9PSAwID8gZnVuY3Rpb24gZnJlZXplKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogaXQ7XG4gIH0gOiBJRCA9PSAxID8gZnVuY3Rpb24gc2VhbChpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xuICB9IDogSUQgPT0gMiA/IGZ1bmN0aW9uIHByZXZlbnRFeHRlbnNpb25zKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogaXQ7XG4gIH0gOiBJRCA9PSAzID8gZnVuY3Rpb24gaXNGcm96ZW4oaXQpe1xuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiB0cnVlO1xuICB9IDogSUQgPT0gNCA/IGZ1bmN0aW9uIGlzU2VhbGVkKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogdHJ1ZTtcbiAgfSA6IElEID09IDUgPyBmdW5jdGlvbiBpc0V4dGVuc2libGUoaXQpe1xuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBmYWxzZTtcbiAgfSA6IElEID09IDYgPyBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gICAgcmV0dXJuIGZuKHRvT2JqZWN0KGl0KSwga2V5KTtcbiAgfSA6IElEID09IDcgPyBmdW5jdGlvbiBnZXRQcm90b3R5cGVPZihpdCl7XG4gICAgcmV0dXJuIGZuKE9iamVjdCgkLmFzc2VydERlZmluZWQoaXQpKSk7XG4gIH0gOiBJRCA9PSA4ID8gZnVuY3Rpb24ga2V5cyhpdCl7XG4gICAgcmV0dXJuIGZuKHRvT2JqZWN0KGl0KSk7XG4gIH0gOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KXtcbiAgICByZXR1cm4gZm4odG9PYmplY3QoaXQpKTtcbiAgfTtcbiAgdHJ5IHtcbiAgICBmbigneicpO1xuICB9IGNhdGNoKGUpe1xuICAgIGZvcmNlZCA9IDE7XG4gIH1cbiAgJGRlZigkZGVmLlMgKyAkZGVmLkYgKiBmb3JjZWQsICdPYmplY3QnLCBtZXRob2QpO1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgdG1wID0ge307XG50bXBbcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpXSA9ICd6JztcbmlmKHJlcXVpcmUoJy4vJCcpLkZXICYmIGNvZih0bXApICE9ICd6Jyl7XG4gIHJlcXVpcmUoJy4vJC5yZWRlZicpKE9iamVjdC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuICdbb2JqZWN0ICcgKyBjb2YuY2xhc3NvZih0aGlzKSArICddJztcbiAgfSwgdHJ1ZSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjdHggICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIGNvZiAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBhc3NlcnQgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxuICAsIGZvck9mICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgc2V0UHJvdG8gPSByZXF1aXJlKCcuLyQuc2V0LXByb3RvJykuc2V0XG4gICwgc3BlY2llcyAgPSByZXF1aXJlKCcuLyQuc3BlY2llcycpXG4gICwgU1BFQ0lFUyAgPSByZXF1aXJlKCcuLyQud2tzJykoJ3NwZWNpZXMnKVxuICAsIFJFQ09SRCAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ3JlY29yZCcpXG4gICwgUFJPTUlTRSAgPSAnUHJvbWlzZSdcbiAgLCBnbG9iYWwgICA9ICQuZ1xuICAsIHByb2Nlc3MgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBhc2FwICAgICA9IHByb2Nlc3MgJiYgcHJvY2Vzcy5uZXh0VGljayB8fCByZXF1aXJlKCcuLyQudGFzaycpLnNldFxuICAsIFAgICAgICAgID0gZ2xvYmFsW1BST01JU0VdXG4gICwgaXNGdW5jdGlvbiAgICAgPSAkLmlzRnVuY3Rpb25cbiAgLCBpc09iamVjdCAgICAgICA9ICQuaXNPYmplY3RcbiAgLCBhc3NlcnRGdW5jdGlvbiA9IGFzc2VydC5mblxuICAsIGFzc2VydE9iamVjdCAgID0gYXNzZXJ0Lm9iajtcblxudmFyIHVzZU5hdGl2ZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0ZXN0LCB3b3JrcyA9IGZhbHNlO1xuICBmdW5jdGlvbiBQMih4KXtcbiAgICB2YXIgc2VsZiA9IG5ldyBQKHgpO1xuICAgIHNldFByb3RvKHNlbGYsIFAyLnByb3RvdHlwZSk7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cbiAgdHJ5IHtcbiAgICB3b3JrcyA9IGlzRnVuY3Rpb24oUCkgJiYgaXNGdW5jdGlvbihQLnJlc29sdmUpICYmIFAucmVzb2x2ZSh0ZXN0ID0gbmV3IFAoZnVuY3Rpb24oKXt9KSkgPT0gdGVzdDtcbiAgICBzZXRQcm90byhQMiwgUCk7XG4gICAgUDIucHJvdG90eXBlID0gJC5jcmVhdGUoUC5wcm90b3R5cGUsIHtjb25zdHJ1Y3Rvcjoge3ZhbHVlOiBQMn19KTtcbiAgICAvLyBhY3R1YWwgRmlyZWZveCBoYXMgYnJva2VuIHN1YmNsYXNzIHN1cHBvcnQsIHRlc3QgdGhhdFxuICAgIGlmKCEoUDIucmVzb2x2ZSg1KS50aGVuKGZ1bmN0aW9uKCl7fSkgaW5zdGFuY2VvZiBQMikpe1xuICAgICAgd29ya3MgPSBmYWxzZTtcbiAgICB9XG4gIH0gY2F0Y2goZSl7IHdvcmtzID0gZmFsc2U7IH1cbiAgcmV0dXJuIHdvcmtzO1xufSgpO1xuXG4vLyBoZWxwZXJzXG5mdW5jdGlvbiBnZXRDb25zdHJ1Y3RvcihDKXtcbiAgdmFyIFMgPSBhc3NlcnRPYmplY3QoQylbU1BFQ0lFU107XG4gIHJldHVybiBTICE9IHVuZGVmaW5lZCA/IFMgOiBDO1xufVxuZnVuY3Rpb24gaXNUaGVuYWJsZShpdCl7XG4gIHZhciB0aGVuO1xuICBpZihpc09iamVjdChpdCkpdGhlbiA9IGl0LnRoZW47XG4gIHJldHVybiBpc0Z1bmN0aW9uKHRoZW4pID8gdGhlbiA6IGZhbHNlO1xufVxuZnVuY3Rpb24gbm90aWZ5KHJlY29yZCl7XG4gIHZhciBjaGFpbiA9IHJlY29yZC5jO1xuICBpZihjaGFpbi5sZW5ndGgpYXNhcChmdW5jdGlvbigpe1xuICAgIHZhciB2YWx1ZSA9IHJlY29yZC52XG4gICAgICAsIG9rICAgID0gcmVjb3JkLnMgPT0gMVxuICAgICAgLCBpICAgICA9IDA7XG4gICAgZnVuY3Rpb24gcnVuKHJlYWN0KXtcbiAgICAgIHZhciBjYiA9IG9rID8gcmVhY3Qub2sgOiByZWFjdC5mYWlsXG4gICAgICAgICwgcmV0LCB0aGVuO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYoY2Ipe1xuICAgICAgICAgIGlmKCFvaylyZWNvcmQuaCA9IHRydWU7XG4gICAgICAgICAgcmV0ID0gY2IgPT09IHRydWUgPyB2YWx1ZSA6IGNiKHZhbHVlKTtcbiAgICAgICAgICBpZihyZXQgPT09IHJlYWN0LlApe1xuICAgICAgICAgICAgcmVhY3QucmVqKFR5cGVFcnJvcignUHJvbWlzZS1jaGFpbiBjeWNsZScpKTtcbiAgICAgICAgICB9IGVsc2UgaWYodGhlbiA9IGlzVGhlbmFibGUocmV0KSl7XG4gICAgICAgICAgICB0aGVuLmNhbGwocmV0LCByZWFjdC5yZXMsIHJlYWN0LnJlaik7XG4gICAgICAgICAgfSBlbHNlIHJlYWN0LnJlcyhyZXQpO1xuICAgICAgICB9IGVsc2UgcmVhY3QucmVqKHZhbHVlKTtcbiAgICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICAgcmVhY3QucmVqKGVycik7XG4gICAgICB9XG4gICAgfVxuICAgIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpcnVuKGNoYWluW2krK10pOyAvLyB2YXJpYWJsZSBsZW5ndGggLSBjYW4ndCB1c2UgZm9yRWFjaFxuICAgIGNoYWluLmxlbmd0aCA9IDA7XG4gIH0pO1xufVxuZnVuY3Rpb24gaXNVbmhhbmRsZWQocHJvbWlzZSl7XG4gIHZhciByZWNvcmQgPSBwcm9taXNlW1JFQ09SRF1cbiAgICAsIGNoYWluICA9IHJlY29yZC5hIHx8IHJlY29yZC5jXG4gICAgLCBpICAgICAgPSAwXG4gICAgLCByZWFjdDtcbiAgaWYocmVjb3JkLmgpcmV0dXJuIGZhbHNlO1xuICB3aGlsZShjaGFpbi5sZW5ndGggPiBpKXtcbiAgICByZWFjdCA9IGNoYWluW2krK107XG4gICAgaWYocmVhY3QuZmFpbCB8fCAhaXNVbmhhbmRsZWQocmVhY3QuUCkpcmV0dXJuIGZhbHNlO1xuICB9IHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gJHJlamVjdCh2YWx1ZSl7XG4gIHZhciByZWNvcmQgPSB0aGlzXG4gICAgLCBwcm9taXNlO1xuICBpZihyZWNvcmQuZClyZXR1cm47XG4gIHJlY29yZC5kID0gdHJ1ZTtcbiAgcmVjb3JkID0gcmVjb3JkLnIgfHwgcmVjb3JkOyAvLyB1bndyYXBcbiAgcmVjb3JkLnYgPSB2YWx1ZTtcbiAgcmVjb3JkLnMgPSAyO1xuICByZWNvcmQuYSA9IHJlY29yZC5jLnNsaWNlKCk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICBhc2FwKGZ1bmN0aW9uKCl7XG4gICAgICBpZihpc1VuaGFuZGxlZChwcm9taXNlID0gcmVjb3JkLnApKXtcbiAgICAgICAgaWYoY29mKHByb2Nlc3MpID09ICdwcm9jZXNzJyl7XG4gICAgICAgICAgcHJvY2Vzcy5lbWl0KCd1bmhhbmRsZWRSZWplY3Rpb24nLCB2YWx1ZSwgcHJvbWlzZSk7XG4gICAgICAgIH0gZWxzZSBpZihnbG9iYWwuY29uc29sZSAmJiBpc0Z1bmN0aW9uKGNvbnNvbGUuZXJyb3IpKXtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb24nLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlY29yZC5hID0gdW5kZWZpbmVkO1xuICAgIH0pO1xuICB9LCAxKTtcbiAgbm90aWZ5KHJlY29yZCk7XG59XG5mdW5jdGlvbiAkcmVzb2x2ZSh2YWx1ZSl7XG4gIHZhciByZWNvcmQgPSB0aGlzXG4gICAgLCB0aGVuLCB3cmFwcGVyO1xuICBpZihyZWNvcmQuZClyZXR1cm47XG4gIHJlY29yZC5kID0gdHJ1ZTtcbiAgcmVjb3JkID0gcmVjb3JkLnIgfHwgcmVjb3JkOyAvLyB1bndyYXBcbiAgdHJ5IHtcbiAgICBpZih0aGVuID0gaXNUaGVuYWJsZSh2YWx1ZSkpe1xuICAgICAgd3JhcHBlciA9IHtyOiByZWNvcmQsIGQ6IGZhbHNlfTsgLy8gd3JhcFxuICAgICAgdGhlbi5jYWxsKHZhbHVlLCBjdHgoJHJlc29sdmUsIHdyYXBwZXIsIDEpLCBjdHgoJHJlamVjdCwgd3JhcHBlciwgMSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWNvcmQudiA9IHZhbHVlO1xuICAgICAgcmVjb3JkLnMgPSAxO1xuICAgICAgbm90aWZ5KHJlY29yZCk7XG4gICAgfVxuICB9IGNhdGNoKGVycil7XG4gICAgJHJlamVjdC5jYWxsKHdyYXBwZXIgfHwge3I6IHJlY29yZCwgZDogZmFsc2V9LCBlcnIpOyAvLyB3cmFwXG4gIH1cbn1cblxuLy8gY29uc3RydWN0b3IgcG9seWZpbGxcbmlmKCF1c2VOYXRpdmUpe1xuICAvLyAyNS40LjMuMSBQcm9taXNlKGV4ZWN1dG9yKVxuICBQID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcil7XG4gICAgYXNzZXJ0RnVuY3Rpb24oZXhlY3V0b3IpO1xuICAgIHZhciByZWNvcmQgPSB7XG4gICAgICBwOiBhc3NlcnQuaW5zdCh0aGlzLCBQLCBQUk9NSVNFKSwgICAgICAgLy8gPC0gcHJvbWlzZVxuICAgICAgYzogW10sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGF3YWl0aW5nIHJlYWN0aW9uc1xuICAgICAgYTogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGNoZWNrZWQgaW4gaXNVbmhhbmRsZWQgcmVhY3Rpb25zXG4gICAgICBzOiAwLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gc3RhdGVcbiAgICAgIGQ6IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBkb25lXG4gICAgICB2OiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gdmFsdWVcbiAgICAgIGg6IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBoYW5kbGVkIHJlamVjdGlvblxuICAgIH07XG4gICAgJC5oaWRlKHRoaXMsIFJFQ09SRCwgcmVjb3JkKTtcbiAgICB0cnkge1xuICAgICAgZXhlY3V0b3IoY3R4KCRyZXNvbHZlLCByZWNvcmQsIDEpLCBjdHgoJHJlamVjdCwgcmVjb3JkLCAxKSk7XG4gICAgfSBjYXRjaChlcnIpe1xuICAgICAgJHJlamVjdC5jYWxsKHJlY29yZCwgZXJyKTtcbiAgICB9XG4gIH07XG4gIHJlcXVpcmUoJy4vJC5taXgnKShQLnByb3RvdHlwZSwge1xuICAgIC8vIDI1LjQuNS4zIFByb21pc2UucHJvdG90eXBlLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCl7XG4gICAgICB2YXIgUyA9IGFzc2VydE9iamVjdChhc3NlcnRPYmplY3QodGhpcykuY29uc3RydWN0b3IpW1NQRUNJRVNdO1xuICAgICAgdmFyIHJlYWN0ID0ge1xuICAgICAgICBvazogICBpc0Z1bmN0aW9uKG9uRnVsZmlsbGVkKSA/IG9uRnVsZmlsbGVkIDogdHJ1ZSxcbiAgICAgICAgZmFpbDogaXNGdW5jdGlvbihvblJlamVjdGVkKSAgPyBvblJlamVjdGVkICA6IGZhbHNlXG4gICAgICB9O1xuICAgICAgdmFyIHByb21pc2UgPSByZWFjdC5QID0gbmV3IChTICE9IHVuZGVmaW5lZCA/IFMgOiBQKShmdW5jdGlvbihyZXMsIHJlail7XG4gICAgICAgIHJlYWN0LnJlcyA9IGFzc2VydEZ1bmN0aW9uKHJlcyk7XG4gICAgICAgIHJlYWN0LnJlaiA9IGFzc2VydEZ1bmN0aW9uKHJlaik7XG4gICAgICB9KTtcbiAgICAgIHZhciByZWNvcmQgPSB0aGlzW1JFQ09SRF07XG4gICAgICByZWNvcmQuYy5wdXNoKHJlYWN0KTtcbiAgICAgIGlmKHJlY29yZC5hKXJlY29yZC5hLnB1c2gocmVhY3QpO1xuICAgICAgcmVjb3JkLnMgJiYgbm90aWZ5KHJlY29yZCk7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9LFxuICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24ob25SZWplY3RlZCl7XG4gICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gZXhwb3J0XG4kZGVmKCRkZWYuRyArICRkZWYuVyArICRkZWYuRiAqICF1c2VOYXRpdmUsIHtQcm9taXNlOiBQfSk7XG5jb2Yuc2V0KFAsIFBST01JU0UpO1xuc3BlY2llcyhQKTtcbnNwZWNpZXMoJC5jb3JlW1BST01JU0VdKTsgLy8gZm9yIHdyYXBwZXJcblxuLy8gc3RhdGljc1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC41IFByb21pc2UucmVqZWN0KHIpXG4gIHJlamVjdDogZnVuY3Rpb24gcmVqZWN0KHIpe1xuICAgIHJldHVybiBuZXcgKGdldENvbnN0cnVjdG9yKHRoaXMpKShmdW5jdGlvbihyZXMsIHJlail7XG4gICAgICByZWoocik7XG4gICAgfSk7XG4gIH0sXG4gIC8vIDI1LjQuNC42IFByb21pc2UucmVzb2x2ZSh4KVxuICByZXNvbHZlOiBmdW5jdGlvbiByZXNvbHZlKHgpe1xuICAgIHJldHVybiBpc09iamVjdCh4KSAmJiBSRUNPUkQgaW4geCAmJiAkLmdldFByb3RvKHgpID09PSB0aGlzLnByb3RvdHlwZVxuICAgICAgPyB4IDogbmV3IChnZXRDb25zdHJ1Y3Rvcih0aGlzKSkoZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgcmVzKHgpO1xuICAgICAgfSk7XG4gIH1cbn0pO1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhKHVzZU5hdGl2ZSAmJiByZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXtcbiAgUC5hbGwoaXRlcilbJ2NhdGNoJ10oZnVuY3Rpb24oKXt9KTtcbn0pKSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuMSBQcm9taXNlLmFsbChpdGVyYWJsZSlcbiAgYWxsOiBmdW5jdGlvbiBhbGwoaXRlcmFibGUpe1xuICAgIHZhciBDICAgICAgPSBnZXRDb25zdHJ1Y3Rvcih0aGlzKVxuICAgICAgLCB2YWx1ZXMgPSBbXTtcbiAgICByZXR1cm4gbmV3IEMoZnVuY3Rpb24ocmVzLCByZWope1xuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCB2YWx1ZXMucHVzaCwgdmFsdWVzKTtcbiAgICAgIHZhciByZW1haW5pbmcgPSB2YWx1ZXMubGVuZ3RoXG4gICAgICAgICwgcmVzdWx0cyAgID0gQXJyYXkocmVtYWluaW5nKTtcbiAgICAgIGlmKHJlbWFpbmluZykkLmVhY2guY2FsbCh2YWx1ZXMsIGZ1bmN0aW9uKHByb21pc2UsIGluZGV4KXtcbiAgICAgICAgQy5yZXNvbHZlKHByb21pc2UpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzKHJlc3VsdHMpO1xuICAgICAgICB9LCByZWopO1xuICAgICAgfSk7XG4gICAgICBlbHNlIHJlcyhyZXN1bHRzKTtcbiAgICB9KTtcbiAgfSxcbiAgLy8gMjUuNC40LjQgUHJvbWlzZS5yYWNlKGl0ZXJhYmxlKVxuICByYWNlOiBmdW5jdGlvbiByYWNlKGl0ZXJhYmxlKXtcbiAgICB2YXIgQyA9IGdldENvbnN0cnVjdG9yKHRoaXMpO1xuICAgIHJldHVybiBuZXcgQyhmdW5jdGlvbihyZXMsIHJlail7XG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIGZ1bmN0aW9uKHByb21pc2Upe1xuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihyZXMsIHJlaik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufSk7IiwidmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgc2V0UHJvdG8gID0gcmVxdWlyZSgnLi8kLnNldC1wcm90bycpXG4gICwgJGl0ZXIgICAgID0gcmVxdWlyZSgnLi8kLml0ZXInKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIElURVIgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdpdGVyJylcbiAgLCBzdGVwICAgICAgPSAkaXRlci5zdGVwXG4gICwgYXNzZXJ0ICAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXG4gICwgaXNPYmplY3QgID0gJC5pc09iamVjdFxuICAsIGdldFByb3RvICA9ICQuZ2V0UHJvdG9cbiAgLCAkUmVmbGVjdCAgPSAkLmcuUmVmbGVjdFxuICAsIF9hcHBseSAgICA9IEZ1bmN0aW9uLmFwcGx5XG4gICwgYXNzZXJ0T2JqZWN0ID0gYXNzZXJ0Lm9ialxuICAsIF9pc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8ICQuaXNPYmplY3RcbiAgLCBfcHJldmVudEV4dGVuc2lvbnMgPSBPYmplY3QucHJldmVudEV4dGVuc2lvbnMgfHwgJC5pdFxuICAvLyBJRSBUUCBoYXMgYnJva2VuIFJlZmxlY3QuZW51bWVyYXRlXG4gICwgYnVnZ3lFbnVtZXJhdGUgPSAhKCRSZWZsZWN0ICYmICRSZWZsZWN0LmVudW1lcmF0ZSAmJiBJVEVSQVRPUiBpbiAkUmVmbGVjdC5lbnVtZXJhdGUoe30pKTtcblxuZnVuY3Rpb24gRW51bWVyYXRlKGl0ZXJhdGVkKXtcbiAgJC5zZXQodGhpcywgSVRFUiwge286IGl0ZXJhdGVkLCBrOiB1bmRlZmluZWQsIGk6IDB9KTtcbn1cbiRpdGVyLmNyZWF0ZShFbnVtZXJhdGUsICdPYmplY3QnLCBmdW5jdGlvbigpe1xuICB2YXIgaXRlciA9IHRoaXNbSVRFUl1cbiAgICAsIGtleXMgPSBpdGVyLmtcbiAgICAsIGtleTtcbiAgaWYoa2V5cyA9PSB1bmRlZmluZWQpe1xuICAgIGl0ZXIuayA9IGtleXMgPSBbXTtcbiAgICBmb3Ioa2V5IGluIGl0ZXIubylrZXlzLnB1c2goa2V5KTtcbiAgfVxuICBkbyB7XG4gICAgaWYoaXRlci5pID49IGtleXMubGVuZ3RoKXJldHVybiBzdGVwKDEpO1xuICB9IHdoaWxlKCEoKGtleSA9IGtleXNbaXRlci5pKytdKSBpbiBpdGVyLm8pKTtcbiAgcmV0dXJuIHN0ZXAoMCwga2V5KTtcbn0pO1xuXG52YXIgcmVmbGVjdCA9IHtcbiAgLy8gMjYuMS4xIFJlZmxlY3QuYXBwbHkodGFyZ2V0LCB0aGlzQXJndW1lbnQsIGFyZ3VtZW50c0xpc3QpXG4gIGFwcGx5OiBmdW5jdGlvbiBhcHBseSh0YXJnZXQsIHRoaXNBcmd1bWVudCwgYXJndW1lbnRzTGlzdCl7XG4gICAgcmV0dXJuIF9hcHBseS5jYWxsKHRhcmdldCwgdGhpc0FyZ3VtZW50LCBhcmd1bWVudHNMaXN0KTtcbiAgfSxcbiAgLy8gMjYuMS4yIFJlZmxlY3QuY29uc3RydWN0KHRhcmdldCwgYXJndW1lbnRzTGlzdCBbLCBuZXdUYXJnZXRdKVxuICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uIGNvbnN0cnVjdCh0YXJnZXQsIGFyZ3VtZW50c0xpc3QgLyosIG5ld1RhcmdldCovKXtcbiAgICB2YXIgcHJvdG8gICAgPSBhc3NlcnQuZm4oYXJndW1lbnRzLmxlbmd0aCA8IDMgPyB0YXJnZXQgOiBhcmd1bWVudHNbMl0pLnByb3RvdHlwZVxuICAgICAgLCBpbnN0YW5jZSA9ICQuY3JlYXRlKGlzT2JqZWN0KHByb3RvKSA/IHByb3RvIDogT2JqZWN0LnByb3RvdHlwZSlcbiAgICAgICwgcmVzdWx0ICAgPSBfYXBwbHkuY2FsbCh0YXJnZXQsIGluc3RhbmNlLCBhcmd1bWVudHNMaXN0KTtcbiAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IGluc3RhbmNlO1xuICB9LFxuICAvLyAyNi4xLjMgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCBhdHRyaWJ1dGVzKVxuICBkZWZpbmVQcm9wZXJ0eTogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcyl7XG4gICAgYXNzZXJ0T2JqZWN0KHRhcmdldCk7XG4gICAgdHJ5IHtcbiAgICAgICQuc2V0RGVzYyh0YXJnZXQsIHByb3BlcnR5S2V5LCBhdHRyaWJ1dGVzKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9LFxuICAvLyAyNi4xLjQgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5KVxuICBkZWxldGVQcm9wZXJ0eTogZnVuY3Rpb24gZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSl7XG4gICAgdmFyIGRlc2MgPSAkLmdldERlc2MoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KTtcbiAgICByZXR1cm4gZGVzYyAmJiAhZGVzYy5jb25maWd1cmFibGUgPyBmYWxzZSA6IGRlbGV0ZSB0YXJnZXRbcHJvcGVydHlLZXldO1xuICB9LFxuICAvLyAyNi4xLjYgUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSBbLCByZWNlaXZlcl0pXG4gIGdldDogZnVuY3Rpb24gZ2V0KHRhcmdldCwgcHJvcGVydHlLZXkvKiwgcmVjZWl2ZXIqLyl7XG4gICAgdmFyIHJlY2VpdmVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDMgPyB0YXJnZXQgOiBhcmd1bWVudHNbMl1cbiAgICAgICwgZGVzYyA9ICQuZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpLCBwcm90bztcbiAgICBpZihkZXNjKXJldHVybiAkLmhhcyhkZXNjLCAndmFsdWUnKVxuICAgICAgPyBkZXNjLnZhbHVlXG4gICAgICA6IGRlc2MuZ2V0ID09PSB1bmRlZmluZWRcbiAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgOiBkZXNjLmdldC5jYWxsKHJlY2VpdmVyKTtcbiAgICByZXR1cm4gaXNPYmplY3QocHJvdG8gPSBnZXRQcm90byh0YXJnZXQpKVxuICAgICAgPyBnZXQocHJvdG8sIHByb3BlcnR5S2V5LCByZWNlaXZlcilcbiAgICAgIDogdW5kZWZpbmVkO1xuICB9LFxuICAvLyAyNi4xLjcgUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSlcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSl7XG4gICAgcmV0dXJuICQuZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpO1xuICB9LFxuICAvLyAyNi4xLjggUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0YXJnZXQpXG4gIGdldFByb3RvdHlwZU9mOiBmdW5jdGlvbiBnZXRQcm90b3R5cGVPZih0YXJnZXQpe1xuICAgIHJldHVybiBnZXRQcm90byhhc3NlcnRPYmplY3QodGFyZ2V0KSk7XG4gIH0sXG4gIC8vIDI2LjEuOSBSZWZsZWN0Lmhhcyh0YXJnZXQsIHByb3BlcnR5S2V5KVxuICBoYXM6IGZ1bmN0aW9uIGhhcyh0YXJnZXQsIHByb3BlcnR5S2V5KXtcbiAgICByZXR1cm4gcHJvcGVydHlLZXkgaW4gdGFyZ2V0O1xuICB9LFxuICAvLyAyNi4xLjEwIFJlZmxlY3QuaXNFeHRlbnNpYmxlKHRhcmdldClcbiAgaXNFeHRlbnNpYmxlOiBmdW5jdGlvbiBpc0V4dGVuc2libGUodGFyZ2V0KXtcbiAgICByZXR1cm4gX2lzRXh0ZW5zaWJsZShhc3NlcnRPYmplY3QodGFyZ2V0KSk7XG4gIH0sXG4gIC8vIDI2LjEuMTEgUmVmbGVjdC5vd25LZXlzKHRhcmdldClcbiAgb3duS2V5czogcmVxdWlyZSgnLi8kLm93bi1rZXlzJyksXG4gIC8vIDI2LjEuMTIgUmVmbGVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh0YXJnZXQpXG4gIHByZXZlbnRFeHRlbnNpb25zOiBmdW5jdGlvbiBwcmV2ZW50RXh0ZW5zaW9ucyh0YXJnZXQpe1xuICAgIGFzc2VydE9iamVjdCh0YXJnZXQpO1xuICAgIHRyeSB7XG4gICAgICBfcHJldmVudEV4dGVuc2lvbnModGFyZ2V0KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9LFxuICAvLyAyNi4xLjEzIFJlZmxlY3Quc2V0KHRhcmdldCwgcHJvcGVydHlLZXksIFYgWywgcmVjZWl2ZXJdKVxuICBzZXQ6IGZ1bmN0aW9uIHNldCh0YXJnZXQsIHByb3BlcnR5S2V5LCBWLyosIHJlY2VpdmVyKi8pe1xuICAgIHZhciByZWNlaXZlciA9IGFyZ3VtZW50cy5sZW5ndGggPCA0ID8gdGFyZ2V0IDogYXJndW1lbnRzWzNdXG4gICAgICAsIG93bkRlc2MgID0gJC5nZXREZXNjKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSlcbiAgICAgICwgZXhpc3RpbmdEZXNjcmlwdG9yLCBwcm90bztcbiAgICBpZighb3duRGVzYyl7XG4gICAgICBpZihpc09iamVjdChwcm90byA9IGdldFByb3RvKHRhcmdldCkpKXtcbiAgICAgICAgcmV0dXJuIHNldChwcm90bywgcHJvcGVydHlLZXksIFYsIHJlY2VpdmVyKTtcbiAgICAgIH1cbiAgICAgIG93bkRlc2MgPSAkLmRlc2MoMCk7XG4gICAgfVxuICAgIGlmKCQuaGFzKG93bkRlc2MsICd2YWx1ZScpKXtcbiAgICAgIGlmKG93bkRlc2Mud3JpdGFibGUgPT09IGZhbHNlIHx8ICFpc09iamVjdChyZWNlaXZlcikpcmV0dXJuIGZhbHNlO1xuICAgICAgZXhpc3RpbmdEZXNjcmlwdG9yID0gJC5nZXREZXNjKHJlY2VpdmVyLCBwcm9wZXJ0eUtleSkgfHwgJC5kZXNjKDApO1xuICAgICAgZXhpc3RpbmdEZXNjcmlwdG9yLnZhbHVlID0gVjtcbiAgICAgICQuc2V0RGVzYyhyZWNlaXZlciwgcHJvcGVydHlLZXksIGV4aXN0aW5nRGVzY3JpcHRvcik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG93bkRlc2Muc2V0ID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IChvd25EZXNjLnNldC5jYWxsKHJlY2VpdmVyLCBWKSwgdHJ1ZSk7XG4gIH1cbn07XG4vLyAyNi4xLjE0IFJlZmxlY3Quc2V0UHJvdG90eXBlT2YodGFyZ2V0LCBwcm90bylcbmlmKHNldFByb3RvKXJlZmxlY3Quc2V0UHJvdG90eXBlT2YgPSBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZih0YXJnZXQsIHByb3RvKXtcbiAgc2V0UHJvdG8uY2hlY2sodGFyZ2V0LCBwcm90byk7XG4gIHRyeSB7XG4gICAgc2V0UHJvdG8uc2V0KHRhcmdldCwgcHJvdG8pO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuJGRlZigkZGVmLkcsIHtSZWZsZWN0OiB7fX0pO1xuXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqIGJ1Z2d5RW51bWVyYXRlLCAnUmVmbGVjdCcsIHtcbiAgLy8gMjYuMS41IFJlZmxlY3QuZW51bWVyYXRlKHRhcmdldClcbiAgZW51bWVyYXRlOiBmdW5jdGlvbiBlbnVtZXJhdGUodGFyZ2V0KXtcbiAgICByZXR1cm4gbmV3IEVudW1lcmF0ZShhc3NlcnRPYmplY3QodGFyZ2V0KSk7XG4gIH1cbn0pO1xuXG4kZGVmKCRkZWYuUywgJ1JlZmxlY3QnLCByZWZsZWN0KTsiLCJ2YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY29mICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsICRSZWdFeHAgPSAkLmcuUmVnRXhwXG4gICwgQmFzZSAgICA9ICRSZWdFeHBcbiAgLCBwcm90byAgID0gJFJlZ0V4cC5wcm90b3R5cGVcbiAgLCByZSAgICAgID0gL2EvZ1xuICAvLyBcIm5ld1wiIGNyZWF0ZXMgYSBuZXcgb2JqZWN0XG4gICwgQ09SUkVDVF9ORVcgPSBuZXcgJFJlZ0V4cChyZSkgIT09IHJlXG4gIC8vIFJlZ0V4cCBhbGxvd3MgYSByZWdleCB3aXRoIGZsYWdzIGFzIHRoZSBwYXR0ZXJuXG4gICwgQUxMT1dTX1JFX1dJVEhfRkxBR1MgPSBmdW5jdGlvbigpe1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gJFJlZ0V4cChyZSwgJ2knKSA9PSAnL2EvaSc7XG4gICAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICB9KCk7XG5pZigkLkZXICYmICQuREVTQyl7XG4gIGlmKCFDT1JSRUNUX05FVyB8fCAhQUxMT1dTX1JFX1dJVEhfRkxBR1Mpe1xuICAgICRSZWdFeHAgPSBmdW5jdGlvbiBSZWdFeHAocGF0dGVybiwgZmxhZ3Mpe1xuICAgICAgdmFyIHBhdHRlcm5Jc1JlZ0V4cCAgPSBjb2YocGF0dGVybikgPT0gJ1JlZ0V4cCdcbiAgICAgICAgLCBmbGFnc0lzVW5kZWZpbmVkID0gZmxhZ3MgPT09IHVuZGVmaW5lZDtcbiAgICAgIGlmKCEodGhpcyBpbnN0YW5jZW9mICRSZWdFeHApICYmIHBhdHRlcm5Jc1JlZ0V4cCAmJiBmbGFnc0lzVW5kZWZpbmVkKXJldHVybiBwYXR0ZXJuO1xuICAgICAgcmV0dXJuIENPUlJFQ1RfTkVXXG4gICAgICAgID8gbmV3IEJhc2UocGF0dGVybklzUmVnRXhwICYmICFmbGFnc0lzVW5kZWZpbmVkID8gcGF0dGVybi5zb3VyY2UgOiBwYXR0ZXJuLCBmbGFncylcbiAgICAgICAgOiBuZXcgQmFzZShwYXR0ZXJuSXNSZWdFeHAgPyBwYXR0ZXJuLnNvdXJjZSA6IHBhdHRlcm5cbiAgICAgICAgICAsIHBhdHRlcm5Jc1JlZ0V4cCAmJiBmbGFnc0lzVW5kZWZpbmVkID8gcGF0dGVybi5mbGFncyA6IGZsYWdzKTtcbiAgICB9O1xuICAgICQuZWFjaC5jYWxsKCQuZ2V0TmFtZXMoQmFzZSksIGZ1bmN0aW9uKGtleSl7XG4gICAgICBrZXkgaW4gJFJlZ0V4cCB8fCAkLnNldERlc2MoJFJlZ0V4cCwga2V5LCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gQmFzZVtrZXldOyB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGl0KXsgQmFzZVtrZXldID0gaXQ7IH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHByb3RvLmNvbnN0cnVjdG9yID0gJFJlZ0V4cDtcbiAgICAkUmVnRXhwLnByb3RvdHlwZSA9IHByb3RvO1xuICAgIHJlcXVpcmUoJy4vJC5yZWRlZicpKCQuZywgJ1JlZ0V4cCcsICRSZWdFeHApO1xuICB9XG4gIC8vIDIxLjIuNS4zIGdldCBSZWdFeHAucHJvdG90eXBlLmZsYWdzKClcbiAgaWYoLy4vZy5mbGFncyAhPSAnZycpJC5zZXREZXNjKHByb3RvLCAnZmxhZ3MnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogcmVxdWlyZSgnLi8kLnJlcGxhY2VyJykoL14uKlxcLyhcXHcqKSQvLCAnJDEnKVxuICB9KTtcbn1cbnJlcXVpcmUoJy4vJC5zcGVjaWVzJykoJFJlZ0V4cCk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHN0cm9uZyA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXN0cm9uZycpO1xuXG4vLyAyMy4yIFNldCBPYmplY3RzXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdTZXQnLCB7XG4gIC8vIDIzLjIuMy4xIFNldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxuICBhZGQ6IGZ1bmN0aW9uIGFkZCh2YWx1ZSl7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywgdmFsdWUgPSB2YWx1ZSA9PT0gMCA/IDAgOiB2YWx1ZSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcpOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJGF0ICA9IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKShmYWxzZSk7XG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcbiAgLy8gMjEuMS4zLjMgU3RyaW5nLnByb3RvdHlwZS5jb2RlUG9pbnRBdChwb3MpXG4gIGNvZGVQb2ludEF0OiBmdW5jdGlvbiBjb2RlUG9pbnRBdChwb3Mpe1xuICAgIHJldHVybiAkYXQodGhpcywgcG9zKTtcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNvZiAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgdG9MZW5ndGggPSAkLnRvTGVuZ3RoO1xuXG4vLyBzaG91bGQgdGhyb3cgZXJyb3Igb24gcmVnZXhcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogIXJlcXVpcmUoJy4vJC50aHJvd3MnKShmdW5jdGlvbigpeyAncScuZW5kc1dpdGgoLy4vKTsgfSksICdTdHJpbmcnLCB7XG4gIC8vIDIxLjEuMy42IFN0cmluZy5wcm90b3R5cGUuZW5kc1dpdGgoc2VhcmNoU3RyaW5nIFssIGVuZFBvc2l0aW9uXSlcbiAgZW5kc1dpdGg6IGZ1bmN0aW9uIGVuZHNXaXRoKHNlYXJjaFN0cmluZyAvKiwgZW5kUG9zaXRpb24gPSBAbGVuZ3RoICovKXtcbiAgICBpZihjb2Yoc2VhcmNoU3RyaW5nKSA9PSAnUmVnRXhwJyl0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB2YXIgdGhhdCA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhpcykpXG4gICAgICAsIGVuZFBvc2l0aW9uID0gYXJndW1lbnRzWzFdXG4gICAgICAsIGxlbiA9IHRvTGVuZ3RoKHRoYXQubGVuZ3RoKVxuICAgICAgLCBlbmQgPSBlbmRQb3NpdGlvbiA9PT0gdW5kZWZpbmVkID8gbGVuIDogTWF0aC5taW4odG9MZW5ndGgoZW5kUG9zaXRpb24pLCBsZW4pO1xuICAgIHNlYXJjaFN0cmluZyArPSAnJztcbiAgICByZXR1cm4gdGhhdC5zbGljZShlbmQgLSBzZWFyY2hTdHJpbmcubGVuZ3RoLCBlbmQpID09PSBzZWFyY2hTdHJpbmc7XG4gIH1cbn0pOyIsInZhciAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgdG9JbmRleCA9IHJlcXVpcmUoJy4vJCcpLnRvSW5kZXhcbiAgLCBmcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlXG4gICwgJGZyb21Db2RlUG9pbnQgPSBTdHJpbmcuZnJvbUNvZGVQb2ludDtcblxuLy8gbGVuZ3RoIHNob3VsZCBiZSAxLCBvbGQgRkYgcHJvYmxlbVxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAoISEkZnJvbUNvZGVQb2ludCAmJiAkZnJvbUNvZGVQb2ludC5sZW5ndGggIT0gMSksICdTdHJpbmcnLCB7XG4gIC8vIDIxLjEuMi4yIFN0cmluZy5mcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHMpXG4gIGZyb21Db2RlUG9pbnQ6IGZ1bmN0aW9uIGZyb21Db2RlUG9pbnQoeCl7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICB2YXIgcmVzID0gW11cbiAgICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgLCBpICAgPSAwXG4gICAgICAsIGNvZGU7XG4gICAgd2hpbGUobGVuID4gaSl7XG4gICAgICBjb2RlID0gK2FyZ3VtZW50c1tpKytdO1xuICAgICAgaWYodG9JbmRleChjb2RlLCAweDEwZmZmZikgIT09IGNvZGUpdGhyb3cgUmFuZ2VFcnJvcihjb2RlICsgJyBpcyBub3QgYSB2YWxpZCBjb2RlIHBvaW50Jyk7XG4gICAgICByZXMucHVzaChjb2RlIDwgMHgxMDAwMFxuICAgICAgICA/IGZyb21DaGFyQ29kZShjb2RlKVxuICAgICAgICA6IGZyb21DaGFyQ29kZSgoKGNvZGUgLT0gMHgxMDAwMCkgPj4gMTApICsgMHhkODAwLCBjb2RlICUgMHg0MDAgKyAweGRjMDApXG4gICAgICApO1xuICAgIH0gcmV0dXJuIHJlcy5qb2luKCcnKTtcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNvZiAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcbiAgLy8gMjEuMS4zLjcgU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlcyhzZWFyY2hTdHJpbmcsIHBvc2l0aW9uID0gMClcbiAgaW5jbHVkZXM6IGZ1bmN0aW9uIGluY2x1ZGVzKHNlYXJjaFN0cmluZyAvKiwgcG9zaXRpb24gPSAwICovKXtcbiAgICBpZihjb2Yoc2VhcmNoU3RyaW5nKSA9PSAnUmVnRXhwJyl0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICByZXR1cm4gISF+U3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSkuaW5kZXhPZihzZWFyY2hTdHJpbmcsIGFyZ3VtZW50c1sxXSk7XG4gIH1cbn0pOyIsInZhciBzZXQgICA9IHJlcXVpcmUoJy4vJCcpLnNldFxuICAsICRhdCAgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKHRydWUpXG4gICwgSVRFUiAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnaXRlcicpXG4gICwgJGl0ZXIgPSByZXF1aXJlKCcuLyQuaXRlcicpXG4gICwgc3RlcCAgPSAkaXRlci5zdGVwO1xuXG4vLyAyMS4xLjMuMjcgU3RyaW5nLnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbihpdGVyYXRlZCl7XG4gIHNldCh0aGlzLCBJVEVSLCB7bzogU3RyaW5nKGl0ZXJhdGVkKSwgaTogMH0pO1xuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxuICAgICwgTyAgICAgPSBpdGVyLm9cbiAgICAsIGluZGV4ID0gaXRlci5pXG4gICAgLCBwb2ludDtcbiAgaWYoaW5kZXggPj0gTy5sZW5ndGgpcmV0dXJuIHN0ZXAoMSk7XG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcbiAgaXRlci5pICs9IHBvaW50Lmxlbmd0aDtcbiAgcmV0dXJuIHN0ZXAoMCwgcG9pbnQpO1xufSk7IiwidmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5TLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjIuNCBTdHJpbmcucmF3KGNhbGxTaXRlLCAuLi5zdWJzdGl0dXRpb25zKVxuICByYXc6IGZ1bmN0aW9uIHJhdyhjYWxsU2l0ZSl7XG4gICAgdmFyIHRwbCA9ICQudG9PYmplY3QoY2FsbFNpdGUucmF3KVxuICAgICAgLCBsZW4gPSAkLnRvTGVuZ3RoKHRwbC5sZW5ndGgpXG4gICAgICAsIHNsbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgICwgcmVzID0gW11cbiAgICAgICwgaSAgID0gMDtcbiAgICB3aGlsZShsZW4gPiBpKXtcbiAgICAgIHJlcy5wdXNoKFN0cmluZyh0cGxbaSsrXSkpO1xuICAgICAgaWYoaSA8IHNsbilyZXMucHVzaChTdHJpbmcoYXJndW1lbnRzW2ldKSk7XG4gICAgfSByZXR1cm4gcmVzLmpvaW4oJycpO1xuICB9XG59KTsiLCJ2YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XG4gIC8vIDIxLjEuMy4xMyBTdHJpbmcucHJvdG90eXBlLnJlcGVhdChjb3VudClcbiAgcmVwZWF0OiByZXF1aXJlKCcuLyQuc3RyaW5nLXJlcGVhdCcpXG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY29mICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbi8vIHNob3VsZCB0aHJvdyBlcnJvciBvbiByZWdleFxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAhcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7ICdxJy5zdGFydHNXaXRoKC8uLyk7IH0pLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjMuMTggU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoKHNlYXJjaFN0cmluZyBbLCBwb3NpdGlvbiBdKVxuICBzdGFydHNXaXRoOiBmdW5jdGlvbiBzdGFydHNXaXRoKHNlYXJjaFN0cmluZyAvKiwgcG9zaXRpb24gPSAwICovKXtcbiAgICBpZihjb2Yoc2VhcmNoU3RyaW5nKSA9PSAnUmVnRXhwJyl0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB2YXIgdGhhdCAgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxuICAgICAgLCBpbmRleCA9ICQudG9MZW5ndGgoTWF0aC5taW4oYXJndW1lbnRzWzFdLCB0aGF0Lmxlbmd0aCkpO1xuICAgIHNlYXJjaFN0cmluZyArPSAnJztcbiAgICByZXR1cm4gdGhhdC5zbGljZShpbmRleCwgaW5kZXggKyBzZWFyY2hTdHJpbmcubGVuZ3RoKSA9PT0gc2VhcmNoU3RyaW5nO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG4vLyBFQ01BU2NyaXB0IDYgc3ltYm9scyBzaGltXG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIHNldFRhZyAgID0gcmVxdWlyZSgnLi8kLmNvZicpLnNldFxuICAsIHVpZCAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpXG4gICwgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkcmVkZWYgICA9IHJlcXVpcmUoJy4vJC5yZWRlZicpXG4gICwga2V5T2YgICAgPSByZXF1aXJlKCcuLyQua2V5b2YnKVxuICAsIGVudW1LZXlzID0gcmVxdWlyZSgnLi8kLmVudW0ta2V5cycpXG4gICwgYXNzZXJ0T2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9ialxuICAsIGhhcyAgICAgID0gJC5oYXNcbiAgLCAkY3JlYXRlICA9ICQuY3JlYXRlXG4gICwgZ2V0RGVzYyAgPSAkLmdldERlc2NcbiAgLCBzZXREZXNjICA9ICQuc2V0RGVzY1xuICAsIGRlc2MgICAgID0gJC5kZXNjXG4gICwgZ2V0TmFtZXMgPSAkLmdldE5hbWVzXG4gICwgdG9PYmplY3QgPSAkLnRvT2JqZWN0XG4gICwgJFN5bWJvbCAgPSAkLmcuU3ltYm9sXG4gICwgc2V0dGVyICAgPSBmYWxzZVxuICAsIFRBRyAgICAgID0gdWlkKCd0YWcnKVxuICAsIEhJRERFTiAgID0gdWlkKCdoaWRkZW4nKVxuICAsIF9wcm9wZXJ0eUlzRW51bWVyYWJsZSA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlXG4gICwgU3ltYm9sUmVnaXN0cnkgPSB7fVxuICAsIEFsbFN5bWJvbHMgPSB7fVxuICAsIHVzZU5hdGl2ZSA9ICQuaXNGdW5jdGlvbigkU3ltYm9sKTtcblxuZnVuY3Rpb24gd3JhcCh0YWcpe1xuICB2YXIgc3ltID0gQWxsU3ltYm9sc1t0YWddID0gJC5zZXQoJGNyZWF0ZSgkU3ltYm9sLnByb3RvdHlwZSksIFRBRywgdGFnKTtcbiAgJC5ERVNDICYmIHNldHRlciAmJiBzZXREZXNjKE9iamVjdC5wcm90b3R5cGUsIHRhZywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIGlmKGhhcyh0aGlzLCBISURERU4pICYmIGhhcyh0aGlzW0hJRERFTl0sIHRhZykpdGhpc1tISURERU5dW3RhZ10gPSBmYWxzZTtcbiAgICAgIHNldERlc2ModGhpcywgdGFnLCBkZXNjKDEsIHZhbHVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHN5bTtcbn1cblxuZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgRCl7XG4gIGlmKEQgJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkpe1xuICAgIGlmKCFELmVudW1lcmFibGUpe1xuICAgICAgaWYoIWhhcyhpdCwgSElEREVOKSlzZXREZXNjKGl0LCBISURERU4sIGRlc2MoMSwge30pKTtcbiAgICAgIGl0W0hJRERFTl1ba2V5XSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0paXRbSElEREVOXVtrZXldID0gZmFsc2U7XG4gICAgICBEID0gJGNyZWF0ZShELCB7ZW51bWVyYWJsZTogZGVzYygwLCBmYWxzZSl9KTtcbiAgICB9XG4gIH0gcmV0dXJuIHNldERlc2MoaXQsIGtleSwgRCk7XG59XG5mdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKGl0LCBQKXtcbiAgYXNzZXJ0T2JqZWN0KGl0KTtcbiAgdmFyIGtleXMgPSBlbnVtS2V5cyhQID0gdG9PYmplY3QoUCkpXG4gICAgLCBpICAgID0gMFxuICAgICwgbCA9IGtleXMubGVuZ3RoXG4gICAgLCBrZXk7XG4gIHdoaWxlKGwgPiBpKWRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZShpdCwgUCl7XG4gIHJldHVybiBQID09PSB1bmRlZmluZWQgPyAkY3JlYXRlKGl0KSA6IGRlZmluZVByb3BlcnRpZXMoJGNyZWF0ZShpdCksIFApO1xufVxuZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoa2V5KXtcbiAgdmFyIEUgPSBfcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh0aGlzLCBrZXkpO1xuICByZXR1cm4gRSB8fCAhaGFzKHRoaXMsIGtleSkgfHwgIWhhcyhBbGxTeW1ib2xzLCBrZXkpIHx8IGhhcyh0aGlzLCBISURERU4pICYmIHRoaXNbSElEREVOXVtrZXldXG4gICAgPyBFIDogdHJ1ZTtcbn1cbmZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgdmFyIEQgPSBnZXREZXNjKGl0ID0gdG9PYmplY3QoaXQpLCBrZXkpO1xuICBpZihEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICEoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkpRC5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgcmV0dXJuIEQ7XG59XG5mdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KXtcbiAgdmFyIG5hbWVzICA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSlcbiAgICAsIHJlc3VsdCA9IFtdXG4gICAgLCBpICAgICAgPSAwXG4gICAgLCBrZXk7XG4gIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaWYoIWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiBrZXkgIT0gSElEREVOKXJlc3VsdC5wdXNoKGtleSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpe1xuICB2YXIgbmFtZXMgID0gZ2V0TmFtZXModG9PYmplY3QoaXQpKVxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGkgICAgICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZihoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkpcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gMTkuNC4xLjEgU3ltYm9sKFtkZXNjcmlwdGlvbl0pXG5pZighdXNlTmF0aXZlKXtcbiAgJFN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbCgpe1xuICAgIGlmKHRoaXMgaW5zdGFuY2VvZiAkU3ltYm9sKXRocm93IFR5cGVFcnJvcignU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yJyk7XG4gICAgcmV0dXJuIHdyYXAodWlkKGFyZ3VtZW50c1swXSkpO1xuICB9O1xuICAkcmVkZWYoJFN5bWJvbC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXNbVEFHXTtcbiAgfSk7XG5cbiAgJC5jcmVhdGUgICAgID0gY3JlYXRlO1xuICAkLnNldERlc2MgICAgPSBkZWZpbmVQcm9wZXJ0eTtcbiAgJC5nZXREZXNjICAgID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICAkLnNldERlc2NzICAgPSBkZWZpbmVQcm9wZXJ0aWVzO1xuICAkLmdldE5hbWVzICAgPSBnZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICAkLmdldFN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbiAgaWYoJC5ERVNDICYmICQuRlcpJHJlZGVmKE9iamVjdC5wcm90b3R5cGUsICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsIHByb3BlcnR5SXNFbnVtZXJhYmxlLCB0cnVlKTtcbn1cblxudmFyIHN5bWJvbFN0YXRpY3MgPSB7XG4gIC8vIDE5LjQuMi4xIFN5bWJvbC5mb3Ioa2V5KVxuICAnZm9yJzogZnVuY3Rpb24oa2V5KXtcbiAgICByZXR1cm4gaGFzKFN5bWJvbFJlZ2lzdHJ5LCBrZXkgKz0gJycpXG4gICAgICA/IFN5bWJvbFJlZ2lzdHJ5W2tleV1cbiAgICAgIDogU3ltYm9sUmVnaXN0cnlba2V5XSA9ICRTeW1ib2woa2V5KTtcbiAgfSxcbiAgLy8gMTkuNC4yLjUgU3ltYm9sLmtleUZvcihzeW0pXG4gIGtleUZvcjogZnVuY3Rpb24ga2V5Rm9yKGtleSl7XG4gICAgcmV0dXJuIGtleU9mKFN5bWJvbFJlZ2lzdHJ5LCBrZXkpO1xuICB9LFxuICB1c2VTZXR0ZXI6IGZ1bmN0aW9uKCl7IHNldHRlciA9IHRydWU7IH0sXG4gIHVzZVNpbXBsZTogZnVuY3Rpb24oKXsgc2V0dGVyID0gZmFsc2U7IH1cbn07XG4vLyAxOS40LjIuMiBTeW1ib2wuaGFzSW5zdGFuY2Vcbi8vIDE5LjQuMi4zIFN5bWJvbC5pc0NvbmNhdFNwcmVhZGFibGVcbi8vIDE5LjQuMi40IFN5bWJvbC5pdGVyYXRvclxuLy8gMTkuNC4yLjYgU3ltYm9sLm1hdGNoXG4vLyAxOS40LjIuOCBTeW1ib2wucmVwbGFjZVxuLy8gMTkuNC4yLjkgU3ltYm9sLnNlYXJjaFxuLy8gMTkuNC4yLjEwIFN5bWJvbC5zcGVjaWVzXG4vLyAxOS40LjIuMTEgU3ltYm9sLnNwbGl0XG4vLyAxOS40LjIuMTIgU3ltYm9sLnRvUHJpbWl0aXZlXG4vLyAxOS40LjIuMTMgU3ltYm9sLnRvU3RyaW5nVGFnXG4vLyAxOS40LjIuMTQgU3ltYm9sLnVuc2NvcGFibGVzXG4kLmVhY2guY2FsbCgoXG4gICAgJ2hhc0luc3RhbmNlLGlzQ29uY2F0U3ByZWFkYWJsZSxpdGVyYXRvcixtYXRjaCxyZXBsYWNlLHNlYXJjaCwnICtcbiAgICAnc3BlY2llcyxzcGxpdCx0b1ByaW1pdGl2ZSx0b1N0cmluZ1RhZyx1bnNjb3BhYmxlcydcbiAgKS5zcGxpdCgnLCcpLCBmdW5jdGlvbihpdCl7XG4gICAgdmFyIHN5bSA9IHJlcXVpcmUoJy4vJC53a3MnKShpdCk7XG4gICAgc3ltYm9sU3RhdGljc1tpdF0gPSB1c2VOYXRpdmUgPyBzeW0gOiB3cmFwKHN5bSk7XG4gIH1cbik7XG5cbnNldHRlciA9IHRydWU7XG5cbiRkZWYoJGRlZi5HICsgJGRlZi5XLCB7U3ltYm9sOiAkU3ltYm9sfSk7XG5cbiRkZWYoJGRlZi5TLCAnU3ltYm9sJywgc3ltYm9sU3RhdGljcyk7XG5cbiRkZWYoJGRlZi5TICsgJGRlZi5GICogIXVzZU5hdGl2ZSwgJ09iamVjdCcsIHtcbiAgLy8gMTkuMS4yLjIgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuICBjcmVhdGU6IGNyZWF0ZSxcbiAgLy8gMTkuMS4yLjQgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4gIGRlZmluZVByb3BlcnR5OiBkZWZpbmVQcm9wZXJ0eSxcbiAgLy8gMTkuMS4yLjMgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcylcbiAgZGVmaW5lUHJvcGVydGllczogZGVmaW5lUHJvcGVydGllcyxcbiAgLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6IGdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgLy8gMTkuMS4yLjggT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhPKVxuICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM6IGdldE93blByb3BlcnR5U3ltYm9sc1xufSk7XG5cbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cbnNldFRhZygkU3ltYm9sLCAnU3ltYm9sJyk7XG4vLyAyMC4yLjEuOSBNYXRoW0BAdG9TdHJpbmdUYWddXG5zZXRUYWcoTWF0aCwgJ01hdGgnLCB0cnVlKTtcbi8vIDI0LjMuMyBKU09OW0BAdG9TdHJpbmdUYWddXG5zZXRUYWcoJC5nLkpTT04sICdKU09OJywgdHJ1ZSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgd2VhayAgICAgID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24td2VhaycpXG4gICwgbGVha1N0b3JlID0gd2Vhay5sZWFrU3RvcmVcbiAgLCBJRCAgICAgICAgPSB3ZWFrLklEXG4gICwgV0VBSyAgICAgID0gd2Vhay5XRUFLXG4gICwgaGFzICAgICAgID0gJC5oYXNcbiAgLCBpc09iamVjdCAgPSAkLmlzT2JqZWN0XG4gICwgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBpc09iamVjdFxuICAsIHRtcCAgICAgICA9IHt9O1xuXG4vLyAyMy4zIFdlYWtNYXAgT2JqZWN0c1xudmFyIFdlYWtNYXAgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdXZWFrTWFwJywge1xuICAvLyAyMy4zLjMuMyBXZWFrTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpe1xuICAgIGlmKGlzT2JqZWN0KGtleSkpe1xuICAgICAgaWYoIWlzRXh0ZW5zaWJsZShrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcykuZ2V0KGtleSk7XG4gICAgICBpZihoYXMoa2V5LCBXRUFLKSlyZXR1cm4ga2V5W1dFQUtdW3RoaXNbSURdXTtcbiAgICB9XG4gIH0sXG4gIC8vIDIzLjMuMy41IFdlYWtNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcbiAgICByZXR1cm4gd2Vhay5kZWYodGhpcywga2V5LCB2YWx1ZSk7XG4gIH1cbn0sIHdlYWssIHRydWUsIHRydWUpO1xuXG4vLyBJRTExIFdlYWtNYXAgZnJvemVuIGtleXMgZml4XG5pZigkLkZXICYmIG5ldyBXZWFrTWFwKCkuc2V0KChPYmplY3QuZnJlZXplIHx8IE9iamVjdCkodG1wKSwgNykuZ2V0KHRtcCkgIT0gNyl7XG4gICQuZWFjaC5jYWxsKFsnZGVsZXRlJywgJ2hhcycsICdnZXQnLCAnc2V0J10sIGZ1bmN0aW9uKGtleSl7XG4gICAgdmFyIHByb3RvICA9IFdlYWtNYXAucHJvdG90eXBlXG4gICAgICAsIG1ldGhvZCA9IHByb3RvW2tleV07XG4gICAgcmVxdWlyZSgnLi8kLnJlZGVmJykocHJvdG8sIGtleSwgZnVuY3Rpb24oYSwgYil7XG4gICAgICAvLyBzdG9yZSBmcm96ZW4gb2JqZWN0cyBvbiBsZWFreSBtYXBcbiAgICAgIGlmKGlzT2JqZWN0KGEpICYmICFpc0V4dGVuc2libGUoYSkpe1xuICAgICAgICB2YXIgcmVzdWx0ID0gbGVha1N0b3JlKHRoaXMpW2tleV0oYSwgYik7XG4gICAgICAgIHJldHVybiBrZXkgPT0gJ3NldCcgPyB0aGlzIDogcmVzdWx0O1xuICAgICAgLy8gc3RvcmUgYWxsIHRoZSByZXN0IG9uIG5hdGl2ZSB3ZWFrbWFwXG4gICAgICB9IHJldHVybiBtZXRob2QuY2FsbCh0aGlzLCBhLCBiKTtcbiAgICB9KTtcbiAgfSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHdlYWsgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi13ZWFrJyk7XG5cbi8vIDIzLjQgV2Vha1NldCBPYmplY3RzXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdXZWFrU2V0Jywge1xuICAvLyAyMy40LjMuMSBXZWFrU2V0LnByb3RvdHlwZS5hZGQodmFsdWUpXG4gIGFkZDogZnVuY3Rpb24gYWRkKHZhbHVlKXtcbiAgICByZXR1cm4gd2Vhay5kZWYodGhpcywgdmFsdWUsIHRydWUpO1xuICB9XG59LCB3ZWFrLCBmYWxzZSwgdHJ1ZSk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL2RvbWVuaWMvQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzXG52YXIgJGRlZiAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJGluY2x1ZGVzID0gcmVxdWlyZSgnLi8kLmFycmF5LWluY2x1ZGVzJykodHJ1ZSk7XG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xuICBpbmNsdWRlczogZnVuY3Rpb24gaW5jbHVkZXMoZWwgLyosIGZyb21JbmRleCA9IDAgKi8pe1xuICAgIHJldHVybiAkaW5jbHVkZXModGhpcywgZWwsIGFyZ3VtZW50c1sxXSk7XG4gIH1cbn0pO1xucmVxdWlyZSgnLi8kLnVuc2NvcGUnKSgnaW5jbHVkZXMnKTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbi10by1qc29uJykoJ01hcCcpOyIsIi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL1dlYlJlZmxlY3Rpb24vOTM1Mzc4MVxudmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBvd25LZXlzID0gcmVxdWlyZSgnLi8kLm93bi1rZXlzJyk7XG5cbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKG9iamVjdCl7XG4gICAgdmFyIE8gICAgICA9ICQudG9PYmplY3Qob2JqZWN0KVxuICAgICAgLCByZXN1bHQgPSB7fTtcbiAgICAkLmVhY2guY2FsbChvd25LZXlzKE8pLCBmdW5jdGlvbihrZXkpe1xuICAgICAgJC5zZXREZXNjKHJlc3VsdCwga2V5LCAkLmRlc2MoMCwgJC5nZXREZXNjKE8sIGtleSkpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTsiLCIvLyBodHRwOi8vZ29vLmdsL1hrQnJqRFxudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5mdW5jdGlvbiBjcmVhdGVPYmplY3RUb0FycmF5KGlzRW50cmllcyl7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3Qpe1xuICAgIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KG9iamVjdClcbiAgICAgICwga2V5cyAgID0gJC5nZXRLZXlzKE8pXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgICAsIGkgICAgICA9IDBcbiAgICAgICwgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKVxuICAgICAgLCBrZXk7XG4gICAgaWYoaXNFbnRyaWVzKXdoaWxlKGxlbmd0aCA+IGkpcmVzdWx0W2ldID0gW2tleSA9IGtleXNbaSsrXSwgT1trZXldXTtcbiAgICBlbHNlIHdoaWxlKGxlbmd0aCA+IGkpcmVzdWx0W2ldID0gT1trZXlzW2krK11dO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtcbiAgdmFsdWVzOiAgY3JlYXRlT2JqZWN0VG9BcnJheShmYWxzZSksXG4gIGVudHJpZXM6IGNyZWF0ZU9iamVjdFRvQXJyYXkodHJ1ZSlcbn0pOyIsIi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2thbmdheC85Njk4MTAwXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcbiRkZWYoJGRlZi5TLCAnUmVnRXhwJywge1xuICBlc2NhcGU6IHJlcXVpcmUoJy4vJC5yZXBsYWNlcicpKC8oW1xcXFxcXC1bXFxde30oKSorPy4sXiR8XSkvZywgJ1xcXFwkMScsIHRydWUpXG59KTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbi10by1qc29uJykoJ1NldCcpOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5wcm90b3R5cGUuYXRcbid1c2Ugc3RyaWN0JztcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJGF0ICA9IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKSh0cnVlKTtcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xuICBhdDogZnVuY3Rpb24gYXQocG9zKXtcbiAgICByZXR1cm4gJGF0KHRoaXMsIHBvcyk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJHBhZCA9IHJlcXVpcmUoJy4vJC5zdHJpbmctcGFkJyk7XG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcbiAgbHBhZDogZnVuY3Rpb24gbHBhZChuKXtcbiAgICByZXR1cm4gJHBhZCh0aGlzLCBuLCBhcmd1bWVudHNbMV0sIHRydWUpO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRwYWQgPSByZXF1aXJlKCcuLyQuc3RyaW5nLXBhZCcpO1xuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XG4gIHJwYWQ6IGZ1bmN0aW9uIHJwYWQobil7XG4gICAgcmV0dXJuICRwYWQodGhpcywgbiwgYXJndW1lbnRzWzFdLCBmYWxzZSk7XG4gIH1cbn0pOyIsIi8vIEphdmFTY3JpcHQgMS42IC8gU3RyYXdtYW4gYXJyYXkgc3RhdGljcyBzaGltXG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRBcnJheSAgPSAkLmNvcmUuQXJyYXkgfHwgQXJyYXlcbiAgLCBzdGF0aWNzID0ge307XG5mdW5jdGlvbiBzZXRTdGF0aWNzKGtleXMsIGxlbmd0aCl7XG4gICQuZWFjaC5jYWxsKGtleXMuc3BsaXQoJywnKSwgZnVuY3Rpb24oa2V5KXtcbiAgICBpZihsZW5ndGggPT0gdW5kZWZpbmVkICYmIGtleSBpbiAkQXJyYXkpc3RhdGljc1trZXldID0gJEFycmF5W2tleV07XG4gICAgZWxzZSBpZihrZXkgaW4gW10pc3RhdGljc1trZXldID0gcmVxdWlyZSgnLi8kLmN0eCcpKEZ1bmN0aW9uLmNhbGwsIFtdW2tleV0sIGxlbmd0aCk7XG4gIH0pO1xufVxuc2V0U3RhdGljcygncG9wLHJldmVyc2Usc2hpZnQsa2V5cyx2YWx1ZXMsZW50cmllcycsIDEpO1xuc2V0U3RhdGljcygnaW5kZXhPZixldmVyeSxzb21lLGZvckVhY2gsbWFwLGZpbHRlcixmaW5kLGZpbmRJbmRleCxpbmNsdWRlcycsIDMpO1xuc2V0U3RhdGljcygnam9pbixzbGljZSxjb25jYXQscHVzaCxzcGxpY2UsdW5zaGlmdCxzb3J0LGxhc3RJbmRleE9mLCcgK1xuICAgICAgICAgICAncmVkdWNlLHJlZHVjZVJpZ2h0LGNvcHlXaXRoaW4sZmlsbCx0dXJuJyk7XG4kZGVmKCRkZWYuUywgJ0FycmF5Jywgc3RhdGljcyk7IiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgSXRlcmF0b3JzICAgPSByZXF1aXJlKCcuLyQuaXRlcicpLkl0ZXJhdG9yc1xuICAsIElURVJBVE9SICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgQXJyYXlWYWx1ZXMgPSBJdGVyYXRvcnMuQXJyYXlcbiAgLCBOb2RlTGlzdCAgICA9ICQuZy5Ob2RlTGlzdDtcbmlmKCQuRlcgJiYgTm9kZUxpc3QgJiYgIShJVEVSQVRPUiBpbiBOb2RlTGlzdC5wcm90b3R5cGUpKXtcbiAgJC5oaWRlKE5vZGVMaXN0LnByb3RvdHlwZSwgSVRFUkFUT1IsIEFycmF5VmFsdWVzKTtcbn1cbkl0ZXJhdG9ycy5Ob2RlTGlzdCA9IEFycmF5VmFsdWVzOyIsInZhciAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICR0YXNrID0gcmVxdWlyZSgnLi8kLnRhc2snKTtcbiRkZWYoJGRlZi5HICsgJGRlZi5CLCB7XG4gIHNldEltbWVkaWF0ZTogICAkdGFzay5zZXQsXG4gIGNsZWFySW1tZWRpYXRlOiAkdGFzay5jbGVhclxufSk7IiwiLy8gaWU5LSBzZXRUaW1lb3V0ICYgc2V0SW50ZXJ2YWwgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIGZpeFxudmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgaW52b2tlICAgID0gcmVxdWlyZSgnLi8kLmludm9rZScpXG4gICwgcGFydGlhbCAgID0gcmVxdWlyZSgnLi8kLnBhcnRpYWwnKVxuICAsIG5hdmlnYXRvciA9ICQuZy5uYXZpZ2F0b3JcbiAgLCBNU0lFICAgICAgPSAhIW5hdmlnYXRvciAmJiAvTVNJRSAuXFwuLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpOyAvLyA8LSBkaXJ0eSBpZTktIGNoZWNrXG5mdW5jdGlvbiB3cmFwKHNldCl7XG4gIHJldHVybiBNU0lFID8gZnVuY3Rpb24oZm4sIHRpbWUgLyosIC4uLmFyZ3MgKi8pe1xuICAgIHJldHVybiBzZXQoaW52b2tlKFxuICAgICAgcGFydGlhbCxcbiAgICAgIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSxcbiAgICAgICQuaXNGdW5jdGlvbihmbikgPyBmbiA6IEZ1bmN0aW9uKGZuKVxuICAgICksIHRpbWUpO1xuICB9IDogc2V0O1xufVxuJGRlZigkZGVmLkcgKyAkZGVmLkIgKyAkZGVmLkYgKiBNU0lFLCB7XG4gIHNldFRpbWVvdXQ6ICB3cmFwKCQuZy5zZXRUaW1lb3V0KSxcbiAgc2V0SW50ZXJ2YWw6IHdyYXAoJC5nLnNldEludGVydmFsKVxufSk7IiwicmVxdWlyZSgnLi9tb2R1bGVzL2VzNScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3QuaXMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5mdW5jdGlvbi5uYW1lJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmZ1bmN0aW9uLmhhcy1pbnN0YW5jZScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5udW1iZXIuY29uc3RydWN0b3InKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLnN0YXRpY3MnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWF0aCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuZnJvbS1jb2RlLXBvaW50Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5yYXcnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5jb2RlLXBvaW50LWF0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5lbmRzLXdpdGgnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmluY2x1ZGVzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5yZXBlYXQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLnN0YXJ0cy13aXRoJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZyb20nKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkub2YnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuc3BlY2llcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5jb3B5LXdpdGhpbicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5maWxsJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZpbmQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZmluZC1pbmRleCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWdleHAnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYucHJvbWlzZScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5tYXAnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc2V0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LndlYWstbWFwJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LndlYWstc2V0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZmxlY3QnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuYXJyYXkuaW5jbHVkZXMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuc3RyaW5nLmF0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnN0cmluZy5scGFkJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnN0cmluZy5ycGFkJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnJlZ2V4cC5lc2NhcGUnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcub2JqZWN0LnRvLWFycmF5Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3Lm1hcC50by1qc29uJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnNldC50by1qc29uJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvanMuYXJyYXkuc3RhdGljcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL3dlYi50aW1lcnMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy93ZWIuaW1tZWRpYXRlJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL21vZHVsZXMvJCcpLmNvcmU7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBodHRwczovL3Jhdy5naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL21hc3Rlci9MSUNFTlNFIGZpbGUuIEFuXG4gKiBhZGRpdGlvbmFsIGdyYW50IG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW5cbiAqIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG4hKGZ1bmN0aW9uKGdsb2JhbCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciBpdGVyYXRvclN5bWJvbCA9XG4gICAgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKChvdXRlckZuIHx8IEdlbmVyYXRvcikucHJvdG90eXBlKTtcblxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChcbiAgICAgIGlubmVyRm4sIHNlbGYgfHwgbnVsbCxcbiAgICAgIG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKVxuICAgICk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9IEdlbmVyYXRvci5wcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIHJ1bnRpbWUubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICBydW50aW1lLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgZ2VuZXJhdG9yID0gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCk7XG4gICAgICB2YXIgY2FsbE5leHQgPSBzdGVwLmJpbmQoZ2VuZXJhdG9yLCBcIm5leHRcIik7XG4gICAgICB2YXIgY2FsbFRocm93ID0gc3RlcC5iaW5kKGdlbmVyYXRvciwgXCJ0aHJvd1wiKTtcblxuICAgICAgZnVuY3Rpb24gc3RlcChtZXRob2QsIGFyZykge1xuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgcmVzb2x2ZShpbmZvLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoaW5mby52YWx1ZSkudGhlbihjYWxsTmV4dCwgY2FsbFRocm93KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjYWxsTmV4dCgpO1xuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICBpZiAobWV0aG9kID09PSBcInJldHVyblwiIHx8XG4gICAgICAgICAgICAgIChtZXRob2QgPT09IFwidGhyb3dcIiAmJiBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAvLyBBIHJldHVybiBvciB0aHJvdyAod2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIHRocm93XG4gICAgICAgICAgICAvLyBtZXRob2QpIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgICB2YXIgcmV0dXJuTWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl07XG4gICAgICAgICAgICBpZiAocmV0dXJuTWV0aG9kKSB7XG4gICAgICAgICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChyZXR1cm5NZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBhcmcpO1xuICAgICAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSByZXR1cm4gbWV0aG9kIHRocmV3IGFuIGV4Y2VwdGlvbiwgbGV0IHRoYXRcbiAgICAgICAgICAgICAgICAvLyBleGNlcHRpb24gcHJldmFpbCBvdmVyIHRoZSBvcmlnaW5hbCByZXR1cm4gb3IgdGhyb3cuXG4gICAgICAgICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgICAgICAvLyBDb250aW51ZSB3aXRoIHRoZSBvdXRlciByZXR1cm4sIG5vdyB0aGF0IHRoZSBkZWxlZ2F0ZVxuICAgICAgICAgICAgICAvLyBpdGVyYXRvciBoYXMgYmVlbiB0ZXJtaW5hdGVkLlxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goXG4gICAgICAgICAgICBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdLFxuICAgICAgICAgICAgZGVsZWdhdGUuaXRlcmF0b3IsXG4gICAgICAgICAgICBhcmdcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBMaWtlIHJldHVybmluZyBnZW5lcmF0b3IudGhyb3codW5jYXVnaHQpLCBidXQgd2l0aG91dCB0aGVcbiAgICAgICAgICAgIC8vIG92ZXJoZWFkIG9mIGFuIGV4dHJhIGZ1bmN0aW9uIGNhbGwuXG4gICAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRGVsZWdhdGUgZ2VuZXJhdG9yIHJhbiBhbmQgaGFuZGxlZCBpdHMgb3duIGV4Y2VwdGlvbnMgc29cbiAgICAgICAgICAvLyByZWdhcmRsZXNzIG9mIHdoYXQgdGhlIG1ldGhvZCB3YXMsIHdlIGNvbnRpbnVlIGFzIGlmIGl0IGlzXG4gICAgICAgICAgLy8gXCJuZXh0XCIgd2l0aCBhbiB1bmRlZmluZWQgYXJnLlxuICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcbiAgICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcbiAgICAgICAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkWWllbGQpIHtcbiAgICAgICAgICAgIGNvbnRleHQuc2VudCA9IGFyZztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIGNvbnRleHQuc2VudDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihhcmcpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuZGVsZWdhdGUgJiYgbWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIG1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlZmluZUdlbmVyYXRvck1ldGhvZChtZXRob2QpIHtcbiAgICBHcFttZXRob2RdID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICB9O1xuICB9XG4gIGRlZmluZUdlbmVyYXRvck1ldGhvZChcIm5leHRcIik7XG4gIGRlZmluZUdlbmVyYXRvck1ldGhvZChcInRocm93XCIpO1xuICBkZWZpbmVHZW5lcmF0b3JNZXRob2QoXCJyZXR1cm5cIik7XG5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgcnVudGltZS5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIHJ1bnRpbWUudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIHRoaXMuc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICAvLyBQcmUtaW5pdGlhbGl6ZSBhdCBsZWFzdCAyMCB0ZW1wb3JhcnkgdmFyaWFibGVzIHRvIGVuYWJsZSBoaWRkZW5cbiAgICAgIC8vIGNsYXNzIG9wdGltaXphdGlvbnMgZm9yIHNpbXBsZSBnZW5lcmF0b3JzLlxuICAgICAgZm9yICh2YXIgdGVtcEluZGV4ID0gMCwgdGVtcE5hbWU7XG4gICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIHRlbXBOYW1lID0gXCJ0XCIgKyB0ZW1wSW5kZXgpIHx8IHRlbXBJbmRleCA8IDIwO1xuICAgICAgICAgICArK3RlbXBJbmRleCkge1xuICAgICAgICB0aGlzW3RlbXBOYW1lXSA9IG51bGw7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcbiAgICAgICAgcmV0dXJuICEhY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uKHRyeUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykge1xuICAgICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3duID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhyb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBjb250ZXh0LmNhdGNoIG1ldGhvZCBtdXN0IG9ubHkgYmUgY2FsbGVkIHdpdGggYSBsb2NhdGlvblxuICAgICAgLy8gYXJndW1lbnQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGtub3duIGNhdGNoIGJsb2NrLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCBjYXRjaCBhdHRlbXB0XCIpO1xuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZVlpZWxkOiBmdW5jdGlvbihpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcbn0pKFxuICAvLyBBbW9uZyB0aGUgdmFyaW91cyB0cmlja3MgZm9yIG9idGFpbmluZyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsXG4gIC8vIG9iamVjdCwgdGhpcyBzZWVtcyB0byBiZSB0aGUgbW9zdCByZWxpYWJsZSB0ZWNobmlxdWUgdGhhdCBkb2VzIG5vdFxuICAvLyB1c2UgaW5kaXJlY3QgZXZhbCAod2hpY2ggdmlvbGF0ZXMgQ29udGVudCBTZWN1cml0eSBQb2xpY3kpLlxuICB0eXBlb2YgZ2xvYmFsID09PSBcIm9iamVjdFwiID8gZ2xvYmFsIDpcbiAgdHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIiA/IHdpbmRvdyA6XG4gIHR5cGVvZiBzZWxmID09PSBcIm9iamVjdFwiID8gc2VsZiA6IHRoaXNcbik7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9iYWJlbC9wb2x5ZmlsbFwiKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJhYmVsLWNvcmUvcG9seWZpbGxcIik7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MsIGN1c3RvbURvY3VtZW50KSB7XG4gIHZhciBkb2MgPSBjdXN0b21Eb2N1bWVudCB8fCBkb2N1bWVudDtcbiAgaWYgKGRvYy5jcmVhdGVTdHlsZVNoZWV0KSB7XG4gICAgdmFyIHNoZWV0ID0gZG9jLmNyZWF0ZVN0eWxlU2hlZXQoKVxuICAgIHNoZWV0LmNzc1RleHQgPSBjc3M7XG4gICAgcmV0dXJuIHNoZWV0Lm93bmVyTm9kZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaGVhZCA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgICAgICBzdHlsZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXG4gICAgc3R5bGUudHlwZSA9ICd0ZXh0L2Nzcyc7XG5cbiAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gICAgfVxuXG4gICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgcmV0dXJuIHN0eWxlO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5ieVVybCA9IGZ1bmN0aW9uKHVybCkge1xuICBpZiAoZG9jdW1lbnQuY3JlYXRlU3R5bGVTaGVldCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVTdHlsZVNoZWV0KHVybCkub3duZXJOb2RlO1xuICB9IGVsc2Uge1xuICAgIHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgICAgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcblxuICAgIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgIGxpbmsuaHJlZiA9IHVybDtcblxuICAgIGhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgcmV0dXJuIGxpbms7XG4gIH1cbn07XG4iLCJjb25zdCBDdXJ2ZXMgPSBGYW1vdXNQbGF0Zm9ybS50cmFuc2l0aW9ucy5DdXJ2ZXM7XG5jb25zdCBGYW1vdXNFbmdpbmUgPSBGYW1vdXNQbGF0Zm9ybS5jb3JlLkZhbW91c0VuZ2luZTtcbmNvbnN0IFRyYW5zaXRpb25hYmxlID0gRmFtb3VzUGxhdGZvcm0udHJhbnNpdGlvbnMuVHJhbnNpdGlvbmFibGU7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVsaW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5wYXRoU2V0ID0gW107XG4gICAgdGhpcy50aW1lc2NhbGUgPSBvcHRpb25zLnRpbWVzY2FsZSB8fCAxO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSBuZXcgVHJhbnNpdGlvbmFibGUoMCk7XG4gIH1cblxuICAvKlxuICAgICAgICBwYXRoRGF0YSA9IHtcbiAgICAgICAgICBoYW5kbGVyIDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHZhbHVlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhdGggOiBbXG4gICAgICAgICAgICBbMCwgWzAsIDAsIDBdXSxcbiAgICAgICAgICAgIFs1MDAwLCBbMTAwLCAxMDAsIDEwMF1dXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICovXG5cbiAgcmVnaXN0ZXJQYXRoKHBhdGhEYXRhKSB7XG4gICAgdGhpcy5wYXRoU2V0LnB1c2gocGF0aERhdGEpO1xuICB9XG5cbiAgc2V0KHRpbWUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHRyYW5zaXRpb24pIHtcbiAgICAgIHRoaXMuaW5UcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICAgIEZhbW91c0VuZ2luZS5yZXF1ZXN0VXBkYXRlT25OZXh0VGljayh0aGlzKTtcbiAgICAgIHRoaXMuY3VycmVudFRpbWUuc2V0KHRpbWUsIHRyYW5zaXRpb24sICgpID0+IHtcbiAgICAgICAgdGhpcy5pblRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICAgICAgRmFtb3VzRW5naW5lLnJlcXVlc3RVcGRhdGVPbk5leHRUaWNrKHRoaXMpO1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50VGltZS5zZXQodGltZSk7XG4gICAgICB0aGlzLmluVHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgICAgRmFtb3VzRW5naW5lLnJlcXVlc3RVcGRhdGVPbk5leHRUaWNrKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIG9uVXBkYXRlKHRpbWUpIHtcbiAgICAvLyBnbyB0aHJvdWdoIHRoZSBwYXRoU2V0LCBhbmQgYmFzaWNhbGx5IGV4ZWN1dGUgdGhlIGZ1bmN0aW9uXG5cbiAgICB0aW1lID0gdGhpcy5jdXJyZW50VGltZS5nZXQoKSAqIHRoaXMudGltZXNjYWxlO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhdGhTZXQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBwYXRoRGF0YSA9IHRoaXMucGF0aFNldFtpXTtcblxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwYXRoRGF0YS5wYXRoLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGxldCByZXMgPSBbXTtcbiAgICAgICAgbGV0IGN1cnJTdGVwID0gcGF0aERhdGEucGF0aFtqXTtcbiAgICAgICAgbGV0IG5leHRTdGVwID0gcGF0aERhdGEucGF0aFtqICsgMV07XG5cbiAgICAgICAgLy8gY3VycmVudGx5IG1pZCBwYXRoLCBjYWxjdWxhdGUgYW5kIGFwcGx5LlxuICAgICAgICBpZiAobmV4dFN0ZXAgJiYgY3VyclN0ZXBbMF0gPD0gdGltZSAmJiBuZXh0U3RlcFswXSA+PSB0aW1lKSB7XG4gICAgICAgICAgbGV0IHBlcmNlbnREb25lID0gKHRpbWUgLSBjdXJyU3RlcFswXSkgLyAobmV4dFN0ZXBbMF0gLSBjdXJyU3RlcFswXSk7XG4gICAgICAgICAgbGV0IHN0YXRlID0gY3VyclN0ZXBbMl0gPyBjdXJyU3RlcFsyXShwZXJjZW50RG9uZSkgOiBDdXJ2ZXMubGluZWFyKHBlcmNlbnREb25lKTtcblxuICAgICAgICAgIGlmIChjdXJyU3RlcFsxXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGN1cnJTdGVwWzFdLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgIHJlc1trXSA9IGN1cnJTdGVwWzFdW2tdICsgKG5leHRTdGVwWzFdW2tdIC0gY3VyclN0ZXBbMV1ba10pICogc3RhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcyA9IGN1cnJTdGVwWzFdICsgKG5leHRTdGVwWzFdIC0gY3VyclN0ZXBbMV0pICogc3RhdGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhdGhEYXRhLmhhbmRsZXIocmVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdlIGFyZSBwYXNzZWQgbGFzdCBzdGVwLCBzZXQgb2JqZWN0IHRvIGZpbmFsIHN0YXRlLlxuICAgICAgICBpZiAoIW5leHRTdGVwICYmIGN1cnJTdGVwWzBdIDwgdGltZSkge1xuICAgICAgICAgIHBhdGhEYXRhLmhhbmRsZXIoY3VyclN0ZXBbMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5UcmFuc2l0aW9uKSB7XG4gICAgICBGYW1vdXNFbmdpbmUucmVxdWVzdFVwZGF0ZU9uTmV4dFRpY2sodGhpcyk7XG4gICAgfVxuICB9XG59XG4iLCJjb25zdCBBbGlnbiA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuQWxpZ247XG5jb25zdCBGYW1vdXNFbmdpbmUgPSBGYW1vdXNQbGF0Zm9ybS5jb3JlLkZhbW91c0VuZ2luZTtcbmNvbnN0IE1vdW50UG9pbnQgPSBGYW1vdXNQbGF0Zm9ybS5jb21wb25lbnRzLk1vdW50UG9pbnQ7XG5jb25zdCBPcGFjaXR5ID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5PcGFjaXR5O1xuY29uc3QgT3JpZ2luID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5PcmlnaW47XG5jb25zdCBQb3NpdGlvbiA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuUG9zaXRpb247XG5jb25zdCBSb3RhdGlvbiA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuUm90YXRpb247XG5jb25zdCBTY2FsZSA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuU2NhbGU7XG5jb25zdCBTaXplID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5TaXplO1xuXG5jb25zdCByYWRpYW5zTXVsdGlwbGllciA9IE1hdGguUEkgLyAxODA7XG5jb25zdCBkZWdyZWVzTXVsdGlwbGllciA9IDE4MCAvIE1hdGguUEk7XG5cbi8qKlxuICogQ29udmVydHMgZGVncmVlcyB0byByYWRpYW5zLlxuICogQG1ldGhvZCAgdG9SYWRpYW5zXG4gKiBAY2xhc3MgICBNb2RpZmllclxuICogQHByaXZhdGVcbiAqIEBwYXJhbSAgIHtOdW1iZXJ9ICBkZWdyZWVzICBUaGUgZGVncmVlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJuICB7TnVtYmVyfSAgVGhlIGNvbnZlcnRlZCB2YWx1ZSBpbiByYWRpYW5zLlxuICovXG5mdW5jdGlvbiB0b1JhZGlhbnMoZGVncmVlcykge1xuICBpZiAoZGVncmVlcyA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIGRlZ3JlZXMgKiByYWRpYW5zTXVsdGlwbGllcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyByYWRpYW5zIHRvIGRlZ3JlZXMuXG4gKiBAbWV0aG9kICB0b1JhZGlhbnNcbiAqIEBjbGFzcyAgIE1vZGlmaWVyXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtICAge051bWJlcn0gIHJhZGlhbnMgIFRoZSByYWRpYW4gdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm4gIHtOdW1iZXJ9ICBUaGUgY29udmVydGVkIHZhbHVlIGluIGRlZ3JlZXMuXG4gKi9cbmZ1bmN0aW9uIHRvRGVncmVlcyhyYWRpYW5zKSB7XG4gIGlmIChyYWRpYW5zID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xuICByZXR1cm4gcmFkaWFucyAqIGRlZ3JlZXNNdWx0aXBsaWVyO1xufVxuXG5mdW5jdGlvbiBub0NvbnZlcnNpb24odmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RpZmllciB7XG4gIC8qKlxuICAgKiBCYXNlIGNsYXNzIHdoaWNoIGNvbnRhaW5zIGFsbCBtb2RpZmllcnMgYW5kIGNvbnRhaW5zIG5vIHZpc3VhbCBjb21wb25lbnRzLlxuICAgKiBAbWV0aG9kICBjb25zdHJ1Y3RvclxuICAgKiBAY2xhc3MgICBNb2RpZmllclxuICAgKiBAcGFyYW0gICB7Tm9kZX0gICAgbm9kZSAgICAgICAgICAgICAgICAgIFRoZSB7QGxpbmsgTm9kZX0gdG8gYXR0YWNoIHRoaXMgTW9kaWZpZXIgdG8uXG4gICAqIEBwYXJhbSAgIHtPYmplY3R9ICA8b3B0aW9ucz4gICAgICAgICAgICAgT3B0aW9uYWwgb3B0aW9ucy5cbiAgICogQHBhcmFtICAge09iamVjdH0gIDxvcHRpb25zLnVzZURlZ3JlZXM+ICBBY2NlcHQgZGVncmVlcyB3aGVuIGNhbGxpbmcgcm90YXRpb24gbWV0aG9kcywgb3RoZXJ3aXNlIHVzZSByYWRpYW5zLlxuICAgKi9cbiAgY29uc3RydWN0b3Iobm9kZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuaWQgPSB0aGlzLm5vZGUuZ2V0TG9jYXRpb24oKTtcbiAgICBpZiAob3B0aW9ucy51c2VEZWdyZWVzKSB7XG4gICAgICB0aGlzLnNldFJvdGF0aW9uVmFsID0gdG9SYWRpYW5zO1xuICAgICAgdGhpcy5nZXRSb3RhdGlvblZhbCA9IHRvRGVncmVlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRSb3RhdGlvblZhbCA9IG5vQ29udmVyc2lvbjtcbiAgICAgIHRoaXMuZ2V0Um90YXRpb25WYWwgPSBub0NvbnZlcnNpb247XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIFNpemUgZW51bXNcbiAgc3RhdGljIGdldCBSRUxBVElWRV9TSVpFKCkgeyByZXR1cm4gU2l6ZS5SRUxBVElWRTsgfVxuICBzdGF0aWMgZ2V0IEFCU09MVVRFX1NJWkUoKSB7IHJldHVybiBTaXplLkFCU09MVVRFOyB9XG4gIHN0YXRpYyBnZXQgUkVOREVSX1NJWkUoKSB7IHJldHVybiBTaXplLlJFTkRFUjsgfVxuICBzdGF0aWMgZ2V0IERFRkFVTFRfU0laRSgpIHsgcmV0dXJuIFNpemUuREVGQVVMVDsgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBHZXR0ZXIgZnVuY3Rpb25zIGZvciB0aGlzLm5vZGVcbiAgZ2V0Q2hpbGRyZW4oKSB7IHJldHVybiB0aGlzLm5vZGUuZ2V0Q2hpbGRyZW4oKTsgfVxuICBnZXRDb21wdXRlZFZhbHVlKCkgeyByZXR1cm4gdGhpcy5nZXRDb21wdXRlZFZhbHVlKCk7IH1cbiAgZ2V0SWQoKSB7IHJldHVybiB0aGlzLm5vZGUuZ2V0TG9jYXRpb24oKTsgfVxuICBnZXRQYXJlbnQoKSB7IHJldHVybiB0aGlzLm5vZGUuZ2V0UGFyZW50KCk7IH1cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiB0aGlzLm5vZGUuZ2V0VmFsdWUoKTsgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTdGF0ZSBpbmZvIGZvciB0aGlzLm5vZGVcbiAgaXNNb3VudGVkKCkgeyByZXR1cm4gdGhpcy5ub2RlLmlzTW91bnRlZCgpOyB9XG4gIGlzU2hvd24oKSB7IHJldHVybiB0aGlzLm5vZGUuaXNTaG93bigpOyB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNjZW5lIGdyYXBoIG1vZGlmaWVyc1xuICBhZGRDaGlsZChjaGlsZCkgeyByZXR1cm4gdGhpcy5ub2RlLmFkZENoaWxkKGNoaWxkKTsgfVxuICByZW1vdmVDaGlsZChjaGlsZCkgeyByZXR1cm4gdGhpcy5ub2RlLnJlbW92ZUNoaWxkKGNoaWxkKTsgfVxuICAvLyBBdHRhY2ggdGhpcyBub2RlIGFuZCBpdCdzIHN1YnRyZWUgYnkgc2V0dGluZyBpdCBhcyBhIGNoaWxkIG9mIHRoZSBwYXNzZWQgaW4gcGFyZW50LlxuICBhdHRhY2hUbyhwYXJlbnQpIHtcbiAgICBwYXJlbnQuYWRkQ2hpbGQodGhpcy5ub2RlKTtcbiAgICB0aGlzLm5vZGUuc2hvdygpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIERldGFjaCB0aGlzIG5vZGUgZnJvbSB0aGUgc2NlbmUgZ3JhcGggYnkgcmVtb3ZpbmcgaXQgYXMgYSBjaGlsZCBvZiBpdHMgcGFyZW50LlxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5nZXRQYXJlbnQoKS5yZW1vdmVDaGlsZCh0aGlzLm5vZGUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGhpZGUoKSB7XG4gICAgdGhpcy5ub2RlLmhpZGUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzaG93KCkge1xuICAgIHRoaXMubm9kZS5zaG93KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gVXBkYXRlIGZ1bmN0aW9ucyBmb3IgdGhpcy5ub2RlXG4gIHJlcXVlc3RVcGRhdGUocmVxdWVzdGVyKSB7XG4gICAgRmFtb3VzRW5naW5lLnJlcXVlc3RVcGRhdGUocmVxdWVzdGVyIHx8IHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHJlcXVlc3RVcGRhdGVPbk5leHRUaWNrKHJlcXVlc3Rlcikge1xuICAgIEZhbW91c0VuZ2luZS5yZXF1ZXN0VXBkYXRlT25OZXh0VGljayhyZXF1ZXN0ZXIgfHwgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gaGVscGVycyBmb3IgYWxpZ25cbiAgdmFsaWRhdGVBbGlnbigpIHtcbiAgICBpZiAoIXRoaXMuYWxpZ24pIHRoaXMuYWxpZ24gPSBuZXcgQWxpZ24odGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0QWxpZ24oKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaWduKCk7XG4gICAgdGhpcy5hbGlnbi5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gQWxpZ24gZ2V0dGVyc1xuICBnZXRBbGlnblZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHJldHVybiB0aGlzLmFsaWduLmdldFZhbHVlKCk7XG4gIH1cbiAgZ2V0QWxpZ25YKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHJldHVybiB0aGlzLmFsaWduLmdldFgoKTtcbiAgfVxuXG4gIGdldEFsaWduWSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICByZXR1cm4gdGhpcy5hbGlnbi5nZXRZKCk7XG4gIH1cbiAgZ2V0QWxpZ25aKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHJldHVybiB0aGlzLmFsaWduLmdldFooKTtcbiAgfVxuICAvLyBBbGlnbiBzZXR0ZXJzXG4gIHNldEFsaWduVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaWduKCk7XG4gICAgdGhpcy5hbGlnbi5zZXRWYWx1ZSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldEFsaWduKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHRoaXMuYWxpZ24uc2V0KC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0QWxpZ25YKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHRoaXMuYWxpZ24uc2V0WCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldEFsaWduWSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICB0aGlzLmFsaWduLnNldFkoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRBbGlnblooKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaWduKCk7XG4gICAgdGhpcy5hbGlnbi5zZXRaKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gaGVscGVycyBmb3IgbW91bnQgcG9pbnRcbiAgdmFsaWRhdGVNb3VudFBvaW50KCkge1xuICAgIGlmICghdGhpcy5tb3VudHBvaW50KSB0aGlzLm1vdW50cG9pbnQgPSBuZXcgTW91bnRQb2ludCh0aGlzLm5vZGUpO1xuICB9XG4gIGhhbHRNb3VudFBvaW50KCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgdGhpcy5tb3VudHBvaW50LmhhbHQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvLyBNb3VudFBvaW50IGdldHRlcnNcbiAgZ2V0TW91bnRQb2ludFZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgcmV0dXJuIHRoaXMubW91bnRwb2ludC5nZXRWYWx1ZSgpO1xuICB9XG4gIGdldE1vdW50UG9pbnRYKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgcmV0dXJuIHRoaXMubW91bnRwb2ludC5nZXRYKCk7XG4gIH1cbiAgZ2V0TW91bnRQb2ludFkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1vdW50UG9pbnQoKTtcbiAgICByZXR1cm4gdGhpcy5tb3VudHBvaW50LmdldFkoKTtcbiAgfVxuICBnZXRNb3VudFBvaW50WigpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHJldHVybiB0aGlzLm1vdW50cG9pbnQuZ2V0WigpO1xuICB9XG4gIC8vIE1vdW50UG9pbnQgc2V0dGVyc1xuICBzZXRNb3VudFBvaW50VmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1vdW50UG9pbnQoKTtcbiAgICB0aGlzLm1vdW50cG9pbnQuc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRNb3VudFBvaW50KCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgdGhpcy5tb3VudHBvaW50LnNldCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE1vdW50UG9pbnRYKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgdGhpcy5tb3VudHBvaW50LnNldFgoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRNb3VudFBvaW50WSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHRoaXMubW91bnRwb2ludC5zZXRZKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0TW91bnRQb2ludFooKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1vdW50UG9pbnQoKTtcbiAgICB0aGlzLm1vdW50cG9pbnQuc2V0WiguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIG9wYWNpdHlcbiAgdmFsaWRhdGVPcGFjaXR5KCkge1xuICAgIGlmICghdGhpcy5vcGFjaXR5KSB0aGlzLm9wYWNpdHkgPSBuZXcgT3BhY2l0eSh0aGlzLm5vZGUpO1xuICB9XG4gIGhhbHRPcGFjaXR5KCkge1xuICAgIHRoaXMudmFsaWRhdGVPcGFjaXR5KCk7XG4gICAgdGhpcy5vcGFjaXR5LmhhbHQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvLyBPcGFjaXR5IGdldHRlcnNcbiAgZ2V0T3BhY2l0eVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcGFjaXR5KCk7XG4gICAgcmV0dXJuIHRoaXMub3BhY2l0eS5nZXRWYWx1ZSgpO1xuICB9XG4gIGdldE9wYWNpdHkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9wYWNpdHkoKTtcbiAgICByZXR1cm4gdGhpcy5vcGFjaXR5LmdldCgpO1xuICB9XG4gIC8vIE9wYWNpdHkgc2V0dGVyc1xuICBzZXRPcGFjaXR5VmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9wYWNpdHkoKTtcbiAgICB0aGlzLm9wYWNpdHkuc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRPcGFjaXR5KCkge1xuICAgIHRoaXMudmFsaWRhdGVPcGFjaXR5KCk7XG4gICAgdGhpcy5vcGFjaXR5LnNldCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIG9yaWdpblxuICB2YWxpZGF0ZU9yaWdpbigpIHtcbiAgICBpZiAoIXRoaXMub3JpZ2luKSB0aGlzLm9yaWdpbiA9IG5ldyBPcmlnaW4odGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0T3JpZ2luKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICB0aGlzLm9yaWdpbi5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gT3JpZ2luIGdldHRlcnNcbiAgZ2V0T3JpZ2luVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5nZXRWYWx1ZSgpO1xuICB9XG4gIGdldE9yaWdpblgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5nZXRYKCk7XG4gIH1cbiAgZ2V0T3JpZ2luWSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLmdldFkoKTtcbiAgfVxuICBnZXRPcmlnaW5aKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uZ2V0WigpO1xuICB9XG4gIC8vIE9yaWdpbiBzZXR0ZXJzXG4gIHNldE9yaWdpblZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICB0aGlzLm9yaWdpbi5zZXRWYWx1ZSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE9yaWdpbigpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgdGhpcy5vcmlnaW4uc2V0KC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0T3JpZ2luWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgdGhpcy5vcmlnaW4uc2V0WCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE9yaWdpblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHRoaXMub3JpZ2luLnNldFkoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRPcmlnaW5aKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICB0aGlzLm9yaWdpbi5zZXRaKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gaGVscGVycyBmb3IgcG9zaXRpb25cbiAgdmFsaWRhdGVQb3NpdGlvbigpIHtcbiAgICBpZiAoIXRoaXMucG9zaXRpb24pIHRoaXMucG9zaXRpb24gPSBuZXcgUG9zaXRpb24odGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0UG9zaXRpb24oKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgdGhpcy5wb3NpdGlvbi5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gUG9zaXRpb24gZ2V0dGVyc1xuICBnZXRQb3NpdGlvblZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmdldFZhbHVlKCk7XG4gIH1cbiAgZ2V0UG9zaXRpb25YKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmdldFgoKTtcbiAgfVxuICBnZXRQb3NpdGlvblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24uZ2V0WSgpO1xuICB9XG4gIGdldFBvc2l0aW9uWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5nZXRaKCk7XG4gIH1cbiAgLy8gUG9zaXRpb24gc2V0dGVyc1xuICBzZXRQb3NpdGlvblZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHRoaXMucG9zaXRpb24uc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRQb3NpdGlvbigpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICB0aGlzLnBvc2l0aW9uLnNldCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFBvc2l0aW9uWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICB0aGlzLnBvc2l0aW9uLnNldFgoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRQb3NpdGlvblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgdGhpcy5wb3NpdGlvbi5zZXRZKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0UG9zaXRpb25aKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHRoaXMucG9zaXRpb24uc2V0WiguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIHJvdGF0aW9uXG4gIHZhbGlkYXRlUm90YXRpb24oKSB7XG4gICAgaWYgKCF0aGlzLnJvdGF0aW9uKSB0aGlzLnJvdGF0aW9uID0gbmV3IFJvdGF0aW9uKHRoaXMubm9kZSk7XG4gIH1cbiAgaGFsdFJvdGF0aW9uKCkge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHRoaXMucm90YXRpb24uaGFsdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIFJvdGF0aW9uIGdldHRlcnNcbiAgZ2V0Um90YXRpb25WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICBsZXQgdmFsID0gdGhpcy5yb3RhdGlvbi5nZXRWYWx1ZSgpO1xuICAgIHZhbC54ID0gdGhpcy5nZXRSb3RhdGlvblZhbCh2YWwueCk7XG4gICAgdmFsLnkgPSB0aGlzLmdldFJvdGF0aW9uVmFsKHZhbC55KTtcbiAgICB2YWwueiA9IHRoaXMuZ2V0Um90YXRpb25WYWwodmFsLnopO1xuICAgIHJldHVybiB2YWw7XG4gIH1cbiAgZ2V0Um90YXRpb25YKCkge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHJldHVybiB0aGlzLmdldFJvdGF0aW9uVmFsKHRoaXMucm90YXRpb24uZ2V0WCgpKTtcbiAgfVxuICBnZXRSb3RhdGlvblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Um90YXRpb25WYWwodGhpcy5yb3RhdGlvbi5nZXRZKCkpO1xuICB9XG4gIGdldFJvdGF0aW9uWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5nZXRSb3RhdGlvblZhbCh0aGlzLnJvdGF0aW9uLmdldFooKSk7XG4gIH1cbiAgLy8gUm90YXRpb24gc2V0dGVyc1xuICBzZXRSb3RhdGlvblZhbHVlKHN0YXRlID0ge30pIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICBzdGF0ZS54ID0gdGhpcy5zZXRSb3RhdGlvblZhbChzdGF0ZS54KTtcbiAgICBzdGF0ZS55ID0gdGhpcy5zZXRSb3RhdGlvblZhbChzdGF0ZS55KTtcbiAgICBzdGF0ZS56ID0gdGhpcy5zZXRSb3RhdGlvblZhbChzdGF0ZS56KTtcbiAgICB0aGlzLnJvdGF0aW9uLnNldFZhbHVlKHN0YXRlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRSb3RhdGlvbih4LCB5LCB6LCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHRoaXMucm90YXRpb24uc2V0KHRoaXMuc2V0Um90YXRpb25WYWwoeCksIHRoaXMuc2V0Um90YXRpb25WYWwoeSksIHRoaXMuc2V0Um90YXRpb25WYWwoeiksIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRSb3RhdGlvblgodmFsLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHRoaXMucm90YXRpb24uc2V0WCh0aGlzLnNldFJvdGF0aW9uVmFsKHZhbCksIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRSb3RhdGlvblkodmFsLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHRoaXMucm90YXRpb24uc2V0WSh0aGlzLnNldFJvdGF0aW9uVmFsKHZhbCksIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRSb3RhdGlvbloodmFsLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuc2V0Um90YXRpb25WYWwodmFsKTtcbiAgICB0aGlzLnJvdGF0aW9uLnNldFoodmFsdWUsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciBzY2FsZVxuICB2YWxpZGF0ZVNjYWxlKCkge1xuICAgIGlmICghdGhpcy5zY2FsZSkgdGhpcy5zY2FsZSA9IG5ldyBTY2FsZSh0aGlzLm5vZGUpO1xuICB9XG4gIGhhbHRTY2FsZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2NhbGUoKTtcbiAgICB0aGlzLnNjYWxlLmhhbHQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvLyBTY2FsZSBnZXR0ZXJzXG4gIGdldFNjYWxlVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGUuZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRTY2FsZVgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGUuZ2V0WCgpO1xuICB9XG4gIGdldFNjYWxlWSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2NhbGUoKTtcbiAgICByZXR1cm4gdGhpcy5zY2FsZS5nZXRZKCk7XG4gIH1cbiAgZ2V0U2NhbGVaKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHJldHVybiB0aGlzLnNjYWxlLmdldFooKTtcbiAgfVxuICAvLyBTY2FsZSBzZXR0ZXJzXG4gIHNldFNjYWxlVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgdGhpcy5zY2FsZS5zZXRWYWx1ZSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFNjYWxlKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHRoaXMuc2NhbGUuc2V0KC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0U2NhbGVYKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHRoaXMuc2NhbGUuc2V0WCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFNjYWxlWSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2NhbGUoKTtcbiAgICB0aGlzLnNjYWxlLnNldFkoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRTY2FsZVooKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgdGhpcy5zY2FsZS5zZXRaKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gaGVscGVycyBmb3Igc2l6ZVxuICB2YWxpZGF0ZVNpemUoKSB7XG4gICAgaWYgKCF0aGlzLnNpemUpIHRoaXMuc2l6ZSA9IG5ldyBTaXplKHRoaXMubm9kZSk7XG4gIH1cbiAgaGFsdFNpemUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNpemUoKTtcbiAgICB0aGlzLnNpemUuaGFsdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIFNpemUgZ2V0dGVyc1xuICBnZXRTaXplVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNpemUoKTtcbiAgICByZXR1cm4gdGhpcy5zaXplLmdldFZhbHVlKCk7XG4gIH1cbiAgZ2V0U2l6ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2l6ZSgpO1xuICAgIHJldHVybiB0aGlzLnNpemUuZ2V0KCk7XG4gIH1cbiAgLy8gU2l6ZSBzZXR0ZXJzXG4gIHNldFNpemVWYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2l6ZSgpO1xuICAgIHRoaXMuc2l6ZS5zZXRWYWx1ZSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldERpZmZlcmVudGlhbFNpemUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNpemUoKTtcbiAgICB0aGlzLnNpemUuc2V0RGlmZmVyZW50aWFsKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0UHJvcG9ydGlvbmFsU2l6ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2l6ZSgpO1xuICAgIHRoaXMuc2l6ZS5zZXRQcm9wb3J0aW9uYWwoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRBYnNvbHV0ZVNpemUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNpemUoKTtcbiAgICB0aGlzLnNpemUuc2V0QWJzb2x1dGUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRTaXplTW9kZSh4LCB5LCB6KSB7XG4gICAgdGhpcy5ub2RlLnNldFNpemVNb2RlKHgsIHksIHopO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFNpemVNb2RlQWJzb2x1dGUoKSB7XG4gICAgdGhpcy5ub2RlLnNldFNpemVNb2RlKFNpemUuQUJTT0xVVEUsIFNpemUuQUJTT0xVVEUsIFNpemUuQUJTT0xVVEUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFNpemVNb2RlUmVsYXRpdmUoKSB7XG4gICAgdGhpcy5ub2RlLnNldFNpemVNb2RlKFNpemUuUkVMQVRJVkUsIFNpemUuUkVMQVRJVkUsIFNpemUuUkVMQVRJVkUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFNpemVNb2RlUmVuZGVyKCkge1xuICAgIHRoaXMubm9kZS5zZXRTaXplTW9kZShTaXplLlJFTkRFUiwgU2l6ZS5SRU5ERVIsIFNpemUuUkVOREVSKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBDb252ZW5pZW5jZSBNZXRob2RzXG4gIG1vdmVUb3BMZWZ0KCkge1xuICAgIHRoaXMuc2V0QWxpZ24oMCwgMCwgMC41KS5zZXRNb3VudFBvaW50KDAsIDAsIDAuNSkuc2V0T3JpZ2luKDAsIDAsIDAuNSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgbW92ZVRvcENlbnRlcigpIHtcbiAgICB0aGlzLnNldEFsaWduKDAuNSwgMCwgMC41KS5zZXRNb3VudFBvaW50KDAuNSwgMCwgMC41KS5zZXRPcmlnaW4oMC41LCAwLCAwLjUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG1vdmVUb3BSaWdodCgpIHtcbiAgICB0aGlzLnNldEFsaWduKDEsIDAsIDAuNSkuc2V0TW91bnRQb2ludCgxLCAwLCAwLjUpLnNldE9yaWdpbigxLCAwLCAwLjUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG1vdmVDZW50ZXJMZWZ0KCkge1xuICAgIHRoaXMuc2V0QWxpZ24oMCwgMC41LCAwLjUpLnNldE1vdW50UG9pbnQoMCwgMC41LCAwLjUpLnNldE9yaWdpbigwLCAwLjUsIDAuNSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgbW92ZUNlbnRlcigpIHtcbiAgICB0aGlzLnNldEFsaWduKDAuNSwgMC41LCAwLjUpLnNldE1vdW50UG9pbnQoMC41LCAwLjUsIDAuNSkuc2V0T3JpZ2luKDAuNSwgMC41LCAwLjUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG1vdmVDZW50ZXJSaWdodCgpIHtcbiAgICB0aGlzLnNldEFsaWduKDEsIDAuNSwgMC41KS5zZXRNb3VudFBvaW50KDEsIDAuNSwgMC41KS5zZXRPcmlnaW4oMSwgMC41LCAwLjUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG1vdmVCb3R0b21MZWZ0KCkge1xuICAgIHRoaXMuc2V0QWxpZ24oMCwgMSwgMC41KS5zZXRNb3VudFBvaW50KDAsIDEsIDAuNSkuc2V0T3JpZ2luKDAsIDEsIDAuNSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgbW92ZUJvdHRvbUNlbnRlcigpIHtcbiAgICB0aGlzLnNldEFsaWduKDAuNSwgMSwgMC41KS5zZXRNb3VudFBvaW50KDAuNSwgMSwgMC41KS5zZXRPcmlnaW4oMC41LCAxLCAwLjUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG1vdmVCb3R0b21SaWdodCgpIHtcbiAgICB0aGlzLnNldEFsaWduKDEsIDEsIDAuNSkuc2V0TW91bnRQb2ludCgxLCAxLCAwLjUpLnNldE9yaWdpbigxLCAxLCAwLjUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iLCIvKipcbiAqIFZpZXcgY2xhc3MgdGhhdCBleHRlbmRzIE1vZGlmaWVyIGFuZCBzaG91bGQgYmUgdXNlZCBmb3IgdmlzdWFsIGVsZW1lbnRzLlxuICovXG5cbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi4vZXZlbnRzL0V2ZW50RW1pdHRlcic7XG5pbXBvcnQgTW9kaWZpZXIgZnJvbSAnLi9Nb2RpZmllcic7XG5cbmNvbnN0IENvbG9yID0gRmFtb3VzUGxhdGZvcm0udXRpbGl0aWVzLkNvbG9yO1xuY29uc3QgVHJhbnNpdGlvbmFibGUgPSBGYW1vdXNQbGF0Zm9ybS50cmFuc2l0aW9ucy5UcmFuc2l0aW9uYWJsZTtcbmNvbnN0IERPTUVsZW1lbnQgPSBGYW1vdXNQbGF0Zm9ybS5kb21SZW5kZXJhYmxlcy5ET01FbGVtZW50O1xuY29uc3QgRHluYW1pY0dlb21ldHJ5ID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xHZW9tZXRyaWVzLkR5bmFtaWNHZW9tZXRyeTtcbmNvbnN0IEdlb21ldHJ5ID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xHZW9tZXRyaWVzLkdlb21ldHJ5O1xuY29uc3QgRXZlbnRNYXAgPSBPYmplY3Qua2V5cyhGYW1vdXNQbGF0Zm9ybS5kb21SZW5kZXJlcnMuRXZlbnRzLkV2ZW50TWFwKTtcbmNvbnN0IE1lc2ggPSBGYW1vdXNQbGF0Zm9ybS53ZWJnbFJlbmRlcmFibGVzLk1lc2g7XG5jb25zdCBPQkpMb2FkZXIgPSBGYW1vdXNQbGF0Zm9ybS53ZWJnbEdlb21ldHJpZXMuT0JKTG9hZGVyO1xuXG4vKipcbiAqIENvbnZlcnRzIHJhdyB0ZXh0IGZyb20gYW4gT0JKIGludG8gYSBEeW5hbWljR2VvbWV0cnkuXG4gKiBAbWV0aG9kICBvYmpUb0dlb21ldHJ5XG4gKiBAcGFyYW0gICB7U3RyaW5nfSAgICAgICAgICAgcmF3VGV4dCAgVGhlIHJhdyB0ZXh0IGZyb20gYW4gT0JKIGZpbGUuXG4gKiBAcmV0dXJuICB7RHluYW1pY0dlb21ldHJ5fSAgVGhlIG5ldyBEeW5hbWljR2VvbWV0cnkgZnJvbSB0aGUgT0JKLlxuICovXG5mdW5jdGlvbiBvYmpUb0dlb21ldHJ5KHJhd1RleHQsIG9wdGlvbnMpIHtcbiAgbGV0IGJ1ZmZlcnMgPSBPQkpMb2FkZXIuZm9ybWF0VGV4dChyYXdUZXh0LCBvcHRpb25zKTtcbiAgbGV0IGdlb21ldHJ5ID0gbmV3IEdlb21ldHJ5KHtcbiAgICBidWZmZXJzOiBbXG4gICAgICB7IG5hbWU6ICdhX3BvcycsIGRhdGE6IGJ1ZmZlcnMudmVydGljZXMsIHNpemU6IDMgfSxcbiAgICAgIHsgbmFtZTogJ2Ffbm9ybWFscycsIGRhdGE6IGJ1ZmZlcnMubm9ybWFscywgc2l6ZTogMyB9LFxuICAgICAgeyBuYW1lOiAnYV90ZXhDb29yZCcsIGRhdGE6IGJ1ZmZlcnMudGV4dHVyZUNvb3Jkcywgc2l6ZTogMiB9LFxuICAgICAgeyBuYW1lOiAnaW5kaWNlcycsIGRhdGE6IGJ1ZmZlcnMuaW5kaWNlcywgc2l6ZTogMSB9XG4gICAgXVxuICB9KTtcbiAgcmV0dXJuIGdlb21ldHJ5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3IGV4dGVuZHMgTW9kaWZpZXJ7XG4gIGNvbnN0cnVjdG9yKG5vZGUsIG9wdGlvbnMpIHtcbiAgICBzdXBlcihub2RlLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBET00gQ3JlYXRpb24gYW5kIE1vZGlmaWVyc1xuICB2YWxpZGF0ZURPTShvcHRpb25zKSB7XG4gICAgaWYgKCF0aGlzLmVsKSB7XG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICAgIHRoaXMuZWwgPSBuZXcgRE9NRWxlbWVudCh0aGlzLm5vZGUsIG9wdGlvbnMpO1xuICAgICAgdGhpcy5lbC5vblJlY2VpdmUgPSAoZXZlbnQsIHBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50c1tldmVudF0pIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHNbZXZlbnRdKHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfVxuICBjcmVhdGVET01FbGVtZW50KG9wdGlvbnMpIHtcbiAgICB0aGlzLnZhbGlkYXRlRE9NKG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldERPTUNvbnRlbnQoY29udGVudCkge1xuICAgIHRoaXMudmFsaWRhdGVET00oKTtcbiAgICB0aGlzLmVsLnNldENvbnRlbnQoY29udGVudCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0RE9NQ2xhc3NlcyhjbGFzc2VzKSB7XG4gICAgdGhpcy52YWxpZGF0ZURPTSgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5lbC5hZGRDbGFzcyhjbGFzc2VzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0RE9NQXR0cmlidXRlcyhhdHRyaWJ1dGVzKSB7XG4gICAgdGhpcy52YWxpZGF0ZURPTSgpO1xuICAgIGZvciAobGV0IGF0dHJOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyaWJ1dGVzW2F0dHJOYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldERPTVByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIHRoaXMudmFsaWRhdGVET00oKTtcbiAgICBmb3IgKGxldCBwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgdGhpcy5lbC5zZXRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUsIHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0RE9NVW5zZWxlY3RhYmxlKCkge1xuICAgIHRoaXMudmFsaWRhdGVET00oKTtcbiAgICAvLyBNYWtlIHRoaXMgRE9NIHVuc2VsZWN0YWJsZS4gT25seSBuZWVkcyB0byBiZSBhcHBsaWVkIG9uY2UgcGVyIERPTS5cbiAgICBpZiAoIXRoaXMuX3Vuc2VsZWN0YWJsZSkge1xuICAgICAgdGhpcy5fdW5zZWxlY3RhYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuc2V0RE9NUHJvcGVydGllcyh7XG4gICAgICAgICctbW96LXVzZXItc2VsZWN0JzogJy1tb3otbm9uZScsXG4gICAgICAgICcta2h0bWwtdXNlci1zZWxlY3QnOiAnbm9uZScsXG4gICAgICAgICctd2Via2l0LXVzZXItc2VsZWN0JzogJ25vbmUnLFxuICAgICAgICAnLW1zLXVzZXItc2VsZWN0JzogJ25vbmUnLFxuICAgICAgICAndXNlci1zZWxlY3QnOiAnbm9uZScsXG4gICAgICAgICdjdXJzb3InOiAncG9pbnRlcidcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNldEN1dG91dFN0YXRlKHVzZUN1dG91dCkge1xuICAgIHRoaXMudmFsaWRhdGVET00oKVxuICAgIHRoaXMuZWwuc2V0Q3V0b3V0U3RhdGUodXNlQ3V0b3V0KTtcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBET00gRXZlbnRzXG4gIG9uKGV2TmFtZSwgZm4pIHtcbiAgICBpZiAoRXZlbnRNYXAuaW5kZXhPZihldk5hbWUpID4gLTEpIHtcbiAgICAgIC8vIERPTSBFdmVudFxuICAgICAgdGhpcy52YWxpZGF0ZURPTSgpO1xuICAgICAgdGhpcy5ub2RlLmFkZFVJRXZlbnQoZXZOYW1lKTtcbiAgICAgIHRoaXMuX2V2ZW50c1tldk5hbWVdID0gZm47XG4gICAgfSBlbHNlIHtcbiAgICAgIEV2ZW50RW1pdHRlci5vbihldk5hbWUsIGZuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgb2ZmKGV2TmFtZSwgZm4pIHtcbiAgICBpZiAoRXZlbnRNYXAuaW5kZXhPZihldk5hbWUpID4gLTEpIHtcbiAgICAgIC8vIFRPRE86IE5vdCBpbXBsZW1lbnRlZCBmb3IgRE9NIHlldFxuICAgIH0gZWxzZSB7XG4gICAgICBFdmVudEVtaXR0ZXIub2ZmKGV2TmFtZSwgZm4pO1xuICAgIH1cbiAgfVxuXG4gIC8vIEdsb2JhbCBFdmVudHNcbiAgdHJpZ2dlcihldk5hbWUsIHBheWxvYWQpIHtcbiAgICBFdmVudEVtaXR0ZXIudHJpZ2dlcihldk5hbWUsIHBheWxvYWQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGVtaXQoZXZOYW1lLCBwYXlsb2FkKSB7XG4gICAgY29uc29sZS53YXJuKCdWaWV3LmVtaXQoKSBpcyBkZXByZWNhdGVkLiBVc2UgVmlldy50cmlnZ2VyKCkgaW5zdGVhZC4nKTtcbiAgICByZXR1cm4gdGhpcy50cmlnZ2VyKGV2TmFtZSwgcGF5bG9hZCk7XG4gICAgLy8gaWYgKCF0aGlzLmV2ZW50RW1pdHRlcikgdGhpcy5ldmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKHRoaXMubm9kZSk7XG4gICAgLy8gdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChldiwgcGF5bG9hZCk7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gV2ViR0wgTWVzaCBDcmVhdGlvbiBhbmQgTW9kaWZpZXJzXG4gIHZhbGlkYXRlTWVzaCgpIHtcbiAgICBpZiAoIXRoaXMubWVzaCkgdGhpcy5tZXNoID0gbmV3IE1lc2godGhpcy5ub2RlKTtcbiAgfVxuICAvLyBNZXNoIEdldHRlcnNcbiAgZ2V0TWVzaEJhc2VDb2xvcigpIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIHJldHVybiB0aGlzLm1lc2guZ2V0QmFzZUNvbG9yKCk7XG4gIH1cbiAgZ2V0TWVzaERyYXdPcHRpb25zKCkge1xuICAgIHRoaXMudmFsaWRhdGVNZXNoKCk7XG4gICAgcmV0dXJuIHRoaXMubWVzaC5nZXREcmF3T3B0aW9ucygpO1xuICB9XG4gIGdldE1lc2hGbGF0U2hhZGluZygpIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIHJldHVybiB0aGlzLm1lc2guZ2V0RmxhdFNoYWRpbmcoKTtcbiAgfVxuICBnZXRNZXNoR2VvbWV0cnkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICByZXR1cm4gdGhpcy5tZXNoLmdldEdlb21ldHJ5KCk7XG4gIH1cbiAgZ2V0TWVzaEdsb3NzaW5lc3MoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICByZXR1cm4gdGhpcy5tZXNoLmdldEdsb3NzaW5lc3MoKTtcbiAgfVxuICBnZXRNZXNoTWF0ZXJpYWxFeHByZXNzaW9ucygpIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIHJldHVybiB0aGlzLm1lc2guZ2V0TWF0ZXJpYWxFeHByZXNzaW9ucygpO1xuICB9XG4gIGdldE1lc2hOb3JtYWxzKG1hdGVyaWFsRXhwcmVzc2lvbikge1xuICAgIHRoaXMudmFsaWRhdGVNZXNoKCk7XG4gICAgcmV0dXJuIHRoaXMubWVzaC5nZXROb3JtYWxzKG1hdGVyaWFsRXhwcmVzc2lvbik7XG4gIH1cbiAgZ2V0TWVzaFBvc2l0aW9uT2Zmc2V0KG1hdGVyaWFsRXhwcmVzc2lvbikge1xuICAgIHRoaXMudmFsaWRhdGVNZXNoKCk7XG4gICAgcmV0dXJuIHRoaXMubWVzaC5nZXRQb3NpdGlvbk9mZnNldChtYXRlcmlhbEV4cHJlc3Npb24pO1xuICB9XG4gIGdldE1lc2hWYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIHJldHVybiB0aGlzLm1lc2guZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIHNldEJhc2VDb2xvcihjb2xvciwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIGlmKCF0aGlzLmJhc2VDb2xvcikge1xuICAgICAgdGhpcy5iYXNlQ29sb3IgPSAoQ29sb3IuaXNDb2xvckluc3RhbmNlKGNvbG9yKSkgPyBjb2xvciA6IG5ldyBDb2xvcihjb2xvcik7XG4gICAgICB0aGlzLm1lc2guc2V0QmFzZUNvbG9yKHRoaXMuYmFzZUNvbG9yKTtcbiAgICB9XG4gICAgdGhpcy5iYXNlQ29sb3Iuc2V0KGNvbG9yLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRTcGVjdWxhckNvbG9yKGNvbG9yLCBzdHJlbmd0aCwgdHJhbnNpdGlvbiwgY2FsbGJhY2spIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIGlmKCF0aGlzLnNwZWN1bGFyQ29sb3IpIHtcbiAgICAgIHRoaXMuc3BlY3VsYXJDb2xvciA9IChDb2xvci5pc0NvbG9ySW5zdGFuY2UoY29sb3IpKSA/IGNvbG9yIDogbmV3IENvbG9yKGNvbG9yKTtcbiAgICAgIHRoaXMubWVzaC5zZXRHbG9zc2luZXNzKHRoaXMuc3BlY3VsYXJDb2xvciwgc3RyZW5ndGgpO1xuICAgIH1cbiAgICB0aGlzLnNwZWN1bGFyQ29sb3Iuc2V0KGNvbG9yLCB0cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRNZXNoRHJhd09wdGlvbnMob3B0aW9ucykge1xuICAgIHRoaXMudmFsaWRhdGVNZXNoKCk7XG4gICAgdGhpcy5tZXNoLnNldERyYXdPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE1lc2hGbGF0U2hhZGluZyhib29sKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICB0aGlzLm1lc2guc2V0RmxhdFNoYWRpbmcoYm9vbCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0TWVzaE9wdGlvbnMob3B0aW9ucykge1xuICAgIHRoaXMudmFsaWRhdGVNZXNoKCk7XG4gICAgdGhpcy5tZXNoLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0TWVzaFBvc2l0aW9uT2Zmc2V0KG1hdGVyaWFsRXhwcmVzc2lvbikge1xuICAgIHRoaXMudmFsaWRhdGVNZXNoKCk7XG4gICAgdGhpcy5tZXNoLnNldFBvc2l0aW9uT2Zmc2V0KG1hdGVyaWFsRXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0R2VvbWV0cnkoZ2VvbWV0cnksIG9wdGlvbnMpIHtcbiAgICB0aGlzLnZhbGlkYXRlTWVzaCgpO1xuICAgIHRoaXMuZ2VvbWV0cnkgPSBnZW9tZXRyeTtcbiAgICB0aGlzLm1lc2guc2V0R2VvbWV0cnkoZ2VvbWV0cnksIG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFdlYkdMIEdlb21ldHJ5XG4gIC8vIEdlb21ldHJ5IEdldHRlcnNcbiAgZ2V0R2VvbWV0cnlMZW5ndGgoKSB7IHJldHVybiB0aGlzLmdlb21ldHJ5LmdldExlbmd0aCgpOyB9XG4gIGdldE5vcm1hbHMoKSB7IHJldHVybiB0aGlzLmdlb21ldHJ5LmdldE5vcm1hbHMoKTsgfVxuICBnZXRUZXh0dXJlQ29vcmRzKCkgeyByZXR1cm4gdGhpcy5nZW9tZXRyeS5nZXRUZXh0dXJlQ29vcmRzKCk7IH1cbiAgZ2V0VmVydGV4QnVmZmVyKGJ1ZmZlck5hbWUpIHsgcmV0dXJuIHRoaXMuZ2VvbWV0cnkuZ2V0VmVydGV4QnVmZmVyKGJ1ZmZlck5hbWUpOyB9XG4gIGdldFZlcnRleFBvc2l0aW9ucygpIHsgcmV0dXJuIHRoaXMuZ2VvbWV0cnkuZ2V0VmVydGV4UG9zaXRpb25zKCk7IH1cbiAgLy8gR2VvbWV0cnkgU2V0dGVyc1xuICBmcm9tR2VvbWV0cnkoZ2VvbWV0cnkpIHtcbiAgICB0aGlzLmdlb21ldHJ5LmZyb21HZW9tZXRyeShnZW9tZXRyeSk7XG4gICAgdGhpcy5zZXRHZW9tZXRyeSh0aGlzLmdlb21ldHJ5KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXREcmF3VHlwZSh2YWx1ZSkge1xuICAgIHRoaXMuZ2VvbWV0cnkuc2V0RHJhd1R5cGUodmFsdWUpO1xuICAgIHRoaXMuc2V0R2VvbWV0cnkodGhpcy5nZW9tZXRyeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0SW5kaWNlcyhpbmRpY2VzKSB7XG4gICAgdGhpcy5nZW9tZXRyeS5zZXRJbmRpY2VzKGluZGljZXMpO1xuICAgIHRoaXMuc2V0R2VvbWV0cnkodGhpcy5nZW9tZXRyeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0Tm9ybWFscyhub3JtYWxzKSB7XG4gICAgdGhpcy5nZW9tZXRyeS5zZXROb3JtYWxzKG5vcm1hbHMpO1xuICAgIHRoaXMuc2V0R2VvbWV0cnkodGhpcy5nZW9tZXRyeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0VGV4dHVyZUNvb3Jkcyh0ZXh0dXJlQ29vcmRzKSB7XG4gICAgdGhpcy5nZW9tZXRyeS5zZXRUZXh0dXJlQ29vcmRzKHRleHR1cmVDb29yZHMpO1xuICAgIHRoaXMuc2V0R2VvbWV0cnkodGhpcy5nZW9tZXRyeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0VmVydGV4QnVmZmVyKGJ1ZmZlck5hbWUsIHZhbHVlLCBzaXplKSB7XG4gICAgdGhpcy5nZW9tZXRyeS5zZXRWZXJ0ZXhCdWZmZXIoYnVmZmVyTmFtZSwgdmFsdWUsIHNpemUpO1xuICAgIHRoaXMuc2V0R2VvbWV0cnkodGhpcy5nZW9tZXRyeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0VmVydGV4UG9zaXRpb25zKHZlcnRpY2VzKSB7XG4gICAgdGhpcy5nZW9tZXRyeS5zZXRWZXJ0ZXhQb3NpdGlvbnModmVydGljZXMpO1xuICAgIHRoaXMuc2V0R2VvbWV0cnkodGhpcy5nZW9tZXRyeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gV2ViR0wgQ29udmVuaWVuY2UgTWV0aG9kc1xuICB2YWxpZGF0ZU9ianMoKSB7XG4gICAgaWYgKCF0aGlzLm9ianMpIHRoaXMub2JqcyA9IHt9O1xuICB9XG5cbiAgc2V0RHluYW1pY0dlb21ldHJ5KGdlb21ldHJ5LCBvcHRpb25zKSB7XG4gICAgLy8gSW50ZW5kZWQgaW1wbGVtZW50YXRpb24gLSByZW1vdmVzIGdlb21ldHJ5UGFyZW50XG4gICAgdGhpcy5zZXRHZW9tZXRyeShuZXcgRHluYW1pY0dlb21ldHJ5KCksIG9wdGlvbnMpO1xuICAgIHRoaXMuZnJvbUdlb21ldHJ5KGdlb21ldHJ5KTtcbiAgICB0aGlzLnNldEdlb21ldHJ5KHRoaXMuZ2VvbWV0cnkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBHZW9tZXRyeSBmcm9tIHRoZSByYXdUZXh0IG9mIGFuIE9CSi5cbiAgICogQG1ldGhvZCAgc2V0T2JqR2VvbWV0cnlcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICAgIG9iak5hbWUgICAgICAgICAgICAgVGhlIG5hbWUgdG8gYXBwbHlcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICAgIHJhd1RleHQgICAgICAgICAgICAgVGhlIHJhdyB0ZXh0IGZyb20gYW4gT0JKIGZpbGUuXG4gICAqIEBwYXJhbSAgIHtBcnJheX0gICAgICAgICBvcHRpb25zLmFsaWduICAgICAgIFNldCB0aGUgQWxpZ24gb2YgdGhlIEdlb21ldHJ5LlxuICAgKiBAcGFyYW0gICB7QXJyYXl9ICAgICAgICAgb3B0aW9ucy5tb3VudHBvaW50ICBTZXQgdGhlIE1vdW50UG9pbnQgb2YgdGhlIEdlb21ldHJ5LlxuICAgKiBAcGFyYW0gICB7QXJyYXl9ICAgICAgICAgb3B0aW9ucy5vcmlnaW4gICAgICBTZXQgdGhlIE9yaWdpbiBvZiB0aGUgR2VvbWV0cnkuXG4gICAqL1xuICBhZGRPYmoob2JqTmFtZSwgcmF3VGV4dCwgb3B0aW9ucykge1xuICAgIHRoaXMudmFsaWRhdGVPYmpzKCk7XG4gICAgdGhpcy5vYmpzW29iak5hbWVdID0gbmV3IFZpZXcodGhpcy5hZGRDaGlsZCgpKTtcbiAgICB0aGlzLm9ianNbb2JqTmFtZV0uc2V0R2VvbWV0cnkob2JqVG9HZW9tZXRyeShyYXdUZXh0LCBvcHRpb25zKSlcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBoaWRlT2JqKG9iak5hbWUpIHtcbiAgICB0aGlzLnZhbGlkYXRlT2JqcygpO1xuICAgIHRoaXMub2Jqc1tvYmpOYW1lXS5zZXRPcGFjaXR5KDApO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGhpZGVPYmpzKCkge1xuICAgIHRoaXMudmFsaWRhdGVPYmpzKCk7XG4gICAgT2JqZWN0LmtleXModGhpcy5vYmpzKS5mb3JFYWNoKChvYmpOYW1lKSA9PiB7XG4gICAgICB0aGlzLm9ianNbb2JqTmFtZV0uc2V0T3BhY2l0eSgwKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzaG93T2JqKG9iak5hbWUpIHtcbiAgICB0aGlzLnZhbGlkYXRlT2JqcygpO1xuICAgIHRoaXMub2Jqc1tvYmpOYW1lXS5zZXRPcGFjaXR5KDEpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNob3dPYmpzKCkge1xuICAgIHRoaXMudmFsaWRhdGVPYmpzKCk7XG4gICAgT2JqZWN0LmtleXModGhpcy5vYmpzKS5mb3JFYWNoKChvYmpOYW1lKSA9PiB7XG4gICAgICB0aGlzLm9ianNbb2JqTmFtZV0uc2V0T3BhY2l0eSgxKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRPYmpzT3BhY2l0eSh2YWx1ZSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB0aGlzLnZhbGlkYXRlT2JqcygpO1xuICAgIE9iamVjdC5rZXlzKHRoaXMub2JqcykuZm9yRWFjaCgob2JqTmFtZSwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChpbmRleCA9PT0gMCkgdGhpcy5vYmpzW29iak5hbWVdLnNldE9wYWNpdHkodmFsdWUsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICAgIGVsc2UgdGhpcy5vYmpzW29iak5hbWVdLnNldE9wYWNpdHkodmFsdWUsIG9wdGlvbnMpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iLCJjb25zdCBDYWxsYmFja1N0b3JlID0gRmFtb3VzUGxhdGZvcm0udXRpbGl0aWVzLkNhbGxiYWNrU3RvcmU7XG5cbmNsYXNzIEV2ZW50RW1pdHRlclNpbmdsZXRvbiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2V2ZW50cyA9IG5ldyBDYWxsYmFja1N0b3JlKCk7XG4gIH1cbiAgb24oZXZOYW1lLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2V2ZW50cy5vbihldk5hbWUsIGNhbGxiYWNrKTtcbiAgfVxuICBvZmYoZXZOYW1lLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2V2ZW50cy5vbihldk5hbWUsIGNhbGxiYWNrKTtcbiAgfVxuICB0cmlnZ2VyKGV2TmFtZSwgcGF5bG9hZCkge1xuICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKGV2TmFtZSwgcGF5bG9hZCk7XG4gIH1cbn1cblxubGV0IEV2ZW50RW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXJTaW5nbGV0b24oKTtcblxuZXhwb3J0IGRlZmF1bHQgRXZlbnRFbWl0dGVyO1xuIiwiY29uc3QgQ29yZUZhbW91c0VuZ2luZSA9IEZhbW91c1BsYXRmb3JtLmNvcmUuRmFtb3VzRW5naW5lO1xuXG5yZXF1aXJlKCcuL3Jlc2V0Lm1pbi5jc3MnKTtcblxuY2xhc3MgRmFtb3VzRW5naW5lSW5pdCB7XG4gIC8qKlxuICAgKiBCb2lsZXJwbGF0ZSBjb2RlIHRvIHNldHVwIHRoZSBGYW1vdXMgRW5naW5lLlxuICAgKiBAbWV0aG9kICBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fY3VycmVudFNlbGVjdG9yID0gbnVsbDtcbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuX3Jvb3ROb2RlID0ge307XG4gIH1cblxuICBpbml0KCkge1xuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgcmV0dXJuIHRoaXM7XG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgLy8gQm9pbGVycGxhdGVcbiAgICBDb3JlRmFtb3VzRW5naW5lLmluaXQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSByb290IHtAbGluayBTY2VuZX0gZm9yIGEgZ2l2ZW4gc2VsZWN0b3IgYW5kIGFkZHMgYSByb290IE5vZGUgdG8gdGhhdCB7QGxpbmsgU2NlbmV9LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiAgICAgRmFtb3VzRW5naW5lXG4gICAqICAgICAgIC5pbml0KClcbiAgICogICAgICAgLmNyZWF0ZVNjZW5lKCcjYXBwJylcbiAgICogICAgICAgLmNyZWF0ZUNhbWVyYSgpO1xuICAgKiAgICAgd2luZG93LmFwcCA9IG5ldyBWaWV3KEZhbW91c0VuZ2luZS5nZXRSb290Tm9kZSgpKTtcbiAgICpcbiAgICogQG1ldGhvZCAgY3JlYXRlU2NlbmVcbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICAgIHNlbGVjdG9yICBUaGUgcXVlcnkgc2VsZWN0b3IgdXNlZCB0byBpbnN0YW50aWF0ZSB0aGUge0BsaW5rIFNjZW5lfS4gSWYgbm8gc2VsZWN0b3IgaXMgcGFzc2VkIHRoZW4gYGJvZHlgIGlzIHVzZWQuXG4gICAqIEByZXR1cm4gIHtGYW1vdXNFbmdpbmV9ICBTaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIEZhbW91c0VuZ2luZS5cbiAgICovXG4gIGNyZWF0ZVNjZW5lKHNlbGVjdG9yKSB7XG4gICAgdGhpcy5fY3VycmVudFNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgQ29yZUZhbW91c0VuZ2luZS5jcmVhdGVTY2VuZShzZWxlY3Rvcik7XG4gICAgdGhpcy5hZGRSb290Tm9kZShzZWxlY3Rvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjcmVhdGVDb250ZXh0KHNlbGVjdG9yKSB7XG4gICAgY29uc29sZS53YXJuKCdGYW1vdXNFbmdpbmUuY3JlYXRlQ29udGV4dCgpIGlzIGRlcHJlY2F0ZWQuIFVzZSBGYW1vdXNFbmdpbmUuY3JlYXRlU2NlbmUoKSBpbnN0ZWFkLicpO1xuICAgIHJldHVybiB0aGlzLmNyZWF0ZVNjZW5lKHNlbGVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgU2NlbmUgZm9yIGEgZ2l2ZW4gc2VsZWN0b3IuXG4gICAqIEBtZXRob2QgIGdldFNjZW5lXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgIFtzZWxlY3Rvcl0gICBUaGUgcXVlcnkgc2VsZWN0b3IuIERlZmF1bHRzIHRvIHRoZSBzZWxlY3RvciB1c2VkIHdpdGggY3JlYXRlU2NlbmUoKS5cbiAgICogQHJldHVybiAge1NjZW5lfSAgIFRoZSBGYW1vdXMge0BsaW5rIFNjZW5lfSBhc3NvY2lhdGVkIHdpdGggdGhlIHNlbGVjdG9yLlxuICAgKi9cbiAgZ2V0U2NlbmUoc2VsZWN0b3IpIHtcbiAgICBpZiAoIXNlbGVjdG9yKSBzZWxlY3RvciA9IHRoaXMuX2N1cnJlbnRTZWxlY3RvcjtcbiAgICBpZiAoIUNvcmVGYW1vdXNFbmdpbmUuZ2V0Q29udGV4dChzZWxlY3RvcikpIHRoaXMuY3JlYXRlU2NlbmUoc2VsZWN0b3IpO1xuICAgIHJldHVybiBDb3JlRmFtb3VzRW5naW5lLmdldENvbnRleHQoc2VsZWN0b3IpO1xuICB9XG5cbiAgZ2V0Q29udGV4dChzZWxlY3Rvcikge1xuICAgIGNvbnNvbGUud2FybignRmFtb3VzRW5naW5lLmdldENvbnRleHQoKSBpcyBkZXByZWNhdGVkLiBVc2UgRmFtb3VzRW5naW5lLmdldFNjZW5lKCkgaW5zdGVhZC4nKTtcbiAgICByZXR1cm4gdGhpcy5nZXRTY2VuZShzZWxlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHNpbmdsZSByb290IHtAbGluayBOb2RlfSB0aGUgRmFtb3VzIENvbnRleHQgZm9yIGEgZ2l2ZW4gc2VsZWN0b3IuXG4gICAqIEBtZXRob2QgIGFkZFJvb3ROb2RlXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICAgICBbc2VsZWN0b3JdICAgVGhlIHF1ZXJ5IHNlbGVjdG9yLiBEZWZhdWx0cyB0byB0aGUgc2VsZWN0b3IgdXNlZCB3aXRoIGNyZWF0ZVNjZW5lKCkuXG4gICAqIEByZXR1cm4gIHtDb250ZXh0fSAgICBUaGUgRmFtb3VzIENvbnRleHQgYXNzb2NpYXRlZCB3aXRoIHRoZSBzZWxlY3Rvci5cbiAgICovXG4gIGFkZFJvb3ROb2RlKHNlbGVjdG9yKSB7XG4gICAgaWYgKCFzZWxlY3Rvcikgc2VsZWN0b3IgPSB0aGlzLl9jdXJyZW50U2VsZWN0b3I7XG4gICAgaWYgKCF0aGlzLl9yb290Tm9kZVtzZWxlY3Rvcl0pIHRoaXMuX3Jvb3ROb2RlW3NlbGVjdG9yXSA9IHRoaXMuZ2V0U2NlbmUoc2VsZWN0b3IpLmFkZENoaWxkKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIHJvb3Qge0BsaW5rIE5vZGV9IGZvciBhIGdpdmVuIHNlbGVjdG9yLlxuICAgKiBAbWV0aG9kICBnZXRSb290Tm9kZVxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgICAgW3NlbGVjdG9yXSAgVGhlIHF1ZXJ5IHNlbGVjdG9yLiBEZWZhdWx0cyB0byB0aGUgc2VsZWN0b3IgdXNlZCB3aXRoIGNyZWF0ZVNjZW5lKCkuXG4gICAqIEByZXR1cm4gIHtOb2RlfSAgICAgICBUaGUgcm9vdCB7QGxpbmsgTm9kZX0gZm9yIGEgZ2l2ZW4gc2VsZWN0b3IuXG4gICAqL1xuICBnZXRSb290Tm9kZShzZWxlY3Rvcikge1xuICAgIGlmICghc2VsZWN0b3IpIHNlbGVjdG9yID0gdGhpcy5fY3VycmVudFNlbGVjdG9yO1xuICAgIGlmICghdGhpcy5fcm9vdE5vZGVbc2VsZWN0b3JdKSB0aGlzLmFkZFJvb3ROb2RlKHNlbGVjdG9yKTtcbiAgICByZXR1cm4gdGhpcy5fcm9vdE5vZGVbc2VsZWN0b3JdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGNoaWxkIHRvIHRoZSByb290IHtAbGluayBOb2RlfS5cbiAgICogQG1ldGhvZCAgYWRkQ2hpbGRcbiAgICogQHBhcmFtICAge1N0cmluZ30gIFtzZWxlY3Rvcl0gIFRoZSBxdWVyeSBzZWxlY3Rvci4gRGVmYXVsdHMgdG8gdGhlIHNlbGVjdG9yIHVzZWQgd2l0aCBjcmVhdGVTY2VuZSgpLlxuICAgKiBAcmV0dXJuICB7Tm9kZX0gICAgVGhlIG5ldyBjaGlsZCB7QGxpbmsgTm9kZX0gdGhhdCB3YXMgY3JlYXRlZC5cbiAgICovXG4gIGFkZENoaWxkKHNlbGVjdG9yKSB7XG4gICAgaWYgKCFzZWxlY3Rvcikgc2VsZWN0b3IgPSB0aGlzLl9jdXJyZW50U2VsZWN0b3I7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Um9vdE5vZGUoc2VsZWN0b3IpLmFkZENoaWxkKCk7XG4gIH1cbn1cblxubGV0IEZhbW91c0VuZ2luZSA9IG5ldyBGYW1vdXNFbmdpbmVJbml0KCk7XG5cbmV4cG9ydCBkZWZhdWx0IEZhbW91c0VuZ2luZTtcbiIsInZhciBjc3MgPSBcIi8qKiBFcmljIE1leWVyJ3MgUmVzZXQgQ1NTIHYyLjAgKGh0dHA6Ly9tZXllcndlYi5jb20vZXJpYy90b29scy9jc3MvcmVzZXQvKSAqIGh0dHA6Ly9jc3NyZXNldC5jb20gKi9odG1se2JveC1zaXppbmc6Ym9yZGVyLWJveDt9KiwqOmJlZm9yZSwqOmFmdGVye2JveC1zaXppbmc6aW5oZXJpdDt9YSxhYmJyLGFjcm9ueW0sYWRkcmVzcyxhcHBsZXQsYXJ0aWNsZSxhc2lkZSxhdWRpbyxiLGJpZyxibG9ja3F1b3RlLGJvZHksY2FudmFzLGNhcHRpb24sY2VudGVyLGNpdGUsY29kZSxkZCxkZWwsZGV0YWlscyxkZm4sZGl2LGRsLGR0LGVtLGVtYmVkLGZpZWxkc2V0LGZpZ2NhcHRpb24sZmlndXJlLGZvb3Rlcixmb3JtLGgxLGgyLGgzLGg0LGg1LGg2LGhlYWRlcixoZ3JvdXAsaHRtbCxpLGlmcmFtZSxpbWcsaW5zLGtiZCxsYWJlbCxsZWdlbmQsbGksbWFyayxtZW51LG5hdixvYmplY3Qsb2wsb3V0cHV0LHAscHJlLHEscnVieSxzLHNhbXAsc2VjdGlvbixzbWFsbCxzcGFuLHN0cmlrZSxzdHJvbmcsc3ViLHN1bW1hcnksc3VwLHRhYmxlLHRib2R5LHRkLHRmb290LHRoLHRoZWFkLHRpbWUsdHIsdHQsdSx1bCx2YXIsdmlkZW97Ym9yZGVyOjA7Zm9udDppbmhlcml0O21hcmdpbjowO3BhZGRpbmc6MDt2ZXJ0aWNhbC1hbGlnbjpiYXNlbGluZX1hcnRpY2xlLGFzaWRlLGRldGFpbHMsZmlnY2FwdGlvbixmaWd1cmUsZm9vdGVyLGhlYWRlcixoZ3JvdXAsbWVudSxuYXYsc2VjdGlvbntkaXNwbGF5OmJsb2NrfWh0bWwsYm9keXt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO31ib2R5e2xpbmUtaGVpZ2h0OjF9b2wsdWx7bGlzdC1zdHlsZTpub25lfWJsb2NrcXVvdGUscXtxdW90ZXM6bm9uZX1ibG9ja3F1b3RlOmFmdGVyLGJsb2NrcXVvdGU6YmVmb3JlLHE6YWZ0ZXIscTpiZWZvcmV7Y29udGVudDonJztjb250ZW50Om5vbmV9dGFibGV7Ym9yZGVyLWNvbGxhcHNlOmNvbGxhcHNlO2JvcmRlci1zcGFjaW5nOjB9XFxuXCI7IChyZXF1aXJlKFwiLi8uLi8uLi9jc3NpZnlcIikpKGNzcyk7IG1vZHVsZS5leHBvcnRzID0gY3NzOyIsImltcG9ydCBWaWV3ICAgICAgICAgICAgIGZyb20gJ2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L1ZpZXcnO1xuaW1wb3J0IEltYWdlICAgICAgICAgICAgZnJvbSAnLi9JbWFnZVNlcnZpY2UnO1xuXG5leHBvcnQgY2xhc3MgQ2FyIGV4dGVuZHMgVmlldyB7XG4gICAgY29uc3RydWN0b3Iobm9kZSwgb3B0aW9ucykge1xuICAgICAgICBzdXBlcihub2RlKTtcblxuICAgICAgICB0aGlzLm1vZGVsID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLnNldEFsaWduKC41LCAxKS5zZXRNb3VudFBvaW50KC41LCAxKS5zZXRPcmlnaW4oLjUsIC41KTtcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvblooMSk7XG5cbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZSgwLCAwKS5zZXRQcm9wb3J0aW9uYWxTaXplKDEsIDEpO1xuICAgICAgICAvL3RoaXMuc2V0U2NhbGUoMS4yLCAxLjIpO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICB0YWdOYW1lOiAnaW1nJyxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAnc3JjJzogYGFzc2V0cy9pbWFnZXMvY2FyLyR7dGhpcy5tb2RlbC5jdXJyZW50SW1hZ2V9LmpwZ2BcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjbGFzc2VzOiBbJ2Nhci1pbWFnZSddLFxuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICdiYWNrZmFjZS12aXNpYmlsaXR5JzogJ2hpZGRlbidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWR2YW5jZUltYWdlKCkge1xuICAgICAgICBpZihJbWFnZS5nZXRDdXJyZW50KCkgPCBJbWFnZS5nZXRNYXgoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRET01BdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICAgICAnc3JjJzogYGFzc2V0cy9pbWFnZXMvY2FyLyR7SW1hZ2UuZ2V0TmV4dCgpfS5qcGdgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZUltYWdlKGltZykge1xuICAgICAgICB0aGlzLnNldERPTUF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgJ3NyYyc6IGBhc3NldHMvaW1hZ2VzL2Nhci8ke2ltZ31gXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCBWaWV3ICAgICAgICAgICAgIGZyb20gJ2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L1ZpZXcnO1xuaW1wb3J0IHtDYXJ9ICAgICAgICAgICAgZnJvbSAnLi9DYXInO1xuaW1wb3J0IHtUaXRsZX0gICAgICAgICAgZnJvbSAnLi9UaXRsZSc7XG5cbmV4cG9ydCBjbGFzcyBGbGlwQ2FyZCBleHRlbmRzIFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKG5vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIobm9kZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5tb2RlbCA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy5zZXRBbGlnbigwLCAuNSkuc2V0TW91bnRQb2ludCgwLCAwKS5zZXRPcmlnaW4oMCwgMCk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25aKHRoaXMubW9kZWwuelBvcyk7XG5cbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZVJlbGF0aXZlKCkuc2V0UHJvcG9ydGlvbmFsU2l6ZSgxLCAuNSk7XG4gICAgICAgIC8vdGhpcy5zZXRTaXplTW9kZUFic29sdXRlKCkuc2V0QWJzb2x1dGVTaXplKDQyMCwgMzg0KTtcblxuICAgICAgICB0aGlzLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgY2xhc3NlczogW2BjYXJkLSR7dGhpcy5tb2RlbC5hbHBoYUlkfWBdLFxuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICd6LWluZGV4JzogdGhpcy5tb2RlbC56UG9zXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVuZGVyQ2FyKCk7XG4gICAgICAgIHRoaXMucmVuZGVyVGl0bGUoKTtcbiAgICB9XG5cbiAgICBnZXQgb3JkZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVsLm9yZGVyO1xuICAgIH1cblxuICAgIHNldCBvcmRlcihpKSB7XG4gICAgICAgIHRoaXMubW9kZWwub3JkZXIgPSBpO1xuICAgIH1cblxuICAgIHJlbmRlckNhcigpIHtcbiAgICAgICAgdGhpcy5jYXIgPSAgbmV3IENhcih0aGlzLmFkZENoaWxkKCksIHtcbiAgICAgICAgICAgIGFscGhhSWQ6IHRoaXMubW9kZWwuYWxwaGFJZCxcbiAgICAgICAgICAgIGN1cnJlbnRJbWFnZTogdGhpcy5tb2RlbC5pbWFnZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW5kZXJUaXRsZSgpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IG5ldyBUaXRsZSh0aGlzLmFkZENoaWxkKCksIHtcbiAgICAgICAgICAgIGFscGhhSWQ6IHRoaXMubW9kZWwuYWxwaGFJZCxcbiAgICAgICAgICAgIHRleHQ6IHRoaXMubW9kZWwubGV0dGVyXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkdmFuY2UoKSB7XG4gICAgICAgIGxldCB6UG9zO1xuXG4gICAgICAgIHN3aXRjaCh0aGlzLm9yZGVyKSB7XG4gICAgICAgICAgICBjYXNlIDE6IC8vIFdhcyBhdCB0b3AsIGFkdmFuY2UgdG8gbmV4dFxuICAgICAgICAgICAgICAgIHpQb3MgPSA5OTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFJvdGF0aW9uWCgwKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhci5hZHZhbmNlSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRpdGxlLnVwZGF0ZVBocmFzZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMub3JkZXIgPSAzO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOiAvLyBXYXMgYXQgYm90dG9tLCBhZHZhbmNlIHRvIHRvcFxuICAgICAgICAgICAgICAgIHpQb3MgPSA5OTtcbiAgICAgICAgICAgICAgICB0aGlzLm9yZGVyID0gMTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzovLyBXYXMgYXQgbmV4dCwgYWR2YW5jZSB0byBib3R0b21cbiAgICAgICAgICAgICAgICB6UG9zID0gMTAxO1xuICAgICAgICAgICAgICAgIHRoaXMub3JkZXIgPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tb2RlbC56UG9zID0gelBvcztcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvblooelBvcyk7XG4gICAgICAgIHRoaXMuc2V0RE9NUHJvcGVydGllcyh7XG4gICAgICAgICAgICAnei1pbmRleCc6IHpQb3NcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwidmFyIEltYWdlID0ge1xuICAgIF9jdXJyZW50SW1hZ2U6IDAsXG4gICAgX21heENvdW50OiAzNVxufTtcblxuSW1hZ2UuZ2V0Q3VycmVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50SW1hZ2U7XG59O1xuXG5JbWFnZS5nZXRNYXggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4Q291bnQ7XG59O1xuXG5JbWFnZS5nZXROZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fY3VycmVudEltYWdlKys7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRJbWFnZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEltYWdlO1xuIiwiaW1wb3J0IFZpZXcgICAgICAgICAgICAgZnJvbSAnZmFtb3VzLWNyZWF0aXZlL2Rpc3BsYXkvVmlldyc7XG5cbi8vR0wgQ29tcG9uZW50c1xuY29uc3QgQ29sb3IgICAgICAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS51dGlsaXRpZXMuQ29sb3I7XG5jb25zdCBHZW9tZXRyeSAgICAgICAgICA9IEZhbW91c1BsYXRmb3JtLndlYmdsR2VvbWV0cmllcy5HZW9tZXRyeTtcbmNvbnN0IEdlb21ldHJ5SGVscGVyICAgID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xHZW9tZXRyaWVzLkdlb21ldHJ5SGVscGVyO1xuY29uc3QgT0JKTG9hZGVyICAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS53ZWJnbEdlb21ldHJpZXMuT0JKTG9hZGVyO1xuY29uc3QgTWF0ZXJpYWwgICAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS53ZWJnbE1hdGVyaWFscy5NYXRlcmlhbDtcbmNvbnN0IFRleHR1cmVSZWdpc3RyeSAgID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xNYXRlcmlhbHMuVGV4dHVyZVJlZ2lzdHJ5O1xuXG5leHBvcnQgY2xhc3MgTG9nbyBleHRlbmRzIFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKG5vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIobm9kZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5zZXRBbGlnbigwLjUsIDAsIDAuNSkuc2V0TW91bnRQb2ludCgwLjUsIDAsIDAuNSkuc2V0T3JpZ2luKDAuNSwgMC41LCAwLjUpO1xuICAgICAgICB0aGlzLnNldFNpemVNb2RlQWJzb2x1dGUoKS5zZXRBYnNvbHV0ZVNpemUoMTUwLCAxNTAsIDE1MCk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25aKDIwMCk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25ZKDEyNSk7XG4gICAgICAgIHRoaXMuc2V0Um90YXRpb25YKE1hdGguUEkgKiAtMTAgLyAxODApO1xuXG4gICAgICAgIHRoaXMucGFyZW50ID0gbmV3IFZpZXcodGhpcy5hZGRDaGlsZCgpKTtcbiAgICAgICAgdGhpcy5xdWFkcyAgPSBuZXcgVmlldyh0aGlzLnBhcmVudC5hZGRDaGlsZCgpKTtcbiAgICAgICAgdGhpcy5xdWFkcy5zZXRPcmlnaW4oMC41LCAwLjUsIDAuNSk7XG4gICAgICAgIHRoaXMucXVhZHMuc2V0UG9zaXRpb25aKDEwMCk7XG5cbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzID0ge307XG5cbiAgICAgICAgY29uc3QgbmFtZXMgPSBbJ0InLCAnTScsICdXJywgJ291dGVyUmluZycsICdpbm5lclJpbmcnLCAnY3Jvc3MnLCAnb3V0c2lkZUN5bCcsICdpbnNpZGVDeWwnXTtcbiAgICAgICAgY29uc3QgcXVhZHMgPSBbJ2ZpcnN0JywgJ3NlY29uZCcsICd0aGlyZCcsICdmb3VydGgnXTtcblxuICAgICAgICBuYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdlb21ldHJpZXNbbmFtZV0gPSB0aGlzLm9iakZhY3RvcnkodGhpcy5wYXJlbnQuYWRkQ2hpbGQoKSwgbmFtZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHF1YWRzLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2VvbWV0cmllc1tuYW1lXSA9IHRoaXMub2JqRmFjdG9yeSh0aGlzLnF1YWRzLmFkZENoaWxkKCksIG5hbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjb2xvciA9IHtcbiAgICAgICAgICAgIGJsdWU6ICcjNTRBOUQ0JyxcbiAgICAgICAgICAgIHdoaXRlOiAnI0Y1RjVGNScsXG4gICAgICAgICAgICBkYXJrZXN0R3JleTogJyMyMjIyMjInLFxuICAgICAgICAgICAgZGFya2VyR3JleTogJyM0NDQ0NDQnLFxuICAgICAgICAgICAgZGFya0dyZXk6ICcjNTU1NTU1JyxcbiAgICAgICAgICAgIGdyYXk6ICcjQUFBQUFBJyxcbiAgICAgICAgICAgIGdsb3NzeTogJyNiYmJiZGQnXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzLkIuc2V0QmFzZUNvbG9yKG5ldyBDb2xvcihjb2xvci53aGl0ZSkpO1xuICAgICAgICB0aGlzLmdlb21ldHJpZXMuTS5zZXRCYXNlQ29sb3IobmV3IENvbG9yKGNvbG9yLndoaXRlKSk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5XLnNldEJhc2VDb2xvcihuZXcgQ29sb3IoY29sb3Iud2hpdGUpKTtcbiAgICAgICAgLyp0aGlzLmdlb21ldHJpZXMuQi5tZXNoLnNldEdsb3NzaW5lc3MoZ2xvc3N5Q29sb3IsIDYwKTtcbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzLk0ubWVzaC5zZXRHbG9zc2luZXNzKGdsb3NzeUNvbG9yLCA2MCk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5XLm1lc2guc2V0R2xvc3NpbmVzcyhnbG9zc3lDb2xvciwgNjApOyovXG5cbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzLmZpcnN0LnNldEJhc2VDb2xvcihuZXcgQ29sb3IoY29sb3Iud2hpdGUpKTtcbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzLnNlY29uZC5zZXRCYXNlQ29sb3IobmV3IENvbG9yKGNvbG9yLmJsdWUpKTtcbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzLnRoaXJkLnNldEJhc2VDb2xvcihuZXcgQ29sb3IoY29sb3Iud2hpdGUpKTtcbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzLmZvdXJ0aC5zZXRCYXNlQ29sb3IobmV3IENvbG9yKGNvbG9yLmJsdWUpKTtcbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzLmluc2lkZUN5bC5zZXRCYXNlQ29sb3IobmV3IENvbG9yKGNvbG9yLmRhcmtlc3RHcmV5KSk7XG5cbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzLm91dHNpZGVDeWwuc2V0QmFzZUNvbG9yKG5ldyBDb2xvcihjb2xvci5kYXJrZXJHcmV5KSk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5pbm5lclJpbmcuc2V0QmFzZUNvbG9yKG5ldyBDb2xvcihjb2xvci5ncmF5KSk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cmllcy5vdXRlclJpbmcuc2V0QmFzZUNvbG9yKG5ldyBDb2xvcihjb2xvci5ncmF5KSk7XG4gICAgICAgIC8qdGhpcy5nZW9tZXRyaWVzLm91dHNpZGVDeWwubWVzaC5zZXRHbG9zc2luZXNzKGdsb3NzeUNvbG9yLCAxMDApO1xuICAgICAgICB0aGlzLmdlb21ldHJpZXMuaW5uZXJSaW5nLm1lc2guc2V0R2xvc3NpbmVzcyhnbG9zc3lDb2xvciwgMTAwKTtcbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzLm91dGVyUmluZy5tZXNoLnNldEdsb3NzaW5lc3MoZ2xvc3N5Q29sb3IsIDEwMCk7Ki9cbiAgICB9XG5cbiAgICBvYmpGYWN0b3J5KG5vZGUsIG5hbWUpIHtcbiAgICAgICAgbGV0IGdlbyA9IG5ldyBWaWV3KG5vZGUpO1xuICAgICAgICBnZW8uc2V0QWxpZ24oMC41LCAwLCAwLjUpLnNldE1vdW50UG9pbnQoMC41LCAwLCAwLjUpLnNldE9yaWdpbigwLjUsIDAuNSwgMC41KTtcbiAgICAgICAgZ2VvLnNldFNpemVNb2RlQWJzb2x1dGUoKS5zZXRBYnNvbHV0ZVNpemUoMTUwLCAxNTAsIDE1MCk7XG4gICAgICAgIGdlby5zZXRPcGFjaXR5KDApO1xuXG4gICAgICAgIE9CSkxvYWRlci5sb2FkKCdhc3NldHMvb2JqLycgKyBuYW1lICsgJy5vYmonLCAoYnVmZmVycykgPT4ge1xuICAgICAgICAgICAgdmFyIG15R2VvID0gbmV3IEdlb21ldHJ5KHtcbiAgICAgICAgICAgICAgICBidWZmZXJzOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2FfcG9zJywgICAgIGRhdGE6IGJ1ZmZlcnMudmVydGljZXMsIHNpemU6IDMgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnYV9ub3JtYWxzJywgZGF0YTogYnVmZmVycy5ub3JtYWxzLCAgc2l6ZTogMyB9LFxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdpbmRpY2VzJywgICBkYXRhOiBidWZmZXJzLmluZGljZXMsICBzaXplOiAxIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGdlby5zZXRHZW9tZXRyeShteUdlbyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBnZW87XG4gICAgfVxufVxuIiwidmFyIFBocmFzZSA9IHtcbiAgICBfcGhyYXNlOiAnSGVsbG8gRnV0dXJlJyxcbiAgICBfY3VycmVudEluZGV4OiAwLFxuICAgIF9jdXJyZW50UGhyYXNlOiAnJ1xufTtcblxuUGhyYXNlLl9sZXR0ZXJzID0gUGhyYXNlLl9waHJhc2Uuc3BsaXQoJycpO1xuXG5QaHJhc2UuX2dldE5leHRMZXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLl9sZXR0ZXJzW3RoaXMuX2N1cnJlbnRJbmRleF0pIHtcbiAgICAgICAgbGV0IGN1cnJlbnRMZXR0ZXIgPSB0aGlzLl9sZXR0ZXJzW3RoaXMuX2N1cnJlbnRJbmRleF07XG4gICAgICAgIHRoaXMuX2N1cnJlbnRJbmRleCsrO1xuICAgICAgICByZXR1cm4gY3VycmVudExldHRlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufTtcblxuUGhyYXNlLmdldEN1cnJlbnRJbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50SW5kZXg7XG59O1xuXG5QaHJhc2UuZ2V0Q3VycmVudFBocmFzZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBsZXR0ZXIgPSB0aGlzLl9nZXROZXh0TGV0dGVyKCk7XG4gICAgaWYobGV0dGVyKSB7XG4gICAgICAgIGlmKGxldHRlciA9PT0gJyAnKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50UGhyYXNlICs9ICc8YnI+JztcbiAgICAgICAgICAgIGxldHRlciA9IHRoaXMuX2dldE5leHRMZXR0ZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2N1cnJlbnRQaHJhc2UgKz0gbGV0dGVyO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jdXJyZW50UGhyYXNlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGhyYXNlO1xuIiwiaW1wb3J0IFZpZXcgICAgICAgICAgICAgZnJvbSAnZmFtb3VzLWNyZWF0aXZlL2Rpc3BsYXkvVmlldyc7XG5pbXBvcnQgUGhyYXNlICAgICAgICAgICBmcm9tICcuL1BocmFzZVNlcnZpY2UnO1xuXG5leHBvcnQgY2xhc3MgVGl0bGUgZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5vZGUpO1xuXG4gICAgICAgIHRoaXMubW9kZWwgPSBvcHRpb25zO1xuXG4gICAgICAgIHRoaXMuc2V0QWxpZ24oLjUsIC41KS5zZXRNb3VudFBvaW50KC41LCAuNSkuc2V0T3JpZ2luKC41LCAuNSk7XG5cbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZVJlbGF0aXZlKCkuc2V0UHJvcG9ydGlvbmFsU2l6ZSgxLCAxKTtcblxuICAgICAgICAvLyBGbGlwIHRoZSBjYXJkIGJhY2t3YXJkcyB0byBiZSByZWFkeSBmb3IgdGhlIHJvdGF0aW9uIHVwIHRvIHRoZSB0b3AgcG9zaXRpb25cbiAgICAgICAgdGhpcy5zZXRSb3RhdGlvblgoKDE4MCAqIE1hdGguUEkpIC8gMTgwKTtcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvblooLTEpO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICB0YWdOYW1lOiAnaDEnLFxuICAgICAgICAgICAgY2xhc3NlczogWyd0aXRsZS10ZXh0J10sXG4gICAgICAgICAgICBjb250ZW50OiB0aGlzLm1vZGVsLnRleHQsXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJy13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eSc6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICdiYWNrZmFjZS12aXNpYmlsaXR5JzogJ2hpZGRlbicsXG4gICAgICAgICAgICAgICAgJ2JveC1zaXppbmcnOiAnYm9yZGVyLWJveCcsXG4gICAgICAgICAgICAgICAgJ2ZvbnQtc2l6ZSc6ICc3MHB4JyxcbiAgICAgICAgICAgICAgICAnZm9udC13ZWlnaHQnOiAnMzAwJyxcbiAgICAgICAgICAgICAgICAnbWFyZ2luJzogJzAnLFxuICAgICAgICAgICAgICAgICdwYWRkaW5nLXRvcCc6ICcxMDBweCcsXG4gICAgICAgICAgICAgICAgJ3RleHQtYWxpZ24nOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAndGV4dC10cmFuc2Zvcm0nOiAndXBwZXJjYXNlJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVQaHJhc2UoKSB7XG4gICAgICAgIGlmKFBocmFzZS5nZXRDdXJyZW50SW5kZXgoKSA9PT0gMTIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0T3BhY2l0eSgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RE9NQ29udGVudChQaHJhc2UuZ2V0Q3VycmVudFBocmFzZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCBUaW1lbGluZSAgICAgICAgIGZyb20gJ2ZhbW91cy1jcmVhdGl2ZS9hbmltYXRpb24vVGltZWxpbmUnO1xuaW1wb3J0IFZpZXcgICAgICAgICAgICAgZnJvbSAnZmFtb3VzLWNyZWF0aXZlL2Rpc3BsYXkvVmlldyc7XG5cbmltcG9ydCBGYW1vdXNFbmdpbmUgICAgIGZyb20gJ2ZhbW91cy1jcmVhdGl2ZS9zY2FmZm9sZGluZy9GYW1vdXNFbmdpbmUnO1xuXG5pbXBvcnQge0ZsaXBDYXJkfSAgICAgICBmcm9tICcuL0ZsaXBDYXJkJztcbmltcG9ydCB7TG9nb30gICAgICAgICAgIGZyb20gJy4vTG9nbyc7XG5pbXBvcnQgSW1hZ2UgICAgICAgICAgICBmcm9tICcuL0ltYWdlU2VydmljZSc7XG5pbXBvcnQgUGhyYXNlICAgICAgICAgICBmcm9tICcuL1BocmFzZVNlcnZpY2UnO1xuXG4vL0ZhbW91cyBDb21wb25lbnRzXG5jb25zdCBDdXJ2ZXMgICAgICAgICAgICA9IEZhbW91c1BsYXRmb3JtLnRyYW5zaXRpb25zLkN1cnZlcztcbmNvbnN0IEZhbW91cyAgICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0uY29yZS5GYW1vdXM7XG5cbi8vR0wgQ29tcG9uZW50c1xuY29uc3QgQW1iaWVudExpZ2h0ICAgICAgPSBGYW1vdXNQbGF0Zm9ybS53ZWJnbFJlbmRlcmFibGVzLkFtYmllbnRMaWdodDtcbmNvbnN0IENvbG9yICAgICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0udXRpbGl0aWVzLkNvbG9yO1xuY29uc3QgUG9pbnRMaWdodCAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS53ZWJnbFJlbmRlcmFibGVzLlBvaW50TGlnaHQ7XG5cbmNsYXNzIEFwcCBleHRlbmRzIFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICAgICAgc3VwZXIobm9kZSk7XG5cbiAgICAgICAgbGV0IGNhbWVyYSA9IG5ldyBGYW1vdXNQbGF0Zm9ybS5jb21wb25lbnRzLkNhbWVyYSh0aGlzLm5vZGUpO1xuICAgICAgICBjYW1lcmEuc2V0RGVwdGgoMTAwMCk7XG5cbiAgICAgICAgdGhpcy5zZXRBbGlnbiguNSwgLjUpLnNldE1vdW50UG9pbnQoLjUsIC41KTtcbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZUFic29sdXRlKCkuc2V0QWJzb2x1dGVTaXplKDQyMCwgNzY4KTtcblxuICAgICAgICB0aGlzLmJhc2VaUG9zID0ge1xuICAgICAgICAgICAgdG9wOiAxLFxuICAgICAgICAgICAgYm90dG9tOiAzLFxuICAgICAgICAgICAgbmV4dDogMSxcbiAgICAgICAgICAgIHNoYWRvdzogMlxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2xvY2sgPSBGYW1vdXNQbGF0Zm9ybS5jb3JlLkZhbW91c0VuZ2luZS5nZXRDbG9jaygpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyRmxpcENhcmRzKCk7XG4gICAgICAgIHRoaXMucmVuZGVyU2hhZG93cygpO1xuICAgICAgICB0aGlzLnJlbmRlckNsb3NpbmdUZXh0KCk7XG4gICAgICAgIHRoaXMucmVuZGVyU2t5KCk7XG4gICAgICAgIHRoaXMucmVuZGVyTG9nbygpO1xuXG4gICAgICAgIHRoaXMuaW5pdEZsaXBCb29rKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyRmxpcENhcmRzKCkge1xuICAgICAgICB0aGlzLmZsaXBDYXJkcyA9IFtdO1xuICAgICAgICBsZXQgY2FyZENvbmZpZ3MgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWxwaGFJZDogJ0EnLFxuICAgICAgICAgICAgICAgIG9yZGVyOiAxLFxuICAgICAgICAgICAgICAgIHpQb3M6IHRoaXMuYmFzZVpQb3MudG9wLFxuICAgICAgICAgICAgICAgIGltYWdlOiBJbWFnZS5nZXRDdXJyZW50KCksXG4gICAgICAgICAgICAgICAgbGV0dGVyOiBQaHJhc2UuZ2V0Q3VycmVudFBocmFzZSgpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFscGhhSWQ6ICdCJyxcbiAgICAgICAgICAgICAgICBvcmRlcjogMixcbiAgICAgICAgICAgICAgICB6UG9zOiB0aGlzLmJhc2VaUG9zLmJvdHRvbSxcbiAgICAgICAgICAgICAgICBpbWFnZTogSW1hZ2UuZ2V0Q3VycmVudCgpLFxuICAgICAgICAgICAgICAgIGxldHRlcjogUGhyYXNlLmdldEN1cnJlbnRQaHJhc2UoKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhbHBoYUlkOiAnQycsXG4gICAgICAgICAgICAgICAgb3JkZXI6IDMsXG4gICAgICAgICAgICAgICAgelBvczogdGhpcy5iYXNlWlBvcy5uZXh0LFxuICAgICAgICAgICAgICAgIGltYWdlOiBJbWFnZS5nZXROZXh0KCksXG4gICAgICAgICAgICAgICAgbGV0dGVyOiBQaHJhc2UuZ2V0Q3VycmVudFBocmFzZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgY2FyZENvbmZpZ3MuZm9yRWFjaCgoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZsaXBDYXJkcy5wdXNoKG5ldyBGbGlwQ2FyZCh0aGlzLmFkZENoaWxkKCksIGNvbmZpZykpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmZsaXBDYXJkc1swXS5zZXRSb3RhdGlvblgoKDE4MCAqIE1hdGguUEkpIC8gMTgwKTtcbiAgICB9XG5cbiAgICByZW5kZXJTaGFkb3dzKCkge1xuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0ge1xuICAgICAgICAgICAgJ3otaW5kZXgnOiB0aGlzLmJhc2VaUG9zLnNoYWRvdyxcbiAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyMwMDAwMDAnLFxuICAgICAgICAgICAgJ2JhY2tmYWNlLXZpc2liaWxpdHknOiAndmlzaWJsZSdcbiAgICAgICAgfTtcblxuICAgICAgICAvL1NIQURPVyBUT1BcbiAgICAgICAgdGhpcy5zaGFkb3dUb3AgPSBuZXcgVmlldyh0aGlzLmFkZENoaWxkKCkpO1xuXG4gICAgICAgIHRoaXMuc2hhZG93VG9wLnNldEFsaWduKDAsIDApO1xuICAgICAgICB0aGlzLnNoYWRvd1RvcC5zZXRNb3VudFBvaW50KDAsIDApO1xuICAgICAgICB0aGlzLnNoYWRvd1RvcC5zZXRPcGFjaXR5KDApO1xuXG4gICAgICAgIHRoaXMuc2hhZG93VG9wLnNldFNpemVNb2RlUmVsYXRpdmUoKTtcbiAgICAgICAgdGhpcy5zaGFkb3dUb3Auc2V0UHJvcG9ydGlvbmFsU2l6ZSgxLCAuNSk7XG4gICAgICAgIHRoaXMuc2hhZG93VG9wLnNldFBvc2l0aW9uWih0aGlzLmJhc2VaUG9zLnNoYWRvdyk7XG4gICAgICAgIHRoaXMuc2hhZG93VG9wLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgcHJvcGVydGllcyxcbiAgICAgICAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgICAgICAgY2xhc3NlczogWydzaGFkb3ctdG9wJ11cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9TSEFET1cgQk9UVE9NXG4gICAgICAgIHRoaXMuc2hhZG93Qm90dG9tID0gbmV3IFZpZXcodGhpcy5hZGRDaGlsZCgpKTtcblxuICAgICAgICB0aGlzLnNoYWRvd0JvdHRvbS5zZXRBbGlnbigwLCAuNSk7XG4gICAgICAgIHRoaXMuc2hhZG93Qm90dG9tLnNldE1vdW50UG9pbnQoMCwgMCk7XG4gICAgICAgIHRoaXMuc2hhZG93Qm90dG9tLnNldE9wYWNpdHkoLjMzKTtcblxuICAgICAgICAvL1RPRE8gcHV0IHRoaXMgYmFjayBvbmNlIHRoZSBzaXplIGlzc3VlIGlzIHJlc29sdmVkXG4gICAgICAgIC8vdGhpcy5zaGFkb3dUb3Auc2V0U2l6ZU1vZGVSZWxhdGl2ZSgpO1xuICAgICAgICAvL3RoaXMuc2hhZG93VG9wLnNldFByb3BvcnRpb25hbFNpemUoMSwgLjUpO1xuICAgICAgICB0aGlzLnNoYWRvd0JvdHRvbS5zZXRTaXplTW9kZUFic29sdXRlKCk7XG4gICAgICAgIHRoaXMuc2hhZG93Qm90dG9tLnNldEFic29sdXRlU2l6ZSg0MjAsIDM4NCk7XG5cbiAgICAgICAgdGhpcy5zaGFkb3dCb3R0b20uc2V0UG9zaXRpb25aKHRoaXMuYmFzZVpQb3Muc2hhZG93KTtcblxuICAgICAgICB0aGlzLnNoYWRvd0JvdHRvbS5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHByb3BlcnRpZXMsXG4gICAgICAgICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgICAgICAgIGNsYXNzZXM6IFsnc2hhZG93LWJvdHRvbSddXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlckNsb3NpbmdUZXh0KCkge1xuICAgICAgICAvL0NMT1NJTkcgVEVYVCAxXG4gICAgICAgIHRoaXMuY2xvc2luZ1RleHQxID0gbmV3IFZpZXcodGhpcy5hZGRDaGlsZCgpKTtcbiAgICAgICAgdGhpcy5jbG9zaW5nVGV4dDEuc2V0T3BhY2l0eSgwKTtcbiAgICAgICAgdGhpcy5jbG9zaW5nVGV4dDEuc2V0UG9zaXRpb25ZKDUzNSk7XG4gICAgICAgIHRoaXMuY2xvc2luZ1RleHQxLnNldFBvc2l0aW9uWig1KTtcblxuICAgICAgICB0aGlzLmNsb3NpbmdUZXh0MS5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAndGV4dC1hbGlnbic6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICdmb250LXNpemUnOiAnMjZweCcsXG4gICAgICAgICAgICAgICAgJ2xpbmUtaGVpZ2h0JzogJzEnLFxuICAgICAgICAgICAgICAgICd6LWluZGV4JzogJzUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgICAgICBjb250ZW50OiAnU0VFIEhPVyBXRSBCUk9VR0hUPGJyPlRPTU1PUlJPVyBUTyBUT0RBWSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9DTE9TSU5HIFRFWFQgMlxuICAgICAgICB0aGlzLmNsb3NpbmdUZXh0MiA9IG5ldyBWaWV3KHRoaXMuYWRkQ2hpbGQoKSk7XG4gICAgICAgIHRoaXMuY2xvc2luZ1RleHQyLnNldE9wYWNpdHkoMCk7XG4gICAgICAgIHRoaXMuY2xvc2luZ1RleHQyLnNldFBvc2l0aW9uWSg2MDApO1xuICAgICAgICB0aGlzLmNsb3NpbmdUZXh0Mi5zZXRQb3NpdGlvblooNCk7XG5cbiAgICAgICAgdGhpcy5jbG9zaW5nVGV4dDIuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtYWxpZ24nOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAnZm9udC1zaXplJzogJzI2cHgnLFxuICAgICAgICAgICAgICAgICdsaW5lLWhlaWdodCc6ICcxJyxcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6ICc0JyxcbiAgICAgICAgICAgICAgICAnY29sb3InOiAncmdiKDI1NSwyNTUsMjU1KSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICdIRUxMTyBGVVRVUkU8YnI+PHN0cm9uZz5UaGUgYWxsIG5ldyBlbGVjdHJpYyBCTVcgaTM8L3N0cm9uZz4nXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlclNreSgpIHtcbiAgICAgICAgdGhpcy5za3kgPSBuZXcgVmlldyh0aGlzLmFkZENoaWxkKCkpO1xuICAgICAgICB0aGlzLnNreS5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjMDAwMDAwJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjbGFzc2VzOiBbJ2JhY2tncm91bmQtc2t5J11cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5za3kuc2V0T3BhY2l0eSgwKTtcblxuICAgICAgICB0aGlzLnNreS5zZXRTaXplTW9kZVJlbGF0aXZlKCk7XG4gICAgICAgIHRoaXMuc2t5LnNldFByb3BvcnRpb25hbFNpemUoMSwgMSk7XG4gICAgfVxuXG4gICAgcmVuZGVyTG9nbygpIHtcbiAgICAgICAgdGhpcy5sb2dvID0gbmV3IExvZ28odGhpcy5hZGRDaGlsZCgpKTtcblxuICAgICAgICAvL0JhY2sgTGlnaHRcbiAgICAgICAgdGhpcy5iYWNrbGlnaHQgPSBuZXcgVmlldyh0aGlzLm5vZGUuYWRkQ2hpbGQoKSk7XG4gICAgICAgIHRoaXMuYmFja2xpZ2h0LnBvaW50TGlnaHQgPSBuZXcgUG9pbnRMaWdodCh0aGlzLmJhY2tsaWdodC5hZGRDaGlsZCgpKTtcbiAgICAgICAgdGhpcy5iYWNrbGlnaHQucG9pbnRMaWdodC5zZXRDb2xvcihuZXcgQ29sb3IoJyM0NDQ0NDQnKSk7XG4gICAgICAgIHRoaXMuYmFja2xpZ2h0LnNldFBvc2l0aW9uKDAsIC0xMDAsIC0xMDApO1xuXG4gICAgICAgIHRoaXMuYW1iaWVudExpZ2h0ID0gbmV3IFZpZXcodGhpcy5ub2RlLmFkZENoaWxkKCkpO1xuICAgICAgICB0aGlzLmFtYmllbnRMaWdodC5hbWJpZW50TGlnaHQgPSBuZXcgQW1iaWVudExpZ2h0KHRoaXMuYW1iaWVudExpZ2h0LmFkZENoaWxkKCkpO1xuICAgICAgICB0aGlzLmFtYmllbnRMaWdodC5hbWJpZW50TGlnaHQuc2V0Q29sb3IobmV3IENvbG9yKCcjOTk5OTk5JykpO1xuXG4gICAgICAgIHRoaXMucG9pbnRMaWdodEIgPSBuZXcgVmlldyh0aGlzLm5vZGUuYWRkQ2hpbGQoKSk7XG4gICAgICAgIHRoaXMucG9pbnRMaWdodEIucG9pbnRMaWdodCA9IG5ldyBQb2ludExpZ2h0KHRoaXMucG9pbnRMaWdodEIuYWRkQ2hpbGQoKSk7XG4gICAgICAgIHRoaXMucG9pbnRMaWdodEIucG9pbnRMaWdodC5zZXRDb2xvcihuZXcgQ29sb3IoJyNDQ0NDQ0MnKSk7XG4gICAgICAgIHRoaXMucG9pbnRMaWdodEIuc2V0UG9zaXRpb24oMCwgMTUwLCA0NTApO1xuICAgIH1cblxuICAgIGluaXRGbGlwQm9vaygpIHtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IDc1MDtcbiAgICAgICAgdGhpcy5jbG9jay5zZXRUaW1lb3V0KHRoaXMuZmxpcENhcmQuYmluZCh0aGlzKSwgMjAwMCk7XG4gICAgICAgIHRoaXMuZmxpcENvdW50ID0gMDtcbiAgICAgICAgdGhpcy50aW1lbGluZUluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZmxpcENhcmQoKSB7XG4gICAgICAgIGxldCB0b3BDYXJkLCBib3R0b21DYXJkLCBuZXh0Q2FyZDtcbiAgICAgICAgbGV0IGZsaXBEdXJhdGlvbiA9IHRoaXMuZHVyYXRpb247XG4gICAgICAgIHRoaXMuZmxpcENvdW50Kys7XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXJlIGVhY2ggY2FyZCBiYXNlZCBvbiBpdHMgb3JkZXIgcHJvcGVydHlcbiAgICAgICAgdGhpcy5mbGlwQ2FyZHMuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgICAgICAgICBzd2l0Y2goY2FyZC5vcmRlcikge1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgdG9wQ2FyZCA9IGNhcmQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tQ2FyZCA9IGNhcmQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgbmV4dENhcmQgPSBjYXJkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhpcyBpcyB0byBnZXQgcmlkIG9mIHRoZSBwaGFudG9tIGltYWdlIHNlZW4gYXQgaGlnaCBzcGVlZHMgaW4gdGhlIGZsaXAgYW5pbWF0aW9uXG4gICAgICAgIGlmKHRoaXMuZHVyYXRpb24gPCA1MCkge1xuICAgICAgICAgICAgZmxpcER1cmF0aW9uID0gMDtcbiAgICAgICAgICAgIHRoaXMuc2hhZG93Qm90dG9tLmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMuc2hhZG93VG9wLmhpZGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEVhY2ggc2hhZG93IGlzIG9ubHkgYWN0aXZlIGZvciBoYWxmIHRoZSB0aW1lIG9mIHRoZSBjYXJkIGZsaXBcbiAgICAgICAgICAgIGxldCBzaGFkb3dEdXJhdGlvbiA9IHRoaXMuZHVyYXRpb24gLyAyO1xuICAgICAgICAgICAgLy8gRmFkZSBvdXQgYm90dG9tIHNoYWRvdyBmb3IgdGhlIGZpcnN0IGhhbGYgb2YgdGhlIGZsaXAgYW5pbWF0aW9uXG4gICAgICAgICAgICB0aGlzLnNoYWRvd0JvdHRvbS5oYWx0T3BhY2l0eSgpO1xuICAgICAgICAgICAgdGhpcy5zaGFkb3dCb3R0b20uc2V0T3BhY2l0eSguMzMsIHsgZHVyYXRpb246IDB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dCb3R0b20uc2V0T3BhY2l0eSgwLCB7XG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBzaGFkb3dEdXJhdGlvblxuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmFkZSBpbiB0b3Agc2hhZG93IGZvciB0aGUgc2Vjb25kIGhhbGYgb2YgdGhlIGZsaXAgYW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93VG9wLmhhbHRPcGFjaXR5KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93VG9wLnNldE9wYWNpdHkoLjMzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogc2hhZG93RHVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBib3R0b20gY2FyZCBnZXRzIGZsaXBwZWQgdG8gdGhlIHRvcFxuICAgICAgICBib3R0b21DYXJkLnNldFJvdGF0aW9uWCgoMTgwICogTWF0aC5QSSkgLyAxODAsIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBmbGlwRHVyYXRpb25cbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgaWYodGhpcy5kdXJhdGlvbiA+IDUwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kdXJhdGlvbiAqPSAuODtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5mbGlwQ291bnQgPT09IDEwICYmICF0aGlzLnRpbWVsaW5lSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyVGltZWxpbmVQYXRocygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmZsaXBDb3VudCA8IDM1KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dUb3AuaGFsdE9wYWNpdHkoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYWRvd1RvcC5zZXRPcGFjaXR5KDAsIHtkdXJhdGlvbjogMH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZHZhbmNlQ2FyZChuZXh0Q2FyZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWR2YW5jZUNhcmQodG9wQ2FyZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWR2YW5jZUNhcmQoYm90dG9tQ2FyZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvY2suc2V0VGltZW91dCh0aGlzLmZsaXBDYXJkLmJpbmQodGhpcyksIHRoaXMuZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZHZhbmNlQ2FyZChjYXJkKSB7XG4gICAgICAgIGxldCB6UG9zO1xuXG4gICAgICAgIGlmKGNhcmQub3JkZXIgPT09IDEpIHsgICAgICAgICAgLy8gV2FzIGF0IHRvcCwgYWR2YW5jZSB0byBuZXh0XG4gICAgICAgICAgICB6UG9zID0gdGhpcy5iYXNlWlBvcy5uZXh0O1xuICAgICAgICAgICAgY2FyZC5vcmRlciA9IDM7XG4gICAgICAgICAgICBjYXJkLnNldFJvdGF0aW9uWCgwKTtcbiAgICAgICAgICAgIGNhcmQuY2FyLmFkdmFuY2VJbWFnZSgpO1xuICAgICAgICAgICAgY2FyZC50aXRsZS51cGRhdGVQaHJhc2UoKTtcbiAgICAgICAgfSBlbHNlIGlmKGNhcmQub3JkZXIgPT09IDIpIHsgICAvLyBXYXMgYXQgYm90dG9tLCBhZHZhbmNlIHRvIHRvcFxuICAgICAgICAgICAgelBvcyA9IHRoaXMuYmFzZVpQb3MudG9wO1xuICAgICAgICAgICAgY2FyZC5vcmRlciA9IDE7XG4gICAgICAgIH0gZWxzZSBpZihjYXJkLm9yZGVyID09PSAzKSB7ICAgLy8gV2FzIGF0IG5leHQsIGFkdmFuY2UgdG8gYm90dG9tXG4gICAgICAgICAgICB6UG9zID0gdGhpcy5iYXNlWlBvcy5ib3R0b207XG4gICAgICAgICAgICBjYXJkLm9yZGVyID0gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhcmQuc2V0UG9zaXRpb25aKHpQb3MpO1xuICAgICAgICBjYXJkLnNldERPTVByb3BlcnRpZXMoe1xuICAgICAgICAgICAgJ3otaW5kZXgnOiB6UG9zXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyVGltZWxpbmVQYXRocygpIHtcbiAgICAgICAgdGhpcy50aW1lbGluZUluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50aW1lbGluZSA9IG5ldyBUaW1lbGluZSh7IHRpbWVzY2FsZTogMSB9KTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckxvZ28oKTtcbiAgICAgICAgdGhpcy50aW1lbGluZS5zZXQoMjAwMDAsIHsgZHVyYXRpb246IDIwMDAwfSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJMb2dvKCkge1xuICAgICAgICBjb25zdCBsb2dvUXVhZHJhbnRzID0gW1xuICAgICAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMuc2Vjb25kLFxuICAgICAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMuZm91cnRoLFxuICAgICAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMuZmlyc3QsXG4gICAgICAgICAgICB0aGlzLmxvZ28uZ2VvbWV0cmllcy50aGlyZFxuICAgICAgICBdO1xuXG4gICAgICAgIGxldCB0aW1lID0ge1xuICAgICAgICAgICAgYTogWzAsIDI1MCwgNTAwLCA3NTBdLFxuICAgICAgICAgICAgZW5kOiAxNzUwXG4gICAgICAgIH07XG5cbiAgICAgICAgbG9nb1F1YWRyYW50cy5mb3JFYWNoKChxdWFkcmFudCwgaSkgPT4ge1xuICAgICAgICAgICAgbGV0IHgsIHksIHN0YXJ0VGltZTtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IDQwMDtcblxuICAgICAgICAgICAgc3dpdGNoKGkpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6ICAvLyB0b3AgbGVmdFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSB0aW1lLmFbMF07Ly90aGlzLnRpbWUucXVhZC5hO1xuICAgICAgICAgICAgICAgICAgICB4ID0gLW9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgeSA9IC1vZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogLy8gYm90dG9tIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IHRpbWUuYVsxXTsvL3RoaXMudGltZS5xdWFkLmI7XG4gICAgICAgICAgICAgICAgICAgIHggPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIHkgPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjogLy8gdG9wIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IHRpbWUuYVsyXTsvL3RoaXMudGltZS5xdWFkLmM7XG4gICAgICAgICAgICAgICAgICAgIHggPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIHkgPSAtb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDM6IC8vIGJvdHRvbSBsZWZ0XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IHRpbWUuYVszXTsgLy90aGlzLnRpbWUucXVhZC5kO1xuICAgICAgICAgICAgICAgICAgICB4ID0gLW9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgeSA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHF1YWRyYW50LnNldFBvc2l0aW9uKC4uLnZhbCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgICAgIFswLCBbeCwgeSwgMF1dLFxuICAgICAgICAgICAgICAgICAgICBbc3RhcnRUaW1lLCBbeCwgeSwgMF0sIEN1cnZlcy5pbk91dEJhY2tdLFxuICAgICAgICAgICAgICAgICAgICBbc3RhcnRUaW1lICsgMTAwMCwgWzAsIDAsIDBdXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICAgICBoYW5kbGVyOiAodCkgPT4ge1xuICAgICAgICAgICAgICAgICAgIGlmKHQgPj0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHF1YWRyYW50LnNldE9wYWNpdHkoMSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDI1MFxuICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICAgICAgWzAsIDBdLFxuICAgICAgICAgICAgICAgICAgICBbdGltZS5lbmQsIHRpbWUuZW5kXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgcm90WCA9IE1hdGguUEkgKiAwIC8gMTgwO1xuICAgICAgICAgICAgbGV0IHJvdFkgPSBNYXRoLlBJICogMzYwIC8gMTgwO1xuICAgICAgICAgICAgbGV0IHJvdFogPSBNYXRoLlBJICogMCAvIDE4MDtcblxuICAgICAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgICAgIGhhbmRsZXI6ICh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcXVhZHJhbnQuc2V0Um90YXRpb24oLi4udmFsKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICAgICAgW3N0YXJ0VGltZSwgW3JvdFgsIHJvdFksIHJvdFpdXSxcbiAgICAgICAgICAgICAgICAgICAgW3N0YXJ0VGltZSArIDEwMDAsIFswLCAwLCAwXV1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlckxvYWRPdXRzaWRlQ3lsaW5kZXIodGltZS5lbmQpO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyTG9hZE91dHNpZGVDeWxpbmRlcihzdGFydFRpbWUpIHtcbiAgICAgICAgc3RhcnRUaW1lID0gKHN0YXJ0VGltZSkgPyBzdGFydFRpbWUgOiAwO1xuICAgICAgICBsZXQgdGltZSA9IHtcbiAgICAgICAgICAgIGE6IFtzdGFydFRpbWVdLFxuICAgICAgICAgICAgZW5kOiBzdGFydFRpbWUgKyAxMDAwXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGhhc1NjYWxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaGFzU2NhbGVkICYmIHQgPj0gdGltZS5hWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhc1NjYWxlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMub3V0c2lkZUN5bC5zZXRTY2FsZSgwLCAwLCAwLCB7ZHVyYXRpb246IDB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ28uZ2VvbWV0cmllcy5vdXRzaWRlQ3lsLnNldFNjYWxlKDEsIDEsIDEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJ2ZTogQ3VydmVzLm91dEJhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMub3V0c2lkZUN5bC5zZXRPcGFjaXR5KDEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogODAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbc3RhcnRUaW1lLCBzdGFydFRpbWVdLFxuICAgICAgICAgICAgICAgIFt0aW1lLmVuZCwgdGltZS5lbmRdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJSb3RhdGVBc3NlbWJsZUxvZ28odGltZS5lbmQpO1xuICAgIH07XG5cbiAgICByZWdpc3RlclJvdGF0ZUFzc2VtYmxlTG9nbyhzdGFydFRpbWUpIHtcbiAgICAgICAgc3RhcnRUaW1lID0gKHN0YXJ0VGltZSkgPyBzdGFydFRpbWUgOiAwO1xuICAgICAgICBsZXQgcGhhc2VEdXJhdGlvbiA9IDE3NTA7XG4gICAgICAgIGxldCBlbmRUaW1lID0gc3RhcnRUaW1lICsgcGhhc2VEdXJhdGlvbjtcblxuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dvLnNldFJvdGF0aW9uWSh2YWwpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbc3RhcnRUaW1lLCAwLCBDdXJ2ZXMuZWFzZU91dF0sXG4gICAgICAgICAgICAgICAgW3N0YXJ0VGltZSArIDUwMCwgTWF0aC5QSSAqIDkwIC8xODBdLFxuICAgICAgICAgICAgICAgIFtzdGFydFRpbWUgKyAxMjUwLCBNYXRoLlBJICogOTAgLzE4MCwgQ3VydmVzLm91dEJhY2tdLFxuICAgICAgICAgICAgICAgIFtlbmRUaW1lLCAwXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgaXNTY3Jld2VkSW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZighaXNTY3Jld2VkSW4gJiYgdGltZSA+PSBzdGFydFRpbWUgKyA1MDApIHtcbiAgICAgICAgICAgICAgICAgICAgaXNTY3Jld2VkSW4gPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nby5xdWFkcy5zZXRSb3RhdGlvblooTWF0aC5QSSAqIDE0NDAgLyAxODAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA3NTBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dvLnF1YWRzLnNldFBvc2l0aW9uWigwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VydmU6IEN1cnZlcy5pbkJhY2tcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbc3RhcnRUaW1lLCBzdGFydFRpbWVdLFxuICAgICAgICAgICAgICAgIFtlbmRUaW1lLCBlbmRUaW1lXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyQWRkT3V0ZXJSaW5nSW5zaWRlQ3lsKGVuZFRpbWUpO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyQWRkT3V0ZXJSaW5nSW5zaWRlQ3lsKHN0YXJ0VGltZSkge1xuICAgICAgICBzdGFydFRpbWUgPSAoc3RhcnRUaW1lKSA/IHN0YXJ0VGltZSA6IDA7XG4gICAgICAgIGxldCBwaGFzZUR1cmF0aW9uID0gMTUwMDtcbiAgICAgICAgbGV0IGVuZFRpbWUgPSBzdGFydFRpbWUgKyBwaGFzZUR1cmF0aW9uO1xuXG4gICAgICAgIHRoaXMubG9nby5nZW9tZXRyaWVzLm91dGVyUmluZy5zZXRQb3NpdGlvblooMTAwMCk7XG4gICAgICAgIHRoaXMubG9nby5nZW9tZXRyaWVzLmluc2lkZUN5bC5zZXRQb3NpdGlvblooMTAwMCk7XG4gICAgICAgIHRoaXMubG9nby5nZW9tZXRyaWVzLmlubmVyUmluZy5zZXRQb3NpdGlvblooLTUwMCk7XG5cbiAgICAgICAgbGV0IGhhc1NjYWxlZERvd24gPSBmYWxzZTtcbiAgICAgICAgbGV0IGhhc1NjYWxlZFVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIWhhc1NjYWxlZERvd24gJiYgdGltZSA+PSBzdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzU2NhbGVkRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nby5nZW9tZXRyaWVzLm91dGVyUmluZy5zZXRPcGFjaXR5KDEsIHsgZHVyYXRpb246IDEwMDAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMub3V0ZXJSaW5nLnNldFBvc2l0aW9uWigwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnZlOiBDdXJ2ZXMuZWFzZUluXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nby5nZW9tZXRyaWVzLmluc2lkZUN5bC5zZXRPcGFjaXR5KDEsIHsgZHVyYXRpb246IDc1MCB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ28uZ2VvbWV0cmllcy5pbnNpZGVDeWwuc2V0UG9zaXRpb25aKDAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJ2ZTogQ3VydmVzLmVhc2VJblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZighaGFzU2NhbGVkVXAgJiYgdGltZSA+PSBzdGFydFRpbWUgKyAxMDAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhc1NjYWxlZFVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dvLmdlb21ldHJpZXMuaW5uZXJSaW5nLnNldE9wYWNpdHkoMSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nby5nZW9tZXRyaWVzLmlubmVyUmluZy5zZXRQb3NpdGlvblooMCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnZlOiBDdXJ2ZXMub3V0QmFja1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFtzdGFydFRpbWUsIHN0YXJ0VGltZV0sXG4gICAgICAgICAgICAgICAgW2VuZFRpbWUsIGVuZFRpbWVdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJMZXR0ZXJFbnRyeShlbmRUaW1lKTtcbiAgICB9XG5cbiAgICByZWdpc3RlckxldHRlckVudHJ5KHN0YXJ0VGltZSkge1xuICAgICAgICBzdGFydFRpbWUgPSAoc3RhcnRUaW1lKSA/IHN0YXJ0VGltZSA6IDA7XG4gICAgICAgIGxldCBwaGFzZUR1cmF0aW9uID0gMTUwMDtcbiAgICAgICAgbGV0IGVuZFRpbWUgPSBzdGFydFRpbWUgKyBwaGFzZUR1cmF0aW9uO1xuXG4gICAgICAgIGxldCBCID0gdGhpcy5sb2dvLmdlb21ldHJpZXMuQiwgTSA9IHRoaXMubG9nby5nZW9tZXRyaWVzLk0sIFcgPSB0aGlzLmxvZ28uZ2VvbWV0cmllcy5XO1xuXG4gICAgICAgIEIuc2V0UG9zaXRpb25aKDEwMCk7XG4gICAgICAgIE0uc2V0UG9zaXRpb25aKDEwMCk7XG4gICAgICAgIFcuc2V0UG9zaXRpb25aKDEwMCk7XG5cbiAgICAgICAgbGV0IGhhc0xvYWRlZExldHRlcnMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZighaGFzTG9hZGVkTGV0dGVycyAmJiB0aW1lID49IHN0YXJ0VGltZSkge1xuICAgICAgICAgICAgICAgICAgICBoYXNMb2FkZWRMZXR0ZXJzID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBCLnNldE9wYWNpdHkoMSwgeyBkdXJhdGlvbjogMjUwfSk7XG4gICAgICAgICAgICAgICAgICAgIEIuc2V0UG9zaXRpb25aKDAsIHsgZHVyYXRpb246IDI1MH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBNLnNldE9wYWNpdHkoMSwgeyBkdXJhdGlvbjogMjUwfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBNLnNldFBvc2l0aW9uWigwLCB7IGR1cmF0aW9uOiAyNTB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjUwKTtcblxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgVy5zZXRPcGFjaXR5KDEsIHsgZHVyYXRpb246IDI1MH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgVy5zZXRQb3NpdGlvblooMCwgeyBkdXJhdGlvbjogMjUwfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbc3RhcnRUaW1lLCBzdGFydFRpbWVdLFxuICAgICAgICAgICAgICAgIFtlbmRUaW1lLCBlbmRUaW1lXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyQ2FyKGVuZFRpbWUpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQ2xvc2luZ1RleHQoZW5kVGltZSk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJTa3koZW5kVGltZSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJDYXIoc3RhcnRUaW1lKSB7XG4gICAgICAgIHN0YXJ0VGltZSA9IChzdGFydFRpbWUpID8gc3RhcnRUaW1lIDogMDtcbiAgICAgICAgbGV0IHRpbWUgPSB7XG4gICAgICAgICAgICBhOiBbc3RhcnRUaW1lLCBzdGFydFRpbWUgKyAxMDAwXSxcbiAgICAgICAgICAgIGI6IFtzdGFydFRpbWUgKyAyMDAwLCBzdGFydFRpbWUgKyAzMDAwXSxcbiAgICAgICAgICAgIGVuZDogc3RhcnRUaW1lICsgMzAwMFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBsYXN0Q2FyZCA9IHRoaXMuZmxpcENhcmRzWzBdO1xuXG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICBsYXN0Q2FyZC5jYXIuc2V0UG9zaXRpb24oLi4udmFsKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgW3N0YXJ0VGltZSwgWzAsIDBdXSxcbiAgICAgICAgICAgICAgICBbdGltZS5hWzFdLCBbNDAwLCAtNjAwXSwgQ3VydmVzLm91dENpcmNdLFxuICAgICAgICAgICAgICAgIFt0aW1lLmJbMF0sIFs0MDAsIC04MjVdXSxcbiAgICAgICAgICAgICAgICBbdGltZS5iWzFdLCBbMCwgLTM3NV0sIEN1cnZlcy5pbkNpcmNdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBoYXNVcGRhdGVkSW1hZ2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZighaGFzVXBkYXRlZEltYWdlICYmIHQgPj0gdGltZS5iWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhc1VwZGF0ZWRJbWFnZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RDYXJkLmNhci51cGRhdGVJbWFnZSgnb3JhbmdlX21pcnJvcmVkLnBuZycpO1xuICAgICAgICAgICAgICAgICAgICBsYXN0Q2FyZC5jYXIuc2V0U2NhbGUoMSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RDYXJkLmNhci5zZXRTaXplTW9kZUFic29sdXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RDYXJkLmNhci5zZXRBYnNvbHV0ZVNpemUoNTUwLCAzNjcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgWzAsIDBdLFxuICAgICAgICAgICAgICAgIFt0aW1lLmVuZCwgdGltZS5lbmRdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBpc09wYWNpdGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZighaXNPcGFjaXRhdGVkICYmIHQgPj0gc3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzT3BhY2l0YXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxpcENhcmRzLmZvckVhY2goZnVuY3Rpb24oY2FyZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZC5zZXRET01Qcm9wZXJ0aWVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICdyZ2JhKDAsIDAsIDAsIDApJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlckxvZ29Ecm9wKHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgW3N0YXJ0VGltZSwgc3RhcnRUaW1lXSxcbiAgICAgICAgICAgICAgICBbdGltZS5lbmQsIHRpbWUuZW5kXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHJlZ2lzdGVyTG9nb0Ryb3Aoc3RhcnRUaW1lKSB7XG4gICAgICAgIHN0YXJ0VGltZSA9IChzdGFydFRpbWUpID8gc3RhcnRUaW1lIDogMDtcbiAgICAgICAgbGV0IHRpbWUgPSB7XG4gICAgICAgICAgICBhOiBbc3RhcnRUaW1lICsgMTUwMCwgc3RhcnRUaW1lICsgMzAwMF0sXG4gICAgICAgICAgICBlbmQ6IHN0YXJ0VGltZSArIDMwMFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBsb2dvID0ge1xuICAgICAgICAgICAgejogdGhpcy5sb2dvLmdldFBvc2l0aW9uWigpLFxuICAgICAgICAgICAgeTogdGhpcy5sb2dvLmdldFBvc2l0aW9uWSgpLFxuICAgICAgICAgICAgeDogdGhpcy5sb2dvLmdldFBvc2l0aW9uWCgpXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nby5zZXRQb3NpdGlvbiguLi52YWwpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbc3RhcnRUaW1lLCAgW2xvZ28ueCwgbG9nby55LCBsb2dvLnpdLCBDdXJ2ZXMuZWFzZUluXSxcbiAgICAgICAgICAgICAgICBbdGltZS5hWzBdLCAgW2xvZ28ueCwgMjUwLCAgICBsb2dvLnpdLCBDdXJ2ZXMuZWFzZU91dF0sXG4gICAgICAgICAgICAgICAgW3RpbWUuYVsxXSwgIFtsb2dvLngsIDM2NSwgICAgbG9nby56XV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nby5zZXRTY2FsZSguLi52YWwpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFtzdGFydFRpbWUsICBbMSwgMSwgMV0sIEN1cnZlcy5lYXNlT3V0XSxcbiAgICAgICAgICAgICAgICBbdGltZS5hWzBdLCBbLjcsIC43LCAuN10sIEN1cnZlcy5lYXNlSW5dLFxuICAgICAgICAgICAgICAgIFt0aW1lLmFbMV0sIFsuOSwgLjksIC45XV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZWdpc3RlclNreShzdGFydFRpbWUpIHtcbiAgICAgICAgc3RhcnRUaW1lID0gKHN0YXJ0VGltZSkgPyBzdGFydFRpbWUgOiAwO1xuICAgICAgICBsZXQgdGltZSA9IHtcbiAgICAgICAgICAgIGE6IFtzdGFydFRpbWUsIHN0YXJ0VGltZSArIDEwMDBdLFxuICAgICAgICAgICAgYjogW3N0YXJ0VGltZSArIDIwMDAsIHN0YXJ0VGltZSArIDMwMDBdLFxuICAgICAgICAgICAgZW5kOiBzdGFydFRpbWUgKyAzMDAwXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2t5LnNldE9wYWNpdHkodmFsKTtcbiAgICAgICAgICAgICAgICAvKnRoaXMuc2t5LnNldERPTVByb3BlcnRpZXMoe1xuICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICdyZ2IoJyArIE1hdGguZmxvb3IodmFsWzBdKSArICcsICcgKyBNYXRoLmZsb29yKHZhbFsxXSkgKyAnLCAnICsgTWF0aC5mbG9vcih2YWxbMl0pICsgJyknXG4gICAgICAgICAgICAgICAgfSkqL1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbdGltZS5iWzBdLCAwXSxcbiAgICAgICAgICAgICAgICBbdGltZS5iWzFdLCAxXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHJlZ2lzdGVyQ2xvc2luZ1RleHQoc3RhcnRUaW1lKSB7XG4gICAgICAgIC8vNzUwMFxuICAgICAgICBzdGFydFRpbWUgPSAoc3RhcnRUaW1lKSA/IHN0YXJ0VGltZSA6IDA7XG4gICAgICAgIGxldCB0aW1lID0ge1xuICAgICAgICAgICAgYTogW3N0YXJ0VGltZSArIDUwMCwgc3RhcnRUaW1lICsgMTUwMCwgc3RhcnRUaW1lICsgMzAwMF0sXG4gICAgICAgICAgICBiOiBbc3RhcnRUaW1lICsgMjcwMCwgc3RhcnRUaW1lICsgMzUwMF1cbiAgICAgICAgfTtcblxuICAgICAgICAvL0Nsb3NpbmcgdGV4dCAxXG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NpbmdUZXh0MS5zZXRPcGFjaXR5KHZhbCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFtzdGFydFRpbWUsIDBdLFxuICAgICAgICAgICAgICAgIFt0aW1lLmFbMF0sIDBdLFxuICAgICAgICAgICAgICAgIFt0aW1lLmFbMV0sIDFdLFxuICAgICAgICAgICAgICAgIFt0aW1lLmFbMl0sIDBdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCB5cG9zID0gdGhpcy5jbG9zaW5nVGV4dDEucG9zaXRpb24uZ2V0WSgpO1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zaW5nVGV4dDEuc2V0UG9zaXRpb24oLi4udmFsKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtbc3RhcnRUaW1lLCBbMCwgeXBvc11dLFxuICAgICAgICAgICAgICAgIFt0aW1lLmFbMV0sIFswLCB5cG9zXSwgQ3VydmVzLmVhc2VPdXRdLFxuICAgICAgICAgICAgICAgIFt0aW1lLmFbMl0sIFswLCB5cG9zICsgMTAwXV1dXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vQ2xvc2luZyB0ZXh0IDJcbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2luZ1RleHQyLnNldE9wYWNpdHkodmFsKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgW3N0YXJ0VGltZSwgMF0sXG4gICAgICAgICAgICAgICAgW3RpbWUuYlswXSwgMF0sXG4gICAgICAgICAgICAgICAgW3RpbWUuYlsxXSwgMV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbG9nb0JyZWF0aCgpIHtcbiAgICAgICAgdGhpcy5sb2dvLnNldFNjYWxlKDEuMDUsIDEuMDUsIDEuMDUsIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiA1MDBcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2dvLnNldFNjYWxlKDEsIDEsIDEsIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogNTAwXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cbn1cblxuRmFtb3VzRW5naW5lLmluaXQoKTtcbkZhbW91c0VuZ2luZS5jcmVhdGVTY2VuZSgnI2FwcCcpO1xuXG53aW5kb3cuYXBwID0gbmV3IEFwcChGYW1vdXNFbmdpbmUuYWRkQ2hpbGQoJyNhcHAnKSk7XG4iLCIndXNlIHN0cmljdCc7XG5yZXF1aXJlKCdiYWJlbGlmeS9wb2x5ZmlsbCcpO1xucmVxdWlyZSgnLi9hcHAvaW5kZXgnKTtcbiJdfQ==
