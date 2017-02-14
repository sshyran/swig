'use strict';
/*
 ________  ___       __   ___  ________
|\   ____\|\  \     |\  \|\  \|\   ____\
\ \  \___|\ \  \    \ \  \ \  \ \  \___|
 \ \_____  \ \  \  __\ \  \ \  \ \  \  ___
  \|____|\  \ \  \|\__\_\  \ \  \ \  \|\  \
    ____\_\  \ \____________\ \__\ \_______\
   |\_________\|____________|\|__|\|_______|
   \|_________|

   It's delicious.
   Brought to you by the fine folks at Gilt (http://github.com/gilt)
*/

module.exports = {

  mixin: new RegExp(
    '\\s*' + // optional whitespace
    '(' + // save this part:
      '[#\\.]' + // must be a class name or id
      '[a-z]' + // must start with a character (no numbers)
      '[#\\.\\s>\\w\\-]*?' + // anything that's valid in a class/id based selector
    ')' +
    '\\s*' +  // optional whitespace
    '\\(' + // required: parameter list
      '.*' +
    '\\)' +
    '(?!\\swhen)' + // not followed by a guard
    '(?!\\s*\\{)', // not followed by an open curly
  'g'),

  altMixin: new RegExp(
    '\\s*' + // optional whitespace
    '(' + // save this part:
      '[#\\.]' + // must be a class name or id
      '[a-z]' + // must start with a character (no numbers)
      '[#\\.\\s>\\w\\-]*?' + // anything that's valid in a class/id based selector
    ')' +
    '\\s*' + // optional whitespace
    ';', // ends with a semicolon
  'gi'),

  hex: new RegExp( // NOTE: this does NOT match aRGB hex colors.
    '#' + // hex colors start with a #. unfortunately, so do id selectors
    '(?:' + // begin group (we're not actually interested in saving it though)
      '[\\da-f]{3}' + // short form hex
    '|' +
      '[\\da-f]{6}' + // long form hex
    ')' +
    '\\b', // and this should be the end of the 'word'
  'i'),

  variable: new RegExp(
    '@' + // less vars always start with an @. unfortunately, some css things also start with @
    '\\{?' + // interpolation form (optional)
      '(' + // save this part:
        '[a-z]+' + // letters only
      ')' +
      '\\b' + // word boundary
    '\\}?' + // end interpolation
    '(?!\\s*:)', // NOT followed by a colon
  'g'),

  'import': new RegExp(
    '\\s*' + // optional whitespace
    '@import' + // imports start with the @import directive
    '\\s+' + // required whitespace
    '(?:url\\()?' + // optional url() form
      '([\'"]?)' + // save the opening quote (so we can match the end quote)
        '(' + // save this part:
          '[\\w.-\/]+' + // a valid path
        ')' +
      '\\1' + // match the opening quote
    '\\)?' + // match the end of the url() form
    ';', // ends with a semicolon
  'g')
}