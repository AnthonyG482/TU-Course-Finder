import { getClassroom, addClassroom, updateClassroom, deleteClassroom} from "./database.js";

/**
 * Listens for messages from the content script; matches the request.
 * Matched requests calls database functions to get, add, update, or delete data.
 */
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
    
        addClassroom(roomNumber, building, floor, door)
            .then((classroom) => {
                sendResponse({ classroom });
            })
            .catch((error) => {
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

chrome.runtime.onInstalled.addListener(() => {
  chrome.scripting.registerContentScripts([{
    id: "modifyTowsonText",
    matches: ["https://csprd.towson.edu/*"],
    js: ["content.js"],
    runAt: "document_idle"
  }]);
});

