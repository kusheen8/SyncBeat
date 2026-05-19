import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import socket from '../lib/socket';
import { Song, Room } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  currentRoom: Room | null;
  playSong: (song: Song, forceEmit?: boolean) => void;
  pauseSong: (forceEmit?: boolean) => void;
  resumeSong: (forceEmit?: boolean) => void;
  seek: (time: number, forceEmit?: boolean) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const audioRef = useRef<Howl | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.unload();
      audioRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const playSong = (song: Song, forceEmit = true) => {
    cleanupAudio();
    setCurrentSong(song);
    
    const sound = new Howl({
      src: [song.audioUrl],
      html5: true,
      volume: isMuted ? 0 : volume,
      onplay: () => {
        setIsPlaying(true);
        setDuration(sound.duration());
        startProgressTimer();
      },
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => {
        setIsPlaying(false);
        // Handle auto-next logic here if desired
      },
      onload: () => {
        setDuration(sound.duration());
      }
    });

    audioRef.current = sound;
    sound.play();

    if (forceEmit && currentRoom) {
      socket.emit('play_song', { roomId: currentRoom.id, songId: song.id, timestamp: 0 });
      syncRoomToFirestore({ currentSongId: song.id, isPlaying: true, playbackTime: 0 });
    }
  };

  const pauseSong = (forceEmit = true) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      
      if (forceEmit && currentRoom) {
        socket.emit('pause_song', { roomId: currentRoom.id, timestamp: audioRef.current.seek() });
        syncRoomToFirestore({ isPlaying: false, playbackTime: audioRef.current.seek() });
      }
    }
  };

  const resumeSong = (forceEmit = true) => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);

      if (forceEmit && currentRoom) {
        socket.emit('play_song', { roomId: currentRoom.id, songId: currentSong?.id, timestamp: audioRef.current.seek() });
        syncRoomToFirestore({ isPlaying: true, playbackTime: audioRef.current.seek() });
      }
    } else if (currentSong) {
      playSong(currentSong, forceEmit);
    }
  };

  const seek = (time: number, forceEmit = true) => {
    if (audioRef.current) {
      audioRef.current.seek(time);
      setProgress(time);

      if (forceEmit && currentRoom) {
        socket.emit('seek_song', { roomId: currentRoom.id, timestamp: time });
        syncRoomToFirestore({ playbackTime: time });
      }
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume(isMuted ? 0 : v);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.volume(newMuted ? 0 : volume);
    }
  };

  const startProgressTimer = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = window.setInterval(() => {
      if (audioRef.current && isPlaying) {
        setProgress(audioRef.current.seek());
      }
    }, 1000);
  };

  const syncRoomToFirestore = async (updates: Partial<Room>) => {
    if (currentRoom && auth.currentUser?.uid === currentRoom.hostId) {
      try {
        await updateDoc(doc(db, 'rooms', currentRoom.id), {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to sync room to Firestore", err);
      }
    }
  };

  const joinRoom = async (roomId: string) => {
    socket.emit('join_room', roomId);
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
      setCurrentRoom({ id: roomSnap.id, ...roomSnap.data() } as Room);
    }
  };

  const leaveRoom = () => {
    if (currentRoom) {
      socket.emit('leave_room', currentRoom.id);
      setCurrentRoom(null);
    }
  };

  // Socket sync listeners
  useEffect(() => {
    socket.on('on_play', async (data: { songId: string; timestamp: number }) => {
      if (currentSong?.id !== data.songId) {
        // Fetch song if not loaded or just find in SAMPLE_SONGS for now
        const songsModule = await import('../data/songs');
        const song = songsModule.SAMPLE_SONGS.find(s => s.id === data.songId);
        if (song) {
          playSong(song, false);
          seek(data.timestamp, false);
        }
      } else {
        resumeSong(false);
        seek(data.timestamp, false);
      }
    });

    socket.on('on_pause', (data: { timestamp: number }) => {
      pauseSong(false);
      seek(data.timestamp, false);
    });

    socket.on('on_seek', (data: { timestamp: number }) => {
      seek(data.timestamp, false);
    });

    socket.on('sync_state', async (state: any) => {
        // state: { isPlaying: boolean, currentTime: number, songId: string, lastUpdated: number }
        const songsModule = await import('../data/songs');
        const song = songsModule.SAMPLE_SONGS.find(s => s.id === state.songId);
        if (song) {
          playSong(song, false);
          const elapsed = (Date.now() - state.lastUpdated) / 1000;
          const targetTime = state.isPlaying ? state.currentTime + elapsed : state.currentTime;
          seek(targetTime, false);
          if (!state.isPlaying) pauseSong(false);
        }
    });

    return () => {
      socket.off('on_play');
      socket.off('on_pause');
      socket.off('on_seek');
      socket.off('sync_state');
    };
  }, [currentSong, currentRoom]);

  const value = {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    currentRoom,
    playSong,
    pauseSong,
    resumeSong,
    seek,
    setVolume,
    toggleMute,
    joinRoom,
    leaveRoom,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
