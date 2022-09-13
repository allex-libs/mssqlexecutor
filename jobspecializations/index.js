function createJobSpecializations () {
  var mylib = {
    async: require('./asynccreator'),
    asyncquery: require('./asyncquerycreator'),
    indexlister: require('./indexlistercreator'),
    syncsinglequery: require('./syncsinglequerycreator')
  };

  return mylib;
}
module.exports = createJobSpecializations;