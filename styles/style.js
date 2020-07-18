chrome.storage.sync.get(['theme'], function (result) {
    // by default, disabled. (use default.css cause some issues with lyrics)
    var theme = result['theme'] ? result['theme'] : 'default';

    // Load CSS
    
    var path = chrome.extension.getURL(`/styles/${theme}.css`);
    $('head').append($('<link>')
        .attr("rel", "stylesheet")
        .attr("type", "text/css")
        .attr("href", path));

});