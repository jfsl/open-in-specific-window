import { readOptions } from "../modules/options.js";

console.log('loaded');
chrome.runtime.setUninstallURL("http://jfsl.dk/oisw-uninstall.php");

let options = {
  openActive: false // Defines wether or not to focus the window, when opening a new tab in it.
};
let windowTitles = []; // Array of windowId -> name associations if the windows have been named by the user

// readOption and override global var with defaults
readOptions(function (items) {
  options = items;
  console.log(options);
});

/**
 * Creates a new chrome tab in the specified window id
 *  
 * @param {Number} windowId 
 * @param {String} url 
 */
function createTab(windowId, url) {
  chrome.tabs.create({
    windowId: windowId,
    url: url,
    active: options.openActive
  });
}

/**
 * Creates a new tab in the selected window, using the attached linkUrl from the Event 
 * 
 * @param {Number} windowId 
 * @return {Function}
 */
function tabOpenerFunction(windowId) {
  /**
   * 
   * @param {chrome.contextMenus.OnClickData} onClickEvent 
   */
  let openerHandler = function (onClickEvent) {
    let url = onClickEvent.linkUrl;
    createTab(windowId, url);
  };

  return openerHandler;
}

/**
 * Updates the context menu in the chrome right-click GUI
 * @param {chrome.windows.WindowIdEvent} focusChangedEvent 
 */
function updateMenu(focusChangedEvent) {
  chrome.contextMenus.removeAll(function () {
    let mainMenu = chrome.contextMenus.create({
      title: 'Open in specific window',
      contexts: ['link']
    });

    chrome.windows.getAll(function (windows) {
      let i = 0,
        title = '',
        height = 0,
        width = 0,
        id = 0;

      for (i = windows.length - 1; i >= 0; i--) {
        chrome.tabs.query(
          {
            active: true,
            windowId: windows[i].id
          },
          function (result) {
            id = result[0].windowId;
            height = result[0].height;
            width = result[0].width;
            let tabTitle = result[0].title;

            if (windowTitles[result[0].windowId]) {
              tabTitle = windowTitles[result[0].windowId];
            }

            title = '' + tabTitle + ' | ' + id + ' (' + width + ' x ' + height + ') ';

            chrome.contextMenus.create({
              title: title,
              contexts: ['link'],
              onclick: tabOpenerFunction(id),
              parentId: mainMenu
            });
          }
        );
      }
    });
  });
}

// Listen for messages sent from the browserAction
chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name == "open-in-specific-window");

  port.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == 'rename') {
      // Rename action will associate a name with a given window id
      windowTitles[msg.id] = msg.name;
      updateMenu();
    } else if (msg.action == 'get-name') {
      // Get name action will return the name associated with a given window id
      port.postMessage(windowTitles[msg.id]);
    } else if (msg.action == 'shortcut-open-enabled') {
      // Check if shortcut open has been configured

      console.log('shortcut-open-enabled', msg);

      if (options.shortcutOpenName) {
        port.postMessage({action: 'shortcut-open-enabled', response: true});
      } else {
        port.postMessage({action: 'shortcut-open-enabled', response: false});
      }
    } else if (msg.action == 'shortcut-open') {
      let shortcutName = options.shortcutOpenName;
      let windowId = findWindowIdWithTitle(shortcutName);

      if (windowId) {
        createTab(windowId, msg.url);
      } else {
        chrome.windows.create({ url: msg.url }, function (window) {
          windowTitles[window.id] = shortcutName;
        });
      }
    }
  });
});


/**
 * Finds the window id with the given title, returns false if not found 
 * @param {String} title
 * @returns {int|False} 
 */
function findWindowIdWithTitle(searchTitle) {
  if (windowTitles.length > 0) {
    for (let idx = 0; idx < windowTitles.length; idx++) {
      if (windowTitles[idx] == searchTitle) {
        return idx;
      }
    }
  }

  return false;
}

// Listen for external messages 
chrome.runtime.onMessageExternal.addListener(
  function (request, sender, sendResponse) {
    // All responses echo back the request.id attribute
    // This is to make integration easier when doing multiple requests
    // on the client side.
    let response = {
      'requestId': request.id
    };

    if (request.action == 'getWindowTitles') {
      // getWindowTitles action will return the array of titled windows, if
      // there are none, an empty array will be returned
      response.windowTitles = windowTitles;
      sendResponse(response);
    } else if (request.action == 'getWindowIdWithTitle') {
      // getWindowIdWithTitle will return the windowId associated with the given
      // title, if no match is found response will have the success attribute set to false
      let windowId = findWindowIdWithTitle(request.title);

      if (windowId) {
        response.windowId = idx;
        response.success = true;
        sendResponse(response);
      } else {
        response.success = false;
        response.message = "Window title: " + request.title + " not found";
        sendResponse(response);
      }
    } else if (request.action == 'openTabInWindow') {
      // openTavInWindow action will open the requested url in the requested window id or window name
      if (request.windowId != null) {
        createTab(request.windowId, request.url);
      } else if (request.windowName != null) {
        let windowId = findWindowIdWithTitle(request.windowName);

        if (windowId) {
          createTab(windowId, request.url);
        } else {
          chrome.windows.create({ url: request.url }, function (window) {
            windowTitles[window.id] = request.windowName;
          });
        }
      }
    }
  }
);

function windowRemovedHandler(windowId) {
  // Make sure to remove the id -> name association when the window is closed to avoid dead names/ids
  windowTitles.splice(windowId, 1);
}

// Manually update the menu on first load 
updateMenu();

// Listen for changes in window focus and update the menu every time it happens.
chrome.windows.onRemoved.addListener(windowRemovedHandler);
chrome.windows.onFocusChanged.addListener(updateMenu);
