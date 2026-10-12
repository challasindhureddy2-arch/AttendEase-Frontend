
import { useState } from "react";

const API = "http://localhost:8080/api";

export default function Reports() {
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateReport(e) {
    e.preventDefault();
    setError("");
    setReport(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/attendance/report/${studentId}/${subjectId}`
      );

      if (!response.ok) {
        throw new Error("Could not generate report. Check the IDs and backend.");
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>Attendance Reports</h1>
      <p>Generate a report for a student and subject.</p>

      <form onSubmit={generateReport}>
        <label>Student ID: </label>
        <input
          type="number"
          min="1"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />

        <br /><br />

        <label>Subject ID: </label>
        <input
          type="number"
          min="1"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {report && (
        <div style={{ marginTop: "24px" }}>
          <h2>Attendance Summary</h2>
          <p>Student ID: {report.studentId}</p>
          <p>Subject ID: {report.subjectId}</p>
          <p>Total Classes: {report.totalClasses}</p>
          <p>Present Classes: {report.presentClasses}</p>
          <p>Absent Classes: {report.absentClasses}</p>
          <h3>
            Attendance Percentage: {report.attendancePercentage}%
          </h3>
        </div>
      )}
    </div>
  );
}
