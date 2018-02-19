# Über  DOM

## Introduction

A set of simple DOM extensions make life easier in the post-jQuery era.

Features:
* fast,
* small,
* supports IE11+.

## API

### Manipulation

* `document.find(selector)`

  Similar to `document.querySelectorAll()`, however returns a plain list so that all labdas work (i.e. `forEach`, `map`, `filter`, etc).

* `document.find1 (selector)`

  Similar to `document.querySelector` however returns an `<empty>` element if nothing found to avoid unnecessary null checks.

* `Element.dad()`

  Returns parent element or `<empty>` element.

* `Element.kids()`

  Returns plain list of child elements.

* `Element.index()`

  Returns index of the current element.

* `Element.del()`

  Removed element.

* `Element.inDom ()`

  Returns `true` if element is in DOM.

* `Element.data(name)`

  Returns the value of the data attibute. The name uses camelCase notation, which translates to a hyphen-separated attribute name (i.e. `el.data('fooBar') will return the value of `data-foo-bar` attribute). Numeric and boolean strings are converted to the appropriate JavaScript primitives.

* `Element.data(name, value)`

  Sets the data attribute. Note that attributes are strings only; for objects `JSON.stringify()` should be used.

### Events

* `Element.on(eventName [, selector],  listener)`

  Binds event listener - sort of like `Element.addEventListener(eventName, listener, true)`. An optional selector will filter the descendants of the selected element that trigger the event. If the selector omitted, the event is always triggered when it reaches the selected element.

* `Element.off (eventName, listener)`

  Removes event listener.

* `window.newEvent (eventName)`

  Creates new event.

* `Element.trigger (eventName, args)`

  Triggers an event on element passing arguments.

### Cookies

* `udom.cookies.get (name)`

* `udom.cookies.set (name, value, time)`

* `udom.cookies.del (name)`

* `udom.cookies.has (name)`

## Examples

### Resolving attribute

WIP

### Event handling on dynamically added elements

WIP
