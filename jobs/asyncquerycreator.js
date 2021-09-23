function createAsyncQueryJob (lib, mylib) {
  'use strict';

  var AsyncJob = mylib.Async;

  function AsyncQueryJob (executor, query, defer) {
    AsyncJob.call(this, executor, defer);
    this.query = query;
  }
  lib.inherit(AsyncQueryJob, AsyncJob);
  AsyncQueryJob.prototype.useTheRequest = function () {
    return this.request.query(this.query);
  };

  mylib.AsyncQuery = AsyncQueryJob;
}
module.exports = createAsyncQueryJob;
