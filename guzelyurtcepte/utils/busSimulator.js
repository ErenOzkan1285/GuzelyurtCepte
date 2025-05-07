// utils/busSimulator.js

// Bus stops
export const stops = [
  { latitude: 35.1846, longitude: 33.3820 },
  { latitude: 35.1850, longitude: 33.3825 },
  { latitude: 35.1855, longitude: 33.3830 },
  { latitude: 35.1860, longitude: 33.3835 },
];

// Route (same as stops + extra points for smooth movement)
export const route = [
  { latitude: 35.1846, longitude: 33.3820 },
  { latitude: 35.1848, longitude: 33.3822 },
  { latitude: 35.1850, longitude: 33.3825 },
  { latitude: 35.1853, longitude: 33.3828 },
  { latitude: 35.1855, longitude: 33.3830 },
  { latitude: 35.1858, longitude: 33.3832 },
  { latitude: 35.1860, longitude: 33.3835 },
];

export function animateBus(animatedRegion, delay = 1000) {
  let index = 1;
  const interval = setInterval(() => {
    if (index >= route.length) index = 0;
    const next = route[index++];
    animatedRegion.timing({
      latitude: next.latitude,
      longitude: next.longitude,
      duration: delay,
      useNativeDriver: false,
    }).start();
  }, delay);

  return interval;
}
