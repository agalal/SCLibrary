// jshint esversion: 6
// Constants used for tuning the waveform
let options = {
  refresh_rate: 100,
  wf_offset: 2.5,
  bar_width: 100,
  bar_height: 0.5,
  bar_y_offset: 1.5,
  height: 0.4,
  defaultFillColor: "#232323",
  waveform_resolution: 9,
  interpolation_type: 'basis',
  patternSize: '6'
};

let refresh = false;
let wform_data = [];
let sub, lows, mids1, mids2, highs1, highs2, highs3;

let observedFR = 0;


// TODO Fuck with this to fix the 0 0 Naan Naan problem
// Track the window and waveform width
let window_width, waveform_width;
function setWidth() {
  window_width = $(window).width();
  waveform_width = window_width * (100 - (2 * options.wf_offset)) / 100;
}
window.addEventListener("resize", setWidth);

// Setup the audio frequency analyzer
let audioCtx = new (window.AudioContext)();
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
    waveform();
  });
}


// Repeatedly update the waveform in the player
// by calling the animation function

// if (palette_refresh) {
//   palette_refresh = false;
//   updateColorPalette();
// }

// Helper function used to take weighted average of the seven frequency ranges
function composite(a, b, c, d, e, f, g) {
  var num = (a * kick) + (b * lows) + (c * mids2) + (d * mids1) + (e * highs3) + (f * highs2) + (g * highs1);
  var dem = a + b + c + d + e + f + g || 1;
  return num / dem;
}

// Draws the waveform
function waveform() {
  // if the player is playing, keep requesting
  if (!audioPlayer.paused) requestAnimationFrame(waveform);
  analyser.getByteFrequencyData(fd);
  document.getElementById('wf_box').innerHTML = "";

  highs1 = d3.mean(fd.slice(201, 246)) * options.height;
  highs2 = d3.mean(fd.slice(165, 190)) * options.height;
  highs3 = d3.mean(fd.slice(135, 155)) * options.height;
  mids1 = d3.mean(fd.slice(99, 102)) * options.height * 0.95;
  mids2 = d3.mean(fd.slice(60, 63)) * options.height * 0.9;
  lows = d3.mean(fd.slice(34, 37)) * options.height * 0.8;
  kick = d3.mean(fd.slice(7, 9)) * options.height * 0.7;

  let num_bars = Math.floor(waveform_width / options.waveform_resolution);
  let bucket_size = Math.floor(wform_data.length / num_bars);

  var data = [0];
  for (var i = 0; i < num_bars; i++) {
    var total = 0;
    for (var j = 0; j < bucket_size; j++) {
      total += wform_data[(i * bucket_size) + j];
    }
    if (Math.round(total / bucket_size)) {
      if (i === 0) {
        data.push(Math.round(total / bucket_size) / 2);
        data.push(Math.round(total / bucket_size) / 1.5);
      }
      data.push(Math.round(total / bucket_size));
    }
  }
  data.push(data[data.length - 1] / 1.5);
  data.push(data[data.length - 1] / 2);
  data.push(0);

  var max = d3.max(data);
  var w = (7 - 12 / waveform_width);
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
    .attr("viewBox", "0 0 " + Math.max(w * data.length, 0) + " " + Math.max(h, 0));

  // append a clip path to add the waveform to
  var defs = chart
    .append("defs");

  var pattern = defs
    .append("pattern")
    .attr("id", "vertical-stripe-1")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", options.patternSize)
    .attr("height", options.patternSize)
    .append("image")
    .attr("xlink:href", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScgLz4KICA8cmVjdCB4PScwJyB5PScwJyB3aWR0aD0nMScgaGVpZ2h0PScxMCcgZmlsbD0nYmxhY2snIC8+Cjwvc3ZnPg==")
    .attr("x", "0")
    .attr("y", "0")
    .attr("height", options.patternSize)
    .attr("width", options.patternSize);

  var clipper = defs
    .append("clipPath")
    .attr("id", "wave");


  // clipper.selectAll("rect")
  //   .data(data)
  //   .enter()
  //   .append("rect")
  //   .attr("x", function(d, i) {
  //     var x_offset = x(i) - Math.max(w * max / 900 - 0.25, 0.1) / 2;
  //     return x_offset;
  //   })
  //   .attr("y", function(d, i) {
  //     var height = y(d * options.bar_height) / h;
  //     if (i % 10 === 0) height *= composite(1, 3, 4, 6, 1, 0, 0); //15
  //     if (i % 10 === 1) height *= composite(2, 2, 7, 3, 1, 0, 0); //15
  //     if (i % 10 === 2) height *= composite(4, 6, 3, 2, 0, 0, 0); //15
  //     if (i % 10 === 3) height *= composite(8, 4, 2, 1, 0, 0, 0); //15
  //     if (i % 10 === 4) height *= composite(10, 2, 1, 0, 0, 1, 1); //15
  //     if (i % 10 === 5) height *= composite(8, 2, 0, 0, 0, 2, 3); //15
  //     if (i % 10 === 6) height *= composite(3, 0, 0, 0, 1, 3, 8); //15
  //     if (i % 10 === 7) height *= composite(2, 0, 0, 1, 2, 8, 2); //15
  //     if (i % 10 === 8) height *= composite(0, 0, 1, 5, 7, 2, 0); //15
  //     if (i % 10 === 9) height *= composite(0, 2, 5, 6, 2, 0, 0); //15
  //     return h - Math.pow(Math.max(height, 0.01), 1.5);
  //   })
  //   .attr("width", function(d) {
  //     return '4px';
  //   })
  //   .attr("height", function(d, i) {
  //     var height = y(d * options.bar_height) / h;
  //     if (i % 10 === 0) height *= composite(1, 3, 4, 6, 1, 0, 0); //15
  //     if (i % 10 === 1) height *= composite(2, 2, 7, 3, 1, 0, 0); //15
  //     if (i % 10 === 2) height *= composite(4, 6, 3, 2, 0, 0, 0); //15
  //     if (i % 10 === 3) height *= composite(8, 4, 2, 1, 0, 0, 0); //15
  //     if (i % 10 === 4) height *= composite(10, 2, 1, 0, 0, 1, 1); //15
  //     if (i % 10 === 5) height *= composite(8, 2, 0, 0, 0, 2, 3); //15
  //     if (i % 10 === 6) height *= composite(3, 0, 0, 0, 1, 3, 8); //15
  //     if (i % 10 === 7) height *= composite(2, 0, 0, 1, 2, 8, 2); //15
  //     if (i % 10 === 8) height *= composite(0, 0, 1, 5, 7, 2, 0); //15
  //     if (i % 10 === 9) height *= composite(0, 2, 5, 6, 2, 0, 0); //15
  //     return Math.pow(Math.max(height, 0.01), 1.5) + options.bar_y_offset;
  //   });


    // define a line with points to use for our path
    var linefn = d3.svg.area()
      .x(function (d, i) {
        var x_offset = x(i) - Math.max(w * max / 900 - 0.25, 0.1) / 2;
        return x_offset;
      })
      .y1(function (d, i) {
        var height = y(d * options.bar_height) / h;
        if (i % 19 === 0) height *= composite(1, 3, 4, 6, 1, 0, 0); //15
        if (i % 19 === 1) height *= composite(1, 1, 5, 4, 1, 0, 0); //15
        if (i % 19 === 2) height *= composite(2, 2, 7, 3, 1, 0, 0); //15
        if (i % 19 === 3) height *= composite(3, 4, 5, 2, 1, 0, 0); //15
        if (i % 19 === 4) height *= composite(4, 6, 3, 2, 0, 0, 0); //15
        if (i % 19 === 5) height *= composite(5, 5, 3, 2, 0, 0, 0); //15
        if (i % 19 === 6) height *= composite(8, 4, 2, 1, 0, 0, 0); //15
        if (i % 19 === 7) height *= composite(10, 3, 1, 1, 0, 0, 1); //15
        if (i % 19 === 8) height *= composite(10, 2, 1, 0, 0, 1, 1); //15
        if (i % 19 === 9) height *= composite(9, 3, 0, 0, 0, 1, 2); //15
        if (i % 19 === 10) height *= composite(8, 2, 0, 0, 0, 2, 3); //15
        if (i % 19 === 11) height *= composite(6, 1, 0, 0, 0, 2, 6); //15
        if (i % 19 === 12) height *= composite(3, 0, 0, 0, 1, 3, 8); //15
        if (i % 19 === 13) height *= composite(2, 0, 0, 0, 2, 5, 6); //15
        if (i % 19 === 14) height *= composite(2, 0, 0, 1, 2, 8, 2); //15
        if (i % 19 === 15) height *= composite(1, 0, 0, 2, 4, 6, 2); //15
        if (i % 19 === 16) height *= composite(0, 0, 1, 5, 7, 2, 0); //15
        if (i % 19 === 17) height *= composite(0, 1, 3, 5, 5, 1, 0); //15
        if (i % 19 === 18) height *= composite(0, 2, 5, 6, 2, 0, 0); //15
        return h - Math.pow(Math.max(height, 0.01), 1.55);
      })
      .y0(300)
      .interpolate(options.interpolation_type);

    clipper.append("path")
      .attr("d", linefn(data))
      .attr('fill', 'black')
      .attr('fill-opacity', '1.0')
      .attr('stroke', '#232323')
      .attr('stroke-width', '1');

    let currentPercent = ((audioPlayer.currentTime / duration) * percent_offset * 1000);


    // clear waveform fill behind the whole chart
    chart.append("rect")
      .attr("class", "fill-bar")
      .attr("clip-path", "url(#wave)")
      .attr("width", "" + "100%")
      .attr("height", "" + h + "px")
      // .attr("fill", color_palette.DarkMutted)
      .attr("fill", "url(#vertical-stripe-1)")
      .attr("fill-opacity", "0.8");

    // progress fill bar
    chart.append("rect")
      .attr("class", "fill-bar")
      .attr("clip-path", "url(#wave)")
      .attr("width", "" + currentPercent + "%")
      .attr("height", "" + h + "px")
      .attr("fill-opacity", "0.8")
      .attr("fill", color_palette.DarkVibrant || options.defaultFillColor);

    // updating counter
    // chart.append("text")
    //   .attr("class", "time-progress")
    //   .attr("font-family", "Oxygen")
    //   .attr("font-size", "14px")
    //   .attr("x", "5")
    //   .attr("y", "258")
    //   .attr("fill", "red")
    //   .text(function () {
    //     let timestr;
    //     for (var m = 0, len = timearr.length; m < len; m++) {
    //       timestr += "" + timearr[m] + ":";
    //     }
    //     return timestr;
    //   });

}
