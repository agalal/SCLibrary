	$(document).ready(function() {
	  $('#login-panel').addClass('loaded');
	  $('#request panel').addClass('loaded');
	  var uagent = navigator.userAgent.toLowerCase();
	  if (uagent.search("iphone") > -1 || uagent.search("ipad") > -1 || uagent.search("android") > -1 || uagent.search("blackberry") > -1 || uagent.search("webos") > -1) {
	    // mobile, replace vid with still
	    $("#video-div").replaceWith('<img style="z-index: -100" src="vid_still.jpg" alt="">');
	    $(window).resize();
	  } else {
	    // video won't load properly from local so I have it on MBM's dev server
	    // need to move this before launch
	    $("#video-div").replaceWith('<video autoplay loop poster="slide1_still.jpg" id="bgvid"><source src="http://dev.missionbaymedia.com/enigma/video/enigma.mp4" type="video/mp4"></video>');
	    var vid = document.getElementById("bgvid");
	    vid.addEventListener("click", function() {
	      vid.play();
	    });
	    $("#bgvid").trigger("click");
	  }
	});
