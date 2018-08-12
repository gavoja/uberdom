'use strict'

require('./lib/closest.js')

const dataset = require('./lib/polyfills/dataset.js')
const cookies = require('./lib/cookies.js').getInstance()
const storage = require('./lib/cookies.js').getInstance()
const pack = require('./package.json')
const ajax = require('./lib/ajax.js')

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

const event = function (name) {
  const event = document.createEvent('Event')
  event.initEvent(name, true, true)
  return event
}

const trigger = function (name, args) {
  const ev = event(name)
  args && Object.keys(args).forEach(key => {
    ev[key] = args[key]
  })
  this.dispatchEvent(ev)
}

const create = function (htmlString) {
  const div = document.createElement('div')
  div.innerHTML = htmlString.trim()

  const kids = div.kids()

  return kids.length === 1 ? kids[0] : kids
}

const next = function () {
  return this.nextElementSibling || EMPTY
}

const prev = function () {
  return this.previousElementSibling || EMPTY
}

const addTo = function (el) {
  el.appendChild(this)
}

const addAfter = function (el) {
  if (el.next().isEmpty) {
    return this.addTo(el.dad())
  }

  this.addBefore(el.next())
}

const addBefore = function (el) {
  el.dad().insertBefore(this, el)
}

//
// Initialization.
//

if (!window.u) {
  const p = window.Element.prototype

  p.find = find
  p.find1 = find1
  p.dad = dad
  p.kids = kids
  p.on = on
  p.off = off
  p.index = index
  p.data = data
  p.trigger = trigger
  p.inDom = inDom
  p.del = del
  p.next = next
  p.prev = prev
  p.addTo = addTo
  p.addAfter = addAfter
  p.addBefore = addBefore

  window.document.find1 = find1
  window.document.find = find
  window.document.on = on
  window.document.off = off

  window.on = on
  window.off = off

  window.u = {
    version: pack.version,
    cookies,
    storage,
    ajax,
    create,
    event,
    find: selector => document.find(selector),
    find1: selector => document.find1(selector)
  }
}

module.exports = window.udom
