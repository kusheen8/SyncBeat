import { Music2 } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';

export default function AuthOverlay() {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#121212] w-full max-w-md rounded-3xl p-12 border border-[#282828] text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
           <Music2 size={40} className="text-[#1DB954]" />
        </div>
        <h2 className="text-4xl font-black mb-4">Music is better together.</h2>
        <p className="text-gray-400 mb-10 leading-relaxed">
          Log in with your Google account to discover new music, create listening rooms, and sync with friends.
        </p>
        
        <button 
          onClick={handleLogin}
          className="w-full py-4 bg-white text-black font-black rounded-full flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          CONTINUE WITH GOOGLE
        </button>

        <p className="text-[10px] text-gray-500 mt-8 uppercase tracking-widest font-bold">
          Free to use. No subscription required.
        </p>
      </motion.div>
    </div>
  );
}
