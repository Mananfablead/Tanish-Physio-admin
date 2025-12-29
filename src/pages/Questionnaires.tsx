import { useState } from "react";
import { Plus, Edit2, GripVertical, ToggleLeft, ToggleRight, Trash2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const mockQuestions = [
  { id: 1, question: "What is your primary concern or area of pain?", type: "text", required: true, active: true, order: 1 },
  { id: 2, question: "On a scale of 1-10, how would you rate your pain intensity?", type: "slider", required: true, active: true, order: 2 },
  { id: 3, question: "How long have you been experiencing this issue?", type: "mcq", options: ["Less than 1 week", "1-4 weeks", "1-3 months", "3+ months"], required: true, active: true, order: 3 },
  { id: 4, question: "Have you received any previous treatment for this condition?", type: "mcq", options: ["No", "Physical therapy", "Medication", "Surgery", "Other"], required: true, active: true, order: 4 },
  { id: 5, question: "Does the pain affect your daily activities?", type: "mcq", options: ["Not at all", "Slightly", "Moderately", "Severely"], required: true, active: true, order: 5 },
  { id: 6, question: "Do you have any allergies or medical conditions we should know about?", type: "text", required: false, active: true, order: 6 },
  { id: 7, question: "What are your goals for therapy?", type: "text", required: false, active: false, order: 7 },
];

type QuestionType = "text" | "mcq" | "slider";

export default function Questionnaires() {
  const [questions, setQuestions] = useState(mockQuestions);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<typeof mockQuestions[0] | null>(null);
  const [editForm, setEditForm] = useState({
    question: "",
    type: "text" as QuestionType,
    required: true,
    options: [""],
  });

  const openEditModal = (question?: typeof mockQuestions[0]) => {
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

  const toggleQuestion = (id: number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, active: !q.active } : q
    ));
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
          <p className="page-subtitle">Manage health intake questions for therapist matching</p>
        </div>
        <Button className="gap-2" onClick={() => openEditModal()}>
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">Purpose of Questionnaire</p>
          <p className="text-sm text-muted-foreground mt-1">
            These questions are shown to users during registration to collect health information. 
            This data helps match users with appropriate therapists and ensures quality intake.
          </p>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {questions.filter(q => q.active).length} of {questions.length} questions active
            </p>
            <p className="text-xs text-muted-foreground">Drag to reorder</p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {questions.sort((a, b) => a.order - b.order).map((question) => (
            <div
              key={question.id}
              className={cn(
                "p-4 flex items-start gap-4 transition-opacity animate-fade-in",
                !question.active && "opacity-50"
              )}
            >
              <button className="mt-1 cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="w-5 h-5" />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{question.question}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("status-badge", getTypeBadgeColor(question.type))}>
                        {getTypeLabel(question.type)}
                      </span>
                      {question.required && (
                        <span className="status-badge bg-destructive/15 text-destructive">Required</span>
                      )}
                    </div>
                    {question.type === "mcq" && question.options && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {question.options.map((opt, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-muted rounded">
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
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <button
                      onClick={() => toggleQuestion(question.id)}
                      className="p-1.5 rounded hover:bg-muted"
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

      {/* Edit/Create Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
            <DialogDescription>
              {selectedQuestion ? "Update the question details below." : "Create a new intake question."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label>Question Text</Label>
              <Input
                placeholder="Enter your question..."
                value={editForm.question}
                onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Question Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(value) => setEditForm({ ...editForm, type: value as QuestionType })}
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
                            const newOptions = editForm.options.filter((_, i) => i !== index);
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
                    onClick={() => setEditForm({ ...editForm, options: [...editForm.options, ""] })}
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
                <p className="text-xs text-muted-foreground">Users must answer this question</p>
              </div>
              <Switch
                checked={editForm.required}
                onCheckedChange={(checked) => setEditForm({ ...editForm, required: checked })}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>
              {selectedQuestion ? "Save Changes" : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
