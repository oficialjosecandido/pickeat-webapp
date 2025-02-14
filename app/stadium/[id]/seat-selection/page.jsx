"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useParams } from "next/navigation"; // Import useParams for dynamic route

const SeatSelection = () => {
  const { id } = useParams(); // Get stadium ID from the URL
  const router = useRouter();

  const [section, setSection] = useState("");

  const handleChange = (e) => {
    setSection(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Redirect user to the restaurants page with the stadium ID and section
    router.push(`/stadium/${id}/restaurants?section=${section}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Inserisci la tua sezione</h1>
      <p className="text-gray-600 mb-6 text-center">
        Controlla il numero della tua sezione sul biglietto qui sotto.
      </p>

      {/* Mock ticket image */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <img 
          src="/media/campnou2.png" 
          alt="Biglietto Esempio" 
          className="mb-2 w-72 h-auto rounded-md"
        />
        <small className="text-gray-500 text-sm block text-center">Questo è un biglietto di esempio</small>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="mt-6 w-full max-w-md bg-white p-6 rounded-lg shadow-lg"
      >
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">Sezione</label>
          <input
            type="text"
            name="section"
            value={section}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Inserisci il numero della sezione"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-semibold"
        >
          Trova Ristoranti
        </button>
      </form>
    </div>
  );
};

export default SeatSelection;
