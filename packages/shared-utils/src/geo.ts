import ngeohash from 'ngeohash';

const EARTH_RADIUS_M = 6_371_000;

export function geohash(lat: number, lng: number, precision = 9): string {
  return ngeohash.encode(lat, lng, precision);
}

export function geohashNeighbors(hash: string): string[] {
  return [hash, ...ngeohash.neighbors(hash)];
}

/**
 * Haversine distance in meters.
 */
export function haversineDistance(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/** Plaksha campus approximate bounding box for sanity-checking incoming coordinates. */
export const PLAKSHA_BBOX = {
  minLat: 30.66,
  maxLat: 30.7,
  minLng: 76.78,
  maxLng: 76.82,
} as const;

export function isWithinCampus(lat: number, lng: number): boolean {
  return (
    lat >= PLAKSHA_BBOX.minLat &&
    lat <= PLAKSHA_BBOX.maxLat &&
    lng >= PLAKSHA_BBOX.minLng &&
    lng <= PLAKSHA_BBOX.maxLng
  );
}
