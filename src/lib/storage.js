import { useState, useEffect } from 'react';

// Boshqa saytlar bilan kalitlar aralashib ketmasligi uchun prefiks
const PREFIX = 'ustozpanel:';

export function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (err) {
    console.error('storage.get xatosi:', key, err);
    return fallback;
  }
}

export function set(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    // Odatda joy tugaganda (~5 MB) shu xato chiqadi
    console.error('storage.set xatosi:', key, err);
    return false;
  }
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

// useState + useEffect bilan bog'lash: qiymat o'zgarsa, avtomatik saqlanadi
export function useStorage(key, initialValue) {
  const [value, setValue] = useState(() => get(key, initialValue));

  useEffect(() => {
    set(key, value);
  }, [key, value]);

  return [value, setValue];
}