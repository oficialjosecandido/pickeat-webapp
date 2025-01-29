"use client";
import { useData } from "@context/DataContext";
import { useModal } from "@context/ModalContext";
import { useUser } from "@context/UserContext";
import React, { useEffect, useState } from "react";

const OrderMenu = ({ modalId, item }) => {
  const modalContext = useModal();
  const dataContext = useData();
  const userContext = useUser();

  if (!modalContext || !dataContext || !userContext) return null;

  const { closeModal, displayImage } = modalContext;
  const { currencies } = dataContext;
  const { addToCart } = userContext;


  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(item.price * 1);
  const [notes, setNotes] = useState("");

  const finish = async () => {
    
    try {
      setLoading(true);
  
      
  
      await addToCart({
        ...item,
        amount: orderNumber,
        extras: additions
          .filter((index) => item.extras[index] !== undefined)
          .map((index) => item.extras[index]),
        totalPrice: parseFloat(totalPrice),
        notes,
      });
    } catch (error) {
      alert("Errore nell'aggiunta al carrello. Riprova.");
      console.error("Errore nell'aggiunta al carrello da OrderMenu:", error);
    } finally {
      setLoading(false);
      closeModal(modalId);
    }
  };
  

  const [orderNumber, setOrderNumber] = useState(1);
  const [additions, setAdditions] = useState(item.multiOptions ? [] : [0]);

  useEffect(() => {
    const totalAdditions =
      additions.reduce((acc, index) => acc + item.extras[index]?.price, 0) || 0;
    setTotalPrice(((item.price + totalAdditions) * orderNumber).toFixed(2));
  }, [orderNumber, additions]);

  console.log(item);

  return (
    <div className="bg-white border border-black/20 rounded-2xl h-full w-full max-h-screen overflow-auto py-10 px-5">
      <div className="flex justify-end">
        <button className="p-2" onClick={() => closeModal(modalId)}>
          <img className="h-3 w-3" src="/icons/close.png" alt="chiudi" />
        </button>
      </div>

      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center space-x-2">
          <img
            src={item.imageUrl}
            className="h-20 w-20 rounded-full"
            alt={item.title}
          />
          <p className="text-[16px] font-bold">{item.title}</p>
        </div>
        <div className="flex p-1 items-center space-x-2 bg-gray-200 rounded-full">
          <button
            disabled={orderNumber === 1}
            className="p-1 rounded-full bg-white h-5 w-5 flex items-center justify-center disabled:opacity-50"
            onClick={() =>
              setOrderNumber((prev) => (prev - 1 < 1 ? 1 : prev - 1))
            }
          >
            <img
              className="h-full w-full object-contain"
              src="/icons/minus.png"
              alt="meno"
            />
          </button>
          <p>{orderNumber}</p>
          <button
            className="p-1 rounded-full bg-white h-5 w-5 flex items-center justify-center"
            onClick={() => setOrderNumber((prev) => prev + 1)}
          >
            <img
              className="h-full w-full object-contain"
              src="/icons/add.png"
              alt="aggiungi"
            />
          </button>
        </div>
      </div>
      <p className="text-sm text-black/70">{item.description}</p>
      <div className="flex flex-col py-4">
        <h2 className="font-semibold">Ingredienti</h2>
        <p className="text-black/70 whitespace-pre-line">
          {item.ingredients.map((ingredient) => `▶ ${ingredient}`).join("\n")}
        </p>
      </div>
      <button
        onClick={() =>
          displayImage(
            `https://pickeat.blob.core.windows.net/allegerics/${item.restaurant}.png`,
            item.restaurant
          )
        }
        className="py-2 border-t border-b border-black/10 w-full text-left flex items-center gap-2"
        type="button"
      >
        <div className="h-6 w-6 p-1 bg-main-1/10 rounded-lg">
          <img
            className="h-full w-full object-contain"
            src="/icons/allergenic.png"
            alt="allergenico"
          />
        </div>
        Informazioni su Allergeni e Valori Nutrizionali
      </button>
      {item?.extras && item?.extras?.length > 0 && (
        <div className="flex flex-col py-4">
          <h2 className="font-semibold">Extra</h2>
          <p className="text-black/70 whitespace-pre-line">
            {item.extras.map((extra, index) => {
              const multiOptions = item?.multiOptions;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex flex-1">
                    <input
                      type={multiOptions ? "checkbox" : "radio"}
                      id={`extra-${index}`}
                      checked={additions.includes(index)} // Control the checked status
                      onChange={() => {
                        if (multiOptions) {
                          setAdditions((prev) =>
                            prev.includes(index)
                              ? prev.filter((i) => i !== index)
                              : [...prev, index]
                          );
                        } else {
                          setAdditions([index]);
                        }
                      }}
                    />
                    <label
                      className="ml-2 text-black/70 flex-1"
                      htmlFor={`extra-${index}`}
                    >
                      {extra.title}
                    </label>
                  </div>
                  {extra.price > 0 ? (
                    <div className="flex items-center space-x-2">
                      <p className="text-[16px] font-bold">
                        {currencies[item.currency]}
                        {extra.price.toFixed(2)}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </p>
        </div>
      )}
      <div className="flex flex-col py-4">
        <h2 className="font-semibold">Note</h2>
        <textarea
          className="p-2 border border-black/10 rounded-lg"
          placeholder={
            item.notesPlaceholder
              ? item.notesPlaceholder
              : "Aggiungi qui note speciali..."
          }
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between py-4">
        <button
          className="p-1 rounded-full bg-main-1 w-full py-3 text-white font-bold"
          onClick={finish}
        >
          {loading
            ? "Aggiungendo al carrello..."
            : `Aggiungi al carrello | ${
                currencies[item.currency]
              }${totalPrice}`}
        </button>
      </div>
    </div>
  );
};

export default OrderMenu;
