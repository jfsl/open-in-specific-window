var openActive = false; // Defines wether or not 
var windowTitles = []; // Array of windowId -> name associations if the windows have been named by the user

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
    active: openActive
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
  var openerHandler = function (onClickEvent) {
    var url = onClickEvent.linkUrl;
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
    var mainMenu = chrome.contextMenus.create({
      title: 'Open in specific window',
      contexts: ['link']
    });

    chrome.windows.getAll(function (windows) {
      var i = 0,
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
            var tabTitle = result[0].title;

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

  port.onMessage.addListener(function (msg) {
    if (msg.action == 'rename') {
      // Rename action will associate a name with a given window id
      windowTitles[msg.id] = msg.name;
      updateMenu();
    } else if (msg.action == 'get-name') {
      // Get name action will return the name associated with a given window id
      port.postMessage(windowTitles[msg.id]);
    }
  });
});


/**
 * Finds the window id with the given title, returns false if not found 
 * @param {String} title
 * @returns {int|False} 
 */
function findWindowIdWithTitle(searchTitle) {
  for (idx = 0; idx < windowTitles.length; idx++) {
    if (windowTitles[idx] == searchTitle) {
        return idx;
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
    var response = {
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
      var windowId = findWindowIdWithTitle(request.title);

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
      // openTavInWindow action will open the requested url in the requested window id
      createTab(request.windowId, request.url);
    }
  }
);

// Manually update the menu on first load 
updateMenu();

// Listen for changes in window focus and update the menu every time it happens.
chrome.windows.onFocusChanged.addListener(updateMenu);
