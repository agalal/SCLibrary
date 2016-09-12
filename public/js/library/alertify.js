var alertify = (function(bootbox) {
    var makePrompt = function (text, value, callback) {
      bootbox.prompt({
        title: text,
        callback: function(result) {
          if (result === null) {
            Example.show("Prompt dismissed");
          } else {
            callback(result);
          }
        },
        value: value
      });
    };
    var makeAlert = function () {

    };
    return {
      prompt: makePrompt,
      alert: makeAlert
    };
})(bootbox);
