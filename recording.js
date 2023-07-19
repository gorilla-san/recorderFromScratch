var recordingStrip = document.createElement("div");
recordingStrip.style.position = "fixed";
recordingStrip.style.bottom = "50px";
recordingStrip.style.left = "50px";
recordingStrip.style.width = "200px";
recordingStrip.style.height = "50px";
recordingStrip.style.backgroundColor = "#bd193f";
recordingStrip.style.zIndex = "1000000000";
recordingStrip.style.display = "flex";
recordingStrip.style.justifyContent = "center";
recordingStrip.style.alignItems = "center";
recordingStrip.style.color = "#f1f1f1";
recordingStrip.style.fontFamily = "Roboto Mono, monospace";
recordingStrip.style.fontSize = "14px";
recordingStrip.style.fontWeight = "bold";
recordingStrip.style.transition = "all 1s ease-in-out";
recordingStrip.style.borderRadius = "25px";
recordingStrip.style.gap = "14px";

document.body.appendChild(recordingStrip);

var timer = document.createElement("h3");
timer.innerHTML = "05:00";
timer.style.fontSize = "14px";
timer.style.borderRight = "1px solid #f1f1f1";
timer.style.paddingRight = "14px";
timer.style.margin = "0";
timer.id = "countdown";

recordingStrip.appendChild(timer);

var stopButton = document.createElement("button");
stopButton.style.width = "36px";
stopButton.style.height = "auto";
stopButton.style.border = "none";
stopButton.style.borderRadius = "50%";
stopButton.style.backgroundColor = "transparent";
stopButton.style.color = "#f1f1f1";
stopButton.style.fontFamily = "Roboto Mono, monospace";
stopButton.style.fontSize = "14px";
stopButton.style.fontWeight = "bold";
stopButton.style.outline = "none";
stopButton.style.cursor = "pointer";
stopButton.style.display = "flex";
stopButton.style.justifyContent = "center";
stopButton.style.alignItems = "center";
// on hover change background color to #f1f1f1 and color to #bd193f
stopButton.addEventListener("mouseover", function () {
    stopButton.style.backgroundColor = "#8334eb";
});

stopButton.addEventListener("mouseout", function () {
    stopButton.style.backgroundColor = "transparent";
});

recordingStrip.appendChild(stopButton);

var stopIcon = document.createElement("img");
stopIcon.style.width = "36px";
stopIcon.style.height = "auto";
stopIcon.src = chrome.runtime.getURL("images/stop.png");

stopButton.appendChild(stopIcon);

stopButton.addEventListener("click", () => {
    // send message to recorder.js to stop recording
    chrome.runtime.sendMessage({ message: "stop-recording" });
});

var trashButton = document.createElement("button");
trashButton.style.width = "36px";
trashButton.style.height = "auto";
trashButton.style.border = "none";
trashButton.style.borderRadius = "50%";
trashButton.style.backgroundColor = "transparent";
trashButton.style.color = "#f1f1f1";
trashButton.style.fontFamily = "Roboto Mono, monospace";
trashButton.style.fontSize = "14px";
trashButton.style.fontWeight = "bold";
trashButton.style.outline = "none";
trashButton.style.cursor = "pointer";
trashButton.style.display = "flex";
trashButton.style.justifyContent = "center";
trashButton.style.alignItems = "center";
// on hover change background color to #f1f1f1 and color to #bd193f
trashButton.addEventListener("mouseover", function () {
    trashButton.style.backgroundColor = "#8334eb";
});

trashButton.addEventListener("mouseout", function () {
    trashButton.style.backgroundColor = "transparent";
});

recordingStrip.appendChild(trashButton);

var trashIcon = document.createElement("img");
trashIcon.style.width = "36px";
trashIcon.style.height = "auto";
trashIcon.src = chrome.runtime.getURL("images/trash.png");

trashButton.appendChild(trashIcon);

chrome.runtime.sendMessage({
    message: "script-injected",
    scriptName: "recording.js",
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "remove-recording") {
        recordingStrip.style.display = "none";
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "now-recording") {
        recordingStrip.style.display = "flex";
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "update-timer") {
        let minutes = Math.floor(request.time / 60);
        let seconds = request.time % 60;
        timer.innerHTML = `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    }
});

document.addEventListener(
    "click",
    function (event) {
        // Ensure click is inside document body
        if (
            document.body.contains(event.target) && // Ensure click is not on recording strip or its children
            !recordingStrip.contains(event.target)
        ) {
            // Get the target element
            const target = event.target;

            // Construct the XPath
            let xpath = getElementXPath(target);

            // Send message to background script with screenshotUrl
            chrome.runtime.sendMessage({
                message: "metadata",
                metadata: {
                    xpath,
                    id: target.id,
                    className: target.className,
                    innerText: target.innerText,
                    value: target.value,
                },
            });
        }
    },
    true
);

function getElementXPath(elt) {
    let path = "";
    for (; elt && elt.nodeType == 1; elt = elt.parentNode) {
        let idx = getIndex(elt);
        let xname = elt.tagName;
        if (idx > 1) xname += "[" + idx + "]";
        path = "/" + xname + path;
    }
    return path;
}

function getIndex(elt) {
    let count = 1;
    for (let sib = elt.previousSibling; sib; sib = sib.previousSibling) {
        if (sib.nodeType == 1 && sib.tagName == elt.tagName) count++;
    }
    return count;
}
