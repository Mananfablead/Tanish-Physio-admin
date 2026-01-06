import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockServices } from "@/lib/mock-data";
import { ArrowLeft, Calendar, Clock, Wallet, Tag, Users } from "lucide-react";

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const serviceId = parseInt(id || "0");
  const service = mockServices.find(s => s.id === serviceId);

  if (!service) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium">Service not found</h3>
            <p className="text-muted-foreground">The requested service could not be found.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/services")}
            >
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/services")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Button>
        <h1 className="text-2xl font-bold">{service.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Image & Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-48 h-48 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge 
                      variant={service.status === "active" ? "default" : "secondary"}
                      className={service.status === "active" ? "bg-success" : "bg-destructive"}
                    >
                      {service.status}
                    </Badge>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">₹{service.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{service.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-muted-foreground">
                    {service.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">What's Included</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Initial assessment and consultation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Personalized treatment plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Hands-on therapy techniques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Home exercise program</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Follow-up progress evaluation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Service Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Service ID</span>
                  <span className="font-medium">#{service.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{service.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{service.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">₹{service.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge 
                    variant={service.status === "active" ? "default" : "secondary"}
                    className={service.status === "active" ? "bg-success" : "bg-destructive"}
                  >
                    {service.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Services */}
          <Card>
            <CardHeader>
              <CardTitle>Related Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockServices
                  .filter(s => s.category === service.category && s.id !== service.id)
                  .slice(0, 3)
                  .map(relatedService => (
                    <div 
                      key={relatedService.id} 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => navigate(`/services/${relatedService.id}`)}
                    >
                      <img
                        src={relatedService.image}
                        alt={relatedService.name}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{relatedService.name}</p>
                        <p className="text-xs text-muted-foreground">₹{relatedService.price}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate(`/services/${service.id}/edit`)}>
                  Edit Service
                </Button>
                <Button variant="outline">
                  View Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}