$(".side-panel.style-scope.ytmusic-player-page:not('#lyrics-panel')").addClass("queue-panel");

$.get(chrome.extension.getURL('/inject.html'), function(data) {
    $($.parseHTML(data)).insertBefore($('#main-panel'));
});

$(".queue-title.style-scope.ytmusic-player-page").click(function() {
    $(".queue-panel").hide();
    $(".toggle-player-page-button.style-scope.ytmusic-player-bar").click();
    $(".toggle-player-page-button.style-scope.ytmusic-player-bar").click();
});

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var lastVid = null;

var observer = new MutationObserver(function(mutations, observer) {
    if ($(".ytp-title-link.yt-uix-sessionlink")) {
        var url = $(".ytp-title-link.yt-uix-sessionlink").attr('href');
        var vid = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i)[1];
        if (vid !== lastVid) {
            $("#lyrics").text("");
            lastVid = vid;
            if (!processLink(vid)) {
                var byl = document.querySelector(".byline.ytmusic-player-bar");
                var tit = document.querySelector(".title.ytmusic-player-bar");
                if (tit && byl)
                    process(tit.textContent,
                            byl.textContent);
            }
        }
    }
});

observer.observe(document.querySelector(".title.ytmusic-player-bar"), {
    subtree: true,
    attributes: true,
    childList: true, 
    characterData: true
});

function processLink(vid) {
    var surl = "https://video.google.com/timedtext?lang=en&v="+vid;
    nulldata = false;
    chrome.runtime.sendMessage({action: "scrape", url: surl},
                               data => {
                                   if (data != null) {
                                       var xml = $($.parseXML(data));
                                       var subs = {};
                                       $("text", xml).each(function(i) {
                                           subs[Math.round(parseFloat($(this).attr('start')))] = {
                                               text: $($.parseHTML($(this).text())).text().trim(),
                                               end: Math.round(parseFloat($(this).attr('dur'))*1000)
                                           };
                                       });
                                       $("#lyrics").text("");
                                       $.each(subs, function(k, v) {
                                           $("#lyrics").append($("<span class='subtitle' style='font-size:1.2em' data-at='"+k+"' data-end='"+v.end+"'>"+v.text+"</span><br>"));
                                       });
                                       highlight = true;
                                   } else nulldata = true;
                               });
    return !nulldata;
}


var timeObserver = new MutationObserver(function(mutations, observer) {
    var strtime = document.querySelector(".time-info").textContent.trim().split("/")[0].trim().split(":");
    var secs = parseInt(strtime[0])*60+parseInt(strtime[1]);
    var sub = $(".subtitle[data-at='"+secs+"']");
    if (sub.length) {
        $(".subtitle").css('font-weight', '100');
        $(".subtitle").css('color', 'rgb(200, 200, 200)');
        setTimeout(function() {
            sub.css('color', 'rgb(200, 200, 200)');
            sub.css('font-weight', '100');
        }, sub.data('end'));
        sub.css('color', 'rgb(250, 250, 250)');
        sub.css('font-weight', '800');
    }
});

timeObserver.observe(document.querySelector(".time-info"), {
    subtree: true,
    attributes: true,
    childList: true, 
    characterData: true
});


function process(title, byline) {
    if (byline.indexOf("•") > -1) byline = byline.slice(0, byline.indexOf("•"));
    title = title.trim().replace(/ *\([^)]*\) */g, "").replace(/[^\w\s]/gi, "").toLowerCase();
    byline = byline.replace(/&/g, "and").replace(/[^\w\s]/gi, "").trim().toLowerCase();
    artist = byline.charAt(0).toUpperCase() + byline.slice(1);
    url_data = artist+"-"+title;
    url_data = url_data.replace(/ /g, "-");
    url = "https://genius.com/"+url_data+"-lyrics";
    chrome.runtime.sendMessage({action: "scrape", url: url},
                               data => {
                                   var el = $('<div></div>');
                                   el.html(data);
                                   $("#lyrics").html($(".lyrics", el).text().trim().replace(/\n/g, "<br>"));
                               });
}
