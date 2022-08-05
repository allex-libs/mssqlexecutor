describe('Test Query', function () {
  it('Load lib', function () {
    return setGlobal('Lib', require('..')(execlib));
  });
  it ('Create Executor', function () {
    return setGlobal('Executor', new Lib.Executor({
      maxConnectionAttempts: 10,
      connection: {
        server: 'mysqlserver',
        user: 'sa',
        password: 'SQL1.Server2',
        database: 'IndataDB_Main',
        options: {
          trustServerCertificate: true
        }
      }
    }));
  });
  it ('Sync Query', function () {
    return setGlobal(
      'UsersSync',
      (new Lib.jobs.SyncQuery(Executor, 'SELECT * FROM users')).go()
    );
  });
  it ('Keys in Sync Query Result', function () {
    console.log(Object.keys(UsersSync));
  });
  it ('Async Query', function () {
    return (new Lib.jobs.AsyncQuery(
      Executor,
      'SELECT * FROM users',
      {
        record: function (thingy) {
          console.log('username', thingy.user_name);
        }
      })).go();
  });
  it ('Async Query Finder', function () {
    return (new Lib.jobs.AsyncQuery(
      Executor,
      'SELECT * FROM users',
      {
        record: function (record) {
          if (record && record.user_name=='indata') {
            return record;
          }
        }
      })).go().then(
        function (res) {
          if (!(res && res.user_name == 'indata')) {
            throw new lib.Error('INDATA_NOT_FOUND', 'User indata was not found');
          }
          return res;
        }
      );
  });
  it ('Async Query Nagger', function () {
    return (new Lib.jobs.AsyncQuery(
      Executor,
      'SELECT * FROM users',
      {
        record: function (record) {
          if (record && record.user_name=='indata') {
            throw new lib.Error('NAG_ON_INDATA', "Don't like indata");
          }
        }
      })).go().then(
        null,
        function (reason) {
          if (reason && reason.code == 'NAG_ON_INDATA') {
            return 'ok';
          }
          throw reason;
        }
      );
  });
  it ('Check indexes on "users"', function () {
    return setGlobal('UsersIndexes', (new Lib.jobs.IndexLister(Executor, 'users')).go());
  });
  it ('UsersIndexes', function () {
    console.log(require('util').inspect(UsersIndexes, {depth: 11, colors: true}));
  });
  it ('UsersIndexes.all', function () {
    UsersIndexes.all.dumpToConsole();
  });
  it ('UsersIndexes.all.PK_users', function () {
    console.log(require('util').inspect(UsersIndexes.all.get('PK_users'), {depth: 11, colors: true}));
  });
  it ('Destroy Executor', function () {
    Executor.destroy();
  });
});
