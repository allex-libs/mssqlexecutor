var delaytime = 1000;
var verbatimTests = [
  [
    'Verbatim with no fields, no proc',
    {
      type: 'verbatim',
      value: 7
    },
    7
  ],
  [
    'Verbatim with no fields, scalar value, has proc',
    {
      type: 'verbatim',
      value: 7,
      proc: function (val) {
        return val-4;
      }
    },
    3
  ],
  [
    'Verbatim with no fields, array value, has proc',
    {
      type: 'verbatim',
      value: [7],
      proc: function (val) {
        return val-4;
      }
    },
    3
  ],
  [
    'Verbatim with field, scalar value, has proc',
    {
      type: 'verbatim',
      value: [7],
      field: 'TheC',
      proc: function (val) {
        return val-4;
      }
    },
    {
      TheC: 3
    }
  ]
];
var lookupTests = [
  [
    'Lookup with no fields, no proc',
    {
      type: 'lookup',
      table: 'AllexTestTable',
      what: 'c',
      where: 'a=5'
    },
    [0]
  ],
  [
    'Lookup with no fields, has proc',
    {
      type: 'lookup',
      table: 'AllexTestTable',
      what: 'c',
      where: 'a=5',
      proc: function (c) {return c-17;}
    },
    -17
  ],
  [
    'Lookup with no fields, has procs',
    {
      type: 'lookup',
      table: 'AllexTestTable',
      what: 'c',
      where: 'a=5',
      proc: [function (val) {return val-17;}]
    },
    [-17]
  ],
  [
    'Lookup with field, has procs',
    {
      type: 'lookup',
      table: 'AllexTestTable',
      what: 'c',
      where: 'a=5',
      field: 'TheC',
      proc: [function (val) {return val-17;}]
    },
    {
      TheC: [-17]
    }
  ],
  [
    'Lookup with field and result, has procs',
    {
      type: 'lookup',
      table: 'AllexTestTable',
      what: 'c',
      where: 'a=5',
      result: {
        Mm: 'no',
        TheC: null
      },
      field: 'TheC',
      proc: [function (val) {return val-17;}]
    },
    {
      Mm: 'no',
      TheC: [-17]
    }
  ],
  [
    'Lookup with 2 fields from table, no self fields, has procs',
    {
      type: 'lookup',
      table: 'AllexTestTable',
      what: 'b, c',
      where: 'a=5',
      proc: [
        null,
        function (val) {return val-17;}
      ],
    },
    ['bla5', -17]
  ],
  [
    'Lookup with 2 fields from table, no self fields, has modulating proc',
    {
      type: 'lookup',
      table: 'AllexTestTable',
      what: 'b, c',
      where: 'a=5',
      proc: function (b, c) {return b+'*'+c;},
    },
    'bla5*0'
  ],
  [
    'Lookup with fields, no proc',
    {
      type: 'lookup',
      table: 'AllexTestTable',
      what: 'c',
      where: 'a=5',
      fields: ['TheC']
    },
    {TheC:0}
  ],
  [
    'Lookup with fields and proc',
    {
      type: 'lookup',
      table: 'AllexTestTable',
      what: 'c',
      where: 'a=5',
      fields: ['TheC'],
      proc: [function (val) {return val+5;}]
    },
    {TheC:5}
  ],
  [
    'Lookup with fields and promised proc',
    {
      type: 'lookup',
      table: 'AllexTestTable',
      what: 'c',
      where: 'a=5',
      fields: ['TheC'],
      proc: [function (val) {
        return q.delay(delaytime, val+5);
      }]
    },
    {TheC:5}
  ],
  [
    'Lookup with 2 fields and mixed procs (using this)',
    {
      type: 'lookup',
      table: 'AllexTestTable',
      what: 'b, c',
      where: 'a=5',
      fields: ['TheB', 'TheC'],
      specval: 8,
      proc: [
        function (val) {
          return q.delay(delaytime, val+this.specval);
        },
        function (val) {
          return val-50;
        }
      ]
    },
    {TheB: 'bla58', TheC:-50}
  ]
];
var recordsetTests = [
  [
    'Recordset, sentence, no fields, no proc',
    {
      type: 'recordset',
      sentence: 'SELECT a FROM AllexTestTable WHERE a<8'
    },
    [
      {a: 5},{a: 6},{a: 7}
    ]
  ],
  [
    'Recordset, sentence, no fields, has proc',
    {
      type: 'recordset',
      sentence: 'SELECT a FROM AllexTestTable WHERE a<8',
      proc: function (rec0, rec1, rec2) {
        return rec0.a+rec1.a+rec2.a;
      }
    },
    18
  ],
  [
    'Recordset, sentence, no fields, has rsproc',
    {
      type: 'recordset',
      sentence: 'SELECT a FROM AllexTestTable where a<8',
      rsproc: function (rec) {
        return rec.map(function (r) {return r.a-5})
      }
    },
    [
      0, 1, 2
    ]
  ],
  [
    'Recordset, template, has field, has recproc',
    {
      type: 'recordset',
      sentence: {
        template: 'SELECT a FROM TABLE WHERE a<8',
        replacements: {
          TABLE: 'AllexTestTable'
        }
      },
      recproc: function (rec) {
        return rec.a-5;
      },
      result: {
        Mm: 'nono',
        myLookups: null
      },
      field: 'myLookups'
    },
    {
      Mm: 'nono',
      myLookups: [
        0, 1, 2
      ]
    }    
  ]
];
var recordset2arryofscalarsTests = [
  [
    'Recordset2ArryOfScalars, sentence, no fields, no scalarproc',
    {
      type: 'recordset2arryofscalars',
      sentence: 'SELECT a FROM AllexTestTable WHERE a<8',
      scalarfield: 'a'
    },
    [5, 6, 7]
  ],
  [
    'Recordset2ArryOfScalars, sentence, no fields, has scalarproc',
    {
      type: 'recordset2arryofscalars',
      sentence: 'SELECT a FROM AllexTestTable WHERE a<8',
      scalarfield: 'a',
      scalarproc: function (val) {
        return val+2;
      }
    },
    [7, 8, 9]
  ]
]
var firstrecordTests = [
  [
    'First record, no fields, no proc',
    {
      type: 'firstrecord',
      sentence: {
        template: 'SELECT a FROM TABLE',
        replacements: {
          TABLE: 'AllexTestTable'
        }
      }
    },
    [5]
  ],
  [
    'First record, has field, has proc',
    {
      type: 'firstrecord',
      sentence: {
        template: 'SELECT * FROM TABLE',
        replacements: {
          TABLE: 'AllexTestTable'
        }
      },
      proc: function (a, b, c) {
        return a - 5;
      },
      field: 'MyA'
    },
    {MyA: 0}
  ],
  [
    'First record, no fields, has procs',
    {
      type: 'firstrecord',
      sentence: {
        template: 'SELECT a FROM TABLE',
        replacements: {
          TABLE: 'AllexTestTable'
        }
      },
      proc: [function (a) {
        return a - 5;
      }]
    },
    [0]
  ],
  [
    'First record, has fields, has procs',
    {
      type: 'firstrecord',
      sentence: {
        template: 'SELECT a FROM TABLE',
        replacements: {
          TABLE: 'AllexTestTable'
        }
      },
      proc: [function (a) {
        return a - 5;
      }],
      fields: ['MyA']
    },
    {MyA: 0}
  ]
];
var insertTestTemplate = [
  null,
  {
    type: 'rowsaffected',
    sentence: {
      template: "INSERT INTO TABLE (a,b,c) VALUES (AVALUE, BVALUE, CVALUE)",
      replacements: {
        TABLE: 'AllexTestTable',
        AVALUE: null,
        BVALUE: null,
        CVALUE: null
      }
    }
  },
  1
];
var _insertCount = 0;
function insertTest () {
  _insertCount++;
  var val = 1000+_insertCount;
  return [
    'INSERT '+val,
    lib.extend({}, insertTestTemplate[1], {
      sentence: {
        replacements: {
          AVALUE: val,
          BVALUE: "'bla"+val+"'",
          CVALUE: -val
        }
      }
    }),
    insertTestTemplate[2]
  ];
}

function singularIt (test) {
  return it (test[0], function () {
    this.timeout(1e7);
    var ret = Executor.queue(test[1]).should.eventually.deep.equal(test[2]);
    test = null;
    return ret;
  })
}
function cmptitler (test) {
  return test[0];
}
function cmpjober (test) {
  return test[1];
}
function cmpexpecter (test) {
  return test[2];
}
function arryIt (tests) {
  return it ('Array:\n\t'+tests.map(cmptitler).join('\n\t'), function () {
    this.timeout(1e7);
    var queue = Executor.queue(tests.map(cmpjober));
    var exp = tests.map(cmpexpecter);
    var ret = queue.should.eventually.deep.equal(exp);
    /**
    var ret = queue.then(function (res) {
      return expect(res).to.deep.equal(exp);
    })
    /**/
    tests = null;
    return ret;
  });
}
function compositeIt (tests) {
  return it ('Composite:\n\t'+tests.map(cmptitler).join('\n\t'), function () {
    this.timeout(1e7);
    var queue = Executor.queue({
      type: 'composite',
      items: tests.map(cmpjober)
    });
    var exp = tests.map(cmpexpecter);
    var ret = queue.should.eventually.deep.equal(exp);
    /**
    var ret = queue.then(function (res) {
      return expect(res).to.deep.equal(exp);
    })
    /**/
    tests = null;
    return ret;
  });
}
function randomInt (num) {
  return Math.floor(Math.random()*num);
}
function randomIndex (arry) {
  return randomInt(arry.length);
}
function randomItem (arry) {
  var ret = arry[randomIndex(arry)];
  return lib.isFunction(ret) ? ret() : ret;
}
function randomArryIt (testsarry) {
  var i;
  var tests = [];
  var len = 5+randomInt(5);
  for (i=0; i<len; i++) {
    tests.push(randomItem(randomItem(testsarry)));
  }
  arryIt(tests);
}
function randomCompositeIt (testsarry) {
  var i;
  var tests = [];
  var len = 5+randomInt(5);
  for (i=0; i<len; i++) {
    tests.push(randomItem(randomItem(testsarry)));
  }
  compositeIt(tests);
}

describe('Test SQL Queueing', function () {
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
    return qlib.promise2console(Executor.queue({
      type: 'justdoit', 
      sentence: Lib.sqlsentencing.createTable({
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
    }), 'create');
  });

  it ('Truncate first', function () {
    return qlib.promise2console(Executor.queue({
      type: 'justdoit',
      sentence: "TRUNCATE TABLE AllexTestTable"
    }), 'truncate');
  })
  */

  it ('Create Test Table, Truncate it, Insert some values', function () {
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
    return qlib.promise2console(Executor.queue([{
      type: 'justdoit', 
      sentence: Lib.sqlsentencing.createTable({
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
    },{
      type: 'justdoit',
      sentence: "TRUNCATE TABLE AllexTestTable"
    },{
      type: 'rowsaffected',
      sentence: insstring,
    }]), 'create_truncate_insert#1');
  });

  compositeIt([
    insertTest(),
    lookupTests[10],
    insertTest(),
    recordset2arryofscalarsTests[1],
    insertTest()
  ]);

  /**/
  verbatimTests.forEach(singularIt);
  lookupTests.forEach(singularIt);
  recordsetTests.forEach(singularIt);
  recordset2arryofscalarsTests.forEach(singularIt);
  firstrecordTests.forEach(singularIt);
  /**/
  /**/
  for (var i=0; i<10; i++) {
    randomArryIt([
      verbatimTests,
      lookupTests,
      recordsetTests,
      recordset2arryofscalarsTests,
      firstrecordTests,
      [insertTest]
    ]);
  }
  for (var i=0; i<10; i++) {
    randomCompositeIt([
      verbatimTests,
      lookupTests,
      recordsetTests,
      recordset2arryofscalarsTests,
      firstrecordTests,
      [insertTest]
    ]);
  }
  /**/
  /*composite with promising procs*/
  compositeIt([
    lookupTests[9],
    lookupTests[10]
  ]);
  /**/

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
    return qlib.promise2console(Executor.queue({
      type: 'rowsaffected',
      sentence: insstring
    }), 'insert 2');
  });

  singularIt(insertTest());

  it ('Find an inserted value', function () {
    return Executor.queue({
      type: 'recordset',
      sentence: 'SELECT * FROM AllexTestTable WHERE a=15'
    }).then(function (results) {
      if (results[0].b !== 'bla15') {
        throw new lib.Error('MISMATCH', 'Expected bla15 but got '+results[0].b);
      }
      console.log(results[0].b);
    });
  });

  it ('Join with valuesOfScalarArray', function () {
    return Executor.queue({
      type: 'recordset',
      sentence: [
      'SELECT t.b FROM',
      Lib.sqlsentencing.toValuesOfScalarArray([6], 'mycolumn'),
      'q',
      'LEFT JOIN AllexTestTable t',
      'ON q.mycolumn=t.a'
      ].join(' ')
    }).then(function (results) {
      if (results[0].b !== 'bla6') {
        throw new lib.Error('MISMATCH', 'Expected bla6 but got '+results[0].b);
      }
      console.log(results[0].b);
    });
  });

  it ('Upsert a record that exists', function () {
    this.timeout(1e7);
    return Executor.queue({
      type: 'upsert',
      tablename: 'AllexTestTable',
      record: {
        a: 15,
        b: 'bla15_upd',
        c: 15
      },
      selectfields: ['a'],
      setfields: ['b']
    }).then(function (result) {
      if (!result.updated) {
        throw new lib.Error('NOT_UPDATED', 'Expected the record with a:15 to be updated');
      }
      console.log(result);
    });
  });

  it ('Find the upserted value', function () {
    return Executor.queue({
      type: 'recordset',
      sentence: 'SELECT * FROM AllexTestTable WHERE a=15'
    }).then(function (results) {
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
    return Executor.queue({
      type: 'upsert',
      tablename: 'AllexTestTable',
      record: {
        a: 55,
        b: 'bla55',
        c: 0
      },
      selectfields: ['a'],
      setfields: ['b', 'c']
    }).then(function (result) {
      if (!result.inserted) {
        throw new lib.Error('NOT_INSERTED', 'Expected the record with a:55 to be inserted');
      }
      console.log(result);
    });
  });

  it ('Find the last upserted value', function () {
    return Executor.queue({
      type: 'recordset',
      sentence: 'SELECT * FROM AllexTestTable WHERE a=55'
    }).then(function (results) {
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
    return Executor.queue({
      type: 'upsertmany',
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
    }).then(function (result) {
      if (result.updated != 2) {
        throw new lib.Error('NOT_UPDATED', 'Expected UpsertMany to update 2 records, but only '+result.updated+' got updated');
      }
      console.log(result);
    });
  });

  it ('Upsert many, one insert, one update', function () {
    this.timeout(1e7);
    return Executor.queue({
      type: 'upsertmany',
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
    }).then(function (result) {
      if (!(result.updated == 1 && result.inserted == 1)) {
        throw new lib.Error('NOT_UPDATED', 'Expected UpsertMany to update 1 record and insert 1 record, but '+result.updated+' got updated and '+result.inserted+' got inserted');
      }
      console.log(result);
    });
  });

  it ('Upsert many, all inserts', function () {
    this.timeout(1e7);
    return Executor.queue({
      type: 'upsertmany',
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
    }).then(function (result) {
      if (result.inserted != 2) {
        throw new lib.Error('NOT_INSERTED', 'Expected UpsertMany to insert 2 records, but only '+result.inserted+' got inserted');
      }
      console.log(result);
    });
  });

  it ('Drop Test Table', function () {
    this.timeout(1e7);
    return qlib.promise2console(Executor.queue({
      type: 'rowsaffected',
      sentence: [
        "IF EXISTS (SELECT * FROM SYSOBJECTS WHERE name='AllexTestTable' AND xtype='U')",
        "DROP TABLE AllexTestTable"
      ].join(' '),
      rowsaffectedcount: 2
    }), 'drop');
  });

  it ('Destroy Executor', function () {
    Executor.destroy();
  });
});