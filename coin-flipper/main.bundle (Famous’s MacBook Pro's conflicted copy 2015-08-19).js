(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./Modifier":2}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

        // this.addCardBack();
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
                    this.model.position.y = 312;
                    this.model.position.x = 20;
                    break;
                case 2:
                    this.model.rotation.z = 30 * Math.PI / 180;
                    this.model.position.x = -20;
                    this.model.position.y = 355;
                    break;
                case 3:
                    this.model.rotation.z = -23 * Math.PI / 180;
                    this.model.position.y = 245;
                    this.model.position.x = -30;
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

},{"famous-creative/display/View":3}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = {
    COIN_POS: window.innerHeight - 265,
    COIN_CENTER: window.innerHeight - 215
};
module.exports = exports["default"];

},{}],7:[function(require,module,exports){
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

},{"famous-creative/display/View":3}],8:[function(require,module,exports){
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
    } else {
        ratio = 1;
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
    } else {
        ratio = 1;
    }

    return ratio * v;
};

exports["default"] = Physics;
module.exports = exports["default"];

},{}],9:[function(require,module,exports){
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

                if (this.isBlackholeActive && distanceFromCenter < blackholeRadius) {
                    this.emit('spinRing', {});
                    this.isPhysicsActive = false;

                    this.sphere.setVelocity(0, 0, 0);
                    this.setPosition(0, _ENUMS2['default'].COIN_CENTER, 0, { duration: 250 }, function () {
                        _this5.setScale(0.1, 0.1, 0.1, { duration: 100 }, function () {
                            _this5._recycle();
                        });
                    });
                } else if (p.y > window.innerHeight + 100) {
                    this._recycle();
                } else if (p.y > _ENUMS2['default'].COIN_CENTER + 30 && v.y < 15 && v.x < 15) {
                    // Prevents the hanging bubbles
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

},{"./Enums":6,"./PhysicsService":8,"famous-creative/display/View":3}],10:[function(require,module,exports){
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

},{"./PhysicsService":8,"famous-creative/display/View":3}],11:[function(require,module,exports){
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

},{"famous-creative/display/View":3}],12:[function(require,module,exports){
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

var _TopText$TagLine$GetYours$PreOrder$Coin = require('./TextViews');

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

            //ringCount = 1;
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

},{"./Card":5,"./Enums":6,"./Hand":7,"./PhysicsService":8,"./Ring":9,"./SpinningRing":10,"./TextViews":11,"famous-creative/animation/Timeline":1,"famous-creative/display/View":3}],13:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _FamousEngine = require('famous-creative/scaffolding/FamousEngine');

var _FamousEngine2 = _interopRequireDefault(_FamousEngine);

'use strict';

_FamousEngine2['default'].init();

require('./app/index');

},{"./app/index":12,"famous-creative/scaffolding/FamousEngine":4}]},{},[13])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9jb2luLWZsaXBwZXIvbm9kZV9tb2R1bGVzL2ZhbW91cy1jcmVhdGl2ZS9hbmltYXRpb24vVGltZWxpbmUuanMiLCIvVXNlcnMvam9yZGFuUGFwYWxlby9Qcm9qZWN0cy9jcmVhdGl2ZS9jb2luLWZsaXBwZXIvbm9kZV9tb2R1bGVzL2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L01vZGlmaWVyLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvY29pbi1mbGlwcGVyL25vZGVfbW9kdWxlcy9mYW1vdXMtY3JlYXRpdmUvZGlzcGxheS9WaWV3LmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvY29pbi1mbGlwcGVyL25vZGVfbW9kdWxlcy9mYW1vdXMtY3JlYXRpdmUvc2NhZmZvbGRpbmcvRmFtb3VzRW5naW5lLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvY29pbi1mbGlwcGVyL3NyYy9hcHAvQ2FyZC5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2NvaW4tZmxpcHBlci9zcmMvYXBwL0VudW1zLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvY29pbi1mbGlwcGVyL3NyYy9hcHAvSGFuZC5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2NvaW4tZmxpcHBlci9zcmMvYXBwL1BoeXNpY3NTZXJ2aWNlLmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvY29pbi1mbGlwcGVyL3NyYy9hcHAvUmluZy5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2NvaW4tZmxpcHBlci9zcmMvYXBwL1NwaW5uaW5nUmluZy5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2NvaW4tZmxpcHBlci9zcmMvYXBwL1RleHRWaWV3cy5qcyIsIi9Vc2Vycy9qb3JkYW5QYXBhbGVvL1Byb2plY3RzL2NyZWF0aXZlL2NvaW4tZmxpcHBlci9zcmMvYXBwL2luZGV4LmpzIiwiL1VzZXJzL2pvcmRhblBhcGFsZW8vUHJvamVjdHMvY3JlYXRpdmUvY29pbi1mbGlwcGVyL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQ0FBLElBQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDO0FBQ2pELElBQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzFDLElBQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDOztJQUU1QyxRQUFRO0FBQ2hCLFdBRFEsUUFBUSxHQUNEO1FBQWQsT0FBTyxnQ0FBRyxFQUFFOzswQkFETCxRQUFROztBQUV6QixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDO0FBQ3hDLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDMUM7O2VBTGtCLFFBQVE7Ozs7Ozs7Ozs7Ozs7OztXQW1CZixzQkFBQyxRQUFRLEVBQUU7QUFDckIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDN0I7OztXQUVFLGFBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUU7OztBQUM5QixVQUFJLFVBQVUsRUFBRTtBQUNkLFlBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLGNBQU0sQ0FBQyx1QkFBdUIsQ0FB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QyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDM0Isd0JBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDNUIsMEJBQU07QUFBQSxBQUNWLHFCQUFLLENBQUM7QUFDRix3QkFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEFBQUMsR0FBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUksR0FBRyxDQUFDO0FBQzdDLHdCQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzVCLHdCQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzNCLDBCQUFNO0FBQUEsQUFDVixxQkFBSyxDQUFDO0FBQ0Ysd0JBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxBQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFJLEdBQUcsQ0FBQztBQUM3Qyx3QkFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQzVCLHdCQUFJLENBQUMsS0FBSyxDQUFFLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzdCLDBCQUFNO0FBQUEsQUFDVixxQkFBSyxDQUFDO0FBQ0Ysd0JBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxBQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUksR0FBRyxDQUFDO0FBQzlDLHdCQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzVCLHdCQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDNUIsMEJBQU07QUFBQSxBQUNWO0FBQ0ksMEJBQU07QUFBQSxhQUNiOzs7QUFHRCxzQkFBVSxDQUFDLFlBQVc7QUFDbEIs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QUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRSxFQUFFLEdBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQyxFQUMvQixDQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDbEMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUUsRUFBRSxHQUFFLEVBQUUsR0FBRSxDQUFDLENBQUMsRUFDL0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUUsRUFBRSxHQUFFLEVBQUUsR0FBRSxDQUFDLENBQUMsRUFDL0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUUsRUFBRSxHQUFFLEVBQUUsR0FBRSxDQUFDLENBQUMsRUFDL0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFFLEVBQUUsR0FBRSxFQUFFLEdBQUUsQ0FBQyxDQUFDLEVBQ3BDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFHLEVBQUUsSUFBRyxFQUFFLElBQUcsQ0FBQyxDQUFDLEVBQ2xDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFHLEVBQUUsSUFBRyxFQUFFLElBQUcsQ0FBQyxDQUFDLENBQ3JDLENBQUM7QUFDRixnQ0FBWSxDQUFDLFlBQVksR0FBRyxDQUN4QixDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsRUFDcEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxFQUFHLENBQUMsRUFBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUUsQ0FBQyxFQUNwRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUcsQ0FBQyxFQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBRSxDQUFDLEVBQ3BFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsRUFBRyxDQUFDLEVBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFFLENBQUMsRUFDcEUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUUsQ0FBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsRUFBRyxDQUFDLEVBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFFLENBQUMsRUFDekUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxFQUFHLENBQUMsRUFBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUUsQ0FBQyxFQUNwRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxFQUFHLENBQUMsRUFBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUUsQ0FBQyxFQUNqRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxFQUFHLENBQUMsRUFBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUUsQ0FBQyxFQUNsRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUUsQ0FB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LElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFO0FBQ3JCLG9CQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzthQUN4Qjs7QUFFRCxnQkFBRyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ2pDLG9CQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2FBQ3BDO0FBQ0QsZ0JBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUN2Qzs7O1dBcjBCUSxHQUFHOzs7UUFBSCxHQUFHLEdBQUgsR0FBRzs7QUF3MEJoQixJQUFNLFFBQVEsR0FBSyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEUsSUFBSSxNQUFNLEdBQUcsSUFBSSxjQUFjLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1RCxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV2QixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRTtBQUN0QyxjQUFVLEVBQUUsRUFFWDtDQUNKLENBQUMsQ0FBQzs7Ozs7Ozs0QkNsMkJzQiwwQ0FBMEM7Ozs7QUFGbkUsWUFBWSxDQUFDOztBQUdiLDBCQUFhLElBQUksRUFBRSxDQUFDOztBQUVwQixPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgQ3VydmVzID0gRmFtb3VzUGxhdGZvcm0udHJhbnNpdGlvbnMuQ3VydmVzO1xuY29uc3QgRmFtb3VzID0gRmFtb3VzUGxhdGZvcm0uY29yZS5GYW1vdXM7XG5jb25zdCBUcmFuc2l0aW9uYWJsZSA9IEZhbW91c1BsYXRmb3JtLnRyYW5zaXRpb25zLlRyYW5zaXRpb25hYmxlO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lbGluZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucGF0aFNldCA9IFtdO1xuICAgIHRoaXMudGltZXNjYWxlID0gb3B0aW9ucy50aW1lc2NhbGUgfHwgMTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gbmV3IFRyYW5zaXRpb25hYmxlKDApO1xuICB9XG5cbiAgLypcbiAgICAgICAgcGF0aERhdGEgPSB7XG4gICAgICAgICAgaGFuZGxlciA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXRoIDogW1xuICAgICAgICAgICAgWzAsIFswLCAwLCAwXV0sXG4gICAgICAgICAgICBbNTAwMCwgWzEwMCwgMTAwLCAxMDBdXVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAqL1xuXG4gIHJlZ2lzdGVyUGF0aChwYXRoRGF0YSkge1xuICAgIHRoaXMucGF0aFNldC5wdXNoKHBhdGhEYXRhKTtcbiAgfVxuXG4gIHNldCh0aW1lLCB0cmFuc2l0aW9uLCBjYWxsYmFjaykge1xuICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICB0aGlzLmluVHJhbnNpdGlvbiA9IHRydWU7XG4gICAgICBGYW1vdXMucmVxdWVzdFVwZGF0ZU9uTmV4dFRpY2sodGhpcyk7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lLnNldCh0aW1lLCB0cmFuc2l0aW9uLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuaW5UcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgICAgIEZhbW91cy5yZXF1ZXN0VXBkYXRlT25OZXh0VGljayh0aGlzKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3VycmVudFRpbWUuc2V0KHRpbWUpO1xuICAgICAgdGhpcy5pblRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICAgIEZhbW91cy5yZXF1ZXN0VXBkYXRlT25OZXh0VGljayh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBvblVwZGF0ZSh0aW1lKSB7XG4gICAgLy9nbyB0aHJvdWdoIHRoZSBwYXRoU2V0LCBhbmQgYmFzaWNhbGx5IGV4ZWN1dGUgdGhlIGZ1bmN0aW9uXG5cbiAgICB0aW1lID0gdGhpcy5jdXJyZW50VGltZS5nZXQoKSAqIHRoaXMudGltZXNjYWxlO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhdGhTZXQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCByZXMgPSBbXTtcbiAgICAgIGxldCBwYXRoRGF0YSA9IHRoaXMucGF0aFNldFtpXTtcblxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwYXRoRGF0YS5wYXRoLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGxldCByZXMgPSBbXTtcbiAgICAgICAgbGV0IGN1cnJTdGVwID0gcGF0aERhdGEucGF0aFtqXTtcbiAgICAgICAgbGV0IG5leHRTdGVwID0gcGF0aERhdGEucGF0aFtqICsgMV07XG5cbiAgICAgICAgLy9jdXJyZW50bHkgbWlkIHBhdGgsIGNhbGN1bGF0ZSBhbmQgYXBwbHkuXG4gICAgICAgIGlmIChuZXh0U3RlcCAmJiBjdXJyU3RlcFswXSA8PSB0aW1lICYmIG5leHRTdGVwWzBdID49IHRpbWUpIHtcbiAgICAgICAgICBsZXQgcGVyY2VudERvbmUgPSAodGltZSAtIGN1cnJTdGVwWzBdKSAvIChuZXh0U3RlcFswXSAtIGN1cnJTdGVwWzBdKTtcbiAgICAgICAgICBsZXQgc3RhdGUgPSBjdXJyU3RlcFsyXSA/IGN1cnJTdGVwWzJdKHBlcmNlbnREb25lKSA6IEN1cnZlcy5saW5lYXIocGVyY2VudERvbmUpO1xuXG4gICAgICAgICAgaWYgKGN1cnJTdGVwWzFdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgY3VyclN0ZXBbMV0ubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgcmVzW2tdID0gY3VyclN0ZXBbMV1ba10gKyAobmV4dFN0ZXBbMV1ba10gLSBjdXJyU3RlcFsxXVtrXSkgKiBzdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzID0gY3VyclN0ZXBbMV0gKyAobmV4dFN0ZXBbMV0gLSBjdXJyU3RlcFsxXSkgKiBzdGF0ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGF0aERhdGEuaGFuZGxlcihyZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy93ZSBhcmUgcGFzc2VkIGxhc3Qgc3RlcCwgc2V0IG9iamVjdCB0byBmaW5hbCBzdGF0ZS5cbiAgICAgICAgaWYgKCFuZXh0U3RlcCAmJiBjdXJyU3RlcFswXSA8IHRpbWUpIHtcbiAgICAgICAgICBwYXRoRGF0YS5oYW5kbGVyKGN1cnJTdGVwWzFdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmluVHJhbnNpdGlvbikge1xuICAgICAgRmFtb3VzLnJlcXVlc3RVcGRhdGVPbk5leHRUaWNrKHRoaXMpO1xuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBCYXNlIGNsYXNzIHdoaWNoIGNvbnRhaW5zIGFsbCBtb2RpZmllcnMgYW5kIGNvbnRhaW5zIG5vIHZpc3VhbCBjb21wb25lbnRzLlxuICovXG5cbmNvbnN0IEFsaWduID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5BbGlnbjtcbmNvbnN0IE1vdW50UG9pbnQgPSBGYW1vdXNQbGF0Zm9ybS5jb21wb25lbnRzLk1vdW50UG9pbnQ7XG5jb25zdCBPcGFjaXR5ID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5PcGFjaXR5O1xuY29uc3QgT3JpZ2luID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5PcmlnaW47XG5jb25zdCBQb3NpdGlvbiA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuUG9zaXRpb247XG5jb25zdCBSb3RhdGlvbiA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuUm90YXRpb247XG5jb25zdCBTY2FsZSA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuU2NhbGU7XG5jb25zdCBTaXplID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5TaXplO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RpZmllciB7XG4gIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xuICB9XG5cbiAgYWRkQ2hpbGQoKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZS5hZGRDaGlsZCgpO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIFNpemUgZW51bXNcbiAgc3RhdGljIGdldCBSRUxBVElWRV9TSVpFKCkge1xuICAgIHJldHVybiBTaXplLlJFTEFUSVZFO1xuICB9XG4gIHN0YXRpYyBnZXQgQUJTT0xVVEVfU0laRSgpIHtcbiAgICByZXR1cm4gU2l6ZS5BQlNPTFVURTtcbiAgfVxuICBzdGF0aWMgZ2V0IFJFTkRFUl9TSVpFKCkge1xuICAgIHJldHVybiBTaXplLlJFTkRFUjtcbiAgfVxuICBzdGF0aWMgZ2V0IERFRkFVTFRfU0laRSgpIHtcbiAgICByZXR1cm4gU2l6ZS5ERUZBVUxUO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIGFsaWduXG4gIHZhbGlkYXRlQWxpZ24oKSB7XG4gICAgaWYgKCF0aGlzLmFsaWduKSB0aGlzLmFsaWduID0gbmV3IEFsaWduKHRoaXMubm9kZSk7XG4gIH1cbiAgaGFsdEFsaWduKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHRoaXMuYWxpZ24uaGFsdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIEFsaWduIGdldHRlcnNcbiAgZ2V0QWxpZ25WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICByZXR1cm4gdGhpcy5hbGlnbi5nZXRWYWx1ZSgpO1xuICB9XG4gIGdldEFsaWduWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICByZXR1cm4gdGhpcy5hbGlnbi5nZXRYKCk7XG4gIH1cblxuICBnZXRBbGlnblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaWduKCk7XG4gICAgcmV0dXJuIHRoaXMuYWxpZ24uZ2V0WSgpO1xuICB9XG4gIGdldEFsaWduWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICByZXR1cm4gdGhpcy5hbGlnbi5nZXRaKCk7XG4gIH1cbiAgLy8gQWxpZ24gc2V0dGVyc1xuICBzZXRBbGlnblZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHRoaXMuYWxpZ24uc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRBbGlnbigpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICB0aGlzLmFsaWduLnNldCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldEFsaWduWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlQWxpZ24oKTtcbiAgICB0aGlzLmFsaWduLnNldFgoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRBbGlnblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZUFsaWduKCk7XG4gICAgdGhpcy5hbGlnbi5zZXRZKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0QWxpZ25aKCkge1xuICAgIHRoaXMudmFsaWRhdGVBbGlnbigpO1xuICAgIHRoaXMuYWxpZ24uc2V0WiguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIG1vdW50IHBvaW50XG4gIHZhbGlkYXRlTW91bnRQb2ludCgpIHtcbiAgICBpZiAoIXRoaXMubW91bnRwb2ludCkgdGhpcy5tb3VudHBvaW50ID0gbmV3IE1vdW50UG9pbnQodGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0TW91bnRQb2ludCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHRoaXMubW91bnRwb2ludC5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gTW91bnRQb2ludCBnZXR0ZXJzXG4gIGdldE1vdW50UG9pbnRWYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHJldHVybiB0aGlzLm1vdW50cG9pbnQuZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRNb3VudFBvaW50WCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHJldHVybiB0aGlzLm1vdW50cG9pbnQuZ2V0WCgpO1xuICB9XG4gIGdldE1vdW50UG9pbnRZKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgcmV0dXJuIHRoaXMubW91bnRwb2ludC5nZXRZKCk7XG4gIH1cbiAgZ2V0TW91bnRQb2ludFooKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1vdW50UG9pbnQoKTtcbiAgICByZXR1cm4gdGhpcy5tb3VudHBvaW50LmdldFooKTtcbiAgfVxuICAvLyBNb3VudFBvaW50IHNldHRlcnNcbiAgc2V0TW91bnRQb2ludFZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgdGhpcy5tb3VudHBvaW50LnNldFZhbHVlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0TW91bnRQb2ludCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHRoaXMubW91bnRwb2ludC5zZXQoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRNb3VudFBvaW50WCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlTW91bnRQb2ludCgpO1xuICAgIHRoaXMubW91bnRwb2ludC5zZXRYKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0TW91bnRQb2ludFkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1vdW50UG9pbnQoKTtcbiAgICB0aGlzLm1vdW50cG9pbnQuc2V0WSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE1vdW50UG9pbnRaKCkge1xuICAgIHRoaXMudmFsaWRhdGVNb3VudFBvaW50KCk7XG4gICAgdGhpcy5tb3VudHBvaW50LnNldFooLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciBvcGFjaXR5XG4gIHZhbGlkYXRlT3BhY2l0eSgpIHtcbiAgICBpZiAoIXRoaXMub3BhY2l0eSkgdGhpcy5vcGFjaXR5ID0gbmV3IE9wYWNpdHkodGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0T3BhY2l0eSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3BhY2l0eSgpO1xuICAgIHRoaXMub3BhY2l0eS5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gT3BhY2l0eSBnZXR0ZXJzXG4gIGdldE9wYWNpdHlWYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3BhY2l0eSgpO1xuICAgIHJldHVybiB0aGlzLm9wYWNpdHkuZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRPcGFjaXR5KCkge1xuICAgIHRoaXMudmFsaWRhdGVPcGFjaXR5KCk7XG4gICAgcmV0dXJuIHRoaXMub3BhY2l0eS5nZXQoKTtcbiAgfVxuICAvLyBPcGFjaXR5IHNldHRlcnNcbiAgc2V0T3BhY2l0eVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcGFjaXR5KCk7XG4gICAgdGhpcy5vcGFjaXR5LnNldFZhbHVlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0T3BhY2l0eSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3BhY2l0eSgpO1xuICAgIHRoaXMub3BhY2l0eS5zZXQoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciBvcmlnaW5cbiAgdmFsaWRhdGVPcmlnaW4oKSB7XG4gICAgaWYgKCF0aGlzLm9yaWdpbikgdGhpcy5vcmlnaW4gPSBuZXcgT3JpZ2luKHRoaXMubm9kZSk7XG4gIH1cbiAgaGFsdE9yaWdpbigpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgdGhpcy5vcmlnaW4uaGFsdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIE9yaWdpbiBnZXR0ZXJzXG4gIGdldE9yaWdpblZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRPcmlnaW5YKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uZ2V0WCgpO1xuICB9XG4gIGdldE9yaWdpblkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5nZXRZKCk7XG4gIH1cbiAgZ2V0T3JpZ2luWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLmdldFooKTtcbiAgfVxuICAvLyBPcmlnaW4gc2V0dGVyc1xuICBzZXRPcmlnaW5WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgdGhpcy5vcmlnaW4uc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRPcmlnaW4oKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHRoaXMub3JpZ2luLnNldCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldE9yaWdpblgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZU9yaWdpbigpO1xuICAgIHRoaXMub3JpZ2luLnNldFgoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRPcmlnaW5ZKCkge1xuICAgIHRoaXMudmFsaWRhdGVPcmlnaW4oKTtcbiAgICB0aGlzLm9yaWdpbi5zZXRZKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0T3JpZ2luWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlT3JpZ2luKCk7XG4gICAgdGhpcy5vcmlnaW4uc2V0WiguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGhlbHBlcnMgZm9yIHBvc2l0aW9uXG4gIHZhbGlkYXRlUG9zaXRpb24oKSB7XG4gICAgaWYgKCF0aGlzLnBvc2l0aW9uKSB0aGlzLnBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKHRoaXMubm9kZSk7XG4gIH1cbiAgaGFsdFBvc2l0aW9uKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHRoaXMucG9zaXRpb24uaGFsdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8vIFBvc2l0aW9uIGdldHRlcnNcbiAgZ2V0UG9zaXRpb25WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5nZXRWYWx1ZSgpO1xuICB9XG4gIGdldFBvc2l0aW9uWCgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5nZXRYKCk7XG4gIH1cbiAgZ2V0UG9zaXRpb25ZKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmdldFkoKTtcbiAgfVxuICBnZXRQb3NpdGlvblooKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24uZ2V0WigpO1xuICB9XG4gIC8vIFBvc2l0aW9uIHNldHRlcnNcbiAgc2V0UG9zaXRpb25WYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICB0aGlzLnBvc2l0aW9uLnNldFZhbHVlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0UG9zaXRpb24oKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgdGhpcy5wb3NpdGlvbi5zZXQoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRQb3NpdGlvblgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVBvc2l0aW9uKCk7XG4gICAgdGhpcy5wb3NpdGlvbi5zZXRYKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0UG9zaXRpb25ZKCkge1xuICAgIHRoaXMudmFsaWRhdGVQb3NpdGlvbigpO1xuICAgIHRoaXMucG9zaXRpb24uc2V0WSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFBvc2l0aW9uWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlUG9zaXRpb24oKTtcbiAgICB0aGlzLnBvc2l0aW9uLnNldFooLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciByb3RhdGlvblxuICB2YWxpZGF0ZVJvdGF0aW9uKCkge1xuICAgIGlmICghdGhpcy5yb3RhdGlvbikgdGhpcy5yb3RhdGlvbiA9IG5ldyBSb3RhdGlvbih0aGlzLm5vZGUpO1xuICB9XG4gIGhhbHRSb3RhdGlvbigpIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICB0aGlzLnJvdGF0aW9uLmhhbHQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvLyBSb3RhdGlvbiBnZXR0ZXJzXG4gIGdldFJvdGF0aW9uVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMucm90YXRpb24uZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRSb3RhdGlvblgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgcmV0dXJuIHRoaXMucm90YXRpb24uZ2V0WCgpO1xuICB9XG4gIGdldFJvdGF0aW9uWSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICByZXR1cm4gdGhpcy5yb3RhdGlvbi5nZXRZKCk7XG4gIH1cbiAgZ2V0Um90YXRpb25aKCkge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHJldHVybiB0aGlzLnJvdGF0aW9uLmdldFooKTtcbiAgfVxuICAvLyBSb3RhdGlvbiBzZXR0ZXJzXG4gIHNldFJvdGF0aW9uVmFsdWUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgdGhpcy5yb3RhdGlvbi5zZXRWYWx1ZSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFJvdGF0aW9uKCkge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHRoaXMucm90YXRpb24uc2V0KC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0Um90YXRpb25YKCkge1xuICAgIHRoaXMudmFsaWRhdGVSb3RhdGlvbigpO1xuICAgIHRoaXMucm90YXRpb24uc2V0WCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFJvdGF0aW9uWSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlUm90YXRpb24oKTtcbiAgICB0aGlzLnJvdGF0aW9uLnNldFkoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRSb3RhdGlvblooKSB7XG4gICAgdGhpcy52YWxpZGF0ZVJvdGF0aW9uKCk7XG4gICAgdGhpcy5yb3RhdGlvbi5zZXRaKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gaGVscGVycyBmb3Igc2NhbGVcbiAgdmFsaWRhdGVTY2FsZSgpIHtcbiAgICBpZiAoIXRoaXMuc2NhbGUpIHRoaXMuc2NhbGUgPSBuZXcgU2NhbGUodGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0U2NhbGUoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgdGhpcy5zY2FsZS5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gU2NhbGUgZ2V0dGVyc1xuICBnZXRTY2FsZVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHJldHVybiB0aGlzLnNjYWxlLmdldFZhbHVlKCk7XG4gIH1cbiAgZ2V0U2NhbGVYKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHJldHVybiB0aGlzLnNjYWxlLmdldFgoKTtcbiAgfVxuICBnZXRTY2FsZVkoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGUuZ2V0WSgpO1xuICB9XG4gIGdldFNjYWxlWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2NhbGUoKTtcbiAgICByZXR1cm4gdGhpcy5zY2FsZS5nZXRaKCk7XG4gIH1cbiAgLy8gU2NhbGUgc2V0dGVyc1xuICBzZXRTY2FsZVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHRoaXMuc2NhbGUuc2V0VmFsdWUoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRTY2FsZSgpIHtcbiAgICAgIGlmKHdpbmRvdy5taWtldGVzdCkgZGVidWdnZXI7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgdGhpcy5zY2FsZS5zZXQoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRTY2FsZVgoKSB7XG4gICAgdGhpcy52YWxpZGF0ZVNjYWxlKCk7XG4gICAgdGhpcy5zY2FsZS5zZXRYKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0U2NhbGVZKCkge1xuICAgIHRoaXMudmFsaWRhdGVTY2FsZSgpO1xuICAgIHRoaXMuc2NhbGUuc2V0WSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFNjYWxlWigpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2NhbGUoKTtcbiAgICB0aGlzLnNjYWxlLnNldFooLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBoZWxwZXJzIGZvciBzaXplXG4gIHZhbGlkYXRlU2l6ZSgpIHtcbiAgICBpZiAoIXRoaXMuc2l6ZSkgdGhpcy5zaXplID0gbmV3IFNpemUodGhpcy5ub2RlKTtcbiAgfVxuICBoYWx0U2l6ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2l6ZSgpO1xuICAgIHRoaXMuc2l6ZS5oYWx0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLy8gU2l6ZSBnZXR0ZXJzXG4gIGdldFNpemVWYWx1ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2l6ZSgpO1xuICAgIHJldHVybiB0aGlzLnNpemUuZ2V0VmFsdWUoKTtcbiAgfVxuICBnZXRTaXplKCkge1xuICAgIHRoaXMudmFsaWRhdGVTaXplKCk7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZS5nZXQoKTtcbiAgfVxuICAvLyBTaXplIHNldHRlcnNcbiAgc2V0U2l6ZVZhbHVlKCkge1xuICAgIHRoaXMudmFsaWRhdGVTaXplKCk7XG4gICAgdGhpcy5zaXplLnNldFZhbHVlKC4uLmFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0RGlmZmVyZW50aWFsU2l6ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2l6ZSgpO1xuICAgIHRoaXMuc2l6ZS5zZXREaWZmZXJlbnRpYWwoLi4uYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRQcm9wb3J0aW9uYWxTaXplKCkge1xuICAgIHRoaXMudmFsaWRhdGVTaXplKCk7XG4gICAgdGhpcy5zaXplLnNldFByb3BvcnRpb25hbCguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldEFic29sdXRlU2l6ZSgpIHtcbiAgICB0aGlzLnZhbGlkYXRlU2l6ZSgpO1xuICAgIHRoaXMuc2l6ZS5zZXRBYnNvbHV0ZSguLi5hcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldFNpemVNb2RlKHgsIHksIHopIHtcbiAgICB0aGlzLm5vZGUuc2V0U2l6ZU1vZGUoeCwgeSwgeik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0U2l6ZU1vZGVBYnNvbHV0ZSgpIHtcbiAgICB0aGlzLm5vZGUuc2V0U2l6ZU1vZGUoU2l6ZS5BQlNPTFVURSwgU2l6ZS5BQlNPTFVURSwgU2l6ZS5BQlNPTFVURSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0U2l6ZU1vZGVSZWxhdGl2ZSgpIHtcbiAgICB0aGlzLm5vZGUuc2V0U2l6ZU1vZGUoU2l6ZS5SRUxBVElWRSwgU2l6ZS5SRUxBVElWRSwgU2l6ZS5SRUxBVElWRSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0U2l6ZU1vZGVSZW5kZXIoKSB7XG4gICAgdGhpcy5ub2RlLnNldFNpemVNb2RlKFNpemUuUkVOREVSLCBTaXplLlJFTkRFUiwgU2l6ZS5SRU5ERVIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iLCIvKipcbiAqIFZpZXcgY2xhc3MgdGhhdCBleHRlbmRzIE1vZGlmaWVyIGFuZCBzaG91bGQgYmUgdXNlZCBmb3IgdmlzdWFsIGVsZW1lbnRzLlxuICovXG5cbmltcG9ydCBNb2RpZmllciBmcm9tICcuL01vZGlmaWVyJztcblxuY29uc3QgRE9NRWxlbWVudCA9IEZhbW91c1BsYXRmb3JtLmRvbVJlbmRlcmFibGVzLkRPTUVsZW1lbnQ7XG5jb25zdCBFdmVudEVtaXR0ZXIgPSBGYW1vdXNQbGF0Zm9ybS5jb21wb25lbnRzLkV2ZW50RW1pdHRlcjtcbmNvbnN0IEV2ZW50SGFuZGxlciA9IEZhbW91c1BsYXRmb3JtLmNvbXBvbmVudHMuRXZlbnRIYW5kbGVyO1xuY29uc3QgTWVzaCA9IEZhbW91c1BsYXRmb3JtLndlYmdsUmVuZGVyYWJsZXMuTWVzaDtcbmNvbnN0IE5vZGUgPSBGYW1vdXNQbGF0Zm9ybS5jb3JlLk5vZGU7XG5jb25zdCBQb2ludExpZ2h0ID0gRmFtb3VzUGxhdGZvcm0ud2ViZ2xSZW5kZXJhYmxlcy5Qb2ludExpZ2h0O1xuXG5jb25zdCBFdmVudE1hcCA9IFtcbiAgLy8gVUkgRXZlbnRzIChodHRwOi8vd3d3LnczLm9yZy9UUi91aWV2ZW50cy8pXG4gICdhYm9ydCcsXG4gICdiZWZvcmVpbnB1dCcsXG4gICdibHVyJyxcbiAgJ2NsaWNrJyxcbiAgJ2NvbXBvc2l0aW9uZW5kJyxcbiAgJ2NvbXBvc2l0aW9uc3RhcnQnLFxuICAnY29tcG9zaXRpb251cGRhdGUnLFxuICAnZGJsY2xpY2snLFxuICAnZm9jdXMnLFxuICAnZm9jdXNpbicsXG4gICdmb2N1c291dCcsXG4gICdpbnB1dCcsXG4gICdrZXlkb3duJyxcbiAgJ2tleXVwJyxcbiAgJ2xvYWQnLFxuICAnbW91c2Vkb3duJyxcbiAgJ21vdXNlZW50ZXInLFxuICAnbW91c2VsZWF2ZScsXG4gICdtb3VzZW1vdmUnLFxuICAnbW91c2VvdXQnLFxuICAnbW91c2VvdmVyJyxcbiAgJ21vdXNldXAnLFxuICAncmVzaXplJyxcbiAgJ3Njcm9sbCcsXG4gICdzZWxlY3QnLFxuICAndG91Y2hjYW5jZWwnLFxuICAndG91Y2hlbmQnLFxuICAndG91Y2htb3ZlJyxcbiAgJ3RvdWNoc3RhcnQnLFxuICAndW5sb2FkJyxcbiAgJ3doZWVsJ1xuXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlldyBleHRlbmRzIE1vZGlmaWVye1xuICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgc3VwZXIobm9kZSk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIC8vSFRNTCBTVFVGRlxuICB2YWxpZGF0ZURPTShvcHRpb25zKSB7XG4gICAgaWYgKCF0aGlzLmVsKSB7XG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICAgIHRoaXMuZWwgPSBuZXcgRE9NRWxlbWVudCh0aGlzLm5vZGUsIG9wdGlvbnMpO1xuICAgICAgdGhpcy5lbC5vblJlY2VpdmUgPSAoZXZlbnQsIHBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50c1tldmVudF0pIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHNbZXZlbnRdKHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZURPTUVsZW1lbnQob3B0aW9ucykge1xuICAgIHRoaXMudmFsaWRhdGVET00ob3B0aW9ucyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRET01Db250ZW50KGNvbnRlbnQpIHtcbiAgICB0aGlzLnZhbGlkYXRlRE9NKCk7XG4gICAgdGhpcy5lbC5zZXRDb250ZW50KGNvbnRlbnQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0RE9NQ2xhc3NlcyhjbGFzc2VzKSB7XG4gICAgdGhpcy52YWxpZGF0ZURPTSgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5lbC5hZGRDbGFzcyhjbGFzc2VzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgc2V0RE9NQXR0cmlidXRlcyhhdHRyaWJ1dGVzKSB7XG4gICAgdGhpcy52YWxpZGF0ZURPTSgpO1xuICAgIGZvciAobGV0IGF0dHJOYW1lIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyaWJ1dGVzW2F0dHJOYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHNldERPTVByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIHRoaXMudmFsaWRhdGVET00oKTtcbiAgICBmb3IgKGxldCBwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgdGhpcy5lbC5zZXRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUsIHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy9kb20gZXZlbnRzXG4gIG9uKGV2TmFtZSwgZm4pIHtcbiAgICBpZiAoRXZlbnRNYXAuaW5kZXhPZihldk5hbWUpID4gLTEpIHtcbiAgICAgIC8vZG9tIEV2ZW50XG4gICAgICB0aGlzLnZhbGlkYXRlRE9NKCk7XG4gICAgICB0aGlzLm5vZGUuYWRkVUlFdmVudChldk5hbWUpO1xuICAgICAgdGhpcy5fZXZlbnRzW2V2TmFtZV0gPSBmbjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLmV2ZW50SGFuZGxlcikgdGhpcy5ldmVudEhhbmRsZXIgPSBuZXcgRXZlbnRIYW5kbGVyKHRoaXMubm9kZSk7XG4gICAgICB0aGlzLmV2ZW50SGFuZGxlci5vbihldk5hbWUsIGZuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvL2V2ZW50cyBiZXR3ZWVuIHZpZXdzIVxuICBlbWl0KGV2LCBwYXlsb2FkKSB7XG4gICAgaWYgKCF0aGlzLmV2ZW50RW1pdHRlcikgdGhpcy5ldmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKHRoaXMubm9kZSk7XG4gICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChldiwgcGF5bG9hZCk7XG4gIH1cblxuICAvL2dsIHN0dWZmXG4gIHZhbGlkYXRlTWVzaCgpIHtcbiAgICBpZiAoIXRoaXMubWVzaCkgdGhpcy5tZXNoID0gbmV3IE1lc2godGhpcy5ub2RlKTtcbiAgfVxuXG4gIHNldEdlb21ldHJ5KGdlb21ldHJ5LCBvcHRpb25zKSB7XG4gICAgdGhpcy52YWxpZGF0ZU1lc2goKTtcbiAgICB0aGlzLmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG4gICAgdGhpcy5tZXNoLnNldEdlb21ldHJ5KGdlb21ldHJ5LCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEJhc2VDb2xvcihjb2xvcikge1xuICAgIHRoaXMudmFsaWRhdGVNZXNoKCk7XG4gICAgdGhpcy5tZXNoLnNldEJhc2VDb2xvcihjb2xvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuXG4iLCJjb25zdCBDb21wb3NpdG9yID0gRmFtb3VzUGxhdGZvcm0ucmVuZGVyZXJzLkNvbXBvc2l0b3I7XG5jb25zdCBUaHJlYWRNYW5hZ2VyID0gRmFtb3VzUGxhdGZvcm0ucmVuZGVyZXJzLlRocmVhZE1hbmFnZXI7XG5jb25zdCBFbmdpbmUgPSBGYW1vdXNQbGF0Zm9ybS5lbmdpbmUuRW5naW5lO1xuY29uc3QgRmFtb3VzID0gRmFtb3VzUGxhdGZvcm0uY29yZS5GYW1vdXM7XG5cbmNsYXNzIEZhbW91c0VuZ2luZUluaXQge1xuICAvKipcbiAgICogQm9pbGVycGxhdGUgY29kZSB0byBzZXR1cCB0aGUgRmFtb3VzIEVuZ2luZS5cbiAgICogQG1ldGhvZCAgY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG4gIH1cblxuICBpbml0KCkge1xuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCkgcmV0dXJuO1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAvLyBUT0RPOiB0ZW1wb3JhcnkgZXNsaW50IGZpeCB1bnRpbCBpdCBnZXRzIHJvbGxlZCBpbnRvIHBsYXRmb3JtIGFzIGEgZGVmYXVsdFxuICAgIC8qZXNsaW50LWRpc2FibGUgKi9cbiAgICBGYW1vdXNQbGF0Zm9ybS5zdHlsZXNoZWV0cztcbiAgICAvKmVzbGludC1lbmFibGUgKi9cblxuICAgIC8vIEJvaWxlcnBsYXRlXG4gICAgLyplc2xpbnQtZGlzYWJsZSAqL1xuICAgIC8vIGxldCBjb21wb3NpdG9yID0gbmV3IENvbXBvc2l0b3IoKTtcbiAgICAvLyBsZXQgZW5naW5lID0gbmV3IEVuZ2luZSgpO1xuICAgIC8vIGxldCB0aHJlYWRtYW5nZXIgPSBuZXcgVGhyZWFkTWFuYWdlcihGYW1vdXMuZ2V0Q2hhbm5lbCgpLCBjb21wb3NpdG9yLCBlbmdpbmUpO1xuICAgIC8qZXNsaW50LWVuYWJsZSAqL1xuXG4gICAgLy8gVE9ETzogdGVtcG9yYXJ5IGZpeCB1bnRpbCB3ZSBnZXQgYW4gdXBkYXRlIG9mIGZhbW91cyA+IDIwMTUwNTA0IHRoYXQgd29ya3NcbiAgICAvKmVzbGludC1kaXNhYmxlICovXG4gICAgbGV0IGNvbXBvc2l0b3IgPSBuZXcgQ29tcG9zaXRvcigpO1xuICAgIGxldCB0aHJlYWRtYW5nZXIgPSBuZXcgVGhyZWFkTWFuYWdlcihGYW1vdXMsIGNvbXBvc2l0b3IpO1xuICAgIGxldCBlbmdpbmUgPSBuZXcgRmFtb3VzUGxhdGZvcm0uZW5naW5lKCk7XG4gICAgZW5naW5lLnVwZGF0ZSh0aHJlYWRtYW5nZXIpO1xuICAgIC8qZXNsaW50LWVuYWJsZSAqL1xuICAgIC8vIEVORDogdGVtcG9yYXJ5IGZpeFxuICB9XG59XG5cbmxldCBGYW1vdXNFbmdpbmUgPSBuZXcgRmFtb3VzRW5naW5lSW5pdCgpO1xuXG5leHBvcnQgZGVmYXVsdCBGYW1vdXNFbmdpbmU7XG4iLCJpbXBvcnQgVmlldyAgICAgICAgICAgICBmcm9tICdmYW1vdXMtY3JlYXRpdmUvZGlzcGxheS9WaWV3JztcblxuY29uc3QgQ3VydmVzID0gRmFtb3VzUGxhdGZvcm0udHJhbnNpdGlvbnMuQ3VydmVzO1xuXG5leHBvcnQgY2xhc3MgQ2FyZCBleHRlbmRzIFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKG5vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIobm9kZSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMubW9kZWwgPSBvcHRpb25zLm1vZGVsO1xuXG4gICAgICAgIGxldCBwZXJzcGVjdGl2ZSA9IDYwMDtcbiAgICAgICAgbGV0IHpUcmFuc2Zvcm0gPSB0aGlzLm1vZGVsLmkgKiAzNTA7XG5cbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZSgxLCAxKTtcbiAgICAgICAgdGhpcy5zZXRBYnNvbHV0ZVNpemUoMzUwLCAyMjApO1xuICAgICAgICB0aGlzLnNldE1vdW50UG9pbnQoLjUsIDApO1xuICAgICAgICB0aGlzLnNldEFsaWduKC41LCAwKTtcbiAgICAgICAgdGhpcy5zZXRPcmlnaW4oLjUsIC41LCAuNSk7XG4gICAgICAgIHRoaXMuc2V0U2NhbGUoLjUsIC41LCAuNSk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24oLXdpbmRvdy5pbm5lcldpZHRoLCAzMDAsIHpUcmFuc2Zvcm0pO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ3pJbmRleCc6IHpUcmFuc2Zvcm0sXG4gICAgICAgICAgICAgICAgJy13ZWJraXQtcGVyc3BlY3RpdmUnOiBwZXJzcGVjdGl2ZSxcbiAgICAgICAgICAgICAgICAnLW1vei1wZXJzcGVjdGl2ZSc6IHBlcnNwZWN0aXZlLFxuICAgICAgICAgICAgICAgICdwZXJzcGVjdGl2ZSc6IHBlcnNwZWN0aXZlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHRoaXMuYWRkQ2FyZEJhY2soKTtcbiAgICAgICAgdGhpcy5hZGRDYXJkRnJvbnQoKTtcbiAgICAgICAgdGhpcy5sb2FkQ2FyZCgpO1xuICAgIH1cblxuICAgIGFkZENhcmRCYWNrKCkge1xuICAgICAgICBsZXQgY2FyZEJhY2sgPSBuZXcgVmlldyh0aGlzLm5vZGUuYWRkQ2hpbGQoKSk7XG4gICAgICAgIGNhcmRCYWNrLnNldFNpemVNb2RlKDAsIDApO1xuICAgICAgICBjYXJkQmFjay5zZXRQcm9wb3J0aW9uYWxTaXplKDEsIDEpO1xuICAgICAgICBjYXJkQmFjay5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHRhZ05hbWU6ICdpbWcnLFxuICAgICAgICAgICAgY2xhc3NlczogW1snY2FyZC1pbWctYmFjayddXSxcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAnYmFja2ZhY2UtdmlzaWJpbGl0eSc6ICd2aXNpYmxlJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY2FyZEJhY2suc2V0RE9NQXR0cmlidXRlcyh7XG4gICAgICAgICAgICAnc3JjJzogdGhpcy5tb2RlbC5iYWNrXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZENhcmRGcm9udCgpIHtcbiAgICAgICAgbGV0IGNhcmRGcm9udCA9IG5ldyBWaWV3KHRoaXMubm9kZS5hZGRDaGlsZCgpKTtcbiAgICAgICAgY2FyZEZyb250LnNldFNpemVNb2RlKDAsIDApO1xuICAgICAgICBjYXJkRnJvbnQuc2V0UHJvcG9ydGlvbmFsU2l6ZSgxLCAxKTtcbiAgICAgICAgY2FyZEZyb250LmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgdGFnTmFtZTogJ2ltZycsXG4gICAgICAgICAgICBjbGFzc2VzOiBbJ2NhcmQtaW1nLWZyb250J10sXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgLy8gJ2JhY2tmYWNlLXZpc2liaWxpdHknOiAnaGlkZGVuJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY2FyZEZyb250LnNldERPTUF0dHJpYnV0ZXMoe1xuICAgICAgICAgICAgJ3NyYyc6IHRoaXMubW9kZWwuZnJvbnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbG9hZENhcmQoKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLm1vZGVsLnJvdGF0aW9uID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB6OiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5tb2RlbC5wb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAzMDAsXG4gICAgICAgICAgICB6OiB0aGlzLmdldFBvc2l0aW9uWigpXG4gICAgICAgIH07XG5cbiAgICAgICAgc3dpdGNoKHRoaXMubW9kZWwuaSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwucm90YXRpb24ueiA9ICgtOSAqIE1hdGguUEkpIC8gMTgwO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwucG9zaXRpb24ueCA9IDMwO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwucG9zaXRpb24ueSA9IDI1MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnJvdGF0aW9uLnogPSAoLjUgKiBNYXRoLlBJKSAvIDE4MDtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnBvc2l0aW9uLnkgPSAzMTI7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5wb3NpdGlvbi54ID0gMjA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5yb3RhdGlvbi56ID0gKDMwICogTWF0aC5QSSkgLyAxODA7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5wb3NpdGlvbi54ID0gLTIwO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuIHBvc2l0aW9uLnkgPSAzNTU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5yb3RhdGlvbi56ID0gKC0yMyAqIE1hdGguUEkpIC8gMTgwO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwucG9zaXRpb24ueSA9IDI0NTtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnBvc2l0aW9uLnggPSAtMzA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSSB3YW50IGEgc2xpZ2h0IGRlbGF5IGFmdGVyIHRoZSBhcHAgbG9hZHNcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLnNldFBvc2l0aW9uWCgwLCB7XG4gICAgICAgICAgICAgICAgY3VydmU6IEN1cnZlcy5lYXNlSW5PdXQsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDY1MFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy8gSSB3YW50IGEgc2xpZ2h0IGRlbGF5IGFmdGVyIHRoZSBhbmltYXRpb24gaXMgZG9uZVxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7IGN1cnZlOiAnb3V0QmFjaycsIGR1cmF0aW9uOiA1MDAgfTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0Um90YXRpb25aKF90aGlzLm1vZGVsLnJvdGF0aW9uLnosIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRQb3NpdGlvblgoX3RoaXMubW9kZWwucG9zaXRpb24ueCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFBvc2l0aW9uWShfdGhpcy5tb2RlbC5wb3NpdGlvbi55LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9LCA3NSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgMjUwKTtcbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gICAgQ09JTl9QT1M6IHdpbmRvdy5pbm5lckhlaWdodCAtIDI2NSxcbiAgICBDT0lOX0NFTlRFUjogd2luZG93LmlubmVySGVpZ2h0IC0gMjE1XG59O1xuIiwiaW1wb3J0IFZpZXcgICAgICAgICAgICAgZnJvbSAnZmFtb3VzLWNyZWF0aXZlL2Rpc3BsYXkvVmlldyc7XG5cbmNvbnN0IEN1cnZlcyA9IEZhbW91c1BsYXRmb3JtLnRyYW5zaXRpb25zLkN1cnZlcztcblxuZXhwb3J0IGNsYXNzIEhhbmQgZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5vZGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuc2V0U2l6ZU1vZGUoMSwgMSk7XG4gICAgICAgIHRoaXMuc2V0QWJzb2x1dGVTaXplKDcwLCA3NSk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25ZKDI5Nik7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25aKDMwMDApO1xuICAgICAgICB0aGlzLnNldE1vdW50UG9pbnQoLjUsIDApO1xuICAgICAgICB0aGlzLnNldEFsaWduKC41LCAwKTtcblxuICAgICAgICB0aGlzLm1vZGVsID0gb3B0aW9ucy5tb2RlbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgdGFnTmFtZTogJ2ltZycsXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ3pJbmRleCc6IDMwMDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXRET01BdHRyaWJ1dGVzKHtcbiAgICAgICAgICAgICdzcmMnOiB0aGlzLm1vZGVsLmltZ1BhdGhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5zdGFydEFuaW1hdGlvbigpO1xuICAgIH1cblxuXG4gICAgc2V0RXZlbnRzKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5vbignZHJhZ2dpbmcnLCBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgICAgICBpZihtZXNzYWdlID09PSAnc3RhcnQnKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc3RvcEFuaW1hdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm9uKCdyZXNldEFwcCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMucmVzdGFydEFuaW1hdGlvbigpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGFydEFuaW1hdGlvbigpIHtcbiAgICAgICAgdGhpcy5pc0hhbHRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmFuaW1hdGVIYW5kKCk7XG4gICAgfVxuXG4gICAgc3RvcEFuaW1hdGlvbigpIHtcbiAgICAgICAgdGhpcy5pc0hhbHRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuaGFsdE9wYWNpdHkoKTtcbiAgICAgICAgdGhpcy5oYWx0UG9zaXRpb24oKTtcbiAgICB9XG5cbiAgICByZXN0YXJ0QW5pbWF0aW9uKCkge1xuICAgICAgICB0aGlzLmlzSGFsdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVzZXRIYW5kKCk7XG4gICAgfVxuXG4gICAgYW5pbWF0ZUhhbmQoKSB7XG4gICAgICAgIGlmKHRoaXMuaXNIYWx0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgbGV0IGR1cmF0aW9uID0gMTIwMDtcblxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWSgxOTYsIHtcbiAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgY3VydmU6IEN1cnZlcy5saW5lYXJcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfdGhpcy5yZXNldEhhbmQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU3RhcnQgdGhlIG9wYWNpdHkgaGFsZiB3YXkgdGhyb3VnaCB0aGUgYW5pbWF0aW9uXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRPcGFjaXR5KDAsIHtcbiAgICAgICAgICAgICAgICBjdXJ2ZTogQ3VydmVzLmxpbmVhcixcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gLyAyXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZHVyYXRpb24gLyAyKTtcbiAgICB9XG5cbiAgICByZXNldEhhbmQoKSB7XG4gICAgICAgIGlmKHRoaXMuaXNIYWx0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvblkoMjk2LCB7XG4gICAgICAgICAgICBkdXJhdGlvbjogMFxuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vVE9ETyBCVUc6ICBDYWxsYmFja3MgYXJlIG5vdCB3b3JraW5nIGNvcnJlY3RseVxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRPcGFjaXR5KDEsIHsgZHVyYXRpb246IDEwMH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAvL1RPRE8gQlVHOiAgQ2FsbGJhY2tzIGFyZSBub3Qgd29ya2luZyBjb3JyZWN0bHlcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBxdWljayBwYXVzZSBhZnRlciB0aGUgYW5pbWF0aW9uIGNvbXBsZXRlc1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuYW5pbWF0ZUhhbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDkwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImNvbnN0IFBoeXNpY3NFbmdpbmUgICAgPSBGYW1vdXNQbGF0Zm9ybS5waHlzaWNzLlBoeXNpY3NFbmdpbmU7XG5cbmxldCBQaHlzaWNzID0ge1xuICAgIF9zaW11bGF0aW9uOiBuZXcgUGh5c2ljc0VuZ2luZSgpXG59O1xuXG5QaHlzaWNzLmdldFNpbXVsYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fc2ltdWxhdGlvbjtcbn07XG5cblBoeXNpY3MubWFnbmlmeUZvcmNlID0gZnVuY3Rpb24odikge1xuICAgIGxldCB3aWR0aCA9ICB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICBsZXQgcmF0aW8gPSAxO1xuXG4gICAgaWYod2lkdGggPCAzMjApIHtcbiAgICAgICAgcmF0aW8gPSAxLjY7XG4gICAgfSBlbHNlIGlmKHdpZHRoIDwgNDI4KSB7XG4gICAgICAgIHJhdGlvID0gMS41O1xuICAgIH0gZWxzZSBpZih3aWR0aCA8IDc2OCkge1xuICAgICAgICByYXRpbyA9IDEuMTU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmF0aW8gPSAxO1xuICAgIH1cblxuICAgIHJldHVybiByYXRpbyAqIHY7XG59O1xuXG5QaHlzaWNzLmRhbXBlbkZvcmNlID0gZnVuY3Rpb24odikge1xuICAgIGxldCB3aWR0aCA9ICB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICBsZXQgcmF0aW8gPSAxO1xuXG4gICAgaWYod2lkdGggPCAzMjApIHtcbiAgICAgICAgcmF0aW8gPSAuNTU7XG4gICAgfSBlbHNlIGlmKHdpZHRoIDwgNDI4KSB7XG4gICAgICAgIHJhdGlvID0gLjY7XG4gICAgfSBlbHNlIGlmKHdpZHRoIDwgNzY4KSB7XG4gICAgICAgIHJhdGlvID0gLjg1O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJhdGlvID0gMTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmF0aW8gKiB2O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGh5c2ljcztcbiIsImltcG9ydCBFTlVNUyAgICAgICAgICAgZnJvbSAnLi9FbnVtcyc7XG5pbXBvcnQgUGh5c2ljcyAgICAgICAgIGZyb20gJy4vUGh5c2ljc1NlcnZpY2UnO1xuaW1wb3J0IFZpZXcgICAgICAgICAgICBmcm9tICdmYW1vdXMtY3JlYXRpdmUvZGlzcGxheS9WaWV3JztcblxuLy9GYW1vdXMgQ29tcG9uZW50c1xuY29uc3QgRmFtb3VzICAgICAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS5jb3JlLkZhbW91cztcbmNvbnN0IEdlc3R1cmVIYW5kbGVyICAgID0gRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5HZXN0dXJlSGFuZGxlcjtcblxuLy9QaHlzaWNzIENvbXBvbmVudHNcbmNvbnN0IFNwaGVyZSAgICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0ucGh5c2ljcy5TcGhlcmU7XG5jb25zdCBWZWMzICAgICAgICAgICAgICA9IEZhbW91c1BsYXRmb3JtLm1hdGguVmVjMztcblxuZXhwb3J0IGNsYXNzIFJpbmcgZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5vZGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMubW9kZWwgICAgICAgICAgID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgdGhpcy5tb2RlbC5yaW5nU2l6ZSAgPSB0aGlzLl9nZXRSaW5nU2l6ZSgpO1xuICAgICAgICB0aGlzLm1vZGVsLnJpbmdDb2xvciA9IHRoaXMuX2dldFJpbmdDb2xvcigpO1xuICAgICAgICB0aGlzLm1vZGVsLnNpemUgICAgICA9IHRoaXMubW9kZWwucmluZ1NpemUgKiAzNTtcblxuICAgICAgICAvL1Bvc2l0aW9uXG4gICAgICAgIHRoaXMuc2V0QWxpZ24oLjUsIDApO1xuICAgICAgICB0aGlzLnNldE1vdW50UG9pbnQoLjUsIC41LCAuNSk7XG4gICAgICAgIHRoaXMuc2V0T3JpZ2luKC41LCAuNSwgLjUpO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWSgyMDApO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWigtNTAwKTtcblxuICAgICAgICAvLyBTaXppbmdcbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZUFic29sdXRlKCk7XG4gICAgICAgIHRoaXMuc2V0QWJzb2x1dGVTaXplKHRoaXMubW9kZWwuc2l6ZSwgdGhpcy5tb2RlbC5zaXplKTtcblxuICAgICAgICAvL0Rpc3BsYXlcbiAgICAgICAgdGhpcy5zZXRPcGFjaXR5KDApO1xuICAgICAgICB0aGlzLnNldFNjYWxlKC4yNSwgLjI1KTtcbiAgICAgICAgdGhpcy5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICAgIGJvcmRlcjogdGhpcy5tb2RlbC5yaW5nU2l6ZSArICdweCBzb2xpZCAnICsgdGhpcy5tb2RlbC5yaW5nQ29sb3IsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNTAlJyxcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6IC01MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjbGFzc2VzOiBbJ3JpbmcnXVxuICAgICAgICB9KTtcblxuICAgICAgICAvL0V2ZW50aW5nXG4gICAgICAgIHRoaXMuc2V0RXZlbnRzKCk7XG4gICAgICAgIHRoaXMuX2luaXRQaHlzaWNzKCk7XG4gICAgfVxuXG4gICAgX2dldFJpbmdDb2xvcigpIHtcbiAgICAgICAgY29uc3QgY29sb3JzID0gWycjMzI5OTc4JywgJyMwMDg5ZTAnLCAnIzM5ODBhOCcsICcjZGE2OTViJ107XG4gICAgICAgIHJldHVybiBjb2xvcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY29sb3JzLmxlbmd0aCldO1xuICAgIH1cblxuICAgIF9nZXRSaW5nU2l6ZSgpIHtcbiAgICAgICAgY29uc3QgcmluZ1NpemVzID0gWzEsIDIsIDNdO1xuICAgICAgICByZXR1cm4gcmluZ1NpemVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHJpbmdTaXplcy5sZW5ndGgpXTtcbiAgICB9XG5cbiAgICBzZXRFdmVudHMoKSB7XG4gICAgICAgIHRoaXMub24oJ3Jpc2luZ1RpZGUnLCBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgICAgICBpZighdGhpcy5oYXNPd25Qcm9wZXJ0eSgnaGFzQ2hhbmdlZCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuaGFzQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHlQb3MgPSB0aGlzLmdldFBvc2l0aW9uWSgpO1xuICAgICAgICAgICAgbGV0IHNpemUgPSB0aGlzLmdldFNpemUoKTtcblxuICAgICAgICAgICAgbGV0IGJvdHRvbUVkZ2UgPSB5UG9zICsgc2l6ZVsxXTtcblxuICAgICAgICAgICAgaWYoYm90dG9tRWRnZSA+IG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhc0NoYW5nZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRET01Qcm9wZXJ0aWVzKHtcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICdibGFjaydcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U2NhbGUoMS4wNSwgMS4wNSwgMS4wNSwge1xuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U2NhbGUoLjk1LCAuOTUsIC45NSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDEwMFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMub24oJ21vdXNlZG93bicsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucG9wKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZ2VzdHVyZXMgPSBuZXcgR2VzdHVyZUhhbmRsZXIodGhpcy5ub2RlLCBbe1xuICAgICAgICAgICAgZXZlbnQ6ICd0YXAnLFxuICAgICAgICAgICAgY2FsbGJhY2s6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfV0pO1xuICAgIH1cblxuICAgIGFjdGl2YXRlQmxhY2tob2xlKCkge1xuICAgICAgICB0aGlzLmlzQmxhY2tob2xlQWN0aXZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBhY3RpdmF0ZVBoeXNpY3MoKSB7XG4gICAgICAgIHRoaXMuaXNQaHlzaWNzQWN0aXZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwb3AoKSB7XG4gICAgICAgIGxldCBkdXJhdGlvbiA9IDc1O1xuICAgICAgICB0aGlzLmlzQnJlYXRoaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaGFsdE9wYWNpdHkoKTtcbiAgICAgICAgdGhpcy5oYWx0U2NhbGUoKTtcblxuICAgICAgICB0aGlzLnNldE9wYWNpdHkoMCwge1xuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uICogMlxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFNjYWxlKDEuMiwgMS4yLCAxLjIsIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvblxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFNjYWxlKDAsIDAsIDAsIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24gLyAyXG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1BoeXNpY3NBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWN5Y2xlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2luaXRQaHlzaWNzKCkge1xuICAgICAgICB0aGlzLndvcmxkICAgICAgICAgICAgID0gUGh5c2ljcy5nZXRTaW11bGF0aW9uKCk7XG4gICAgICAgIHRoaXMuaXNCbGFja2hvbGVBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0JyZWF0aGluZyAgICAgICA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNQaHlzaWNzQWN0aXZlICAgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnNjYWxpbmcgPSB7XG4gICAgICAgICAgICBzdGF0ZTogKE1hdGgucmFuZG9tKCkgPiAwLjUpID8gMCA6IDEsXG4gICAgICAgICAgICB2YWw6IDEsXG4gICAgICAgICAgICBtYXg6IC4xLFxuICAgICAgICAgICAgcmF0ZTogTWF0aC5yYW5kb20oKSAqIC4wMDVcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgdXBkYXRlciA9IHtcbiAgICAgICAgICAgIG9uVXBkYXRlOiAodCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMud29ybGQudXBkYXRlKHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgRmFtb3VzLnJlcXVlc3RVcGRhdGVPbk5leHRUaWNrKHVwZGF0ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIEZhbW91cy5yZXF1ZXN0VXBkYXRlT25OZXh0VGljayh1cGRhdGVyKTtcblxuICAgICAgICB0aGlzLnNwaGVyZSA9IG5ldyBTcGhlcmUoe1xuICAgICAgICAgICAgbWFzczogMTAsXG4gICAgICAgICAgICByYWRpdXM6IHRoaXMubW9kZWwuc2l6ZSAqIC41LFxuICAgICAgICAgICAgcG9zaXRpb246IG5ldyBWZWMzKDAsIDIwMCwgMClcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3VwZGF0ZSgpIHtcbiAgICAgICAgaWYodGhpcy5pc1BoeXNpY3NBY3RpdmUpIHtcbiAgICAgICAgICAgIGxldCBwID0gdGhpcy5zcGhlcmUuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIGxldCB2ID0gdGhpcy5zcGhlcmUuZ2V0VmVsb2NpdHkoKTtcbiAgICAgICAgICAgIGxldCBkeCA9IHAueCAtIDA7XG4gICAgICAgICAgICBsZXQgZHkgPSBwLnkgLSA1MDA7XG5cbiAgICAgICAgICAgIGxldCBkaXN0YW5jZUZyb21DZW50ZXIgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpIC0gdGhpcy5tb2RlbC5zaXplIC8gMjtcbiAgICAgICAgICAgIGxldCBibGFja2hvbGVSYWRpdXMgPSAzMDtcblxuICAgICAgICAgICAgaWYodGhpcy5pc0JsYWNraG9sZUFjdGl2ZSAmJiBkaXN0YW5jZUZyb21DZW50ZXIgPCBibGFja2hvbGVSYWRpdXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3NwaW5SaW5nJywge30pO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNQaHlzaWNzQWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZS5zZXRWZWxvY2l0eSgwLCAwLCAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKDAsIEVOVU1TLkNPSU5fQ0VOVEVSLCAwLCB7IGR1cmF0aW9uOiAyNTAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFNjYWxlKDAuMSwgMC4xLCAwLjEsIHsgZHVyYXRpb246IDEwMCB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWN5Y2xlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHAueSA+IHdpbmRvdy5pbm5lckhlaWdodCArIDEwMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlY3ljbGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZihwLnkgPiBFTlVNUy5DT0lOX0NFTlRFUiArIDMwICYmIHYueSA8IDE1ICYmIHYueCA8IDE1KSB7IC8vIFByZXZlbnRzIHRoZSBoYW5naW5nIGJ1YmJsZXNcbiAgICAgICAgICAgICAgICB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHAueCwgcC55LCBwLnopO1xuXG4gICAgICAgICAgICAgICAgLy9CcmVhdGhpbmdcbiAgICAgICAgICAgICAgICBpZih0aGlzLmlzQnJlYXRoaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc2NhbGluZy5zdGF0ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2FsaW5nLnZhbCArPSB0aGlzLnNjYWxpbmcucmF0ZTsgLy9zY2FsZSBpblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2FsaW5nLnZhbCAtPSB0aGlzLnNjYWxpbmcucmF0ZTsgLy9zY2FsZSBvdXRcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc2NhbGluZy52YWwgPj0gMSArIHRoaXMuc2NhbGluZy5tYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NhbGluZy5zdGF0ZSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZih0aGlzLnNjYWxpbmcudmFsIDw9IDEgLSB0aGlzLnNjYWxpbmcubWF4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjYWxpbmcuc3RhdGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYWx0U2NhbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTY2FsZSh0aGlzLnNjYWxpbmcudmFsLCB0aGlzLnNjYWxpbmcudmFsLCB0aGlzLnNjYWxpbmcudmFsLCB7IGR1cmF0aW9uOiAxMH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9yZWN5Y2xlKCkge1xuICAgICAgICBsZXQgd2luZG93SGFsZiA9IHdpbmRvdy5pbm5lcldpZHRoIC8gMjtcbiAgICAgICAgbGV0IHhQb3MgPSBNYXRoLnJhbmRvbSgpICogKHdpbmRvd0hhbGYgKiAyKSAtIHdpbmRvd0hhbGY7XG4gICAgICAgIGxldCB5UG9zID0gTWF0aC5yYW5kb20oKSAqIC03MDAgLSAyMDA7XG5cbiAgICAgICAgdGhpcy5zcGhlcmUuc2V0UG9zaXRpb24oeFBvcywgeVBvcywgMCk7XG4gICAgICAgIHRoaXMuc3BoZXJlLnNldFZlbG9jaXR5KDAsIDAsIDApO1xuICAgICAgICB0aGlzLnNjYWxlLnNldCgxLCAxLCAxLCB7ZHVyYXRpb246IDEwfSk7XG4gICAgICAgIHRoaXMuc2V0T3BhY2l0eSgxKTtcbiAgICAgICAgdGhpcy5pc1BoeXNpY3NBY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzQnJlYXRoaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zZXRET01Qcm9wZXJ0aWVzKHtcbiAgICAgICAgICAgICdib3JkZXItY29sb3InOiAnIzAwMDAwMCdcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IFBoeXNpY3MgICAgICAgICAgZnJvbSAnLi9QaHlzaWNzU2VydmljZSc7XG5pbXBvcnQgVmlldyAgICAgICAgICAgICBmcm9tICdmYW1vdXMtY3JlYXRpdmUvZGlzcGxheS9WaWV3JztcblxuLy9GYW1vdXMgQ29tcG9uZW50c1xuY29uc3QgRmFtb3VzICAgICAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS5jb3JlLkZhbW91cztcblxuLy9QaHlzaWNzIENvbXBvbmVudHNcbmNvbnN0IFJvdGF0aW9uYWxEcmFnICAgID0gRmFtb3VzUGxhdGZvcm0ucGh5c2ljcy5Sb3RhdGlvbmFsRHJhZztcbmNvbnN0IFNwaGVyZSAgICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0ucGh5c2ljcy5TcGhlcmU7XG5cbmV4cG9ydCBjbGFzcyBTcGlubmluZ1JpbmcgZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5vZGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMubW9kZWwgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIC8vUG9zaXRpb25cbiAgICAgICAgdGhpcy5zZXRBbGlnbiguNSwgMCk7XG4gICAgICAgIHRoaXMuc2V0TW91bnRQb2ludCguNSwgLjUsIC41KTtcbiAgICAgICAgdGhpcy5zZXRPcmlnaW4oLjUsIC41LCAuNSk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25ZKHdpbmRvdy5pbm5lckhlaWdodCAqIDEuMSk7XG5cbiAgICAgICAgLy9TaXppbmdcbiAgICAgICAgaWYodGhpcy5tb2RlbC5pID09PSAwKSB7ICAgICAgICAgICAgLy9PdXRlciByaW5nXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnNpemVYID0gOTA7XG4gICAgICAgICAgICB0aGlzLm1vZGVsLnNpemVZID0gOTA7XG4gICAgICAgIH0gZWxzZSBpZih0aGlzLm1vZGVsLmkgPT09IDEpIHsgICAgIC8vSW5uZXIgcmluZ1xuICAgICAgICAgICAgdGhpcy5tb2RlbC5zaXplWCA9IDc4O1xuICAgICAgICAgICAgdGhpcy5tb2RlbC5zaXplWSA9IDc4O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZUFic29sdXRlKCk7XG4gICAgICAgIHRoaXMuc2V0QWJzb2x1dGVTaXplKHRoaXMubW9kZWwuc2l6ZVgsIHRoaXMubW9kZWwuc2l6ZVkpO1xuXG4gICAgICAgIC8vRGlzcGxheVxuICAgICAgICB0aGlzLnNldE9wYWNpdHkoMCk7XG4gICAgICAgIHRoaXMuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICB0YWdOYW1lOiAnaW1nJyxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAnc3JjJzogdGhpcy5tb2RlbC5zdmdQYXRoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xhc3NlczogWydzcGlubmluZy1yaW5nJ11cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9FdmVudGluZ1xuICAgICAgICB0aGlzLnNldEV2ZW50cygpO1xuICAgICAgICB0aGlzLl9pbml0UGh5c2ljcygpO1xuICAgIH1cblxuICAgIHNldEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy5vbignc3BpblJpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgb3BhY2l0eSA9IHRoaXMuZ2V0T3BhY2l0eSgpO1xuICAgICAgICAgICAgaWYob3BhY2l0eSAhPT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3BhY2l0eSgxLCB7XG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAyMDBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zcGluUmluZygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzcGluUmluZygpIHtcbiAgICAgICAgLy9UT0RPIEFsbG93IHJvdGF0aW9uYWwgYXJncyB0byBiZSBwYXNzZWRcbiAgICAgICAgaWYodGhpcy5tb2RlbC5pID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNwaGVyZS5zZXRBbmd1bGFyVmVsb2NpdHkoNSwgMTUsIDEwKTtcbiAgICAgICAgfSBlbHNlIGlmKHRoaXMubW9kZWwuaSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5zcGhlcmUuc2V0QW5ndWxhclZlbG9jaXR5KDI1LCAxMCwgMTUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRQaHlzaWNzKCkge1xuICAgICAgICB0aGlzLndvcmxkID0gUGh5c2ljcy5nZXRTaW11bGF0aW9uKCk7XG5cbiAgICAgICAgdmFyIHVwZGF0ZXIgPSB7XG4gICAgICAgICAgICBvblVwZGF0ZTogKHQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLndvcmxkLnVwZGF0ZSh0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGUoKTtcblxuICAgICAgICAgICAgICAgIEZhbW91cy5yZXF1ZXN0VXBkYXRlT25OZXh0VGljayh1cGRhdGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBGYW1vdXMucmVxdWVzdFVwZGF0ZU9uTmV4dFRpY2sodXBkYXRlcik7XG5cbiAgICAgICAgdGhpcy5zcGhlcmUgPSBuZXcgU3BoZXJlKHtcbiAgICAgICAgICAgIG1hc3M6IDEwMCxcbiAgICAgICAgICAgIHJhZGl1czogdGhpcy5tb2RlbC5zaXplWCAqIC41XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vQSBiZWhhdmlvciB0aGF0IHNsb3dzIGFuZ3VsYXIgdmVsb2NpdHkgYnkgYXBwbHlpbmcgdG9ycXVlLlxuICAgICAgICB0aGlzLnJvdGF0aW9uYWxEcmFnID0gbmV3IFJvdGF0aW9uYWxEcmFnKFt0aGlzLnNwaGVyZV0sIHtcbiAgICAgICAgICAgIG1heDogNTAwMDAsXG4gICAgICAgICAgICBzdHJlbmd0aDogNTAwMDAwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFt0aGlzLnNwaGVyZSwgdGhpcy5yb3RhdGlvbmFsRHJhZ10pO1xuICAgIH1cblxuICAgIF91cGRhdGUoKSB7XG4gICAgICAgIGxldCB2ID0gdGhpcy5zcGhlcmUuZ2V0QW5ndWxhclZlbG9jaXR5KCk7XG4gICAgICAgIGxldCBxID0gdGhpcy5zcGhlcmUuZ2V0T3JpZW50YXRpb24oKTsgLy9SZXR1cm5zIGEgcXVhdGVybmlvblxuXG4gICAgICAgIGlmKHYueCA8IDEgJiYgdi55IDwgMSAmJiB2LnogPCAxKSB7XG4gICAgICAgICAgICB0aGlzLnNldFJvdGF0aW9uKDAsIDAsIDAsIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMjAwMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgcm90YXRpb24gPSB7fTtcbiAgICAgICAgICAgIHEudG9FdWxlcihyb3RhdGlvbik7XG4gICAgICAgICAgICB0aGlzLnNldFJvdGF0aW9uKHJvdGF0aW9uLngsIHJvdGF0aW9uLnksIHJvdGF0aW9uLnopO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IFZpZXcgICAgICAgICAgICAgZnJvbSAnZmFtb3VzLWNyZWF0aXZlL2Rpc3BsYXkvVmlldyc7XG5cbmV4cG9ydCBjbGFzcyBUb3BUZXh0IGV4dGVuZHMgVmlldyB7XG4gICAgY29uc3RydWN0b3Iobm9kZSwgb3B0aW9ucykge1xuICAgICAgICBzdXBlcihub2RlLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLmNyZWF0ZURPTUVsZW1lbnQoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICdmb250LXNpemUnOiAnNjBweCcsXG4gICAgICAgICAgICAgICAgJ3RleHQtYWxpZ24nOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAnZm9udC13ZWlnaHQnOiAnMjAwJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICdUcnk8YnI+c2ltcGxlJ1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFNpemVNb2RlKDAsIDEpO1xuICAgICAgICB0aGlzLnNldFByb3BvcnRpb25hbFNpemUoMSwgbnVsbCk7XG4gICAgICAgIHRoaXMuc2V0QWJzb2x1dGVTaXplKG51bGwsIDIwMCk7XG4gICAgICAgIHRoaXMuc2V0T3BhY2l0eSgxKTtcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvblkoMzMpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRhZ0xpbmUgZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5vZGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ2ZvbnQtc2l6ZSc6ICc1MHB4JyxcbiAgICAgICAgICAgICAgICAndGV4dC1hbGlnbic6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICdsaW5lLWhlaWdodCc6ICcxZW0nLFxuICAgICAgICAgICAgICAgICdjb2xvcic6ICcjRkZGRkZGJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICdBbGwgeW91ciBjYXJkczxicj48c3Ryb25nPm9uZSBjb2luPC9zdHJvbmc+J1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFNpemVNb2RlKDAsIDEpO1xuICAgICAgICB0aGlzLnNldFByb3BvcnRpb25hbFNpemUoMSwgbnVsbCk7XG4gICAgICAgIHRoaXMuc2V0QWJzb2x1dGVTaXplKG51bGwsIDEwMCk7XG4gICAgICAgIHRoaXMuc2V0T3BhY2l0eSgxKTtcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvblkoLTEwMCk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29pbiBleHRlbmRzIFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKG5vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIobm9kZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAnZm9udC1zaXplJzogJzQ4cHgnLFxuICAgICAgICAgICAgICAgICd0ZXh0LWFsaWduJzogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgJ2xpbmUtaGVpZ2h0JzogJzFlbScsXG4gICAgICAgICAgICAgICAgJ2NvbG9yJzogJyMwMDAwMDAnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udGVudDogJ2NvaW4nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0U2l6ZU1vZGUoMCwgMSk7XG4gICAgICAgIHRoaXMuc2V0UHJvcG9ydGlvbmFsU2l6ZSgxLCBudWxsKTtcbiAgICAgICAgdGhpcy5zZXRBYnNvbHV0ZVNpemUobnVsbCwgNTApO1xuICAgICAgICB0aGlzLnNldE9wYWNpdHkoMSk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25ZKHdpbmRvdy5pbm5lckhlaWdodCAqIDEuMyk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgR2V0WW91cnMgZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5vZGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ2ZvbnQtc2l6ZSc6ICc0MnB4JyxcbiAgICAgICAgICAgICAgICAndGV4dC1hbGlnbic6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICdsaW5lLWhlaWdodCc6ICcxZW0nLFxuICAgICAgICAgICAgICAgICdjb2xvcic6ICcjRkZGRkZGJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICdHZXQgeW91cnMgZmlyc3QnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0U2l6ZU1vZGUoMCwgMSk7XG4gICAgICAgIHRoaXMuc2V0UHJvcG9ydGlvbmFsU2l6ZSgxLCBudWxsKTtcbiAgICAgICAgdGhpcy5zZXRBYnNvbHV0ZVNpemUobnVsbCwgNTApO1xuICAgICAgICB0aGlzLnNldE9wYWNpdHkoMSk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25ZKHdpbmRvdy5pbm5lckhlaWdodCAqIDEuNCk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJlT3JkZXIgZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5vZGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlRE9NRWxlbWVudCh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnIzAwMDAwMCcsXG4gICAgICAgICAgICAgICAgJ2JvcmRlci1yYWRpdXMnOiAnNHB4JyxcbiAgICAgICAgICAgICAgICAnY29sb3InOiAnI0ZGRkZGRicsXG4gICAgICAgICAgICAgICAgJ2ZvbnQtc2l6ZSc6ICcyMnB4JyxcbiAgICAgICAgICAgICAgICAnZm9udC13ZWlnaHQnOiAnNzAwJyxcbiAgICAgICAgICAgICAgICAnbGluZS1oZWlnaHQnOiAnNDBweCcsXG4gICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbicsXG4gICAgICAgICAgICAgICAgJ3RleHQtYWxpZ24nOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAndGV4dC10cmFuc2Zvcm0nOiAndXBwZXJjYXNlJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRlbnQ6ICdQcmUtb3JkZXIgbm93JyxcbiAgICAgICAgICAgIGNsYXNzZXM6IFsndHh0LXByZW9yZGVyJ11cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXRBbGlnbiguNSwgMCk7XG4gICAgICAgIHRoaXMuc2V0TW91bnRQb2ludCguNSwgMCk7XG4gICAgICAgIHRoaXMuc2V0T3BhY2l0eSgxKTtcbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZUFic29sdXRlKCk7XG4gICAgICAgIHRoaXMuc2V0QWJzb2x1dGVTaXplKDIyMCwgNDApO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uWSh3aW5kb3cuaW5uZXJIZWlnaHQgKiAxLjUpO1xuICAgIH1cbn1cbiIsImltcG9ydCBWaWV3ICAgICAgICAgICAgIGZyb20gJ2ZhbW91cy1jcmVhdGl2ZS9kaXNwbGF5L1ZpZXcnO1xuaW1wb3J0IFRpbWVsaW5lICAgICAgICAgZnJvbSAnZmFtb3VzLWNyZWF0aXZlL2FuaW1hdGlvbi9UaW1lbGluZSc7XG5pbXBvcnQge0hhbmR9ICAgICAgICAgICBmcm9tICcuL0hhbmQnO1xuaW1wb3J0IHtDYXJkfSAgICAgICAgICAgZnJvbSAnLi9DYXJkJztcbmltcG9ydCB7UmluZ30gICAgICAgICAgIGZyb20gJy4vUmluZyc7XG5pbXBvcnQge1NwaW5uaW5nUmluZ30gICBmcm9tICcuL1NwaW5uaW5nUmluZyc7XG5pbXBvcnQgRU5VTVMgICAgICAgICAgICBmcm9tICcuL0VudW1zJztcbmltcG9ydCBQaHlzaWNzICAgICAgICAgIGZyb20gJy4vUGh5c2ljc1NlcnZpY2UnO1xuaW1wb3J0IHtUb3BUZXh0LCBUYWdMaW5lLCBHZXRZb3VycywgUHJlT3JkZXIsIENvaW59IGZyb20gJy4vVGV4dFZpZXdzJztcblxuLy9GYW1vdXMgQ29tcG9uZW50c1xuY29uc3QgR2VzdHVyZUhhbmRsZXIgPSBGYW1vdXNQbGF0Zm9ybS5jb21wb25lbnRzLkdlc3R1cmVIYW5kbGVyO1xuY29uc3QgQ3VydmVzICAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS50cmFuc2l0aW9ucy5DdXJ2ZXM7XG5cbi8vUGh5c2ljcyBDb21wb25lbnRzXG5jb25zdCBHcmF2aXR5MUQgICAgICA9IEZhbW91c1BsYXRmb3JtLnBoeXNpY3MuR3Jhdml0eTFEO1xuY29uc3QgR3Jhdml0eTNEICAgICAgPSBGYW1vdXNQbGF0Zm9ybS5waHlzaWNzLkdyYXZpdHkzRDtcbmNvbnN0IFZlYzMgICAgICAgICAgID0gRmFtb3VzUGxhdGZvcm0ubWF0aC5WZWMzO1xuY29uc3QgRHJhZyAgICAgICAgICAgPSBGYW1vdXNQbGF0Zm9ybS5waHlzaWNzLkRyYWc7XG5cbmV4cG9ydCBjbGFzcyBBcHAgZXh0ZW5kcyBWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcihub2RlLCBvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG5vZGUsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuc2V0QWxpZ24oLjUsIC41KTtcbiAgICAgICAgdGhpcy5zZXRNb3VudFBvaW50KC41LCAuNSk7XG5cbiAgICAgICAgdGhpcy5zZXRTaXplTW9kZSgwLCAwKTtcbiAgICAgICAgdGhpcy5zZXRBYnNvbHV0ZVNpemUoMSwgMSk7XG5cbiAgICAgICAgdGhpcy5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAnb3ZlcmZsb3cnOiAnaGlkZGVuJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmluaXRUaW1lbGluZSgpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIHRoaXMucmVuZGVyU3Bpbm5pbmdSaW5ncygpO1xuICAgICAgICB0aGlzLnJlbmRlclJpbmdzKCk7XG5cbiAgICAgICAgdGhpcy5zZXRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlclRpbWVsaW5lUGF0aHMoKTtcbiAgICAgICAgdGhpcy5pbml0V29ybGQoKTtcbiAgICB9XG5cbiAgICBpbml0VGltZWxpbmUoKSB7XG4gICAgICAgIHRoaXMudGltZWxpbmUgPSBuZXcgVGltZWxpbmUoeyB0aW1lc2NhbGU6IDEgfSk7XG4gICAgICAgIHRoaXMudGltZSA9IHt9O1xuICAgICAgICB0aGlzLnRpbWUuc3RhcnQgPSAwO1xuICAgICAgICB0aGlzLnRpbWUuc3RlcDEgPSB0aGlzLnRpbWUuc3RhcnQgKyAxNTAwOyAvLyBDYXJkIHNjYWxlIGFwZXhcbiAgICAgICAgdGhpcy50aW1lLnN0ZXAyID0gdGhpcy50aW1lLnN0ZXAxICsgNTAwOyAgLy8gQ2FyZCBzY2FsZSBiYXNpblxuICAgICAgICB0aGlzLnRpbWUuc3RlcDMgPSB0aGlzLnRpbWUuc3RlcDIgKyA1MDA7ICAvLyBTdGFnZSBvbmUgZG9uZTogQ29pbiBjYXJkIGhhcyBzY2FsZWQgYmFjayB0byBhIHJlc3RpbmcgcG9pbnRcbiAgICAgICAgdGhpcy50aW1lLnN0ZXA0ID0gdGhpcy50aW1lLnN0ZXAzICsgMTAwMDsgLy8gQ29pbiBjYXJkIHNjYWxlIGFuZCBmbGlwIHN0YXJ0aW5nXG4gICAgICAgIHRoaXMudGltZS5zdGVwNSA9IHRoaXMudGltZS5zdGVwNCArIDEwMDA7IC8vIENvaW4gY2FyZCBzY2FsZSBhbmQgZmxpcCBhcGV4XG4gICAgICAgIHRoaXMudGltZS5zdGVwNiA9IHRoaXMudGltZS5zdGVwNSArIDI1MDsgIC8vIENvaW4gY2FyZCBzY2FsZSBhbmQgZmxpcCBhbG1vc3QgZG9uZVxuICAgICAgICB0aGlzLnRpbWUuc3RlcDcgPSB0aGlzLnRpbWUuc3RlcDYgKyAyNTA7ICAvLyBFbmQgc3RhdGUgdGV4dCBzdGFydHMgbW92aW5nIGluXG4gICAgICAgIHRoaXMudGltZS5zdGVwOCA9IHRoaXMudGltZS5zdGVwNyArIDEwMDA7IC8vIFN0YWdlIHR3byBkb25lOiBUYWcgbGluZSBhbmQgY29pbiBjYXJkIGFyZSBtb3ZpbmcgdXAgYW5kIG91dFxuICAgICAgICB0aGlzLnRpbWUuZW5kICAgPSB0aGlzLnRpbWUuc3RlcDggKyAxMDAwOyAvLyBGaW5pc1xuICAgIH1cblxuICAgIGluaXRXb3JsZCgpIHtcbiAgICAgICAgdGhpcy53b3JsZCA9IFBoeXNpY3MuZ2V0U2ltdWxhdGlvbigpO1xuICAgICAgICB0aGlzLnJpbmdCb2RpZXMgPSBbXTtcblxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5yaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5yaW5nQm9kaWVzLnB1c2godGhpcy5yaW5nc1tpXS5zcGhlcmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcmFnID0gbmV3IERyYWcodGhpcy5yaW5nQm9kaWVzLCB7XG4gICAgICAgICAgICBtYXg6IFBoeXNpY3MuZGFtcGVuRm9yY2UoNzUwMCksXG4gICAgICAgICAgICBzdHJlbmd0aDogUGh5c2ljcy5kYW1wZW5Gb3JjZSg3NTAwKSxcbiAgICAgICAgICAgIHR5cGU6IERyYWcuTGluZWFyXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKHRoaXMucmluZ0JvZGllcywgdGhpcy5kcmFnKTtcbiAgICB9XG5cbiAgICBwaHlBZGRSZXB1bHNpb24oKSB7XG4gICAgICAgIGxldCByaW5nUmVwdWxzaW9ucyA9IFtdO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5yaW5nQm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByaW5nUmVwdWxzaW9ucy5wdXNoKG5ldyBHcmF2aXR5M0QodGhpcy5yaW5nQm9kaWVzW2ldLCB0aGlzLnJpbmdCb2RpZXMsIHtcbiAgICAgICAgICAgICAgICBzdHJlbmd0aDogUGh5c2ljcy5kYW1wZW5Gb3JjZSgtMWUzKSAvL05lZ2F0aXZlIFJlcHVsc2lvbiBwdXNoZXMgYXdheVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53b3JsZC5hZGQocmluZ1JlcHVsc2lvbnMpO1xuICAgIH1cblxuICAgIHBoeUFkZDFkR3Jhdml0eSgpIHtcbiAgICAgICAgdGhpcy5ncmF2aXR5MWQgPSBuZXcgR3Jhdml0eTFEKHRoaXMucmluZ0JvZGllcywge1xuICAgICAgICAgICAgYWNjZWxlcmF0aW9uOiBuZXcgVmVjMygwLCBQaHlzaWNzLmRhbXBlbkZvcmNlKDc1MCksIDApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFt0aGlzLmdyYXZpdHkxZF0pO1xuICAgIH1cblxuICAgIHBoeUFkZDNkR3Jhdml0eSgpIHtcbiAgICAgICAgdGhpcy5ncmF2aXR5M2QgPSBuZXcgR3Jhdml0eTNEKG51bGwsIHRoaXMucmluZ0JvZGllcywge1xuICAgICAgICAgICAgc3RyZW5ndGg6IFBoeXNpY3MuZGFtcGVuRm9yY2UoNWU3KSxcbiAgICAgICAgICAgIGFuY2hvcjogbmV3IFZlYzMoMCwgRU5VTVMuQ09JTl9QT1MsIDApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMud29ybGQuYWRkKFt0aGlzLmdyYXZpdHkzZF0pO1xuICAgIH1cblxuICAgIGxvYWRSaW5ncygpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICBsZXQgZGFtcGVuZWRWZWxvY2l0eSA9IFBoeXNpY3MuZGFtcGVuRm9yY2UoMTAwMCk7XG5cbiAgICAgICAgdGhpcy5yaW5ncy5mb3JFYWNoKChyaW5nKSA9PiB7XG4gICAgICAgICAgICByaW5nLnNldE9wYWNpdHkoMSk7XG5cbiAgICAgICAgICAgIGxldCB2eCA9IE1hdGgucmFuZG9tKCkgKiAoZGFtcGVuZWRWZWxvY2l0eSAqIDIpIC0gZGFtcGVuZWRWZWxvY2l0eTtcbiAgICAgICAgICAgIGxldCB2eSA9IE1hdGgucmFuZG9tKCkgKiAoZGFtcGVuZWRWZWxvY2l0eSAqIDIpIC0gZGFtcGVuZWRWZWxvY2l0eTtcblxuICAgICAgICAgICAgcmluZy5zcGhlcmUuc2V0VmVsb2NpdHkodngsIHZ5LCAwKTtcbiAgICAgICAgICAgIHJpbmcuYWN0aXZhdGVQaHlzaWNzKCk7XG5cbiAgICAgICAgICAgIHJpbmcuc2V0U2NhbGUoMS4xLCAxLjEsIDEuMSwge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA3NTBcbiAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICByaW5nLnNldFNjYWxlKDEsIDEsIDEsIHtcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDUwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByaW5nLmFjdGl2YXRlQmxhY2tob2xlKCk7XG4gICAgICAgICAgICB9LCB0aGlzLnRpbWUuc3RlcDYpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJpbmcuc2V0RE9NUHJvcGVydGllcyh7XG4gICAgICAgICAgICAgICAgICAgICdib3JkZXItY29sb3InOiAnIzAwMDAwMCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMudGltZS5lbmQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMucGh5QWRkMWRHcmF2aXR5KCk7XG4gICAgICAgICAgICBfdGhpcy5waHlBZGRSZXB1bHNpb24oKTtcbiAgICAgICAgfSwgODUwKTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMucGh5QWRkM2RHcmF2aXR5KCk7XG4gICAgICAgIH0sIHRoaXMudGltZS5zdGVwNik7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLnJlbmRlckJsdWVTY3JlZW4oKTtcbiAgICAgICAgdGhpcy5yZW5kZXJUb3BUZXh0KCk7XG4gICAgICAgIHRoaXMucmVuZGVyQ2FyZHMoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJIYW5kKCk7XG4gICAgICAgIHRoaXMucmVuZGVyVGFnTGluZSgpO1xuICAgICAgICB0aGlzLnJlbmRlckNvaW4oKTtcbiAgICAgICAgdGhpcy5yZW5kZXJHZXRZb3VycygpO1xuICAgICAgICB0aGlzLnJlbmRlclByZU9yZGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyQmx1ZVNjcmVlbigpIHtcbiAgICAgICAgdGhpcy5ibHVlU2NyZWVuID0gbmV3IFZpZXcodGhpcy5ub2RlLmFkZENoaWxkKCkpO1xuXG4gICAgICAgIHRoaXMuYmx1ZVNjcmVlbi5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICdyZ2IoMjIsIDEzOSwgMjIxKScsXG4gICAgICAgICAgICAgICAgJ3otaW5kZXgnOiAtMTAwMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsYXNzZXM6IFsnYmx1ZS1zY3JlZW4nXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmJsdWVTY3JlZW4uc2V0U2l6ZU1vZGUoMCwgMCk7XG4gICAgICAgIHRoaXMuYmx1ZVNjcmVlbi5zZXRQcm9wb3J0aW9uYWxTaXplKDEsIDEpO1xuICAgICAgICB0aGlzLmJsdWVTY3JlZW4uc2V0QWxpZ24oMCwgMCwgMCk7XG4gICAgICAgIHRoaXMuYmx1ZVNjcmVlbi5zZXRQb3NpdGlvbigwLCB3aW5kb3cuaW5uZXJIZWlnaHQsIC0xMDAwKTtcbiAgICB9XG5cbiAgICByZW5kZXJUb3BUZXh0KCkge1xuICAgICAgICB0aGlzLnRvcFRleHQgPSBuZXcgVG9wVGV4dCh0aGlzLm5vZGUuYWRkQ2hpbGQoKSk7XG4gICAgfVxuXG4gICAgcmVuZGVySGFuZCgpIHtcbiAgICAgICAgdGhpcy5oYW5kID0gbmV3IEhhbmQodGhpcy5ub2RlLmFkZENoaWxkKCksIHtcbiAgICAgICAgICAgIHRhZ05hbWU6ICdpbWcnLFxuICAgICAgICAgICAgbW9kZWw6IHtcbiAgICAgICAgICAgICAgICBpbWdQYXRoOiAnYXNzZXRzL3N2Zy9oYW5kLnN2ZydcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyQ2FyZHMoKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLmNhcmRzID0gW107XG4gICAgICAgIGxldCBjYXJkc1NyYyA9IFtcbiAgICAgICAgICAgIHsgZnJvbnQ6ICdhc3NldHMvaW1hZ2VzL2dpZnQucG5nJywgICAgICAgYmFjazogJ2Fzc2V0cy9zdmcvY2FyZEJhY2suc3ZnJ30sXG4gICAgICAgICAgICB7IGZyb250OiAnYXNzZXRzL2ltYWdlcy9jcmVkaXQucG5nJywgICAgIGJhY2s6ICdhc3NldHMvc3ZnL2NhcmRCYWNrLnN2Zyd9LFxuICAgICAgICAgICAgeyBmcm9udDogJ2Fzc2V0cy9pbWFnZXMvbWVtYmVyc2hpcC5wbmcnLCBiYWNrOiAnYXNzZXRzL3N2Zy9jYXJkQmFjay5zdmcnfSxcbiAgICAgICAgICAgIHsgZnJvbnQ6ICdhc3NldHMvaW1hZ2VzL2RlYml0LnBuZycsICAgICAgYmFjazogJ2Fzc2V0cy9zdmcvY2FyZEJhY2suc3ZnJ30sXG4gICAgICAgICAgICB7IGZyb250OiAnYXNzZXRzL3N2Zy9jb2luRnJvbnQuc3ZnJywgICAgIGJhY2s6ICdhc3NldHMvc3ZnL2NvaW5CYWNrLnN2Zyd9XG4gICAgICAgIF07XG5cbiAgICAgICAgY2FyZHNTcmMuZm9yRWFjaChmdW5jdGlvbihjYXJkLCBpKSB7XG4gICAgICAgICAgICBsZXQgY2FyZE5vZGUgPSBuZXcgQ2FyZChfdGhpcy5ub2RlLmFkZENoaWxkKCksIHtcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgICAgICAgICAgICBtb2RlbDoge1xuICAgICAgICAgICAgICAgICAgICBmcm9udDogY2FyZC5mcm9udCxcbiAgICAgICAgICAgICAgICAgICAgYmFjazogY2FyZC5iYWNrLFxuICAgICAgICAgICAgICAgICAgICBpOiBpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmKGkgPT09IGNhcmRzU3JjLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICBjYXJkTm9kZS5zZXRPcGFjaXR5KDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfdGhpcy5jYXJkcy5wdXNoKGNhcmROb2RlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyVGFnTGluZSgpIHtcbiAgICAgICAgdGhpcy50YWdMaW5lID0gbmV3IFRhZ0xpbmUodGhpcy5ub2RlLmFkZENoaWxkKCkpO1xuICAgIH1cblxuICAgIHJlbmRlclNwaW5uaW5nUmluZ3MoKSB7XG4gICAgICAgIGxldCBzdmdQYXRocyA9IFtcbiAgICAgICAgICAgICdhc3NldHMvc3ZnL291dGVyQ2lyY2xlLnN2ZycsXG4gICAgICAgICAgICAnYXNzZXRzL3N2Zy9pbm5lckNpcmNsZS5zdmcnXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5zcGlubmluZ1JpbmdzID0gW107XG5cbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHN2Z1BhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgcmluZyA9IG5ldyBTcGlubmluZ1JpbmcodGhpcy5ub2RlLmFkZENoaWxkKCksIHtcbiAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgIHN2Z1BhdGg6IHN2Z1BhdGhzW2ldXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5zcGlubmluZ1JpbmdzLnB1c2gocmluZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXJDb2luKCkge1xuICAgICAgICB0aGlzLmNvaW4gPSBuZXcgQ29pbih0aGlzLm5vZGUuYWRkQ2hpbGQoKSk7XG4gICAgfVxuXG4gICAgcmVuZGVyR2V0WW91cnMoKSB7XG4gICAgICAgIHRoaXMuZ2V0WW91cnMgPSBuZXcgR2V0WW91cnModGhpcy5ub2RlLmFkZENoaWxkKCkpO1xuICAgIH1cblxuICAgIHJlbmRlclByZU9yZGVyKCkge1xuICAgICAgICB0aGlzLnByZU9yZGVyID0gbmV3IFByZU9yZGVyKHRoaXMubm9kZS5hZGRDaGlsZCgpLCB7XG4gICAgICAgICAgICB0YWc6ICdidXR0b24nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2hpbW1lciA9IG5ldyBWaWV3KHRoaXMucHJlT3JkZXIuYWRkQ2hpbGQoKSk7XG4gICAgICAgIHRoaXMuc2hpbW1lci5jcmVhdGVET01FbGVtZW50KHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZCc6ICdsaW5lYXItZ3JhZGllbnQoODBkZWcsIHJnYmEoMCwwLDAsMCkgMzAlLHJnYmEoMTgwLDE4MCwxODAsMC4zKSA0NSUscmdiYSgxODAsMTgwLDE4MCwwLjMpIDU1JSwgcmdiYSgwLDAsMCwwKSA3MCUpJyxcbiAgICAgICAgICAgICAgICAnekluZGV4JzogMTBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjbGFzc2VzOiBbJ3NoaW1tZXInXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNoaW1tZXIuc2V0UG9zaXRpb24oLTI0MCwgLTQwLCAxMCk7XG4gICAgfVxuXG4gICAgcmVuZGVyUmluZ3MoKSB7XG4gICAgICAgIHRoaXMucmluZ3MgPSBbXTtcblxuICAgICAgICBsZXQgcmluZ0NvdW50ID0gMDtcblxuICAgICAgICBpZih3aW5kb3cuaW5uZXJXaWR0aCA8IDMyMCkge1xuICAgICAgICAgICAgcmluZ0NvdW50ID0gNztcbiAgICAgICAgfSBlbHNlIGlmKHdpbmRvdy5pbm5lcldpZHRoIDwgNDI4KSB7XG4gICAgICAgICAgICByaW5nQ291bnQgPSAxMDtcbiAgICAgICAgfSBlbHNlIGlmKHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4KSB7XG4gICAgICAgICAgICByaW5nQ291bnQgPSAxNTtcbiAgICAgICAgfSBlbHNlIGlmKHdpbmRvdy5pbm5lcldpZHRoIDwgOTkyKSB7XG4gICAgICAgICAgICByaW5nQ291bnQgPSAyMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJpbmdDb3VudCA9IDMwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9yaW5nQ291bnQgPSAxO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgcmluZ0NvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGxldCByaW5nID0gbmV3IFJpbmcodGhpcy5ub2RlLmFkZENoaWxkKCkpO1xuICAgICAgICAgICAgdGhpcy5yaW5ncy5wdXNoKHJpbmcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJhbnNsYXRlU2hpbW1lcigpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2hpbW1lci5zZXRQb3NpdGlvblgoMjQwLCB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDE1MDAsXG4gICAgICAgICAgICAgICAgY3VydmU6IEN1cnZlcy5lYXNlSW5PdXRcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hpbW1lci5zZXRQb3NpdGlvblgoLTI0MCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGVTaGltbWVyKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9LmJpbmQodGhpcyksIDMwMDApO1xuICAgIH1cblxuICAgIHNldEV2ZW50cygpIHtcbiAgICAgICAgbGV0IGlzU2NydWJiaW5nID0gZmFsc2U7XG4gICAgICAgIGxldCBoYXNGaW5pc2hlZCA9IGZhbHNlO1xuXG4gICAgICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmKHRoaXMucmluZ3MgJiYgdGhpcy5yaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJpbmcgPSB0aGlzLnJpbmdzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMucmluZ3MubGVuZ3RoKV07XG4gICAgICAgICAgICAgICAgcmluZy5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICB0aGlzLm9uKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgaWYoIWhhc0ZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdkcmFnZ2luZycsICdzdGFydCcpO1xuICAgICAgICAgICAgICAgIGlzU2NydWJiaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5vbignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmKGlzU2NydWJiaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3VzZU1vdmVtZW50ID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFgsXG4gICAgICAgICAgICAgICAgICAgIHk6IGUuY2xpZW50WVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5zY3J1YlRpbWVsaW5lKHRoaXMubW91c2VNb3ZlbWVudC5tb3ZlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMub24oJ21vdXNldXAnLCAoZSkgPT4ge1xuICAgICAgICAgICAgaXNTY3J1YmJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBkdXJhdGlvbjtcbiAgICAgICAgICAgIHRoaXMubW91c2VNb3ZlbWVudCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudFRpbWUgPiAodGhpcy50aW1lLnN0ZXAxIC8gMikpIHsgLy8gRklOSVNIIHRoZSB0aW1lIGxpbmVcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9IHRoaXMudGltZS5lbmQgLSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLnRpbWUuZW5kO1xuICAgICAgICAgICAgICAgIGhhc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7ICAvL1JFU0VUIHRoZSB0aW1lIGxpbmVcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdyZXNldEFwcCcsIHsgZHVyYXRpb24gfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRpbWVsaW5lLnNldCh0aGlzLmN1cnJlbnRUaW1lLCB7IGR1cmF0aW9uIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmdlc3R1cmVzID0gbmV3IEdlc3R1cmVIYW5kbGVyKHRoaXMubm9kZSwgIFt7XG4gICAgICAgICAgICBldmVudDogJ2RyYWcnLFxuICAgICAgICAgICAgY2FsbGJhY2s6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGR1cmF0aW9uO1xuXG4gICAgICAgICAgICAgICAgaWYoZS5zdGF0dXMgPT09ICdtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2RyYWdnaW5nJywgJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NydWJUaW1lbGluZUdlc3R1cmUoZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKGUuc3RhdHVzID09PSAnZW5kJykge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmN1cnJlbnRUaW1lID4gKHRoaXMudGltZS5zdGVwMSAvIDIpKSB7IC8vTWF0aC5hYnMoZS5jZW50ZXJWZWxvY2l0eS55KSA+IDI1MCAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uID0gdGhpcy50aW1lLmVuZCAtIHRoaXMuY3VycmVudFRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy50aW1lLmVuZDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdyZXNldEFwcCcsIHsgZHVyYXRpb24gfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVsaW5lLnNldCh0aGlzLmN1cnJlbnRUaW1lLCB7IGR1cmF0aW9uIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICB9XSk7XG4gICAgfVxuXG4gICAgc2V0IG1vdXNlTW92ZW1lbnQocG9zaXRpb24pIHtcbiAgICAgICAgaWYoIXBvc2l0aW9uKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5tb3VzZVByb3BlcnRpZXM7XG4gICAgICAgIH0gZWxzZSBpZighdGhpcy5tb3VzZVByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHRoaXMubW91c2VQcm9wZXJ0aWVzID0ge1xuICAgICAgICAgICAgICAgIF9sYXN0UG9zaXRpb246IHBvc2l0aW9uLFxuICAgICAgICAgICAgICAgIG1vdmVtZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tb3VzZVByb3BlcnRpZXMubW92ZW1lbnQueCA9IHRoaXMubW91c2VQcm9wZXJ0aWVzLl9sYXN0UG9zaXRpb24ueCAtIHBvc2l0aW9uLng7XG4gICAgICAgICAgICB0aGlzLm1vdXNlUHJvcGVydGllcy5tb3ZlbWVudC55ID0gdGhpcy5tb3VzZVByb3BlcnRpZXMuX2xhc3RQb3NpdGlvbi55IC0gcG9zaXRpb24ueTtcbiAgICAgICAgICAgIHRoaXMubW91c2VQcm9wZXJ0aWVzLl9sYXN0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBtb3VzZU1vdmVtZW50KCkge1xuICAgICAgICBpZighdGhpcy5tb3VzZVByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHRoaXMubW91c2VQcm9wZXJ0aWVzID0ge1xuICAgICAgICAgICAgICAgIF9sYXN0UG9zaXRpb246IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBtb3ZlbWVudDoge1xuICAgICAgICAgICAgICAgICAgICB4OiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIHk6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZVByb3BlcnRpZXM7XG4gICAgfVxuXG4gICAgYWRkQ29pblNwcmluZ0V2ZW50KCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGNvaW5DYXJkID0gX3RoaXMuY2FyZHNbX3RoaXMuY2FyZHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGNvbnN0IHZpZXdQb3J0Q2VudGVyID0ge1xuICAgICAgICAgICAgeDogd2luZG93LmlubmVyV2lkdGggLyAyLFxuICAgICAgICAgICAgeTogd2luZG93LmlubmVySGVpZ2h0IC8gMlxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGFwcFNpemUgPSB0aGlzLmdldFNpemUoKTtcbiAgICAgICAgY29uc3QgY2FyZFNpemUgPSBjb2luQ2FyZC5nZXRTaXplKCk7XG4gICAgICAgIGNvbnN0IGNhcmRQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIHg6IGNvaW5DYXJkLnBvc2l0aW9uLmdldFgoKSxcbiAgICAgICAgICAgIHk6IGNvaW5DYXJkLmdldFBvc2l0aW9uWSgpXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGNhcmRDZW50ZXIgPSB7XG4gICAgICAgICAgICB4OiB2aWV3UG9ydENlbnRlci54LFxuICAgICAgICAgICAgeTogKHZpZXdQb3J0Q2VudGVyLnkgLSAoYXBwU2l6ZVsxXSAvIDIpKSArICgoY2FyZFNpemVbMV0gLyAyKSArIGNhcmRQb3NpdGlvbi55KVxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlbGVhc2VTcHJpbmcoZSkge1xuICAgICAgICAgICAgY29pbkNhcmQuc2V0Um90YXRpb25ZKDAsIHtcbiAgICAgICAgICAgICAgICBjdXJ2ZTogQ3VydmVzLnNwcmluZyxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwMFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvaW5DYXJkLnNldFJvdGF0aW9uWCgwLCB7XG4gICAgICAgICAgICAgICAgY3VydmU6IEN1cnZlcy5zcHJpbmcsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDEwMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vbignbW91c2VsZWF2ZScsIHJlbGVhc2VTcHJpbmcpO1xuICAgICAgICB0aGlzLm9uKCdtb3VzZW91dCcsIHJlbGVhc2VTcHJpbmcpO1xuXG4gICAgICAgIHRoaXMub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSB7XG4gICAgICAgICAgICAgICAgeDogZS5jbGllbnRYIC0gY2FyZENlbnRlci54LFxuICAgICAgICAgICAgICAgIHk6IGUuY2xpZW50WSAtIGNhcmRDZW50ZXIueVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGV0IG1heE9mZnNldFggPSAxNDU7XG4gICAgICAgICAgICBsZXQgbWF4T2Zmc2V0WSA9IDE0MDtcblxuICAgICAgICAgICAgaWYob2Zmc2V0LnggPiAtbWF4T2Zmc2V0WCAmJiBvZmZzZXQueCA8IG1heE9mZnNldFggJiYgb2Zmc2V0LnkgPiAtbWF4T2Zmc2V0WSAmJiBvZmZzZXQueSA8IG1heE9mZnNldFkpIHtcblxuICAgICAgICAgICAgICAgIC8vV2UgRmxpcCB0aGUgWCBhbmQgWSBoZXJlIGJlY2F1c2UgdGhlIGNhcmQgaGFzIGEgcm90YXRpb24gb2YgOTAgZGVncmVlcywgd2hpY2ggZmxpcHMgaXRzIGF4aXNcbiAgICAgICAgICAgICAgICBjb2luQ2FyZC5zZXRSb3RhdGlvblkoKCgob2Zmc2V0LnggKiBNYXRoLlBJKSAvIDMpIC8gMTgwKSk7XG4gICAgICAgICAgICAgICAgY29pbkNhcmQuc2V0Um90YXRpb25YKCgoKG9mZnNldC55ICogTWF0aC5QSSkgLyA0KSAvIDE4MCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGNvaW5DYXJkLnNldFJvdGF0aW9uWSgwLCB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnZlOiBDdXJ2ZXMuc3ByaW5nLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwMFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29pbkNhcmQuc2V0Um90YXRpb25YKDAsIHtcbiAgICAgICAgICAgICAgICAgICAgY3VydmU6IEN1cnZlcy5zcHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZEd5cm9zY29wZUV2ZW50KCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlb3JpZW50YXRpb24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgbGV0IHJvdFggPSBlLmJldGEgKiAtTWF0aC5QSS8xODA7XG4gICAgICAgICAgICBsZXQgcm90WSA9IGUuZ2FtbWEgKiBNYXRoLlBJLzE4MDtcbiAgICAgICAgICAgIHRoaXMuY2FyZHNbNF0uaGFsdFJvdGF0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNhcmRzWzRdLnNldFJvdGF0aW9uKHJvdFgsIHJvdFksICg5MCAqIE1hdGguUEkgLyAxODApLCB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDEwMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICB9XG5cbiAgICByZWdpc3RlclRpbWVsaW5lUGF0aHMoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFRpbWUgPSAwOyAvL1VzZWQgaW4gdGltZWxpbmUgc2NydWJiaW5nXG5cbiAgICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0gUklOR1MgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuaGFzT3duUHJvcGVydHkoJ2luaXRpYWxpemVkUmluZ3MnKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVkUmluZ3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZighdGhpcy5pbml0aWFsaXplZFJpbmcgJiYgdGltZSA+PSB0aGlzLnRpbWUuc3RlcDMgLSA1MCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRSaW5ncygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVkUmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbMCwgMF0sXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5lbmQsIHRoaXMudGltZS5lbmRdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEJMVUUgU0NSRUVOIC0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmJsdWVTY3JlZW4uc2V0UG9zaXRpb24oLi4udmFsKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgWzAsIHdpbmRvdy5pbm5lckhlaWdodF1dLFxuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDMsIFswLCB3aW5kb3cuaW5uZXJIZWlnaHRdXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA1LCBbMCwgMF1dXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuaGFzT3duUHJvcGVydHkoJ2hhc1Jpc2VuJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXNSaXNlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKHRpbWUgPj0gdGhpcy50aW1lLnN0ZXAzICYmIHRpbWUgPD0gdGhpcy50aW1lLnN0ZXA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgncmlzaW5nVGlkZScsIHRoaXMuYmx1ZVNjcmVlbi5nZXRQb3NpdGlvblkoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbMCwgMF0sXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5lbmQsIHRoaXMudGltZS5lbmRdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFRPUCBURVhUIC0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMudG9wVGV4dC5zZXRQb3NpdGlvbiguLi52YWwpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIFswLCB0aGlzLnRvcFRleHQuZ2V0UG9zaXRpb25ZKCldXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbMCwgLTIwMF1dIC8vIFRoZSBlbGVtZW50IGlzIDIwMHB4IHRhbGwsIHRoaXMgcHV0cyBpdCBvdXQgb2Ygdmlld1xuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvcFRleHQuc2V0T3BhY2l0eShbdmFsXSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgMV0sXG4gICAgICAgICAgICAgICAgWyh0aGlzLnRpbWUuc3RlcDEgLyAzKSwgMV0sIC8vIFRpbWluZyBkZWxheVxuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDEsIDBdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEhBTkQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kLnNldFBvc2l0aW9uKC4uLnZhbCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgWzAsIHRoaXMuaGFuZC5nZXRQb3NpdGlvblkoKV1dLFxuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDEsIFswLCAtNzVdXSAvLyBUaGUgZWxlbWVudCBpcyA3NXB4IHRhbGwsIHRoaXMgbW92ZXMgaXQgb3V0IG9mIHZpZXcgYXQgdGhlIHRvcFxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLSBUQUcgTElORSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ0xpbmUuc2V0UG9zaXRpb24oLi4udmFsKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBbMCwgdGhpcy50YWdMaW5lLmdldFBvc2l0aW9uWSgpXV0sXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNCwgWzAsIHRoaXMudGFnTGluZS5nZXRQb3NpdGlvblkoKV1dLFxuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDYsIFswLCA1MF1dLCAvLyBUaGUgZWxlbWVudCBpcyAxMDBweCB0YWxsLCB0aGlzIHB1dHMgaXQgb3V0IG9mIHZpZXdcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA3LCBbMCwgNDBdXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA4IC0gNTAwLCBbMCwgLTIwMF1dXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFNQSU5OSU5HIFJJTkdTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgICAgIGZvcihsZXQgaSA9IDAsIGogPSB0aGlzLnNwaW5uaW5nUmluZ3MubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgY29pbiA9IHRoaXMuc3Bpbm5pbmdSaW5nc1tpXTtcbiAgICAgICAgICAgIGxldCBzdGFydGluZ1lQb3MgPSBjb2luLmdldFBvc2l0aW9uWSgpO1xuXG4gICAgICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvaW4uc2V0UG9zaXRpb24oLi4udmFsKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgWzAsIHN0YXJ0aW5nWVBvc11dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA3LCBbMCwgc3RhcnRpbmdZUG9zXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDgsIFswLCBFTlVNUy5DT0lOX0NFTlRFUl0sIEN1cnZlcy5lYXNlT3V0XVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICAgICAgaGFuZGxlcjogKHRpbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIXRoaXMuaGFzT3duUHJvcGVydHkoJ2hhc0xvYWRlZFJpbmdzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFzTG9hZGVkUmluZ3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmKCF0aGlzLmhhc0xvYWRlZFJpbmdzICYmIHRpbWUgPj0gdGhpcy50aW1lLnN0ZXA3KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3NwaW5SaW5nJywge30pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXNMb2FkZWRSaW5ncyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhdGg6IFtcbiAgICAgICAgICAgICAgICAgICAgWzAsIDBdLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLmVuZCwgdGhpcy50aW1lLmVuZF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tIENPSU4gVEVYVCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2luLnNldFBvc2l0aW9uKC4uLnZhbCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIFswLCB0aGlzLmNvaW4uZ2V0UG9zaXRpb25ZKCldXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA3ICsgNTAsIFswLCB0aGlzLmNvaW4uZ2V0UG9zaXRpb25ZKCldXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA4ICsgNTAsIFswLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAxNzVdLCBDdXJ2ZXMuZWFzZU91dF1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0gR0VUIFlPVVJTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldFlvdXJzLnNldFBvc2l0aW9uKC4uLnZhbCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW1xuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIFswLCB0aGlzLmdldFlvdXJzLmdldFBvc2l0aW9uWSgpXV0sXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNyArIDc1LCBbMCwgdGhpcy5nZXRZb3Vycy5nZXRQb3NpdGlvblkoKV1dLFxuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDggKyA3NSwgWzAsIHdpbmRvdy5pbm5lckhlaWdodCAtIDEyMF0sIEN1cnZlcy5lYXNlT3V0XVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQUkUgT1JERVIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgaGFuZGxlcjogKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlT3JkZXIuc2V0UG9zaXRpb24oLi4udmFsKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgWzAsIHRoaXMucHJlT3JkZXIuZ2V0UG9zaXRpb25ZKCldXSxcbiAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA3ICsgMjAwLCBbMCwgdGhpcy5wcmVPcmRlci5nZXRQb3NpdGlvblkoKV1dLFxuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDggKyAyMDAsIFswLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSA2NV0sIEN1cnZlcy5lYXNlT3V0XVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLSBDQVJEUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICAgICAgICBmb3IobGV0IGkgPSAwLCBqID0gdGhpcy5jYXJkcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBjYXJkID0gdGhpcy5jYXJkc1tpXTtcblxuICAgICAgICAgICAgbGV0IHRpbWVTZWdtZW50cyA9IHRoaXMuZ2V0Q2FyZFRpbWVTZWdtZW50cyhjYXJkKTtcblxuICAgICAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXJkLnNldFBvc2l0aW9uKC4uLihBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwgOiBbdmFsXSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGF0aDogdGltZVNlZ21lbnRzLmNhcmRQb3NpdGlvblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudGltZWxpbmUucmVnaXN0ZXJQYXRoKHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5zZXRTY2FsZSguLi4oQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsIDogW3ZhbF0pKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhdGg6IHRpbWVTZWdtZW50cy5jYXJkU2NhbGVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQuc2V0Um90YXRpb24oLi4uKEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbCA6IFt2YWxdKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXRoOiB0aW1lU2VnbWVudHMuY2FyZFJvdGF0aW9uXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy50aW1lbGluZS5yZWdpc3RlclBhdGgoe1xuICAgICAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXJkLnNldE9wYWNpdHkodmFsKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhdGg6IHRpbWVTZWdtZW50cy5jYXJkT3BhY2l0eVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRpbWVsaW5lLnJlZ2lzdGVyUGF0aCh7XG4gICAgICAgICAgICBoYW5kbGVyOiAodGltZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHRpbWUgPj0gdGhpcy50aW1lLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZENvaW5TcHJpbmdFdmVudCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEd5cm9zY29wZUV2ZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlU2hpbW1lcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXG4gICAgICAgICAgICAgICAgWzAsIDBdLFxuICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuZW5kLCB0aGlzLnRpbWUuZW5kXVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRDYXJkVGltZVNlZ21lbnRzKGNhcmQpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRQb3NpdGlvbiA9IFtjYXJkLm1vZGVsLnBvc2l0aW9uLngsIGNhcmQubW9kZWwucG9zaXRpb24ueSwgY2FyZC5tb2RlbC5wb3NpdGlvbi56XTtcbiAgICAgICAgbGV0IGN1cnJlbnRSb3RhdGlvbiA9IFtjYXJkLm1vZGVsLnJvdGF0aW9uLngsIGNhcmQubW9kZWwucm90YXRpb24ueSwgY2FyZC5tb2RlbC5yb3RhdGlvbi56XTtcbiAgICAgICAgbGV0IHRpbWVTZWdtZW50cyA9IHtcbiAgICAgICAgICAgIGNhcmRTY2FsZTogW10sXG4gICAgICAgICAgICBjYXJkUm90YXRpb246IFtdLFxuICAgICAgICAgICAgY2FyZE9wYWNpdHk6IFtdLFxuICAgICAgICAgICAgY2FyZFBvc2l0aW9uOiBbXVxuICAgICAgICB9O1xuXG4gICAgICAgIHRpbWVTZWdtZW50cy5jYXJkUG9zaXRpb24gPSBbXG4gICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBjdXJyZW50UG9zaXRpb25dLFxuICAgICAgICAgICAgWyh0aGlzLnRpbWUuc3RlcDEgLyAyKSwgWzAsIDI1MCwgY2FyZC5tb2RlbC5wb3NpdGlvbi56XV0sXG4gICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbMCwgNzUsIGNhcmQubW9kZWwucG9zaXRpb24uel1dXG4gICAgICAgIF07XG5cbiAgICAgICAgc3dpdGNoKGNhcmQubW9kZWwuaSkge1xuICAgICAgICAgICAgY2FzZSAwOiAvL0dJRlRcbiAgICAgICAgICAgICAgICB0aW1lU2VnbWVudHMuY2FyZFNjYWxlID0gW1xuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBbLjUsIC41LCAuNV1dLFxuICAgICAgICAgICAgICAgICAgICBbMzAwLCBbLjUsIC41LCAuNV1dLCAvLyBEZWxheVxuICAgICAgICAgICAgICAgICAgICBbKHRoaXMudGltZS5zdGVwMSAvIDIpLCBbMSwgMSwgMV1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbLjUsIC41LCAuNV1dXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB0aW1lU2VnbWVudHMuY2FyZFJvdGF0aW9uID0gW1xuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBjdXJyZW50Um90YXRpb25dLFxuICAgICAgICAgICAgICAgICAgICBbMzAwLCBjdXJyZW50Um90YXRpb25dLCAvLyBEZWxheVxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbKDM2MCAqIE1hdGguUEkgLyAxODApLCAwLCAoLTI3MCAqIE1hdGguUEkgLyAxODApXV1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIHRpbWVTZWdtZW50cy5jYXJkT3BhY2l0eSA9IFtcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgMV0sXG4gICAgICAgICAgICAgICAgICAgIFsodGhpcy50aW1lLnN0ZXAxIC0gMSksIDFdLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCAwXVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6IC8vIENSRURJVFxuICAgICAgICAgICAgICAgIHRpbWVTZWdtZW50cy5jYXJkU2NhbGUgPSBbXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIFsuNSwgLjUsIC41XV0sXG4gICAgICAgICAgICAgICAgICAgIFsyMDAsIFsuNSwgLjUsIC41XV0sIC8vIERlbGF5XG4gICAgICAgICAgICAgICAgICAgIFsodGhpcy50aW1lLnN0ZXAxIC8gMiksIFsxLCAxLCAxXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDEsIFsuNSwgLjUsIC41XV1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIHRpbWVTZWdtZW50cy5jYXJkUm90YXRpb24gPSBbXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIGN1cnJlbnRSb3RhdGlvbl0sXG4gICAgICAgICAgICAgICAgICAgIFsyMDAsIGN1cnJlbnRSb3RhdGlvbl0sIC8vIERlbGF5XG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDEsIFsoLTM2MCAqIE1hdGguUEkgLyAxODApLCAwLCAoOTAgKiBNYXRoLlBJIC8gMTgwKV1dXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB0aW1lU2VnbWVudHMuY2FyZE9wYWNpdHkgPSBbXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIDFdLFxuICAgICAgICAgICAgICAgICAgICBbKHRoaXMudGltZS5zdGVwMSAtIDEpLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgMF1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOiAvL01FTUJFUlNISVBcbiAgICAgICAgICAgICAgICB0aW1lU2VnbWVudHMuY2FyZFNjYWxlID0gW1xuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBbLjUsIC41LCAuNV1dLFxuICAgICAgICAgICAgICAgICAgICBbMTAwLCBbLjUsIC41LCAuNV1dLCAvLyBEZWxheVxuICAgICAgICAgICAgICAgICAgICBbKHRoaXMudGltZS5zdGVwMSAvIDIpLCBbMSwgMSwgMV1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbLjUsIC41LCAuNV1dXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB0aW1lU2VnbWVudHMuY2FyZFJvdGF0aW9uID0gW1xuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0YXJ0LCBjdXJyZW50Um90YXRpb25dLFxuICAgICAgICAgICAgICAgICAgICBbMTAwLCBjdXJyZW50Um90YXRpb25dLCAvLyBEZWxheVxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbKDM2MCAqIE1hdGguUEkgLyAxODApLCAwLCAoLTI3MCAqIE1hdGguUEkgLyAxODApXV1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIHRpbWVTZWdtZW50cy5jYXJkT3BhY2l0eSA9IFtcbiAgICAgICAgICAgICAgICAgICAgWzAsIDFdLFxuICAgICAgICAgICAgICAgICAgICBbKHRoaXMudGltZS5zdGVwMSAtIDEpLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgMF1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOiAvL0RFQklUXG4gICAgICAgICAgICAgICAgdGltZVNlZ21lbnRzLmNhcmRTY2FsZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgWy41LCAuNSwgLjVdXSxcbiAgICAgICAgICAgICAgICAgICAgWyh0aGlzLnRpbWUuc3RlcDEgLyAyKSwgWzEsIDEsIDFdXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgWy41LCAuNSwgLjVdXVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgdGltZVNlZ21lbnRzLmNhcmRSb3RhdGlvbiA9IFtcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgY3VycmVudFJvdGF0aW9uXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMSwgWygtMzYwICogTWF0aC5QSSAvIDE4MCksIDAsICg5MCAqIE1hdGguUEkgLyAxODApXV1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIHRpbWVTZWdtZW50cy5jYXJkT3BhY2l0eSA9IFtcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgMV0sXG4gICAgICAgICAgICAgICAgICAgIFsodGhpcy50aW1lLnN0ZXAxIC0gMSksIDFdLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCAwXVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ6IC8vQ09JTlxuICAgICAgICAgICAgICAgIHRpbWVTZWdtZW50cy5jYXJkU2NhbGUgPSBbXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RhcnQsIFsuNSwgLjUsIC41XV0sXG4gICAgICAgICAgICAgICAgICAgIFsodGhpcy50aW1lLnN0ZXAxIC8gMiksIFsxLCAxLCAxXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDEsIFsuNSwgLjUsIC41XV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDIsIFsuMywgLjMsIC4zXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDMsIFsuNSwgLjUsIC41XV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDMgKyA1MCwgWy41LCAuNSwgLjVdXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNCwgWy42MiwgLjYyLCAuNjJdXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNSwgWy43NSwgLjc1LCAuNzVdXVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgdGltZVNlZ21lbnRzLmNhcmRSb3RhdGlvbiA9IFtcbiAgICAgICAgICAgICAgICAgICAgWzAsIGN1cnJlbnRSb3RhdGlvbl0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDEsIFsoLTM2MCAqIE1hdGguUEkgLyAxODApLCAwLCAoOTAgKiBNYXRoLlBJIC8gMTgwKV1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAyLCBbKC01NDAgKiBNYXRoLlBJIC8gMTgwKSwgMCwgKDkwICogTWF0aC5QSSAvIDE4MCldXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwMywgWygtMzYwICogTWF0aC5QSSAvIDE4MCksIDAsICg5MCAqIE1hdGguUEkgLyAxODApXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDMgKyA1MCwgWygtMzYwICogTWF0aC5QSSAvIDE4MCksIDAsICg5MCAqIE1hdGguUEkgLyAxODApXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDQsIFsoLTI3MCAqIE1hdGguUEkgLyAxODApLCAwLCAoOTAgKiBNYXRoLlBJIC8gMTgwKV1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA1LCBbKDAgKiBNYXRoLlBJIC8gMTgwKSwgMCwgKDkwICogTWF0aC5QSSAvIDE4MCldXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNiwgWygxNSAqIE1hdGguUEkgLyAxODApLCAwLCAoOTAgKiBNYXRoLlBJIC8gMTgwKV1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA3LCBbKDAgKiBNYXRoLlBJIC8gMTgwKSwgMCwgKDkwICogTWF0aC5QSSAvIDE4MCldXVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgdGltZVNlZ21lbnRzLmNhcmRPcGFjaXR5ID0gW1xuICAgICAgICAgICAgICAgICAgICBbMCwgMF0sXG4gICAgICAgICAgICAgICAgICAgIFsodGhpcy50aW1lLnN0ZXAxIC0gMSksIDBdLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCAxXVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgdGltZVNlZ21lbnRzLmNhcmRQb3NpdGlvbiA9IFtcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGFydCwgY3VycmVudFBvc2l0aW9uXSxcbiAgICAgICAgICAgICAgICAgICAgWyh0aGlzLnRpbWUuc3RlcDEgLyAyKSwgWzAsIDI1MCwgMF1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAxLCBbMCwgNzUsIDBdLCBDdXJ2ZXMub3V0QmFja10sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDMsIFswLCA3NSwgMF1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXAzICsgNTAsIFswLCA3NSwgMF1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA0LCBbMCwgMzAwLCAwXV0sXG4gICAgICAgICAgICAgICAgICAgIFt0aGlzLnRpbWUuc3RlcDUsIFswLCAyMDAsIDBdXSxcbiAgICAgICAgICAgICAgICAgICAgW3RoaXMudGltZS5zdGVwNywgWzAsIDIwMCwgMF1dLFxuICAgICAgICAgICAgICAgICAgICBbdGhpcy50aW1lLnN0ZXA4IC0gNTAwLCBbMCwgNTAsIDBdLCBDdXJ2ZXMuZWFzZU91dF1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRpbWVTZWdtZW50cztcbiAgICB9XG5cbiAgICBzY3J1YlRpbWVsaW5lR2VzdHVyZShlKSB7XG4gICAgICAgIGlmKHRoaXMuY3VycmVudFRpbWUgPj0gMCAmJiB0aGlzLmN1cnJlbnRUaW1lIDw9IHRoaXMudGltZS5lbmQpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWUgKz0gZS5jZW50ZXJEZWx0YS55ICogLTQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLmN1cnJlbnRUaW1lIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLmN1cnJlbnRUaW1lID4gdGhpcy50aW1lLmVuZCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMudGltZS5lbmQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRpbWVsaW5lLnNldCh0aGlzLmN1cnJlbnRUaW1lKTtcbiAgICB9XG5cbiAgICBzY3J1YlRpbWVsaW5lKG1vdXNlTW92ZW1lbnQpIHtcbiAgICAgICAgLy8gNCBpcyB1c2VkIHRvIHNwZWVkIHVwIHRoZSBzY3J1YmJpbmcgcmF0ZSBieSBhIGZhY3RvciBvZiA0IGZyb20gdGhlIGdlc3R1cmUgbW92ZW1lbnRcbiAgICAgICAgaWYodGhpcy5jdXJyZW50VGltZSA+PSAwICYmIHRoaXMuY3VycmVudFRpbWUgPD0gdGhpcy50aW1lLmVuZCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZSArPSBtb3VzZU1vdmVtZW50LnkgKiA0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy9UaGUgcHJldmlvdXMgbWF0aCBjYW4gbGVhdmUgdmFsdWVzIHRoYXQgYXJlIG91dHNpZGUgb2YgdGhlIHdvcmtpbmcgdmFsdWUgcmFuZ2VcbiAgICAgICAgaWYodGhpcy5jdXJyZW50VGltZSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5jdXJyZW50VGltZSA+IHRoaXMudGltZS5lbmQpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLnRpbWUuZW5kO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZWxpbmUuc2V0KHRoaXMuY3VycmVudFRpbWUpO1xuICAgIH1cbn1cblxuY29uc3Qgcm9vdE5vZGUgICA9IEZhbW91c1BsYXRmb3JtLmNvcmUuRmFtb3VzLmNyZWF0ZUNvbnRleHQoJ2JvZHknKTtcbmxldCBjYW1lcmEgPSBuZXcgRmFtb3VzUGxhdGZvcm0uY29tcG9uZW50cy5DYW1lcmEocm9vdE5vZGUpO1xuY2FtZXJhLnNldERlcHRoKDIwMDAwKTtcblxud2luZG93LmFwcCA9IG5ldyBBcHAocm9vdE5vZGUuYWRkQ2hpbGQoKSwge1xuICAgIHByb3BlcnRpZXM6IHtcblxuICAgIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgRmFtb3VzRW5naW5lIGZyb20gJ2ZhbW91cy1jcmVhdGl2ZS9zY2FmZm9sZGluZy9GYW1vdXNFbmdpbmUnO1xuRmFtb3VzRW5naW5lLmluaXQoKTtcblxucmVxdWlyZSgnLi9hcHAvaW5kZXgnKTtcbiJdfQ==
