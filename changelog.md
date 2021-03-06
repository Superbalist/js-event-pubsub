# Changelog

## 3.0.2 - 2017-07-20

* Events are no longer validated when received, only upon dispatch

## 3.0.1 - 2017-07-19

* Export ValidationResult class from module

## 3.0.0 - 2017-07-18

* EventValidatorInterface->validates() renamed to ->validate()
* EventValidatorInterface->validate() now returns a promise resolving to a ValidationResult instance instead of bool
* The validation fail handler callback now receives a ValidationResult instead of the event and a validator
* dispatch() now returns a promise
* dispatchBatch() now returns a promise
* Events are now validated on dispatch, and will reject the promise with a ValidationResult when validation fails

## 2.0.1 - 2017-07-18

* Add support for translate, listen expr & validation failure callbacks

## 2.0.0 - 2017-05-17

* Bump up @superbalist/js-pubsub to ^2.0.0
* Add new dispatchBatch method for dispatching multiple events at once

## 1.0.1 - 2017-05-09

* Transpile ES6 -> ES5 at build time

## 1.0.0 - 2017-05-09

* Switch to ESLint & Google Javascript Style Guide
* Add JSDoc documentation
* Add unit tests
* Bump @superbalist/js-pubsub to ^1.0.0
* Change `EventValidatorInterface` to return a promise which resolves to a boolean

## 0.0.1 - 2017-05-03

* Initial release
