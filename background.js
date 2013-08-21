var openActive = false;

function tabOpenerFunction (id) {
  return function (event) {
    var url = event.linkUrl;

    chrome.tabs.create({
      windowId: id,
      url: url,
      active: openActive
    });
  };
}

var mainMenu = chrome.contextMenus.create({
  title: 'Open in specific tab',
  contexts: ['link'],
  onclick: function (event) {
    console.log('hello', mainMenu);
  }
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

    title = '' + id + ' (' + height + ' x ' + width + ') ';

    chrome.contextMenus.create({
      title: title,
      contexts: ['link'],
      onclick: tabOpenerFunction(id),
      parentId: mainMenu
    });
  }
});