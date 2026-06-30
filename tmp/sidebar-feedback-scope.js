const fs = require('fs');
const file = 'E:/wind new/day1main/apps/frontend/src/components/layout/sidebar-layout.tsx';
let text = fs.readFileSync(file, 'utf8');
const target = "    const isProvider = userRoles.includes('provider');\r\n    const isCallCentreAgent = userRoles.includes('call_centre_agent');\r\n    const isMember = userRoles.includes('member');\r\n";
const insert = target + "    const feedbackHref = isClaimsAssessor ? '/claims/feedback' : isOperationsManager ? '/operations/feedback' : '/admin/feedback';\r\n";
if (!text.includes("const feedbackHref = isClaimsAssessor")) {
  text = text.replace(target, insert);
} else if (!text.includes(target + "    const feedbackHref = isClaimsAssessor")) {
  text = text.replace(target, insert);
}
fs.writeFileSync(file, text);
console.log('patched sidebar scope');
