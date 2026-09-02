# Frontend Codebase Technical Breakdown

## 1. Architecture Overview

### Framework & Stack
- **Framework**: React 19.0.0 with React Router DOM 7.5.0
- **Build Tool**: Vite 6.3.1
- **Styling**: Tailwind CSS 4.1.4
- **HTTP Client**: Axios 1.8.4
- **UI Libraries**: lucide-react (icons), react-feather, react-icons, framer-motion (animations)
- **Module Type**: ES modules

### Folder Structure
```
src/
├── main.jsx                           # Entry point
├── App.jsx                            # Router configuration
├── index.css                          # Global styles
├── api/
│   └── axiosClient.js                # Axios instance & session management
├── Components/                        # Page-level & layout components
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Login.jsx                      # Role selection page
│   ├── AdminWorkspace.jsx
│   ├── ProtectedRoute.jsx             # Route guard
│   ├── Enroll.jsx
│   ├── New.jsx                        # Events/news page
│   └── NotFound.jsx
├── pages/                             # Authenticated user pages
│   ├── AdminLogin.jsx
│   ├── TeacherLogin.jsx
│   ├── StudentLogin.jsx
│   ├── ParentLogin.jsx
│   ├── ParentSignup.jsx
│   ├── TeacherDashboard.jsx
│   ├── TeacherTimetable.jsx
│   ├── TeacherAttendance.jsx
│   ├── StudentProfile.jsx
│   ├── StudentTimetable.jsx
│   ├── ParentDashboard.jsx
│   └── AdminAuditLogs.jsx
└── components/
    └── dashboard/                     # Reusable dashboard components
        ├── DashboardLayout.jsx
        ├── Panel.jsx
        ├── Badge.jsx
        ├── TabGroup.jsx
        ├── EmptyState.jsx
        ├── ConfirmModal.jsx
        └── Toast.jsx
```

### Routing Architecture
- **Public Routes**: `/`, `/about`, `/login`, `/enroll`, `/new`, all login pages
- **Protected Routes**: `/admin`, `/teacher`, `/student`, `/parent`, timetable, attendance pages
- **Protection**: `ProtectedRoute` component validates token + role match
- **Conditional Layout**: Navbar/Footer hidden on dashboard pages

### Data Flow
1. **User Action** (form submit, button click, mount)
2. **API Call** → `api.post/get/patch/delete()` via axiosClient
3. **Token Injection** → Request interceptor adds Bearer token
4. **State Update** → Component setState or form update
5. **UI Render** → Component re-renders with new data

---

## 2. Component Inventory

### Top-Level / Router-Mounted Components

#### **Public Pages**

| Component | Purpose | Key Props | State | Renders |
|-----------|---------|-----------|-------|---------|
| **Home** | Landing page | None | None (static) | Hero, service cards, pathways, CTAs |
| **About** | School story & values | None | None (static) | Story sections, vision, approvals, testimonials |
| **Login** | Role selection portal | None | None (static) | 4 role cards (Student, Teacher, Admin, Parent) |
| **Enroll** | Enrollment application | None | formData, message, loading | Form inputs (name, email, DOB, phone, class, dept) |
| **New** | Events/news/graduation highlights | None | None (static) | Ceremony sections with images, animations |
| **NotFound** | 404 page | None | None (static) | Error message, home link |

#### **Login Pages (Role-Specific)**

| Component | Purpose | Key API Calls | Validations | State |
|-----------|---------|---------------|-------------|-------|
| **AdminLogin** | Admin authentication | `POST /auth/login` | Email, password required; role check (ADMIN) | formData, status, loading |
| **TeacherLogin** | Teacher authentication | `POST /auth/login` | Email, password required; role check (TEACHER) | formData, status, loading |
| **StudentLogin** | Student auth + activation | `POST /auth/login` or `POST /auth/activate-student` | Email, password/passkey; role check (STUDENT) | loginData, activateData, mode, status, showSuccess, loading |
| **ParentLogin** | Parent authentication | `POST /auth/login` | Email, password required; role check (PARENT) | formData, status, loading |
| **ParentSignup** | Parent account creation | `POST /auth/parent/signup` | All fields required (fullName, email, studentCode, password) | formData, status, loading |

#### **Protected Dashboard Pages**

| Component | Purpose | Key API Calls | State Managed | Roles |
|-----------|---------|---------------|---------------|-------|
| **StudentProfile** | Student course dashboard | `GET /student/dashboard`, `POST /student/submit-assignment` | courses, performanceRecords, submissionForms, activeSubmissions, activeTab, expandedCourseId, courseSection, expandedWorkspace, activeModalSubmission | STUDENT |
| **TeacherDashboard** | Teacher course management | `GET /teacher/courses`, `GET /teacher/submissions/{courseId}`, `POST /teacher/assignments/{courseId}`, `PATCH /teacher/assignments/{id}`, `POST /teacher/drop-material/{courseId}` | courses, selectedId, view, form, structuredSubmissions, submissionSummary, theoryScore, etc. | TEACHER |
| **TeacherTimetable** | Teacher schedule view | `GET /teacher/timetable` | timetable, loading | TEACHER |
| **TeacherAttendance** | Attendance marking | `GET /attendance/current-session`, `POST /attendance/record` | currentSession, statuses, loading, saving | TEACHER |
| **StudentTimetable** | Student schedule view | `GET /student/timetable` | timetable, status, loading | STUDENT |
| **ParentDashboard** | Parent portal | `GET /parent/children/results`, `GET /parent/announcements`, `GET /parent/timetable/{studentId}` | childrenResults, selectedChildId, announcements, activeTab, childTimetable, status, isLoading | PARENT |
| **AdminWorkspace** | Admin control center | `GET /admin/*` (multiple), `POST /admin/*` (multiple), `DELETE /admin/*` | data (students, teachers, classes, subjects, slots), form, fields, section, loading, periodForm | ADMIN |
| **AdminAuditLogs** | Audit log viewer | `GET /admin/audit-logs` | logs, filters (roleFilter, userIdFilter, actionFilter), status, loading | ADMIN |

#### **Reusable Dashboard Components (Presentational)**

| Component | Purpose | Props | Renders |
|-----------|---------|-------|---------|
| **DashboardLayout** | Dashboard shell/template | role, title, subtitle, userName, stats, actions, children, notifications, workspaceNav, onLogout | Header, theme toggle, notifications, stats grid, navigation, content area, sign-out button |
| **Panel** | Content section container | title, description, badge, actions, children, className | Bordered card with optional header/actions |
| **Badge** | Status indicator | children, variant (default/success/danger/info/warning/cyan) | Colored pill/label |
| **TabGroup** | Tab navigation | tabs (array of {id, label, count}), activeTab, onChange | Horizontal tab buttons |
| **EmptyState** | Placeholder | icon (React component), title, description | Centered message with icon |
| **Toast** | Toast notification | message, type (success/error) | Fixed bottom-right notification |
| **ConfirmModal** | Confirmation dialog | title, message, open, onConfirm, onCancel, loading, danger | Modal with confirm/cancel buttons |

#### **Layout Components**

| Component | Purpose | Key Features | State |
|-----------|---------|--------------|-------|
| **Navbar** | Top navigation bar | Mobile hamburger, scroll-based hide/show, role-agnostic links | open (mobile menu), showNavbar (scroll detection), lastScrollY |
| **Footer** | Footer | Links, contact info, social links, contact modal trigger | showModal |
| **ProtectedRoute** | Route guard wrapper | Validates token + role permission | isInvalid, token, currentRole |
| **LayoutWrapper** | Conditional layout | Hides navbar/footer on dashboard routes | location (router) |

---

## 3. State Management

### Authentication State (localStorage)
**Key**: `lmsAuth` (JSON stringified)
**Structure**:
```javascript
{
  token: "Bearer <JWT>",
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT",
  name: string,
  email: string
}
```
**Managed by**: `api/axiosClient.js` → `getAuthSession()`, `setAuthSession()`, `clearAuthSession()`

### Local Component State (useState)

#### StudentProfile
- `courses`: Array of course objects
- `performanceRecords`: Array of graded submissions
- `submissionForms`: Object mapping form keys to text values
- `activeTab`: "registered" | "insights"
- `expandedCourseId`: Current expanded course ID
- `courseSection`: "materials" | "assignments"
- `activeSubmissions`: Array of submitted assignments
- `expandedWorkspace`: Object with {courseId, assignmentTitle, textContent} for full-screen editor
- `activeModalSubmission`: Object with submission details for confirmation

#### TeacherDashboard
- `courses`: Array of courses taught
- `selectedId`: Currently selected course ID
- `view`: "materials" | "assignments" | "submissions"
- `tab`: "objective" | "theory" (assignment question type)
- `form`: Current assignment being edited/created
- `structuredSubmissions`: Array of student submissions
- `submissionSummary`: Array of courses with pending submission counts
- `submissionFilter`, `assignmentFilter`: Filter states
- `theoryScore`: Currently being graded theory answer score

#### ParentDashboard
- `childrenResults`: Array of linked children with performance data
- `selectedChildId`: Currently viewing child ID
- `announcements`: Array of school announcements
- `activeTab`: "children" | "announcements"
- `childTimetable`: Current child's timetable slots

#### AdminWorkspace
- `data`: Object containing {students, teachers, classes, subjects, slots, academicPeriod, courses}
- `section`: "overview" | "people" | "academic" | "timetable"
- `form`: "teacher" | "student" | "class" | "subject" | "assignment" | "register" | null
- `fields`: Object of form field values
- `search`: Student search query
- `periodForm`: {academicSession, term}

#### DashboardLayout
- `academicPeriod`: Current academic period from server
- `notificationsOpen`: Boolean
- `darkMode`: Boolean (persisted to localStorage)

### No Redux/Context
- **Decision**: Component-level state using `useState` hooks
- **Reason**: App scope is limited to authenticated sections; props drilling is manageable
- **Limitation**: State doesn't persist across page navigation (loss of unsaved forms on route change)

---

## 4. Agent/API Integration Points

### Base Configuration
**File**: `src/api/axiosClient.js`

```javascript
const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalHost 
    ? "http://localhost:5000/api" 
    : "https://school-project-i40q.onrender.com/api");
```

**Request Interceptor**: Injects Authorization header with token from localStorage

### Authentication Endpoints

| Endpoint | Method | Component | Trigger | Request Shape | Response | Error Handling |
|----------|--------|-----------|---------|---------------|----------|-----------------|
| `/auth/login` | POST | AdminLogin, TeacherLogin, StudentLogin, ParentLogin | Form submit | {email, password} | {token, role, name, email} | Toast + status state |
| `/auth/activate-student` | POST | StudentLogin | "Activate" tab submit | {email, passkey, password} | {message} | Toast + status state |
| `/auth/parent/signup` | POST | ParentSignup | Form submit | {fullName, email, studentCode, password} | {message} | Status state |
| `/auth/me` | GET | ProtectedRoute | On mount (verification) | None | {user: {role, ...}} | Route to /login |

### Student Endpoints

| Endpoint | Method | Component | Trigger | Request Shape | Response | Notes |
|----------|--------|-----------|---------|---------------|----------|-------|
| `/student/dashboard` | GET | StudentProfile | On mount | None | {courses, performanceRecords, activeSubmissions} | Loads all course + grade data |
| `/student/submit-assignment` | POST | StudentProfile | Form submit (Assignment) | {courseId, assignmentTitle, submissionData} OR {courseId, assignmentId, objectiveAnswers, theoryAnswers} | {message} | Supports both text + structured formats |
| `/student/timetable` | GET | StudentTimetable | On mount | None | {timetable: [{subject, className, room, day, period, startTime, endTime, teacherName}]} | Displays weekly schedule |

### Teacher Endpoints

| Endpoint | Method | Component | Trigger | Request Shape | Response | Notes |
|----------|--------|-----------|---------|---------------|----------|-------|
| `/teacher/courses` | GET | TeacherDashboard | On mount | None | {courses: [{_id, title, materials, assignments, structuredAssignments}]} | Loads all courses |
| `/teacher/submissions/{courseId}` | GET | TeacherDashboard | On select course | None | {structuredSubmissions: [{_id, status, objectiveScore, totalScore, createdAt}]} | For grading view |
| `/teacher/assignments/{courseId}` | POST | TeacherDashboard | Publish assignment | {title, dueDate, objectiveQuestions, theoryQuestions} | {message} | Creates structured assignment |
| `/teacher/assignments/{assignmentId}` | PATCH | TeacherDashboard | Save edits | {title, dueDate, objectiveQuestions, theoryQuestions} | {message} | Updates existing assignment |
| `/teacher/drop-material/{courseId}` | POST | TeacherDashboard | Add material | {title, url} | {message} | Adds study material link |
| `/teacher/timetable` | GET | TeacherTimetable | On mount | None | {timetable: [{_id, subjectAssignment, class, day, period, startTime, endTime}]} | Teacher's schedule |

### Attendance Endpoints

| Endpoint | Method | Component | Trigger | Request Shape | Response | Notes |
|----------|--------|-----------|---------|---------------|----------|-------|
| `/attendance/current-session` | GET | TeacherAttendance | On mount | None | {active: boolean, session: {slot, course, students}} | Time-gated access |
| `/attendance/record` | POST | TeacherAttendance | Submit form | {classId, courseId, period, academicSession, term, records: [{studentId, status}]} | {message} | Records attendance for session |

### Parent Endpoints

| Endpoint | Method | Component | Trigger | Request Shape | Response | Notes |
|----------|--------|-----------|---------|---------------|----------|-------|
| `/parent/children/results` | GET | ParentDashboard | On mount | None | {children: [{studentId, studentName, studentClass, academicSession, latestGrade, summary, performance, submissions, attendance}]} | All linked children data |
| `/parent/announcements` | GET | ParentDashboard | On mount | None | {announcements: [{_id, title, publishedAt, type, message}]} | School announcements |
| `/parent/timetable/{studentId}` | GET | ParentDashboard | Load timetable button | None | {timetable: [{_id, subjectAssignment, day, period, startTime, endTime, class}]} | Child's schedule |

### Admin Endpoints

| Endpoint | Method | Component | Trigger | Request Shape | Response | Notes |
|----------|--------|-----------|---------|---------------|----------|-------|
| `/admin/account-students` | GET | AdminWorkspace | On mount | None | {accountStudents: [{_id, fullName, email, studentCode, isActivated, studentClass}]} | All students |
| `/admin/teachers` | GET | AdminWorkspace | On mount | None | {teachers: [{_id, fullName, email}]} | All teachers |
| `/admin/classes` | GET/POST | AdminWorkspace | Mount / Create class | {level, section, academicSession} | {classes: [...]} | Class list + create |
| `/admin/subjects` | GET/POST | AdminWorkspace | Mount / Create subject | {name, code} | {subjects: [...]} | Subject list + create |
| `/admin/timetable` | GET/POST | AdminWorkspace | Mount / Generate | None / {} | {slots: [...]} | Get/generate timetable |
| `/admin/create-teacher` | POST | AdminWorkspace | Create teacher | {fullName, email, password} | {message} | Teacher account creation |
| `/admin/create-student` | POST | AdminWorkspace | Create student | {fullName, email, password, classRef (optional)} | {message} | Student account creation |
| `/admin/courses/{courseId}/register-student/{studentId}` | POST | AdminWorkspace | Register student | {} | {message} | Enroll student in course |
| `/admin/students/{studentId}/regenerate-code` | POST | AdminWorkspace | Regenerate parent code | {} | {studentCode} | Generate new parent link code |
| `/admin/audit-logs` | GET | AdminAuditLogs | On mount + filter | Query: {role, userID, action} | {logs: [{_id, action, role, actorId, timestamp, method, endpoint, details}]} | Audit trail with filters |
| `/settings/academic-period` | GET/PUT | DashboardLayout + AdminWorkspace | Mount / Save | {academicSession, term} | {period: {...}} | Current academic term |
| `/admin/courses` | GET | AdminWorkspace | On mount | None | {courses: [{_id, title, targetClass}]} | List of courses for registration |

### Enrollment (Public) Endpoint

| Endpoint | Method | Component | Trigger | Request Shape | Response | Error Codes |
|----------|--------|-----------|---------|---------------|----------|-------------|
| `/enroll` | POST | Enroll | Form submit | {fullName, email, dob, phone, class, department} | {success: true, message} | 409 = duplicate email |

---

## 5. Validation

### Form-by-Form Validation

#### Login Forms (AdminLogin, TeacherLogin, ParentLogin)
- **Email**: Required, HTML5 email validation
- **Password**: Required, min 1 char
- **Validation Type**: Client-side HTML5 + server response check
- **Role Validation**: Server returns role, component checks role.toUpperCase() matches expected role
- **Error Display**: Status state message (error styling)

#### StudentLogin
- **Login Mode**:
  - Email: Required, HTML5 email validation
  - Password: Required
- **Activation Mode**:
  - Email: Required, HTML5 email validation
  - Passkey: Required
  - Password: Required
- **Validation Type**: Client-side HTML5 + server response
- **Error Display**: Status state + success state after activation

#### ParentSignup
- **Fields**: fullName, email, studentCode, password
- **Validation**: All required (checked via form loop)
- **Type**: Client-side required check + server validation
- **Error**: Single status message display

#### Enroll (Public Form)
- **Fields**: fullName, email, dob, phone, class, department
- **Validation**: All required (checked via loop)
- **Email Uniqueness**: Server returns 409 Conflict if duplicate
- **Validation Type**: Client-side required + server-side duplicate check
- **Error Display**: Message state with error/success styling

#### TeacherDashboard - Assignment Creation
- **Title**: Required
- **Due Date**: Optional (stored as ISO string)
- **Objective Questions**: Each has:
  - questionText: Required
  - options: Array of 4 (all required)
  - correctOptionIndex: 0-3 (validated by radio buttons)
  - marks: Required (number > 0)
- **Theory Questions**: Each has:
  - questionText: Required
  - marks: Required (number > 0)
- **Validation Type**: Client-side form state (manual validation before submission)
- **Error Display**: Toast notification on error response

#### StudentProfile - Assignment Submission

##### Text Assignment
- **Text Content**: Required (`.trim()` must not be empty)
- **Word Count**: Tracked (no hard limit shown)
- **Validation**: Checked via `!currentText.trim()` on submit
- **Error Display**: Early return (no error message, just blocks submission)

##### Structured Assignment - Objective
- **Each Radio Button**: Exactly one answer per question required
- **Validation**: Form blocks submission if any objective question unanswered
- **Error Display**: Toast message: "Please select an answer for every objective question"

##### Structured Assignment - Theory
- **Text Area**: max 5000 characters (HTML maxLength)
- **Validation**: No required check (optional answers allowed)
- **Validation Type**: Limit enforced at textarea level

#### TeacherAttendance
- **Student Status**: Dropdown select (PRESENT/ABSENT/LATE)
- **Default**: PRESENT
- **Validation**: Form maps current state to records, no validation error
- **Validation Type**: Guaranteed valid (select only allows 3 values)

#### AdminWorkspace Forms

##### Create Teacher/Student
- **fullName**: Required, text input
- **email**: Required, HTML5 email
- **password**: Required, text input (hidden)
- **classRef** (student only): Optional select
- **Validation Type**: Client-side HTML5 required
- **Error Display**: Toast on server error

##### Create Class
- **level**: Required (e.g., JS1)
- **section**: Required (e.g., A)
- **academicSession**: Required (e.g., 2026/2027)
- **Validation Type**: Client-side HTML5 required
- **Error Display**: Toast on server error

##### Create Subject
- **name**: Required
- **code**: Required
- **Validation Type**: Client-side HTML5 required
- **Error Display**: Toast on server error

##### Assign Subject to Class
- **subject**: Required select
- **class**: Required select
- **teacher**: Required select
- **periodsPerWeek**: Required number (1-40), defaults to 1
- **Validation Type**: Client-side HTML5 required
- **Error Display**: Toast on server error

##### Register Student to Course
- **courseId**: Required select
- **studentId**: Required select
- **Validation Type**: Client-side HTML5 required
- **Error Display**: Toast on server error

##### Academic Period (AdminWorkspace)
- **academicSession**: Required (text)
- **term**: Required select (FIRST_TERM / SECOND_TERM / THIRD_TERM)
- **Validation Type**: Client-side HTML5 required
- **Error Display**: Toast on error

#### ParentDashboard - None
- No input forms; read-only dashboard

#### StudentTimetable - None
- Read-only display

#### TeacherTimetable - None
- Read-only display

#### AdminAuditLogs - Filters Only
- **roleFilter**: Optional select (all roles)
- **userIdFilter**: Optional text input
- **actionFilter**: Optional text input (substring match)
- **Validation Type**: None (all optional)

### Validation Summary
- **No third-party validators** (Zod, Yup, react-hook-form)
- **HTML5 validation** for email, required fields
- **Custom JS checks** for text content, word count, radio/select requirements
- **Server-side validation** assumed for all POST/PATCH endpoints
- **Error messages**: Mostly via Toast or status state
- **Client vs Server**: Client-side is basic; server is authoritative

---

## 6. Summary Table: Component → API Calls → Validation

| Component | API Calls Made | Request Method | Validations Performed | Error Handling |
|-----------|----------------|-----------------|----------------------|-----------------|
| **Home** | None (static) | — | — | — |
| **About** | None (static) | — | — | — |
| **Login** | None (navigation only) | — | — | — |
| **AdminLogin** | `/auth/login` | POST | email (HTML5), password (required), role === ADMIN | Toast error message |
| **TeacherLogin** | `/auth/login` | POST | email (HTML5), password (required), role === TEACHER | Toast error message |
| **StudentLogin** | `/auth/login`, `/auth/activate-student` | POST | email (HTML5), password (required), role === STUDENT; passkey (required) for activation | Toast error message, success state |
| **ParentLogin** | `/auth/login` | POST | email (HTML5), password (required), role === PARENT | Toast error message |
| **ParentSignup** | `/auth/parent/signup` | POST | fullName, email (HTML5), studentCode, password (all required) | Status message (error/success) |
| **Enroll** | `/enroll` | POST | fullName, email (HTML5), dob, phone, class, department (all required) | Status message; 409 duplicate email |
| **New** | None (static) | — | — | — |
| **NotFound** | None (static) | — | — | — |
| **ProtectedRoute** | `/auth/me` | GET | token exists, role matches allowedRoles | Route to /login |
| **StudentProfile** | `/student/dashboard`, `/student/submit-assignment` | GET, POST | Text: no trim = error toast; Structured: all objectives required error toast | Toast (success/error), navigate on logout |
| **TeacherDashboard** | `/teacher/courses`, `/teacher/submissions/{id}`, `/teacher/assignments/{id}`, `/teacher/drop-material/{id}` | GET, POST, PATCH | Title required, questions required, objective options all 4 required | Toast (success/error) |
| **TeacherTimetable** | `/teacher/timetable` | GET | None | No error display (silent fail) |
| **TeacherAttendance** | `/attendance/current-session`, `/attendance/record` | GET, POST | Status select only allows 3 values (enforced) | Toast (success/error) |
| **StudentTimetable** | `/student/timetable` | GET | None | Toast (success/error) |
| **ParentDashboard** | `/parent/children/results`, `/parent/announcements`, `/parent/timetable/{id}` | GET | None | Toast (success/error) |
| **AdminWorkspace** | `/admin/*` (8+ endpoints), `/settings/academic-period` | GET, POST, PATCH, DELETE | All form fields per modal type (required checks), academic period required | Toast (success/error) + confirm modal for delete |
| **AdminAuditLogs** | `/admin/audit-logs` | GET | All filter fields optional (substring/select matching) | Toast (success/error) |

---

## Key Findings & Notes

### Ambiguities / Gaps
1. **StudentProfile Large Form Expansion**: The "expanded workspace" feature (Maximize2 button) opens a full-screen editor for assignments, but the implementation details are not shown—appears to be modal-based with `setExpandedWorkspace()` state.

2. **Assignment Submission Types**: StudentProfile supports both:
   - Free-text submissions (simple text area)
   - Structured assignments (objective + theory questions)
   
   The component routes between them, but the exact backend decision logic (which assignment type is used) is not visible in frontend code.

3. **Audit Log Details**: The `details` object structure in audit logs is not defined; appears to be flexible key-value pairs logged by backend.

4. **Timetable Generation**: AdminWorkspace has a "Generate schedule" button calling `/admin/timetable/generate`, but the algorithm/conflict detection is backend-only.

5. **Performance Data Filtering**: ParentDashboard shows `performance` array from child object, but the backend shape is inferred rather than documented in frontend.

6. **Dark Mode**: DashboardLayout has dark mode toggle stored in localStorage, but CSS classes for dark mode styling are referenced but not fully defined in provided files.

### Missing Pieces
- No `.env` file configuration shown (relies on `import.meta.env.VITE_API_BASE_URL`)
- No custom hooks (all logic in components)
- No state persistence beyond localStorage (lmsAuth + dashboardTheme)
- No offline support or service workers
- No form validation library (pure HTML5 + JS)
- No testing code shown

### Strengths
- Clear separation of authentication routes vs. authenticated dashboards
- Consistent API client setup with interceptors
- Role-based protected routes
- Toast-based error feedback on all data mutations
- Reusable dashboard layout components
- Tailwind CSS for consistent styling

---

## End of Frontend Technical Breakdown
