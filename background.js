let storedLink = null;

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'storeLink') {
        storedLink = request.url;  // Store the link
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



