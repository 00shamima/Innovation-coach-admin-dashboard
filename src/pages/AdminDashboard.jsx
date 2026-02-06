import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api'; 
import { 
  ArrowLeft, Trash2, User, Image as ImageIcon, 
  Video as VideoIcon, Mail, X, Grid, FileText, 
  ShieldAlert, UserPlus, ShieldX, Loader2, CheckCircle2
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('moderation'); 
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_BASE_URL || "https://innovationc-coach-backend.onrender.com"; 

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, pRes] = await Promise.all([
        API.get('/admin/users'), 
        API.get('/posts/feed') 
      ]);
      
      setUsers(uRes.data || []);
      setAllPosts(pRes.data || []);
    } catch (err) { 
      console.error("Fetch Error:", err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Session expired or Unauthorized. Please login again.");
          navigate('/admin-login');
      }
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getMediaUrl = (path) => path ? `${BACKEND_URL}${path}` : null;

  const handleApproveUser = async (userId) => {
    try {
      await API.patch('/admin/approve-user', { userId });
      fetchData();
      alert("User Approved Successfully!");
    } catch (err) { 
        alert(err.response?.data?.message || "Error approving user"); 
    }
  };

  const handleHardDelete = async (userId) => {
    if(window.confirm("Hard Delete: User-ai permanent-aa delete seiyalaama?")) {
      try {
        await API.delete(`/admin/delete-user/${userId}`);
        fetchData();
        setIsModalOpen(false);
      } catch (err) { alert("Failed to delete user"); }
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white text-[#4A0404]">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-black tracking-[0.2em] uppercase text-sm">Synchronizing Database...</p>
      </div>
    );
  }

  const pendingUsers = users.filter(u => !u.isApproved);
  const activeUsers = users.filter(u => u.isApproved);
  const pendingPosts = allPosts.filter(p => p.status === 'PENDING');

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 px-8 h-20 flex justify-between items-center shadow-sm">
        <h1 className="text-[#4A0404] font-black uppercase tracking-tighter text-xl">Innovation Coach <span className="text-gray-300 font-light italic lowercase">admin</span></h1>
        <div className="flex gap-10">
          <button onClick={() => setActiveTab('moderation')} className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'moderation' ? 'border-[#4A0404] text-[#4A0404]' : 'border-transparent text-slate-300'}`}>
            Moderation ({pendingUsers.length + pendingPosts.length})
          </button>
          <button onClick={() => setActiveTab('users')} className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'users' ? 'border-[#4A0404] text-[#4A0404]' : 'border-transparent text-slate-300'}`}>
            User Directory ({activeUsers.length})
          </button>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/admin-login'); }} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Logout</button>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {activeTab === 'moderation' && (
          <div className="space-y-16">
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2">
                 <UserPlus size={14} className="text-[#4A0404]"/> Access Requests
              </h3>
              {pendingUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {pendingUsers.map(user => (
                    <div key={user._id || user.id} className="p-8 border border-slate-100 rounded-[2rem] bg-[#FAF9F6] flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
                       <div className="w-16 h-16 bg-[#4A0404] text-[#D4AF37] rounded-full flex items-center justify-center text-xl font-black mb-4 uppercase">{user.name.charAt(0)}</div>
                       <p className="font-black text-sm uppercase tracking-tight text-center">{user.name}</p>
                       <p className="text-[10px] text-slate-400 mb-8 lowercase text-center">{user.email}</p>
                       <div className="flex gap-2 w-full mt-auto">
                          <button onClick={() => handleApproveUser(user._id || user.id)} className="flex-1 py-3 bg-[#4A0404] text-white text-[9px] font-black uppercase rounded-xl hover:bg-black transition-colors">Grant Access</button>
                          <button onClick={() => handleHardDelete(user._id || user.id)} className="px-4 py-3 border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-all"><X size={14}/></button>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                  <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">No New Requests</p>
                </div>
              )}
            </section>

            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2">
                 <FileText size={14} className="text-[#4A0404]"/> Content Moderation
              </h3>
              {pendingPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pendingPosts.map(post => (
                    <div key={post._id || post.id} className="border border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-sm flex flex-col">
                       <div className="h-56 bg-gray-100">
                          {post.mediaUrl ? (
                            <img src={getMediaUrl(post.mediaUrl)} className="w-full h-full object-cover" alt="post" />
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-300 italic text-[10px]">No Media Attached</div>
                          )}
                       </div>
                       <div className="p-8 flex-1 flex flex-col">
                          <h4 className="font-black text-sm uppercase mb-2">{post.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed mb-6">"{post.content}"</p>
                          <div className="flex gap-3 mt-auto pt-4 border-t border-gray-50">
                             <button className="flex-1 py-4 bg-black text-white text-[9px] font-black uppercase rounded-2xl">Publish</button>
                             <button className="px-6 py-4 bg-gray-50 text-red-400 rounded-2xl hover:bg-red-50 transition-all"><Trash2 size={16}/></button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                  <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">Feed is clean</p>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-8">
            {activeUsers.map(user => (
              <div 
                key={user._id || user.id} 
                onClick={() => { setSelectedUser({...user, posts: allPosts.filter(p => p.authorId === (user._id || user.id))}); setIsModalOpen(true); }} 
                className="group cursor-pointer text-center"
              >
                <div className="aspect-square bg-white rounded-full border-2 border-slate-50 flex items-center justify-center text-2xl font-black text-slate-200 group-hover:border-[#4A0404] group-hover:text-[#4A0404] transition-all shadow-sm hover:shadow-xl relative">
                  {user.name.charAt(0)}
                  <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                <p className="mt-4 font-black text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-black">{user.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-y-auto">
          <div className="p-6 flex items-center justify-between border-b border-slate-50 sticky top-0 bg-white/90 backdrop-blur-md">
            <button onClick={() => setIsModalOpen(false)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <ArrowLeft size={16}/> Return
            </button>
            <button onClick={() => handleHardDelete(selectedUser._id || selectedUser.id)} className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all">
               <Trash2 size={14}/> Terminate Account
            </button>
          </div>

          <div className="max-w-5xl mx-auto w-full p-8 py-16">
            <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
               <div className="w-40 h-40 bg-[#FAF9F6] rounded-full flex items-center justify-center text-6xl font-black text-[#4A0404] border-4 border-white shadow-2xl">
                 {selectedUser.name.charAt(0)}
               </div>
               <div className="text-center md:text-left">
                  <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-2">{selectedUser.name}</h2>
                  <p className="text-slate-400 font-bold mb-6 tracking-wide">{selectedUser.email}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-[9px] font-black uppercase rounded-full">
                    <CheckCircle2 size={12}/> Verified Member
                  </div>
               </div>
            </div>

            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-10 border-b pb-4">Activity History</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedUser.posts && selectedUser.posts.length > 0 ? (
                selectedUser.posts.map(post => (
                  <div key={post._id || post.id} className="aspect-square bg-gray-50 rounded-3xl overflow-hidden group relative border border-gray-100 shadow-sm">
                    {post.mediaUrl ? (
                      <img src={getMediaUrl(post.mediaUrl)} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-[9px] font-black uppercase text-slate-300 p-6 text-center leading-tight">
                        {post.title}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-bold text-gray-300 uppercase">No posts submitted yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;