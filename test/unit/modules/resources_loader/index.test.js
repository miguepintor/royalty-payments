const { arrayToIdMap } = require('../../../../src/modules/resources_loader');

describe('Resources Loader', () => {
  describe('arrayToIdMap()', () => {
    it('when the input is an array of objects with ids it should return a map with keys equals to ids', () => {
      const sampleArray = [{ id: 'aaaaaa' }, { id: 'bb23' }, { id: 2 }, { id: true }];
      expect(arrayToIdMap(sampleArray)).toEqual({
        aaaaaa: sampleArray[0],
        bb23: sampleArray[1],
        2: sampleArray[2],
        true: sampleArray[3],
      });
    });
    it('when the input is an array of objects with ids and one of those is duplicated, the last ocurrence prevail', () => {
      const sampleArray = [{ id: 'aaaaaa', prop: 'a' }, { id: 'bb23' }, { id: 'aaaaaa', prop: 'b' }];
      expect(arrayToIdMap(sampleArray)).toEqual({
        aaaaaa: sampleArray[2],
        bb23: sampleArray[1],
      });
    });
    it('when the input is an array of elements without an id property it should return an empty map', () => {
      const sampleArray = [1, { prop: 'a' }, {}, undefined, { prop: 'b' }];
      expect(arrayToIdMap(sampleArray)).toEqual({});
    });
  });
});
