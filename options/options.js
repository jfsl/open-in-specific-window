//@ts-check 

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

document.addEventListener('DOMContentLoaded', function () {
    readOptions(function (items) {
        openActiveDomElement().checked = items.openActive;
    });
});

document.getElementById('save').addEventListener('click', function () {
    saveOptions(
        {
            openActive: openActiveDomElement().checked
        },
        function () {
            let status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(function () {
                status.textContent = '';
            }, 750);
        }
    );
});