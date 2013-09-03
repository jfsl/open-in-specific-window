var openActive = false;

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
        id      = windows[i].id;
        height  = windows[i].height;
        width   = windows[i].width;

        title = '' + id + ' (' + width + ' x ' + height + ') ';

        chrome.contextMenus.create({
          title: title,
          contexts: ['link'],
          onclick: tabOpenerFunction(id),
          parentId: mainMenu
        });
      }
    });
  });
}


updateMenu();

chrome.windows.onFocusChanged.addListener(updateMenu);