sym = '^';
chrome.runtime.getPlatformInfo(function(info) {
    if (info.os === 'mac') {
        sym = '⌘';
    }
});

function updateTab(info) {
    // Ignore pinned tabs
    if (info.pinned) {
        return;
    }

    // We can only fast switch to tabs 1-9
    if (info.index > 8) {
        return;
    }

    // Ignore chrome pages
    if (!info.url.indexOf('http') === 0) {
        return;
    }

    // Ignore Chrome Web Store (restricted)
    if (info.url.indexOf('https://chrome.google.com/webstore/') === 0) {
        return;
    }

    var title = info.title,
        regexp = new RegExp('^' + (sym === '^' ? '\\^' : sym) + '\\d+\\s(.*)'),
        m = regexp.exec(title);

    if (m && m.length == 2) {
        title = m[1];
    }

    title = sym + (info.index + 1) + ' ' + title;

    chrome.tabs.executeScript(info.id, {
        code: "document.title = '" + title + "';"
    });
};

function updateAllTabs() {
    chrome.tabs.query({}, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            updateTab(tabs[i]);
        }
    });
}

chrome.tabs.onMoved.addListener(updateAllTabs);
chrome.tabs.onRemoved.addListener(updateAllTabs);
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
    updateTab(tabInfo);
});

updateAllTabs();
