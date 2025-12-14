const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
const BITS = [16, 8, 4, 2, 1];
const EARTH_RADIUS_KM = 6371;

const base32Map = BASE32.split('').reduce<Record<string, number>>((memo, char, index) => {
  memo[char] = index;
  return memo;
}, {});

const clampLatitude = (latitude: number): number => Math.max(-90, Math.min(90, latitude));

const normalizeLongitude = (longitude: number): number => {
  let lng = longitude % 360;
  if (lng > 180) lng -= 360;
  if (lng < -180) lng += 360;
  return lng;
};

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DecodedGeohash extends Coordinates {
  error: {
    latitude: number;
    longitude: number;
  };
}

export interface BoundingBox {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

export const encodeGeohash = (latitude: number, longitude: number, precision = 12): string => {
  const targetPrecision = Math.max(1, Math.min(precision, 12));
  let latRange: [number, number] = [-90, 90];
  let lngRange: [number, number] = [-180, 180];

  let hash = '';
  let isEven = true;
  let bit = 0;
  let charValue = 0;

  const lat = clampLatitude(latitude);
  const lng = normalizeLongitude(longitude);

  while (hash.length < targetPrecision) {
    const range = isEven ? lngRange : latRange;
    const mid = (range[0] + range[1]) / 2;

    if ((isEven ? lng : lat) >= mid) {
      charValue |= BITS[bit];
      range[0] = mid;
    } else {
      range[1] = mid;
    }

    isEven = !isEven;

    if (bit < 4) {
      bit += 1;
    } else {
      hash += BASE32[charValue];
      bit = 0;
      charValue = 0;
    }
  }

  return hash;
};

export const decodeGeohash = (hash: string): DecodedGeohash => {
  let latRange: [number, number] = [-90, 90];
  let lngRange: [number, number] = [-180, 180];
  let isEven = true;

  for (const char of hash.toLowerCase()) {
    const value = base32Map[char];
    if (value === undefined) {
      throw new Error(`Invalid geohash character: ${char}`);
    }

    for (const mask of BITS) {
      if (isEven) {
        const mid = (lngRange[0] + lngRange[1]) / 2;
        if ((value & mask) !== 0) {
          lngRange[0] = mid;
        } else {
          lngRange[1] = mid;
        }
      } else {
        const mid = (latRange[0] + latRange[1]) / 2;
        if ((value & mask) !== 0) {
          latRange[0] = mid;
        } else {
          latRange[1] = mid;
        }
      }
      isEven = !isEven;
    }
  }

  return {
    latitude: (latRange[0] + latRange[1]) / 2,
    longitude: (lngRange[0] + lngRange[1]) / 2,
    error: {
      latitude: latRange[1] - latRange[0],
      longitude: lngRange[1] - lngRange[0],
    },
  };
};

export const geohashBoundingBox = (
  latitude: number,
  longitude: number,
  radiusKm: number,
): BoundingBox => {
  const lat = clampLatitude(latitude);
  const lng = normalizeLongitude(longitude);
  const angularDistance = radiusKm / EARTH_RADIUS_KM;

  const latDelta = (angularDistance * 180) / Math.PI;
  const lngDelta = (angularDistance * 180) / (Math.PI * Math.cos(toRadians(lat)) || 1e-9);

  return {
    minLatitude: clampLatitude(lat - latDelta),
    maxLatitude: clampLatitude(lat + latDelta),
    minLongitude: normalizeLongitude(lng - lngDelta),
    maxLongitude: normalizeLongitude(lng + lngDelta),
  };
};

export const distanceBetweenCoordinatesKm = (a: Coordinates, b: Coordinates): number => {
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_KM * c;
};

export const distanceBetweenCoordinatesMeters = (a: Coordinates, b: Coordinates): number =>
  distanceBetweenCoordinatesKm(a, b) * 1000;
