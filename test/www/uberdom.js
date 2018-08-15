(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

require('./lib/polyfills/closest');

var dataset = require('./lib/polyfills/dataset');
var cookies = require('./lib/cookies').getInstance();
var storage = require('./lib/storage').getInstance();
var pack = require('./package.json');
var ajax = require('./lib/ajax');

function init() {
  if (window.u) {
    return window.u;
  }

  //
  // Declarations.
  //

  var u;
  var ext = {};

  //
  // Definition of extensions.
  //

  ext.find = function (selector) {
    return Array.prototype.slice.call(this.querySelectorAll(selector)).map(function (el) {
      return u(el);
    });
  };

  ext.find1 = function (selector) {
    return u(this.querySelector(selector) || u._empty);
  };

  ext.kids = function () {
    return Array.prototype.slice.call(this.children).map(function (el) {
      return u(el);
    });
  };

  ext.dad = function (selector) {
    var result = selector ? this.closest(selector) : this.parentElement;
    return u(result || u._empty);
  };

  ext.next = function () {
    return u(this.nextElementSibling || u._empty);
  };

  ext.prev = function () {
    return u(this.previousElementSibling || u._empty);
  };

  ext.index = function () {
    return this.dad().kids().indexOf(this);
  };

  ext.data = function (key, value) {
    if (!key) {
      // Always return a copy
      return JSON.parse(JSON.stringify(dataset(this)));
    }

    // Set the value
    if (value !== undefined) {
      dataset(this)[key] = value;
      return;
    }

    // Convert boolean and numeric values
    var result = dataset(this)[key];
    var isNumericOrBoolean = result && (result === 'true' || result === 'false' || !isNaN(result));
    return isNumericOrBoolean ? JSON.parse(result) : result;
  };

  ext.addTo = function (el) {
    return u(el.appendChild(this));
  };

  ext.addAfter = function (el) {
    el = u(el);
    if (el.next().isEmpty) {
      return this.addTo(el.dad());
    }

    return this.addBefore(el.next());
  };

  ext.addBefore = function (el) {
    el = u(el);
    return u(el.dad().insertBefore(this, el));
  };

  ext.empty = function () {
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
  };

  ext.del = function () {
    this.dad().removeChild(this);
  };

  ext.on = function (eventName, arg1, arg2) {
    var selector = typeof arg1 === 'string' ? arg1 : null;
    var listener = arg2 || arg1;

    if (!selector) {
      this.addEventListener(eventName, function (event) {
        return listener(u._wrapEventTargets(event));
      }, true);
      return this;
    }

    // In this case it is not possible to remove the listener.
    this.addEventListener(eventName, function (event) {
      var target = u._getTarget(event, selector);
      target && listener(u._wrapEventTargets(event), target);
    }, true);

    return this;
  };

  ext.off = function (eventName, listener) {
    this.removeEventListener(eventName, listener, true);
    return this;
  };

  ext.trigger = function (name, args) {
    var ev = u.newEvent(name);
    args && Object.keys(args).forEach(function (key) {
      ev[key] = args[key];
    });
    this.dispatchEvent(ev);
  };

  //
  // Definition of u object.
  //

  u = function u(el) {
    Object.getOwnPropertyNames(ext).forEach(function (methodName) {
      el[methodName] = ext[methodName].bind(el);
    });

    return el;
  };

  Object.defineProperty(u, 'wnd', {
    get: function get() {
      return u(window);
    }
  });
  Object.defineProperty(u, 'doc', {
    get: function get() {
      return u(window.document);
    }
  });
  Object.defineProperty(u, 'html', {
    get: function get() {
      return u(window.document.documentElement);
    }
  });

  u.version = pack.version;
  u.loc = window.location;
  u.cookies = cookies;
  u.storage = storage;
  u.ajax = ajax;
  u.find = u.doc.find;
  u.find1 = u.doc.find1;
  u._empty = document.createElement('empty');
  u._empty.isEmpty = true;
  u._ext = ext;

  u.newEvent = function (name) {
    var event = document.createEvent('Event');
    event.initEvent(name, true, true);
    return event;
  };

  u.create = function (htmlString) {
    var div = u(document.createElement('div'));
    div.innerHTML = htmlString.trim();
    var kids = div.kids();
    return kids.length === 1 ? kids[0] : kids;
  };

  u._getTarget = function (event, sel) {
    var t = event.target;
    while (t !== event.currentTarget) {
      if (t.matches(sel)) {
        return u(t);
      }

      t = t.parentElement;
    }

    return null;
  };

  u._wrapEventTargets = function (event) {
    event.currentTarget && u(event.currentTarget);
    event.target && u(event.target);
    event.relatedTarget && u(event.relatedTarget);
    return event;
  };

  //
  // Return value.
  //

  window.u = u;
  return window.u;
}

module.exports = init();

},{"./lib/ajax":2,"./lib/cookies":3,"./lib/polyfills/closest":4,"./lib/polyfills/dataset":5,"./lib/storage":6,"./package.json":7}],2:[function(require,module,exports){
'use strict';

var DEFAULT_TIMEOUT = 10000;

function ajax(args, callback) {
  var req = new window.XMLHttpRequest();
  var url = args.url || args;
  var method = args.method || 'GET';
  var isAsync = !args.sync;
  var headers = args.headers || [];

  headers.forEach(function (h) {
    return req.setRequestHeader(h.header, h.value);
  });

  req.json = function () {
    var text = this.responseText || null;
    return JSON.parse(text);
  };

  req.ontimeout = function () {
    return callback(new Error('XHR timed out: ' + url), req);
  };
  req.onerror = function () {
    return callback(new Error('XHR ' + req.status + ' error: ' + url), req);
  };
  req.onload = function () {
    if (req.status >= 400) {
      return req.onerror();
    }

    callback(null, req);
  };

  req.open(method, url, isAsync, args.user, args.pass);
  if (isAsync) {
    // Needs to happen after open due to IE11 bug
    // https://github.com/stephanebachelier/superapi/issues/5
    req.timeout = args.timeout || DEFAULT_TIMEOUT;
  }

  req.send(null);

  return req;
}

module.exports = ajax;

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cookies = function () {
  function Cookies() {
    _classCallCheck(this, Cookies);
  }

  _createClass(Cookies, [{
    key: 'get',
    value: function get(name) {
      if (!name) {
        return null;
      }

      return window.decodeURIComponent(window.document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + window.encodeURIComponent(name).replace(/[-.+*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
    }
  }, {
    key: 'set',
    value: function set(name, value, time) {
      var expires = '';
      if (time) {
        var date = new Date();
        date.setTime(date.getTime() + time);
        expires = 'expires=' + date.toGMTString() + ';';
      }

      name = window.encodeURIComponent(name);
      value = window.encodeURIComponent(value);
      window.document.cookie = name + '=' + value + ';' + expires + 'path=/';
    }
  }, {
    key: 'del',
    value: function del(name, value) {
      this.set(name, '', -1);
    }
  }, {
    key: 'has',
    value: function has(name) {
      if (!name) {
        return false;
      }

      return new RegExp('(?:^|;\\s*)' + window.encodeURIComponent(name).replace(/[-.+*]/g, '\\$&') + '\\s*\\=').test(window.document.cookie);
    }
  }], [{
    key: 'getInstance',
    value: function getInstance() {
      Cookies.instance = Cookies.instance || new Cookies();
      return Cookies.instance;
    }
  }]);

  return Cookies;
}();

module.exports = Cookies;

},{}],4:[function(require,module,exports){
/* global Element */
'use strict';

if (typeof Element.prototype.matches !== 'function') {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector || function matches(selector) {
    var element = this;
    var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
    var index = 0;

    while (elements[index] && elements[index] !== element) {
      ++index;
    }

    return Boolean(elements[index]);
  };
}

if (typeof Element.prototype.closest !== 'function') {
  Element.prototype.closest = function closest(selector) {
    var element = this;

    while (element && element.nodeType === 1) {
      if (element.matches(selector)) {
        return element;
      }

      element = element.parentNode;
    }

    return null;
  };
}

},{}],5:[function(require,module,exports){
'use strict';

// <3 Modernizr
// https://raw.githubusercontent.com/Modernizr/Modernizr/master/feature-detects/dom/dataset.js

function useNative() {
  var elem = document.createElement('div');
  elem.setAttribute('data-a-b', 'c');

  return Boolean(elem.dataset && elem.dataset.aB === 'c');
}

function nativeDataset(element) {
  return element.dataset;
}

module.exports = useNative() ? nativeDataset : function (element) {
  var map = {};
  var attributes = element.attributes;

  function getter() {
    return this.value;
  }

  function setter(name, value) {
    if (typeof value === 'undefined') {
      this.removeAttribute(name);
    } else {
      this.setAttribute(name, value);
    }
  }

  for (var i = 0, j = attributes.length; i < j; i++) {
    var attribute = attributes[i];

    if (attribute) {
      var name = attribute.name;

      if (name.indexOf('data-') === 0) {
        var prop = name.slice(5).replace(/-./g, function (u) {
          return u.charAt(1).toUpperCase();
        });

        var value = attribute.value;

        Object.defineProperty(map, prop, {
          enumerable: true,
          get: getter.bind({ value: value || '' }),
          set: setter.bind(element, name)
        });
      }
    }
  }

  return map;
};

},{}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Storage = function () {
  function Storage() {
    _classCallCheck(this, Storage);
  }

  _createClass(Storage, [{
    key: 'get',
    value: function get(key) {
      var data = window.localStorage.getItem(key);
      return data ? JSON.parse(data) : data;
    }
  }, {
    key: 'set',
    value: function set(key, data) {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  }, {
    key: 'del',
    value: function del(key) {
      window.localStorage.removeItem(key);
    }
  }], [{
    key: 'getInstance',
    value: function getInstance() {
      Storage.instance = Storage.instance || new Storage();
      return Storage.instance;
    }
  }]);

  return Storage;
}();

module.exports = Storage;

},{}],7:[function(require,module,exports){
module.exports={
  "name": "uberdom",
  "version": "0.1.3",
  "description": "A set of simple DOM extensions make life easier in the post-jQuery era.",
  "main": "index.js",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/gavoja/uberdom.git"
  },
  "keywords": [
    "uber",
    "dom",
    "jquery"
  ],
  "author": "Michal Kochel",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/gavoja/uberdom/issues"
  },
  "homepage": "https://github.com/gavoja/uberdom#readme",
  "devDependencies": {
    "babel-core": "^6.26.3",
    "babel-preset-env": "^1.7.0",
    "babelify": "^8.0.0",
    "browserify": "^16.2.2",
    "puppeteer": "^1.7.0",
    "runna": "^2.2.1",
    "runna-webserver": "^0.1.4"
  },
  "scripts": {
    "serve": "runna-webserver -w ./test/www",
    "serve:stop": "runna-webserver -x",
    "serve:reload": "runna-webserver -r",
    "test:puppeteer": "node ./test/test.js",
    "build:js": "browserify index.js -o test/www/uberdom.js -t [ babelify --presets [ babel-preset-env ] ] --debug true",
    "dev": "runna [ +serve build:js ] -w",
    "test": "runna [ +serve build:js - test:puppeteer - serve:stop ]"
  },
  "observe": {
    "build:js - serve:reload": [
      "lib/**/*.js",
      "index.js"
    ],
    "serve:reload": [
      "test/www/index.html"
    ]
  }
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9hamF4LmpzIiwibGliL2Nvb2tpZXMuanMiLCJsaWIvcG9seWZpbGxzL2Nsb3Nlc3QuanMiLCJsaWIvcG9seWZpbGxzL2RhdGFzZXQuanMiLCJsaWIvc3RvcmFnZS5qcyIsInBhY2thZ2UuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLFFBQVEseUJBQVI7O0FBRUEsSUFBTSxVQUFVLFFBQVEseUJBQVIsQ0FBaEI7QUFDQSxJQUFNLFVBQVUsUUFBUSxlQUFSLEVBQXlCLFdBQXpCLEVBQWhCO0FBQ0EsSUFBTSxVQUFVLFFBQVEsZUFBUixFQUF5QixXQUF6QixFQUFoQjtBQUNBLElBQU0sT0FBTyxRQUFRLGdCQUFSLENBQWI7QUFDQSxJQUFNLE9BQU8sUUFBUSxZQUFSLENBQWI7O0FBRUEsU0FBUyxJQUFULEdBQWlCO0FBQ2YsTUFBSSxPQUFPLENBQVgsRUFBYztBQUNaLFdBQU8sT0FBTyxDQUFkO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBOztBQUVBLE1BQUksQ0FBSjtBQUNBLE1BQUksTUFBTSxFQUFWOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxNQUFJLElBQUosR0FBVyxVQUFVLFFBQVYsRUFBb0I7QUFDN0IsV0FBTyxNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsSUFBdEIsQ0FBMkIsS0FBSyxnQkFBTCxDQUFzQixRQUF0QixDQUEzQixFQUE0RCxHQUE1RCxDQUFnRTtBQUFBLGFBQU0sRUFBRSxFQUFGLENBQU47QUFBQSxLQUFoRSxDQUFQO0FBQ0QsR0FGRDs7QUFJQSxNQUFJLEtBQUosR0FBWSxVQUFVLFFBQVYsRUFBb0I7QUFDOUIsV0FBTyxFQUFFLEtBQUssYUFBTCxDQUFtQixRQUFuQixLQUFnQyxFQUFFLE1BQXBDLENBQVA7QUFDRCxHQUZEOztBQUlBLE1BQUksSUFBSixHQUFXLFlBQVk7QUFDckIsV0FBTyxNQUFNLFNB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T0FBTyxJQUFQLENBQVksT0FBWixFQUFxQixJQUFyQjtBQUgwQixTQUFqQztBQUtEO0FBQ0Y7QUFDRjs7QUFFRCxTQUFPLEdBQVA7QUFDRCxDQXZDRDs7O0FDZkE7Ozs7OztJQUVNLE87Ozs7Ozs7d0JBS0MsRyxFQUFLO0FBQ1IsVUFBTSxPQUFPLE9BQU8sWUFBUCxDQUFvQixPQUFwQixDQUE0QixHQUE1QixDQUFiO0FBQ0EsYUFBTyxPQUFPLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBUCxHQUEwQixJQUFqQztBQUNEOzs7d0JBRUksRyxFQUFLLEksRUFBTTtBQUNkLGFBQU8sWUFBUCxDQUFvQixPQUFwQixDQUE0QixHQUE1QixFQUFpQyxLQUFLLFNBQUwsQ0FBZSxJQUFmLENBQWpDO0FBQ0Q7Ozt3QkFFSSxHLEVBQUs7QUFDUixhQUFPLFlBQVAsQ0FBb0IsVUFBcEIsQ0FBK0IsR0FBL0I7QUFDRDs7O2tDQWZxQjtBQUNwQixjQUFRLFFBQVIsR0FBbUIsUUFBUSxRQUFSLElBQW9CLElBQUksT0FBSixFQUF2QztBQUNBLGFBQU8sUUFBUSxRQUFmO0FBQ0Q7Ozs7OztBQWVILE9BQU8sT0FBUCxHQUFpQixPQUFqQjs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnXG5cbnJlcXVpcmUoJy4vbGliL3BvbHlmaWxscy9jbG9zZXN0JylcblxuY29uc3QgZGF0YXNldCA9IHJlcXVpcmUoJy4vbGliL3BvbHlmaWxscy9kYXRhc2V0JylcbmNvbnN0IGNvb2tpZXMgPSByZXF1aXJlKCcuL2xpYi9jb29raWVzJykuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc3RvcmFnZSA9IHJlcXVpcmUoJy4vbGliL3N0b3JhZ2UnKS5nZXRJbnN0YW5jZSgpXG5jb25zdCBwYWNrID0gcmVxdWlyZSgnLi9wYWNrYWdlLmpzb24nKVxuY29uc3QgYWpheCA9IHJlcXVpcmUoJy4vbGliL2FqYXgnKVxuXG5mdW5jdGlvbiBpbml0ICgpIHtcbiAgaWYgKHdpbmRvdy51KSB7XG4gICAgcmV0dXJuIHdpbmRvdy51XG4gIH1cblxuICAvL1xuICAvLyBEZWNsYXJhdGlvbnMuXG4gIC8vXG5cbiAgdmFyIHVcbiAgdmFyIGV4dCA9IHt9XG5cbiAgLy9cbiAgLy8gRGVmaW5pdGlvbiBvZiBleHRlbnNpb25zLlxuICAvL1xuXG4gIGV4dC5maW5kID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpLm1hcChlbCA9PiB1KGVsKSlcbiAgfVxuXG4gIGV4dC5maW5kMSA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgIHJldHVybiB1KHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3RvcikgfHwgdS5fZW1wdHkpXG4gIH1cblxuICBleHQua2lkcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5jaGlsZHJlbikubWFwKGVsID0+IHUoZWwpKVxuICB9XG5cbiAgZXh0LmRhZCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgIHZhciByZXN1bHQgPSBzZWxlY3RvciA/IHRoaXMuY2xvc2VzdChzZWxlY3RvcikgOiB0aGlzLnBhcmVudEVsZW1lbnRcbiAgICByZXR1cm4gdShyZXN1bHQgfHwgdS5fZW1wdHkpXG4gIH1cblxuICBleHQubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdSh0aGlzLm5leHRFbGVtZW50U2libGluZyB8fCB1Ll9lbXB0eSlcbiAgfVxuXG4gIGV4dC5wcmV2ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB1KHRoaXMucHJldmlvdXNFbGVtZW50U2libGluZyB8fCB1Ll9lbXB0eSlcbiAgfVxuXG4gIGV4dC5pbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5kYWQoKS5raWRzKCkuaW5kZXhPZih0aGlzKVxuICB9XG5cbiAgZXh0LmRhdGEgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIGlmICgha2V5KSB7XG4gICAgICAvLyBBbHdheXMgcmV0dXJuIGEgY29weVxuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGF0YXNldCh0aGlzKSkpXG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSB2YWx1ZVxuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkYXRhc2V0KHRoaXMpW2tleV0gPSB2YWx1ZVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gQ29udmVydCBib29sZWFuIGFuZCBudW1lcmljIHZhbHVlc1xuICAgIHZhciByZXN1bHQgPSBkYXRhc2V0KHRoaXMpW2tleV1cbiAgICB2YXIgaXNOdW1lcmljT3JCb29sZWFuID0gcmVzdWx0ICYmIChyZXN1bHQgPT09ICd0cnVlJyB8fCByZXN1bHQgPT09ICdmYWxzZScgfHwgIWlzTmFOKHJlc3VsdCkpXG4gICAgcmV0dXJuIGlzTnVtZXJpY09yQm9vbGVhbiA/IEpTT04ucGFyc2UocmVzdWx0KSA6IHJlc3VsdFxuICB9XG5cbiAgZXh0LmFkZFRvID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgcmV0dXJuIHUoZWwuYXBwZW5kQ2hpbGQodGhpcykpXG4gIH1cblxuICBleHQuYWRkQWZ0ZXIgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICBlbCA9IHUoZWwpXG4gICAgaWYgKGVsLm5leHQoKS5pc0VtcHR5KSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRUbyhlbC5kYWQoKSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5hZGRCZWZvcmUoZWwubmV4dCgpKVxuICB9XG5cbiAgZXh0LmFkZEJlZm9yZSA9IGZ1bmN0aW9uIChlbCkge1xuICAgIGVsID0gdShlbClcbiAgICByZXR1cm4gdShlbC5kYWQoKS5pbnNlcnRCZWZvcmUodGhpcywgZWwpKVxuICB9XG5cbiAgZXh0LmVtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgIHdoaWxlICh0aGlzLmZpcnN0Q2hpbGQpIHtcbiAgICAgIHRoaXMucmVtb3ZlQ2hpbGQodGhpcy5maXJzdENoaWxkKVxuICAgIH1cbiAgfVxuXG4gIGV4dC5kZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5kYWQoKS5yZW1vdmVDaGlsZCh0aGlzKVxuICB9XG5cbiAgZXh0Lm9uID0gZnVuY3Rpb24gKGV2ZW50TmFtZSwgYXJnMSwgYXJnMikge1xuICAgIHZhciBzZWxlY3RvciA9IHR5cGVvZiBhcmcxID09PSAnc3RyaW5nJyA/IGFyZzEgOiBudWxsXG4gICAgdmFyIGxpc3RlbmVyID0gYXJnMiB8fCBhcmcxXG5cbiAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBldmVudCA9PiBsaXN0ZW5lcih1Ll93cmFwRXZlbnRUYXJnZXRzKGV2ZW50KSksIHRydWUpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIC8vIEluIHRoaXMgY2FzZSBpdCBpcyBub3QgcG9zc2libGUgdG8gcmVtb3ZlIHRoZSBsaXN0ZW5lci5cbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgIHZhciB0YXJnZXQgPSB1Ll9nZXRUYXJnZXQoZXZlbnQsIHNlbGVjdG9yKVxuICAgICAgdGFyZ2V0ICYmIGxpc3RlbmVyKHUuX3dyYXBFdmVudFRhcmdldHMoZXZlbnQpLCB0YXJnZXQpXG4gICAgfSwgdHJ1ZSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBleHQub2ZmID0gZnVuY3Rpb24gKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lciwgdHJ1ZSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZXh0LnRyaWdnZXIgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHZhciBldiA9IHUubmV3RXZlbnQobmFtZSlcbiAgICBhcmdzICYmIE9iamVjdC5rZXlzKGFyZ3MpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGV2W2tleV0gPSBhcmdzW2tleV1cbiAgICB9KVxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldilcbiAgfVxuXG4gIC8vXG4gIC8vIERlZmluaXRpb24gb2YgdSBvYmplY3QuXG4gIC8vXG5cbiAgdSA9IGZ1bmN0aW9uIChlbCkge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGV4dCkuZm9yRWFjaChtZXRob2ROYW1lID0+IHtcbiAgICAgIGVsW21ldGhvZE5hbWVdID0gZXh0W21ldGhvZE5hbWVdLmJpbmQoZWwpXG4gICAgfSlcblxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHUsICd3bmQnLCB7IGdldCAoKSB7IHJldHVybiB1KHdpbmRvdykgfSB9KVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodSwgJ2RvYycsIHsgZ2V0ICgpIHsgcmV0dXJuIHUod2luZG93LmRvY3VtZW50KSB9IH0pXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh1LCAnaHRtbCcsIHsgZ2V0ICgpIHsgcmV0dXJuIHUod2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgfSB9KVxuXG4gIHUudmVyc2lvbiA9IHBhY2sudmVyc2lvblxuICB1LmxvYyA9IHdpbmRvdy5sb2NhdGlvblxuICB1LmNvb2tpZXMgPSBjb29raWVzXG4gIHUuc3RvcmFnZSA9IHN0b3JhZ2VcbiAgdS5hamF4ID0gYWpheFxuICB1LmZpbmQgPSB1LmRvYy5maW5kXG4gIHUuZmluZDEgPSB1LmRvYy5maW5kMVxuICB1Ll9lbXB0eSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2VtcHR5JylcbiAgdS5fZW1wdHkuaXNFbXB0eSA9IHRydWVcbiAgdS5fZXh0ID0gZXh0XG5cbiAgdS5uZXdFdmVudCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50JylcbiAgICBldmVudC5pbml0RXZlbnQobmFtZSwgdHJ1ZSwgdHJ1ZSlcbiAgICByZXR1cm4gZXZlbnRcbiAgfVxuXG4gIHUuY3JlYXRlID0gZnVuY3Rpb24gKGh0bWxTdHJpbmcpIHtcbiAgICB2YXIgZGl2ID0gdShkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSlcbiAgICBkaXYuaW5uZXJIVE1MID0gaHRtbFN0cmluZy50cmltKClcbiAgICB2YXIga2lkcyA9IGRpdi5raWRzKClcbiAgICByZXR1cm4ga2lkcy5sZW5ndGggPT09IDEgPyBraWRzWzBdIDoga2lkc1xuICB9XG5cbiAgdS5fZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gKGV2ZW50LCBzZWwpIHtcbiAgICB2YXIgdCA9IGV2ZW50LnRhcmdldFxuICAgIHdoaWxlICh0ICE9PSBldmVudC5jdXJyZW50VGFyZ2V0KSB7XG4gICAgICBpZiAodC5tYXRjaGVzKHNlbCkpIHtcbiAgICAgICAgcmV0dXJuIHUodClcbiAgICAgIH1cblxuICAgICAgdCA9IHQucGFyZW50RWxlbWVudFxuICAgIH1cblxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICB1Ll93cmFwRXZlbnRUYXJnZXRzID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQuY3VycmVudFRhcmdldCAmJiB1KGV2ZW50LmN1cnJlbnRUYXJnZXQpXG4gICAgZXZlbnQudGFyZ2V0ICYmIHUoZXZlbnQudGFyZ2V0KVxuICAgIGV2ZW50LnJlbGF0ZWRUYXJnZXQgJiYgdShldmVudC5yZWxhdGVkVGFyZ2V0KVxuICAgIHJldHVybiBldmVudFxuICB9XG5cbiAgLy9cbiAgLy8gUmV0dXJuIHZhbHVlLlxuICAvL1xuXG4gIHdpbmRvdy51ID0gdVxuICByZXR1cm4gd2luZG93LnVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbml0KClcbiIsImNvbnN0IERFRkFVTFRfVElNRU9VVCA9IDEwMDAwXG5cbmZ1bmN0aW9uIGFqYXggKGFyZ3MsIGNhbGxiYWNrKSB7XG4gIGNvbnN0IHJlcSA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuICBjb25zdCB1cmwgPSBhcmdzLnVybCB8fCBhcmdzXG4gIGNvbnN0IG1ldGhvZCA9IGFyZ3MubWV0aG9kIHx8ICdHRVQnXG4gIGNvbnN0IGlzQXN5bmMgPSAhYXJncy5zeW5jXG4gIGNvbnN0IGhlYWRlcnMgPSBhcmdzLmhlYWRlcnMgfHwgW11cblxuICBoZWFkZXJzLmZvckVhY2goaCA9PiByZXEuc2V0UmVxdWVzdEhlYWRlcihoLmhlYWRlciwgaC52YWx1ZSkpXG5cbiAgcmVxLmpzb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMucmVzcG9uc2VUZXh0IHx8IG51bGxcbiAgICByZXR1cm4gSlNPTi5wYXJzZSh0ZXh0KVxuICB9XG5cbiAgcmVxLm9udGltZW91dCA9ICgpID0+IGNhbGxiYWNrKG5ldyBFcnJvcihgWEhSIHRpbWVkIG91dDogJHt1cmx9YCksIHJlcSlcbiAgcmVxLm9uZXJyb3IgPSAoKSA9PiBjYWxsYmFjayhuZXcgRXJyb3IoYFhIUiAke3JlcS5zdGF0dXN9IGVycm9yOiAke3VybH1gKSwgcmVxKVxuICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChyZXEuc3RhdHVzID49IDQwMCkge1xuICAgICAgcmV0dXJuIHJlcS5vbmVycm9yKClcbiAgICB9XG5cbiAgICBjYWxsYmFjayhudWxsLCByZXEpXG4gIH1cblxuICByZXEub3BlbihtZXRob2QsIHVybCwgaXNBc3luYywgYXJncy51c2VyLCBhcmdzLnBhc3MpXG4gIGlmIChpc0FzeW5jKSB7XG4gICAgLy8gTmVlZHMgdG8gaGFwcGVuIGFmdGVyIG9wZW4gZHVlIHRvIElFMTEgYnVnXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3N0ZXBoYW5lYmFjaGVsaWVyL3N1cGVyYXBpL2lzc3Vlcy81XG4gICAgcmVxLnRpbWVvdXQgPSBhcmdzLnRpbWVvdXQgfHwgREVGQVVMVF9USU1FT1VUXG4gIH1cblxuICByZXEuc2VuZChudWxsKVxuXG4gIHJldHVybiByZXFcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhamF4XG4iLCIndXNlIHN0cmljdCdcblxuY2xhc3MgQ29va2llcyB7XG4gIHN0YXRpYyBnZXRJbnN0YW5jZSAoKSB7XG4gICAgQ29va2llcy5pbnN0YW5jZSA9IENvb2tpZXMuaW5zdGFuY2UgfHwgbmV3IENvb2tpZXMoKVxuICAgIHJldHVybiBDb29raWVzLmluc3RhbmNlXG4gIH1cblxuICBnZXQgKG5hbWUpIHtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgcmV0dXJuIHdpbmRvdy5kZWNvZGVVUklDb21wb25lbnQod2luZG93LmRvY3VtZW50LmNvb2tpZS5yZXBsYWNlKG5ldyBSZWdFeHAoJyg/Oig/Ol58Lio7KVxcXFxzKicgKyB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpLnJlcGxhY2UoL1stLisqXS9nLCAnXFxcXCQmJykgKyAnXFxcXHMqXFxcXD1cXFxccyooW147XSopLiokKXxeLiokJyksICckMScpKSB8fCBudWxsXG4gIH1cblxuICBzZXQgKG5hbWUsIHZhbHVlLCB0aW1lKSB7XG4gICAgbGV0IGV4cGlyZXMgPSAnJ1xuICAgIGlmICh0aW1lKSB7XG4gICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKClcbiAgICAgIGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSArIHRpbWUpXG4gICAgICBleHBpcmVzID0gYGV4cGlyZXM9JHtkYXRlLnRvR01UU3RyaW5nKCl9O2BcbiAgICB9XG5cbiAgICBuYW1lID0gd2luZG93LmVuY29kZVVSSUNvbXBvbmVudChuYW1lKVxuICAgIHZhbHVlID0gd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSlcbiAgICB3aW5kb3cuZG9jdW1lbnQuY29va2llID0gYCR7bmFtZX09JHt2YWx1ZX07JHtleHBpcmVzfXBhdGg9L2BcbiAgfVxuXG4gIGRlbCAobmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLnNldChuYW1lLCAnJywgLTEpXG4gIH1cblxuICBoYXMgKG5hbWUpIHtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiAobmV3IFJlZ0V4cCgnKD86Xnw7XFxcXHMqKScgKyB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpLnJlcGxhY2UoL1stLisqXS9nLCAnXFxcXCQmJykgKyAnXFxcXHMqXFxcXD0nKSkudGVzdCh3aW5kb3cuZG9jdW1lbnQuY29va2llKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29va2llc1xuIiwiLyogZ2xvYmFsIEVsZW1lbnQgKi9cbid1c2Ugc3RyaWN0J1xuXG5pZiAodHlwZW9mIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgIT09ICdmdW5jdGlvbicpIHtcbiAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9IEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLm1vek1hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3IgfHwgZnVuY3Rpb24gbWF0Y2hlcyAoc2VsZWN0b3IpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpc1xuICAgIGNvbnN0IGVsZW1lbnRzID0gKGVsZW1lbnQuZG9jdW1lbnQgfHwgZWxlbWVudC5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuICAgIGxldCBpbmRleCA9IDBcblxuICAgIHdoaWxlIChlbGVtZW50c1tpbmRleF0gJiYgZWxlbWVudHNbaW5kZXhdICE9PSBlbGVtZW50KSB7XG4gICAgICArK2luZGV4XG4gICAgfVxuXG4gICAgcmV0dXJuIEJvb2xlYW4oZWxlbWVudHNbaW5kZXhdKVxuICB9XG59XG5cbmlmICh0eXBlb2YgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICBFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0ID0gZnVuY3Rpb24gY2xvc2VzdCAoc2VsZWN0b3IpIHtcbiAgICBsZXQgZWxlbWVudCA9IHRoaXNcblxuICAgIHdoaWxlIChlbGVtZW50ICYmIGVsZW1lbnQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgIGlmIChlbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGVcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxuLy8gPDMgTW9kZXJuaXpyXG4vLyBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vTW9kZXJuaXpyL01vZGVybml6ci9tYXN0ZXIvZmVhdHVyZS1kZXRlY3RzL2RvbS9kYXRhc2V0LmpzXG5mdW5jdGlvbiB1c2VOYXRpdmUgKCkge1xuICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtYS1iJywgJ2MnKVxuXG4gIHJldHVybiBCb29sZWFuKGVsZW0uZGF0YXNldCAmJiBlbGVtLmRhdGFzZXQuYUIgPT09ICdjJylcbn1cblxuZnVuY3Rpb24gbmF0aXZlRGF0YXNldCAoZWxlbWVudCkge1xuICByZXR1cm4gZWxlbWVudC5kYXRhc2V0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdXNlTmF0aXZlKCkgPyBuYXRpdmVEYXRhc2V0IDogZWxlbWVudCA9PiB7XG4gIGNvbnN0IG1hcCA9IHt9XG4gIGNvbnN0IGF0dHJpYnV0ZXMgPSBlbGVtZW50LmF0dHJpYnV0ZXNcblxuICBmdW5jdGlvbiBnZXR0ZXIgKCkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlXG4gIH1cblxuICBmdW5jdGlvbiBzZXR0ZXIgKG5hbWUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKVxuICAgIH1cbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwLCBqID0gYXR0cmlidXRlcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2ldXG5cbiAgICBpZiAoYXR0cmlidXRlKSB7XG4gICAgICBjb25zdCBuYW1lID0gYXR0cmlidXRlLm5hbWVcblxuICAgICAgaWYgKG5hbWUuaW5kZXhPZignZGF0YS0nKSA9PT0gMCkge1xuICAgICAgICBjb25zdCBwcm9wID0gbmFtZS5zbGljZSg1KS5yZXBsYWNlKC8tLi9nLCB1ID0+IHtcbiAgICAgICAgICByZXR1cm4gdS5jaGFyQXQoMSkudG9VcHBlckNhc2UoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlLnZhbHVlXG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1hcCwgcHJvcCwge1xuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgZ2V0OiBnZXR0ZXIuYmluZCh7dmFsdWU6IHZhbHVlIHx8ICcnfSksXG4gICAgICAgICAgc2V0OiBzZXR0ZXIuYmluZChlbGVtZW50LCBuYW1lKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jbGFzcyBTdG9yYWdlIHtcbiAgc3RhdGljIGdldEluc3RhbmNlICgpIHtcbiAgICBTdG9yYWdlLmluc3RhbmNlID0gU3RvcmFnZS5pbnN0YW5jZSB8fCBuZXcgU3RvcmFnZSgpXG4gICAgcmV0dXJuIFN0b3JhZ2UuaW5zdGFuY2VcbiAgfVxuICBnZXQgKGtleSkge1xuICAgIGNvbnN0IGRhdGEgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KVxuICAgIHJldHVybiBkYXRhID8gSlNPTi5wYXJzZShkYXRhKSA6IGRhdGFcbiAgfVxuXG4gIHNldCAoa2V5LCBkYXRhKSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gIH1cblxuICBkZWwgKGtleSkge1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlXG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcInViZXJkb21cIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4xLjNcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIkEgc2V0IG9mIHNpbXBsZSBET00gZXh0ZW5zaW9ucyBtYWtlIGxpZmUgZWFzaWVyIGluIHRoZSBwb3N0LWpRdWVyeSBlcmEuXCIsXG4gIFwibWFpblwiOiBcImluZGV4LmpzXCIsXG4gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXG4gICAgXCJ1cmxcIjogXCJnaXQraHR0cHM6Ly9naXRodWIuY29tL2dhdm9qYS91YmVyZG9tLmdpdFwiXG4gIH0sXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwidWJlclwiLFxuICAgIFwiZG9tXCIsXG4gICAgXCJqcXVlcnlcIlxuICBdLFxuICBcImF1dGhvclwiOiBcIk1pY2hhbCBLb2NoZWxcIixcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwiYnVnc1wiOiB7XG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vZ2F2b2phL3ViZXJkb20vaXNzdWVzXCJcbiAgfSxcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9nYXZvamEvdWJlcmRvbSNyZWFkbWVcIixcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiYmFiZWwtY29yZVwiOiBcIl42LjI2LjNcIixcbiAgICBcImJhYmVsLXByZXNldC1lbnZcIjogXCJeMS43LjBcIixcbiAgICBcImJhYmVsaWZ5XCI6IFwiXjguMC4wXCIsXG4gICAgXCJicm93c2VyaWZ5XCI6IFwiXjE2LjIuMlwiLFxuICAgIFwicHVwcGV0ZWVyXCI6IFwiXjEuNy4wXCIsXG4gICAgXCJydW5uYVwiOiBcIl4yLjIuMVwiLFxuICAgIFwicnVubmEtd2Vic2VydmVyXCI6IFwiXjAuMS40XCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcInNlcnZlXCI6IFwicnVubmEtd2Vic2VydmVyIC13IC4vdGVzdC93d3dcIixcbiAgICBcInNlcnZlOnN0b3BcIjogXCJydW5uYS13ZWJzZXJ2ZXIgLXhcIixcbiAgICBcInNlcnZlOnJlbG9hZFwiOiBcInJ1bm5hLXdlYnNlcnZlciAtclwiLFxuICAgIFwidGVzdDpwdXBwZXRlZXJcIjogXCJub2RlIC4vdGVzdC90ZXN0LmpzXCIsXG4gICAgXCJidWlsZDpqc1wiOiBcImJyb3dzZXJpZnkgaW5kZXguanMgLW8gdGVzdC93d3cvdWJlcmRvbS5qcyAtdCBbIGJhYmVsaWZ5IC0tcHJlc2V0cyBbIGJhYmVsLXByZXNldC1lbnYgXSBdIC0tZGVidWcgdHJ1ZVwiLFxuICAgIFwiZGV2XCI6IFwicnVubmEgWyArc2VydmUgYnVpbGQ6anMgXSAtd1wiLFxuICAgIFwidGVzdFwiOiBcInJ1bm5hIFsgK3NlcnZlIGJ1aWxkOmpzIC0gdGVzdDpwdXBwZXRlZXIgLSBzZXJ2ZTpzdG9wIF1cIlxuICB9LFxuICBcIm9ic2VydmVcIjoge1xuICAgIFwiYnVpbGQ6anMgLSBzZXJ2ZTpyZWxvYWRcIjogW1xuICAgICAgXCJsaWIvKiovKi5qc1wiLFxuICAgICAgXCJpbmRleC5qc1wiXG4gICAgXSxcbiAgICBcInNlcnZlOnJlbG9hZFwiOiBbXG4gICAgICBcInRlc3Qvd3d3L2luZGV4Lmh0bWxcIlxuICAgIF1cbiAgfVxufVxuIl19
