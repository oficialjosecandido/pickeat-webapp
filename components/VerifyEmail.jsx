import { useModal } from "@context/ModalContext";
import React, { useEffect, useState } from "react";
import useDigitInput from "react-digit-input";
import { toast } from "react-toastify";

const VerifyEmail = ({
  modalId,
  email,
  verifyEmail,
  resentVerificationEmail,
}) => {
  const { closeModal } = useModal();

  const [value, onChange] = useState("");
  const digits = useDigitInput({
    acceptedCharacters: /^[0-9]$/,
    length: 6,
    value,
    onChange,
  });

  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      if (digits.length !== 6) throw new Error("Codice non valido.");
      await verifyEmail(email, value);
      closeModal(modalId);

      toast.success("Email verificata con successo.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    setLoading(true);
    try {
      await resentVerificationEmail(email);
      setCounter(60);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (counter === 0) return;
    const timer = setTimeout(() => {
      setCounter(counter - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [counter]);

  return (
    <div className="max-w-xs w-full bg-white rounded shadow">
      <div className="p-4 flex items-center justify-between font-semibold text-sm">
        Verifica la tua Email
        <button
          type="button"
          className="text-main font-semibold"
          onClick={() => closeModal(modalId)}
        >
          <img
            className="h-4 w-4 object-contain"
            src="/icons/close.png"
            alt="chiudi"
          />
        </button>
      </div>
      <p className="text-xs mt-2 text-black/70 text-center">
        Inserisci il codice di 6 cifre inviato a
      </p>
      <p className="text-center text-xs underline">{email}</p>
      <div className="flex items-center justify-evenly py-4">
        <input
          className="border w-10 h-14 outline-none focus:border-main-1 bg-main-1/10 text-center rounded-md"
          inputMode="decimal"
          autoFocus
          {...digits[0]}
        />
        <input
          className="border w-10 h-14 outline-none focus:border-main-1 bg-main-1/10 text-center rounded-md"
          inputMode="decimal"
          {...digits[1]}
        />
        <input
          className="border w-10 h-14 outline-none focus:border-main-1 bg-main-1/10 text-center rounded-md"
          inputMode="decimal"
          {...digits[2]}
        />
        <input
          className="border w-10 h-14 outline-none focus:border-main-1 bg-main-1/10 text-center rounded-md"
          inputMode="decimal"
          {...digits[3]}
        />
        <input
          className="border w-10 h-14 outline-none focus:border-main-1 bg-main-1/10 text-center rounded-md"
          inputMode="decimal"
          {...digits[4]}
        />
        <input
          className="border w-10 h-14 outline-none focus:border-main-1 bg-main-1/10 text-center rounded-md"
          inputMode="decimal"
          {...digits[5]}
        />
      </div>
      <button
        type="button"
        onClick={resendEmail}
        disabled={counter > 0}
        className="mt-2 mb-4 py-2 px-4 font-semibold text-xs text-main-1 w-full"
      >
        {counter > 0 ? `Invia di nuovo tra ${counter}s` : `Reinvia Email`}
      </button>

      <div className="p-4 pt-0">
        <button
          type="button"
          className={`p-2 rounded ${
            loading ? "bg-main-1/50" : "bg-main-1"
          } w-full text-white font-semibold`}
          onClick={handleVerify}
          disabled={loading}
        >
          Verifica
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
