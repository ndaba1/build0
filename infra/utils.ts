export const cloudfrontFunctionCode = `\
async function handler(event) {
    event.request.headers["x-forwarded-host"] = event.request.headers.host;
  
  function getHeader(key) {
    var header = event.request.headers[key];
    if (header) {
      if (header.multiValue) {
        return header.multiValue.map((header) => header.value).join(",");
      }
      if (header.value) {
        return header.value;
      }
    }
    return "";
  }
  var cacheKey = "";
  if (event.request.uri.startsWith("/_next/image")) {
    cacheKey = getHeader("accept");
  } else {
    cacheKey =
      getHeader("rsc") +
      getHeader("next-router-prefetch") +
      getHeader("next-router-state-tree") +
      getHeader("next-url") +
      getHeader("x-prerender-revalidate");
  }
  if (event.request.cookies["__prerender_bypass"]) {
    cacheKey += event.request.cookies["__prerender_bypass"]
      ? event.request.cookies["__prerender_bypass"].value
      : "";
  }
  var crypto = require("crypto");
  
  var hashedKey = crypto.createHash("md5").update(cacheKey).digest("hex");
  event.request.headers["x-open-next-cache-key"] = { value: hashedKey };
  
  
  if(event.request.headers["cloudfront-viewer-city"]) {
    event.request.headers["x-open-next-city"] = event.request.headers["cloudfront-viewer-city"];
  }
  if(event.request.headers["cloudfront-viewer-country"]) {
    event.request.headers["x-open-next-country"] = event.request.headers["cloudfront-viewer-country"];
  }
  if(event.request.headers["cloudfront-viewer-region"]) {
    event.request.headers["x-open-next-region"] = event.request.headers["cloudfront-viewer-region"];
  }
  if(event.request.headers["cloudfront-viewer-latitude"]) {
    event.request.headers["x-open-next-latitude"] = event.request.headers["cloudfront-viewer-latitude"];
  }
  if(event.request.headers["cloudfront-viewer-longitude"]) {
    event.request.headers["x-open-next-longitude"] = event.request.headers["cloudfront-viewer-longitude"];
  }

  if (headers.cookie) {
        var cookies = headers.cookie[0].value;

        // Parse cookies into an array
        var cookieArray = cookies.split(';').map(cookie => cookie.trim());

        // Object to store the latest value for each unique cookie
        var uniqueCookies = {};

        // Iterate over cookies to find Cognito duplicates
        for (var i = 0; i < cookieArray.length; i++) {
            var [key, value] = cookieArray[i].split('=');
            if (key && value) {
                // Always keep the last occurrence of a cookie
                uniqueCookies[key] = value;
            }
        }

        // Reconstruct the Cookie header
        var deduplicatedCookies = Object.entries(uniqueCookies)
            .map(([key, value]) => key + '=' + value)
            .join('; ');

        // Update the Cookie header
        headers.cookie[0].value = deduplicatedCookies;
    }
      
    
    return event.request;
}`;
