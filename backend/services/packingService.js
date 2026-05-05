import DBAbstraction from "../db.js";
import weatherService from "./weatherService.js";
import activityService from "./activityService.js";
import { buildTripConditions, rankItems, partitionItems } from "./packingEngine.js";

const db = new DBAbstraction();

export const createPackingListForTrip = async (tripId, userId) => {

  // 1. get trip + destinations in parallel
  const [trip, destinations] = await Promise.all([
    db.getTripDetailsById(tripId, userId),
    db.getDestinationsByTrip(tripId, userId),
  ]);

  if (!trip) throw new Error("Trip not found");
  if (!destinations?.length) throw new Error("No destinations found for this trip");

  // 2. calculate trip duration from dates
  const tripDays = Math.max(
    1,
    Math.round((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + 1
  );

  // 3. get weather + activities for all destinations in parallel
  const [weatherResults, activityResults] = await Promise.all([
    Promise.all(destinations.map(d => weatherService.getWeatherForDestination(d))),
    Promise.all(destinations.map(d => activityService.getActivitiesForDestination(d.destination_id))),
  ]);

  // 4. flatten and derive weather tags
  const weatherTags = new Set(
    weatherResults
      .flatMap(w => w.dailyWeather)
      .flatMap(day => weatherService.getWeatherTags(day))
  );

  // 5. flatten activities
  const allActivities = activityResults.flat();

  // 6. get closet items
  const closetItems = await db.getClosetItemsByUser(userId);

  if (!closetItems?.length) throw new Error("No closet items found for this user");

  // 7. build conditions and score via engine
  const conditions = buildTripConditions([...weatherTags], allActivities);
  const ranked = rankItems(closetItems, conditions, tripDays);
  const { recommended, notRecommended } = partitionItems(ranked);

  // 8. save to DB
  await db.createPackingList(tripId, userId, recommended, conditions);

  return { recommended, notRecommended, conditions };
};