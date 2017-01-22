chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var popupTemplate = 'not-supported.html';
    if (tab.url.indexOf('netflix') > -1) {
        popupTemplate = 'popup.html';
    }

    chrome.browserAction.setPopup({
        tabId: tabId,
        popup: '/html/' + popupTemplate
    });
});

chrome.browserAction.onClicked.addListener( function() {
  chrome.tabs.executeScript( { file: 'content.js' } );
});
