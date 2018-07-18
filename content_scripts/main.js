//@ts-check 
var port = chrome.runtime.connect({ name: "open-in-specific-window" });
port.postMessage({ action: 'shortcut-open-enabled' });

/**
 * 
 * @param {MouseEvent} evt 
 */
function linkClickedHandler(evt) {
    let link = /** @type {HTMLLinkElement} */ (evt.target);
    if (evt.altKey) {
        evt.preventDefault();
        port.postMessage({
            action: 'shortcut-open',
            url: link.href
        });
    }
}

/** 
 * @typedef {Object} BackgroundMessage 
 * @property {String} action
 * @property {*} response
 */

/**
 * Handle incoming messages from the background page
 * @param {BackgroundMessage} msg 
 */
function portMessageHandler (msg) {
    switch (msg.action) {
        case 'shortcut-open-enabled':
            if (msg.response) {
                let links = document.getElementsByTagName('a');
                for (let i = 0; i < links.length; i++) {
                    let link = links[i];
                    link.addEventListener('click', linkClickedHandler);
                }
            }
            break;
    }
}

port.onMessage.addListener(portMessageHandler);