$.get(chrome.extension.getURL('/settings/settings.html'), function (data) {
    $('#right-content').prepend($($.parseHTML(data)));
    $("#ytswag-settings").hide();
    // open ytsettings and dynamically add ytswag-toggle
    $("paper-icon-button.ytmusic-settings-button").on('click', function () {
        if ($("#ytswag-toggle")[0]) return;

        // clone yt element, append and modify
        var originEl = $('ytd-compact-link-renderer');
        el = document.createElement('div');
        el.id = "ytswag-toggle";
        el.innerHTML = originEl[2].innerHTML;
        $('yt-multi-page-menu-section-renderer')[1].appendChild(el);

        var getHTML = (elem, find) => $(elem).find(find)[0];
        var setHTML = (elem, other) => elem.innerHTML = other.innerHTML;

        getHTML(el, "#label").innerHTML = `YTSwag Settings`;

        setHTML(getHTML(el, "yt-icon"), getHTML(originEl[6], "yt-icon"));
        setHTML(getHTML(el, "#right-icon"), getHTML(originEl[2], "#right-icon"));
    });
    // open settings on hover
    $("body").on('mouseenter mouseleave',"#ytswag-toggle, #ytswag-settings", function () {
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
            if (result[key] !== undefined) {
                var checked = result[key] === true;
                btn.attr("checked", checked);
                if (action === 'queue' && !checked) {
                    $(".side-panel:not(#lyrics-panel)").hide();
                }
            }
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
        } else if (action === 'queue') {
            $(".queue-panel").toggle();
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

    $('.start-picture-in-picture').click(async function () {
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
