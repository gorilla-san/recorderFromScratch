const button = document.querySelector("button");
let metaData = [];

button.addEventListener("click", () => {
    window.close();
});

// Get microphone ID from query parameters
const urlParams = new URLSearchParams(window.location.search);
const microphoneId = urlParams.get("mic");

// Get video stream
navigator.mediaDevices
    .getDisplayMedia({
        video: true,
        audio: false,
    })
    .then((videoStream) => {
        // Get audio stream
        return navigator.mediaDevices
            .getUserMedia({
                audio: {
                    deviceId: { exact: microphoneId },
                },
            })
            .then((audioStream) => {
                // Combine video and audio streams
                const stream = new MediaStream([
                    ...videoStream.getTracks(),
                    ...audioStream.getTracks(),
                ]);

                // start recording
                const recorder = new MediaRecorder(stream);
                const chunks = [];
                recorder.ondataavailable = (e) => chunks.push(e.data);
                recorder.onstop = (e) => {
                    const completeBlob = new Blob(chunks, {
                        type: chunks[0].type,
                    });

                    // First, create a new project
                    fetch("http://localhost:8080/projects", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ name: "project" }),
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            console.log(data);
                            const projectId = data.project.id;

                            // Create a FormData object and append the file
                            const formData = new FormData();
                            formData.append(
                                "file",
                                completeBlob,
                                "recording.webm"
                            );

                            console.log(
                                `metaData: ${JSON.stringify(metaData)}`
                            );
                            formData.append("data", JSON.stringify(metaData));

                            // Send the FormData object to the server
                            return fetch(
                                `http://localhost:8080/projects/${projectId}/files`,
                                {
                                    method: "POST",
                                    body: formData,
                                }
                            );
                        })
                        .then((response) => response.json())
                        .then((data) => {
                            window.close();
                        })
                        .catch((error) => {
                            console.error("Error:", error);
                        });
                };

                recorder.start();

                chrome.tabs.query({}, function (tabs) {
                    var message = { message: "now-recording" };
                    for (var i = 0; i < tabs.length; ++i) {
                        chrome.tabs.sendMessage(tabs[i].id, message);
                    }
                });
                chrome.runtime.sendMessage({ message: "now-recording" });

                setTimeout(() => {
                    recorder.stop();
                }, 300000);
                // listen for 'stop-recording' message from overlay.js
                chrome.runtime.onMessage.addListener(
                    (request, sender, sendResponse) => {
                        if (request.message === "stop-recording") {
                            chrome.tabs.query({}, function (tabs) {
                                var message = { message: "remove-recording" };
                                for (var i = 0; i < tabs.length; ++i) {
                                    chrome.tabs.sendMessage(
                                        tabs[i].id,
                                        message
                                    );
                                }
                            });
                            recorder.stop();
                        }
                    }
                );
                chrome.runtime.onMessage.addListener(
                    (request, sender, sendResponse) => {
                        if (request.message === "meta&stamp") {
                            metaData.push(request.metadata);
                        }
                    }
                );
            });
    })
    .catch((error) => {
        console.error("Error:", error);
    });
