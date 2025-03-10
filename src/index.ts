import { readJsonFile, fetchWeatherData, calculateHeatLoss, calculatePowerHeatLoss, selectHeatPump, calculateTotalCost, generateSummary } from "./utils";
import path from "path";

async function run() {
  try {
    // Read Houses Data
    const housesFilePath = path.join(__dirname, "../data/houses.json");
    const houses = await readJsonFile(housesFilePath);

    // Read Heat Pump Data
    const heatPumpsFilePath = path.join(__dirname, "../data/heatPumpData.json");
    const heatPumps = await readJsonFile(heatPumpsFilePath);

    for (const house of houses) {
      console.log(`Processing Submission ID: ${house.submissionId}`);

      try {
        // Step 1: Calculate Heat Loss
        const heatLoss = calculateHeatLoss(house);

        // Step 2: Fetch Weather Data
        const weatherData = await fetchWeatherData(house.designRegion);

        // Step 3: Calculate Power Heat Loss
        const powerHeatLoss = calculatePowerHeatLoss(heatLoss, weatherData.degreeDays);

        // Step 4: Select Suitable Heat Pump
        const selectedPump = selectHeatPump(heatPumps, powerHeatLoss);

        // Step 5: Calculate Total Cost
        const totalCostData = calculateTotalCost(selectedPump);

        // Step 6: Generate Output Summary
        const summary = generateSummary(
          house,
          heatLoss,
          powerHeatLoss,
          selectedPump,
          totalCostData.totalCost,
          totalCostData.breakdown
        );

        console.log(summary);
      } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error processing house ${house.submissionId}:`, error.message);
        }else {
            console.error(`Error processing house ${house.submissionId}:`, String(error));
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
        console.error("Failed to run process:", error.message);
    } else {
        console.error("Failed to run process:", String(error));
    }
   
  }
}

run();