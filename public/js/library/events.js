var map = [];

let inputFocus = false;
$(document).on('focus', '#search-bar', function() {
  inputFocus = true;
});
$(document).on('focusout', '#search-bar', function() {
  inputFocus = false;
});

$(document).on('focus', '#add-playlist-input', function() {
  inputFocus = true;
});
$(document).on('focusout', '#add-playlist-input', function() {
  inputFocus = false;
});

document.body.onkeydown = document.body.onkeyup = function(e) {
  e = e || event; // to deal with IE
  map[e.keyCode] = (e.type == 'keydown');
  if (inputFocus) {
    // If search is in focus, don't do anything
    return;
  } else {
    // Otherwise, prevent the default functionality and execute the shortcut
    e.preventDefault();
    if (map[32]) {
      playPause();
    }
    if (map[39] && map[16]) {
      fastForward(8);
    }
    if (map[39] && !map[16]) {
      fastForward(.5);
    }
    if (map[37] && map[16]) {
      rewind(8);
    }
    if (map[37] && !map[16]) {
      rewind(.5);
    }
    if (map[188]) {
      previousSong();
    }
    if (map[190]) {
      nextSong();
    }
    if (map[191]) {
      randomSong();
    }
  }
}

$(document).on('click', '.track-row', function() {
  const tid = $(this).data('id');
  const url = $(this).data('url');
  if (map[49]) {
    openPurchaseUrl(tid, url);
  }
})

function trackClickListener(track, element){
  if (map[50]) {
    // Search track on zippyshare
    const url = sites[0].url;
    searchTrackOn(track, url);
  } else if (map[51]) {
    // Search channel on zippyshare
    const url = sites[0].url;
    searchChannelOn(track, url);
  } else if (map[52]) {
    // Search track on thepiratebay
    const url = sites[1].url;
    searchTrackOn(track, url);
  } else if (map[53]) {
    // Search channel on thepiratebay
    const url = sites[1].url;
    searchChannelOn(track, url);
  } else if (map[54]) {
    // Search track on beatport
    const url = sites[2].url;
    searchTrackOn(track, url);
  } else if (map[55]) {
    // Search channel on beatport
    const url = sites[2].url;
    searchChannelOn(track, url);
  } else {
    fillAutoqueue(element);
    loadSong(track);
  }
}