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
  } else if (sidebarOpen) {
    if (map[27]) {
      e.preventDefault();
      $('#sidebar-toggle').click();
    }
  } else if (settingsOpen) {
    if (map[27]) {
      e.preventDefault();
      $('#settings-toggle').click();
    }
  } else {
    if (map[13]) {                  /* enter key */
      e.preventDefault();
      $('.cursor').click();
    }
    if (map[32]) {                  /* space bar */
      e.preventDefault();
      playPause();
    }
    if (map[37] && map[16]) {       /* shift + left arrow */
      e.preventDefault();
      rewind(8);
    }
    if (map[37] && !map[16]) {      /* left arrow */
      e.preventDefault();
      rewind(.5);
    }
    if (map[38]) {                  /* up arrow */
      e.preventDefault();
      cursorUp();
    }
    if (map[39] && map[16]) {       /* shift + right arrow */
      e.preventDefault();
      fastForward(8);
    }
    if (map[39] && !map[16]) {      /* right arrow */
      e.preventDefault();
      fastForward(.5);
    }
    if (map[40]) {                  /* down arrow */
      e.preventDefault();
      cursorDown();
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
  console.log(map[50]);
  if (map[50]) {
    // Search track on zippyshare
    const url = sites[0].url;
    searchTrackOn(track, url);
    map[50] = false;
  } else if (map[51]) {
    // Search channel on zippyshare
    const url = sites[0].url;
    searchChannelOn(track, url);
    map[51] = false;
  } else if (map[52]) {
    // Search track on thepiratebay
    const url = sites[1].url;
    searchTrackOn(track, url);
    map[52] = false;
  } else if (map[53]) {
    // Search channel on thepiratebay
    const url = sites[1].url;
    searchChannelOn(track, url);
    map[53] = false;
  } else if (map[54]) {
    // Search track on beatport
    const url = sites[2].url;
    searchTrackOn(track, url);
    map[54] = false;
  } else if (map[55]) {
    // Search channel on beatport
    const url = sites[2].url;
    searchChannelOn(track, url);
    map[55] = false;
  } else {
    fillAutoqueue(element);
    loadSong(track);
  }
}
