import { useState } from "react";
import { Search, MoreHorizontal, Plus, BookOpen, User, Calendar, Clock, Edit, Trash2, CheckCircle, XCircle, Clock as ClockIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    name: "Physical Therapy Basics",
    description: "Introduction to fundamental physical therapy techniques",
    instructor: "Dr. Sarah Johnson",
    duration: "8 weeks",
    startDate: "2024-03-01",
    endDate: "2024-04-26",
    status: "active" as "active" | "completed" | "upcoming",
    enrolled: 24,
    capacity: 30,
  },
  {
    id: 2,
    name: "Advanced Rehabilitation",
    description: "Advanced techniques for injury recovery and rehabilitation",
    instructor: "Dr. Michael Chen",
    duration: "12 weeks",
    startDate: "2024-02-15",
    endDate: "2024-05-10",
    status: "active" as "active" | "completed" | "upcoming",
    enrolled: 18,
    capacity: 25,
  },
  {
    id: 3,
    name: "Sports Injury Prevention",
    description: "Methods to prevent common sports-related injuries",
    instructor: "Dr. Lisa Williams",
    duration: "6 weeks",
    startDate: "2024-04-01",
    endDate: "2024-05-15",
    status: "upcoming" as "active" | "completed" | "upcoming",
    enrolled: 8,
    capacity: 20,
  },
  {
    id: 4,
    name: "Posture Correction Workshop",
    description: "Techniques to improve posture and reduce back pain",
    instructor: "Dr. James Brown",
    duration: "4 weeks",
    startDate: "2024-01-10",
    endDate: "2024-02-07",
    status: "completed" as "active" | "completed" | "upcoming",
    enrolled: 32,
    capacity: 35,
  },
];

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  const [courses, setCourses] = useState(mockCourses);
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    instructor: "",
    duration: "",
    startDate: "",
    endDate: "",
    status: "active" as "active" | "completed" | "upcoming",
    capacity: "",
  });

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCourse = () => {
    const newCourse = {
      id: courses.length + 1,
      name: courseForm.name,
      description: courseForm.description,
      instructor: courseForm.instructor,
      duration: courseForm.duration,
      startDate: courseForm.startDate,
      endDate: courseForm.endDate,
      status: courseForm.status,
      enrolled: 0,
      capacity: parseInt(courseForm.capacity),
    };
    
    setCourses([...courses, newCourse]);
    resetForm();
    setIsAddCourseOpen(false);
  };

  const handleUpdateCourse = () => {
    if (!selectedCourse) return;
    
    const updatedCourses = courses.map(course => 
      course.id === selectedCourse.id 
        ? { 
            ...course, 
            name: courseForm.name,
            description: courseForm.description,
            instructor: courseForm.instructor,
            duration: courseForm.duration,
            startDate: courseForm.startDate,
            endDate: courseForm.endDate,
            status: courseForm.status,
            capacity: parseInt(courseForm.capacity),
          }
        : course
    );
    
    setCourses(updatedCourses);
    resetForm();
    setIsEditCourseOpen(false);
  };

  const handleDeleteCourse = () => {
    if (!selectedCourse) return;
    
    setCourses(courses.filter(course => course.id !== selectedCourse.id));
    setIsDeleteCourseOpen(false);
  };

  const resetForm = () => {
    setCourseForm({
      name: "",
      description: "",
      instructor: "",
      duration: "",
      startDate: "",
      endDate: "",
      status: "active",
      capacity: "",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/15 text-success";
      case "upcoming":
        return "bg-warning/15 text-warning";
      case "completed":
        return "bg-destructive/15 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Course Management</h1>
          <p className="page-subtitle">Manage and track all courses</p>
        </div>
        <Button onClick={() => setIsAddCourseOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{courses.filter(c => c.status === "active").length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <ClockIcon className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{courses.filter(c => c.status === "upcoming").length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{courses.filter(c => c.status === "completed").length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{courses.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Duration</th>
                  <th>Enrollment</th>
                  <th>Status</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">{course.name}</span>
                          <p className="text-xs text-muted-foreground">{course.description}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span>{course.instructor}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{course.duration}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{course.startDate} to {course.endDate}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{course.enrolled}/{course.capacity}</span>
                      </div>
                    </td>
                    <td>
                      <span className={cn("status-badge", getStatusBadge(course.status))}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedCourse(course);
                            setCourseForm({
                              name: course.name,
                              description: course.description,
                              instructor: course.instructor,
                              duration: course.duration,
                              startDate: course.startDate,
                              endDate: course.endDate,
                              status: course.status,
                              capacity: course.capacity.toString(),
                            });
                            setIsEditCourseOpen(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => {
                              setSelectedCourse(course);
                              setIsDeleteCourseOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredCourses.length}</span> courses
            </p>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>Create a new course for the platform.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Name</label>
                <Input
                  placeholder="Enter course name"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructor</label>
                <Select value={courseForm.instructor} onValueChange={(value) => setCourseForm({...courseForm, instructor: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</SelectItem>
                    <SelectItem value="Dr. Michael Chen">Dr. Michael Chen</SelectItem>
                    <SelectItem value="Dr. Lisa Williams">Dr. Lisa Williams</SelectItem>
                    <SelectItem value="Dr. James Brown">Dr. James Brown</SelectItem>
                    <SelectItem value="Dr. Emma Davis">Dr. Emma Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input
                  placeholder="e.g., 8 weeks"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={courseForm.status} onValueChange={(value) => setCourseForm({...courseForm, status: value as "active" | "completed" | "upcoming"})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={courseForm.startDate}
                  onChange={(e) => setCourseForm({...courseForm, startDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={courseForm.endDate}
                  onChange={(e) => setCourseForm({...courseForm, endDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Capacity</label>
                <Input
                  type="number"
                  placeholder="Enter maximum enrollment"
                  value={courseForm.capacity}
                  onChange={(e) => setCourseForm({...courseForm, capacity: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Course description..."
                value={courseForm.description}
                onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddCourseOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddCourse} disabled={!courseForm.name || !courseForm.instructor || !courseForm.duration || !courseForm.startDate || !courseForm.endDate || !courseForm.capacity}>
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Modal */}
      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update the details for this course.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Name</label>
                <Input
                  placeholder="Enter course name"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructor</label>
                <Select value={courseForm.instructor} onValueChange={(value) => setCourseForm({...courseForm, instructor: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</SelectItem>
                    <SelectItem value="Dr. Michael Chen">Dr. Michael Chen</SelectItem>
                    <SelectItem value="Dr. Lisa Williams">Dr. Lisa Williams</SelectItem>
                    <SelectItem value="Dr. James Brown">Dr. James Brown</SelectItem>
                    <SelectItem value="Dr. Emma Davis">Dr. Emma Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input
                  placeholder="e.g., 8 weeks"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={courseForm.status} onValueChange={(value) => setCourseForm({...courseForm, status: value as "active" | "completed" | "upcoming"})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={courseForm.startDate}
                  onChange={(e) => setCourseForm({...courseForm, startDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={courseForm.endDate}
                  onChange={(e) => setCourseForm({...courseForm, endDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Capacity</label>
                <Input
                  type="number"
                  placeholder="Enter maximum enrollment"
                  value={courseForm.capacity}
                  onChange={(e) => setCourseForm({...courseForm, capacity: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Course description..."
                value={courseForm.description}
                onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditCourseOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse} disabled={!courseForm.name || !courseForm.instructor || !courseForm.duration || !courseForm.startDate || !courseForm.endDate || !courseForm.capacity}>
              Update Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Confirmation Modal */}
      <Dialog open={isDeleteCourseOpen} onOpenChange={setIsDeleteCourseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm">
                  <span className="text-muted-foreground">Course:</span>{" "}
                  <span className="font-medium">{selectedCourse.name}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Instructor:</span>{" "}
                  <span className="font-medium">{selectedCourse.instructor}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Duration:</span>{" "}
                  <span className="font-medium">{selectedCourse.duration}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-medium">{selectedCourse.status}</span>
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteCourseOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}