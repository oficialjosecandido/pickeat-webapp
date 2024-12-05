"use client";

import Login from "./Login";
import Image from "next/image";
import { useModal } from "@context/ModalContext";
import { useEffect } from "react";
import { useUser } from "@context/UserContext";

const LoginPopup = ({ modalId }) => {
  const userContext = useUser();
  const modalContext = useModal();

  if (!userContext || !modalContext) return null;

  const { closeModal } = modalContext;
  const { user } = userContext;

  useEffect(() => {
    if (user?.userID) {
      closeModal(modalId);
    }
  }, [user]);

  return (
    <div className="relative">
      <button
        onClick={() => closeModal(modalId)}
        type="button"
        className="absolute top-2 right-2 p-3"
      >
        <Image src="/icons/close.png" alt="Chiudi" width={15} height={15} />
      </button>
      <Login loginWithPopup={true} />
    </div>
  );
};

export default LoginPopup;
