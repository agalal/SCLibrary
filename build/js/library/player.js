// jshint esversion: 6
let duration;
let currentlyPlaying;

function playPause() {
  var showIcon = 250;
  if (!audioPlayer.paused) {
    audioPlayer.pause();
    $('#pause-modal').modal("show");
    setTimeout(function () {
      $('#pause-modal').modal('hide');
    }, showIcon);
    bgScroll(false);
  } else {
    $('#play-modal').modal("show");
    setTimeout(function () {
      $('#play-modal').modal('hide');
    }, showIcon);
    bgScroll(true);
    audioPlayer.play();
    waveform();
  }
}

function nextSong() {
  var tid;

  if (queue.length > 0) {
    tid = queue.shift();
  } else if (autoqueue[0]){
     tid = autoqueue.shift();
  } else {
    console.log("There are no more tracks in the autoqueue.");
    return;
  }
  backqueue.unshift(currentlyPlaying);
  cursorDown();
  loadSong(tid);
}

function previousSong() {
  if (backqueue[0]){
    var tid = backqueue.shift();
    queue.unshift(currentlyPlaying);
    cursorUp();
    loadSong(tid);
  } else {
    console.log("There are no more tracks in the autoqueue.");
  }
}

function randomSong() {
  const tracks = $('.track-row');
  const index = Math.floor((Math.random() * tracks.length) + 0);
  $(tracks[index]).click();
  $(tracks[index]).click();
}

function fastForward(seconds) {
  audioPlayer.currentTime += seconds;
}

function rewind(seconds) {
  audioPlayer.currentTime -= seconds;
}

$('#artworkimg').click(function(e) {
  e.stopPropagation();
  playPause();
});

var opt = {
  // optional selector for handle that starts dragging
  handleSelector: '.drag-bar',
  // resize the width
  resizeWidth: false,
  // resize the height
  resizeHeight: true,
  // the side that the height resizing is relative to
  resizeHeightFrom: 'bottom',
  // hook into start drag operation (event,$el,opt passed - return false to abort drag)
  onDragStart: function (e, el) {
    snapPlayer(e, el);
  },
  // hook into stop drag operation (event,$el,opt passed)
  onDragEnd: function (e, el) {
    snapPlayer(e, el);
  },
  // hook into each drag operation (event,$el,opt passed)
  onDrag: function (e, el) {
    let playerheight = $(el).height();
    let winheight = $(window).height();
    let wfscale = Math.round(playerheight / 3) / 100;

    $('.library-wrapper,#library').css('height', (winheight - playerheight) + 'px');
    $('#wf_box').css('transform', 'scale(1.0,' + wfscale +')');
  },
  // disable touch-action on the $handle
  // prevents browser level actions like forward back gestures
  touchActionNone: true
};

function snapPlayer(e, el) {
  let playerheight = $(el).height();
  let winheight = $(window).height();

  if (playerheight <= 149) {
    $('#player').css('transition','height 1s ease');
    $('#player').css('height', '150px');
    playerheight = 150;
    return false;
  }

  if (playerheight >= ($(window).height() * 1.0 + 1)) {
    $('#player').css('transition','height 1s ease');
    $('#player').css('height', $(window).height() * 1.0 + 'px');
    playerheight = (winheight * 1.0);
    return false;
  }

  let wfscale = Math.round(playerheight / 3) / 100;

  $('.library-wrapper,#library').css('height', ($(window).height() - playerheight) + 'px');
  $('#wf_box').css('transform', 'scale(1.0,' + wfscale +')');
}

$(window).resize(function () {
  snapPlayer(null, '#player');
});

$("#player").resizable(opt);

// TODO Figure out how to trigger this click when playing
$('body').on("click", "#wf_box", function(e) {
  console.log(e);
  //how far you clicked into the div's width by percent
  let w = $(window).width() * 1.0;
  // bit of voodoo to sync click with svg fill
  let relativePercent = ((e.pageX - (w * 0.025)) / (w * 0.95)) * 1.05;
  let seekPosition = Math.round(duration * relativePercent);
  bgScroll(true, seekPosition / 1000, duration / 1000);
  audioPlayer.currentTime = seekPosition / 1000.0;
  audioPlayer.play();
  waveform();
});

// $('#player').resizable({
//   handles: 's',
//   autoHide: true,
//   minHeight: 200,
//   maxHeight: ($(window).height() * 0.8),
//   // resize: function(event, ui) {
//   //
//   // },
//   stop: function (event, ui) {
//     var resClass = ui.element.find('a').attr('data-also-resize');
//     columns.set(resClass, ui.size.width);
//   }
// });

let audioPlayer = new Audio();
audioPlayer.crossOrigin = "anonymous";
audioPlayer.addEventListener("ended", autoplayNextSong);

function autoplayNextSong(){
  const autoplay = getOpt('autoplay');
  const shuffle = getOpt('shuffle');
  if (autoplay) {
    if (shuffle) {
      randomSong();
    } else {
      nextSong();
    }
  }
}

function loadSong(tid) {
  let track = findTrack(tid);

  currentlyPlaying = tid;
  incPlayCount(tid);
  loadWaveform(tid);
  loadArtworkPalette(tid);
  
  audioPlayer.src = 'http://api.soundcloud.com/tracks/' + track.t.properties.scid + '/stream' + '?client_id=a3629314a336fd5ed371ff0f3e46d4d0';
  //console.log(audioPlayer.src);
  audioPlayer.load();
  audioPlayer.play();

  $(".track-title").text(track.t.properties.name);
  $(".track-channel").text(track.c.properties.name);

  duration = track.t.properties.duration;

  //Load artwork image to DOM
  $('#artworkimg').css('background-image', "url(" + track.t.properties.artwork_url + ")");
  $('#art-bk').css('background-image', "url(" + track.t.properties.artwork_url + ")");

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

    element.classList.remove("moving");


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
