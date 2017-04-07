'use strict';

const Direct = ['direct_message','direct_mention','mention'];

var FoodController = (controller) => {
    controller.on(['food', 'seamless'], Direct,
        (bot, message) => {
            bot.reply(message, 'Food choices');
        });
}

module.exports = FoodController;
