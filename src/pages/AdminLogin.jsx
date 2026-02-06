import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../Services/api';
import { ShieldCheck, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const [data, setData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const errorParam = queryParams.get('error');

  const MAROON = "#4A0404";
  const GOLD = "#D4AF37";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await API.post('/auth/login', data);
      
      const userRole = res.data.user.role.toUpperCase();

      if (userRole !== 'ADMIN') {
        alert(" Access Denied: This portal is for Admins only!");
        setLoading(false);
        return;
      }
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      
      API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      navigate('/dashboard');
      window.location.reload(); 

    } catch (err) {
      const errMsg = err.response?.data?.message || "Login Failed. Please check your credentials.";
      alert(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: MAROON }}>
      <div className="w-full max-w-md">
        
        {errorParam === 'pending_approval' && (
          <div className="mb-6 flex items-center gap-3 bg-amber-500/20 border border-amber-500/50 p-4 rounded-2xl text-amber-100 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} className="shrink-0 text-amber-400" />
            <p className="text-sm font-medium">
              Your account is <strong>pending admin approval</strong>. 
            </p>
          </div>
        )}

        <div className="bg-[#FAF9F6] p-10 rounded-[2.5rem] shadow-2xl border-b-8 border-[#D4AF37]/30">
          <div className="flex flex-col items-center mb-10">
            
            <div className="p-4 rounded-2xl shadow-xl mb-4 border border-[#D4AF37]/20" style={{ backgroundColor: MAROON }}>
              <ShieldCheck className="w-8 h-8" style={{ color: GOLD }} />
            </div>
            
            <h2 className="text-2xl font-black tracking-tighter text-center uppercase" style={{ color: MAROON }}>
               Innovation <span className="text-gray-400 font-serif italic font-medium lowercase">admin</span>
            </h2>
            <div className="w-12 h-[2px] mt-2" style={{ backgroundColor: GOLD }}></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                placeholder="Admin Email" 
                className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#4A0404]/5 focus:border-[#4A0404] bg-gray-50 transition-all text-sm font-bold text-[#2B2B2B]" 
                onChange={e => setData({...data, email: e.target.value})} 
                required 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#4A0404]/5 focus:border-[#4A0404] bg-gray-50 transition-all text-sm font-bold text-[#2B2B2B]" 
                onChange={e => setData({...data, password: e.target.value})} 
                required 
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:brightness-110 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: MAROON }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  AUTHENTICATING...
                </>
              ) : (
                "LOGIN TO DASHBOARD"
              )}
            </button>
          </form>

          <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-10">
            Secure Encryption Active
          </p>
        </div>
        
        {/* Footer */}
        <p className="text-center text-white/40 text-[9px] font-bold uppercase tracking-[0.4em] mt-10">
          Innovation Coach &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;