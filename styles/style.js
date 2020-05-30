chrome.storage.sync.get(['customThemeEnabled'], function (result) {
    // by default, enabled.
    var customThemeEnabled = result['customThemeEnabled'] === true || result['customThemeEnabled'] === undefined;
    if (!customThemeEnabled) return;

    // Load CSS
    var path = chrome.extension.getURL('/styles/youtube-music.css');
    $('head').append($('<link>')
        .attr("rel", "stylesheet")
        .attr("type", "text/css")
        .attr("href", path));

});