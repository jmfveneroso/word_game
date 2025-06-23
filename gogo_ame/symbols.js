import { Config } from "./config.js";

/**
 * Generates all symbol definitions, mandala configs, and spawn lists.
 * @param {number} maxLevel - The maximum symbol level to generate.
 * @returns {{symbolDefinitions: object, mandalaDefinitions: object, L1_SYMBOLS: string[], L1_NORMAL_SYMBOLS: string[]}}
 */
function generateSymbolSystem(maxLevel) {
  const symbolDefinitions = {};
  const mandalaDefinitions = {};
  const L1_REGULAR_SYMBOLS = [];

  const types = [
    { name: "_SOLID_BOTH", fillStyle: "solid", leafType: "both" },
    { name: "_SOLID_LEFT", fillStyle: "solid", leafType: "left" },
    { name: "_LINES_BOTH", fillStyle: "lines", leafType: "both" },
  ];

  const wildcards = [
    { name: "_WILDCARD", fillStyle: "lines", leafType: "both" },
  ];

  // --- First Pass: Create all symbol definitions ---
  for (let level = 1; level <= maxLevel; level++) {
    const ids = types.map((t) => `S${level}${t.name}`);

    if (level === 1) {
      L1_REGULAR_SYMBOLS.push(...ids);
    }

    types.forEach((type, index) => {
      const currentId = ids[index];
      // ... (rest of your symbol and mandala definition logic for regular types) ...
      symbolDefinitions[currentId] = {
        level,
        recipe: null,
        sizeMultiplier: 1.0,
        eliminationPoints: 10 * Math.pow(3, level - 1),
        explosionRadiusUnits: 1.5 + level * 0.4,
        explosionEffectLevels: Array.from({ length: level }, (_, i) => i + 1),
      };
      mandalaDefinitions[currentId] = {
        mandalaConfig: {
          numPoints: level + 2,
          innerRadius: 0.0,
          spikeDistance: 0.8,
          curveAmount: 0.35,
          leafType: type.leafType,
          fillStyle: type.fillStyle,
        },
      };
    });

    const specialIds = wildcards.map((t) => `S${level}${t.name}`);
    wildcards.forEach((type, index) => {
      const currentId = specialIds[index];
      // ... (rest of your wildcard definition logic) ...
      symbolDefinitions[currentId] = {
        level,
        recipe: null,
        sizeMultiplier: 1.0,
        eliminationPoints: 0,
        explosionRadiusUnits: 0,
        explosionEffectLevels: [],
        isWildcard: true,
      };
      mandalaDefinitions[currentId] = {
        mandalaConfig: {
          numPoints: level + 2,
          innerRadius: 1.0,
          spikeDistance: -0.5,
          curveAmount: 0.35,
          leafType: "both",
          fillStyle: "lines",
          isWildcard: true,
        },
      };
    });
  }

  // --- Second Pass: Assign recipes ---
  for (let level = 1; level < maxLevel; level++) {
    const currentIds = types.map((t) => `S${level}${t.name}`);
    const [idA, idB, idC] = currentIds;
    const nextLevelIds = types.map((t) => `S${level + 1}${t.name}`);
    const [nextA, nextB, nextC] = nextLevelIds;
    symbolDefinitions[nextA].recipe = [idB, idC];
    symbolDefinitions[nextB].recipe = [idA, idC];
    symbolDefinitions[nextC].recipe = [idA, idB];
  }

  // --- Manually add special L1 symbols ---
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
      curveAmount: 0.35,
      fillStyle: "solid",
    },
  };

  const lifeId = "S1_LIFE";
  symbolDefinitions[lifeId] = {
    level: 1,
    recipe: null,
    sizeMultiplier: 1.0,
    eliminationPoints: 0,
    explosionRadiusUnits: 0,
    explosionEffectLevels: [],
    isLife: true,
  };
  mandalaDefinitions[lifeId] = {
    mandalaConfig: {
      numPoints: 3,
      innerRadius: 0.2,
      spikeDistance: 0.7,
      leafType: "both",
      curveAmount: 0.6,
      fillStyle: "solid",
    },
  };

  // --- Create final, correct export arrays ---
  const L1_SYMBOLS = [...L1_REGULAR_SYMBOLS, voidId, lifeId];
  const L1_NORMAL_SYMBOLS = [...L1_REGULAR_SYMBOLS]; // L1_NORMAL_SYMBOLS is just the regular types

  return {
    symbolDefinitions,
    mandalaDefinitions,
    L1_SYMBOLS,
    L1_NORMAL_SYMBOLS,
  };
}

// --- This export section is now much cleaner and more reliable ---
const {
  symbolDefinitions: generatedSymbols,
  mandalaDefinitions: generatedMandalas,
  L1_SYMBOLS: generatedL1,
  L1_NORMAL_SYMBOLS: generatedL1Normal,
} = generateSymbolSystem(Config.MAX_SYMBOL_LEVEL);

export const symbolDefinitions = generatedSymbols;
export const mandalaDefinitions = generatedMandalas;
export const L1_SYMBOLS = generatedL1;
export const L1_NORMAL_SYMBOLS = generatedL1Normal;
