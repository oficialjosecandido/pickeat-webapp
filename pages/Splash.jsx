import React from "react";

const Splash = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="h-64 w-64 rounded-full bg-white shadow animate-pulse p-5">
        <img
          className="h-full w-full object-contain"
          src="/media/logo.png"
          alt="logo"
        />
      </div>
    </div>
  );
};

export default Splash;
