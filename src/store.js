import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import dashboardReducer from "@/features/dashboard/dashboardSlice";
import userReducer from "@/features/users/userSlice";
import sessionReducer from "@/features/sessions/sessionSlice";
import serviceReducer from "@/features/services/serviceSlice";
import questionnaireReducer from "@/features/questionnaires/questionnaireSlice";
import subscriptionReducer from "@/features/subscriptions/subscriptionSlice";
import therapistReducer from "@/features/therapistSlice";
import bookingReducer from "@/features/bookings/bookingSlice";
import notificationReducer from "@/features/notifications/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: userReducer,
    sessions: sessionReducer,
    services: serviceReducer,
    questionnaires: questionnaireReducer,
    subscriptions: subscriptionReducer,
    therapists: therapistReducer,
    notifications: notificationReducer,
    bookings: bookingReducer,
  },
});
