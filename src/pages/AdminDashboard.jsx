import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api'; 
import { 
  ArrowLeft, Trash2, User, Image as ImageIcon, 
  Video as VideoIcon, Mail, X, Grid, FileText, 
  ShieldAlert, UserPlus, ShieldX, Ban, UserMinus, AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('moderation'); 
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000"; 

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, pRes] = await Promise.all([
        API.get('/admin/users'), 
        API.get('/posts/feed') 
      ]);
      
      console.log("Posts Data:", pRes.data); 
      setUsers(uRes.data || []);
      setAllPosts(pRes.data || []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
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
      alert("User Approved!");
    } catch (err) { alert("Error"); }
  };

  const handleSoftDelete = async (userId) => {
    if(window.confirm("Soft Delete: User login block seiyalaama?")) {
      try {
        await API.patch('/admin/reject-user', { userId });
        fetchData();
        setIsModalOpen(false);
      } catch (err) { alert("Failed"); }
    }
  };

  const handleHardDelete = async (userId) => {
    if(window.confirm("Hard Delete: User-ai permanent-aa delete seiyalaama?")) {
      try {
        await API.delete(`/admin/delete-user/${userId}`);
        fetchData();
        setIsModalOpen(false);
      } catch (err) { alert("Failed"); }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-[#800000] font-black tracking-widest">LOADING DATABASE...</div>;

  const pendingPosts = allPosts.filter(p => p.status === 'PENDING');

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 px-8 h-20 flex justify-between items-center">
        <h1 className="text-[#800000] font-black uppercase tracking-tighter text-xl">Innovation Coach</h1>
        <div className="flex gap-10">
          <button onClick={() => setActiveTab('moderation')} className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'moderation' ? 'border-[#800000] text-[#800000]' : 'border-transparent text-slate-300'}`}>
            Pending ({pendingPosts.length})
          </button>
          <button onClick={() => setActiveTab('users')} className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'users' ? 'border-[#800000] text-[#800000]' : 'border-transparent text-slate-300'}`}>
            Users ({users.filter(u => u.isApproved).length})
          </button>
        </div>
        <div className="w-10"></div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        
        {activeTab === 'moderation' && (
          <div className="space-y-12">
            {users.filter(u => !u.isApproved).length > 0 && (
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                   <UserPlus size={14} className="text-[#800000]"/> New Member Requests
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {users.filter(u => !u.isApproved).map(user => (
                    <div key={user.id} className="p-6 border border-slate-100 rounded-3xl bg-[#FFFBFB] flex flex-col items-center">
                       <div className="w-12 h-12 bg-[#800000] text-white rounded-full flex items-center justify-center font-black mb-4 uppercase">{user.name.charAt(0)}</div>
                       <p className="font-black text-xs uppercase tracking-tight">{user.name}</p>
                       <p className="text-[10px] text-slate-400 mb-6 lowercase">{user.email}</p>
                       <div className="flex gap-2 w-full">
                          <button onClick={() => handleApproveUser(user.id)} className="flex-1 py-3 bg-[#800000] text-white text-[9px] font-black uppercase rounded-xl">Approve</button>
                          <button onClick={() => handleHardDelete(user.id)} className="px-4 py-3 border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-all"><Trash2 size={14}/></button>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                 <FileText size={14} className="text-[#800000]"/> Pending Idea Submissions
              </h3>
              {pendingPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pendingPosts.map(post => (
                    <div key={post.id} className="border border-slate-100 rounded-[2rem] overflow-hidden group hover:border-[#800000] transition-colors">
                       <div className="h-48 bg-slate-50 border-b border-slate-50">
                          {post.mediaUrl ? <img src={getMediaUrl(post.mediaUrl)} className="w-full h-full object-cover" alt="" /> : <div className="h-full flex items-center justify-center text-slate-200 italic text-[10px]">No Attachment</div>}
                       </div>
                       <div className="p-6">
                          <h4 className="font-black text-xs uppercase mb-1">{post.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 italic mb-4">"{post.content}"</p>
                          <div className="flex gap-2">
                             <button className="flex-1 py-3 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl">Approve Post</button>
                             <button onClick={() => alert("Post Rejected")} className="px-4 py-3 bg-slate-50 text-slate-400 rounded-xl"><X size={14}/></button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[3rem]">
                   <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em]">No pending items to review</p>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {users.filter(u => u.isApproved).map(user => (
              <div key={user.id} onClick={() => { setSelectedUser({...user, posts: allPosts.filter(p => p.authorId === user.id)}); setIsModalOpen(true); }} className="cursor-pointer group text-center">
                <div className="aspect-square bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center text-2xl font-black text-slate-300 group-hover:border-[#800000] group-hover:text-[#800000] transition-all uppercase">
                  {user.name.charAt(0)}
                </div>
                <p className="mt-4 font-black text-[10px] uppercase tracking-widest text-slate-500">{user.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-y-auto animate-in fade-in duration-300">
          
          <div className="p-6 flex items-center justify-between border-b border-slate-50 sticky top-0 bg-white/95 backdrop-blur-md z-10">
            <button onClick={() => setIsModalOpen(false)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <ArrowLeft size={16}/> Back
            </button>
            <div className="flex gap-4">
               <button onClick={() => handleSoftDelete(selectedUser.id)} className="flex items-center gap-2 px-6 py-3 border border-orange-100 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-orange-50 transition-all">
                  <ShieldX size={14}/> Restrict Login
               </button>
               <button onClick={() => handleHardDelete(selectedUser.id)} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:scale-105 transition-all">
                  <Trash2 size={14}/> Terminate User
               </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto w-full p-8 md:pt-16">
            <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
               <div className="w-36 h-36 bg-slate-50 rounded-full flex items-center justify-center text-5xl font-black text-[#800000] border-2 border-slate-50 shadow-inner">
                 {selectedUser.name.charAt(0)}
               </div>
               <div className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{selectedUser.name}</h2>
                  <p className="text-slate-400 font-bold mb-4">{selectedUser.email}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#800000] text-white text-[8px] font-black uppercase rounded-full">Active Member</div>
               </div>
            </div>

            <div className="border-t border-slate-100 pt-10">
               <div className="grid grid-cols-3 gap-1 md:gap-4">
                  {selectedUser.posts.map(post => (
                    <div key={post.id} className="aspect-square bg-slate-50 rounded-xl overflow-hidden group relative">
                       {post.mediaUrl ? <img src={getMediaUrl(post.mediaUrl)} className="w-full h-full object-cover" alt="" /> : <div className="h-full flex items-center justify-center text-[8px] font-black uppercase text-slate-300 p-4 text-center">{post.title}</div>}
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;