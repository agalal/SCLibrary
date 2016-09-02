var autoqueue = [];
var queue = [];
var backqueue = [];

function fillAutoqueue(element) {
  var element2 = element;

  autoqueue = [];
  var i = 0;
  while (element.$$nextSibling && i < 20){
    var t = element.$$nextSibling.track;
    autoqueue.push(t);
    element = element.$$nextSibling;
    i++;
  }

  backqueue = [];
  var j = 0;
  while (element2.$$prevSibling && j < 20){
    var t = element2.$$prevSibling.track;
    backqueue.push(t);
    element2 = element2.$$prevSibling;
    j++;
  }
}

function displayQueue(){
    const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
    curr_context = 'queue';
    aScope.updateDisplay(queue);
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
