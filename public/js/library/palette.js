
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

function updateColorPalette(){
  //TODO: someone make this actually do cool things, this is just a test example, some1 replace this
  if(color_palette != null){
    //Some colors aren't guaranteed to exist, not sure why need to look more into this TODO
    if(color_palette.LightMuted != null){
      var lightMuted = color_palette.LightMuted;
      $('.track-title').css('color', lightMuted);
      $('.track-channel').css('color', lightMuted);
    }
    if(color_palette.Vibrant != null){
      var vibrant = color_palette.Vibrant;
      $('.track-title').css('background-color', vibrant);
    }
    if(color_palette.DarkVibrant != null){
      var darkVibrant = color_palette.DarkVibrant;
      $('.track-channel').css('background-color', darkVibrant);
    }
  }
}
