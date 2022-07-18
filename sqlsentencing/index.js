function createSqlSentencingLib (execlib) {
  'use strict';

  var mylib = {};

  require ('./sqlvaluercreator')(execlib, mylib);
  require ('./keyingcreator')(execlib, mylib);
  require ('./sqlsentencercreator')(execlib, mylib);
  require ('./tablemanagementcreator')(execlib, mylib);

  return mylib;
}

module.exports = createSqlSentencingLib;