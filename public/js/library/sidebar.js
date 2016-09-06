let channels_visible = false;
let scplaylists_visible = false;
let playlists_visible = false;

let sidebarOpen = false;
$(document).on('click', '#sidebar-toggle', function() {
  if (!sidebarOpen) {
    $('#search-bar').focus();
  }
  sidebarOpen = !sidebarOpen;
});

$(document).arrive(".side", {"onceOnly": true}, initializeSidebar);

function initializeSidebar(){
  // Load the channel, playlist, and soundcloud playlist lists
  loadChannels();
  loadPlaylists();
  loadSCPlaylists();

  // Attach the library, download, deleted, queue link handlers
  $('#library-toggle').click(loadLibrary);
  $('#download-toggle').click(loadDownloadList);
  $('#deleted-toggle').click(loadDeleted);
  $('#queue-link').click(displayQueue);

  // Hide the channel, playlist, and scplaylist lists using jquery
  $('#channel-list').hide();
  $('#scplaylist-list').hide();
  $('#playlist-list').hide();

  // Hide their up carat icons
  $('#channel-carat-up').hide();
  $('#scplaylist-carat-up').hide();
  $('#playlist-carat-up').hide();

  // Attach the visibility toggle listeners
  $('#channel-toggle').click(toggleChannels);
  $('#scplaylist-toggle').click(toggleSCPlaylists);
  $('#playlist-toggle').click(togglePlaylists);

  // Hide the add playlist form and attach the form/button listeners
  $('#add-playlist-form').hide();
  $('#add-playlist-input').hide();
  $('#add-playlist-btn').click(function(){
      $('#add-playlist-input').show();
  });
  $('#add-playlist-form').submit(createPlaylist);

  // Attach the delete playlist button handler
  attachDeletePlaylistHandler();
}

function attachDeletePlaylistHandler() {
  // Attach the delete playlist button handler
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

function togglePlaylists(){
    playlists_visible = !playlists_visible;
    if (playlists_visible) {
        $('#playlist-list').show();
        $('#add-playlist-form').show();
        $('#playlist-carat-up').show();
        $('#playlist-carat-down').hide();
    } else {
        $('#playlist-list').hide();
        $('#add-playlist-form').hide();
        $('#playlist-carat-up').hide();
        $('#playlist-carat-down').show();
    }
}

function buildChannelList(channels){
  var list = `<ul class="sublist">`;
  for (let i = 0; i < channels.length; i++){
    const properties = channels[i].c.properties;
    const cid = channels[i].c._id;
    const name = properties.name;
    list += `<li class='channel-name' data-id='${cid}'>${name}</li>`;
  }
  list += "</ul>"
  document.getElementById('channel-list').innerHTML = list;
  $('.channel-name').click(function() {
    loadChannel($(this).data('id'));
  });
}

function buildPlaylistList(playlists){
  var list = '<ul class="sublist">';
  for (let i = 0; i < playlists.length; i++){
    const properties = playlists[i].p.properties;
    const pid = playlists[i].p._id;
    const name = formatName(properties.name);
    list += `<li class='playlist-name' id='playlist${i}' data-id='${pid}'>${name}<span class='delete-playlist' data-id='${pid}'>X</span><br></li>`;
  }
  list += '</ul>'
  document.getElementById('playlist-list').innerHTML = list;
  $('.playlist-name').click(function() {
    loadPlaylist($(this).data('id'));
  });
  attachDeletePlaylistHandler();
}

function buildSCPlaylistList(playlists){
  var list = '<ul class="sublist">';
  for (let i = 0; i < playlists.length; i++){
    const properties = playlists[i].p.properties;
    const pid = playlists[i].p._id;
    const name = formatName(properties.name);
    list += `<li class='scplaylist-name' data-id='${pid}'>${name}</li>`;
  }
  list += '</ul>';
  document.getElementById('scplaylist-list').innerHTML = list;
  $('.scplaylist-name').click(function() {
    loadSCPlaylist($(this).data('id'));
  });
}

// Format playlist name string
function formatName(name){
  if (name.length > 31) {
    return (name.substring(0,31).trim() + "...");
  } else {
    return name;
  }
}
