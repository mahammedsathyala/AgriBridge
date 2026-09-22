"""
AgriN MQTT Sensor Listener (Optional live ESP32 ingestion)
-----------------------------------------------------------
Subscribes to telemetry topics published by ESP32 microcontrollers
measuring real-time soil moisture (capacitive sensor), soil temperature,
and ambient humidity.
"""

from typing import Dict, Any, Optional
import json
import threading
from datetime import datetime, timezone

try:
    import paho.mqtt.client as mqtt
    PAHO_AVAILABLE = True
except ImportError:
    PAHO_AVAILABLE = False


class SensorListener:
    """MQTT subscriber for IoT soil probes."""

    def __init__(
        self,
        broker_host: Optional[str] = None,
        port: int = 1883,
        topic: str = "agrin/sensors/soil",
        username: Optional[str] = None,
        password: Optional[str] = None
    ):
        self.broker_host = (broker_host or "").strip()
        self.port = port
        self.topic = topic
        self.username = (username or "").strip()
        self.password = (password or "").strip()
        self.is_connected = False
        self.is_configured = bool(self.broker_host)
        self.client = None
        self.app = None
        self._latest_reading: Optional[Dict[str, Any]] = None
        self._thread = None

    def start_listening(self, app=None):
        """Connects and listens to MQTT stream in a background thread if configured."""
        self.app = app
        if not self.is_configured:
            print("[MQTT] Broker host not configured. Running in NOT_CONFIGURED state.")
            return

        if not PAHO_AVAILABLE:
            print("[MQTT] paho-mqtt library not installed. MQTT listener inactive.")
            return

        def _run():
            try:
                self.client = mqtt.Client(client_id=f"agrin_server_{int(datetime.now().timestamp())}")
                if self.username and self.password:
                    self.client.username_pw_set(self.username, self.password)

                self.client.on_connect = self._on_connect
                self.client.on_message = self._on_message
                self.client.on_disconnect = self._on_disconnect

                self.client.connect(self.broker_host, self.port, keepalive=60)
                self.client.loop_forever()
            except Exception as exc:
                print(f"[MQTT] Connection failed: {exc}")
                self.is_connected = False

        self._thread = threading.Thread(target=_run, daemon=True)
        self._thread.start()

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.is_connected = True
            client.subscribe(self.topic)
            print(f"[MQTT] Connected successfully to {self.broker_host}:{self.port} on topic '{self.topic}'")
        else:
            self.is_connected = False
            print(f"[MQTT] Connection returned code {rc}")

    def _on_disconnect(self, client, userdata, rc):
        self.is_connected = False
        print(f"[MQTT] Disconnected from broker (rc={rc})")

    def _on_message(self, client, userdata, msg):
        try:
            payload_str = msg.payload.decode("utf-8")
            data = json.loads(payload_str)
            self._latest_reading = {
                "status": "LIVE",
                "received_at": datetime.now(timezone.utc).isoformat(),
                "topic": msg.topic,
                "payload": data
            }

            # Persist to SQLite database if app context is available
            if self.app:
                from models import db, SensorTelemetry
                with self.app.app_context():
                    device_id = data.get("device_id", "AGRI-ESP32-MQTT")
                    farm_id = data.get("farm_id", "sathyala-farm-001")
                    soil_moisture = float(data.get("soil_moisture_pct", 35.0))
                    soil_temp = float(data.get("soil_temperature_c", 29.0))
                    amb_temp = float(data.get("ambient_temperature_c", 32.0))
                    humidity = float(data.get("humidity_pct", 68.0))
                    battery = float(data.get("battery_pct", 88.0))

                    record = SensorTelemetry(
                        device_id=device_id,
                        farm_id=farm_id,
                        soil_moisture_pct=soil_moisture,
                        soil_temperature_c=soil_temp,
                        ambient_temperature_c=amb_temp,
                        humidity_pct=humidity,
                        battery_pct=battery,
                        signal_strength_dbm=data.get("signal_strength_dbm", "-65 dBm"),
                        recorded_at=datetime.now(timezone.utc)
                    )
                    db.session.add(record)
                    db.session.commit()
                    print(f"[MQTT] Persisted telemetry from {device_id} into SensorTelemetry")
        except Exception as err:
            print(f"[MQTT] Error handling message: {err}")

    def get_latest_reading(self) -> Dict[str, Any]:
        """Returns the most recent probe sensor metrics or configuration status."""
        if not self.is_configured:
            return {
                "status": "NOT_CONFIGURED",
                "is_configured": False,
                "is_connected": False,
                "message": "MQTT sensor listener is optional and not configured."
            }

        if not self.is_connected:
            return {
                "status": "OFFLINE",
                "is_configured": True,
                "is_connected": False,
                "broker": self.broker_host,
                "message": "MQTT broker configured but currently disconnected."
            }

        return {
            "status": "LIVE",
            "is_configured": True,
            "is_connected": True,
            "broker": self.broker_host,
            "topic": self.topic,
            "latest_reading": self._latest_reading
        }


# Global singleton listener instance
sensor_listener = SensorListener()
