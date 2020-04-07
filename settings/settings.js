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
        if (action === 'lyrics') {
            // stores current state on DOM
            var title = $(".title.ytmusic-player-bar")[0];
            title.setAttribute('lyrics', checked);
            $("#lyrics-panel")[0].style.display = checked ? 'block' : 'none';
        } else {
            // TODO: all actions without reload
            location.reload(true);
        }
    });
    $("#queueToggle").click(function () {
        $(".queue-panel").toggle();
        $(".toggle-player-page-button.style-scope.ytmusic-player-bar").click();
        $(".toggle-player-page-button.style-scope.ytmusic-player-bar").click();
    });

    $('#start-picture-in-picture').click(async function () {
        const video = $('#movie_player > div.html5-video-container > video')[0];

        if (!video || video.videoWidth === 0) {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            }

            return;
        }

        try {
            if (video !== document.pictureInPictureElement) {
                await video.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        } catch (error) {
            console.log(`> Error occurred while trying to start the pip mode: ${error}`);
        }
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
$(document).on('dblclick', '#contents > ytmusic-responsive-list-item-renderer, #contents > ytmusic-list-item-renderer, #contents > ytmusic-player-queue-item', function () {
    $(this).find('.ytmusic-play-button-renderer').click();
});
