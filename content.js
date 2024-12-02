/**
 * TU Course Finder is a Chromium web extension that helps Towson University students locate
 * their classes using Google Maps. The program observes and manipulates the PeopleSoft DOM
 * to locate the user's classes and grant them a hyperlink that opens Google Maps directing
 * them to their class.
 */

/**
 * The following functions are related to accessing and updating the database via 
 * functions located in the background.js file.
 */
function addClassroom(roomNumber, building, floor, door) {
  chrome.runtime.sendMessage({ 
    type: 'addDatabaseData', 
    roomNumber: roomNumber,
    building: building,
    floor: floor,
    door: door
  }, (response) => {
    if (!response) {
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
    if (!response) {
      console.error('Failed to update classroom data:', response.error || 'No data');
    }
  })
}

function deleteClassroom(roomNumber) {
  chrome.runtime.sendMessage({
    type: 'deleteDatabaseData',
    roomNumber: roomNumber
  }, (response) => {
    if (!response) {
      console.error('Failed to delete classroom data:', response.error || 'No data');
    }
  })
}

/**
 * Returns a Google Maps URL using a classroom's room number to identify the building
 * and it's latitdue and longitdue from the database. 
 */
async function getDirections(roomNumber) {
  return new Promise((resolve, reject) => {
      // Send the roomNumber to the background script to fetch classroom data
      chrome.runtime.sendMessage({
          type: 'getDatabaseData',
          roomNumber: roomNumber
      }, (response) => {
          if (response && response.classroom) {
              const { latitude, longitude } = response.classroom;

              // Get user's geolocation
              navigator.geolocation.getCurrentPosition(function (position) {
                  const userLat = position.coords.latitude;
                  const userLng = position.coords.longitude;

                  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${latitude},${longitude}`;
                  resolve(directionsUrl); // Resolving with the directions URL
              }, function (error) {
                  console.error('Error getting location:', error);

                  // Fallback: Open Google Maps with the classroom's latitude and longitude
                  const addressUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                  resolve(addressUrl); // Resolving with the fallback address URL
              });
          } else {
              console.warn("No classroom data for room:", roomNumber);
              reject('Failed to retrieve classroom data');
          }
      });
  });
}

/**
 * The following functions are for DOM manipulation; adding observed classrooms
 * to the database and creating hyperlinks to each classrooms respective
 * buildings.
 */

function modifyText() {
  const iframe = document.querySelector("iframe");  // or other nested container
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  
  const element = iframeDoc.querySelector("div.cx-MuiTypography-h1");

  if (element) {
    element.textContent = 'EXTENSION LOADED';
  }
}

function observeIframeForChanges() {
  const iframe = document.querySelector("iframe");
  if (!iframe) {
    return;
  }

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  if (!iframeDoc) {
    return;
  }

  // Start observing the body of the iframe
  observer.observe(iframeDoc.body, { childList: true, subtree: true });
} 


function modifyIframeElements() {
  const iframe = document.querySelector("iframe");
  if (!iframe) {
    return;
  }

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document; // Access the iframe's document
  if (!iframeDoc) {
    return;
  }

  const elements = iframeDoc.querySelectorAll("p.cx-MuiTypography-body2"); // Select all elements with the target class
  if (elements.length === 0) {
    return;
  }

  // Modify each element to become a hyperlink
  elements.forEach(async (element, index) => {
    // Check if the element already contains an anchor to avoid duplicating hyperlinks
    if (element.querySelector("a")) {
      return;
    }

    // Parses and adds each classroom to the database
    classroom = parseClassroom(element);

    const originalText = element.textContent.trim();

    const anchor = document.createElement("a");
    try {
      const classroom = element.textContent.slice(2,6)
      anchor.href = await getDirections(classroom); // Set the href to Google Maps
      anchor.target = "_blank";
      anchor.textContent = originalText;
  
      // Replace the original element's content with the anchor
      element.textContent = "";
      element.appendChild(anchor);
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  });
}

function parseClassroom(classroom) {
  const text = classroom.textContent.trim();
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

      // Add the classroom to the database
      addClassroom(roomNumber, building, floor, door);
    } else {
      console.error(`Could not parse text: "${text}"`);
    }
}

// Observe changes in the DOM
const observer = new MutationObserver(() => {
  modifyText();
  observeIframeForChanges();
  modifyIframeElements();
});

observer.observe(document.body, { childList: true, subtree: true });
