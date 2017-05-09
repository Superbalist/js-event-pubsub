'use strict';

let LocalPubSubAdapter = require('@superbalist/js-pubsub').LocalPubSubAdapter;
let EventManager = require('../lib/EventManager');
let SimpleEventMessageTranslator = require('../lib/translators/SimpleEventMessageTranslator');
let SimpleEvent = require('../lib/events/SimpleEvent');

let adapter = new LocalPubSubAdapter();
let translator = new SimpleEventMessageTranslator();
let manager = new EventManager(adapter, translator);

// listen for "*" event
manager.listen('events', '*', (event) => {
  console.log("Listener '*' received new event on channel 'events':");
  console.log(event);
});

// listen for "user.created" event
manager.listen('events', 'user.created', (event) => {
  console.log("Listener 'user.created' received new event on channel 'events':");
  console.log(event);
});

// dispatch an event
let event = new SimpleEvent('user.created', {
  user: {
    id: 1456,
    first_name: 'Joe',
    last_name: 'Soap',
    email: 'joe.soap@example.org',
  },
});

manager.dispatch('events', event);
