import { Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";


export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </>
  );
}