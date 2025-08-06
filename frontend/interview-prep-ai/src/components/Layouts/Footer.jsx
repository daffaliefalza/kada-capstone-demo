import React, { useContext } from "react";

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 mt-20">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Deadline Warrior. All rights reserved.
          </p>
        </div>
      </footer>
    )
}

export default Footer;