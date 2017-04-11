'use strict';
const BotKit = require('botkit');
const Greeting = require('./actions/greeting');
const _ = require('lodash');
const Spreadsheet = require('./models/spreadsheet.js');

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


controller.hears(['(when|can).*beer'], Direct, (bot, message) => {
    bot.reply(message, 'Beer is on Friday');
});

controller.hears(['(get|bring).*beer'], Direct, (bot, message) => {
    bot.reply(message, 'No, I have no arms.');
});

controller.hears(['(is|time).*(beer|friday)'], Direct, (bot, message) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'];
    const date = new Date();
    const today = days[date.getDay()];
    if (today == 'Friday') {
        const beertime = 17;
        const hours = date.getHours();
        if (hours >= beertime)
            bot.reply(message, 'Yes, it is beer time!');
        else
            bot.reply(message, `It is ${today}.. but it is before ${beertime}`);
    }
        
    else 
        bot.reply(message, `No, it is ${today}`);
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
    bot.reply(message,
        `*Spread sheet for editing:* docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}`);
    bot.reply(message, '*List of food options*');
    Spreadsheet.getFoodWithHyperlink( (food) => {
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
    Spreadsheet.getFoodWithHyperlink( (food) => {
        const foodNames = _.map(food, 'name');
        bot.reply(message, "I choose " + _.sample(foodNames));
    });
});


bot.startRTM( (err, bot, payload) => {
    if (err) {
        throw new Error("Could not connect to slack");
    }
});
