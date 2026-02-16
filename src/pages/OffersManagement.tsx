import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { offersApi } from '@/api/offersApi';
import { AdminLayout } from '@/components/layout/AdminLayout';

const OffersManagement = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state for creating new offers
  type FormData = {
    code: string;
    discount: string;
    type: 'percentage' | 'fixed';
    value: string;
    description: string;
    minimumAmount: string;
    maxDiscountAmount: string;
    usageLimit: string;
    startDate: string;
    endDate: string;
  };

  const [formData, setFormData] = useState<FormData>({
    code: '',
    discount: '',
    type: 'percentage',
    value: '',
    description: '',
    minimumAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    startDate: '',
    endDate: ''
  });

  // Load offers
  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await offersApi.getAllOffers();
      if (response.data.success) {
        setOffers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    try {
      const response = await offersApi.createOffer({
        ...formData,
        value: parseFloat(formData.value || '0'),
        minimumAmount: parseFloat(formData.minimumAmount || '0'),
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      });

      if (response.data.success) {
        toast.success('Offer created successfully!');
        setShowCreateDialog(false);
        setFormData({
          code: '',
          discount: '',
          type: 'percentage',
          value: '',
          description: '',
          minimumAmount: '',
          maxDiscountAmount: '',
          usageLimit: '',
          startDate: '',
          endDate: ''
        });
        fetchOffers(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error creating offer:', error);
      toast.error(error.response?.data?.message || 'Failed to create offer');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    
    try {
      const response = await offersApi.deleteOffer(id);

      if (response.data.success) {
        toast.success('Offer deleted successfully!');
        fetchOffers(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      toast.error(error.response?.data?.message || 'Failed to delete offer');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
   
     <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Manage Offers & Coupons</h1>
          <p className="text-muted-foreground">Create and manage promotional offers for customers</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Offers</CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>Create Offer</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[100vh]">
                <DialogHeader>
                  <DialogTitle>Create New Offer</DialogTitle>
                  <DialogDescription>
                    Add a new promotional offer for customers
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="code">Offer Code</Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g., WELCOME20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Display Discount</Label>
                    <Input
                      id="discount"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      placeholder="e.g., 20% OFF"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Discount Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: 'percentage' | 'fixed') => handleSelectChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Discount Value</Label>
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      value={formData.value}
                      onChange={handleChange}
                      placeholder="e.g., 20 for 20%"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="e.g., Welcome discount for new users"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumAmount">Minimum Amount</Label>
                    <Input
                      id="minimumAmount"
                      name="minimumAmount"
                      type="number"
                      value={formData.minimumAmount}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscountAmount">Max Discount Amount (optional)</Label>
                    <Input
                      id="maxDiscountAmount"
                      name="maxDiscountAmount"
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={handleChange}
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
                    <Input
                      id="usageLimit"
                      name="usageLimit"
                      type="number"
                      value={formData.usageLimit}
                      onChange={handleChange}
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOffer}>Create Offer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Type</TableHead>
                    {/* <TableHead>Description</TableHead> */}
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.length > 0 ? (
                    offers.map((offer: any) => (
                      <TableRow key={offer._id}>
                        <TableCell className="font-medium">{offer.code}</TableCell>
                        <TableCell>{offer.discount}</TableCell>
                        <TableCell>{offer.type}</TableCell>
                        {/* <TableCell>{offer.description}</TableCell> */}
                        <TableCell>
                          {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            offer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {offer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {offer.usedCount} / {offer.usageLimit || '∞'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteOffer(offer._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No offers found. Create your first offer using the button above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
 
  );
};

export default OffersManagement;