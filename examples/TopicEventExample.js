'use strict';

let LocalPubSubAdapter = require('@superbalist/js-pubsub').LocalPubSubAdapter;
let EventManager = require('../lib/EventManager');
let TopicEventMessageTranslator = require('../lib/translators/TopicEventMessageTranslator');
let TopicEvent = require('../lib/events/TopicEvent');

let adapter = new LocalPubSubAdapter();
let translator = new TopicEventMessageTranslator();
let manager = new EventManager(adapter, translator);

// listen for "*" event
manager.listen('events', '*', (event) => {
  console.log("Listener '*' received new event on channel 'events':");
  console.log(event);
});

// listen for "user/created" event
manager.listen('events', 'user/created', (event) => {
  console.log("Listener 'user/created' received new event on channel 'events':");
  console.log(event);
});

// listen for "user/*" event
manager.listen('events', 'user/*', (event) => {
  console.log("Listener 'user/*' received new event on channel 'events':");
  console.log(event);
});

// listen for "user/created/1.0" event
manager.listen('events', 'user/created/1.0', (event) => {
  console.log("Listener 'user/created/1.0' received new event on channel 'events':");
  console.log(event);
});

// listen for "order/created" event
manager.listen('events', 'order/created', (event) => {
  console.log("Listener 'order/created' received new event on channel 'events':");
  console.log(event);
});

// dispatch an event
let event = new TopicEvent(
  'user',
  'created',
  '1.0',
  {
    user: {
      id: 1456,
      first_name: 'Joe',
      last_name: 'Soap',
      email: 'joe.soap@example.org',
    },
  }
);

manager.dispatch('events', event);

// dispatch an event
event = new TopicEvent(
  'order',
  'created',
  '2.1',
  {
    order: {
      id: 1456,
    },
  }
);

manager.dispatch('events', event);
