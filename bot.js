'use strict';
const BotKit = require('botkit');
const Greeting = require('./actions/greeting');
const _ = require('lodash');

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


controller.hears(['\bhello\b', '\bhi\b', '\byo\b'], Direct, (bot, message) => {
    bot.reply(message, Greeting());
});

controller.hears(['help', 'what.*do'], Direct, (bot, message) => {
    bot.reply(message, `
    Currently, I can't do very much.
    But I can say hi if you say 'hi @brooklyn'
    And I also can pick food. Examples
    \`\`\`
    Add food pizza @brooklyn
    Add food potatoes @brooklyn
    @brooklyn list food
    What can we eat @brooklyn?
    Pick something to eat @brooklyn
    tell us what to eat @brooklyn
    Remove food pizza @brooklyn
    Remove food potatoes @brooklyn
    \`\`\`
    `);
});

// Getting food choices
controller.hears(['(list|tell|what).*(food|eat)'], Direct, (bot, message) => {
    controller.storage.channels.get(message.channel, (err, data) => {
        if ( err || ! "food" in data || data['food'].length == 0 ) {
            bot.reply(message, 'No food choices have been added yet.');
        }
        else {
            bot.reply(message, `Food choices: ${data['food'].toString()}`);
        }
    });
});

// Getting food choices
controller.hears(['(pick|eat|random.*).*(food|eat)'], Direct, (bot, message) => {
    controller.storage.channels.get(message.channel, (err, data) => {
        if ( err || ! "food" in data || data['food'].length == 0 ) {
            bot.reply(message, 'No food choices have been added yet.');
        }
        else {
            console.log(data['food']);
            let randomFood = _.sample(data['food']);
            bot.reply(message, `I pick ${randomFood}`);
        }
    });
});


controller.hears(['remove food ([^ ]+)'], Direct, (bot, message) => {
    const food = message.match[1].toLowerCase();
    // Check if food already exists
    controller.storage.channels.get(message.channel, (err, data) => {
        console.log(data);
        if ( err || ! "food" in data || ! data['food'].includes(food) ) {
            bot.reply(message, `${food} is not on the list.`);
            return;
        }
        else {
            const index = data['food'].indexOf(food);
            data['food'].splice(index, 1);
        }
        controller.storage.channels.save(data, (err) => {
            if (err) {
                bot.reply(message, `Hrm.. I had a problem removing ${food}`);
                console.log(err);
                return;
            }
            bot.reply(message, `${food} has been removed!`);
        });

    });
});

controller.hears(['add food ([^ ]+)'], Direct, (bot, message) => {
    const food = message.match[1].toLowerCase();
    if (food == '@brooklyn') {
    }
    // Check if food already exists
    controller.storage.channels.get(message.channel, (err, data) => {
        console.log(data);
        if ( !err && "food" in data && data['food'].includes(food)) {
            bot.reply(message, `${food} is already on the list.`);
            return;
        }
        // if entry doesn't exist. Need to create initial food array
        if ( err || ! "food" in data) {
            data = {
                id: message.channel,
                food: [food]
            };
        }
        else {
            data['food'].push(food); 
        }
        controller.storage.channels.save(data, (err) => {
            if (err) {
                bot.reply(message, `Hrm.. I had a problem saving ${food}`);
                console.log(err);
                return;
            }
            bot.reply(message, `${food} has been added!`);
        });

    });
});


bot.startRTM( (err, bot, payload) => {
    if (err) {
        throw new Error("Could not connect to slack");
    }
});
