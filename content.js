function getDirections() {
  const roomNumber = 'YR202';

  // Send the roomNumber to the background script to fetch classroom data
  chrome.runtime.sendMessage({ 
    type: 'getDatabaseData', 
    roomNumber: roomNumber
  }, (response) => {
    if (response && response.classroom) {
      const { latitude, longitude } = response.classroom;
      
      // Get user's geolocation
      navigator.geolocation.getCurrentPosition(function(position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${latitude},${longitude}`;
        injectMapLink(directionsUrl);
      }, function(error) {
        console.error('Error getting location:', error);
        alert("Error retrieving your location. You can still view the address location on Google Maps.");

        // Fallback: Open Google Maps with the classroom's latitude and longitude
        const addressUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        injectMapLink(addressUrl);
      });
    } else {
      console.error('Failed to retrieve classroom data:', response.error || 'No data');
    }
  });
}

// Function to inject the Google Maps link into the page (injects into extension popup for now)
function injectMapLink(url) {
  chrome.runtime.sendMessage({ action: 'storeLink', url: url });
}

function modifyText() {
  const iframe = document.querySelector("iframe");  // or other nested container
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  
  const element = iframeDoc.querySelector("div.cx-MuiTypography-h1");

  if (element) {
    console.log("Element found:", element); // Debugging log
    element.textContent = 'EXTENSION LOADED';
  } else {
    console.log("Target element not found."); // Debugging log
  }
}

function observeIframeForChanges() {
  const iframe = document.querySelector("iframe");
  if (!iframe) {
    console.log("Iframe not found.");
    return;
  }

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  if (!iframeDoc) {
    console.log("Iframe document not loaded yet.");
    return;
  }

  const observer = new MutationObserver(() => {
    modifyIframeElements(); // Re-run the modification function whenever changes occur
  });

  // Start observing the body of the iframe
  observer.observe(iframeDoc.body, { childList: true, subtree: true });
}

let iframeModified = false; // Guard flag for modifyIframeElements

function writeClassesToDB() {
  if (iframeModified) {
    console.log("Iframe elements already added to DB, skipping...");
    return; // Prevent re-execution
  }

  const iframe = document.querySelector("iframe"); // Locate the iframe
  if (!iframe) {
    console.log("Iframe not found.");
    return;
  }

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document; // Access the iframe's document
  if (!iframeDoc) {
    console.log("Iframe document not loaded yet.");
    return;
  }

  const elements = iframeDoc.querySelectorAll("p.cx-MuiTypography-body2"); // Select all elements with the target class
  if (elements.length === 0) {
    console.log("No target elements found in the iframe.");
    return;
  }

  // Mark as modified
  iframeModified = true;

  // Iterate through each element
  elements.forEach((element, index) => {
    // Print everything inside the element to the console
    console.log(`Content of element ${index + 1}:`, element.innerHTML);

    // Example modification (optional)
    // const newText = `Modified text for element ${index + 1}`;
    // element.textContent = newText; // Modify the element's text
    // console.log(`Modified element ${index + 1} to: ${newText}`);
  });

  console.log("Iframe elements have been processed.");
}

// Observe changes in the DOM
const observer = new MutationObserver(() => {
  console.log("DOM mutation detected, attempting to modify text."); // Debugging log
  modifyText();
  // Call the observer and modify elements
  observeIframeForChanges();
  writeClassesToDB();
  getDirections();
});

observer.observe(document.body, { childList: true, subtree: true });
console.log("Content script loaded and observer initialized."); // Debugging log

// Initial check
// modifyText();
// // Call the observer and modify elements
// observeIframeForChanges();
// modifyIframeElements();
