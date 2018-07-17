//@ts-check 
var port = chrome.runtime.connect({ name: "open-in-specific-window" });

import { saveOptions, readOptions } from '../modules/options.js';

/**
 * Gets the openActive checkbox DOM Element
 * 
 * @return {HTMLInputElement} 
 */
function openActiveDomElement() {
    /** @type{HTMLInputElement} */
    let element = document.getElementById('open-active');

    return element
}

/**
 * Gets the openShortcutEnabled checkbox DOM Element
 * 
 * @return {HTMLInputElement} 
 */
function openShortcutEnabledDomElement() {
    /** @type{HTMLInputElement} */
    let element = document.getElementById('shortcut-open-enabled');

    return element
}

/**
 * Gets the openShortcutName checkbox DOM Element
 * 
 * @return {HTMLInputElement} 
 */
function openShortcutNameDomElement() {
    /** @type{HTMLInputElement} */
    let element = document.getElementById('shortcut-open-name');

    return element
}

document.addEventListener('DOMContentLoaded', function () {
    readOptions(function (items) {
        openActiveDomElement().checked = items.openActive;
        if (items.shortcutOpenName) {
            openShortcutEnabledDomElement().checked = true;
            openShortcutNameDomElement().value = items.shortcutOpenName;
        }
    });
});

document.getElementById('save').addEventListener('click', function () {
    let status = document.getElementById('status');

    status.textContent = "Save clicked";

    if (openShortcutEnabledDomElement().checked && !openShortcutNameDomElement().value) {
        status.innerHTML = '<div style="color: red">Name must be set when Alt-click is enabled</div>';
    } else {
        saveOptions(
            {
                openActive: openActiveDomElement().checked,
                shortcutOpenName: openShortcutNameDomElement().value
            },
            function () {
                status.textContent = 'Options saved.';
                
                setTimeout(function () {
                    status.textContent = '';
                }, 750);
            }
        );
        port.postMessage({action: 'options-saved'});
    }
});