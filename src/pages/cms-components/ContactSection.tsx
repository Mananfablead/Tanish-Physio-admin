import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Mail, Phone, MapPin, Clock, Globe, Eye } from "lucide-react";

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
    hours: string;
    socialLinks: SocialLink[];
}

interface ContactSectionProps {
    data: ContactData;
    onEdit: (section: string, item: ContactData) => void;
    loading?: boolean;
}

export default function ContactSection({ data, onEdit, loading = false }: ContactSectionProps) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in shadow-lg">
            <div className="p-8">
                <div className="flex flex-row items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">Contact Information</h2>
                    <div className="flex items-center gap-2">

                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onEdit('contact', data)}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Edit className="w-4 h-4 mr-2" />
                            )}
                            {loading ? 'Saving...' : 'Edit'}
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <Mail className="h-6 w-6 text-primary" />
                            {data.title}
                        </h3>
                        <p className="text-muted-foreground mt-3 text-lg">{data.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                                        <Mail className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                                            <Mail className="h-5 w-5 text-primary" />
                                            Email
                                        </h4>
                                        <p className="text-muted-foreground">{data.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                                        <Phone className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                                            <Phone className="h-5 w-5 text-primary" />
                                            Phone
                                        </h4>
                                        <p className="text-muted-foreground">{data.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            Address
                                        </h4>
                                        <p className="text-muted-foreground">{data.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                                        <Clock className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-primary" />
                                            Business Hours
                                        </h4>
                                        <pre className="text-muted-foreground whitespace-pre-wrap font-sans">{data.hours}</pre>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                                        <Globe className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                                            <Globe className="h-5 w-5 text-primary" />
                                            Social Media
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {(data.socialLinks || []).map((social, index) => (
                                                <Badge key={index} variant="secondary" className="px-3 py-1">
                                                    {social.platform}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}