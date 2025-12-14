import { TrackPoint } from '@/types';

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Compute haversine distance between two coordinates in meters.
 */
export const haversineDistanceMeters = (a: TrackPoint, b: TrackPoint): number => {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_METERS * c;
};

/**
 * Sum haversine distances across a list of track points.
 */
export const accumulateDistanceMeters = (points: TrackPoint[]): number => {
  if (points.length < 2) return 0;

  let distance = 0;
  for (let i = 1; i < points.length; i += 1) {
    distance += haversineDistanceMeters(points[i - 1], points[i]);
  }
  return distance;
};

/**
 * Calculate pace (seconds per km) from distance and duration.
 */
export const calculatePaceSecondsPerKm = (
  distanceMeters: number,
  durationMs: number,
): number | null => {
  if (distanceMeters <= 0 || durationMs <= 0) return null;
  const km = distanceMeters / 1000;
  const seconds = durationMs / 1000;
  return seconds / km;
};
