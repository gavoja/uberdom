# Über  DOM

## Introduction

A set of simple DOM extensions make life easier in the post-jQuery era. Fast, small and supports IE11+.

## API reference

### Manipulation

* `u.find(selector)` and `document.find(selector)`

  Like `document.querySelectorAll()`, but returns a plain list so all lambdas work (i.e. `forEach`, `map`, `filter`, etc).

* `Element.find(selector)`

  Like `Element.querySelectorAll()`, but returns a plain list so all lambdas work (i.e. `forEach`, `map`, `filter`, etc).

* `u.find1(selector)` and alias of `document.find1(selector)`

  Like `document.querySelector()`, but returns an `<empty>` element if nothing found to avoid unnecessary null checks.

* `Element.find1(selector)`

  Like `Element.querySelector()`, but returns an `<empty>` element if nothing found to avoid unnecessary null checks.

* `Element.dad()`

  Returns parent element or `<empty>` if no parent found.

* `Element.closest(selector)`

  Polyfill for the [standard functionality](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest) to give IE11 some love.

* `Element.kids()`

  Returns plain list of child elements.

* `Element.index()`

  Returns index of the current element.

* `Element.del()`

  Removes element.

* `Element.inDom()`

  Returns `true` if element is in DOM.

* `Element.addTo(el)`

  TODO

* `Element.addAfter(el)`

  TODO

* `Element.addBefore(el)`

  TODO

* `Element.data(name)`

  Returns the value of the data attibute. The name uses camelCase notation, which translates to a hyphen-separated attribute name (i.e. `el.data('fooBar') will return the value of `data-foo-bar` attribute). Numeric and boolean strings are converted to the appropriate JavaScript primitives.

* `Element.data(name, value)`

  Sets the data attribute. Note that attributes are strings only; for objects `JSON.stringify()` should be used.

* `u.create(htmlString)`

  Creates element from string.

### Events

* `Element.on(eventName [, selector],  listener)`

  Binds event listener - sort of like `Element.addEventListener(eventName, listener, true)`. An optional selector will filter the descendants of the selected element that trigger the event. If the selector omitted, the event is always triggered when it reaches the selected element.

* `Element.off (eventName, listener)`

  Removes event listener.

* `Element.trigger (eventName, args)`

  Triggers an event on element passing arguments.

* `u.event (eventName)`

  Creates new event.

### Cookies

* `u.cookies.get (name)`

* `u.cookies.set (name, value, time)`

* `u.cookies.del (name)`

* `u.cookies.has (name)`

### Ajax

* `u.ajax (url, callback)`

* `u.ajax (args, callback)`

## Examples

### Resolving attribute

WIP

### Creating an element

WIP

### Creating multiple elements

WIP

### Event handling on dynamically added elements

WIP

### AJAX GET call

```
u.ajax('http://foo', (err, req) => {
  if (!err) {
    console.log(req.json())
  }
})
```

### AJAX POST call

WIP