function createIndexListerSpecialization (execlib, Base) {
  'use strict';

  var lib = execlib.lib;
  var IxsBase = Base.prototype.Indexes;
  var IxDBase = IxsBase.prototype.IndexDescriptor;

  function IndexDescriptor (name) {
    IxDBase.call(this, name);
  }
  lib.inherit(IndexDescriptor, IxDBase);
  IndexDescriptor.prototype.addColumn = function (col) {
    this.columns.push(col);
  };

  function Indexes (tablename) {
    IxsBase.call(this, tablename)
  }
  lib.inherit(Indexes, IxsBase);
  Indexes.prototype.addIndexColumn = function (indexname, indexcolumn, isprimarykey) {
    var i = this.all.get(indexname);
    if (!i) {
      i = new IndexDescriptor(indexname);
      if (isprimarykey) {
        if (this.primary) {
          throw new lib.Error('PRIMARY_KEY_ALREADY_EXISTS', 'Cannot add primary key because one already exists');
        }
        this.primary = i;
      }
      this.all.add(indexname, i);
    }
    i.addColumn(indexcolumn);
  };
  Indexes.prototype.IndexDescriptor = IndexDescriptor;

  function IndexListerJob (executor, tablename, defer) {
    Base.call(this, executor, tablename, defer);
  }
  lib.inherit(IndexListerJob, Base);
  IndexListerJob.prototype.onResult = function (res) {
    var inds = new this.Indexes(this.tablename), i, r;
    if (!(res && lib.isArray(res.recordset) && res.recordset.length)) {
      this.resolve(inds);
      return;
    }
    for (i=0; i<res.recordset.length; i++) {
      r = res.recordset[i];
      inds.addIndexColumn(r.name, r.column_name, r.is_primary_key)
    }
    this.resolve(inds);
  };
  IndexListerJob.prototype.Indexes = Indexes;
  

  return IndexListerJob;
}
module.exports = createIndexListerSpecialization;