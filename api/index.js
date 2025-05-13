import axios from 'axios';

export default async function handler(req, res) {
  const envApiKey = process.env.GOOGLE_API_KEY;
  const { api_key, business_name } = req.query;

  // Debug Logging
  console.log('--- DEBUG LOG START ---');
  console.log('Env GOOGLE_API_KEY:', envApiKey ? 'LOADED' : 'NOT LOADED');
  console.log('API Key from Query:', api_key ? 'PRESENT' : 'NOT PRESENT');
  console.log('Business Name:', business_name || 'NOT PROVIDED');
  console.log('--- DEBUG LOG END ---');

  const finalApiKey = envApiKey || api_key;

  if (!finalApiKey) {
    return res.status(500).json({
      error: 'Missing API Key. Provide via environment variable or query parameter api_key.'
    });
  }

  if (!business_name) {
    return res.status(400).json({
      error: 'Missing business_name parameter.'
    });
  }

  try {
    // Step 1: Get place_id from Google Places API
    const findPlaceResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          key: finalApiKey,
          input: business_name,
          inputtype: 'textquery',
          fields: 'place_id'
        }
      }
    );

    console.log('Find Place API Response:', JSON.stringify(findPlaceResponse.data));

    const candidates = findPlaceResponse.data.candidates;
    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ error: 'No matching business found.' });
    }

    const placeId = candidates[0].place_id;

    // Step 2: Get Business Details
    const detailsResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          key: finalApiKey,
          place_id: placeId,
          fields: 'name,formatted_address,place_id,geometry,rating,user_ratings_total,website,international_phone_number,opening_hours'
        }
      }
    );

    console.log('Details API Response:', JSON.stringify(detailsResponse.data));

    return res.status(200).json(detailsResponse.data.result);
  } catch (error) {
    console.error('ERROR:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
