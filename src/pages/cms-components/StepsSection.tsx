import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, PlusCircle, Trash2, FileImage, Eye } from "lucide-react";

interface StepData {
    id: number;
    title: string;
    description: string;
    icon: string;
    image: string;
}

interface StepsSectionProps {
    data: StepData[];
    onAdd: () => void;
    onDelete: (id: number) => void;
    onEdit: (item: StepData) => void;
}

export default function StepsSection({ data, onAdd, onDelete, onEdit }: StepsSectionProps) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in shadow-lg">
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">How It Works Steps</h2>
                    <div className="flex flex-wrap items-center gap-2">

                        <Button size="sm" variant="outline" onClick={onAdd}>
                            <PlusCircle className="w-4 h-4 mr-2" /> Add Step
                        </Button>
                    </div>
                </div>
                
                <div className="overflow-x-auto rounded-xl border">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr className="text-sm sm:text-base">
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Icon</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Image</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.map((step, index) => (
                                <tr key={step.id} className="hover:bg-muted/50 transition-colors text-sm">
                                    <td className="px-4 py-3 font-mono text-xs sm:text-sm">{step.id}</td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <div className="font-medium text-sm">{step.title}</div>
                                    </td>
                                    <td className="px-4 py-3 sm:hidden">
                                        <div>
                                            <div className="font-medium text-sm">{step.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{step.description}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <div className="text-xs sm:text-sm text-muted-foreground max-w-xs">{step.description}</div>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <Badge variant="secondary" className="text-xs">
                                            {step.icon}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 hidden xl:table-cell">
                                        {step.image ? (
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border">
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
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => onEdit(step)} className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(step.id)}
                                                disabled={data.length <= 1}
                                                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
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
    );
}