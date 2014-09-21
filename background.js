sym = '^';
chrome.runtime.getPlatformInfo(function(info) {
    if (info.os === 'mac') {
        sym = '⌘';
    }
});

function updateTab(info) {
    if (
        // Ignore pinned tabs
        info.pinned ||

        // We can only fast switch to tabs 1-9
        info.index > 8 ||

        // Don't change title unless request is complete
        info.status !== 'complete' ||

        // Ignore chrome and file urls
        info.url.indexOf('http') !== 0 ||

        // Ignore Chrome Web Store
        info.url.indexOf('https://chrome.google.com/webstore/') === 0
    ) {
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
    }, function() {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
        }
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
