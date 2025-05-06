import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/lib/stores/useUser';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // User store for login
  const { login, isAuthenticated, isLoading, error: storeError, username: currentUser } = useUser();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setLocalError('Username and password are required');
      return;
    }
    
    setLocalError(null);
    
    try {
      // Login using the user store
      await login(username, password);
      
      toast.success(`Welcome back, ${username}!`);
      navigate('/');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to login. Please try again.';
      setLocalError(errorMsg);
      
      toast.error('Login failed', {
        description: errorMsg || 'Please check your credentials and try again.'
      });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className="bg-blue-900/30 p-4 rounded-full"
          >
            <Shield className="h-12 w-12 text-blue-400" />
          </motion.div>
        </div>
        
        <Card className="bg-gray-900/80 backdrop-blur-sm border-blue-900/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-blue-400">
              Solo Leveling
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your credentials to access your hunter profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(localError || storeError) && (
                <div className="bg-red-900/20 border border-red-900/50 rounded-md p-3 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <span className="text-sm text-red-400">{localError || storeError}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-200"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-gray-200 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    <span>Login</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                Register here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
