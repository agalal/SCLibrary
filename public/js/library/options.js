var sites = [
  { url: 'http://www.zippysharermp3.com/search/?q=',
    name: 'ZippyShare'
  },
  { url: 'https://thepiratebay.org/search/',
    name: 'thepiratebay'
  },
  { url: 'https://www.beatport.com/search?q=',
    name: 'Beatport'
  },
  { url: 'http://edmmonsters.com/?s=',
    name: 'edmmonsters'
  }
];

let _options = {
  shuffle: false,
  repeat: false,
  autoplay: true,
  autocheck: true
};

function setOpt(option, value){
  _options[option] = value;
}

function toggleOpt(option){
  _options[option] = !_options[option];
}

function getOpt(option){
  return _options[option];
}

function toggleLib() {
  if (!toggledLib) $('body').addClass('toggled');
  else $('body').removeClass('toggled');
}
//
// function toggleSet() {
//   if (!toggledSet) $('#settings').addClass('toggled');
//   else $('#settings').removeClass('toggled');
// }


function toggleAuto() {
  if (!getOpt('autoplay')) $('#autoplay-toggle').addClass('toggled');
  else $('#autoplay-toggle').removeClass('toggled');
  toggleOpt('autoplay');
}

function toggleShuffle() {
  if (!getOpt('shuffle')) $('#shuffle-toggle').addClass('toggled');
  else $('#shuffle-toggle').removeClass('toggled');
  toggleOpt('shuffle');
}

function toggleAutocheck() {
  if (!getOpt('autocheck')) $('#autocheck-toggle').addClass('toggled');
  else $('#autocheck-toggle').removeClass('toggled');
  toggleOpt('autocheck');
}

$(document).ready(function(){
  $('#updatingMessage').hide();
})

function updateCollection(){
  $('#updatingMessage').show();
  var scuid = loggedinuser.properties.scuid
  var url = "http://localhost:3000/api/users/" + scuid + "/collection/update";

  $.post(url, function( data ) {
    location.reload();
  });
}
