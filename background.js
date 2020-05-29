chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.action) {
      case "scrape":
        fetch(request.url)
          .then(response => response.text())
          .then(text => sendResponse(text));
        return true;
        break;
    }
  });