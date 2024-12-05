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
      const slots = await getAvailableSlots(restaurants);
      const localizedSlots = slots.map((slot) => convertToUserTimezone(slot));
      setSlots(localizedSlots);
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
      ) : (
        <div className="w-full flex-1 max-h-96 overflow-auto">
          {(slots || []).map((time, index) => (
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
                {time}
              </span>
            </button>
          ))}
          {slots.length < 3 &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10" />
            ))}
        </div>
      )}
      <button
        onClick={nextStep}
        className="p-4 bg-main-1 rounded-full mb-4 mt-4 text-white font-semibold"
      >
        Continua
      </button>
    </div>
  );
};

export default OrderDateTime;
