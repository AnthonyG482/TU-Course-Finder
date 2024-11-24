// Listen for a connection from the background script
const port = chrome.runtime.connect();

port.postMessage({ action: 'getLink' });

port.onMessage.addListener(function(response) {
    if (response.action === 'displayLink' && response.url) {
        const linkContainer = document.getElementById('map-link-container');

        const link = document.createElement('a');
        link.href = response.url;
        link.target = '_blank';
        link.textContent = 'View on Google Maps';

        linkContainer.innerHTML = '';
        linkContainer.appendChild(link);
    }
});
