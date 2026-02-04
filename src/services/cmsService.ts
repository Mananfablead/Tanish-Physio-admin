import apiClient from '../api/apiClient';

// CMS API Service
export const cmsService = {
  // Hero section
  getHero: async () => {
    const response = await apiClient.get('/cms/admin/hero');
    return response.data;
  },

  updateHero: async (data: any) => {
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      formData.append('image', data.image);
      Object.keys(data).forEach(key => {
        if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });
      const response = await apiClient.put('/cms/admin/hero', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await apiClient.put('/cms/admin/hero', data);
      return response.data;
    }
  },

  // Steps section
  getSteps: async () => {
    const response = await apiClient.get('/cms/admin/steps');
    return response.data;
  },

  createStep: async (data: any) => {
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      formData.append('image', data.image);
      Object.keys(data).forEach(key => {
        if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });
      const response = await apiClient.post('/cms/admin/steps', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await apiClient.post('/cms/admin/steps', data);
      return response.data;
    }
  },

  updateStep: async (id: string, data: any) => {
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      formData.append('image', data.image);
      Object.keys(data).forEach(key => {
        if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });
      const response = await apiClient.put(`/cms/admin/steps/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await apiClient.put(`/cms/admin/steps/${id}`, data);
      return response.data;
    }
  },

  deleteStep: async (id: string) => {
    const response = await apiClient.delete(`/cms/admin/steps/${id}`);
    return response.data;
  },

  // Conditions section
  getConditions: async () => {
    const response = await apiClient.get('/cms/admin/conditions');
    return response.data;
  },

  updateConditions: async (data: any) => {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('isPublic', data.isPublic ? 'true' : 'false');
    
    if (data.conditions && Array.isArray(data.conditions)) {
      data.conditions.forEach((condition: any, index: number) => {
        formData.append(`conditions[${index}][title]`, condition.name || '');
        formData.append(`conditions[${index}][content]`, '');
        
        if (condition.image && condition.image instanceof File) {
          formData.append(`conditions[${index}][image]`, condition.image);
        }
      });
    }
    
    const response = await apiClient.put('/cms/admin/conditions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Why Us section
  getWhyUs: async () => {
    const response = await apiClient.get('/cms/admin/whyUs');
    return response.data;
  },

  updateWhyUs: async (data: any) => {
    const response = await apiClient.put('/cms/admin/whyUs', data);
    return response.data;
  },

  // FAQ section
  getFaqs: async () => {
    const response = await apiClient.get('/cms/admin/faq');
    return response.data;
  },

  createFaq: async (data: any) => {
    const response = await apiClient.post('/cms/admin/faq', data);
    return response.data;
  },

  updateFaq: async (id: string, data: any) => {
    const response = await apiClient.put(`/cms/admin/faq/${id}`, data);
    return response.data;
  },

  deleteFaq: async (id: string) => {
    const response = await apiClient.delete(`/cms/admin/faq/${id}`);
    return response.data;
  },

  // Terms section
  getTerms: async () => {
    const response = await apiClient.get('/cms/admin/terms');
    return response.data;
  },

  updateTerms: async (data: any) => {
    const response = await apiClient.put('/cms/admin/terms', data);
    return response.data;
  },

  // Featured Therapist section
  getFeaturedTherapist: async () => {
    const response = await apiClient.get('/cms/admin/featuredTherapist');
    return response.data;
  },

  updateFeaturedTherapist: async (data: any) => {
    if (data.image && typeof data.image !== 'string') {
      const formData = new FormData();
      formData.append('image', data.image);
      Object.keys(data).forEach(key => {
        if (key !== 'image') {
          formData.append(key, data[key]);
        }
      });
      const response = await apiClient.put('/cms/admin/featuredTherapist', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await apiClient.put('/cms/admin/featuredTherapist', data);
      return response.data;
    }
  },

  // Contact section
  getContact: async () => {
    const response = await apiClient.get('/cms/admin/contact');
    return response.data;
  },

  updateContact: async (data: any) => {
    const response = await apiClient.put('/cms/admin/contact', data);
    return response.data;
  },

  // About section
  getAbout: async () => {
    const response = await apiClient.get('/cms/admin/about');
    return response.data;
  },

  updateAbout: async (data: any) => {
    const hasImageFiles = data.images && Array.isArray(data.images) && 
                          data.images.some((img: any) => img instanceof File);
    
    if (hasImageFiles) {
      const formData = new FormData();
      
      data.images.forEach((image: any, index: number) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
      
      Object.keys(data).forEach(key => {
        if (key !== 'images') {
          if (typeof data[key] === 'object' && data[key] !== null) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      
      const response = await apiClient.put('/cms/admin/about', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await apiClient.put('/cms/admin/about', data);
      return response.data;
    }
  },

  // Get all CMS data
  getAllCmsData: async () => {
    const response = await apiClient.get('/cms/admin/all');
    return response.data;
  }
};

export default cmsService;