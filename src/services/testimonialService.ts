import api from "@/lib/api";

// Define the Testimonial type to match the backend model
export interface Testimonial {
  _id: string;
  clientName: string;
  clientEmail?: string;
  rating: number;
  content: string;
  serviceUsed: string;
  problem: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

// Define the request payload types
export interface CreateTestimonialRequest {
  clientName: string;
  clientEmail?: string;
  rating: number;
  content: string;
  serviceUsed: string;
  problem: string;
  status?: "pending" | "approved" | "rejected";
  featured?: boolean;
  avatar?: string;
}

export interface UpdateTestimonialRequest {
  clientName?: string;
  clientEmail?: string;
  rating?: number;
  content?: string;
  serviceUsed?: string;
  problem?: string;
  status?: "pending" | "approved" | "rejected";
  featured?: boolean;
  avatar?: string;
}

export interface UpdateTestimonialStatusRequest {
  status: "pending" | "approved" | "rejected";
}

// API service for testimonials
export const testimonialService = {
  // Get all testimonials with optional filters
  getAllTestimonials: (params?: { search?: string; status?: string }) => {
    return api.get<{ success: boolean; data: Testimonial[] }>("/testimonials", {
      params,
    });
  },

  // Get testimonial statistics
  getTestimonialStats: () => {
    return api.get<{
      success: boolean;
      data: {
        total: number;
        pending: number;
        approved: number;
        featured: number;
      };
    }>("/testimonials/stats");
  },

  // Get a single testimonial by ID
  getTestimonialById: (id: string) => {
    return api.get<{ success: boolean; data: Testimonial }>(
      `/testimonials/${id}`
    );
  },

  // Create a new testimonial
  createTestimonial: (data: CreateTestimonialRequest) => {
    return api.post<{ success: boolean; data: Testimonial; message: string }>(
      "/testimonials",
      data
    );
  },

  // Update an existing testimonial
  updateTestimonial: (id: string, data: UpdateTestimonialRequest) => {
    return api.put<{ success: boolean; data: Testimonial; message: string }>(
      `/testimonials/${id}`,
      data
    );
  },

  // Update testimonial status (approve/reject)
  updateTestimonialStatus: (
    id: string,
    status: "approved" | "rejected" | "pending"
  ) => {
    return api.put<{ success: boolean; data: Testimonial; message: string }>(
      `/testimonials/${id}/status`,
      { status }
    );
  },

  // Toggle featured status
  toggleFeaturedStatus: (id: string) => {
    return api.patch<{ success: boolean; data: Testimonial; message: string }>(
      `/testimonials/${id}/featured`
    );
  },

  // Delete a testimonial
  deleteTestimonial: (id: string) => {
    return api.delete<{ success: boolean; message: string }>(
      `/testimonials/${id}`
    );
  },
};
