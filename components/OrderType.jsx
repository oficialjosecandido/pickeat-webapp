import { useEffect, useState } from "react";
import Loader from "./Loader";
import Image from "next/image";
import { useData } from "@context/DataContext";
import { useUser } from "@context/UserContext";
import { useModal } from "@context/ModalContext";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import ApplyCoupons from "./ApplyCoupons";
import { toast } from "react-toastify";
import LoginPopup from "@pages/LoginPopup";

// Load the Stripe object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_PUBLISHER_KEY);

const OrderType = ({ onBack, stadiumId, timeSlot }) => {
  const dataContext = useData();
  const userContext = useUser();
  const modalContext = useModal();

  if (!dataContext || !userContext || !modalContext) return null;

  const { getStadiumPickupPoints, currencies, getStadiumById } = dataContext;
  const { cart, clearCart, getPaymentIntent, getMyCoupons, user } = userContext;
  const { openModal, closeModal } = modalContext;

  const [orderType, setOrderType] = useState(1);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [floor, setFloor] = useState(1);
  const [pickupPoint, setPickupPoint] = useState("1");
  const [sector, setSector] = useState("");
  const [seat, setSeat] = useState("");
  const [loading, setLoading] = useState(true);

  const [stadium, setStadium] = useState(null);

  const loginUser = () => {
    const [modalId, updateModalContent] = openModal(<LoginPopup />);
    updateModalContent(<LoginPopup modalId={modalId} />);
  };

  const initializePaymentSheet = async (coupon) => {
    setLoading(true);
    try {
      const deliveryOption = orderType === 0 ? "delivery" : "pickup";
      const deliveryAddress =
        orderType === 0 ? { sector, seat } : { pickupPoint };
      deliveryAddress.floor = floor;

      // Fetch payment intent from your backend
      const { paymentIntent } = await getPaymentIntent(
        cart,
        deliveryOption,
        deliveryAddress,
        timeSlot,
        stadiumId,
        coupon
      );

      if (!paymentIntent) {
        console.error("Nessun paymentIntent restituito.");
        return null;
      }

      // Return the client secret
      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error("Errore nell'inizializzazione del pagamento", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmAvailableCoupons = (coupons) => {
    return new Promise((res) => {
      const [modalId, updateModalContent] = openModal(<ApplyCoupons />);
      updateModalContent(
        <ApplyCoupons
          coupons={coupons}
          onApply={(coupon) => {
            res(coupon);
            closeModal(modalId);
          }}
          onCancel={() => {
            res();
            closeModal(modalId);
          }}
        />
      );
    });
  };

  const openPaymentModal = async () => {
    if (!user?.userID) {
      loginUser();
      return;
    }
    const coupons = await getMyCoupons();
    let coupon = null;

    if (coupons.length > 0) {
      coupon = await confirmAvailableCoupons(coupons);
    }

    const paymentData = await initializePaymentSheet(coupon);

    if (paymentData) {
      const { clientSecret } = paymentData;

      const elementsOptions = {
        clientSecret,
        appearance: { theme: "stripe" }, // Optional
      };

      const [modalId, updateModalContent] = openModal(<PaymentForm />);

      // Separate handlers for closing modal and handling payment success
      const handlePaymentSuccess = () => {
        closeModal(modalId);
        closeModal();
        clearCart(false);
      };

      const handleCloseModal = () => {
        closeModal(modalId);
      };

      updateModalContent(
        <Elements stripe={stripePromise} options={elementsOptions}>
          <PaymentForm
            clientSecret={clientSecret}
            onClose={handleCloseModal}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </Elements>
      );
    } else {
      alert("Impossibile inizializzare il pagamento. Riprova.");
    }
  };

  const isDisabled = () => {
    if (orderType === 0) {
      return !sector || !seat;
    } else {
      return !pickupPoint;
    }
  };

  useEffect(() => {
    const fetchPickupPoints = async () => {
      setLoading(true);
      try {
        const [points, stadium] = await Promise.all([
          getStadiumPickupPoints(stadiumId),
          getStadiumById(stadiumId),
        ]);
        setStadium(stadium);
        setPickupPoints(points);
      } catch (error) {
        console.error("Errore nel recupero dei punti di ritiro:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPickupPoints();
  }, []);

  return (
    <div className="py-4 px-2 bg-white max-w-xs w-full">
      <div className="flex flex-row items-center space-x-2">
        <button onClick={onBack} className="bg-white/50 p-3 rounded-full">
          <Image src="/icons/back.png" alt="Indietro" width={16} height={16} />
        </button>
        <h2 className="text-[16px] font-bold">Come vuoi ordinare?</h2>
      </div>
      <div className="flex flex-row items-center justify-center space-x-4">
        <button
          disabled={true}
          onClick={() => setOrderType(0)}
          className={`self-start py-4 px-3 rounded-full shadow-sm w-20 h-20 border border-black/10 my-2 flex items-center justify-center gap-1 opacity-50`}
        >
          <Image
            src="/icons/delivery.png"
            alt="Consegna"
            width={20}
            height={20}
            className="m-auto"
            style={{
              filter:
                orderType === 0
                  ? "invert(50%) sepia(100%) saturate(500%) hue-rotate(320deg)"
                  : "invert(0)",
            }}
          />
          <span
            className={`text-xs font-semibold ${
              orderType === 0 ? "text-main-1" : "text-black"
            }`}
          >
            Consegna
          </span>
        </button>
        <button
          onClick={() => setOrderType(1)}
          className={`self-start py-4 px-3 rounded-full shadow-sm w-20 h-20 border border-black/10 my-2 flex items-center justify-center gap-1`}
        >
          <Image
            src={"/icons/pickup.png"}
            alt="Ritiro"
            width={20}
            height={20}
            className="m-auto"
            style={{
              filter:
                orderType === 1
                  ? "invert(50%) sepia(100%) saturate(500%) hue-rotate(320deg)"
                  : "invert(0)",
            }}
          />
          <span
            className={`text-xs font-semibold ${
              orderType === 1 ? "text-main-1" : "text-black"
            }`}
          >
            Ritiro
          </span>
        </button>
      </div>
      <div className="flex flex-row items-center space-x-2 justify-center">
        {pickupPoints.map((point, index) => {
          const { floorNumber } = point;
          return (
            <button
              key={index}
              onClick={() => setFloor(floorNumber * 1)}
              className={`py-2 px-4 border self-start border-black/10 my-2 items-center justify-center rounded-lg ${
                floor === floorNumber * 1 ? "bg-[#ec7d55]" : "bg-white"
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  floor === floorNumber ? "text-main-1" : "text-black"
                }`}
              >
                Piano: {floorNumber}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-row items-center space-x-2 justify-center">
        {pickupPoints[floor - 1]?.pickupPoints.map((point, index) => {
          const { label } = point;
          return (
            <button
              key={index}
              onClick={() => setPickupPoint(label)}
              className={`py-2 px-4 border self-start border-black/10 my-2 items-center justify-center rounded-lg ${
                label === pickupPoint ? "bg-[#ec7d55]" : "bg-white"
              }`}
            >
              <span className={`text-xs font-semibold text-black`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {loading ? (
        <Loader />
      ) : orderType === 1 ? (
        <>
          <div className="mt-4 h-48 w-64 mx-auto relative">
            <img
              src={`https://pickeat.blob.core.windows.net/internalmap/${stadiumId}.png`}
              alt="Stadio"
              className="h-full w-full object-contain"
            />
            {pickupPoints[floor - 1]?.pickupPoints.map((point, index) => {
              const { coordinates, label } = point;
              const [x, y] = coordinates;
              return (
                <div
                  key={index}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    position: "absolute",
                  }}
                  className={`border px-3 ${
                    label === pickupPoint
                      ? "bg-main-1 text-white"
                      : "bg-main-1/50"
                  }`}
                >
                  <span className="text-white font-bold text-lg">{label}</span>
                </div>
              );
            })}
          </div>
          <div className="py-0">
            <h3 className="text-sm font-semibold text-center">
              {stadium?.pickupText ?? "ritiro al bar"}
            </h3>
          </div>
        </>
      ) : (
        <div className="py-4">
          <h3 className="text-sm font-semibold text-center">
            Indirizzo di Consegna
          </h3>
          <input
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Settore"
            className="border border-black/10 rounded-lg p-2 mt-2 w-full"
            type="number"
          />
          <input
            value={seat}
            onChange={(e) => setSeat(e.target.value)}
            placeholder="Posto"
            className="border border-black/10 rounded-lg p-2 mt-2 w-full"
            type="number"
          />
        </div>
      )}
      <button
        disabled={isDisabled()}
        onClick={openPaymentModal}
        className={`p-4 rounded-full mb-4 mt-4 w-full ${
          isDisabled() ? "bg-gray-200" : "bg-main-1"
        }`}
      >
        <span className="text-center font-semibold text-white">
          {cart.length > 0
            ? `Acquista | ${currencies[cart[0].currency]}${cart
                .reduce((acc, item) => acc + item.totalPrice, 0)
                .toFixed(2)}`
            : "Carrello vuoto"}
        </span>
      </button>
    </div>
  );
};

// PaymentForm component
const PaymentForm = ({ clientSecret, onClose, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe non è stato inizializzato.");
      return;
    }

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: "if_required", // Prevents redirection if not needed
    });

    if (error) {
      console.error("Errore nella conferma del pagamento:", error.message);
      alert(`Pagamento fallito: ${error.message}`);
      setLoading(false);
    } else {
      // Retrieve the PaymentIntent to check the status
      const { paymentIntent } = await stripe.retrievePaymentIntent(
        clientSecret
      );

      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "requires_capture")
      ) {
        console.log("Pagamento riuscito");
        toast.success(
          "Pagamento riuscito! Sarai avvisato quando lo stato dell'ordine cambia."
        );
        // Call the onPaymentSuccess prop
        onPaymentSuccess();
      } else {
        console.error("Stato del pagamento imprevisto:", paymentIntent?.status);
        toast.error("Pagamento fallito. Riprova.");
        setLoading(false);
      }
    }
  };

  return (
    <form
      onSubmit={handlePayment}
      className="p-4 max-w-xs w-full bg-white rounded-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Completa il Pagamento</h2>
        <button type="button" onClick={onClose}>
          <Image src="/icons/close.png" alt="Chiudi" width={20} height={20} />
        </button>
      </div>
      <div className="border p-4 rounded-lg mb-4">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={loading || !stripe}
        className={`p-4 rounded-full w-full ${
          loading ? "bg-gray-200" : "bg-main-1"
        }`}
      >
        <span className="text-center font-semibold text-white">
          {loading ? "Elaborazione..." : "Completa il Pagamento"}
        </span>
      </button>
    </form>
  );
};

export default OrderType;
