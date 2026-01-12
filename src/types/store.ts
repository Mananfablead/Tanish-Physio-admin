// Define the type for the auth state
export interface AuthState {
  user: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    profilePicture?: string;
    // Add other user properties as needed
  } | null;
  role: string | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  forgotPasswordSuccess: string | null;
}

// Define the type for dashboard state
export interface DashboardState {
  // Define dashboard state properties as needed
  stats?: any;
  loading?: boolean;
  error?: string | null;
}

// Define the type for users state
export interface UsersState {
  // Define users state properties as needed
  users?: any[];
  loading?: boolean;
  error?: string | null;
}

// Define the type for sessions state
export interface SessionsState {
  // Define sessions state properties as needed
  sessions?: any[];
  loading?: boolean;
  error?: string | null;
}

// Define the type for services state
export interface ServicesState {
  // Define services state properties as needed
  services?: any[];
  loading?: boolean;
  error?: string | null;
}

// Define the type for questionnaires state
export interface QuestionnairesState {
  // Define questionnaires state properties as needed
  questionnaires?: any[];
  loading?: boolean;
  error?: string | null;
}

// Define the type for subscriptions state
export interface SubscriptionsState {
  // Define subscriptions state properties as needed
  subscriptions?: any[];
  loading?: boolean;
  error?: string | null;
}

// Define the type for availability state
export interface AvailabilityState {
  availability: any[];
  loading: boolean;
  error: string | null;
  selectedAvailability: any | null;
}

// Define the root state of the Redux store
export interface RootState {
  auth: AuthState;
  dashboard: DashboardState;
  users: UsersState;
  sessions: SessionsState;
  services: ServicesState;
  questionnaires: QuestionnairesState;
  subscriptions: SubscriptionsState;
  availability: AvailabilityState;
}