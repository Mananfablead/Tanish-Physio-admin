import { useState } from "react";
import { Search, AlertTriangle, Flag, Ban, Eye, ChevronLeft, ChevronRight, MessageSquare, User, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const mockChats = [
  { 
    id: 1, 
    user: "John Doe", 
    therapist: "Dr. Sarah Johnson", 
    lastMessage: "Thank you for the session! The exercises are really helping.",
    time: "2 min ago",
    messageCount: 24,
    flagged: false,
    session: "2024-03-18"
  },
  { 
    id: 2, 
    user: "Emily Parker", 
    therapist: "Dr. Michael Chen", 
    lastMessage: "When should I do the stretches - morning or evening?",
    time: "15 min ago",
    messageCount: 18,
    flagged: false,
    session: "2024-03-18"
  },
  { 
    id: 3, 
    user: "Mike Wilson", 
    therapist: "Dr. Lisa Williams", 
    lastMessage: "This is completely unacceptable! I demand a refund!",
    time: "32 min ago",
    messageCount: 45,
    flagged: true,
    session: "2024-03-17"
  },
  { 
    id: 4, 
    user: "Anna Smith", 
    therapist: "Dr. James Brown", 
    lastMessage: "Perfect, I'll see you next week then.",
    time: "1 hour ago",
    messageCount: 12,
    flagged: false,
    session: "2024-03-17"
  },
  { 
    id: 5, 
    user: "Robert Brown", 
    therapist: "Dr. Sarah Johnson", 
    lastMessage: "Can we discuss my payment issues here?",
    time: "2 hours ago",
    messageCount: 8,
    flagged: true,
    session: "2024-03-16"
  },
];

const mockMessages = [
  { id: 1, sender: "user", text: "Hi Dr. Johnson, I've been following the exercises you recommended.", time: "10:00 AM" },
  { id: 2, sender: "therapist", text: "That's great to hear, John! How are you feeling?", time: "10:02 AM" },
  { id: 3, sender: "user", text: "Much better actually. The lower back pain has reduced significantly.", time: "10:03 AM" },
  { id: 4, sender: "therapist", text: "Excellent progress! Let's continue with the same routine and add a few more stretches next session.", time: "10:05 AM" },
  { id: 5, sender: "user", text: "Sounds good! Should I increase the repetitions?", time: "10:06 AM" },
  { id: 6, sender: "therapist", text: "Yes, try doing 15 reps instead of 10, but stop if you feel any discomfort.", time: "10:08 AM" },
  { id: 7, sender: "user", text: "Thank you for the session! The exercises are really helping.", time: "10:10 AM" },
];

export default function ChatMonitor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [selectedChat, setSelectedChat] = useState<typeof mockChats[0] | null>(null);
  const [isChatViewOpen, setIsChatViewOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  const filteredChats = mockChats.filter((chat) => {
    const matchesSearch =
      chat.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.therapist.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showFlaggedOnly) return matchesSearch && chat.flagged;
    return matchesSearch;
  });

  const flaggedCount = mockChats.filter(c => c.flagged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Chat Monitor</h1>
        <p className="page-subtitle">Monitor communications between users and therapists</p>
      </div>

      {/* Stats & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="stat-card py-3 px-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-semibold">{mockChats.length}</span>
              <span className="text-sm text-muted-foreground">Active Chats</span>
            </div>
          </div>
          {flaggedCount > 0 && (
            <div className="stat-card py-3 px-4 border-warning/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="font-semibold text-warning">{flaggedCount}</span>
                <span className="text-sm text-muted-foreground">Flagged</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <button
            onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
            className={cn(
              "filter-button",
              showFlaggedOnly && "filter-button-active"
            )}
          >
            <Flag className="w-4 h-4 mr-1" />
            Flagged Only
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
        <div className="divide-y divide-border">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "p-4 hover:bg-muted/30 transition-colors cursor-pointer",
                chat.flagged && "bg-warning/5"
              )}
              onClick={() => {
                setSelectedChat(chat);
                setIsChatViewOpen(true);
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    {chat.flagged && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-2.5 h-2.5 text-warning-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{chat.user}</p>
                      <span className="text-muted-foreground">↔</span>
                      <p className="text-muted-foreground">{chat.therapist}</p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">{chat.lastMessage}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{chat.messageCount} messages</span>
                      <span>•</span>
                      <span>Session: {chat.session}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{chat.time}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChat(chat);
                      setIsChatViewOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{filteredChats.length}</span> chats
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="min-w-[32px]">1</Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat View Modal */}
      <Dialog open={isChatViewOpen} onOpenChange={setIsChatViewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Chat Conversation
              {selectedChat?.flagged && (
                <span className="status-badge status-pending">Flagged</span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedChat && (
            <>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{selectedChat.user}</span>
                  </div>
                  <span className="text-muted-foreground">↔</span>
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-primary" />
                    <span className="font-medium">{selectedChat.therapist}</span>
                  </div>
                </div>
                <span className="text-muted-foreground">Session: {selectedChat.session}</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 py-4 min-h-[300px]">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender === "user" ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg px-4 py-2",
                        message.sender === "user"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        message.sender === "user" ? "text-muted-foreground" : "text-primary-foreground/70"
                      )}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setIsChatViewOpen(false);
                    setIsFlagModalOpen(true);
                  }}
                >
                  <Flag className="w-4 h-4" />
                  {selectedChat.flagged ? "Update Flag" : "Flag Chat"}
                </Button>
                <Button variant="destructive" className="gap-2">
                  <Ban className="w-4 h-4" />
                  Disable Chat Access
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Flag Modal */}
      <Dialog open={isFlagModalOpen} onOpenChange={setIsFlagModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Flag Chat for Review</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Reason for Flagging</label>
              <Textarea
                placeholder="Describe the issue or violation..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsFlagModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsFlagModalOpen(false)}>
              Submit Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
