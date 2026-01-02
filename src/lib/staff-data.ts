export const mockStaff = [
  { id: 1, name: "Dr. Sarah Johnson", email: "sarah@clinic.com", specialty: "Sports Injury", rating: 4.9, sessions: 248, status: "active", sessionTypes: ["1-on-1", "Group"] },
  { id: 2, name: "Dr. Michael Chen", email: "michael@clinic.com", specialty: "Rehabilitation", rating: 4.8, sessions: 312, status: "active", sessionTypes: ["1-on-1"] },
  { id: 3, name: "Dr. Lisa Williams", email: "lisa@clinic.com", specialty: "Pain Management", rating: 4.7, sessions: 186, status: "active", sessionTypes: ["Group"] },
  { id: 4, name: "Dr. James Brown", email: "james@clinic.com", specialty: "Orthopedic", rating: 4.6, sessions: 94, status: "active", sessionTypes: ["1-on-1"] },
  { id: 5, name: "Dr. Emma Davis", email: "emma@clinic.com", specialty: "Pediatric", rating: 4.9, sessions: 156, status: "inactive", sessionTypes: ["1-on-1", "Group"] },
];

export const mockApplications = [
  { id: 1, name: "Dr. Robert Martinez", email: "robert@email.com", specialty: "Neurological", submitted: "2024-03-10", status: "pending" },
  { id: 2, name: "Dr. Jennifer White", email: "jennifer@email.com", specialty: "Geriatric", submitted: "2024-03-12", status: "pending" },
  { id: 3, name: "Dr. Thomas Anderson", email: "thomas@email.com", specialty: "Sports Medicine", submitted: "2024-03-08", status: "rejected" },
];

export const mockSessionHistory = [
  { id: 1, patient: "John Smith", date: "2024-03-15", time: "10:00 AM", type: "1-on-1", status: "completed", feedback: "Excellent session, very helpful.", rating: 5, performance: "95%" },
  { id: 2, patient: "Sarah Wilson", date: "2024-03-15", time: "11:30 AM", type: "Group", status: "completed", feedback: "Great group dynamics.", rating: 4, performance: "88%" },
  { id: 3, patient: "Michael Brown", date: "2024-03-16", time: "02:00 PM", type: "1-on-1", status: "cancelled", feedback: "-", rating: 0, performance: "0%" },
  { id: 4, patient: "Emily Davis", date: "2024-03-17", time: "09:00 AM", type: "1-on-1", status: "scheduled", feedback: "Pending", rating: 0, performance: "-" },
];