import Menu from "@pages/Menu";

const page = ({ params: { stadiumID } }) => {
  return <Menu stadiumID={stadiumID} />;
};

export default page;
