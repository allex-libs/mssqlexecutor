function createBaseJob (lib, mylib) {
  'use strict';
  var q = lib.q,
    qlib = lib.qlib,
    JobOnDestroyableBase = qlib.JobOnDestroyableBase;

  function BaseMSSQLJob (executor, defer) {
    JobOnDestroyableBase.call(this, executor, defer);
    this.pool = null;
  }
  lib.inherit(BaseMSSQLJob, JobOnDestroyableBase);
  BaseMSSQLJob.prototype.destroy = function () {
    this.pool = null;
    JobOnDestroyableBase.prototype.destroy.call(this);
  };
  BaseMSSQLJob.prototype._destroyableOk = function () {
    if (!this.destroyable) {
      throw new lib.Error('NO_MSSQL_EXECUTOR', 'No MSSQLExecutor');
    }
    if (!lib.isNumber(this.destroyable.connectionAttempts)) {
      throw new lib.Error('MSSQL_EXECUTOR_DESTROYED', 'MSSQLExecutor is already destroyed');
    }
    if (this.pool && !this.pool.connected) {
      throw new lib.Error('NSSQL_NOT_CONNECTED', 'Not connected to MSSQL');
    }
    return true;
  };
  BaseMSSQLJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    this.destroyable.connect().then(
      this.onPool.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  BaseMSSQLJob.prototype.onPool = function (pool) {
    if (!this.okToProceed()) {
      return;
    }
    this.pool = pool;
    if (!this.okToProceed()) {
      return;
    }
    this.goForSure();
  };

  mylib.Base = BaseMSSQLJob;
}
module.exports = createBaseJob;
