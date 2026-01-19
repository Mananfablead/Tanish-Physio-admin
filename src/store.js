import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import dashboardReducer from "@/features/dashboard/dashboardSlice";
import userReducer from "@/features/users/userSlice";
import sessionReducer from "@/features/sessions/sessionSlice";
import serviceReducer from "@/features/services/serviceSlice";
import questionnaireReducer from "@/features/questionnaires/questionnaireSlice";
import subscriptionReducer from "@/features/subscriptions/subscriptionSlice";
import availabilityReducer from "@/features/availability/availabilitySlice";
import therapistReducer from "@/features/therapistSlice";
import bookingReducer from "@/features/bookings/bookingSlice";
import notificationReducer from "@/features/notifications/notificationSlice";
import paymentReducer from "@/features/payments/paymentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: userReducer,
    sessions: sessionReducer,
    services: serviceReducer,
    questionnaires: questionnaireReducer,
    subscriptions: subscriptionReducer,
    availability: availabilityReducer,
    therapists: therapistReducer,
    notifications: notificationReducer,
    bookings: bookingReducer,
    payments: paymentReducer,
  },
});

// Listen for token expiration event and dispatch logout
window.addEventListener('tokenExpired', () => {
  store.dispatch({ type: 'auth/logout' });
});
