export const defaultFarmData = {
  id: "farm-in-ap-001",
  farmerName: "Sathyala Farmer",
  farmerId: "FMR-IN-AP-7729",
  farmName: "Sathyala Farm",
  location: "Kurnool, Andhra Pradesh, India",
  coordinates: {
    lat: 15.8192,
    lng: 78.1526,
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
    [16.074847, 77.994690],
    [15.683865, 77.563477],
    [15.530437, 78.376465],
    [15.987734, 78.675842],
  ],

  // GeoJSON Specification
  geoJson: {
    type: "LineString",
    coordinates: [
      [77.99469, 16.074847],
      [77.563477, 15.683865],
      [78.376465, 15.530437],
      [78.675842, 15.987734]
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
