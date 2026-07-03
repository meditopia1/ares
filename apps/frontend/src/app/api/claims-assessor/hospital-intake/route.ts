import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { createServiceRoleSupabaseClient, requireAnyRole } from '@/lib/auth-server';

const execFileAsync = promisify(execFile);

export const runtime = 'nodejs';

interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
  source: 'gop' | 'claim_form' | 'system';
}

export async function POST(request: NextRequest) {
  let tempFile = '';

  try {
    await requireAnyRole(request, ['claims', 'admin', 'system_admin']);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const existingClaimNumbers = parseExistingClaimNumbers(formData.get('existingClaimNumbers'));

    if (!file) {
      return NextResponse.json({ error: 'No GOP/application file uploaded' }, { status: 400 });
    }

    const extension = getFileExtension(file.name, file.type);
    const bytes = Buffer.from(await file.arrayBuffer());
    tempFile = path.join(os.tmpdir(), `day1-hcr-${randomUUID()}${extension}`);
    await fs.writeFile(tempFile, bytes);

    const fullText = await extractText(tempFile, extension);
    if (!fullText) {
      return NextResponse.json(
        { error: 'Could not extract text from this file type yet. Please upload a PDF GOP or DOCX claim form.' },
        { status: 400 }
      );
    }
    const documentType = detectDocumentType(fullText, file.name);
    const extractedFields = extractHospitalClaimFields(fullText, documentType);
    const nextClaimNumber = await generateNextHcrClaimNumber(existingClaimNumbers);

    extractedFields.unshift({
      label: 'Generated Claim Number',
      value: nextClaimNumber,
      confidence: 100,
      source: 'system',
    });

    const confidence = extractedFields.length
      ? Math.round(extractedFields.reduce((sum, field) => sum + field.confidence, 0) / extractedFields.length)
      : 0;

    return NextResponse.json({
      success: true,
      ocrEngine: 'embedded_pdf_or_docx_text',
      document: {
        fileName: file.name,
        fileType: file.type || extension.replace('.', ''),
        size: file.size,
        documentType,
      },
      nextClaimNumber,
      confidence,
      extractedFields,
      fullTextPreview: fullText.slice(0, 2000),
    });
  } catch (error) {
    console.error('Hospital intake scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan hospital intake file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (tempFile) {
      await fs.unlink(tempFile).catch(() => undefined);
    }
  }
}

function parseExistingClaimNumbers(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function getFileExtension(fileName: string, fileType: string) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension) return extension;
  if (fileType.includes('pdf')) return '.pdf';
  if (fileType.includes('word')) return '.docx';
  if (fileType.includes('png')) return '.png';
  if (fileType.includes('jpeg')) return '.jpg';
  return '.bin';
}

async function extractText(filePath: string, extension: string) {
  if (extension === '.pdf') {
    const { stdout } = await execFileAsync('pdftotext', ['-layout', filePath, '-'], { maxBuffer: 10 * 1024 * 1024 });
    return cleanText(stdout);
  }

  if (extension === '.docx') {
    const { stdout } = await execFileAsync('unzip', ['-p', filePath, 'word/document.xml'], { maxBuffer: 10 * 1024 * 1024 });
    return cleanText(
      stdout
        .replace(/<w:p[^>]*>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
    );
  }

  return '';
}

function cleanText(text: string) {
  return text
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function detectDocumentType(text: string, fileName: string): 'gop' | 'claim_form' | 'unknown' {
  const source = `${fileName}\n${text}`.toLowerCase();
  if (source.includes('guarantee of payment') || source.includes('gop details') || source.includes('africa-assist ref')) {
    return 'gop';
  }
  if (source.includes('hospital claim form') || source.includes('date of incident') || source.includes('membership number')) {
    return 'claim_form';
  }
  return 'unknown';
}

function extractHospitalClaimFields(text: string, documentType: 'gop' | 'claim_form' | 'unknown'): ExtractedField[] {
  const fields: ExtractedField[] = [];
  const source = documentType === 'claim_form' ? 'claim_form' : 'gop';

  const add = (label: string, value: string, confidence = 85) => {
    const clean = value.replace(/\s+/g, ' ').trim();
    if (!clean || clean === '-') return;

    const existingIndex = fields.findIndex((field) => field.label === label);
    if (existingIndex !== -1) {
      const existing = fields[existingIndex];
      const shouldReplace = confidence > existing.confidence || clean.length > existing.value.length;
      if (shouldReplace) {
        fields[existingIndex] = { label, value: clean, confidence, source };
      }
      return;
    }

    fields.push({ label, value: clean, confidence, source });
  };

  extractGopTableFields(text, add);

  const pairLabels = [
    ['Hospital Name', 'Hospital Practice Number'],
    ['Casualty Name', 'Casualty Practice Number'],
    ['Radiology Name', 'Radiology Practice Number'],
    ['Africa-Assist Ref #', 'Policy Valid'],
    ['Policy Inception Date', 'Waiting Period Completed'],
    ['Member Name and Surname', 'Member ID'],
    ['Name Of Patient', 'Patient ID'],
    ['Authorized [Incl # Days]', 'Auth Number'],
    ['Diagnosis (Initial Request)', 'Date Of Admission'],
  ];

  for (const [left, right] of pairLabels) {
    const pair = extractPair(text, left, right);
    if (pair.left) add(normaliseLabel(left), pair.left, pair.confidence);
    if (pair.right) add(normaliseLabel(right), pair.right, pair.confidence);
  }

  add('Policy Number', extractAfterLabel(text, 'Policy Number'), 80);
  add('Maximum GOP Amount', firstMatch(text, /maximum of up to R\s*([\d\s,.]+)/i), 70);
  add('Total Guaranteed Amount', firstMatch(text, /Total Guaranteed Amount:\s*R\s*([\d\s,.]+)/i), 88);
  add('Benefit Type', firstMatch(text, /\b(ACCIDENT\s*[-–]\s*[A-Z ]+)/i), 90);
  add('Issue Date', firstMatch(text, /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i), 88);
  add('Case Manager', extractNameBeforeLabel(text, 'Case Manager'), 65);
  add('Manager', extractNameBeforeLabel(text, 'Manager /Nurse'), 65);
  add('Medical Aid Status', extractCheckboxAnswer(text, 'Patient a member of a Medical Aid?'), 55);
  add('Consent Status', extractCheckboxAnswer(text, 'Patient has been informed'), 55);

  add('Name of Principal Member', extractAfterLabel(text, 'Name of Principal Member'), 70);
  add('Full name of Patient', extractAfterLabel(text, 'Full name of Patient'), 70);
  add('Membership Number', extractAfterLabel(text, 'Membership Number'), 75);
  add('Occupation', extractAfterLabel(text, 'Occupation'), 60);
  add('Date of Birth', extractAfterLabel(text, 'Date of Birth'), 65);
  add('Date of Incident', extractAfterLabel(text, 'Date of Incident'), 65);
  add('Time of Incident', extractAfterLabel(text, 'Time of Incident'), 65);
  add('Place of Incident', extractAfterLabel(text, 'Place of Incident'), 65);
  add('Incident Description', extractBetween(text, 'Give a detailed description of how the Incident happened:', 'If in the event of a Motor Vehicle Accident'), 60);
  add('Bank', extractAfterLabel(text, 'Bank'), 55);
  add('Branch Code', extractAfterLabel(text, 'Branch Code'), 55);
  add('Account Holder', extractAfterLabel(text, 'Account Holder'), 55);
  add('Account Number', extractAfterLabel(text, 'Account No'), 55);

  const ids = [...text.matchAll(/\b\d{13}\b/g)].map((match) => match[0]);
  if (ids[0]) add('Detected ID Number', ids[0], 72);
  if (ids[1]) add('Secondary ID Number', ids[1], 65);

  const detectedMemberNumber = extractDetectedMemberNumber(text, fields);
  if (detectedMemberNumber) add('Detected Member Number', detectedMemberNumber, 78);

  return fields;
}

function extractGopTableFields(text: string, add: (label: string, value: string, confidence?: number) => void) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  const hospital = extractGopRow(lines, 'Hospital Name', 'Practice #');
  if (hospital) {
    add('Hospital Name', hospital.left, 94);
    add('Hospital Practice Number', hospital.right, 94);
  }

  const casualty = extractGopRow(lines, 'Casualty Name', 'Practice #');
  if (casualty) {
    add('Casualty Name', casualty.left, 94);
    add('Casualty Practice Number', casualty.right, 94);
  }

  const radiology = extractGopRow(lines, 'Radiology Name', 'Practice #');
  if (radiology) {
    add('Radiology Name', radiology.left, 94);
    add('Radiology Practice Number', radiology.right, 94);
  }

  const tablePatterns: Array<[string, RegExp, string, RegExp?]> = [
    ['Hospital Name', /Hospital Name\s+(.+?)\s+Practice #\s+([^\n]+)/i, 'Hospital Practice Number'],
    ['Casualty Name', /Casualty Name\s+(.+?)\s+Practice #\s+([^\n]+)/i, 'Casualty Practice Number'],
    ['Radiology Name', /Radiology Name\s+(.+?)\s+Practice #\s+([^\n]+)/i, 'Radiology Practice Number'],
    ['Africa-Assist Ref Number', /Africa-Assist Ref #\s+([A-Z0-9]+)\s+Policy Valid\s+([^\n]+)/i, 'Policy Valid'],
    ['Policy Inception Date', /Policy Inception Date\s+([0-9/.-]+)\s+Waiting Period\s+([^\n]+)/i, 'Waiting Period Completed'],
    ['Name Of Patient', /Name Of Patient\s+(.+?)\s+Patient ID\s+([^\n]+)/i, 'Patient ID'],
    ['Authorised Amount', /Authorized \[Incl # Days\]\s+(.+?)\s+Auth Number\s+([A-Z0-9]+)/i, 'Auth Number'],
  ];

  for (const [leftLabel, regex, rightLabel] of tablePatterns) {
    const match = text.match(regex);
    if (!match) continue;
    add(leftLabel, stripLabelNoise(match[1]), 92);
    add(rightLabel, stripLabelNoise(match[2]), 92);
  }

  const memberMatch = text.match(/Member Name and\s+(.+?)\s+Member ID\s+([^\n]+)\nSurname/i);
  if (memberMatch) {
    add('Member Name and Surname', stripLabelNoise(memberMatch[1]), 92);
    add('Member ID', stripLabelNoise(memberMatch[2]), 92);
  }

  const diagnosisMatch = text.match(/Diagnosis \(Initial\s+(.+?)\s+Date Of Admission\s+([0-9/.-]+)\nRequest/i);
  if (diagnosisMatch) {
    add('Diagnosis', stripLabelNoise(diagnosisMatch[1]), 92);
    add('Date Of Admission', stripLabelNoise(diagnosisMatch[2]), 92);
  }

  const policyNumber = text.match(/Policy Number\s+([A-Z0-9]+)/i);
  if (policyNumber) add('Policy Number', policyNumber[1], 92);

  const issueDate = text.match(/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
  if (issueDate) add('Issue Date', issueDate[1], 90);

  const caseManager = text.match(/Name\(s\)\s+(.+?)\s+Date\s+([^\n]+)\nCase Manager/i);
  if (caseManager) {
    add('Case Manager', stripLabelNoise(caseManager[1]), 88);
    add('Case Manager Date', stripLabelNoise(caseManager[2]), 88);
  }

  const manager = text.match(/Name\(s\)\s+(.+?)\s+Date\s+([^\n]+)\nManager \/Nurse/i);
  if (manager) {
    add('Manager', stripLabelNoise(manager[1]), 88);
    add('Manager Date', stripLabelNoise(manager[2]), 88);
  }
}

function extractGopRow(lines: string[], leftLabel: string, rightLabel: string) {
  const labelPattern = new RegExp(`^${escapeRegex(leftLabel)}\\s+(.+?)\\s+${escapeRegex(rightLabel)}\\s+(.+)$`, 'i');
  const rowIndex = lines.findIndex((line) => labelPattern.test(line));
  if (rowIndex === -1) return null;

  const match = lines[rowIndex].match(labelPattern);
  if (!match) return null;

  let left = match[1];
  const right = match[2];
  const nextLine = lines[rowIndex + 1] || '';

  if (isGopContinuationLine(left, nextLine)) {
    left = `${left} ${nextLine}`;
  }

  return {
    left: stripLabelNoise(left),
    right: stripLabelNoise(right),
  };
}

function isGopContinuationLine(currentValue: string, nextLine: string) {
  if (!nextLine) return false;
  if (/^(GOP Details|Africa-Assist|Policy|Member Name|Name Of Patient|Authorized|Diagnosis|Total Guaranteed|Disclaimer|Note|Billing|Name\(s\))/i.test(nextLine)) {
    return false;
  }
  return /[&-]$/.test(currentValue.trim()) || /^[A-Z0-9 &.'/-]+$/.test(nextLine);
}

function normaliseLabel(label: string) {
  return label.replace(/\s*#$/, ' Number').replace('Authorized [Incl # Days]', 'Authorised Amount');
}

function extractPair(text: string, leftLabel: string, rightLabel: string) {
  const pattern = new RegExp(`${escapeRegex(leftLabel)}\\s+(.+?)\\s+${escapeRegex(rightLabel)}\\s+([^\\n]+)`, 'i');
  const match = text.match(pattern);
  if (!match) return { left: '', right: '', confidence: 0 };
  return {
    left: stripLabelNoise(match[1]),
    right: stripLabelNoise(match[2]),
    confidence: 82,
  };
}

function extractAfterLabel(text: string, label: string) {
  const pattern = new RegExp(`${escapeRegex(label)}\\s*:?\\s*([^\\n]+)`, 'i');
  const match = text.match(pattern);
  if (!match) return '';
  return stripLabelNoise(match[1]);
}

function extractBetween(text: string, startLabel: string, endLabel: string) {
  const pattern = new RegExp(`${escapeRegex(startLabel)}\\s*([\\s\\S]+?)${escapeRegex(endLabel)}`, 'i');
  const match = text.match(pattern);
  return match ? stripLabelNoise(match[1]) : '';
}

function extractNameBeforeLabel(text: string, label: string) {
  const pattern = new RegExp(`Name\\(s\\)\\s+([^\\n]+?)\\s+Date[^\\n]*\\n?${escapeRegex(label)}`, 'i');
  const match = text.match(pattern);
  return match ? stripLabelNoise(match[1]) : '';
}

function extractCheckboxAnswer(text: string, label: string) {
  const index = text.toLowerCase().indexOf(label.toLowerCase());
  if (index === -1) return '';
  const section = text.slice(index, index + 250);
  const yesChecked = /☒\s*YES/i.test(section) || /\[x\]\s*YES/i.test(section);
  const noChecked = /☒\s*NO/i.test(section) || /\[x\]\s*NO/i.test(section);
  if (yesChecked) return 'Yes';
  if (noChecked) return 'No';
  return '';
}

function firstMatch(text: string, regex: RegExp) {
  const match = text.match(regex);
  return match ? stripLabelNoise(match[1]) : '';
}

function extractDetectedMemberNumber(text: string, fields: ExtractedField[]) {
  const existingValues = new Set(fields.map((field) => field.value.toUpperCase()));
  const candidates = [...text.matchAll(/\b(?:DAY|PAR|MAM|MED|AXS|ZWH|MBM|MKT|BPO|MTS)[A-Z0-9]{5,}\b/gi)]
    .map((match) => match[0].toUpperCase())
    .filter((candidate) => /\d/.test(candidate))
    .filter((candidate) => !existingValues.has(candidate));

  return candidates[0] || '';
}

function stripLabelNoise(value: string) {
  return value
    .replace(/_{3,}/g, '')
    .replace(/\s+(Practice #|Member ID|Patient ID|Auth Number|Date Of Admission|Policy Valid|Waiting Period Completed).*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function generateNextHcrClaimNumber(existingClaimNumbers: string[] = []) {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const prefix = `HCR${yy}${mm}${dd}`;

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from('claims')
    .select('claim_number')
    .like('claim_number', `${prefix}%`)
    .order('claim_number', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Failed to inspect HCR claim numbers:', error);
  }

  const databaseLast = data?.[0]?.claim_number || '';
  const visibleLast = existingClaimNumbers
    .filter((claimNumber) => claimNumber.startsWith(prefix))
    .sort()
    .at(-1) || '';

  const databaseSequence = databaseLast.startsWith(prefix) ? Number(databaseLast.slice(prefix.length)) : 0;
  const visibleSequence = visibleLast.startsWith(prefix) ? Number(visibleLast.slice(prefix.length)) : 0;
  const nextSequence = Math.max(
    Number.isFinite(databaseSequence) ? databaseSequence : 0,
    Number.isFinite(visibleSequence) ? visibleSequence : 0
  ) + 1;

  return `${prefix}${String(nextSequence).padStart(7, '0')}`;
}
