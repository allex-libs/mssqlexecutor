function createInsertAndReturnAutoIncJob (lib, outerlib, mylib) {
  'use strict';

  var Base = outerlib.jobs.SyncQuery;

  function InsertAndReturnAutoIncJob (executor, insertstring, defer) {
    Base.call(this, executor, insertstring+' SELECT SCOPE_IDENTITY() as insertid', defer);
  }
  lib.inherit(InsertAndReturnAutoIncJob, Base);
  InsertAndReturnAutoIncJob.prototype.onResult = function (res) {
    if (
      res && 
      lib.isArray(res.recordsets) && 
      res.recordsets.length==1 &&
      lib.isArray(res.recordsets[0]) &&
      res.recordsets[0].length==1
    ) {
      this.resolve(res.recordsets[0][0].insertid || 0);
      return;
    }
    console.error('INCONSISTENT_INSERT', res);
    this.reject(new lib.Error('INCONSISTENT_INSERT', 'Result returned from insert was incosistent'));
  };

  mylib.InsertAndReturnAutoInc = InsertAndReturnAutoIncJob;
}
module.exports = createInsertAndReturnAutoIncJob;