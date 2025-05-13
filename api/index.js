export default async function handler(req, res) {
  console.log('✅ Static mock API called.');

  return res.status(200).json({
    name: "Starbucks",
    formatted_address: "123 Main St, New York, NY 10001, USA",
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    rating: 4.3,
    user_ratings_total: 1200,
    website: "https://www.starbucks.com",
    international_phone_number: "+1 212-555-1234"
  });
}
