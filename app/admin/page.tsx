'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Briefcase,
  Layers,
  Sparkles,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  BarChart3,
  Award,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  X,
  Mail,
  GraduationCap,
  Calendar,
  ExternalLink,
  ChevronRight,
  Flame,
} from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'enrollments' | 'students' | 'analytics' | 'courses' | 'careers' | 'skills' | 'resources'>('enrollments');

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Modal / Form state for CRUD
  const [isCreating, setIsCreating] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreate = async () => {
    if (!newItemTitle) return;
    try {
      let entityType = 'career';
      let payload: any = { title: newItemTitle, description: newItemDesc };

      if (activeTab === 'skills') {
        entityType = 'skill';
        payload = { name: newItemTitle, description: newItemDesc, category: 'Frontend', importance: 'High' };
      } else if (activeTab === 'courses') {
        entityType = 'course';
        payload = {
          title: newItemTitle,
          description: newItemDesc,
          category: 'Software Engineering',
          difficulty: 'Intermediate',
          duration: '20 Hours',
          isPremium: false,
          prerequisiteSkillIds: [],
          skillsTaught: [],
          modulesCount: 6,
          learningObjectives: ['Master fundamental principles'],
        };
      } else if (activeTab === 'resources') {
        entityType = 'resource';
        payload = {
          title: newItemTitle,
          description: newItemDesc,
          type: 'Tutorial',
          skillId: 'skl_js',
          difficulty: 'Beginner',
          duration: '1 hr',
          isPremium: false,
          provider: 'Community Docs',
          url: 'https://developer.mozilla.org',
        };
      } else {
        payload = {
          title: newItemTitle,
          description: newItemDesc,
          estimatedDurationWeeks: 20,
          averageSalary: '$120,000 / yr',
          category: 'Engineering',
          iconName: 'Layers',
          requiredSkillIds: [],
        };
      }

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, action: 'create', data: payload }),
      });

      if (res.ok) {
        setIsCreating(false);
        setNewItemTitle('');
        setNewItemDesc('');
        setActionMsg(`New ${entityType} created successfully!`);
        setTimeout(() => setActionMsg(''), 3000);
        await loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (entityType: string, id: string) => {
    if (!confirm(`Delete this ${entityType}?`)) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, action: 'delete', data: { id } }),
      });
      if (res.ok) {
        setActionMsg(`${entityType} deleted successfully.`);
        setTimeout(() => setActionMsg(''), 3000);
        await loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  const analytics = data?.analytics || {};
  const courseEnrollments = data?.courseEnrollments || [];
  const students = data?.students || [];
  const careers = data?.careers || [];
  const courses = data?.courses || [];
  const skills = data?.skills || [];
  const resources = data?.resources || [];

  // Filter students
  const filteredStudents = students.filter((s: any) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.targetCareerTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse =
      selectedCourseFilter === 'all' ||
      s.enrolledCourses.some((c: any) => c.courseId === selectedCourseFilter);

    return matchesSearch && matchesCourse;
  });

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Institutional Administration Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Admin Platform & Enrollment Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
              Monitor student enrollments per course, inspect detailed student progress, and manage educational curriculum.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Admin Live</span>
            </span>
          </div>
        </div>

        {actionMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* 4 Stat Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Enrolled Students</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{students.length}</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span>{analytics.activeLearners ?? students.length} actively learning</span>
            </div>
          </div>

          {/* Total Course Enrollments */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Course Enrollments</span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{analytics.totalEnrollments ?? 0}</div>
            <div className="text-[11px] text-slate-500">Across {courses.length} catalog courses</div>
          </div>

          {/* Certifications Awarded */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Certificates Issued</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{analytics.totalCertificatesIssued ?? 0}</div>
            <div className="text-[11px] text-amber-600 font-semibold">Verified credentials</div>
          </div>

          {/* Diagnostic Assessment Pass Rate */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Avg Diagnostic Score</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{analytics.averageAssessmentScore ?? 0}%</div>
            <div className="text-[11px] text-slate-500">Readiness pass rate: {analytics.assessmentPassRate ?? 0}%</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'enrollments', label: `Course Enrollments (${courseEnrollments.length})`, icon: BookOpen },
            { id: 'students', label: `Student Directory (${students.length})`, icon: Users },
            { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
            { id: 'courses', label: `Courses (${courses.length})`, icon: BookOpen },
            { id: 'careers', label: `Careers (${careers.length})`, icon: Briefcase },
            { id: 'skills', label: `Skills (${skills.length})`, icon: Sparkles },
            { id: 'resources', label: `Resources (${resources.length})`, icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ====================================================================== */}
        {/* TAB 1: COURSE ENROLLMENTS TABLE & STATS                                 */}
        {/* ====================================================================== */}
        {activeTab === 'enrollments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>How Many Students Have Enrolled in Each Course</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live breakdown of student registrations, completion numbers, and progress per course
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                  {courseEnrollments.reduce((sum: number, c: any) => sum + c.enrolledCount, 0)} Total Enrollments
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-6">Course Name</th>
                      <th className="py-3.5 px-6 text-center">Enrolled Students</th>
                      <th className="py-3.5 px-6 text-center">Certified / Completed</th>
                      <th className="py-3.5 px-6">Avg Progress</th>
                      <th className="py-3.5 px-6">Enrolled Student Avatars</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courseEnrollments.map((course: any) => (
                      <tr key={course.courseId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 text-sm">{course.courseTitle}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600">
                              {course.category}
                            </span>
                            <span>•</span>
                            <span>{course.difficulty}</span>
                            <span>•</span>
                            <span>{course.totalTopics} topics</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                            <Users className="w-3.5 h-3.5" />
                            <span>{course.enrolledCount} Students</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            course.completedCount > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Award className="w-3.5 h-3.5" />
                            <span>{course.completedCount} Completed</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 min-w-[160px]">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                            <span>{course.averageProgressPercent}%</span>
                            <span className="text-[10px] text-slate-400">Class Avg</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${course.averageProgressPercent}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center -space-x-2">
                            {course.students.slice(0, 5).map((s: any) => (
                              <img
                                key={s.id}
                                src={s.avatar}
                                alt={s.name}
                                title={`${s.name} (${s.progressPercent}%)`}
                                className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                                onClick={() => {
                                  const fullStudent = students.find((st: any) => st.id === s.id);
                                  if (fullStudent) setSelectedStudent(fullStudent);
                                }}
                              />
                            ))}
                            {course.students.length > 5 && (
                              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold border-2 border-white flex items-center justify-center">
                                +{course.students.length - 5}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setSelectedCourseFilter(course.courseId);
                              setActiveTab('students');
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <span>View Students</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 2: DETAILED STUDENT DIRECTORY & STUDENT DETAILS                    */}
        {/* ====================================================================== */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students by name, email, career..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">All Enrolled Courses</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>

                {selectedCourseFilter !== 'all' && (
                  <button
                    onClick={() => setSelectedCourseFilter('all')}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                    title="Clear filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Registered Student Details & Progress</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {filteredStudents.length} registered students
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-6">Student</th>
                      <th className="py-3.5 px-6">Target Career</th>
                      <th className="py-3.5 px-6">Enrolled Courses</th>
                      <th className="py-3.5 px-6">Overall Progress</th>
                      <th className="py-3.5 px-6 text-center">Certificates</th>
                      <th className="py-3.5 px-6">Streak</th>
                      <th className="py-3.5 px-6 text-right">Student Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-14 text-center">
                          <div className="max-w-md mx-auto text-center space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                              <Users className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-sm text-slate-800">No Registered Students Found</h4>
                            <p className="text-xs text-slate-500">
                              {searchQuery || selectedCourseFilter !== 'all'
                                ? 'No student matches your search or filter criteria. Try resetting the filters.'
                                : 'When students sign up or sign in using their email or Google account, their registered details, enrolled courses, and live scores will appear here in real time.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student: any) => (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Student Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{student.name}</span>
                                {student.subscriptionTier === 'pro' && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded">
                                    PRO
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{student.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Career */}
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-800">
                            {student.targetCareerTitle}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {student.education}
                          </div>
                        </td>

                        {/* Enrolled Courses */}
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {student.enrolledCourses.map((c: any) => (
                              <span
                                key={c.courseId}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                                  c.isCompleted
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {c.isCompleted && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />}
                                <span>{c.courseTitle} ({c.progressPercent}%)</span>
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Overall Progress */}
                        <td className="py-4 px-6 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span>{student.overallProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${student.overallProgress}%` }}
                            />
                          </div>
                        </td>

                        {/* Certificates */}
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            student.totalCertificates > 0
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>{student.totalCertificates}</span>
                          </span>
                        </td>

                        {/* Streak */}
                        <td className="py-4 px-6 font-mono text-slate-700">
                          <span className="flex items-center gap-1 font-semibold text-[11px]">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            <span>{student.streakDays}d</span>
                          </span>
                        </td>

                        {/* Action Details Button */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* STUDENT DETAILS DRAWER / MODAL                                         */}
        {/* ====================================================================== */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-white">{selectedStudent.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {selectedStudent.subscriptionTier} Learner
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{selectedStudent.email}</span>
                    </p>
                    <p className="text-xs text-indigo-300 font-semibold mt-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Target: {selectedStudent.targetCareerTitle}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Academic & Background Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Study Streak</span>
                    <span className="text-base font-extrabold text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>{selectedStudent.streakDays} Days</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Study Hours</span>
                    <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                      {selectedStudent.totalHoursSpent} hrs
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Enrolled</span>
                    <span className="text-base font-extrabold text-blue-600 mt-0.5 block">
                      {selectedStudent.totalEnrolled} Courses
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Certificates</span>
                    <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">
                      {selectedStudent.totalCertificates} Awarded
                    </span>
                  </div>
                </div>

                {/* Personal & Educational Profile */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Education:</strong>{' '}
                      <span className="text-slate-600">{selectedStudent.education}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Experience & Style:</strong>{' '}
                      <span className="text-slate-600">{selectedStudent.experience} • {selectedStudent.preferredStyle}</span>
                    </div>
                  </div>
                </div>

                {/* Enrolled Courses & Detailed Progress */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Enrolled Course Breakdown</span>
                  </h4>

                  <div className="space-y-2.5">
                    {selectedStudent.enrolledCourses.map((c: any) => (
                      <div key={c.courseId} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{c.courseTitle}</span>
                            {c.isCompleted && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Completed ✓
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-slate-600 font-bold">
                            {c.topicsCompleted} / {c.totalTopics} topics ({c.progressPercent}%)
                          </span>
                        </div>

                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              c.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${c.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Earned Certifications */}
                {selectedStudent.certificates.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Earned Certifications</span>
                    </h4>

                    <div className="space-y-2">
                      {selectedStudent.certificates.map((cert: any) => (
                        <div key={cert.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-amber-950">{cert.title}</div>
                            <div className="text-[11px] text-amber-800">
                              Issued by {cert.issuer} • {cert.date}
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded bg-amber-200/60 text-amber-900 font-extrabold text-[10px]">
                            VERIFIED
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 3: PLATFORM ANALYTICS                                              */}
        {/* ====================================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Popular Careers */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Most Selected Career Pathways</h3>
                <div className="space-y-2">
                  {careers.slice(0, 5).map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{c.title}</span>
                      <span className="text-[11px] font-semibold text-slate-600">{c.averageSalary}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficult Skills */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Challenging Prerequisite Skills</h3>
                <p className="text-xs text-slate-500">Skills with lowest average diagnostic accuracy</p>
                <div className="space-y-2">
                  {[
                    { name: 'JavaScript Functions & Closures', avg: '38%' },
                    { name: 'DOM Event Bubbling', avg: '42%' },
                    { name: 'ES6 Asynchronous Promises', avg: '55%' },
                    { name: 'SQL Window Functions & Indexing', avg: '58%' },
                  ].map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{s.name}</span>
                      <span className="font-bold text-rose-600">{s.avg} Avg Score</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 4, 5, 6, 7: CURRICULUM MANAGEMENT (COURSES, CAREERS, SKILLS, RES) */}
        {/* ====================================================================== */}
        {['courses', 'careers', 'skills', 'resources'].includes(activeTab) && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 capitalize">Manage {activeTab}</h3>
                <p className="text-xs text-slate-500">Add, edit, and curate platform database records</p>
              </div>

              <button
                onClick={() => setIsCreating(!isCreating)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add {activeTab.slice(0, -1)}</span>
              </button>
            </div>

            {/* Create Form */}
            {isCreating && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
                <div className="font-bold text-xs text-slate-900">New {activeTab.slice(0, -1)} Entry</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Title or Name..."
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Description or summary..."
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Save Entry
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              {(activeTab === 'careers'
                ? careers
                : activeTab === 'courses'
                ? courses
                : activeTab === 'skills'
                ? skills
                : resources
              ).map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-slate-900">{item.title || item.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        handleDelete(
                          activeTab === 'skills' ? 'skill' : activeTab === 'courses' ? 'course' : activeTab === 'resources' ? 'resource' : 'career',
                          item.id
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
