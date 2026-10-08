# Task 3 Documentation: Backend Architecture & Database Design

## 1. Architectural Overview

The backend is built as a RESTful service using **Node.js, Express, and MongoDB (via Mongoose ODM)**. It provides high-performance querying, statistical aggregation pipelines, and clean entity separation.

```
┌─────────────────────────────────────────────────────────────┐
│                      Express Backend                        │
│                   (http://localhost:5000)                   │
├───────────────┬───────────────┬──────────────┬──────────────┤
│  Student API  │  Faculty API  │  Admin API   │  Curriculum  │
│  /api/students│  /api/faculty │ /api/admin   │  /api/curr   │
└───────┬───────┴───────┬───────┴──────┬───────┴──────┬───────┘
        │               │              │              │
        ▼               ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│               Mongoose Object Data Modeling (ODM)           │
│       [Student]       [Faculty]       [Marks]  [Curriculum] │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                       │
│                   `student_dropout_erp`                     │
│  - 7,200 Students    - 222 Faculty     - 271k Marks Records │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Key Data Modeling Decisions

### Why Separate `Marks` from the `Student` Document?
A common anti-pattern in MongoDB is embedding all 8 semesters of subject marks (up to 60 courses per student) inside an array in the `Student` document. We deliberately modeled `Marks` as its own separate collection for three technical reasons:

1. **Query Velocity & Indexing**: In an institutional dashboard, administrators and department heads frequently ask queries like:
   - *"Which students have an active backlog in Operating Systems?"*
   - *"What is the failure distribution in Discrete Mathematics across sections?"*
   In an embedded schema, this requires heavy array unwinding or table scans. With a normalized `Marks` collection, it is a single index lookup on `{ subject_name: 1, result: 1 }`.
2. **Document Bloat Prevention**: Embedding 60 subject marks records, each with CIA 1, CIA 2, assignments, and external scores, bloats the student document, slowing down lightweight dashboard queries (like listing 50 students on a page).
3. **Rollup Hygiene**: The `Student` document retains precomputed rollups (`overall_gpa`, `backlogs_count`, `arrears_cleared`) for instant UI display, which are derived from `Marks` at seed time.

---

## 3. Native MongoDB Aggregation Pipeline (`GET /api/admin/summary`)

Per requirements, administrative metrics are not calculated by fetching all 7,200 records into Node.js memory. Instead, we execute an optimized **MongoDB `$facet` aggregation pipeline**:

```javascript
[
  { $match: { college_id: "C101" } }, // Optional filter
  {
    $facet: {
      overall: [
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            avgGpa: { $avg: "$overall_gpa" },
            avgAttendance: { $avg: "$attendance_pct" },
            lowAttendanceCount: {
              $sum: { $cond: [{ $eq: ["$low_attendance_flag", 1] }, 1, 0] }
            },
            totalBacklogs: { $sum: "$backlogs_count" }
          }
        }
      ],
      byDepartment: [
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
            avgGpa: { $avg: "$overall_gpa" },
            highRiskCount: {
              $sum: { $cond: [{ $eq: ["$dropout_risk_label", "High"] }, 1, 0] }
            }
          }
        }
      ],
      byRiskLabel: [
        { $group: { _id: "$dropout_risk_label", count: { $sum: 1 } } }
      ]
    }
  }
]
```

### Advantages for Presentation / Viva:
- Demonstrates advanced MongoDB query optimization (`$facet` enables multi-dimensional analytical reporting in a single database round-trip).
- Reduces server CPU and network transfer to sub-millisecond payloads.
