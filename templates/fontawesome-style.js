;(function (window) {
  let svgSprite = '${svgSprite}'

  const ready = function (fn) {
    if (document.addEventListener) {
      if (~['complete', 'loaded', 'interactive'].indexOf(document.readyState)) {
        setTimeout(fn, 0)
      }
      else {
        const loadFn = function () {
          document.removeEventListener('DOMContentLoaded', loadFn, false)
          fn()
        }
        document.addEventListener('DOMContentLoaded', loadFn, false)
      }
    }
    else if (document.attachEvent) {
      IEContentLoaded(window, fn)
    }

    function IEContentLoaded(w, fn) {
      const d = w.document
      let done = false
      const init = function () {
        if (!done) {
          done = true
          fn()
        }
      }
      const polling = function () {
        try {
          d.documentElement.doScroll('left')
        }
        catch (e) {
          setTimeout(polling, 50)
          return
        }
        init()
      }
      polling()
      d.onreadystatechange = function () {
        if (d.readyState === 'complete') {
          d.onreadystatechange = null
          init()
        }
      }
    }
  }
  const before = function (el, target) {
    target.parentNode.insertBefore(el, target)
  }
  const prepend = function (el, target) {
    if (target.firstChild) {
      before(el, target.firstChild)
    }
    else {
      target.appendChild(el)
    }
  }

  function appendSvg() {
    let div, svg
    div = document.createElement('div')
    div.innerHTML = svgSprite
    svgSprite = null
    svg = div.querySelector('svg')
    if (svg) {
      svg.setAttribute('aria-hidden', 'true')
      svg.style.position = 'absolute'
      svg.style.width = 0
      svg.style.height = 0
      svg.style.overflow = 'hidden'
      prepend(svg, document.body)
    }
  }

  ready(appendSvg)
})(window)
