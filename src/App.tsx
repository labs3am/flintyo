import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Shutdown from "./pages/Shutdown";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/shutdown" element={<Shutdown />} />
      <Route path="*" element={<Navigate to="/shutdown" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
