$(".side-panel.style-scope.ytmusic-player-page:not('#lyrics-panel')").addClass("queue-panel"); // confusing with 2 panels
var defaultCCLang = 'en';

chrome.storage.sync.get(['lyricsEnabled', 'ccLang'], function (result) {
    var lyricsEnabled = result['lyricsEnabled'] === true;
    defaultCCLang = result['ccLang'] ? result['ccLang'] : 'en'; // Default, english.
    // stores lyricsState on DOM
    $(".title.ytmusic-player-bar")[0].setAttribute('lyrics', lyricsEnabled);
    $.get(chrome.extension.getURL('/lyrics/lyrics.html'), function (data) {
        $($.parseHTML(data)).insertBefore($('#main-panel'));
    });

    observer.observe($(".title.ytmusic-player-bar")[0], {
        subtree: true,
        attributes: true,
        childList: true,
        characterData: true
    });

    timeObserver.observe($(".time-info")[0], {
        subtree: true,
        attributes: true,
        childList: true,
        characterData: true
    });
});

chrome.storage.sync.get(['subtitlesEnabled'], function (result) {
    var subtitlesEnabled = false;
    subtitlesEnabled = result['subtitlesEnabled'] === false;
    if (subtitlesEnabled) {
        ccObserver.observe($(".player-wrapper.style-scope.ytmusic-player")[0], {
            subtree: true,
            attributes: true,
            childList: true,
            characterData: true
        });
    }
});

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var lastVid = null;

var ccObserver = new MutationObserver(function (mutations, observer) {
    var cc = $(".caption-window");
    if (cc) {
        cc.hide();
    }
});

var observer = new MutationObserver(function (mutations, observer) {
    var titleLink = $('.ytp-title-link.yt-uix-sessionlink');
    var isOpen = location.href.includes('watch');
    if ((titleLink[0] && titleLink[0].href) || isOpen) {
        // get video ID by url or DOM
        var url = isOpen ? location : titleLink[0];
        var vid = url.href.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i)[1];

        togglePIP();
        var lyricsEnabled = $(".title.ytmusic-player-bar")[0]
            .getAttribute('lyrics') === "true";
        $('ytmusic-player').toggleClass('no-lyrics', !lyricsEnabled);
        $('#lyrics-panel').toggleClass('disabled', !lyricsEnabled);
        if (lyricsEnabled && vid !== lastVid) {
            $("#lyrics").text("Searching...");
            lastVid = vid;
            processOfficial(vid, defaultCCLang);
        }
    }
});

function togglePIP() {
    // Close PIP case not video
    const video = $('#movie_player > div.html5-video-container > video')[0];
    if ((!video || video.videoWidth === 0) &&
        document.pictureInPictureElement) {
        document.exitPictureInPicture();
    }
}

function processOfficial(vid, lang) {
    console.log(lang);
    var surl = `https://video.google.com/timedtext?lang=${lang}&v=${vid}`;
    chrome.runtime.sendMessage(
        { action: "scrape", url: surl },
        data => {
            if (data) {
                var xml = $($.parseXML(data));
                var subs = {};
                $("text", xml).each(function (i) {
                    subs[Math.round(parseFloat($(this).attr('start')))] = {
                        text: $($.parseHTML($(this).text())).text().trim(),
                        end: Math.round(parseFloat($(this).attr('dur')) * 1000)
                    };
                });
                $("#lyrics").text("");
                $.each(subs, function (k, v) {
                    $("#lyrics").append($("<span class='subtitle' data-at='" + k + "' data-end='" + v.end + "'>" + v.text + "</span><br>"));
                });
                highlight = true;
            } else {
                if (lang != 'en') // Try to fallback to english CC
                    processOfficial(vid, 'en');
                else { // Fallback to Genius
                    var byline = $(".byline.ytmusic-player-bar")[0];
                    var title = $(".title.ytmusic-player-bar")[0];
                    if (title && byline)
                        processGenius(title.textContent, byline.textContent);
                }
            };
        });
}

// Genius regexes:
brc = /([(\[](feat|ft)[^)\]]*[)\]]|- .*)/gi  // matches braces with feat included or text after -
aln = /[^ \-a-zA-Z0-9]+/g  // matches non space or - or alphanumeric characters
spc = / *- *| +/g  // matches one or more spaces
wth = /(?: *\(with )([^)]+)\)/g  // capture text after with
nlt = /[^\x00-\x7F\x80-\xFF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g  // match only latin characters,
// built using latin character tables (basic, supplement, extended a,b and extended additional)


function processGenius(title, artist) {
    if (artist.indexOf("•") > -1) artist = artist.slice(0, artist.indexOf("•"));  // Extract artist if song, ex "Clean Bandit • Speak Your Mind (Deluxe) • 2018"

    title = title.trim();
    title = title.replace(brc, ""); // remove braces and included text with feat and text after '- '
    title = title.replace(/(radio|movie|tv)[ -]*(version|edit)/gi, ''); // Remove radio/movie/tv version/edit

    ft = title.match(wth);  // find supporting artists if any
    if (ft) {
        title = title.replace(wth, "");  // remove (with supporting artists) from song
        ar = ft[1]; // the supporting artist(s)
        if (ar.includes("&")) {  // check if more than one supporting artist and add them to artist
            artist += `-${ar}`;
        } else {
            artist += `-${ar}`;
        }
    }

    url_data = `${artist}-${title}`;
    url_data = url_data.replace("&", "and");
    url_data = url_data.replace(/\/\!_ØØ/g, " ");
    url_data = url_data.replace(nlt, "");  // remove non-latin characters before unidecode
    url_data = url_data.normalize("NFD").replace(/[\u0300-\u036f]/g, "");  // convert accents and other diacritics
    url_data = url_data.replace(aln, "").trim(); // remove punctuation and other characters
    url_data = url_data.replace(spc, "-");  // substitute one or more spaces to -

    url = "https://genius.com/" + url_data + "-lyrics";

    chrome.runtime.sendMessage(
        { action: "scrape", url: url },
        data => {
            var el = $('<div></div>');
            el.html(data);

            var lyrics = $(".lyrics", el).text(); // First try to get lyrics from old style UI
            var hasLyrics = (!(!lyrics || 0 === lyrics.length)); // check if exists

            if (!hasLyrics) { // Try new format
                var lyricsArr = [];
                $("[class^=Lyrics__Container]", el).each(function () {
                    lyricsArr.push($(this).html().replace(/<br>/g, '\n').replace(/<.*?>/g, ''))
                });
                lyrics = lyricsArr.join("\n");
                hasLyrics = (!(!lyrics || 0 === lyrics.length));
            }

            lyrics = lyrics.trim().replace(/\n/g, "<br>").trim(); // Trim and convert \n to <br>

            var hasLyrics = hasLyrics && lyrics != "[Instrumental]" && lyrics != "Instrumental"; // Instrumental not needed

            $('ytmusic-player').toggleClass('no-lyrics', !hasLyrics);
            $('#lyrics-panel').toggleClass('disabled', !hasLyrics);
            if (hasLyrics) $("#lyrics").html(lyrics);
        });
}


var timeObserver = new MutationObserver(function (mutations, observer) {
    var strtime = $(".time-info")[0].textContent.trim().split("/")[0].trim().split(":");
    var secs = parseInt(strtime[0]) * 60 + parseInt(strtime[1]);
    var sub = $(".subtitle[data-at='" + secs + "']");
    if (sub.length) {
        $(".subtitle").css('font-weight', '100');
        $(".subtitle").css('color', 'rgb(200, 200, 200)');
        setTimeout(function () {
            sub.css('color', 'rgb(200, 200, 200)');
            sub.css('font-weight', '100');
        }, sub.data('end'));
        sub.css('color', 'rgb(250, 250, 250)');
        sub.css('font-weight', '800');
    }
});
