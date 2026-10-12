import { useState, useEffect } from 'react'
import {
  studentApi,
  subjectApi,
  attendanceApi
} from './api'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  // ==================== STUDENTS ====================

  const [students, setStudents] = useState([])

  const [studentName, setStudentName] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')

  const [editingStudentId, setEditingStudentId] =
    useState(null)

  // ==================== SUBJECTS ====================

  const [subjects, setSubjects] = useState([])

  const [subjectCode, setSubjectCode] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [subjectDepartment, setSubjectDepartment] =
    useState('')
  const [subjectYear, setSubjectYear] = useState('')
  const [semester, setSemester] = useState('')

  const [reportDate, setReportDate] = useState(
  new Date().toISOString().split('T')[0]
)
const [attendanceDate, setAttendanceDate] = useState(
  new Date().toISOString().split('T')[0]
)
  // ==================== ATTENDANCE ====================

  const [attendanceRecords, setAttendanceRecords] =
    useState([])

  const [selectedSubject, setSelectedSubject] =
    useState('')

  // ==================== COMMON ====================

  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  // ==================== INITIAL LOAD ====================

  useEffect(() => {
    loadStudents()
    loadSubjects()
    loadAttendance()
  }, [])

  // ============================================================
  // LOAD STUDENTS
  // ============================================================

  async function loadStudents() {
    try {
      setLoading(true)

      const data = await studentApi.getAll()

      setStudents(
        data.map(student => ({
          ...student,
          roll: student.rollNumber,
        }))
      )
    } catch (error) {
      console.error(
        'Failed to load students:',
        error
      )

      setNotice(
        'Failed to load students from backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // LOAD SUBJECTS
  // ============================================================

  async function loadSubjects() {
    try {
      const data = await subjectApi.getAll()
      setSubjects(data)
    } catch (error) {
      console.error(
        'Failed to load subjects:',
        error
      )

      setNotice(
        'Failed to load subjects from backend.'
      )
    }
  }

  // ============================================================
  // LOAD ATTENDANCE
  // ============================================================

  async function loadAttendance() {
    try {
      const data = await attendanceApi.getAll()
      setAttendanceRecords(data)
    } catch (error) {
      console.error(
        'Failed to load attendance:',
        error
      )
    }
  }

  // ============================================================
  // TODAY
  // ============================================================

  const now = new Date()

const today =
  `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`

  
const currentStudentIds = new Set(
  students.map(student => Number(student.id))
)

const todayAttendance = attendanceRecords.filter(
  record =>
    record.attendanceDate === today &&
    currentStudentIds.has(Number(record.studentId))
)
// Keep only the latest record for each student
const latestAttendanceByStudent = new Map()

todayAttendance.forEach(record => {
  const existing = latestAttendanceByStudent.get(record.studentId)

  if (
    !existing ||
    record.id > existing.id
  ) {
    latestAttendanceByStudent.set(record.studentId, record)
  }
})

const uniqueTodayAttendance = Array.from(
  latestAttendanceByStudent.values()
)

const presentCount = uniqueTodayAttendance.filter(
  record => record.status === 'PRESENT'
).length

console.log('Present:', presentCount, 'Total:', students.length)

const absentCount = uniqueTodayAttendance.filter(
  record => record.status === 'ABSENT'
).length


const attendance = students.length > 0
  ? Math.min(
      100,
      Math.round(
        (presentCount / students.length) * 100
      )
    )
  : 0



  // ============================================================
  // ADD / UPDATE STUDENT
  // ============================================================

  async function addStudent(e) {
    e.preventDefault()

    if (
      !studentName.trim() ||
      !rollNo.trim() ||
      !email.trim() ||
      !department.trim() ||
      !year
    ) {
      setNotice(
        'Please fill all student details.'
      )
      return
    }

    try {
      const studentData = {
        rollNumber: rollNo.trim(),
        name: studentName.trim(),
        email: email.trim(),
        department: department.trim(),
        year: Number(year),
      }

      if (editingStudentId) {

        await studentApi.update(
          editingStudentId,
          studentData
        )

        setNotice(
          'Student updated successfully.'
        )

      } else {

        await studentApi.create(
          studentData
        )

        setNotice(
          'Student added successfully.'
        )
      }

      clearStudentForm()

      await loadStudents()

    } catch (error) {

      console.error(error)

      setNotice(
        editingStudentId
          ? 'Failed to update student.'
          : 'Failed to add student.'
      )
    }
  }

  // ============================================================
  // EDIT STUDENT
  // ============================================================

  function editStudent(student) {

    setEditingStudentId(
      student.id
    )

    setStudentName(
      student.name
    )

    setRollNo(
      student.rollNumber
    )

    setEmail(
      student.email
    )

    setDepartment(
      student.department
    )

    setYear(
      student.year
    )

    setActivePage('Students')

    setNotice(
      'Editing student details...'
    )
  }

  // ============================================================
  // CLEAR STUDENT FORM
  // ============================================================

  function clearStudentForm() {

    setStudentName('')
    setRollNo('')
    setEmail('')
    setDepartment('')
    setYear('')

    setEditingStudentId(null)
  }

  // ============================================================
  // DELETE STUDENT
  // ============================================================

  async function deleteStudent(id) {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this student?'
      )

    if (!confirmed) {
      return
    }

    try {

      await studentApi.delete(id)

      setNotice(
        'Student deleted successfully.'
      )

      await loadStudents()

    } catch (error) {

      console.error(error)

      setNotice(
        'Failed to delete student.'
      )
    }
  }

  // ============================================================
  // ADD SUBJECT
  // ============================================================

  async function addSubject(e) {

    e.preventDefault()

    if (
      !subjectCode.trim() ||
      !subjectName.trim() ||
      !subjectDepartment.trim() ||
      !subjectYear ||
      !semester
    ) {
      setNotice(
        'Please fill all subject details.'
      )

      return
    }

    try {

      const newSubject = {
        subjectCode:
          subjectCode.trim(),

        subjectName:
          subjectName.trim(),

        department:
          subjectDepartment.trim(),

        year:
          Number(subjectYear),

        semester:
          Number(semester),
      }

      await subjectApi.create(
        newSubject
      )

      setSubjectCode('')
      setSubjectName('')
      setSubjectDepartment('')
      setSubjectYear('')
      setSemester('')

      setNotice(
        'Subject added successfully.'
      )

      await loadSubjects()

    } catch (error) {

      console.error(error)

      setNotice(
        'Failed to add subject.'
      )
    }
  }

  // ============================================================
  // DELETE SUBJECT
  // ============================================================

  async function deleteSubject(id) {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this subject?'
      )

    if (!confirmed) {
      return
    }

    try {

      await subjectApi.delete(id)

      if (
        String(selectedSubject) ===
        String(id)
      ) {
        setSelectedSubject('')
      }

      setNotice(
        'Subject deleted successfully.'
      )

      await loadSubjects()

    } catch (error) {

      console.error(error)

      setNotice(
        'Failed to delete subject.'
      )
    }
  }

  // ============================================================
  // ATTENDANCE
  // ============================================================

  async function toggleAttendance(student) {

    if (!selectedSubject) {

      setNotice(
        'Please select a subject first.'
      )

      return
    }

    try {

      const existingRecord =
        attendanceRecords.find(
          record =>
            record.studentId ===
              student.id &&
            record.subjectId ===
              Number(selectedSubject) &&
            record.attendanceDate ===
  attendanceDate
        )

      const newStatus =
        existingRecord?.status ===
        'PRESENT'
          ? 'ABSENT'
          : 'PRESENT'

      const attendanceData = {

        studentId:
          student.id,

        subjectId:
          Number(selectedSubject),

        attendanceDate:
  attendanceDate,

        status:
          newStatus,
      }

      if (existingRecord) {

        await attendanceApi.update(
          existingRecord.id,
          attendanceData
        )

      } else {

        await attendanceApi.create(
          attendanceData
        )
      }

      setNotice(
        'Attendance updated successfully.'
      )

      await loadAttendance()
  
    } catch (error) {

      console.error(error)

      setNotice(
        'Failed to update attendance.'
      )
    }
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  const pages = [
    'Dashboard',
    'Students',
    'Subjects',
    'Attendance',
    'Reports',
  ]

  return (

    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            A
          </div>

          <div>

            <h2>
              AttendEase
            </h2>

            <span>
              Management System
            </span>

          </div>

        </div>

        <p className="menu-label">
          MAIN MENU
        </p>

        <nav>

          {pages.map(page => (

            <button
              key={page}
              className={`nav-item ${
                activePage === page
                  ? 'active'
                  : ''
              }`}
              onClick={() => {

                setActivePage(page)

                setNotice('')

              }}
            >

              <span className="nav-icon">

                {{
                  Dashboard: '▦',
                  Students: '♙',
                  Subjects: '▣',
                  Attendance: '✓',
                  Reports: '▤',
                }[page]}

              </span>

              {page}

              {activePage === page && (

                <span className="nav-arrow">
                  ›
                </span>

              )}

            </button>

          ))}

        </nav>

        <div className="sidebar-bottom">

          <div className="profile-avatar">
            AD
          </div>

          <div className="profile-text">

            <strong>
              Administrator
            </strong>

            <span>
              Admin account
            </span>

          </div>

          <span className="online-dot" />

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main">

        {/* TOP BAR */}

        <header className="topbar">

          <div>

            <p className="breadcrumb">
              Pages / {activePage}
            </p>

            <h2>
              {activePage}
            </h2>

          </div>

          <div className="topbar-right">

            <span className="status-dot" />

            <span className="server-status">
              Backend connected
            </span>

            <div className="top-avatar">
              AD
            </div>

          </div>

        </header>

        {/* CONTENT */}

        <div className="content">

          {/* NOTICE */}

          {notice && (

            <div className="notice">

              {notice}

              <button
                onClick={() =>
                  setNotice('')
                }
              >
                ×
              </button>

            </div>

          )}

          {/* ================================================= */}
          {/* DASHBOARD */}
          {/* ================================================= */}

          {activePage ===
            'Dashboard' && (

            <>

              <section className="welcome">

                <div>

                  <span className="eyebrow">
                    ATTENDANCE OVERVIEW
                  </span>

                  <h1>
                    Welcome back, Admin! 👋
                  </h1>

                  <p>
                    Here's what's happening
                    with your students today.
                  </p>

                </div>

                <div className="welcome-mark">
                  ✓
                </div>

              </section>


              <section className="stats">

                <article className="stat-card">

                  <div className="stat-top">

                    <span>
                      Total Students
                    </span>

                    <div className="stat-icon purple">
                      ♙
                    </div>

                  </div>

                  <h2>
                    {students.length}
                  </h2>

                  <p className="stat-foot">
                    Students in database
                  </p>

                </article>


                <article className="stat-card">

                  <div className="stat-top">

                    <span>
                      Present Today
                    </span>

                    <div className="stat-icon green">
                      ✓
                    </div>

                  </div>

                  <h2>
                    {presentCount}
                  </h2>

                  <p className="stat-foot">
                    Marked present
                  </p>

                </article>


                <article className="stat-card">

                  <div className="stat-top">

                    <span>
                      Absent Today
                    </span>

                    <div className="stat-icon orange">
                      −
                    </div>

                  </div>

                  <h2>
                    {absentCount}
                  </h2>

                  <p className="stat-foot">
                    Marked absent
                  </p>

                </article>


                <article className="stat-card">

                  <div className="stat-top">

                    <span>
                      Attendance Rate
                    </span>

                    <div className="stat-icon blue">
                      %
                    </div>

                  </div>

                  <h2>
                    {attendance}%
                  </h2>

                  <p className="stat-foot">
                    Today's attendance
                  </p>

                </article>

              </section>


              <section className="panel">
                <div style={{ marginBottom: '20px' }}>
  <label>
    Select Date:{' '}
    <input
      type="date"
      value={reportDate}
      onChange={(e) => setReportDate(e.target.value)}
    />
  </label>
</div>

                <div className="panel-heading">

                  <div>

                    <h3>
                      Recent Attendance
                    </h3>

                    <p>
                      Today's attendance records
                    </p>

                  </div>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      setActivePage(
                        'Attendance'
                      )
                    }
                  >
                    + Mark Attendance
                  </button>

                </div>

               
<AttendanceTable
  students={students}
  subjects={subjects}
  attendanceRecords={attendanceRecords}
  selectedDate={attendanceDate}
/>


              </section>

            </>

          )}

          {/* ================================================= */}
          {/* STUDENTS */}
          {/* ================================================= */}

          {activePage ===
            'Students' && (

            <>

              <section className="page-intro">

                <h1>
                  Student Management
                </h1>

                <p>
                  Add, edit, view and manage
                  students from the database.
                </p>

              </section>


              <form
                className="panel add-form"
                onSubmit={addStudent}
              >

                <h3>

                  {editingStudentId
                    ? 'Edit Student'
                    : 'Add New Student'}

                </h3>


                <div className="form-fields">

                  <label>

                    Student Name

                    <input
                      value={studentName}
                      onChange={e =>
                        setStudentName(
                          e.target.value
                        )
                      }
                      placeholder="Enter student name"
                      required
                    />

                  </label>


                  <label>

                    Roll Number

                    <input
                      value={rollNo}
                      onChange={e =>
                        setRollNo(
                          e.target.value
                        )
                      }
                      placeholder="e.g. 24EG104B04"
                      required
                    />

                  </label>


                  <label>

                    Email

                    <input
                      type="email"
                      value={email}
                      onChange={e =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder="student@gmail.com"
                      required
                    />

                  </label>


                  <label>

                    Department

                    <input
                      value={department}
                      onChange={e =>
                        setDepartment(
                          e.target.value
                        )
                      }
                      placeholder="ECE"
                      required
                    />

                  </label>


                  <label>

                    Year

                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={year}
                      onChange={e =>
                        setYear(
                          e.target.value
                        )
                      }
                      placeholder="3"
                      required
                    />

                  </label>


                  <div className="form-actions">

                    <button
                      className="primary-btn"
                      type="submit"
                    >

                      {editingStudentId
                        ? 'Update Student'
                        : 'Add Student'}

                    </button>


                    {editingStudentId && (

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => {

                          clearStudentForm()

                          setNotice(
                            'Edit cancelled.'
                          )

                        }}
                      >
                        Cancel
                      </button>

                    )}

                  </div>

                </div>

              </form>


              <section className="panel">

                <div className="panel-heading">

                  <div>

                    <h3>
                      All Students
                    </h3>

                    <p>
                      {students.length} students
                      in database
                    </p>

                  </div>

                  <button
                    className="secondary-btn"
                    onClick={loadStudents}
                  >
                    ↻ Refresh
                  </button>

                </div>


                {loading ? (

                  <div className="empty">
                    Loading students...
                  </div>

                ) : (

                  <StudentTable
                    students={students}
                    onEdit={editStudent}
                    onDelete={deleteStudent}
                  />

                )}

              </section>

            </>

          )}

          {/* ================================================= */}
          {/* SUBJECTS */}
          {/* ================================================= */}

          {activePage ===
            'Subjects' && (

            <>

              <section className="page-intro">

                <h1>
                  Subject Management
                </h1>

                <p>
                  Add, view and manage subjects
                  from the database.
                </p>

              </section>


              <form
                className="panel add-form"
                onSubmit={addSubject}
              >

                <h3>
                  Add New Subject
                </h3>

                <div className="form-fields">

                  <label>

                    Subject Code

                    <input
                      value={subjectCode}
                      onChange={e =>
                        setSubjectCode(
                          e.target.value
                        )
                      }
                      placeholder="e.g. VLSI101"
                      required
                    />

                  </label>


                  <label>

                    Subject Name

                    <input
                      value={subjectName}
                      onChange={e =>
                        setSubjectName(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Digital VLSI"
                      required
                    />

                  </label>


                  <label>

                    Department

                    <input
                      value={subjectDepartment}
                      onChange={e =>
                        setSubjectDepartment(
                          e.target.value
                        )
                      }
                      placeholder="ECE"
                      required
                    />

                  </label>


                  <label>

                    Year

                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={subjectYear}
                      onChange={e =>
                        setSubjectYear(
                          e.target.value
                        )
                      }
                      placeholder="3"
                      required
                    />

                  </label>


                  <label>

                    Semester

                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={semester}
                      onChange={e =>
                        setSemester(
                          e.target.value
                        )
                      }
                      placeholder="1"
                      required
                    />

                  </label>


                  <button
                    className="primary-btn"
                    type="submit"
                  >
                    Add Subject
                  </button>

                </div>

              </form>


              <section className="panel">

                <div className="panel-heading">

                  <div>

                    <h3>
                      All Subjects
                    </h3>

                    <p>
                      {subjects.length} subjects
                      in database
                    </p>

                  </div>

                  <button
                    className="secondary-btn"
                    onClick={loadSubjects}
                  >
                    ↻ Refresh
                  </button>

                </div>


                <SubjectTable
                  subjects={subjects}
                  onDelete={deleteSubject}
                />

              </section>

            </>

          )}

          {/* ================================================= */}
          {/* ATTENDANCE */}
          {/* ================================================= */}

          {activePage ===
            'Attendance' && (

            <>

              <section className="page-intro">

                <h1>
                  Mark Attendance
                </h1>

                <p>
                  Select a subject and mark
                  attendance for today.
                </p>

              </section>


              <section className="panel">

                <div className="attendance-controls">

                  <label>

                    Select Subject

                    <select
                      value={selectedSubject}
                      onChange={e =>
                        setSelectedSubject(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        -- Select Subject --
                      </option>

                      {subjects.map(
                        subject => (

                          <option
                            key={
                              subject.id
                            }
                            value={
                              subject.id
                            }
                          >
                            {
                              subject.subjectCode
                            }{' '}
                            -{' '}
                            {
                              subject.subjectName
                            }
                          </option>

                        )
                      )}

                    </select>
      
        <div className="form-group">
  <label>Attendance Date</label>

  <input
  id="attendanceDate"
  name="attendanceDate"
  type="date"
  value={attendanceDate}
  onChange={(e) =>
    setAttendanceDate(e.target.value)
  }
/>
</div>
                  </label>


                  <div className="attendance-date">

                    <strong>
                      Date
                    </strong>

                    <span>
                      {today}
                    </span>

                  </div>

                </div>

              </section>


              <section className="panel">

                <div className="panel-heading">

                  <div>

                    <h3>
                      Today's Attendance
                    </h3>

                    <p>

                      {selectedSubject
                        ? 'Click the action button to update attendance.'
                        : 'Please select a subject first.'}

                    </p>

                  </div>

                  <span className="rate-pill">
                    {attendance}% present
                  </span>

                </div>


               ```jsx
<AttendanceMarkTable
  students={students}
  attendanceRecords={attendanceRecords}
  attendanceDate={attendanceDate}
  selectedSubject={selectedSubject}
  onToggle={toggleAttendance}
/>
```
              </section>

            </>

          )}

          {/* ================================================= */}
          {/* REPORTS */}
          {/* ================================================= */}

          {activePage ===
            'Reports' && (

            <>

              <section className="page-intro">

                <h1>
                  Attendance Reports
                </h1>

                <p>
                  View today's attendance
                  summary.
                </p>

              </section>


              <section className="stats">

                <article className="stat-card">

                  <span>
                    Total Students
                  </span>

                  <h2>
                    {students.length}
                  </h2>

                </article>


                <article className="stat-card">

                  <span>
                    Present Today
                  </span>

                  <h2>
                    {presentCount}
                  </h2>

                </article>


                <article className="stat-card">

                  <span>
                    Absent Today
                  </span>

                  <h2>
                    {absentCount}
                  </h2>

                </article>


                <article className="stat-card">

                  <span>
                    Attendance
                  </span>

                  <h2>
                    {attendance}%
                  </h2>

                </article>

              </section>


              <section className="panel report-panel">

                <h3>
                  Today's Attendance
                  Distribution
                </h3>

                <div className="progress-track">

                  <div
                    className="progress-fill"
                    style={{
                      width:
                        `${attendance}%`
                    }}
                  />

                </div>

                <p>
                  {presentCount} present out of{' '}
                  {todayAttendance.length}{' '}
                  marked attendance records.
                </p>

              </section>

<section className="panel">
  <label htmlFor="reportDate">
    Select Attendance Date
  </label>

  <input
    id="reportDate"
    type="date"
    value={reportDate}
    onChange={(e) => setReportDate(e.target.value)}
  />
</section>


              <section className="panel">

                              <div className="panel-heading">

                  <div>
                    <h3>
                      Attendance Records
                    </h3>

                    <p>
                      Data retrieved from Spring Boot backend
                    </p>
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={async () => {
                      await loadAttendance()
                      setNotice('Attendance records refreshed.')
                    }}
                  >
                    ↻ Refresh
                  </button>

                </div>

                
<AttendanceTable
  students={students}
  subjects={subjects}
  attendanceRecords={attendanceRecords}
  selectedDate={reportDate}
/>


              </section>

            </>

          )}

        </div>

      </main>

    </div>
  )
}


// ============================================================
// STUDENT TABLE
// ============================================================

function StudentTable({
  students,
  onEdit,
  onDelete
}) {

  return (

    <div className="table-wrap">

      <table>

        <thead>

          <tr>

            <th>
              STUDENT
            </th>

            <th>
              ROLL NUMBER
            </th>

            <th>
              EMAIL
            </th>

            <th>
              DEPARTMENT
            </th>

            <th>
              YEAR
            </th>

            <th>
              ACTION
            </th>

          </tr>

        </thead>


        <tbody>

          {students.map(
            student => (

              <tr key={student.id}>

                <td>

                  <div className="student-cell">

                    <div className="student-avatar">

                      {student.name
                        ?.charAt(0)
                        .toUpperCase()}

                    </div>

                    <strong>
                      {student.name}
                    </strong>

                  </div>

                </td>


                <td>
                  {student.rollNumber}
                </td>


                <td>
                  {student.email}
                </td>


                <td>
                  {student.department}
                </td>


                <td>
                  {student.year}
                </td>


                <td>

                  <div className="table-actions">

                    <button
                      className="secondary-btn"
                      onClick={() =>
                        onEdit(student)
                      }
                    >
                      Edit
                    </button>


                    <button
                      className="secondary-btn"
                      onClick={() =>
                        onDelete(
                          student.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </td>

              </tr>

            )
          )}


          {students.length === 0 && (

            <tr>

              <td
                colSpan="6"
                className="empty"
              >
                No students found.
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

  )
}


// ============================================================
// SUBJECT TABLE
// ============================================================

function SubjectTable({
  subjects,
  onDelete
}) {

  return (

    <div className="table-wrap">

      <table>

        <thead>

          <tr>

            <th>
              CODE
            </th>

            <th>
              SUBJECT NAME
            </th>

            <th>
              DEPARTMENT
            </th>

            <th>
              YEAR
            </th>

            <th>
              SEMESTER
            </th>

            <th>
              ACTION
            </th>

          </tr>

        </thead>


        <tbody>

          {subjects.map(
            subject => (

              <tr key={subject.id}>

                <td>

                  <strong>
                    {subject.subjectCode}
                  </strong>

                </td>


                <td>
                  {subject.subjectName}
                </td>


                <td>
                  {subject.department}
                </td>


                <td>
                  {subject.year}
                </td>


                <td>
                  {subject.semester}
                </td>


                <td>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      onDelete(
                        subject.id
                      )
                    }
                  >
                    Delete
                  </button>

                </td>

              </tr>

            )
          )}


          {subjects.length === 0 && (

            <tr>

              <td
                colSpan="6"
                className="empty"
              >
                No subjects found.
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

  )
}


// ============================================================
// ATTENDANCE MARK TABLE
// ============================================================

function AttendanceMarkTable({
  students,
  attendanceRecords,
  attendanceDate,
  selectedSubject,
  onToggle
}) {

  return (

    <div className="table-wrap">

      <table>

        <thead>

          <tr>

            <th>
              STUDENT
            </th>

            <th>
              ROLL NUMBER
            </th>

            <th>
              STATUS
            </th>

            <th>
              ACTION
            </th>

          </tr>

        </thead>


        <tbody>

          {students.map(
            student => {

              const record =
                attendanceRecords.find(
                  item =>
                    item.studentId ===
                      student.id &&
                    item.subjectId ===
                      Number(
                        selectedSubject
                      ) &&
                    item.attendanceDate === attendanceDate
                )
                

              const isPresent =
                record?.status ===
                'PRESENT'

              return (

                <tr
                  key={student.id}
                >

                  <td>

                    <div className="student-cell">

                      <div className="student-avatar">

                        {student.name
                          ?.charAt(0)
                          .toUpperCase()}

                      </div>

                      <strong>
                        {student.name}
                      </strong>

                    </div>

                  </td>


                  <td>
                    {student.rollNumber}
                  </td>


                  <td>

                    <span
                      className={`badge ${
                        isPresent
                          ? 'present'
                          : 'absent'
                      }`}
                    >

                      <span />

                      {isPresent
                        ? 'Present'
                        : 'Absent'}

                    </span>

                  </td>


                  <td>

                    <button
                      className="secondary-btn"
                      disabled={
                        !selectedSubject
                      }
                      onClick={() =>
                        onToggle(
                          student
                        )
                      }
                    >

                      Mark{' '}

                      {isPresent
                        ? 'Absent'
                        : 'Present'}

                    </button>

                  </td>

                </tr>

              )
            }
          )}


          {students.length === 0 && (

            <tr>

              <td
                colSpan="4"
                className="empty"
              >
                No students available.
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

  )
}


// ============================================================
// ATTENDANCE DISPLAY TABLE
// ============================================================


function AttendanceTable({
  students,
  subjects,
  attendanceRecords,
  selectedDate
}) {
  

const currentStudentIds = new Set(
  students.map(student => Number(student.id))
)

const todayRecords = attendanceRecords.filter(
  record =>
    record.attendanceDate === selectedDate &&
    currentStudentIds.has(Number(record.studentId))
)

// Keep only the latest attendance record for each student
const latestRecordByStudent = new Map()

todayRecords.forEach(record => {
  const studentId = Number(record.studentId)
  const existing = latestRecordByStudent.get(studentId)

  if (
    !existing ||
    Number(record.id) > Number(existing.id)
  ) {
    latestRecordByStudent.set(studentId, record)
  }
})

const uniqueTodayRecords = Array.from(
  latestRecordByStudent.values()
)



  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>STUDENT</th>
            <th>ROLL NUMBER</th>
            <th>SUBJECT</th>
            <th>DATE</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {uniqueTodayRecords.map(record => {
            const student = students.find(
              item => item.id === record.studentId
            )

            const subject = subjects.find(
              item => item.id === record.subjectId
            )

            return (
              <tr key={record.id}>
                <td>
                  <div className="student-cell">
                    <div className="student-avatar">
                      {student?.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    <strong>
                      {student?.name || `Student ID ${record.studentId}`}
                    </strong>
                  </div>
                </td>

                <td>{student?.rollNumber || '-'}</td>

                <td>
                  {subject?.subjectname || `Subject ID ${record.subjectId}`}
                </td>

                <td>{record.attendanceDate}</td>

                <td>
                  <span
                    className={`badge ${
                      record.status === 'PRESENT'
                        ? 'present'
                        : 'absent'
                    }`}
                  >
                    <span />
                    {record.status === 'PRESENT' ? 'Present' : 'Absent'}
                  </span>
                </td>
              </tr>
            )
          })}

          {uniqueTodayRecords.length === 0 && (
            <tr>
              <td colSpan="5" className="empty">
                No attendance marked for today.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}


export default App