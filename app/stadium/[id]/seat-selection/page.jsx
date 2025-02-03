"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useParams } from "next/navigation"; // Import useParams for dynamic route

const SeatSelection = () => {
  const { id } = useParams(); // Get stadium ID from the URL
  const router = useRouter();

  const [formData, setFormData] = useState({
    section: "",
    row: "",
    seat: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Redirect user to the filtered restaurant list based on their seat selection
    router.push(
      `/stadium/${id}/restaurants?section=${formData.section}&row=${formData.row}&seat=${formData.seat}`
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Enter Your Seat Details</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-sm font-semibold">Section</label>
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold">Row</label>
          <input
            type="text"
            name="row"
            value={formData.row}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold">Seat</label>
          <input
            type="text"
            name="seat"
            value={formData.seat}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Find Restaurants
        </button>
      </form>
    </div>
  );
};

export default SeatSelection;
