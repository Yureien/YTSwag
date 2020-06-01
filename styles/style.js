chrome.storage.sync.get(['theme'], function (result) {
    // by default, disabled.
    var theme = result['theme'];
    if (!theme) return;

    // Load CSS
    
    var path = chrome.extension.getURL(`/styles/${theme}.css`);
    $('head').append($('<link>')
        .attr("rel", "stylesheet")
        .attr("type", "text/css")
        .attr("href", path));

});