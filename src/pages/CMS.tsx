import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Eye, FileText, Image, Link, Calendar, User, File, CheckCircle, Clock, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentItem {
    id: string;
    title: string;
    slug: string;
    type: "page" | "post" | "block";
    status: "draft" | "published" | "archived";
    content: string;
    featuredImage?: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    metaTitle?: string;
    metaDescription?: string;
}

export default function CMS() {
    const navigate = useNavigate();
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        type: "page" as "page" | "post" | "block",
        status: "draft" as "draft" | "published" | "archived",
        content: "",
        featuredImage: "",
        metaTitle: "",
        metaDescription: "",
    });

    // Mock data
    useEffect(() => {
        const mockContents: ContentItem[] = [
            {
                id: "1",
                title: "About Us",
                slug: "about-us",
                type: "page",
                status: "published",
                content: "Welcome to our physiotherapy clinic...",
                author: "Admin",
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-20T14:30:00Z",
                metaTitle: "About Our Physiotherapy Clinic",
                metaDescription: "Learn about our experienced team and facilities"
            },
            {
                id: "2",
                title: "Home Page Hero Section",
                slug: "home-hero",
                type: "block",
                status: "published",
                content: "Transform your health with professional physiotherapy services",
                featuredImage: "/images/hero.jpg",
                author: "Admin",
                createdAt: "2024-01-10T09:00:00Z",
                updatedAt: "2024-01-18T16:45:00Z"
            },
            {
                id: "3",
                title: "Blog: Recovery Tips",
                slug: "recovery-tips",
                type: "post",
                status: "draft",
                content: "Essential tips for faster recovery after physiotherapy sessions...",
                author: "Dr. Smith",
                createdAt: "2024-01-22T11:20:00Z",
                updatedAt: "2024-01-22T11:20:00Z"
            }
        ];
        setContents(mockContents);
    }, []);

    const filteredContents = contents.filter(content =>
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        setEditingContent(null);
        setFormData({
            title: "",
            slug: "",
            type: "page",
            status: "draft",
            content: "",
            featuredImage: "",
            metaTitle: "",
            metaDescription: "",
        });
        setIsModalOpen(true);
    };

    const handleEdit = (content: ContentItem) => {
        setEditingContent(content);
        setFormData({
            title: content.title,
            slug: content.slug,
            type: content.type,
            status: content.status,
            content: content.content,
            featuredImage: content.featuredImage || "",
            metaTitle: content.metaTitle || "",
            metaDescription: content.metaDescription || "",
        });
        setIsModalOpen(true);
    };

    const handleView = (content: ContentItem) => {
        navigate(`/cms/${content.id}`);
    };

    const handleSubmit = () => {
        if (editingContent) {
            // Update existing content
            setContents(contents.map(c =>
                c.id === editingContent.id
                    ? { ...c, ...formData, updatedAt: new Date().toISOString() }
                    : c
            ));
        } else {
            // Create new content
            const newContent: ContentItem = {
                id: Math.random().toString(36).substr(2, 9),
                ...formData,
                author: "Admin",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setContents([...contents, newContent]);
        }
        setIsModalOpen(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published": return "bg-green-100 text-green-800";
            case "draft": return "bg-yellow-100 text-yellow-800";
            case "archived": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "page": return <FileText className="w-4 h-4" />;
            case "post": return <FileText className="w-4 h-4" />;
            case "block": return <div className="w-4 h-4 bg-blue-500 rounded-sm" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                    <p className="text-muted-foreground">Manage website content, pages, and blog posts</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                </Button>
            </div>

            {/* Stats Cards */}
       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
  <div className="stat-card">
    <div className="flex items-center justify-between">
      {/* Text */}
      <div>
        <p className="text-2xl font-semibold">{contents.length}</p>
        <p className="text-sm text-muted-foreground">Total Content</p>
      </div>

      {/* Icon */}
      <div className="p-2 rounded-lg bg-success/10">
        <File className="w-5 h-5 text-success" />
      </div>
    </div>
  </div>

  <div className="stat-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-semibold">
          {contents.filter(c => c.status === "published").length}
        </p>
        <p className="text-sm text-muted-foreground">Published</p>
      </div>

      <div className="p-2 rounded-lg bg-primary/10">
        <CheckCircle className="w-5 h-5 text-primary" />
      </div>
    </div>
  </div>

  <div className="stat-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-semibold">
          {contents.filter(c => c.status === "draft").length}
        </p>
        <p className="text-sm text-muted-foreground">Drafts</p>
      </div>

      <div className="p-2 rounded-lg bg-destructive/10">
        <Clock className="w-5 h-5 text-destructive" />
      </div>
    </div>
  </div>

  <div className="stat-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-semibold">
          {contents.filter(c => c.type === "page").length}
        </p>
        <p className="text-sm text-muted-foreground">Pages</p>
      </div>

      <div className="p-2 rounded-lg bg-warning/10">
        <Layers className="w-5 h-5 text-warning" />
      </div>
    </div>
  </div>
</div>


            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Content Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Content Items</CardTitle>
                    <CardDescription>Manage all your website content</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredContents.map((content) => (
                                <TableRow key={content.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(content.type)}
                                            <div>
                                                <div className="font-medium">{content.title}</div>
                                                <div className="text-sm text-muted-foreground">by {content.author}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{content.type}</Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{content.slug}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(content.status)}>{content.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(content.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(content)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(content)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Content Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingContent ? "Edit Content" : "Create New Content"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingContent
                                ? "Modify the content details below"
                                : "Add new content to your website"}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="seo">SEO Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter content title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="url-friendly-slug"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Content Type</Label>
                                    <select
                                        id="type"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="page">Page</option>
                                        <option value="post">Blog Post</option>
                                        <option value="block">Content Block</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="featuredImage">Featured Image URL</Label>
                                <Input
                                    id="featuredImage"
                                    value={formData.featuredImage}
                                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write your content here..."
                                    rows={10}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="seo" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="metaTitle">Meta Title</Label>
                                <Input
                                    id="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                    placeholder="SEO title for search engines"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <Textarea
                                    id="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                    placeholder="Brief description for search engine results"
                                    rows={3}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            {editingContent ? "Update Content" : "Create Content"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div>
    );
}