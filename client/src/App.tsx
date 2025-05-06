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
        <Suspense fallback={<div className="w-full h-screen bg-black flex items-center justify-center text-blue-400">Loading...</div>}>
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
              background: 'rgba(12, 12, 14, 0.8)', 
              color: '#3b82f6',
              border: '1px solid #1d4ed8',
            },
            className: "font-sans"
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
