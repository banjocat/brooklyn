'SPREADSHEET_IDuse strict';
const fs = require('fs');
const BotKit = require('botkit');
const Greeting = require('./actions/greeting');
const _ = require('lodash');
const Spreadsheet = require('./models/spreadsheet.js');
const MQTT = require('mqtt');

const mqtt = MQTT.connect('mqtt://mosca');

const secrets = JSON.parse(fs.readFileSync('./secrets.json'));

const controller = BotKit.slackbot({
    json_file_store: './jsonstore/store.json',
});

let bot_config = {};
if (process.env.ENV == 'dev') {
    bot_config['token'] = secrets.queens_token;
}
else if (process.env.ENV == 'prod') {
    bot_config['token'] = secrets.brooklyn_token;
}

const bot = controller.spawn(bot_config);

const Direct = ['direct_message','direct_mention','mention'];

// Setup all the simple conversations from the json file
const simple = JSON.parse(fs.readFileSync('./models/simpleconversation.json', 'utf8'));
_.mapKeys(simple, (value, key) => {
    controller.hears(key, Direct, (bot, message) => {
        bot.reply(message, value);
    });
});

controller.hears('say (.+)', Direct, (bot, message) => {
    const msg = message.match[1];
    mqtt.publish('say',  msg);
});

controller.hears(['hello'], Direct, (bot, message) => {
    const msg = Greeting();
    bot.reply(message, msg);
    mqtt.publish('say', msg);
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
controller.hears(['(select|choose|what|pick|eat|tell).*(food|eat)'], Direct, (bot, message) => {
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
