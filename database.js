// database.js

// Function to open or create the IndexedDB database
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TUCourseFinderDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Create an object store named "classrooms" with "roomNumber" as the key path
            const store = db.createObjectStore('classrooms', { keyPath: 'roomNumber' });
            // Define indexes for searching, if necessary
            store.createIndex('building', 'building', { unique: false });
            store.createIndex('floor', 'floor', { unique: false });
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Function to add a classroom entry
function addClassroom(roomNumber, building, floor, door) {
    return openDatabase().then(db => {
        const transaction = db.transaction('classrooms', 'readwrite');
        const store = transaction.objectStore('classrooms');

        // Classroom entry data structure
        const classroom = {
            roomNumber: roomNumber,
            building: building,
            floor: floor,
            door: door
        };

        store.add(classroom);
        return transaction.complete;
    });
}

// Function to retrieve a classroom entry
function getClassroom(roomNumber) {
    return openDatabase().then(db => {
        const transaction = db.transaction('classrooms', 'readonly');
        const store = transaction.objectStore('classrooms');

        return store.get(roomNumber);
    });
}

// Function to update a classroom entry
function updateClassroom(roomNumber, updatedData) {
    return openDatabase().then(db => {
        const transaction = db.transaction('classrooms', 'readwrite');
        const store = transaction.objectStore('classrooms');

        store.get(roomNumber).onsuccess = (event) => {
            const data = event.target.result;
            if (data) {
                Object.assign(data, updatedData);  // Update fields
                store.put(data);  // Save updated data
            }
        };

        return transaction.complete;
    });
}

// Function to delete a classroom entry
function deleteClassroom(roomNumber) {
    return openDatabase().then(db => {
        const transaction = db.transaction('classrooms', 'readwrite');
        const store = transaction.objectStore('classrooms');

        store.delete(roomNumber);
        return transaction.complete;
    });
}

// Export all functions
export {
    openDatabase,
    addClassroom,
    getClassroom,
    updateClassroom,
    deleteClassroom
};
