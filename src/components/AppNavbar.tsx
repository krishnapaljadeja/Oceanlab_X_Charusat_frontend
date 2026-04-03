import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function navStyle(active: boolean) {
  return {
    background: active ? "rgba(255,217,61,0.12)" : "#1a1a1a",
    border: active ? "1px solid rgba(255,217,61,0.45)" : "1px solid #2d2d2d",
    color: active ? "#FFD93D" : "#a0a0a0",
  };
}

export default function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, signOut } = useAuth();

  const isAnalyze =
    location.pathname === "/" || location.pathname === "/analyze";
  const isIngest = location.pathname.startsWith("/ingest");
  const isLogin = location.pathname === "/login";
  const isSignup = location.pathname === "/signup";

  return (
    <header
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(96vw,980px)]"
      style={{
        background: "rgba(10,10,10,0.9)",
        border: "1px solid #2a2a2a",
        borderRadius: "999px",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="px-4 py-2 flex items-center justify-between gap-3">
        <p
          className="text-sm uppercase tracking-[0.16em]"
          style={{ color: "#cfcfcf", fontFamily: "'Bebas Neue', cursive" }}
        >
          Git History Storyteller
        </p>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="px-3 py-1.5 text-xs rounded-full"
            style={navStyle(isAnalyze)}
          >
            Analyze
          </Link>
          <Link
            to="/ingest"
            className="px-3 py-1.5 text-xs rounded-full"
            style={navStyle(isIngest)}
          >
            Ingest
          </Link>

          {!session && (
            <>
              <Link
                to="/signup"
                className="px-3 py-1.5 text-xs rounded-full"
                style={navStyle(isSignup)}
              >
                Signup
              </Link>
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs rounded-full"
                style={navStyle(isLogin)}
              >
                Login
              </Link>
            </>
          )}

          {session && (
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
              className="px-3 py-1.5 text-xs rounded-full"
              style={{
                background: "rgba(255,107,157,0.12)",
                border: "1px solid rgba(255,107,157,0.35)",
                color: "#FF8FB2",
              }}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
