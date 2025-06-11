
import { Timestamp, GeoPoint, FieldValue } from 'firebase/firestore';

// Helper to check if a value is a Firestore Timestamp
function isTimestamp(value: any): value is Timestamp {
  return value && typeof value.toDate === 'function';
}

// Helper to check if a value is a Firestore GeoPoint
function isGeoPoint(value: any): value is GeoPoint {
  return value && typeof value.latitude === 'number' && typeof value.longitude === 'number';
}

// Helper to check if a value is a Firestore FieldValue (e.g., serverTimestamp, arrayUnion)
function isFieldValue(value: any): value is FieldValue {
  // FieldValue is an opaque type, this is a basic check
  return value && typeof value.isEqual === 'function'; // A common method on FieldValue
}

export function makeSerializable<T>(data: T): any {
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }

  if (isTimestamp(data)) {
    return data.toDate().toISOString(); // Convert Timestamp to ISO string
  }

  if (isGeoPoint(data)) {
    return { latitude: data.latitude, longitude: data.longitude }; // Convert GeoPoint
  }

  if (isFieldValue(data)) {
    // FieldValues like serverTimestamp() are for write operations.
    // If read, they'd be Timestamps. If found raw in client-bound data, it's likely an error.
    return null; 
  }

  if (Array.isArray(data)) {
    return data.map(item => makeSerializable(item));
  }

  // For general objects, recurse through their properties
  const res: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      res[key] = makeSerializable((data as { [key: string]: any })[key]);
    }
  }
  return res;
}
