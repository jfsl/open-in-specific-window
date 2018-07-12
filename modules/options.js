var defaultOptions = {
    openActive: false,
    shortcutOpenName: null
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
    chrome.storage.sync.get(defaultOptions, callback);
}