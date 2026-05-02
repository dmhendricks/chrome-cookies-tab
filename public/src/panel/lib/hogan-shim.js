window.Hogan = {
  compile: function(template) {
    return {
      render: function(data) {
        return Mustache.render(template, data || {});
      }
    };
  }
};
