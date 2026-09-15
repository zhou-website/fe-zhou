/**
 * scripts/update-progress.js
 * Automatic Project Progress Documentation Generator for Zhou Consulting Front-End
 *
 * Reads: progress-data.json
 * Generates: docs/project-progress.md
 *
 * Usage:
 *   node scripts/update-progress.js
 *   npm run update-progress
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT_DIR, 'progress-data.json');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'project-progress.md');

// Helper function to render a visual block progress bar
function renderProgressBar(percentage, length = 15) {
  const safePct = Math.max(0, Math.min(100, percentage));
  const filled = Math.round((safePct / 100) * length);
  const empty = length - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

// Ensure docs directory exists
const docsDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  console.error(`[Error] Data file not found at: ${DATA_FILE}`);
  process.exit(1);
}

const rawData = fs.readFileSync(DATA_FILE, 'utf8');
const data = JSON.parse(rawData);

const tasks = data.tasks || [];
const totalTasks = tasks.length;

// Status counts
const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
const inProgressCount = tasks.filter(t => t.status === 'IN PROGRESS').length;
const notStartedCount = tasks.filter(t => t.status === 'NOT STARTED').length;
const blockedCount = tasks.filter(t => t.status === 'BLOCKED').length;
const needsVerificationCount = tasks.filter(t =>
  t.status === 'NEEDS VERIFICATION' ||
  t.status === 'UNKNOWN / NEEDS VERIFICATION' ||
  t.status === 'UNKNOWN'
).length;

const overallPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
const overallBarLarge = renderProgressBar(overallPercentage, 20);
const overallBarMedium = renderProgressBar(overallPercentage, 15);

// Group by module preserving original order
const moduleMap = new Map();
for (const t of tasks) {
  const modName = t.module || 'Unassigned';
  if (!moduleMap.has(modName)) {
    moduleMap.set(modName, {
      name: modName,
      tasks: [],
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      blocked: 0,
      needsVerification: 0
    });
  }
  const m = moduleMap.get(modName);
  m.tasks.push(t);
  if (t.status === 'COMPLETED') m.completed++;
  else if (t.status === 'IN PROGRESS') m.inProgress++;
  else if (t.status === 'NOT STARTED') m.notStarted++;
  else if (t.status === 'BLOCKED') m.blocked++;
  else m.needsVerification++;
}

// Format Module Table
const moduleRows = [];
const consoleModuleLines = [];
for (const [name, m] of moduleMap.entries()) {
  const total = m.tasks.length;
  const pct = total > 0 ? Math.round((m.completed / total) * 100) : 0;
  let status = 'NOT STARTED';
  if (m.completed === total && total > 0) {
    status = 'COMPLETED';
  } else if (m.inProgress > 0 || (m.completed > 0 && m.completed < total)) {
    status = 'IN PROGRESS';
  } else if (m.blocked > 0) {
    status = 'BLOCKED';
  } else if (m.needsVerification > 0) {
    status = 'UNKNOWN / NEEDS VERIFICATION';
  }
  const bar = renderProgressBar(pct, 10);
  moduleRows.push(`| ${name} | ${m.completed} | ${total} | ${pct}% | \`${bar}\` | ${status} |`);
  
  const paddedName = name.padEnd(36, ' ');
  const paddedPct = `${pct}%`.padStart(4, ' ');
  consoleModuleLines.push(`  - ${paddedName} : ${bar} ${paddedPct} (${m.completed}/${total})`);
}

// Current Work
const inProgressTasks = tasks.filter(t => t.status === 'IN PROGRESS');
let currentWorkContent = '> No task is currently in progress.';
if (inProgressTasks.length > 0) {
  currentWorkContent = inProgressTasks.map(t =>
    `- **[${t.id}] ${t.task}** (Module: ${t.module}) — Status: \`IN PROGRESS\``
  ).join('\n');
}

// Next Task (first NOT STARTED task)
const nextTaskCandidate = tasks.find(t => t.status === 'NOT STARTED');
const nextTaskInfo = nextTaskCandidate ? {
  id: nextTaskCandidate.id,
  task: nextTaskCandidate.task,
  module: nextTaskCandidate.module,
  status: 'NOT STARTED',
  reason: 'This is the next task in the project checklist after the currently completed work.'
} : (data.nextTask || {
  id: 'N/A',
  task: 'All tasks completed',
  module: 'N/A',
  status: 'COMPLETED',
  reason: 'All checklist tasks have been finished.'
});

// Detailed Task Progress Rows
const taskRows = tasks.map(t => {
  const sanitizedTask = (t.task || '').replace(/\|/g, '\\|');
  const sanitizedEvidence = (t.evidence || '-').replace(/\|/g, '\\|');
  return `| ${t.id} | ${sanitizedTask} | ${t.module} | ${t.status} | ${sanitizedEvidence} |`;
}).join('\n');

// Landing Page Section Table
const landingSections = data.landingPageSections || [
  { section: 'Header / Navbar', status: 'NOT STARTED' },
  { section: 'Hero', status: 'NOT STARTED' },
  { section: 'About / Siapa Kita', status: 'NOT STARTED' },
  { section: 'Services / Layanan', status: 'NOT STARTED' },
  { section: 'Contact / Hubungi Kami', status: 'NOT STARTED' },
  { section: 'Footer', status: 'NOT STARTED' }
];
const landingRows = landingSections.map(s => `| ${s.section} | ${s.status} |`).join('\n');

// Markdown Assembly
const markdown = `# Zhou Consulting Front-End — Project Progress

## Project Overview

| Information | Details |
|---|---|
| Project | ${data.project || 'Zhou Consulting – Finance, Accounting, and Tax Partner'} |
| Repository | \`${data.repository || 'zhou-website/fe-zhou'}\` |
| Framework | ${data.framework || 'Next.js 14.2.35'} |
| Language | ${data.language || 'TypeScript'} |
| Styling | ${data.styling || 'Tailwind CSS'} |
| UI | ${data.ui || 'shadcn/ui'} |
| Typography | ${data.typography || 'Open Sans'} |
| Icons | ${data.icons || 'Font Awesome'} |
| Current Phase | ${data.currentPhase || 'Design System Implementation → Front-End Slicing & Implementation'} |
| Overall Progress | ${overallPercentage}% \`${overallBarMedium}\` |
| Last Updated | ${data.lastUpdated || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} |

---

## Progress Summary

**Overall Progress:** \`${overallBarLarge}\` **${overallPercentage}%** (${completedCount}/${totalTasks} Tasks Completed)

| Metric | Result |
|---|---:|
| Overall Progress | ${overallPercentage}% |
| Total Tasks | ${totalTasks} |
| Completed | ${completedCount} |
| In Progress | ${inProgressCount} |
| Not Started | ${notStartedCount} |
| Blocked | ${blockedCount} |
| Needs Verification | ${needsVerificationCount} |

---

## Module Progress

| Module | Completed | Total | Progress | Progress Bar | Status |
|---|---:|---:|---:|:---:|---|
${moduleRows.join('\n')}

---

## Detailed Task Progress

| ID | Task | Module | Status | Evidence / Notes |
|---|---|---|---|---|
${taskRows}

---

## Completed Work

### Front-End Project Setup
Status: \`COMPLETED\`

Yang sudah tersedia:
- Next.js 14.2.35
- TypeScript
- Tailwind CSS
- App Router
- ESLint
- \`src/\` structure
- import alias \`@/*\`
- Git repository
- GitHub remote

### AI Agent Setup & Configuration
Status: \`COMPLETED\`

Yang sudah tersedia:
- \`.agents/rules/zhou-consulting-frontend.md\`
- \`.agents/agents/zhou-frontend-agent/agent.md\`

### Design System Foundation
Status: \`COMPLETED\`

Yang sudah tersedia:
- Open Sans
- Typography system
- Zhou Consulting color tokens
- Tailwind tokens
- CSS variables
- reusable UI components
- shadcn/ui foundation
- Font Awesome icons
- global styling
- responsive typography foundation

Relevant files include:
- \`tailwind.config.ts\`
- \`src/app/globals.css\`
- \`src/components/ui/button.tsx\`
- \`src/components/ui/input.tsx\`
- \`src/components/ui/textarea.tsx\`
- \`src/components/ui/label.tsx\`
- \`src/components/ui/card.tsx\`
- \`src/components/ui/badge.tsx\`
- \`src/components/icons/index.tsx\`

### Brand Revision
Status: \`COMPLETED\`

Current approved palette:
- Primary: \`#0B1533\`
- Primary Dark: \`#060D22\`
- White: \`#FFFFFF\`
- Grey / Silver: \`#C5C8D0\`
- Secondary Grey: \`#667085\`
- Primary Light: \`#E9EDF5\`
- Surface: \`#F7F8FA\`
- Text: \`#172033\`
- Success: \`#12B76A\`
- Error: \`#D92D20\`

IMPORTANT:
Gold is NOT part of the current brand system.
Verified that old gold values are not present:
- \`#B8933C\`
- \`#A38032\`

Do not reintroduce gold.

---

## Landing Page Implementation

| Section | Status |
|---|---|
${landingRows}

> **Note:** Figma design ≠ Front-End implementation. Landing page slicing will commence under Module: Front-End Slicing & Implementation.

---

## Current Work

${currentWorkContent}

---

## Next Task

### Next Task

**Task:** ${nextTaskInfo.id}: ${nextTaskInfo.task}

**Module:** ${nextTaskInfo.module}

**Status:** ${nextTaskInfo.status}

**Reason:** ${nextTaskInfo.reason}

---

## Repository Evidence

Repository audit:

✓ Next.js configured
✓ TypeScript configured
✓ Tailwind CSS configured
✓ Open Sans configured
✓ Zhou Consulting color tokens configured
✓ shadcn/ui foundation configured
✓ Font Awesome configured
✓ AI Agent rules configured
✓ Custom AI Agent configured
✗ Landing page sections not yet implemented
`;

fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');

console.log('============================================================');
console.log('Zhou Consulting Front-End — Project Progress Updated');
console.log('============================================================');
console.log(`Overall Progress   : ${overallBarLarge} ${overallPercentage}% (${completedCount}/${totalTasks})`);
console.log(`Total Tasks        : ${totalTasks}`);
console.log(`Completed          : ${completedCount} (${overallPercentage}%)`);
console.log(`In Progress        : ${inProgressCount}`);
console.log(`Not Started        : ${notStartedCount}`);
console.log(`Blocked            : ${blockedCount}`);
console.log(`Needs Verification : ${needsVerificationCount}`);
console.log('------------------------------------------------------------');
console.log('Module Breakdown:');
console.log(consoleModuleLines.join('\n'));
console.log('------------------------------------------------------------');
console.log(`Next Task          : ${nextTaskInfo.id}: ${nextTaskInfo.task}`);
console.log(`Module             : ${nextTaskInfo.module}`);
console.log(`Output File        : docs/project-progress.md`);
console.log('============================================================');
