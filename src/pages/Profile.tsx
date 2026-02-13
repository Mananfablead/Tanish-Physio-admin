import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit, Lock, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { useToast } from "@/hooks/use-toast";

import {
  fetchProfile,
  updateProfile,
  changePassword
} from "@/features/auth/authSlice";

export default function Profile() {
  const dispatch = useDispatch<any>();
  const { user, loading } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  console.log("object", user)
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    joinDate: "",
    avatar: "",
  });

  const [doctorProfile, setDoctorProfile] = useState({
    name: "",
    experience: "",
    specialization: "",
    certifications: [],
    certificationNames: [],
    bio: "",
    education: "",
    languages: "",
    fee: "",
    availability: "",
  });

  const [certificationFiles, setCertificationFiles] = useState<File[]>([]);
  const [certificationPreviews, setCertificationPreviews] = useState<string[]>([]);
  const [newCertificationName, setNewCertificationName] = useState("");

  // Helper function to flatten nested arrays and extract string values
  const flattenCertificationNames = (names) => {
    if (!names || !Array.isArray(names)) return [];
    
    const flattened = [];
    const processItem = (item) => {
      if (typeof item === 'string') {
        // If it's a string, check if it needs JSON parsing
        if (item.startsWith('[') || item.startsWith('{')) {
          try {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) {
              parsed.forEach(processItem);
            } else if (typeof parsed === 'string') {
              flattened.push(parsed);
            }
          } catch (e) {
            flattened.push(item);
          }
        } else {
          flattened.push(item);
        }
      } else if (Array.isArray(item)) {
        item.forEach(processItem);
      }
    };
    
    names.forEach(processItem);
    return flattened.filter(name => name && name.trim());
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [doctorImageFile, setDoctorImageFile] = useState<File | null>(null);
  const [doctorImagePreview, setDoctorImagePreview] = useState<string | null>(null);

  /* =========================
     LOAD PROFILE
  ========================= */
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        location: user.location || prev.location,
        role: user.role || prev.role,
        joinDate: user.joinDate || prev.joinDate,
        avatar: user.profilePicture,
      }));
      
      // Load doctor profile data if available
      if (user.doctorProfile) {
        setDoctorProfile(prev => ({
          ...prev,
          name: user.doctorProfile.name || prev.name,
          experience: user.doctorProfile.experience || prev.experience,
          specialization: user.doctorProfile.specialization || prev.specialization,
          bio: user.doctorProfile.bio || prev.bio,
          education: user.doctorProfile.education || prev.education,
          languages: user.doctorProfile.languages && user.doctorProfile.languages.length > 0 
            ? user.doctorProfile.languages.join(', ')
            : '',
          fee: user.doctorProfile.fee || prev.fee,
          availability: user.doctorProfile.availability || prev.availability,
          certifications: user.doctorProfile.certifications || prev.certifications,
          certificationNames: flattenCertificationNames(user.doctorProfile.certificationNames) || prev.certificationNames,
        }));
      } else {
        // Set empty languages if no doctor profile exists
        setDoctorProfile(prev => ({
          ...prev,
          languages: ''
        }));
      }
    }
  }, [user]);

  /* =========================
     HANDLE IMAGE CHANGE
  ========================= */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDoctorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDoctorImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctorImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSaveProfile = async () => {
    // Create form data to handle both profile updates and image upload
    const formData = new FormData();
    
    // Add profile data
    formData.append('name', profile.name);
    formData.append('email', profile.email);
    formData.append('phone', profile.phone);
    formData.append('location', profile.location);
    
    // Add doctor profile data as individual fields
    formData.append('doctorProfile[name]', doctorProfile.name);
    formData.append('doctorProfile[experience]', doctorProfile.experience);
    formData.append('doctorProfile[specialization]', doctorProfile.specialization);
    formData.append('doctorProfile[bio]', doctorProfile.bio);
    formData.append('doctorProfile[education]', doctorProfile.education);
    formData.append('doctorProfile[languages]', doctorProfile.languages);
    formData.append('doctorProfile[fee]', doctorProfile.fee);
    formData.append('doctorProfile[availability]', doctorProfile.availability);
    
    // Add certification names
    if (doctorProfile.certificationNames.length > 0) {
      // Ensure we send clean string array, not nested JSON
      const cleanCertNames = doctorProfile.certificationNames.map(name => 
        typeof name === 'string' ? name.trim() : String(name)
      ).filter(name => name);
      formData.append('doctorProfile[certificationNames]', JSON.stringify(cleanCertNames));
    }
    
    // Add image if present
    if (imageFile) {
      formData.append('profilePicture', imageFile);
    }
    
    // Add doctor image if present
    if (doctorImageFile) {
      formData.append('doctorProfilePicture', doctorImageFile);
    }
    
    // Add certification files if any
    certificationFiles.forEach((file, index) => {
      formData.append(`certifications`, file);
    });
    
    try {
      // Single API call to update both profile and picture
      const result = await dispatch(updateProfile(formData));
      
      if (updateProfile.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        
        // Reset image state after successful upload
        setImageFile(null);
        setImagePreview(null);
        // Reset doctor image state after successful upload
        setDoctorImageFile(null);
        setDoctorImagePreview(null);
        // Reset certification files after successful upload
        setCertificationFiles([]);
        setCertificationPreviews([]);
      } else {
        toast({
          title: "Error",
          description: result.payload?.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }

    setIsEditing(false);
  };

  /* =========================
     HANDLE CERTIFICATION UPLOAD
  ========================= */
  const handleCertificationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      
      // Process each file
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCertificationPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      
      setCertificationFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeCertification = (index: number) => {
    setCertificationFiles(prev => prev.filter((_, i) => i !== index));
    setCertificationPreviews(prev => prev.filter((_, i) => i !== index));
  };

  /* =========================
     UPDATE DOCTOR PROFILE
  ========================= */
  const handleUpdateDoctorProfile = async () => {
    const formData = new FormData();
    
    // Add doctor profile data as individual fields
    formData.append('doctorProfile[name]', doctorProfile.name);
    formData.append('doctorProfile[experience]', doctorProfile.experience);
    formData.append('doctorProfile[specialization]', doctorProfile.specialization);
    formData.append('doctorProfile[bio]', doctorProfile.bio);
    formData.append('doctorProfile[education]', doctorProfile.education);
    formData.append('doctorProfile[languages]', doctorProfile.languages);
    formData.append('doctorProfile[fee]', doctorProfile.fee);
    formData.append('doctorProfile[availability]', doctorProfile.availability);
    
    // Add certification files if any
    certificationFiles.forEach((file, index) => {
      formData.append(`certifications`, file);
    });
    
    // Add certification names
    if (doctorProfile.certificationNames.length > 0) {
      // Ensure we send clean string array, not nested JSON
      const cleanCertNames = doctorProfile.certificationNames.map(name => 
        typeof name === 'string' ? name.trim() : String(name)
      ).filter(name => name);
      formData.append('doctorProfile[certificationNames]', JSON.stringify(cleanCertNames));
    }
    
    try {
      const result = await dispatch(updateProfile(formData));
      
      if (updateProfile.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Doctor profile updated successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.payload?.message || "Failed to update doctor profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update doctor profile",
        variant: "destructive",
      });
    }
  };

  /* =========================
     CHANGE PASSWORD
  ========================= */
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const result = await dispatch(changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    }));
    
    if (changePassword.fulfilled.match(result)) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      toast({
        title: "Success",
        description: "Password updated successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: result.payload?.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
        </div>

        <Button
          onClick={() =>
            isEditing ? handleSaveProfile() : setIsEditing(true)
          }
          disabled={loading}
          variant={isEditing ? "default" : "outline"}
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      {/* PROFILE CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* AVATAR */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                <AvatarImage src={imagePreview || user?.profilePicture || ""} />
                <AvatarFallback>
                  {profile.name
                    ? profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 cursor-pointer">
                  <Edit className="w-3 h-3 text-white" />
                </div>
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              <p className="text-muted-foreground">{profile.role}</p>
            </div>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NAME */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="pl-10"
                  disabled={true}
                />
              </div>
            </div>

            {/* PHONE */}
            <div className="space-y-2">
              <Label>Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* LOCATION */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* EXPERIENCE */}
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={doctorProfile.experience}
                      onChange={(e) =>
                        setDoctorProfile({ ...doctorProfile, experience: e.target.value })
                      }
                      className="pl-10"
                      placeholder="e.g., 5 years"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                {/* SPECIALIZATION */}
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <div className="relative">
                    <Input
                      value={doctorProfile.specialization}
                      onChange={(e) =>
                        setDoctorProfile({ ...doctorProfile, specialization: e.target.value })
                      }
                      className="pl-10"
                      placeholder="e.g., Physiotherapy"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EDUCATION */}
            <div className="space-y-2">
              <Label>Education</Label>
              <Input
                value={doctorProfile.education}
                onChange={(e) =>
                  setDoctorProfile({ ...doctorProfile, education: e.target.value })
                }
                placeholder="e.g., MD, PhD"
                disabled={!isEditing}
              />
            </div>
            
            {/* CONSULTATION FEE */}
            <div className="space-y-2">
              <Label>Consultation Fee</Label>
              <Input
                value={doctorProfile.fee}
                onChange={(e) =>
                  setDoctorProfile({ ...doctorProfile, fee: e.target.value })
                }
                placeholder="e.g., $100/hour"
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* BIOGRAPHY */}
          <div className="space-y-2">
            <Label>Biography</Label>
            <textarea
              value={doctorProfile.bio}
              onChange={(e) =>
                setDoctorProfile({ ...doctorProfile, bio: e.target.value })
              }
              rows={3}
              className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
              placeholder="Tell us about your medical journey and expertise..."
              disabled={!isEditing}
            />
          </div>
            
           {/* LANGUAGES */}
          <div className="space-y-2">
            <Label>Languages Spoken</Label>
            <Input
              value={doctorProfile.languages}
              onChange={(e) =>
                setDoctorProfile({ ...doctorProfile, languages: e.target.value })
              }
              placeholder="e.g., English, Hindi, Gujarati"
              disabled={!isEditing}
            />
            <p className="text-sm text-muted-foreground">Enter languages separated by commas</p>
          </div>

            {/* CERTIFICATIONS */}
          <div className="space-y-2">
            <Label>Certifications</Label>
            <div className="space-y-4">
              <input
                id="certifications-upload"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                multiple
                onChange={handleCertificationUpload}
                disabled={!isEditing}
              />
              
              {isEditing && (
                <div className="space-y-4">
                  {/* Upload Certifications Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('certifications-upload')?.click()}
                    className="w-full md:w-auto"
                  >
                    Upload Certification Files
                  </Button>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newCertificationName}
                        onChange={(e) => setNewCertificationName(e.target.value)}
                        placeholder="Enter certification name"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (newCertificationName.trim()) {
                            // Clean the certification name to prevent JSON nesting
                            const cleanName = newCertificationName.trim();
                            setDoctorProfile(prev => ({
                              ...prev,
                              certificationNames: [...prev.certificationNames, cleanName]
                            }));
                            setNewCertificationName("");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                   
                    <div className="flex flex-wrap gap-2">
                      {doctorProfile.certificationNames.map((name, index) => (
                        <div key={`name-${index}`} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-full">
                          <span className="text-sm">{name}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                setDoctorProfile(prev => ({
                                  ...prev,
                                  certificationNames: prev.certificationNames.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-destructive hover:text-destructive/80"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Uploaded Certification Files */}
                {certificationPreviews.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Uploaded Certifications:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {certificationPreviews.map((preview, index) => (
                        <div key={`file-${index}`} className="relative group border rounded-lg p-2 bg-gray-50">
                          <img 
                            src={preview} 
                            alt={`Certification ${index + 1}`} 
                            className="w-full h-32 object-contain rounded"
                          />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeCertification(index)}
                              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          )}
                          <p className="text-xs text-center mt-1 truncate">Certification {index + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Certification Names */}
                {doctorProfile.certificationNames.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Certification Names:</h4>
                    <div className="space-y-2">
                      {doctorProfile.certificationNames.map((name, index) => (
                        <div key={`name-${index}`} className="flex items-center justify-between bg-secondary px-3 py-2 rounded-md">
                          <span className="text-sm">{name}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                setDoctorProfile(prev => ({
                                  ...prev,
                                  certificationNames: prev.certificationNames.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-destructive hover:text-destructive/80 w-6 h-6 flex items-center justify-center rounded-full"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AVAILABILITY */}
          <div className="space-y-2">
            <Label>Availability</Label>
            <select
              value={doctorProfile.availability}
              onChange={(e) =>
                setDoctorProfile({ ...doctorProfile, availability: e.target.value })
              }
              className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isEditing}
            >
              <option value="">Select availability</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="weekends">Weekends Only</option>
              <option value="by-appointment">By Appointment</option>
            </select>
          </div>

          {/* JOIN DATE */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Joined {profile.joinDate || "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CHANGE PASSWORD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-4 h-4" /> Change Password
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <Button onClick={handleChangePassword} disabled={loading}>
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
