import { useState } from "react";
import Image from "next/image";

const ApplyCoupons = ({ onApply, onCancel, coupons }) => {
  const [selectedCoupon, setSelectedCoupon] = useState("");

  return (
    <div className="bg-white rounded max-w-[80%] m-auto w-full relative p-4">
      <button
        onClick={onCancel}
        className="p-2 rounded-full absolute top-3 right-3 bg-main-1"
      >
        <Image
          src="/icons/close.png"
          alt="Chiudi"
          width={12}
          height={12}
          className="h-3 w-3"
          style={{ filter: "invert(1)" }}
        />
      </button>
      <h2 className="font-bold text-center py-4 border-b border-black/10">
        Scegli il Coupon
      </h2>
      {coupons.map((coupon, index) => (
        <button
          key={index}
          onClick={() => setSelectedCoupon(coupon._id)}
          className={`p-4 border-b border-black/10 flex flex-row items-center justify-between ${
            coupon._id === selectedCoupon
              ? "bg-main-1 text-white"
              : "bg-white text-black"
          }`}
        >
          <span className="text-center font-semibold">{coupon.code}</span>
          <span className="text-center font-semibold">
            {coupon.discountType === "fixed"
              ? `€${coupon.discountValue}`
              : `${coupon.discountValue}%`}
          </span>
        </button>
      ))}
      <div className="px-4 space-y-4 py-4">
        <button
          onClick={() => onApply(selectedCoupon)}
          className="bg-white py-2 rounded-lg w-full border border-main-1"
        >
          <span className="text-main-1 text-center font-semibold">Applica</span>
        </button>
      </div>
    </div>
  );
};

export default ApplyCoupons;
