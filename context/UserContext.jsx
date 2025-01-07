"use client";
import api from "@api";
import Splash from "@pages/Splash";
import { createContext, useContext, useEffect, useState } from "react";
import { useModal } from "@context/ModalContext";
import VerifyEmail from "@components/VerifyEmail";
import { signInWithGoogle } from "@firebase";
import io from "socket.io-client";

const socket_url =
  "https://pickeat-asedfnc8hsfbevdj.italynorth-01.azurewebsites.net/";

// const socket_url = "http://192.168.68.107:8080/";

const userContext = createContext();
export const useUser = () => useContext(userContext);




const UserContext = ({ children }) => {
  const { openModal, confirmationModal } = useModal();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: 44.3845,
    longitude: 7.5427,
  });
  const [socket, setSocket] = useState(null);

  const [orderPing, setOrderPing] = useState(false);
  const [cartPing, setCartPing] = useState(false);

  //user
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      const { user: googleUser } = result;

      const { email, displayName, photoURL } = googleUser;
      const {
        data: { token, user },
      } = await api.post("/auth/oAuth/google", {
        email,
        firstName: displayName.split(" ")[0],
        lastName: displayName.split(" ")[1],
        profileImg: photoURL,
      });
      setUser({
        ...user,
      });
      localStorage.setItem("token", token);
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        console.warn("Google login canceled by the user.");
      } else {
        console.error("Error logging in with Google", error);
        const message =
          error.response?.data?.message ||
          error.code ||
          "Internal server error.";
        throw new Error(message);
      }
    }
  };

  const confirmEmail = async (email) => {
    const [modalId, updateModalContent] = openModal(<VerifyEmail />);
    updateModalContent(
      <VerifyEmail
        email={email}
        verifyEmail={verifyEmail}
        resentVerificationEmail={resentVerificationEmail}
        modalId={modalId}
      />
    );
  };

  const login = async (email, password) => {
    try {
      const {
        data: { token, user },
      } = await api.post("/auth/login", { email, password });
      setUser({
        ...user,
      });
      localStorage.setItem("token", token);
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      const errorCode = error.response?.data?.code;
      if (errorCode === 1) return confirmEmail(email);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      await api.post("/auth/register", {
        email,
        password,
        firstName,
        lastName,
      });
      confirmEmail(email);
    } catch (error) {
      console.log(error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      await api.post("/auth/verify-email", { email, code });
    } catch (error) {
      console.error("Error verifying email", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const resentVerificationEmail = async (email) => {
    try {
      await api.post("/auth/resend-verification-code", { email });
    } catch (error) {
      console.error("Error resending verification email", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const verifyUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { data } = await api.get("/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      setUser(data);
    } catch (error) {
      console.error("Error verifying user", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);
        localStorage.setItem("userLocation", JSON.stringify(location));
      });
    }
  };

  const getGuestID = async () => {
    // Implement logic to get a guest ID, for example:
    // 1. Generate a guest ID if it doesn't exist in localStorage.
    // 2. Return the existing guest ID if it exists.
  
    let guestID = localStorage.getItem('guestID');
    if (!guestID) {
      guestID = `guest-${Math.random().toString(36).substr(2, 9)}`;  // Generate a random guest ID
      localStorage.setItem('guestID', guestID);
    }
  
    return guestID;
  };

  //  Cart

  // Add abandoned order to MongoDB
  const saveAbandonedOrder = async (order) => {
    try {
      await api.post("/auth/abandoned_order", order); // Send abandoned order to server
    } catch (error) {
      console.error("Error saving abandoned order", error);
    }
  };

  // Move from abandoned order to completed order (MongoDB update)
  const convertToOrder = async (order) => {
    try {
      await api.post("/auth/complete_order", order); // Send to complete order endpoint
      await api.delete(`/auth/abandoned_order/${order._id}`); // Delete from abandoned orders
    } catch (error) {
      console.error("Error converting to order", error);
    }
  };

  const completeOrder = async () => {
    try {
      const completedOrder = {
        userID: user.userID,
        cart: cart,
        status: 'completed',
      };
      // Mark as completed in the MongoDB 'orders' collection
      await convertToOrder(completedOrder); // Convert the abandoned order to a completed order
      setCart([]); // Clear the cart after order completion
    } catch (error) {
      console.error("Error completing order", error);
    }
  };


  const saveCartToDB = async (item) => {
    return api.post(`/auth/cart`, { item });
  };

  const removeCartFromDB = async (itemID) => {
    return api.delete(`/auth/cart/${itemID}`);
  };

  const clearCartFromDB = async () => {
    return api.delete(`/auth/cart/clear`);
  };

  const addToCart = async (item) => {
    try {

      const itemToSave = {
        ...item,
        status: 'uncompleted', // Mark as uncompleted order
      };

      if (user?.userID) {
        await saveCartToDB(item);
      } else {
        localStorage.setItem(`cart`, JSON.stringify([...cart, item]));
      }
      setCart([...cart, itemToSave]);
    } catch (error) {
      alert(error);
      console.error("Error adding to cart", error);
    }
  };

  const deleteFromCart = async (itemID) => {
    try {
      await confirmationModal(
        "Delete Item",
        "Are you sure you want to delete this item?"
      );
      if (user?.userID) {
        await removeCartFromDB(itemID);
      }

      const storageCart = localStorage.getItem(`cart`);
      if (storageCart) {
        const isStorageItem = JSON.parse(storageCart).find(
          (it) => it._id === itemID
        );
        if (isStorageItem) {
          const newStorageCart = JSON.parse(storageCart).filter(
            (it) => it._id !== itemID
          );
          localStorage.setItem(`cart`, JSON.stringify(newStorageCart));
        }
      }

      setCart((prev) => prev.filter((it) => it._id !== itemID));
    } catch (error) {
      console.error("Error deleting from cart", error);
    }
  };

  const clearCart = async (confirm = true) => {
    try {
      if (cart.length === 0) {
        return;
      }
      if (confirm) {
        await confirmationModal(
          "Clear Cart",
          "Are you sure you want to clear the cart?"
        );
      }
      if (user?.userID) {
        await clearCartFromDB();
      }
      localStorage.removeItem(`cart`);
      setCart([]);
    } catch (error) {
      console.error("Error clearing cart", error);
    }
  };

  const getCartItems = async () => {
    try {
      const cartItems = localStorage.getItem(`cart`);
      const cart = [];
      if (cartItems) {
        cart.push(...JSON.parse(cartItems));
      }
      if (user?.userID) {
        const { data } = await api.get(`/auth/cart`);
        cart.push(...data);
      }

      setCart(cart);
    } catch (error) {
      console.error("Error getting cart items", error);
    }
  };

  const updateCartItem = async (id, amount) => {
    try {
      if (user?.userID) {
        await api.put(`/auth/cart`, { amount, itemID: id });
      } else {
        const storageCart = localStorage.getItem(`cart`);
        if (storageCart) {
          const newStorageCart = JSON.parse(storageCart).map((it) => {
            if (it._id === id) {
              return {
                ...it,
                amount,
                totalPrice:
                  (it.price +
                    it.extras.reduce((acc, extra) => acc + extra.price, 0)) *
                  amount,
              };
            }
            return it;
          });
          localStorage.setItem(`cart`, JSON.stringify(newStorageCart));
          setCart(newStorageCart);
        }
      }

      setCart((prev) => {
        return prev.map((it) => {
          if (it._id === id) {
            return {
              ...it,
              amount,
              totalPrice:
                (it.price +
                  it.extras.reduce((acc, extra) => acc + extra.price, 0)) *
                amount,
            };
          }
          return it;
        });
      });
    } catch (error) {
      console.error("Error updating cart item", error);
    }
  };

  //orders
  const getOrders = async () => {
    try {
      const userID = user?.userID || null;
      const { data } = await api.post("/auth/orders", {
        userID,
      });
      setOrders(data);
    } catch (error) {
      console.error("Error getting orders", error);
      return [];
    }
  };

  const getAbandonedOrders = async () => {
    try {
      const userID = user?.userID || (await getGuestID());
      const { data } = await api.get(`/auth/abandoned_orders/${userID}`);
      return data;
    } catch (error) {
      console.error("Error getting abandoned orders", error);
      return [];
    }
  };

  const getOrdersHistory = async () => {
    try {
      const userID = user?.userID || (await getGuestID());
      const { data } = await api.post("/auth/order_history", {
        userID,
      });
      return data;
    } catch (error) {
      console.error("Error getting orders history", error);
      return [];
    }
  };

  //stripe
  const getPaymentIntent = async (
    cart,
    deliveryOption,
    deliveryAddress,
    timeSlot,
    stadiumId,
    coupon
  ) => {
    try {
      const userID = user?.userID || (await getGuestID());
      const { data } = await api.post("/auth/payment-intent", {
        cart,
        userID,
        deliveryOption,
        deliveryAddress,
        timeSlot,
        stadiumId,
        coupon,
      });
      return data;
    } catch (error) {
      console.error("Error getting payment intent", error);
      throw error;
    }
  };

  const setDefaultCard = async (paymentMethodId) => {
    try {
      await api.post("/auth/card/default", { paymentMethodId });
    } catch (error) {
      console.error("Error setting default card", error);
      throw error;
    }
  };

  const removeCard = async (paymentMethodId) => {
    try {
      await api.delete(`/auth/card/${paymentMethodId}`);
    } catch (error) {
      console.error("Error removing card", error);
      throw error;
    }
  };

  const getSetupIntent = async () => {
    try {
      const { data } = await api.get("/auth/payment-setup");
      return data;
    } catch (error) {
      console.error("Error getting setup intent", error);
      throw error;
    }
  };

  const getMyCoupons = async () => {
    try {
      const { data } = await api.get("/auth/coupons");
      return data;
    } catch (error) {
      console.error("Error getting my coupons", error);
      return [];
    }
  };

  const provided = {
    user,
    login,
    register,
    loginWithGoogle,
    logout,
    userLocation,
    // Cart
    cart,
    addToCart,
    completeOrder,
    // Orders
    getOrders,
    orders,
    saveAbandonedOrder,
    getAbandonedOrders,
    socket,
    orderPing,
    cartPing,

    //orders
    getOrders,
    getOrdersHistory,

    socket,
    orders,
    orderPing,
    cartPing,
  };

  useEffect(() => {
    verifyUser();
    getAbandonedOrders(); 
  }, []);

  useEffect(() => {
    getCartItems();
    if (!user?.userID) return;
    getOrders();

    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      setUserLocation(JSON.parse(storedLocation));
    } else {
      getUserLocation();
    }

    const newSocket = io(socket_url);
    newSocket.on("connect", () => {
      newSocket.emit("assign_user", {
        userID: user.userID,
      });
    });

    setSocket(newSocket);
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("order_is_ready", () => {
      setTimeout(() => {
        getOrders();
      }, 500);
    });

    return () => {
      socket.off("order_is_ready");
    };
  }, [socket]);

  useEffect(() => {
    if (cart.length === 0) return;
    setCartPing(true);
    const timeout = setTimeout(() => {
      setCartPing(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [cart]);

  useEffect(() => {
    if (orders.length === 0) return;
    setOrderPing(true);
    const timeout = setTimeout(() => {
      setOrderPing(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [orders]);

  return (
    <userContext.Provider value={provided}>
      {loading ? <Splash /> : children}
    </userContext.Provider>
  );
};

export default UserContext;
