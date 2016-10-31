// jshint esversion: 6
var autoqueue = [];
var queue = [];
var backqueue = [];

function fillAutoqueue(element) {
  var element2 = element;
  var t;

  autoqueue = [];
  var i = 0;
  while (element.next() && i < 20){
    t = element.next().data('id');
    autoqueue.push(t);
    element = element.next();
    i++;
  }

  backqueue = [];
  var j = 0;
  while (element2.prev() && j < 20){
    t = element2.prev().data('id');
    backqueue.push(t);
    element2 = element2.prev();
    j++;
  }
}

function deleteFromQueue(tid){
  for (var i = 0; i < queue.length; i++){
    if (tid == queue[i].t._id){
      resetDisplay(queue.splice(i, 1));
      break;
    }
  }
}
