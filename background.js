chrome.runtime.onInstalled.addListener(() => {
  chrome.scripting.registerContentScripts([{
    id: "modifyTowsonText",
    matches: ["https://csprd.towson.edu/*"],
    js: ["content.js"],
    runAt: "document_idle"
  }]);
});
