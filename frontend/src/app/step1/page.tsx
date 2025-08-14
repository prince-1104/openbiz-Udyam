'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, UserCheck, Smartphone, Shield, ArrowRight } from 'lucide-react';
import { step1API, Step1Data, Step1VerifyOTPData } from '@/services/api';

const step1Schema = z.object({
  aadhaar: z.string()
    .length(12, 'Aadhaar number must be exactly 12 digits')
    .regex(/^[0-9]{12}$/, 'Aadhaar number must contain only digits'),
  mobile: z.string()
    .length(10, 'Mobile number must be exactly 10 digits')
    .regex(/^[6-9][0-9]{9}$/, 'Mobile number must start with 6-9 and be 10 digits'),
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]{6}$/, 'OTP must contain only digits'),
});

type Step1FormData = z.infer<typeof step1Schema>;

export default function Step1() {
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [demoOtp, setDemoOtp] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
  });

  const watchedAadhaar = watch('aadhaar');
  const watchedMobile = watch('mobile');

  const handleGenerateOTP = async () => {
    if (!watchedAadhaar || !watchedMobile) {
      setError('Please enter both Aadhaar and Mobile number first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await step1API.initiate({
        aadhaarNumber: watchedAadhaar,
        mobileNumber: watchedMobile,
      });

      setRegistrationId(response.registrationId);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('registrationId', response.registrationId);
        }
      } catch (_) {}
      setOtpSent(true);

      // Show demo OTP for testing within UI as well as alert
      if (response.demoOTP) {
        setDemoOtp(response.demoOTP);
        alert(`Demo OTP: ${response.demoOTP}\n\n${response.note || ''}`);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to generate OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otp = watch('otp');
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!registrationId) {
      setError('Registration ID not found. Please try generating OTP again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await step1API.verifyOTP({
        registrationId,
        otp,
      });

      setOtpVerified(true);
      try {
        if (typeof window !== 'undefined' && registrationId) {
          localStorage.setItem('registrationId', registrationId);
        }
      } catch (_) {}
      alert('OTP verified successfully! You can now proceed to Step 2.');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: Step1FormData) => {
    console.log('Step 1 data:', data);
    // In real app, this would submit to backend
    alert('Step 1 completed successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-3">
              <UserCheck className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Step 1: Aadhaar + OTP Validation</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-indigo-600">Aadhaar + OTP</p>
                <p className="text-xs text-gray-500">Identity Verification</p>
              </div>
            </div>
            <div className="flex-1 mx-4 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">PAN Validation</p>
                <p className="text-xs text-gray-400">Business Details</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Identity
            </h2>
            <p className="text-gray-600">
              Enter your Aadhaar number and mobile number to receive OTP for verification
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Aadhaar Number */}
            <div>
              <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('aadhaar')}
                  type="text"
                  id="aadhaar"
                  placeholder="Enter 12 digit Aadhaar Number"
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.aadhaar ? 'border-red-300' : 'border-gray-300'
                  }`}
                  maxLength={12}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.aadhaar && (
                <p className="mt-1 text-sm text-red-600">{errors.aadhaar.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter your 12-digit Aadhaar number without spaces or dashes
              </p>
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('mobile')}
                  type="text"
                  id="mobile"
                  placeholder="Enter 10 digit Mobile Number"
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.mobile ? 'border-red-300' : 'border-gray-300'
                  }`}
                  maxLength={10}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter your 10-digit mobile number registered with Aadhaar
              </p>
            </div>

            {/* Generate OTP Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGenerateOTP}
                disabled={!watchedAadhaar || !watchedMobile || isLoading}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  !watchedAadhaar || !watchedMobile || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isLoading ? 'Sending...' : 'Generate OTP'}
              </button>
            </div>

            {/* OTP Field */}
            {otpSent && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  OTP <span className="text-red-500">*</span>
                </label>
                {demoOtp && (
                  <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    Testing mode: Your OTP is <span className="font-semibold">{demoOtp}</span>
                  </div>
                )}
                <div className="flex space-x-2">
                  <input
                    {...register('otp')}
                    type="text"
                    id="otp"
                    placeholder="Enter 6 digit OTP"
                    className={`flex-1 px-4 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.otp ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={!watch('otp') || watch('otp').length !== 6 || isLoading}
                    className={`px-6 py-3 rounded-md font-medium transition-colors ${
                      !watch('otp') || watch('otp').length !== 6 || isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit OTP sent to your mobile number
                </p>
              </div>
            )}

            {/* Next Button */}
            {otpVerified && (
              <div className="flex justify-center pt-6">
                <Link
                  href="/step2"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
                >
                  Continue to Step 2
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            )}
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Aadhaar number must be exactly 12 digits</li>
              <li>• Mobile number must be registered with your Aadhaar</li>
              <li>• OTP will be sent to your registered mobile number</li>
              <li>• Keep your Aadhaar and mobile number ready before proceeding</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
