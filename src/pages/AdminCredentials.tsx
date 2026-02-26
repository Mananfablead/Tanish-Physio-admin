// Admin Credentials Management Page
// Manage external service credentials: WhatsApp, Email, Razorpay

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Key, Trash2, Plus, Check, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import apiClient from "@/api/apiClient";

interface Credential {
  _id: string;
  credentialType: "whatsapp" | "email" | "razorpay";
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WhatsAppCredential extends Credential {
  whatsappAccessToken?: string;
  whatsappPhoneNumberId?: string;
  whatsappBusinessId?: string;
}

interface EmailCredential extends Credential {
  emailHost?: string;
  emailPort?: number;
  emailUser?: string;
  emailUsername?: string;
  emailPassword?: string;
  emailEncryption?: string;
  adminEmail?: string;
}

interface RazorpayCredential extends Credential {
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
}

export default function AdminCredentials() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector((state: any) => state.auth);

  const [activeTab, setActiveTab] = useState("whatsapp");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form states
  const [whatsappForm, setWhatsappForm] = useState({
    name: "",
    description: "",
    whatsappAccessToken: "",
    whatsappPhoneNumberId: "",
    whatsappBusinessId: "",
  });

  const [emailForm, setEmailForm] = useState({
    name: "",
    description: "",
    emailHost: "",
    emailPort: 587,
    emailUser: "",
    emailUsername: "",
    emailPassword: "",
    emailEncryption: "",
    adminEmail: "",
  });

  const [razorpayForm, setRazorpayForm] = useState({
    name: "",
    description: "",
    razorpayKeyId: "",
    razorpayKeySecret: "",
  });

  // Check authentication and populate existing credentials
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }
    loadCredentials();
  }, [isAuthenticated, token, navigate]);

  // Populate form with existing credential when changing tabs
  useEffect(() => {
    // Only populate if not currently editing
    if (!editingId) {
      const loadAndDecryptCredential = async () => {
        if (activeTab === "whatsapp") {
          const existingWhatsapp = getCredentialsByType("whatsapp");
          if (existingWhatsapp.length > 0) {
            try {
              const resp = await apiClient.get(
                `/credentials/${existingWhatsapp[0]._id}`
              );
              const credential = resp.data?.data || resp.data || resp;
              setWhatsappForm({
                name: credential.name || existingWhatsapp[0].name || "",
                description:
                  credential.description ||
                  existingWhatsapp[0].description ||
                  "",
                whatsappAccessToken:
                  credential.whatsappAccessToken ||
                  credential.accessToken ||
                  credential.token ||
                  "",
                whatsappPhoneNumberId:
                  credential.whatsappPhoneNumberId ||
                  credential.phoneNumberId ||
                  "",
                whatsappBusinessId:
                  credential.whatsappBusinessId || credential.businessId || "",
              });
            } catch (error) {
              console.error(
                "Failed to load decrypted WhatsApp credential:",
                error
              );
              // Fallback to existing data
              const credential = existingWhatsapp[0] as WhatsAppCredential;
              setWhatsappForm({
                name: credential.name || "",
                description: credential.description || "",
                whatsappAccessToken: credential.whatsappAccessToken || "",
                whatsappPhoneNumberId: credential.whatsappPhoneNumberId || "",
                whatsappBusinessId: credential.whatsappBusinessId || "",
              });
            }
          }
        } else if (activeTab === "email") {
          const existingEmail = getCredentialsByType("email");
          if (existingEmail.length > 0) {
            try {
              const resp = await apiClient.get(
                `/credentials/${existingEmail[0]._id}`
              );
              const credential = resp.data?.data || resp.data || resp;
              setEmailForm({
                name: credential.name || existingEmail[0].name || "",
                description:
                  credential.description || existingEmail[0].description || "",
                emailHost: credential.emailHost || credential.host || "",
                emailPort:
                  typeof credential.emailPort !== "undefined"
                    ? credential.emailPort
                    : typeof credential.port !== "undefined"
                    ? credential.port
                    : 587,
                emailUser:
                  credential.emailUser ||
                  credential.user ||
                  credential.username ||
                  "",
                emailUsername:
                  credential.emailUsername || credential.username || "",
                emailPassword:
                  credential.emailPassword || credential.password || "",
                emailEncryption:
                  credential.emailEncryption || credential.encryption || "",
                adminEmail:
                  credential.adminEmail ||
                  credential.adminEmailAddress ||
                  credential.adminEmail ||
                  "",
              });
            } catch (error) {
              console.error(
                "Failed to load decrypted Email credential:",
                error
              );
              // Fallback to existing data
              const credential = existingEmail[0] as EmailCredential;
              setEmailForm({
                name: credential.name || "",
                description: credential.description || "",
                emailHost: credential.emailHost || "",
                emailPort: credential.emailPort || 587,
                emailUser: credential.emailUser || "",
                emailUsername: credential.emailUsername || "",
                emailPassword: credential.emailPassword || "",
                emailEncryption: credential.emailEncryption || "",
                adminEmail: credential.adminEmail || "",
              });
            }
          }
        } else if (activeTab === "razorpay") {
          const existingRazorpay = getCredentialsByType("razorpay");
          if (existingRazorpay.length > 0) {
            try {
              const resp = await apiClient.get(
                `/credentials/${existingRazorpay[0]._id}`
              );
              const credential = resp.data?.data || resp.data || resp;
              setRazorpayForm({
                name: credential.name || existingRazorpay[0].name || "",
                description:
                  credential.description ||
                  existingRazorpay[0].description ||
                  "",
                razorpayKeyId:
                  credential.razorpayKeyId ||
                  credential.keyId ||
                  credential.key ||
                  "",
                razorpayKeySecret:
                  credential.razorpayKeySecret ||
                  credential.keySecret ||
                  credential.secret ||
                  "",
              });
            } catch (error) {
              console.error(
                "Failed to load decrypted Razorpay credential:",
                error
              );
              // Fallback to existing data
              const credential = existingRazorpay[0] as RazorpayCredential;
              setRazorpayForm({
                name: credential.name || "",
                description: credential.description || "",
                razorpayKeyId: credential.razorpayKeyId || "",
                razorpayKeySecret: credential.razorpayKeySecret || "",
              });
            }
          }
        }
      };

      loadAndDecryptCredential();
    }
  }, [activeTab, credentials, editingId]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/credentials");
      setCredentials(response.data.data || []);
    } catch (error) {
      console.error("Failed to load credentials:", error);
      setErrorMessage("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (type: "whatsapp" | "email" | "razorpay") => {
    if (type === "whatsapp") {
      setWhatsappForm({
        name: "",
        description: "",
        whatsappAccessToken: "",
        whatsappPhoneNumberId: "",
        whatsappBusinessId: "",
      });
    } else if (type === "email") {
      setEmailForm({
        name: "",
        description: "",
        emailHost: "",
        emailPort: 587,
        emailUser: "",
        emailUsername: "",
        emailPassword: "",
        emailEncryption: "",
        adminEmail: "",
      });
    } else if (type === "razorpay") {
      setRazorpayForm({
        name: "",
        description: "",
        razorpayKeyId: "",
        razorpayKeySecret: "",
      });
    }
  };

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappForm.name.trim()) {
      setErrorMessage("Please enter a name for the credential");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        credentialType: "whatsapp",
        ...whatsappForm,
      };

      // Check if there's already an existing credential
      const existingWhatsapp = getCredentialsByType("whatsapp");

      if (editingId) {
        // Update existing credential
        await apiClient.put(`/credentials/${editingId}`, payload);
        setSuccessMessage("WhatsApp credential updated successfully");
      } else if (existingWhatsapp.length > 0) {
        // Update the existing credential
        await apiClient.put(`/credentials/${existingWhatsapp[0]._id}`, payload);
        setSuccessMessage("WhatsApp credential updated successfully");
      } else {
        // Create new credential
        await apiClient.post("/credentials", payload);
        setSuccessMessage("WhatsApp credential created successfully");
      }

      setEditingId(null);
      resetForm("whatsapp");
      loadCredentials();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to save credential"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.name.trim()) {
      setErrorMessage("Please enter a name for the credential");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        credentialType: "email",
        ...emailForm,
      };

      // Check if there's already an existing credential
      const existingEmail = getCredentialsByType("email");

      if (editingId) {
        // Update existing credential
        await apiClient.put(`/credentials/${editingId}`, payload);
        setSuccessMessage("Email credential updated successfully");
      } else if (existingEmail.length > 0) {
        // Update the existing credential
        await apiClient.put(`/credentials/${existingEmail[0]._id}`, payload);
        setSuccessMessage("Email credential updated successfully");
      } else {
        // Create new credential
        await apiClient.post("/credentials", payload);
        setSuccessMessage("Email credential created successfully");
      }

      setEditingId(null);
      resetForm("email");
      loadCredentials();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to save credential"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!razorpayForm.name.trim()) {
      setErrorMessage("Please enter a name for the credential");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        credentialType: "razorpay",
        ...razorpayForm,
      };

      // Check if there's already an existing credential
      const existingRazorpay = getCredentialsByType("razorpay");

      if (editingId) {
        // Update existing credential
        await apiClient.put(`/credentials/${editingId}`, payload);
        setSuccessMessage("Razorpay credential updated successfully");
      } else if (existingRazorpay.length > 0) {
        // Update the existing credential
        await apiClient.put(`/credentials/${existingRazorpay[0]._id}`, payload);
        setSuccessMessage("Razorpay credential updated successfully");
      } else {
        // Create new credential
        await apiClient.post("/credentials", payload);
        setSuccessMessage("Razorpay credential created successfully");
      }

      setEditingId(null);
      resetForm("razorpay");
      loadCredentials();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to save credential"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (credential: Credential) => {
    // When editing, fetch the single credential (expecting decrypted fields)
    // then populate the appropriate form and switch tab.
    setEditingId(credential._id);
    setActiveTab(credential.credentialType);

    try {
      setLoading(true);
      // Attempt to fetch full/decrypted credential from API.
      // Backend should return decrypted sensitive fields for editing.
      const resp = await apiClient.get(`/credentials/${credential._id}`);
      const full: any = resp.data?.data || resp.data || resp;

      if (credential.credentialType === "whatsapp") {
        const wc: any = full;
        setWhatsappForm({
          name: wc.name || credential.name || "",
          description: wc.description || credential.description || "",
          whatsappAccessToken:
            wc.whatsappAccessToken || wc.accessToken || wc.token || "",
          whatsappPhoneNumberId:
            wc.whatsappPhoneNumberId || wc.phoneNumberId || "",
          whatsappBusinessId: wc.whatsappBusinessId || wc.businessId || "",
        });
      } else if (credential.credentialType === "email") {
        const ec: any = full;
        setEmailForm({
          name: ec.name || credential.name || "",
          description: ec.description || credential.description || "",
          emailHost: ec.emailHost || ec.host || "",
          emailPort:
            typeof ec.emailPort !== "undefined"
              ? ec.emailPort
              : typeof ec.port !== "undefined"
              ? ec.port
              : 587,
          emailUser: ec.emailUser || ec.user || ec.username || "",
          emailUsername: ec.emailUsername || ec.username || "",
          emailPassword: ec.emailPassword || ec.password || "",
          emailEncryption: ec.emailEncryption || ec.encryption || "",
          adminEmail:
            ec.adminEmail || ec.adminEmailAddress || ec.adminEmail || "",
        });
      } else if (credential.credentialType === "razorpay") {
        const rc: any = full;
        setRazorpayForm({
          name: rc.name || credential.name || "",
          description: rc.description || credential.description || "",
          razorpayKeyId: rc.razorpayKeyId || rc.keyId || rc.key || "",
          razorpayKeySecret:
            rc.razorpayKeySecret || rc.keySecret || rc.secret || "",
        });
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch credential details for editing"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this credential?")) return;

    try {
      setLoading(true);
      await apiClient.delete(`/credentials/${id}`);
      setSuccessMessage("Credential deleted successfully");
      loadCredentials();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to delete credential"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      await apiClient.patch(`/credentials/${id}/toggle-status`, {
        isActive: !currentStatus,
      });
      loadCredentials();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to update status"
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const getCredentialsByType = (type: "whatsapp" | "email" | "razorpay") => {
    return credentials.filter((c) => c.credentialType === type);
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to manage credentials
          </p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Credentials Management</h1>
          <p className="text-muted-foreground">
            Manage WhatsApp, Email, and Razorpay credentials securely
          </p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {errorMessage}
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
          </TabsList>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add/Edit WhatsApp Credential</CardTitle>
                <CardDescription>
                  Configure your WhatsApp Business API credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveWhatsApp} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="wa-name">Credential Name *</Label>
                      <Input
                        id="wa-name"
                        placeholder="e.g., WhatsApp Production"
                        value={whatsappForm.name}
                        onChange={(e) =>
                          setWhatsappForm({
                            ...whatsappForm,
                            name: e.target.value,
                          })
                        }
                        required
                        disabled={
                          !editingId &&
                          getCredentialsByType("whatsapp").length > 0
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wa-desc">Description</Label>
                      <Input
                        id="wa-desc"
                        placeholder="Optional description"
                        value={whatsappForm.description}
                        onChange={(e) =>
                          setWhatsappForm({
                            ...whatsappForm,
                            description: e.target.value,
                          })
                        }
                        disabled={
                          !editingId &&
                          getCredentialsByType("whatsapp").length > 0
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="wa-token">Access Token *</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="wa-token"
                          type={showPasswords["wa-token"] ? "text" : "password"}
                          placeholder="EAAx..."
                          value={whatsappForm.whatsappAccessToken}
                          onChange={(e) =>
                            setWhatsappForm({
                              ...whatsappForm,
                              whatsappAccessToken: e.target.value,
                            })
                          }
                          required
                          disabled={
                            !editingId &&
                            getCredentialsByType("whatsapp").length > 0
                          }
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("wa-token")}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          disabled={
                            !editingId &&
                            getCredentialsByType("whatsapp").length > 0
                          }
                        >
                          {showPasswords["wa-token"] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="wa-phone">Phone Number ID *</Label>
                      <Input
                        id="wa-phone"
                        placeholder="e.g., 848317898376074"
                        value={whatsappForm.whatsappPhoneNumberId}
                        onChange={(e) =>
                          setWhatsappForm({
                            ...whatsappForm,
                            whatsappPhoneNumberId: e.target.value,
                          })
                        }
                        required
                        disabled={
                          !editingId &&
                          getCredentialsByType("whatsapp").length > 0
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wa-business">Business ID *</Label>
                      <Input
                        id="wa-business"
                        placeholder="e.g., 4135992726716468"
                        value={whatsappForm.whatsappBusinessId}
                        onChange={(e) =>
                          setWhatsappForm({
                            ...whatsappForm,
                            whatsappBusinessId: e.target.value,
                          })
                        }
                        required
                        disabled={
                          !editingId &&
                          getCredentialsByType("whatsapp").length > 0
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4">
                    {!editingId &&
                    getCredentialsByType("whatsapp").length > 0 ? (
                      <Button
                        type="button"
                        onClick={() => {
                          const existingWhatsapp =
                            getCredentialsByType("whatsapp");
                          if (existingWhatsapp.length > 0) {
                            setEditingId(existingWhatsapp[0]._id);
                            handleEdit(existingWhatsapp[0]);
                          }
                        }}
                      >
                        Enable Editing
                      </Button>
                    ) : (
                      <Button type="submit" disabled={loading}>
                        {loading
                          ? "Saving..."
                          : editingId
                          ? "Update Credential"
                          : "Add Credential"}
                      </Button>
                    )}
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          // Reset form to existing credential values
                          const existingWhatsapp =
                            getCredentialsByType("whatsapp");
                          if (existingWhatsapp.length > 0) {
                            const loadAndDecryptCredential = async () => {
                              try {
                                const resp = await apiClient.get(
                                  `/credentials/${existingWhatsapp[0]._id}`
                                );
                                const credential =
                                  resp.data?.data || resp.data || resp;
                                setWhatsappForm({
                                  name:
                                    credential.name ||
                                    existingWhatsapp[0].name ||
                                    "",
                                  description:
                                    credential.description ||
                                    existingWhatsapp[0].description ||
                                    "",
                                  whatsappAccessToken:
                                    credential.whatsappAccessToken ||
                                    credential.accessToken ||
                                    credential.token ||
                                    "",
                                  whatsappPhoneNumberId:
                                    credential.whatsappPhoneNumberId ||
                                    credential.phoneNumberId ||
                                    "",
                                  whatsappBusinessId:
                                    credential.whatsappBusinessId ||
                                    credential.businessId ||
                                    "",
                                });
                              } catch (error) {
                                console.error(
                                  "Failed to load decrypted WhatsApp credential:",
                                  error
                                );
                                // Fallback to existing data
                                const credential =
                                  existingWhatsapp[0] as WhatsAppCredential;
                                setWhatsappForm({
                                  name: credential.name || "",
                                  description: credential.description || "",
                                  whatsappAccessToken:
                                    credential.whatsappAccessToken || "",
                                  whatsappPhoneNumberId:
                                    credential.whatsappPhoneNumberId || "",
                                  whatsappBusinessId:
                                    credential.whatsappBusinessId || "",
                                });
                              }
                            };
                            loadAndDecryptCredential();
                          } else {
                            resetForm("whatsapp");
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    {getCredentialsByType("whatsapp").length > 0 && (
                      <Button
                        type="button"
                        variant={
                          getCredentialsByType("whatsapp")[0].isActive
                            ? "destructive"
                            : "default"
                        }
                        onClick={() => {
                          const whatsappCred = getCredentialsByType("whatsapp")[0];
                          handleToggleStatus(whatsappCred._id, whatsappCred.isActive);
                        }}
                      >
                        {getCredentialsByType("whatsapp")[0].isActive
                          ? "Disable WhatsApp"
                          : "Enable WhatsApp"}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* WhatsApp Credentials List */}
            {/* <div className="space-y-4">
              <h3 className="text-lg font-semibold">Saved Credentials</h3>
              {getCredentialsByType("whatsapp").length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No WhatsApp credentials saved yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getCredentialsByType("whatsapp").map((cred) => (
                  <Card key={cred._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{cred.name}</h4>
                            {cred.isActive && (
                              <Badge variant="default">Active</Badge>
                            )}
                            {!cred.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          {cred.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {cred.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Last updated:{" "}
                            {new Date(cred.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(cred)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={cred.isActive ? "default" : "outline"}
                            onClick={() =>
                              handleToggleStatus(cred._id, cred.isActive)
                            }
                          >
                            {cred.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(cred._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div> */}
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add/Edit Email Credential</CardTitle>
                <CardDescription>
                  Configure your SMTP email settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveEmail} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email-name">Credential Name *</Label>
                      <Input
                        id="email-name"
                        placeholder="e.g., Gmail Account"
                        value={emailForm.name}
                        onChange={(e) =>
                          setEmailForm({ ...emailForm, name: e.target.value })
                        }
                        required
                        disabled={
                          !editingId && getCredentialsByType("email").length > 0
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-desc">Description</Label>
                      <Input
                        id="email-desc"
                        placeholder="Optional description"
                        value={emailForm.description}
                        onChange={(e) =>
                          setEmailForm({
                            ...emailForm,
                            description: e.target.value,
                          })
                        }
                        disabled={
                          !editingId && getCredentialsByType("email").length > 0
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email-host">SMTP Host *</Label>
                      <Input
                        id="email-host"
                        placeholder="e.g., smtp.gmail.com"
                        value={emailForm.emailHost}
                        onChange={(e) =>
                          setEmailForm({
                            ...emailForm,
                            emailHost: e.target.value,
                          })
                        }
                        required
                        disabled={
                          !editingId && getCredentialsByType("email").length > 0
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-port">SMTP Port *</Label>
                      <Input
                        id="email-port"
                        type="number"
                        placeholder="587"
                        value={emailForm.emailPort}
                        onChange={(e) =>
                          setEmailForm({
                            ...emailForm,
                            emailPort: parseInt(e.target.value),
                          })
                        }
                        required
                        disabled={
                          !editingId && getCredentialsByType("email").length > 0
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-user">Email Address *</Label>
                    <Input
                      id="email-user"
                      type="email"
                      placeholder="your-email@gmail.com"
                      value={emailForm.emailUser}
                      onChange={(e) =>
                        setEmailForm({
                          ...emailForm,
                          emailUser: e.target.value,
                        })
                      }
                      required
                      disabled={
                        !editingId && getCredentialsByType("email").length > 0
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-username">Username</Label>
                    <Input
                      id="email-username"
                      placeholder="SMTP username (if different from email)"
                      value={emailForm.emailUsername}
                      onChange={(e) =>
                        setEmailForm({
                          ...emailForm,
                          emailUsername: e.target.value,
                        })
                      }
                      disabled={
                        !editingId && getCredentialsByType("email").length > 0
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-password">
                      Password/App Password *
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="email-password"
                          type={
                            showPasswords["email-password"]
                              ? "text"
                              : "password"
                          }
                          placeholder="Your app password or email password"
                          value={emailForm.emailPassword}
                          onChange={(e) =>
                            setEmailForm({
                              ...emailForm,
                              emailPassword: e.target.value,
                            })
                          }
                          required
                          disabled={
                            !editingId &&
                            getCredentialsByType("email").length > 0
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility("email-password")
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          disabled={
                            !editingId &&
                            getCredentialsByType("email").length > 0
                          }
                        >
                          {showPasswords["email-password"] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-encryption">Encryption</Label>
                    <select
                      id="email-encryption"
                      value={emailForm.emailEncryption}
                      onChange={(e) =>
                        setEmailForm({
                          ...emailForm,
                          emailEncryption: e.target.value,
                        })
                      }
                      disabled={
                        !editingId && getCredentialsByType("email").length > 0
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Encryption Type</option>
                      <option value="TLS">TLS</option>
                      <option value="SSL">SSL</option>
                      <option value="STARTTLS">STARTTLS</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email *</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin email for notifications"
                      value={emailForm.adminEmail}
                      onChange={(e) =>
                        setEmailForm({
                          ...emailForm,
                          adminEmail: e.target.value,
                        })
                      }
                      required
                      disabled={
                        !editingId && getCredentialsByType("email").length > 0
                      }
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    {!editingId && getCredentialsByType("email").length > 0 ? (
                      <Button
                        type="button"
                        onClick={() => {
                          const existingEmail = getCredentialsByType("email");
                          if (existingEmail.length > 0) {
                            setEditingId(existingEmail[0]._id);
                            handleEdit(existingEmail[0]);
                          }
                        }}
                      >
                        Enable Editing
                      </Button>
                    ) : (
                      <Button type="submit" disabled={loading}>
                        {loading
                          ? "Saving..."
                          : editingId
                          ? "Update Credential"
                          : "Add Credential"}
                      </Button>
                    )}
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          // Reset form to existing credential values
                          const existingEmail = getCredentialsByType("email");
                          if (existingEmail.length > 0) {
                            const loadAndDecryptCredential = async () => {
                              try {
                                const resp = await apiClient.get(
                                  `/credentials/${existingEmail[0]._id}`
                                );
                                const credential =
                                  resp.data?.data || resp.data || resp;
                                setEmailForm({
                                  name:
                                    credential.name ||
                                    existingEmail[0].name ||
                                    "",
                                  description:
                                    credential.description ||
                                    existingEmail[0].description ||
                                    "",
                                  emailHost:
                                    credential.emailHost ||
                                    credential.host ||
                                    "",
                                  emailPort:
                                    typeof credential.emailPort !== "undefined"
                                      ? credential.emailPort
                                      : typeof credential.port !== "undefined"
                                      ? credential.port
                                      : 587,
                                  emailUser:
                                    credential.emailUser ||
                                    credential.user ||
                                    credential.username ||
                                    "",
                                  emailUsername:
                                    credential.emailUsername ||
                                    credential.username ||
                                    "",
                                  emailPassword:
                                    credential.emailPassword ||
                                    credential.password ||
                                    "",
                                  emailEncryption:
                                    credential.emailEncryption ||
                                    credential.encryption ||
                                    "",
                                  adminEmail:
                                    credential.adminEmail ||
                                    credential.adminEmailAddress ||
                                    credential.adminEmail ||
                                    "",
                                });
                              } catch (error) {
                                console.error(
                                  "Failed to load decrypted Email credential:",
                                  error
                                );
                                // Fallback to existing data
                                const credential =
                                  existingEmail[0] as EmailCredential;
                                setEmailForm({
                                  name: credential.name || "",
                                  description: credential.description || "",
                                  emailHost: credential.emailHost || "",
                                  emailPort: credential.emailPort || 587,
                                  emailUser: credential.emailUser || "",
                                  emailUsername: credential.emailUsername || "",
                                  emailPassword: credential.emailPassword || "",
                                  emailEncryption:
                                    credential.emailEncryption || "",
                                  adminEmail: credential.adminEmail || "",
                                });
                              }
                            };
                            loadAndDecryptCredential();
                          } else {
                            resetForm("email");
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Email Credentials List */}
            {/* <div className="space-y-4">
              <h3 className="text-lg font-semibold">Saved Credentials</h3>
              {getCredentialsByType("email").length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No Email credentials saved yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getCredentialsByType("email").map((cred) => (
                  <Card key={cred._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{cred.name}</h4>
                            {cred.isActive && (
                              <Badge variant="default">Active</Badge>
                            )}
                            {!cred.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          {cred.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {cred.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Last updated:{" "}
                            {new Date(cred.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(cred)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={cred.isActive ? "default" : "outline"}
                            onClick={() =>
                              handleToggleStatus(cred._id, cred.isActive)
                            }
                          >
                            {cred.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(cred._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div> */}
          </TabsContent>

          {/* Razorpay Tab */}
          <TabsContent value="razorpay" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add/Edit Razorpay Credential</CardTitle>
                <CardDescription>
                  Configure your Razorpay payment gateway credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveRazorpay} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="rp-name">Credential Name *</Label>
                      <Input
                        id="rp-name"
                        placeholder="e.g., Razorpay Production"
                        value={razorpayForm.name}
                        onChange={(e) =>
                          setRazorpayForm({
                            ...razorpayForm,
                            name: e.target.value,
                          })
                        }
                        required
                        disabled={
                          !editingId &&
                          getCredentialsByType("razorpay").length > 0
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rp-desc">Description</Label>
                      <Input
                        id="rp-desc"
                        placeholder="Optional description"
                        value={razorpayForm.description}
                        onChange={(e) =>
                          setRazorpayForm({
                            ...razorpayForm,
                            description: e.target.value,
                          })
                        }
                        disabled={
                          !editingId &&
                          getCredentialsByType("razorpay").length > 0
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="rp-key-id">Key ID *</Label>
                    <Input
                      id="rp-key-id"
                      placeholder="e.g., rzp_live_..."
                      value={razorpayForm.razorpayKeyId}
                      onChange={(e) =>
                        setRazorpayForm({
                          ...razorpayForm,
                          razorpayKeyId: e.target.value,
                        })
                      }
                      required
                      disabled={
                        !editingId &&
                        getCredentialsByType("razorpay").length > 0
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rp-key-secret">Key Secret *</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="rp-key-secret"
                          type={
                            showPasswords["rp-key-secret"] ? "text" : "password"
                          }
                          placeholder="Your Razorpay key secret"
                          value={razorpayForm.razorpayKeySecret}
                          onChange={(e) =>
                            setRazorpayForm({
                              ...razorpayForm,
                              razorpayKeySecret: e.target.value,
                            })
                          }
                          required
                          disabled={
                            !editingId &&
                            getCredentialsByType("razorpay").length > 0
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility("rp-key-secret")
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          disabled={
                            !editingId &&
                            getCredentialsByType("razorpay").length > 0
                          }
                        >
                          {showPasswords["rp-key-secret"] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    {!editingId &&
                    getCredentialsByType("razorpay").length > 0 ? (
                      <Button
                        type="button"
                        onClick={() => {
                          const existingRazorpay =
                            getCredentialsByType("razorpay");
                          if (existingRazorpay.length > 0) {
                            setEditingId(existingRazorpay[0]._id);
                            handleEdit(existingRazorpay[0]);
                          }
                        }}
                      >
                        Enable Editing
                      </Button>
                    ) : (
                      <Button type="submit" disabled={loading}>
                        {loading
                          ? "Saving..."
                          : editingId
                          ? "Update Credential"
                          : "Add Credential"}
                      </Button>
                    )}
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          // Reset form to existing credential values
                          const existingRazorpay =
                            getCredentialsByType("razorpay");
                          if (existingRazorpay.length > 0) {
                            const loadAndDecryptCredential = async () => {
                              try {
                                const resp = await apiClient.get(
                                  `/credentials/${existingRazorpay[0]._id}`
                                );
                                const credential =
                                  resp.data?.data || resp.data || resp;
                                setRazorpayForm({
                                  name:
                                    credential.name ||
                                    existingRazorpay[0].name ||
                                    "",
                                  description:
                                    credential.description ||
                                    existingRazorpay[0].description ||
                                    "",
                                  razorpayKeyId:
                                    credential.razorpayKeyId ||
                                    credential.keyId ||
                                    credential.key ||
                                    "",
                                  razorpayKeySecret:
                                    credential.razorpayKeySecret ||
                                    credential.keySecret ||
                                    credential.secret ||
                                    "",
                                });
                              } catch (error) {
                                console.error(
                                  "Failed to load decrypted Razorpay credential:",
                                  error
                                );
                                // Fallback to existing data
                                const credential =
                                  existingRazorpay[0] as RazorpayCredential;
                                setRazorpayForm({
                                  name: credential.name || "",
                                  description: credential.description || "",
                                  razorpayKeyId: credential.razorpayKeyId || "",
                                  razorpayKeySecret:
                                    credential.razorpayKeySecret || "",
                                });
                              }
                            };
                            loadAndDecryptCredential();
                          } else {
                            resetForm("razorpay");
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Razorpay Credentials List */}
            {/* <div className="space-y-4">
              <h3 className="text-lg font-semibold">Saved Credentials</h3>
              {getCredentialsByType("razorpay").length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No Razorpay credentials saved yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getCredentialsByType("razorpay").map((cred) => (
                  <Card key={cred._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{cred.name}</h4>
                            {cred.isActive && (
                              <Badge variant="default">Active</Badge>
                            )}
                            {!cred.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          {cred.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {cred.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Last updated:{" "}
                            {new Date(cred.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(cred)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={cred.isActive ? "default" : "outline"}
                            onClick={() =>
                              handleToggleStatus(cred._id, cred.isActive)
                            }
                          >
                            {cred.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(cred._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div> */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}