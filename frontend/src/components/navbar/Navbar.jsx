import { BiUserCircle } from "react-icons/bi";
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <>
      <nav className="w-screen flex justify-between items-center py-4 px-6 md:px-10 text-neutral-200">
        {/* LOGO */}
        <Link to="/">
          <span className="text-3xl md:text-4xl font-bold uppercase font-beba">
            aveny
          </span>
        </Link>

        {/* NAV LINKS (DESKTOP) */}
        <ul className="hidden md:flex gap-6 cursor-pointer">
          <Link className="transition-all duration-300 hover:text-white hover:-translate-y-[2px]" to="/">
            Acceuil
          </Link>
          <Link className="transition-all duration-300 hover:text-white hover:-translate-y-[2px]" to="/about">
            A propos
          </Link>
          <Link className="transition-all duration-300 hover:text-white hover:-translate-y-[2px]" to="/contact">
            Contact
          </Link>
          <Link className="transition-all duration-300 hover:text-white hover:-translate-y-[2px]" to="/equip">
            Equipe
          </Link>
        </ul>

        {/* LOGIN BUTTON */}
        <Link
          to="/sign-in"
          className="
            border-2 border-neutral-200 rounded-full py-1 px-3 
            flex gap-1 items-center
            text-sm md:text-base
            transition-all duration-300 ease-out
            hover:bg-neutral-200 hover:text-neutral-900 hover:shadow-lg hover:scale-[1.05]
          "
        >
          <span>Se connecter</span>
          <BiUserCircle size={22} className="transition-transform duration-300 group-hover:scale-110" />
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
