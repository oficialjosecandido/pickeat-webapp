"use client";
import React, { useEffect } from "react";
import { useModal } from "../context/ModalContext";
import { useUser } from "../context/UserContext";
import moment from "moment";
import { useData } from "../context/DataContext";
import OrderCompletionScan from "@components/OrderCompletionScan";

const EmptyOrders = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      <p className="font-semibold">Non sono stati trovati ordini attuali</p>
      <button class="bg-white p-2 rounded-full shadow border hover:opacity-80" style={{ padding: "10px", margin: "10px" }}>Aggiornamento</button>
    </div>
  );
};

const Orders = () => {
  const modalContext = useModal();
  const userContext = useUser();
  const dataContext = useData();

  if (!modalContext || !userContext || !dataContext) return null;

  const { openModal, closeModal } = modalContext;
  const { socket, orders } = userContext;
  const { currencies } = dataContext;

  const handleScanBarcode = (orderId, id) => {
    const [modalId, updateModalContent] = openModal(
      <OrderCompletionScan id={id} orderId={orderId} />
    );
    updateModalContent(
      <OrderCompletionScan id={id} orderId={orderId} modalId={modalId} />
    );
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("order_is_ready", () => {
      setTimeout(() => {
        closeModal();
      }, 500);
    });

    return () => {
      socket.off("order_is_ready");
    };
  }, [socket]);

  if (orders.length === 0) {
    console.log(1)
    return <EmptyOrders />;
  }

  return (
    <div className="flex-1 overflow-auto">
      {orders.map((order, index) => (
        <div key={index} className="rounded-lg border p-2 bg-gray-100 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">{`Ordine: ${order.orderID}`}</p>
            {order.status === "ready" ? (
              <button
                onClick={() => handleScanBarcode(order.orderID, order._id)}
              >
                <img
                  src="/icons/barcode.png"
                  alt="Scansiona Codice a Barre"
                  className="h-5 w-5"
                />
              </button>
            ) : (
              <div className="flex items-center space-x-1">
                <img src="/icons/timer.png" alt="Timer" className="h-5 w-5" />
                <p className="text-xs font-semibold">
                  {moment(order.timeSlot, "HH:mm").fromNow()}
                </p>
              </div>
            )}
          </div>
          {order.items.map((item, index) => {
            return (
              <div
                key={index}
                className={`flex space-x-3 mt-4 pb-4 ${
                  index === order.items.length - 1
                    ? ""
                    : "border-b border-black/10"
                }`}
              >
                <div className="border rounded-lg border-black/10 flex items-center justify-center px-2 py-4 bg-white">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-20 w-20 rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold truncate">{item.title}</p>
                  <p className="my-1 text-base font-bold text-main-1">
                    {`X ${item.quantity} ${currencies[item.currency]} ${
                      item.price * item.quantity
                    }`}
                  </p>
                  <div className="flex flex-row">
                    <div className="flex-1">
                      {item.extras.map((extra) => (
                        <p key={extra._id} className="text-xs text-black/70">
                          • {extra.title}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs font-semibold mt-auto">
                      Quantità: {item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Orders;
