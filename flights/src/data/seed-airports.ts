import { Airport, AirportAttrs } from "../models/airport"

export const airports: AirportAttrs[] = [
  { code: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam" },
  { code: "HAN", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam" },
  { code: "DAD", name: "Da Nang International Airport", city: "Da Nang", country: "Vietnam" },
  { code: "CXR", name: "Cam Ranh International Airport", city: "Nha Trang", country: "Vietnam" },
  { code: "PQC", name: "Phu Quoc International Airport", city: "Phu Quoc", country: "Vietnam" },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore" },
  { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
  { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan" },
  { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea" },
  { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "China" },
  { code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia" },
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
  { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States" },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States" },
]

export const seedAirports = async () => {
  try {
    const operations = airports.map((airport) => ({
      updateOne: {
        filter: { code: airport.code },
        update: { $set: airport },
        upsert: true,
      },
    }))

    await Airport.bulkWrite(operations)

    console.log("Airports seeded/synchronized successfully")

  } catch (err) {
    console.error("Failed to seed airports:", err)
  }
}
