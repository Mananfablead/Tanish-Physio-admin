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
  changePassword,
  updateProfilePicture
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
        avatar: user.profilePicture || user.avatar || prev.avatar,
      }));
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

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSaveProfile = async () => {
    // Create form data to handle both profile updates and image upload
    const profileData: any = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
    };
    
    // Update profile info first
    const result = await dispatch(updateProfile(profileData));
    
    if (updateProfile.fulfilled.match(result)) {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: result.payload?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
    
    // If there's an image to upload, handle it separately
    if (imageFile) {
      const imageResult = await dispatch(updateProfilePicture(imageFile));
      
      if (updateProfilePicture.fulfilled.match(imageResult)) {
        toast({
          title: "Success",
          description: "Profile picture updated successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: imageResult.payload?.message || "Failed to update profile picture",
          variant: "destructive",
        });
      }
      
      // Reset image state after upload
      setImageFile(null);
      setImagePreview(null);
    }

    setIsEditing(false);
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
                <AvatarImage src={imagePreview || profile.avatar || ""} />
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
                  disabled={!isEditing}
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
