import { useEffect, useState } from "react";
import { MusicProvider } from "./context/MusicContext";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import SongList from "./components/SongList";
import RoomView from "./components/RoomView";
import AuthOverlay from "./components/AuthOverlay";
import { Toaster, toast } from 'sonner';
import { auth, seedSongs, db } from "./lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'rooms'>('home');
  const [viewingRoomId, setViewingRoomId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        seedSongs();
        // Simple presence logic
        const userRef = doc(db, 'users', u.uid);
        await setDoc(userRef, {
          uid: u.uid,
          displayName: u.displayName,
          photoURL: u.photoURL,
          email: u.email,
          presence: 'online',
          lastSeen: new Date().toISOString()
        }, { merge: true });
      }
    });
    return unsub;
  }, []);

  const handleJoinRoom = async (roomId: string) => {
    if (!user) return;
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        await setDoc(roomRef, {
          name: "SyncBeat Party",
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          hostId: user.uid,
          isPlaying: false,
          playbackTime: 0,
          membersCount: 1,
          updatedAt: new Date().toISOString()
        });
        toast.success("Created a new room!");
      }
      setViewingRoomId(roomId);
      setActiveTab('rooms');
    } catch (err) {
      console.error(err);
      toast.error("Failed to join room");
    }
  };

  return (
    <MusicProvider>
      <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'rooms') setViewingRoomId(null);
        }} />
        
        <main className="flex-1 overflow-y-auto relative bg-gradient-to-b from-[#121212] to-[#050505] pb-32">
          <div className="p-8">
            {activeTab === 'rooms' && viewingRoomId ? (
              <RoomView roomId={viewingRoomId} onLeave={() => {
                setViewingRoomId(null);
                setActiveTab('home');
              }} />
            ) : activeTab === 'rooms' ? (
               <div className="flex flex-col items-center justify-center min-h-[60vh]">
                 <h1 className="text-4xl font-bold mb-4">Listening Rooms</h1>
                 <p className="text-gray-400 mb-8 text-center max-w-md">Join a room to listen together with friends in real-time. Collaborative queues and live chat awaits.</p>
                 <button 
                  onClick={() => {
                    if (!user) {
                      toast.error("Please login to create a room");
                      return;
                    }
                    // Create logic would go here, for now just sample room
                    handleJoinRoom("sample-room");
                  }}
                  className="px-8 py-3 bg-[#1DB954] text-black font-bold rounded-full hover:scale-105 transition-transform"
                 >
                   Create A New Room
                 </button>
               </div>
            ) : (
              <SongList />
            )}
          </div>
        </main>

        <Player />
        {!user && <AuthOverlay />}
        <Toaster richColors theme="dark" position="bottom-right" />
      </div>
    </MusicProvider>
  );
}
