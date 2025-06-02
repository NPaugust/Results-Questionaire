"use client";

import { fetchWithAuth } from "../login";

const cache: { [key: string]: Promise<any> } = {};

const buildQueryAndCacheKey = (baseKey: string, params: { startDate?: string; endDate?: string }) => {
  const queryString = new URLSearchParams();
  if (params.startDate) queryString.append("start_date", params.startDate);
  if (params.endDate) queryString.append("end_date", params.endDate);

  const cacheKey = `${baseKey}_${queryString.toString()}`;
  return { queryString: queryString.toString(), cacheKey };
};

export const getRadarRepublicData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("radar_republic", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/radar/republic/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getRadarCourtData = async (courtId: string, params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey(`radar_court_${courtId}`, params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/radar/${courtId}/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getBarRepublicData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("bar_republic", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/bar/republic/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getBarCourtData = async (courtId: string, params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey(`bar_court_${courtId}`, params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/bar/${courtId}/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getCircleRepublicData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("circle_republic", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/circle/republic/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getCircleCourtData = async (courtId: string, params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey(`circle_court_${courtId}`, params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/circle/${courtId}/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getColumnRepublicData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("column_republic", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/column/republic/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getColumnCourtData = async (courtId: string, params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey(`column_court_${courtId}`, params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/column/${courtId}/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getProgressRepublicData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("progress_republic", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/progress/republic/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getProgressCourtData = async (courtId: string, params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey(`progress_court_${courtId}`, params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/progress/${courtId}/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getRadarRegionData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("radar_region", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/radar/region/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getBarRegionData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("bar_region", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/bar/region/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getCircleRegionData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("circle_region", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/circle/region/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getColumnRegionData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("column_region", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/column/region/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getProgressRegionData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("progress_region", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/progress/region/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getGenderAgeRepublicData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("genderage_republic", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/genderage/republic/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getGenderAgeRegionData = async (params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey("genderage_region", params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/genderage/region/?${queryString}`);
  }
  return await cache[cacheKey];
};

export const getGenderAgeCourtData = async (courtId: string, params: { startDate?: string; endDate?: string }) => {
  const { queryString, cacheKey } = buildQueryAndCacheKey(`genderage_court_${courtId}`, params);
  if (!cache[cacheKey]) {
    cache[cacheKey] = fetchWithAuth(`chart/genderage/${courtId}/?${queryString}`);
  }
  return await cache[cacheKey];
};