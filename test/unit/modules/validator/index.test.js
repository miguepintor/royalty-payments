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
    it('should return an error when the query contains unknown fields', () => {
      const query = {
        episode: episodes[0].id,
        customer: 'GUID',
        another: 'field',
      };
      const { error } = viewings(query);
      expect(error.message).toEqual('"another" is not allowed');
    });
    it('should return an error when episode is not present in the query', () => {
      const query = {
        customer: 'GUID',
      };
      const { error } = viewings(query);
      expect(error.message).toEqual('child "episode" fails because ["episode" is required]');
    });
    it('should return an error when episode is not a string in the query', () => {
      const query = {
        episode: 234,
        customer: 'GUID',
      };
      const { error } = viewings(query);
      expect(error.message).toEqual('child "episode" fails because ["episode" must be a string]');
    });
    it('should return an error when episode is present in the query but doesnt exist in the system', () => {
      const query = {
        episode: 'x',
        customer: 'GUID',
      };
      const { error } = viewings(query);
      expect(error.message).toEqual('child "episode" fails because ["episode" does not exist in the system]');
    });
    it('should return an error when customer is not present in the query', () => {
      const query = {
        episode: episodes[0].id,
      };
      const { error } = viewings(query);
      expect(error.message).toEqual('child "customer" fails because ["customer" is required]');
    });
    it('should return an error when customer is not a string in the query', () => {
      const query = {
        episode: episodes[0].id,
        customer: true,
      };
      const { error } = viewings(query);
      expect(error.message).toEqual('child "customer" fails because ["customer" must be a string]');
    });
  });
});
