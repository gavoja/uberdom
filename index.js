'use strict'

require('./lib/closest.js')

const dataset = require('./lib/polyfills/dataset.js')
const Cookies = require('./lib/cookies.js')
const pack = require('./package.json')

// Empty element.
const EMPTY = document.createElement('empty')
EMPTY.isEmpty = true

//
// Manipulation.
//

const find = function (selector) {
  return Array.prototype.slice.call(this.querySelectorAll(selector))
}

const find1 = function (selector) {
  return this.querySelector(selector) || EMPTY
}

const kids = function () {
  return Array.prototype.slice.call(this.children)
}

const dad = function () {
  return this.parentElement || EMPTY
}

const index = function () {
  return this.dad().kids().indexOf(this)
}

const inDom = function () {
  return window.document.body.contains(this)
}

const del = function () {
  this.dad().removeChild(this)
}

const data = function (key, value) {
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
  let result = dataset(this)[key]
  let isNumericOrBoolean = result && (result === 'true' || result === 'false' || !isNaN(result))
  return isNumericOrBoolean ? JSON.parse(result) : result
}

//
// Events
//

const getTarget = function (event, sel) {
  let t = event.target
  while (t !== event.currentTarget) {
    if (t.matches(sel)) {
      return t
    }

    t = t.parentElement
  }

  return null
}

const on = function (eventName, arg1, arg2) {
  const selector = typeof arg1 === 'string' ? arg1 : null
  const listener = arg2 || arg1

  if (!selector) {
    this.addEventListener(eventName, listener, true)
    return this
  }

  // In this case it is not possible to remove the listener.
  this.addEventListener(eventName, (event) => {
    const target = getTarget(event, selector)
    target && listener(event, target)
  }, true)

  return this
}

const off = function (eventName, listener) {
  this.removeEventListener(eventName, listener, true)
  return this
}

const newEvent = function (name) {
  const event = document.createEvent('Event')
  event.initEvent(name, true, true)
  return event
}

const trigger = function (name, args) {
  const event = newEvent(name)
  args && Object.keys(args).forEach(key => {
    event[key] = args[key]
  })
  this.dispatchEvent(event)
}

//
// Initialization.
//

if (!window.udom) {
  window.udom = {
    version: pack.version,
    cookies: new Cookies()
  }

  window.Element.prototype.find = find
  window.Element.prototype.find1 = find1
  window.Element.prototype.dad = dad
  window.Element.prototype.kids = kids
  window.Element.prototype.on = on
  window.Element.prototype.off = off
  window.Element.prototype.index = index
  window.Element.prototype.data = data
  window.Element.prototype.trigger = trigger
  window.Element.prototype.inDom = inDom
  window.Element.prototype.del = del
  window.document.find1 = find1
  window.document.find = find
  window.document.on = on
  window.document.off = off

  window.newEvent = newEvent
  window.on = on
  window.off = off
}
