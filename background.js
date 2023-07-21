let activeTabListener = null;
let injectedScripts = {};
let timeLeft;

chrome.action.onClicked.addListener((tab) => {
    if (
        !injectedScripts[tab.id] ||
        !injectedScripts[tab.id].includes("overlay.js")
    ) {
        chrome.scripting
            .executeScript({
                target: { tabId: tab.id },
                files: ["overlay.js"],
            })
            .then(() => {
                if (!injectedScripts[tab.id]) {
                    injectedScripts[tab.id] = [];
                }
                injectedScripts[tab.id].push("overlay.js");
            });
    } else {
        chrome.tabs.sendMessage(tab.id, { message: "toggle-overlay" });
        console.log("toggle-overlay message sent");
    }
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
    } else if (request.message === "now-recording") {
        console.log("message received");

        // whenever a user clicks on a new tab, inject recording.js
        activeTabListener = (activeInfo) => {
            if (
                !injectedScripts[activeInfo.tabId] ||
                !injectedScripts[activeInfo.tabId].includes("recording.js")
            ) {
                console.log("injecting recording.js");
                chrome.scripting
                    .executeScript({
                        target: { tabId: activeInfo.tabId },
                        files: ["recording.js"],
                    })
                    .then(() => {
                        if (!injectedScripts[activeInfo.tabId]) {
                            injectedScripts[activeInfo.tabId] = [];
                        }
                        injectedScripts[activeInfo.tabId].push("recording.js");
                    });
            }
        };

        timeLeft = 300; // 5 minutes in seconds
        countdownInterval = setInterval(() => {
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach((tab) => {
                    chrome.tabs.sendMessage(tab.id, {
                        message: "update-timer",
                        time: timeLeft,
                    });
                });
            });
            timeLeft--;
            if (timeLeft < 0) clearInterval(countdownInterval);
        }, 1000);

        chrome.tabs.onActivated.addListener(activeTabListener);
    } else if (request.message === "stop-recording") {
        console.log("stop recording received");

        if (activeTabListener) {
            chrome.tabs.onActivated.removeListener(activeTabListener);
            activeTabListener = null;
        }

        if (countdownInterval) clearInterval(countdownInterval);
    } else if (request.message === "metadata") {
        let metaData = request.metadata;
        let duration = 300 - timeLeft;
        let minutes = Math.floor(duration / 60);
        let seconds = duration % 60;
        let timeStamp = `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
        metaData.timeStamp = timeStamp;
        chrome.runtime.sendMessage({
            message: "meta&stamp",
            metadata: metaData,
        });
    }
});

// on page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // if url has 'front' in it, inject tasks.js
    if (tab.url.includes("twitter")) {
        console.log(`injecting tasks.js into ${tab.url}`);
        chrome.scripting
            .executeScript({
                target: { tabId: tab.id },
                files: ["tasks.js"],
            })
            .then(() => {
                if (!injectedScripts[tab.id]) {
                    injectedScripts[tab.id] = [];
                }
                injectedScripts[tab.id].push("tasks.js");
            });
    }
});
