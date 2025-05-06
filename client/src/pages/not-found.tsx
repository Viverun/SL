import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center animated-gradient">
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-20 left-20 w-20 h-20 bg-purple-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-30 w-24 h-24 bg-purple-600 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-purple-400 rounded-full blur-xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4 z-10"
      >
        <Card className="bg-black/80 backdrop-blur-sm border-purple-900/50 hover-scale glow-border overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-purple-700 to-purple-500"></div>
          <CardContent className="pt-8 pb-6">
            <motion.div 
              initial={{ rotate: -5, x: -10 }}
              animate={{ rotate: 0, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex mb-6 gap-3 items-center"
            >
              <div className="p-3 bg-purple-900/30 rounded-full">
                <AlertCircle className="h-8 w-8 text-purple-400" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">404 Not Found</h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-4 text-purple-200"
            >
              The path you seek lies beyond the dungeon's explored regions. Perhaps you should return to known territories.
            </motion.p>
          </CardContent>
          <CardFooter className="flex gap-4 pb-6">
            <Button
              asChild
              variant="outline"
              className="flex-1 border border-purple-900/50 bg-black/40 text-purple-300 hover:bg-purple-900/20 hover:text-purple-100"
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-medium border-0"
            >
              <a onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </a>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
