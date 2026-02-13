import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { cn } from "@/lib/utils";
import { fetchAllCmsData, updateHero, createStep, updateStep, deleteStep, updateConditions, updateWhyUs, createFaq, updateFaq, deleteFaq, updateTerms, updateFeaturedTherapist, updateContact, updateAbout, addSingleCondition, updateSingleCondition, deleteSingleCondition } from '@/features/cms/cmsSlice';

// Import new components
import AboutSection from "./cms-components/AboutSection";
import EditHeroFormComponent from "./cms-components/forms/EditHeroForm";
import EditStepFormComponent from "./cms-components/forms/EditStepForm";
import EditConditionsFormComponent from "./cms-components/forms/EditConditionsForm";
import EditConditionForm from "./cms-components/forms/EditConditionForm";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 

    Trash2, 
    Plus, 
    Upload,
    Star,
    
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define TypeScript interfaces
interface CMSData {
    hero: HeroData;
    steps: StepData[];
    conditions: ConditionsSectionData;
    whyUs: WhyUsData;
    faq: FaqData[];
    terms: TermsData;
    featuredTherapist: TeamMemberData;
    contact: ContactData;
    about: AboutData;
}

interface HeroData {
    _id: string;
    heading: string;
    subHeading: string;
    description: string;
    ctaText: string;
    secondaryCtaText: string;
    image: string;
    isTherapistAvailable: boolean;
    trustedBy: string;
    certifiedTherapists: boolean;
    rating: string;
    features: string[];
    isPublic: boolean;
}

interface StepData {
    _id: string;
    title: string;
    description: string;
    icon: string;
    image: string;
    isPublic: boolean;
}

interface ConditionData {
    name: string;
    image: string | File; // Can be URL string or File object
}

interface ConditionsSectionData {
    _id: string;
    title: string;
    description: string;
    conditions: {
        name: string;
        image: string;
        content: string;
    }[];
    image: string;
    isPublic: boolean;
}

interface StatData {
    label: string;
    value: string;
    description: string;
}

interface WhyUsData {
    _id: string;
    title: string;
    description: string;
    stats: StatData[];
    features: string[];
    isPublic: boolean;
}

interface FaqData {
    _id: string;
    question: string;
    answer: string;
    isPublic: boolean;
}

interface TermsData {
    _id: string;
    title: string;
    content: string;
    lastUpdated?: string;
    version?: string;
    isPublic: boolean;
}

interface TeamMemberData {
    _id: string;
    name: string;
    specialty: string;
    experience: string;
    rating: string;
    description: string;
    image: string;
    availableToday: boolean;
    ctaText: string;
    viewProfileText: string;
    isPublic: boolean;
}

interface SocialLink {
    platform: string;
    url: string;
}

interface ContactData {
  _id: string;
  title: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  hours: string;
  socialLinks: SocialLink[];
  isPublic: boolean;
}

interface AboutData {
  _id: string;
  title: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  foundingStory: string;
  teamInfo: string;
  image: string;
  images: (string | File)[];
  isPublic: boolean;
}

// Import existing components
import ConditionsSection from "./cms-components/ConditionsSection";
import ContactSection from "./cms-components/ContactSection";
import TeamSection from "./cms-components/TeamSection";
import HeroSection from "./cms-components/HeroSection";
import StepsSection from "./cms-components/StepsSection";
import WhyUsSection from "./cms-components/WhyUsSection";
import FaqSection from "./cms-components/FaqSection";
import TermsSection from "./cms-components/TermsSection";
import MultiStepForm from "./cms-components/MultiStepForm";

export default function CMS() {
  const dispatch = useDispatch();
  const {
    data: cmsStateData,
    loading,
    error,
  } = useSelector((state: any) => state.cms);

  // Load CMS data on component mount
  useEffect(() => {
    dispatch(fetchAllCmsData());
  }, [dispatch]);

  // Initialize with empty data
  const [data, setData] = useState<CMSData>({
    hero: {
      _id: "",
      heading: "",
      subHeading: "",
      description: "",
      ctaText: "",
      secondaryCtaText: "",
      image: "",
      isTherapistAvailable: false,
      trustedBy: "",
      certifiedTherapists: false,
      rating: "",
      features: [],
      isPublic: true,
    },
    steps: [],
    conditions: {
      _id: "",
      title: "",
      description: "",
      conditions: [],
      image: "",
      isPublic: true,
    },
    whyUs: {
      _id: "",
      title: "",
      description: "",
      stats: [],
      features: [],
      isPublic: true,
    },
    faq: [],
    terms: { _id: "", title: "", content: "", isPublic: true },
    featuredTherapist: {
      _id: "",
      name: "",
      specialty: "",
      experience: "",
      rating: "",
      description: "",
      image: "",
      availableToday: false,
      ctaText: "",
      viewProfileText: "",
      isPublic: true,
    },
    contact: {
      _id: "",
      title: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      latitude: null,
      longitude: null,
      hours: "",
      socialLinks: [],
      isPublic: true,
    },
    about: {
      _id: "",
      title: "",
      description: "",
      mission: "",
      vision: "",
      values: [],
      foundingStory: "",
      teamInfo: "",
      image: "",
      images: [],
      isPublic: true,
    },
  });
  console.log("CMS Data:", data);
  // Update local state when Redux state changes
  useEffect(() => {
    if (cmsStateData) {
      setData({
        hero: {
          ...cmsStateData.hero,
          isPublic: cmsStateData.hero?.isPublic ?? true,
        },
        steps: (cmsStateData.steps || []).map((step: any) => ({
          ...step,
          isPublic: step.isPublic ?? true,
        })),
        conditions: {
          ...cmsStateData.conditions,
          isPublic: cmsStateData.conditions?.isPublic ?? true,
        },
        whyUs: {
          ...cmsStateData.whyUs,
          stats: cmsStateData.whyUs?.stats || [],
          features: cmsStateData.whyUs?.features || [],
          isPublic: cmsStateData.whyUs?.isPublic ?? true,
        },
        faq: (cmsStateData.faq || []).map((faq: any) => ({
          ...faq,
          isPublic: faq.isPublic ?? true,
        })),
        terms: {
          ...cmsStateData.terms,
          isPublic: cmsStateData.terms?.isPublic ?? true,
        },
        featuredTherapist: {
          ...cmsStateData.featuredTherapist,
          isPublic: cmsStateData.featuredTherapist?.isPublic ?? true,
        },
        contact: {
          ...cmsStateData.contact,
          latitude: cmsStateData.contact?.latitude || null,
          longitude: cmsStateData.contact?.longitude || null,
          socialLinks: cmsStateData.contact?.socialLinks || [],
          isPublic: cmsStateData.contact?.isPublic ?? true,
        },
        about: {
          ...cmsStateData.about,
          values: cmsStateData.about?.values || [],
          isPublic: cmsStateData.about?.isPublic ?? true,
        },
      });
    }
  }, [cmsStateData]);

  // State for mobile dropdown selection - persist in localStorage
  const [activeTab, setActiveTab] = useState(() => {
    // Get saved tab from localStorage or default to "hero"
    const savedTab = localStorage.getItem("cmsActiveTab");
    return savedTab || "hero";
  });

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cmsActiveTab", activeTab);
  }, [activeTab]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [modalItemIndex, setModalItemIndex] = useState(null);

  // Delete confirmation state
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemType, setDeleteItemType] = useState<"step" | "faq" | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConditionIndex, setDeleteConditionIndex] = useState<
    number | null
  >(null);
  const [isDeleteConditionDialogOpen, setIsDeleteConditionDialogOpen] =
    useState(false);

  // Open edit modal
  const openEditModal = (section, item = null, index = null) => {
    setModalSection(section);
    setModalItem(item);
    setModalItemIndex(index);
    setIsModalOpen(true);
  };

  // Delete condition - opens confirmation dialog
  const openDeleteConditionDialog = (index: number) => {
    setDeleteConditionIndex(index);
    setIsDeleteConditionDialogOpen(true);
  };

  // Close modal
  const closeEditModal = () => {
    setIsModalOpen(false);
    setModalSection(null);
    setModalItem(null);
    setModalItemIndex(null);
  };

  // Save changes from modal
  const saveModalChanges = async (updatedData) => {
    if (modalSection === "hero") {
      dispatch(updateHero(updatedData));
      setData((prev) => ({
        ...prev,
        hero: updatedData,
      }));
    } else if (modalSection === "step") {
      if (!modalItem) {
        // Adding multiple steps
        for (const step of updatedData) {
          dispatch(createStep(step));
        }
        // Note: The steps will be added to local state via useEffect when Redux state updates
      } else {
        // Updating an existing step
        if (!updatedData._id) {
          // Adding a new step
          dispatch(createStep(updatedData));
          // Note: The step will be added to local state via useEffect when Redux state updates
        } else {
          // Updating an existing step
          // Clean up the stepData to remove problematic id fields
          const cleanStepData = { ...updatedData };
          delete cleanStepData._id;
          delete cleanStepData.id;
          const result = await dispatch(
            updateStep({ id: updatedData._id, stepData: cleanStepData })
          );
          if (updateStep.fulfilled.match(result)) {
            setData((prev) => ({
              ...prev,
              steps: prev.steps.map((step) =>
                step._id === updatedData._id ? result.payload : step
              ),
            }));
          }
        }
      }
    } else if (modalSection === "conditions") {
      if (modalItemIndex !== null && modalItemIndex >= 0) {
        // Editing an individual condition - use the new endpoint
        const conditionWithProperTitle = {
          ...updatedData,
          title: updatedData.name || updatedData.title || "",
          content: updatedData.content || "",
        };
        const result = await dispatch(
          updateSingleCondition({
            index: modalItemIndex,
            conditionData: conditionWithProperTitle,
          })
        );
        if (updateSingleCondition.fulfilled.match(result)) {
          // Refresh data after successful update
          dispatch(fetchAllCmsData());
        }
      } else if (modalItemIndex === -1) {
        // Adding a new condition - use the new endpoint
        const conditionWithProperTitle = {
          ...updatedData,
          title: updatedData.name || updatedData.title || "",
          content: updatedData.content || "",
        };
        const result = await dispatch(
          addSingleCondition(conditionWithProperTitle)
        );
        if (addSingleCondition.fulfilled.match(result)) {
          // Refresh data after successful add
          dispatch(fetchAllCmsData());
        }
      } else {
        // Updating the entire conditions section
        const result = await dispatch(updateConditions(updatedData));
        if (updateConditions.fulfilled.match(result)) {
          // Refresh data after successful update
          dispatch(fetchAllCmsData());
        }
      }
    } else if (modalSection === "whyUs") {
      dispatch(updateWhyUs(updatedData));
      setData((prev) => ({
        ...prev,
        whyUs: updatedData,
      }));
    } else if (modalSection === "faq") {
      if (!updatedData._id) {
        // Adding a new FAQ
        const result = await dispatch(createFaq(updatedData));
        // Note: The FAQ will be added to local state via useEffect when Redux state updates
        if (createFaq.rejected.match(result)) {
          console.error("Failed to create FAQ:", result.error);
        }
      } else {
        // Updating an existing FAQ
        // Clean up the faqData to remove problematic id fields
        const cleanFaqData = { ...updatedData };
        delete cleanFaqData._id;
        delete cleanFaqData.id;
        const result = await dispatch(
          updateFaq({ id: updatedData._id, faqData: cleanFaqData })
        );
        if (updateFaq.fulfilled.match(result)) {
          setData((prev) => ({
            ...prev,
            faq: prev.faq.map((faq) =>
              faq._id === updatedData._id ? result.payload : faq
            ),
          }));
        }
      }
    } else if (modalSection === "terms") {
      dispatch(updateTerms(updatedData));
      setData((prev) => ({
        ...prev,
        terms: updatedData,
      }));
    } else if (modalSection === "seo") {
      setData((prev) => ({
        ...prev,
        seo: updatedData,
      }));
    } else if (modalSection === "about") {
      dispatch(updateAbout(updatedData));
      setData((prev) => ({
        ...prev,
        about: updatedData,
      }));
    } else if (modalSection === "contact") {
      dispatch(updateContact(updatedData));
      setData((prev) => ({
        ...prev,
        contact: updatedData,
      }));
    }
    closeEditModal();
  };

  // Add new step (multi-step only)
  const addStep = () => {
    setModalSection("step");
    setModalItem(null); // Ensure modalItem is null to trigger multi-step form
    setIsModalOpen(true);
  };

  // Delete step - opens confirmation dialog
  const openDeleteStepDialog = (_id) => {
    setDeleteItemId(_id);
    setDeleteItemType("step");
    setIsDeleteDialogOpen(true);
  };

  // Add new FAQ
  const addFaq = () => {
    openEditModal("faq", null);
  };

  // Delete FAQ - opens confirmation dialog
  const openDeleteFaqDialog = (_id) => {
    setDeleteItemId(_id);
    setDeleteItemType("faq");
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete item
  const confirmDeleteItem = () => {
    if (deleteItemId === null || deleteItemType === null) return;

    if (deleteItemType === "step") {
      // Actually delete from backend
      dispatch(deleteStep(deleteItemId));
    } else if (deleteItemType === "faq") {
      // Actually delete from backend
      dispatch(deleteFaq(deleteItemId));
    }

    // Reset delete state
    setDeleteItemId(null);
    setDeleteItemType(null);
    setIsDeleteDialogOpen(false);
  };

  const confirmDeleteCondition = async () => {
    if (deleteConditionIndex === null) return;

    // Actually delete from backend
    const result = await dispatch(deleteSingleCondition(deleteConditionIndex));
    if (deleteSingleCondition.fulfilled.match(result)) {
      // Refresh data after successful delete
      dispatch(fetchAllCmsData());
    }

    // Reset delete state
    setDeleteConditionIndex(null);
    setIsDeleteConditionDialogOpen(false);
  };

  // Cancel delete condition
  const cancelDeleteCondition = () => {
    setDeleteConditionIndex(null);
    setIsDeleteConditionDialogOpen(false);
  };

  // Cancel delete
  const cancelDeleteItem = () => {
    setDeleteItemId(null);
    setDeleteItemType(null);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Content Management System
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage website sections as per homepage layout
          </p>
        </div>
        <Badge
          variant="secondary"
          className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 h-6 sm:h-8"
        >
          {Object.keys(data).length} Sections
        </Badge>
      </div>

      {loading.fetchAll && (
        <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg border">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading CMS data...</p>
        </div>
      )}

      <div className="lg:hidden w-full mb-4">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hero">Hero</SelectItem>
            <SelectItem value="steps">Steps ({data.steps.length})</SelectItem>
            <SelectItem value="conditions">Conditions</SelectItem>
            <SelectItem value="whyus">Why Us</SelectItem>
            <SelectItem value="faq">FAQ ({data.faq.length})</SelectItem>
            <SelectItem value="contact">Contact</SelectItem>
            <SelectItem value="terms">Terms and Condition</SelectItem>
            <SelectItem value="about">About Us</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="hidden lg:block w-full"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="hero" className="text-xs sm:text-sm">
            Hero
          </TabsTrigger>
          <TabsTrigger value="steps" className="text-xs sm:text-sm">
            Steps ({data.steps.length})
          </TabsTrigger>
          <TabsTrigger value="conditions" className="text-xs sm:text-sm">
            Conditions
          </TabsTrigger>
          <TabsTrigger value="whyus" className="text-xs sm:text-sm">
            Why Us
          </TabsTrigger>
          <TabsTrigger value="faq" className="text-xs sm:text-sm">
            FAQ ({data.faq.length})
          </TabsTrigger>
          <TabsTrigger value="contact" className="text-xs sm:text-sm">
            Contact
          </TabsTrigger>
          <TabsTrigger value="terms" className="text-xs sm:text-sm">
            Terms & Condition
          </TabsTrigger>
          <TabsTrigger value="about" className="text-xs sm:text-sm">
            About Us
          </TabsTrigger>
        </TabsList>

        {/* HERO */}
        <TabsContent value="hero">
          <HeroSection
            data={{
              ...data.hero,
              features: data.hero?.features || [],
            }}
            onEdit={openEditModal}
            loading={loading.updateHero}
          />
        </TabsContent>

        {/* HOW IT WORKS */}
        <TabsContent value="steps" className="space-y-3 sm:space-y-4">
          <StepsSection
            data={data.steps}
            onAdd={addStep}
            onDelete={openDeleteStepDialog}
            onEdit={(item) => openEditModal("step", item)}
            loading={{
              create: loading.createStep,
              update: loading.updateStep,
              delete: loading.deleteStep,
            }}
          />
        </TabsContent>

        {/* CONDITIONS */}
        <TabsContent value="conditions">
          <ConditionsSection
            data={data.conditions}
            onEdit={openEditModal}
            onEditCondition={(condition, index) =>
              openEditModal("conditions", condition, index)
            }
            onAddCondition={() =>
              openEditModal(
                "conditions",
                { name: "", title: "", image: null },
                -1
              )
            }
            onDeleteCondition={openDeleteConditionDialog}
            loading={loading.updateConditions}
          />
        </TabsContent>

        {/* WHY CHOOSE US */}
        <TabsContent value="whyus">
          <WhyUsSection
            data={data.whyUs}
            onEdit={openEditModal}
            loading={loading.updateWhyUs}
          />
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-3 sm:space-y-4">
          <FaqSection
            data={data.faq}
            onAdd={addFaq}
            onDelete={openDeleteFaqDialog}
            onEdit={(item) => openEditModal("faq", item)}
            loading={{
              create: loading.createFaq,
              update: loading.updateFaq,
              delete: loading.deleteFaq,
            }}
          />
        </TabsContent>

        {/* TERMS */}
        <TabsContent value="terms">
          <TermsSection
            data={data.terms}
            onEdit={openEditModal}
            loading={loading.updateTerms}
          />
        </TabsContent>

        {/* CONTACT US */}
        <TabsContent value="contact">
          <ContactSection
            data={data.contact}
            onEdit={openEditModal}
            loading={loading.updateContact}
          />
        </TabsContent>

        {/* ABOUT US */}
        <TabsContent value="about">
          <AboutSection
            data={data.about}
            onEdit={openEditModal}
            loading={loading.updateAbout}
          />
        </TabsContent>

        {/* TEAM MEMBERS */}
        {/* <TabsContent value="featuredTherapist">
                    <TeamSection 
                        data={data.featuredTherapist} 
                        onEdit={openEditModal}
                    />
                </TabsContent> */}
      </Tabs>

      {/* Mobile Content - Show based on activeTab state */}
      <div className="lg:hidden space-y-4">
        {activeTab === "hero" && (
          <HeroSection
            data={{
              ...data.hero,
              features: data.hero?.features || [],
            }}
            onEdit={openEditModal}
            loading={loading.updateHero}
          />
        )}

        {activeTab === "steps" && (
          <StepsSection
            data={data.steps}
            onAdd={addStep}
            onDelete={openDeleteStepDialog}
            onEdit={(item) => openEditModal("step", item)}
            loading={{
              create: loading.createStep,
              update: loading.updateStep,
              delete: loading.deleteStep,
            }}
          />
        )}

        {activeTab === "conditions" && (
          <ConditionsSection
            data={data.conditions}
            onEdit={openEditModal}
            onEditCondition={(condition, index) =>
              openEditModal("conditions", condition, index)
            }
            onAddCondition={() =>
              openEditModal(
                "conditions",
                { name: "", title: "", image: null },
                -1
              )
            }
            onDeleteCondition={openDeleteConditionDialog}
            loading={loading.updateConditions}
          />
        )}

        {activeTab === "whyus" && (
          <WhyUsSection data={data.whyUs} onEdit={openEditModal} />
        )}

        {activeTab === "faq" && (
          <FaqSection
            data={data.faq}
            onAdd={addFaq}
            onDelete={openDeleteFaqDialog}
            onEdit={(item) => openEditModal("faq", item)}
          />
        )}

        {activeTab === "terms" && (
          <TermsSection data={data.terms} onEdit={openEditModal} />
        )}

        {activeTab === "contact" && (
          <ContactSection data={data.contact} onEdit={openEditModal} />
        )}

        {activeTab === "about" && (
          <AboutSection data={data.about} onEdit={openEditModal} />
        )}

        {activeTab === "featuredTherapist" && (
          <TeamSection data={data.featuredTherapist} onEdit={openEditModal} />
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-xs sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {modalSection === "hero" && "Edit Hero Section"}
              {modalSection === "step" &&
                (modalItem ? "Edit Step" : "Add Multiple Steps")}
              {modalSection === "conditions" &&
                (modalItemIndex === -1
                  ? "Add Condition"
                  : modalItemIndex !== null && modalItemIndex >= 0
                  ? "Edit Condition"
                  : "Edit Conditions Section")}
              {modalSection === "whyUs" && "Edit Why Choose Us"}
              {modalSection === "faq" &&
                (modalItem ? "Edit FAQ" : "Manage FAQs")}
              {modalSection === "featuredTherapist" && "Edit Team Member"}
              {modalSection === "terms" && "Edit Terms and Conditions"}
              {modalSection === "contact" && "Edit Contact Info"}
              {modalSection === "about" && "Edit About Us"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            {modalSection === "hero" && (
              <EditHeroFormComponent
                data={modalItem || data.hero}
                onSave={saveModalChanges}
                onCancel={closeEditModal}
              />
            )}

            {modalSection === "step" &&
              (modalItem ? (
                <EditStepFormComponent
                  data={modalItem}
                  onSave={saveModalChanges}
                  onCancel={closeEditModal}
                  isNew={!modalItem}
                />
              ) : (
                <MultiStepForm
                  data={{
                    heading: data.steps?.[0]?.title || "",
                    subHeading: data.steps?.[0]?.description || "",
                  }}
                  onSave={saveModalChanges}
                  onCancel={closeEditModal}
                />
              ))}

            {modalSection === "conditions" &&
              (modalItemIndex === -1 ? (
                // Adding new individual condition
                <EditConditionForm
                  data={{ name: "", title: "", image: null }}
                  onSave={saveModalChanges}
                  onCancel={closeEditModal}
                />
              ) : modalItemIndex !== null && modalItemIndex >= 0 ? (
                // Editing individual condition
                <EditConditionForm
                  data={modalItem}
                  onSave={saveModalChanges}
                  onCancel={closeEditModal}
                />
              ) : (
                // Editing entire conditions section
                <EditConditionsFormComponent
                  data={modalItem || data.conditions}
                  onSave={saveModalChanges}
                  onCancel={closeEditModal}
                />
              ))}

            {modalSection === "whyUs" && (
              <EditWhyUsForm
                data={modalItem || data.whyUs}
                onSave={saveModalChanges}
                onCancel={closeEditModal}
              />
            )}

            {modalSection === "faq" && (
              <EditFaqForm
                data={modalItem}
                onSave={saveModalChanges}
                onCancel={closeEditModal}
                isNew={!modalItem}
              />
            )}

            {modalSection === "featuredTherapist" && (
              <EditFeaturedTherapistForm
                data={modalItem || data.featuredTherapist}
                onSave={saveModalChanges}
                onCancel={closeEditModal}
              />
            )}

            {modalSection === "terms" && (
              <EditTermsForm
                data={modalItem || data.terms}
                onSave={saveModalChanges}
                onCancel={closeEditModal}
              />
            )}

            {modalSection === "contact" && (
              <EditContactForm
                data={modalItem || data.contact}
                onSave={saveModalChanges}
                onCancel={closeEditModal}
              />
            )}

            {modalSection === "about" && (
              <EditAboutForm
                data={modalItem || data.about}
                onSave={saveModalChanges}
                onCancel={closeEditModal}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteItemType === "step"
                ? "This action cannot be undone. This will permanently delete the step from the How It Works section."
                : "This action cannot be undone. This will permanently delete the FAQ from the Frequently Asked Questions section."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteItem}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {deleteItemType === "step" ? "Step" : "FAQ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Condition Confirmation Modal */}
      <AlertDialog
        open={isDeleteConditionDialogOpen}
        onOpenChange={setIsDeleteConditionDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              condition from the Conditions section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteCondition}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCondition}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Condition
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const EditWhyUsForm = ({ data, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ...data,
    stats: data?.stats || [],
    features: data?.features || [],
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStatChange = (index, field, value) => {
    const newStats = [...(formData.stats || [])];
    newStats[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      stats: newStats,
    }));
  };

  const addStat = () => {
    const newStat = { label: "", value: "", description: "" };
    setFormData((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), newStat],
    }));
  };

  const removeStat = (index) => {
    const newStats = (formData.stats || []).filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      stats: newStats,
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), ""],
    }));
  };

  const removeFeature = (index) => {
    const newFeatures = (formData.features || []).filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const handleSubmit = () => {
    // Filter out stats that have empty required fields
    const cleanedStats = (formData.stats || []).filter(
      (stat) =>
        stat.label &&
        stat.label.trim() !== "" &&
        stat.value &&
        stat.value.trim() !== "" &&
        stat.description &&
        stat.description.trim() !== ""
    );

    // Create updated form data with cleaned stats
    const updatedFormData = {
      ...formData,
      stats: cleanedStats,
    };

    onSave(updatedFormData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Section Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>
      <div>
        <Label>Short Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Statistics</Label>
          <Button type="button" variant="outline" size="sm" onClick={addStat}>
            <Plus className="h-4 w-4 mr-2" /> Add Stat
          </Button>
        </div>
        <div className="space-y-3">
          {(formData.stats || []).map((stat, index) => (
            <div key={index} className="grid grid-cols-3 gap-2">
              <div>
                <Label>Label</Label>
                <Input
                  value={stat.label}
                  onChange={(e) =>
                    handleStatChange(index, "label", e.target.value)
                  }
                  placeholder="Stat label"
                />
              </div>
              <div>
                <Label>Value</Label>
                <Input
                  value={stat.value}
                  onChange={(e) =>
                    handleStatChange(index, "value", e.target.value)
                  }
                  placeholder="Stat value"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={stat.description}
                  onChange={(e) =>
                    handleStatChange(index, "description", e.target.value)
                  }
                  placeholder="Description"
                />
              </div>
              <div className="col-span-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeStat(index)}
                  disabled={(formData.stats || []).length <= 1}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove Stat
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Features</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFeature}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Feature
          </Button>
        </div>
        <div className="space-y-2">
          {(formData.features || []).map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFeature(index)}
                disabled={(formData.features || []).length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <DialogFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Save Changes
        </Button>
      </DialogFooter>
    </div>
  );
};

const EditFaqForm = ({ data, onSave, onCancel, isNew }) => {
  const [formData, setFormData] = useState<FaqData>(
    data || { _id: "", question: "", answer: "" }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.question.trim()) {
      newErrors.question = "Question is required";
    }

    if (!formData.answer.trim()) {
      newErrors.answer = "Answer is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (newItem = false) => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    onSave({ ...formData, isNew: newItem });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Question</Label>
        <Input
          value={formData.question}
          onChange={(e) => handleChange("question", e.target.value)}
          placeholder="FAQ Question"
          className={errors.question ? "border-red-500" : ""}
        />
        {errors.question && (
          <p className="text-red-500 text-sm mt-1">{errors.question}</p>
        )}
      </div>
      <div>
        <Label>Answer</Label>
        <Textarea
          value={formData.answer}
          onChange={(e) => handleChange("answer", e.target.value)}
          placeholder="FAQ Answer"
          className={errors.answer ? "border-red-500" : ""}
        />
        {errors.answer && (
          <p className="text-red-500 text-sm mt-1">{errors.answer}</p>
        )}
      </div>
      <DialogFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit(isNew)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
              {isNew ? "Adding..." : "Saving..."}
            </>
          ) : isNew ? (
            "Add FAQ"
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

const EditTermsForm = ({ data, onSave, onCancel }) => {
  const [formData, setFormData] = useState(data);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Page Title (Terms, Privacy)</Label>
        <Input
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>
      <div>
        <Label>Version</Label>
        <Input
          value={formData.version || ""}
          onChange={(e) => handleChange("version", e.target.value)}
          placeholder="e.g., 1.0.0"
        />
      </div>
      <div>
        <Label>Last Updated Date</Label>
        <Input
          value={formData.lastUpdated || ""}
          onChange={(e) => handleChange("lastUpdated", e.target.value)}
          placeholder="e.g., January 1, 2026"
        />
      </div>
      <div>
        <Label>Full page content...</Label>
        <Textarea
          rows={10}
          value={formData.content}
          onChange={(e) => handleChange("content", e.target.value)}
          placeholder="Full page content..."
        />
      </div>
      <DialogFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Save Changes
        </Button>
      </DialogFooter>
    </div>
  );
};

const EditFeaturedTherapistForm = ({ data, onSave, onCancel }) => {
  const [formData, setFormData] = useState(data);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>
      <div>
        <Label>Specialty</Label>
        <Input
          value={formData.specialty}
          onChange={(e) => handleChange("specialty", e.target.value)}
        />
      </div>
      <div>
        <Label>Experience</Label>
        <Input
          value={formData.experience}
          onChange={(e) => handleChange("experience", e.target.value)}
        />
      </div>
      <div>
        <Label>Rating</Label>
        <Input
          value={formData.rating}
          onChange={(e) => handleChange("rating", e.target.value)}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          rows={4}
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
      <div>
        <Label>CTA Text</Label>
        <Input
          value={formData.ctaText}
          onChange={(e) => handleChange("ctaText", e.target.value)}
        />
      </div>
      <div>
        <Label>View Profile Text</Label>
        <Input
          value={formData.viewProfileText}
          onChange={(e) => handleChange("viewProfileText", e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="available-today"
          checked={formData.availableToday}
          onChange={(e) => handleChange("availableToday", e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="available-today">Available Today</Label>
      </div>
      <div>
        <Label>Therapist Image</Label>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="therapist-image-upload"
            />
            <label
              htmlFor="therapist-image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent transition-colors"
            >
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Click to upload image
              </span>
            </label>
          </div>
          {formData.image && (
            <div className="flex-1">
              <div className="aspect-video bg-muted rounded-lg border flex items-center justify-center overflow-hidden">
                <img
                  src={
                    typeof formData.image === "string"
                      ? formData.image
                      : URL.createObjectURL(formData.image)
                  }
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <DialogFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Save Changes
        </Button>
      </DialogFooter>
    </div>
  );
};

const EditContactForm = ({ data, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ...data,
    socialLinks: data?.socialLinks || [],
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialLinkChange = (index, field, value) => {
    const newSocialLinks = [...(formData.socialLinks || [])];
    newSocialLinks[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      socialLinks: newSocialLinks,
    }));
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), { platform: "", url: "" }],
    }));
  };

  const removeSocialLink = (index) => {
    const newSocialLinks = (formData.socialLinks || []).filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      socialLinks: newSocialLinks,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Section Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
      <div>
        <Label>Email Address</Label>
        <Input
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>
      <div>
        <Label>Phone Number</Label>
        <Input
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>
      <div>
        <Label>Address</Label>
        <Textarea
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Latitude</Label>
          <Input
            type="number"
            step="any"
            value={formData.latitude || ""}
            onChange={(e) =>
              handleChange(
                "latitude",
                e.target.value ? parseFloat(e.target.value) : null
              )
            }
            placeholder="e.g., 40.7128"
          />
        </div>
        <div>
          <Label>Longitude</Label>
          <Input
            type="number"
            step="any"
            value={formData.longitude || ""}
            onChange={(e) =>
              handleChange(
                "longitude",
                e.target.value ? parseFloat(e.target.value) : null
              )
            }
            placeholder="e.g., -74.0060"
          />
        </div>
      </div>
      <div>
        <Label>Business Hours</Label>
        <Textarea
          value={formData.hours}
          onChange={(e) => handleChange("hours", e.target.value)}
          placeholder="Enter business hours (e.g., Monday-Friday: 8:00 AM - 8:00 PM)"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Social Media Links</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSocialLink}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Link
          </Button>
        </div>
        <div className="space-y-2">
          {(formData.socialLinks || []).map((social, index) => (
            <div key={index} className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  value={social.platform}
                  onChange={(e) =>
                    handleSocialLinkChange(index, "platform", e.target.value)
                  }
                  placeholder="Platform (e.g., Facebook)"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  value={social.url}
                  onChange={(e) =>
                    handleSocialLinkChange(index, "url", e.target.value)
                  }
                  placeholder="URL"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSocialLink(index)}
                  disabled={(formData.socialLinks || []).length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <DialogFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Save Changes
        </Button>
      </DialogFooter>
    </div>
  );
};


const EditAboutForm = ({ data, onSave, onCancel }: { data: AboutData; onSave: (data: any) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
        ...data,
        values: data?.values || [],
        images: data?.images || []
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleValuesChange = (index, value) => {
        const newValues = [...(formData.values || [])];
        newValues[index] = value;
        setFormData(prev => ({
            ...prev,
            values: newValues
        }));
    };

    const addValue = () => {
        setFormData(prev => ({
            ...prev,
            values: [...(prev.values || []), '']
        }));
    };

    const removeValue = (index) => {
        const newValues = (formData.values || []).filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            values: newValues
        }));
    };

    // Handle single image upload (legacy support)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
        }
    };

    // Handle multiple images upload
    const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...files]
            }));
        }
    };

    // Remove image from array
    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Set primary image (move to first position)
    const setPrimaryImage = (index) => {
        const newImages = [...formData.images];
        const [movedImage] = newImages.splice(index, 1);
        newImages.unshift(movedImage);
        
        setFormData(prev => ({
            ...prev,
            images: newImages
        }));
    };

    // Get image source (handles both File objects and URLs)
    const getImageSrc = (image: string | File | Blob) => {
        if (typeof image === 'string') {
            return image;
        } else if (image && typeof image === 'object' && 'type' in image && 
                   typeof image.type === 'string' && image.type.startsWith('image/')) {
            // Check if it's a File-like object without using instanceof
            try {
                return URL.createObjectURL(image as Blob);
            } catch (error) {
                console.warn('Failed to create object URL:', error);
                return '';
            }
        }
        return '';
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm">Section Title</Label>
                <Input
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="text-sm"
                />
            </div>
            <div>
                <Label>Description</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                />
            </div>
            <div>
                <Label>Mission Statement</Label>
                <Textarea
                    value={formData.mission}
                    onChange={(e) => handleChange('mission', e.target.value)}
                    rows={3}
                />
            </div>
            <div>
                <Label>Vision Statement</Label>
                <Textarea
                    value={formData.vision}
                    onChange={(e) => handleChange('vision', e.target.value)}
                    rows={3}
                />
            </div>
            <div>
                <Label>Founding Story</Label>
                <Textarea
                    value={formData.foundingStory}
                    onChange={(e) => handleChange('foundingStory', e.target.value)}
                    rows={4}
                />
            </div>
            <div>
                <Label>Team Information</Label>
                <Textarea
                    value={formData.teamInfo}
                    onChange={(e) => handleChange('teamInfo', e.target.value)}
                    rows={3}
                />
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label>Core Values</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addValue}>
                        <Plus className="h-4 w-4 mr-2" /> Add Value
                    </Button>
                </div>
                <div className="space-y-2">
                    {(formData.values || []).map((value, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                value={value}
                                onChange={(e) => handleValuesChange(index, e.target.value)}
                                placeholder={`Value ${index + 1}`}
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => removeValue(index)}
                                disabled={(formData.values || []).length <= 1}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <Label>About Us Images</Label>
                <div className="space-y-4 mt-2">
                    {/* Multiple Image Upload */}
                    <div>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleMultipleImageUpload}
                            multiple
                            className="hidden"
                            id="about-images-upload"
                        />
                        <label
                            htmlFor="about-images-upload"
                            className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent transition-colors"
                        >
                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mb-1 sm:mb-2" />
                            <span className="text-xs sm:text-sm text-muted-foreground">Click to upload multiple images</span>
                            <span className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, GIF (Max 5MB each)</span>
                        </label>
                    </div>
                    
                    {/* Image Gallery Preview */}
                    {formData.images && formData.images.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2">Uploaded Images ({formData.images.length})</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-square bg-muted rounded-lg border overflow-hidden">
                                            <img
                                                src={getImageSrc(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2 p-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setPrimaryImage(index)}
                                                className="h-8 w-8 p-0"
                                                title="Set as primary image"
                                            >
                                                <Star className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeImage(index)}
                                                className="h-8 w-8 p-0"
                                                title="Remove image"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {index === 0 && (
                                            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                                                Primary
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Legacy Single Image Upload (Hidden but kept for backward compatibility) */}
                    <div className="hidden">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="about-image-upload"
                        />
                        <label htmlFor="about-image-upload">Legacy upload</label>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="about-public"
                    checked={formData.isPublic}
                    onChange={(e) => handleChange('isPublic', e.target.checked)}
                    className="h-4 w-4"
                />
                <Label htmlFor="about-public" className="text-sm">Make Public</Label>
            </div>
            <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="button" onClick={handleSubmit}>Save Changes</Button>
            </DialogFooter>
        </div>
    );
};