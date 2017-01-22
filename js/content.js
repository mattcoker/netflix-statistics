// I fully expect the Gods of Javascript to smite me for this, but page-scoped
// JS variables are not accessible to extensions at this time. So, I need to get
// the current Netflix API "BUILD_IDENTIFIER", which just so happens to be
// available in the page script tags.
//
// May Brendan Eich have mercy on my soul.

var scripts = Array.prototype.slice.call( document.scripts );
var buildId = null;
scripts.forEach((script, index) => {
  var biIndex = script.innerHTML.indexOf('BUILD_IDENTIFIER');
  if (biIndex > -1) {
    var trimFront = script.innerHTML.substring(biIndex + 19);
    buildId = trimFront.substring(0, trimFront.indexOf('\"'));
  }
});

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "getNetflixBuildID":
                sendResponse(buildId);
                break;
            default:
                console.error("Unrecognised message: ", message);
        }
    }
);