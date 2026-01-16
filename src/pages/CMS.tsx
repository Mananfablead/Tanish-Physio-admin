import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle, MinusCircle, Edit3, Trash2, Save, X, Eye, Layers, CheckCircle, Clock, File, Plus, Edit, Settings, FileImage, Upload } from "lucide-react";
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

export default function CMS() {
    // Initialize with sample data for homepage sections
    const [data, setData] = useState({
        hero: {
            id: 1,
            heading: "Professional Physiotherapy Services",
            subHeading: "Recover, Strengthen, and Improve Your Quality of Life",
            description: "Our expert team of physiotherapists provides personalized care to help you overcome pain and improve mobility.",
            ctaText: "Book a Session",
            image: "/images/hero-image.jpg",
        },
        steps: [
            { id: 1, title: "Consultation", description: "Initial assessment with our expert physiotherapist", icon: "stethoscope", image: "/images/consultation.jpg" },
            { id: 2, title: "Diagnosis", description: "Detailed evaluation to identify the root cause", icon: "clipboard", image: "/images/diagnosis.jpg" },
            { id: 3, title: "Treatment", description: "Personalized therapy sessions tailored to your needs", icon: "heart-pulse", image: "/images/treatment.jpg" },
        ],
        conditions: {
            id: 1,
            title: "Conditions We Treat",
            description: "We specialize in treating various conditions to help you regain your health and mobility.",
            conditions: "Muscle Pain, Back Pain, Neck Pain, Knee Pain, Sports Injuries, Post-Surgery Recovery",
            image: "/images/conditions.jpg"
        },
        whyUs: {
            id: 1,
            title: "Why Choose Our Physiotherapy?",
            description: "With years of experience and a team of certified professionals, we provide the highest quality care.",
            stats: {
                patients: "10K+ Happy Patients",
                therapists: "500+ Therapists",
                sessions: "50K+ Sessions",
                rating: "4.9 Rating",
            },
        },
        faq: [
            { id: 1, question: "How long is a typical session?", answer: "Our sessions typically last 45-60 minutes." },
            { id: 2, question: "Do I need a referral?", answer: "No, you can book directly with us." },
        ],
        terms: {
            id: 1,
            title: "Terms & Conditions",
            content: "These terms and conditions outline the rules and regulations for the use of our services...",
        },
        seo: {
            id: 1,
            metaTitle: "Professional Physiotherapy Services | Tanish Physio",
            metaDescription: "Experience professional physiotherapy services with our expert team. Book your session today.",
        },
    });

    // State for managing edit modes
    const [editingSections, setEditingSections] = useState({
        hero: false,
        steps: {},
        conditions: false,
        whyus: false,
        faq: {},
        terms: false,
        seo: false,
    });

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSection, setModalSection] = useState(null);
    const [modalItem, setModalItem] = useState(null);

    // Open edit modal
    const openEditModal = (section, item = null) => {
        setModalSection(section);
        setModalItem(item);
        setIsModalOpen(true);
    };

    // Close modal
    const closeEditModal = () => {
        setIsModalOpen(false);
        setModalSection(null);
        setModalItem(null);
    };

    // Save changes from modal
    const saveModalChanges = (updatedData) => {
        if (modalSection === 'hero') {
            setData(prev => ({
                ...prev,
                hero: updatedData
            }));
        } else if (modalSection === 'step') {
            if (updatedData.isNew) {
                // Adding a new step
                setData(prev => ({
                    ...prev,
                    steps: [...prev.steps, { ...updatedData, id: Date.now() }]
                }));
            } else {
                // Updating an existing step
                setData(prev => ({
                    ...prev,
                    steps: prev.steps.map(step =>
                        step.id === updatedData.id ? updatedData : step
                    )
                }));
            }
        } else if (modalSection === 'conditions') {
            setData(prev => ({
                ...prev,
                conditions: updatedData
            }));
        } else if (modalSection === 'whyUs') {
            setData(prev => ({
                ...prev,
                whyUs: updatedData
            }));
        } else if (modalSection === 'faq') {
            if (updatedData.isNew) {
                // Adding a new FAQ
                setData(prev => ({
                    ...prev,
                    faq: [...prev.faq, { ...updatedData, id: Date.now() }]
                }));
            } else {
                // Updating an existing FAQ
                setData(prev => ({
                    ...prev,
                    faq: prev.faq.map(faq =>
                        faq.id === updatedData.id ? updatedData : faq
                    )
                }));
            }
        } else if (modalSection === 'terms') {
            setData(prev => ({
                ...prev,
                terms: updatedData
            }));
        } else if (modalSection === 'seo') {
            setData(prev => ({
                ...prev,
                seo: updatedData
            }));
        }
        closeEditModal();
    };

    // Toggle edit mode for a section
    const toggleEdit = (section, id = null) => {
        if (id !== null) {
            setEditingSections(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [id]: !prev[section][id]
                }
            }));
        } else {
            setEditingSections(prev => ({
                ...prev,
                [section]: !prev[section]
            }));
        }
    };

    // Add new step
    const addStep = () => {
        openEditModal('step', null);
    };

    // Delete step
    const deleteStep = (id) => {
        if (window.confirm('Are you sure you want to delete this step?')) {
            setData(prev => ({
                ...prev,
                steps: prev.steps.filter(step => step.id !== id)
            }));
        }
    };

    // Add new FAQ
    const addFaq = () => {
        openEditModal('faq', null);
    };

    // Delete FAQ
    const deleteFaq = (id) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            setData(prev => ({
                ...prev,
                faq: prev.faq.filter(faq => faq.id !== id)
            }));
        }
    };

    // Update data in state
    const updateData = (section, field, value) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Update nested field in data
    const updateNestedData = (section, field, subField, value) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: {
                    ...prev[section][field],
                    [subField]: value
                }
            }
        }));
    };

    // Update step data
    const updateStepData = (id, field, value) => {
        setData(prev => ({
            ...prev,
            steps: prev.steps.map(step =>
                step.id === id ? { ...step, [field]: value } : step
            )
        }));
    };

    // Update FAQ data
    const updateFaqData = (id, field, value) => {
        setData(prev => ({
            ...prev,
            faq: prev.faq.map(faq =>
                faq.id === id ? { ...faq, [field]: value } : faq
            )
        }));
    };

    // Update stat in Why Us section
    const updateStatData = (statField, value) => {
        setData(prev => ({
            ...prev,
            whyUs: {
                ...prev.whyUs,
                stats: {
                    ...prev.whyUs.stats,
                    [statField]: value
                }
            }
        }));
    };

    // Preview content function
    const previewContent = () => {
        alert('Preview functionality would open a preview of the homepage with current content.');
        // In a real app, this would open a preview of the homepage
        console.log('Preview content:', data);
    };

    // Save all content function
    const saveAllContent = () => {
        // In a real app, this would make an API call to save all content
        console.log('Saving all content:', data);
        alert('Content saved successfully!');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="page-header">
                    <h1 className="page-title">Content Management System</h1>
                    <p className="page-subtitle">
                        Manage website sections as per homepage layout
                    </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                    {Object.keys(data).length} Sections
                </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Layers className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{Object.keys(data).length}</p>
                            <p className="text-sm text-muted-foreground">Total Sections</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                            <Edit3 className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{Object.keys(editingSections).filter(key => editingSections[key]).length}</p>
                            <p className="text-sm text-muted-foreground">Editable</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-info/10">
                            <Save className="w-5 h-5 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold">{data.steps.length + data.faq.length}</p>
                            <p className="text-sm text-muted-foreground">Steps: {data.steps.length}, FAQs: {data.faq.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="hero" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
                    <TabsTrigger value="hero">Hero</TabsTrigger>
                    <TabsTrigger value="steps">
                        How It Works ({data.steps.length})
                    </TabsTrigger>
                    <TabsTrigger value="conditions">Conditions</TabsTrigger>
                    <TabsTrigger value="whyus">Why Choose Us</TabsTrigger>
                    <TabsTrigger value="faq">
                        FAQ ({data.faq.length})
                    </TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                {/* HERO */}
                <TabsContent value="hero">
                    <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
                        <div className="p-6">
                            <div className="flex flex-row items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">Hero Section</h2>
                                <Button size="sm" variant="outline" onClick={() => openEditModal('hero', data.hero)}>
                                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <span className="font-medium text-sm text-muted-foreground">Main Heading:</span>
                                            <p className="text-lg font-semibold mt-1">{data.hero.heading}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm text-muted-foreground">Sub Heading:</span>
                                            <p className="mt-1">{data.hero.subHeading}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm text-muted-foreground">Description:</span>
                                            <p className="mt-1">{data.hero.description}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm text-muted-foreground">CTA Button:</span>
                                            <p className="mt-1 font-medium text-primary">{data.hero.ctaText}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="aspect-video bg-muted rounded-lg border flex items-center justify-center overflow-hidden">
                                            {data.hero.image ? (
                                                <img
                                                    src={data.hero.image}
                                                    alt="Hero section"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center text-muted-foreground">
                                                    <FileImage className="mx-auto h-10 w-10" />
                                                    <p className="text-sm mt-2">No image uploaded</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* HOW IT WORKS */}
                <TabsContent value="steps" className="space-y-4">
                    <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
                        <div className="p-6">
                            <div className="flex flex-row items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">How It Works Steps</h2>
                                <Button size="sm" variant="outline" onClick={addStep}>
                                    <PlusCircle className="w-4 h-4 mr-2" /> Add Step
                                </Button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Icon</th>
                                            <th>Image</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.steps.map((step) => (
                                            <tr key={step.id}>
                                                <td className="font-mono text-sm">{step.id}</td>
                                                <td>
                                                    <div className="font-medium">{step.title}</div>
                                                </td>
                                                <td>
                                                    <div className="text-sm text-muted-foreground">{step.description}</div>
                                                </td>
                                                <td>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {step.icon}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {step.image ? (
                                                        <div className="w-10 h-10 rounded-md overflow-hidden border">
                                                            <img
                                                                src={step.image}
                                                                alt="Step"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No image</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="sm" onClick={() => openEditModal('step', step)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteStep(step.id)}
                                                            disabled={data.steps.length <= 1}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* CONDITIONS */}
                <TabsContent value="conditions">
                    <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
                        <div className="p-6">
                            <div className="flex flex-row items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">Conditions We Treat</h2>
                                <Button size="sm" variant="outline" onClick={() => openEditModal('conditions', data.conditions)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                                    <h3 className="text-xl font-bold mb-2">{data.conditions.title}</h3>
                                    <p className="text-muted-foreground mb-4">{data.conditions.description}</p>

                                    <div className="overflow-x-auto">
                                        <table className="data-table">
                                            <tbody>
                                                {data.conditions.conditions.split(',').map((condition, index) => (
                                                    <tr key={index}>
                                                        <td className="font-medium">{condition.trim()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {data.conditions.image && (
                                    <div className="aspect-video bg-muted rounded-lg border flex items-center justify-center overflow-hidden">
                                        <img
                                            src={data.conditions.image}
                                            alt="Conditions"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* WHY CHOOSE US */}
                <TabsContent value="whyus">
                    <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
                        <div className="p-6">
                            <div className="flex flex-row items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">Why Choose Us</h2>
                                <Button size="sm" variant="outline" onClick={() => openEditModal('whyUs', data.whyUs)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold">{data.whyUs.title}</h3>
                                    <p className="text-muted-foreground mt-2">{data.whyUs.description}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="stat-card">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <CheckCircle className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-semibold">{data.whyUs.stats.patients}</p>
                                                <p className="text-sm text-muted-foreground">Happy Patients</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-success/10">
                                                <File className="w-5 h-5 text-success" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-semibold">{data.whyUs.stats.therapists}</p>
                                                <p className="text-sm text-muted-foreground">Expert Therapists</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-info/10">
                                                <Clock className="w-5 h-5 text-info" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-semibold">{data.whyUs.stats.sessions}</p>
                                                <p className="text-sm text-muted-foreground">Completed Sessions</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-warning/10">
                                                <CheckCircle className="w-5 h-5 text-warning" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-semibold">{data.whyUs.stats.rating}</p>
                                                <p className="text-sm text-muted-foreground">Average Rating</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* FAQ */}
                <TabsContent value="faq" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Frequently Asked Questions</CardTitle>
                            <Button size="sm" variant="outline" onClick={addFaq}>
                                <PlusCircle className="w-4 h-4 mr-2" /> Add FAQ
                            </Button>
                        </CardHeader>
                    </Card>

                    <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Question</th>
                                        <th>Answer</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.faq.map((faq) => (
                                        <tr key={faq.id}>
                                            <td>
                                                <div className="font-medium">Q: {faq.question}</div>
                                            </td>
                                            <td>
                                                <div className="text-muted-foreground">{faq.answer}</div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => openEditModal('faq', faq)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteFaq(faq.id)}
                                                        disabled={data.faq.length <= 1}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* TERMS */}
                <TabsContent value="terms">
                    <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
                        <div className="p-6">
                            <div className="flex flex-row items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">Terms & Pages</h2>
                                <Button size="sm" variant="outline" onClick={() => openEditModal('terms', data.terms)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Title:</span>
                                    <h3 className="text-xl font-bold mt-1">{data.terms.title}</h3>
                                </div>
                                <div className="prose prose-sm max-w-none border rounded-lg p-6 bg-muted/10">
                                    <div className="whitespace-pre-line">{data.terms.content}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* SEO */}
                <TabsContent value="seo">
                    <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
                        <div className="p-6">
                            <div className="flex flex-row items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">SEO Settings</h2>
                                <Button size="sm" variant="outline" onClick={() => openEditModal('seo', data.seo)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Meta Title:</span>
                                    <h3 className="text-lg font-bold mt-1">{data.seo.metaTitle}</h3>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Meta Description:</span>
                                    <p className="mt-1 text-muted-foreground">{data.seo.metaDescription}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

            </Tabs>

            {/* Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={closeEditModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {modalSection === 'hero' && 'Edit Hero Section'}
                            {modalSection === 'step' && (modalItem ? 'Edit Step' : 'Manage Steps')}
                            {modalSection === 'conditions' && 'Edit Conditions'}
                            {modalSection === 'whyUs' && 'Edit Why Choose Us'}
                            {modalSection === 'faq' && (modalItem ? 'Edit FAQ' : 'Manage FAQs')}
                            {modalSection === 'terms' && 'Edit Terms & Pages'}
                            {modalSection === 'seo' && 'Edit SEO Settings'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {modalSection === 'hero' && (
                            <EditHeroForm data={modalItem || data.hero} onSave={saveModalChanges} onCancel={closeEditModal} />
                        )}

                        {modalSection === 'step' && (
                            <EditStepForm data={modalItem} onSave={saveModalChanges} onCancel={closeEditModal} isNew={!modalItem} />
                        )}

                        {modalSection === 'conditions' && (
                            <EditConditionsForm data={modalItem || data.conditions} onSave={saveModalChanges} onCancel={closeEditModal} />
                        )}

                        {modalSection === 'whyUs' && (
                            <EditWhyUsForm data={modalItem || data.whyUs} onSave={saveModalChanges} onCancel={closeEditModal} />
                        )}

                        {modalSection === 'faq' && (
                            <EditFaqForm data={modalItem} onSave={saveModalChanges} onCancel={closeEditModal} isNew={!modalItem} />
                        )}

                        {modalSection === 'terms' && (
                            <EditTermsForm data={modalItem || data.terms} onSave={saveModalChanges} onCancel={closeEditModal} />
                        )}

                        {modalSection === 'seo' && (
                            <EditSeoForm data={modalItem || data.seo} onSave={saveModalChanges} onCancel={closeEditModal} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>


        </div>
    );
}

// Form Components
const EditHeroForm = ({ data, onSave, onCancel }) => {
    const [formData, setFormData] = useState(data);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Main Heading</Label>
                <Input
                    value={formData.heading}
                    onChange={(e) => handleChange('heading', e.target.value)}
                />
            </div>
            <div>
                <Label>Sub Heading</Label>
                <Input
                    value={formData.subHeading}
                    onChange={(e) => handleChange('subHeading', e.target.value)}
                />
            </div>
            <div>
                <Label>Description</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                />
            </div>
            <div>
                <Label>CTA Button Text</Label>
                <Input
                    value={formData.ctaText}
                    onChange={(e) => handleChange('ctaText', e.target.value)}
                />
            </div>
            <div>
                <Label>Hero Image</Label>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <div className="flex-1">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="hero-image-upload"
                        />
                        <label
                            htmlFor="hero-image-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent transition-colors"
                        >
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Click to upload image</span>
                        </label>
                    </div>
                    {formData.image && (
                        <div className="flex-1">
                            <div className="aspect-video bg-muted rounded-lg border flex items-center justify-center overflow-hidden">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="button" onClick={handleSubmit}>Save Changes</Button>
            </DialogFooter>
        </div>
    );
};

const EditStepForm = ({ data, onSave, onCancel, isNew }) => {
    const [formData, setFormData] = useState(data || { id: Date.now(), title: '', description: '', icon: '', image: '' });

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (newItem = false) => {
        onSave({ ...formData, isNew: newItem });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Step Title</Label>
                <Input
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                />
            </div>
            <div>
                <Label>Step Description</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                />
            </div>
            <div>
                <Label>Icon name (lucide)</Label>
                <Input
                    value={formData.icon}
                    onChange={(e) => handleChange('icon', e.target.value)}
                />
            </div>
            <div>
                <Label>Step Image</Label>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <div className="flex-1">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id={`step-${formData.id}-image-upload`}
                        />
                        <label
                            htmlFor={`step-${formData.id}-image-upload`}
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent transition-colors"
                        >
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Click to upload image</span>
                        </label>
                    </div>
                    {formData.image && (
                        <div className="flex-1">
                            <div className="aspect-square bg-muted rounded-lg border flex items-center justify-center overflow-hidden">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="button" onClick={() => handleSubmit(isNew)}>{isNew ? 'Add Step' : 'Save Changes'}</Button>
            </DialogFooter>
        </div>
    );
};

const EditConditionsForm = ({ data, onSave, onCancel }) => {
    const [formData, setFormData] = useState(data);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
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
                    onChange={(e) => handleChange('title', e.target.value)}
                />
            </div>
            <div>
                <Label>Short Description</Label>
                <Textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                />
            </div>
            <div>
                <Label>Conditions Treated</Label>
                <Textarea
                    rows={5}
                    value={formData.conditions}
                    onChange={(e) => handleChange('conditions', e.target.value)}
                    placeholder="Muscle Pain, Back Pain, Neck Pain, Knee Pain..."
                />
            </div>
            <div>
                <Label>Conditions Image</Label>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <div className="flex-1">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="conditions-image-upload"
                        />
                        <label
                            htmlFor="conditions-image-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent transition-colors"
                        >
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Click to upload image</span>
                        </label>
                    </div>
                    {formData.image && (
                        <div className="flex-1">
                            <div className="aspect-video bg-muted rounded-lg border flex items-center justify-center overflow-hidden">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="button" onClick={handleSubmit}>Save Changes</Button>
            </DialogFooter>
        </div>
    );
};

const EditWhyUsForm = ({ data, onSave, onCancel }) => {
    const [formData, setFormData] = useState(data);

    const handleChange = (field, value) => {
        if (field === 'stats') {
            setFormData(prev => ({
                ...prev,
                stats: { ...prev.stats, ...value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
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
                    onChange={(e) => handleChange('title', e.target.value)}
                />
            </div>
            <div>
                <Label>Short Description</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                    <Label>Patients Stat</Label>
                    <Input
                        value={formData.stats.patients}
                        onChange={(e) => handleChange('stats', { patients: e.target.value })}
                        placeholder="10K+ Happy Patients"
                    />
                </div>
                <div>
                    <Label>Therapists Stat</Label>
                    <Input
                        value={formData.stats.therapists}
                        onChange={(e) => handleChange('stats', { therapists: e.target.value })}
                        placeholder="500+ Therapists"
                    />
                </div>
                <div>
                    <Label>Sessions Stat</Label>
                    <Input
                        value={formData.stats.sessions}
                        onChange={(e) => handleChange('stats', { sessions: e.target.value })}
                        placeholder="50K+ Sessions"
                    />
                </div>
                <div>
                    <Label>Rating Stat</Label>
                    <Input
                        value={formData.stats.rating}
                        onChange={(e) => handleChange('stats', { rating: e.target.value })}
                        placeholder="4.9 Rating"
                    />
                </div>
            </div>
            <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="button" onClick={handleSubmit}>Save Changes</Button>
            </DialogFooter>
        </div>
    );
};

const EditFaqForm = ({ data, onSave, onCancel, isNew }) => {
    const [formData, setFormData] = useState(data || { id: Date.now(), question: '', answer: '' });

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (newItem = false) => {
        onSave({ ...formData, isNew: newItem });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Question</Label>
                <Input
                    value={formData.question}
                    onChange={(e) => handleChange('question', e.target.value)}
                    placeholder="FAQ Question"
                />
            </div>
            <div>
                <Label>Answer</Label>
                <Textarea
                    value={formData.answer}
                    onChange={(e) => handleChange('answer', e.target.value)}
                    placeholder="FAQ Answer"
                />
            </div>
            <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="button" onClick={() => handleSubmit(isNew)}>{isNew ? 'Add FAQ' : 'Save Changes'}</Button>
            </DialogFooter>
        </div>
    );
};

const EditTermsForm = ({ data, onSave, onCancel }) => {
    const [formData, setFormData] = useState(data);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
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
                    onChange={(e) => handleChange('title', e.target.value)}
                />
            </div>
            <div>
                <Label>Full page content...</Label>
                <Textarea
                    rows={10}
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Full page content..."
                />
            </div>
            <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="button" onClick={handleSubmit}>Save Changes</Button>
            </DialogFooter>
        </div>
    );
};

const EditSeoForm = ({ data, onSave, onCancel }) => {
    const [formData, setFormData] = useState(data);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Meta Title</Label>
                <Input
                    value={formData.metaTitle}
                    onChange={(e) => handleChange('metaTitle', e.target.value)}
                />
            </div>
            <div>
                <Label>Meta Description</Label>
                <Textarea
                    value={formData.metaDescription}
                    onChange={(e) => handleChange('metaDescription', e.target.value)}
                />
            </div>
            <DialogFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="button" onClick={handleSubmit}>Save Changes</Button>
            </DialogFooter>
        </div>
    );
};