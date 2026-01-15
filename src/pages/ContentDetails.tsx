import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

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

export default function ContentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockContents: ContentItem[] = [
      {
        id: "1",
        title: "About Us",
        slug: "about-us",
        type: "page",
        status: "published",
        content: "Welcome to our physiotherapy clinic. We provide professional physiotherapy services with a team of experienced therapists dedicated to helping you recover and improve your quality of life.\n\nOur clinic offers:\n- Personalized treatment plans\n- State-of-the-art equipment\n- Expert therapists\n- Comprehensive care approach\n\nWe believe in holistic healing and work closely with each patient to achieve their recovery goals.",
        author: "Admin",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T14:30:00Z",
        metaTitle: "About Our Physiotherapy Clinic",
        metaDescription: "Learn about our experienced team and facilities at our professional physiotherapy clinic."
      },
      {
        id: "2",
        title: "Home Page Hero Section",
        slug: "home-hero",
        type: "block",
        status: "published",
        content: "Transform your health with professional physiotherapy services. Our expert team is dedicated to helping you recover, strengthen, and live your best life. Experience personalized care with cutting-edge techniques and compassionate support.",
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
        content: "Essential tips for faster recovery after physiotherapy sessions:\n\n1. Stay hydrated - Drink plenty of water to help your body heal\n2. Get adequate rest - Your body repairs itself during sleep\n3. Follow prescribed exercises - Consistency is key to recovery\n4. Maintain good nutrition - Proper nutrients support healing\n5. Listen to your body - Don't push beyond comfortable limits\n\nRemember, recovery is a journey, not a race. Be patient with yourself and celebrate small victories along the way.",
        author: "Dr. Smith",
        createdAt: "2024-01-22T11:20:00Z",
        updatedAt: "2024-01-22T11:20:00Z"
      }
    ];

    // Find content by ID
    const foundContent = mockContents.find(item => item.id === id);
    setContent(foundContent || null);
    setLoading(false);
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Content Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested content could not be found.</p>
        <Button onClick={() => navigate("/cms")}>Back to CMS</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/cms")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{content.title}</h1>
            <p className="text-muted-foreground">Content details and management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/cms/${id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Content
          </Button>
          <Button variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Full content text</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-6 bg-muted/10 min-h-[200px]">
                <pre className="whitespace-pre-wrap break-words font-sans text-base">
                  {content.content}
                </pre>
              </div>
            </CardContent>
          </Card>

          {content.featuredImage && (
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 bg-muted/10">
                  <p className="break-all text-sm">{content.featuredImage}</p>
                  {content.featuredImage.startsWith('http') && (
                    <img 
                      src={content.featuredImage} 
                      alt="Featured" 
                      className="mt-2 max-w-full h-auto rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {(content.metaTitle || content.metaDescription) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
                <CardDescription>Search engine optimization details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.metaTitle && (
                    <div>
                      <h3 className="font-medium mb-1">Meta Title</h3>
                      <p className="text-muted-foreground">{content.metaTitle}</p>
                    </div>
                  )}
                  {content.metaDescription && (
                    <div>
                      <h3 className="font-medium mb-1">Meta Description</h3>
                      <p className="text-muted-foreground">{content.metaDescription}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium text-sm text-muted-foreground">ID</span>
                <p className="font-mono text-sm mt-1">{content.id}</p>
              </div>
              <div>
                <span className="font-medium text-sm text-muted-foreground">Slug</span>
                <p className="font-mono text-sm mt-1">{content.slug}</p>
              </div>
              <div>
                <span className="font-medium text-sm text-muted-foreground">Type</span>
                <Badge variant="secondary" className="mt-1">
                  {content.type}
                </Badge>
              </div>
              <div>
                <span className="font-medium text-sm text-muted-foreground">Status</span>
                <Badge className={getStatusColor(content.status) + " mt-1"}>
                  {content.status}
                </Badge>
              </div>
              <div>
                <span className="font-medium text-sm text-muted-foreground">Author</span>
                <p className="mt-1">{content.author}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium text-sm text-muted-foreground">Created</span>
                <p className="mt-1">{new Date(content.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-sm text-muted-foreground">Last Updated</span>
                <p className="mt-1">{new Date(content.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}