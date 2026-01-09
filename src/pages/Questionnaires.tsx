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
import apiClient, { API } from "@/api/apiClient";
import { useToast } from "@/hooks/use-toast";

type QuestionType = "text" | "mcq" | "slider";

interface Question {
  _id?: string;
  id: number;
  question: string;
  type: QuestionType;
  required: boolean;
  active: boolean;
  order: number;
  options?: string[];
}

interface Questionnaire {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Questionnaires() {
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);

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

  // Load questionnaire data on component mount
  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${API.QUESTIONNAIRES}/active`);

      if (response.data.success) {
        const questionnaire = response.data.data;
        setQuestionnaireId(questionnaire._id);
        // Update the questions to have proper IDs
        setQuestions(
          questionnaire.questions.map((q: any, index: number) => ({
            ...q,
            id: index + 1,
          }))
        );
      } else {
        // If no active questionnaire exists, create a default one
        const defaultQuestionnaire = {
          title: "Patient Intake Questionnaire",
          description: "Health intake questions for therapist matching",
          questions: [],
          isActive: true,
        };

        const createResponse = await apiClient.post(
          API.QUESTIONNAIRES,
          defaultQuestionnaire
        );
        if (createResponse.data.success) {
          setQuestionnaireId(createResponse.data.data._id);
          setQuestions([]);
        }
      }
    } catch (error) {
      console.error("Error loading questionnaire:", error);
      toast({
        title: "Error",
        description: "Failed to load questionnaire data",
        variant: "destructive",
      });

      // Create a default questionnaire if loading fails
      try {
        const defaultQuestionnaire = {
          title: "Patient Intake Questionnaire",
          description: "Health intake questions for therapist matching",
          questions: [],
          isActive: true,
        };

        const createResponse = await apiClient.post(
          API.QUESTIONNAIRES,
          defaultQuestionnaire
        );
        if (createResponse.data.success) {
          setQuestionnaireId(createResponse.data.data._id);
          setQuestions([]);
        }
      } catch (createError) {
        console.error("Error creating default questionnaire:", createError);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async () => {
    if (selectedQuestion) {
      const updatedQuestions = questions.filter(
        (q) => q.id !== selectedQuestion!.id
      );
      setQuestions(updatedQuestions);

      // Update the backend
      try {
        if (questionnaireId) {
          const response = await apiClient.put(
            `${API.QUESTIONNAIRE_BY_ID(questionnaireId)}/questions`,
            {
              questions: updatedQuestions,
            }
          );

          if (response.data.success) {
            toast({
              title: "Success",
              description: "Question deleted successfully",
            });
          }
        }
      } catch (error) {
        console.error("Error deleting question:", error);
        toast({
          title: "Error",
          description: "Failed to delete question",
          variant: "destructive",
        });
        // Revert the change if API call fails
        setQuestions(questions);
      }

      setIsEditModalOpen(false);
      setSelectedQuestion(null);
    }
  };

  const saveQuestion = async () => {
    if (!editForm.question.trim()) {
      return; // Basic validation
    }

    setSaving(true);
    try {
      if (selectedQuestion) {
        // Edit existing question
        const updatedQuestions = questions.map((q) =>
          q.id === selectedQuestion.id
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
        setQuestions(updatedQuestions);

        // Update the backend
        if (questionnaireId) {
          const response = await apiClient.put(
            `${API.QUESTIONNAIRE_BY_ID(questionnaireId)}/questions`,
            {
              questions: updatedQuestions,
            }
          );

          if (response.data.success) {
            toast({
              title: "Success",
              description: "Question updated successfully",
            });
          }
        }
      } else {
        // Add new question
        const newQuestion = {
          id: Math.max(...questions.map((q) => q.id), 0) + 1,
          question: editForm.question,
          type: editForm.type,
          required: editForm.required,
          active: true,
          order: Math.max(...questions.map((q) => q.order), 0) + 1,
          options:
            editForm.type === "mcq"
              ? editForm.options.filter((opt) => opt.trim())
              : undefined,
        };
        const updatedQuestions = [...questions, newQuestion];
        setQuestions(updatedQuestions);

        // Update the backend
        if (questionnaireId) {
          const response = await apiClient.put(
            `${API.QUESTIONNAIRE_BY_ID(questionnaireId)}/questions`,
            {
              questions: updatedQuestions,
            }
          );

          if (response.data.success) {
            toast({
              title: "Success",
              description: "Question added successfully",
            });
          }
        }
      }

      setIsEditModalOpen(false);
      setSelectedQuestion(null);
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Error",
        description: "Failed to save question",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleQuestion = async (id: number) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, active: !q.active } : q
    );
    setQuestions(updatedQuestions);

    // Update the backend
    try {
      if (questionnaireId) {
        const response = await apiClient.put(
          `${API.QUESTIONNAIRE_BY_ID(questionnaireId)}/questions`,
          {
            questions: updatedQuestions,
          }
        );

        if (response.data.success) {
          toast({
            title: "Success",
            description: "Question status updated successfully",
          });
        }
      }
    } catch (error) {
      console.error("Error updating question status:", error);
      toast({
        title: "Error",
        description: "Failed to update question status",
        variant: "destructive",
      });
      // Revert the change if API call fails
      setQuestions(questions);
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

    if (!draggedQuestion || draggedQuestion.id === targetQuestion.id) {
      return;
    }

    const draggedIndex = questions.findIndex(
      (q) => q.id === draggedQuestion.id
    );
    const targetIndex = questions.findIndex((q) => q.id === targetQuestion.id);

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

    // Save the updated order to backend
    try {
      if (questionnaireId) {
        const response = await apiClient.put(
          `${API.QUESTIONNAIRE_BY_ID(questionnaireId)}/questions`,
          {
            questions: updatedQuestions,
          }
        );

        if (response.data.success) {
          toast({
            title: "Success",
            description: "Question order updated successfully",
          });
        }
      }
    } catch (error) {
      console.error("Error updating question order:", error);
      toast({
        title: "Error",
        description: "Failed to update question order",
        variant: "destructive",
      });
      // Revert the change if API call fails
      setQuestions(questions);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Questionnaire Management</h1>
          <p className="page-subtitle">
            Manage health intake questions for therapist matching
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
