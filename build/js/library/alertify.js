var alertify = (function(bootbox, $) {
    var that = {};

    var sideAlert = (function() {
      var elem,
          hideHandler,
          that = {};

      that.init = function(options) {
          elem = $('.bb-alert');
      };

      that.show = function(type, text) {
        elem.removeClass('alert-info').removeClass('alert-danger');
        elem.removeClass('alert-success').addClass('alert-' + type);
        clearTimeout(hideHandler);
        elem.find("span").html(text);
        elem.delay(200).fadeIn().delay(4000).fadeOut();
      };

      return that;
    }());

    sideAlert.init();

    that.prompt = function (text, value, callback) {
      bootbox.prompt({
        title: text,
        callback: function(result) {
          if (result === null) {
            sideAlert.show('info','Download cancelled','');
          } else {
            // if prompt wasn't cancelled
            callback(result);
          }
        },
        value: value
      });
    };

    that.alert = function (text, success, failure) {
      bootbox.confirm(text, function(result) {
        if (result) success();
        else failure();
      });
    };

    that.quick = function (type, title, text) {
      var formatted = '<strong>' + title + '</strong> ' + text;
      sideAlert.show(type, formatted);
    };

    return that;
})(bootbox, $);
