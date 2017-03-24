"use strict";

var wd = require('wd');

function swipe(opts) {
  var action = new wd.TouchAction();
  action
    .press({x: opts.startX, y: opts.startY})
    .wait(opts.duration)
    .moveTo({x: opts.endX, y: opts.endY})
    .release();
  return this.performTouchAction(action);
}

module.exports = {
  swipe: swipe
};
