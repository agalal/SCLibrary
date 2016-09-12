/*jshint esversion: 6 */

$(document).on('click', '.col-header', function() {
  const sortBy = $(this).data('sort');
  updateSort(sortBy);
});

// Variables used for sort functionality
let sortType = 'r.properties.created_at';
let sortReverse = true;

$(document).arrive('.col-header', function() {
  const selector = 'li[data-sort="' + sortType + '"] > .fa-caret-up';
  $(selector).removeClass('hidden');
});

// Update sort variables
function updateSort(sortBy){
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();

  $('.fa').addClass('hidden');
  resetPaging();

  if (sortType == sortBy) {
    sortReverse = !sortReverse;
  } else {
    sortReverse = false;
  }

  if (sortReverse){
    $('.col-header[data-sort="' + sortBy + '"] > .fa-caret-up').removeClass('hidden');
  } else {
    $('.col-header[data-sort="' + sortBy + '"] > .fa-caret-down').removeClass('hidden');
  }

  sortType = sortBy;

  getPage(function(tracks) {
    aScope.updateDisplay(tracks);
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



      // make each col-header resizable
      $(this).resizable({
        handles: 'se',
        autoHide: true,
        minHeight: 30,
        maxHeight: 30,
        resize: function(event, ui) {
          var resClass = ui.element.find('a').attr('data-also-resize');
          console.log('resizing ' + resClass + ' to ' + ui.size.width + ' px');
          columns.set(resClass, ui.size.width);
        },
        stop: function () {

        }
      });

      // TODO move target of resize click functionality since below fn didn't work
      // stop resizing from causing sort
      // $('ui-resizable-handle').click(function (event) {
      //   event.stopPropogation();
      // });

    });
  });
}
