function createSqlSentencingSpecializations (execlib) {
  'use strict';

  var lib = execlib.lib;

  var _NULL = 'NULL';
  function entityNameOf(val){
    if (!lib.isVal(val)) return _NULL;
    if (val[0]=='"') return val;
    return '"'+val+'"';
  }

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
  function indexCreationText () {
    return 'CLUSTERED INDEX';
  }
  function primaryKeyCreationText () {
    return 'PRIMARY KEY CLUSTERED';
  }

  function readFieldType(flddesc) {
    return flddesc.mssqltype || flddesc.sqltype || flddesc.type
  }

  function createTableCreator (fieldmapper) {
    return function createTable(tabledesc) {
      var ret;
      if (!tabledesc) {
        throw new lib.Error('NO_TABLECREATION_DESCRIPTOR', 'Cannot create a CREATE TABLE sentence without a descriptor');
      }
      if (!lib.isString(tabledesc.name)) {
        throw new lib.Error('NAME_NOT_A_STRING', 'Name of the table to create must be a String');
      }
      if (!lib.isArray(tabledesc.fields)) {
        throw new lib.Error('FIELDS_NOT_AN_ARRAY', 'The fields of the table to create must be an array');
      }
      ret = [
        "IF NOT EXISTS (SELECT * FROM SYSOBJECTS WHERE name='"+tabledesc.name+"' AND xtype='U')",
        "CREATE"+(tabledesc.temp ? ' TEMP ' : ' ')+"TABLE "+tabledesc.name+" (",
        tabledesc.fields.map(fieldmapper).join(','),
        ")"
      ].join(' ');
      return ret;
    };
  }

  return {
    entityNameOf: entityNameOf,
    indexColumnsQueryForTable: indexColumnsQueryForTable,
    //indexCreationText: indexCreationText,
    primaryKeyCreationText: primaryKeyCreationText,
    readFieldType: readFieldType,
    createTableCreator: createTableCreator
  };
}
module.exports = createSqlSentencingSpecializations;