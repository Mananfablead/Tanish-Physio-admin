import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  User,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  ArrowLeft,
  FileText,
  AlertTriangle,
  Activity,
  ClipboardList,
  Star,
} from "lucide-react";
import {
  fetchBookingById,
  updateBooking,
} from "@/features/bookings/bookingSlice";
import { toast } from "@/hooks/use-toast";
import PageLoader from "@/components/PageLoader";
import { bookingAPI } from "@/api/apiClient";

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  const { singleBooking, loading, error } = useSelector(
    (state: any) => state.bookings
  );
console.log("Booking data:", singleBooking);
console.log("Booking object:", singleBooking?.booking);
console.log("User data:", singleBooking?.booking?.userId);
console.log("Health profile:", singleBooking?.booking?.userId?.healthProfile);
  // Get the booking from Redux state - it's already extracted from the API response
  const booking = singleBooking?.booking;
  
  // Get user health profile from booking data
  const userHealthProfile = booking?.userId?.healthProfile || {};
  
  console.log("User health profile extracted:", userHealthProfile);
  
  // Helper functions for health profile display
  const getQuestionnaireResponses = () => {
    const responses = [];
    
    // Check structured questionnaire responses first
    if (userHealthProfile?.questionnaireResponses) {
      const respObj = userHealthProfile.questionnaireResponses;
      Object.entries(respObj).forEach(([questionId, answer]) => {
        if (answer) {
          responses.push({
            questionId,
            question: `Question ID: ${questionId}`,
            answer: answer as string,
            source: 'structured'
          });
        }
      });
    }
    
    // Check questionnaire metadata for detailed responses
    if (userHealthProfile?.questionnaireMetadata?.responses) {
      userHealthProfile.questionnaireMetadata.responses.forEach((resp: any) => {
        if (resp.answer) {
          responses.push({
            questionId: resp.questionId,
            question: resp.questionText,
            answer: resp.answer,
            questionType: resp.questionType,
            timestamp: resp.timestamp,
            source: 'metadata'
          });
        }
      });
    }
    
    // Fallback to parsing additionalNotes for legacy data
    if (userHealthProfile?.additionalNotes && responses.length === 0) {
      const lines = userHealthProfile.additionalNotes.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          const separatorIndex = line.indexOf(':');
          if (separatorIndex > 0) {
            const question = line.substring(0, separatorIndex).trim();
            const answer = line.substring(separatorIndex + 1).trim();
            if (question && answer) {
              responses.push({
                question,
                answer,
                source: 'legacy'
              });
            }
          }
        }
      });
    }
    
    return responses;
  };
  
  const getResponseCount = () => {
    return getQuestionnaireResponses().length;
  };
  
  const hasCompletedQuestionnaire = () => {
    return getResponseCount() > 0 || 
           (userHealthProfile?.questionnaireMetadata?.responses?.length > 0);
  };
  
  const getQuestionnaireStatus = () => {
    if (hasCompletedQuestionnaire()) {
      if (userHealthProfile?.questionnaireMetadata?.completedAt) {
        return `Completed on ${new Date(userHealthProfile.questionnaireMetadata.completedAt).toLocaleDateString()}`;
      }
      return 'Completed';
    }
    return 'Not completed';
  };
  
  const getQuestionnaireSummary = () => {
    const responses = getQuestionnaireResponses();
    const totalQuestions = 10; // Default assumption
    
    return {
      totalResponses: responses.length,
      totalQuestions,
      completionRate: totalQuestions > 0 
        ? Math.round((responses.length / totalQuestions) * 100) 
        : 0,
      status: getQuestionnaireStatus(),
      completedAt: userHealthProfile?.questionnaireMetadata?.completedAt 
        ? new Date(userHealthProfile.questionnaireMetadata.completedAt).toLocaleDateString() 
        : null,
      hasData: responses.length > 0
    };
  };
  
  const isFileUrl = (answer) => {
    if (typeof answer !== 'string') return false;
    return answer.includes('/uploads/questionnaire-responses/');
  };
  
  const getFileNameFromUrl = (url) => {
    if (!url) return 'Document';
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename || 'Document';
  };
  
  const formatAnswer = (answer, questionType) => {
    if (!answer) return "Not answered";
    
    if (questionType === 'slider') {
      return `${answer}/10`;
    }
    
    if (questionType === 'mcq') {
      return answer;
    }
    
    return answer;
  };
  
  const getQuestionTypeBadge = (questionType) => {
    const typeMap = {
      'text': 'bg-blue-100 text-blue-800',
      'mcq': 'bg-green-100 text-green-800',
      'slider': 'bg-purple-100 text-purple-800',
      'skalaeton': 'bg-orange-100 text-orange-800'
    };
    return typeMap[questionType] || 'bg-gray-100 text-gray-800';
  };
  
  const getSourceBadge = (source) => {
    const sourceMap = {
      'structured': 'bg-indigo-100 text-indigo-800',
      'metadata': 'bg-cyan-100 text-cyan-800',
      'legacy': 'bg-yellow-100 text-yellow-800'
    };
    return sourceMap[source] || 'bg-gray-100 text-gray-800';
  };
  
  const getResponseStatusBadge = (hasResponse) => {
    return hasResponse 
      ? 'text-emerald-600 bg-emerald-100' 
      : 'text-destructive bg-destructive/10';
  };
  
  const getResponseStatusText = (hasResponse) => {
    return hasResponse ? 'Answered' : 'Not answered';
  };
  
  const getResponseStatusIndicator = (hasResponse) => {
    return hasResponse 
      ? 'bg-emerald-600' 
      : 'bg-destructive';
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBookingById(id));
    }
  }, [dispatch, id]);

  const handleStatusChange = async (
    newStatus: "confirmed" | "pending" | "cancelled"
  ) => {
    if (!booking) return;

    setStatusLoading(true);
    try {
      // Update booking status
      const response = await bookingAPI.updateStatus(booking._id || booking.id, newStatus);
      
      if (response.data.success) {
        // Refresh the booking data
        dispatch(fetchBookingById(id));
        toast({ title: "Status updated successfully" });
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      toast({
        title: "Failed to update status",
        description: err.response?.data?.message || err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading && !singleBooking) {
    return <PageLoader text="Loading booking details..." />;
  }

  if (error && !singleBooking) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Error Loading Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!singleBooking) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "scheduled":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Bookings
      </Button>

      {/* Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {typeof booking.serviceName === "string"
                  ? booking.serviceName
                  : booking.serviceName &&
                    typeof booking.serviceName === "object"
                  ? booking.serviceName.name || "N/A"
                  : "N/A"}
              </h2>
              {/* <p className="text-muted-foreground">
                Booking ID:{" "}
                {booking && typeof booking === "object"
                  ? booking._id || booking.id || "N/A"
                  : "N/A"}
              </p> */}
            </div>
            <div className="flex gap-2">
              <Badge
                className={getStatusBadge(
                  typeof booking.status === "string" ? booking.status : ""
                )}
              >
                {typeof booking.status === "string" ? booking.status : "N/A"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <Info icon={<Calendar />} label="Booking Date">
            {booking.date && typeof booking.date !== "object"
              ? new Date(booking.date).toDateString()
              : "N/A"}
          </Info>
          <Info icon={<Clock />} label="Booking Time">
            {typeof booking.time === "string" ? booking.time : "N/A"}
          </Info>
          <Info icon={<Package />} label="Duration">
            {booking.serviceId && typeof booking.serviceId === "object"
              ? booking.serviceId.duration || "N/A"
              : "N/A"}
          </Info>

          {/* Scheduled Session Info */}
          {booking.scheduledDate && (
            <>
              <Info icon={<Calendar />} label="Scheduled Date">
                {booking.scheduledDate &&
                typeof booking.scheduledDate !== "object"
                  ? new Date(booking.scheduledDate).toDateString()
                  : "N/A"}
              </Info>
              <Info icon={<Clock />} label="Scheduled Time">
                {typeof booking.scheduledTime === "string"
                  ? booking.scheduledTime
                  : "N/A"}
              </Info>
              <Info icon={<ClockIcon />} label="Schedule Type">
                {typeof booking.scheduleType === "string"
                  ? booking.scheduleType
                  : "N/A"}
              </Info>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <User /> Client Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row
                label="Name"
                value={
                  booking.clientName && typeof booking.clientName === "object"
                    ? booking.clientName.name || booking.clientName._id || "N/A"
                    : booking.clientName || "N/A"
                }
              />
              <Row
                label="User Email"
                value={
                  booking.userId && typeof booking.userId === "object"
                    ? booking.userId.email || "N/A"
                    : booking.userId || "N/A"
                }
                mono
              />
              <Row
                label="Phone"
                value={
                  booking.userId && typeof booking.userId === "object"
                    ? booking.userId.phone || "N/A"
                    : "N/A"
                }
              />
              <Row
                label="Join Date"
                value={
                  booking.userId &&
                  typeof booking.userId === "object" &&
                  booking.userId.joinDate
                    ? new Date(booking.userId.joinDate).toLocaleDateString()
                    : "N/A"
                }
              />
            </CardContent>
          </Card>

          {/* Health Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <Activity /> Health Profile
                {hasCompletedQuestionnaire() && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({getResponseCount()} responses)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Questionnaire Summary */}
              {hasCompletedQuestionnaire() && (
                <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {getResponseCount()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Responses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {getQuestionnaireSummary().completionRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Completion
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {getQuestionnaireSummary().status}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Status
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {getQuestionnaireSummary().completedAt || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Completed
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Questionnaire Responses Display */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {getQuestionnaireResponses().length > 0 ? (
                  getQuestionnaireResponses().map((response, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-sm font-semibold text-primary">
                              Q{index + 1}:
                            </span>
                            <h4 className="font-medium text-foreground">
                              {response.question}
                            </h4>
                            {response.questionType && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${getQuestionTypeBadge(
                                  response.questionType || "text"
                                )}`}
                              >
                                {response.questionType || "text"}
                              </span>
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getSourceBadge(
                                response.source || "unknown"
                              )}`}
                            >
                              {response.source || "unknown"}
                            </span>
                          </div>

                          <div className="ml-6">
                            <p className="text-muted-foreground flex items-center gap-2">
                              <span className="font-medium">Answer:</span>{" "}
                              {isFileUrl(response.answer) ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground text-sm">
                                    {getFileNameFromUrl(response.answer)}
                                  </span>
                                  <a
                                    href={response.answer}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full hover:bg-primary/90 transition-colors"
                                  >
                                    <FileText className="w-3 h-3" />
                                    View
                                  </a>
                                </div>
                              ) : (
                                <span className="font-medium text-foreground">
                                  {formatAnswer(
                                    response.answer,
                                    response.questionType
                                  )}
                                </span>
                              )}
                            </p>
                            {response.timestamp && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Answered: {formatDateTime(response.timestamp)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${getResponseStatusBadge(
                              !!response.answer
                            )}`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${getResponseStatusIndicator(
                                !!response.answer
                              )}`}
                            ></div>
                            {getResponseStatusText(!!response.answer)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : // No structured responses - check if there's any health profile data
                Object.keys(userHealthProfile).length > 0 ? (
                  // Has some health profile data but no structured responses
                  <div className="space-y-4">
                    <div className="text-center py-4 text-muted-foreground">
                      <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="font-medium mb-1">
                        No structured questionnaire responses found
                      </p>
                      <p className="text-sm">
                        The user has a health profile but hasn't completed the
                        detailed questionnaire yet.
                      </p>
                    </div>

                    {/* Health Profile Summary */}
                    <div className="bg-muted/10 p-4 rounded-lg border">
                      <h4 className="font-semibold mb-3 text-foreground">
                        Available Health Profile Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {userHealthProfile.primaryConcern && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Primary Concern:
                            </span>
                            <span className="ml-2 text-foreground">
                              {userHealthProfile.primaryConcern}
                            </span>
                          </div>
                        )}
                        {userHealthProfile.painIntensity !== undefined && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Pain Intensity:
                            </span>
                            <span className="ml-2 text-foreground">
                              {userHealthProfile.painIntensity}/10
                            </span>
                          </div>
                        )}
                        {userHealthProfile.priorTreatments && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Prior Treatments:
                            </span>
                            <span className="ml-2 text-foreground">
                              {userHealthProfile.priorTreatments}
                            </span>
                          </div>
                        )}
                        {userHealthProfile.additionalNotes && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-muted-foreground">
                              Additional Notes:
                            </span>
                            <p className="mt-1 text-foreground whitespace-pre-wrap">
                              {userHealthProfile.additionalNotes}
                            </p>
                          </div>
                        )}
                      </div>
                      {Object.keys(userHealthProfile).filter(
                        (key) =>
                          ![
                            "primaryConcern",
                            "painIntensity",
                            "priorTreatments",
                            "additionalNotes",
                            "questionnaireResponses",
                            "questionnaireMetadata",
                          ].includes(key)
                      ).length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <details className="text-sm">
                            <summary className="cursor-pointer font-medium text-primary hover:text-primary/80">
                              View additional health profile details
                            </summary>
                            <pre className="text-xs mt-2 whitespace-pre-wrap text-muted-foreground font-mono bg-background/50 p-3 rounded">
                              {JSON.stringify(userHealthProfile, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Completely empty health profile
                  <div className="text-center py-8">
                    <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      No Health Profile Data Available
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The user has not filled out any health profile information
                      or questionnaire responses yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Questionnaire Info Panel */}
              <div className="mt-6 p-4 bg-muted/10 rounded-lg border border-dashed">
                <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Questionnaire Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Status:
                    </span>
                    <span className="ml-2">{getQuestionnaireStatus()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Total Responses:
                    </span>
                    <span className="ml-2">{getResponseCount()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Completion Date:
                    </span>
                    <span className="ml-2">
                      {getQuestionnaireSummary().completedAt || "Not completed"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Therapist */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <User /> Therapist Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row
                label="Name"
                value={
                  booking.therapistId && typeof booking.therapistId === "object"
                    ? booking.therapistId.name ||
                      booking.therapistId._id ||
                      "N/A"
                    : booking.therapistId || "N/A"
                }
              />
              <Row
                label="Email"
                value={
                  booking.therapistId && typeof booking.therapistId === "object"
                    ? booking.therapistId.email || "N/A"
                    : booking.therapistId || "N/A"
                }
              />
            </CardContent>
          </Card> */}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <FileText /> Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeof booking.notes === "string"
                ? booking.notes
                : booking.notes && typeof booking.notes === "object"
                ? JSON.stringify(booking.notes)
                : "No notes"}
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Status */}

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <Package /> Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row
                label="Service Name"
                value={
                  typeof booking.serviceName === "string"
                    ? booking.serviceName
                    : booking.serviceName &&
                      typeof booking.serviceName === "object"
                    ? booking.serviceName.name || "N/A"
                    : "N/A"
                }
              />
              <Row
                label="Duration"
                value={
                  booking.serviceId && typeof booking.serviceId === "object"
                    ? booking.serviceId.duration || "N/A"
                    : "N/A"
                }
              />
              <Row
                label="Price"
                value={`₹${
                  booking.serviceId && typeof booking.serviceId === "object"
                    ? booking.serviceId.price || 0
                    : 0
                }`}
              />
              <Row
                label="Validity"
                value={`${
                  booking.serviceId && typeof booking.serviceId === "object"
                    ? booking.serviceId.validity || 0
                    : 0
                } days`}
              />
              <Row
                label="Expiry Date"
                value={
                  booking.serviceExpiryDate &&
                  typeof booking.serviceExpiryDate !== "object"
                    ? new Date(booking.serviceExpiryDate).toDateString()
                    : "N/A"
                }
              />
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <CreditCard /> Payment
                <Badge
                  className={getPaymentBadge(
                    typeof booking.paymentStatus === "string"
                      ? booking.paymentStatus
                      : ""
                  )}
                >
                  {typeof booking.paymentStatus === "string"
                    ? booking.paymentStatus
                    : "N/A"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row
                label="Amount"
                value={`₹${
                  typeof booking.amount === "number"
                    ? booking.amount
                    : typeof booking.amount === "object"
                    ? 0
                    : parseFloat(booking.amount) || 0
                }`}
              />
              <Row
                label="Paid On"
                value={
                  booking.purchaseDate &&
                  typeof booking.purchaseDate !== "object"
                    ? new Date(booking.purchaseDate).toLocaleString()
                    : "N/A"
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Info({ icon, label, children }: any) {
  return (
    <div className="flex gap-3">
      <div className="p-2 bg-primary/10 rounded">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{children}</p>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: any) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-sm" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
