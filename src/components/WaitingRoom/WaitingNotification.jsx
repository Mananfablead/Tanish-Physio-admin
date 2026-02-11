import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Users, 
  Clock,
  X,
  CheckCircle,
  XCircle
} from "lucide-react";
import AdminApprovalCard from "./AdminApprovalCard";
import { toast } from "sonner";

const WaitingNotification = ({ 
  socket, 
  sessionId,
  onPatientApproved 
}) => {
  console.log("🔄 WaitingNotification mounted with sessionId:", sessionId);
  const [isOpen, setIsOpen] = useState(false);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [newPatientNotification, setNewPatientNotification] = useState(null);

  // Production-grade socket connection handling
  // Wait for socket connection BEFORE registering listeners
  useEffect(() => {
    if (!socket || !sessionId) return;

    console.log("🔄 WaitingNotification: Initializing with socket connection status:", socket.connected);
    
    const handleSocketConnect = () => {
      console.log("✅ Admin socket connected - registering listeners");
      
      // Join waiting room and get current waiting list
      socket.emit("admin-ready", { sessionId });
      
      // Register all event listeners
      socket.on("patient-waiting", handlePatientWaiting);
      socket.on("waiting-list", handleWaitingList);
      socket.on("patient-approved-success", handlePatientApproved);
      socket.on("patient-rejected-success", handlePatientRejected);
      socket.on("patient-disconnected", handlePatientDisconnected);
      
      console.log("👂 WaitingNotification: All listeners registered after connection");
    };

    const handleSocketDisconnect = () => {
      console.log("🔌 Admin socket disconnected - clearing state");
      setWaitingPatients([]);
      setIsOpen(false);
    };

    const handlePatientWaiting = (data) => {
      console.log("🔔 New patient waiting:", data);
      console.log("🔔 Patient name:", data.patient.name);
      console.log("🔔 Session ID:", data.sessionId);
      
      setNewPatientNotification(data.patient);
      setIsOpen(true);
      
      // Add to waiting list
      setWaitingPatients(prev => {
        const exists = prev.some(p => p.userId === data.patient.userId);
        if (!exists) {
          console.log("➕ Adding new patient to waiting list");
          const newList = [...prev, { ...data.patient, status: "waiting" }];
          console.log("➕ New waiting list length:", newList.length);
          return newList;
        }
        console.log("⚠️ Patient already in waiting list");
        return prev;
      });

      toast.info(`New patient waiting: ${data.patient.name}`, {
        duration: 5000,
        icon: <Bell className="h-4 w-4" />
      });
    };

    const handleWaitingList = (data) => {
      console.log("📋 Received waiting list:", data);
      if (data.sessionId === sessionId) {
        setWaitingPatients(data.patients.map(p => ({ ...p, status: "waiting" })));
      }
    };

    const handlePatientApproved = (data) => {
      console.log("✅ Patient approved:", data);
      
      setWaitingPatients(prev => 
        prev.map(p => 
          p.userId === data.patient.userId 
            ? { ...p, status: "approved" } 
            : p
        )
      );
      
      // Auto-close notification after a delay if no more patients
      setTimeout(() => {
        const remainingPatients = waitingPatients.filter(
          p => p.userId !== data.patient.userId && p.status === "waiting"
        );
        if (remainingPatients.length === 0) {
          console.log("🔒 Closing notification - no more waiting patients");
          setIsOpen(false);
        }
      }, 2000);
    };

    const handlePatientRejected = (data) => {
      console.log("❌ Patient rejected:", data);
      setWaitingPatients(prev => 
        prev.map(p => 
          p.userId === data.patient.userId 
            ? { ...p, status: "rejected" } 
            : p
        )
      );
    };

    const handlePatientDisconnected = (data) => {
      console.log("🔌 Patient disconnected:", data);
      setWaitingPatients(prev => 
        prev.filter(p => p.userId !== data.patient.userId)
      );
    };

    // Handle connection state
    if (socket.connected) {
      handleSocketConnect();
    } else {
      socket.once("connect", handleSocketConnect);
    }
    
    socket.on("disconnect", handleSocketDisconnect);

    return () => {
      // Clean up all listeners
      socket.off("connect", handleSocketConnect);
      socket.off("disconnect", handleSocketDisconnect);
      socket.off("patient-waiting", handlePatientWaiting);
      socket.off("waiting-list", handleWaitingList);
      socket.off("patient-approved-success", handlePatientApproved);
      socket.off("patient-rejected-success", handlePatientRejected);
      socket.off("patient-disconnected", handlePatientDisconnected);
      console.log("🧹 WaitingNotification: All listeners cleaned up");
    };
  }, [socket, sessionId]);

  const handleApprovePatient = (patientSocketId) => {
    if (!socket) return;
    
    socket.emit("approve-patient", {
      sessionId,
      patientSocketId
    });
    
    toast.success("Patient approved");
  };

  const handleRejectPatient = (patientSocketId) => {
    if (!socket) return;
    
    socket.emit("reject-patient", {
      sessionId,
      patientSocketId,
      reason: "Request rejected by therapist"
    });
    
    toast.success("Patient rejected");
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setNewPatientNotification(null);
    }
  };

  // Don't show if no patients
  if (waitingPatients.length === 0) return null;

  const waitingCount = waitingPatients.filter(p => p.status === "waiting").length;

  return (
    <>
      {/* Notification Badge */}
      {waitingCount > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="relative bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Bell className="h-5 w-5 mr-2" />
            <span>Waiting Room</span>
            <Badge className="ml-2 bg-red-500 text-white">
              {waitingCount}
            </Badge>
          </Button>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Waiting Room</DialogTitle>
                  <DialogDescription>
                    Manage patient requests for your session
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {waitingPatients.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Waiting</h3>
                <p className="text-gray-500">All patients have been processed.</p>
              </div>
            ) : (
              waitingPatients.map((patient) => (
                <AdminApprovalCard
                  key={patient.socketId}
                  patient={patient}
                  status={patient.status || "waiting"}
                  onApprove={handleApprovePatient}
                  onReject={handleRejectPatient}
                  showActions={patient.status === "waiting"}
                />
              ))
            )}
          </div>

          {waitingCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{waitingCount} patient{waitingCount > 1 ? 's' : ''} waiting for approval</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WaitingNotification;