function createJobSpecializations () {
  var mylib = {
    async: require('./asynccreator'),
    asyncquery: require('./asyncquerycreator'),
    indexlister: require('./indexlistercreator')
  };

  return mylib;
}
module.exports = createJobSpecializations;