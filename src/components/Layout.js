import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

// Wraps every page so the nav bar is shared rather than repeated per screen.
export default function Layout() {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
