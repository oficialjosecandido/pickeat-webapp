"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useData } from "@context/DataContext";

const Restaurants = ({ params }) => {
  const { id } = params; // Stadium ID
  const searchParams = useSearchParams();
  const section = searchParams.get("section");
  const row = searchParams.get("row");
  const seat = searchParams.get("seat");

  const { getStadium } = useData();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      const stadiumData = await getStadium(id);

      // Filter restaurants based on seat details (Modify this logic as per your dataset)
      const filteredRestaurants = stadiumData.restaurants.filter((restaurant) =>
        restaurant.reachableSections.includes(section)
      );

      setRestaurants(filteredRestaurants);
      setLoading(false);
    };

    fetchRestaurants();
  }, [id, section]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Restaurants Near You</h1>
      {restaurants.length > 0 ? (
        <ul className="w-full max-w-md">
          {restaurants.map((restaurant) => (
            <li key={restaurant._id} className="mb-4 p-4 border rounded-lg shadow">
              <h2 className="text-lg font-bold">{restaurant.name}</h2>
              <p className="text-sm text-gray-600">{restaurant.description}</p>
              <a
                href={`/menu/${restaurant._id}`}
                className="text-blue-500 underline mt-2 inline-block"
              >
                View Menu
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No restaurants available in your section.</p>
      )}
    </div>
  );
};

export default Restaurants;
