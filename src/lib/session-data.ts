export const mockSessions = {
  upcoming: [
    { id: 1, user: "John Doe", therapist: "Dr. Sarah Johnson", date: "2024-03-20", time: "10:00 AM", type: "1-on-1", status: "scheduled", joinLink: "/video-call/1" },
    { id: 2, user: "Emily Parker", therapist: "Dr. Michael Chen", date: "2024-03-20", time: "10:30 AM", type: "1-on-1", status: "scheduled", joinLink: "/video-call/2" },
    { id: 3, user: "Group Session", therapist: "Dr. Lisa Williams", date: "2024-03-20", time: "11:00 AM", type: "Group (8)", status: "scheduled", joinLink: "/video-call/3" },
    { id: 4, user: "Mike Wilson", therapist: "Dr. James Brown", date: "2024-03-20", time: "2:00 PM", type: "1-on-1", status: "pending", joinLink: "/video-call/4" },
  ],
  live: [
    { id: 5, user: "Anna Smith", therapist: "Dr. Sarah Johnson", date: "2024-03-20", time: "09:30 AM", type: "1-on-1", status: "live", duration: "15 min", joinLink: "/video-call/5" },
  ],
  completed: [
    { id: 6, user: "Robert Brown", therapist: "Dr. Michael Chen", date: "2024-03-19", time: "3:00 PM", type: "1-on-1", status: "completed", duration: "45 min", joinLink: "/video-call/6" },
    { id: 7, user: "Lisa Anderson", therapist: "Dr. Lisa Williams", date: "2024-03-19", time: "11:00 AM", type: "1-on-1", status: "completed", duration: "50 min", joinLink: "/video-call/7" },
    { id: 8, user: "David Lee", therapist: "Dr. James Brown", date: "2024-03-18", time: "4:00 PM", type: "1-on-1", status: "completed", duration: "40 min", joinLink: "/video-call/8" },
  ],
  cancelled: [
    { id: 9, user: "Sarah Taylor", therapist: "Dr. Sarah Johnson", date: "2024-03-19", time: "2:00 PM", type: "1-on-1", status: "cancelled", reason: "User requested", joinLink: "/video-call/9" },
    { id: 10, user: "James Miller", therapist: "Dr. Michael Chen", date: "2024-03-18", time: "10:00 AM", type: "1-on-1", status: "no-show", reason: "User didn't join", joinLink: "/video-call/10" },
  ],
  
};