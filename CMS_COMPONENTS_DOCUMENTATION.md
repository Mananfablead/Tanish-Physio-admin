# CMS Component Structure Documentation

## Overview
This document explains the new modular structure for the CMS (Content Management System) components that were previously in a single large file.

## Directory Structure

```
src/
├── pages/
│   ├── CMS.tsx                      # Main CMS page (refactored)
│   └── cms-components/              # Component directory
│       ├── AboutSection.tsx         # About Us section component
│       ├── ConditionsSection.tsx    # Conditions section component
│       ├── ContactSection.tsx       # Contact section component
│       ├── FaqSection.tsx           # FAQ section component
│       ├── HeroSection.tsx          # Hero section component
│       ├── MultiStepForm.tsx        # Multi-step form component
│       ├── StepsSection.tsx         # Steps section component
│       ├── TeamSection.tsx          # Team section component
│       ├── TermsSection.tsx         # Terms section component
│       ├── WhyUsSection.tsx         # Why Us section component
│       └── forms/                   # Form components directory
│           ├── EditHeroForm.tsx     # Hero section edit form
│           ├── EditStepForm.tsx     # Step section edit form
│           └── EditConditionsForm.tsx # Conditions section edit form
├── features/
│   └── cms/
│       ├── cmsSlice.js              # Main CMS Redux slice (existing)
│       ├── heroSlice.ts             # Hero section Redux slice
│       └── stepsSlice.ts            # Steps section Redux slice
├── services/
│   └── cmsService.ts                # Centralized CMS API service
└── api/
    └── apiClient.js                 # API client (existing)
```

## Component Breakdown

### 1. Main CMS Page (`CMS.tsx`)
- **Purpose**: Main container component that orchestrates all CMS sections
- **Key Features**:
  - Tab-based navigation for different sections
  - Mobile-responsive dropdown navigation
  - State management integration with Redux
  - Modal system for editing content
  - Loading states and error handling

### 2. Section Components
Each section component handles the display and basic interactions for its respective CMS section:

#### `AboutSection.tsx`
- Displays About Us content
- Preview functionality
- Edit button integration

#### `HeroSection.tsx`
- Hero banner content display
- CTA buttons and features
- Image preview

#### `StepsSection.tsx`
- How It Works steps
- Add/remove step functionality
- Step reordering capabilities

#### `ConditionsSection.tsx`
- Medical conditions listing
- Condition images
- Treatment information

#### `WhyUsSection.tsx`
- Statistics and features
- Value propositions
- Company highlights

#### `FaqSection.tsx`
- Frequently Asked Questions
- Add/edit/delete FAQ items
- Question categorization

#### `ContactSection.tsx`
- Contact information
- Social media links
- Business hours

#### `TeamSection.tsx`
- Featured therapist/team members
- Profile information
- Availability status

#### `TermsSection.tsx`
- Terms and conditions content
- Privacy policy
- Legal documents

### 3. Form Components (`forms/` directory)
Reusable form components for editing content:

#### `EditHeroForm.tsx`
- Edit hero section fields
- Image upload functionality
- Feature list management
- Form validation

#### `EditStepForm.tsx`
- Edit individual steps
- Step image upload
- Title and description fields

#### `EditConditionsForm.tsx`
- Edit conditions section
- Multiple condition management
- Image upload for each condition

### 4. Redux Slices
Centralized state management for each section:

#### `cmsSlice.js` (existing)
- Main CMS state management
- All section data combined
- API integration actions

#### `heroSlice.ts` (new)
- Hero section specific state
- Fetch and update hero data
- Loading/error states

#### `stepsSlice.ts` (new)
- Steps section state management
- CRUD operations for steps
- Individual step updates

### 5. API Service (`cmsService.ts`)
Centralized API service layer:

#### Features:
- All CMS API endpoints in one place
- Consistent error handling
- File upload support
- Type safety with TypeScript

#### Methods:
- `getHero()`, `updateHero()`
- `getSteps()`, `createStep()`, `updateStep()`, `deleteStep()`
- `getConditions()`, `updateConditions()`
- `getWhyUs()`, `updateWhyUs()`
- `getFaqs()`, `createFaq()`, `updateFaq()`, `deleteFaq()`
- `getTerms()`, `updateTerms()`
- `getAbout()`, `updateAbout()`
- `getAllCmsData()`

## Benefits of This Structure

### 1. **Modularity**
- Each component is self-contained
- Easy to maintain and update
- Clear separation of concerns

### 2. **Reusability**
- Form components can be reused
- Section components can be used in other parts of the app
- API service can be imported anywhere

### 3. **Scalability**
- Easy to add new sections
- Simple to extend existing functionality
- Better code organization

### 4. **Performance**
- Code splitting potential
- Smaller bundle sizes
- Faster loading times

### 5. **Developer Experience**
- Clear file structure
- Type safety with TypeScript
- Better IDE support
- Easier debugging

## Usage Examples

### Importing a Section Component:
```tsx
import AboutSection from "./cms-components/AboutSection";

<AboutSection 
  data={aboutData} 
  onEdit={handleEditSection} 
/>
```

### Using the API Service:
```tsx
import cmsService from "../services/cmsService";

const updateHero = async (heroData) => {
  try {
    const response = await cmsService.updateHero(heroData);
    dispatch(setHeroData(response.data));
  } catch (error) {
    console.error('Failed to update hero:', error);
  }
};
```

### Using Redux Slices:
```tsx
import { fetchHeroData, updateHeroData } from "../features/cms/heroSlice";

// In component
useEffect(() => {
  dispatch(fetchHeroData());
}, [dispatch]);

const handleSave = (data) => {
  dispatch(updateHeroData(data));
};
```

## Migration Notes

The original `CMS.tsx` file was over 2300 lines. It has been refactored to:
- Import separate components instead of defining them inline
- Use centralized API service
- Maintain the same functionality with better organization
- Keep existing Redux integration
- Preserve all existing props and interfaces

## Future Improvements

1. **Additional Form Components**: Create form components for all remaining sections
2. **Individual Redux Slices**: Create slices for each remaining section
3. **Component Testing**: Add unit tests for each component
4. **TypeScript Enhancement**: Add more strict typing
5. **Performance Optimization**: Implement code splitting and lazy loading
6. **Documentation**: Add component-specific documentation

## Troubleshooting

### Common Issues:
1. **Import conflicts**: Make sure to remove local component definitions when importing
2. **Type errors**: Ensure all interfaces are properly defined
3. **API errors**: Check the `cmsService.ts` file for correct endpoint URLs
4. **Redux state**: Verify slice names and action types match

### Debugging Tips:
1. Use React DevTools to inspect component props
2. Check Redux DevTools for state changes
3. Monitor Network tab for API calls
4. Enable TypeScript strict mode for better error detection