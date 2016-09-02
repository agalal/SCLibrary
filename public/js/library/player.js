let duration;

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

function randomSong() {
  const tracks = $('.track-row');
  const index = Math.floor((Math.random() * tracks.length) + 0);
  $(tracks[index]).click();
}

function fillAutoqueue(element) {
  var element2 = element;

  autoqueue = [];
  var i = 0;
  while (element.$$nextSibling && i < 20){
    var t = element.$$nextSibling.track;
    autoqueue.push(t);
    element = element.$$nextSibling;
    i++;
  }

  backqueue = [];
  var j = 0;
  while (element2.$$prevSibling && j < 20){
    var t = element2.$$prevSibling.track;
    backqueue.push(t);
    element2 = element2.$$prevSibling;
    j++;
  }
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
  if (duration !== undefined){
    //how far you clicked into the div's width by percent. 1.0 is to cast to double
    let relativePercent = e.pageX / ($(window).width() * 1.0);
    //console.log(relativePercent + '%');
    let seekPosition = Math.round(duration * relativePercent);
    bgScroll(true, seekPosition / 1000, duration / 1000);
    audioPlayer.currentTime = seekPosition / 1000.0;
    audioPlayer.play();
  }
});

let audioPlayer = new Audio();
//Just did this cause the other guy did it, seems like its kew
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

function loadSong(track) {
  var trackid = track.t.properties.scid;
  var durationms = track.t.properties.duration;
  var artworkurl = track.t.properties.artwork_url;
  var waveformurl = track.t.properties.waveform_url;

  incPlayCount(track);
  highlightRow(track);

  audioPlayer.src = 'http://api.soundcloud.com/tracks/' + trackid + '/stream' + '?client_id=a3629314a336fd5ed371ff0f3e46d4d0';
  //console.log(audioPlayer.src);
  audioPlayer.load();
  audioPlayer.play();
  loadWaveform(track.t._id);
  var colors = loadArtworkPalette(track.t._id);

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
  //console.log(dur + ' ' + pos + ' ' + play + ' ' + perShift + '+');

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
