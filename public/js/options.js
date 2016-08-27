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
  autocheck: true,
  columns:
    [{
      name: 'channel',
      index: 0,
      width: 120
    },
    {
      name: 'title',
      index: 1,
      width: 120
    },
    {
      name: 'date',
      index: 2,
      width: 120
    },
    {
      name: 'genre',
      index: 3,
      width: 120
    },
    {
      name: 'duration',
      index: 4,
      width: 120
    },
    {
      name: 'linked',
      index: 5,
      width: 120
    },
    {
      name: 'playcount',
      index: 6,
      width: 30
    },
    {
      name: 'rating',
      index: 7,
      width: 90
    },
    {
      name: 'domain',
      index: 8,
      width: 120
    },
    {
      name: 'downloaded',
      index: 9,
      width: 30
    }]
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
