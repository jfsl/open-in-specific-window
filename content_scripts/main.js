var port = chrome.runtime.connect({ name: "open-in-specific-window" });

port.postMessage({action: 'shortcut-open-enabled'});

port.onMessage.addListener(function (msg) {
    switch (msg.action) {
        case 'shortcut-open-enabled':
            console.log(msg);
        break;
    }
});


function linkClickedHandler(evt) {
    console.log();
    if (evt.altKey) {
        evt.preventDefault();
        port.postMessage({
            action: 'shortcut-open',
            url: evt.target.href
        });
    }
}

let links = document.getElementsByTagName('a');
for (let i = 0; i < links.length; i++) {
    link = links[i];
    link.addEventListener('click', linkClickedHandler);
}