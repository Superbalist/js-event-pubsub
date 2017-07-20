'use strict';

let chai = require('chai');
let expect = chai.expect;
let sinon = require('sinon');
let pubsub = require('@superbalist/js-pubsub');
let PubSubAdapterInterface = pubsub.PubSubAdapterInterface;
let MessageTranslatorInterface = require('../lib/MessageTranslatorInterface');
let EventValidatorInterface = require('../lib/EventValidatorInterface');
let EventManager = require('../lib/EventManager');
let EventInterface = require('../lib/EventInterface');
let SimpleEvent = require('../lib/events/SimpleEvent');
let ValidationResult = require('../lib/ValidationResult');

describe('EventManager', () => {
  describe('construct instance', () => {
    it('should set the adapter property', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);
      expect(manager.adapter).to.equal(adapter);
    });

    it('should set the translator property', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);
      expect(manager.translator).to.equal(translator);
    });

    it('should set the validator property', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let validator = sinon.createStubInstance(EventValidatorInterface);
      let manager = new EventManager(adapter, translator, validator);
      expect(manager.validator).to.equal(validator);
    });

    it('should set the validator property to a default value of null if not given', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);
      expect(manager.validator).to.be.null;
    });

    it('should set the attributeInjectors property', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let attributeInjectors = [
        () => ({key: 'service', value: 'search'}),
      ];
      let manager = new EventManager(
        adapter,
        translator,
        null,
        attributeInjectors
      );
      expect(manager.attributeInjectors).to.equal(attributeInjectors);
    });

    it('should set the attributeInjectors property to a default value of an empty array if not given', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);
      expect(manager.attributeInjectors).to.be.empty;
    });

    it('should set the translateFailHandler property', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let validator = sinon.createStubInstance(EventValidatorInterface);
      let translateFailHandler = sinon.spy();
      let manager = new EventManager(adapter, translator, validator, [], translateFailHandler);
      expect(manager.translateFailHandler).to.equal(translateFailHandler);
    });

    it('should set the translateFailHandler property to a default value of null if not given', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);
      expect(manager.translateFailHandler).to.be.null;
    });

    it('should set the listenExprFailHandler property', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let validator = sinon.createStubInstance(EventValidatorInterface);
      let listenExprFailHandler = sinon.spy();
      let manager = new EventManager(adapter, translator, validator, [], null, listenExprFailHandler);
      expect(manager.listenExprFailHandler).to.equal(listenExprFailHandler);
    });

    it('should set the listenExprFailHandler property to a default value of null if not given', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);
      expect(manager.listenExprFailHandler).to.be.null;
    });

    it('should set the validationFailHandler property', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let validator = sinon.createStubInstance(EventValidatorInterface);
      let validationFailHandler = sinon.spy();
      let manager = new EventManager(adapter, translator, validator, [], null, null, validationFailHandler);
      expect(manager.validationFailHandler).to.equal(validationFailHandler);
    });

    it('should set the validationFailHandler property to a default value of null if not given', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);
      expect(manager.validationFailHandler).to.be.null;
    });
  });

  describe('addAttributeInjector', () => {
    it('should append the attributeInjector to the attributeInjectors array', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      expect(manager.attributeInjectors).to.be.empty;

      let attributeInjector = () => ({key: 'service', value: 'search'});

      manager.addAttributeInjector(attributeInjector);

      expect(manager.attributeInjectors).to.have.lengthOf(1);
      expect(manager.attributeInjectors[0]).to.equal(attributeInjector);
    });
  });

  describe('listen', () => {
    it('should subscribe to the channel on the adapter', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      sinon.assert.calledOnce(adapter.subscribe);
      sinon.assert.calledWith(adapter.subscribe, 'my_channel');
    });

    it('when a message is received, the message should be translated to an event', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.calledOnce(translator.translate);
      sinon.assert.calledWith(translator.translate, {'event': 'user.created'});
    });

    it('when a message is received, the event should be matched against the listen expression', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);
      event.matches = sinon.stub()
        .returns(true);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.calledOnce(event.matches);
      sinon.assert.calledWith(event.matches, '*');
    });

    it('when a message is received & the translator fails, the handler should not be called', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(null);

      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.notCalled(handler);
    });

    it('when a message is received & the translator fails, if a translateFailCallback is set, the callback should be triggered', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(null);

      let translateFailHandler = sinon.spy();

      let manager = new EventManager(adapter, translator);
      manager.translateFailHandler = translateFailHandler;

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield('message payload');

      sinon.assert.calledOnce(translateFailHandler);
      sinon.assert.calledWith(translateFailHandler, 'message payload');
    });

    it('when a message is received & the listen expression does not match, the event should not be passed to the handler', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);
      event.matches = sinon.stub()
        .returns(false);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', 'order.created', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.notCalled(handler);
    });

    it('when a message is received & the listen expression does not match, if a listenExprFailHandler is set, the callback should be triggered', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);
      event.matches = sinon.stub()
        .returns(false);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let listenExprFailHandler = sinon.spy();

      let manager = new EventManager(adapter, translator);
      manager.listenExprFailHandler = listenExprFailHandler;

      let handler = sinon.spy();

      manager.listen('my_channel', 'order.created', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.notCalled(handler);

      sinon.assert.calledOnce(listenExprFailHandler);
      sinon.assert.calledWith(listenExprFailHandler, event, 'order.created');
    });

    it('when a message is received & matches the listen expression, the event should be passed to the handler', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);
      event.matches = sinon.stub()
        .returns(true);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.calledOnce(handler);
      sinon.assert.calledWith(handler, event);
    });
  });

  describe('dispatch', () => {
    it('should convert the event to a message and publish to the channel', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publish = sinon.stub()
        .returns(Promise.resolve('result'));

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      let event = sinon.createStubInstance(EventInterface);
      event.toMessage = sinon.stub()
        .returns({'event': 'user.created'});

      return manager.dispatch('my_channel', event).then((result) => {
        sinon.assert.calledOnce(event.toMessage);

        sinon.assert.calledOnce(adapter.publish);
        sinon.assert.calledWith(adapter.publish, 'my_channel', {'event': 'user.created'});

        expect(result).to.equal('result');
      });
    });

    it('should automagically inject values from attribute injectors into the message payload', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publish = sinon.stub()
        .returns(Promise.resolve('result'));

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      manager.addAttributeInjector(() => ({key: 'service', value: 'search'}));
      manager.addAttributeInjector(() => ({key: 'hello', value: 'world'}));

      let event = new SimpleEvent('user.created');

      return manager.dispatch('my_channel', event).then((result) => {
        sinon.assert.calledOnce(adapter.publish);
        sinon.assert.calledWith(
          adapter.publish,
          'my_channel',
          {
            'event': 'user.created',
            'service': 'search',
            'hello': 'world',
          }
        );

        expect(result).to.equal('result');
      });
    });

    it('should convert the event to a message and publish to the channel, when a validator is set and validation passes', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publish = sinon.stub()
        .returns(Promise.resolve('result'));

      let translator = sinon.createStubInstance(MessageTranslatorInterface);

      let event = sinon.createStubInstance(EventInterface);
      event.toMessage = sinon.stub()
        .returns({'event': 'user.created'});

      let validator = sinon.createStubInstance(EventValidatorInterface);
      validator.validate = sinon.stub()
        .returns(Promise.resolve(new ValidationResult(validator, event, true)));

      let manager = new EventManager(adapter, translator, validator);

      return manager.dispatch('my_channel', event).then((result) => {
        sinon.assert.calledOnce(event.toMessage);

        sinon.assert.calledOnce(validator.validate);
        sinon.assert.calledWith(validator.validate, event);

        sinon.assert.calledOnce(adapter.publish);
        sinon.assert.calledWith(adapter.publish, 'my_channel', {'event': 'user.created'});

        expect(result).to.equal('result');
      });
    });

    it('should reject the promise when a validator is set and validation fails', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);

      let event = sinon.createStubInstance(EventInterface);

      let validator = sinon.createStubInstance(EventValidatorInterface);

      let validationResult = new ValidationResult(validator, event, false, ['should have required property \'user\'']);

      validator.validate = sinon.stub()
        .returns(Promise.resolve(validationResult));

      let manager = new EventManager(adapter, translator, validator);

      return manager.dispatch('my_channel', event).catch((reason) => {
        sinon.assert.calledOnce(validator.validate);
        sinon.assert.calledWith(validator.validate, event);

        expect(reason).to.equal(validationResult);
      });
    });

    it('should call the validationFailHandler when a validator is set and validation fails', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);

      let event = sinon.createStubInstance(EventInterface);

      let validator = sinon.createStubInstance(EventValidatorInterface);

      let validationResult = new ValidationResult(validator, event, false, ['should have required property \'user\'']);

      validator.validate = sinon.stub()
        .returns(Promise.resolve(validationResult));

      let validationFailHandler = sinon.spy();

      let manager = new EventManager(adapter, translator, validator);
      manager.validationFailHandler = validationFailHandler;

      return manager.dispatch('my_channel', event).catch((reason) => {
        sinon.assert.calledOnce(validator.validate);
        sinon.assert.calledWith(validator.validate, event);

        sinon.assert.calledOnce(validationFailHandler);
        sinon.assert.calledWith(validationFailHandler, validationResult);

        expect(reason).to.equal(validationResult);
      });
    });

    it('should automagically inject values from attribute injectors into the message payload but not override conflicting attributes', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publish = sinon.stub()
        .returns(Promise.resolve('result'));

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      manager.addAttributeInjector(() => ({key: 'service', value: 'search'}));
      manager.addAttributeInjector(() => ({key: 'hello', value: 'world'}));

      let event = new SimpleEvent('user.created', {'service': 'www'});

      return manager.dispatch('my_channel', event).then((result) => {
        sinon.assert.calledOnce(adapter.publish);
        sinon.assert.calledWith(
          adapter.publish,
          'my_channel',
          {
            'event': 'user.created',
            'service': 'www',
            'hello': 'world',
          }
        );

        expect(result).to.equal('result');
      });
    });
  });

  describe('dispatchBatch', () => {
    it('should convert the events to an array of message and publish to the channel', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publishBatch = sinon.stub()
        .returns(Promise.resolve(['result1', 'result2']));

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      let event1 = sinon.createStubInstance(EventInterface);
      event1.toMessage = sinon.stub()
        .returns({'event': 'user.created'});

      let event2 = sinon.createStubInstance(EventInterface);
      event2.toMessage = sinon.stub()
        .returns({'event': 'order.created'});

      let events = [event1, event2];

      return manager.dispatchBatch('my_channel', events).then((results) => {
        sinon.assert.calledOnce(event1.toMessage);
        sinon.assert.calledOnce(event2.toMessage);

        sinon.assert.calledOnce(adapter.publishBatch);
        sinon.assert.calledWith(
          adapter.publishBatch,
          'my_channel',
          [
            {'event': 'user.created'},
            {'event': 'order.created'},
          ]
        );

        expect(results).to.deep.equal(['result1', 'result2']);
      });
    });

    it('should automagically inject values from attribute injectors into the message payload', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publishBatch = sinon.stub()
        .returns(Promise.resolve(['result1', 'result2']));

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      manager.addAttributeInjector(() => ({key: 'service', value: 'search'}));
      manager.addAttributeInjector(() => ({key: 'hello', value: 'world'}));

      let event1 = new SimpleEvent('user.created');
      let event2 = new SimpleEvent('order.created');

      let events = [event1, event2];

      return manager.dispatchBatch('my_channel', events).then((results) => {
        sinon.assert.calledOnce(adapter.publishBatch);
        sinon.assert.calledWith(
          adapter.publishBatch,
          'my_channel',
          [
            {
              'event': 'user.created',
              'service': 'search',
              'hello': 'world',
            },
            {
              'event': 'order.created',
              'service': 'search',
              'hello': 'world',
            },
          ]
        );

        expect(results).to.deep.equal(['result1', 'result2']);
      });
    });

    it('should convert the events to an array of message and publish to the channel, when a validator is set and validation passes', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publishBatch = sinon.stub()
        .returns(Promise.resolve(['result1', 'result2']));

      let translator = sinon.createStubInstance(MessageTranslatorInterface);

      let event1 = sinon.createStubInstance(EventInterface);
      event1.toMessage = sinon.stub()
        .returns({'event': 'user.created'});

      let event2 = sinon.createStubInstance(EventInterface);
      event2.toMessage = sinon.stub()
        .returns({'event': 'order.created'});
      let events = [event1, event2];

      let validator = sinon.createStubInstance(EventValidatorInterface);
      validator.validate = sinon.stub();
      validator.validate.onCall(0)
        .returns(Promise.resolve(new ValidationResult(validator, event1, true)));
      validator.validate.onCall(1)
        .returns(Promise.resolve(new ValidationResult(validator, event2, true)));

      let manager = new EventManager(adapter, translator, validator);

      return manager.dispatchBatch('my_channel', events).then((results) => {
        sinon.assert.calledOnce(event1.toMessage);
        sinon.assert.calledOnce(event2.toMessage);

        sinon.assert.calledTwice(validator.validate);
        sinon.assert.calledWith(validator.validate, event1);
        sinon.assert.calledWith(validator.validate, event2);

        sinon.assert.calledOnce(adapter.publishBatch);
        sinon.assert.calledWith(
          adapter.publishBatch,
          'my_channel',
          [
            {'event': 'user.created'},
            {'event': 'order.created'},
          ]
        );

        expect(results).to.deep.equal(['result1', 'result2']);
      });
    });

    it('should reject the promise with the first failed ValidationResult when a validator is set and validation fails', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);

      let event1 = sinon.createStubInstance(EventInterface);
      let event2 = sinon.createStubInstance(EventInterface);
      let events = [event1, event2];

      let validator = sinon.createStubInstance(EventValidatorInterface);

      let validationResult1 = new ValidationResult(validator, event1, false, ['should have required property \'user\'']);
      let validationResult2 = new ValidationResult(validator, event2, true);

      validator.validate = sinon.stub();
      validator.validate.onCall(0)
        .returns(Promise.resolve(validationResult1));
      validator.validate.onCall(1)
        .returns(Promise.resolve(validationResult2));

      let manager = new EventManager(adapter, translator, validator);

      return manager.dispatchBatch('my_channel', events).catch((reason) => {
        sinon.assert.calledTwice(validator.validate);
        sinon.assert.calledWith(validator.validate, event1);
        sinon.assert.calledWith(validator.validate, event2);

        expect(reason).to.equal(validationResult1);
      });
    });

    it('should call the validationFailHandler when a validator is set and validation fails', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);

      let event1 = sinon.createStubInstance(EventInterface);
      let event2 = sinon.createStubInstance(EventInterface);
      let events = [event1, event2];

      let validator = sinon.createStubInstance(EventValidatorInterface);

      let validationResult1 = new ValidationResult(validator, event1, false, ['should have required property \'user\'']);
      let validationResult2 = new ValidationResult(validator, event2, true);

      validator.validate = sinon.stub();
      validator.validate.onCall(0)
        .returns(Promise.resolve(validationResult1));
      validator.validate.onCall(1)
        .returns(Promise.resolve(validationResult2));

      let validationFailHandler = sinon.spy();

      let manager = new EventManager(adapter, translator, validator);
      manager.validationFailHandler = validationFailHandler;

      return manager.dispatchBatch('my_channel', events).catch((reason) => {
        sinon.assert.calledTwice(validator.validate);
        sinon.assert.calledWith(validator.validate, event1);
        sinon.assert.calledWith(validator.validate, event2);

        sinon.assert.calledOnce(validationFailHandler);
        sinon.assert.calledWith(validationFailHandler, validationResult1);

        expect(reason).to.equal(validationResult1);
      });
    });
  });
});
