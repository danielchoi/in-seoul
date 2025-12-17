# Website Exploration Summary

## URL
https://v0-university-admission-service.vercel.app/

---

## Quick Overview

**Purpose:** Korean university admission comparison service
**Tech Stack:** Next.js 15, Tailwind CSS 4, shadcn/ui (Radix UI)
**Type:** Single-page application, client-side only, no backend API

---

## Key Features

### 1. University Comparison (Up to 5 at once)

**Default Selected:**
- 서울대학교 (Seoul National University)
- 연세대학교 (Yonsei University)
- 고려대학교 (Korea University)

**21 Additional Universities Available:**
KAIST, POSTECH, 성균관대, 한양대, 서강대, 중앙대, 경희대, 한국외대, 서울시립대, 건국대, 동국대, 홍익대, 숙명여대, 이화여대, 부산대, 경북대, 전남대, 전북대, 충남대, 충북대, 강원대

### 2. Comparison Table

**30 Departments/Majors:**
간호대학, 경영대학, 공과대학, 교육과학대학, 국제학부, 농업생명과학대학, 문과대학, 미디어학부, 미술대학, 법과대학, 보건과학대학, 사범대학, 사회과학대학, 상경대학, 생명과학대학, 생명시스템대학, 생활과학대학, 수의과대학, 신과대학, 심리학부, 약학대학, 음악대학, 의과대학, 이과대학, 인문대학, 자연과학대학, 정경대학, 정보대학, 치과대학, 치의학대학원

**Evaluation Levels:**
- 안전권 (Safety - 70%+ admission chance)
- 적정권 (Target - at cutoff line)
- 상향 (Reach - challenge needed)
- `-` (Department not available)

### 3. Grade Input System

**High School Type Selector:**
- Default: 일반고 (General High School)
- Component: shadcn/ui Select (Radix UI)

**내신 등급 (Internal Grade Slider):**
- Range: 1-9
- Default: 2.0
- Component: Radix UI Slider

**수능 등급 (CSAT Grade Slider):**
- Range: 1-9
- Default: 3
- Component: Radix UI Slider

---

## Interactive Elements Discovered

### Working Elements:
- University add/remove buttons
- High school type dropdown (opens on click)
- University selector dropdown (opens on click, shows 21 universities)
- Grade sliders (visual component, uses Radix UI span elements)
- Escape key closes dropdowns

### UI Components:
- 18 cards total
- 5 buttons (3 icon buttons, "대학 추가", school type trigger)
- 2 sliders (Radix UI role="slider")
- 2 comboboxes (university selector, school type)
- 1 large comparison table

---

## Technical Implementation

### Frontend Stack:
- Next.js 15 (App Router)
- Turbopack (build tool)
- Tailwind CSS 4
- shadcn/ui (new-york style)
- Radix UI components
- TypeScript (inferred from Next.js setup)

### Performance:
- 17 network requests total
- 1 API call (Vercel Analytics only)
- 2 web fonts (WOFF2)
- 2 CSS chunks
- 7 JavaScript chunks
- Static rendering with client-side hydration

### Data Architecture:
- No database calls
- No external APIs for university data
- All data embedded in JavaScript bundles
- Client-side calculation for admission chances
- No localStorage/sessionStorage usage
- No user authentication

### Deployment:
- Hosted on Vercel
- Uses Vercel Analytics v1.6.1
- Next.js 15 with App Router
- Static site generation (SSG)

---

## Data Structures Visible

### Universities Array (21 options in dropdown):
```
KAIST
포항공과대학교
성균관대학교
한양대학교
서강대학교
중앙대학교
경희대학교
한국외국어대학교
서울시립대학교
건국대학교
동국대학교
홍익대학교
숙명여자대학교
이화여자대학교
부산대학교
경북대학교
전남대학교
전북대학교
충남대학교
충북대학교
강원대학교
```

### Departments (30 total, see full list above)

### Current Table State:
All cells show "상향" (reach) for default grades (내신 2.0, 수능 3)

---

## UI/UX Patterns

### Design Principles:
- Clean, minimal interface
- Blue accent colors
- Card-based layout sections
- Responsive table design
- Real-time feedback on slider changes
- Color-coded evaluation badges
- Hover states on interactive elements

### Accessibility:
- ARIA attributes on sliders
- Keyboard navigation (Escape to close)
- Semantic HTML
- Focus management
- Screen reader considerations (some improvements needed)

### User Flow:
1. See default comparison (3 universities)
2. Add/remove universities (max 5)
3. Scroll to grade input
4. Adjust sliders
5. View updated table in real-time

---

## Navigation & Pages

- Single page application
- No navigation menu
- No footer links
- No additional routes discovered
- No authentication required
- No user account features

---

## Files Generated

### Screenshots (10 total):
- `/Users/babo/Projects/in-seoul/exploration-screenshots/01-main-page.png`
- `/Users/babo/Projects/in-seoul/exploration-screenshots/02-dropdown-1-open.png`
- `/Users/babo/Projects/in-seoul/exploration-screenshots/02-dropdown-2-open.png`
- `/Users/babo/Projects/in-seoul/exploration-screenshots/03-add-university-dropdown.png`
- `/Users/babo/Projects/in-seoul/exploration-screenshots/05-school-type-dropdown.png`
- `/Users/babo/Projects/in-seoul/exploration-screenshots/10-final-comprehensive.png`
- `/Users/babo/Projects/in-seoul/exploration-screenshots/11-sliders-section.png`
- `/Users/babo/Projects/in-seoul/exploration-screenshots/13-university-dropdown-detailed.png`
- `/Users/babo/Projects/in-seoul/exploration-screenshots/14-final-exploration.png`
- `/Users/babo/Projects/in-seoul/exploration-screenshots/99-final-state.png`

### Data Files:
- `exploration-results.json` (initial exploration data)
- `table-data.json` (comparison table structure)
- `network-requests.json` (all HTTP requests)
- `page-structure.json` (DOM structure)
- `script-data.txt` (JavaScript bundle data)

### Documentation:
- `website-exploration-report.md` (comprehensive report)
- `EXPLORATION-SUMMARY.md` (this file)

---

## Recommendations for Implementation

### Must-Have Features:
1. Multi-university comparison (max 5)
2. 30+ department comparison table
3. Dual slider grade inputs (내신/수능)
4. Three-tier evaluation system
5. Real-time calculation and updates
6. Add/remove universities dynamically

### Recommended Tech Stack:
- Next.js 15 App Router
- TypeScript (strict mode)
- Tailwind CSS 4
- shadcn/ui components
- Radix UI for complex interactions
- Drizzle ORM (if adding database)

### Component Architecture:
```
components/
├── university-selector.tsx
├── comparison-table.tsx
├── grade-input.tsx
├── evaluation-badge.tsx
└── evaluation-legend.tsx
```

### Data Schema (if implementing with DB):
```typescript
// University
{
  id: string
  name: string
  departments: Department[]
}

// Department
{
  id: string
  name: string
  universityId: string
  cutoffs: AdmissionCutoff[]
}

// AdmissionCutoff
{
  highSchoolType: string
  internalGradeMin: number
  csatGradeMin: number
  safetyThreshold: number
  targetThreshold: number
}
```

---

## Key Insights

1. **Simple but effective:** Focused on one task, does it well
2. **No backend needed:** All calculations client-side
3. **Modern stack:** Next.js 15, latest React patterns
4. **Accessible components:** Radix UI provides good foundation
5. **Performance:** Fast load, instant updates
6. **Mobile considerations:** May need responsive improvements

---

## Next Steps for Similar Project

1. Set up Next.js 15 with TypeScript
2. Install shadcn/ui components (Select, Slider, Table, Badge)
3. Create university and department data structures
4. Implement comparison table with dynamic columns
5. Build grade input section with sliders
6. Add evaluation logic (calculate 안전권/적정권/상향)
7. Style with Tailwind CSS
8. Add remove/add university functionality
9. Implement max 5 universities limit
10. Test across different screen sizes

---

## Contact & Support

All exploration artifacts saved to:
`/Users/babo/Projects/in-seoul/exploration-screenshots/`

Full detailed report:
`/Users/babo/Projects/in-seoul/website-exploration-report.md`
