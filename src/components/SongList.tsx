import { useEffect, useState } from 'react';
import { Play, Heart, Clock, MoreHorizontal } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Song } from '../types';
import { useMusic } from '../context/MusicContext';
import { formatDuration } from '../lib/utils';
import { motion } from 'motion/react';

export default function SongList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong, currentSong, isPlaying } = useMusic();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'songs'));
        const songsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
        setSongs(songsList);
      } catch (err) {
        console.error("Error fetching songs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-[#121212] animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6">
        <div className="flex items-end gap-6">
          <div className="w-52 h-52 shadow-2xl rounded-lg bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center">
            <Heart size={80} fill="white" className="text-white opacity-90" />
          </div>
          <div className="flex flex-col gap-4">
             <span className="text-xs font-bold uppercase tracking-widest">Playlist</span>
             <h1 className="text-7xl font-black">Liked Songs</h1>
             <p className="text-gray-400 text-sm font-medium">Your personal collection of tracks you love.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <button 
           onClick={() => songs[0] && playSong(songs[0])}
           className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center p-4 hover:scale-105 transition-transform shadow-lg"
          >
            <Play fill="black" size={24} className="text-black ml-1" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Heart size={32} />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal size={32} />
          </button>
        </div>
      </header>

      <div className="mt-8">
        <div className="grid grid-cols-[48px_1fr_1fr_48px] px-4 py-2 border-b border-[#282828] text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
           <span>#</span>
           <span>Title</span>
           <span>Album</span>
           <span className="flex justify-end"><Clock size={16} /></span>
        </div>

        <div className="space-y-1">
          {songs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => playSong(song)}
              className="grid grid-cols-[48px_1fr_1fr_48px] items-center px-4 py-2 rounded-md hover:bg-[#282828] group transition-colors cursor-pointer"
            >
              <div className="text-gray-400 group-hover:text-white flex items-center">
                {currentSong?.id === song.id && isPlaying ? (
                  <div className="flex gap-0.5 items-end h-3 w-3 justify-center mb-0.5">
                    <div className="w-0.5 bg-[#1DB954] animate-[music-bar_1s_infinite_linear] h-[60%]"></div>
                    <div className="w-0.5 bg-[#1DB954] animate-[music-bar_1.2s_infinite_linear] h-[100%]"></div>
                    <div className="w-0.5 bg-[#1DB954] animate-[music-bar_0.8s_infinite_linear] h-[40%]"></div>
                  </div>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="flex items-center gap-4 overflow-hidden">
                <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded shadow-md object-cover" />
                <div className="flex flex-col">
                  <span className={cn("font-medium truncate", currentSong?.id === song.id ? "text-[#1DB954]" : "text-white")}>
                    {song.title}
                  </span>
                  <span className="text-xs text-gray-400 truncate group-hover:text-white transition-colors">{song.artist}</span>
                </div>
              </div>
              <div className="text-sm text-gray-400 truncate group-hover:text-white transition-colors">
                {song.album}
              </div>
              <div className="text-sm text-gray-400 text-right group-hover:text-white transition-colors">
                {formatDuration(song.duration)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
