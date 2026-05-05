// service: fetches activities for a given destination (used in packing logic)
// current flow: controller -> service -> db

import DBAbstraction from "../db.js"; 
const db = new DBAbstraction(); 

// ============================================
// ACTIVITIES
// ============================================
// get all activities 
export const getActivities = async () => {
  return await db.getActivities();
};

// ============================================
// ACTIVITY DETAILS
// ============================================
// add a new activity to a destination
export const addActivitiesToDestination = async (destinationId, activityIds) => {
  return await db.addActivitiesToDestination(destinationId, activityIds);
};

// get all activities for a destination 
export const getActivitiesForDestination = async (destinationId) => {
  return await db.getActivitiesForDestination(destinationId);
};

export default {
  getActivities, 
  addActivitiesToDestination, 
  getActivitiesForDestination
}; 