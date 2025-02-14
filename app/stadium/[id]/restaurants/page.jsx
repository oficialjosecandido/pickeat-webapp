"use client";
import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";

const RestaurantList = () => {
  const { id: stadiumId } = useParams(); // Get stadium ID from URL
  const searchParams = useSearchParams();
  const section = searchParams.get("section"); // Get section from query parameters

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/stadiums/restaurants", {
          method: "POST",  // Changed from GET to POST
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ stadiumId, section }), // Send data in the body
        });

        const data = await response.json();
        setRestaurants(data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    if (section && stadiumId) {
      fetchRestaurants();
    }
  }, [stadiumId, section]);

  if (loading) {
    return <h1 className="text-center text-xl font-bold mt-10">Caricamento...</h1>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Ristoranti nella Sezione {section}
      </h1>

      {restaurants.length === 0 ? (
        <p className="text-gray-600 text-lg">Nessun ristorante trovato per questa sezione.</p>
      ) : (
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="mb-6 border-b pb-4">
              <img 
                src={restaurant.image} 
                alt={restaurant.name} 
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
              <h2 className="text-xl font-semibold">{restaurant.name}</h2>
              <p className="text-gray-600">{restaurant.description}</p>
              <a
                href={`/menu/${restaurant.id}`}
                className="text-blue-600 font-semibold mt-2 inline-block hover:underline"
              >
                Visualizza Menu →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
