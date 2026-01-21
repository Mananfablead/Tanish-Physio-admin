import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  logoutUser,
  fetchProfile,
  forgotPassword,
  resetPassword,
  logout,
} from "@/features/auth/authSlice";
import { RootState } from "@/types/store";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";

// Define AppDispatch type
type AppDispatch = ReturnType<typeof useDispatch>;

export const useAuthRedux = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await dispatch(loginUser({ email, password }));

      // Check if the login was successful
      if (loginUser.fulfilled.match(result)) {
        toast({
          title: "Login Successful",
          description: "You have been successfully logged in.",
        });
        navigate("/");
      } else if (loginUser.rejected.match(result)) {
        // Handle the rejected case with the error from the API
        const errorMessage = (result.payload as string) || "Login failed";
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        // The error will also be reflected in the Redux state
      }
    } catch (err: any) {
      // This handles unexpected errors
      const errorMessage = err.message || "An error occurred during login.";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => {
    // Registration functionality would need to be implemented
    // This is just a placeholder since there's no register action in the authSlice
    toast({
      title: "Registration Not Implemented",
      description: "Registration functionality needs to be implemented.",
      variant: "destructive",
    });
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      toast({
        title: "Logout Successful",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (err) {
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  const clearAuthError = () => {
    // Since there's no clearError action, we'll dispatch logout to clear state
    dispatch(logout());
  };

  const handleForgotPassword = async (email: string) => {
    try {
      const result = await dispatch(forgotPassword({ email }));
      if (forgotPassword.fulfilled.match(result)) {
        toast({
          title: "Password Reset Email Sent",
          description:
            "We've sent a password reset link to your email address.",
        });
        navigate("/login");
      } else if (forgotPassword.rejected.match(result)) {
        toast({
          title: "Password Reset Request Failed",
          description: result.payload as string,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Password Reset Request Failed",
        description: "An error occurred while processing your request.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (token: string, password: string) => {
    try {
      const result = await dispatch(resetPassword({ token, password }));
      if (resetPassword.fulfilled.match(result)) {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset successfully.",
        });
        navigate("/login");
      } else if (resetPassword.rejected.match(result)) {
        toast({
          title: "Password Reset Failed",
          description: result.payload as string,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Password Reset Failed",
        description: "An error occurred while resetting your password.",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
    handleForgotPassword,
    handleResetPassword,
    clearAuthError,
  };
};
