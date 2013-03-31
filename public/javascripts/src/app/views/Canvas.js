Snake.Views.Canvas = (function () {

    var Canvas = Backbone.View.extend({

        el: '#canvas',

        cellSize: 10,

        canvasSize: 500,

        cells: null,

        rendered: false,

        initialize: function (options) {
            this.cells = [];
            this.model.on('change:matrix', function () {
                this.render(false)
            }, this);
        },

        render: function (force) {
            if (!this.rendered || force) {
                this.cellSize = this.canvasSize / this.model.get('width');
                var fragment = $(document.createDocumentFragment());
                for (var x = 0; x < this.model.get('width'); x++) {
                    this.cells[x] = [];
                    for (var y = 0; y < this.model.get('height'); y++) {
                        this.cells[x][y] = this._createCell(x, y);
                        fragment.append(this.cells[x][y]);
                    }
                }
                this.$el.empty().append(fragment);
                this.rendered = true;
            }
            this.update();
            return this;
        },

        update: function () {
            var matrix = this.model.get('matrix');
            _.each(matrix, function (column, x) {
                _.each(column, function (cell, y) {
                    this.cells[x][y].attr('class', '');
                    if (cell !== null) {
                        var cellInfo = this._parseCellIdentifier(cell);
                        this.cells[x][y].addClass(cellInfo.labels.join(' '));
                        this.cells[x][y].attr('id', cellInfo.id);
                        if (this.model.player && cellInfo.type === 'player' && cellInfo.id === this.model.player.get('name')) {
                            this.cells[x][y].addClass('current');
                        }
                    }
                }, this);
            }, this);
            return this;
        },

        _createCell: function (x, y) {
            return $('<div/>').css({
                width: this.cellSize + 'px',
                height: this.cellSize + 'px',
                top: y * this.cellSize + 'px',
                left: x * this.cellSize + 'px'
            });
        },

        _renderPlayer: function () {

        },

        _renderFood: function () {

        },

        _renderPowerUp: function () {

        },

        _parseCellIdentifier: function (str) {
            var cellId = {},
                parts = str.split('#'),
                labels = parts[0].split(':');

            cellId.type = labels[0];
            cellId.labels = labels;
            cellId.id = parts[1] || '';
            return cellId;
        }
    });

    return Canvas;
}());