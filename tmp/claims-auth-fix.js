const fs = require('fs');
const path = require('path');
const root = 'E:/wind new/day1main';

function patch(rel, transform) {
  const full = path.join(root, rel);
  const before = fs.readFileSync(full, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(full, after);
    console.log('patched', rel);
  } else {
    console.log('nochange', rel);
  }
}

patch('apps/frontend/src/middleware.ts', (text) => {
  if (!text.includes("pathname.startsWith('/api/admin/roles')")) {
    text = text.replace(
      "    pathname.startsWith('/api/admin/rules') ||\n    pathname.startsWith('/api/data-import') ||\n    pathname.startsWith('/api/feedback');",
      "    pathname.startsWith('/api/admin/rules') ||\n    pathname.startsWith('/api/admin/roles') ||\n    pathname.startsWith('/api/claims-assessor') ||\n    pathname.startsWith('/api/data-import') ||\n    pathname.startsWith('/api/feedback');"
    );
  }
  return text;
});

patch('apps/frontend/src/app/api/claims-assessor/fraud/route.ts', (text) => {
  if (!text.includes("requireAnyRole")) {
    text = text.replace(
      "import { NextRequest, NextResponse } from 'next/server';\n",
      "import { NextRequest, NextResponse } from 'next/server';\nimport { requireAnyRole } from '@/lib/auth-server';\n"
    );
  }
  if (!text.includes("await requireAnyRole(request, ['claims', 'admin', 'system_admin']);")) {
    text = text.replace(
      "export async function GET(request: NextRequest) {\n  try {\n",
      "export async function GET(request: NextRequest) {\n  try {\n    await requireAnyRole(request, ['claims', 'admin', 'system_admin']);\n\n"
    );
  }
  return text;
});

patch('apps/frontend/src/app/api/claims-assessor/fraud/[id]/route.ts', (text) => {
  if (!text.includes("requireAnyRole")) {
    text = text.replace(
      "import { NextRequest, NextResponse } from 'next/server';\n",
      "import { NextRequest, NextResponse } from 'next/server';\nimport { requireAnyRole } from '@/lib/auth-server';\n"
    );
  }
  if (!text.includes("await requireAnyRole(request, ['claims', 'admin', 'system_admin']);")) {
    text = text.replace(
      ") {\n  try {\n",
      ") {\n  try {\n    await requireAnyRole(request, ['claims', 'admin', 'system_admin']);\n\n"
    );
  }
  return text;
});

patch('apps/frontend/src/app/api/claims-assessor/queue/[id]/route.ts', (text) => {
  if (!text.includes("requireAnyRole")) {
    text = text.replace(
      "import { NextRequest, NextResponse } from 'next/server';\n",
      "import { NextRequest, NextResponse } from 'next/server';\nimport { requireAnyRole } from '@/lib/auth-server';\n"
    );
  }
  if (!text.includes("await requireAnyRole(request, ['claims', 'admin', 'system_admin']);")) {
    text = text.replace(
      ") {\n  try {\n",
      ") {\n  try {\n    await requireAnyRole(request, ['claims', 'admin', 'system_admin']);\n\n"
    );
  }
  return text;
});

patch('apps/frontend/src/components/layout/sidebar-layout.tsx', (text) => {
  if (!text.includes("const feedbackHref = isClaimsAssessor")) {
    text = text.replace(
      "    const isProvider = userRoles.includes('provider');\n    const isCallCentreAgent = userRoles.includes('call_centre_agent');\n    const isMember = userRoles.includes('member');\n",
      "    const isProvider = userRoles.includes('provider');\n    const isCallCentreAgent = userRoles.includes('call_centre_agent');\n    const isMember = userRoles.includes('member');\n    const feedbackHref = isClaimsAssessor ? '/claims/feedback' : isOperationsManager ? '/operations/feedback' : '/admin/feedback';\n"
    );
    text = text.replace("          href: '/admin/feedback',", "          href: feedbackHref,");
  }
  return text;
});

const claimsFeedback = path.join(root, 'apps/frontend/src/app/claims/feedback/page.tsx');
if (!fs.existsSync(claimsFeedback)) {
  fs.mkdirSync(path.dirname(claimsFeedback), { recursive: true });
  fs.writeFileSync(claimsFeedback, "export { default } from '@/app/operations/feedback/page';\n");
  console.log('created apps/frontend/src/app/claims/feedback/page.tsx');
} else {
  console.log('nochange apps/frontend/src/app/claims/feedback/page.tsx');
}
