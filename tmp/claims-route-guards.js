const fs = require('fs');
const path = require('path');
const root = 'E:/wind new/day1main';

function patch(rel, importer, anchor, injected) {
  const full = path.join(root, rel);
  let text = fs.readFileSync(full, 'utf8');
  const before = text;
  if (!text.includes("requireAnyRole")) {
    text = text.replace(importer.from, importer.to);
  }
  if (!text.includes("await requireAnyRole(request, ['claims', 'admin', 'system_admin']);")) {
    text = text.replace(anchor, injected);
  }
  if (text !== before) {
    fs.writeFileSync(full, text);
    console.log('patched', rel);
  } else {
    console.log('nochange', rel);
  }
}

patch(
  'apps/frontend/src/app/api/claims-assessor/fraud/route.ts',
  {
    from: "import { NextRequest, NextResponse } from 'next/server';\r\n",
    to: "import { NextRequest, NextResponse } from 'next/server';\r\nimport { requireAnyRole } from '@/lib/auth-server';\r\n"
  },
  "export async function GET(request: NextRequest) {\r\n  try {\r\n",
  "export async function GET(request: NextRequest) {\r\n  try {\r\n    await requireAnyRole(request, ['claims', 'admin', 'system_admin']);\r\n\r\n"
);

patch(
  'apps/frontend/src/app/api/claims-assessor/fraud/[id]/route.ts',
  {
    from: "import { NextRequest, NextResponse } from 'next/server';\r\n",
    to: "import { NextRequest, NextResponse } from 'next/server';\r\nimport { requireAnyRole } from '@/lib/auth-server';\r\n"
  },
  ") {\r\n  try {\r\n",
  ") {\r\n  try {\r\n    await requireAnyRole(request, ['claims', 'admin', 'system_admin']);\r\n\r\n"
);

patch(
  'apps/frontend/src/app/api/claims-assessor/queue/[id]/route.ts',
  {
    from: "import { NextRequest, NextResponse } from 'next/server';\r\n",
    to: "import { NextRequest, NextResponse } from 'next/server';\r\nimport { requireAnyRole } from '@/lib/auth-server';\r\n"
  },
  ") {\r\n  try {\r\n",
  ") {\r\n  try {\r\n    await requireAnyRole(request, ['claims', 'admin', 'system_admin']);\r\n\r\n"
);
