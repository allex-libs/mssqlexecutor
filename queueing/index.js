function createQueueing (execlib, mylib) {
  'use strict';

  var lib = execlib.lib;

  require('./nocountedcreator')(lib, mylib.Executor);
}
module.exports = createQueueing;