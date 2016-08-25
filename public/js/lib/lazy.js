
let el;
let flag = true;

$(document).arrive(".track-row", {"onceOnly": false}, function() {
  console.log("New track rows added, assigning lastElement class.")
  let numRows = limit * page;
  $($('.track-row')[numRows-10]).addClass('lastElement');
  el = $('.lastElement');
  flag = true;
});

$(document).arrive(".list", function() {
  $('.list').on('scroll', function() {
    if (isElementInViewport(el) && flag){
      console.log("Found element in the viewport, removing class and retreiving next page.")
      flag = false;
      $('.lastElement').removeClass('lastElement');
      var aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
      getNextPage(function(tracks) {
        console.log("Next page found, adding to scope.")
        aScope.addToDisplay(tracks);
      });
    }
  });
});

function isElementInViewport (el) {

    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}

function getNextPage(done) {
  offset = page * limit;
  page++;

  var uid = loggedinuser._id;
  var url = 'http://localhost:3000/api/users/' + uid + '/collection/?limit=' + limit + '&offset=' + offset;
  $.get(url, function(data) {
    done(data);
  });
}
