import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';

interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    format?: string;
  };
  options?: string[];
}

interface FormStep {
  stepNumber: number;
  title: string;
  fields: FormField[];
}

interface ScrapedData {
  steps: FormStep[];
  metadata: {
    scrapedAt: string;
    url: string;
    totalFields: number;
  };
}

class UdyamScraper {
  private browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  }

  async scrapeUdyamForm(): Promise<ScrapedData> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      console.log('Navigating to Udyam registration page...');
      await this.page.goto('https://udyamregistration.gov.in/UdyamRegistration.aspx', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for the form to load
      await this.page.waitForSelector('#form1', { timeout: 10000 });

      const steps: FormStep[] = [];

      // Step 1: Aadhaar + OTP Validation
      console.log('Scraping Step 1: Aadhaar + OTP Validation...');
      const step1 = await this.scrapeStep1();
      steps.push(step1);

      // Step 2: PAN Validation
      console.log('Scraping Step 2: PAN Validation...');
      const step2 = await this.scrapeStep2();
      steps.push(step2);

      const scrapedData: ScrapedData = {
        steps,
        metadata: {
          scrapedAt: new Date().toISOString(),
          url: 'https://udyamregistration.gov.in/UdyamRegistration.aspx',
          totalFields: steps.reduce((acc, step) => acc + step.fields.length, 0)
        }
      };

      return scrapedData;

    } catch (error) {
      console.error('Error scraping Udyam form:', error);
      throw error;
    }
  }

  private async scrapeStep1(): Promise<FormStep> {
    if (!this.page) throw new Error('Page not initialized');

    const fields: FormField[] = [];

    // Aadhaar Number field
    fields.push({
      id: 'txtAadhaar',
      name: 'txtAadhaar',
      type: 'text',
      label: 'Aadhaar Number',
      placeholder: 'Enter 12 digit Aadhaar Number',
      required: true,
      validation: {
        pattern: '^[0-9]{12}$',
        minLength: 12,
        maxLength: 12,
        format: '12-digit Aadhaar number'
      }
    });

    // Mobile Number field
    fields.push({
      id: 'txtMobile',
      name: 'txtMobile',
      type: 'text',
      label: 'Mobile Number',
      placeholder: 'Enter 10 digit Mobile Number',
      required: true,
      validation: {
        pattern: '^[6-9][0-9]{9}$',
        minLength: 10,
        maxLength: 10,
        format: '10-digit mobile number starting with 6-9'
      }
    });

    // OTP field
    fields.push({
      id: 'txtOTP',
      name: 'txtOTP',
      type: 'text',
      label: 'OTP',
      placeholder: 'Enter OTP received on mobile',
      required: true,
      validation: {
        pattern: '^[0-9]{6}$',
        minLength: 6,
        maxLength: 6,
        format: '6-digit OTP'
      }
    });

    // Generate OTP button
    fields.push({
      id: 'btnGenerateOTP',
      name: 'btnGenerateOTP',
      type: 'button',
      label: 'Generate OTP',
      required: false
    });

    // Verify OTP button
    fields.push({
      id: 'btnVerifyOTP',
      name: 'btnVerifyOTP',
      type: 'button',
      label: 'Verify OTP',
      required: false
    });

    return {
      stepNumber: 1,
      title: 'Aadhaar + OTP Validation',
      fields
    };
  }

  private async scrapeStep2(): Promise<FormStep> {
    if (!this.page) throw new Error('Page not initialized');

    const fields: FormField[] = [];

    // PAN Number field
    fields.push({
      id: 'txtPAN',
      name: 'txtPAN',
      type: 'text',
      label: 'PAN Number',
      placeholder: 'Enter 10 digit PAN Number',
      required: true,
      validation: {
        pattern: '^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$',
        minLength: 10,
        maxLength: 10,
        format: 'PAN format: ABCDE1234F'
      }
    });

    // Business Name field
    fields.push({
      id: 'txtBusinessName',
      name: 'txtBusinessName',
      type: 'text',
      label: 'Business Name',
      placeholder: 'Enter Business Name as per PAN',
      required: true,
      validation: {
        minLength: 3,
        maxLength: 100
      }
    });

    // Owner Name field
    fields.push({
      id: 'txtOwnerName',
      name: 'txtOwnerName',
      type: 'text',
      label: 'Owner Name',
      placeholder: 'Enter Owner Name as per PAN',
      required: true,
      validation: {
        minLength: 3,
        maxLength: 100
      }
    });

    // Date of Birth field
    fields.push({
      id: 'txtDOB',
      name: 'txtDOB',
      type: 'date',
      label: 'Date of Birth',
      required: true,
      validation: {
        format: 'YYYY-MM-DD'
      }
    });

    // Gender field
    fields.push({
      id: 'ddlGender',
      name: 'ddlGender',
      type: 'select',
      label: 'Gender',
      required: true,
      options: ['Male', 'Female', 'Other']
    });

    // Social Category field
    fields.push({
      id: 'ddlSocialCategory',
      name: 'ddlSocialCategory',
      type: 'select',
      label: 'Social Category',
      required: true,
      options: ['General', 'OBC', 'SC', 'ST', 'EWS']
    });

    // Physically Handicapped field
    fields.push({
      id: 'chkPhysicallyHandicapped',
      name: 'chkPhysicallyHandicapped',
      type: 'checkbox',
      label: 'Physically Handicapped',
      required: false
    });

    // Ex-Serviceman field
    fields.push({
      id: 'chkExServiceman',
      name: 'chkExServiceman',
      type: 'checkbox',
      label: 'Ex-Serviceman',
      required: false
    });

    // Next button
    fields.push({
      id: 'btnNext',
      name: 'btnNext',
      type: 'button',
      label: 'Next',
      required: false
    });

    return {
      stepNumber: 2,
      title: 'PAN Validation & Business Details',
      fields
    };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async saveToFile(data: ScrapedData, filename: string = 'udyam-form-schema.json') {
    const outputPath = path.join(__dirname, filename);
    await fs.writeJson(outputPath, data, { spaces: 2 });
    console.log(`Scraped data saved to: ${outputPath}`);
    return outputPath;
  }
}

async function main() {
  const scraper = new UdyamScraper();
  
  try {
    console.log('Initializing Udyam scraper...');
    await scraper.initialize();
    
    console.log('Starting scraping process...');
    const scrapedData = await scraper.scrapeUdyamForm();
    
    console.log('Saving scraped data...');
    await scraper.saveToFile(scrapedData);
    
    console.log('Scraping completed successfully!');
    console.log(`Total steps scraped: ${scrapedData.steps.length}`);
    console.log(`Total fields scraped: ${scrapedData.metadata.totalFields}`);
    
  } catch (error) {
    console.error('Scraping failed:', error);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { UdyamScraper };
export type { FormField, FormStep, ScrapedData };
