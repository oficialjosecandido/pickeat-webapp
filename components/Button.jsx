import React from "react";

const Button = ({
  theme = "container",
  className,
  children = "",
  ...props
}) => {
  const getTheme = () => {
    switch (theme) {
      case "container":
        return (
          "px-6 py-2 rounded bg-main-1 hover:bg-main-1/70 text-black transition-all duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 " +
          className
        );
      case "outline":
        return (
          "px-6 py-2 rounded text-main-1 hover:bg-main-1 hover:text-black border border-main-1 transition-all duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 " +
          className
        );
      case "dark":
        return (
          "px-6 py-2 rounded bg-black/80 hover:bg-black/100 text-black transition-all duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 " +
          className
        );

      default:
        break;
    }
  };
  return (
    <button {...props} className={getTheme()}>
      {children}
    </button>
  );
};

export default Button;
