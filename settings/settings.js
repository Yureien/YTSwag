$.get(chrome.extension.getURL('/settings/settings.html'), function (data) {
    $('#right-content').prepend($($.parseHTML(data)));
    $("#ytswag-settings").hide();
    $("#ytswag-icon").click(function () {
        $("#ytswag-settings").toggle();
    });
    $(document).mousedown(function (e) {
        var container = $("#ytswag-settings");
        if (!container.is(e.target) && container.has(e.target).length === 0)
            container.hide();
    });
    $("paper-toggle-button").each(function () {
        var action = $(this).data("action");
        if (!action) return;
        var key = action + "Enabled";
        var btn = $(this);
        chrome.storage.sync.get([key], function (result) {
            if (result[key] !== undefined)
                btn.attr("checked", result[key] === true);
        });
    });
    $("paper-toggle-button").click(function () {
        var action = $(this).data('action');
        if (!action) return;
        var key = $(this).data("action") + "Enabled";
        let checked = $(this).attr('checked') ? true : false;
        chrome.storage.sync.set({ [key]: checked });
        location.reload(true);
    });
    $("#queueToggle").click(function () {
        $(".queue-panel").toggle();
        $(".toggle-player-page-button.style-scope.ytmusic-player-bar").click();
        $(".toggle-player-page-button.style-scope.ytmusic-player-bar").click();
    });
    positionPopup();
});

function positionPopup() {
    $("#ytswag-settings").css({
        left: ($("#ytswag-icon").offset().left - $("#ytswag-settings").width() + $("#ytswag-icon").width()) + "px",
        top: ($("#ytswag-icon").offset().top + $("#ytswag-icon").height()) + "px"
    });
}

$(window).resize(function () {
    positionPopup();
});

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// Make songs double-clickable
var queueObserver = new MutationObserver(function (mutations, observer) {
    $("ytmusic-player-queue-item").each(function (index) {
        var elem = $(this);
        $(this).off("dblclick").dblclick(function () {
            $("ytmusic-play-button-renderer", elem).click();
        });
    });
});

queueObserver.observe(document.querySelector(".style-scope.ytmusic-player-queue"), {
    subtree: true,
    childList: true
});

var shelfObserver = new MutationObserver(function (mutations, observer) {
    if ($("#contents.style-scope.ytmusic-section-list-renderer>ytmusic-playlist-shelf-renderer"))
        $(".ytmusic-responsive-list-item-renderer, .ytmusic-list-item-renderer").each(function (index) {
            var elem = $(this).parent('.ytmusic-shelf-renderer, .ytmusic-playlist-shelf-renderer');
            $(this).off("dblclick").dblclick(function () {
                console.log('hi');
                $(".ytmusic-play-button-renderer", elem).click();
            });
        });
});

function observeShelf() {
    var shelf = document.querySelector("#contents.style-scope.ytmusic-section-list-renderer");
    if (shelf)
        shelfObserver.observe(shelf, {
            subtree: true,
            childList: true
        });
    else setTimeout(observeShelf, 500);
}
observeShelf();