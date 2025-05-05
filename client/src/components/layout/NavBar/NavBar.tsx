import { useState, useEffect, useRef } from "react";
import { useUser } from "../../../context/UserContext";
import { api } from "../../../utils/axiosInstance";
import "./NavBar.scss";

const Navbar = () => {
  const { user } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null); // Reference to the dropdown

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const avatarUrl =
    user && user.avatarUrl.startsWith("http")
      ? user.avatarUrl
      : user
        ? import.meta.env.VITE_BACKEND_DOMAIN + user.avatarUrl
        : "";

  const username = user && user.username;

  const logOut = () => {
    api.delete("/auth/logout").then(() => {
      window.location.href = "/login";
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="logo">
        <a href="/">nettleship.net</a>
      </div>
      <div className="nav-links">
        {!user ? (
          <>
            <a href="/login">Login</a>
            <a href="/register">/Register</a>
          </>
        ) : (
          <div className="user-avatar" onClick={toggleDropdown}>
            <img src={avatarUrl} alt="User Avatar" />
            {dropdownOpen && (
              <div className="dropdown" ref={dropdownRef}>
                <a href={`/profile/${username}`}>Public Profile</a>
                <a href={`/profile/${username}/edit`}>Edit Profile</a>
                <a onClick={logOut}>Log Out</a>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
