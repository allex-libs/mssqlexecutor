function createMSSQLStorageJobs (execlib, outerlib) {
  'use strict';
  var lib = execlib.lib, 
    mylib = {};
    require ('./basecreator')(lib, mylib);
    require ('./synccreator')(lib, mylib);
    require ('./asynccreator')(lib, mylib);

    require ('./syncquerycreator')(lib, mylib);
    require ('./syncsinglequerycreator')(lib, mylib);
    require ('./asyncquerycreator')(lib, mylib);

    require ('./indexlistercreator')(lib, mylib, outerlib.sqlsentencing);
    require ('./indexcreatorcreator')(lib, mylib, outerlib.sqlsentencing);
    require ('./indexdroppercreator')(lib, mylib, outerlib.sqlsentencing);

    /*
    require ('./steppedjobcreator')(lib, mylib);
    require ('./indexlistercreator')(lib, mylib, sqlsentencinglib);
    require ('./indexcreatorcreator')(lib, mylib, sqlsentencinglib);
    require ('./indexdroppercreator')(lib, mylib, sqlsentencinglib);
    */
  outerlib.jobs = mylib;
}
module.exports = createMSSQLStorageJobs;
