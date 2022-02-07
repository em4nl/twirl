# Twirl

⚠️ Under Construction ⚠️
Ajaxification engine. Not quite a frontend router. Somewhat similar
to turbo.

## known bugs/quirks

- expects global `ajax(url, callback)` function to be available,
  where url is a string and callback is a function with the
  parameters `error` and `responseText` and it returns an XHR
- throws TypeError when link with relative url is clicked
  -> better not have relative urls
