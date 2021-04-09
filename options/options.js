//@ts-check 
var port = chrome.runtime.connect({ name: "open-in-specific-window" });

import { saveOptions, readOptions } from '../modules/options.js';

/**
 * Gets the openActive checkbox DOM Element
 * 
 * @return {HTMLInputElement} 
 */
function openActiveDomElement() {
    let element = /** @type{HTMLInputElement} */ (document.getElementById('open-active'));

    return element
}

/**
 * Gets the openShortcutEnabled checkbox DOM Element
 * 
 * @return {HTMLInputElement} 
 */
function openShortcutEnabledDomElement() {
    let element = /** @type {HTMLInputElement} */ (document.getElementById('shortcut-open'));

    return element
}

/**
 * Gets the openShortcutAltEnabled checkbox DOM Element
 * 
 * @return {HTMLInputElement} 
 */
function openShortcutAltEnabledDomElement() {
    let element = /** @type {HTMLInputElement} */ (document.getElementById('shortcut-open-alt'));

    return element
}

/**
 * Gets the openShortcutName checkbox DOM Element
 * 
 * @return {HTMLInputElement} 
 */
function openShortcutNameDomElement() {
    let element = /** @type{HTMLInputElement} */ (document.getElementById('shortcut-open-name'));

    return element
}

document.addEventListener('DOMContentLoaded', function () {
    readOptions(function (items) {
        openActiveDomElement().checked = items.openActive;
        openShortcutEnabledDomElement().checked = items.shortcutOpen;
        openShortcutAltEnabledDomElement().checked = items.shortcutOpenAlt;
        openShortcutNameDomElement().value = items.shortcutOpenName;
    });
});

document.getElementById('save').addEventListener('click', function () {
    let status = document.getElementById('status');

    status.textContent = "Save clicked";

    saveOptions(
        {
            openActive: openActiveDomElement().checked,
            shortcutOpenAlt: openShortcutAltEnabledDomElement().value,
            shortcutOpen: openShortcutEnabledDomElement().value,
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
});
