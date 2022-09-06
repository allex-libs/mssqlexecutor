function createMSSQLExecutor (execlib, sqlexecutorbaselib) {
  'use strict';
  var mylib = {};
  require('./helpers')(execlib, mylib);
  mylib.sqlsentencing = sqlexecutorbaselib.createSqlSentencing(require('./sqlsentencingspecializations')(execlib));
  mylib.jobs = sqlexecutorbaselib.createJobs(mylib.sqlsentencing, require('./jobspecializations')(execlib));
  mylib.jobcores = sqlexecutorbaselib.createJobCores(require('./jobcorespecializations')(execlib, mylib.helpers));
  require('./jobs')(execlib, mylib);
  require('./helperjobs')(execlib, mylib);

  require('./executorcreator')(execlib, sqlexecutorbaselib.Executor, mylib);

  return mylib;
}
function createLib (execlib) {
  'use strict';
  var ret = execlib.loadDependencies('client', ['allex:sqlexecutorbase:lib'], createMSSQLExecutor.bind(null, execlib));
  execlib = null;
  return ret;
}
module.exports = createLib;
