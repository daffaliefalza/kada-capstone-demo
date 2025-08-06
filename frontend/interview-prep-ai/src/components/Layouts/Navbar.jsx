import React, { useContext } from "react";
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import { UserContext } from "../../context/userContext";

const Navbar = () => {
  const { user } = useContext(UserContext);

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200/60">
      <nav className="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <a href="/features" className="-m-1.5 p-1.5">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Hired Ready
            </span>
          </a>
        </div>

        {/* Profile or Loading */}
        {user ? <ProfileInfoCard /> : <p>Loading...</p>}
      </nav>
    </header>
  );
};

export default Navbar;