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
    // Ensure you are passing the correct timeSlot object to the next step
    const selectedSlot = slots[selectedTime?.date]?.[selectedTime?.index]; // Use selectedTime's date and index to reference the exact slot
  
    if (selectedSlot) {
      updateModalContent(
        <OrderType
          onBack={onBack}
          stadiumId={stadiumId}
          timeSlot={selectedSlot}  // Pass the full selected slot (or its relevant parts) here
        />
      );
    }
  };

  const onBack = () => {
    updateModalContent(
      <OrderDateTime restaurants={restaurants} stadiumId={stadiumId} />
    );
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await getAvailableSlots(restaurants);
  
      // Process and group slots by date
      const groupedSlots = response.reduce((acc, res) => {
        const date = moment.utc(res.date).format("YYYY-MM-DD"); // Convert date to readable format
        const availableTimes = res.slots
          .filter((slot) => slot.status) // Filter only available slots
          .map((slot) => ({
            time: convertToUserTimezone(slot.time), // Convert time to user timezone
            slotID: slot._id, // Store slot ID
            timeSlotID: slot._id,
          }));
  
        if (availableTimes.length > 0) {
          acc[date] = availableTimes;
        }
        return acc;
      }, {});
  
      setSlots(groupedSlots); // Store slots grouped by date
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
      ) : Object.keys(slots).length > 0 ? (
        <div className="w-full flex-1 max-h-96 overflow-auto">
          {Object.entries(slots).map(([date, times]) => (
            <div key={date} className="mb-4">
               <br />
              <h3 className="text-sm font-bold text-gray-700 text-center">
                {moment(date).locale("it").format("dddd, DD MMMM YYYY")}
              </h3>


              {times.map(({ time, slotID }, index) => (
                <button
                  onClick={() => setSelectedTime({ date, index })} // Store date + index
                  key={slotID}
                  className={`w-full py-4 px-3 rounded-full shadow-sm border border-black/10 my-2 flex items-center justify-center ${
                    selectedTime?.date === date && selectedTime?.index === index ? "bg-[#ec7d55]" : "bg-white"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      selectedTime?.date === date && selectedTime?.index === index ? "text-white" : "text-black"
                    }`}
                  >
                    {time}
                  </span>
                </button>
              ))}
            </div>
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
            selectedTime ? "bg-main-1" : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!selectedTime} // Disable button if no time is selected
        >
          Continua
        </button>

    </div>
  );
  
};

export default OrderDateTime;