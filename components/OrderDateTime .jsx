"use client";
import { useEffect, useState } from "react";
import moment from "moment";
import OrderType from "./OrderType";
import Loader from "./Loader";
import { useModal } from "@context/ModalContext";
import { useData } from "@context/DataContext";
import { useUser } from "@context/UserContext"; // Import useUser

const getTimezoneOffsetInMinutes = () => new Date().getTimezoneOffset();

const convertToUserTimezone = (slot) => {
  const timezoneOffset = getTimezoneOffsetInMinutes();
  const slotDate = moment.utc(slot, "HH:mm");
  return slotDate.add(-timezoneOffset, "minutes").format("HH:mm");
};

const OrderDateTime = ({ restaurants, stadiumId }) => {
  const modalContext = useModal();
  const dataContext = useData();
  const userContext = useUser();

  if (!modalContext || !dataContext) return null;

  const { updateModalContent } = modalContext;
  const { getAvailableSlots } = dataContext;
  const { cart, updateCartItem } = userContext;
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState(0);
  const [slots, setSlots] = useState([]);

  const nextStep = () => {
    const selectedSlot = slots[selectedTime];
  
    if (!selectedSlot) return;
  
    const timeSlotData = {
      time: selectedSlot.time,
      slotID: selectedSlot._id, // Correct reference
      timeSlotID: selectedSlot._id, // Ensuring correct usage
    };

    // ✅ Ensure cart is defined before looping
    if (cart && cart.length > 0) {
      cart.forEach((item) => {
        updateCartItem(item._id, {
          ...item,
          timeSlot: timeSlotData,
        });
      });
    }

  
    cart.forEach((item) => {
      updateCartItem(item._id, {
        ...item,
        timeSlot: timeSlotData,
      });
    });
  
    updateModalContent(
      <OrderType onBack={onBack} stadiumId={stadiumId} timeSlot={timeSlotData} />
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
      const response = await getAvailableSlots(restaurants);
  
      // Flatten slots, filter available ones, and store both time & _id
      const availableSlots = response
        .flatMap((res) => res.slots) // Extract slots
        .filter((slot) => slot.status) // Keep only those with status: true
        .map((slot) => ({
          time: convertToUserTimezone(slot.time), // Convert time
          _id: slot._id, // Store slot ID
        }));
  
      setSlots(availableSlots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
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
