// jshint esversion: 6
let playlist_menu, rating_menu, search_track_menu, search_channel_menu;

function updateMenu() {
    const context = curr_context;

    // Destroy the current context menus
    $.contextMenu('destroy');

    // Initialize rate track and search on menus
    buildSearchOnMenu();
    buildSearchChannelOnMenu();

    // Create object to hold context menu items
    var items = {};

    // Include add_playlist option in every context
    items.add_playlist = {
        name: "Add to playlist...",
        items: playlist_menu
    };

    // Include delete_playlist option when in a playlist context
    if (context == 'playlist') {
        items.delete_playlist = {
            name: "Delete from playlist",
            callback: function(key, opt) {
                var pid = curr_pid;
                var tid = opt.$trigger[0].dataset.id;
                var tname = opt.$trigger[0].dataset.track;
                var url = 'http://localhost:3000/api/playlists/' + pid + '/remove/' + tid;
                $.ajax({
                    url: url,
                    type: 'DELETE',
                    success: function() {
                        loadContext('playlist');
                        alertify.quick('danger', 'Removed:', tname);
                    }
                });
            }
        };
    }

    // Include delete_queue when in queue context, add_queue when not in queue context
    if (context == 'queue') {
        items.delete_queue = {
            name: "Delete from queue",
            callback: function(key, opt) {
                const tid = opt.$trigger[0].dataset.id;
                const tname = opt.$trigger[0].dataset.track;
                deleteFromQueue(tid);
                alertify.quick('danger', 'dequeued:', tname);
            }
        };
    } else {
        items.add_queue = {
            name: "Add to queue",
            callback: function(key, opt) {
                const tid = opt.$trigger[0].dataset.id;
                const tname = opt.$trigger[0].dataset.track;
                queue.push(tid);
                alertify.quick('info', 'queued:', tname);
            }
        };
    }

    if (context == 'deleted') {
        items.readd_library = {
            name: "Re-add to library",
            callback: function(key, opt) {
                const tid = opt.$trigger[0].dataset.id;
                const tname = opt.$trigger[0].dataset.track;
                toggleDelete(tid);
                alertify.quick('info', 'undeleted:', tname);
            }
        };
    } else {
        items.delete_library = {
            name: "<span class=text-danger>Delete from library</span>",
            isHtmlName: true,
            callback: function(key, opt) {
                const tid = opt.$trigger[0].dataset.id;
                const tname = opt.$trigger[0].dataset.track;
                toggleDelete(tid);
                alertify.quick('danger', 'deleted:', tname);
            }
        };
    }

    // Include separator
    items.sep1 = "---------";

    if (context != 'channel') {

        items.tracks_by_channel = {
            name: "Tracks by channel",
            callback: function(key, opt) {
                curr_cid = opt.$trigger[0].dataset.cid;
                loadContext('channel');
            }
        };

        // Include separator
        items.sep2 = "---------";
    }


    items.search_track_on = {
        name: "Search on...",
        items: search_track_menu
    };

    // items.search_channel_on = {
    //   name: "Search channel on...",
    //   items: search_channel_menu
    // }

    // Include link to soundcloud page
    items.soundcloud_page = {
        name: "Soundcloud page",
        callback: function(key, opt) {
            var url = opt.$trigger[0].dataset.url;
            window.open(url);
        }
    };

    var settings = {
        selector: '.track-row[data-purchase="false"]',
        items: items,
        reposition: true,
        autoHide: true,
        determinePosition: function($menu) {
            // Position using jQuery.ui.position
            // http://api.jqueryui.com/position/
            $menu.css('display', 'block')
                .position({
                    my: "right bottom",
                    at: "left top",
                    of: this,
                    collision: "fit"
                });
        }
    };

    // Create the context menu
    $.contextMenu(settings);

    // Include link to purchase url and change selector for tracks with purchase_url
    settings.items.purchase_link = {
        name: "Download page",
        callback: function(key, opt) {
            const tid = opt.$trigger[0].dataset.id;
            const url = opt.$trigger[0].dataset.url;
            openPurchaseUrl(tid, url);
        }
    };
    settings.selector = '.track-row[data-purchase="true"]';

    // Create the context menu
    $.contextMenu(settings);
}

function addToPlaylist(key, opt) {
    var pid = $('#' + key).data("id");
    var tid = opt.$trigger[0].dataset.id;
    var url = 'http://localhost:3000/api/playlists/' + pid + '/add/' + tid;
    $.post(url, {}, function(data) {
        console.log(data);
        alertify.quick('success', 'added to playlist', '');
    });
}

function buildAddToPlaylistMenu(result) {
    playlist_menu = {};
    for (var i = 0; i < result.length; i++) {
        var playlist = result[i];
        var next = {
            name: playlist.p.properties.name,
            callback: addToPlaylist
        };
        playlist_menu['playlist' + i] = next;
    }
}


function searchOn(key, opt) {
    var url = sites.find(x => x.name === key).url;
    var tname = opt.$trigger[0].dataset.track;
    searchTrackOn(tname, url);
}

function buildSearchOnMenu() {
    search_track_menu = {};
    for (var i = 0; i < sites.length; i++) {
        var name = sites[i].name;
        var track = {
            name: name,
            callback: searchOn
        };
        search_track_menu[name] = track;
    }
}

function searchChannel(key, opt) {
    var url = sites.find(x => x.name === key).url;
    var cname = opt.$trigger[0].dataset.channel;
    searchChannelOn(cname, url);
}

function buildSearchChannelOnMenu() {
    search_channel_menu = {};
    for (var i = 0; i < sites.length; i++) {
        var name = sites[i].name;
        var channel = {
            name: name,
            callback: searchChannel
        };
        search_channel_menu[name] = channel;
    }
}
