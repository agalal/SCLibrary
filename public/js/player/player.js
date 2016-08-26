// Send a song to the player and save the next 20 songs for an autoplay queue

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
  //how far you clicked into the div's width by percent. 1.0 is to cast to double
  let relativePercent = e.pageX / ($(window).width() * 1.0);
  //console.log(relativePercent + '%');
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

  angular.element(document.getElementById('libraryCtlrDiv')).scope().incPlayCount(track);

  highlightRow(track);

  audioPlayer.src = 'http://api.soundcloud.com/tracks/' + trackid + '/stream' + '?client_id=a3629314a336fd5ed371ff0f3e46d4d0';
  //console.log(audioPlayer.src);
  audioPlayer.load();
  audioPlayer.play();
  loadWaveform(track.t._id);
  var colors = loadArtworkPalette(track.t._id);
console.log("colors:");
  console.log(colors);

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

var refresh = false;
var wform_data = [];

function loadWaveform(track_id) {
  d3.json("/api/tracks/" + track_id + "/waveform", function(error, data) {
    if (error) throw error;
    wform_data = data;
    refresh = true;
  });
}

var color_palette = {};
var palette_refresh = false;
//Calls backend to extract the color palette from the artwork URL for this track, returns JSON
//If there is an error it returns null, perhaps we should make it return the "default" color palette (aka the white one)
//There are 6 colors but I don't think they're all GUARANTEED to exist, see : http://localhost:3000/api/tracks/382/palette
//Where LightVibrant is missing, need to look a little more into this to see what is guaranteed and when
function loadArtworkPalette(track_id){
  var request = $.ajax({
    url: "/api/tracks/" + track_id + "/palette",
    method: "GET",
    dataType: "json",
    //async: false,
    success: function(data){
      console.log("data:");
      console.log(data);
      color_palette = data;
      palette_refresh = true;
    },
    fail: function(){
      color_palette = null;
      palette_refresh = true;
    },
  });
}

// Repeatedly update the waveform in the player.
setInterval(function() {
  if (refresh) waveform();
  if (palette_refresh) {
    palette_refresh = false;
    updateColorPalette();
  }
}, options.refresh_rate);

var sub, lows, mids1, mids2, highs1, highs2;

function composite(a, b, c, d, e, f, g) {
  var num = (a * kick) + (b * lows) + (c * mids2) + (d * mids1) + (e * highs3) + (f * highs2) + (g * highs1);
  var dem = a + b + c + d + e + f + g;
  return num / dem;
}

function updateColorPalette(){
  //TODO: someone make this actually do cool things, this is just a test example, some1 replace this
  if(color_palette != null){
    console.log("updateColorPalette()");
    //Some colors aren't guaranteed to exist, not sure why need to look more into this TODO
    if(color_palette.LightMuted != null){
      var lightMuted = color_palette.LightMuted;
      var lightMutedRgbString = 'rgb('+lightMuted.rgb[0]+','+lightMuted.rgb[1]+','+lightMuted.rgb[2]+')';
      $('.track-title').css('color', lightMutedRgbString);
      $('.track-channel').css('color', lightMutedRgbString);
    }
    if(color_palette.Vibrant != null){
      var vibrant = color_palette.Vibrant;
      var vibrantRgbString = 'rgba('+vibrant.rgb[0]+','+vibrant.rgb[1]+','+vibrant.rgb[2]+','+.4+')';
      $('.track-title').css('background-color', vibrantRgbString);
    }
    if(color_palette.DarkVibrant != null){
      var darkVibrant = color_palette.DarkVibrant;
      var darkVibrantRgbString = 'rgba('+darkVibrant.rgb[0]+','+darkVibrant.rgb[1]+','+darkVibrant.rgb[2]+','+.4+')';
      $('.track-channel').css('background-color', darkVibrantRgbString);
    }
  }
}

function waveform() {
  analyser.getByteFrequencyData(fd);
  document.getElementById('wf_box').innerHTML = "";

  highs1 = d3.mean(fd.slice(201, 246)) * options.height;
  highs2 = d3.mean(fd.slice(165, 190)) * options.height;
  highs3 = d3.mean(fd.slice(135, 155)) * options.height;
  mids1 = d3.mean(fd.slice(99, 102)) * options.height * .95;
  mids2 = d3.mean(fd.slice(60, 63)) * options.height * .9;
  lows = d3.mean(fd.slice(34, 37)) * options.height * .8;
  kick = ((d3.mean(fd.slice(7, 9)) * options.height * .7) - 15) * 1.7;

  var data = [];
  var b = 33 - window_width;
  for (var i = 1; i < wform_data.length / b; i++) {
    var total = 0;
    for (var j = 0; j < b; j++) {
      total += wform_data[(i * b) + j];
    }
    if (Math.round(total / b))
      data.push(Math.round(total / b));
  }

  var max = d3.max(data);
  var w = (7 - 12 / window_width)
  var h = max * 2;

  var x = d3.scale.linear()
    .domain([0, 1])
    .range([0, w]);

  var y = d3.scale.linear()
    .domain([0, h])
    .rangeRound([0, h]); //rangeRound is used for antialiasing

  var chart = d3.select(".charts").append("svg")
    .attr("class", "chart")
    .attr("width", "" + options.wf_percent + "%")
    .attr("style", "padding-left:" + (100 - options.wf_percent) + "%;")
    .attr("viewBox", "0 0 " + Math.max(w * data.length, 0) + " " + Math.max(h, 0))
    .attr("fill", "white");
  //TODO: Make a color analyzer for album artwork so that we can use a pallette to color things in the player, like fill.

  chart.selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("x", function(d, i) {
      var x_offset = x(i) - Math.max(w * max / 900 - 0.25, 0.1) / 2;
      return x_offset;
    })
    .attr("y", function(d, i) {
      var height = y(d * options.bar_height) / h;
      if (i % 9 === 0) height *= composite(1, 0, 0, 0, 0, 0, 0);
      if (i % 9 === 1) height *= composite(1, 1, 0, 0, 0, 0, 0);
      if (i % 9 === 2) height *= composite(1, 4, 0, 0, 0, 0, 0);
      if (i % 9 === 3) height *= composite(3, 2, 0, 0, 0, 0, 0);
      if (i % 9 === 4) height *= composite(5, 1, 0, 0, 0, 0, 0);
      if (i % 9 === 5) height *= composite(3, 2, 0, 0, 0, 0, 0);
      if (i % 9 === 6) height *= composite(1, 4, 0, 0, 0, 0, 0);
      if (i % 9 === 7) height *= composite(1, 1, 0, 0, 0, 0, 0);
      if (i % 9 === 8) height *= composite(1, 0, 0, 0, 0, 0, 0);
      return h - Math.pow(Math.max(height, .01), 1.5);
    })
    .attr("width", function(d) {
      var width = Math.max((w * max / 900 - 0.25), 0.1);
      return width;
    })
    .attr("height", function(d, i) {
      var height = y(d * options.bar_height) / h;
      if (i % 9 === 0) height *= composite(1, 0, 0, 0, 0, 0, 0);
      if (i % 9 === 1) height *= composite(1, 1, 0, 0, 0, 0, 0);
      if (i % 9 === 2) height *= composite(1, 4, 0, 0, 0, 0, 0);
      if (i % 9 === 3) height *= composite(3, 2, 0, 0, 0, 0, 0);
      if (i % 9 === 4) height *= composite(5, 1, 0, 0, 0, 0, 0);
      if (i % 9 === 5) height *= composite(3, 2, 0, 0, 0, 0, 0);
      if (i % 9 === 6) height *= composite(1, 4, 0, 0, 0, 0, 0);
      if (i % 9 === 7) height *= composite(1, 1, 0, 0, 0, 0, 0);
      if (i % 9 === 8) height *= composite(1, 0, 0, 0, 0, 0, 0);
      return Math.pow(Math.max(height, .01), 1.5) + options.bar_y_offset;
    });
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
