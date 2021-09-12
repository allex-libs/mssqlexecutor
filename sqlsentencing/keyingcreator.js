function createKeyingFunctionality (execlib, mylib) {
  'use strict';

  var lib = execlib.lib;

  function indexColumnsQueryForTable (tablename) {
    return "SELECT "+
    " ind.name,"+
    " ind.index_id,"+
    " ic.index_column_id,"+
    " column_name = col.name,"+
    " ind.is_primary_key "+
    "FROM "+
    " sys.indexes ind "+
    "INNER JOIN "+
    " sys.index_columns ic ON ind.object_id = ic.object_id and ind.index_id = ic.index_id "+
    "INNER JOIN "+
    " sys.columns col ON ic.object_id = col.object_id and ic.column_id = col.column_id "+
    "INNER JOIN "+
    " (SELECT * FROM sys.tables WHERE name = '"+tablename+"') t ON ind.object_id = t.object_id "+
    "ORDER BY ind.index_id, ic.index_column_id";
  }

  function createIndexQuery (tablename, indexname, columns) {
    if (!lib.isArray(columns)) {
      throw new lib.Error('COLUMNS_NOT_AN_ARRAY', 'Columns provided to createIndexQuery have to be an Array of Strings');
    }
    indexname = indexname || lib.uid();
    return 'CREATE INDEX '+
      mylib.entityNameOf(indexname)+
      ' ON '+mylib.entityNameOf(tablename)+' '+
      indexColumnsString(columns);
  }

  function createPrimaryKeyQuery (tablename, indexname, columns) {
    if (!lib.isArray(columns)) {
      throw new lib.Error('COLUMNS_NOT_AN_ARRAY', 'Columns provided to createPrimaryKeyQuery have to be an Array of Strings');
    }
    indexname = indexname || lib.uid();
    return 'ALTER TABLE '+
      mylib.entityNameOf(tablename)+
      ' ADD CONSTRAINT '+mylib.entityNameOf(indexname)+' '+
      indexColumnsString(columns);
  }

  function indexColumnsString (columns) {
    if (!lib.isArray(columns)) {
      throw new lib.Error('COLUMNS_NOT_AN_ARRAY', 'Columns provided to indexColumnsString have to be an Array of Strings');
    }
    return '('+columns.map(mylib.entityNameOf).join(', ')+')';
  }

  mylib.indexColumnsQueryForTable = indexColumnsQueryForTable;
  mylib.createIndexQuery = createIndexQuery;
  mylib.createPrimaryKeyQuery = createPrimaryKeyQuery;
  mylib.indexColumnsString = indexColumnsString;
}
module.exports = createKeyingFunctionality;