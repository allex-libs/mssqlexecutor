function createMSSQLExecutor (execlib, sqlexecutorbaselib) {
  'use strict';
  var mylib = {};
  mylib.helpers = sqlexecutorbaselib.helpers;
  require('./helpers')(execlib, mylib);
  mylib.sqlsentencing = sqlexecutorbaselib.createSqlSentencing(require('./sqlsentencingspecializations')(execlib));
  mylib.jobs = sqlexecutorbaselib.createJobs(mylib.sqlsentencing, require('./jobspecializations')(execlib));
  mylib.jobcores = sqlexecutorbaselib.createJobCores(require('./jobcorespecializations')(execlib, mylib.helpers));
  require('./jobs')(execlib, mylib);
  require('./helperjobs')(execlib, mylib);

  require('./executorcreator')(execlib, sqlexecutorbaselib.Executor, mylib);
  sqlexecutorbaselib.createExecutorQueueing(mylib, {
    recordsetFormatProducer: function (res) {return res;}
  });

  var squtr = mylib.jobs.SyncQuery.prototype.useTheRequest;
  mylib.jobs.SyncQuery.prototype.useTheRequest = function (request) {
    if (this.options && this.options.rowsAreArrays) {
      request.arrayRowMode = true;
    }
    return squtr.call(this, request);
  };

  return mylib;
}
function createLib (execlib) {
  'use strict';
  var ret = execlib.loadDependencies('client', ['allex:sqlexecutorbase:lib'], createMSSQLExecutor.bind(null, execlib));
  execlib = null;
  return ret;
}
module.exports = createLib;
