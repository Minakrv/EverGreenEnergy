export interface CostItem {
    label: string;
    cost: number;
  }
  
  export interface HeatPump {
    label: string;
    outputCapacity: number;
    costs: CostItem[];
  }
  
  export interface House {
    submissionId: string;
    floorArea: number;
    heatingFactor: number;
    insulationFactor: number;
    designRegion: string;
  }
  
  export interface SelectedHeatPump {
    label: string;
    outputCapacity: number;
    totalCost: number;
    breakdown: CostItem[];
  }