import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  function handleLogout() {
    // delete token cookie and go to login
    document.cookie = "token=; Max-Age=0; path=/;";
    navigate("/");
  }

  const location = useLocation();

  return (
    <div className="app-container">
      <header className="site-header">
        <div className="site-title">
          <h2>
            SEO<span style={{ color: "red" }}>Tube</span>
          </h2>
          {/* <div className="site-tagline muted">Let AI handle your underperforming YouTube videos ❤️</div> */}
        </div>
        <nav>
          {location.pathname !== "/" && (
           <button onClick={()=>navigate("/user")} className="btn btn-ghost">
            👤
          </button>
          )}
          {location.pathname !== "/" && (
            <button onClick={handleLogout} className="btn btn-ghost">
              Logout
            </button>
          )}
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
