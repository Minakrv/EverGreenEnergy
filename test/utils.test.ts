import { calculateHeatLoss, readJsonFile } from '../src/utils';
import * as path from 'path';

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
describe('Read JSON File', () => {
    test('should correctly read houses.json', async () => {
      const filePath = path.join(__dirname, '../data/houses.json');
      const data = await readJsonFile(filePath);
      
      expect(Array.isArray(data)).toBe(true);  // Expecting an array
      expect(data.length).toBeGreaterThan(0);  // Ensure it has at least one entry
      expect(data[0]).toHaveProperty('floorArea');  // Verify expected property
    });
  
    test('should correctly read heatPumpData.json', async () => {
      const filePath = path.join(__dirname, '../data/heatPumpData.json');
      const data = await readJsonFile(filePath);
      
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('outputCapacity'); // Verify heat pump property
    });
  
    test('should throw an error if file does not exist', async () => {
      const filePath = path.join(__dirname, '../data/nonexistent.json');
      
      await expect(readJsonFile(filePath)).rejects.toThrow('Error reading file');
    });
  });



//Test for Fetching Weather Data