var port = chrome.runtime.connect({ name: "open-in-specific-window" });
port.postMessage({action: 'shortcut-open-enabled'});

function linkClickedHandler(evt) {
    if (evt.altKey) {
        evt.preventDefault();
        port.postMessage({
            action: 'shortcut-open',
            url: evt.target.href
        });
    }
}

port.onMessage.addListener(function (msg) {
    switch (msg.action) {
        case 'shortcut-open-enabled':
            if (msg.response) {
                let links = document.getElementsByTagName('a');
                for (let i = 0; i < links.length; i++) {
                    link = links[i];
                    link.addEventListener('click', linkClickedHandler);
                }
            }
        break;
    }
});