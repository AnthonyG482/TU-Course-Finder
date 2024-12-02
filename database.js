// database.js
const buildingCoordinates = {
  YR: { latitude: 39.390662816719306, longitude: -76.60596155056368 },
  LA: { latitude: 39.395064926651315, longitude: -76.60914180363292 },
  SC: { latitude: 39.391498094677644, longitude: -76.60637613336023 }
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
export function addClassroom(roomNumber, building, floor, door) {
  const buildingAbbr = getBuildingAbbreviation(building); // Get building abbreviation
  const coordinates = buildingCoordinates[buildingAbbr]; // Lookup coordinates from the mapping

  if (!coordinates) {
    console.error("No coordinates found for building abbreviation:", buildingAbbr);
    return; // If no coordinates found, stop the function
  }

  const { latitude, longitude } = coordinates;

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

    return new Promise((resolve, reject) => {
      const request = store.put(classroom);

      request.onsuccess = () => {
        resolve(classroom);
      };

      request.onerror = (event) => {
        console.error("Error adding or updating classroom:", event.target.error);
        reject(event.target.error);
      };

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = (event) => {
        console.error("Transaction error:", event.target.error);
        reject(event.target.error);
      };
    });
  }).catch((error) => {
    console.error("Database operation failed:", error);
  });
}


// Function to retrieve a classroom entry
export function getClassroom(roomNumber) {
  return openDatabase().then((db) => {
    if (!roomNumber) {
      console.error("Room number is required.");
      return Promise.reject("Room number is required.");
    }

    const transaction = db.transaction("classrooms", "readonly");
    const store = transaction.objectStore("classrooms");
    const request = store.get(roomNumber);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          console.error("Classroom not found.");
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
export function updateClassroom(roomNumber, updatedData) {
  return openDatabase().then((db) => {
    const transaction = db.transaction("classrooms", "readwrite");
    const store = transaction.objectStore("classrooms");

    return new Promise((resolve, reject) => {
      const request = store.get(roomNumber);

      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          // Check if updatedData is an object (not an array)
          if (typeof updatedData === "object" && !Array.isArray(updatedData)) {
            Object.assign(data, updatedData); // Merge updated data
            const updateRequest = store.put(data);

            updateRequest.onsuccess = () => {
              resolve(data);
            };

            updateRequest.onerror = (updateError) => {
              console.error("Error updating classroom:", updateError);
              reject(updateError);
            };
          } else {
            console.error("Updated data must be an object, not an array.");
            reject("Updated data is not a valid object");
          }
        } else {
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
export function deleteClassroom(roomNumber) {
  return openDatabase().then((db) => {
    const transaction = db.transaction("classrooms", "readwrite");
    const store = transaction.objectStore("classrooms");

    return new Promise((resolve, reject) => {
      const request = store.delete(roomNumber);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error("Error deleting classroom:", event.target.error);
        reject(event.target.error);
      };

      getAllRequest.onsuccess = () => {
        resolve();
      };

      getAllRequest.onerror = (event) => {
        console.error("Error fetching classrooms:", event.target.error);
        reject(event.target.error);
      };

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = (event) => {
        console.error("Transaction error:", event.target.error);
        reject(event.target.error);
      };
    });
  });
}

