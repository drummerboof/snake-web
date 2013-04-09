Snake.Collections.Players = (function () {

    var Players = Backbone.Collection.extend({

        model: Snake.Models.Player,

        comparator: function (player) {
            return -player.get('score');
        }
    });

    return Players;
}());