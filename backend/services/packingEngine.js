// given weather + activities + items -> decide what to recommend 
// contains all logic rules for the packing list generation 

const INCLUSION_THRESHOLD = 2;

const QUANTITY_CONFIG = {
  tops:        { perDays: 2, activityBonus: { active: 1, formal: 1, beach: 1 } },
  bottoms:     { perDays: 3, activityBonus: { active: 1, formal: 1 } },
  dresses:     { perDays: 4, activityBonus: { formal: 1, beach: 1 } },
  outerwear:   { perDays: 7, activityBonus: { hiking: 1 } },
  footwear:    { perDays: 5, activityBonus: { active: 1, formal: 1, hiking: 1 } },
  accessories: { perDays: 5, activityBonus: { formal: 1, beach: 1 } },
};

const ACTIVITY_NAME_TO_TAGS = {
  "hiking":      ["hiking", "outdoors", "active"],
  "beach":       ["beach", "active"],
  "swimming":    ["beach", "active"],
  "sightseeing": ["casual", "outdoors"],
  "business":    ["business", "formal"],
  "fine dining": ["formal"],
  "camping":     ["hiking", "outdoors", "active"],
  "skiing":      ["active", "outdoors"],
  "yoga":        ["active"],
  "nightlife":   ["formal", "casual"],
  "shopping":    ["casual"],
};

const ACTIVITY_SUBCATEGORY_MATCHES = {
  active:   ["T-Shirt", "Tank Top", "Shorts", "Leggings", "Sneakers"],
  outdoors: ["Windbreaker", "Rain Jacket", "Coat", "Boots", "Hat", "Scarf", "Gloves"],
  hiking:   ["Windbreaker", "Rain Jacket", "Boots", "Leggings", "Gloves", "Hat"],
  formal:   ["Evening Dress", "Casual Dress", "Boots", "Sneakers"],
  beach:    ["Tank Top", "Shorts", "Casual Dress", "Sandals", "Hat"],
  business: ["Long Sleeve", "Sweater", "Jeans", "Boots", "Sneakers"],
  casual:   ["T-Shirt", "Tank Top", "Long Sleeve", "Jeans", "Shorts", "Casual Dress", "Sneakers", "Sandals"],
};

const WEATHER_SUBCATEGORY_SCORES = {
  very_cold: { subcategories: ["Coat", "Sweater", "Long Sleeve", "Boots", "Gloves", "Scarf", "Hat", "Leggings"], bonus: 3 },
  cold:      { subcategories: ["Coat", "Windbreaker", "Sweater", "Long Sleeve", "Boots", "Gloves", "Scarf", "Hat"], bonus: 2 },
  mild:      { subcategories: ["Long Sleeve", "Sweater", "Windbreaker", "Jeans", "Leggings", "Sneakers", "Boots"], bonus: 1 },
  warm:      { subcategories: ["T-Shirt", "Tank Top", "Shorts", "Skirt", "Casual Dress", "Sneakers", "Sandals"], bonus: 2 },
  hot:       { subcategories: ["Tank Top", "Shorts", "Skirt", "Casual Dress", "Evening Dress", "Sandals", "Hat"], bonus: 2 },
};

const WEATHER_MATERIAL_SCORES = {
  very_cold: { materials: ["Wool", "Cashmere", "Flannel", "Fur"],  bonus: 2 },
  cold:      { materials: ["Wool", "Cashmere", "Flannel", "Fur"],  bonus: 1 },
  warm:      { materials: ["Cotton", "Linen", "Nylon"],            bonus: 1 },
  hot:       { materials: ["Cotton", "Linen", "Spandex"],          bonus: 2 },
  rainy:     { materials: ["Nylon", "Polyester"],                  bonus: 1 },
};

// derive packing tags from activity names coming out of your DB
export const getActivityTags = (activities) => {
  const tags = new Set();
  for (const activity of activities) {
    const name = activity.name?.toLowerCase().trim();
    const mapped = ACTIVITY_NAME_TO_TAGS[name] ?? [];
    mapped.forEach(tag => tags.add(tag));
  }
  return [...tags];
};

export const buildTripConditions = (weatherTags, activities) => {
  return {
    weather: weatherTags,
    activityTags: getActivityTags(activities),
  };
};

export const scoreItem = (item, conditions) => {
  let score = 0;
  const subcategory = item.item_subcategory ?? "";
  const material = item.material ?? "";

  // weather: subcategory bonuses
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

  // weather: warmth_level
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
    if (item.warmth_level <= 3) score += 2;
    else if (item.warmth_level <= 5) score += 1;
  }

  // weather: waterproofing
  if (conditions.weather.includes("rainy")) {
    if (item.is_waterproof) score += 3;
  }

  if (conditions.weather.includes("slightly_rainy")) {
    if (item.is_waterproof) score += 1;
  }

  // activities: exact subcategory match
  for (const actTag of conditions.activityTags) {
    const matchingSubs = ACTIVITY_SUBCATEGORY_MATCHES[actTag] ?? [];
    if (matchingSubs.includes(subcategory)) score += 2;
  }

  return score;
};

export const getSuggestedQuantity = (item, tripDays, activityTags) => {
  const config = QUANTITY_CONFIG[item.category];
  if (!config) return 1;

  let quantity = Math.ceil(tripDays / config.perDays);

  for (const [actTag, bonus] of Object.entries(config.activityBonus)) {
    if (activityTags.includes(actTag)) quantity += bonus;
  }

  return Math.max(quantity, 1); // always at least 1 if recommended
};

export const rankItems = (items, conditions, tripDays = 1) => {
  return items
    .map(item => ({
      ...item,
      score: scoreItem(item, conditions),
      suggestedQuantity: getSuggestedQuantity(item, tripDays, conditions.activityTags),
    }))
    .sort((a, b) => b.score - a.score);
};

export const partitionItems = (rankedItems) => {
  return {
    recommended: rankedItems.filter(i => i.score >= INCLUSION_THRESHOLD),
    notRecommended: rankedItems.filter(i => i.score < INCLUSION_THRESHOLD),
  };
};