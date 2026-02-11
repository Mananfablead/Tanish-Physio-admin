import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Clock, 
  Phone, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from "lucide-react";

const AdminApprovalCard = ({ 
  patient, 
  status = "waiting", 
  onApprove, 
  onReject,
  showActions = true 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "waiting": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "waiting": return <Clock className="h-4 w-4 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {patient.name}
              </CardTitle>
              <CardDescription className="flex items-center text-sm text-gray-600">
                <Phone className="h-3 w-3 mr-1" />
                {patient.email}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${getStatusColor(status)} font-medium`}>
            {getStatusIcon(status)}
            <span className="ml-1 capitalize">{status}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Requested At</p>
            <p className="font-medium text-gray-900">{formatTime(patient.requestedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">User ID</p>
            <p className="font-mono text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
              {patient.userId.substring(0, 8)}...
            </p>
          </div>
        </div>

        {showActions && status === "waiting" && (
          <div className="flex space-x-3 pt-2">
            <Button 
              onClick={() => {
                console.log("👆 Approve button clicked for patient:", patient.socketId);
                console.log("👆 Patient name:", patient.name);
                onApprove(patient.socketId);
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Patient
            </Button>
            <Button 
              onClick={() => {
                console.log("👆 Reject button clicked for patient:", patient.socketId);
                console.log("👆 Patient name:", patient.name);
                onReject(patient.socketId);
              }}
              variant="outline"
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {status === "approved" && (
          <div className="text-center py-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium flex items-center justify-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Patient approved and redirected to video call
            </p>
          </div>
        )}

        {status === "rejected" && (
          <div className="text-center py-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 font-medium flex items-center justify-center">
              <XCircle className="h-4 w-4 mr-2" />
              Patient request rejected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminApprovalCard;