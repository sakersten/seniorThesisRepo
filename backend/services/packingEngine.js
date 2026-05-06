// given weather + activities + items -> decide what to recommend 
// contains all logic rules for the packing list generation 

// minimum score an item needs to be included in the recommended packing list
// raise this value to make recommendations more selective, lower it to include more items
const INCLUSION_THRESHOLD = 2;

// how many of each category to pack based on trip duration and activities
const QUANTITY_CONFIG = {
  tops:        { perDays: 2, activityBonus: { active: 1, water: 1 } },
  bottoms:     { perDays: 3, activityBonus: { active: 1 } },
  dresses:     { perDays: 4, activityBonus: { comfortable: 1 } },
  outerwear:   { perDays: 7, activityBonus: { outdoors: 1, snow: 2 } },
  footwear:    { perDays: 5, activityBonus: { active: 1, outdoors: 1 } },
  accessories: { perDays: 5, activityBonus: { outdoors: 1, snow: 2 } },
};

// maps activity tags to subcategories that score well for that activity
const ACTIVITY_SUBCATEGORY_MATCHES = {
  active:      ["T-Shirt", "Tank Top", "Shorts", "Leggings", "Sneakers", "Windbreaker"],
  outdoors:    ["Windbreaker", "Rain Jacket", "Coat", "Boots", "Baseball Hat", "Scarf", "Gloves"],
  water:       ["Sandals", "Short Dress", "Shorts", "Tank Top"],
  snow:        ["Coat", "Windbreaker", "Leggings", "Boots", "Gloves", "Scarf", "Beanie"],
  comfortable: ["T-Shirt", "Long Sleeve", "Leggings", "Shorts", "Sneakers", "Midi Dress"],
};

// maps activity tags to subcategories that score well for that activity
const WEATHER_SUBCATEGORY_SCORES = {
  very_cold: { subcategories: ["Coat", "Sweater", "Long Sleeve", "Boots", "Gloves", "Scarf", "Beanie", "Leggings"], bonus: 3 },
  cold:      { subcategories: ["Coat", "Windbreaker", "Sweater", "Long Sleeve", "Boots", "Gloves", "Scarf", "Beanie"], bonus: 2 },
  mild:      { subcategories: ["Long Sleeve", "Sweater", "Windbreaker", "Jeans", "Leggings", "Sneakers", "Boots"], bonus: 1 },
  warm:      { subcategories: ["T-Shirt", "Tank Top", "Shorts", "Skirt", "Short Dress", "Midi Dress", "Long Dress", "Sneakers", "Sandals"], bonus: 2 },
  hot:       { subcategories: ["Tank Top", "Shorts", "Skirt", "Short Dress", "Midi Dress", "Long Dress", "Sandals", "Baseball Hat"], bonus: 2 },
};

// maps weather tags to materials that score well for that weather condition
const WEATHER_MATERIAL_SCORES = {
  very_cold: { materials: ["Wool", "Cashmere", "Flannel", "Fur"],  bonus: 2 },
  cold:      { materials: ["Wool", "Cashmere", "Flannel", "Fur"],  bonus: 1 },
  warm:      { materials: ["Cotton", "Linen", "Nylon"],            bonus: 1 },
  hot:       { materials: ["Cotton", "Linen", "Spandex"],          bonus: 2 },
  rainy:     { materials: ["Nylon", "Polyester"],                  bonus: 1 },
};

// maps activity tags to formality levels that score well for that activity
const FORMALITY_TAG_MAP = {
  "active":          ["Athletic"],
  "comfortable":     ["Casual", "Athletic"],
  "water":           ["Athletic"],
  "snow":            ["Athletic"],
  "formal":          ["Formal"],
  "business-casual": ["Business Casual", "Formal"]
}

// read tags directly from the activities DB column
export const getActivityTags = (activities) => {
  const tags = new Set();
  for (const activity of activities) {
    if (!activity.tags) continue;
    const tagData = typeof activity.tags === "string"
      ? JSON.parse(activity.tags)
      : activity.tags;
    if (Array.isArray(tagData.tags)) {
      tagData.tags.forEach(tag => tags.add(tag));
    }
  }
  return [...tags];
};

// builds the conditions object that the engine uses to score items
// combines weather tags and activity tags into a single context object
export const buildTripConditions = (weatherTags, activities) => {
  return {
    weather: weatherTags,
    activityTags: getActivityTags(activities),
  };
};

// scores a single closet item against the trip conditions
// higher score = better match for the trip's weather and activities
export const scoreItem = (item, conditions) => {
  let score = 0;
  const subcategory = item.item_subcategory ?? "";
  const material = item.material ?? "";
  const formality = item.formality ?? "";

  // subcategory and material bonuses based on weather tags
  for (const weatherTag of conditions.weather) {
    const subcatRule = WEATHER_SUBCATEGORY_SCORES[weatherTag];
    if (subcatRule?.subcategories.includes(subcategory)) {
      score += subcatRule.bonus;
    }

    const matRule = WEATHER_MATERIAL_SCORES[weatherTag];
    if (matRule?.materials.includes(material)) {
      score += matRule.bonus;
    }
  }

  // warmth level scoring based on temperature tags
  if (conditions.weather.includes("very_cold")) {
    if (item.warmth_level >= 8) score += 4;
    else if (item.warmth_level >= 6) score += 2;
  }

  if (conditions.weather.includes("cold")) {
    if (item.warmth_level >= 7) score += 3;
    else if (item.warmth_level >= 5) score += 1;
    if (item.is_layerable) score += 1;
  }

  if (conditions.weather.includes("mild")) {
    if (item.warmth_level >= 4 && item.warmth_level <= 7) score += 1;
  }

  if (conditions.weather.includes("warm") || conditions.weather.includes("hot")) {
    if (item.item_category?.toLowerCase() !== "outerwear") {
      if (item.warmth_level <= 3) score += 2;
      else if (item.warmth_level <= 5) score += 1;
    }
  }

  // waterproofing bonus based on precipitation tags
  if (conditions.weather.includes("rainy")) {
    if (item.is_waterproof) score += 3;
  }

  if (conditions.weather.includes("slightly_rainy")) {
    if (item.is_waterproof) score += 1;
  }

  // subcategory bonus based on activity tags
  for (const actTag of conditions.activityTags) {
    const matchingSubs = ACTIVITY_SUBCATEGORY_MATCHES[actTag] ?? [];
    if (matchingSubs.includes(subcategory)) score += 2;
  }

  // formality bonus based on activity tags
  for (const actTag of conditions.activityTags) {
    const matchingFormalities = FORMALITY_TAG_MAP[actTag] ?? [];
    if (matchingFormalities.includes(formality)) score += 3;
  }

  return score;
};

// calculates how many of a given item to pack based on trip duration and activities
export const getSuggestedQuantity = (item, tripDays, activityTags) => {
  const config = QUANTITY_CONFIG[item.item_category?.toLowerCase()];
  if (!config) return 1;

  let quantity = Math.ceil(tripDays / config.perDays);

  for (const [actTag, bonus] of Object.entries(config.activityBonus)) {
    if (activityTags.includes(actTag)) quantity += bonus;
  }

  return Math.max(quantity, 1); // always at least 1 if recommended
};

// scores and ranks all closet items against the trip conditions, and attaches score and suggested quantity to each item
export const rankItems = (items, conditions, tripDays = 1) => {
  return items
    .map(item => ({
      ...item,
      score: scoreItem(item, conditions)
    }))
    .sort((a, b) => b.score - a.score);
};

// splits ranked items into recommended and not recommended based on inclusion threshold
export const partitionItems = (rankedItems) => {
  return {
    recommended: rankedItems.filter(i => i.score >= INCLUSION_THRESHOLD),
    notRecommended: rankedItems.filter(i => i.score < INCLUSION_THRESHOLD),
  };
};