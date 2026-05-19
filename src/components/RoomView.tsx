import { useEffect, useState, useRef } from 'react';
import { Send, Users, ListMusic, MessageSquare, Plus, ArrowLeft, Trash2, Heart } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useMusic } from '../context/MusicContext';
import { Message, QueueItem, Song } from '../types';
import { SAMPLE_SONGS } from '../data/songs';
import { cn, formatDuration } from '../lib/utils';
import socket from '../lib/socket';
import { motion, AnimatePresence } from 'motion/react';

interface RoomViewProps {
  roomId: string;
  onLeave: () => void;
}

export default function RoomView({ roomId, onLeave }: RoomViewProps) {
  const { currentRoom, joinRoom, leaveRoom, playSong } = useMusic();
  const [messages, setMessages] = useState<Message[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'queue'>('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    joinRoom(roomId);
    
    // Listen for chat
    const qMessages = query(collection(db, 'rooms', roomId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      scrollToBottom();
    });

    // Listen for queue
    const qQueue = query(collection(db, 'rooms', roomId, 'queue'), orderBy('createdAt', 'asc'));
    const unsubscribeQueue = onSnapshot(qQueue, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QueueItem));
      // Enrich with song data
      const enriched = items.map(item => ({
        ...item,
        song: SAMPLE_SONGS.find(s => s.id === item.songId)
      }));
      setQueue(enriched);
    });

    // Socket typing listeners
    socket.on('on_typing', (data: { username: string; isTyping: boolean }) => {
       if (data.isTyping) {
         setTypingUser(data.username);
       } else {
         setTypingUser(null);
       }
    });

    return () => {
      leaveRoom();
      unsubscribeMessages();
      unsubscribeQueue();
      socket.off('on_typing');
    };
  }, [roomId]);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !auth.currentUser) return;

    await addDoc(collection(db, 'rooms', roomId, 'messages'), {
      roomId,
      userId: auth.currentUser.uid,
      username: auth.currentUser.displayName || 'Anonymous',
      text: inputText,
      createdAt: serverTimestamp(),
    });

    setInputText("");
    handleTyping(false);
  };

  const handleTyping = (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      socket.emit('typing_status', { roomId, username: auth.currentUser?.displayName || 'Someone', isTyping: typing });
    }
  };

  const addToQueue = async (song: Song) => {
    if (!auth.currentUser) return;
    await addDoc(collection(db, 'rooms', roomId, 'queue'), {
      roomId,
      songId: song.id,
      addedBy: auth.currentUser.uid,
      addedByName: auth.currentUser.displayName || 'User',
      votes: 0,
      createdAt: serverTimestamp(),
    });
  };

  const removeFromQueue = async (id: string) => {
    await deleteDoc(doc(db, 'rooms', roomId, 'queue', id));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onLeave} className="p-2 hover:bg-[#282828] rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{currentRoom?.name || "Music Room"}</h1>
            <p className="text-gray-400 text-sm">Room Code: <span className="text-white font-mono">{currentRoom?.code || "------"}</span></p>
          </div>
        </div>
        <div className="flex -space-x-2">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-700 flex items-center justify-center text-[10px] font-bold">U{i+1}</div>
           ))}
           <div className="w-8 h-8 rounded-full border-2 border-black bg-[#1DB954] flex items-center justify-center text-[10px] font-bold">+5</div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 min-h-0">
        {/* Left Side: Room Activities / Queue Addition */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-4">
           <section>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ListMusic size={20} className="text-[#1DB954]" />
                Add to Room Queue
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {SAMPLE_SONGS.slice(0, 8).map(song => (
                    <div key={song.id} className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg hover:bg-[#282828] transition-colors group">
                       <img src={song.coverUrl} className="w-12 h-12 rounded object-cover" />
                       <div className="flex-1 overflow-hidden">
                          <p className="font-medium truncate text-sm">{song.title}</p>
                          <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                       </div>
                       <button 
                        onClick={() => addToQueue(song)}
                        className="p-2 bg-[#282828] rounded-full hover:bg-[#1DB954] hover:text-black transition-all opacity-0 group-hover:opacity-100"
                       >
                          <Plus size={16} />
                       </button>
                    </div>
                 ))}
              </div>
           </section>

           <section>
              <h3 className="text-lg font-bold mb-4">Upcoming Queue</h3>
              <div className="space-y-2">
                 {queue.length === 0 && <p className="text-gray-500 text-sm italic">Queue is empty. Add some songs!</p>}
                 {queue.map((item, idx) => (
                   <div key={item.id} className="flex items-center gap-4 p-3 bg-[#121212]/50 rounded-lg group">
                      <span className="text-gray-500 font-mono text-xs w-4">{idx + 1}</span>
                      <img src={item.song?.coverUrl} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1">
                         <p className="text-sm font-medium">{item.song?.title}</p>
                         <p className="text-xs text-gray-400">Added by {item.addedByName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <button className="text-gray-500 hover:text-[#1DB954] transition-colors"><Heart size={16} /></button>
                         {item.addedBy === auth.currentUser?.uid && (
                           <button onClick={() => removeFromQueue(item.id)} className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                             <Trash2 size={16} />
                           </button>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Right Side: Chat / Sidebar */}
        <div className="bg-[#121212] rounded-xl border border-[#282828] flex flex-col h-full min-h-0">
           <div className="flex p-2 gap-2">
              <button 
                onClick={() => setActiveSideTab('chat')}
                className={cn("flex-1 py-1.5 rounded-lg text-sm font-bold transition-all", activeSideTab === 'chat' ? "bg-[#282828] text-white" : "text-gray-400 hover:text-white")}
              >
                Chat
              </button>
              <button 
                onClick={() => setActiveSideTab('queue')}
                className={cn("flex-1 py-1.5 rounded-lg text-sm font-bold transition-all", activeSideTab === 'queue' ? "bg-[#282828] text-white" : "text-gray-400 hover:text-white")}
              >
                Members
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeSideTab === 'chat' ? (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex flex-col", msg.userId === auth.currentUser?.uid ? "items-end" : "items-start")}>
                      <span className="text-[10px] font-bold text-gray-500 mb-1">{msg.username}</span>
                      <div className={cn(
                        "px-3 py-2 rounded-2xl max-w-[85%] text-sm",
                        msg.userId === auth.currentUser?.uid ? "bg-[#1DB954] text-black font-semibold rounded-tr-none" : "bg-[#282828] text-white rounded-tl-none"
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              ) : (
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center text-[#1DB954] font-bold">H</div>
                      <div>
                        <p className="text-sm font-bold">Host Name (Host)</p>
                        <p className="text-[10px] text-[#1DB954] font-bold uppercase tracking-widest">Listening</p>
                      </div>
                   </div>
                   {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800" />
                        <div>
                          <p className="text-sm font-semibold">Listener {i+1}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Online</p>
                        </div>
                      </div>
                   ))}
                </div>
              )}
           </div>

           {activeSideTab === 'chat' && (
             <div className="p-4 border-t border-[#282828]">
                {typingUser && <p className="text-[10px] text-[#1DB954] animate-pulse mb-2">{typingUser} is typing...</p>}
                <form onSubmit={handleSendMessage} className="relative">
                   <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      handleTyping(e.target.value.length > 0);
                    }}
                    placeholder="Message friends..."
                    className="w-full bg-[#282828] rounded-full py-2 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-[#1DB954] placeholder:text-gray-500"
                   />
                   <button type="submit" className="absolute right-1 top-1 bottom-1 px-3 bg-[#1DB954] rounded-full text-black hover:scale-105 transition-transform">
                      <Send size={16} />
                   </button>
                </form>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
