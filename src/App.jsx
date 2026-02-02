// 1. HashRouter-ah import pannunga
import { HashRouter, Routes, Route, Navigate } from "react-router-dom"; 
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isAdmin = token && role === 'ADMIN';

  return (
   
    <HashRouter>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/login" element={<AdminLogin />} />
        
        <Route 
          path="/dashboard" 
          element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} 
        />
        
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;