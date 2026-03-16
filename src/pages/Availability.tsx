import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sun, Moon, Check, X, Plus, Save, X as XIcon, ChevronLeft, ChevronRight, AlertTriangle, Info, Loader2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/types/store';
import {
  getAllAvailability,
  createAvailability,
  updateAvailability,
  bulkUpdateAvailability,
  setSelectedAvailability,
  clearSelectedAvailability
} from '@/features/availability/availabilitySlice';


const Availability = () => {
  const dispatch = useDispatch();
  const { availability, loading: isLoading, error } = useSelector((state: RootState) => state.availability);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:45'); // Default to 45-minute slot
  const [slotDuration, setSlotDuration] = useState<number>(45); // Default to 45 minutes
  const [slotBookingType, setSlotBookingType] = useState<'regular' | 'free-consultation' | ''>(); // Default to all types
  const [slotSessionType, setSlotSessionType] = useState<'one-to-one' | 'group'>('one-to-one');
  const [slotMaxParticipants, setSlotMaxParticipants] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  
  // State for managing custom time slots
  const [customSlots, setCustomSlots] = useState<any[]>([]);
  
  // State for new slot form

  
  // State for editing slots
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [editSlotStart, setEditSlotStart] = useState('');
  const [editSlotEnd, setEditSlotEnd] = useState('');
  const [editSlotStatus, setEditSlotStatus] = useState('available');
  const [editSlotDuration, setEditSlotDuration] = useState<number>(45);
  const [editSlotBookingType, setEditSlotBookingType] = useState<'regular' | 'free-consultation' | ''>();
  const [editSlotSessionType, setEditSlotSessionType] = useState<'one-to-one' | 'group'>('one-to-one');
  const [editSlotMaxParticipants, setEditSlotMaxParticipants] = useState<number>(5);

  // State for bulk apply preview
  const [bulkApplyPreview, setBulkApplyPreview] = useState<boolean>(false);
  const [bulkApplyDates, setBulkApplyDates] = useState<string[]>([]);

  // State for warnings
  const [warnings, setWarnings] = useState<string[]>([]);

  // State for saving
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const { toast } = useToast();

  // Filter custom slots based on selected duration and booking type
  const filteredCustomSlots = customSlots.filter(slot => {
    const durationMatch = slot.duration === slotDuration;
    const typeMatch = !slotBookingType || slot.bookingType === slotBookingType;
    return durationMatch && typeMatch;
  });

  // Get today's date for highlighting
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Function to check if a date is in the past
  const isPastDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Calendar data from API
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Fetch availability data from Redux store
  useEffect(() => {
    dispatch(getAllAvailability());
  }, [dispatch]);

  // Memoize the calendar weeks to avoid regenerating on every render
  const calendarWeeks = React.useMemo(() => {
    // Generate days for the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Create an array of days with their availability status
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Find availability for this date
      const availabilityForDate = availability.find(item => item.date === dateStr);

      // Determine status based on time slots
      let status = 0; // default to available
      if (availabilityForDate && availabilityForDate.timeSlots) {
        const slots = availabilityForDate.timeSlots;
        const bookedSlots = slots.filter(slot => slot.status === 'booked');
        const unavailableSlots = slots.filter(slot => slot.status === 'unavailable');
        const availableSlots = slots.filter(slot => slot.status === 'available');

        if (bookedSlots.length > 0) {
          status = 1; // booked (if any slots are booked)
        } else if (unavailableSlots.length > 0 && availableSlots.length === 0) {
          status = 2; // holiday/unavailable (all slots unavailable)
        } else if (availableSlots.length > 0) {
          status = 0; // available (has available slots)
        }
      }

      return {
        date: dateStr,
        day,
        status, // 0 = available (green), 1 = booked (blue), 2 = holiday (red)
        availability: availabilityForDate
      };
    });

    // Create weeks for the calendar
    const weeks = [];
    let week = Array(7).fill(null);

    // Fill in the first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      week[i] = null;
    }

    // Fill in the days
    for (let day = 0; day < calendarDays.length; day++) {
      const dayOfWeek = (firstDayOfMonth + day) % 7;
      week[dayOfWeek] = calendarDays[day];

      if (dayOfWeek === 6 || day === calendarDays.length - 1) {
        weeks.push([...week]);
        week = Array(7).fill(null);
      }
    }

    return weeks;
  }, [currentMonth, currentYear, availability]);

  const handleDateClick = (date: string | null) => {
    setSelectedDate(date);
    if (date) {
      // Find existing availability for this date
      const existingAvailability = availability.find(item => item.date === date);

      if (existingAvailability) {
        // Load existing availability data from time slots
        const allSlots = existingAvailability.timeSlots || [];
        
        if (allSlots.length > 0) {
          // Set custom slots to all existing slots
          const normalizedSlots = allSlots.map((slot: any) => {
            const sessionType = slot.sessionType || 'one-to-one';
            const maxParticipants = sessionType === 'group' ? (slot.maxParticipants || 5) : 1;
            const bookedParticipants = typeof slot.bookedParticipants === 'number' ? slot.bookedParticipants : 0;
            return {
              ...slot,
              sessionType,
              maxParticipants,
              bookedParticipants
            };
          });
          setCustomSlots(normalizedSlots);
          
          // Use first slot start time and calculate 45 minutes after as end time
          setStartTime(allSlots[0].start);
          const startDate = new Date(`1970-01-01T${allSlots[0].start}`);
          startDate.setMinutes(startDate.getMinutes() + 45);
          setEndTime(startDate.toTimeString().substring(0, 5));
        } else {
      
          setCustomSlots([]);
        }

        // No need to set holiday/available states - custom slots handle this
      } else {
   
        setCustomSlots([]);
        // Initialize with 45-minute default slot
        setStartTime('10:00');
        const startDate = new Date('1970-01-01T10:00');
        startDate.setMinutes(startDate.getMinutes() + 45);
        setEndTime(startDate.toTimeString().substring(0, 5));
      }
    }
  };

  const isToday = (dateStr: string) => dateStr === todayStr;
  const isSelected = (dateStr: string) => dateStr === selectedDate;

  const handleSave = async () => {
    if (!selectedDate) return;

    try {
      setSaving(true);

      // Use custom slots if available, otherwise create single slot
      const timeSlots = customSlots.length > 0 
        ? [...customSlots]
        : [{
            start: startTime,
            end: endTime,
            status: "available",
            sessionType: slotSessionType,
            maxParticipants: slotSessionType === 'group' ? slotMaxParticipants : 1,
            bookedParticipants: 0
          }];
      
      const normalizedSlots = timeSlots.map((slot: any) => {
        const sessionType = slot.sessionType || 'one-to-one';
        const maxParticipants = sessionType === 'group' ? (slot.maxParticipants || 5) : 1;
        const bookedParticipants = typeof slot.bookedParticipants === 'number' ? slot.bookedParticipants : 0;
        return {
          ...slot,
          sessionType,
          maxParticipants,
          bookedParticipants
        };
      });

      // Validate time slots before saving
      if (customSlots.length === 0) {
        // Validate time intervals (15, 30, 45, 60 minutes)
        const startParts = startTime.split(':');
        const endParts = endTime.split(':');
        const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
        const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
        const duration = endMinutes - startMinutes;
        
        // Check if duration is a valid interval (15, 30, 45, 60, 75, 90, etc. minutes)
        if (duration % 15 !== 0) {
          toast({
            title: "Error",
            description: "Time slots must be in 15-minute increments (e.g., 15, 30, 45, 60, 75, 90 minutes)",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      } else {
        // Validate each custom slot
        for (const slot of customSlots) {
          const startParts = slot.start.split(':');
          const endParts = slot.end.split(':');
          const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
          const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
          const duration = endMinutes - startMinutes;
          
          if (duration % 15 !== 0) {
            toast({
              title: "Error",
              description: `Slot ${slot.start}-${slot.end} must be in 15-minute increments`,
              variant: "destructive",
            });
            setSaving(false);
            return;
          }
        }
      }


      const payload = {
        therapistId: currentUser?._id,
        date: selectedDate,
        timeSlots: normalizedSlots,
      };

      const existingAvailability = availability.find(
        (item: any) => item.date === payload.date
      );

      if (existingAvailability) {
        await dispatch(
          updateAvailability({
            id: existingAvailability._id,
            availabilityData: payload,
          })
        );
        toast({
          title: "Success",
          description: "Availability updated successfully",
        });
      } else {
        await dispatch(createAvailability(payload));
        toast({
          title: "Success",
          description: "Availability created successfully",
        });
      }

      await dispatch(getAllAvailability());
      setSelectedDate(null);
    } catch (error) {
      console.error("Error saving availability:", error);
      toast({
        title: "Error",
        description: "Failed to save availability",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  // Function to handle bulk apply
  const handleBulkApply = () => {
    // Get all dates in current month view that don't have availability set
    const datesWithoutAvailability = calendarWeeks
      .flat()
      .filter(day => day && day.date && !isPastDate(day.date) && !day.availability)
      .map(day => day.date);

    if (datesWithoutAvailability.length === 0) {
      toast({
        title: 'No Dates Available',
        description: 'All dates in this view already have availability set',
        variant: 'destructive',
      });
      return;
    }

    setBulkApplyDates(datesWithoutAvailability);
    setBulkApplyPreview(true);
    setWarnings([`Bulk apply will update ${datesWithoutAvailability.length} dates with the same availability settings`]);
  };

  // Function to clear bulk apply preview
  const clearBulkApplyPreview = () => {
    setBulkApplyPreview(false);
    setBulkApplyDates([]);
    setWarnings([]);
  };

  // Function to execute bulk update
  const executeBulkUpdate = async () => {
    if (bulkApplyDates.length === 0) return;

    try {
      setBulkSaving(true);

      // For bulk update, use custom slots logic
      // Validate time slots before bulk update
      if (customSlots.length === 0) {
        // Validate time intervals (15, 30, 45, 60 minutes)
        const startParts = startTime.split(':');
        const endParts = endTime.split(':');
        const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
        const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
        const duration = endMinutes - startMinutes;
        
        // Check if duration is a valid interval (15, 30, 45, 60, 75, 90, etc. minutes)
        if (duration % 15 !== 0) {
          toast({
            title: "Error",
            description: "Time slots must be in 15-minute increments (e.g., 15, 30, 45, 60, 75, 90 minutes)",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Validate each custom slot
        for (const slot of customSlots) {
          const startParts = slot.start.split(':');
          const endParts = slot.end.split(':');
          const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
          const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
          const duration = endMinutes - startMinutes;
          
          if (duration % 15 !== 0) {
            toast({
              title: "Error",
              description: `Slot ${slot.start}-${slot.end} must be in 15-minute increments`,
              variant: "destructive",
            });
            return;
          }
        }
      }
      
      const timeSlots = customSlots.length > 0
        ? [...customSlots]
        : [{
            start: startTime,
            end: endTime,
            status: "available",
            sessionType: slotSessionType,
            maxParticipants: slotSessionType === 'group' ? slotMaxParticipants : 1,
            bookedParticipants: 0
          }];
      
      const normalizedSlots = timeSlots.map((slot: any) => {
        const sessionType = slot.sessionType || 'one-to-one';
        const maxParticipants = sessionType === 'group' ? (slot.maxParticipants || 5) : 1;
        const bookedParticipants = typeof slot.bookedParticipants === 'number' ? slot.bookedParticipants : 0;
        return {
          ...slot,
          sessionType,
          maxParticipants,
          bookedParticipants
        };
      });

      // Process each date individually since backend bulk update affects entire month
      const promises = bulkApplyDates.map(async (date) => {
        const payload = {
          date,
          timeSlots: normalizedSlots,
          therapistId: currentUser?._id
        };

        // Check if availability already exists for this date
        const existingAvailability = availability.find(item => item.date === date);

        if (existingAvailability) {
          // Update existing availability
          return dispatch(updateAvailability({
            id: existingAvailability._id,
            availabilityData: payload
          }));
        } else {
          // Create new availability
          return dispatch(createAvailability(payload));
        }
      });

      // Execute all updates concurrently
      await Promise.all(promises);

      toast({
        title: 'Success',
        description: `Successfully updated availability for ${bulkApplyDates.length} dates`,
      });

      // Refresh the availability data
      await dispatch(getAllAvailability());

      // Clear bulk apply state
      clearBulkApplyPreview();
    } catch (error) {
      console.error('Error bulk updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to bulk update availability',
        variant: 'destructive',
      });
    } finally {
      setBulkSaving(false);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300'; // Available
      case 1: return 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300';   // Booked
      case 2: return 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300';     // Holiday/Not available
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Available';
      case 1: return 'Booked';
      case 2: return 'Holiday';
      default: return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="page-title">Availability & Schedule</h1>
          <p className="text-muted-foreground mt-2">
            Manage your availability, holidays, and working hours
          </p>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'day' | 'week' | 'month')} className="w-full sm:w-auto">
          <TabsList className="grid w-full sm:w-[300px] grid-cols-3">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkApply}>
            <Plus className="w-4 h-4 mr-2" />
            Bulk Apply
          </Button>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-amber-800 text-sm">{warning}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">

        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm rounded-xl border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-5 h-5" />
                {viewMode === 'day' ? 'Day View' : viewMode === 'week' ? 'Week View' : 'Monthly Calendar'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear(currentYear - 1);
                      } else {
                        setCurrentMonth(currentMonth - 1);
                      }
                    }}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear(currentYear + 1);
                      } else {
                        setCurrentMonth(currentMonth + 1);
                      }
                    }}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                {isLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                      <p className="text-muted-foreground">Loading availability...</p>
                    </div>
                  </div>
                ) : viewMode === 'month' ? (
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}

                    {/* Calendar days */}
                    {calendarWeeks.flat().map((day, index) => {
                      const isCurrentDay = day && isToday(day.date);
                      const isCurrentSelected = day && isSelected(day.date);
                      const isInBulkApply = bulkApplyPreview && day && bulkApplyDates.includes(day.date);

                      return (
                        <div
                          key={index}
                          className={`h-16 p-2 border rounded-lg flex flex-col items-center justify-center transition-all ${day
                            ? isPastDate(day.date)
                              ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200'
                              : `cursor-pointer ${getStatusColor(day.status)} ${isCurrentDay ? 'ring-2 ring-primary ring-offset-2' : ''} ${isCurrentSelected ? 'ring-2 ring-primary ring-offset-2 ring-blue-500' : ''} ${isInBulkApply ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50' : ''}`
                            : 'border-transparent'
                            } ${day && !isPastDate(day.date) ? 'hover:shadow-sm hover:scale-[1.02]' : ''}`}
                          onClick={() => day && !isPastDate(day.date) && handleDateClick(day.date)}
                        >
                          {day ? (
                            <>
                              <span className={`text-sm font-medium ${isCurrentDay ? 'font-bold' : ''}`}>
                                {day.day}
                              </span>
                              <div className="flex justify-center mt-1">
                                {day.availability && (
                                  <div className={`w-2 h-2 rounded-full ${day.status === 0 ? 'bg-green-500' :
                                    day.status === 1 ? 'bg-blue-500' :
                                      'bg-red-500'
                                    }`} />
                                )}
                              </div>
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : viewMode === 'day' ? (
                  // Day View - Show detailed information for selected date or current date
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        {selectedDate
                          ? `Day View: ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
                          : `Day View: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`}
                      </h3>
                      <Button variant="outline" size="sm" onClick={() => setViewMode('month')}>
                        Switch to Month View
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Day availability summary */}
                      <Card className="border">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Availability Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-primary/5 rounded-lg">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-medium">
                                  {(() => {
                                    const dateToCheck = selectedDate || todayStr;
                                    const dayAvailability = availability.find(item => item.date === dateToCheck);
                                    if (dayAvailability) {
                                      return dayAvailability.status === 'unavailable' ? 'Holiday/Not Available' : 'Available';
                                    }
                                    return 'Available';
                                  })()}
                                </p>
                              </div>
                              <div className="p-3 bg-primary/5 rounded-lg">
                                <p className="text-sm text-muted-foreground">Working Hours</p>
                                <p className="font-medium">
                                  {(() => {
                                    const dateToCheck = selectedDate || todayStr;
                                    const dayAvailability = availability.find(item => item.date === dateToCheck);
                                    if (dayAvailability && dayAvailability.timeSlots && dayAvailability.timeSlots.length > 0) {
                                      const availableSlots = dayAvailability.timeSlots.filter(slot => slot.status === 'available');
                                      if (availableSlots.length > 0) {
                                        return `${availableSlots[0].start} - ${availableSlots[availableSlots.length - 1].end}`;
                                      }
                                    }
                                    return 'Not set';
                                  })()}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Time Slots</p>
                              <div className="space-y-2">
                                {(() => {
                                  const dateToCheck = selectedDate || todayStr;
                                  const dayAvailability = availability.find(item => item.date === dateToCheck);
                                  if (dayAvailability && dayAvailability.timeSlots && dayAvailability.timeSlots.length > 0) {
                                    return (
                                      <div className="space-y-1">
                                        {dayAvailability.timeSlots.map((slot, index) => (
                                          <div key={index} className="flex items-center gap-2">
                                            <Badge
                                              variant="secondary"
                                              className={`px-3 py-1 ${slot.status === 'available' ? 'bg-green-100 text-green-800' :
                                                  slot.status === 'booked' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                              {slot.start} - {slot.end}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground capitalize">
                                              {slot.status}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }
                                  return <p className="text-muted-foreground text-sm">No time slots set</p>;
                                })()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Bookings for the day */}
                      <Card className="border">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Bookings
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">No bookings for this day</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  // Week View - Show information for the week
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        Week View: {(() => {
                          const date = selectedDate ? new Date(selectedDate) : new Date();
                          const startOfWeek = new Date(date);
                          const day = startOfWeek.getDay();
                          const diff = startOfWeek.getDate() - day;
                          startOfWeek.setDate(diff);

                          const endOfWeek = new Date(startOfWeek);
                          endOfWeek.setDate(startOfWeek.getDate() + 6);

                          return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                        })()}
                      </h3>
                      <Button variant="outline" size="sm" onClick={() => setViewMode('month')}>
                        Switch to Month View
                      </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <div key={day} className="text-center p-2 font-medium text-sm">
                          {day}
                        </div>
                      ))}

                      {(() => {
                        const date = selectedDate ? new Date(selectedDate) : new Date();
                        const startOfWeek = new Date(date);
                        const day = startOfWeek.getDay();
                        const diff = startOfWeek.getDate() - day;
                        startOfWeek.setDate(diff);

                        const weekDays = [];
                        for (let i = 0; i < 7; i++) {
                          const dayDate = new Date(startOfWeek);
                          dayDate.setDate(startOfWeek.getDate() + i);

                          const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;

                          const dayAvailability = availability.find(item => item.date === dateStr);
                          const status = dayAvailability ?
                            (dayAvailability.status === 'booked' ? 1 :
                              dayAvailability.status === 'unavailable' ? 2 : 0) : 0;

                          const isCurrentDay = dateStr === todayStr;
                          const isCurrentSelected = dateStr === selectedDate;
                          const isInBulkApply = bulkApplyPreview && bulkApplyDates.includes(dateStr);

                          weekDays.push(
                            <div
                              key={i}
                              className={`p-2 border rounded-lg flex flex-col items-center justify-center transition-all ${isPastDate(dateStr)
                                ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200'
                                : `cursor-pointer ${getStatusColor(status)} ${isCurrentDay ? 'ring-2 ring-primary ring-offset-2' : ''} ${isCurrentSelected ? 'ring-2 ring-primary ring-offset-2 ring-blue-500' : ''} ${isInBulkApply ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50' : ''}`
                                } ${!isPastDate(dateStr) ? 'hover:shadow-sm hover:scale-[1.02]' : ''}`}
                              onClick={() => !isPastDate(dateStr) && handleDateClick(dateStr)}
                            >
                              <span className={`text-sm font-medium ${isCurrentDay ? 'font-bold' : ''}`}>
                                {dayDate.getDate()}
                              </span>
                              <div className="flex justify-center mt-1">
                                {dayAvailability && (
                                  <div className={`w-2 h-2 rounded-full ${status === 0 ? 'bg-green-500' :
                                    status === 1 ? 'bg-blue-500' :
                                      'bg-red-500'
                                    }`} />
                                )}
                              </div>
                            </div>
                          );
                        }
                        return weekDays;
                      })()}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Booked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-sm">Holiday/Not Available</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              {viewMode === 'month' && (
                <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm">Holiday/Not Available</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Availability Editor Panel */}
        <div className="lg:col-span-3 sticky top-4">

          {selectedDate ? (
            <Card className="shadow-lg rounded-xl border border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Edit Availability
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                    className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 ">
                  <p className="text-sm font-medium text-primary">Selected Date</p>
                  <p className="text-lg font-semibold mt-1 text-foreground">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* <div className="p-3 bg-primary/10 rounded-lg">
                  <Label className="text-sm font-medium">Selected Date</Label>
                  <p className="text-lg font-semibold mt-1">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div> */}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Time Slots
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="filter-duration" className="text-xs text-muted-foreground">Filter Duration</Label>
                        <select
                          id="filter-duration"
                          value={slotDuration}
                          onChange={(e) => setSlotDuration(Number(e.target.value))}
                          className="h-8 text-xs border border-input rounded-md px-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value={15}>15 min</option>
                          <option value={45}>45 min</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="filter-type" className="text-xs text-muted-foreground">Type</Label>
                        <select
                          id="filter-type"
                          value={slotBookingType || ''}
                          onChange={(e) => setSlotBookingType(e.target.value === '' ? undefined as any : e.target.value as any)}
                          className="h-8 text-xs border border-input rounded-md px-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">All Types</option>
                          <option value="regular">Regular</option>
                          <option value="free-consultation">Free Consultation</option>
                        </select>
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {filteredCustomSlots.length} slot{filteredCustomSlots.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>

                  {/* Display filtered current slots */}
                  <div className="border rounded-xl p-2 bg-muted/5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground">Current Slots</h3>
                      {filteredCustomSlots.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCustomSlots([])}
                          className="h-8 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Clear All
                        </Button>
                      )}
                    </div>
                    {filteredCustomSlots.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {filteredCustomSlots.map((slot, index) => (
                          <div 
                            key={index} 
                            className={`p-2 rounded-lg border transition-all ${
                              editingSlotIndex === index 
                                ? 'border-primary bg-primary/5 shadow-sm' 
                                : 'border-border bg-background hover:border-primary/30 hover:shadow-sm'
                            }`}
                          >
                            {editingSlotIndex === index ? (
                              // Edit Mode
                              <div className="space-y-2">
                                <div className="grid grid-cols-12  gap-2 items-center">
                                  <div className="col-span-4">
                                    <Label htmlFor={`edit-start-${index}`} className="text-xs text-muted-foreground">Start</Label>
                                    <Input
                                      id={`edit-start-${index}`}
                                      type="time"
                                      value={editSlotStart}
                                      onChange={(e) => setEditSlotStart(e.target.value)}
                                      className="text-xs h-9"
                                    />
                                  </div>
                                  <div className="col-span-4">
                                    <Label htmlFor={`edit-end-${index}`} className="text-xs text-muted-foreground">End</Label>
                                    <Input
                                      id={`edit-end-${index}`}
                                      type="time"
                                      value={editSlotEnd}
                                      onChange={(e) => setEditSlotEnd(e.target.value)}
                                      className="text-xs h-9"
                                    />
                                  </div>
                                  <div className="col-span-4 flex flex-col gap-1">
                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                    <select
                                      value={editSlotStatus}
                                      onChange={(e) => setEditSlotStatus(e.target.value)}
                                      className="w-full h-9 text-sm border border-input rounded-md px-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                      <option value="available">Available</option>
                                      <option value="booked">Booked</option>
                                      <option value="unavailable">Unavailable</option>
                                    </select>
                                  </div>
                                  <div className="col-span-4 flex flex-col gap-1">
                                    <Label className="text-xs text-muted-foreground">Duration</Label>
                                    <select
                                      value={editSlotDuration}
                                      onChange={(e) => setEditSlotDuration(Number(e.target.value))}
                                      className="w-full h-9 text-sm border border-input rounded-md px-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                      <option value={15}>15 min</option>
                                      <option value={45}>45 min</option>
                                    </select>
                                  </div>
                                  <div className="col-span-4 flex flex-col gap-1">
                                    <Label className="text-xs text-muted-foreground">Type</Label>
                                    <select
                                      value={editSlotBookingType}
                                      onChange={(e) => setEditSlotBookingType(e.target.value as 'regular' | 'free-consultation')}
                                      className="w-full h-9 text-sm border border-input rounded-md px-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                      <option value="regular">Regular</option>
                                      <option value="free-consultation">Free Consultation</option>
                                    </select>
                                  </div>
                                  <div className="col-span-4 flex flex-col gap-1">
                                    <Label className="text-xs text-muted-foreground">Session</Label>
                                    <select
                                      value={editSlotSessionType}
                                      onChange={(e) => {
                                        const nextType = e.target.value as 'one-to-one' | 'group';
                                        setEditSlotSessionType(nextType);
                                        if (nextType === 'one-to-one') {
                                          setEditSlotMaxParticipants(1);
                                        }
                                      }}
                                      className="w-full h-9 text-sm border border-input rounded-md px-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                      <option value="one-to-one">One-to-One</option>
                                      <option value="group">Group</option>
                                    </select>
                                  </div>
                                  <div className="col-span-4 flex flex-col gap-1">
                                    <Label className="text-xs text-muted-foreground">Max Participants</Label>
                                    <Input
                                      type="number"
                                      min={editSlotSessionType === 'group' ? 2 : 1}
                                      value={editSlotMaxParticipants}
                                      onChange={(e) => setEditSlotMaxParticipants(Math.max(1, Number(e.target.value)))}
                                      disabled={editSlotSessionType !== 'group'}
                                      className="text-xs h-9"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 justify-end pt-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3"
                                    onClick={() => {
                                      // Validate inputs
                                      if (editSlotStart >= editSlotEnd) {
                                        toast({
                                          title: "Error",
                                          description: "End time must be after start time",
                                          variant: "destructive",
                                        });
                                        return;
                                      }
                                      
                                      // Validate time intervals (15, 30, 45, 60 minutes)
                                      const startParts = editSlotStart.split(':');
                                      const endParts = editSlotEnd.split(':');
                                      const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
                                      const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
                                      const duration = endMinutes - startMinutes;
                                      
                                      // Check if duration is a valid interval (15, 30, 45, 60, 75, 90, etc. minutes)
                                      if (duration % 15 !== 0) {
                                        toast({
                                          title: "Error",
                                          description: "Time slots must be in 15-minute increments (e.g., 15, 30, 45, 60, 75, 90 minutes)",
                                          variant: "destructive",
                                        });
                                        return;
                                      }
                                      
                                      // Check for overlapping slots (excluding current slot)
                                      const isOverlapping = customSlots.some((s, i) => {
                                        if (i === index) return false;
                                        return (
                                          (editSlotStart < s.end && editSlotEnd > s.start) ||
                                          (editSlotStart === s.start && editSlotEnd === s.end)
                                        );
                                      });
                                      
                                      if (isOverlapping) {
                                        toast({
                                          title: "Error",
                                          description: "Time slot overlaps with another slot",
                                          variant: "destructive",
                                        });
                                        return;
                                      }

                                      const existingBooked = Number(customSlots[index]?.bookedParticipants || 0);

                                      if (editSlotSessionType === 'one-to-one' && existingBooked > 0) {
                                        toast({
                                          title: "Error",
                                          description: "Cannot switch to one-to-one while participants are already booked.",
                                          variant: "destructive",
                                        });
                                        return;
                                      }

                                      if (editSlotSessionType === 'group' && editSlotMaxParticipants < 2) {
                                        toast({
                                          title: "Error",
                                          description: "Group sessions require at least 2 participants.",
                                          variant: "destructive",
                                        });
                                        return;
                                      }

                                      if (editSlotSessionType === 'group' && existingBooked > editSlotMaxParticipants) {
                                        toast({
                                          title: "Error",
                                          description: "Max participants cannot be less than already booked participants.",
                                          variant: "destructive",
                                        });
                                        return;
                                      }
                                      
                                      // Update the slot
                                      const updatedSlots = [...customSlots];
                                      updatedSlots[index] = {
                                        ...updatedSlots[index],
                                        start: editSlotStart,
                                        end: editSlotEnd,
                                        status: editSlotStatus,
                                        duration: editSlotDuration,
                                        bookingType: editSlotBookingType,
                                        sessionType: editSlotSessionType,
                                        maxParticipants: editSlotSessionType === 'group' ? editSlotMaxParticipants : 1,
                                        bookedParticipants: editSlotSessionType === 'group' ? existingBooked : 0
                                      };
                                      setCustomSlots(updatedSlots);
                                      setEditingSlotIndex(null);
                                      toast({
                                        title: "Success",
                                        description: "Slot updated successfully",
                                      });
                                    }}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3"
                                    onClick={() => setEditingSlotIndex(null)}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{slot.start} - {slot.end}</span>
                                    <div className="flex gap-1 mt-1">
                                      <Badge variant="outline" className="text-xs px-2 py-0">
                                        {slot.duration}min
                                      </Badge>
                                      <Badge variant="outline" className="text-xs px-2 py-0">
                                        {slot.bookingType === 'free-consultation' ? 'Free' : 'Regular'}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs px-2 py-0">
                                        {slot.sessionType === 'group' ? 'Group' : 'One-to-One'}
                                      </Badge>
                                      {slot.sessionType === 'group' && (
                                        <Badge variant="outline" className="text-xs px-2 py-0">
                                          {slot.bookedParticipants ?? 0}/{slot.maxParticipants ?? 0}
                                        </Badge>
                                      )}
                                    </div>
                                    {/* <span className="text-xs text-muted-foreground capitalize">{slot.status}</span> */}
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className={`px-2 py-1 text-xs ${
                                      slot.status === 'available' 
                                        ? 'bg-green-100 text-green-800 border-green-200' 
                                        : slot.status === 'booked' 
                                          ? 'bg-red-100 text-red-800 border-red-200' 
                                          : 'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}
                                  >
                                    {slot.status}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                    onClick={() => {
                                      setEditingSlotIndex(index);
                                      setEditSlotStart(slot.start);
                                      setEditSlotEnd(slot.end);
                                      setEditSlotStatus(slot.status);
                                      setEditSlotDuration(slot.duration || 45);
                                      setEditSlotBookingType(slot.bookingType || 'regular');
                                      setEditSlotSessionType(slot.sessionType || 'one-to-one');
                                      setEditSlotMaxParticipants(slot.sessionType === 'group' ? (slot.maxParticipants || 5) : 1);
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                      <path d="m15 5 4 4"/>
                                    </svg>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => {
                                      setCustomSlots(customSlots.filter((_, i) => i !== index));
                                      toast({
                                        title: "Success",
                                        description: "Slot removed successfully",
                                      });
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                          <Clock className="w-6 h-6" />
                        </div>
                        <p className="text-sm">No time slots configured</p>
                        <p className="text-xs mt-1">Add your first slot below</p>
                        {customSlots.length > 0 && (
                          <p className="text-xs mt-1 text-muted-foreground">Showing {slotDuration}min slots only</p>
                        )}
                        {slotBookingType && customSlots.length > 0 && (
                          <p className="text-xs mt-1 text-muted-foreground">Showing {slotBookingType === 'free-consultation' ? 'Free Consultation' : 'Regular'} slots only</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add More Slot Section */}
                  <div className="border rounded-xl p-4 bg-muted/5">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" />
                      Add New Slot
                    </h3>
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-4">
                        <Label htmlFor="startTime" className="text-xs text-muted-foreground">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => {
                            const newStartTime = e.target.value;
                            setStartTime(newStartTime);
                            // Automatically calculate end time based on selected duration
                            const start = new Date(`1970-01-01T${newStartTime}`);
                            start.setMinutes(start.getMinutes() + slotDuration);
                            setEndTime(start.toTimeString().substring(0, 5));
                          }}
                          className="text-sm h-10"
                        />
                      </div>
                      <div className="col-span-4">
                        <Label htmlFor="endTime" className="text-xs text-muted-foreground">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="text-sm h-10"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="slotDuration" className="text-xs text-muted-foreground">Duration</Label>
                        <select
                          id="slotDuration"
                          value={slotDuration}
                          onChange={(e) => {
                            const selectedDuration = Number(e.target.value);
                            setSlotDuration(selectedDuration);
                            // Automatically calculate end time based on selected start time and new duration
                            if (selectedDuration && startTime) {
                              const start = new Date(`1970-01-01T${startTime}`);
                              start.setMinutes(start.getMinutes() + selectedDuration);
                              setEndTime(start.toTimeString().substring(0, 5));
                            }
                          }}
                          className="w-full h-10 text-sm border border-input rounded-md px-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value={15}>15 min</option>
                          <option value={45}>45 min</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="slotBookingType" className="text-xs text-muted-foreground">Type</Label>
                        <select
                          id="slotBookingType"
                          value={slotBookingType || 'regular'}
                          onChange={(e) => setSlotBookingType(e.target.value === '' ? undefined as any : e.target.value as any)}
                          className="w-full h-10 text-sm border border-input rounded-md px-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">All Types</option>
                          <option value="regular">Regular</option>
                          <option value="free-consultation">Free</option>
                        </select>
                      </div>
                      <div className="col-span-6">
                        <Label htmlFor="slotSessionType" className="text-xs text-muted-foreground">Session Type</Label>
                        <select
                          id="slotSessionType"
                          value={slotSessionType}
                          onChange={(e) => {
                            const nextType = e.target.value as 'one-to-one' | 'group';
                            setSlotSessionType(nextType);
                            if (nextType === 'one-to-one') {
                              setSlotMaxParticipants(1);
                            }
                          }}
                          className="w-full h-10 text-sm border border-input rounded-md px-2 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="one-to-one">One-to-One</option>
                          <option value="group">Group</option>
                        </select>
                      </div>
                      <div className="col-span-6">
                        <Label htmlFor="slotMaxParticipants" className="text-xs text-muted-foreground">Max Participants</Label>
                        <Input
                          id="slotMaxParticipants"
                          type="number"
                          min={slotSessionType === 'group' ? 2 : 1}
                          value={slotMaxParticipants}
                          onChange={(e) => setSlotMaxParticipants(Math.max(1, Number(e.target.value)))}
                          disabled={slotSessionType !== 'group'}
                          className="text-sm h-10"
                        />
                      </div>
                      <div className="col-span-12 pt-3">
                        <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="w-full h-10"
                        onClick={() => {
                            // Validate inputs
                            if (startTime >= endTime) {
                              toast({
                                title: "Error",
                                description: "End time must be after start time",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            // Validate time intervals (15, 30, 45, 60 minutes)
                            const startParts = startTime.split(':');
                            const endParts = endTime.split(':');
                            const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
                            const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
                            const duration = endMinutes - startMinutes;
                            
                            // Check if duration is a valid interval (15, 30, 45, 60, 75, 90, etc. minutes)
                            if (duration % 15 !== 0) {
                              toast({
                                title: "Error",
                                description: "Time slots must be in 15-minute increments (e.g., 15, 30, 45, 60, 75, 90 minutes)",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            // Ensure duration matches the selected duration
                            if (duration !== slotDuration) {
                              toast({
                                title: "Error",
                                description: `Selected duration is ${slotDuration} minutes but time difference is ${duration} minutes`,
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            // Check for overlapping slots
                            const isOverlapping = customSlots.some(slot => {
                              return (
                                (startTime < slot.end && endTime > slot.start) ||
                                (startTime === slot.start && endTime === slot.end)
                              );
                            });
                            
                            if (isOverlapping) {
                              toast({
                                title: "Error",
                                description: "Time slot overlaps with an existing slot",
                                variant: "destructive",
                              });
                              return;
                            }

                            if (slotSessionType === 'group' && slotMaxParticipants < 2) {
                              toast({
                                title: "Error",
                                description: "Group sessions require at least 2 participants.",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            // Add new slot
                            setCustomSlots([
                              ...customSlots,
                              {
                                start: startTime,
                                end: endTime,
                                status: "available",
                                duration: slotDuration || 45, // Use selected duration or default to 45
                                bookingType: slotBookingType || 'regular', // Use selected booking type or default to regular
                                sessionType: slotSessionType,
                                maxParticipants: slotSessionType === 'group' ? slotMaxParticipants : 1,
                                bookedParticipants: 0,
                              }
                            ]);
                            
                            // Reset form with duration-based increment validation
                            setStartTime(endTime);
                            const newEnd = new Date(`1970-01-01T${endTime}`);
                            newEnd.setMinutes(newEnd.getMinutes() + slotDuration);
                            setEndTime(newEnd.toTimeString().substring(0, 5));
                            
                            // toast({
                            //   title: "Success",
                            //   description: "Slot added successfully",
                            // });
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Tip: Click the + button to add the slot. The next slot will auto-populate.
                    </p>
                  </div>



                  <div className="space-y-3 pt-4 border-t border-border">
                    {!bulkApplyPreview ? (
                      <Button
                        className="w-full h-11 text-base font-medium"
                        onClick={handleSave}
                        disabled={saving || customSlots.length === 0}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Availability
                          </>
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="w-full h-11 text-base font-medium"
                          onClick={executeBulkUpdate}
                          disabled={bulkSaving || bulkApplyDates.length === 0}
                        >
                          {bulkSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Applying to {bulkApplyDates.length} dates...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Apply to {bulkApplyDates.length} Dates
                            </>
                          )}
                        </Button>
                        <Button
                          className="w-full h-11"
                          variant="outline"
                          onClick={clearBulkApplyPreview}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel Bulk Apply
                        </Button>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Bulk Apply Preview
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Will apply these settings to {bulkApplyDates.length} dates without existing availability
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg rounded-xl border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Availability Editor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-1">No Date Selected</p>
                  <p className="text-sm">Select a date from the calendar to edit availability</p>
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 max-w-xs mx-auto">
                    <p className="text-xs text-primary font-medium">How to use:</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1 text-left">
                      <li>• Click on any date in the calendar</li>
                      <li>• Add time slots for your availability</li>
                      <li>• Set slots as available, booked, or unavailable</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Availability;
