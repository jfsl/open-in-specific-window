//@ts-check
var defaultOptions = {
    openActive: false,
    shortcutOpenName: null,
    shortcutOpen: false,
    shortcutOpenAlt: false,
};

/**
 * Save current options in chrome storage
 */
export function saveOptions(options, callback) {
    chrome.storage.sync.set(options, callback);
}

/**
 * Read options from storage and pass into callback
 * 
 * @param {Function} callback
 */
export function readOptions(callback) {
    chrome.storage.sync.get(defaultOptions, /** @type {(items: { [key: string]: any; }) => void} */ (callback));
}
