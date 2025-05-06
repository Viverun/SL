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
import { storeAuthToken } from '@/lib/queryClient'; // Re-add this import

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
    console.log('[Login.handleSubmit] Login form submitted.');
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setLocalError('Username and password are required');
      console.warn('[Login.handleSubmit] Validation failed: Username or password empty.');
      return;
    }
    
    setLocalError(null);
    
    try {
      console.log('[Login.handleSubmit] Calling useUser.login().');
      // Direct API call to get and store the token explicitly
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login');
      }
      
      const data = await response.json();
      
      // Explicitly store token in localStorage with extra logging
      if (data.token) {
        console.log('Login successful, storing token directly:', data.token.substring(0, 10) + '...');
        
        // Store token both ways to ensure it works
        localStorage.setItem('token', data.token);
        storeAuthToken(data.token);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        console.log('Token storage verification:', storedToken ? 'successful' : 'failed');
        
        // Check if stored token matches
        if (storedToken !== data.token) {
          console.error('ALERT: Stored token does not match received token');
        }
      } else {
        console.error('CRITICAL: No token received from login API');
      }
      
      // Also call the store's login method to update UI state
      await login(username, password);
      console.log('[Login.handleSubmit] useUser.login() successful.');
      
      toast.success(`Welcome back, ${username}!`);
      
      // Add a slight delay before navigation to ensure token is saved
      setTimeout(() => {
        console.log('[Login.handleSubmit] Navigating to / after delay.');
        navigate('/');
      }, 500);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to login. Please try again.';
      console.error('[Login.handleSubmit] Login failed:', errorMsg);
      setLocalError(errorMsg);
      
      toast.error('Login failed', {
        description: errorMsg || 'Please check your credentials and try again.'
      });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Decorative orbs */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className="bg-gradient-to-br from-purple-900/70 to-purple-600/70 p-5 rounded-full glow-border"
          >
            <Shield className="h-14 w-14 text-purple-300 glow-text" />
          </motion.div>
        </div>
        
        <Card className="bg-black/80 backdrop-blur-sm border-purple-900/50 hover-scale glow-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center gradient-text">
              Solo Leveling
            </CardTitle>
            <CardDescription className="text-center text-purple-200">
              Enter your credentials to access your hunter profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {(localError || storeError) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/20 border border-red-700/50 rounded-md p-3 flex items-start"
                >
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  <span className="text-sm text-red-300">{localError || storeError}</span>
                </motion.div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-purple-200 font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black/50 border-purple-900/50 text-white focus:border-purple-500 focus:ring-purple-500/50"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-200 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/50 border-purple-900/50 text-white pr-10 focus:border-purple-500 focus:ring-purple-500/50"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-purple-400 hover:text-purple-300"
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
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-medium border-0 pulse"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="h-5 w-5 mr-2" />
                      <span>Login</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-purple-300">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium underline">
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
