let channels_visible = false;
let scplaylists_visible = false;

$(document).arrive("#channel-list", {"onceOnly": false}, function() {
  $('#channel-list').hide();
  $('#channel-carat-up').hide();
  $('#channel-toggle').click(toggleChannels);

  $('#playlist-form').submit(createPlaylist);
});

$(document).arrive("#scplaylist-list", {"onceOnly": false}, function() {
  $('#scplaylist-list').hide();
  $('#scplaylist-carat-up').hide();
  $('#scplaylist-toggle').click(toggleSCPlaylists);
});

$(document).arrive('#playlist-list', function() {
  attachDeletePlaylistHandler();
});

$(document).arrive('#queue-link', function() {
  $('#queue-link').click(displayQueue);
});

function attachDeletePlaylistHandler(){
  $('.delete-playlist').click(function(){
    const pid = $(this).data('id');
    deletePlaylist(pid);
  });
}

function toggleSCPlaylists(){
    scplaylists_visible = !scplaylists_visible;
    if (scplaylists_visible) {
        $('#scplaylist-list').show();
        $('#scplaylist-carat-up').show();
        $('#scplaylist-carat-down').hide();
    } else {
        $('#scplaylist-list').hide();
        $('#scplaylist-carat-up').hide();
        $('#scplaylist-carat-down').show();
    }
}

function toggleChannels(){
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
    const name = formatName(properties.name);
    list += `<li class='playlist-name' id='playlist${i}' data-id='${pid}'>${name}</li>`;
    list += `<span class='delete-playlist' data-id='${pid}'>X</span><br>`;
  }
  document.getElementById('playlist-list').innerHTML = list;
  $('.playlist-name').click(function() {
    loadPlaylist($(this).data('id'));
  });
  attachDeletePlaylistHandler();
}

function buildSCPlaylistList(playlists){
  var list = '';
  for (let i = 0; i < playlists.length; i++){
    const properties = playlists[i].p.properties;
    const pid = playlists[i].p._id;
    const name = formatName(properties.name);
    list += `<li class='scplaylist-name' data-id='${pid}'>${name}</li>`;
  }
  document.getElementById('scplaylist-list').innerHTML = list;
  $('.scplaylist-name').click(function() {
    loadSCPlaylist($(this).data('id'));
  });
}

// Format playlist name string
function formatName(name){
  if (name.length > 26) {
    return (name.substring(0,26).trim() + "...");
  } else {
    return name;
  }
}

function displayQueue(){
    const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
    aScope.context = 'queue';
    aScope.updateDisplay(queue);
}
