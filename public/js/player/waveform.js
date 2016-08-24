// Constants used for tuning the waveform
let options = {
  refresh_rate: 24,
  wf_offset: 3.5,
  bar_width: 75,
  bar_height: 0.5,
  bar_y_offset: 1.5,
  height: .3
};

let refresh = false
let wform_data = [];
let sub, lows, mids1, mids2, highs1, highs2, highs3;

// Track the window and waveform width
let window_width, waveform_width;
function setWidth() {
  window_width = $(window).width()
  waveform_width = window_width * (100 - (2 * options.wf_offset)) / 100;
}
$(document).ready(setWidth);
window.addEventListener("resize", setWidth);

// Setup the audio frequency analyzer
let audioCtx = new(window.AudioContext || window.webkitAudioContext)();
let audioSrc = audioCtx.createMediaElementSource(audioPlayer);
let analyser = audioCtx.createAnalyser();
let fd = new Uint8Array(256);

audioSrc.connect(analyser);
audioSrc.connect(audioCtx.destination);

// Load the waveform data from the API
function loadWaveform(track_id) {
  d3.json("/api/tracks/" + track_id + "/waveform", function(error, data) {
    if (error) throw error;
    wform_data = data;
    refresh = true;
  });
}

// Repeatedly redraw the waveform at the refresh rate
setInterval(function() {
  if (refresh) waveform();
}, options.refresh_rate);

// Helper function used to take weighted average of the seven frequency ranges
function composite(a, b, c, d, e, f, g) {
  var num = (a * kick) + (b * lows) + (c * mids2) + (d * mids1) + (e * highs3) + (f * highs2) + (g * highs1);
  var dem = a + b + c + d + e + f + g || 1;
  return num / dem;
}

// Draws the waveform
function waveform() {
  analyser.getByteFrequencyData(fd);
  document.getElementById('wf_box').innerHTML = "";

  highs1 = d3.mean(fd.slice(201, 246)) * options.height;
  highs2 = d3.mean(fd.slice(165, 190)) * options.height;
  highs3 = d3.mean(fd.slice(135, 155)) * options.height;
  mids1 = d3.mean(fd.slice(99, 102)) * options.height * .95;
  mids2 = d3.mean(fd.slice(60, 63)) * options.height * .9;
  lows = d3.mean(fd.slice(34, 37)) * options.height * .8;
  kick = d3.mean(fd.slice(7, 9)) * options.height * .7;

  let bar_distance = 11;
  let num_bars = Math.floor(waveform_width / bar_distance);
  let bucket_size = Math.floor(wform_data.length / num_bars);

  var data = [];
  for (var i = 0; i < num_bars; i++) {
    var total = 0;
    for (var j = 0; j < bucket_size; j++) {
      total += wform_data[(i * bucket_size) + j];
    }
    if (Math.round(total / bucket_size))
      data.push(Math.round(total / bucket_size));
  }

  var max = d3.max(data);
  var w = (7 - 12 / window_width)
  var h = max * 2 || 0;

  var x = d3.scale.linear()
    .domain([0, 1])
    .range([0, w]);

  var y = d3.scale.linear()
    .domain([0, h])
    .rangeRound([0, h]); //rangeRound is used for antialiasing

  const percent_offset = 100 - options.wf_offset;
  var chart = d3.select(".charts").append("svg")
    .attr("class", "chart")
    .attr("width", "" + percent_offset + "%")
    .attr("style", "padding-left:" + (100 - percent_offset) + "%;")
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
      if (i % 9 === 0) height *= composite(1, 3, 4, 6, 1, 0, 0); //15
      if (i % 9 === 1) height *= composite(2, 2, 7, 3, 1, 0, 0); //15
      if (i % 9 === 2) height *= composite(4, 6, 3, 2, 0, 0, 0); //15
      if (i % 9 === 3) height *= composite(8, 4, 2, 1, 0, 0, 0); //15
      if (i % 9 === 4) height *= composite(10, 2, 1, 0, 0, 1, 1); //15
      if (i % 9 === 5) height *= composite(8, 2, 0, 0, 0, 2, 3); //15
      if (i % 9 === 6) height *= composite(3, 0, 0, 0, 1, 3, 8); //15
      if (i % 9 === 7) height *= composite(2, 0, 0, 1, 2, 8, 2); //15
      if (i % 9 === 8) height *= composite(0, 0, 1, 5, 7, 2, 0); //15
      return h - Math.pow(Math.max(height, .01), 1.5);
    })
    .attr("width", function(d) {
      var width = Math.max((w * max / 900 - 0.25), 0.1);
      return width;
    })
    .attr("height", function(d, i) {
      var height = y(d * options.bar_height) / h;
      if (i % 9 === 0) height *= composite(1, 3, 4, 6, 1, 0, 0); //15
      if (i % 9 === 1) height *= composite(2, 2, 7, 3, 1, 0, 0); //15
      if (i % 9 === 2) height *= composite(4, 6, 3, 2, 0, 0, 0); //15
      if (i % 9 === 3) height *= composite(8, 4, 2, 1, 0, 0, 0); //15
      if (i % 9 === 4) height *= composite(10, 2, 1, 0, 0, 1, 1); //15
      if (i % 9 === 5) height *= composite(8, 2, 0, 0, 0, 2, 3); //15
      if (i % 9 === 6) height *= composite(3, 0, 0, 0, 1, 3, 8); //15
      if (i % 9 === 7) height *= composite(2, 0, 0, 1, 2, 8, 2); //15
      if (i % 9 === 8) height *= composite(0, 0, 1, 5, 7, 2, 0); //15
      return Math.pow(Math.max(height, .01), 1.5) + options.bar_y_offset;
    });
}
