//@ts-check 
var port = chrome.runtime.connect({ name: "open-in-specific-window" });

function save(evt) {
  var rootWindow = window; 
  chrome.windows.getCurrent({}, function (window) {
    port.postMessage({
      action: 'rename',
      id: window.id,
      name: /** @type {HTMLInputElement} */ (document.getElementById('name')).value
    });

    rootWindow.close();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  var saveBtn = document.getElementById('saveBtn'),
      nameInput = document.getElementById('name');

  saveBtn.addEventListener('click', save);
  nameInput.addEventListener('keypress', function (evt) {
    if (evt.keyCode == 13) {
      save(evt);
    }
  });

  // Request name from background page 
  chrome.windows.getCurrent({}, function (window) {
    port.postMessage({
      action: 'get-name',
      id: window.id
    });
  });

  document.getElementById('options-link').addEventListener('click', function (evt) {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });

  nameInput.focus();
});

/**
 * Add enter name into the nameInput, when background page answers 
 * 
 * @param {String} msg 
 */
function portMessageListener (msg) {
  let nameInput = /** @type {HTMLInputElement} */ (document.getElementById('name'));
  nameInput.value = msg;
}
port.onMessage.addListener(portMessageListener);