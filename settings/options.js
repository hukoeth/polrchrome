function saveOptions(e) {
  e.preventDefault();
  if (document.querySelector("#polrurl").value.endsWith("/")) {
    document.querySelector("#polrurl").value=document.querySelector("#polrurl").value.slice(0, -1)
  };
  chrome.storage.sync.set({
    polrurl: document.querySelector("#polrurl").value,
    polrapikey:  document.querySelector("#apikey").value
  });
  document.querySelector('#saved').style.display = "inline";
}

function restoreOptions() {
  function setCurrentSettings(result) {
    document.querySelector("#polrurl").value = result.polrurl || "";
    document.querySelector("#apikey").value = result.polrapikey || "";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  chrome.storage.sync.get(["polrurl","polrapikey"], setCurrentSettings);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions); 
