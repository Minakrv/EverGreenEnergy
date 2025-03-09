import { calculateHeatLoss } from '../src/utils';


//Test for Heat Loss Calculation
describe('Heat Loss Calculation', () => {
  test('should correctly calculate heat loss', () => {
    const house = {
      floorArea: 100, 
      heatingFactor: 1.2, 
      insulationFactor: 0.8
    };
    
    const expectedHeatLoss = 100 * 1.2 * 0.8; // Formula: floorArea * heatingFactor * insulationFactor
    
    expect(calculateHeatLoss(house)).toBeCloseTo(expectedHeatLoss);
  });
});

//Writing Tests for Reading JSON Data

//Test for Fetching Weather Data