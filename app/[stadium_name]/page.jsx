import Redirector from "@pages/Redirector";
import React from "react";

const page = ({ params }) => {
  const { stadium_name } = params;
  return <Redirector stadium_name={stadium_name} />;
};

export default page;
