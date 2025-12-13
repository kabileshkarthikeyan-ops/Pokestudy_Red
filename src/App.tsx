import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CatchPage from "./pages/CatchPage";
import EvolvePage from "./pages/EvolvePage";
import TradePage from "./pages/TradePage";
import CollectionPage from "./pages/CollectionPage";
import PokedexPage from "./pages/PokedexPage";
import RoamingPage from "./pages/RoamingPage";
import SettingsPage from "./pages/SettingsPage";
import ShopPage from "./pages/ShopPage";
import IncubatorPage from "./pages/IncubatorPage";
import QuestsPage from "./pages/QuestsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/catch" element={<CatchPage />} />
          <Route path="/evolve" element={<EvolvePage />} />
          <Route path="/trade" element={<TradePage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/pokedex" element={<PokedexPage />} />
          <Route path="/roaming" element={<RoamingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/incubator" element={<IncubatorPage />} />
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
