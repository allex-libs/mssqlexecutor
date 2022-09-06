function createSqlSentencingSpecializations (execlib) {
  'use strict';

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
    "INNER JOIN "+
    "sys.columns c ON t.object_id = c.object_id AND ic.index_column_id = c.column_id "+
    "ORDER BY ind.index_id, ic.index_column_id";
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

  return {
    indexColumnsQueryForTable: indexColumnsQueryForTable
  };
}
module.exports = createSqlSentencingSpecializations;