# SIT Test Scenarios - PLN SAP Knowledge Management System

## Test Environment Setup
- **Frontend URL**: http://localhost:3000/cms (Production) / http://localhost:5173/cms (Development)
- **Backend API**: https://nonprod-changecopilot.indonesiacentral.cloudapp.azure.com/cms-be
- **Test Data**: Pre-populated users, documents, and quiz data
- **Browser Support**: Chrome 120+, Firefox 115+, Safari 16+, Edge 120+

---

## 1. AUTHENTICATION & AUTHORIZATION MODULE

### TC_AUTH_001: User Login - Valid Credentials
**Objective**: Verify successful login with valid credentials
**Pre-conditions**: 
- Application is accessible
- Test users exist in database

**Test Steps**:
1. Navigate to `/cms/login`
2. Enter valid email: `admin@example.com`
3. Enter valid password: `admin123`
4. Click "Sign in" button
5. Verify redirection to dashboard

**Expected Results**:
- User successfully logged in
- Redirected to `/cms/dashboard`
- User profile displayed in header
- Navigation menu shows appropriate role-based options

**Pass Criteria**: ✅ All expected results achieved
**Fail Criteria**: ❌ Any step fails or unexpected behavior occurs

---

### TC_AUTH_002: User Login - Invalid Credentials
**Objective**: Verify proper error handling for invalid credentials
**Pre-conditions**: Application is accessible

**Test Steps**:
1. Navigate to `/cms/login`
2. Enter invalid email: `invalid@example.com`
3. Enter invalid password: `wrongpass`
4. Click "Sign in" button

**Expected Results**:
- Error message displayed: "Failed to sign in. Please check your credentials."
- User remains on login page
- No redirection occurs
- Form fields remain populated

**Pass Criteria**: ✅ Proper error handling and user feedback
**Fail Criteria**: ❌ No error message or unexpected behavior

---

### TC_AUTH_003: Role-Based Access Control - Admin
**Objective**: Verify admin user has access to all features
**Pre-conditions**: Logged in as admin user

**Test Steps**:
1. Login as admin user
2. Check navigation menu visibility
3. Access Users page
4. Attempt to create/edit users
5. Access all document operations

**Expected Results**:
- All navigation items visible (Dashboard, Documents, Archive, Analytics, Users)
- Can access Users management page
- Can create, edit, and manage users
- Can upload, archive, restore, delete documents

**Pass Criteria**: ✅ Full access to all features
**Fail Criteria**: ❌ Any feature restriction or access denied

---

### TC_AUTH_004: Role-Based Access Control - Viewer
**Objective**: Verify viewer user has limited access
**Pre-conditions**: Logged in as viewer user

**Test Steps**:
1. Login as viewer user
2. Check navigation menu visibility
3. Attempt to access Users page
4. Try document upload
5. Try document modification operations

**Expected Results**:
- Users menu item not visible
- Cannot access `/cms/users` (redirected to dashboard)
- Upload button not visible on Documents page
- Document modification options (archive, delete) not available

**Pass Criteria**: ✅ Proper access restrictions enforced
**Fail Criteria**: ❌ Unauthorized access granted

---

### TC_AUTH_005: Session Management - Logout
**Objective**: Verify proper logout functionality
**Pre-conditions**: User is logged in

**Test Steps**:
1. Click logout button in header
2. Verify redirection to login page
3. Attempt to access protected route directly
4. Check browser storage cleanup

**Expected Results**:
- User logged out successfully
- Redirected to `/cms/login`
- Direct access to protected routes redirects to login
- Auth token removed from localStorage

**Pass Criteria**: ✅ Complete session cleanup and protection
**Fail Criteria**: ❌ Session persists or unauthorized access possible

---

## 2. DOCUMENT MANAGEMENT MODULE

### TC_DOC_001: Document Upload - Valid File
**Objective**: Verify successful document upload
**Pre-conditions**: 
- Logged in as admin/editor
- Valid test files available (PDF, DOCX, PPTX)

**Test Steps**:
1. Navigate to Documents page
2. Click "Upload Document" button
3. Select valid PDF file (< 50MB)
4. Choose category "SAP_CMCT"
5. Select users to share with
6. Click "Upload" button

**Expected Results**:
- Upload modal opens successfully
- File validation passes
- Upload progress indicator shown
- Success message displayed
- Document appears in documents list
- Activity logged in recent activities

**Pass Criteria**: ✅ Document uploaded and visible in system
**Fail Criteria**: ❌ Upload fails or document not accessible

---

### TC_DOC_002: Document Upload - Invalid File Type
**Objective**: Verify file type validation
**Pre-conditions**: Logged in as admin/editor

**Test Steps**:
1. Navigate to Documents page
2. Click "Upload Document" button
3. Attempt to select invalid file type (.txt, .jpg, .exe)
4. Observe validation behavior

**Expected Results**:
- File type validation triggered
- Error message: "Invalid file type. Please upload a PDF, DOCX, or PPTX file."
- File not accepted for upload
- Upload button remains disabled

**Pass Criteria**: ✅ Proper file type validation
**Fail Criteria**: ❌ Invalid files accepted or no validation

---

### TC_DOC_003: Document View/Preview
**Objective**: Verify document preview functionality
**Pre-conditions**: 
- Documents exist in system
- User has view permissions

**Test Steps**:
1. Navigate to Documents page
2. Click on document card dropdown
3. Select "View" option
4. Verify preview modal opens
5. Test download functionality from preview

**Expected Results**:
- Preview modal opens successfully
- Document content displayed (for supported formats)
- Download button functional
- Modal can be closed properly
- View activity logged

**Pass Criteria**: ✅ Document preview works correctly
**Fail Criteria**: ❌ Preview fails or content not displayed

---

### TC_DOC_004: Document Download
**Objective**: Verify document download functionality
**Pre-conditions**: Documents exist and user has access

**Test Steps**:
1. Navigate to Documents page
2. Click document dropdown menu
3. Select "Download" option
4. Verify download initiation
5. Check downloaded file integrity

**Expected Results**:
- Download starts immediately
- File downloaded to default download location
- Downloaded file opens correctly
- Download activity logged
- File size and format preserved

**Pass Criteria**: ✅ Document downloads successfully and is accessible
**Fail Criteria**: ❌ Download fails or file corrupted

---

### TC_DOC_005: Document Archive/Restore
**Objective**: Verify archive and restore functionality
**Pre-conditions**: 
- Logged in as admin/editor
- Active documents exist

**Test Steps**:
1. Navigate to Documents page
2. Select document to archive
3. Click "Move to Archive" from dropdown
4. Verify document moved to Archive page
5. Navigate to Archive page
6. Select archived document
7. Click "Restore" option
8. Verify document restored to Documents page

**Expected Results**:
- Document successfully archived
- Removed from Documents page
- Appears in Archive page
- Restore functionality works
- Document returns to Documents page
- Activities logged for both operations

**Pass Criteria**: ✅ Archive and restore cycle completes successfully
**Fail Criteria**: ❌ Any step in the cycle fails

---

### TC_DOC_006: Document Sharing
**Objective**: Verify document sharing functionality
**Pre-conditions**: 
- Logged in as admin/editor
- Multiple users exist in system

**Test Steps**:
1. Navigate to Documents page
2. Select document to share
3. Click "Share" from dropdown
4. Select users to share with
5. Click "Share" button
6. Login as shared user
7. Verify document access

**Expected Results**:
- Share modal opens with user list
- Users can be selected/deselected
- Share operation completes successfully
- Shared users can access document
- Document shows shared count indicator

**Pass Criteria**: ✅ Document sharing works correctly
**Fail Criteria**: ❌ Sharing fails or access not granted

---

### TC_DOC_007: Document Search and Filter
**Objective**: Verify search and filtering functionality
**Pre-conditions**: Multiple documents with different categories exist

**Test Steps**:
1. Navigate to Documents page
2. Enter search term in search box
3. Apply category filter
4. Apply file type filter
5. Change sort order
6. Verify results update accordingly

**Expected Results**:
- Search results filter documents by name
- Category filter shows only selected category
- File type filter works correctly
- Sort options change document order
- Filters can be combined
- Clear filters resets to all documents

**Pass Criteria**: ✅ All search and filter options work correctly
**Fail Criteria**: ❌ Any filter fails or produces incorrect results

---

## 3. USER MANAGEMENT MODULE

### TC_USER_001: Create New User
**Objective**: Verify user creation functionality
**Pre-conditions**: Logged in as admin

**Test Steps**:
1. Navigate to Users page
2. Click "Add User" button
3. Fill in user details:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Role: "Editor"
   - Status: "Active"
4. Click "Add User" button

**Expected Results**:
- User creation modal opens
- Form validation works correctly
- User created successfully
- Success message displayed
- New user appears in users table
- User can login with default credentials

**Pass Criteria**: ✅ User created and functional
**Fail Criteria**: ❌ Creation fails or user cannot login

---

### TC_USER_002: Edit Existing User
**Objective**: Verify user editing functionality
**Pre-conditions**: 
- Logged in as admin
- Test user exists

**Test Steps**:
1. Navigate to Users page
2. Click "Edit" on existing user
3. Modify user details (name, role, status)
4. Click "Update User" button
5. Verify changes reflected in system

**Expected Results**:
- Edit modal opens with current data
- Changes can be made to all fields except email
- Update operation succeeds
- Changes reflected in users table
- User permissions updated if role changed

**Pass Criteria**: ✅ User updated successfully with correct permissions
**Fail Criteria**: ❌ Update fails or permissions not updated

---

### TC_USER_003: User Search and Pagination
**Objective**: Verify user management table functionality
**Pre-conditions**: 
- Logged in as admin
- Multiple users exist (>10 for pagination)

**Test Steps**:
1. Navigate to Users page
2. Use search functionality to find specific user
3. Test pagination controls
4. Verify user count and page information

**Expected Results**:
- Search filters users by name/email/role
- Pagination shows correct page numbers
- Page navigation works correctly
- User count displays accurately
- Results per page consistent

**Pass Criteria**: ✅ All table functionality works correctly
**Fail Criteria**: ❌ Search or pagination fails

---

## 4. ANALYTICS MODULE

### TC_ANALYTICS_001: Chat Insights Tab
**Objective**: Verify chat analytics functionality
**Pre-conditions**: Chat history data exists

**Test Steps**:
1. Navigate to Analytics page
2. Verify "Chat Insights" tab is active by default
3. Check all KPI cards display data
4. Verify bar chart shows daily questions
5. Check pie chart shows topic distribution
6. Verify word cloud displays popular topics
7. Check top questions list
8. Verify unanswered questions section

**Expected Results**:
- All KPI cards show numerical data
- Charts render correctly with data
- Word cloud displays topics with varying sizes
- Top questions list populated
- Unanswered questions show confidence scores
- All components responsive and interactive

**Pass Criteria**: ✅ All chat analytics components display correctly
**Fail Criteria**: ❌ Any component fails to load or shows no data

---

### TC_ANALYTICS_002: Quiz Insights Tab
**Objective**: Verify quiz analytics functionality
**Pre-conditions**: Quiz data exists in JSON files

**Test Steps**:
1. Navigate to Analytics page
2. Click "Quiz Insights" tab
3. Verify KPI cards (avg score, accuracy, total quizzes)
4. Check leaderboard table functionality
5. Verify line chart shows score trends
6. Check bar chart shows accuracy by category
7. Verify error questions table

**Expected Results**:
- Tab switches correctly
- KPI cards show calculated averages
- Leaderboard displays users with rankings
- Line chart shows multi-user trends
- Bar chart shows category accuracy
- Error questions table shows difficult questions
- All data calculations accurate

**Pass Criteria**: ✅ All quiz analytics components work correctly
**Fail Criteria**: ❌ Any component fails or shows incorrect calculations

---

### TC_ANALYTICS_003: Analytics Data Refresh
**Objective**: Verify analytics data updates correctly
**Pre-conditions**: Analytics page loaded

**Test Steps**:
1. Note current analytics data
2. Perform actions that should update analytics:
   - Upload new document
   - Complete quiz (if applicable)
   - View documents
3. Refresh analytics page
4. Verify data updates

**Expected Results**:
- Analytics data reflects recent activities
- Counters increment correctly
- Charts update with new data points
- No stale data displayed

**Pass Criteria**: ✅ Analytics data stays current
**Fail Criteria**: ❌ Data not updated or incorrect

---

## 5. SYSTEM INTEGRATION TESTS

### TC_INT_001: Frontend-Backend API Integration
**Objective**: Verify all API endpoints work correctly
**Pre-conditions**: Backend service running

**Test Steps**:
1. Monitor network requests during user actions
2. Verify API responses for:
   - Authentication endpoints
   - Document CRUD operations
   - User management
   - Analytics data retrieval
3. Check error handling for API failures

**Expected Results**:
- All API calls return expected status codes
- Response data structure matches frontend expectations
- Error responses handled gracefully
- Loading states displayed during API calls
- Timeout handling works correctly

**Pass Criteria**: ✅ All API integrations work seamlessly
**Fail Criteria**: ❌ Any API call fails or returns unexpected data

---

### TC_INT_002: Database Integration
**Objective**: Verify data persistence and retrieval
**Pre-conditions**: Database accessible

**Test Steps**:
1. Create test data through frontend
2. Verify data persisted in database
3. Refresh application
4. Verify data retrieved correctly
5. Test data relationships (users, documents, activities)

**Expected Results**:
- Data persists correctly across sessions
- Relationships maintained properly
- Data integrity preserved
- No data loss during operations

**Pass Criteria**: ✅ Data persistence and retrieval work correctly
**Fail Criteria**: ❌ Data loss or corruption occurs

---

### TC_INT_003: File Storage Integration
**Objective**: Verify file upload and storage system
**Pre-conditions**: File storage service available

**Test Steps**:
1. Upload various file types and sizes
2. Verify files stored correctly
3. Test file retrieval and download
4. Verify file metadata preservation
5. Test file deletion from storage

**Expected Results**:
- Files uploaded to correct storage location
- File integrity maintained
- Metadata (size, type, name) preserved
- Download URLs work correctly
- Deleted files removed from storage

**Pass Criteria**: ✅ File storage operations work correctly
**Fail Criteria**: ❌ File corruption or storage failures

---

## 6. CROSS-BROWSER COMPATIBILITY

### TC_BROWSER_001: Chrome Compatibility
**Objective**: Verify full functionality in Chrome
**Test Steps**: Execute all major test scenarios in Chrome 120+
**Pass Criteria**: ✅ All features work without issues
**Fail Criteria**: ❌ Any feature fails or displays incorrectly

### TC_BROWSER_002: Firefox Compatibility
**Objective**: Verify full functionality in Firefox
**Test Steps**: Execute all major test scenarios in Firefox 115+
**Pass Criteria**: ✅ All features work without issues
**Fail Criteria**: ❌ Any feature fails or displays incorrectly

### TC_BROWSER_003: Safari Compatibility
**Objective**: Verify full functionality in Safari
**Test Steps**: Execute all major test scenarios in Safari 16+
**Pass Criteria**: ✅ All features work without issues
**Fail Criteria**: ❌ Any feature fails or displays incorrectly

---

## 7. RESPONSIVE DESIGN TESTS

### TC_RESPONSIVE_001: Mobile View (320px-768px)
**Objective**: Verify mobile responsiveness
**Test Steps**:
1. Resize browser to mobile dimensions
2. Test navigation (hamburger menu)
3. Verify form usability
4. Check table responsiveness
5. Test modal behavior

**Pass Criteria**: ✅ All elements display and function correctly
**Fail Criteria**: ❌ Layout breaks or functionality lost

### TC_RESPONSIVE_002: Tablet View (768px-1024px)
**Objective**: Verify tablet responsiveness
**Test Steps**: Similar to mobile but for tablet dimensions
**Pass Criteria**: ✅ Optimal layout and functionality
**Fail Criteria**: ❌ Poor layout or usability issues

### TC_RESPONSIVE_003: Desktop View (1024px+)
**Objective**: Verify desktop responsiveness
**Test Steps**: Test on various desktop resolutions
**Pass Criteria**: ✅ Full functionality and optimal layout
**Fail Criteria**: ❌ Layout issues or wasted space

---

## 8. PERFORMANCE TESTS

### TC_PERF_001: Page Load Performance
**Objective**: Verify acceptable page load times
**Test Steps**:
1. Measure initial page load time
2. Test navigation between pages
3. Monitor resource loading
4. Check for memory leaks

**Pass Criteria**: ✅ Pages load within 3 seconds on standard connection
**Fail Criteria**: ❌ Load times exceed 5 seconds

### TC_PERF_002: Large File Upload Performance
**Objective**: Verify system handles large files
**Test Steps**:
1. Upload files of various sizes (up to 50MB)
2. Monitor upload progress
3. Verify system responsiveness during upload
4. Test concurrent uploads

**Pass Criteria**: ✅ Large files upload successfully without system degradation
**Fail Criteria**: ❌ System becomes unresponsive or uploads fail

---

## 9. SECURITY TESTS

### TC_SEC_001: Authentication Security
**Objective**: Verify authentication security measures
**Test Steps**:
1. Test password requirements
2. Verify session timeout
3. Test unauthorized access attempts
4. Check token security

**Pass Criteria**: ✅ All security measures work correctly
**Fail Criteria**: ❌ Security vulnerabilities found

### TC_SEC_002: File Upload Security
**Objective**: Verify file upload security
**Test Steps**:
1. Attempt to upload malicious files
2. Test file size limits
3. Verify file type restrictions
4. Check for script injection

**Pass Criteria**: ✅ All malicious uploads blocked
**Fail Criteria**: ❌ Security bypass possible

---

## TEST EXECUTION SUMMARY

### Test Environment Requirements:
- ✅ Frontend application deployed and accessible
- ✅ Backend API services running
- ✅ Database populated with test data
- ✅ File storage system configured
- ✅ Test user accounts created

### Test Data Requirements:
- ✅ Admin, Editor, and Viewer test accounts
- ✅ Sample documents (PDF, DOCX, PPTX)
- ✅ Quiz data (scores and details JSON files)
- ✅ Chat history data for analytics

### Success Criteria:
- **Critical Tests**: 100% pass rate required
- **High Priority Tests**: 95% pass rate minimum
- **Medium Priority Tests**: 90% pass rate minimum
- **Low Priority Tests**: 85% pass rate acceptable

### Test Execution Schedule:
1. **Phase 1**: Authentication & Authorization (Day 1-2)
2. **Phase 2**: Document Management (Day 3-5)
3. **Phase 3**: User Management (Day 6)
4. **Phase 4**: Analytics Module (Day 7-8)
5. **Phase 5**: Integration Tests (Day 9-10)
6. **Phase 6**: Cross-browser & Performance (Day 11-12)
7. **Phase 7**: Security Tests (Day 13)
8. **Phase 8**: Bug fixes and retesting (Day 14-15)

### Defect Classification:
- **Critical**: System crash, data loss, security breach
- **High**: Major feature not working, incorrect data
- **Medium**: Minor feature issues, UI problems
- **Low**: Cosmetic issues, minor usability problems

---

*This SIT test plan covers comprehensive testing of the PLN SAP Knowledge Management System. Execute tests systematically and document all results for proper quality assurance.*