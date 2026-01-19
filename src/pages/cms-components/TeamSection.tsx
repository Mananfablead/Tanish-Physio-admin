import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ArrowRight, Clock, Star, UserCheck, Eye } from "lucide-react";

interface TeamData {
    id: number;
    name: string;
    specialty: string;
    experience: string;
    rating: string;
    description: string;
    image: string;
    availableToday: boolean;
    ctaText: string;
    viewProfileText: string;
}

interface TeamSectionProps {
    data: TeamData;
    onEdit: (section: string, item: TeamData) => void;
}

export default function TeamSection({ data, onEdit }: TeamSectionProps) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in shadow-lg">
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Therapist</h2>
                    <div className="flex flex-wrap items-center gap-2">

                        <Button size="sm" variant="outline" onClick={() => onEdit('featuredTherapist', data)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                    </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <span className="font-medium text-sm text-muted-foreground">Name:</span>
                                <p className="text-xl sm:text-2xl font-bold mt-2">{data.name}</p>
                            </div>
                            <div>
                                <span className="font-medium text-sm text-muted-foreground">Specialty:</span>
                                <p className="mt-2 font-semibold text-primary text-base sm:text-lg">{data.specialty}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{data.experience}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-warning text-warning" />
                                    <span className="font-semibold">{data.rating}</span>
                                </div>
                            </div>
                            <div>
                                <span className="font-medium text-sm text-muted-foreground">About:</span>
                                <p className="mt-2 text-muted-foreground leading-relaxed">{data.description}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                                <Button size="lg" className="rounded-full w-full sm:w-auto">
                                    {data.ctaText}
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-full border-primary/30 w-full sm:w-auto"
                                >
                                    {data.viewProfileText}
                                </Button>
                            </div>
                            <div className="pt-4">
                                <span className="font-medium text-sm text-muted-foreground">Available Today:</span>
                                <p className="mt-2">{data.availableToday ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                        <div className="relative group w-full">
                            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-primary/10 transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02]">
                                {data.image ? (
                                    <img
                                        src={data.image}
                                        alt="Team member"
                                        className="w-full h-64 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 w-full h-64 sm:h-80 flex items-center justify-center">
                                        <div className="text-center">
                                            <UserCheck className="h-12 w-12 sm:h-16 sm:w-16 text-primary/20 mx-auto mb-3 sm:mb-4" />
                                            <p className="text-muted-foreground text-base sm:text-lg">Team Member Photo</p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            </div>
                            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-primary/20 text-primary-foreground px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
                                        {data.specialty}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-success/20 text-success-foreground px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
                                        {data.experience}
                                    </Badge>
                                </div>
                            </div>
                            {data.availableToday && (
                                <Badge className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
                                    <div className="flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white rounded-full animate-pulse"></div>
                                        <span>Available Today</span>
                                    </div>
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}