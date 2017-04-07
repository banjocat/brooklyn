'use strict';

const greetings = [
    'Greetings earthling!',
    'Hello',
]
var Greeting = () => {
    return greetings[Math.floor(Math.random() * greetings.length)];
}


module.exports = Greeting;
