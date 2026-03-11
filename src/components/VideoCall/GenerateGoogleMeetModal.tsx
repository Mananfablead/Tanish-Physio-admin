import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Video, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { tokenUtils } from "@/api/authAPI";

interface GenerateGoogleMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  sessionInfo?: {
    userName?: string;
    therapistName?: string;
    date?: string;
    time?: string;
    serviceName?: string;
  };
  onSuccess?: () => void;
}

const GenerateGoogleMeetModal = ({
  isOpen,
  onClose,
  sessionId,
  sessionInfo,
  onSuccess,
}: GenerateGoogleMeetModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  // new state for manual link entry
  const [manualLink, setManualLink] = useState("");
  const [manualCode, setManualCode] = useState("");

  const handleGenerateMeet = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session ID is required",
        variant: "destructive",
      });
      return;
    }

    const token = tokenUtils.getAdminToken();
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in as admin to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const body: any = { sessionId };
      // if manual link provided, include in body
      if (manualLink) {
        body.googleMeetLink = manualLink;
        if (manualCode) body.googleMeetCode = manualCode;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/video-call/generate-google-meet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (data.success) {
        // set the link either from manual or returned data
        setGeneratedLink(manualLink || data.data.googleMeetLink || data.data.meetLink);
        setGeneratedCode(manualCode || data.data.googleMeetCode || data.data.meetCode);
        if (data.data.googleMeetExpiresAt || data.data.expiresAt) {
          setExpiresAt(data.data.googleMeetExpiresAt || data.data.expiresAt);
        }

        toast({
          title: "Success",
          description: manualLink
            ? "Meeting link saved successfully!"
            : "Google Meet link generated successfully!",
          variant: "default",
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data.message || "Failed to generate Google Meet link");
      }
    } catch (error: any) {
      console.error("Error generating Google Meet link:", error);
      let errorMessage = error.message || "Failed to generate Google Meet link";

      // Handle specific authentication errors
      if (errorMessage.includes("Invalid or expired token")) {
        errorMessage = "Your session has expired. Please log in again.";
        // Optionally clear the token
        tokenUtils.removeAdminToken();
        // You might want to redirect to login page here
        // window.location.href = "/admin/login";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
      variant: "default",
    });
  };

  const resetForm = () => {
    setGeneratedLink("");
    setGeneratedCode("");
    setExpiresAt("");
    setManualLink("");
    setManualCode("");
  };
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-500" />
            Generate Google Meet Link
          </DialogTitle>
          <DialogDescription>
            Create a Google Meet link for this video session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info */}
          {sessionInfo && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <h4 className="font-medium text-sm">Session Details</h4>
              <p className="text-xs text-muted-foreground">
                {sessionInfo.userName} with {sessionInfo.therapistName}
              </p>
              <p className="text-xs text-muted-foreground">
                {sessionInfo.serviceName}
              </p>
              <p className="text-xs text-muted-foreground">
                {sessionInfo.date} at {sessionInfo.time}
              </p>
            </div>
          )}

          {/* Generated Link Display */}
          {generatedLink ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">
                    Google Meet Generated Successfully!
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-green-700">
                      Meeting Link
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={generatedLink}
                        readOnly
                        className="flex-1 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(generatedLink, "Meeting link")
                        }
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  {generatedCode && (
                    <div>
                      <Label className="text-xs font-medium text-green-700">
                        Meeting Code
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={generatedCode}
                          readOnly
                          className="flex-1 text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(generatedCode, "Meeting code")
                          }
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}

                  {expiresAt && (
                    <div className="text-xs text-green-700">
                      <span className="font-medium">Expires:</span>{" "}
                      {new Date(expiresAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Generate New Link
                </Button>
                <Button onClick={handleClose} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          ) : (
            /* Manual entry or generation form */
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800">
                      Provide a Meeting Link
                    </h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Paste an existing link below or leave blank to generate a
                      new Google Meet URL automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Meeting URL</Label>
                <Input
                  value={manualLink}
                  onChange={(e) => setManualLink(e.target.value)}
                  placeholder="https://meet.google.com/... or other meeting link"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to auto-generate a link via Google Calendar.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Meeting Code (optional)</Label>
                <Input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Optional code for the meeting"
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleGenerateMeet}
                  disabled={isLoading || !sessionId}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {manualLink ? "Saving..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      {manualLink ? "Save Link" : "Generate Google Meet Link"}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateGoogleMeetModal;
