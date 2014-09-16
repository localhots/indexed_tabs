sym = '^';
chrome.runtime.getPlatformInfo(function(info) {
    if (info.os === 'mac') {
        sym = '⌘';
    }
});

var update = function(info) {
    // Ignore pinned tabs
    if (info.pinned) {
        return;
    }

    // Ignore chrome pages
    if (!info.url.match(/^http/)) {
        return;
    }

    // Ignore Chrome Web Store (restricted)
    if (info.url.indexOf("https://chrome.google.com/webstore/") === 0) {
        return;
    }

    var title = info.title,
        regexp = new RegExp('^' + (sym === '^' ? '\\^' : sym) + '\\d+\\s(.*)'),
        m = regexp.exec(title);

    if (m && m.length == 2) {
        title = m[1];
    }

    title = sym + (info.index + 1) +' ' + title;

    chrome.tabs.executeScript(info.id, {
        code: "document.title = '" + title + "';"
    });
};

function updateAll() {
    chrome.tabs.query({}, function(tabs) {
        for (var i = 0, tab; tab = tabs[i]; i++) {
            update(tab);
        }
    });
}

chrome.tabs.onMoved.addListener(updateAll);
chrome.tabs.onRemoved.addListener(updateAll);
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
    update(tabInfo);
});

updateAll();
