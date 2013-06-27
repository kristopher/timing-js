#### Paste this into console and try it out.

```javascript
;(function() {
  var t = document.createElement('script');
  t.type = 'text/javascript';
  t.src = 'https://raw.github.com/kristopher/timing-js/master/timing.js';
  t.addEventListener('load', function() {
    console.log(Timing.log());
  })
  document.body.appendChild(t);
}).call(window);
```