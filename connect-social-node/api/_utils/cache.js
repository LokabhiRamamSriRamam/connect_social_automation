// Simple in-memory cache
const cache = {};

export function setCache(key, value) {
  cache[key] = value;
}

export function getCache(key) {
  return cache[key];
}

export function deleteCache(key) {
  delete cache[key];
}
