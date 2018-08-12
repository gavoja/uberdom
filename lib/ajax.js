const DEFAULT_TIMEOUT = 10000

function ajax (args, callback) {
  const req = new window.XMLHttpRequest()
  const url = args.url || args
  const method = args.method || 'GET'
  const isAsync = !args.sync
  const headers = args.headers || []

  headers.forEach(h => req.setRequestHeader(h.header, h.value))

  req.json = function () {
    const text = this.responseText || null
    return JSON.parse(text)
  }

  req.ontimeout = () => callback(new Error(`XHR timed out: ${url}`), req)
  req.onerror = () => callback(new Error(`XHR ${req.status} error: ${url}`), req)
  req.onload = function () {
    if (req.status >= 400) {
      return req.onerror()
    }

    callback(null, req)
  }

  req.open(method, url, isAsync, args.user, args.pass)
  if (isAsync) {
    // Needs to happen after open due to IE11 bug
    // https://github.com/stephanebachelier/superapi/issues/5
    req.timeout = args.timeout || DEFAULT_TIMEOUT
  }

  req.send(null)

  return req
}

module.exports = ajax
