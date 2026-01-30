import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  CreditCard, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Edit,
  Trash2
} from "lucide-react";
import { fetchSubscriptionPlanById } from "@/features/subscriptions/subscriptionSlice";
import { useToast } from "@/hooks/use-toast";
import PageLoader from "@/components/PageLoader";

interface SubscriptionPlan {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  status: string;
  duration?: string;
  autoRenew?: boolean;
  subscribers?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function SubscriptionDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { plans, loading, error } = useSelector((state: any) => state.subscriptions);

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // First check if the plan is already in the store
      const existingPlan = plans.find((p: SubscriptionPlan) => p._id === id || p.id === id);
      if (existingPlan) {
        setPlan(existingPlan);
        setIsLoading(false);
      } else {
        // If not in store, fetch it
        fetchPlanById();
      }
    }
  }, [id, plans]);

  const fetchPlanById = async () => {
    try {
      setIsLoading(true);
      const result = await dispatch(fetchSubscriptionPlanById(id));
      if (fetchSubscriptionPlanById.fulfilled.match(result)) {
        setPlan(result.payload);
      } else {
        throw new Error(result.payload || 'Failed to fetch subscription plan');
      }
    } catch (err: any) {
      console.error('Error fetching subscription plan:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to load subscription plan',
        variant: "destructive",
      });
      navigate('/subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (window.confirm("Are you sure you want to delete this subscription plan? This action cannot be undone.")) {
      // Implementation for deleting the plan would go here
      // This would call the delete action from the subscription slice
      console.log("Delete plan:", id);
    }
  };

  if (isLoading || loading) {
    return <PageLoader text="Loading subscription details..." />;
  }

  if (!plan) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Plan Not Found</h2>
          <p className="text-muted-foreground mb-6">The subscription plan you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/subscriptions">Back to Subscriptions</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="outline" asChild className="mb-4">
            <Link to="/subscriptions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subscriptions
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{plan.name}</h1>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>
          </div>
        </div>
        {/* <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/subscriptions/${id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Plan
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDeletePlan}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Plan
          </Button>
        </div> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{plan.price}</div>
            <p className="text-xs text-muted-foreground">
              {plan.duration ? plan.duration.charAt(0).toUpperCase() + plan.duration.slice(1) : 'Monthly'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.subscriberCount || plan.subscribers || 0}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={plan.status === 'active' ? 'default' : 'secondary'} 
              className={plan.status === 'active' ? 'bg-success' : 'bg-destructive'}
            >
              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Auto-renew: {plan.autoRenew ? 'Enabled' : 'Disabled'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Plan Name</h3>
                  <p className="font-medium">{plan.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge 
                    variant={plan.status === 'active' ? 'default' : 'secondary'} 
                    className={plan.status === 'active' ? 'bg-success' : 'bg-destructive'}
                  >
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                  <p className="font-medium">
                    {plan.duration ? plan.duration.charAt(0).toUpperCase() + plan.duration.slice(1) : 'Monthly'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Auto Renew</h3>
                  <p className="font-medium">{plan.autoRenew ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                  <p className="font-medium">
                    {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p className="font-medium">
                    {plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features && plan.features.length > 0 ? (
                  plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No features defined for this plan</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">Subscribers List</h3>
                <p className="text-muted-foreground mb-4">
                  {plan.subscribers} user{plan.subscribers !== 1 ? 's' : ''} subscribed to this plan
                </p>
                <Button variant="outline" disabled>
                  View Subscriber Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{plan.subscribers || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">0</div>
                    <div className="text-sm text-muted-foreground">Active Subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-destructive">0</div>
                    <div className="text-sm text-muted-foreground">Cancelled Subscribers</div>
                  </div>
                </div>
                <div className="text-muted-foreground">
                  Detailed analytics would be shown here in a real implementation
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}