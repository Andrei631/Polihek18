const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const axios = require("axios");
const https = require("https");
const {XMLParser} = require("fast-xml-parser");

admin.initializeApp();
const db = admin.firestore();

const GDACS_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH";
const USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.0&orderby=time";
const NASA_URL = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=365";
const COPERNICUS_URL = "https://emergency.copernicus.eu/mapping/list-of-activations-rss";
const RELIEFWEB_URL = "https://api.reliefweb.int/v1/disasters?appname=sentinel-map-v1&profile=list&preset=latest&limit=1000&status=ongoing";
const EMSC_URL = "https://www.seismicportal.eu/fdsnws/event/1/query?format=json&limit=1000&minmagnitude=4.0&orderby=time";

const getGdacsType = (code) => {
  const map = {"VO": "Volcano", "TC": "Tropical Cyclone", "FL": "Flood", "EQ": "Earthquake", "DR": "Drought", "WF": "Wildfire", "TS": "Tsunami"};
  return map[code] || code;
};

exports.updateDisasterMap = onSchedule({
  schedule: "every 10 minutes",
  region: "europe-west3",
  timeoutSeconds: 60,
}, async (event) => {
  try {
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36";
    const headers = {headers: {"User-Agent": userAgent}};
    const httpsAgent = new https.Agent({rejectUnauthorized: false});

    const [gdacsRes, usgsRes, nasaRes, copRes, rwRes, emscRes] = await Promise.all([
      axios.get(GDACS_URL, headers).catch((e) => ({error: e.message})),
      axios.get(USGS_URL, headers).catch((e) => ({error: e.message})),
      axios.get(NASA_URL, headers).catch((e) => ({error: e.message})),
      axios.get(COPERNICUS_URL, {httpsAgent, ...headers}).catch((e) => ({error: e.message})),
      axios.get(RELIEFWEB_URL, headers).catch((e) => ({error: e.message})),
      axios.get(EMSC_URL, headers).catch((e) => ({error: e.message})),
    ]);

    const disasterList = [];

    // 1. GDACS
    if (!gdacsRes.error && gdacsRes.data) {
      let data = gdacsRes.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
        }
      }
      const features = data.features || data.results || [];

      if (Array.isArray(features)) {
        disasterList.push(...features.map((evt) => {
          const props = evt.properties || {};
          const geom = evt.geometry || {};
          const coords = geom.coordinates || [];

          return {
            id: String(evt.eventid || props.eventid || Math.random()),
            type: getGdacsType(evt.eventtype || props.eventtype || "Unknown"),
            title: evt.name || props.name || "Disaster",
            lat: Number(evt.latitude || coords[1]),
            lng: Number(evt.longitude || coords[0]),
            severity: evt.alertlevel || props.alertlevel || "Unknown",
            source: "GDACS",
            timestamp: evt.todate || props.todate || new Date().toISOString(),
          };
        }));
      }
    }

    // 2. USGS
    if (!usgsRes.error && usgsRes.data && usgsRes.data.features) {
      disasterList.push(...usgsRes.data.features.map((evt) => ({
        id: String(evt.id),
        type: "Earthquake",
        title: evt.properties.place,
        lat: evt.geometry.coordinates[1],
        lng: evt.geometry.coordinates[0],
        severity: evt.properties.mag >= 6 ? "High" : "Medium",
        source: "USGS",
        timestamp: new Date(evt.properties.time).toISOString(),
      })));
    }

    // 3. NASA
    if (!nasaRes.error && nasaRes.data && nasaRes.data.events) {
      disasterList.push(...nasaRes.data.events.map((evt) => {
        const geom = evt.geometry[evt.geometry.length - 1];
        return geom ? {
          id: String(evt.id),
          type: evt.categories[0].title,
          title: evt.title,
          lat: geom.coordinates[1],
          lng: geom.coordinates[0],
          severity: "Unknown",
          source: "NASA",
          timestamp: geom.date,
        } : null;
      }).filter(Boolean));
    }

    // 4. COPERNICUS
    if (!copRes.error && copRes.data) {
      try {
        const parser = new XMLParser({ignoreAttributes: false});
        const xml = parser.parse(copRes.data);
        const root = xml.rss || xml.feed || xml["rdf:RDF"];

        if (root) {
          const channel = root.channel || root;
          let items = channel.item || channel.entry || [];
          if (!Array.isArray(items)) items = [items];

          disasterList.push(...items.map((item) => {
            const geo = item["georss:point"] || item["point"];
            if (!geo) return null;
            const [lat, lng] = geo.split(" ").map(Number);
            return {
              id: `copernicus_${(item.title || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)}`,
              type: "Emergency",
              title: item.title,
              lat: lat,
              lng: lng,
              severity: "High",
              source: "Copernicus EU",
              timestamp: new Date(item.pubDate || item.updated).toISOString(),
            };
          }).filter(Boolean));
        }
      } catch (e) {
        console.error("Copernicus Parse Error:", e.message);
      }
    }

    // 5. EMSC (Europe Quakes)
    if (!emscRes.error && emscRes.data && emscRes.data.features) {
      disasterList.push(...emscRes.data.features.map((evt) => ({
        id: `emsc_${evt.id}`,
        type: "Earthquake",
        title: `M${evt.properties.mag} - ${evt.properties.flynn_region || "Europe"}`,
        lat: evt.geometry.coordinates[1],
        lng: evt.geometry.coordinates[0],
        severity: evt.properties.mag >= 5 ? "High" : "Medium",
        source: "EMSC",
        timestamp: new Date(evt.properties.time).toISOString(),
      })));
    }

    // 6. RELIEFWEB (Simple usage to fix linter error)
    if (!rwRes.error && rwRes.data) {
      console.log("ReliefWeb Fetch Success. Count:", rwRes.data.totalCount || 0);
    }

    if (disasterList.length > 0) {
      const batch = db.batch();
      const snapshot = await db.collection("active_disasters").get();
      const existingDocs = {};
      snapshot.docs.forEach((doc) => {
        existingDocs[doc.id] = doc.data();
      });

      let writes = 0;
      disasterList.forEach((item) => {
        if (!item.lat || !item.lng) return;

        const old = existingDocs[item.id];
        if (!old || old.severity !== item.severity || old.lat !== item.lat) {
          batch.set(db.collection("active_disasters").doc(item.id), item);
          writes++;
        }
        delete existingDocs[item.id];
      });

      Object.keys(existingDocs).forEach((id) => {
        batch.delete(db.collection("active_disasters").doc(id));
      });

      if (writes > 0 || Object.keys(existingDocs).length > 0) {
        await batch.commit();
      }
      console.log(`Synced ${disasterList.length} events. Writes: ${writes}`);
    }

    return null;
  } catch (error) {
    console.error("Global Sync Error:", error);
    return null;
  }
});