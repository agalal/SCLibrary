let columns = [
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
  }
];

function highlightRow(track){
  $('.curr-playing').removeClass('curr-playing');
  $('*[data-id="' + track.t._id + '"]').addClass('curr-playing');
}

// used to track resize direction
var left = false;

function snapToPercents(parentEl) {
    // resize col's below
    $(eachC).each(function() {
      if (j == colCt - 1) {
        $(this).css('width', catchAll.toString() + "%");
      } else {
        $(this).css('width', perW.toString() + "%");
      }
    });
    j++;
}

function attachColHandles() {
  var cols = getOpt('columns');
  $('.col-sizeable').each(function() {
    // multiple loops and class vs id
    $(this).children('li').each(function() {
      // elements with class matching col header
      // are resized in stop fn
      var thisClass = "." + $(this).find('a').text().toLowerCase();
      var handles = 'se';

      // make each col-header resizable
      $(this).resizable({
        handles: handles,
        autoHide: true,
        minHeight: 30,
        maxHeight: 30,

        resize: function(event, ui) {
          // hack to determine resize dir
          var srcEl = event.originalEvent.originalEvent.path[0].className;
          var dragD = srcEl.replace('ui-resizable-handle ui-resizable-', '');
          var dragC = srcEl.replace('ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-', '');

          // toggle direction global
          // as dragD/C value is somewhat unpredictable
          if (dragD == 'sw' || dragC == 'sw') {
            left = true;
          } else if (dragD == 'se' || dragC == 'sw') {
            left = false;
          }

          var headerW = $(this).parent().width();
          var cumW;
          var colCount;
          // behaviour varies by drag side
          if (!left) {
          } else {
            // left-side drag
          }
        }
      });

      // stop resizing from causing sort
      $('ui-resizable-handle').click(function (event) {
        event.stopPropogation();
      });

      // bind a function to update lower widths
      $(this).on('resizestop', function() {
        left = false; // reset global hack for dir
        //snapToPercents($(this).parent());
        console.log($(this).find('a').attr('also-resize') + ' : ' + $(this).css('width'));
        updateChildren($(this).find('a').attr('also-resize'), $(this).css('width'));
      });
    });
  });
}

function updateChildren(childClass, w) {
  // resize col's below by class
  $('.' + childClass).css('width', w);
}
