function createMSSQLExecutor (execlib, resourcehandlinglib) {
  'use strict';
  var mylib = {};
  mylib.sqlsentencing = require('./sqlsentencing')(execlib);
  require('./jobs')(execlib, mylib);
  require('./helperjobs')(execlib, mylib);
  require('./jobcores')(execlib, mylib);

  require('./executorcreator')(execlib, resourcehandlinglib, mylib);

  return mylib;
}
function createLib (execlib) {
  'use strict';
  var ret = execlib.loadDependencies('client', ['allex:resourcehandling:lib'], createMSSQLExecutor.bind(null, execlib));
  execlib = null;
  return ret;
}
module.exports = createLib;
