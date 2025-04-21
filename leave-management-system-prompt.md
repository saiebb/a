# Leave Management System Development Prompt

## Project Overview
Create a comprehensive leave management system with three user roles: Employee, Manager, and Admin. The system will allow employees to view and request leaves, managers to approve/reject requests and view team leaves, and admins to manage all users and system settings.

## Instructions for AI
Always respond in Arabic. Use this document as a reference guide throughout the development process. After completing each phase, update the todo list to mark completed tasks and show the remaining ones.

## System Architecture and Requirements

### User Roles and Permissions
1. **Employee** (Default role)
   - View personal leave data
   - Submit leave requests
   - View request status
   - Manage personal profile

2. **Manager**
   - All employee permissions
   - Approve/reject leave requests from team members
   - View team members' leave data
   - Manager's personal leave requests are auto-approved

3. **Admin**
   - Manage all users (create, update, delete)
   - Assign user roles and permissions
   - Manage departments
   - Configure leave types
   - View system-wide reports
   - Configure system settings

### Leave Types
- Annual leave
- Sick leave
- Emergency leave
- Unpaid leave
- Other configurable types

### Leave Request Status
- Pending
- Approved
- Rejected
- Canceled

## Development Phases and Todo List

### Phase 1: Project Setup and Authentication
- [ ] Initialize project with appropriate tech stack
- [ ] Create database schema
- [ ] Set up authentication system
- [ ] Implement user registration (default to Employee role)
- [ ] Implement login functionality
- [ ] Create password reset functionality
- [ ] Set up role-based authorization system

### Phase 2: Employee Dashboard Development
- [ ] Create employee dashboard homepage
- [ ] Implement leave balance display
- [ ] Create leave request form
- [ ] Develop leave history view
- [ ] Implement request status tracking
- [ ] Create profile management page
- [ ] Set up notifications for request status changes

### Phase 3: Manager Dashboard Development
- [ ] Create manager dashboard homepage
- [ ] Implement team leave overview
- [ ] Create pending requests approval interface
- [ ] Develop team leave calendar view
- [ ] Implement team leave reports
- [ ] Set up notifications for new leave requests

### Phase 4: Admin Dashboard Development
- [ ] Create admin dashboard homepage with system statistics
- [ ] Implement user management (CRUD operations)
- [ ] Create department management interface
- [ ] Develop role and permission management
- [ ] Implement leave type configuration
- [ ] Create system-wide reporting tools
- [ ] Develop system settings configuration

### Phase 5: Advanced Features and Refinement
- [ ] Implement email notifications
- [ ] Create data export functionality
- [ ] Implement dashboard analytics
- [ ] Create leave calendar integration
- [ ] Add bulk actions for admins
- [ ] Implement audit logging
- [ ] Create mobile responsive design

### Phase 6: Testing and Deployment
- [ ] Perform unit testing
- [ ] Conduct integration testing
- [ ] Complete user acceptance testing
- [ ] Security testing and fixes
- [ ] Performance optimization
- [ ] Documentation completion
- [ ] Deployment to production environment

## Technical Reference Guidelines

### Database Design
1. **Users Table**
   - user_id (PK)
   - username
   - email
   - password (hashed)
   - first_name
   - last_name
   - role_id (FK)
   - department_id (FK)
   - manager_id (FK, self-referential)
   - created_at
   - updated_at

2. **Roles Table**
   - role_id (PK)
   - role_name (employee, manager, admin)
   - description

3. **Departments Table**
   - department_id (PK)
   - department_name
   - description

4. **Leave_Types Table**
   - leave_type_id (PK)
   - type_name
   - description
   - default_days_per_year
   - is_active

5. **Leave_Balances Table**
   - balance_id (PK)
   - user_id (FK)
   - leave_type_id (FK)
   - year
   - total_days
   - used_days
   - remaining_days

6. **Leave_Requests Table**
   - request_id (PK)
   - user_id (FK)
   - leave_type_id (FK)
   - start_date
   - end_date
   - total_days
   - reason
   - status (pending, approved, rejected, canceled)
   - approved_by (FK to users)
   - created_at
   - updated_at
   - comments

### API Endpoints Structure
1. **Authentication**
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - POST /api/auth/reset-password

2. **User Management**
   - GET /api/users
   - GET /api/users/:id
   - POST /api/users
   - PUT /api/users/:id
   - DELETE /api/users/:id

3. **Leave Management**
   - GET /api/leaves
   - GET /api/leaves/:id
   - POST /api/leaves
   - PUT /api/leaves/:id
   - DELETE /api/leaves/:id
   - PUT /api/leaves/:id/approve
   - PUT /api/leaves/:id/reject

4. **Department Management**
   - GET /api/departments
   - POST /api/departments
   - PUT /api/departments/:id
   - DELETE /api/departments/:id

5. **Leave Types**
   - GET /api/leave-types
   - POST /api/leave-types
   - PUT /api/leave-types/:id
   - DELETE /api/leave-types/:id

6. **Dashboard Data**
   - GET /api/dashboard/employee
   - GET /api/dashboard/manager
   - GET /api/dashboard/admin

### Frontend Route Structure
1. **Auth Pages**
   - /login
   - /register
   - /forgot-password
   - /reset-password

2. **Employee Routes**
   - /dashboard
   - /leaves
   - /leaves/new
   - /leaves/:id
   - /profile

3. **Manager Routes**
   - /manager/dashboard
   - /manager/team
   - /manager/leaves/pending
   - /manager/team/:id/leaves

4. **Admin Routes**
   - /admin/dashboard
   - /admin/users
   - /admin/departments
   - /admin/leave-types
   - /admin/reports
   - /admin/settings

### Key Implementation Recommendations
1. Use JWT for authentication
2. Implement proper form validation
3. Use granular permission checks beyond role-based access
4. Cache frequently accessed data
5. Implement optimistic UI updates
6. Design mobile-first interfaces
7. Use proper error handling throughout
8. Create comprehensive logs
9. Implement proper date handling for leave calculations
10. Set up automated tests for critical paths

## Additional Features to Consider
1. Holiday calendar integration
2. Document attachments for sick leaves
3. Leave approval workflows with multiple levels
4. Delegation of approval authority
5. Half-day leave options
6. Compensation leave tracking
7. Leave accrual rules
8. Year-end leave balance handling
9. Integration with HR systems
10. Multi-language support

Remember to continuously update the todo list as you progress through the development phases. For each completed task, mark it with [x] instead of [ ] and add the next most important tasks to focus on.
