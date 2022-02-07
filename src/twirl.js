var preloadURL;
var preloadXHR;
var preloadRes;
var loadURL;
var loadXHR;
var enterCallbacks = Object.create(null);
var leaveCallbacks = Object.create(null);

/* NOTE
 * window.location reflects user intent;
 * after link click or popstate, window.location is set to the new
 * url immediately.
 * currentURL reflects actual twirl state;
 * it will only be changed after the load of a requested page is
 * complete. it's the page we're actually looking at as far as
 * twirl is concerned, minus any transitions.
 * */

var currentURL = new URL(window.location.href);

var localOrigin = currentURL.origin;
var preloadStartCallback;
var preloadEndCallback;
var loadStartCallback;
var loadEndCallback;

function isSameServerURL(urlA, urlB) {
  return (
    urlA.origin === urlB.origin &&
    urlA.pathname === urlB.pathname &&
    urlA.search === urlB.search
  );
}

function twirl(className, enterCallback) {
  enterCallbacks[className] = enterCallback;
}

function isCapturedURL(url) {
  return (
    url.origin === localOrigin &&
    (twirl.base
      ? url.pathname.slice(0, twirl.base.length) === twirl.base
      : true)
  );
}

function getClosestURLIfCaptured(event) {
  var a = event.target.closest("a");
  if (!a) return;
  var href = a.getAttribute("href");
  if (!href) return;
  var url = new URL(href);
  if (!isCapturedURL(url)) return;
  return url;
}

function hoverHandler(event) {
  event.preventDefault();
  var url = getClosestURLIfCaptured(event);
  if (!url) return;
  if (isSameServerURL(url, preloadURL)) return;
  if (preloadXHR) preloadXHR.abort();
  if (preloadRes) preloadRes = void 0;
  preloadURL = url;
  var lh = loadHandlerFactory();
  preloadXHR = ajax(preloadURL.href, lh.onLoad);
  lh.setXHR(preloadHXR);
  if (twirl.onPreloadStart) twirl.onPreloadStart();
}

function clickHandler(event) {
  var url = getClosestURLIfCaptured(event);
  if (!url) return;
  navigateTo(url);
}

function navigateTo(url) {
  if (isSameServerURL(url, currentURL)) {
    if (preloadXHR) preloadXHR.abort();
    if (loadXHR) loadXHR.abort();
    preloadURL = void 0;
    preloadXHR = void 0;
    preloadRes = void 0;
    loadURL = void 0;
    loadXHR = void 0;
    if (window.location.href !== url.href) {
      history.pushState(null, "", url.href);
    }
    return;
  }
  // pushState on load intention,
  // b/c popState also sets the url immediately
  history.pushState(null, "", url.href);
  event.preventDefault();
  if (loadURL && isSameServerURL(url, loadURL)) return;
  if (loadXHR) loadXHR.abort();
  loadURL = url;
  if (preloadURL && isSameServerURL(preloadURL, loadURL)) {
    loadXHR = preloadXHR;
    if (preloadRes) {
      var res = preloadRes;
      preloadRes = void 0;
      setTimeout(loadHandler.bind(null, loadXHR, null, res), 0);
      if (twirl.onLoadStart) twirl.onLoadStart();
      if (twirl.onLoadEnd) twirl.onLoadEnd();
    } else {
      if (twirl.onPreloadEnd) twirl.onPreloadEnd();
      if (twirl.onLoadStart) twirl.onLoadStart();
    }
  } else {
    // TODO why do we assume here that preload is running?
    // oh maybe b/c it would have been triggered by the hover event
    // before this but I just dispatched a click ... ah shit
    if (!preloadRes) {
      if (preloadXHR) preloadXHR.abort();
      if (twirl.onPreloadEnd) twirl.onPreloadEnd();
    } else {
      preloadRes = void 0;
    }
    var lh = loadHandlerFactory();
    loadXHR = ajax(loadURL.href, lh.onLoad);
    lh.setXHR(loadXHR);
    if (twirl.onLoadStart) twirl.onLoadStart();
  }
  preloadURL = void 0;
  preloadXHR = void 0;
}

function loadHandler(xhr, err, resText) {
  if (xhr === preloadXHR) {
    if (err) {
      preloadURL = void 0;
      preloadXHR = void 0;
    } else {
      preloadRes = resText;
    }
    if (twirl.onPreloadEnd) twirl.onPreloadEnd();
    return;
  }
  if (twirl.onLoadEnd) twirl.onLoadEnd();
  if (err) {
    if (twirl.onLoadError) twirl.onLoadError(xhr, resText);
    else alert("load error :(");
    return;
  }
  var doc = document.createDocumentFragment();
  doc.innerHTML = resText;
  loadURL = void 0;
  loadXHR = void 0;
  // TODO merge head:
  // - title
  // - description
  // - og/twitter meta tags
  // TODO maybe indeed add a mechanism for
  // leave callbacks
  // NO! i had that and deleted it again.
  // I strongly feel this library has now about reached its maximum
  // tolerable complexity. The <head> merging has yet to be
  // implemented && shall be the last thing I add. Transition/
  // animation logic will have to live somewhere else.
  var body = doc.querySelector("body");
  if (!body) return;
  if (dispatchEnter(body)) return;
  document.body = body;
  if (twirl.catchAll) twirl.catchAll(body);
}

function dispatchEnter(body, passBody) {
  if (typeof passBody === "undefined") passBody = true;
  for (var i = 0; i < body.classList.length; i++) {
    if (body.classList[i] in enterCallbacks) {
      enterCallbacks[body.classList[i]](passBody && body);
      return true;
    }
  }
  return false;
}

function loadHandlerFactory() {
  var xhr;
  function setXHR(x) {
    xhr = x;
  }
  function onLoad(err, resText) {
    loadHandler(xhr, err, resText);
  }
  return { setXHR: setXHR, onLoad: onLoad };
}

function popstateHandler(event) {
  navigateTo(new URL(window.location.href));
}

twirl.start = function () {
  dispatchEnter(document.body, false);
};

// base
// onPreloadStart
// onPreloadEnd
// onLoadStart
// onLoadEnd
// onLoadError
// catchAll
// start

document.addEventListener("touchstart", hoverHandler);
document.addEventListener("mouseenter", hoverHandler);
document.addEventListener("click", clickHandler);
window.addEventListener("popstate", popstateHandler);

window.twirl = twirl;
