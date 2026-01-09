import { useEffect } from "react";
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

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  /* =======================
      LOADING
  ======================== */
  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-lg font-medium">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =======================
      ERROR / NOT FOUND
  ======================== */
  if (!service || error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-lg font-medium">Service not found</p>
            <Button onClick={() => navigate("/services")}>
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
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
        <h1 className="text-2xl font-bold">{service.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= MAIN ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image + Basic Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={service.image || "https://via.placeholder.com/300"}
                  alt={service.name}
                  className="w-48 h-48 rounded-lg object-cover"
                />

                <div className="flex-1 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      className={
                        service.status === "active"
                          ? "bg-success"
                          : "bg-destructive"
                      }
                    >
                      {service.status}
                    </Badge>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>

                  <p className="text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      ₹{service.price}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {service.duration}
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
            <CardContent className="space-y-5">
              {/* Features */}
              <Section
                title="Features"
                data={service.features}
              />

              {/* Benefits */}
              <Section
                title="Benefits"
                data={service.benefits}
              />

              {/* Prerequisites */}
              <Section
                title="Prerequisites"
                data={service.prerequisites}
              />

              {/* Contraindications */}
              <Section
                title="Contraindications"
                data={service.contraindications}
              />
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
              <InfoRow label="Service ID" value={service._id} />
              <InfoRow label="Category" value={service.category} />
              <InfoRow label="Duration" value={service.duration} />
              <InfoRow label="Price" value={`₹${service.price}`} />
              <InfoRow
                label="Created"
                value={new Date(service.createdAt).toLocaleDateString()}
              />
              <InfoRow
                label="Updated"
                value={new Date(service.updatedAt).toLocaleDateString()}
              />
            </CardContent>
          </Card>

          {/* Related */}
          <Card>
            <CardHeader>
              <CardTitle>Related Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(allServices || [])
                .filter(
                  (s: any) =>
                    s.category === service.category &&
                    s._id !== service._id
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
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="space-y-2 p-4">
              <Button
                onClick={() =>
                  navigate(`/services/${service._id}/edit`)
                }
              >
                Edit Service
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/bookings?service=${service._id}`)
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
}: {
  title: string;
  data: string[];
}) {
  return (
    <div>
      <h4 className="font-medium mb-1">{title}</h4>
      {data && data.length > 0 ? (
        <ul className="space-y-1 text-muted-foreground">
          {data.map((item, i) => (
            <li key={i}>• {item}</li>
          ))}
        </ul>
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
