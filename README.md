# Student Task and Assignment Management System Using MongoDB

A beginner-friendly DBMS Semester 5 LCA-3 project. The app uses HTML, CSS, and browser JavaScript on the frontend, Node.js and Express on the backend, and MongoDB through Mongoose.

## Requirements

- Node.js and npm
- MongoDB Community Server running locally, or a MongoDB Atlas cluster

## Install and run

1. Open a terminal in the project folder.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env`.
4. For local MongoDB, keep `MONGODB_URI=mongodb://127.0.0.1:27017/student_assignment_manager`. Make sure MongoDB is running. For Atlas, replace it with your cluster connection string and database name.
5. Start the app with `npm run dev` (auto-restarts when files change) or `npm start`.
6. Visit `http://localhost:3000` in your browser.

Mongoose creates the `student_assignment_manager` database and the `assignments` collection when the first assignment is saved. Do not commit your `.env` file.

## Test the CRUD operations

1. **Create:** Fill in subject, title, description, deadline, priority, and status; select **Add assignment**.
2. **Read:** The saved assignment appears in the list. Change the status filter to **Pending** or **Completed** to test filtered reads.
3. **Update:** Select **Edit** on an assignment, change one or more fields, and select **Save changes**. Use **Mark complete** / **Mark pending** to update status directly.
4. **Delete:** Select **Delete** and confirm. The assignment disappears from the list.

## API routes

| Method | Route | Operation |
| --- | --- | --- |
| GET | `/api/assignments` | List assignments; optional `?status=Pending` or `?status=Completed` filter |
| GET | `/api/assignments/:id` | Read one assignment |
| POST | `/api/assignments` | Create an assignment |
| PUT | `/api/assignments/:id` | Update an assignment |
| PATCH | `/api/assignments/:id/status` | Set status to `Pending` or `Completed` |
| DELETE | `/api/assignments/:id` | Delete an assignment |
