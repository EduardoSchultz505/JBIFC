import { Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Jogar from "./pages/Jogar";
import Ranking from "./pages/Ranking";
import Equipe from "./pages/Equipe";
import Tutorial from "./pages/Tutorial";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/jogar" element={<Jogar />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/equipe" element={<Equipe />} />
        <Route path="/tutorial" element={<Tutorial />} />
      </Routes>
      <Footer />
    </>
  );
}