# API Endpoints

## Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

## Complaints
- `GET /api/complaints` - List all complaints
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint
- `PUT /api/complaints/:id/status` - Update complaint status

## Tax Management
- `GET /api/tax/bills` - Get user's tax bills
- `GET /api/tax/bills/:id` - Get bill details
- `POST /api/tax/payments` - Make payment
- `GET /api/tax/payments` - View payment history

## Waste Management
- `GET /api/waste/schedule` - Get collection schedule
- `POST /api/waste/request-collection` - Request collection
- `GET /api/waste/bins` - View nearby bins
- `POST /api/waste/report-dump` - Report illegal dumping

## Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/analytics` - View analytics
