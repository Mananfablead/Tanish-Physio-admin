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

type QuestionType = "text" | "mcq" | "slider";

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
  const { questionnaires, loading, error } = useSelector(
    (state: any) => state.questionnaires
  );

  // Use the first (active) questionnaire's questions or fallback to an empty array
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

  // Load questionnaires on component mount
  useEffect(() => {
    dispatch(fetchQuestionnaires() as any);
    dispatch(fetchActiveQuestionnaire() as any);
  }, [dispatch]);

  // Helper function to assign consistent IDs for UI operations
  const assignQuestionIds = (questionsList: Question[]): Question[] => {
    return questionsList.map((q, index) => ({
      ...q,
      id: q.id ?? (index + 1).toString(),
    }));
  };

  // Update local questions state when Redux state changes
  // Aggregate questions from ALL questionnaires (regardless of active status)
  useEffect(() => {
    if (questionnaires && questionnaires.length > 0) {
      // Get all questions from all questionnaires
      const allQuestions: Question[] = [];
      
      questionnaires
        .forEach((questionnaire: Questionnaire) => {
          questionnaire.questions.forEach((question, index) => {
            allQuestions.push({
              ...question,
              // Ensure each question has a unique ID across all questionnaires
              id: `${questionnaire._id}-${question._id || index}`
            });
          });
        });
      
      // Sort by creation time or order
      const sortedQuestions = allQuestions.sort((a, b) => {
        // Try to sort by order first, then by creation time
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // Fallback to createdAt if available (using type assertion)
        const aCreatedAt = (a as any).createdAt;
        const bCreatedAt = (b as any).createdAt;
        if (aCreatedAt && bCreatedAt) {
          return new Date(bCreatedAt).getTime() - new Date(aCreatedAt).getTime();
        }
        return 0;
      });
      
      const questionsWithIds = assignQuestionIds(sortedQuestions);
      setQuestions(questionsWithIds);
    }
  }, [questionnaires]);

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

  const deleteQuestion = async () => {
    if (selectedQuestion && selectedQuestion._id) {
      // Find the active questionnaire to delete
      const activeQuestionnaire =
        questionnaires.find((q: Questionnaire) => q.isActive) ||
        questionnaires[0];

      if (activeQuestionnaire && activeQuestionnaire._id) {
        try {
          // Delete the entire questionnaire as per API contract
          await dispatch(
            deleteQuestionnaire(activeQuestionnaire._id) as any
          );
          setIsEditModalOpen(false);
          setSelectedQuestion(null);
          
          // Clear questions state
          setQuestions([]);
        } catch (error) {
          console.error("Error deleting questionnaire:", error);
        }
      } else {
        // If no questionnaire exists, just close the modal
        setIsEditModalOpen(false);
        setSelectedQuestion(null);
      }
    }
  };

  const saveQuestion = async () => {
    if (!editForm.question.trim()) {
      return; // Basic validation
    }

    if (selectedQuestion) {
      // Edit existing question - update the entire questionnaire
      let updatedQuestions = questions.map((q) =>
        String(q.id) === String(selectedQuestion.id)
          ? {
              ...q,
              question: editForm.question,
              type: editForm.type,
              required: editForm.required,
              options:
                editForm.type === "mcq"
                  ? editForm.options.filter((opt) => opt.trim())
                  : undefined,
            }
          : q
      );

      // Find the active questionnaire to update
      const activeQuestionnaire =
        questionnaires.find((q: Questionnaire) => q.isActive) ||
        questionnaires[0];

      if (activeQuestionnaire) {
        // Update the questions in the backend
        try {
          await dispatch(
            updateQuestionnaire({
              id: activeQuestionnaire._id,
              data: {
                ...activeQuestionnaire,
                questions: updatedQuestions
              }
            }) as any
          );
          setQuestions(updatedQuestions);
          setIsEditModalOpen(false);
          setSelectedQuestion(null);
        } catch (error) {
          console.error("Error saving question:", error);
        }
      } else {
        // If no questionnaire exists, create a new one
        try {
          const newQuestionnaireData = {
            title: "Patient Intake Questionnaire",
            description: "Health intake questions for therapist matching",
            questions: updatedQuestions,
            isActive: true,
          };
          await dispatch(createQuestionnaire(newQuestionnaireData) as any);
          setQuestions(updatedQuestions);
          setIsEditModalOpen(false);
          setSelectedQuestion(null);
        } catch (error) {
          console.error("Error creating questionnaire:", error);
        }
      }
    } else {
      // Add new question - immediately call API to add the question
      const newQuestion = {
        question: editForm.question,
        type: editForm.type,
        required: editForm.required,
        active: true,
        order: Math.max(...questions.map((q) => q.order || 0), 0) + 1,
        options:
          editForm.type === "mcq"
            ? editForm.options.filter((opt) => opt.trim())
            : undefined,
      };

      // Find the active questionnaire to add the question to
      const activeQuestionnaire =
        questionnaires.find((q: Questionnaire) => q.isActive) ||
        questionnaires[0];

      // Always create a new questionnaire with POST call for adding questions
      try {
        const result = await dispatch(
          addQuestionToQuestionnaire({
            question: newQuestion,
          }) as any
        );

        // Refresh all questionnaires to get the latest data including the new one
        await dispatch(fetchQuestionnaires() as any);
        await dispatch(fetchActiveQuestionnaire() as any);
        
        setIsEditModalOpen(false);
        setSelectedQuestion(null);
      } catch (error) {
        console.error("Error adding question:", error);
      }
    }
  };

  const toggleQuestion = async (id: number | string) => {
    // Find the question to toggle
    const questionToToggle = questions.find(q => String(q.id) === String(id));
    if (!questionToToggle) return;

    // Extract questionnaire ID from the composite ID (format: questionnaireId-questionId)
    const questionnaireId = String(id).split('-')[0];
    
    // Find the specific questionnaire that contains this question
    const targetQuestionnaire = questionnaires.find(q => q._id === questionnaireId);
    
    if (targetQuestionnaire && targetQuestionnaire._id) {
      // Update only the specific question's active status
      const updatedQuestions = targetQuestionnaire.questions.map(question => 
        question._id === questionToToggle._id 
          ? { ...question, active: !question.active }
          : question
      );

      try {
        // Update the specific questionnaire
        await dispatch(
          updateQuestionnaire({
            id: targetQuestionnaire._id,
            data: {
              ...targetQuestionnaire,
              questions: updatedQuestions
            }
          }) as any
        );
        
        // Refresh the data to get updated state
        await dispatch(fetchQuestionnaires() as any);
      } catch (error) {
        console.error("Error toggling question:", error);
      }
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
      String(draggedQuestion.id) === String(targetQuestion.id)
    ) {
      return;
    }

    const draggedIndex = questions.findIndex(
      (q) => String(q.id) === String(draggedQuestion.id)
    );
    const targetIndex = questions.findIndex(
      (q) => String(q.id) === String(targetQuestion.id)
    );

    const newQuestions = [...questions];
    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, draggedQuestion);

    // Update order
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index + 1,
    }));

    setQuestions(updatedQuestions);
    setDraggedQuestion(null);

    // Find the active questionnaire to update
    const activeQuestionnaire =
      questionnaires.find((q: Questionnaire) => q.isActive) ||
      questionnaires[0];

    if (activeQuestionnaire && activeQuestionnaire._id) {
      try {
        await dispatch(
          updateQuestionnaire({
            id: activeQuestionnaire._id,
            data: {
              ...activeQuestionnaire,
              questions: updatedQuestions
            }
          }) as any
        );
      } catch (error) {
        console.error("Error reordering questions:", error);
      }
    } else {
      // If no questionnaire exists, create a new one
      try {
        const newQuestionnaireData = {
          title: "Patient Intake Questionnaire",
          description: "Health intake questions for therapist matching",
          questions: updatedQuestions,
          isActive: true,
        };
        await dispatch(createQuestionnaire(newQuestionnaireData) as any);
      } catch (error) {
        console.error("Error creating questionnaire:", error);
      }
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
      case "slider":
        return "bg-warning/15 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading and Error Indicators */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-sm text-blue-700">Loading questionnaires...</p>
        </div>
      )}

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
                  {questions.filter((q) => q.active).length} of{" "}
                  {questions.length} questions active
                </p>
                <p className="text-xs text-muted-foreground">Drag to reorder</p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {questions
                .sort((a, b) => a.order - b.order)
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
        <DialogContent className="max-w-lg">
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

          <div className="space-y-4 mt-4">
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
                          className="text-destructive"
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

          <DialogFooter className="mt-4">
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
    </div>
  );
}
