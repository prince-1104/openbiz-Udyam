'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, FileText, Building2, User, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { step2API, Step2Data } from '@/services/api';

const step2Schema = z.object({
  panNumber: z.string()
    .length(10, 'PAN number must be exactly 10 characters')
    .regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, 'Invalid PAN format. Expected format: ABCDE1234F'),
  businessName: z.string()
    .min(3, 'Business name must be at least 3 characters')
    .max(100, 'Business name must be less than 100 characters'),
  ownerName: z.string()
    .min(3, 'Owner name must be at least 3 characters')
    .max(100, 'Owner name must be less than 100 characters'),
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required'),
  gender: z.string()
    .min(1, 'Gender selection is required'),
  socialCategory: z.string()
    .min(1, 'Social category selection is required'),
  physicallyHandicapped: z.boolean().optional(),
  exServiceman: z.boolean().optional(),
});

type Step2FormData = z.infer<typeof step2Schema>;

export default function Step2() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string>('');
  const [udyamNumber, setUdyamNumber] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: Step2FormData) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Read registration ID saved after Step 1
      let registrationId = '';
      if (typeof window !== 'undefined') {
        registrationId = localStorage.getItem('registrationId') || '';
      }

      if (!registrationId) {
        throw new Error('Registration ID missing. Please complete Step 1 first.');
      }

      const response = await step2API.submit(registrationId, data);
      
      console.log('Step 2 data:', data);
      setUdyamNumber(response.udyamNumber);
      setIsCompleted(true);
      
      alert(`Registration completed successfully! Your Udyam number is: ${response.udyamNumber}`);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.error || 'Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/step1"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Step 1
            </Link>
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Step 2: PAN Validation & Business Details</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Aadhaar + OTP</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
            <div className="flex-1 mx-4 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-indigo-600">PAN Validation</p>
                <p className="text-xs text-gray-500">In Progress</p>
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
              <Building2 className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Business Details & PAN Validation
            </h2>
            <p className="text-gray-600">
              Enter your PAN details and business information for Udyam registration
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!isCompleted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                          {/* PAN Number */}
            <div>
              <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('panNumber')}
                  type="text"
                  id="panNumber"
                  placeholder="Enter 10 digit PAN Number (e.g., ABCDE1234F)"
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.panNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.panNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.panNumber.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter your 10-character PAN number (5 letters + 4 digits + 1 letter)
              </p>
            </div>

              {/* Business Name */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('businessName')}
                    type="text"
                    id="businessName"
                    placeholder="Enter Business Name as per PAN"
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.businessName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={100}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter the business name exactly as it appears on your PAN card
                </p>
              </div>

              {/* Owner Name */}
              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('ownerName')}
                    type="text"
                    id="ownerName"
                    placeholder="Enter Owner Name as per PAN"
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.ownerName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={100}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.ownerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.ownerName.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter the owner name exactly as it appears on your PAN card
                </p>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    id="dateOfBirth"
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Select your date of birth as per official documents
                </p>
              </div>

              {/* Gender and Social Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('gender')}
                    id="gender"
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.gender ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>

                {/* Social Category */}
                <div>
                  <label htmlFor="socialCategory" className="block text-sm font-medium text-gray-700 mb-2">
                    Social Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('socialCategory')}
                    id="socialCategory"
                    className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.socialCategory ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Social Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                  {errors.socialCategory && (
                    <p className="mt-1 text-sm text-red-600">{errors.socialCategory.message}</p>
                  )}
                </div>
              </div>

              {/* Checkboxes Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Physically Handicapped */}
                <div className="flex items-center space-x-3">
                  <input
                    {...register('physicallyHandicapped')}
                    type="checkbox"
                    id="physicallyHandicapped"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="physicallyHandicapped" className="text-sm font-medium text-gray-700">
                    Physically Handicapped
                  </label>
                </div>

                {/* Ex-Serviceman */}
                <div className="flex items-center space-x-3">
                  <input
                    {...register('exServiceman')}
                    type="checkbox"
                    id="exServiceman"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="exServiceman" className="text-sm font-medium text-gray-700">
                    Ex-Serviceman
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={`px-8 py-3 rounded-md font-medium transition-colors ${
                    !isValid || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit & Complete Registration'}
                </button>
              </div>
            </form>
          ) : (
            /* Success State */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Registration Completed Successfully!
              </h3>
              {udyamNumber && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm font-medium text-green-800 mb-2">Your Udyam Number:</p>
                  <p className="text-lg font-bold text-green-600">{udyamNumber}</p>
                </div>
              )}
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your Udyam registration has been submitted. You will receive a confirmation email with your registration details.
              </p>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
                >
                  Back to Home
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• PAN number must be exactly 10 characters in format: ABCDE1234F</li>
              <li>• Business name and owner name must match exactly with PAN card</li>
              <li>• Date of birth should be as per official documents</li>
              <li>• All fields marked with * are mandatory</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
