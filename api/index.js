const axios = require('axios');

export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const { business_name } = req.query;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GOOGLE_API_KEY environment variable in Vercel.' });
  }

  if (!business_name) {
    return res.status(400).json({ error: 'Missing business_name parameter.' });
  }

  try {
    // Step 1: Get place_id from Google Places API
    const findPlaceUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
    const findPlaceResponse = await axios.get(findPlaceUrl, {
      params: {
        key: apiKey,
        input: business_name,
        inputtype: 'textquery',
        fields: 'place_id'
      }
    });

    const candidates = findPlaceResponse.data.candidates;
    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ error: 'No matching business found.' });
    }

    const placeId = candidates[0].place_id;

    // Step 2: Get Business Details
    const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
    const detailsResponse = await axios.get(detailsUrl, {
      params: {
        key: apiKey,
        place_id: placeId,
        fields: 'name,formatted_address,place_id,geometry,rating,user_ratings_total,website,international_phone_number,opening_hours'
      }
    });

    return res.status(200).json(detailsResponse.data.result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
