"use client";

import { useUser } from "@context/UserContext";
import Login from "@pages/Login";

const ScreenTemplate = ({ children }) => {
  const userContext = useUser();
  if (!userContext) return null;

  const { user } = userContext;

  if (user?.userID) return children;

  return <Login />;
};

export default ScreenTemplate;
