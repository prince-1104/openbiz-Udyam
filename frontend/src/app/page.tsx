'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, UserCheck, Building2, CheckCircle } from 'lucide-react';

interface FormStep {
  stepNumber: number;
  title: string;
  fields: any[];
}

interface FormSchema {
  steps: FormStep[];
  metadata: {
    scrapedAt: string;
    url: string;
    totalFields: number;
  };
}

export default function Home() {
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFormSchema = async () => {
      try {
        const response = await fetch('/udyam-form-schema.json');
        const data = await response.json();
        setFormSchema(data);
      } catch (error) {
        console.error('Error loading form schema:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormSchema();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Udyam Registration Form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Udyam Registration</h1>
            </div>
            <div className="text-sm text-gray-500">
              Official Portal Clone
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {formSchema?.steps.map((step, index) => (
              <div key={step.stepNumber} className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white font-semibold">
                  {step.stepNumber}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                  <p className="text-xs text-gray-500">{step.fields.length} fields</p>
                </div>
                {index < formSchema.steps.length - 1 && (
                  <div className="ml-4 w-16 h-0.5 bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Udyam Registration
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete your MSME registration in just a few simple steps. 
            Our streamlined process makes it easy to get your business registered.
          </p>
        </div>

        {/* Form Steps */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {formSchema?.steps.map((step) => (
            <div key={step.stepNumber} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  {step.stepNumber === 1 ? (
                    <UserCheck className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Step {step.stepNumber}</h3>
                  <p className="text-sm text-gray-600">{step.title}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  {step.stepNumber === 1 
                    ? "Verify your identity using Aadhaar and mobile number"
                    : "Enter your business details and PAN information"
                  }
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  {step.fields.length} form fields
                </div>
              </div>

              <Link
                href={`/step${step.stepNumber}`}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-center block"
              >
                Start Step {step.stepNumber}
              </Link>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Registration</h3>
            <p className="text-gray-600">Simple step-by-step process with real-time validation</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Focused</h3>
            <p className="text-gray-600">Designed specifically for MSME registration requirements</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">Your data is protected with industry-standard security</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              This is a demonstration application for Udyam registration form. 
              For official registration, visit{' '}
              <a 
                href="https://udyamregistration.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                udyamregistration.gov.in
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
