"use client";
import { useData } from "@context/DataContext";
import React, { useEffect } from "react";

const Redirector = ({ stadium_name }) => {
  const dataContext = useData();
  if (!dataContext) return null;

  const { getStadium } = dataContext;

  const handleRedirect = async () => {
    try {
      const stadiums = await getStadium({
        longitude: 12,
        latitude: 44,
      });

      const stadium_match = stadiums.find(
        (stadium) =>
          stadium.title.toLowerCase().replaceAll(" ", "-") === stadium_name ||
          stadium.identifier === stadium_name
      );

      if (stadium_match) {
        window.location.href = `/menu/${stadium_match._id}`;
      } else {
        window.location.href = "/404";
      }
    } catch (error) {
      alert("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    handleRedirect();
  }, []);

  <div className="h-screen flex items-center justify-center">
    Hold on while we redirect you...
  </div>;
};

export default Redirector;
