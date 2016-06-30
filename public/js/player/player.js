
var isPlaying = false;

var playIcon = 'url(../../images/sc_icons/play.svg)';
var pauseIcon = 'url(../../images/sc_icons/pause.svg)';

var options = {
  refresh_rate: 16.67,
  wf_percent: 97,
  bar_width: 75,
  bar_height: 0.5,
  bar_y_offset: 1.5
};

//Set up our pause/play button to use the play button Icon initially
$('#pauseplay').css('background-image', playIcon);

var currtimems = 0;

var details = [];
var percent = 0;

setInterval(
  function () {
    if (isPlaying){
      currtimems = audioPlayer.currentTime*1000.0;
      percent = currtimems / durationms;
      waveform();
    }
  }, options.refresh_rate
);

// This needs to be changed to listen for window size changes.
var window_width = 10;
setInterval(function () {
  window_width = Math.round($(window).width() / options.bar_width);
}, 1000);

//Tie our pauseplay button to the "play" and "pause" events from the player
$(audioPlayer).on('play', function() {
    $('#pauseplay').css('background-image', pauseIcon);
});
$(audioPlayer).on('pause', function() {
    $('#pauseplay').css('background-image', playIcon);
});

$('#artworkimg').click(function(e) {
  // e.preventDefault();
    if (isPlaying && !audioPlayer.paused) {
        audioPlayer.pause();
        isPlaying = false;
        $('#pauseplay').css('background-image', playIcon);
        bgScroll(false);
    } else {
        // TODO stop reseting pos on play somehow
        $('#pauseplay').css('background-image', pauseIcon);
        bgScroll(true);
        audioPlayer.play();
        isPlaying = true;
    }
});

$('#back-div').click(function(e) {
    //how far you clicked into the div's width by percent. 1.0 is to cast to double
    var relativePercent = e.pageX / ($(window).width() * 1.0);
    console.log(relativePercent + '%');
    var seekPosition = Math.round(duration * relativePercent);
    bgScroll(true, seekPosition/1000, duration/1000);
    console.log("seekpos: " + seekPosition);
    audioPlayer.currentTime = seekPosition / 1000.0;
    audioPlayer.play();
    isPlaying = true;
});


var audioPlayer = new Audio();
//Just did this cause the other guy did it, seems like its kew
audioPlayer.crossOrigin = "anonymous";
audioPlayer.addEventListener("ended", nextSong);

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioSrc = audioCtx.createMediaElementSource(audioPlayer);
var analyser = audioCtx.createAnalyser();
var fd = new Uint8Array(256);

audioSrc.connect(analyser);
audioSrc.connect(audioCtx.destination);

// made this global to help with next load
var durationms;
function loadSong(track) {
  console.log(track);
    var trackid = track.t.properties.scid;
    durationms = track.t.properties.duration;
    var artworkurl = track.t.properties.artwork_url;
    var waveformurl = track.t.properties.waveform_url;

    audioPlayer.src = 'http://api.soundcloud.com/tracks/' + trackid + '/stream' + '?client_id=a3629314a336fd5ed371ff0f3e46d4d0';
    audioPlayer.load();
    audioPlayer.play();
    loadWaveform(track.t._id);

    $(".track-title").text(track.t.properties.name);
    $(".track-channel").text(track.c.properties.name);

    duration = durationms;
    console.log('http://api.soundcloud.com/tracks/' + trackid + '/stream' + '?client_id=a3629314a336fd5ed371ff0f3e46d4d0');
    //Reset isPlaying boolean, change the
    isPlaying = true;
    $('#pauseplay').css('background-image', pauseIcon);

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

var wform_data = [];
function loadWaveform(track_id){
    d3.json("/api/track/waveform/" + track_id, function(error, data){
      if (error) throw error;
      wform_data = data;
      isPlaying = true;
    });
}

function waveform(){
    analyser.getByteFrequencyData(fd);

    if (fd[0] !== 0){

      var fd2 = [];
      var fd3 = [];
      for (var i = 0; i < 256; i++){
        fd2.push(fd[i] / (i + 20));
        fd3.push(fd[i]);
      }
      var highs = 7 + d3.mean(fd3.splice(180, 245)) / 4;
      var mids = 7 + d3.mean(fd3.splice(80, 160)) / 4;
      var lows = 7 + d3.mean(fd3.splice(20, 40)) / 5;
      var sub = -40 + d3.mean(fd2.splice(0, 20)) * 11.5;

      var data = [];

      var b = 33 - window_width;
      for (var i = 1; i < wform_data.length/b; i++){
        var total = 0;
        for (var j = 0; j < b; j++){
          total +=  wform_data[(i * b) + j];
        }
        if (Math.round(total/b))
          data.push(Math.round(total/b));
      }

      var w = 1.2 * (6 - 10 / window_width), h = d3.max(data) * 2;

      var chart = d3.select(".charts").append("svg")
        .attr("class", "chart")
        .attr("width", "" + options.wf_percent + "%")
        .attr("style", "padding-left:" + (100 - options.wf_percent) + "%;")
        .attr("viewBox", "0 0 " + Math.max(w * data.length, 0) + " " + Math.max(h, 0) )
        .attr("fill", "white");
        //TODO: Make a color analyzer for album artwork so that we can use a pallette to color things in the player, like fill.

      var x = d3.scale.linear()
        .domain([0, 1])
        .range([0, w]);

      var y = d3.scale.linear()
        .domain([0, h])
        .rangeRound([0, h]); //rangeRound is used for antialiasing

      var max = d3.max(data);

      chart.selectAll("rect")
        .data(data)
      .enter().append("rect")
        .attr("x", function(d, i) {
          var x_offset = x(i) - Math.max(w * max / 900 - 0.25, 0.1)/2;
          return x_offset;
        })
        .attr("y", function(d, i) {
          var y_offset;
          if (i % 4 === 0) y_offset = y(d * options.bar_height) * highs / h;
          if (i % 4 === 1) y_offset = y(d * options.bar_height) * lows / h;
          if (i % 4 === 2) y_offset = y(d * options.bar_height) * mids / h;
          if (i % 4 === 3) y_offset = y(d * options.bar_height) * sub / h;
          return h - Math.pow(Math.max(y_offset, .01), 1.55);
        })
        .attr("width", function(d) {
          var width = Math.max((w * max / 900 - 0.25), 0.1);
          return width;
        })
        .attr("height", function(d, i) {
          var height;
          if (i % 4 === 0) height = y(d * options.bar_height) * highs / h;
          if (i % 4 === 1) height = y(d * options.bar_height) * lows / h;
          if (i % 4 === 2) height = y(d * options.bar_height) * mids / h;
          if (i % 4 === 3) height = y(d * options.bar_height) * sub / h;
          return Math.pow(Math.max(height, .01), 1.55) + options.bar_y_offset;
        });
    }
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
          window.setTimeout( function() {
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

function nextSong() {
    if (queue.length > 0)
      var track = queue.shift();
    else
      var track = autoqueue.shift();

    backqueue.unshift(track);
    loadSong(track);
}

function previousSong() {
    var track = backqueue.shift();
    queue.unshift(track);
    loadSong(track);
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

function nextListener() {
    // autoplay!
    // hack to detect when song is over:
    // listen for the width of the progress bar
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {

            var completionPer = mutationRecord.target.style.width;

            // move the image background, since we're already listening
            if (completionPer == "100%") {
                var track;
                if (queue.length === 0) {
                    track = autoqueue.shift();
                    loadSong(track);
                } else {
                    track = autoqueue.shift();
                    loadSong(track);
                }

            }
        });
    });

    var target = document.getElementById('back-div');
    observer.observe(target, {
        attributes: true,
        attributeFilter: ['style']
    });
}

var toggledLib = false;

function toggleLib() {
    if (!toggledLib) $('body').addClass('toggled');
    else $('body').removeClass('toggled');
    toggledLib = !toggledLib;
}
var toggledSet = false;
function toggleSet() {
  if (!toggledSet) $('#settings').addClass('toggled');
  else $('#settings').removeClass('toggled');
  toggledSet = !toggledSet;
}
var toggledAuto = true;
function toggleAuto() {
  if (!toggledAuto) $('#autoplay-toggle').addClass('toggled');
  else $('#autoplay-toggle').removeClass('toggled');
  toggledAuto = !toggledAuto;
}
var toggledShuffle = false;
function toggleShuffle() {
  if (!toggledShuffle) $('#shuffle-toggle').addClass('toggled');
  else $('#shuffle-toggle').removeClass('toggled');
  toggledShuffle = !toggledShuffle;
}
