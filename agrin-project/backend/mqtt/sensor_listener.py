"""
AgriN MQTT Sensor Listener (Optional live ESP32 ingestion)
-----------------------------------------------------------
Subscribes to telemetry topics published by ESP32 microcontrollers
measuring real-time soil moisture (capacitive sensor), soil temperature,
and ambient humidity.
"""

from typing import Dict, Any

class SensorListener:
    """MQTT subscriber for IoT soil probes."""

    def __init__(self, broker: str = "broker.hivemq.com", port: int = 1883, topic: str = "agrin/sensors/soil"):
        self.broker = broker
        self.port = port
        self.topic = topic
        self.is_connected = False

    def start_listening(self):
        """Connects and listens to MQTT stream (stub)."""
        # Placeholder for paho-mqtt client implementation
        pass

    def get_latest_reading(self) -> Dict[str, Any]:
        """Returns the most recent probe sensor metrics."""
        return {
            "status": "idle",
            "message": "MQTT sensor listener is optional and unconfigured."
        }
