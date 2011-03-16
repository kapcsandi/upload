/*
* jquery.uploadProgress
*
* Copyright (c) 2008 Piotr Sarnacki (drogomir.com)
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
*/

(function($) {
  var options = $.extend({
    action: "/upload",
    start: function() {},
    uploading: function() {},
    complete: function(data) {
      jQuery.post(
        '/complete_upload',
        data,
        function(data) {
          data = $.parseJSON(data);
          $('#status').html('Uploaded file: <b><a href="'+ data.filename.replace(/^.*\/public\//,'') +'">' + data.filename + '</a></b><br />Title: <b>' + data.title + '</b>');
        }
      );
    },
    success: function() {},
    error: function() {},
    interval: 2000,
    timer: ""
  });
  $('form').ajaxForm({
    target: '#status',
    beforeSubmit: function(a,f,o) {
      $(this.target).html('Uploading .. 0%');
      $("#progressbar").css({'height': '10px', 'margin-bottom': '10px', 'border': '1px solid white'});
      var uuid = "";
      for (i = 0; i < 32; i++) { uuid += Math.floor(Math.random() * 16).toString(16); }
      options.uuid = uuid;

    /* patch the form-action tag to include the progress-id if X-Progress-ID has been already added just replace it */
      if(old_id = /X-Progress-ID=([^&]+)/.exec(options.action)) {
        f.action = options.action.replace(old_id[1], uuid);
      } else {
        f.action = options.action + "?X-Progress-ID=" + uuid;
      }
      this.url = f.action;
      options.timer = window.setInterval(function() { jQuery.uploadProgress(this, options) }, options.interval);
      return true;
    },
    success: function(data) {
      var data = $.parseJSON($("#status").html()),
        title = $('input[name="title"]').val(),
        filename = data.filename;
      options.complete({"title": title,"filename": filename});
    }
  });

jQuery.uploadProgress = function(e, options) {
  jQuery.ajax({
    type: 'GET',
    cache: false,
    url: '/progress?X-Progress-ID=' + options.uuid,
    success: function(upload) {
      var upload = eval(upload);
      if(upload) {
        if (upload.state == 'uploading') {
          upload.percents = Math.floor((upload.received / upload.size)*1000)/10;
          options.uploading(upload);
        }

        if (upload.state == 'done' || upload.state == 'error') {
          upload.percents = 100;
          window.clearTimeout(options.timer);
        }
        if (upload.state == 'done') {
          options.success(upload);
        }
        if (upload.state == 'error') {
          options.error(upload);
        }
        if (upload.percents) {
          status = $("#status").html().replace(/(Uploading .. )[\d.]+\%/, '$1' + upload.percents+'%')
          $("#status").html(status);
          $("#progressbar").css({width: upload.percents+'%'});
        }
      }
    }
  });
};
})(jQuery);
