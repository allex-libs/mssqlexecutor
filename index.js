function createMSSQLExecutor (execlib) {
  'use strict';
  var mylib = {};
  mylib.sqlsentencing = require('./sqlsentencing')(execlib);
  require('./jobs')(execlib, mylib);
  require('./helperjobs')(execlib, mylib);
  require('./jobcores')(execlib, mylib);

  require('./executorcreator')(execlib, mylib);

  return mylib;
}
module.exports = createMSSQLExecutor;
