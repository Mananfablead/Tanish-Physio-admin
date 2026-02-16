import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  GripVertical,
  ToggleLeft,
  ToggleRight,
  Trash2,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchQuestionnaires,
  fetchActiveQuestionnaire,
  updateQuestionnaire,
  createQuestionnaire,
  deleteQuestionnaire,
  activateQuestionnaire,
  addQuestionToQuestionnaire,
} from "@/features/questionnaires/questionnaireSlice";
import PageLoader from "@/components/PageLoader";

type QuestionType = "text" | "mcq" | "slider" | "upload";

interface Question {
  _id?: string;
  id?: number | string;
  question: string;
  type: QuestionType;
  required: boolean;
  active: boolean;
  order: number;
  options?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Questionnaire {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function Questionnaires() {
  const dispatch = useDispatch();

  // Get questionnaire state from Redux
  const { questionnaires, currentQuestionnaire, loading, error } = useSelector(
    (state: any) => state.questionnaires
  );

  // Use the active questionnaire's questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [draggedQuestion, setDraggedQuestion] = useState<Question | null>(null);
  const [editForm, setEditForm] = useState({
    question: "",
    type: "text" as QuestionType,
    required: true,
    options: [""],
  });
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Load questionnaires on component mount
  useEffect(() => {
    dispatch(fetchQuestionnaires() as any);
    dispatch(fetchActiveQuestionnaire() as any);
  }, [dispatch]);

  // Ensure we're always using the active questionnaire
  useEffect(() => {
    if (!currentQuestionnaire) {
      // If no active questionnaire loaded, try to get it
      dispatch(fetchActiveQuestionnaire() as any);
    }
  }, [dispatch, currentQuestionnaire]);

  // Helper function to assign consistent IDs for UI operations
  const assignQuestionIds = (questionsList: Question[]): Question[] => {
    return questionsList.map((q, index) => ({
      ...q,
      id: q.id ?? (index + 1).toString(),
    }));
  };

  // Update local questions state when Redux state changes
  // Only use questions from the active questionnaire
  useEffect(() => {
    if (currentQuestionnaire && currentQuestionnaire.questions) {
      // Use questions from the active questionnaire only
      const activeQuestions = [...currentQuestionnaire.questions].map((q, index) => ({
        ...q,
        id: q._id || `temp-${index}`
      }));
      
      // Sort by order
      const sortedQuestions = activeQuestions.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return 0;
      });
      
      setQuestions(sortedQuestions);
    } else {
      // If no active questionnaire, use empty array
      setQuestions([]);
    }
  }, [currentQuestionnaire]);

  const openEditModal = (question?: Question) => {
    if (question) {
      setSelectedQuestion(question);
      setEditForm({
        question: question.question,
        type: question.type as QuestionType,
        required: question.required,
        options: question.options || [""],
      });
    } else {
      setSelectedQuestion(null);
      setEditForm({
        question: "",
        type: "text",
        required: true,
        options: [""],
      });
    }
    setIsEditModalOpen(true);
  };

  const deleteQuestion = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!currentQuestionnaire || !currentQuestionnaire._id) {
      console.error("No active questionnaire to update");
      setIsEditModalOpen(false);
      setSelectedQuestion(null);
      setIsDeleteDialogOpen(false);
      return;
    }
    
    if (selectedQuestion && selectedQuestion._id) {
      try {
        // Remove the question from the active questionnaire
        const updatedQuestions = currentQuestionnaire.questions.filter(
          (q: Question) => q._id !== selectedQuestion._id
        );
        
        const updatedQuestionnaire = {
          ...currentQuestionnaire,
          questions: updatedQuestions
        };
        
        await dispatch(
          updateQuestionnaire({
            id: currentQuestionnaire._id,
            data: updatedQuestionnaire
          }) as any
        );
        
        setIsEditModalOpen(false);
        setSelectedQuestion(null);
        setIsDeleteDialogOpen(false);
        
        // The questions state will be updated via the useEffect hook
      } catch (error) {
        console.error("Error removing question:", error);
        setIsDeleteDialogOpen(false);
      }
    } else {
      // If no questionnaire exists, just close the modal
      setIsEditModalOpen(false);
      setSelectedQuestion(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const cancelDeleteQuestion = () => {
    setIsDeleteDialogOpen(false);
  };

  const saveQuestion = async () => {
    if (!editForm.question.trim()) {
      return; // Basic validation
    }

    if (selectedQuestion) {
      // Edit existing question - update the entire questionnaire
      if (!currentQuestionnaire || !currentQuestionnaire._id) {
        console.error("No active questionnaire to update");
        return;
      }
      
      let updatedQuestions = currentQuestionnaire.questions.map((q: Question) =>
        q._id === selectedQuestion._id
          ? {
              ...q,
              question: editForm.question,
              type: editForm.type,
              required: editForm.required,
              options:
                editForm.type === "mcq"
                  ? editForm.options.filter((opt) => opt.trim())
                  : [],
            }
          : q
      );

      // Update the questions in the backend
      try {
        const updatedQuestionnaire = {
          ...currentQuestionnaire,
          questions: updatedQuestions
        };
        
        await dispatch(
          updateQuestionnaire({
            id: currentQuestionnaire._id,
            data: updatedQuestionnaire
          }) as any
        );
        
        setIsEditModalOpen(false);
        setSelectedQuestion(null);
      } catch (error) {
        console.error("Error saving question:", error);
      }
    } else {
      // Add new question to the active questionnaire
      const newQuestion = {
        question: editForm.question,
        type: editForm.type,
        required: editForm.required,
        active: true,
        order: Math.max(...(currentQuestionnaire?.questions || []).map((q: Question) => q.order || 0), 0) + 1,
        options:
          editForm.type === "mcq"
            ? editForm.options.filter((opt) => opt.trim())
            : [],
      };

      // Add the new question to the active questionnaire
      try {
        if (!currentQuestionnaire || !currentQuestionnaire._id) {
          // If no active questionnaire exists, create a new one
          const newQuestionnaireData = {
            title: "Patient Intake Questionnaire",
            description: "Health intake questions for therapist matching",
            questions: [newQuestion],
            isActive: true,
          };
          
          await dispatch(createQuestionnaire(newQuestionnaireData) as any);
        } else {
          const updatedQuestions = [...currentQuestionnaire.questions, newQuestion];
          const updatedQuestionnaire = {
            ...currentQuestionnaire,
            questions: updatedQuestions
          };
          
          await dispatch(
            updateQuestionnaire({
              id: currentQuestionnaire._id,
              data: updatedQuestionnaire
            }) as any
          );
        }
        
        setIsEditModalOpen(false);
        setSelectedQuestion(null);
      } catch (error) {
        console.error("Error adding question:", error);
      }
    }
  };

  const toggleQuestion = async (id: number | string) => {
    // Find the question to toggle in the active questionnaire
    if (!currentQuestionnaire || !currentQuestionnaire._id) {
      console.error("No active questionnaire to update");
      return;
    }
    
    const questionToToggle = currentQuestionnaire.questions.find((q: Question) => q._id === id);
    if (!questionToToggle) return;
    
    // Update only the specific question's active status
    const updatedQuestions = currentQuestionnaire.questions.map((question: Question) => 
      question._id === questionToToggle._id 
        ? { ...question, active: !question.active }
        : question
    );

    try {
      // Update the active questionnaire
      const updatedQuestionnaire = {
        ...currentQuestionnaire,
        questions: updatedQuestions
      };
      
      await dispatch(
        updateQuestionnaire({
          id: currentQuestionnaire._id,
          data: updatedQuestionnaire
        }) as any
      );
    } catch (error) {
      console.error("Error toggling question:", error);
    }
  };

  const handleDragStart = (question: Question) => {
    setDraggedQuestion(question);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetQuestion: Question) => {
    e.preventDefault();

    if (
      !draggedQuestion ||
      draggedQuestion._id === targetQuestion._id
    ) {
      return;
    }

    if (!currentQuestionnaire || !currentQuestionnaire._id) {
      console.error("No active questionnaire to update");
      return;
    }

    // Update the order of questions in the active questionnaire
    const questionsCopy = [...currentQuestionnaire.questions];
    
    // Find indices in the current questionnaire's questions array
    const draggedIndex = questionsCopy.findIndex(
      (q) => q._id === draggedQuestion._id
    );
    const targetIndex = questionsCopy.findIndex(
      (q) => q._id === targetQuestion._id
    );

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Move the question to the new position
    const [movedQuestion] = questionsCopy.splice(draggedIndex, 1);
    questionsCopy.splice(targetIndex, 0, movedQuestion);

    // Update order property
    const updatedQuestions = questionsCopy.map((q, index) => ({
      ...q,
      order: index + 1,
    }));

    setDraggedQuestion(null);

    try {
      const updatedQuestionnaire = {
        ...currentQuestionnaire,
        questions: updatedQuestions
      };
      
      await dispatch(
        updateQuestionnaire({
          id: currentQuestionnaire._id,
          data: updatedQuestionnaire
        }) as any
      );
    } catch (error) {
      console.error("Error reordering questions:", error);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Free Text";
      case "mcq":
        return "Multiple Choice";
      case "slider":
        return "Slider";
      case "upload":
        return "File Upload";
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-info/15 text-info";
      case "mcq":
        return "bg-success/15 text-success";
      case "upload":
        return "bg-purple/15 text-purple";
      case "slider":
        return "bg-warning/15 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  if (loading) {
    return <PageLoader text="Loading..." />;
  }
  return (
    <div className="space-y-6">
     

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Questionnaire Management</h1>
          <p className="page-subtitle">
            Manage all health intake questions for therapist matching
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => openEditModal()}
          disabled={loading || saving}
        >
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && (
        <>
          {/* Info Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Purpose of Questionnaire</p>
              <p className="text-sm text-muted-foreground mt-1">
                These questions are shown to users during registration to
                collect health information. This data helps match users with
                appropriate therapists and ensures quality intake.
              </p>
            </div>
          </div>
          
          {/* Questions List */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {questions.filter((q) => q.active).length} of {questions.length} questions active
                </p>
                <p className="text-xs text-muted-foreground">Drag to reorder</p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {questions
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((question) => (
                  <div
                    key={question.id}
                    draggable
                    onDragStart={() => handleDragStart(question)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, question)}
                    className={cn(
                      "p-4 flex items-start gap-4 transition-opacity animate-fade-in cursor-move",
                      !question.active && "opacity-50",
                      draggedQuestion?.id === question.id && "opacity-50"
                    )}
                  >
                    <button
                      className="mt-1 cursor-grab text-muted-foreground hover:text-foreground"
                      disabled={saving}
                    >
                      <GripVertical className="w-5 h-5" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium">{question.question}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={cn(
                                "status-badge",
                                getTypeBadgeColor(question.type)
                              )}
                            >
                              {getTypeLabel(question.type)}
                            </span>
                            {question.required && (
                              <span className="status-badge bg-destructive/15 text-destructive">
                                Required
                              </span>
                            )}
                          </div>
                          {question.type === "mcq" && question.options && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {question.options.map((opt, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-muted rounded"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(question)}
                            disabled={saving}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <button
                            onClick={() => toggleQuestion(question.id)}
                            className="p-1.5 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={saving}
                          >
                            {question.active ? (
                              <ToggleRight className="w-6 h-6 text-success" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {/* Edit/Create Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedQuestion ? "Edit Question" : "Add New Question"}
            </DialogTitle>
            <DialogDescription>
              {selectedQuestion
                ? "Update the question details below."
                : "Create a new intake question."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="space-y-4 py-2">
              <div>
                <Label>Question Text</Label>
                <Input
                  placeholder="Enter your question..."
                  value={editForm.question}
                  onChange={(e) =>
                    setEditForm({ ...editForm, question: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Question Type</Label>
                <Select
                  value={editForm.type}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, type: value as QuestionType })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upload">File Upload</SelectItem>
                    <SelectItem value="text">Free Text</SelectItem>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="slider">Slider (1-10)</SelectItem>
                    <SelectItem value="skalaeton">Skalaeton</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editForm.type === "mcq" && (
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2 mt-1">
                    {editForm.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...editForm.options];
                            newOptions[index] = e.target.value;
                            setEditForm({ ...editForm, options: newOptions });
                          }}
                        />
                        {editForm.options.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive flex-shrink-0"
                            onClick={() => {
                              const newOptions = editForm.options.filter(
                                (_, i) => i !== index
                              );
                              setEditForm({ ...editForm, options: newOptions });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          options: [...editForm.options, ""],
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Required</Label>
                  <p className="text-xs text-muted-foreground">
                    Users must answer this question
                  </p>
                </div>
                <Switch
                  checked={editForm.required}
                  onCheckedChange={(checked) =>
                    setEditForm({ ...editForm, required: checked })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 border-t">
            {selectedQuestion && (
              <Button
                variant="destructive"
                onClick={deleteQuestion}
                disabled={saving}
              >
                Delete Question
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={saveQuestion}
                disabled={!editForm.question.trim() || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {selectedQuestion ? "Saving..." : "Adding..."}
                  </>
                ) : selectedQuestion ? (
                  "Save Changes"
                ) : (
                  "Add Question"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question from the questionnaire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteQuestion}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteQuestion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
