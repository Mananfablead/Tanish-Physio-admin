import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthRedux } from "../hooks/useAuthRedux";
import { adminVideoCallApi as videoCallApi } from "../lib/videoCallApi";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { PlayIcon, DownloadIcon, EyeIcon, UsersIcon } from "lucide-react";

interface Recording {
  _id: string;
  recordingUrl?: string;
  recordingImages?: string[];
  recordingStartTime?: string;
  recordingEndTime?: string;
  recordingDuration?: number;
  recordingSize?: number;
  recordingFormat?: string;
  recordingStatus?: string;
  callStartedAt: string;
  callEndedAt?: string;
  duration?: number;
  status: string;
  participants: Array<{
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    role?: string;
    joinedAt?: string;
    leftAt?: string;
    duration?: number;
  }>;
  sessionId?: {
    _id: string;
    date: string;
    time: string;
  };
  groupSessionId?: {
    title: string;
  };
}

const AdminRecordedSessionsPage: React.FC = () => {
  const { user } = useAuthRedux();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    userId: "",
    sessionId: "",
  });

  // Force refresh function
  const forceRefresh = () => {
    console.log("🔄 Force refreshing recordings...");
    setCurrentPage(1);
    setFilters({
      dateFrom: "",
      dateTo: "",
      userId: "",
      sessionId: "",
    });
    // Add a small delay to ensure state updates
    setTimeout(() => {
      fetchRecordings();
    }, 100);
  };

  useEffect(() => {
    fetchRecordings();
  }, [currentPage, filters]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Fetching recordings with params:", {
        page: currentPage,
        limit: pageSize,
        filters,
      });

      const params = {
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.sessionId && { sessionId: filters.sessionId }),
      };

      const response = await videoCallApi.getAllRecordings(params);
      console.log("📥 API Response:", JSON.stringify(response, null, 2));

      const recordingsData = response.recordings || [];
      console.log("📋 Processed recordings count:", recordingsData.length);
      if (recordingsData.length > 0) {
        console.log(
          "📋 First recording data:",
          JSON.stringify(recordingsData[0], null, 2)
        );
        console.log(
          "📋 First participant:",
          recordingsData[0].participants?.[0]
        );
      }

      // Validate data structure
      if (recordingsData.length > 0) {
        const firstRecording = recordingsData[0];
        console.log("🔍 Data validation:");
        console.log("  - _id exists:", !!firstRecording._id);
        console.log("  - recordingUrl exists:", !!firstRecording.recordingUrl);
        console.log(
          "  - recordingStatus exists:",
          !!firstRecording.recordingStatus
        );
        console.log("  - participants exists:", !!firstRecording.participants);
        console.log(
          "  - participants count:",
          firstRecording.participants?.length
        );
        console.log(
          "  - callStartedAt exists:",
          !!firstRecording.callStartedAt
        );
        console.log("  - sessionId exists:", !!firstRecording.sessionId);
        console.log("  - sessionId details:", firstRecording.sessionId);
      }

      setRecordings(recordingsData);
      setTotalPages(response.pagination?.pages || 1);

      if (recordingsData.length === 0) {
        console.log("⚠️ No recordings found");
      }
    } catch (err) {
      console.error("❌ Error fetching recordings:", err);
      console.error("❌ Error details:", err.response?.data || err.message);
      setError("Failed to load recordings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handlePlayRecording = (recordingUrl: string) => {
    // Open the recording in a new tab/window
    window.open(recordingUrl, "_blank");
  };

  const handleDownloadRecording = (recordingUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = recordingUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      userId: "",
      sessionId: "",
    });
  };

  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Card key={index} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  // Debug rendering function
  const renderDebugInfo = () => {
    if (!loading && recordings.length === 0) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">🔍 Debug Info</h3>
          <div className="text-sm text-yellow-700">
            <div>State: Not Loading, No Recordings</div>
            <div>Current Page: {currentPage}</div>
            <div>Total Pages: {totalPages}</div>
            <div>Recordings Count: {recordings.length}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Loading recordings...
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Recorded Sessions Management
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage all recorded therapy sessions
        </p>
      </div>

      {/* Debug info */}
      {renderDebugInfo()}

      {/* Filters Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
                placeholder="Filter by user ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchRecordings} variant="outline" className="mt-3">
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-6">
        {loading ? (
          renderSkeletons()
        ) : recordings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No recorded sessions found</div>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              {Object.values(filters).some((f) => f)
                ? "No recorded therapy sessions match your current filters. Try adjusting your filters or check back later."
                : "There are currently no recorded sessions in the system. Recordings will appear here after video calls are completed."}
            </p>
            {/* Debug info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-2xl mx-auto">
              <h3 className="font-medium text-gray-900 mb-2">
                Debug Information:
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <strong>Current Page:</strong> {currentPage}
                </div>
                <div>
                  <strong>Total Pages:</strong> {totalPages}
                </div>
                <div>
                  <strong>Page Size:</strong> {pageSize}
                </div>
                <div>
                  <strong>Recordings in State:</strong> {recordings.length}
                </div>
                <div>
                  <strong>Loading:</strong> {loading ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Filters:</strong> {JSON.stringify(filters, null, 2)}
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={fetchRecordings}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Refresh Data
                  </button>
                  <button
                    onClick={forceRefresh}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Force Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          recordings.map((recording) => (
            <Card key={recording._id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <span className="text-lg">
                      {recording.sessionId
                        ? `Session on ${formatDate(
                            recording.sessionId.date +
                              "T" +
                              recording.sessionId.time
                          )}`
                        : recording.groupSessionId
                        ? recording.groupSessionId.title
                        : "Recorded Session"}
                    </span>
                    <div className="text-sm font-normal text-gray-500 mt-1">
                      Recorded on {formatDate(recording.callStartedAt)}
                      {recording.duration &&
                        ` • Duration: ${formatDuration(recording.duration)}`}
                      {recording.recordingDuration &&
                        ` • Recording: ${formatDuration(
                          recording.recordingDuration
                        )}`}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      (recording.recordingStatus || recording.status) ===
                      "completed"
                        ? "bg-green-100 text-green-800"
                        : (recording.recordingStatus || recording.status) ===
                          "recording"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {(recording.recordingStatus || recording.status)
                      .charAt(0)
                      .toUpperCase() +
                      (recording.recordingStatus || recording.status).slice(1)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    <span>Participants:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recording.participants.map((participant, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {participant.userId.name}
                        {participant.role && `(${participant.role})`}
                        {participant.duration &&
                          ` • ${formatDuration(participant.duration)}`}
                      </span>
                    ))}
                  </div>
                </div>

                {recording.recordingUrl && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Recording File
                        </h3>
                        <div className="text-sm text-gray-500 mt-1">
                          {recording.recordingFormat &&
                            `Format: ${recording.recordingFormat.toUpperCase()} • `}
                          {recording.recordingSize &&
                            `Size: ${formatFileSize(
                              recording.recordingSize
                            )} • `}
                          {recording.recordingDuration &&
                            `Duration: ${formatDuration(
                              recording.recordingDuration
                            )}`}
                          {recording.recordingStartTime &&
                            recording.recordingEndTime && (
                              <>
                                <br />
                                Started:{" "}
                                {formatDate(recording.recordingStartTime)} •
                                Ended: {formatDate(recording.recordingEndTime)}
                              </>
                            )}
                        </div>
                        {recording.recordingUrl && (
                          <div className="text-sm text-gray-500 mt-2">
                            <span className="font-medium">Recording URL:</span>
                            <a
                              href={recording.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline ml-2 break-all"
                            >
                              {recording.recordingUrl}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePlayRecording(recording.recordingUrl!)
                          }
                        >
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Play
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadRecording(
                              recording.recordingUrl!,
                              `recording-${recording._id}.${
                                recording.recordingFormat || "webm"
                              }`
                            )
                          }
                        >
                          <DownloadIcon className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {recording.recordingImages &&
                  recording.recordingImages.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Recording Images
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recording.recordingImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={imgUrl}
                              alt={`Recording snapshot ${idx + 1}`}
                              className="w-24 h-24 object-cover rounded-md border cursor-pointer"
                              onClick={() => handlePlayRecording(imgUrl)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <EyeIcon className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && recordings.length > 0 && totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminRecordedSessionsPage;
