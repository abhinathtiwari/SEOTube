import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import User from "./pages/User";
import RecentVideos from "./pages/RecentVideos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/user" element={<User />} />
        <Route path="/recent" element={<RecentVideos />} />
      </Routes>
    </BrowserRouter>
  );
}
