var autoqueue = [];
var queue = [];
var backqueue = [];

function fillAutoqueue(element) {
  var element2 = element;

  autoqueue = [];
  var i = 0;
  while (element.next() && i < 20){
    var t = element.next().data('track');
    autoqueue.push(t);
    element = element.next();
    i++;
  }

  backqueue = [];
  var j = 0;
  while (element2.prev() && j < 20){
    var t = element2.prev().data('track');
    backqueue.push(t);
    element2 = element2.prev();
    j++;
  }
}

function deleteFromQueue(tid){
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  for (var i = 0; i < queue.length; i++){
    if (tid == queue[i].t._id){
      aScope.updateDisplay(queue.splice(i, 1));
      break;
    }
  }
}
