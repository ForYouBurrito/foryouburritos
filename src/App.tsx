import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminEdit from "./pages/admin/AdminEdit";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminForms from "./pages/admin/AdminForms";
import AdminSeo from "./pages/admin/AdminSeo";
import Catering from "./pages/Catering";
import Index from "./pages/Index";
import Kontakt from "./pages/Kontakt";
import Meny from "./pages/Meny";
import NotFound from "./pages/NotFound";
import OmOss from "./pages/OmOss";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Every route change starts at the top of the page. */}
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/meny" element={<Meny />} />
          <Route path="/catering" element={<Catering />} />
          <Route path="/om-oss" element={<OmOss />} />
          <Route path="/kontakt" element={<Kontakt />} />
          {/* Admin. The real guard is RLS — these routes only gate the UI.
              /admin lands on the visual editor; the form is a side trip. */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/edit" replace />} />
          <Route path="/admin/edit" element={<AdminEdit />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/forms" element={<AdminForms />} />
          <Route path="/admin/seo" element={<AdminSeo />} />
          {/* Keep the catch-all last. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
