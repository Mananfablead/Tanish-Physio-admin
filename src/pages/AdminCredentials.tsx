// Admin Credentials Management Page
// Secure authentication and credential management

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Key, User, Mail, Phone, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSelector, useDispatch } from "react-redux";
import { getProfile } from "@/features/auth/authSlice";
import apiClient, { API } from "@/api/apiClient";

export default function AdminCredentials() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "admin@clinic.com",
    password: "adminpassword123"
  });
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }
    
    // Load profile data
    loadProfile();
  }, [isAuthenticated, token, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API.PROFILE);
      setProfile(response.data.data);
      setUpdateForm({
        name: response.data.data.name || "",
        email: response.data.data.email || "",
        phone: response.data.data.phone || ""
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialUpdate = async (e) => {
    e.preventDefault();
    // In a real implementation, this would call an API to update credentials
    alert("Credential update functionality would be implemented here");
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await apiClient.put(API.UPDATE_PROFILE, updateForm);
      setProfile(response.data.data);
      setEditing(false);
      // Refresh auth state
      dispatch(getProfile());
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post(API.LOGOUT);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to access admin credentials</p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Credentials</h1>
            <p className="text-muted-foreground">
              Manage your admin account credentials and profile
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credentials">Login Credentials</TabsTrigger>
            <TabsTrigger value="profile">Profile Management</TabsTrigger>
            <TabsTrigger value="security">Security Settings</TabsTrigger>
          </TabsList>

          {/* Login Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Current Login Credentials
                </CardTitle>
                <CardDescription>
                  These are your current admin login credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={credentials.email} 
                        readOnly 
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-muted-foreground" />
                      <div className="relative flex-1">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={credentials.password}
                          readOnly
                          className="bg-muted pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Security Notice</h3>
                  <p className="text-sm text-yellow-700">
                    For production use, please change these default credentials immediately 
                    and enable two-factor authentication for enhanced security.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Management Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Admin Profile
                </CardTitle>
                <CardDescription>
                  Manage your admin profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="space-y-6">
                    {!editing ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Profile Information</h3>
                          <Button onClick={() => setEditing(true)} variant="outline">
                            Edit Profile
                          </Button>
                        </div>
                        
                        <div className="grid gap-4">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Name:</span>
                            <span>{profile.name || "Not set"}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Email:</span>
                            <span>{profile.email || "Not set"}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Phone:</span>
                            <span>{profile.phone || "Not set"}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Member Since:</span>
                            <span>
                              {profile.createdAt 
                                ? new Date(profile.createdAt).toLocaleDateString() 
                                : "Unknown"
                              }
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="font-medium">Role:</span>
                            <Badge variant="secondary">{profile.role || "admin"}</Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={updateForm.name}
                            onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={updateForm.email}
                            onChange={(e) => setUpdateForm({...updateForm, email: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={updateForm.phone}
                            onChange={(e) => setUpdateForm({...updateForm, phone: e.target.value})}
                          />
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                          <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Save Changes"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading profile...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Password Security</CardTitle>
                  <CardDescription>
                    Change your admin password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" disabled>
                    Enable 2FA (Coming Soon)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Login History</CardTitle>
                  <CardDescription>
                    Recent login activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">
                      Login history tracking coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Access</CardTitle>
                  <CardDescription>
                    Manage API tokens and keys
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" disabled>
                    Manage API Keys (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}