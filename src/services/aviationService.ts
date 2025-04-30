import axios from "axios";

const AMADEUS_CLIENT_ID = "5lp3uACGJglsPsC0rc7XaZV9BesPLG8t";
const AMADEUS_CLIENT_SECRET = "bHJGPfWzGYEhHFEo";
const AMADEUS_AUTH_URL =
  "https://test.api.amadeus.com/v1/security/oauth2/token";
const AMADEUS_FLIGHTS_URL =
  "https://test.api.amadeus.com/v2/shopping/flight-offers";
const AMADEUS_LOCATION_URL =
  "https://test.api.amadeus.com/v1/reference-data/locations";

let accessToken: string;
let tokenExpiry: number;

// ========== Types ==========

export interface FlightSearch {
  departure: string; // city name or code
  arrival: string; // city name or code
  date: string; // YYYY-MM-DD
}

export interface Flight {
  airline: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  departure_airport: string;
  arrival_airport: string;
  duration: string;
  price: number;
  aircraft: string;
  seat_availability: number;
}

// ========== Access Token ==========

const getAccessToken = async (): Promise<string> => {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await axios.post(
    AMADEUS_AUTH_URL,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: AMADEUS_CLIENT_ID,
      client_secret: AMADEUS_CLIENT_SECRET,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + response.data.expires_in * 1000;
  return accessToken;
};

// ========== Helper: Normalize ISO date ==========

const formatToIsoDate = (rawDate: string): string => {
  const date = new Date(rawDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ========== City → IATA Code Resolver ==========

const getIataCodeFromCity = async (
  cityName: string
): Promise<string | null> => {
  try {
    const token = await getAccessToken();

    const response = await axios.get(AMADEUS_LOCATION_URL, {
      params: {
        keyword: cityName,
        subType: "CITY,AIRPORT",
        "page[limit]": 5,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const locations = response.data?.data;

    if (locations && locations.length > 0) {
      const match = locations.find((loc: any) => loc.iataCode?.length === 3);
      return match?.iataCode || locations[0].iataCode;
    }

    // Fallback map for common cities
    const fallbackMap: Record<string, string> = {
      kolkata: "CCU",
      calcutta: "CCU",
      mumbai: "BOM",
      delhi: "DEL",
      bangalore: "BLR",
      chennai: "MAA",
      hyderabad: "HYD",
      singapore: "SIN",
      dubai: "DXB",
      london: "LHR",
      paris: "CDG",
      tokyo: "HND",
      newyork: "JFK",
      nyc: "JFK",
    };

    return fallbackMap[cityName.toLowerCase()] || null;
  } catch (error) {
    console.error("Error fetching IATA code:", error);
    return null;
  }
};

// ========== Flight Search ==========

const searchFlights = async (search: FlightSearch): Promise<Flight[]> => {
  try {
    const token = await getAccessToken();

    const departureCode = await getIataCodeFromCity(search.departure);
    const arrivalCode = await getIataCodeFromCity(search.arrival);

    if (!departureCode || !arrivalCode) {
      throw new Error("Invalid city names. Could not resolve IATA codes.");
    }

    const payload = {
      currencyCode: "INR",
      originDestinations: [
        {
          id: "1",
          originLocationCode: departureCode,
          destinationLocationCode: arrivalCode,
          departureDateTimeRange: { date: formatToIsoDate(search.date) },
        },
      ],
      travelers: [{ id: "1", travelerType: "ADULT" }],
      sources: ["GDS"],
      searchCriteria: { maxFlightOffers: 3 },
    };

    const response = await axios.post(AMADEUS_FLIGHTS_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.data.map((flightObj: any): Flight => {
      const itinerary = flightObj.itineraries[0];
      const segment = itinerary.segments[0];

      return {
        airline: segment.carrierCode || "Unknown",
        flight_number: segment.number || "N/A",
        departure_time: segment.departure.at,
        arrival_time: segment.arrival.at,
        departure_airport: segment.departure.iataCode,
        arrival_airport: segment.arrival.iataCode,
        duration: itinerary.duration.replace("PT", "").toLowerCase(),
        price: parseFloat(flightObj.price.total),
        aircraft: segment.aircraft?.code || "N/A",
        seat_availability: Math.floor(Math.random() * 20) + 5,
      };
    });
  } catch (error) {
    console.error("Error searching flights:", error);
    throw new Error("Failed to search flights.");
  }
};

// ========== Export ==========

export default {
  searchFlights,
  getIataCodeFromCity,
};
