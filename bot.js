'use strict';
const BotKit = require('botkit');

const controller = BotKit.slackbot({debug: true});

controller.hears('hello',['direct_message', 'direct_mention', 'mention'],
    (bot, message) => {
        bot.reply(message, 'Hello yourself.');
    }
);
