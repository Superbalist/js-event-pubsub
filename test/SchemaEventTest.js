'use strict';

let chai = require('chai');
let expect = chai.expect;
let SchemaEvent = require('../lib/events/SchemaEvent');
let TopicEvent = require('../lib/events/TopicEvent');

describe('SchemaEvent', () => {
  describe('construct instance', () => {
    it('should extend a TopicEvent', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');
      expect(event).to.be.an.instanceof(TopicEvent);
    });

    it('should set the topic, event and version properties by parsing the schema', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');
      expect(event.topic).to.equal('user');
      expect(event.name).to.equal('created');
      expect(event.version).to.equal('1.0');
    });

    it('should set the schema property', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');
      expect(event.schema).to.equal('http://schemas.my-website.org/events/user/created/1.0.json');
    });

    it('should throw an exception if the schema cannot be parsed', () => {
      expect(() => new SchemaEvent('bleh')).to.throw(Error, 'The schema string must be in the format "(protocol)://(......)?/events/(topic)/(channel)/(version).json".');
    });

    it('should set the attributes property', () => {
      let attributes = {
        'user': {
          'id': 1456,
          'first_name': 'Joe',
          'last_name': 'Soap',
          'email': 'joe.soap@example.org',
        },
      };
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json', attributes);
      expect(event.attributes).to.equal(attributes);
    });

    it('should set the attributes property to a default value of an empty object if not given', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');
      expect(event.attributes).to.be.empty;
    });
  });

  describe('getName', () => {
    it('should return the event name', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');
      expect(event.getName()).to.equal('created');
    });
  });

  describe('getAttributes', () => {
    it('should return the event attributes', () => {
      let attributes = {
        'user': {
          'id': 1456,
          'first_name': 'Joe',
          'last_name': 'Soap',
          'email': 'joe.soap@example.org',
        },
      };
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json', attributes);
      expect(event.getAttributes()).to.equal(attributes);
    });
  });

  describe('getAttribute', () => {
    it('should return the value of an event attribute', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json', {'hello': 'world'});
      expect(event.getAttribute('hello')).to.equal('world');
    });

    it('should return null if the event attribute is not set', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json', {'hello': 'world'});
      expect(event.getAttribute('first_name')).to.be.null;
    });
  });

  describe('setAttribute', () => {
    it('should set the value of an event attribute', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json', {'first_name': 'Matthew'});
      expect(event.getAttribute('first_name')).to.equal('Matthew');
      event.setAttribute('first_name', 'Rob');
      expect(event.getAttribute('first_name')).to.equal('Rob');
    });
  });

  describe('hasAttribute', () => {
    it('should return a boolean indicating whether or not the attribute is set', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json', {'first_name': 'Matthew'});
      expect(event.hasAttribute('first_name')).to.be.true;
      expect(event.hasAttribute('last_name')).to.be.false;
    });
  });

  describe('toMessage', () => {
    it('should convert the event to a payload ready for publishing', () => {
      let attributes = {
        'user': {
          'id': 1456,
          'first_name': 'Joe',
          'last_name': 'Soap',
          'email': 'joe.soap@example.org',
        },
      };
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json', attributes);
      let expected = {
        'schema': 'http://schemas.my-website.org/events/user/created/1.0.json',
        'user': {
          'id': 1456,
          'first_name': 'Joe',
          'last_name': 'Soap',
          'email': 'joe.soap@example.org',
        },
      };
      expect(event.toMessage()).to.deep.equal(expected);
    });

    it('should override the "schema" attribute but not manipulate the original attributes object', () => {
      let attributes = {
        'schema': 'booooo',
        'first_name': 'Bob',
      };
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json', attributes);
      let expected = {
        'schema': 'http://schemas.my-website.org/events/user/created/1.0.json',
        'first_name': 'Bob',
      };
      expect(event.toMessage()).to.deep.equal(expected);
      expect(event.getAttributes()).to.equal(attributes);
    });
  });

  describe('matches', () => {
    it('should match a wildcard (*) event expression', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');
      expect(event.matches('*')).to.be.true;
    });

    it('should strictly match an event expression listening for the topic', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');
      expect(event.matches('user')).to.be.true;
      expect(event.matches('user/*')).to.be.true;
      expect(event.matches('order')).to.be.false;
      expect(event.matches('order/*')).to.be.false;
      expect(event.matches('User')).to.be.false;
      expect(event.matches('User/*')).to.be.false;
    });

    it('should strictly match an event expression listening for the topic/event', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');
      expect(event.matches('user/created')).to.be.true;
      expect(event.matches('user/created/*')).to.be.true;
      expect(event.matches('user/updated')).to.be.false;
      expect(event.matches('order/created')).to.be.false;
      expect(event.matches('order/created/*')).to.be.false;
      expect(event.matches('User/created')).to.be.false;
      expect(event.matches('user/Created')).to.be.false;
    });

    it('should strictly match an event expression listening for the topic/event/version', () => {
      let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');
      expect(event.matches('user/created/*')).to.be.true;
      expect(event.matches('user/created/1.0')).to.be.true;
      expect(event.matches('user/created/1')).to.be.true;
      expect(event.matches('user/created/1.0.0')).to.be.true;
      expect(event.matches('order/created/1.0')).to.be.false;
      expect(event.matches('User/created/1.0')).to.be.false;
      expect(event.matches('user/Created/1.0')).to.be.false;
    });
  });
});
