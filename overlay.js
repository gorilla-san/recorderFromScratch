if (document.getElementById("my-overlay")) {
    // If overlay exists, remove it
    var overlay = document.getElementById("my-overlay");
    overlay.style.display = overlay.style.display === "none" ? "flex" : "none";
} else {
    var overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    overlay.style.zIndex = "1000000";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.color = "#1a1a1a";
    overlay.style.fontFamily = "Roboto Mono, monospace";
    overlay.id = "my-overlay";

    document.body.appendChild(overlay);
}

// Listen for the 'toggle-overlay' message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "toggle-overlay") {
        // Toggle the visibility of the overlay
        let overlay = document.getElementById("my-overlay");
        if (overlay) {
            overlay.style.display =
                overlay.style.display === "none" ? "block" : "none";
        }
    }
});

overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
        overlay.style.display = "none";
    }
});

var sidebar = document.createElement("div");
sidebar.style.position = "absolute";
sidebar.style.top = "50px";
sidebar.style.right = "50px";
sidebar.style.width = "20vw";
sidebar.style.height = "60vh";
sidebar.style.backgroundColor = "#bd193f";
sidebar.style.zIndex = "1000000";
sidebar.style.display = "flex";
sidebar.style.flexDirection = "column";
sidebar.style.alignItems = "center";
sidebar.style.borderRadius = "20px";
sidebar.style.boxShadow = "0 0 2px 2px rgba(0, 0, 0, 0.5)";
sidebar.style.padding = "0 2rem 0 1rem";
sidebar.style.boxSizing = "border-box";
sidebar.style.transition = "all 1s ease-in-out";

overlay.appendChild(sidebar);

var sidebarLogo = document.createElement("img");
sidebarLogo.style.width = "100%";
sidebarLogo.style.height = "auto";
sidebarLogo.style.marginBottom = "1rem";
sidebarLogo.src = chrome.runtime.getURL("images/logo.svg");

sidebar.appendChild(sidebarLogo);

// add label for dropdown menu
var label = document.createElement("label");
label.style.width = "100%";
label.style.height = "2rem";
label.style.fontFamily = "Roboto Mono, monospace";
label.style.fontSize = "1rem";
label.style.fontWeight = "bold";
label.style.cursor = "pointer";
label.style.textAlign = "right";
label.innerHTML = "Select microphone";
label.htmlFor = "microphone";

sidebar.appendChild(label);

// add dropdown menu to select microphone
var select = document.createElement("select");
select.style.width = "100%";
select.style.height = "2rem";
select.style.marginBottom = "1rem";
select.style.borderRadius = "5px";
select.style.border = "none";
select.style.padding = "0 0.5rem";
select.style.backgroundColor = "#30181e";
select.style.color = "#f1f1f1";
select.style.fontFamily = "Roboto Mono, monospace";
select.style.fontSize = "1rem";
select.style.fontWeight = "bold";
select.style.outline = "none";
select.style.cursor = "pointer";
select.id = "microphone";

sidebar.appendChild(select);

// get permission to use microphone
async function getMicrophone() {
    await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
            console.log("Permission to use microphone granted");
        });
    navigator.mediaDevices.enumerateDevices().then((devices) => {
        console.log(
            `Available devices: ${devices.map((device) => device.label)}`
        );
        var microphones = devices.filter(
            (device) => device.kind === "audioinput"
        );
        microphones.forEach((microphone) => {
            var option = document.createElement("option");
            option.value = microphone.deviceId;
            option.innerHTML = microphone.label;
            document.getElementById("microphone").appendChild(option);
        });
    });
}

getMicrophone();

// add start recording button
var startButton = document.createElement("button");
startButton.style.width = "100%";
startButton.style.height = "2rem";
startButton.style.marginBottom = "1rem";
startButton.style.marginTop = "auto";
startButton.style.borderRadius = "5px";
startButton.style.border = "none";
startButton.style.backgroundColor = "#30181e";
startButton.style.color = "#f1f1f1";
startButton.style.fontFamily = "Roboto Mono, monospace";
startButton.style.fontSize = "1rem";
startButton.style.fontWeight = "bold";
startButton.style.outline = "none";
startButton.style.cursor = "pointer";
startButton.innerHTML = "Start recording";
startButton.style.display = "flex";
startButton.style.justifyContent = "center";
startButton.style.alignItems = "center";

sidebar.appendChild(startButton);

startButton.addEventListener("click", () => {
    // send message to background.js to start recording
    chrome.runtime.sendMessage({
        message: "start-recording",
        microphone: document.getElementById("microphone").value,
    });
    // remove overlay.js from page
    overlay.style.display = "none";
});

// add icon to start recording button
var startIcon = document.createElement("img");
startIcon.style.width = "1rem";
startIcon.style.height = "auto";
startIcon.style.marginRight = "0.5rem";
startIcon.src = chrome.runtime.getURL("images/microphone.png");

startButton.prepend(startIcon);

var recordingStrip = document.createElement("div");
recordingStrip.style.position = "absolute";
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
recordingStrip.style.fontSize = "1rem";
recordingStrip.style.fontWeight = "bold";
recordingStrip.style.transition = "all 1s ease-in-out";
recordingStrip.style.borderRadius = "25px";
recordingStrip.style.gap = "1rem";

overlay.appendChild(recordingStrip);

var timer = document.createElement("h3");
timer.innerHTML = "05:00";
timer.style.borderRight = "1px solid #f1f1f1";
timer.style.paddingRight = "1rem";
timer.style.margin = "0";
timer.id = "countdown";

recordingStrip.appendChild(timer);

var stopButton = document.createElement("button");
stopButton.style.width = "2rem";
stopButton.style.height = "auto";
stopButton.style.border = "none";
stopButton.style.borderRadius = "50%";
stopButton.style.backgroundColor = "transparent";
stopButton.style.color = "#f1f1f1";
stopButton.style.fontFamily = "Roboto Mono, monospace";
stopButton.style.fontSize = "1rem";
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
stopIcon.style.width = "2rem";
stopIcon.style.height = "auto";
stopIcon.src = chrome.runtime.getURL("images/stop.png");

stopButton.appendChild(stopIcon);

stopButton.addEventListener("click", () => {
    // send message to recorder.js to stop recording
    chrome.runtime.sendMessage({ message: "stop-recording" });
});

var trashButton = document.createElement("button");
trashButton.style.width = "2rem";
trashButton.style.height = "auto";
trashButton.style.border = "none";
trashButton.style.borderRadius = "50%";
trashButton.style.backgroundColor = "transparent";
trashButton.style.color = "#f1f1f1";
trashButton.style.fontFamily = "Roboto Mono, monospace";
trashButton.style.fontSize = "1rem";
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
trashIcon.style.width = "2rem";
trashIcon.style.height = "auto";
trashIcon.src = chrome.runtime.getURL("images/trash.png");

trashButton.appendChild(trashIcon);

chrome.runtime.sendMessage({
    message: "script-injected",
    scriptName: "overlay.js",
});
