var map = [];

let inputFocus = false;
$(document).on('focus', 'input', function() {
  inputFocus = true;
});
$(document).on('focusout', 'input', function() {
  inputFocus = false;
});

document.body.onkeydown = document.body.onkeyup = function(e) {
  e = e || event; // to deal with IE
  map[e.keyCode] = (e.type == 'keydown');
  if (inputFocus) {
    if (map[27]) {
      e.preventDefault();
      inputFocus = false;
      $('#sidebar-toggle').click();
    }
  } else {
    // Otherwise, prevent the default functionality and execute the shortcut
    if (map[27] && sidebarOpen) {
      e.preventDefault();
      $('#sidebar-toggle').click();
    }
    if (map[32]) {
      e.preventDefault();
      playPause();
    }
    if (map[39] && map[16]) {       /* shift + right arrow */
      e.preventDefault();
      fastForward(8);
    }
    if (map[39] && !map[16]) {      /* right arrow */
      e.preventDefault();
      fastForward(.5);
    }
    if (map[37] && map[16]) {       /* shift + left arrow */
      e.preventDefault();
      rewind(8);
    }
    if (map[37] && !map[16]) {      /* left arrow */
      e.preventDefault();
      rewind(.5);
    }
    if (map[77] || map[192]) {      /* M or `*/
      e.preventDefault();
      $('#sidebar-toggle').click();
    }
    if (map[188]) {                 /* , */
      e.preventDefault();
      previousSong();
    }
    if (map[190]) {                 /* . */
      e.preventDefault();
      nextSong();
    }
    if (map[191]) {                 /* / */
      e.preventDefault();
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
