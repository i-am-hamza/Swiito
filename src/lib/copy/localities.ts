export interface LocalityCopy {
  headline: string;
  lead: string;
  marketSummary: string;
  highlights: string[];
  faqs: { question: string; answer: string }[];
}

export const LOCALITY_COPY: Record<string, LocalityCopy> = {
  hindpiri: {
    headline: "Affordable living in the heart of old Ranchi",
    lead:
      "Hindpiri is central Ranchi's most densely settled neighbourhood — gritty, well-connected, and easy on the wallet. Auto-rickshaws, vegetable markets, and small eateries line every lane. If proximity to the city beats every other priority, Hindpiri delivers.",
    marketSummary:
      "Single rooms and 1 BHK flats dominate the rental stock. Most landlords rent unfurnished or bare-minimum furnished. Turnover is high and options plentiful, which keeps prices competitive year-round.",
    highlights: [
      "10–15 min auto to Ranchi Main Road and Birsa Chowk",
      "Dense market access — grocery, pharmacy, hardware all walking distance",
      "High rental inventory; rarely a long search",
      "Budget-friendly: lowest per-sqft rents in central Ranchi",
    ],
    faqs: [
      {
        question: "What kind of properties are available in Hindpiri?",
        answer:
          "Mostly single rooms, 1 BHK flats, and shared PG accommodation. Independent houses do come up occasionally but are quickly taken. Best for bachelors and working couples on a budget.",
      },
      {
        question: "What is the average rent in Hindpiri?",
        answer:
          "Single rooms start from ₹3,000–₹5,000/month. 1 BHK flats range from ₹5,500–₹9,500/month. Among the lowest rents available in central Ranchi for the connectivity you get.",
      },
      {
        question: "Is Hindpiri well connected to the rest of Ranchi?",
        answer:
          "Yes. Shared autos and city buses connect Hindpiri to Lalpur, Doranda, and the railway station in under 20 minutes. The narrow lanes can get congested during peak hours.",
      },
      {
        question: "Is Hindpiri suitable for families?",
        answer:
          "Better suited to single occupants and couples. Families with children typically prefer the quieter residential pockets of Kanke or Bariatu, which offer more space and better schools nearby.",
      },
    ],
  },

  lalpur: {
    headline: "Ranchi's main commercial artery with solid residential stock",
    lead:
      "Lalpur runs along one of Ranchi's busiest roads, threading banks, offices, hospitals, and retail stores together. Ground floors are commercial; upper floors house a reliable mix of 2 and 3 BHK flats that attract professionals who want to commute on foot.",
    marketSummary:
      "The residential supply is almost entirely 2–3 BHK, above commercial premises. Landlords here are generally experienced, buildings are better maintained, and rents reflect the premium location. Demand from corporate tenants keeps vacancy low.",
    highlights: [
      "Major banks, HDFC, SBI, and corporate offices within walking distance",
      "Proximity to private hospitals and diagnostic centres",
      "Reliable power and water supply in most buildings",
      "Well-lit roads and security; lower crime rate",
    ],
    faqs: [
      {
        question: "What makes Lalpur a good location for renting?",
        answer:
          "Lalpur's main road has everything a professional needs — banks, grocery stores, restaurants, medical labs, and offices — all within a 10-minute walk. Tenants save significantly on commute costs.",
      },
      {
        question: "What is the average rent in Lalpur?",
        answer:
          "2 BHK flats range from ₹10,000–₹18,000/month depending on the floor and building age. 3 BHK go from ₹16,000–₹28,000/month. Ground-floor commercial spaces are priced separately.",
      },
      {
        question: "Are there residential properties above commercial buildings?",
        answer:
          "Yes — most residential rentals in Lalpur sit on the 1st to 4th floor of mixed-use buildings. This means excellent road access and shops downstairs, though the main-road side can be noisy in the evenings.",
      },
      {
        question: "What amenities are available in Lalpur?",
        answer:
          "Banks (all major ones), Apollo Diagnostics, major supermarkets, and a range of restaurants and cafes are all on the main road. Auto stands at both ends of the locality make commuting straightforward.",
      },
    ],
  },

  kanke: {
    headline: "Green, spacious, and growing — Ranchi's family locality",
    lead:
      "Kanke has become Ranchi's preferred address for families and professionals who want more space, newer construction, and a quieter environment. Located near Ranchi University and several good schools, the area has grown steadily over the past decade without losing its residential character.",
    marketSummary:
      "Kanke offers a strong mix of 2 and 3 BHK flats in purpose-built apartment complexes and row houses. Semi-furnished and fully-furnished stock is more common here than in central Ranchi, catering to transferable government and corporate tenants.",
    highlights: [
      "Close to Ranchi University and reputed schools like DPS and DAV",
      "Newer apartment complexes with lifts, parking, and power backup",
      "Greener and less congested than central Ranchi",
      "Growing dining and retail options in the last 3 years",
    ],
    faqs: [
      {
        question: "Why do families prefer Kanke?",
        answer:
          "Kanke offers newer apartments with proper amenities (lift, parking, generator backup), proximity to good schools, and wide internal roads. The overall environment is quieter and cleaner than central Ranchi.",
      },
      {
        question: "What is the rent range in Kanke?",
        answer:
          "2 BHK flats start at ₹8,000–₹14,000/month; well-furnished units can go up to ₹18,000. 3 BHK homes range from ₹14,000–₹26,000/month. Prices are moderate for the quality on offer.",
      },
      {
        question: "Are fully-furnished flats available in Kanke?",
        answer:
          "Yes — Kanke has better semi-furnished and fully-furnished inventory than most parts of Ranchi, especially in the newer complexes closer to Ranchi University Road.",
      },
      {
        question: "How far is Kanke from the city centre?",
        answer:
          "Kanke is roughly 7–10 km from Ranchi city centre (Lalpur). Commute by auto or cab takes 20–30 minutes. Some corporate offices have shifted to the Kanke corridor, reducing commute needs entirely.",
      },
    ],
  },

  bariatu: {
    headline: "Ranchi's medical hub — PGs, flats, and hospital proximity",
    lead:
      "Bariatu sits adjacent to RIMS (Rajendra Institute of Medical Sciences) and several private hospitals, creating a unique rental market shaped by medical students, interns, nurses, and senior doctors. PG and hostel accommodation is plentiful, but Bariatu's quieter interior lanes also house solid family flats.",
    marketSummary:
      "Two distinct segments coexist: PG accommodation (dominated by medical students seeking affordable single occupancy near RIMS) and residential flats (popular with doctors and mid-senior hospital staff). Demand from the medical community is year-round and largely insensitive to season.",
    highlights: [
      "Adjacent to RIMS and within 2 km of several private hospitals",
      "High PG availability — shared and private room options",
      "Interior lanes are quiet and residential despite hospital proximity",
      "Good auto connectivity to Lalpur and Doranda",
    ],
    faqs: [
      {
        question: "Why is Bariatu popular for PG accommodation?",
        answer:
          "RIMS admits hundreds of MBBS, MD, and nursing students each year, all needing accommodation within walking or cycling distance. Bariatu has the highest density of PG and hostel options in Ranchi as a result.",
      },
      {
        question: "What is the average PG rent in Bariatu?",
        answer:
          "Shared PG rooms (2–3 occupants) range from ₹3,000–₹5,500/month per person. Private single rooms cost ₹5,000–₹9,000/month. Most PGs include meals; confirm before booking.",
      },
      {
        question: "Are standard family flats also available in Bariatu?",
        answer:
          "Yes. The residential lanes away from the RIMS gate have good quality 2 BHK and 3 BHK flats ranging from ₹11,000–₹22,000/month, popular with senior medical professionals and hospital staff.",
      },
      {
        question: "Is Bariatu noisy due to the hospitals?",
        answer:
          "Noise is concentrated near the RIMS main gate and the road leading to private hospitals. The interior lanes of Bariatu are generally quiet, and most landlords there cater to long-term residential tenants.",
      },
    ],
  },
};
