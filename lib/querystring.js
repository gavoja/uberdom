'use strict'

class QueryString {
  parse (queryString) {
    const args = queryString ? queryString.split('&') : []
    const obj = {}

    for (let arg of args) {
      arg = window.decodeURIComponent(arg)

      // Default is boolean (no equal sign).
      let key = arg
      let value = true

      // Get value if exists.
      if (arg.indexOf('=') !== -1) {
        [key, value] = arg.split('=')
      }

      if (!isNaN(value) && typeof value !== typeof true) {
        value = Number(value)
      } else if (value === 'true' || value === 'false') {
        value = value === 'true'
      }

      // Assign value.
      if (obj[key]) {
        if (!obj[key].push) {
          obj[key] = [obj[key]]
        }
        obj[key].push(value)
      } else {
        obj[key] = value
      }
    }

    return obj
  }

  stringify (obj) {
    const arr = []
    for (let key of Object.keys(obj)) {
      const value = obj[key]

      if (value.constructor === Array) {
        for (let v of value) {
          arr.push(`${key}=${window.encodeURIComponent(v)}`)
        }
      } else if (value === true) {
        arr.push(key)
      } else {
        arr.push(`${key}=${window.encodeURIComponent(value)}`)
      }
    }

    return arr.join('&')
  }
}

module.exports = QueryString
