import { promises as fs } from "fs";
import * as path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

export function calculateHeatLoss(house: {
  floorArea: number;
  heatingFactor: number;
  insulationFactor: number;
}): number {
  return house.floorArea * house.heatingFactor * house.insulationFactor;
}

export async function readJsonFile(filePath: string): Promise<any> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Error reading file: ${path.basename(filePath)}`);
  }
}

export async function fetchWeatherData(
  region: string
): Promise<{ location: string; degreeDays: number }> {
  try {
    const response = await axios.get(`${API_URL}?location=${region}`, {
      headers: { "x-api-key": API_KEY },
    });

    const { location, degreeDays } = response.data.location;
    return { location, degreeDays: Number(degreeDays) };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Warning: Could not find design region");
      }
      throw new Error("Error fetching weather data");
    }
    throw new Error("Error fetching weather data");
  }
}
