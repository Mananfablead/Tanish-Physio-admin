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

  const handleGenerateMeet = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/video-call/generate-google-meet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({
            sessionId: sessionId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setGeneratedLink(data.data.meetLink);
        setGeneratedCode(data.data.meetCode);
        setExpiresAt(data.data.expiresAt);

        toast({
          title: "Success",
          description: "Google Meet link generated successfully!",
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
      toast({
        title: "Error",
        description: error.message || "Failed to generate Google Meet link",
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
            /* Generate Form */
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800">
                      Ready to Generate
                    </h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Click the button below to generate a Google Meet link for
                      this session.
                    </p>
                  </div>
                </div>
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
                      Generating...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Generate Google Meet Link
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
