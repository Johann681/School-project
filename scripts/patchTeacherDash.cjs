const fs = require('fs');

const path = 'src/pages/TeacherDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state variables
content = content.replace(
  'const [materialForm, setMaterialForm] = useState({ title: "", url: "" });',
  `const [materialForm, setMaterialForm] = useState({ title: "", url: "" });
  const [assignmentForm, setAssignmentForm] = useState({ title: "", description: "" });
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [courseStudents, setCourseStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("materials");`
);

// 2. Add API call functions
content = content.replace(
  'const fetchSubmissions = async (courseId) => {',
  `const fetchEnrollmentRequests = async () => {
    try {
      const response = await api.get("/teacher/enrollment-requests", config);
      setEnrollmentRequests(response.data.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnrollment = async (requestId, action) => {
    try {
      await api.post(\`/teacher/handle-enrollment/\${requestId}\`, { action }, config);
      fetchEnrollmentRequests();
      setStatus({ type: "success", message: \`Request \${action}d successfully.\` });
    } catch (err) {
      setStatus({ type: "error", message: "Failed to handle request." });
    }
  };

  const fetchCourseStudents = async (courseId) => {
    try {
      const response = await api.get(\`/teacher/course-students/\${courseId}\`, config);
      setCourseStudents(response.data.students || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAssignment = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    if (!selectedCourse) return;
    try {
      await api.post(\`/teacher/add-assignment/\${selectedCourse._id}\`, assignmentForm, config);
      setAssignmentForm({ title: "", description: "" });
      fetchCourses();
      setStatus({ type: "success", message: "Assignment added successfully." });
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Unable to add assignment." });
    }
  };

  const fetchSubmissions = async (courseId) => {`
);

// 3. Update useEffect
content = content.replace(
  'fetchCourses();\n  }, [token]);',
  `fetchCourses();
    fetchEnrollmentRequests();
  }, [token]);`
);

// 4. Update course selection to fetch students
content = content.replace(
  'onClick={() => fetchSubmissions(course._id)}',
  'onClick={() => { fetchSubmissions(course._id); fetchCourseStudents(course._id); setSelectedCourse(course); setActiveTab("materials"); }}'
);

// 5. Add Enrollment Requests Section right before Course Overview
content = content.replace(
  '<section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">',
  `{enrollmentRequests.length > 0 && (
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg shadow-slate-200/40">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Pending Course Enrollments</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrollmentRequests.map((req) => (
                <div key={req._id} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 flex flex-col justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{req.studentId?.name}</p>
                    <p className="text-sm text-slate-500">{req.studentId?.email}</p>
                    <p className="mt-3 text-xs uppercase tracking-widest text-cyan-700 bg-cyan-50 px-2 py-1 rounded w-fit">
                      Course: {req.courseId?.code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEnrollment(req._id, "approve")} className="flex-1 rounded-xl bg-cyan-600 py-2 text-xs font-semibold text-white hover:bg-cyan-700 transition">Approve</button>
                    <button onClick={() => handleEnrollment(req._id, "reject")} className="flex-1 rounded-xl bg-red-100 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 transition">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">`
);

// 6. Tabs for Material / Assignment / Students
content = content.replace(
  '{activeCourse ? (\n              <div className="mt-6 space-y-6">',
  `{activeCourse ? (
              <div className="mt-6 space-y-6">
                <div className="flex gap-2 border-b border-gray-200 pb-4">
                  {["materials", "assignments", "students"].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={\`px-4 py-2 rounded-full text-sm font-semibold transition \${activeTab === tab ? "bg-cyan-100 text-cyan-800" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}\`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>`
);

// 7. Render appropriate tab content
content = content.replace(
  '<form onSubmit={handleAddMaterial} className="space-y-4">',
  `{activeTab === "materials" && (
                  <>
                    <form onSubmit={handleAddMaterial} className="space-y-4">`
);

content = content.replace(
  `                      )}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">No course materials added yet.</p>
                  )}
                </div>`,
  `                      )}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">No course materials added yet.</p>
                  )}
                </div>
                  </>
                )}

                {activeTab === "assignments" && (
                  <>
                    <form onSubmit={handleAddAssignment} className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Assignment Title</label>
                        <input
                          value={assignmentForm.title}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                          type="text" required
                          className="mt-3 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Description / Instructions</label>
                        <textarea
                          value={assignmentForm.description}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                          required rows="4"
                          className="mt-3 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
                        />
                      </div>
                      <button className="w-full rounded-3xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700" type="submit">
                        Add Assignment
                      </button>
                    </form>

                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 mt-6">
                      <h3 className="text-sm font-semibold text-slate-700">Current Assignments</h3>
                      {activeCourse.assignments?.length ? (
                        <ul className="mt-4 space-y-3">
                          {activeCourse.assignments.map((item, idx) => (
                            <li key={idx} className="rounded-3xl border border-gray-200 bg-white p-4 text-sm text-slate-700">
                              <p className="font-semibold text-slate-900">{item.title}</p>
                              <p className="mt-1 text-slate-500 text-xs">{item.description}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-4 text-sm text-slate-500">No assignments added yet.</p>
                      )}
                    </div>
                  </>
                )}

                {activeTab === "students" && (
                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Enrolled Students</h3>
                    {courseStudents.length > 0 ? (
                      <ul className="space-y-4">
                        {courseStudents.map(student => (
                          <li key={student._id} className="rounded-2xl border border-gray-200 bg-white p-4">
                            <p className="font-semibold text-slate-900">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                            
                            {student.performances?.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs font-semibold text-slate-600 mb-2">Graded Assignments:</p>
                                <ul className="space-y-2">
                                  {student.performances.map(perf => (
                                    <li key={perf._id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg text-xs">
                                      <span className="text-slate-700 font-medium">{perf.assignmentTitle}</span>
                                      <span className={\`font-bold \${perf.score >= 50 ? 'text-emerald-600' : 'text-red-600'}\`}>
                                        {perf.score}/100
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No students enrolled in this course yet.</p>
                    )}
                  </div>
                )}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('TeacherDashboard.jsx updated');
