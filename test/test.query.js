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
  it ('Connect Executor', function () {
    return Executor.connect();
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
    return (new Lib.jobs.AsyncQuery(Executor, 'SELECT * FROM users')).go().then(
      null,
      null,
      function (thingy) {
        console.log(Object.keys(thingy));
      }
      //console.log.bind(console)
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
