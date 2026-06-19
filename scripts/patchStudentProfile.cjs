const fs = require('fs');

const path = 'src/pages/StudentProfile.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add new state variables
content = content.replace(
  'const [performanceRecords, setPerformanceRecords] = useState([]);',
  `const [performanceRecords, setPerformanceRecords] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [pendingCourseIds, setPendingCourseIds] = useState([]);
  const [submissionForms, setSubmissionForms] = useState({});
  const [activeTab, setActiveTab] = useState("registered"); // "registered", "discovery", "insights"`
);

// 2. Update fetchDashboard and add fetchAvailableCourses
content = content.replace(
  'const fetchDashboard = async () => {',
  `const fetchAvailableCourses = async () => {
    try {
      const res = await api.get("/student/available-courses", config);
      setAvailableCourses(res.data.availableCourses || []);
      setPendingCourseIds(res.data.pendingCourseIds || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestEnrollment = async (courseId) => {
    try {
      await api.post(\`/student/request-enrollment/\${courseId}\`, {}, config);
      setStatus({ type: "success", message: "Enrollment request sent." });
      fetchAvailableCourses();
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Failed to request enrollment." });
    }
  };

  const handleSubmitAssignment = async (e, courseId, assignmentTitle) => {
    e.preventDefault();
    const submissionData = submissionForms[\`\${courseId}-\${assignmentTitle}\`];
    if (!submissionData) return;

    try {
      await api.post("/student/submit-assignment", { courseId, assignmentTitle, submissionData }, config);
      setStatus({ type: "success", message: "Assignment submitted successfully." });
      setSubmissionForms({ ...submissionForms, [\`\${courseId}-\${assignmentTitle}\`]: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Failed to submit assignment." });
    }
  };

  const fetchDashboard = async () => {`
);

// 3. Update useEffect
content = content.replace(
  'fetchDashboard();\n  }, [token]);',
  `fetchDashboard();
    fetchAvailableCourses();
  }, [token]);`
);

// 4. Update the layout: Header remains, tabs added, content separated
content = content.replace(
  '<div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">',
  `<div className="flex gap-2 border-b border-gray-200 pb-4 mb-8">
          {["registered", "discovery", "insights"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={\`px-6 py-3 rounded-full text-sm font-semibold transition \${activeTab === tab ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}\`}
            >
              {tab === "registered" ? "My Courses & Assignments" : tab === "discovery" ? "Browse Courses" : "Academic Insights"}
            </button>
          ))}
        </div>

        <div className="grid gap-8">`
);

// 5. Render Registered Courses (activeTab === "registered")
content = content.replace(
  '<section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg shadow-slate-200/40">',
  `{activeTab === "registered" && (
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg shadow-slate-200/40">`
);

// Add Assignments to courses
content = content.replace(
  `                    ) : (
                      <p className="mt-5 text-sm text-slate-500">No materials have been shared for this course yet.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>`,
  `                    ) : (
                      <p className="mt-5 text-sm text-slate-500">No materials have been shared for this course yet.</p>
                    )}

                    {/* ASSIGNMENTS */}
                    <div className="mt-8 border-t border-gray-200 pt-6">
                      <p className="font-semibold text-slate-900 mb-4">Course Assignments</p>
                      {course.assignments?.length > 0 ? (
                        <div className="space-y-4">
                          {course.assignments.map((assignment, idx) => (
                            <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-5">
                              <p className="font-semibold text-slate-900">{assignment.title}</p>
                              <p className="text-sm text-slate-600 mt-1">{assignment.description}</p>
                              
                              <form onSubmit={(e) => handleSubmitAssignment(e, course._id, assignment.title)} className="mt-4">
                                <textarea
                                  placeholder="Type your submission here..."
                                  value={submissionForms[\`\${course._id}-\${assignment.title}\`] || ""}
                                  onChange={(e) => setSubmissionForms({ ...submissionForms, [\`\${course._id}-\${assignment.title}\`]: e.target.value })}
                                  className="w-full rounded-2xl border border-gray-300 bg-gray-50 p-3 text-sm outline-none focus:border-cyan-500"
                                  rows="3"
                                  required
                                />
                                <button type="submit" className="mt-3 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition">
                                  Submit Assignment
                                </button>
                              </form>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No active assignments for this course.</p>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>
        )}`
);

// 6. Render Insights
content = content.replace(
  '<section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg shadow-slate-200/40">',
  `{activeTab === "insights" && (
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg shadow-slate-200/40">`
);

content = content.replace(
  `                  </div>
                ))}
              </div>
            )}
          </section>`,
  `                  </div>
                ))}
              </div>
            )}
          </section>
        )}`
);

// 7. Render Discovery Tab
content = content.replace(
  `          </section>
        )}
        </div>
      </div>
    </div>
  );`,
  `          </section>
        )}

        {activeTab === "discovery" && (
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg shadow-slate-200/40">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Discover New Courses</h2>
            {availableCourses.length === 0 ? (
              <p className="text-slate-500 text-sm">No new courses available at the moment.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {availableCourses.map(course => {
                  const isPending = pendingCourseIds.includes(course._id.toString());
                  return (
                    <div key={course._id} className="rounded-3xl border border-gray-200 bg-slate-50 p-6 flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 text-lg">{course.title}</p>
                        <p className="text-sm text-slate-500">Code: {course.code}</p>
                        <p className="text-xs text-slate-500 mt-2">Teacher: {course.teacherId?.name}</p>
                      </div>
                      <button
                        onClick={() => handleRequestEnrollment(course._id)}
                        disabled={isPending}
                        className={\`mt-5 w-full rounded-full py-2.5 text-sm font-semibold transition \${isPending ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-700'}\`}
                      >
                        {isPending ? "Request Pending" : "Request to Join"}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        </div>
      </div>
    </div>
  );`
);

fs.writeFileSync(path, content, 'utf8');
console.log('StudentProfile.jsx updated');
