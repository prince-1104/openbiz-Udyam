import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Example schema for Aadhaar & PAN (will replace with scraped rules)
const registrationSchema = z.object({
  aadhaar: z.string().regex(/^[0-9]{12}$/, 'Invalid Aadhaar'),
  pan: z.string().regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, 'Invalid PAN'),
});

app.post('/submit', async (req, res) => {
  const parsed = registrationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.format() });
  }

  const rec = await prisma.registration.create({ data: parsed.data });
  res.json({ ok: true, id: rec.id });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
