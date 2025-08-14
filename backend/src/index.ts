const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Validation schemas
const step1Schema = z.object({
  aadhaarNumber: z.string()
    .length(12, 'Aadhaar number must be exactly 12 digits')
    .regex(/^[0-9]{12}$/, 'Aadhaar number must contain only digits'),
  mobileNumber: z.string()
    .length(10, 'Mobile number must be exactly 10 digits')
    .regex(/^[6-9][0-9]{9}$/, 'Mobile number must start with 6-9 and be 10 digits'),
});

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

// API Routes

// Step 1: Aadhaar + OTP Validation
app.post('/api/step1/initiate', async (req: any, res: any) => {
  try {
    const { aadhaarNumber, mobileNumber } = step1Schema.parse(req.body);

    // Check if registration already exists
    const existingRegistration = await prisma.udyamRegistration.findUnique({
      where: { aadhaarNumber }
    });

    if (existingRegistration) {
      if (existingRegistration.step1Completed) {
        return res.status(400).json({
          error: 'Registration already exists for this Aadhaar number',
          registrationId: existingRegistration.id
        });
      }
      
      // Update existing registration
      const updated = await prisma.udyamRegistration.update({
        where: { id: existingRegistration.id },
        data: {
          mobileNumber,
          updatedAt: new Date()
        }
      });

      return res.json({
        message: 'Registration initiated successfully',
        registrationId: updated.id,
        step: 1
      });
    }

    // Create new registration
    const registration = await prisma.udyamRegistration.create({
      data: {
        aadhaarNumber,
        mobileNumber,
        step1Completed: false,
        otpVerified: false
      }
    });


    // For demo purposes, generate a random 6-digit OTP and return it in response
    const demoOTP = Math.floor(100000 + Math.random() * 900000).toString();

    res.json({
      message: 'Registration initiated successfully',
      registrationId: registration.id,
      step: 1,
      demoOTP, 
      
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    console.error('Error in step1/initiate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Step 1: Verify OTP
app.post('/api/step1/verify-otp', async (req: any, res: any) => {
  try {
    const { registrationId, otp } = req.body;

    if (!registrationId || !otp) {
      return res.status(400).json({
        error: 'Registration ID and OTP are required'
      });
    }

    // For demo purposes, we'll accept any 6-digit OTP
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: 'Invalid OTP format. OTP must be 6 digits.'
      });
    }

    const registration = await prisma.udyamRegistration.findUnique({
      where: { id: registrationId }
    });

    if (!registration) {
      return res.status(404).json({
        error: 'Registration not found'
      });
    }

    if (registration.step1Completed) {
      return res.status(400).json({
        error: 'Step 1 already completed'
      });
    }

    // Mark OTP as verified and step 1 as completed
    const updated = await prisma.udyamRegistration.update({
      where: { id: registrationId },
      data: {
        otpVerified: true,
        step1Completed: true,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'OTP verified successfully',
      registrationId: updated.id,
      step1Completed: true,
      canProceedToStep2: true
    });

  } catch (error) {
    console.error('Error in step1/verify-otp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Step 2: Submit Business Details
app.post('/api/step2/submit', async (req: any, res: any) => {
  try {
    const { registrationId, ...step2Data } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        error: 'Registration ID is required'
      });
    }

    // Validate step 2 data
    const validatedData = step2Schema.parse(step2Data);

    // Check if registration exists and step 1 is completed
    const registration = await prisma.udyamRegistration.findUnique({
      where: { id: registrationId }
    });

    if (!registration) {
      return res.status(404).json({
        error: 'Registration not found'
      });
    }

    if (!registration.step1Completed) {
      return res.status(400).json({
        error: 'Step 1 must be completed before proceeding to Step 2'
      });
    }

    if (registration.step2Completed) {
      return res.status(400).json({
        error: 'Step 2 already completed'
      });
    }

    // Update registration with step 2 data
    const updated = await prisma.udyamRegistration.update({
      where: { id: registrationId },
      data: {
        ...validatedData,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        step2Completed: true,
        registrationStatus: 'SUBMITTED',
        submittedAt: new Date(),
        updatedAt: new Date()
      }
    });
    const demoUdyamNumber = `UDYAM-${Date.now().toString().slice(-8)}`;

    // Update with Udyam number
    const finalRegistration = await prisma.udyamRegistration.update({
      where: { id: registrationId },
      data: {
        udyamNumber: demoUdyamNumber,
        registrationStatus: 'COMPLETED'
      }
    });

    res.json({
      message: 'Registration completed successfully',
      registrationId: finalRegistration.id,
      udyamNumber: finalRegistration.udyamNumber,
      step2Completed: true,
      registrationStatus: finalRegistration.registrationStatus
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      });
    }

    console.error('Error in step2/submit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get registration status
app.get('/api/registration/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const registration = await prisma.udyamRegistration.findUnique({
      where: { id }
    });

    if (!registration) {
      return res.status(404).json({
        error: 'Registration not found'
      });
    }

    // Remove sensitive data before sending
    const { aadhaarNumber, mobileNumber, ...safeData } = registration;

    res.json({
      registration: safeData,
      progress: {
        step1: registration.step1Completed,
        step2: registration.step2Completed,
        total: registration.step2Completed ? 100 : registration.step1Completed ? 50 : 0
      }
    });

  } catch (error) {
    console.error('Error getting registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all registrations (admin endpoint)
app.get('/api/admin/registrations', async (req: any, res: any) => {
  try {
    const registrations = await prisma.udyamRegistration.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        aadhaarNumber: true,
        mobileNumber: true,
        businessName: true,
        ownerName: true,
        registrationStatus: true,
        udyamNumber: true,
        step1Completed: true,
        step2Completed: true,
        createdAt: true,
        submittedAt: true
      }
    });

    res.json({ registrations });

  } catch (error) {
    console.error('Error getting registrations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 404 handler
app.use('*', (req: any, res: any) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/health`);
      console.log(` API base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
