let overlayInjected = false;
let recordingInjected = false;

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["overlay.js"],
    });

    overlayInjected = !overlayInjected;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "start-recording") {
        chrome.tabs.create(
            {
                url: chrome.runtime.getURL(
                    "recorder.html?mic=" + request.microphone
                ),
            },
            function (tab) {
                chrome.tabs.update(tab.id, { pinned: true });
            }
        );
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "now-recording") {
        console.log("message received");

        // whenever a user clicks on a new tab, inject recording.js
        activeTabListener = (activeInfo) => {
            if (!overlayInjected && !recordingInjected) {
                console.log("injecting recording.js");
                chrome.scripting.executeScript({
                    target: { tabId: activeInfo.tabId },
                    files: ["recording.js"],
                });
            }
        };

        chrome.tabs.onActivated.addListener(activeTabListener);
    } else if (request.message === "stop-recording") {
        console.log("stop recording received");

        if (activeTabListener) {
            chrome.tabs.onActivated.removeListener(activeTabListener);
            activeTabListener = null;
        }
    }
});
