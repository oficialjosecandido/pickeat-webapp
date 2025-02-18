"use client";
import { useEffect, useState } from "react";
import moment from "moment";
import OrderType from "./OrderType";
import Loader from "./Loader";
import { useModal } from "@context/ModalContext";
import { useData } from "@context/DataContext";

const getTimezoneOffsetInMinutes = () => new Date().getTimezoneOffset();

// Convert a UTC time slot to the user's local time
const convertToUserTimezone = (slot) => {
  const timezoneOffset = getTimezoneOffsetInMinutes(); // Get timezone offset
  const slotDate = moment.utc(slot, "HH:mm"); // Parse the slot in UTC

  // Convert the time by applying the user's local timezone offset
  return slotDate.add(-timezoneOffset, "minutes").format("HH:mm");
};

const OrderDateTime = ({ restaurants, stadiumId }) => {
  const modalContext = useModal();
  const dataContext = useData();

  if (!modalContext || !dataContext) return null;

  const { updateModalContent } = modalContext;
  const { getAvailableSlots } = dataContext;

  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState(0);
  const [slots, setSlots] = useState([]);

  const nextStep = () => {
    updateModalContent(
      <OrderType
        onBack={onBack}
        stadiumId={stadiumId}
        timeSlot={slots[selectedTime]}
      />
    );
  };

  const onBack = () => {
    updateModalContent(
      <OrderDateTime restaurants={restaurants} stadiumId={stadiumId} />
    );
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      // Assuming getAvailableSlots returns slots in a structure with `time`, `slotID`, and `timeSlotID`
      const response = await getAvailableSlots(restaurants);
  
      const availableSlots = response
        .flatMap((res) => res.slots) // Extract slots
        .filter((slot) => slot.status) // Keep only those with status: true
        .map((slot) => ({
          time: convertToUserTimezone(slot.time), // Convert time
          slotID: slot._id,  // Store the correct slotID
          timeSlotID: slot._id, // Use the slot _id as the timeSlotID (or map to a different field)
        }));
  
      setSlots(availableSlots);
    } catch (error) {
      console.error("Errore nel recuperare gli slot disponibili:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  return (
    <div className="bg-white border-t border-black/10 px-2 flex flex-col h-full w-full max-w-xs">
      <h2 className="text-lg font-semibold py-4 mb-4 text-center border-b border-black/10">
        Seleziona la Fascia Oraria
      </h2>
      {loading ? (
        <div className="py-4">
          <Loader />
        </div>
      ) : slots.length > 0 ? (
        <div className="w-full flex-1 max-h-96 overflow-auto">
          {slots.map(({ time }, index) => ( // ✅ Destructure `time`
            <button
              onClick={() => setSelectedTime(index)}
              key={index}
              className={`w-full py-4 px-3 rounded-full shadow-sm border border-black/10 my-2 flex items-center justify-center ${
                selectedTime === index ? "bg-[#ec7d55]" : "bg-white"
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  selectedTime === index ? "text-white" : "text-black"
                }`}
              >
                {time} {/* ✅ Now it's a string */}
              </span>
            </button>
          ))}

        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">
          Nessuna fascia oraria disponibile
        </p>
      )}

      <button
        onClick={nextStep}
        className={`p-4 rounded-full mb-4 mt-4 text-white font-semibold ${
          slots.length > 0 ? "bg-main-1" : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={slots.length === 0}
      >
        Continua
      </button>
    </div>
  );
};

export default OrderDateTime;
