var sites = [
  { url: 'http://www.zippysharermp3.com/search/?q=',
    name: 'ZippyShare'
  },
  { url: 'https://thepiratebay.org/search/',
    name: 'thepiratebay'
  },
  { url: 'https://www.beatport.com/search?q=',
    name: 'Beatport'
  }
];

let _options = {
  shuffle: false,
  repeat: false,
  autoplay: true,
  autocheck: true
}

function setOpt(option, value){
  _options[option] = value;
}

function toggleOpt(option){
  _options[option] = !_options[option];
}

function getOpt(option){
  return _options[option];
}

var toggledLib = false;
function toggleLib() {
   if (!toggledLib) $('body').addClass('toggled');
   else $('body').removeClass('toggled');
   toggledLib = !toggledLib;
}

var toggledSet = false;
function toggleSet() {
   if (!toggledSet) $('#settings').addClass('toggled');
   else $('#settings').removeClass('toggled');
   toggledSet = !toggledSet;
}

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
