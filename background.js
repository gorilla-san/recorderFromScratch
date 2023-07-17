let activeTabListener = null;
let injectedScripts = {};

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

        let timeLeft = 300; // 5 minutes in seconds
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
    }
});
