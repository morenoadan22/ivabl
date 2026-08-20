import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Schedule from "./pages/Schedule.jsx";
import Standings from "./pages/Standings.jsx";
import Statistics from "./pages/Statistics.jsx";
import Live from "./pages/Live.jsx";
import Sponsors from "./pages/Sponsors.jsx";
import Rules from "./pages/Rules.jsx";
import Locations from "./pages/Locations.jsx";
import TeamPage from "./pages/TeamPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Schedule />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/live" element={<Live />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/team/:slug" element={<TeamPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
