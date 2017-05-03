"use strict";

var LocalPubSubAdapter = require('@superbalist/js-pubsub').LocalPubSubAdapter;
var EventManager = require('../src/EventManager');
var SchemaEventMessageTranslator = require('../src/translators/SchemaEventMessageTranslator');
var JSONSchemaEventValidator = require('../src/validators/JSONSchemaEventValidator');
var SchemaEvent = require('../src/events/SchemaEvent');

let adapter = new LocalPubSubAdapter();
let translator = new SchemaEventMessageTranslator();

let ajv = JSONSchemaEventValidator.makeDefaultAjv();
ajv.addSchema({
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'My Schema',
  type: 'object',
  properties: {
    schema: {
      type: 'string'
    },
    user: {
      type: 'object'
    }
  },
  required: [
    'schema',
    'user'
  ]
}, 'schemas://events/user/created/1.0.json');
let validator = new JSONSchemaEventValidator(ajv);

let manager = new EventManager(adapter, translator, validator);

// listen for "user/created/1.0" event
manager.listen('events', 'user/created/1.0', (event) => {
  console.log("Listener 'user/created/1.0' received new event on channel 'events':");
  console.log(event);
});

// dispatch an event
let event = new SchemaEvent('schemas://events/user/created/1.0.json', {
  user: {
    id: 1456,
    first_name: 'Joe',
    last_name: 'Soap',
    email: 'joe.soap@example.org'
  }
});

manager.dispatch('events', event);
