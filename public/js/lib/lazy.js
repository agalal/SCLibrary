let limit = 100;
let offset = 0;
let page = 1;
let flag = true;

let el;

$(document).arrive(".track-row", {"onceOnly": false}, function() {
  console.log("New track rows added, assigning lastElement class.")
  const numRows = limit * page;
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
      const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
      getNextPage(function(tracks) {
        console.log("Next page found, adding to scope.")
        aScope.addToDisplay(tracks);
      });
    }
  });
});

function isElementInViewport (el) {
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }
    const rect = el.getBoundingClientRect();
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
