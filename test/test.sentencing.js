describe('Test SQL Sentencing', function () {
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
  /*
  it ('Create Test Table', function () {
    return qlib.promise2console((new Lib.jobs.SyncQuery(Executor, [
    "IF NOT EXISTS (SELECT * FROM SYSOBJECTS WHERE name='AllexTestTable' AND xtype='U')",
    "CREATE TABLE AllexTestTable (",
        "a int NOT NULL,",
        "b varchar(10) NOT NULL,",
        "c int NOT NULL",
    ")"
    ].join(' '))).go(), 'create');
  });
  */
  it ('Create Test Table', function () {
    return qlib.promise2console((new Lib.jobs.SyncQuery(
      Executor, 
      Lib.sqlsentencing.createTable({
        name: 'AllexTestTable', 
        fields: [
        {
          name: 'a',
          type: 'int',
          nullable: false,
          constraint: 'PRIMARY KEY'
        },
        {
          name: 'b',
          type: 'varchar (10)',
          nullable: true
        },
        {
          name: 'c',
          type: 'int',
          nullable: false
        }
      ]
    })
    )).go(), 'create');
  });

  it ('Insert some values', function () {
    var insstring = 'INSERT INTO AllexTestTable (a,b,c) '+Lib.sqlsentencing.toValuesOfHashArray([
      {
        a: 5,
        b: 'bla5',
        c: 0
      },
      {
        a: 6,
        b: 'bla6',
        c: 0
      },
      {
        a: 7,
        b: 'bla7',
        c: 0
      },
    ], ['a', 'b', 'c']);
    return qlib.promise2console((new Lib.jobs.SyncQuery(
      Executor,
      insstring
    )).go(), 'insert 1');
  });

  it ('Find an inserted value', function () {
    return (new Lib.jobs.SyncSingleQuery(
      Executor,
      'SELECT * FROM AllexTestTable WHERE a=5'
    )).go().then(function (results) {
      if (results[0].b !== 'bla5') {
        throw new lib.Error('MISMATCH', 'Expected bla5 but got '+results[0].b);
      }
      console.log(results[0].b);
    });
  });

  it ('Insert some values again', function () {
    var insstring = 'INSERT INTO AllexTestTable (a,b,c) '+Lib.sqlsentencing.toValuesOfHashArray([
      {
        a1: 15,
        b1: 'bla15',
        c1: 0
      },
      {
        a1: 16,
        b1: 'bla16',
        c1: 0
      },
      {
        a1: 17,
        b1: 'bla17',
        c1: 0
      },
    ], ['a1', 'b1', 'c1']);
    return qlib.promise2console((new Lib.jobs.SyncQuery(
      Executor,
      insstring
    )).go(), 'insert 2');
  });

  it ('Find an inserted value', function () {
    return (new Lib.jobs.SyncSingleQuery(
      Executor,
      'SELECT * FROM AllexTestTable WHERE a=15'
    )).go().then(function (results) {
      if (results[0].b !== 'bla15') {
        throw new lib.Error('MISMATCH', 'Expected bla15 but got '+results[0].b);
      }
      console.log(results[0].b);
    });
  });

  it ('Join with valuesOfScalarArray', function () {
    return (new Lib.jobs.SyncSingleQuery(
      Executor,
      [
      'SELECT t.b FROM',
      Lib.sqlsentencing.toValuesOfScalarArray([6], 'mycolumn'),
      'q',
      'LEFT JOIN AllexTestTable t',
      'ON q.mycolumn=t.a'
      ].join(' ')
    )).go().then(function (results) {
      if (results[0].b !== 'bla6') {
        throw new lib.Error('MISMATCH', 'Expected bla6 but got '+results[0].b);
      }
      console.log(results[0].b);
    });
  })

  it ('Drop Test Table', function () {
    return qlib.promise2console((new Lib.jobs.SyncQuery(Executor, [
      "IF EXISTS (SELECT * FROM SYSOBJECTS WHERE name='AllexTestTable' AND xtype='U')",
      "DROP TABLE AllexTestTable"
      ].join(' '))).go(), 'drop');
  });

  it ('Destroy Executor', function () {
    Executor.destroy();
  });
});