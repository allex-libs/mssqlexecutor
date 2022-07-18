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

  function scalarmapper (s) {
    return '('+toSqlValue(s)+')';
  }


  function hashvaluer (hash, res, prop) {
    res.push(toSqlValue(hash[prop]));
    return res;
  }

  function hashmapper (props, h) {
    var vals = props.reduce(hashvaluer.bind(null, h), []);
    h = null;
    return '('+vals.join(',')+')';
  }

  function toValuesOfScalarArray (arrayofscalars, scalarsqlname) {
    var scalarsqlname = scalarsqlname||'a';
    return '(SELECT '+scalarsqlname+' FROM (VALUES'+arrayofscalars.map(scalarmapper).join(',')+') AS t('+scalarsqlname+'))';
  }
  function toValuesOfHashArray (arrayofhashes, arrayofhashpropertynames) {
    var hpns, ret;
    if (!lib.isArray(arrayofhashpropertynames)) {
      throw new lib.Error('HASHPROPERTYNAMES_NOT_AN_ARRAY', 'Hash property names has to be an Array of Strings');
    }
    hpns = arrayofhashpropertynames.join(',');
    ret = '(SELECT '+hpns+' FROM (VALUES'+arrayofhashes.map(hashmapper.bind(null, arrayofhashpropertynames))+') AS t('+hpns+'))';
    arrayofhashpropertynames = null;
    return ret;
  }

  mylib.entityNameOf = entityNameOf;
  mylib.quoted = quoted;
  mylib.sqlValueOf = sqlValueOf;
  mylib.toSqlValue = toSqlValue;
  mylib.equal = equal;
  mylib.unEqual = unEqual;
  mylib.toValuesOfScalarArray = toValuesOfScalarArray;
  mylib.toValuesOfHashArray = toValuesOfHashArray;
}

module.exports = createSqlValuer;