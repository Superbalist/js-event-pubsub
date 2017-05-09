# @superbalist/js-event-pubsub

An event protocol and implementation over pub/sub.

[![Author](http://img.shields.io/badge/author-@superbalist-blue.svg?style=flat-square)](https://twitter.com/superbalist)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@superbalist/js-event-pubsub.svg)](https://www.npmjs.com/package/@superbalist/js-event-pubsub)
[![NPM Downloads](https://img.shields.io/npm/dt/@superbalist/js-event-pubsub.svg)](https://www.npmjs.com/package/@superbalist/js-event-pubsub)

This library builds on top of the [js-pubsub](https://github.com/Superbalist/js-pubsub) package and adds support for
listening to and dispatching events over pub/sub channels.

## Installation

```bash
npm install @superbalist/js-event-pubsub
```

## Usage

### Simple Events

A `SimpleEvent` is an event which takes a name and optional attributes.

```node
'use strict';

let LocalPubSubAdapter = require('@superbalist/js-pubsub').LocalPubSubAdapter;
let eventPubSub = require('@superbalist/js-event-pubsub');
let EventManager = eventPubSub.EventManager;
let SimpleEventMessageTranslator = eventPubSub.translators.SimpleEventMessageTranslator;
let SimpleEvent = eventPubSub.events.SimpleEvent;

// create a new event manager
let adapter = new LocalPubSubAdapter();
let translator = new SimpleEventMessageTranslator();
let manager = new EventManager(adapter, translator);

// listen for an event
manager.listen('events', 'user.created', (event) => {
  console.log(event);
});

// listen for all events on the channel
manager.listen('events', '*', (event) => {
  console.log(event);
});

// dispatch an event
let event = new SimpleEvent('user.created', {
  user: {
    id: 1456,
    first_name: 'Joe',
    last_name: 'Soap',
    email: 'joe.soap@example.org'
  }
});
manager.dispatch('events', event);
```

### Topic Events

A `TopicEvent` is an event which takes a topic, name, version and optional attributes.

```node
'use strict';

let LocalPubSubAdapter = require('@superbalist/js-pubsub').LocalPubSubAdapter;
let eventPubSub = require('@superbalist/js-event-pubsub');
let EventManager = eventPubSub.EventManager;
let TopicEventMessageTranslator = eventPubSub.translators.TopicEventMessageTranslator;
let TopicEvent = eventPubSub.events.TopicEvent;

// create a new event manager
let adapter = new LocalPubSubAdapter();
let translator = new TopicEventMessageTranslator();
let manager = new EventManager(adapter, translator);

// listen for an event on a topic
manager.listen('events', 'user/created', (event) => {
  console.log(event);
});

// listen for an event on a topic matching the given version
manager.listen('events', 'user/created/1.0', (event) => {
  console.log(event);
});

// listen for all events on a topic
manager.listen('events', 'user/*', (event) => {
  console.log(event);
});

// listen for all events on the channel
manager.listen('events', '*', (event) => {
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
      email: 'joe.soap@example.org'
    }
  }
);
manager.dispatch('events', event);
```

### Schema Events

A `SchemaEvent` is an extension of the `TopicEvent` and takes a schema and optional attributes.  The topic, name and
version are derived from the schema.

The schema must be in the format `(protocol)://(......)?/events/(topic)/(channel)/(version).json`

```node
'use strict';

let LocalPubSubAdapter = require('@superbalist/js-pubsub').LocalPubSubAdapter;
let eventPubSub = require('@superbalist/js-event-pubsub');
let EventManager = eventPubSub.EventManager;
let SchemaEventMessageTranslator = eventPubSub.translators.SchemaEventMessageTranslator;
let JSONSchemaEventValidator = eventPubSub.validators.JSONSchemaEventValidator;
let SchemaEvent = eventPubSub.events.SchemaEvent;

// create a new event manager
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

// the listen expressions are the same as those used for TopicEvents.
```

### Custom Events

You can easily use a custom event structure by writing a class which implements the `EventInterface` interface.
You will then need to write a custom translator to translate incoming messages to your own event object.

Your event must implement the following methods.

```node
class CustomEvent {
  /**
   * Return the event name.
   *
   * @return {string}
   * @example
   * console.log(event.getName());
   */
  getName() {

  }

  /**
   * Return all event attributes.
   *
   * @return {Object.<string, *>}
   * @example
   * console.log(event.getAttributes());
   */
  getAttributes() {

  }

  /**
   * Return an event attribute.
   *
   * @param {string} name
   * @return {*}
   * @example
   * console.log(event.getAttribute('user'));
   */
  getAttribute(name) {

  }

  /**
   * Set an event attribute.
   *
   * @param {string} name
   * @param {*} value
   * @example
   * event.setAttribute('first_name', 'Matthew');
   */
  setAttribute(name, value) {

  }

  /**
   * Check whether or not an event has an attribute.
   *
   * @param {string} name
   * @return {boolean}
   * @example
   * console.log(event.hasAttribute('user'));
   */
  hasAttribute(name) {

  }

  /**
   * Return the event in a message format ready for publishing.
   *
   * @return {*}
   * @example
   * let message = event.toMessage();
   */
  toMessage() {

  }

  /**
   * Check whether or not the event matches the given expression.
   *
   * @param {string} expr
   * @return {boolean}
   * @example
   * console.log(event.matches('user/created/*'));
   */
  matches(expr) {

  }
}
```

## Translators

A translator is used to translate an incoming message into an event.

The package comes bundled with a `SimpleEventMessageTranslator`, `TopicEventMessageTranslator` and a
`SchemaEventMessageTranslator`.

### Custom Translators

You can easily write your own translator by implementing the `MessageTranslatorInterface` interface.

Your translator must implement the following methods.

```node
class CustomEventMessageTranslator {
  /**
   * Translate a message into an event.
   *
   * @param {*} message
   * @return {?EventInterface}
   */
  translate(message) {

  }
}
```

## Validators

A validator is an optional component used to validate an incoming event.

### JSONSchemaEventValidator

This package comes bundled with a `JSONSchemaEventValidator` which works with `SchemaEvent` type events.

This validator validates events against a [JSON Schema Spec](http://json-schema.org/) using the 
[Another JSON Schema Validator](https://github.com/epoberezkin/ajv) JS package.

Please see the "Schema Events" section above and the "Another JSON Schema Validator" documentation for usage examples.

### Custom Validators

You can write your own validator by implementing the `EventValidatorInterface` interface.

Your validator must implement the following methods.

```node
class CustomValidator {
  /**
   * Validates an event.
   *
   * @param {EventInterface} event
   * @return {Promise<boolean>}
   * @example
   * validator.validates(event).then((success) => {
   *   // event validates!
   * }).catch((reason) => {
   *   // event failed validation
   *   console.log(reason);
   * });
   */
  validates(event) {

  }
}
```

## Attribute Injectors

An attribute injector allows you to have attributes automatically injected into events when events are dispatched.

The library comes bundled with a few injectors out of the box.
* date_attribute_injector - injects a `date` key with an ISO 8601 date time
* hostname_attribute_injector - injects a `hostname` key with the server hostname
* uuid4_attribute_injector - injects a `uuid` key with a UUID-4

An injector is just a callable which returns an object with a key and value.

```node
'use strict';

let LocalPubSubAdapter = require('@superbalist/js-pubsub').LocalPubSubAdapter;
let eventPubSub = require('@superbalist/js-event-pubsub');
let EventManager = eventPubSub.EventManager;
let SimpleEventMessageTranslator = eventPubSub.translators.SimpleEventMessageTranslator;
let SimpleEvent = eventPubSub.events.SimpleEvent;

// create a new event manager
let adapter = new LocalPubSubAdapter();
let translator = new SimpleEventMessageTranslator();
let manager = new EventManager(
  adapter
  translator,
  null,
  [
    eventPubSub.attribute_injectors.date_attribute_injector,
    eventPubSub.attribute_injectors.hostname_attribute_injector,
    eventPubSub.attribute_injectors.uuid4_attribute_injector
  ]
);

manager.addAttributeInjector(() => ({key: 'service', value: 'search'}));

// now all dispatched events will have these attributes automagically injected
```

## Examples

The library comes with [examples](examples) for the different typoes of events and a [Dockerfile](Dockerfile) for
running the example scripts.

Run `make up`.

You will start at a `bash` prompt in the `/usr/src/app` directory.

To run the examples:
```bash
$ node examples/SimpleEventExample.js
$ node examples/TopicEventExample.js
$ node examples/SchemaEventExample.js
```
