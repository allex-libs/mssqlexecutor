describe('Test SQL Sentencing', function () {
  it('Load lib', function () {
    return setGlobal('Lib', require('..')(execlib));
  });
  it ('Create Executor', function () {
    return setGlobal('Executor', new Lib.Executor(require('./config/connect')));
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

  it ('Truncate first', function () {
    return qlib.promise2console((new Lib.jobs.SyncQuery(
      Executor,
      "TRUNCATE TABLE AllexTestTable"
    )).go(), 'truncate');
  })

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
  });

  it ('Upsert a record that exists', function () {
    this.timeout(1e7);
    return (new Lib.jobs.Upsert(
      Executor,
      {
        tablename: 'AllexTestTable',
        record: {
          a: 15,
          b: 'bla15_upd',
          c: 15
        },
        selectfields: ['a'],
        setfields: ['b']
      }
    )).go().then(function (result) {
      if (!result.updated) {
        throw new lib.Error('NOT_UPDATED', 'Expected the record with a:15 to be updated');
      }
      console.log(result);
    });
  });

  it ('Find the upserted value', function () {
    return (new Lib.jobs.SyncSingleQuery(
      Executor,
      'SELECT * FROM AllexTestTable WHERE a=15'
    )).go().then(function (results) {
      if (results[0].c !== 0) {
        throw new lib.Error('MISMATCH', 'For c expected 0 but got '+results[0].b);
      }
      if (results[0].b !== 'bla15_upd') {
        throw new lib.Error('MISMATCH', 'For b expected bla15_upd but got '+results[0].b);
      }
      console.log(results[0]);
    });
  });

  it ('Upsert a record that does not exist', function () {
    this.timeout(1e7);
    return (new Lib.jobs.Upsert(
      Executor,
      {
        tablename: 'AllexTestTable',
        record: {
          a: 55,
          b: 'bla55',
          c: 0
        },
        selectfields: ['a'],
        setfields: ['b', 'c']
      }
    )).go().then(function (result) {
      if (!result.inserted) {
        throw new lib.Error('NOT_INSERTED', 'Expected the record with a:55 to be inserted');
      }
      console.log(result);
    });
  });

  it ('Find the last upserted value', function () {
    return (new Lib.jobs.SyncSingleQuery(
      Executor,
      'SELECT * FROM AllexTestTable WHERE a=55'
    )).go().then(function (results) {
      if (results[0].c !== 0) {
        throw new lib.Error('MISMATCH', 'For c expected 0 but got '+results[0].b);
      }
      if (results[0].b !== 'bla55') {
        throw new lib.Error('MISMATCH', 'For b expected bla15_upd but got '+results[0].b);
      }
      console.log(results[0]);
    });
  });

  it ('Upsert many, all updates', function () {
    this.timeout(1e7);
    return (new Lib.jobs.UpsertMany(
      Executor,
      {
        tablename: 'AllexTestTable',
        records: [{
          a: 15,
          b: 'bla15_2',
          c: 14
        },{
          a: 16,
          b: 'bla16_2',
          c: 15
        }],
        selectfields: ['a'],
        setfields: ['b', 'c']
      }
    )).go().then(function (result) {
      if (result.updated != 2) {
        throw new lib.Error('NOT_UPDATED', 'Expected UpsertMany to update 2 records, but only '+result.updated+' got updated');
      }
      console.log(result);
    });
  });

  it ('Upsert many, one insert, one update', function () {
    this.timeout(1e7);
    return (new Lib.jobs.UpsertMany(
      Executor,
      {
        tablename: 'AllexTestTable',
        records: [{
          a: 15,
          b: 'bla15_2',
          c: 14
        },{
          a: 116,
          b: 'bla116',
          c: 115
        }],
        selectfields: ['a'],
        setfields: ['b', 'c']
      }
    )).go().then(function (result) {
      if (!(result.updated == 1 && result.inserted == 1)) {
        throw new lib.Error('NOT_UPDATED', 'Expected UpsertMany to update 1 record and insert 1 record, but '+result.updated+' got updated and '+result.inserted+' got inserted');
      }
      console.log(result);
    });
  });

  it ('Upsert many, all inserts', function () {
    this.timeout(1e7);
    return (new Lib.jobs.UpsertMany(
      Executor,
      {
        tablename: 'AllexTestTable',
        records: [{
          a: 215,
          b: 'bla215',
          c: 214
        },{
          a: 216,
          b: 'bla216',
          c: 215
        }],
        selectfields: ['a'],
        setfields: ['b', 'c']
      }
    )).go().then(function (result) {
      if (result.inserted != 2) {
        throw new lib.Error('NOT_INSERTED', 'Expected UpsertMany to insert 2 records, but only '+result.inserted+' got inserted');
      }
      console.log(result);
    });
  });

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