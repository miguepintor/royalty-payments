const { viewings } = require('../../../../src/modules/validator');
const { episodes } = require('../../../../resources/episodes');

describe('Validator', () => {
  describe('viewings()', () => {
    it('should return no errors when the query is valid', () => {
      const query = {
        episode: episodes[0].id,
        customer: 'GUID',
      };
      const { error } = viewings(query);
      expect(error).toBeNull();
    });
    it('should return an error when episode is not present in the query', () => {
      const query = {
        customer: 'GUID',
      };
      const { error } = viewings(query);
      expect(error.message).toEqual('');
    });
    it('should return an error when episode is not a string in the query', () => {
      const query = {
        episode: 234,
        customer: 'GUID',
      };
      const { error } = viewings(query);
      expect(error.message).toEqual('');
    });
    it('should return an error when episode is present in the query but doesnt exist in the system', () => {
      const query = {
        episode: 'x',
        customer: 'GUID',
      };
      const { error } = viewings(query);
      expect(error.message).toEqual('');
    });
    it('should return an error when customer is not present in the query', () => {
      const query = {
        episode: 'GUID',
      };
      const { error } = viewings(query);
      expect(error.message).toEqual('');
    });
    it('should return an error when customer is not a string in the query', () => {
      const query = {
        episode: 'GUID',
        customer: true,
      };
      const { error } = viewings(query);
      expect(error.message).toEqual('');
    });
  });
});
