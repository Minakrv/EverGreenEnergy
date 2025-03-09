import { promises as fs } from 'fs';
import * as path from 'path';

export function calculateHeatLoss(house: { floorArea: number, heatingFactor: number, insulationFactor: number }): number {
    return house.floorArea * house.heatingFactor * house.insulationFactor;
}

export async function readJsonFile(filePath: string): Promise<any> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Error reading file: ${path.basename(filePath)}`);
    }
  }