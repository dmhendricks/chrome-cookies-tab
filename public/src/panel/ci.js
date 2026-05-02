Backbone.sync = function(method, model, options) {
  const params = {};

  params.command = model.url + ':' + method;

  if (options.data == null && model && (method === 'delete' || method === 'create' || method === 'patch')) {
    params.data = options.attrs || model.toJSON(options);
  }

  if (options.data == null && method === 'update') {
    params.data = options.attrs || {};
    params.data.previousAttributes = model.previousAttributes();
    params.data.changedAttributes = model.changedAttributes();
  }

  socket.postMessage(params);
};

const ci = {

  /**
   * Pointer used by the ContextMenu to keep track
   * if the editor is open or not.
   */
  editor: null,

  resizers: {},

  Models: {},

  Collections: {},

  Views: {},

  run: function() {
    this._listenToWindowResize();
    this._listenToResizerDrag();

    this.cookies = new ci.Collections.Cookies();

    const headerView = new ci.Views.Header({cookies: this.cookies});
    $(document.body).append(headerView.render().el);

    const contentView = new ci.Views.Content({cookies: this.cookies});
    $(document.body).append(contentView.render().el);

    const footerView = new ci.Views.Footer({cookies: this.cookies});
    $(document.body).append(footerView.render().el);

    // Add the resizers
    const $resizers = $('#header table th');
    for (let i = 1; i < $resizers.length; i += 1) {
      // If its the last col
      if ((i + 1) === $resizers.length) {
        continue;
      }

      const view = new ci.Views.Resizer({$column: $resizers.eq(i)});
      view.$el.attr('data-index', i - 1);
      this.resizers[i] = view;
      $(document.body).append(view.render().el);
    }

    this.cookies.fetch();
  },

  _listenToResizerDrag: function() {
    document.body.addEventListener('drag', this._onResizerDrag.bind(this), false);
  },

  _listenToWindowResize: function() {
    // window resize is said to be inefficient but in
    // this use case its alright ;)
    window.onresize = this._onWindowResize.bind(this);
  },

  _onWindowResize: function() {
    this.trigger('resize');
  },

  _onResizerDrag: function(e) {
    if (e.x === 0 && e.y === 0) { return; }

    const index = parseInt($(e.target).attr('data-index'));
    const thWidth = $('#header table th').eq(index)[0].offsetLeft + $('#header table th').eq(index)[0].offsetWidth;
    const difference = thWidth - e.x;
    const percentage = (difference / $('#header table').width()) * 100;

    // Resize the column
    const $headerCols = $('#header table col');
    const $contentCols = $('#content table col');

    const prevColWidth = $headerCols.eq(index).width() - percentage;
    const nextColWidth = $headerCols.eq(index + 1).width() + percentage;

    if (prevColWidth > 3 && nextColWidth > 3) {
      $headerCols.eq(index).css('width', prevColWidth + '%');
      $contentCols.eq(index).css('width', prevColWidth + '%');

      $headerCols.eq(index + 1).css('width', nextColWidth + '%');
      $contentCols.eq(index + 1).css('width', nextColWidth + '%');

      this.trigger('resize');
    }
  }
};

window.ci = ci;

// Make sure we get Backbone events on our
// literal object.
_.extend(ci, Backbone.Events);

// Main entry point
$(document).ready(function() {
  ci.run();
});
