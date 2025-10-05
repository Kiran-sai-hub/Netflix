import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between p-4 h-20">
      <div className="flex items-center gap-10 z-50">
        <Link to="/">
          <img src="/netflix-logo.png" alt="Netflix Logo" className="w-32 sm:w-40" />
        </Link>

        <div className="hidden sm:flex gap-2 items-center">
          <Link to="/" className="hover:text-red-500 m-1">
            Movies
          </Link>
          <Link to="/" className="hover:text-red-500 m-1">
            TV Shows
          </Link>
          <Link to="/history" className="hover:text-red-500 m-1">
            Search History
          </Link>
        </div>
      </div>

      <div>
        
      </div>
    </header>
  );
};

export default Navbar;
