let channels_visible = false;

$(document).arrive("#channel-list", {"onceOnly": false}, function() {
  $('#channel-list').hide();
  $('#channel-carat-up').hide();
  $('#channel-toggle').click(toggleChannels);

  $('#playlist-form').submit(createPlaylist);
});

$(document).arrive('#playlist-list', function() {
  attachDeletePlaylistHandler();
});

function attachDeletePlaylistHandler(){
  $('.delete-playlist').click(function(){
    const pid = $(this).data('id');
    deletePlaylist(pid);
  });
}

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
});

function buildChannelList(channels){
  var list = `<ul><div>`;
  for (let i = 0; i < channels.length; i++){
    const properties = channels[i].c.properties;
    const cid = channels[i].c._id;
    const name = properties.name;
    list += `<div class='channel-name' data-id='${cid}'>${name}</div>`;
  }
  list += "</div></ul>"
  document.getElementById('channel-list').innerHTML = list;
  $('.channel-name').click(function() {
    loadChannel($(this).data('id'));
  });
}

function buildPlaylistList(playlists){
  var list = '';
  for (let i = 0; i < playlists.length; i++){
    const properties = playlists[i].p.properties;
    const pid = playlists[i].p._id;
    const name = properties.name;
    list += `<li class='playlist-name' id='playlist${i}' data-id='${pid}'>${name}</li>`;
    list += `<span class='delete-playlist' data-id='${pid}'>X</span><br>`;
  }
  document.getElementById('playlist-list').innerHTML = list;
  $('.playlist-name').click(function() {
    loadPlaylist($(this).data('id'));
  });
  attachDeletePlaylistHandler();
}
