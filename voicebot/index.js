const say = require('say');
const mqtt = require('mqtt');

const client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}`)

client.on('connect', () => {
    console.log('Connecting to mqtt broker');
    client.subscribe('say');
});

client.on('message', (topic, message) => {
    // Interrupts any previous speech
    say.stop();
    say.speak(message, 'voice_upc_ca_pau_hts', .9);
});

