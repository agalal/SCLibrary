let channels_visible = false;

$(document).arrive("#channel-list", {"onceOnly": false}, function() {
  $('#channel-list').hide();
  $('#channel-carat-up').hide();
  $('#channel-toggle').click(toggleChannels);

  $('#playlist-form').submit(createPlaylist);
});

function toggleChannels(){
  console.log("hi");
    channels_visible = !channels_visible;
    if (channels_visible) {
        $('#channel-list').show();
        $('#channel-carat-up').show();
        $('#channel-carat-down').hide();
    } else {
        $('#channel-list').hide();
        $('#channel-carat-up').hide();
        $('#channel-carat-down').show();
    }
}

$(document).arrive('#library-toggle', function() {
  $('#library-toggle').click(loadLibrary);
})
