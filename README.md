# Über  DOM

## Introduction

A set of simple DOM extensions make life easier in the post-jQuery era. Fast, small and supports IE11+.

## API reference

### Manipulation

* `u.find(selector)` and `el.find(selector)`

  Similar to `querySelectorAll()`. Returns a plain list of extended elements so all lambdas work (i.e. `forEach`, `map`, `filter`, etc).

* `u.find1(selector)` and `el.find(selector)`

  Similar to `Element.querySelector()`. Returns an extended element or `<empty>` element if nothing found to avoid unnecessary null checks.

* `el.dad()`

  Returns extended parent element or `<empty>` if no parent found.

* `el.dad(selector)`

  Similar to `Element.closest(selector)`. Returns extended element.

* `el.kids()`

  Returns plain list of child extended elements.

* `el.index()`

  Returns index of the current element.

* `el.del()`

  Removes element.

* `el.inDom()`

  Returns `true` if element is in DOM.

* `el.addTo(el)`

  TODO

* `el.addAfter(el)`

  TODO

* `el.addBefore(el)`

  TODO

* `el.data(name)`

  Returns the value of the data attibute. The name uses camelCase notation, which translates to a hyphen-separated attribute name (i.e. `el.data('fooBar') will return the value of `data-foo-bar` attribute). Numeric and boolean strings are converted to the appropriate JavaScript primitives.

* `el.data(name, value)`

  Sets the data attribute. Note that attributes are strings only; for objects `JSON.stringify()` should be used.

* `u.create(htmlString)`

  Creates extended element or list of extended elements from string.

### Events

* `el.on(eventName [, selector],  listener)`

  Binds event listener - sort of like `Element.addEventListener(eventName, listener, true)`. An optional selector will filter the descendants of the selected element that trigger the event. If the selector omitted, the event is always triggered when it reaches the selected element.

* `el.off (eventName, listener)`

  Removes event listener.

* `el.trigger (eventName, args)`

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