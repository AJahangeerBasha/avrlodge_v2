import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Phone, Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { redirectByRole } from '../../lib/redirects';
import { PhoneAuthSetupStatus } from '../../components/auth/PhoneAuthSetupStatus';
import {
  initializeRecaptcha,
  sendSMSVerificationCode,
  verifyPhoneNumber,
  formatPhoneNumber,
  clearRecaptcha
} from '../../lib/auth';

export const PhoneLoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showSetupStatus, setShowSetupStatus] = useState(false);
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef<HTMLDivElement>(null);

  // Redirect authenticated users based on their role
  useEffect(() => {
    if (!authLoading && currentUser && userRole) {
      redirectByRole(userRole, navigate);
    }
  }, [currentUser, userRole, authLoading, navigate]);

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Initialize reCAPTCHA
      const recaptchaVerifier = initializeRecaptcha('recaptcha-container');

      // Send SMS
      const confirmationResult = await sendSMSVerificationCode(formattedPhone, recaptchaVerifier);
      setConfirmationResult(confirmationResult);
      setStep('verification');
      setResendCountdown(60); // 60 seconds countdown
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send verification code';
      setError(errorMessage);

      // Show setup status if phone auth is not enabled
      if (errorMessage.includes('Phone authentication is not enabled')) {
        setShowSetupStatus(true);
      }

      clearRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (!confirmationResult) {
      setError('No verification session found. Please try again.');
      return;
    }

    try {
      setError('');
      setLoading(true);

      await verifyPhoneNumber(confirmationResult, verificationCode);

      // The user will be redirected by the useEffect above
    } catch (error: any) {
      setError(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;

    try {
      setError('');
      setLoading(true);

      const formattedPhone = formatPhoneNumber(phoneNumber);
      const recaptchaVerifier = initializeRecaptcha('recaptcha-container');
      const confirmationResult = await sendSMSVerificationCode(formattedPhone, recaptchaVerifier);

      setConfirmationResult(confirmationResult);
      setResendCountdown(60);
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification code');
      clearRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setVerificationCode('');
    setConfirmationResult(null);
    setError('');
    clearRecaptcha();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="space-y-1 pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4"
              >
                {step === 'phone' ? (
                  <Phone className="h-6 w-6 text-white" />
                ) : (
                  <Shield className="h-6 w-6 text-white" />
                )}
              </motion.div>
              <CardTitle className="text-2xl font-bold text-center text-black">
                {step === 'phone' ? 'Phone Login' : 'Verify Code'}
              </CardTitle>
              <p className="text-center text-gray-600 text-sm">
                {step === 'phone'
                  ? 'Enter your phone number to receive a verification code'
                  : `Enter the 6-digit code sent to ${phoneNumber}`
                }
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Show setup status if phone auth is not enabled */}
              {showSetupStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PhoneAuthSetupStatus onDismiss={() => setShowSetupStatus(false)} />
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {step === 'phone' ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-black">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10 bg-white/95 backdrop-blur-sm border-black/20"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter with country code (e.g., +91 for India)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Send Code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium text-black">
                      Verification Code
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="code"
                        type="text"
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="pl-10 bg-white/95 backdrop-blur-sm border-black/20 text-center text-lg tracking-widest"
                        disabled={loading}
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="flex justify-between items-center text-sm">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBackToPhone}
                      className="text-gray-600 hover:text-black"
                      disabled={loading}
                    >
                      <ArrowLeft className="mr-1 h-3 w-3" />
                      Change Number
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendCode}
                      disabled={loading || resendCountdown > 0}
                      className="text-gray-600 hover:text-black"
                    >
                      {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                    </Button>
                  </div>
                </form>
              )}

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Want to use email instead?{' '}
                  <Link to="/auth/login" className="text-black hover:underline font-medium">
                    Email Login
                  </Link>
                </p>
              </div>

              {/* reCAPTCHA container - invisible */}
              <div id="recaptcha-container" ref={recaptchaRef}></div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-black hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PhoneLoginPage;