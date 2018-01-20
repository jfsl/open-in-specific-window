var openActive = false;
var windowTitles = [];

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "open-in-specific-window");
  
  port.onMessage.addListener(function(msg) {
    if (msg.action == 'rename') {
      windowTitles[msg.id] = msg.name;
      updateMenu();
    } else if (msg.action == 'get-name') {
      port.postMessage(windowTitles[msg.id]);  
    }
  });
});

function tabOpenerFunction (windowId) {
  return function (onClickEvent) {
    var url = onClickEvent.linkUrl;

    chrome.tabs.create({
      windowId: windowId,
      url: url,
      active: openActive
    });
  };
}

function updateMenu (focusChangedEvent) {
  chrome.contextMenus.removeAll(function () {
    var mainMenu = chrome.contextMenus.create({
      title: 'Open in specific window',
      contexts: ['link']
    });

    chrome.windows.getAll(function (windows) {
      var i       = 0,
          title   = '',
          height  = 0,
          width   = 0,
          id      = 0;

      for (i = windows.length-1; i >= 0 ; i--) {
        chrome.tabs.query({
            active: true,
            windowId: windows[i].id
          },

          function (result) {
            id = result[0].windowId;
            height = result[0].height;
            width = result[0].width;
            tabTitle = result[0].title;

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

updateMenu();
chrome.windows.onFocusChanged.addListener(updateMenu);
