import { Home, Library, Users, Search, PlusCircle, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: 'home' | 'library' | 'rooms';
  setActiveTab: (tab: 'home' | 'library' | 'rooms') => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Your Library', icon: Library },
    { id: 'rooms', label: 'Listening Rooms', icon: Users },
  ] as const;

  return (
    <div className="w-64 bg-black flex flex-col h-full border-r border-[#282828]">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-8 bg-gradient-to-r from-[#1DB954] to-[#1ed760] bg-clip-text text-transparent">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1.5">
             <div className="flex gap-0.5 items-end h-full w-full justify-center">
                <div className="w-1 bg-[#1DB954] rounded-full animate-[music-bar_1s_infinite_linear] h-[60%]"></div>
                <div className="w-1 bg-[#1DB954] rounded-full animate-[music-bar_1.2s_infinite_linear] h-[100%]"></div>
                <div className="w-1 bg-[#1DB954] rounded-full animate-[music-bar_0.8s_infinite_linear] h-[40%]"></div>
             </div>
          </div>
          SyncBeat
        </h1>

        <nav className="space-y-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-4 w-full px-2 py-2 rounded-md transition-colors font-medium",
                activeTab === id ? "bg-[#282828] text-white" : "text-gray-400 hover:text-white"
              )}
            >
              <Icon size={24} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8 px-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Playlists</p>
        <div className="space-y-4">
          <button className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors group px-2">
            <div className="w-8 h-8 bg-[#282828] rounded flex items-center justify-center group-hover:bg-gray-700">
              <PlusCircle size={20} />
            </div>
            Create Playlist
          </button>
          <button className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors group px-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded flex items-center justify-center">
              <Heart size={16} fill="white" className="text-white" />
            </div>
            Liked Songs
          </button>
        </div>
      </div>
      
      <div className="mt-auto p-6">
        <div className="p-4 bg-[#121212] rounded-xl border border-[#282828]">
           <p className="text-xs font-semibold text-gray-500 mb-2">NOW LISTENING TOGETHER</p>
           <p className="text-sm font-medium mb-3">Sync with friends in real-time rooms.</p>
           <button 
            onClick={() => setActiveTab('rooms')}
            className="w-full text-xs font-bold py-2 bg-white text-black rounded-full hover:scale-105 transition-transform"
           >
             JOIN A ROOM
           </button>
        </div>
      </div>

      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
