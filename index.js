'use strict'

require('./lib/polyfills/closest')

const dataset = require('./lib/polyfills/dataset')
const cookies = require('./lib/cookies').getInstance()
const storage = require('./lib/storage').getInstance()
const pack = require('./package.json')
const ajax = require('./lib/ajax')

function init () {
  if (window.u) {
    return window.u
  }

  //
  // Declarations.
  //

  var u
  var ext = {}

  //
  // Definition of extensions.
  //

  ext.find = function (selector) {
    return Array.prototype.slice.call(this.querySelectorAll(selector)).map(el => u(el))
  }

  ext.find1 = function (selector) {
    return u(this.querySelector(selector) || u._empty)
  }

  ext.kids = function () {
    return Array.prototype.slice.call(this.children).map(el => u(el))
  }

  ext.dad = function (selector) {
    var result = selector ? this.closest(selector) : this.parentElement
    return u(result || u._empty)
  }

  ext.next = function () {
    return u(this.nextElementSibling || u._empty)
  }

  ext.prev = function () {
    return u(this.previousElementSibling || u._empty)
  }

  ext.index = function () {
    return this.dad().kids().indexOf(this)
  }

  ext.data = function (key, value) {
    if (!key) {
      // Always return a copy
      return JSON.parse(JSON.stringify(dataset(this)))
    }

    // Set the value
    if (value !== undefined) {
      dataset(this)[key] = value
      return
    }

    // Convert boolean and numeric values
    var result = dataset(this)[key]
    var isNumericOrBoolean = result && (result === 'true' || result === 'false' || !isNaN(result))
    return isNumericOrBoolean ? JSON.parse(result) : result
  }

  ext.addTo = function (el) {
    return u(el.appendChild(this))
  }

  ext.addAfter = function (el) {
    el = u(el)
    if (el.next().isEmpty) {
      return this.addTo(el.dad())
    }

    return this.addBefore(el.next())
  }

  ext.addBefore = function (el) {
    el = u(el)
    return u(el.dad().insertBefore(this, el))
  }

  ext.empty = function () {
    while (this.firstChild) {
      this.removeChild(this.firstChild)
    }
  }

  ext.del = function () {
    this.dad().removeChild(this)
  }

  ext.on = function (eventName, arg1, arg2) {
    var selector = typeof arg1 === 'string' ? arg1 : null
    var listener = arg2 || arg1

    if (!selector) {
      this.addEventListener(eventName, event => listener(u._wrapEventTargets(event)), true)
      return this
    }

    // In this case it is not possible to remove the listener.
    this.addEventListener(eventName, (event) => {
      var target = u._getTarget(event, selector)
      target && listener(u._wrapEventTargets(event), target)
    }, true)

    return this
  }

  ext.off = function (eventName, listener) {
    this.removeEventListener(eventName, listener, true)
    return this
  }

  ext.trigger = function (name, args) {
    var ev = u.newEvent(name)
    args && Object.keys(args).forEach(key => {
      ev[key] = args[key]
    })
    this.dispatchEvent(ev)
  }

  //
  // Definition of u object.
  //

  u = function (el) {
    Object.getOwnPropertyNames(ext).forEach(methodName => {
      el[methodName] = ext[methodName].bind(el)
    })

    return el
  }

  Object.defineProperty(u, 'wnd', { get () { return u(window) } })
  Object.defineProperty(u, 'doc', { get () { return u(window.document) } })
  Object.defineProperty(u, 'html', { get () { return u(window.document.documentElement) } })

  u.version = pack.version
  u.loc = window.location
  u.cookies = cookies
  u.storage = storage
  u.ajax = ajax
  u.find = u.doc.find
  u.find1 = u.doc.find1
  u._empty = document.createElement('empty')
  u._empty.isEmpty = true
  u._ext = ext

  u.newEvent = function (name) {
    var event = document.createEvent('Event')
    event.initEvent(name, true, true)
    return event
  }

  u.create = function (htmlString) {
    var div = u(document.createElement('div'))
    div.innerHTML = htmlString.trim()
    var kids = div.kids()
    return kids.length === 1 ? kids[0] : kids
  }

  u._getTarget = function (event, sel) {
    var t = event.target
    while (t !== event.currentTarget) {
      if (t.matches(sel)) {
        return u(t)
      }

      t = t.parentElement
    }

    return null
  }

  u._wrapEventTargets = function (event) {
    event.currentTarget && u(event.currentTarget)
    event.target && u(event.target)
    event.relatedTarget && u(event.relatedTarget)
    return event
  }

  //
  // Return value.
  //

  window.u = u
  return window.u
}

module.exports = init()
