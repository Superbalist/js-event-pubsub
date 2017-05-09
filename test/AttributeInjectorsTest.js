'use strict';

let chai = require('chai');
let expect = chai.expect;
let dateAttributeInjector = require('../lib/attribute_injectors/date_attribute_injector');
let hostnameAttributeInjector = require('../lib/attribute_injectors/hostname_attribute_injector');
let uuid4AttributeInjector = require('../lib/attribute_injectors/uuid4_attribute_injector');
let os = require('os');

describe('Attribute Injectors', () => {
  describe('date_attribute_injector', () => {
    it('should be a function ', () => {
      expect(dateAttributeInjector).to.be.a('function');
    });

    it('when called, should return an object with "key" and "value" properties', () => {
      let resolved = dateAttributeInjector();
      expect(resolved).to.have.all.keys(['key', 'value']);
    });

    it('when called, should return an object with a "key" property set to "date"', () => {
      let resolved = dateAttributeInjector();
      expect(resolved.key).to.equal('date');
    });

    it('when called, should return an object with a "value" property set to the current ISO 8601 date"', () => {
      let resolved = dateAttributeInjector();
      expect(resolved.value).to.equal((new Date()).toISOString());
    });
  });

  describe('hostname_attribute_injector', () => {
    it('should be a function ', () => {
      expect(hostnameAttributeInjector).to.be.a('function');
    });

    it('when called, should return an object with "key" and "value" properties', () => {
      let resolved = hostnameAttributeInjector();
      expect(resolved).to.have.all.keys(['key', 'value']);
    });

    it('when called, should return an object with a "key" property set to "hostname"', () => {
      let resolved = hostnameAttributeInjector();
      expect(resolved.key).to.equal('hostname');
    });

    it('when called, should return an object with a "value" property set to the hostname"', () => {
      let resolved = hostnameAttributeInjector();
      expect(resolved.value).to.equal(os.hostname());
    });
  });

  describe('uuid4_attribute_injector', () => {
    it('should be a function ', () => {
      expect(uuid4AttributeInjector).to.be.a('function');
    });

    it('when called, should return an object with "key" and "value" properties', () => {
      let resolved = uuid4AttributeInjector();
      expect(resolved).to.have.all.keys(['key', 'value']);
    });

    it('when called, should return an object with a "key" property set to "uuid"', () => {
      let resolved = uuid4AttributeInjector();
      expect(resolved.key).to.equal('uuid');
    });

    it('when called, should return an object with a "value" property matching a uui4 regex"', () => {
      let resolved = uuid4AttributeInjector();
      expect(resolved.value).to.match(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
    });
  });
});
