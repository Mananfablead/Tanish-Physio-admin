import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Clock,
  Wallet,
} from "lucide-react";
import {
  fetchServiceById,
  fetchServices,
} from "@/features/services/serviceSlice";
import PageLoader from "@/components/PageLoader";

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    currentService: service,
    list: allServices,
    loading,
    error,
  } = useSelector((state: any) => state.services);

  useEffect(() => {
    if (id) dispatch(fetchServiceById(id));
    dispatch(fetchServices());
  }, [id, dispatch]);
  
  // Combine all available images
  const combinedImages = [];
  if (service?.images && service.images.length > 0) {
    combinedImages.push(...service.images);
  }
  if (service?.image) {
    combinedImages.push(service.image);
  }
  if (combinedImages.length === 0) {
    combinedImages.push("https://via.placeholder.com/300");
  }

  /* =======================
      LOADING
  ======================== */
  if (loading) {
    return (
      <PageLoader text="Loading service details..." />
    );
  }


  /* =======================
      UI
  ======================== */
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
          Back
        </Button>
        <h1 className="text-2xl font-bold">{service?.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= MAIN ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image + Basic Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  {/* Image Carousel */}
                  <div className="relative w-48 h-48 overflow-hidden rounded-lg">
                    {combinedImages.length > 0 ? (
                      <img
                        src={combinedImages[currentImageIndex]}
                        alt={`${service?.name} - ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                    ) : (
                      <img
                        src="https://via.placeholder.com/300"
                        alt={service?.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Navigation Arrows */}
                    {combinedImages.length > 1 && (
                      <>
                        <button 
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(prev => 
                              prev === 0 ? combinedImages.length - 1 : prev - 1
                            );
                          }}
                          aria-label="Previous image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                            <path d="m15 18-6-6 6-6"/>
                          </svg>
                        </button>
                        <button 
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(prev => 
                              prev === combinedImages?.length - 1 ? 0 : prev + 1
                            );
                          }}
                          aria-label="Next image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {/* Image Indicators */}
                    {combinedImages.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {combinedImages.map((_, idx) => (
                          <div 
                            key={idx}
                            className={`w-2 h-2 rounded-full ${currentImageIndex === idx ? 'bg-white' : 'bg-white/50'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(idx);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Image Count */}
                  {combinedImages.length > 1 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {currentImageIndex + 1} of {combinedImages.length}
                    </p>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      className={
                        service?.status === "active"
                          ? "bg-success"
                          : "bg-destructive"
                      }
                    >
                      {service?.status}
                    </Badge>
                    <Badge variant="outline">{service?.category}</Badge>
                  </div>

                  <p className="text-muted-foreground">
                    {service?.description}
                  </p>

                  <div className="flex gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      ₹{service?.price}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {service?.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Sessions:</span>
                      {service?.sessions}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Validity:</span>
                      {service?.validity} days
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* About Section */}
                  {service?.about && (
                    <div className="pb-4 border-b border-border last:border-0 last:pb-0">
                      <h4 className="font-medium text-lg mb-3">About This Service</h4>
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        {service?.about}
                      </p>
                    </div>
                  )}
                  
                  {/* Features */}
                  <Section
                    title="Features"
                    data={service?.features}
                  />
                  
                  {/* Benefits */}
                  <Section
                    title="Benefits"
                    data={service?.benefits}
                  />
                </div>
                
                <div className="space-y-6">
                  {/* Videos */}
                  <Section
                    title="Videos"
                    data={service?.videos || []}
                    isVideo={true}
                  />
                  
                  {/* Prerequisites */}
                  <Section
                    title="Prerequisites"
                    data={service?.prerequisites}
                  />
                  
                  {/* Contraindications */}
                  <Section
                    title="Contraindications"
                    data={service?.contraindications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================= SIDEBAR ================= */}
        <div className="space-y-6">
          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle>Service Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Service ID" value={service?._id} />
              <InfoRow label="Category" value={service?.category} />
              <InfoRow label="Duration" value={service?.duration} />
              <InfoRow label="Sessions" value={service?.sessions} />
              <InfoRow label="Validity" value={`${service?.validity} days`} />
              <InfoRow label="Price" value={`₹${service?.price}`} />
              <InfoRow
                label="Created"
                value={new Date(service?.createdAt).toLocaleDateString()}
              />
              <InfoRow
                label="Updated"
                value={new Date(service?.updatedAt).toLocaleDateString()}
              />
            </CardContent>
          </Card>

          {/* Related */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Related Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(allServices || [])
                .filter(
                  (s: any) =>
                    s?.category === service?.category &&
                    s?._id !== service?._id
                )
                .slice(0, 3)
                .map((item: any) => (
                  <div
                    key={item._id}
                    onClick={() =>
                      navigate(`/services/${item._id}`)
                    }
                    className="flex gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <img
                      src={item.image || "https://via.placeholder.com/100"}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.price}
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card> */}

          {/* Actions */}
          <Card>
            <CardContent className="space-y-2 p-4 flex flex-col">
              <Button
                onClick={() =>
                  navigate(`/services/${service?._id}/edit`)
                }
              >
                Edit Service
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/bookings?service=${service?._id}`)
                }
              >
                View Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =======================
    REUSABLE COMPONENTS
======================= */

function Section({
  title,
  data,
  isVideo = false,
}: {
  title: string;
  data: string[];
  isVideo?: boolean;
}) {
  return (
    <div>
      <h4 className="font-medium mb-1">{title}</h4>
      {data && data.length > 0 ? (
        isVideo ? (
          <div className="space-y-2">
            {data.map((videoUrl, i) => (
              <div key={i} className="mb-2">
                <video
                  controls
                  className="w-full max-w-xs rounded-lg"
                  poster="/api/placeholder/300/200"
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="text-xs text-muted-foreground mt-1">Video {i + 1}</p>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-1 text-muted-foreground">
            {data.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          No {title.toLowerCase()} available
        </p>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
