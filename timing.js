////////////////////////////////////////////////////////////////////////////////
// Timing
//
// https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html
//
// W3C Navigation Timing
//   navigationStart
//   unloadEventStart
//   unloadEventEnd
//   redirectStart
//   redirectEnd
//   fetchStart
//   domainLookupStart
//   domainLookupEnd
//   connectStart
//   connectEnd
//   secureConnectionStart
//   requestStart
//   responseStart
//   responseEnd
//   domLoading
//   domInteractive
//   domContentLoadedEventStart
//   domContentLoadedEventEnd
//   domComplete
//   loadEventStart
//   loadEventEnd
//
////////////////////////////////////////////////////////////////////////////////

var Timing = (function() {
    var performance_implemented = typeof window.performance !== 'undefined',
        timing_implemented      = (performance_implemented && typeof window.performance.timing !== 'undefined'),
        navigation_implemented  = (performance_implemented && typeof window.performance.navigation !== 'undefined');

    function warn(message) {
      if ((window.hasOwnProperty('console')) && (console.warn)) {
        console.warn(message);
      }
    }

    if (performance_implemented) {
      if (!timing_implemented) {
        warn('window.performance.timing is not implement.');
      }
      if (!navigation_implemented) {
        warn('window.performance.navigation is not implement.');
      }
    } else {
      warn('window.performance is not implement.');
    }

    var navigationType;
    if (navigation_implemented) {
      switch(window.performance.navigation.type) {
        case 0:
          navigationType = 'navigation';
        case 1:
          navigationType = 'reload';
        case 2:
          navigationType = 'history';
        case 255:
          navigationType = 'unknown';
      }
    }

    var redirects;
    if (navigation_implemented) {
      redirects = window.performance.navigation.redirectCount;
    }

    var now, now_is_native = false;
    if (performance_implemented) {
      // NOTE Chrome's hasOwnProperty returns false for now.
      if (typeof window.performance.now === 'function') {
        now = function() {
          return window.performance.now();
        }
        now_is_native = true;
      } else if (typeof window.performance.webkitNow === 'function') {
        now = function() {
          return window.performance.webkitNow();
        }
        now_is_native = true;
      }
    }
    if (!now) {
      warn('window.performance.now is not implemented, using Date.now');

      now = function() {
        return Date.now();
      }
    }

    function ready() {
      return (document.readyState === 'complete');
    }

    // Usage
    //   timeMS(function() { ... }, this, arg1, ...);
    //
    function timeMS(block, binding) {
      var start,
          args = Array.prototype.slice.call(arguments, 2);

      if (arguments.length === 1) {
        binding = window;
      }

      start = now();

      block.apply(binding, args);

      return (now() - start);
    }

    function time(block, binding) {
      return timeMS.apply(this, arguments) / 1000;
    }

    function get(key) {
      if (timing_implemented) {
        if (!ready()) {
          // Throwing an error might be better.
          warn('document is not loaded yet, timing for some segments may be incorrect.');
        }
        return window.performance.timing[key];
      }
    }

    function timing(start, end) {
      if (timing_implemented) {
        var t0 = get(start), t1 = get(end);
        if (t0 && t1) {
          return (t1 - t0) / 1000;
        }
      }
    }

    function fromSameOrigin() {
      return ((get('unloadEventStart') !== 0) && (get('unloadEventEnd') !== 0));
    }

    function real() {
      return timing('navigationStart', 'loadEventEnd');
    }

    function total() {
      return timing('fetchStart', 'loadEventEnd');
    }

    function network() {
      return timing('fetchStart', 'responseEnd');
    }

    function redirect() {
      return timing('redirectEnd', 'redirectStart');
    }

    function download() {
      return timing('responseStart', 'responseEnd');
    }

    function application() {
      return timing('requestStart', 'responseEnd');
    }

    function dns() {
      return timing('domainLookupStart', 'domainLookupEnd');
    }

    function tcp() {
      return timing('connectStart', 'connectEnd');
    }

    function ssl() {
      return timing('secureConnectionStart', 'connectEnd');
    }

    function request() {
      return timing('requestStart', 'responseStart');
    }

    function response() {
      return timing('responseStart', 'responseEnd');
    }

    function parse() {
      return timing('domLoading', 'domInteractive');
    }

    function external() {
      var d = dom(), p = parse();
      if ((d !== undefined) && (p !== undefined)) {
        return dom() - parse();
      }
    }

    function dom() {
      return timing('domLoading', 'domComplete');
    }

    function load() {
      return timing('loadEventStart', 'loadEventEnd');
    }

    function domContentLoad() {
      return timing('domContentLoadedEventStart', 'domContentLoadedEventEnd');
    }

    function unload() {
      return timing('unloadEventStart', 'unloadEventEnd');
    }

    function timeToFirstByte() {
      return timing('fetchStart', 'responseStart');
    }

    function timeToLastByte() {
      return timing('fetchStart', 'responseEnd');
    }

    function timeToInteractive() {
      return timing('fetchStart', 'domInteractive');
    }

    function timeToDomComplete() {
      return timing('fetchStart', 'domComplete');
    }

    function timeToDomReady() {
      return timing('fetchStart', 'domContentLoadedEventEnd');
    }

    function pp(f) {
      var value = f.call(this);
      if (value === undefined) {
        value = 'N/A';
      } else {
        value = value.toFixed(3)  + 's';
      }
      return value + "\n"
    }

    function log() {
      var output = "\n";
      output += "Timings\n";
      output += "-----------------------------\n";
      output += "               Network " + pp(network);
      output += "              Download " + pp(download);
      output += "           Application " + pp(application);
      output += "                 Parse " + pp(parse);
      output += "       External Assets " + pp(external);
      output += "              Document " + pp(dom);
      output += "\n"
      output += "    Time to First Byte " + pp(timeToFirstByte);
      output += "   Time to Interactive " + pp(timeToInteractive);
      output += "Time to Document Ready " + pp(timeToDomReady);
      output += "    Total Time to Load " + pp(total);

      return output;
    }


    public_methods = {
      ready: ready,
      now: now,
      now_is_native: now_is_native,
      timeMS: timeMS,
      time: time,
      measure: time,
      get: get,
      timing: timing,
      navigationType: navigationType,
      redirects: redirects,
      fromSameOrigin: fromSameOrigin,
      real: real,
      total: total,
      network: network,
      redirect: redirect,
      download: download,
      application: application,
      dns: dns,
      tcp: tcp,
      ssl: ssl,
      request: request,
      response: response,
      parse: parse,
      external: external,
      dom: dom,
      load: load,
      domContentLoad: domContentLoad,
      unload: unload,
      timeToFirstByte: timeToFirstByte,
      ttfb: timeToFirstByte,
      timeToLastByte: timeToLastByte,
      ttlb: timeToLastByte,
      timeToInteractive: timeToInteractive,
      tti: timeToInteractive,
      timeToDomComplete: timeToDomComplete,
      ttdc: timeToDomComplete,
      timeToDomReady: timeToDomReady,
      ttdr: timeToDomReady,
      timeToLoad: total,
      ttl: total,
      fromSameOrigin: fromSameOrigin,
      log: log
    }

  return public_methods;

}).call({});
