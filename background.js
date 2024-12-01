import { getClassroom, addClassroom, updateClassroom, deleteClassroom} from "./database.js";

let storedLink = null;

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'storeLink') {
        chrome.storage.local.set({ 'storedLink': request.url });
    }

    if (request.type === 'getDatabaseData') {
        const roomNumber = request.roomNumber;

        getClassroom(roomNumber).then((classroom) => {
            sendResponse({ classroom });
        })
        .catch((error) => {
            sendResponse({ error: error.message });
        });

        return true;
    }

    if (request.type === 'addDatabaseData') {
        const roomNumber = request.roomNumber;
        const building = request.building;
        const floor = request.floor;
        const door = request.door;
    
        console.log(`addDatabaseData called with: ${roomNumber}, ${building}, ${floor}, ${door}`); // Debugging log
    
        addClassroom(roomNumber, building, floor, door)
            .then((classroom) => {
                console.log("Classroom added successfully:", classroom); // Debugging log
                sendResponse({ classroom });
            })
            .catch((error) => {
                console.error("Error adding classroom:", error); // Debugging log
                sendResponse({ error: error.message });
            });
    
        return true;
    }
    

    if (request.type === 'updateDatabaseData') {
        const roomNumber = request.roomNumber;
        const updatedData = request.updatedData;

        updateClassroom(roomNumber, updatedData).then((classroom) => {
            sendResponse({ classroom });
        })
        .catch((error) => {
            sendResponse({ error: error.message });
        });

        return true;
    }

    if (request.type === 'deleteDatabaseData') {
        const roomNumber = request.roomNumber;

        deleteClassroom(roomNumber).then((classroom) => {
            sendResponse({ message: `Classroom ${classroom} deleted successfully.` });
        })
        .catch((error) => {
            sendResponse({ error: error.message });
        });

        return true;
    }
});

// Function to get the stored link when the popup requests it
chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(request) {
        if (request.action === 'getLink') {
            // Retrieve link from storage if it exists
            chrome.storage.local.get('storedLink', function(data) {
                if (data.storedLink) {
                    port.postMessage({ action: 'displayLink', url: data.storedLink });
                }
            });
        }
    });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.scripting.registerContentScripts([{
    id: "modifyTowsonText",
    matches: ["https://csprd.towson.edu/*"],
    js: ["content.js"],
    runAt: "document_idle"
  }]);
});

