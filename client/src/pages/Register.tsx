import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/lib/stores/useUser';
import { storeAuthToken } from '@/lib/queryClient';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // User store for registration and login
  const { register, isLoading, error: storeError } = useUser();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Register.handleSubmit] Registration form submitted.');
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setLocalError('Username and password are required');
      console.warn('[Register.handleSubmit] Validation failed: Username or password empty.');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      console.warn('[Register.handleSubmit] Validation failed: Passwords do not match.');
      return;
    }
    
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      console.warn('[Register.handleSubmit] Validation failed: Password too short.');
      return;
    }
    
    setLocalError(null);
    
    try {
      console.log('[Register.handleSubmit] Calling direct fetch for /api/auth/register.');
      // Direct API call to ensure we get and store the token properly
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Register.handleSubmit] API registration failed:', errorData);
        throw new Error(errorData.message || 'Failed to register via API');
      }
      
      const data = await response.json();
      
      // Explicitly store token in localStorage
      if (data.token) {
        console.log('[Register.handleSubmit] Token received from direct API call:', data.token.substring(0,10) + '...');
        
        // Store token both ways to ensure it works
        localStorage.setItem('token', data.token);
        storeAuthToken(data.token);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        if (storedToken === data.token) {
          console.log('[Register.handleSubmit] Token successfully stored and verified in localStorage.');
        } else {
          console.error('[Register.handleSubmit] CRITICAL: Token verification FAILED after direct save. Expected:', data.token.substring(0,10) + '...', 'Got:', storedToken ? storedToken.substring(0,10) + '...' : 'null');
        }
      } else {
        console.error('[Register.handleSubmit] CRITICAL: No token received from direct /api/auth/register API call.');
      }
      
      console.log('[Register.handleSubmit] Calling useUser.register() to update store state.');
      // Also call the store's register method to update the UI state
      await register(username, password);
      console.log('[Register.handleSubmit] useUser.register() successful.');
      
      toast.success('Registration successful!', {
        description: 'Your hunter account has been created.',
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      });
      
      // Add a slight delay before navigation to ensure token is saved
      setTimeout(() => {
        console.log('[Register.handleSubmit] Navigating to / after delay.');
        navigate('/');
      }, 500);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to register. Please try again.';
      console.error('[Register.handleSubmit] Registration failed:', errorMsg);
      setLocalError(errorMsg);
      
      toast.error('Registration failed', {
        description: errorMsg || 'Please try again with a different username.'
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
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-28 -left-28 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.2, 
              type: 'spring',
              stiffness: 100
            }}
            className="bg-gradient-to-br from-purple-900/70 to-purple-600/70 p-5 rounded-full glow-border"
          >
            <Shield className="h-14 w-14 text-purple-300 glow-text" />
          </motion.div>
        </div>
        
        <Card className="bg-black/80 backdrop-blur-sm border-purple-900/50 hover-scale glow-border">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold text-center gradient-text">
              Create Hunter Account
            </CardTitle>
            <CardDescription className="text-center text-purple-200">
              Register to begin your Solo Leveling journey
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
                <Label htmlFor="username" className="text-purple-200 font-medium">Hunter Name</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
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
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/50 border-purple-900/50 text-white pr-10 focus:border-purple-500 focus:ring-purple-500/50"
                    disabled={isLoading}
                    autoComplete="new-password"
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-purple-200 font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/50 border-purple-900/50 text-white focus:border-purple-500 focus:ring-purple-500/50"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
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
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      <span>Register</span>
                    </div>
                  )}
                </Button>
              </motion.div>
              
              <div className="mt-2 pt-2 border-t border-purple-900/30">
                <p className="text-xs text-purple-300/70 text-center">
                  By creating an account, you agree to embark on a journey of self-improvement.
                </p>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-purple-300">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium underline">
                Log in here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
