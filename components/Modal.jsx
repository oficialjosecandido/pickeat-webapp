"use client";
import { useModal } from "@context/ModalContext";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const Modal = () => {
  const { modals, closeModal } = useModal();
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (modals.length > 0) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    document.activeElement.blur();

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [modals.length]);

  useEffect(() => {
    if (modals.length > 0) {
      setStartAnimation(true);
    } else {
      setStartAnimation(false);
    }
  }, [modals.length]);

  if (modals.length === 0) return null;

  return modals.map((modal) =>
    ReactDOM.createPortal(
      <div
        key={modal.id}
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            closeModal(modal.id);
          }
        }}
        className="h-full w-full flex justify-center items-center fixed left-0 top-0 right-0 bottom-0 z-50 bg-black bg-opacity-40 transition-all duration-500 ease-in-out"
        style={{
          opacity: startAnimation ? 1 : 0,
        }}
      >
        <div
          className="transition-all duration-500 ease-in-out w-full flex flex-col items-center max-h-[100vh] overflow-y-auto"
          style={{
            transform: `translateY(${startAnimation ? 0 : 100}%)`,
          }}
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              closeModal(modal.id);
            }
          }}
        >
          {modal.content}
        </div>
      </div>,
      document.body
    )
  );
};

export default Modal;
