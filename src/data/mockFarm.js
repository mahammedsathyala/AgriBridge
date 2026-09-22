export const defaultFarmData = {
  id: "farm-in-ap-001",
  farmerName: "Sathyala Farmer",
  farmerId: "FMR-IN-AP-7729",
  farmName: "Sathyala Farm",
  location: "Kadapa, Andhra Pradesh, India",
  coordinates: {
    lat: 14.7384,
    lng: 78.9928,
  },
  areaAcres: 2.5,
  crop: "Groundnut",
  cropVariety: "K6 (Kadiri-6)",
  sowingDate: "2026-08-07",
  cropAgeDays: 42,
  growthStage: "Flowering & Peg Initiation",
  soilType: "Red loamy soil",
  irrigationType: "Borewell with Micro-Drip",
  healthStatus: "Moderate",
  cropHealthScore: 78,
  soilMoisturePercent: 34,
  rainfallForecastMm: 18,
  diseaseRisk: "Medium",
  lastUpdated: "Today at 06:15 PM",

  // IoT Sensor Telemetry
  sensorNode: {
    id: "AGRI-ESP32-001",
    status: "online",
    batteryPercent: 86,
    lastSync: "8 mins ago",
    soilMoisture: 34,
    soilTemp: 29.4,
    ambientTemp: 32.1,
    humidity: 68,
    signalStrength: "-68 dBm",
  },

  // Plot polygon coordinates for visualization [lat, lng]
  boundaryPolygon: [
    [14.745709, 78.992772],
    [14.736329, 78.979039],
    [14.729979, 78.995132],
    [14.741392, 79.004445],
  ],

  // GeoJSON Specification
  geoJson: {
    type: "LineString",
    coordinates: [
      [78.992772, 14.745709],
      [78.979039, 14.736329],
      [78.995132, 14.729979],
      [79.004445, 14.741392]
    ]
  },

  // Satellite Telemetry Indicators
  satellite: {
    provider: "Sentinel-2 L2A & Landsat-9",
    resolution: "10m Multispectral",
    ndvi: 0.68,
    evi: 0.54,
    ndwi: 0.22,
    cloudCoverage: "8%",
    lastPassDate: "2026-09-17",
  },
};
