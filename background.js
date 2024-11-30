import getClassroom from "./database.js";

let storedLink = null;

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'storeLink') {
        storedLink = request.url;  // Store the link
    }

    if (request.type === 'getDatabaseData') {
        const roomNumber = request.roomNumber;
        getClassroom(roomNumber).then((classroom) => {
            sendResponse({ classroom });
        })
        .catch((error) => {
            sendResponse({ error: error.message });
        });

        return true;
    }
});

// Function to get the stored link when the popup requests it
chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(request) {
        if (request.action === 'getLink' && storedLink) {
            port.postMessage({ action: 'displayLink', url: storedLink });
        }
    });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.scripting.registerContentScripts([{
    id: "modifyTowsonText",
    matches: ["https://csprd.towson.edu/*"],
    js: ["content.js"],
    runAt: "document_idle"
  }]);
});

