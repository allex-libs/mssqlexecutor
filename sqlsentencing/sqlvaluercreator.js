function createSqlValuer (execlib, mylib) {
  'use strict';

  var lib = execlib.lib;

  var _NULL = 'NULL';
  function entityNameOf(val){
    if (!lib.isVal(val)) return _NULL;
    if (val[0]=='"') return val;
    return '"'+val+'"';

  }
  function quoted (val) {
    if (!lib.isVal(val)) return _NULL;
    if (val[0]=="'") return val;
    return "'"+val+"'";
  }
  function sqlValueOf (datahash, field) {
    var val = datahash[field.name];
    if (!lib.isVal(val)) return _NULL;
    switch(field.type){
      case 'string': return quoted(val);
      case 'integer': 
      case 'number': 
        return val;
      case 'boolean':
        return val ? 1 : 0;
      case 'null':
        return _NULL;
      default: return val;
    }
  }
  function toSqlValue (value) {
    if (lib.isString(value)) return quoted(value);
    if (lib.isNumber(value)) return value;
    if (lib.isBool(value)) return value ? 1 : 0;
    return 'NULL';
  }

  mylib.entityNameOf = entityNameOf;
  mylib.quoted = quoted;
  mylib.sqlValueOf = sqlValueOf;
  mylib.toSqlValue = toSqlValue;
}

module.exports = createSqlValuer;