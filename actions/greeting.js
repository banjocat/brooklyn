'use strict';
const _ = require('lodash');

const greetings = [
    'Greetings earthling!',
    'Hello',
]
var Greeting = () => {
    return _.sample(greetings);
}


module.exports = Greeting;
