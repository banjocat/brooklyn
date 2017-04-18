const say = require('say');
const mqtt = require('mqtt');

console.log('Bootstrapping');
const client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}`)

client.on('connect', () => {
    console.log('Connecting to mqtt broker');
    client.subscribe('say');
});

client.on('message', (topic, message) => {
    // Interrupts any previous speech
    say.stop();
    say.speak(message);
    console.log('Recieved message and said something');
});

