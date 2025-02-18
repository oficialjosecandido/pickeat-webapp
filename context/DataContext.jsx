"use client";
import React, { createContext, useContext } from "react";
import api from "@api";

const dataContext = createContext();
export const useData = () => useContext(dataContext);

const currencies = {
  usd: "$",
  eur: "€",
  gbp: "£",
};

const DataContext = ({ children }) => {
  // stadiums
  const getStadium = async (userLocation) => {
    try {
      const { longitude, latitude } = userLocation;
      const { data } = await api.get("/stadiums", {
        params: {
          longitude,
          latitude,
        },
      });
      return data;
    } catch (error) {
      console.error(`Error getting stadiums: ${error.message}`);
      return [];
    }
  };

  const getMenuItems = async (id) => {
    try {
      const { data } = await api.get(`/stadiums/${id}/menu`);
      return data;
    } catch (error) {
      console.error(`Error getting menu items: ${error.message}`);
      return [];
    }
  };

  const getStadiumPickupPoints = async (id) => {
    try {
      const { data } = await api.get(`/stadiums/${id}/pickup-points`);
      return data;
    } catch (error) {
      console.error(`Error getting pickup points: ${error.message}`);
      return [];
    }
  };

  const getStadiumById = async (id) => {
    try {
      const {
        data: { stadium },
      } = await api.get(`/stadiums/${id}`);
      return stadium;
    } catch (error) {
      console.error(`Error getting stadium by ID: ${error.message}`);
      return null;
    }
  };

  // restuarants
  const getAvailableSlots = async (restaurantID ) => {
    try {
      const { data } = await api.post("/stadiums/slots", { restaurantID });
      return data;
    } catch (error) {
      console.error("Error getting available slots", error);
    }
  };

  const provided = {
    // stadiums
    getMenuItems,
    getStadium,
    getStadiumPickupPoints,
    getStadiumById,
    // restuarants
    getAvailableSlots,
    // currencies
    currencies,
  };
  return (
    <dataContext.Provider value={provided}>{children}</dataContext.Provider>
  );
};

export default DataContext;
