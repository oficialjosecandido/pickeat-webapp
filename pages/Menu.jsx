"use client";
import Button from "@components/Button";
import OrderMenu from "@components/OrderMenu";
import { useData } from "@context/DataContext";
import { useModal } from "@context/ModalContext";
import { useUser } from "@context/UserContext";
import Image from "next/image";
import { useEffect, useState } from "react";

const Menu = ({ stadiumID }) => {
  const modalContext = useModal();
  const dataContext = useData();
  const userContext = useUser();
  if (!modalContext || !dataContext || !userContext) return null;
  const { openModal } = modalContext;
  const { getMenuItems, currencies } = dataContext;

  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);

  const [search, setSearch] = useState("");

  const handleAddFood = (product) => {
    const [modalId, updateModalContent] = openModal(<OrderMenu />);
    updateModalContent(<OrderMenu item={product} modalId={modalId} />);
  };

  useEffect(() => {
    const fetchMenu = async () => {
      setMenuLoading(true);
      try {
        const menus = await getMenuItems(stadiumID);
        setMenu(menus);
      } catch (error) {
        console.error(
          `Errore nel recupero degli elementi del menu: ${error.message}`
        );
      } finally {
        setMenuLoading(false);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    if (search.length === 0) {
      setFilteredMenu(menu);
    } else {
      setFilteredMenu(
        menu.filter((item) =>
          item.title.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, menu]);

  return (
    <div className="flex flex-col">
      <div className="relative flex items-center mb-4">
        <Image
          className="absolute left-3"
          src="/icons/search.png"
          alt="cerca"
          width={20}
          height={20}
        />
        <input
          className="text-black/70 py-2 pl-10 pr-4 rounded-full focus:outline-none w-full md:w-auto"
          type="text"
          placeholder="Cerca"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="h-[70vh] w-full overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-6">
          {filteredMenu.map((menu) => {
            return (
              <div
                key={menu._id}
                className="flex flex-row md:flex-col items-start justify-center bg-white p-4 rounded-lg shadow-md gap-4 relative"
              >
                <img
                  className="rounded-lg h-32 w-32 h-full object-contain"
                  src={menu.imageUrl}
                  alt={menu.name}
                />
                <div className="h-full flex flex-col flex-1">
                  <h3 className="font-semibold text-left">{menu.title}</h3>
                  <p className="text-black/70 text-sm mt-2 mb-10">
                    {menu.description}
                  </p>
                  <div className="flex items-center justify-between w-full">
                    <div className="font-bold text-2xl md:text-lg">
                      {currencies[menu.currency]}
                      {menu.price ||
                        //get lowest price from extras
                        (menu.extras.length > 0 &&
                          Math.min(...menu.extras.map((extra) => extra.price)))}
                    </div>
                    <Button
                      className={
                        "rounded-lg shadow opacity-80 flex items-center gap-2 px-2 md:px-6"
                      }
                      theme="container"
                      onClick={() => handleAddFood(menu)}
                    >
                      <Image
                        src="/icons/add.png"
                        alt="aggiungi"
                        width={14}
                        height={14}
                      />
                      <span className="hidden md:block font-semibold">
                        Aggiungi
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Menu;
