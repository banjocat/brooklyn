'use strict';
const BotKit = require('botkit');
const Greeting = require('./actions/greeting');
const _ = require('lodash');
const getFoodWithHyperlink = require('./models/spreadsheet.js');

const controller = BotKit.slackbot({
    json_file_store: './jsonstore/store.json',
});

const bot = controller.spawn({
    token: process.env.BOT_TOKEN
});

const Direct = ['direct_message','direct_mention','mention'];


controller.hears(['hello'], Direct, (bot, message) => {
    bot.reply(message, Greeting());
});

controller.hears(['help', 'what.*do'], Direct, (bot, message) => {
    bot.reply(message, `
    Currently, I can't do very much.
    But I can say hello if you say 'hello @brooklyn'
    And I will read the NYC food choice list
    Pick something random to eat from it
    Eventually I will alert when people haven't made choices yet.
    \`\`\`
    List food @brooklyn
    Pick something to eat @brooklyn
    tell us what to eat @brooklyn
    \`\`\`
    `);
});

// Getting food choices
controller.hears(['list.*(food|eat)'], Direct, (bot, message) => {
    getFoodWithHyperlink( (food) => {
        _.each(food, (choice) => {
            if (choice) {
                const msg = `${choice.name}: ${choice.url}\n`
                bot.reply(message, msg);
            }
        });
    });
});


// Getting food choices
controller.hears(['(choose|what|pick|eat|tell).*(food|eat)'], Direct, (bot, message) => {
    getFoodWithHyperlink( (food) => {
        const foodNames = _.map(food, 'name');
        bot.reply(message, "I choose " + _.sample(foodNames));
    });
});


bot.startRTM( (err, bot, payload) => {
    if (err) {
        throw new Error("Could not connect to slack");
    }
});
