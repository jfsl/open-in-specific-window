// @ts-check
var openActive = false;
var windowTitles = [];

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

    chrome.tabs.create({
      windowId: windowId,
      url: url,
      active: openActive
    });
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
        chrome.tabs.query({
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

chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name == "open-in-specific-window");

  port.onMessage.addListener(function (msg) {
    if (msg.action == 'rename') {
      windowTitles[msg.id] = msg.name;
      updateMenu();
    } else if (msg.action == 'get-name') {
      port.postMessage(windowTitles[msg.id]);
    }
  });
});

updateMenu();
chrome.windows.onFocusChanged.addListener(updateMenu);
