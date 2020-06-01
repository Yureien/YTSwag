$.get(chrome.extension.getURL('/loader/popup_options.html'), function (data) {
    $('ytmusic-app').append($($.parseHTML(data)));
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
    var closeTimeout = null;
    $("body").on('mouseenter', "#ytswag-toggle, #ytswag-settings", function () {
        if (closeTimeout) clearTimeout(closeTimeout);
        $("#ytswag-settings").show();
        positionPopup();
    });

    $("body").on('mouseleave', "#ytswag-toggle, #ytswag-settings", function () {
        closeTimeout = setTimeout(function () { $("#ytswag-settings").hide() }, 200); // delay before closing it, so not accidentally closed.
    });

    $("paper-toggle-button").each(function () {
        var btn = $(this);
        var action = btn.data("action");
        if (!action) return;
        var key = action + "Enabled";
        chrome.storage.sync.get([key], function (result) {
            if (result[key] !== undefined) {
                var checked = result[key] === true;
                btn.attr("checked", checked);
                if (action === 'queue' && !checked) {
                    $('ytmusic-player').addClass('no-queue');
                    $(".side-panel:not(#lyrics-panel)").addClass('disabled');
                }
            }
        });
    });
    $("paper-toggle-button").click(function () {
        var btn = $(this);
        var action = btn.data('action');
        if (!action) return;
        var key = btn.data("action") + "Enabled";
        let checked = btn.attr('checked') ? true : false;
        chrome.storage.sync.set({ [key]: checked });
        if (action === 'lyrics') {
            // stores current state on DOM
            var title = $(".title.ytmusic-player-bar")[0];
            title.setAttribute('lyrics', checked);
            $("#lyrics-panel").toggleClass('disabled', !checked);
        } else if (action === 'queue') {
            $('ytmusic-player').toggleClass('no-queue', !checked);
            $(".queue-panel").toggleClass('disabled', !checked);
        } else {
            // TODO: all actions without reload
            location.reload(true);
        }
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

    $('.open-settings').click(async function() {
        chrome.runtime.sendMessage({"action": "openOptionsPage"});
    });
});

var menuPosition = 0;
function positionPopup() {
    var menu = $('iron-dropdown.ytmusic-popup-container')[0];
    var curMenu = menu.offsetLeft + menu.offsetTop + menu.offsetHeight;
    if (menuPosition !== curMenu) {
        menuPosition = curMenu;
        var settings = $("#ytswag-settings");
        var css = {
            top: (menu.offsetTop + menu.offsetHeight - settings[0].offsetHeight) + "px"
        }
        if (menu.offsetLeft + menu.offsetWidth + settings[0].offsetWidth < window.innerWidth) // Add to right, enough space on right
            css.left = (menu.offsetLeft + menu.offsetWidth) + "px";
        else // Add to left, not enough space on right
            css.left = (menu.offsetLeft - settings[0].offsetWidth) + "px";
        settings.css(css);
    }
}

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// Make songs double-clickable
$(document).on('dblclick', 'ytmusic-responsive-list-item-renderer, ytmusic-list-item-renderer, ytmusic-player-queue-item', function () {
    $(this).find('.ytmusic-play-button-renderer').click();
});
