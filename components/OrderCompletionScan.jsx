"use client";
import React from "react";
import { useModal } from "../context/ModalContext";
import { QRCodeSVG } from "qrcode.react";

const OrderCompletionScan = ({ orderId, id, modalId }) => {
  const modalContext = useModal();

  if (!modalContext) return null;

  const { closeModal } = modalContext;
  return (
    <div className="p-4 bg-white max-w-[90%] mx-auto rounded relative">
      <button
        onClick={() => closeModal(modalId)}
        className="absolute top-2 right-2 p-1 z-10"
      >
        <img src="/icons/close.png" alt="Chiudi" className="h-4 w-4" />
      </button>
      <p className="font-bold text-lg text-center">{orderId}</p>
      <p className="font-bold text-xs text-center py-2">
        Scansiona il codice QR per completare il tuo ordine
      </p>
      <div className="h-80 w-80 mx-auto flex items-center justify-center">
        <QRCodeSVG value={id} height={250} width={250} />,
      </div>
    </div>
  );
};

export default OrderCompletionScan;
