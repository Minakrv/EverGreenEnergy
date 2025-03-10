import { promises as fs } from "fs";
import * as path from "path";
import axios from "axios";
import dotenv from "dotenv";
import { HeatPump, House, SelectedHeatPump, CostItem } from "./types";

dotenv.config();

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

export function calculateHeatLoss(house: House): number {
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
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error("Warning: Could not find design region");
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
  heatPumps: HeatPump[],
  powerHeatLoss: number
): SelectedHeatPump {
  const suitablePump = heatPumps.find(
    (pump) => pump.outputCapacity >= powerHeatLoss
  );
  if (!suitablePump) {
    throw new Error("No suitable heat pump found");
  }

  const totalCost = suitablePump.costs.reduce(
    (sum, item) => sum + item.cost,
    0
  );
  return {
    label: suitablePump.label,
    outputCapacity: suitablePump.outputCapacity,
    totalCost,
    breakdown: suitablePump.costs,
  };
}

export function calculateTotalCost(selectedPump: SelectedHeatPump): {
  totalCost: number;
  breakdown: CostItem[];
} {
  const VAT_RATE = 0.05;
  const vatAmount = selectedPump.totalCost * VAT_RATE;
  const finalTotalCost = selectedPump.totalCost + vatAmount;

  return {
    totalCost: finalTotalCost,
    breakdown: [
      ...selectedPump.breakdown,
      { label: "VAT (5%)", cost: vatAmount },
    ],
  };
}

export function generateSummary(
  house: House,
  heatLoss: number,
  powerHeatLoss: number,
  selectedPump: SelectedHeatPump,
  totalCost: number,
  breakdown: CostItem[]
): string {
  const formatCost = (cost: number, isVAT: boolean = false) =>
    isVAT
      ? cost.toFixed(2)
      : cost % 1 === 0
        ? cost.toFixed(0)
        : cost.toFixed(2);

  const breakdownText = breakdown
    .map(
      (item) =>
        `    ${item.label}, ${formatCost(item.cost, item.label.includes("VAT"))}`
    )
    .join("\n");
  return `--------------------------------------
${house.submissionId}
--------------------------------------
  Estimated Heat Loss = ${heatLoss.toFixed(1)} kWh
  Design Region = ${house.designRegion}
  Power Heat Loss = ${powerHeatLoss.toFixed(3)} kW
  Recommended Heat Pump = ${selectedPump.label}
  Cost Breakdown
${breakdownText}
  Total Cost, including VAT = ${totalCost.toFixed(2)}
`;
}
