function createNoCountedQueueingType (lib, Executor) {
  'use strict';

  function makeUpSentence (sentence) {
    if (!sentence) {
      return sentence;
    }
    if (lib.isNonEmptyString(sentence)) {
      return ['SET NOCOUNT ON', sentence, 'SET NOCOUNT OFF'].join('\n');
    }
    if (lib.isNonEmptyArray(sentence.template)) {
      sentence.template.unshift('SET NOCOUNT ON');
      sentence.template.push('SET NOCOUNT OFF');
      return sentence;
    }
    throw new lib.Error('INVALID_SENTENCE', sentence+' is expected to be either a String or to has template as an Array[String]');
  }

  function validator () {
    this.sentence = makeUpSentence(this.sentence);
    this.type = 'justdoit';
  }

  Executor.prototype.queueTypes.push({
    dbname: null,
    type: 'nocounted',
    validator: validator,
    analyzer: lib.dummyFunc
  });
}
module.exports = createNoCountedQueueingType;