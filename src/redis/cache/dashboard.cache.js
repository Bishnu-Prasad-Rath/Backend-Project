import { getCache , setCache , deleteCache } from "./base.cache.js";

const DASHBOARD_KEY = (userId) => `dashboard:${userId}`;

const getDashboardCache = (userId) => 
    getCache(DASHBOARD_KEY(userId));

const setDashboardCache = (userId,data) =>
    setCache(DASHBOARD_KEY(userId),data,300);

const deleteDashboardCache = (userId) =>
    deleteCache(DASHBOARD_KEY(userId));

export {getDashboardCache , setDashboardCache , deleteDashboardCache}