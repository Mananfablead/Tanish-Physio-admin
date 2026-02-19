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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);

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
    startTime?: string; // Optional time fields for same-day offers
    endTime?: string;
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
    endDate: '',
    startTime: '09:00', // Default start time
    endTime: '17:00'   // Default end time
  });

  // Set default dates to today for same-day offers and prevent past dates
  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      startDate: today,
      endDate: today
    }));
  }, []);

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
    // Validate dates before submitting
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison

    if (startDate < today) {
      toast.error('Start date cannot be in the past');
      return;
    }

    if (endDate < today) {
      toast.error('End date cannot be in the past');
      return;
    }

    // Allow same dates for same-day offers, but end date must not be before start date
    if (endDate < startDate && endDate.toDateString() !== startDate.toDateString()) {
      toast.error('End date must be after or same as start date');
      return;
    }

    // Validate time when dates are the same
    if (formData.startDate === formData.endDate) {
      const startTime = formData.startTime || '09:00';
      const endTime = formData.endTime || '17:00';
      
      if (endTime <= startTime) {
        toast.error('End time must be after start time');
        return;
      }
    }

    try {
      const response = await offersApi.createOffer({
        ...formData,
        description: "", // Send empty string since field is now optional
        value: parseFloat(formData.value || '0'),
        minimumAmount: 0, // Set to 0 as we're removing this field
        maxDiscountAmount: null, // Set to null as we're removing this field
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      });

      if (response.data.success) {
        toast.success('Offer created successfully!');
        setShowCreateDialog(false);
        // Reset form with today's date
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          code: '',
          discount: '',
          type: 'percentage',
          value: '',
          description: '',
          minimumAmount: '',
          maxDiscountAmount: '',
          usageLimit: '',
          startDate: today,
          endDate: today
        });
        fetchOffers(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error creating offer:', error);
      toast.error(error.response?.data?.message || 'Failed to create offer');
    }
  };

  const handleEditOffer = async () => {
    if (!editingOffer) return;
    
    // Validate dates before submitting
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison

    if (startDate < today) {
      toast.error('Start date cannot be in the past');
      return;
    }

    if (endDate < today) {
      toast.error('End date cannot be in the past');
      return;
    }

    // Allow same dates for same-day offers, but end date must not be before start date
    if (endDate < startDate && endDate.toDateString() !== startDate.toDateString()) {
      toast.error('End date must be after or same as start date');
      return;
    }

    // Validate time when dates are the same
    if (formData.startDate === formData.endDate) {
      const startTime = formData.startTime || '09:00';
      const endTime = formData.endTime || '17:00';
      
      if (endTime <= startTime) {
        toast.error('End time must be after start time');
        return;
      }
    }

    try {
      const response = await offersApi.updateOffer(editingOffer._id, {
        ...formData,
        description: "", // Send empty string since field is now optional
        value: parseFloat(formData.value || '0'),
        minimumAmount: 0, // Set to 0 as we're removing this field
        maxDiscountAmount: null, // Set to null as we're removing this field
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      });

      if (response.data.success) {
        toast.success('Offer updated successfully!');
        setShowEditDialog(false);
        setEditingOffer(null);
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
      console.error('Error updating offer:', error);
      toast.error(error.response?.data?.message || 'Failed to update offer');
    }
  };

  const openEditDialog = (offer: any) => {
    setEditingOffer(offer);
    // Ensure dates are not in the past
    const offerStartDate = new Date(offer.startDate);
    const offerEndDate = new Date(offer.endDate);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    // If dates are in the past, set them to today
    const startDateStr = offerStartDate >= todayDate 
      ? offerStartDate.toISOString().split('T')[0] 
      : today;
    const endDateStr = offerEndDate >= todayDate 
      ? offerEndDate.toISOString().split('T')[0] 
      : today;
    
    setFormData({
      code: offer.code,
      discount: offer.discount,
      type: offer.type,
      value: offer.value.toString(),
      description: offer.description,
      minimumAmount: offer.minimumAmount.toString(),
      maxDiscountAmount: offer.maxDiscountAmount?.toString() || '',
      usageLimit: offer.usageLimit?.toString() || '',
      startDate: startDateStr,
      endDate: endDateStr
    });
    setShowEditDialog(true);
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
    
    // Validate date inputs in real-time
    if (name === 'startDate' || name === 'endDate') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        toast.error(`${name === 'startDate' ? 'Start date' : 'End date'} cannot be in the past`);
        return; // Don't update the state if date is in the past
      }
      
      // Only validate end date is not before start date when dates are different
      if (name === 'endDate') {
        const startDate = new Date(formData.startDate);
        // Allow same dates (for same-day offers)
        if (selectedDate < startDate && selectedDate.toDateString() !== startDate.toDateString()) {
          toast.error('End date must be after or same as start date');
          return;
        }
      }
      
      // If start date is changed and end date is before it, update end date to match
      if (name === 'startDate') {
        const endDate = new Date(formData.endDate);
        if (endDate < selectedDate) {
          setFormData(prev => ({
            ...prev,
            startDate: value,
            endDate: value // Keep dates synchronized for same-day offers
          }));
          return;
        }
      }
    }
    
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
          <CardHeader className="flex flex-row items-center justify-between ">
            <CardTitle>Active Offers</CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>Create Offer</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[100vh] ">
                <DialogHeader>
                  <DialogTitle>Create New Offer</DialogTitle>
                  <DialogDescription>
                    Add a new promotional offer for customers
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="code">Offer Code *</Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g., WELCOME20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Display Discount *</Label>
                    <Input
                      id="discount"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      placeholder="e.g., 20% OFF"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Discount Type *</Label>
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
                    <Label htmlFor="value">Discount Value *</Label>
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      value={formData.value}
                      onChange={handleChange}
                      placeholder="e.g., 20 for 20%"
                      required
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
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      min={today}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate || today}
                      required
                    />
                  </div>
                  {formData.startDate === formData.endDate && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          name="startTime"
                          type="time"
                          value={formData.startTime || '09:00'}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          name="endTime"
                          type="time"
                          value={formData.endTime || '17:00'}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOffer}>Create Offer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Offer Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-2xl max-h-[100vh]">
                <DialogHeader>
                  <DialogTitle>Edit Offer</DialogTitle>
                  <DialogDescription>
                    Update the promotional offer details
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">Offer Code *</Label>
                    <Input
                      id="edit-code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g., WELCOME20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-discount">Display Discount *</Label>
                    <Input
                      id="edit-discount"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      placeholder="e.g., 20% OFF"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Discount Type *</Label>
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
                    <Label htmlFor="edit-value">Discount Value *</Label>
                    <Input
                      id="edit-value"
                      name="value"
                      type="number"
                      value={formData.value}
                      onChange={handleChange}
                      placeholder="e.g., 20 for 20%"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-usageLimit">Usage Limit (optional)</Label>
                    <Input
                      id="edit-usageLimit"
                      name="usageLimit"
                      type="number"
                      value={formData.usageLimit}
                      onChange={handleChange}
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-startDate">Start Date *</Label>
                    <Input
                      id="edit-startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      min={today}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-endDate">End Date *</Label>
                    <Input
                      id="edit-endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate || today}
                      required
                    />
                  </div>
                  {formData.startDate === formData.endDate && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="edit-startTime">Start Time</Label>
                        <Input
                          id="edit-startTime"
                          name="startTime"
                          type="time"
                          value={formData.startTime || '09:00'}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-endTime">End Time</Label>
                        <Input
                          id="edit-endTime"
                          name="endTime"
                          type="time"
                          value={formData.endTime || '17:00'}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditOffer}>Update Offer</Button>
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
                        <TableCell className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(offer)}
                          >
                            Edit
                          </Button>
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
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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