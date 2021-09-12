function createAsyncJob (lib, mylib) {
  'use strict';
  var q = lib.q,
    qlib = lib.qlib;

  /*
   * AsyncJob
   * Uses the request Object in a certain way, according to the ancestor class' useTheRequest method,
   * but always finishes when the request emits 'done'
   * If the request during its lifetime produced error(s), concat of all errors occured will be the rejection Error's message
   * If the request did not produce errors, AsyncJob will resolve with affectedRows
   * During request's lifetime, 2 notification types will occur:
   * 1. notify({request: request, columns: columns}) - this notification occurs at the beggining of execution,
   *   telling that the request has these columns in a certain recordset (multiple recordsets seem to be ambiguous)
   * 2. notify({request: request, row: row}) - this notification occurs for each row in a particular redordset (yes, multiple ambiguous)
   */

  function AsyncJob (executor, defer) {
    mylib.Base.call(this, executor, defer);
    this.request = null;
    this.affectedRows = null;
    this.errors = [];
    this.onColumnsBound = this.onColumns.bind(this);
    this.onRowBound = this.onRow.bind(this);
    this.onAffectedRowsBound = this.onAffectedRows.bind(this);
    this.onErrorBound = this.onError.bind(this);
    this.onDoneBound = this.onDone.bind(this);
  }
  lib.inherit(AsyncJob, mylib.Base);
  AsyncJob.prototype.destroy = function () {
    if (this.request) {
      this.request.off('recordset', this.onColumnsBound);
      this.request.off('row', this.onRowBound);
      this.request.off('rowsaffected', this.onAffectedRowsBound);
      this.request.off('error', this.onErrorBound);
      this.request.off('done', this.onDoneBound);
    }
    this.onDoneBound = null;
    this.onErrorBound = null;
    this.onAffectedRowsBound = null;
    this.onRowBound = null;
    this.onColumnsBound = null;
    this.errors = null;
    this.affectedRows = null;
    this.request = null;
    mylib.Base.prototype.destroy.call(this);
  };
  AsyncJob.prototype.goForSure = function () {
    this.request = this.pool.request();
    this.request.stream = true;
    this.request.on('recordset', this.onColumnsBound);
    this.request.on('row', this.onRowBound);
    this.request.on('rowsaffected', this.onAffectedRowsBound);
    this.request.on('error', this.onErrorBound);
    this.request.on('done', this.onDoneBound);
    try {
      this.useTheRequest();
    }
    catch (e) {
      console.log('oli error?', e);
      this.reject(e);
    }
  };
  AsyncJob.prototype.onColumns = function (columns) {
    if (!this.okToProceed()) {
      return;
    }
    this.notify({request: this.request, columns: columns});
  };
  AsyncJob.prototype.onRow = function (row) {
    if (!this.okToProceed()) {
      return;
    }
    this.notify({request: this.request, row: row});
  };
  AsyncJob.prototype.onAffectedRows = function (affectedrows) {
    if (!this.okToProceed()) {
      return;
    }
    this.affectedRows = affectedrows;
  };
  AsyncJob.prototype.onError = function (err) {
    if (!this.okToProceed()) {
      return;
    }
    if (!lib.isArray(this.errors)) {
      return;
    }
    this.errors.push(err);
  };
  AsyncJob.prototype.onDone = function () {
    if (!this.okToProceed()) {
      return;
    }
    if (!lib.isArray(this.errors)) {
      return;
    }
    if (this.errors.length > 0) {
      this.reject(new lib.Error('SQL_ERROR', this.errors.reduce(errorer, '')));
      return;
    }
    this.resolve(this.affectedRows);
  };
  AsyncJob.prototype.useTheRequest = function (request) {
    throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' has to implement useTheRequest');
  };

  mylib.Async = AsyncJob;
}
module.exports = createAsyncJob;
