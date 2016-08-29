let channels_visible = false;

$(document).arrive("#channel_list", {"onceOnly": false}, function() {
  $('#channel_list').hide();
  $('#channels-carat-up').hide();
  $('#channels-toggle').click(toggleChannels);
});

function toggleChannels(){
    channels_visible = !channels_visible;
    if (channels_visible) {
        $('#channel_list').show();
        $('#channels-carat-up').show();
        $('#channels-carat-down').hide();
    } else {
        $('#channel_list').hide();
        $('#channels-carat-up').hide();
        $('#channels-carat-down').show();
    }
}

$(document).arrive('#library-toggle', function() {
  $('#library-toggle').click(loadLibrary);
})
