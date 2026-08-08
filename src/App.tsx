import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Landing from "./pages/Landing";
import Setup from "./pages/Setup";
import Rules from "./pages/Rules";
import PlayPage from "./pages/Play";
import RoomPage from "./pages/Room";
import NotFound from "./pages/NotFound";
import { LoadingScreen } from "@/components/LoadingScreen";

const queryClient = new QueryClient();

const App = () => {
  const [booting, setBooting] = useState(true);
  return (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/start" element={<Setup />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/room/:code" element={<RoomPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    <Toaster />
    {booting && <LoadingScreen onDone={() => setBooting(false)} />}
  </QueryClientProvider>
  );
};

export default App;
