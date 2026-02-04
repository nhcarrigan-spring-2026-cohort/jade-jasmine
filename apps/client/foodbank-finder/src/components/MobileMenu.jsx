import { useState } from "react";
import { BsSearch, BsList, BsX } from "react-icons/bs";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mobile-menu-container">
      <button onClick={() => setIsOpen(!isOpen)}>{isOpen  ? <BsX /> : <BsList />}</button>

      {isOpen && (
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="#"><BsSearch />Search</a></li>
      </ul>
      )}
    </div>
  );
}