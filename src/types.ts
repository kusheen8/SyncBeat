export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  presence?: 'online' | 'offline' | 'listening';
  currentRoomId?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  category: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  hostId: string;
  currentSongId?: string;
  isPlaying: boolean;
  playbackTime: number;
  membersCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface QueueItem {
  id: string;
  roomId: string;
  songId: string;
  song?: Song;
  addedBy: string;
  addedByName: string;
  votes: number;
  createdAt: string;
}
