import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { tokenUtils } from "@/api/authAPI";

interface EditGoogleMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
  currentLink?: string;
  currentCode?: string;
  onSuccess?: () => void;
}

const EditGoogleMeetModal = ({
  isOpen,
  onClose,
  sessionId,
  currentLink = "",
  currentCode = "",
  onSuccess,
}: EditGoogleMeetModalProps) => {
  const [googleMeetLink, setGoogleMeetLink] = useState(currentLink);
  const [googleMeetCode, setGoogleMeetCode] = useState(currentCode);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes
  useState(() => {
    if (isOpen) {
      setGoogleMeetLink(currentLink);
      setGoogleMeetCode(currentCode);
    }
  });

  const handleUpdateMeet = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session ID is required",
        variant: "destructive",
      });
      return;
    }

    if (!googleMeetLink) {
      toast({
        title: "Error",
        description: "Google Meet link is required",
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
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/video-call/update-google-meet/${sessionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            googleMeetLink,
            googleMeetCode,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success!",
          description: "Google Meet/Zoom link updated successfully",
        });

        // Close modal and trigger success callback
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data.message || "Failed to update Google Meet link");
      }
    } catch (error: any) {
      console.error("Error updating Google Meet link:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update Google Meet link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setGoogleMeetLink(currentLink);
    setGoogleMeetCode(currentCode);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Edit Google Meet Link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="meetLink" className="text-sm font-medium">
              Google Meet Link *
            </Label>
            <Input
              id="meetLink"
              value={googleMeetLink}
              onChange={(e) => setGoogleMeetLink(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the new Google Meet link for this session
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetCode" className="text-sm font-medium">
              Meeting Code (optional)
            </Label>
            <Input
              id="meetCode"
              value={googleMeetCode}
              onChange={(e) => setGoogleMeetCode(e.target.value)}
              placeholder="XXX-XXXX-XXX"
              className="w-full font-mono"
            />
            <p className="text-xs text-muted-foreground">
              The meeting code (e.g., NYH-ZOR-QFX)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleUpdateMeet}
            disabled={isLoading || !googleMeetLink}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Update Google Meet Link
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoogleMeetModal;
