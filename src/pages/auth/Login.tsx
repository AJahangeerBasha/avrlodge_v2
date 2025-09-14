import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';
import { redirectByRole } from '../../lib/redirects';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, currentUser, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users based on their role
  useEffect(() => {
    if (!authLoading && currentUser && userRole) {
      redirectByRole(userRole, navigate);
    }
  }, [currentUser, userRole, authLoading, navigate]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // Let the layouts handle redirects based on role
      navigate('/');
    } catch (error: unknown) {
      setError((error as Error).message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      // Let the layouts handle redirects based on role
      navigate('/');
    } catch (error: unknown) {
      setError((error as Error).message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black container-responsive">
      <div className="absolute inset-0 bg-black bg-opacity-90"></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="card-responsive w-full">
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CardTitle className="text-responsive-3xl font-serif font-bold text-center text-black">Sign In</CardTitle>
              <p className="text-responsive-sm text-gray-600 text-center">
                Enter your credentials to access your account
              </p>
            </motion.div>
          </CardHeader>
          <CardContent className="gap-responsive">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              type="button"
              variant="outline"
              className="btn-responsive w-full border-gray-300 hover:bg-gray-50 text-black"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              <span className="truncate">Sign in with Google</span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-responsive-sm uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or continue with email
              </span>
            </div>
          </motion.div>

          <motion.form 
            onSubmit={handleEmailLogin} 
            className="form-responsive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div 
              className="form-group-responsive"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Label htmlFor="email" className="text-black font-medium text-responsive-base">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="input-responsive pl-10 border-gray-300 focus:border-black focus:ring-black text-black bg-white"
                />
              </div>
            </motion.div>

            <motion.div 
              className="form-group-responsive"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Label htmlFor="password" className="text-black font-medium text-responsive-base">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="input-responsive pl-10 border-gray-300 focus:border-black focus:ring-black text-black bg-white"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Button 
                type="submit" 
                className="btn-responsive w-full bg-black hover:bg-gray-800 text-white" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.form>

          <motion.div 
            className="text-center space-responsive-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Link 
              to="/auth/forgot-password" 
              className="text-responsive-sm text-gray-600 hover:text-black hover:underline transition-colors duration-200"
            >
              Forgot your password?
            </Link>
            <p className="text-responsive-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-black hover:underline font-medium transition-colors duration-200">
                Sign up
              </Link>
            </p>
          </motion.div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
};