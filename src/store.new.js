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
import testimonialReducer from "@/features/testimonials/testimonialSlice";
import cmsReducer from "@/features/cms/cmsSlice";
import offerReducer from "@/features/offers/offerSlice";
import { createTokenExpirationWatcher, createTokenExpirationInterceptor } from "@/utils/tokenExpiration";
import apiClient from "@/api/apiClient";

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
        testimonials: testimonialReducer,
        cms: cmsReducer,
        offers: offerReducer,
    },
});

// Setup token expiration handling
let tokenWatcherCleanup = null;

// Function to setup token expiration watcher
const setupTokenExpirationWatcher = (token) => {
    // Clean up previous watcher
    if (tokenWatcherCleanup) {
        tokenWatcherCleanup();
        tokenWatcherCleanup = null;
    }

    // Set up new watcher if we have a token
    if (token) {
        tokenWatcherCleanup = createTokenExpirationWatcher(token, () => {
            console.log('Token expired, logging out automatically');
            store.dispatch({ type: 'auth/logout' });
        });
    }
};

// Listen for token changes in auth state
let currentToken = null;
store.subscribe(() => {
    const state = store.getState();
    const newToken = state.auth.token;

    if (newToken !== currentToken) {
        currentToken = newToken;
        setupTokenExpirationWatcher(currentToken);
    }
});

// Setup API interceptor for token expiration
const interceptor = createTokenExpirationInterceptor(() => {
    console.log('API 401 error - token expired, logging out automatically');
    store.dispatch({ type: 'auth/logout' });
});

// Add interceptor to API client
const requestInterceptor = apiClient.interceptors.response.use(
    (response) => response,
    interceptor
);

// Listen for token expiration event and dispatch logout
window.addEventListener('tokenExpired', () => {
    store.dispatch({ type: 'auth/logout' });
});

// Cleanup function for when store is destroyed
export const cleanupTokenExpiration = () => {
    if (tokenWatcherCleanup) {
        tokenWatcherCleanup();
        tokenWatcherCleanup = null;
    }
    apiClient.interceptors.response.eject(requestInterceptor);
};