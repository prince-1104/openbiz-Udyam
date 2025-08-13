import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

function buildZodFromSchema(jsonSchema: any): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of jsonSchema.fields as any[]) {
    let validator: z.ZodTypeAny;

    switch (field.type) {
      case 'text':
      case 'email': {
        let stringSchema = z.string();
        if (field.required) {
          stringSchema = stringSchema.min(1, { message: `${field.label} is required` });
        }
        if (field.type === 'email') {
          stringSchema = stringSchema.email({ message: `${field.label} must be a valid email` });
        }
        if (field.pattern) {
          stringSchema = stringSchema.regex(new RegExp(field.pattern), {
            message: `${field.label} is invalid`,
          });
        }
        validator = stringSchema;
        break;
      }

      case 'select': {
        if (Array.isArray(field.options) && field.options.length > 0) {
          const enumValues = field.options as [string, ...string[]];
          const enumSchema = z.enum(enumValues);
          validator = enumSchema;
        } else {
          let stringSchema = z.string();
          if (field.required) {
            stringSchema = stringSchema.min(1, { message: `${field.label} is required` });
          }
          validator = stringSchema;
        }
        break;
      }

      default: {
        let stringSchema = z.string();
        if (field.required) {
          stringSchema = stringSchema.min(1, { message: `${field.label} is required` });
        }
        validator = stringSchema;
      }
    }

    if (!field.required) {
      validator = validator.optional();
    }

    shape[field.key] = validator;
  }

  return z.object(shape);
}

const step1SchemaPath = path.join(__dirname, '../../schemas/udyam-step1.json');
const step2SchemaPath = path.join(__dirname, '../../schemas/udyam-step2.json');

const step1Json = JSON.parse(fs.readFileSync(step1SchemaPath, 'utf-8'));
const step2Json = JSON.parse(fs.readFileSync(step2SchemaPath, 'utf-8'));

const step1Validator = buildZodFromSchema(step1Json);
const step2Validator = buildZodFromSchema(step2Json);

app.post('/submit', async (req, res) => {
  const step = req.query.step;
  const idParam = req.query.id;
  let validator: z.ZodObject<any>;

  if (step === '1') {
    validator = step1Validator;
  } else if (step === '2') {
    validator = step2Validator;
    if (!idParam) {
      return res.status(400).json({ error: 'Missing record ID for Step 2' });
    }
  } else {
    return res.status(400).json({ error: 'Invalid step. Use step=1 or step=2' });
  }

  const parsed = validator.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.format() });
  }

  let rec;
  if (step === '1') {
    rec = await prisma.registration.create({ data: parsed.data });
  } else {
    rec = await prisma.registration.update({
      where: { id: Number(idParam) },
      data: parsed.data,
    });
  }

  res.json({
    success: true,
    step,
    id: rec.id,
    message:
      step === '1'
        ? 'Step 1 data saved. Proceed to Step 2.'
        : 'Step 2 data updated successfully.'
  });
  
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
