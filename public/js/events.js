var map = [];
document.body.onkeydown = document.body.onkeyup = function(e) {
  e = e || event; // to deal with IE
  map[e.keyCode] = (e.type == 'keydown');
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
  if (map[49]) {

  }
}
