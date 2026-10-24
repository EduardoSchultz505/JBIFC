import { Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Jogar from "./pages/Jogar";


export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/jogar" element={<Jogar />} />
      </Routes>
      <Footer />
    </>
  );
}