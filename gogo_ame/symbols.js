import { Config } from "./config.js";

// export const symbolDefinitions = {
//   S1_HORIZ: {
//     level: 1,
//     character: "一",
//     recipe: null,
//     sizeMultiplier: 1.0,
//     eliminationPoints: 10,
//     explosionRadiusUnits: 1.7,
//     explosionEffectLevels: [1],
//   },
//   S1_VERT: {
//     level: 1,
//     character: "丨",
//     recipe: null,
//     sizeMultiplier: 1.0,
//     eliminationPoints: 10,
//     explosionRadiusUnits: 1.7,
//     explosionEffectLevels: [1],
//   },
//   S1_SWEEP: {
//     level: 1,
//     character: "丿",
//     recipe: null,
//     sizeMultiplier: 1.0,
//     eliminationPoints: 10,
//     explosionRadiusUnits: 1.7,
//     explosionEffectLevels: [1],
//   },
//   S2_CROSS: {
//     level: 2,
//     character: "十",
//     recipe: ["S1_HORIZ", "S1_VERT"],
//     sizeMultiplier: 1.15,
//     eliminationPoints: 30,
//     explosionRadiusUnits: 2.2,
//     explosionEffectLevels: [1, 2],
//   },
//   S2_CLIFF: {
//     level: 2,
//     character: "厂",
//     recipe: ["S1_HORIZ", "S1_SWEEP"],
//     sizeMultiplier: 1.15,
//     eliminationPoints: 30,
//     explosionRadiusUnits: 2.2,
//     explosionEffectLevels: [1, 2],
//   },
//   S2_PERSON: {
//     level: 2,
//     character: "亻",
//     recipe: ["S1_VERT", "S1_SWEEP"],
//     sizeMultiplier: 1.15,
//     eliminationPoints: 30,
//     explosionRadiusUnits: 2.2,
//     explosionEffectLevels: [1, 2],
//   },
//   S3_STONE: {
//     level: 3,
//     character: "石",
//     recipe: ["S2_CROSS", "S2_CLIFF"],
//     sizeMultiplier: 1.3,
//     eliminationPoints: 70,
//     explosionRadiusUnits: 2.5,
//     explosionEffectLevels: [1, 2, 3],
//   },
//   S3_TENPLUS: {
//     level: 3,
//     character: "什",
//     recipe: ["S2_CROSS", "S2_PERSON"],
//     sizeMultiplier: 1.3,
//     eliminationPoints: 70,
//     explosionRadiusUnits: 2.5,
//     explosionEffectLevels: [1, 2, 3],
//   },
//   S3_CREATE: {
//     level: 3,
//     character: "作",
//     recipe: ["S2_CLIFF", "S2_PERSON"],
//     sizeMultiplier: 1.3,
//     eliminationPoints: 70,
//     explosionRadiusUnits: 2.5,
//     explosionEffectLevels: [1, 2, 3],
//   },
//   S4_GRASS: {
//     level: 4,
//     character: "艹",
//     recipe: ["S3_STONE", "S3_TENPLUS"],
//     sizeMultiplier: 1.45,
//     eliminationPoints: 150,
//     explosionRadiusUnits: 2.8,
//     explosionEffectLevels: [1, 2, 3, 4],
//   },
//   S4_STEM: {
//     level: 4,
//     character: "芈",
//     recipe: ["S3_STONE", "S3_CREATE"],
//     sizeMultiplier: 1.45,
//     eliminationPoints: 150,
//     explosionRadiusUnits: 2.8,
//     explosionEffectLevels: [1, 2, 3, 4],
//   },
//   S4_BASE: {
//     level: 4,
//     character: "廾",
//     recipe: ["S3_TENPLUS", "S3_CREATE"],
//     sizeMultiplier: 1.45,
//     eliminationPoints: 150,
//     explosionRadiusUnits: 2.8,
//     explosionEffectLevels: [1, 2, 3, 4],
//   },
//   S1_VOID: {
//     level: 1,
//     character: "X", // Fallback character
//     recipe: null,
//     sizeMultiplier: 1.0,
//     eliminationPoints: 5, // A small reward for destroying something
//     explosionRadiusUnits: 1.2,
//     explosionEffectLevels: [], // Does not trigger chain reactions
//   },
// };
//
// export const mandalaDefinitions = {
//   S1_HORIZ: {
//     mandalaConfig: {
//       numPoints: 3,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "both",
//       curveAmount: 0.4,
//       fillStyle: "lines",
//     },
//   },
//   S1_VERT: {
//     mandalaConfig: {
//       numPoints: 3,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "left",
//       curveAmount: 0.4,
//       fillStyle: "solid",
//     },
//   },
//   S1_SWEEP: {
//     mandalaConfig: {
//       numPoints: 3,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "both",
//       curveAmount: 0.4,
//       fillStyle: "solid",
//     },
//   },
//   S2_CROSS: {
//     mandalaConfig: {
//       numPoints: 4,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "both",
//       curveAmount: 0.4,
//       fillStyle: "solid",
//     },
//   },
//   S2_CLIFF: {
//     mandalaConfig: {
//       numPoints: 4,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "left",
//       curveAmount: 0.4,
//       fillStyle: "solid",
//     },
//   },
//   S2_PERSON: {
//     mandalaConfig: {
//       numPoints: 4,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "both",
//       curveAmount: 0.4,
//       fillStyle: "lines",
//     },
//   },
//   S3_STONE: {
//     mandalaConfig: {
//       numPoints: 5,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "both",
//       curveAmount: 0.4,
//       fillStyle: "lines",
//     },
//   },
//   S3_TENPLUS: {
//     mandalaConfig: {
//       numPoints: 5,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "left",
//       curveAmount: 0.4,
//       fillStyle: "solid",
//     },
//   },
//   S3_CREATE: {
//     mandalaConfig: {
//       numPoints: 5,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "both",
//       curveAmount: 0.4,
//       fillStyle: "solid",
//     },
//   },
//   S4_GRASS: {
//     mandalaConfig: {
//       numPoints: 6,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "both",
//       curveAmount: 0.4,
//       fillStyle: "lines",
//     },
//   },
//   S4_STEM: {
//     mandalaConfig: {
//       numPoints: 6,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "left",
//       curveAmount: 0.4,
//       fillStyle: "solid",
//     },
//   },
//   S4_BASE: {
//     mandalaConfig: {
//       numPoints: 6,
//       innerRadius: 0.0,
//       spikeDistance: 0.8,
//       leafType: "both",
//       curveAmount: 0.4,
//       fillStyle: "solid",
//     },
//   },
//   S1_VOID: {
//     mandalaConfig: {
//       numPoints: 12,
//       innerRadius: 0.1,
//       spikeDistance: 0.9,
//       leafType: "left",
//       curveAmount: 0.4,
//       fillStyle: "solid",
//     },
//   },
// };
//
// export const L1_SYMBOLS = ["S1_HORIZ", "S1_VERT", "S1_SWEEP", "S1_VOID"];

/**
 * Generates symbol and mandala definitions based on a scalable pattern.
 * @param {number} maxLevel - The maximum symbol level to generate.
 * @returns {{symbolDefinitions: object, mandalaDefinitions: object, L1_SYMBOLS: string[]}}
 */
function generateSymbolSystem(maxLevel) {
  const symbolDefinitions = {};
  const mandalaDefinitions = {};
  let L1_SYMBOLS = [];

  const types = [
    { name: "_SOLID_BOTH", fillStyle: "solid", leafType: "both" }, // Type A
    { name: "_SOLID_LEFT", fillStyle: "solid", leafType: "left" }, // Type B
    { name: "_LINES_BOTH", fillStyle: "lines", leafType: "both" }, // Type C
  ];

  // --- First Pass: Create all base symbol definitions ---
  for (let level = 1; level <= maxLevel; level++) {
    const ids = types.map((t) => `S${level}${t.name}`);

    types.forEach((type, index) => {
      const currentId = ids[index];

      // Create the main symbol definition with a null recipe for now
      symbolDefinitions[currentId] = {
        level: level,
        recipe: null,
        sizeMultiplier: 1.0 + (level - 1) * 0.15,
        eliminationPoints: 10 * Math.pow(3, level - 1),
        explosionRadiusUnits: 1.5 + level * 0.4,
        explosionEffectLevels: Array.from({ length: level }, (_, i) => i + 1),
      };

      // Create the corresponding mandala definition
      mandalaDefinitions[currentId] = {
        mandalaConfig: {
          numPoints: level + 2,
          innerRadius: 0.0,
          spikeDistance: 0.8,
          curveAmount: 0.4,
          leafType: type.leafType,
          fillStyle: type.fillStyle,
        },
      };
    });

    // Populate the L1_SYMBOLS array
    if (level === 1) {
      L1_SYMBOLS = ids;
    }
  }

  // --- Second Pass: Now that all symbols exist, assign their recipes ---
  for (let level = 1; level < maxLevel; level++) {
    const currentIds = types.map((t) => `S${level}${t.name}`);
    const [idA, idB, idC] = currentIds;

    const nextLevelIds = types.map((t) => `S${level + 1}${t.name}`);
    const [nextA, nextB, nextC] = nextLevelIds;

    // Rule: B + C -> A
    symbolDefinitions[nextA].recipe = [idB, idC];
    // Rule: A + C -> B
    symbolDefinitions[nextB].recipe = [idA, idC];
    // Rule: A + B -> C
    symbolDefinitions[nextC].recipe = [idA, idB];
  }

  // --- Manually add the special S1_VOID symbol ---
  const voidId = "S1_VOID";
  symbolDefinitions[voidId] = {
    level: 1,
    recipe: null,
    sizeMultiplier: 1.0,
    eliminationPoints: 5,
    explosionRadiusUnits: 1.2,
    explosionEffectLevels: [],
  };
  mandalaDefinitions[voidId] = {
    mandalaConfig: {
      numPoints: 12,
      innerRadius: 0.1,
      spikeDistance: 0.9,
      leafType: "left",
      curveAmount: 0.4,
      fillStyle: "solid",
    },
  };
  L1_SYMBOLS.push(voidId);

  return { symbolDefinitions, mandalaDefinitions, L1_SYMBOLS };
}

// Generate the system using the config and export the results
const {
  symbolDefinitions: generatedSymbols,
  mandalaDefinitions: generatedMandalas,
  L1_SYMBOLS: generatedL1,
} = generateSymbolSystem(Config.MAX_SYMBOL_LEVEL);

export const symbolDefinitions = generatedSymbols;
export const mandalaDefinitions = generatedMandalas;
export const L1_SYMBOLS = generatedL1;
