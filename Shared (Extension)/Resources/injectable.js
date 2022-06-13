browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);

    if (request.greeting === "hello")
        sendResponse({ farewell: "goodbye" });
});

const backgroundColors = [
    "#c95f5f20",
    "#c99b5f20",
    "#c9c25f20",
    "#61c95f20",
    "#5f9fc920",
    "#745fc920",
    "#a65fc920"
];
let websiteStatus = {
    url: null,
    originalHTML: null,
    isJSONified: false,
    ids: {}
}

function _discardWebsiteEventListeners() {
//    websiteStatus.ids.forEach({ eventListener } => {
//
//    })
}

function privateLog(...str) {
    
}

function privateError(e) {
    console.error(e);
}

function publicLog(...str) {
    console.log("JSONable:", ...str);
}

function publicError(e) {
    console.error(e);
}

function generateUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

document.addEventListener("DOMContentLoaded", (event) => {
    evaluateBody();
});

evaluateBody();

function evaluateBody() {
    if (websiteStatus.url === document.URL && websiteStatus.isJSONified) return;
    
    publicLog("Evaluating website for JSON...");
    
    websiteStatus.url = document.URL;
    _discardWebsiteEventListeners();
    websiteStatus.ids = {};
    websiteStatus.originalHTML = document.body.innerHTML;
    
    function jsonElements(element) {
        try {
            const json = JSON.parse(element.innerText);
            
            return [{
                element,
                json
            }];
        } catch (e) {
            let arr = [];
            element.childNodes.forEach(node => {
                if (node) {
                    jsonElements(node).forEach(item => {
                        if (item) {
                            arr.push(item);
                        }
                    });
                }
            });
            
            return arr;
        }
    }
    
    try {
        const json = JSON.parse(document.body.innerText);
        publicLog("Found JSON in body");
        formatJSON(document.body, json);
    } catch (e) {
//        const elements = jsonElements(document.body);
//        websiteStatus.isJSONified = true;
//
//        if (elements.length === 0) {
//            publicLog("No JSON Found");
//            websiteStatus.previousElements = {};
//        } else {
//            publicLog("Found " + elements.length + " JSON elements");
//
//            elements.forEach(({ element, json }) => formatJSON(element, json));
//        }
    }
}

function formatJSON(element, jsonObj) {
    element.innerHTML = `
        <div class="${_className("container")}">
            ${createJSONElement(undefined, jsonObj)}
        </div>
    `;
    
    Object.keys(websiteStatus.ids).forEach(uuid => {
        const arrow = document.getElementById(_className("arrow", uuid));
        const children = document.getElementById(_className("children", uuid));
        
        const toggle = (e) => {
            if (e) {
                publicLog("Toggling json element")
            }
            
            if (websiteStatus.ids[uuid].isEnabled) {
                websiteStatus.ids[uuid].isEnabled = false;
                
                if (arrow) arrow.style.transform = "rotate(0)";
                children.style.display = "none";
            } else {
                websiteStatus.ids[uuid].isEnabled = true;
                
                if (arrow) arrow.style.transform = "rotate(90deg)";
                children.style.display = "inline";
            }
        }
        
        toggle();
        if (arrow) websiteStatus.ids[uuid].eventListener = arrow.addEventListener("click", toggle);
    });
}

function createJSONElement(key="", value, backgroundColor=null, indentationCount=0, includeComma=false) {
    if (!value) return;
    
    const valueType = typeof(value);
    const isStatic = (
        valueType === "boolean" ||
        valueType === "number" ||
        valueType === "string"
    )
    
    const indentationAmount = indentationCount * 10
    
    const elementContainerStyle = (() => {
        let str = `margin: 1px 0 1px ${indentationAmount}px;`
        if (!isStatic) str += `background: ${isStatic ? "#00000000" : backgroundColor ?? backgroundColors[backgroundColors.length - 1]};`;
        
        return str
    })();
    
    const keyElement = (() => {
        let str = `<span class="${_className("element-key")}">${key}</span>`
        if (key) {
            str = '"' + str + '"';
            str += `<span class="${_className("seperator")}">${key ? ":" : ""}</span>`
        }
        
        return str
    })();
    
    if (isStatic) {
        return `
            <div class="${_className("tree-element")} ${_className(valueType)}" style="${elementContainerStyle}">
                ${keyElement}
                ${valueType === "string" ? '"' : ''}<span class="${_className("element-value")}">${value}</span>${valueType === "string" ? '"' : ''}${includeComma ? "," : ""}
            </div>
        `;
    } else {
        const isArray = Array.isArray(value);
        let childrenKeys = Object.keys(value);
        childrenKeys.sort();
        
        const children = childrenKeys
            .filter(key => key && value[key])
            .map((key, index, arr) => createJSONElement(isArray ? undefined : key, value[key], backgroundColors[index % backgroundColors.length], indentationCount+1, index !== arr.length-1))
            .join("");
        const uuid = generateUUID();
        websiteStatus.ids[uuid] = {isEnabled: false};
        console.log(valueType);
        const arrow = `<span id="${_className("arrow", uuid)}" class="${_className("expand-toggle")}">></span>`;
        return `
            <div id="${_className(uuid)}" class="${_className("tree-element")} ${_className(valueType)}" style="${elementContainerStyle}">
                ${keyElement}
                <span class="${_className(isArray ? "opening-bracket" : "opening-brace")}">${isArray ? "[" : "{"}</span>
                ${((isArray ? value : Object.keys(value)).length != 0) ? arrow : ""}
                <div id="${_className("children", uuid)}" class="${_className("element-children")}">
                    ${children}
                </div>
                <span class="${_className(isArray ? "opening-bracket" : "closing-brace")}">${isArray ? "]" : "}"}${includeComma ? "," : ""}</span>
            </div>
        `;
    }
}

function _className(className, id=undefined) {
    return "jsonable-" + (id ? id + "-" : "") + className;
}
