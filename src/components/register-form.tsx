"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import Link from 'next/link';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpTriesLeft, setOtpTriesLeft] = useState(3);
  const [otpTimer, setOtpTimer] = useState<number>(180); // 3 minutes in seconds
  const [otpTimerActive, setOtpTimerActive] = useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpTimerActive && otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    } else if (otpTimer === 0) {
      setOtpSent(false);
      setOtpTimerActive(false);
      setError('OTP expired. Please request a new one.');
    }
    return () => clearTimeout(timer);
  }, [otpTimerActive, otpTimer]);

  interface RegisterFormData {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    otp: string;
  }

  type RegisterFormField = keyof RegisterFormData;

  const handleInputChange = (field: RegisterFormField, value: string) => {
    setFormData((prev: RegisterFormData) => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSendOtp = async () => {
    setError(null);
    setSuccess(null);
    if (formData.email && formData.username && formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/sign-up', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        });
        const data = await res.json();
        if (data.success) {
          setOtpSent(true);
          setOtpTimer(180);
          setOtpTimerActive(true);
          setOtpTriesLeft(3);
          setSuccess('OTP sent to your email.');
        } else {
          setError(data.message || 'Failed to send OTP.');
        }
      } catch (err) {
        setError('Failed to send OTP.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please fill all fields before requesting OTP.');
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!otpSent) {
      setError('Please request and enter the OTP sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/sign-up', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Account created successfully! You can now sign in.');
        setOtpSent(false);
        setOtpTimerActive(false);
        setFormData({ username: '', password: '', confirmPassword: '', email: '', otp: '' });
      } else {
        setError(data.message || 'Failed to verify OTP.');
        if (typeof data.attemptsLeft === 'number') {
          setOtpTriesLeft(data.attemptsLeft);
        }
        if (data.message && data.message.includes('Maximum attempts')) {
          setOtpSent(false);
          setOtpTimerActive(false);
        }
      }
    } catch (err) {
      setError('Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format timer mm:ss
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-slate-900">
            Create an account
          </CardTitle>
          <p className="text-sm text-slate-600">
            Already have an account or created one? <Link href="/sign-in" className="underline underline-offset-4"> 
            Sign in
            </Link>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full"
                placeholder="Enter your username"
                disabled={otpSent}
              />
            </div>
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full"
                placeholder="Enter your password"
                disabled={otpSent}
              />
            </div>
            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full"
                placeholder="Confirm your password"
                disabled={otpSent}
              />
            </div>
            {/* Email with Send OTP button */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="flex-1"
                  placeholder="Enter your email"
                  disabled={otpSent}
                />
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  disabled={loading || !formData.email || !formData.username || !formData.password || !formData.confirmPassword || otpSent}
                >
                  {otpSent ? (otpTimer > 0 ? `Sent (${formatTimer(otpTimer)})` : 'Resend OTP') : 'Send OTP'}
                </Button>
              </div>
            </div>
            {/* OTP Info Message */}
            {otpSent && (
              <div className="text-xs text-slate-500 text-center">
                OTP will expire in 3 minutes. {`Tries left: ${otpTriesLeft}`}
              </div>
            )}
            {/* OTP Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Enter OTP
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={formData.otp}
                  onChange={(value) => handleInputChange('otp', value)}
                  disabled={!otpSent || loading || otpTimer === 0 || otpTriesLeft === 0}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            {/* Error/Success Messages */}
            {error && <div className="text-red-500 text-xs text-center">{error}</div>}
            {success && <div className="text-green-600 text-xs text-center">{success}</div>}
            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-900"
              disabled={loading || !formData.username || !formData.password || !formData.confirmPassword || !formData.email || formData.otp.length !== 6 || !otpSent || otpTimer === 0 || otpTriesLeft === 0}
            >
              {loading ? 'Processing...' : 'Verify & Create Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}