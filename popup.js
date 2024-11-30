const port = chrome.runtime.connect();

port.postMessage({ action: 'getLink' });

port.onMessage.addListener(function(response) {
    if (response.action === 'displayLink' && response.url) {
        const linkContainer = document.getElementById('map-link-container');

        // Check if the link already exists before adding a new one
        let existingLink = linkContainer.querySelector('a');
        if (!existingLink) {
            const link = document.createElement('a');
            link.href = response.url;
            link.target = '_blank';
            link.textContent = 'View on Google Maps';
            
            // Only clear container if necessary (if there's no link already)
            linkContainer.innerHTML = '';
            linkContainer.appendChild(link);
        } else {
            // If the link already exists, update it (just in case)
            existingLink.href = response.url;
        }
    }
});
