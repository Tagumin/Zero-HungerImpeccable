import urllib.request, json

body = json.dumps({"crop": "banana", "algorithm": "GA", "iterations": 50}).encode()
req = urllib.request.Request(
    "http://127.0.0.1:5001/optimize",
    data=body,
    headers={"Content-Type": "application/json"}
)
resp = urllib.request.urlopen(req).read().decode()
data = json.loads(resp)
print("Keys:", list(data.keys()))
print("water_r:", data.get("water_r"))
print("fert_r:", data.get("fert_r"))
print("labor_r:", data.get("labor_r"))
print("water_pct:", data.get("water_pct"))
