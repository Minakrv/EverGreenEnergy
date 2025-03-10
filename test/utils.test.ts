import {
  calculateHeatLoss,
  readJsonFile,
  fetchWeatherData,
  calculatePowerHeatLoss,
  selectHeatPump,
  calculateTotalCost,
  generateSummary,
} from "../src/utils";
import * as path from "path";
import axios from "axios";
import { HeatPump, House, SelectedHeatPump } from "../src/types";

//Test for Heat Loss Calculation
describe("Heat Loss Calculation", () => {
  test("should correctly calculate heat loss", () => {
    const house: House = {
      submissionId: "12345",
      floorArea: 100,
      heatingFactor: 1.2,
      insulationFactor: 0.8,
      designRegion: "Borders (Boulmer)",
    };

    const expectedHeatLoss = 100 * 1.2 * 0.8; // Formula: floorArea * heatingFactor * insulationFactor

    expect(calculateHeatLoss(house)).toBeCloseTo(expectedHeatLoss);
  });
});

//Writing Tests for Reading JSON Data
describe("Read JSON File", () => {
  test("should correctly read houses.json", async () => {
    const filePath = path.join(__dirname, "../data/houses.json");
    const data = await readJsonFile(filePath);

    expect(Array.isArray(data)).toBe(true); // Expecting an array
    expect(data.length).toBeGreaterThan(0); // Ensure it has at least one entry
    expect(data[0]).toHaveProperty("floorArea"); // Verify expected property
  });

  test("should correctly read heatPumpData.json", async () => {
    const filePath = path.join(__dirname, "../data/heatPumpData.json");
    const data = await readJsonFile(filePath);

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("outputCapacity"); // Verify heat pump property
  });

  test("should throw an error if file does not exist", async () => {
    const filePath = path.join(__dirname, "../data/nonexistent.json");

    await expect(readJsonFile(filePath)).rejects.toThrow("Error reading file");
  });
});

//Test for Fetching Weather Data
jest.mock("axios"); // Mock axios to prevent real API calls

describe("Fetch Weather Data", () => {
  test("should fetch weather data successfully", async () => {
    const mockResponse = {
      data: {
        location: {
          location: "Borders (Boulmer)",
          degreeDays: 2483,
          groundTemp: "9",
          postcode: "NE66",
          lat: "55.424",
          lng: "-1.583",
        },
      },
    };

    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await fetchWeatherData("Borders (Boulmer)");
    expect(result).toEqual({ location: "Borders (Boulmer)", degreeDays: 2483 });
  });

  test("should handle 404 error for missing design region", async () => {
    (axios.get as jest.Mock).mockRejectedValue({ response: { status: 404 } });

    await expect(fetchWeatherData("Unknown Region")).rejects.toThrow(
      "Error fetching weather data"
    );
  });
});

//Test for Power Heat Loss
describe("Power Heat Loss Calculation", () => {
  test("should correctly calculate power heat loss", () => {
    const heatLoss = 29710.8; // Example value from test prompt
    const degreeDays = 2483; // Example value from API response

    const expectedPowerHeatLoss = heatLoss / degreeDays;

    expect(calculatePowerHeatLoss(heatLoss, degreeDays)).toBeCloseTo(
      expectedPowerHeatLoss
    );
  });

  test("should throw an error when degree days is zero", () => {
    const heatLoss = 5000;
    const degreeDays = 0; // Invalid case

    expect(() => calculatePowerHeatLoss(heatLoss, degreeDays)).toThrow(
      "Heating degree days must be greater than zero"
    );
  });
});

//Test for Heat Pump Selection
describe("Heat Pump Selection", () => {
  test("should select the correct heat pump based on power heat loss", () => {
    const heatPumps: HeatPump[] = [
      {
        label: "5kW Package",
        outputCapacity: 5,
        costs: [
          { label: "Component Cost", cost: 4000 },
          { label: "Installation Cost", cost: 2000 },
        ],
      },
      {
        label: "8kW Package",
        outputCapacity: 8,
        costs: [
          { label: "Component Cost", cost: 5000 },
          { label: "Installation Cost", cost: 3000 },
        ],
      },
    ];

    const powerHeatLoss = 6; // Needs at least 6 kW capacity

    const selectedPump: SelectedHeatPump = selectHeatPump(
      heatPumps,
      powerHeatLoss
    );
    expect(selectedPump).toEqual({
      label: "8kW Package",
      outputCapacity: 8,
      totalCost: 8000,
      breakdown: [
        { label: "Component Cost", cost: 5000 },
        { label: "Installation Cost", cost: 3000 },
      ],
    });
  });
});

//Test for total cost, including VAT
describe("Total Cost Calculation", () => {
  test("should correctly calculate total cost including VAT", () => {
    const selectedPump: SelectedHeatPump = {
      label: "8kW Package",
      outputCapacity: 8,
      totalCost: 8000,
      breakdown: [
        { label: "Component Cost", cost: 5000 },
        { label: "Installation Cost", cost: 3000 },
      ],
    };
    const expectedTotalCost = selectedPump.totalCost * 1.05; // Adding 5% VAT
    const result = calculateTotalCost(selectedPump);

    expect(result.totalCost).toBeCloseTo(expectedTotalCost);
    expect(result.breakdown).toEqual([
      { label: "Component Cost", cost: 5000 },
      { label: "Installation Cost", cost: 3000 },
      { label: "VAT (5%)", cost: selectedPump.totalCost * 0.05 },
    ]);
  });
});

//Test for Generating the Final Output Summary

describe("Generate Output Summary", () => {
  test("should generate a correctly formatted summary", () => {
    const house = {
      submissionId: "12345",
      floorArea: 100,
      heatingFactor: 1.2,
      insulationFactor: 0.8,
      designRegion: "Borders (Boulmer)",
    };

    const heatLoss = 100 * 1.2 * 0.8; // Precomputed
    const powerHeatLoss = heatLoss / 2483; // Example degreeDays value
    const selectedPump = {
      label: "8kW Package",
      outputCapacity: 8,
      totalCost: 8000,
      breakdown: [
        { label: "Component Cost", cost: 5000 },
        { label: "Installation Cost", cost: 3000 },
      ],
    };
    const totalCost = selectedPump.totalCost * 1.05; // Adding 5% VAT
    const breakdown = [
      { label: "Component Cost", cost: 5000 },
      { label: "Installation Cost", cost: 3000 },
      { label: "VAT (5%)", cost: selectedPump.totalCost * 0.05 },
    ];

    const expectedOutput = `--------------------------------------
12345
--------------------------------------
  Estimated Heat Loss = 96.0 kWh
  Design Region = Borders (Boulmer)
  Power Heat Loss = 0.039 kW
  Recommended Heat Pump = 8kW Package
  Cost Breakdown
    Component Cost, 5000
    Installation Cost, 3000
    VAT (5%), 400.00
  Total Cost, including VAT = 8400.00
`;

    const result = generateSummary(
      house,
      heatLoss,
      powerHeatLoss,
      selectedPump,
      totalCost,
      breakdown
    );

    expect(result).toBe(expectedOutput);
  });
});
