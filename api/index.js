import axios from 'axios';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || req.query.api_key;
    const businessName = req.query.business_name;

    if (!apiKey) {
      console.error('Missing API Key.');
      return res.status(500).json({ error: 'Missing API Key. Provide via environment variable or query parameter api_key.' });
    }

    if (!businessName) {
      console.error('Missing business_name parameter.');
      return res.status(400).json({ error: 'Missing business_name parameter.' });
    }

    // Step 1: Get place_id
    const findPlaceResponse = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
      params: {
        key: apiKey,
        input: businessName,
        inputtype: 'textquery',
        fields: 'place_id'
      }
    });

    const candidates = findPlaceResponse.data.candidates;

    if (!candidates || candidates.length === 0) {
      console.warn('No matching business found.');
      return res.status(404).json({ error: 'No matching business found.' });
    }

    const placeId = candidates[0].place_id;

    // Step 2: Get Business Details
    const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        key: apiKey,
        place_id: placeId,
        fields: 'name,formatted_address,place_id,geometry,rating,user_ratings_total,website,international_phone_number,opening_hours'
      }
    });

    return res.status(200).json(detailsResponse.data.result);
  } catch (error) {
    console.error('Unhandled Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error.', details: error.message });
  }
}
