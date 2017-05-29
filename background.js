chrome.contextMenus.create({
  id: "shortenpriv",
  title: "Generate private short URL",
  contexts: ["link"]
});

chrome.contextMenus.create({
  id: "shortenpub",
  title: "Generate public short URL",
  contexts: ["link"]
});

var portFromCS;

function connected(p) {
  portFromCS = p;
}

chrome.runtime.onConnect.addListener(connected);

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "shortenpriv":
      shortenURL(false, info.linkUrl);
      break;
    case "shortenpub":
      shortenURL(true, info.linkUrl);
      break;
  }
});

function shortenURL(isPublic, orgURL) {
  function setCurrentSettings(result) {
    if ((!result.polrurl.startsWith("http://") && !result.polrurl.startsWith("https://")) || result.polrapikey == "") {
      var openingPage = chrome.runtime.openOptionsPage();
      return;
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() {
      var publictext = "private";
      var titleText = "- Short URL";
      var shortURL = this.responseText;
      var bodyText = "The "+publictext+" short URL for "+orgURL+"hast been copied to the clipboard\r\n("+shortURL+")";
      if (!shortURL.startsWith("http://") && !shortURL.startsWith("https://"))
      {
        titleText = "- Error";
        bodyText = "An error ocurred. The server responded: "+shortURL;
      }
      else {
        portFromCS.postMessage({shortURL: shortURL});
      }
      if (isPublic) publictext = "public";
      var opt = {
        type: "basic",
        title: "Polrchrome "+titleText,
        message: bodyText,
        iconUrl: chrome.extension.getURL("icons/icon-32.png")
      }
      chrome.notifications.create("polrchrome", opt, function(){});
    });
    oReq.addEventListener("error", function() {
      var opt = {
        type: "basic",
        title: "Polrchrome Error",
        message: "An error ocurred. The server responded: "+this.responseText,
        iconUrl: chrome.extension.getURL("icons/icon-32.png")
      }
      chrome.notifications.create("polrchrome", opt, function(){});
    });
    oReq.open("GET", result.polrurl+"/api/v2/action/shorten?key="+result.polrapikey.trim()+"&url="+encodeURIComponent(orgURL)+"&is_secret="+!isPublic);
    oReq.send();  
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  chrome.storage.sync.get(["polrurl","polrapikey"],setCurrentSettings);
}
