/*jshint esversion: 6 */

$(document).on('click', '.col-header a', function() {
  const sortBy = $(this).parent().data('sort');
  updateSort(sortBy);
});

// Variables used for sort functionality
let sortType = 'r.properties.created_at';
let sortReverse = true;

$(document).arrive('.col-header', function() {
  const selector = 'li[data-sort="' + sortType + '"] .icon-uEA06-caret-up';
  $(selector).removeClass('hidden');
});

// Update sort variables
function updateSort(sortBy){
  $('.col-sizeable i:not(.icon-uEA08-download)').addClass('hidden');
  resetPaging();

  if (sortType == sortBy) {
    sortReverse = !sortReverse;
  } else {
    sortReverse = false;
  }

  if (sortReverse){
    $('.col-header[data-sort="' + sortBy + '"] .icon-uEA06-caret-up').removeClass('hidden');
  } else {
    $('.col-header[data-sort="' + sortBy + '"] .icon-uEA03-caret-down').removeClass('hidden');
  }

  sortType = sortBy;

  getPage(function(tracks) {
    resetDisplay(tracks);
  });
}

function cursorUp(){
  var current = $('.cursor');
  var next = current.prev();
  current.removeClass('cursor');
  next.addClass('cursor');
}

function cursorDown(){
  var current = $('.cursor');
  var next = current.next();
  current.removeClass('cursor');
  next.addClass('cursor');
}

function attachColHandles() {
  // initialize our columns
  columns.init();
  $('.col-sizeable').each(function() {
    $(this).children('li').each(function() {
      // iterating through each header title li

      let thisC = $(this).find('a').data('also-resize');
      // make each col-header resizable
      var opt = {
        // optional selector for handle that starts dragging
        handleSelector: 'li.'+ thisC + ' .drag-handle',
        // resize the width
        resizeWidth: true,
        // resize the height
        resizeHeight: false,
        // the side that the height resizing is relative to
        resizeWidthFrom: 'right',
        // hook into start drag operation (event,$el,opt passed - return false to abort drag)
        onDragStart: function (e, el) {
          snapColumn(e, el);
        },
        // hook into stop drag operation (event,$el,opt passed)
        onDragEnd: function (e, el) {
          snapColumn(e, el);
        },
        // hook into each drag operation (event,$el,opt passed)
        onDrag: function (e, el) {
          if ($(el).width() <= ($(el).find('a').width() + 9)) {
            return false;
          }
        },
        // disable touch-action on the $handle
        // prevents browser level actions like forward back gestures
        touchActionNone: true
      };

      function snapColumn(e, el) {
        if ($(el).width() <= $(el).find('a').width() + 10) {
          $(el).width($(el).find('a').width() + 11);
          return false;
        }
        var resClass = $(el).find('a').attr('data-also-resize');
        var newSize = $(el).css('width').split('px').join('');
        columns.set(resClass, newSize);
      }

      $(this).resizable(opt);

      // $(this).resizable({
      //   handles: 'se',
      //   autoHide: true,
      //   minHeight: 30,
      //   maxHeight: 30,
      //   resize: function(event, ui) {
      //
      //   },
      //   stop: function (event, ui) {
      //     var resClass = ui.element.find('a').attr('data-also-resize');
      //     columns.set(resClass, ui.size.width);
      //   }
      // });

      // $(this).click(function () {
      //   $(this).css('width', 'auto');
      // });

      // TODO move target of resize click functionality since below fn didn't work
      // stop resizing from causing sort
      // $('ui-resizable-handle').click(function (event) {
      //   event.stopPropogation();
      // });

    });
  });
}
