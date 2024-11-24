window.onload = function() {
  const address = '8000 York Rd, Towson, MD 21252';

  // Get user's geolocation
  navigator.geolocation.getCurrentPosition(function(position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${encodeURIComponent(address)}`;
      injectMapLink(directionsUrl);
  }, function(error) {
      console.error('Error getting location:', error);
      alert("Error retrieving your location. You can still view the address location on Google Maps.");

      // Fallback: Open Google Maps with the address
      const addressUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
      injectMapLink(addressUrl);
  });
};

// Function to inject the Google Maps link into the page (injects into extension popup for now)
function injectMapLink(url) {
  chrome.runtime.sendMessage({ action: 'storeLink', url: url });
}
