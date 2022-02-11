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
    //if (val[0]=="'") return val;
    return "'"+val.replace(/'/g, "''")+"'";
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
    if (lib.isBoolean(value)) return value ? 1 : 0;
    return _NULL;
  }
  function equal (a, b) {
    var b1 = toSqlValue(b);
    return a+(b1==_NULL ? ' IS ' : '<>')+b1;
  }
  function unEqual (a, b) {
    var b1 = toSqlValue(b);
    return a+(b1==_NULL ? ' IS NOT ' : '<>')+b1;
  }

  mylib.entityNameOf = entityNameOf;
  mylib.quoted = quoted;
  mylib.sqlValueOf = sqlValueOf;
  mylib.toSqlValue = toSqlValue;
  mylib.equal = equal;
  mylib.unEqual = unEqual;
}

module.exports = createSqlValuer;