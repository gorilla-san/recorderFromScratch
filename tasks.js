var tasksStrip = document.createElement("div");
tasksStrip.style.position = "fixed";
tasksStrip.style.bottom = "50px";
tasksStrip.style.right = "50px";
tasksStrip.style.width = "200px";
tasksStrip.style.height = "50px";
tasksStrip.style.backgroundColor = "#bd193f";
tasksStrip.style.zIndex = "1000000000";
tasksStrip.style.display = "flex";
tasksStrip.style.justifyContent = "center";
tasksStrip.style.alignItems = "center";
tasksStrip.style.color = "#f1f1f1";
tasksStrip.style.fontFamily = "Roboto Mono, monospace";
tasksStrip.style.fontSize = "14px";
tasksStrip.style.fontWeight = "bold";
tasksStrip.style.transition = "all 1s ease-in-out";
tasksStrip.style.borderRadius = "25px";
tasksStrip.style.gap = "14px";
tasksStrip.style.padding = "0 14px";
tasksStrip.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.25)";
tasksStrip.style.cursor = "pointer";

document.body.appendChild(tasksStrip);

tasksStrip.addEventListener("mouseover", function () {
    tasksStrip.style.backgroundColor = "#8334eb";
});
tasksStrip.addEventListener("mouseout", function () {
    tasksStrip.style.backgroundColor = "#bd193f";
});

var text = document.createElement("h1");
text.style.fontSize = "12px";
text.style.textWrap = "balance";
text.style.textAlign = "center";
text.innerHTML = "Show Guides";

tasksStrip.appendChild(text);

var nextButton = document.createElement("button");
nextButton.style.width = "200px";
nextButton.style.height = "50px";
nextButton.style.border = "none";
nextButton.style.borderRadius = "25px";
nextButton.style.backgroundColor = "#bd193f";
nextButton.style.color = "#f1f1f1";
nextButton.style.fontFamily = "Roboto Mono, monospace";
nextButton.style.fontSize = "14px";
nextButton.style.fontWeight = "bold";
nextButton.style.outline = "none";
nextButton.style.cursor = "pointer";
nextButton.style.display = "none";
nextButton.style.justifyContent = "center";
nextButton.style.alignItems = "center";
nextButton.style.position = "fixed";
nextButton.style.bottom = "110px";
nextButton.style.right = "50px";
nextButton.style.zIndex = "1000000000";
nextButton.innerText = "Next";
// on hover change background color to #f1f1f1 and color to #bd193f
nextButton.addEventListener("mouseover", function () {
    nextButton.style.backgroundColor = "#8334eb";
});

nextButton.addEventListener("mouseout", function () {
    nextButton.style.backgroundColor = "#bd193f";
});

document.body.appendChild(nextButton);

let project;
let i = 0;

nextButton.addEventListener("click", function () {
    var existingTooltip = document.getElementById("myTooltip");
    if (existingTooltip) {
        existingTooltip.parentNode.removeChild(existingTooltip);
    }
    console.log(project);
    let currentXpath = project.data[i].xpath;
    let currentElement = document.evaluate(
        currentXpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
    let text =
        "This is some example text for the tooltip. Don't follow this text exactly as it is just for testing purposes.";
    createTooltip(currentElement, text);
    i++;
    if (i >= project.data.length) {
        i = 0;
    }
});

function createTooltip(element, text) {
    var rect = element.getBoundingClientRect();

    var tooltipLeft = rect.left + window.scrollX;
    var tooltipTop = rect.top + window.scrollY;

    var tooltip = document.createElement("div");
    tooltip.id = "myTooltip";
    tooltip.style.position = "absolute";
    tooltip.style.top = `${tooltipTop}px`;
    tooltip.style.left = `${tooltipLeft}px`;
    tooltip.style.width = "200px";
    tooltip.style.overflowX = "hidden";
    tooltip.style.overflowY = "auto";
    tooltip.style.textWrap = "balance";
    tooltip.style.maxHeight = "250px";
    tooltip.style.backgroundColor = "#bd193f";
    tooltip.style.zIndex = "1000000000";
    tooltip.style.display = "flex";
    tooltip.style.justifyContent = "center";
    tooltip.style.alignItems = "center";
    tooltip.style.color = "#f1f1f1";
    tooltip.style.fontFamily = "Roboto Mono, monospace";
    tooltip.style.fontSize = "14px";
    tooltip.style.padding = "14px";
    tooltip.style.borderRadius = "10px";
    tooltip.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.25)";

    document.body.appendChild(tooltip);

    var tooltipText = document.createElement("h1");
    tooltipText.style.fontSize = "12px";
    tooltipText.style.textWrap = "balance";
    tooltipText.style.textAlign = "center";
    tooltipText.innerHTML = text;

    tooltip.appendChild(tooltipText);
}

tasksStrip.addEventListener("click", function () {
    getTasks(1)
        .then((result) => {
            console.log(result);
            project = result.project;
            nextButton.style.display = "flex";
        })
        .catch((err) => {
            console.error(err);
        });
});

async function getTasks(projectId) {
    const response = await fetch(`http://localhost:8080/projects/${projectId}`);
    const project = await response.json();
    if (response.ok) {
        return {
            project,
        };
    } else {
        return {
            status: response.status,
            error: new Error(project.message),
        };
    }
}
