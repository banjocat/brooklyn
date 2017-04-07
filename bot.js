'use strict';
const BotKit = require('botkit');
const Greeting = require('./actions/greeting');
const FoodController = require('./actions/food');

const controller = BotKit.slackbot({
    json_file_store: './jsonstore/store.json',
});

const bot = controller.spawn({
    token: process.env.BOT_TOKEN
});

const Direct = ['direct_message','direct_mention','mention'];


controller.on('channel_joined', (bot, message) => {
    bot.reply(message, 'Never fear. Brooklyn is here!');
});


controller.hears(['hello.*', 'hi.*', 'yo.*'], Direct, (bot, message) => {
    bot.reply(message, Greeting());
});


// Getting food choices
controller.hears(['list food .*', 'tell me about food.*', 'what to eat.*'], Direct, (bot, message) => {
    controller.storage.channels.get(message.channel, (err, data) => {
        if ( err || ! "food" in data) {
            bot.reply(message, 'No food choices have been added.');
        }
        else {
            bot.reply(message, `Food choices: $${data['food'].split(' ')}}`);
        }
    });
});

// Random food choice
controller.hears(['add food (.*)'], Direct, (bot, message) => {
    const food = message.match[1].toLowerCase();
    // Check if food already exists
    controller.storage.channel.get(message.channel, (err, data) => {
        if ( !err && "food" in data && food in data['food']) {
            bot.reply(message, `${food} has already been added`);
            return;
        }
        else {

        }
    });
});


bot.startRTM( (err, bot, payload) => {
    if (err) {
        throw new Error("Could not connect to slack");
    }
});
