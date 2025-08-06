// lib/timeZone.js
import axios from "axios"; 
const GOOGLE_API_KEY =process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
console.log(GOOGLE_API_KEY,"google api key")
const getTimezoneFromState = async (state) => {
  try {
    const geoRes = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: `${state}`,
          key: GOOGLE_API_KEY,
        },
      }
    );

    const location = geoRes.data.results[0]?.geometry?.location;
    if (!location) {
      console.error(" Location not found.");
      return null;
    }

    const { lat, lng } = location;
    const timestamp = Math.floor(Date.now() / 1000);

    const timeZoneRes = await axios.get(
      "https://maps.googleapis.com/maps/api/timezone/json",
      {
        params: {
          location: `${lat},${lng}`,
          timestamp,
          key: GOOGLE_API_KEY,
        },
      }
    );

    return {
      state,
      timestamp,
      timezoneId: timeZoneRes.data.timeZoneId,
      rawOffset: timeZoneRes.data.rawOffset,
      dstOffset: timeZoneRes.data.dstOffset,
    };
  } catch (err) {
    console.error(" Error:", err.message);
    return null;
  }
};

export default getTimezoneFromState; 
