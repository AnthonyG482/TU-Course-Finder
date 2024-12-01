function getDirections(roomNumber) {
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
    writeCoursesToDB; // Re-run the modification function whenever changes occur
  });

  // Start observing the body of the iframe
  observer.observe(iframeDoc.body, { childList: true, subtree: true });
}

let hasRun = false; // A flag to ensure the function runs only once

function writeCoursesToDB {
  if (hasRun) {
    console.log("Function has already run. Exiting.");
    return; // Exit if the function has already run
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

  // Iterate through each element and extract data
  elements.forEach((element, index) => {
    const text = element.textContent.trim();
    console.log(`Element ${index + 1} content: "${text}"`);

    // Parse the text, e.g., "LA2310 CLA Priority Lec Hall" or "LA0302 CLA Priority Lec Hall"
    const match = text.match(/^([A-Z]+)(\d+)\s+([A-Z]+)\s+(.*)$/);
    if (match) {
      const building = match[1]; // e.g., "LA"
      const roomNumber = match[2]; // e.g., "2310" or "0302"
      let floor;

      // Determine the floor based on the room number
      if (roomNumber.startsWith("0")) {
        floor = parseInt(roomNumber.charAt(1), 10); // Digit directly after the 0
      } else {
        floor = parseInt(roomNumber.charAt(0), 10); // First digit of the room number
      }

      const door = parseInt(roomNumber.slice(1), 10); // Remaining digits of the room number

      console.log(`Parsed data - Room: ${roomNumber}, Building: ${building}, Floor: ${floor}, Door: ${door}`);

      // Add the classroom to the database
      addClassroom(roomNumber, building, floor, door);
    } else {
      console.log(`Could not parse text: "${text}"`);
    }
  });

  hasRun = true; // Set the flag to indicate the function has run
}



function addClassroom(roomNumber, building, floor, door) {
  console.log("Sending addDatabaseData message.");
  chrome.runtime.sendMessage({ 
    type: 'addDatabaseData', 
    roomNumber: roomNumber,
    building: building,
    floor: floor,
    door: door
  }, (response) => {
    if (response) {
      console.log("Classroom added:", response.classroom);
    } else {
      console.error('Failed to add classroom data:', response ? response.error : 'No response received');
    }
  });
}


function updateClassroom(roomNumber, updatedData) {
  chrome.runtime.sendMessage({
    type: 'updateDatabaseData',
    roomNumber: roomNumber,
    updatedData: updatedData
  }, (response) => {
    if (response) {
      console.log("Update: ", response.classroom)
    } else {
      console.error('Failed to update classroom data:', response.error || 'No data');
    }
  })
}

function deleteClassroom(roomNumber) {
  chrome.runtime.sendMessage({
    type: 'deleteDatabaseData',
    roomNumber: roomNumber
  }, (response) => {
    if (response) {
      console.log(`Room ${roomNumber} deleted`)
    } else {
      console.error('Failed to delete classroom data:', response.error || 'No data');
    }
  })
}

// Observe changes in the DOM
const observer = new MutationObserver(() => {
  console.log("DOM mutation detected, attempting to modify text."); // Debugging log
  modifyText();
  // Call the observer and modify elements
  observeIframeForChanges();
  writeCoursesToDB;
  getDirections('LA202')
});

observer.observe(document.body, { childList: true, subtree: true });
console.log("Content script loaded and observer initialized."); // Debugging log

// Initial check
// modifyText();
// // Call the observer and modify elements
// observeIframeForChanges();
// writeCoursesToDB;