import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Suspense, lazy, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/not-found";

// Import our audio setup
import { useAudio } from "./lib/stores/useAudio";

// Sound system setup
const SoundManager = () => {
  const { 
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound 
  } = useAudio();

  // Setup sounds
  useEffect(() => {
    // Initialize background music
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    // Initialize hit sound
    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.5;
    setHitSound(hit);

    // Initialize success sound
    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.7;
    setSuccessSound(success);

    return () => {
      // Clean up sounds
      bgMusic.pause();
      hit.pause();
      success.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={
          <div className="w-full h-screen animated-gradient flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-purple-600 border-t-transparent animate-spin mb-4"></div>
            <div className="gradient-text text-xl font-bold">Loading your adventure...</div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
        <SoundManager />
        <Toaster 
          position="top-right" 
          richColors 
          toastOptions={{
            style: { 
              background: 'rgba(5, 5, 10, 0.85)', 
              color: '#c4b5fd',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
              backdropFilter: 'blur(10px)',
            },
            className: "font-sans"
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
