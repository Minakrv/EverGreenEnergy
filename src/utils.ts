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

export function calculatePowerHeatLoss(
  heatLoss: number,
  degreeDays: number
): number {
  if (degreeDays <= 0) {
    throw new Error("Heating degree days must be greater than zero");
  }
  return heatLoss / degreeDays;
}

export function selectHeatPump(
  heatPumps: { model: string; outputCapacity: number; cost: number }[],
  powerHeatLoss: number
): { model: string; outputCapacity: number; cost: number } {
  const suitablePump = heatPumps.find(
    (pump) => pump.outputCapacity >= powerHeatLoss
  );

  if (!suitablePump) {
    throw new Error("No suitable heat pump found");
  }

  return suitablePump;
}

// Cost Calculation
export function calculateTotalCost(
    selectedPump: { model: string; outputCapacity: number; cost: number }
  ): { totalCost: number; breakdown: { label: string; cost: number }[] } {
    const VAT_RATE = 0.05;
    const vatAmount = selectedPump.cost * VAT_RATE;
    const totalCost = selectedPump.cost + vatAmount;
  
    return {
      totalCost,
      breakdown: [
        { label: "Heat Pump Cost", cost: selectedPump.cost },
        { label: "VAT (5%)", cost: vatAmount },
      ],
    };
  }

  export function generateSummary(
    house: { submissionId: string; designRegion: string },
    heatLoss: number,
    powerHeatLoss: number,
    selectedPump: { model: string; outputCapacity: number; cost: number },
    totalCost: number,
    breakdown: { label: string; cost: number }[]
  ): string {
    const breakdownText = breakdown
    .map((item) => `      ${item.label}, ${item.cost}`)
    .join("\n");
  
    return `--------------------------------------
  ${house.submissionId}
  --------------------------------------
    Estimated Heat Loss = ${heatLoss.toFixed(1)} kWh
    Design Region = ${house.designRegion}
    Power Heat Loss = ${powerHeatLoss.toFixed(3)} kW
    Recommended Heat Pump = ${selectedPump.model}
    Cost Breakdown
${breakdownText}
    Total Cost, including VAT = ${totalCost.toFixed(2)}
  `;
  }