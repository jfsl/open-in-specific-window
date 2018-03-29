//@ts-check 

/**
 * Gets the openActive checkbox DOM Element
 * 
 * @return {HTMLInputElement} 
 */
function openActiveDomElement() {
    /** @type{HTMLInputElement} */
    var element = document.getElementById('open-active');
    
    return element 
}

/**
 * Save current options in chrome storage
 */
function saveOptions() {
    var options = {
        openActive: openActiveDomElement().checked
    };
    var optionsSavedHandler = function () {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    };

    chrome.storage.sync.set(options, optionsSavedHandler);
}

/**
 * Restores options saved in chrome storage
 */
function restoreOptions() {
    var defaultOptions = {
        openActive: false
    };
    var getOptionsHandler = function (items) {
        console.log(items);
        openActiveDomElement().checked = items.openActive;
    };

    chrome.storage.sync.get(defaultOptions, getOptionsHandler);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);