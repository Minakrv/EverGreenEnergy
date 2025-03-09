

export function calculateHeatLoss(house: { floorArea: number, heatingFactor: number, insulationFactor: number }): number {
    return house.floorArea * house.heatingFactor * house.insulationFactor;
}