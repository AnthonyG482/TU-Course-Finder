// database.js
const buildingCoordinates = {
  YR: { latitude: 39.390662816719306, longitude: -76.60596155056368 }, // Example coordinates for YR building
  LA: { latitude: 39.395064926651315, longitude: -76.60914180363292 }, // Example coordinates for LA building
  // Add other buildings and their respective latitudes and longitudes here
};

// Function to open or create the IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("TUCourseFinderDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create an object store named "classrooms" with "roomNumber" as the key path
      const store = db.createObjectStore("classrooms", {
        keyPath: "roomNumber",
      });
      // Define indexes for searching, if necessary
      store.createIndex("building", "building", { unique: false });
      store.createIndex("floor", "floor", { unique: false });
      store.createIndex("latitude", "latitude", { unique: false });
      store.createIndex("longitude", "longitude", { unique: false });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function getBuildingAbbreviation(roomNumber) {
  return roomNumber.substring(0, 2); // Assumes building abbreviation is the first two characters
}

// Function to add a classroom entry
function addClassroom(roomNumber, building, floor, door) {
  const buildingAbbr = getBuildingAbbreviation(roomNumber); // Get building abbreviation
  const coordinates = buildingCoordinates[buildingAbbr]; // Lookup coordinates from the mapping

  if (!coordinates) {
    console.error("No coordinates found for building abbreviation:", buildingAbbr);
    return; // If no coordinates found, stop the function
  }

  const { latitude, longitude } = coordinates; // Get the coordinates

  return openDatabase().then((db) => {
    const transaction = db.transaction("classrooms", "readwrite");
    const store = transaction.objectStore("classrooms");

    // Classroom entry data structure
    const classroom = {
      roomNumber: roomNumber,
      building: building,
      floor: floor,
      door: door,
      latitude: latitude,
      longitude: longitude,
    };

    // Adding classroom to the IndexedDB
    return new Promise((resolve, reject) => {
      const request = store.add(classroom);

      request.onsuccess = () => {
        console.log("Classroom added:", classroom);
        resolve(classroom);
      };

      request.onerror = (event) => {
        console.error("Error adding classroom:", event.target.error);
        reject(event.target.error);
      };

      transaction.oncomplete = () => {
        console.log("Transaction completed for adding classroom");
      };

      transaction.onerror = (event) => {
        console.error("Transaction error:", event.target.error);
        reject(event.target.error);
      };
    });
  });
}

// Function to retrieve a classroom entry
function getClassroom(roomNumber) {
  return openDatabase().then((db) => {
    const transaction = db.transaction("classrooms", "readonly");
    const store = transaction.objectStore("classrooms");

    return new Promise((resolve, reject) => {
      const request = store.get(roomNumber);

      request.onsuccess = () => {
        if (request.result) {
          console.log("Classroom retrieved:", request.result);
          resolve(request.result);
        } else {
          console.log("Classroom not found.");
          resolve(null);
        }
      };

      request.onerror = (event) => {
        console.error("Error retrieving classroom:", event.target.error);
        reject(event.target.error);
      };
    });
  });
}

// Function to update a classroom entry
function updateClassroom(roomNumber, updatedData) {
  return openDatabase().then((db) => {
    const transaction = db.transaction("classrooms", "readwrite");
    const store = transaction.objectStore("classrooms");

    return new Promise((resolve, reject) => {
      const request = store.get(roomNumber);

      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          Object.assign(data, updatedData); // Merge updated data
          const updateRequest = store.put(data);

          updateRequest.onsuccess = () => {
            console.log("Classroom updated:", data);
            resolve(data);
          };

          updateRequest.onerror = (updateError) => {
            console.error("Error updating classroom:", updateError);
            reject(updateError);
          };
        } else {
          console.log("Classroom not found for update.");
          resolve(null);
        }
      };

      request.onerror = (event) => {
        console.error("Error retrieving classroom for update:", event.target.error);
        reject(event.target.error);
      };

      transaction.onerror = (event) => {
        console.error("Transaction error:", event.target.error);
        reject(event.target.error);
      };
    });
  });
}

// Function to delete a classroom entry
function deleteClassroom(roomNumber) {
  return openDatabase().then((db) => {
    const transaction = db.transaction("classrooms", "readwrite");
    const store = transaction.objectStore("classrooms");

    return new Promise((resolve, reject) => {
      const request = store.delete(roomNumber);

      request.onsuccess = () => {
        console.log(`Classroom with roomNumber ${roomNumber} deleted successfully.`);
        resolve();
      };

      request.onerror = (event) => {
        console.error("Error deleting classroom:", event.target.error);
        reject(event.target.error);
      };

      transaction.oncomplete = () => {
        console.log("Transaction completed for deleting classroom.");
      };

      transaction.onerror = (event) => {
        console.error("Transaction error:", event.target.error);
        reject(event.target.error);
      };
    });
  });
}

// Export all functions
export {
  openDatabase,
  addClassroom,
  getClassroom,
  updateClassroom,
  deleteClassroom,
};
