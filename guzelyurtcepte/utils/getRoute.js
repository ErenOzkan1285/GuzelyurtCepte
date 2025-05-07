export const getRouteFromORS = async (waypoints, apiKey) => {
  // ORS wants [lon, lat]
  const coords = waypoints.map(wp => [wp.longitude, wp.latitude]);

  const res = await fetch(
    'https://api.openrouteservice.org/v2/directions/cycling-road/geojson',
    {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: coords,
        instructions: false,
      }),
    }
  );

  if (!res.ok) {
    console.error('ORS error', res.status, res.statusText);
    return [];
  }

  const data = await res.json();
  const feat = data.features[0];

  // LOG for sanity
  console.log('🔶 ORS geometry type:', feat.geometry.type);
  console.log('🔶 ORS raw coords sample:', JSON.stringify(feat.geometry.coordinates.slice(0,5), null, 2));

  // If it ever becomes MultiLineString, flatten it
  const rawLines = feat.geometry.type === 'MultiLineString'
    ? feat.geometry.coordinates.flat()
    : feat.geometry.coordinates;

  // map [lon,lat] ➔ {latitude,longitude}
  return rawLines.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
};
