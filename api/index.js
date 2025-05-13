import axios from 'axios';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || req.query.api_key;
    const businessName = req.query.business_name;

    // Debug Logging
    console.log('GOOGLE_API_KEY Loaded:', apiKey ? 'YES' : 'NO');
    console.log('Business Name Provided:', businessName || 'NOT PROVIDED');

    if (!apiKey) {
      console.error('Missing API Key.');
      return res.status(500).json({
        error: 'Missing API Key. Provide via environment variable or query parameter api_key.'
      });
    }

    if (!businessName) {
      console.error('Missing business_name parameter.');
      return res.status(400).json({
        error: 'Missing business_name parameter.'
      });
    }

    // Step 1: Get place_id from Google Places API
    const findPlaceResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          key: apiKey,
          input: businessName,
          inputtype: 'textquery',
          fields: 'place_id'
        }
      }
    );

    console.log('Find Place API Response:', JSON.stringify(findPlaceResponse.data));

    const candidates = findPlaceResponse.data.candidates;

    if (!candidates || candidates.length === 0) {
      console.warn('No matching business found.');
      return res.status(404).json({ error: 'No matching business found.' });
    }

    const placeId = candidates[0].place_id;

    // Step 2: Get Business Details
    const detailsResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          key: apiKey,
          place_id: placeId,
          fields: 'name,formatted_address,place_id,geometry,rating,user_ratings_total,website,international_phone_number,opening_hours'
        }
      }
    );

    console.log('Details API Response:', JSON.stringify(detailsResponse.data));

    const result = detailsResponse.data.result;

    // Flatten and ensure consistent response structure
    return res.status(200).json({
      name: result?.name || null,
      formatted_address: result?.formatted_address || null,
      place_id: result?.place_id || null,
      geometry: result?.geometry || null,
      rating: result?.rating || null,
      user_ratings_total: result?.user_ratings_total || null,
      website: result?.website || null,
      international_phone_number: result?.international_phone_number || null,
      opening_hours: result?.opening_hours || null
    });

  } catch (error) {
    console.error('Unhandled Error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error.',
      details: error.message
    });
  }
}
