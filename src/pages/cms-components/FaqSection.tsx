import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";

interface FaqData {
    id: number;
    question: string;
    answer: string;
}

interface FaqSectionProps {
    data: FaqData[];
    onAdd: () => void;
    onDelete: (id: number) => void;
    onEdit: (item: FaqData) => void;
}

export default function FaqSection({ data, onAdd, onDelete, onEdit }: FaqSectionProps) {
    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
                    <div className="flex flex-wrap items-center gap-2">

                        <Button size="sm" variant="outline" onClick={onAdd}>
                            <PlusCircle className="w-4 h-4 mr-2" /> Add FAQ
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                    <table className="data-table min-w-full">
                        <thead className="bg-muted/50">
                            <tr className="text-sm sm:text-base">
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Question</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Answer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.map((faq, index) => (
                                <tr key={faq.id} className="hover:bg-muted/50 transition-colors text-sm">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">Q: {faq.question}</div>
                                    </td>
                                    <td className="px-4 py-3 md:hidden">
                                        <div className="text-xs text-muted-foreground line-clamp-2">A: {faq.answer}</div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <div className="text-xs sm:text-sm text-muted-foreground">{faq.answer}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => onEdit(faq)} className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(faq.id)}
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
        </>
    );
}