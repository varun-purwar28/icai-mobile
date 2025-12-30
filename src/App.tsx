import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Forum from "./pages/Forum";
import ForumDetail from "./pages/ForumDetail";
import Publications from "./pages/Publications";
import Events from "./pages/Events";
import Announcements from "./pages/Announcements";
import Helpdesk from "./pages/Helpdesk";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ContentManagement from "./pages/admin/ContentManagement";
import ContentEditor from "./pages/admin/ContentEditor";
import UserManagement from "./pages/admin/UserManagement";
import ForumModeration from "./pages/admin/ForumModeration";
import AuditLogs from "./pages/admin/AuditLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/:id" element={<ForumDetail />} />
              <Route path="/publications" element={<Publications />} />
              <Route path="/events" element={<Events />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/helpdesk" element={<Helpdesk />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/publications" element={<ContentManagement />} />
              <Route path="/admin/events" element={<ContentManagement />} />
              <Route path="/admin/announcements" element={<ContentManagement />} />
              <Route path="/admin/publications/:id" element={<ContentEditor />} />
              <Route path="/admin/events/:id" element={<ContentEditor />} />
              <Route path="/admin/announcements/:id" element={<ContentEditor />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/moderation" element={<ForumModeration />} />
              <Route path="/admin/forum" element={<ForumModeration />} />
              <Route path="/admin/helpdesk" element={<Helpdesk />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
