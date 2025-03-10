# EverGreenEnergy

EverGreen Energy - Heat Pump Selection System
A backend tool that processes housing data, calculates heat loss, fetches weather data, and selects the best heat pump for a property.



-----Project Overview-----

This tool:
	•	Reads housing data from houses.json
	•	Calculates heat loss using property details
	•	Fetches weather data to determine heating requirements
	•	Selects the best heat pump based on power heat loss
	•	Calculates total cost including VAT
	•	Generates a formatted summary for each house

It ensures accurate and efficient heat pump recommendations!


-----Installation-----

1. Clone the repository:
    git clone https://github.com/YOUR_USERNAME/EverGreenEnergy.git
    cd EverGreenEnergy

2. Install dependencies:
    npm install

3. Compile TypeScript (if needed):
    npm run build

-----Running the Program-----
    npx ts-node src/index.ts  

Expected Output

--------------------------------------
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


-----Running Tests-----

Run all unit tests:
    npm test

Test Coverage
	•Heat loss calculation
	•JSON file reading
	•Fetching weather data
	•Power heat loss computation
	•Heat pump selection
	•Total cost calculation
	•Generating formatted output


-----Technologies Used-----
	•	Node.js + TypeScript
	•	Jest (for testing)
	•	Axios (for API requests)
	•	Dotenv (for environment variables)


 -----Notes----
	•	If weather data fails to load, the system skips cost calculations and outputs:
--------------------------------------
12345
--------------------------------------
  Estimated Heat Loss = 96.0 kWh
  Warning: Could not find design region




License

This project is open-source and free to use.