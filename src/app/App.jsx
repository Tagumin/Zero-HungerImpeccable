import { Routes, Route } from "react-router-dom";
import Providers from "./providers";
import HomePage from "@/pages/HomePage";
import DiseaseCarePage from "@/pages/DiseaseCarePage";
import DistributionMapPage from "@/pages/DistributionMapPage";
import CostOptimizerPage from "@/pages/CostOptimizerPage";

export default function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/disease-care" element={<DiseaseCarePage />} />
        <Route path="/distribution-map" element={<DistributionMapPage />} />
        <Route path="/cost-optimizer" element={<CostOptimizerPage />} />
      </Routes>
    </Providers>
  );
}
