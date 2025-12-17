# University Admission Service Website Exploration Report

**URL:** https://v0-university-admission-service.vercel.app/

**Date:** December 9, 2025

**Exploration Method:** Automated browser testing with Playwright

---

## Executive Summary

This is a Korean university admission comparison service that allows students to compare admission chances across multiple universities based on their high school type and grades. The service is built with Next.js 15, uses Tailwind CSS, and implements shadcn/ui components (Radix UI under the hood).

---

## Page Structure & Content

### 1. Main Title and Description
- **Title:** 대학 입시 비교 서비스 (University Admission Comparison Service)
- **Subtitle:** 성적에 따라 지원 가능한 대학과 학과를 한눈에 비교하세요 (Compare eligible universities and departments at a glance based on your grades)

### 2. University Selection Area

**Default Universities (Pre-selected):**
- 서울대학교 (Seoul National University)
- 연세대학교 (Yonsei University)
- 고려대학교 (Korea University)

**Additional Universities Available (via "대학 추가" dropdown):**
1. KAIST
2. 포항공과대학교 (POSTECH)
3. 성균관대학교 (Sungkyunkwan University)
4. 한양대학교 (Hanyang University)
5. 서강대학교 (Sogang University)
6. 중앙대학교 (Chung-Ang University)
7. 경희대학교 (Kyung Hee University)
8. 한국외국어대학교 (Hankuk University of Foreign Studies)
9. 서울시립대학교 (University of Seoul)
10. 건국대학교 (Konkuk University)
11. 동국대학교 (Dongguk University)
12. 홍익대학교 (Hongik University)
13. 숙명여자대학교 (Sookmyung Women's University)
14. 이화여자대학교 (Ewha Womans University)
15. 부산대학교 (Pusan National University)
16. 경북대학교 (Kyungpook National University)
17. 전남대학교 (Chonnam National University)
18. 전북대학교 (Jeonbuk National University)
19. 충남대학교 (Chungnam National University)
20. 충북대학교 (Chungbuk National University)
21. 강원대학교 (Kangwon National University)

**Maximum Limit:** Up to 5 universities can be compared at once (최대 5개 대학까지 비교할 수 있습니다)

### 3. Comparison Table

The main feature is a comprehensive comparison table with the following structure:

**Table Headers:**
- 학과 (Major/Department)
- [University 1 Name]
- [University 2 Name]
- [University 3 Name]
- ... (up to 5 columns)

**Departments/Majors Listed (30 total):**
1. 간호대학 (College of Nursing)
2. 경영대학 (College of Business)
3. 공과대학 (College of Engineering)
4. 교육과학대학 (College of Education)
5. 국제학부 (Division of International Studies)
6. 농업생명과학대학 (College of Agriculture and Life Sciences)
7. 문과대학 (College of Liberal Arts)
8. 미디어학부 (Division of Media)
9. 미술대학 (College of Fine Arts)
10. 법과대학 (College of Law)
11. 보건과학대학 (College of Health Sciences)
12. 사범대학 (College of Education)
13. 사회과학대학 (College of Social Sciences)
14. 상경대학 (College of Economics and Commerce)
15. 생명과학대학 (College of Life Sciences)
16. 생명시스템대학 (College of Life Systems)
17. 생활과학대학 (College of Human Ecology)
18. 수의과대학 (College of Veterinary Medicine)
19. 신과대학 (College of Theology)
20. 심리학부 (Division of Psychology)
21. 약학대학 (College of Pharmacy)
22. 음악대학 (College of Music)
23. 의과대학 (College of Medicine)
24. 이과대학 (College of Sciences)
25. 인문대학 (College of Humanities)
26. 자연과학대학 (College of Natural Sciences)
27. 정경대학 (College of Political Science and Economics)
28. 정보대학 (College of Informatics)
29. 치과대학 (College of Dentistry)
30. 치의학대학원 (Graduate School of Dentistry)

**Cell Values:**
- `상향` (Reach/Challenge) - Student needs to improve to have a good chance
- `적정권` (Target/Match) - Student is at the cutoff line
- `안전권` (Safety) - 70% or higher chance of admission
- `-` (Not available) - Department not offered at this university

---

## Interactive Elements

### 4. Grade Input Section (내 성적 입력)

**Section Title:** 내 성적 입력 (Enter My Grades)
**Description:** 고등학교 유형과 성적을 입력하면 지원 가능한 대학이 표시됩니다 (Enter your high school type and grades to see eligible universities)

**A. High School Type Selector (고등학교 유형)**
- **Component Type:** shadcn/ui Select (Radix UI combobox)
- **Default Value:** 일반고 (General High School)
- **Available Options:** (Dropdown appears clickable but specific options not captured in exploration)

**B. Internal Grade Slider (내신 등급)**
- **Component Type:** Radix UI Slider (role="slider")
- **Range:** 1등급 to 9등급 (Grade 1 to Grade 9)
- **Default Value:** 2.0등급 (Grade 2.0)
- **Visual:** Blue slider track with circular thumb
- **Current Display:** Shows "2.0등급" on the right side

**C. CSAT Grade Slider (수능 등급)**
- **Component Type:** Radix UI Slider (role="slider")
- **Range:** 1등급 to 9등급 (Grade 1 to Grade 9)
- **Default Value:** 3등급 (Grade 3)
- **Visual:** Blue slider track with circular thumb
- **Current Display:** Shows "3등급" on the right side

### 5. Evaluation Criteria Legend (평가 기준)

**Three-level color-coded system:**
- 🟢 **안전권** (Safety Zone) - 70% 이상 합격 가능성 (70% or higher chance of admission)
- 🟡 **적정권** (Target Zone) - 합격 컷 라인 (At the admission cutoff line)
- 🔴 **상향** (Reach Zone) - 도전 필요 (Challenge needed)

---

## UI/UX Design Patterns

### Design System
- **Framework:** Next.js 15 with Turbopack
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui (new-york style)
- **Font:** Custom web fonts (likely Geist Sans based on Next.js default)
- **Color Scheme:** Clean, minimal with blue accent colors
- **Responsive:** Full-width layout optimized for desktop viewing

### Component Patterns

1. **University Tags (Pill-style badges)**
   - Blue background with X close buttons
   - Removable by clicking the X
   - Shows currently selected universities
   - Example: [서울대학교 ×] [연세대학교 ×] [고려대학교 ×]

2. **Add University Button**
   - Text: "대학 추가" (Add University)
   - Opens dropdown selector with 21 additional universities
   - Styled as a button trigger for Radix UI Select

3. **Comparison Table**
   - Alternating row backgrounds (light gray/white)
   - Fixed-width columns with university names as headers
   - Left-aligned department names
   - Center-aligned evaluation badges
   - Hover effects on interactive elements

4. **Grade Sliders**
   - Radix UI Slider components
   - Horizontal orientation
   - Visual feedback with colored tracks
   - Accessible (proper ARIA attributes)
   - Real-time value display

5. **Cards**
   - Total of 18 card components detected
   - Used for sectioning (university selector, table, grade input, legend)
   - Consistent border radius and shadow

---

## Technical Implementation

### Technology Stack
- **Frontend:** Next.js 15 (App Router)
- **Build Tool:** Turbopack (indicated by chunk filenames)
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics (@vercel/analytics/next v1.6.1)
- **State Management:** Client-side React state (no localStorage/sessionStorage usage detected)

### Performance
- **Total Network Requests:** 17
- **API Calls:** 1 (Vercel Analytics only)
- **Fonts:** 2 WOFF2 files
- **CSS Chunks:** 2 files
- **JS Chunks:** 7 files
- **Load Behavior:** Static rendering with client-side interactivity

### Data Architecture
- **Data Source:** Hardcoded/static data (no API calls for university data)
- **University Data:** Embedded in JavaScript bundles
- **Real-time Calculation:** Happens client-side based on slider inputs
- **No Backend:** Pure frontend application

### Radix UI Components Used
- **Select/Combobox** (for university selection and high school type)
- **Slider** (for grade inputs)
- **Data Attributes:**
  - `data-state` (for component states)
  - `data-placeholder` (for select placeholders)
  - `data-slot` (for slider parts)
  - `data-size` (for sizing)
  - `data-orientation` (horizontal/vertical)
  - `data-radix-collection-item` (for select items)

---

## User Flow

1. **Landing:** User sees 3 default universities (Seoul, Yonsei, Korea) already selected
2. **View Results:** Comparison table shows all 30 majors with "상향" (reach) status for default grades
3. **Adjust Universities:**
   - Click X on any university tag to remove it
   - Click "대학 추가" to add from 21 options
   - Maximum 5 universities can be compared
4. **Input Grades:**
   - Scroll to "내 성적 입력" section
   - Select high school type from dropdown (default: 일반고)
   - Adjust 내신 등급 (internal grade) slider (1-9)
   - Adjust 수능 등급 (CSAT grade) slider (1-9)
5. **See Updated Results:** Table updates in real-time to show:
   - 안전권 (green) - Safe admission chance
   - 적정권 (yellow) - On the cutoff
   - 상향 (red) - Reach/challenge
   - `-` - Department not available

---

## Data Insights

### Current Table State (Default: 일반고, 내신 2.0, 수능 3등급)

All visible cells show "상향" (reach/challenge), indicating that with the default grades (2.0 internal, Grade 3 CSAT), the student needs to improve to have a good chance at these top universities' departments.

### Department Availability Matrix

**Seoul National University has:**
- 17 departments available
- Missing: 교육과학대학, 국제학부, 문과대학, 미디어학부, 보건과학대학, 상경대학, 생명과학대학, 생명시스템대학, 신과대학, 심리학부, 이과대학, 정경대학, 정보대학, 치과대학

**Yonsei University has:**
- 16 departments available
- Missing: 농업생명과학대학, 미술대학, 사범대학, 수의과대학, 인문대학, 자연과학대학, 치의학대학원

**Korea University has:**
- 16 departments available
- Missing: 교육과학대학, 농업생명과학대학, 미술대학, 사회과학대학, 상경대학, 생명시스템대학, 생활과학대학, 수의과대학, 신과대학, 음악대학, 인문대학, 자연과학대학, 치과대학, 치의학대학원

---

## Navigation & Additional Pages

### Current Findings
- **No navigation menu** detected
- **No footer links** found
- **Single page application** - all functionality on homepage
- **No visible routes** to other pages
- **No authentication** required
- **No user accounts** or save functionality

### Potential Hidden Features
- URL parameters may allow deep linking to specific comparisons
- Browser back/forward may preserve state
- Print-friendly view (not tested)

---

## Accessibility Features

### Positive Aspects
- Proper ARIA attributes on sliders (`aria-valuemin`, `aria-valuemax`, `aria-valuenow`)
- Semantic HTML structure
- Keyboard navigation support (Escape to close dropdowns)
- Focus management on interactive elements
- Sufficient color contrast for text

### Areas for Improvement
- Some buttons lack aria-labels (3 buttons with empty labels detected)
- Table could benefit from screen reader announcements for dynamic updates
- No visible skip-to-content links

---

## Screenshots Captured

1. **01-main-page.png** - Initial landing page
2. **02-dropdown-1-open.png** - University selector opened
3. **02-dropdown-2-open.png** - High school type selector opened
4. **03-add-university-dropdown.png** - University add dropdown detail
5. **05-school-type-dropdown.png** - School type dropdown detail
6. **11-sliders-section.png** - Grade input sliders section
7. **13-university-dropdown-detailed.png** - Detailed view of university options
8. **14-final-exploration.png** - Final comprehensive state

All screenshots saved to: `/Users/babo/Projects/in-seoul/exploration-screenshots/`

---

## Recommendations for Similar Implementation

### Core Features to Replicate
1. **Multi-select university comparison** (max 5)
2. **Dual slider input** for grade types
3. **Dynamic table updates** based on user input
4. **Three-tier evaluation system** (안전권/적정권/상향)
5. **Responsive comparison table** with 30+ majors

### Technical Choices
- Use Next.js 15 App Router for modern React patterns
- Implement shadcn/ui for consistent, accessible components
- Use Radix UI Slider for grade inputs
- Use Radix UI Select for dropdowns
- Client-side calculation for instant feedback
- Static generation for fast initial load

### Data Structure Needed
```typescript
interface University {
  id: string;
  name: string;
  departments: Department[];
}

interface Department {
  id: string;
  name: string;
  admissionCutoffs: {
    highSchoolType: string;
    internalGrade: number;
    csatGrade: number;
    safetyRange: [number, number];
    targetRange: [number, number];
    reachRange: [number, number];
  }[];
}

interface UserInput {
  highSchoolType: string;
  internalGrade: number;
  csatGrade: number;
}
```

### UI Components Needed
- UniversitySelector (with remove functionality)
- ComparisonTable (dynamic columns)
- GradeSlider (Radix UI based)
- EvaluationBadge (three states)
- Legend (explaining evaluation levels)

---

## Conclusion

This is a well-designed, focused application that solves a specific problem: helping Korean high school students compare admission chances across multiple universities and departments based on their academic performance. The interface is clean, the interactions are intuitive, and the real-time feedback provides immediate value to users.

The technical implementation is modern and performant, leveraging Next.js 15, Tailwind CSS, and shadcn/ui to create a responsive, accessible experience. The decision to use client-side calculations keeps the interface snappy while eliminating the need for a backend API.

**Key Strengths:**
- Clear, focused purpose
- Intuitive UI/UX
- Comprehensive department coverage
- Real-time feedback
- No authentication barriers
- Fast performance

**Potential Enhancements:**
- Add university logos/images
- Save comparison configurations
- Export results as PDF
- Mobile-optimized view
- More granular grade inputs
- Historical admission data trends
- Additional filters (location, major category, etc.)
