import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertCircle, Video } from "lucide-react";
import { toast } from "../../hooks/use-toast";

const GoogleMeetErrorPopup = ({ isOpen, onClose, sessionId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Video Call Connection Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800">
                  Video Call Connection Issue
                </h4>
                <p className="text-yellow-700 text-sm mt-1">
                  We're unable to establish the video connection. Our team has
                  been notified and will provide an alternative Google Meet link
                  shortly.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} className="flex-1">
              <Video className="mr-2 h-4 w-4" />
              OK, I Understand
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleMeetErrorPopup;
