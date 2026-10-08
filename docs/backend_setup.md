# Backend Setup & Database Guide

This document explains how to set up, configure, seed, and run the Express and MongoDB backend service for the Student Dropout Prediction & Intervention System.

---

## 1. Prerequisites

- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+ (tested on npm 11)
- **MongoDB**: Either a local MongoDB Community server (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster.

> [!NOTE]
> The backend features an automatic fallback data provider. If MongoDB is offline or not configured yet, the backend automatically serves requests in fallback mode directly from the generated CSV/JSON datasets, allowing seamless testing and frontend demonstration at any time.

---

## 2. Installation

1. Open your terminal and navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

Dependencies included:
- `express`: Fast, minimalist web framework for Node.js.
- `mongoose`: Elegant MongoDB object modeling for schemas and aggregation pipelines.
- `cors`: Cross-Origin Resource Sharing middleware enabling React frontend communication.
- `dotenv`: Loads environment variables from `.env`.
- `csv-parser`: Fast streaming parser for tabular datasets.

---

## 3. Environment Configuration

Create or inspect `/backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_dropout_erp
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### For MongoDB Atlas (Cloud)
If using MongoDB Atlas instead of local MongoDB, replace `MONGO_URI` with your connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/student_dropout_erp?retryWrites=true&w=majority
```

---

## 4. Seeding the Database

To ingest the ~7,200 students, 222 faculty mentors, 271k marks records, and the 14-branch curriculum into MongoDB:

```bash
npm run seed
```

This executes `scripts/seedDb.js`:
- Clears existing collections.
- Inserts `curriculum.json` into `curriculums`.
- Streams and inserts `faculty.csv` into `faculties`.
- Parses JSON arrays and batch-inserts `students.csv` into `students`.
- Ingests `marks.csv` in optimized chunks of 15,000 records.

---

## 5. Running the Backend

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Once started, the backend is active at:
```
http://localhost:5000
```

---

## 6. Verifying API Endpoints

You can verify the backend using curl, Postman, or your browser:

1. **System Health**:
   ```bash
   curl http://localhost:5000/api/health
   ```
2. **Admin Aggregate Analytics**:
   ```bash
   curl http://localhost:5000/api/admin/summary
   ```
3. **Filtered Student List**:
   ```bash
   curl "http://localhost:5000/api/students?department=CSE&risk=High&limit=10"
   ```
4. **Single Student Record**:
   ```bash
   curl http://localhost:5000/api/students/STU_EEC_CSE_Y2_0001
   ```
5. **Subject Marks for Student**:
   ```bash
   curl "http://localhost:5000/api/students/STU_EEC_CSE_Y2_0001/marks?semester=2"
   ```
6. **Mentor's Mentees**:
   ```bash
   curl http://localhost:5000/api/faculty/FAC_EEC_CSE_001/students
   ```
