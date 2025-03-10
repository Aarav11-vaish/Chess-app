import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./screen/Landing";
import Game from "./screen/Game";
import Login from "./screen/Login";
import Register from "./screen/Register";
import Dashboard from "./screen/dashboard";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/", { credentials: "include" }) // ✅ Includes session cookies
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Authenticated") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) {
    return <h1>Loading...</h1>; 
  }

  return (
    <div className="bg-slate-930 text-white">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated?  <Dashboard />: <Landing />}
          />
          <Route path="/game" 
           element={isAuthenticated ? <Game /> : <Navigate to="/"/>} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          
        
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/login" /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Login />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
