import { Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Jogar from "./pages/Jogar";
import Ranking from "./pages/Ranking";
import Equipe from "./pages/Equipe";
import Tutorial from "./pages/Tutorial";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/jogar" element={<Jogar />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/equipe" element={<Equipe />} />
        <Route path="/como-jogar" element={<Tutorial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil/:nome" element={<Perfil />} />
      </Routes>
      <Footer />
    </div>
  );
}