import { ReferenceDataItem } from './langchain-analyzer';

/**
 * Get reference data for soil and leaf analysis
 * This is a utility function that returns optimal ranges and interpretations for different parameters
 */
export function getReferenceData(sampleType: 'soil' | 'leaf'): Record<string, ReferenceDataItem> {
  if (sampleType === 'soil') {
    return {
      "pH": { optimal: [5.5, 6.5], unit: "", interpretation: "pH affects nutrient availability" },
      "N": { optimal: [0.2, 0.3], unit: "%", interpretation: "Nitrogen is essential for vegetative growth" },
      "P": { optimal: [15, 20], unit: "ppm", interpretation: "Phosphorus is important for root development and fruit production" },
      "K": { optimal: [0.3, 0.5], unit: "cmol/kg", interpretation: "Potassium helps in drought resistance and disease resistance" },
      "Mg": { optimal: [0.3, 0.4], unit: "cmol/kg", interpretation: "Magnesium is essential for chlorophyll production" },
      "Ca": { optimal: [2, 5], unit: "cmol/kg", interpretation: "Calcium is important for cell wall development" },
      "CEC": { optimal: [12, 25], unit: "cmol/kg", interpretation: "Cation Exchange Capacity affects nutrient retention" },
      "OC": { optimal: [2, 5], unit: "%", interpretation: "Organic Carbon is important for soil health" },
      "Zn": { optimal: [1, 3], unit: "ppm", interpretation: "Zinc is a micronutrient essential for enzyme activities" },
      "Cu": { optimal: [0.2, 0.8], unit: "ppm", interpretation: "Copper is essential for photosynthesis" },
      "B": { optimal: [0.5, 1], unit: "ppm", interpretation: "Boron is important for cell division" },
      "Fe": { optimal: [50, 250], unit: "ppm", interpretation: "Iron is essential for chlorophyll formation" },
      "Mn": { optimal: [20, 40], unit: "ppm", interpretation: "Manganese activates enzymes involved in photosynthesis" },
      "S": { optimal: [0.1, 0.2], unit: "%", interpretation: "Sulfur is a component of amino acids" },
      "Cl": { optimal: [0.1, 0.2], unit: "%", interpretation: "Chlorine aids in photosynthesis" }
    };
  } else {
    // Leaf reference data
    return {
      "N": { optimal: [2.6, 2.9], unit: "%", interpretation: "Nitrogen is essential for vegetative growth" },
      "P": { optimal: [0.16, 0.19], unit: "%", interpretation: "Phosphorus is important for root development" },
      "K": { optimal: [1.0, 1.3], unit: "%", interpretation: "Potassium helps in drought and disease resistance" },
      "Mg": { optimal: [0.3, 0.45], unit: "%", interpretation: "Magnesium is essential for chlorophyll" },
      "Ca": { optimal: [0.5, 0.7], unit: "%", interpretation: "Calcium is important for cell wall development" },
      "S": { optimal: [0.25, 0.4], unit: "%", interpretation: "Sulfur is a component of amino acids" },
      "Cl": { optimal: [0.5, 0.7], unit: "%", interpretation: "Chlorine aids in photosynthesis" },
      "B": { optimal: [15, 25], unit: "ppm", interpretation: "Boron is important for cell division" },
      "Cu": { optimal: [5, 8], unit: "ppm", interpretation: "Copper is essential for photosynthesis" },
      "Zn": { optimal: [15, 20], unit: "ppm", interpretation: "Zinc is essential for enzyme activities" },
      "Mn": { optimal: [100, 200], unit: "ppm", interpretation: "Manganese activates enzymes in photosynthesis" },
      "Fe": { optimal: [60, 200], unit: "ppm", interpretation: "Iron is essential for chlorophyll formation" },
      "pH": { optimal: [5.5, 6.5], unit: "", interpretation: "pH affects nutrient availability" },
      "CEC": { optimal: [12, 25], unit: "cmol/kg", interpretation: "Cation Exchange Capacity affects nutrient retention" },
      "OC": { optimal: [2, 5], unit: "%", interpretation: "Organic Carbon is important for soil health" }
    };
  }
}
