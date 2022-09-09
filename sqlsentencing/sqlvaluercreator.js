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

  function toValuesOfScalarArray (arrayofscalars, scalarsqlname) {
    var scalarsqlname = scalarsqlname||'a';
    return '(SELECT '+scalarsqlname+' FROM (VALUES'+arrayofscalars.map(function(s) {return '('+s+')'}).join(',')+') AS t('+scalarsqlname+'))';
  }
  function toValuesOfHashArray (arrayofhashes) {

  }
  function SetStringMaker(obj){
    var arryObj = {
      arry : []
    };
    lib.traverseShallow(obj, set_string_maker_cb.bind(this, arryObj));
    return arryObj.arry.join(',');
  }
  function set_string_maker_cb(arryObj, item, key){
    arryObj.arry.push(''+key + '=' + sqlValueOf(item));
  }

  function InsertStringMaker(obj){
    var arryObj = {
      arry1 : [],
      arry2 : []
    };
    lib.traverseShallow(obj, insert_string_maker_cb.bind(this, arryObj));
    return "(" + arryObj.arry1.join(',') + ") VALUES (" + arryObj.arry2.join(',') + ")";
  }
  function insert_string_maker_cb(arryObj, item, key){
    arryObj.arry1.push(''+key);
    arryObj.arry2.push('' + sqlValueOf(item));
  }

  mylib.entityNameOf = entityNameOf;
  mylib.quoted = quoted;
  mylib.sqlValueOf = sqlValueOf;
  mylib.toSqlValue = toSqlValue;
  mylib.equal = equal;
  mylib.unEqual = unEqual;
  mylib.toValuesOfScalarArray = toValuesOfScalarArray;
  mylib.SetStringMaker = SetStringMaker;
  mylib.InsertStringMaker = InsertStringMaker;
}

module.exports = createSqlValuer;