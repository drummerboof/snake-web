Snake.Views.Controls = (function () {

    var Controls = Backbone.View.extend({

        el: '#controls',

        fields: null,

        events: {
            'click #controls-status-button': '_onPlayPauseClick',
            'click #controls-join-button': '_onJoinClick'
        },

        statusMap: {
            paused: 'play',
            over: 'reset',
            playing: 'pause'
        },

        keyMap: {
            13: 'enter',
            32: 'space'
        },

        initialize: function (options) {
            this.keyListener = new Snake.Models.KeyListener(this.keyMap);
            this.template = Handlebars.templates.controls;
            this.player = options.player;
            this.players = options.players;
            this.model.on('player:join:success', function () {
                this.render();
            }, this);
            this.model.on('change:status', function () {
                this.render();
            }, this);
            this.player.on('change:name', function () {
                this.render();
            }, this);
            this._initializeKeys();
        },

        render: function () {
            var playerJoined = !!this.players.get(this.player.get('name'));

            this.$el.html(this.template({
                name: this.player.get('name'),
                status: this.model.get('status'),
                button: this.statusMap[this.model.get('status')]
            }));

            this.$el.find('#controls-join').toggle(!playerJoined);
            this.$el.find('#controls-game').toggle(playerJoined);

            return this;
        },

        _initializeKeys: function () {
            this.keyListener.on('press:space', function () {
                this._onPlayPauseClick();
            }, this);
            this.keyListener.on('press:enter', function () {
                this._onJoinClick();
            }, this);
            this.keyListener.listen();
        },

        _onPlayPauseClick: function () {
            if (!this.players.get(this.player.get('name'))) {
                return false;
            }
            if (this.model.get('status') === Snake.Models.Game.STATUS_OVER) {
                this.model.reset();
            } else {
                this.model.toggleStatus();
            }
        },

        _onJoinClick: function () {
            if (!!this.players.get(this.player.get('name'))) {
                return false;
            }
            var playerField = this.$el.find('#controls-player-name');
            if (playerField.val() === '') {
                Snake.trigger('error:flash', 'Please enter a player name');
            } else {
                this.player.set({ name: playerField.val() });
            }
        }
    });

    return Controls;
}());