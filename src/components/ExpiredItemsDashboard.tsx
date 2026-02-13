import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, AlertCircle, CheckCircle, User, Package } from "lucide-react";
import api from '@/api/apiClient';

interface ExpiredSubscription {
  _id: string;
  planName: string;
  planId: string;
  userId: {
    name: string;
    email: string;
  };
  endDate: string;
  isExpired: boolean;
  status: string;
}

interface ExpiredService {
  _id: string;
  serviceId: {
    name: string;
    price: number;
    validity: number;
  };
  userId: {
    name: string;
    email: string;
  };
  expiryDate: string;
  isExpired: boolean;
  daysSinceExpiry: number;
}

export function ExpiredItemsDashboard() {
  const [expiredSubscriptions, setExpiredSubscriptions] = useState<ExpiredSubscription[]>([]);
  const [expiredServices, setExpiredServices] = useState<ExpiredService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExpiredItems();
  }, []);

  const fetchExpiredItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch expired subscriptions
      const subscriptionResponse = await api.get('/subscriptions/admin/expired');
      setExpiredSubscriptions(subscriptionResponse.data.data.subscriptions || []);
      
      // Fetch expired services
      const serviceResponse = await api.get('/subscriptions/admin/expired-services');
      setExpiredServices(serviceResponse.data.data.services || []);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch expired items');
      console.error('Error fetching expired items:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysSinceExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - expiry.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )} */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expired Subscriptions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Expired Subscriptions
              <Badge variant="destructive" className="ml-2">
                {expiredSubscriptions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiredSubscriptions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-slate-500">No expired subscriptions</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {expiredSubscriptions.map((subscription) => (
                  <div key={subscription._id} className="p-4 border rounded-lg bg-red-50/50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{subscription.planName}</h3>
                          <Badge variant="destructive" className="whitespace-nowrap ml-2">
                            Expire
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{subscription.userId?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{subscription.userId?.email || 'N/A'}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <Calendar className="h-3 w-3" />
                          <span>Expired on: {new Date(subscription.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant="destructive" className="whitespace-nowrap">
                        {getDaysSinceExpiry(subscription.endDate)} days ago
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expired Services Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Expired Services
              <Badge variant="destructive" className="ml-2">
                {expiredServices.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiredServices.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-slate-500">No expired services</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {expiredServices.map((service) => (
                  <div key={service._id} className="p-4 border rounded-lg bg-orange-50/50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{service.serviceId?.name || 'N/A'}</h3>
                          <Badge variant="destructive" className="whitespace-nowrap ml-2">
                            Expire
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{service.userId?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{service.userId?.email || 'N/A'}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <Calendar className="h-3 w-3" />
                          <span>Expired on: {new Date(service.expiryDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>Price: ₹{service.serviceId?.price?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                      <Badge variant="destructive" className="whitespace-nowrap">
                        {service.daysSinceExpiry} days ago
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={fetchExpiredItems} variant="outline" className="w-full sm:w-auto">
          Refresh Data
        </Button>
        {expiredSubscriptions.length > 0 && (
          <Button variant="destructive" className="w-full sm:w-auto">
            Notify Expired Subscriptions ({expiredSubscriptions.length})
          </Button>
        )}
        {expiredServices.length > 0 && (
          <Button variant="destructive" className="w-full sm:w-auto">
            Notify Expired Services ({expiredServices.length})
          </Button>
        )}
      </div>
    </div>
  );
}