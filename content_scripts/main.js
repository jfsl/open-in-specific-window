//@ts-check 
var port = chrome.runtime.connect({ name: "open-in-specific-window" });
port.postMessage({ action: 'shortcut-open-alt-enabled' });

shortcutOpenAltEnabled = false;

/**
 * 
 * @param {MouseEvent} evt 
 */
function linkClickedHandler(evt) {
    let link = /** @type {HTMLLinkElement} */ (evt.target);

    if (link.tagName.toLowerCase() != "a")
        return;

    if ((shortcutOpenAltEnabled && evt.altKey) || link.target == "_blank") {
        evt.preventDefault();
        var port = chrome.runtime.connect({ name: "open-in-specific-window" });
        port.postMessage({
            action: 'shortcut-open',
            url: link.href,
            alt: evt.altKey
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
        case 'shortcut-open-alt-enabled':
            shortcutOpenAltEnabled = msg.response;
            break;
    }
}

port.onMessage.addListener(portMessageHandler);

document.getElementsByTagName('body')[0].addEventListener('click', linkClickedHandler, true);
