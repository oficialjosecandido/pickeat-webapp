"use client";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";

const modalContext = createContext();
export const useModal = () => useContext(modalContext);

const ConfirmationContent = ({
  closeModal,
  reject,
  resolve,
  title,
  sentence,
}) => {
  return (
    <div
      tabIndex={-1}
      className="max-w-md p-6 rounded shadow bg-white focus:outline-none"
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2">{sentence}</p>
      <div className="flex justify-end gap-4 mt-4">
        <button
          className="btn-secondary"
          onClick={() => {
            closeModal();
            reject();
          }}
        >
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            closeModal();
            resolve();
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

const ModalContext = ({ children }) => {
  const pathname = usePathname();
  const [modals, setModals] = useState([]);

  const displayImage = (src, restaurant) => {
    const [modalId, updateModalContent] = openModal(
      <Zoom>
        <img
          src={src}
          alt={restaurant}
          style={{ width: "100%", height: "auto" }}
        />
      </Zoom>
    );
    updateModalContent(
      <Zoom>
        <img
          src={src}
          alt={restaurant}
          style={{ width: "100%", height: "auto" }}
        />
      </Zoom>
    );
  };

  const openModal = (content) => {
    const newModalId = generateUniqueId();
    const newModal = { id: newModalId, content };

    setModals((prevModals) => [...prevModals, newModal]);

    const updateModalContent = (newContent) => {
      setModals((prevModals) =>
        prevModals.map((modal) =>
          modal.id === newModalId ? { ...modal, content: newContent } : modal
        )
      );
    };

    return [newModalId, updateModalContent];
  };

  const updateModalContent = (newContent, id) => {
    setModals((prevModals) => {
      if (!id && prevModals.length > 0) {
        id = prevModals[prevModals.length - 1].id;
      }

      if (prevModals.length === 0) {
        const newModalId = generateUniqueId();
        return [{ id: newModalId, content: newContent }];
      }

      return prevModals.map((modal) =>
        modal.id === id ? { ...modal, content: newContent } : modal
      );
    });
  };

  const closeModal = (id) => {
    if (!id && modals.length > 0) {
      id = modals[modals.length - 1].id;
    }
    setModals((prevModals) => prevModals.filter((modal) => modal.id !== id));
  };

  const confirmationModal = (title, sentence) => {
    return new Promise((resolve, reject) => {
      const [modalId, updateModalContent] = openModal(<ConfirmationContent />);
      updateModalContent(
        <ConfirmationContent
          closeModal={() => closeModal(modalId)}
          reject={reject}
          resolve={resolve}
          title={title}
          sentence={sentence}
        />
      );
    });
  };

  useEffect(() => {
    setModals([]);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modals]);

  const provided = {
    openModal,
    closeModal,
    updateModalContent,
    confirmationModal,
    modals,
    displayImage,
  };

  return (
    <modalContext.Provider value={provided}>{children}</modalContext.Provider>
  );
};

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export default ModalContext;
