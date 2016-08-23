var map = [];
document.body.onkeydown = document.body.onkeyup = function(e) {
  e = e || event; // to deal with IE
  map[e.keyCode] = e.type == 'keydown';
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
}

function playPause() {
  if (!audioPlayer.paused) {
    audioPlayer.pause();
    bgScroll(false);
  } else {
    bgScroll(true);
    audioPlayer.play();
  }
}

function nextSong() {
  if (queue.length > 0) {
    var track = queue.shift();
  } else {
    var track = autoqueue.shift();
  }
  backqueue.unshift(track);
  loadSong(track);
}

function previousSong() {
  var track = backqueue.shift();
  queue.unshift(track);
  loadSong(track);
}

function fastForward(seconds) {
  audioPlayer.currentTime = audioPlayer.currentTime + seconds;
}

function rewind(seconds) {
  audioPlayer.currentTime = audioPlayer.currentTime - seconds;
}

$('#artworkimg').click(playPause);

//TODO: Seeking should be based on the width of the waveform, not the window's width.
$('#back-div').click(function(e) {
  //how far you clicked into the div's width by percent. 1.0 is to cast to double
  let relativePercent = e.pageX / ($(window).width() * 1.0);
  console.log(relativePercent + '%');
  let seekPosition = Math.round(duration * relativePercent);
  bgScroll(true, seekPosition / 1000, duration / 1000);
  console.log("seekpos: " + seekPosition);
  audioPlayer.currentTime = seekPosition / 1000.0;
  audioPlayer.play();
});

let audioPlayer = new Audio();
//Just did this cause the other guy did it, seems like its kew
audioPlayer.crossOrigin = "anonymous";
audioPlayer.addEventListener("ended", autoplayNextSong);

function autoplayNextSong(){
  const autoplay = getOpt('autoplay');
  if (autoplay) {
    nextSong();
  }
}

function loadSong(track) {
  var trackid = track.t.properties.scid;
  var durationms = track.t.properties.duration;
  var artworkurl = track.t.properties.artwork_url;
  var waveformurl = track.t.properties.waveform_url;

  angular.element(document.getElementById('libraryCtlrDiv')).scope().incPlayCount(track);

  highlightRow(track);

  audioPlayer.src = 'http://api.soundcloud.com/tracks/' + trackid + '/stream' + '?client_id=a3629314a336fd5ed371ff0f3e46d4d0';
  audioPlayer.load();
  audioPlayer.play();
  loadWaveform(track.t._id);

  $(".track-title").text(track.t.properties.name);
  $(".track-channel").text(track.c.properties.name);

  duration = durationms;

  //Load artwork image to DOM
  $('#artworkimg').css('background-image', "url(" + artworkurl + ")");
  $('#art-bk').css('background-image', "url(" + artworkurl + ")");

  //expand the player
  $('#player').addClass('playing');

  //TODO, (maybe, or just have a func that passes these params, ajax can call that func) grab the duration from the backend like we do client_id above, that is how we calculate how much of the song has been listened to. wtf why isn't there a better way...
  //TODO (sames) grab the waveform url from backend like above

  var seconds = Math.round((duration / 1000) * 1.0);
  bgScroll(true, 0, seconds); // start bg scrolling
}


var lastShift = 0.0;

function bgScroll(play, pos, dur) {
  element = document.getElementById("art-bk");
  var bkDiv = jQuery('#art-bk'),
    shiftOff = (dur - pos), // distance from the end in seconds
    perShift = Math.round(pos / dur * 100.0), // percentage
    computedStyle = window.getComputedStyle(element),
    backgroundPer = computedStyle.getPropertyValue('background-position-y');

  // bkDiv.removeClass('moving'); // stop the moving
  element.classList.remove("moving");
  console.log(dur + ' ' + pos + ' ' + play + ' ' + perShift + '+');

  // set new position as percentage
  if (dur) {
    bkDiv.css('background-position-y', perShift + '%');
    lastShift = shiftOff;
  } else {
    bkDiv.css('background-position-y', backgroundPer + '%');
  }

  if (play) {
    // set/reset transition to time remaining
    bkDiv.css('transition', 'none');
    if (dur) {
      window.setTimeout(function() {
        element.classList.add("moving");
        bkDiv.css('transition', 'background-position ' +
          shiftOff + 's linear');
      }, 40);
    } else {
      element.classList.add("moving");
      bkDiv.css('transition', 'background-position ' +
        lastShift + 's linear');
    }

  } else {
    bkDiv.css('background-position-y', backgroundPer);
  }
}

// used to track resize direction
var left = false;

function snapToPercents(parentEl) {
  var parWid = parentEl.width();
  var colCt = parentEl.children().length;
  var catchAdd = 0;
  var j = 0;
  parentEl.children('li').each(function() {
    // iterate through li + siblings
    var eachC = "." + $(this).find('a').attr('also-resize');
    if (j == colCt - 1) {
      // force clearing
      var catchAll = 100.0 - catchAdd;
      //console.log(catchAdd + " + " + catchAll);
      $(this).css('width', catchAll.toString() + "%");
    } else {
      var perW = ($(this).width() / parWid) * 100;
      $(this).css('width', perW.toString() + "%");
      //console.log(j + " - " + perW.toString() + "%");
      catchAdd += perW;
    }
    // resize col's below
    $(eachC).each(function() {
      if (j == colCt - 1) {
        $(this).css('width', catchAll.toString() + "%");
      } else {
        $(this).css('width', perW.toString() + "%");
      }
    });
    j++;
  });
}

function attachColHandles() {
  $('.col-sizeable').each(function() {
    // multiple loops and class vs id
    $(this).children('li').each(function() {
      // elements with class matching col header
      // are resized in stop fn
      var thisClass = "." + $(this).find('a').text().toLowerCase();

      // keep handles off first/last cols
      if ($(this).is('li:last-of-type')) {
        var handles = 'sw';
      } else if ($(this).is('li:first-of-type')) {
        var handles = 'se';
      } else {
        var handles = 'se, sw';
      }

      // make each col-header resizable
      $(this).resizable({
        handles: handles,
        autoHide: true,
        minHeight: 30,
        maxHeight: 30,

        resize: function(event, ui) {
          // hack to determine resize dir
          var srcEl = event.originalEvent.originalEvent.path[0].className;
          var dragD = srcEl.replace('ui-resizable-handle ui-resizable-', '');
          var dragC = srcEl.replace('ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-', '');

          // toggle direction global
          // as dragD/C value is somewhat unpredictable
          if (dragD == 'sw' || dragC == 'sw') {
            left = true;
          } else if (dragD == 'se' || dragC == 'sw') {
            left = false;
          }

          var headerW = $(this).parent().width();
          var cumW;
          var colCount;
          // behaviour varies by drag side
          if (!left) {
            colCount = $(this).nextAll('li').length;
            cumW = 0;
            $(this).prevAll().each(function() {
              // sum col widths to the left
              cumW += $(this).width();
            });
            cumW += $(this).width();
            $(this).nextAll().each(function() {
              // set decreased width to other headers
              $(this).width(((headerW - cumW) / colCount) - 5);
            });
          } else {
            // left-side drag
            colCount = $(this).prevAll().length;
            cumW = 0;
            $(this).nextAll().each(function() {
              // sum col widths to the right
              // round to assist clearing
              cumW += $(this).width();
            });
            cumW += $(this).width();

            var k = 0;
            var runW = 0;
            $(this).prevAll().each(function() {
              // set decreased width to other headers
              var nowW = (headerW - cumW) / colCount;
              $(this).width(nowW);
              runW += nowW;
              if (k == 1) {
                // absorb error for clearing
                $(this).width(headerW - (cumW + runW));
              }
              k++;
            });
          }
        }
      });

      // bind a function to update lower widths
      $(this).on('resizestop', function() {
        left = false; // reset global hack for dir
        snapToPercents($(this).parent());
      });
    });
  });
}
