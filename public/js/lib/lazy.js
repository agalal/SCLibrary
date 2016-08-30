// define constants for paging
let limit = 100;
let offset;
let page;

// this flag serves as a lock to make sure that the isElementInViewport event does not fire multiple times
let flag = true;

// stores the lazyLoadTarget jquery element
let lazyLoadTarget;

// whenever new track rows appear on the screen, reassign the lazyLoadTarget class
$(document).arrive(".track-row", {"onceOnly": false}, function() {
  // update the page offset before reassigning the target class
  offset = limit * page;
  // reassign the class
  $($('.track-row')[offset-10]).addClass('lazyLoadTarget');
  lazyLoadTarget = $('.lazyLoadTarget');
  // set the flag to true to signify we are ready to look for the target again
  flag = true;
});

// wait for the library list container to show up on the screen before assigning the scroll handler
$(document).arrive(".list", function() {
  // assign the scroll handler to the list container
  $('.library-wrapper').on('scroll', function() {
    // check that the element is in the viewport and also that we are ready to look for the target
    if (isElementInViewport(lazyLoadTarget) && flag){
      // set the flag to false to signify that we do not want to look for the target again until it has been reassigned
      flag = false;
      // remove the lazyLoadTarget class from it's current track row
      $('.lazyLoadTarget').removeClass('lazyLoadTarget');
      // retrieve the next page from the database
      getPage(function(tracks) {
        // add the new page of tracks to the display
        const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
        aScope.addToDisplay(tracks);
        // increment the page number
        page++;
      });
    }
  });
});

// helper function used to calculate whether a given element is visible on the viewport
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

let term = "";
$(document).arrive('#search-form', function() {
  $('#search-form').submit(function() {
    term = $('#search-bar').val();
    getPage(function(tracks) {
      const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
      aScope.resetDisplay(tracks);
    });
  })
})


// retreive a page of tracks from the database
function getPage(done) {
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  var uid = loggedinuser._id;
  let sort = aScope.sortType.substring(0,1) + aScope.sortType.substring(12)
  let reverse;
  if (aScope.sortReverse) {
    reverse = "DESC";
  } else {
    reverse = "ASC";
  }
  let context = aScope.context;
  var url = 'http://localhost:3000/api/users/' + uid + '/collection/?limit=' + limit;
      url += '&offset=' + offset + '&sort=' + sort + '&reverse=' + reverse + '&context=' + context;
  if (context == 'channel') url += '&cid=' + aScope.cid;
  else if (context == 'playlist') url += '&pid=' + aScope.pid;
  else if (context == 'scplaylist') url += '&spid=' + aScope.spid;

  if (term != "") url += `&q=${term}`;
  $.get(url, function(data) {
    done(data);
  });
}
