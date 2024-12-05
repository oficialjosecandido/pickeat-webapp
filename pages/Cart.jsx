"use client";

import { useState } from "react";
import Image from "next/image";
import { useModal } from "@context/ModalContext";
import { useData } from "@context/DataContext";
import { useUser } from "@context/UserContext";
import OrderDateTime from "@components/OrderDateTime ";

const Cart = () => {
  const modalContext = useModal();
  const dataContext = useData();
  const userContext = useUser();

  if (!modalContext || !dataContext || !userContext) return null;

  const { cart, deleteFromCart, clearCart, updateCartItem } = userContext;
  const { openModal } = modalContext;
  const { currencies } = dataContext;

  const [loading, setLoading] = useState(false);

  const handleCreateOrder = () => {
    const isCartHasMultipleStadiums = cart.some(
      (item) => item.stadiumId !== cart[0].stadiumId
    );
    if (isCartHasMultipleStadiums) {
      alert("Non puoi ordinare da più stadi contemporaneamente");
      return;
    }
    const stadiumId = cart[0].stadiumId;
    const restaurants = cart.map((item) => item.resId);
    const [modalId, updateModalContent] = openModal(
      <OrderDateTime stadiumId={stadiumId} restaurants={restaurants} />
    );
    updateModalContent(
      <OrderDateTime
        stadiumId={stadiumId}
        restaurants={restaurants}
        modalId={modalId}
      />
    );
  };

  const handleUpdateCartItem = async (id, amount) => {
    try {
      setLoading(true);
      await updateCartItem(id, amount);
    } catch (error) {
      console.error(
        "Errore nell'aggiornamento dell'articolo del carrello:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white p-4 h-[75vh]">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-xl uppercase">I miei articoli ({cart.length})</h2>
        <button
          className="px-2 py-1 border border-main-1 shadow-sm rounded-lg bg-white"
          onClick={clearCart}
        >
          <span className="text-sm text-main-1">Cancella tutto</span>
        </button>
      </div>
      <div className="mt-4 bg-gray-100 rounded-lg p-4 overflow-auto flex-1">
        {cart.map((item, index) => {
          console.log(item);
          return (
            <div
              key={index}
              className="rounded-lg border border-black/20 p-2 flex flex-row space-x-3 bg-white"
              style={{ marginTop: index === 0 ? 0 : 10 }}
            >
              <div className="border rounded-lg border-black/20 flex items-center justify-center p-4">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-20 h-20 rounded-full"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="my-1 text-base font-bold text-main-1">
                  {currencies[item.currency]}
                  {item.totalPrice.toFixed(2)}
                </p>
                {item.extras.map((extra) => (
                  <div
                    key={extra._id}
                    className="flex flex-row items-center justify-between"
                  >
                    <span className="text-xs text-black/70">
                      • {extra.title}
                    </span>
                    <span className="text-xs font-bold">
                      {currencies[item.currency]}
                      {extra.price.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex flex-row items-end justify-between flex-1 pt-2">
                  <div className="flex flex-row items-center space-x-2">
                    <button
                      disabled={loading}
                      onClick={() => {
                        if (item.amount === 1) {
                          deleteFromCart(item._id);
                        } else {
                          handleUpdateCartItem(item._id, item.amount - 1);
                        }
                      }}
                      className="p-2 rounded-full border border-black/20"
                    >
                      <Image
                        src="/icons/minus.png"
                        alt="Meno"
                        width={12}
                        height={12}
                      />
                    </button>
                    <span className="underline">{item.amount}</span>
                    <button
                      disabled={loading}
                      onClick={() =>
                        handleUpdateCartItem(item._id, item.amount + 1)
                      }
                      className="p-2 rounded-full border border-black/20"
                    >
                      <Image
                        src="/icons/add.png"
                        alt="Aggiungi"
                        width={12}
                        height={12}
                      />
                    </button>
                  </div>
                  <button
                    onClick={() => deleteFromCart(item._id)}
                    className="p-2 rounded-full border border-black/20"
                  >
                    <Image
                      src="/icons/close.png"
                      alt="Chiudi"
                      width={12}
                      height={12}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={handleCreateOrder}
        disabled={!cart.length || loading}
        className={`mt-4 px-4 py-3 rounded-lg ${
          !cart.length ? "bg-gray-400" : "bg-main-1"
        } shadow-sm`}
      >
        <span className="text-white text-center">
          Acquista
          {cart.length > 0
            ? ` | ${currencies[cart[0].currency]}${cart
                .reduce((acc, item) => acc + item.totalPrice, 0)
                .toFixed(2)}`
            : ""}
        </span>
      </button>
    </div>
  );
};

export default Cart;
