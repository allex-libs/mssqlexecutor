function createSyncSingleQuerySpecialization (execlib, Base){
  'use strict';

  var lib = execlib.lib;

  function SyncSingleQueryJob (executor, query, options, defer) {
    Base.call(this, executor, query, options, defer);
  }
  lib.inherit(SyncSingleQueryJob, Base);
  SyncSingleQueryJob.prototype.onResult = function (res) {
    this.resolve(res.recordset);
  };

  return SyncSingleQueryJob;
}
module.exports = createSyncSingleQuerySpecialization;