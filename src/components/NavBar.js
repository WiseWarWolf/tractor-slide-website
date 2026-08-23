import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./NavBar.css";

// Change this to rename the site in the top-left.
const SITE_NAME = "The Shed";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Following a link closes the mobile menu.
  useEffect(() => setOpen(false), [location.pathname]);

  // Escape closes it too, for anyone on a keyboard.
  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link className="navbar-brand" to="/">
          <span role="img" aria-hidden="true">
            🚜
          </span>
          {SITE_NAME}
        </Link>

        <button
          type="button"
          className={`navbar-burger${open ? " is-open" : ""}`}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="navbar-menu"
        >
          <span className="burger-bar" />
          <span className="burger-bar" />
          <span className="burger-bar" />
        </button>

        <nav
          id="navbar-menu"
          className={`navbar-menu${open ? " is-open" : ""}`}
          aria-label="Main"
        >
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? "navbar-link is-current" : "navbar-link"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
