import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  RefreshCw,
  UserX,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Activity,
  MessageSquare,
  ClipboardList,
  Star,
  MoreHorizontal,
  Clock,
  UserCog,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserById, updateUser } from "@/features/users/userSlice";
import PageLoader from "@/components/PageLoader";
import { toast } from "sonner";
import { fetchActiveQuestionnaire } from "@/features/questionnaires/questionnaireSlice";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
const [updating, setUpdating] = useState(false);

  const [isFullIntakeOpen, setIsFullIntakeOpen] = useState(false);
  const [isAssignSessionOpen, setIsAssignSessionOpen] = useState(false);

  const usersState = useSelector((state: any) => state.users);
  const { selectedUser: user, loading } = usersState;
  
  const questionnaireState = useSelector((state: any) => state.questionnaires);
  const { currentQuestionnaire: activeQuestionnaire } = questionnaireState;
  /* ============================
     FETCH USER
  ============================ */
  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
    // Fetch active questionnaire to get question structure
    dispatch(fetchActiveQuestionnaire() as any);
  }, [id, dispatch]);

  // Log for debugging
  useEffect(() => {
    if (questionnaireState.error) {
      console.log("Questionnaire fetch error:", questionnaireState.error);
    }
    if (activeQuestionnaire) {
      console.log("Active questionnaire loaded:", activeQuestionnaire);
    }
  }, [questionnaireState.error, activeQuestionnaire]);

  /* ============================
     STATUS UPDATE
  ============================ */
const toggleUserStatus = async () => {
  if (!user?._id) return;

  const newStatus = user.status === "active" ? "inactive" : "active";

  try {
    setUpdating(true);

    const result: any = await dispatch(
      updateUser({
        userId: user._id,
        userData: { status: newStatus },
      })
    );

    if (updateUser.fulfilled.match(result)) {
      toast.success(`User ${newStatus} successfully`);
    } else {
      toast.error(result.payload?.message || "Update failed");
    }
  } catch (err: any) {
    toast.error(err.message || "Something went wrong");
  } finally {
    setUpdating(false);
  }
};




  /* ============================
     ASSIGN SESSION FORM
  ============================ */
  const assignSessionSchema = z.object({
    date: z.date({ required_error: "Please select a date" }),
    time: z.string().min(1, "Please select a time"),
    staff: z.string().min(1, "Please select a staff member"),
  });

  const form = useForm({
    resolver: zodResolver(assignSessionSchema),
    defaultValues: {
      date: new Date(),
      time: "",
      staff: "",
    },
  });

  const onAssignSessionSubmit = (values) => {
    console.log("Assign session:", {
      ...values,
      userId: user?._id,
    });

    setIsAssignSessionOpen(false);
    form.reset();
  };

  /* ============================
     HELPERS
  ============================ */
  const getSubscriptionBadge = (subscription, isExpired) => {
    // Check if subscription is expired first
    if (isExpired) {
      return "bg-red-100 text-red-700";
    }
    
    switch (subscription?.toLowerCase()) {
      case "monthly":
      case "weekly":
      case "daily":
        return "bg-emerald-100 text-emerald-700";
      case "expired":
        return "bg-red-100 text-red-700"; // Changed to red for expired
      default:
        return "bg-zinc-100 text-zinc-600";
    }
  };

  // Parse questionnaire responses from different sources
  const getQuestionnaireResponses = () => {
    const responses = [];
    
    // 1. Check structured questionnaire responses first
    if (user?.healthProfile?.questionnaireResponses) {
      // Convert map/object to array format
      const respObj = user.healthProfile.questionnaireResponses;
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
    
    // 2. Check questionnaire metadata for detailed responses
    if (user?.healthProfile?.questionnaireMetadata?.responses) {
      user.healthProfile.questionnaireMetadata.responses.forEach((resp: any) => {
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
    
    // 3. Fallback to parsing additionalNotes for legacy data
    if (user?.healthProfile?.additionalNotes && responses.length === 0) {
      const lines = user.healthProfile.additionalNotes.split('\n');
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

  // Get response for a specific question
  const getQuestionResponse = (questionText) => {
    const responses = getQuestionnaireResponses();
    const response = responses.find(r => r.question === questionText);
    return response ? response.answer : null;
  };

  // Get all responses for display
  const getAllResponses = () => {
    return getQuestionnaireResponses();
  };

  // Get questionnaire completion info
  const getQuestionnaireInfo = () => {
    if (user?.healthProfile?.questionnaireMetadata) {
      return {
        completedAt: user.healthProfile.questionnaireMetadata.completedAt,
        questionnaireId: user.healthProfile.questionnaireMetadata.questionnaireId,
        totalQuestions: user.healthProfile.questionnaireMetadata.responses?.length || 0
      };
    }
    return null;
  };

  // Get response by question ID
  const getResponseByQuestionId = (questionId) => {
    const responses = getQuestionnaireResponses();
    return responses.find(r => r.questionId === questionId);
  };

  // Get response by question text
  const getResponseByQuestionText = (questionText) => {
    const responses = getQuestionnaireResponses();
    return responses.find(r => r.question === questionText);
  };

  // Get response count
  const getResponseCount = () => {
    return getQuestionnaireResponses().length;
  };

  // Check if user has completed questionnaire
  const hasCompletedQuestionnaire = () => {
    return getResponseCount() > 0 || 
           (user?.healthProfile?.questionnaireMetadata?.responses?.length > 0);
  };

  // Get questionnaire completion status
  const getQuestionnaireStatus = () => {
    if (hasCompletedQuestionnaire()) {
      const info = getQuestionnaireInfo();
      if (info) {
        return `Completed on ${new Date(info.completedAt).toLocaleDateString()}`;
      }
      return 'Completed';
    }
    return 'Not completed';
  };

  // Get question type badge
  const getQuestionTypeBadge = (questionType) => {
    const typeMap = {
      'text': 'bg-blue-100 text-blue-800',
      'mcq': 'bg-green-100 text-green-800',
      'slider': 'bg-purple-100 text-purple-800',
      'skalaeton': 'bg-orange-100 text-orange-800'
    };
    return typeMap[questionType] || 'bg-gray-100 text-gray-800';
  };

  // Get source badge
  const getSourceBadge = (source) => {
    const sourceMap = {
      'structured': 'bg-indigo-100 text-indigo-800',
      'metadata': 'bg-cyan-100 text-cyan-800',
      'legacy': 'bg-yellow-100 text-yellow-800'
    };
    return sourceMap[source] || 'bg-gray-100 text-gray-800';
  };

  // Get all questions from active questionnaire
  const getActiveQuestionnaireQuestions = () => {
    if (activeQuestionnaire && activeQuestionnaire.questions) {
      return activeQuestionnaire.questions
        .filter(q => q.active !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return [];
  };

  // Get user's answer for a specific question
  const getUserAnswerForQuestion = (question) => {
    // Try to find by question ID first
    let response = getResponseByQuestionId(question._id);
    if (response) return response;
    
    // Fallback to question text matching
    response = getResponseByQuestionText(question.question);
    return response;
  };

  // Get response status badge
  const getResponseStatusBadge = (hasResponse) => {
    return hasResponse 
      ? 'text-emerald-600 bg-emerald-100' 
      : 'text-destructive bg-destructive/10';
  };

  // Get response status text
  const getResponseStatusText = (hasResponse) => {
    return hasResponse ? 'Answered' : 'Not answered';
  };

  // Get response status indicator
  const getResponseStatusIndicator = (hasResponse) => {
    return hasResponse 
      ? 'bg-emerald-600' 
      : 'bg-destructive';
  };

  // Get formatted date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  // Get formatted datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  // Format answer based on question type
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

  // Get questionnaire summary
  const getQuestionnaireSummary = () => {
    const responses = getQuestionnaireResponses();
    const info = getQuestionnaireInfo();
    const totalQuestions = activeQuestionnaire?.questions?.length || 0;
    
    return {
      totalResponses: responses.length,
      totalQuestions,
      completionRate: totalQuestions > 0 
        ? Math.round((responses.length / totalQuestions) * 100) 
        : 0,
      status: getQuestionnaireStatus(),
      completedAt: info?.completedAt ? formatDate(info.completedAt) : null,
      hasData: responses.length > 0
    };
  };

  /* ============================
     LOADING STATES
  ============================ */
  // Show loading spinner while fetching user data
  if (loading || (id && !user)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Show user not found only when we have an ID but no user data after loading
  if (id && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 rounded-full bg-destructive/10">
          <UserX className="h-12 w-12 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">User not found</h2>
          <p className="text-muted-foreground">The requested user profile could not be found.</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/users")}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  /* ============================
     UI
  ============================ */
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-card rounded-xl border p-4 md:p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/users")}
            className="rounded-full h-10 w-10 flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl md:text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-1 -right-1 md:bottom-2 md:right-2 w-4 h-4 md:w-6 md:h-6 rounded-full border-2 md:border-4 border-white ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-extrabold truncate">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-muted-foreground text-sm md:text-base truncate">{user.email}</span>
                </div>
              </div>
              <span
                className={cn(
                  "px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap mt-2 sm:mt-0",
                  user.status === "active"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                )}
              >
                {user.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5 text-sm">
                <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="truncate">{user.phone}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="truncate">Joined {user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end md:justify-start">
          <Button
            onClick={toggleUserStatus}
            disabled={updating}
            variant={user.status === "active" ? "destructive" : "default"}
            className="w-full md:w-auto min-w-[140px] md:min-w-[160px]"
          >
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : user.status === "active" ? (
              "Deactivate User"
            ) : (
              "Activate User"
            )}
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          {/* ACCOUNT OVERVIEW CARD */}
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Account Overview</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <span
                    className={cn(
                      "inline-block px-3 py-1 rounded-full text-xs font-bold",
                      getSubscriptionBadge(user.subscriptionInfo?.status || user.subscription, user.subscriptionInfo?.isExpired)
                    )}
                  >
                    {user.subscriptionInfo?.planName || user.subscription}
                  </span>
                  {user.subscriptionInfo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: {user.subscriptionInfo.isExpired ? 'Expired' : user.subscriptionInfo.status} | Ends: {new Date(user.subscriptionInfo.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SERVICES USED CARD */}
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Star className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-lg font-bold">Services Used</h3>
            </div>
            
            {user.servicesUsed && user.servicesUsed.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {user.servicesUsed.map((service, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{service.serviceName}</h4>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                        {new Date(service.bookingDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No services used yet</p>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          {/* <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => setIsAssignSessionOpen(true)}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Assign Session
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsFullIntakeOpen(true)}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              View Full Intake
            </Button>
          </div> */}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          {/* HEALTH PROFILE SECTION */}
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            {/* <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold">Health Profile</h3>
            </div> */}
{/*             
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-5 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Primary Concern</h4>
                <p className="font-medium">{user.healthProfile?.primaryConcern || "Not specified"}</p>
              </div>
              
              <div className="p-5 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-center">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Pain Level</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {user.healthProfile?.painIntensity || 0}<span className="text-lg text-muted-foreground">/10</span>
                </div>
              </div>
              
              <div className="p-5 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Prior Treatments</h4>
                <p className="font-medium">{user.healthProfile?.priorTreatments || "None recorded"}</p>
              </div>
            </div> */}
            
            {/* Questionnaire Responses Section */}
            <div className=" ">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <ClipboardList className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold">Health Profile</h3>
                {hasCompletedQuestionnaire() && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({getResponseCount()} responses)
                  </span>
                )}
              </div>
              
              {/* Questionnaire Summary */}
              {hasCompletedQuestionnaire() && (
                <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{getResponseCount()}</div>
                      <div className="text-sm text-muted-foreground">Responses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{getQuestionnaireSummary().completionRate}%</div>
                      <div className="text-sm text-muted-foreground">Completion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{getQuestionnaireSummary().status}</div>
                      <div className="text-xs text-muted-foreground">Status</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{getQuestionnaireSummary().completedAt || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Questionnaire Responses Display */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {activeQuestionnaire && activeQuestionnaire.questions && activeQuestionnaire.questions.length > 0 ? (
                  // Show structured questions with responses
                  getActiveQuestionnaireQuestions().map((question, index) => {
                    const userResponse = getUserAnswerForQuestion(question);
                    const hasResponse = !!userResponse;
                    
                    return (
                      <div 
                        key={question._id || index} 
                        className="p-4 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-sm font-semibold text-primary">
                                Q{index + 1}:
                              </span>
                              <h4 className="font-medium text-foreground">
                                {question.question}
                                {question.required && (
                                  <span className="text-destructive ml-1">*</span>
                                )}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${getQuestionTypeBadge(question.type)}`}>
                                {question.type}
                              </span>
                              {userResponse && (
                                <span className={`text-xs px-2 py-1 rounded-full ${getSourceBadge(userResponse.source || 'structured')}`}>
                                  {userResponse.source || 'response'}
                                </span>
                              )}
                            </div>
                            
                            <div className="ml-6 space-y-1">
                              <p className="text-muted-foreground">
                                <span className="font-medium">Answer:</span>{' '}
                                <span className="font-medium text-foreground">
                                  {hasResponse 
                                    ? formatAnswer(userResponse.answer, question.type || userResponse.questionType)
                                    : 'Not answered'
                                  }
                                </span>
                              </p>
                              {userResponse?.timestamp && (
                                <p className="text-xs text-muted-foreground">
                                  Answered: {formatDateTime(userResponse.timestamp)}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${getResponseStatusBadge(hasResponse)}`}>
                              <div className={`w-2 h-2 rounded-full ${getResponseStatusIndicator(hasResponse)}`}></div>
                              {getResponseStatusText(hasResponse)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Show raw responses when no questionnaire structure
                  getAllResponses().length > 0 ? (
                    getAllResponses().map((response, index) => (
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
                                <span className={`text-xs px-2 py-1 rounded-full ${getQuestionTypeBadge(response.questionType || 'text')}`}>
                                  {response.questionType || 'text'}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full ${getSourceBadge(response.source || 'unknown')}`}>
                                {response.source || 'unknown'}
                              </span>
                            </div>
                            
                            <div className="ml-6">
                              <p className="text-muted-foreground">
                                <span className="font-medium">Answer:</span>{' '}
                                <span className="font-medium text-foreground">
                                  {response.answer}
                                </span>
                              </p>
                              {response.timestamp && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Answered: {formatDateTime(response.timestamp)}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-sm text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                              <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                              Answered
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // No responses found
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="font-medium mb-1">No questionnaire responses found</p>
                      <p className="text-sm">This user hasn't completed the questionnaire yet.</p>
                    </div>
                  )
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
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <span className="ml-2">{getQuestionnaireStatus()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Total Responses:</span>
                    <span className="ml-2">{getResponseCount()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Questionnaire ID:</span>
                    <span className="ml-2 font-mono text-xs">{getQuestionnaireInfo()?.questionnaireId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Completion Date:</span>
                    <span className="ml-2">{getQuestionnaireInfo()?.completedAt ? formatDateTime(getQuestionnaireInfo()?.completedAt) : 'Not completed'}</span>
                  </div>
                </div>
              </div>
            </div>
              
            {/* Backward Compatibility: Show raw notes if present */}
            {/* {user?.healthProfile?.additionalNotes && user?.healthProfile?.additionalNotes.trim() && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Additional Notes (Legacy Format)
                </h4>
                <div className="bg-muted/10 p-4 rounded-lg border">
                  <pre className="text-sm whitespace-pre-wrap text-muted-foreground font-mono">
                    {user.healthProfile.additionalNotes}
                  </pre>
                </div>
              </div>
            )} */}
          </div>


          
          {/* SUBSCRIPTION DETAILS SECTION */}
          {user.subscriptionInfo && (
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold">Subscription Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Plan Name</h4>
                  <p className="font-medium">{user.subscriptionInfo.planName}</p>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Status</h4>
                  <p className="font-medium">
                    <span className={user.subscriptionInfo.isExpired ? 'text-red-600' : 'text-emerald-600'}>
                      {user.subscriptionInfo.isExpired ? 'Expired' : user.subscriptionInfo.status}
                    </span>
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Start Date</h4>
                  <p className="font-medium">{new Date(user.subscriptionInfo.startDate).toLocaleDateString()}</p>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">End Date</h4>
                  <p className="font-medium">{new Date(user.subscriptionInfo.endDate).toLocaleDateString()}</p>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/30 md:col-span-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Amount</h4>
                  <p className="font-medium">₹{user.subscriptionInfo.amount}</p>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/30 md:col-span-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Plan ID</h4>
                  <p className="font-medium">{user.subscriptionInfo.planId}</p>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/30 md:col-span-2">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Expiration Status</h4>
                  <p className="font-medium">
                    {user.subscriptionInfo.isExpired ? (
                      <span className="text-red-600">Expired</span>
                    ) : user.subscriptionInfo.daysUntilExpiry > 7 ? (
                      <span className="text-emerald-600">Active ({user.subscriptionInfo.daysUntilExpiry} days remaining)</span>
                    ) : user.subscriptionInfo.daysUntilExpiry > 0 ? (
                      <span className="text-yellow-600">Expiring Soon ({user.subscriptionInfo.daysUntilExpiry} days left)</span>
                    ) : (
                      <span className="text-red-600">Expired</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* ADDITIONAL SECTIONS CAN BE ADDED HERE */}
          <div className="bg-card rounded-xl border p-6 shadow-sm text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
            <p className="text-muted-foreground">More user details and history will appear here</p>
          </div>
        </div>
      </div>

      {/* ASSIGN SESSION DIALOG */}
      <Dialog open={isAssignSessionOpen} onOpenChange={setIsAssignSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Session</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onAssignSessionSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="staff"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr-johnson">
                          Dr. Sarah Johnson
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Assign Session
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
