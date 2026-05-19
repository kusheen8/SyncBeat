import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, ListMusic, Maximize2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatDuration } from '../lib/utils';
import * as Slider from '@radix-ui/react-slider';

export default function Player() {
  const { 
    currentSong, isPlaying, progress, duration, volume, isMuted,
    pauseSong, resumeSong, seek, setVolume, toggleMute 
  } = useMusic();

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#121212] border-t border-[#282828] px-4 flex items-center justify-between z-50">
      {/* Song Info */}
      <div className="flex items-center gap-4 w-1/3">
        <img src={currentSong.coverUrl} alt={currentSong.title} className="w-14 h-14 rounded shadow-lg object-cover" />
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-bold text-white truncate hover:underline cursor-pointer">{currentSong.title}</span>
          <span className="text-xs text-gray-400 truncate hover:underline cursor-pointer">{currentSong.artist}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl px-8">
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors"><Shuffle size={18} /></button>
          <button className="text-gray-400 hover:text-white transition-colors"><SkipBack size={24} fill="currentColor" /></button>
          <button 
            onClick={() => isPlaying ? pauseSong() : resumeSong()}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={20} fill="black" className="text-black" /> : <Play size={20} fill="black" className="text-black ml-0.5" />}
          </button>
          <button className="text-gray-400 hover:text-white transition-colors"><SkipForward size={24} fill="currentColor" /></button>
          <button className="text-gray-400 hover:text-white transition-colors"><Repeat size={18} /></button>
        </div>

        <div className="flex items-center gap-2 w-full text-xs text-gray-400">
           <span className="w-10 text-right">{formatDuration(progress)}</span>
           <Slider.Root
             className="relative flex items-center select-none touch-none w-full h-5"
             value={[progress]}
             max={duration || 100}
             step={1}
             onValueChange={([val]) => seek(val)}
           >
             <Slider.Track className="bg-[#4d4d4d] relative grow rounded-full h-1 group h-1 hover:h-1.5 transition-all">
               <Slider.Range className="absolute bg-white group-hover:bg-[#1DB954] rounded-full h-full" />
             </Slider.Track>
             <Slider.Thumb className="hidden group-hover:block w-3 h-3 bg-white shadow-xl rounded-full focus:outline-none" aria-label="Progress" />
           </Slider.Root>
           <span className="w-10">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Volume & Misc */}
      <div className="flex items-center justify-end gap-3 w-1/3">
        <button className="text-gray-400 hover:text-white transition-colors"><ListMusic size={18} /></button>
        <div className="flex items-center gap-2 w-32 group">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={([val]) => setVolume(val)}
          >
            <Slider.Track className="bg-[#4d4d4d] relative grow rounded-full h-1 group-hover:h-1.5 transition-all">
              <Slider.Range className="absolute bg-white group-hover:bg-[#1DB954] rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="hidden group-hover:block w-3 h-3 bg-white shadow-xl rounded-full focus:outline-none" aria-label="Volume" />
          </Slider.Root>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors"><Maximize2 size={18} /></button>
      </div>
    </div>
  );
}
