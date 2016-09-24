// jshint esversion: 6
var columns = (function(){
  // define default column array
  var def = [
    {
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
      name: 'liked',
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
    }
  ];
  var colArr;

  var recoverCols = function () {
    // only called if localstorage exists
    var recover = [];
    def.forEach(function (item, index) {
      var thisCol = localStorage.getItem(item.name);
      if (thisCol !== null) {
        // if we have columns stored, use them
        recover.push(JSON.parse(thisCol));
      }
      else {
        // if we don't have them stored
        localStorage.setItem(item.name, JSON.stringify(item));
        recover.push(item);
      }
    });
    return recover;
  };

  var init = function () {
    if (typeof(Storage) !== "undefined") {
      // local storage is supported
      colArr = recoverCols();
      colArr.forEach(function (item, index) {
        // stylesheet manipulation
        var selector = '.' + item.name;
        var rule = 'width: ' + item.width + 'px';
        sheet.addRule(selector, rule, 0);
      });
    } else {
      // Sorry! No Web Storage support..
      colArr = def;
    }
    // sheet.addRule('li.track-row:nth-of-type(2n+1)','background-color:#FFFFF;', 0);
    // sheet.addRule('li.track-row:nth-of-type(2n)','background-color:#F6F6F6;', 0);
  };

  var setCol = function (name, width) {
    // find matching column json from colArr
    var thisCol = JSON.parse(localStorage.getItem(name));
    //update width
    thisCol.width = width;
    // update local storage
    localStorage.setItem(name, JSON.stringify(thisCol));
    sheet.changeRule('.'+name, 'width: ' + width + 'px');
    console.log(sheet);
  };

  // var restripe = function () {
  //   console.log('stripe hack');
  //   $('ul.list').hide().show(0);
  // };

  return {
    init: init,
    get: function (name) {
      if (name) {
        return colArr.find(function (item, index) {
          if (this === item.name) return item.name;
        }, name);
      } else {
        return colArr;
      }
    },
    set: setCol,
    // restripe: restripe
  };
})();
