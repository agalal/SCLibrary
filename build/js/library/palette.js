// jshint esversion: 6
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
      color_palette = data;
      console.log(color_palette);
      palette_refresh = true;
    },
    fail: function(){
      color_palette = null;
      palette_refresh = true;
    },
  });
}
