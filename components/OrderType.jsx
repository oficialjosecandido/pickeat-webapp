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
import CheckoutPage from "@/components/CheckoutPage";


// Load the Stripe object
// const stripePromise = loadStripe(process.env.NEXT_STRIPE_PUBLIC_KEY);
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
        console.error("No paymentIntent returned.");
        return null;
      }

      // Return the client secret
      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error("Error initializing payment", error);
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
      
      // Set up Elements options with clientSecret
      const elementsOptions = {
        clientSecret,
        appearance: { theme: "stripe" }, // Optional, can be customized
      };

      // Open the payment modal and pass the clientSecret to CheckoutPage
      const [modalId, updateModalContent] = openModal(<PaymentForm />);

      const handlePaymentSuccess = () => {
        closeModal(modalId);
        closeModal();
        clearCart(false);
      };

      updateModalContent(
        <Elements stripe={stripePromise} options={elementsOptions}>
          <CheckoutPage amount={cart.reduce((acc, item) => acc + item.totalPrice, 0)} />
        </Elements>
      );
    } else {
      alert("Unable to initialize payment. Please try again.");
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
        console.error("Error fetching pickup points:", error);
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
          <Image src="/icons/back.png" alt="Back" width={16} height={16} />
        </button>
        <h2 className="text-[16px] font-bold">How would you like to order?</h2>
      </div>

      {/* Display Delivery and Pickup options here */}

      {/* Display Cart total and initiate payment */}
      <button
        disabled={isDisabled()}
        onClick={openPaymentModal}
        className={`p-4 rounded-full mb-4 mt-4 w-full ${
          isDisabled() ? "bg-gray-200" : "bg-main-1"
        }`}
      >
        <span className="text-center font-semibold text-white">
          {cart.length > 0
            ? `Buy | ${currencies[cart[0].currency]}${cart
                .reduce((acc, item) => acc + item.totalPrice, 0)
                .toFixed(2)}`
            : "Empty Cart"}
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
