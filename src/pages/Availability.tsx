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
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isHoliday, setIsHoliday] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  
  // State for bulk apply preview
  const [bulkApplyPreview, setBulkApplyPreview] = useState<boolean>(false);
  const [bulkApplyDates, setBulkApplyDates] = useState<string[]>([]);
  
  // State for warnings
  const [warnings, setWarnings] = useState<string[]>([]);
  
  // State for saving
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  
  const { toast } = useToast();
  
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
      
      // Determine status based on availability data
      let status = 0; // default to available
      if (availabilityForDate) {
        if (availabilityForDate.status === 'booked') {
          status = 1; // booked
        } else if (availabilityForDate.status === 'unavailable') {
          status = 2; // holiday/unavailable
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
        // Load existing availability data
        setStartTime(existingAvailability.availableTimes?.[0] || '09:00');
        
        // Calculate end time based on the last available time slot
        const availableTimes = existingAvailability.availableTimes || [];
        if (availableTimes.length > 0) {
          const lastTime = availableTimes[availableTimes.length - 1];
          const [hours, minutes] = lastTime.split(':').map(Number);
          const endTime = new Date(0, 0, 0, hours + 1, minutes);
          setEndTime(endTime.toTimeString().substring(0, 5));
        } else {
          setEndTime('17:00');
        }
        
        setIsHoliday(existingAvailability.status === 'unavailable');
        setIsAvailable(existingAvailability.status !== 'unavailable');
      } else {
        // Reset to default values when a date is selected
        setStartTime('09:00');
        setEndTime('17:00');
        setIsAvailable(true);
        setIsHoliday(false);
      }
    }
  };

  const isToday = (dateStr: string) => dateStr === todayStr;
  const isSelected = (dateStr: string) => dateStr === selectedDate;

  const handleSave = async () => {
    if (!selectedDate) return;
    
    try {
      setSaving(true);
      
      // Determine status based on isHoliday flag
      const status = isHoliday ? 'unavailable' : 'available';
      
      // Generate available times based on start and end times
      const availableTimes = [];
      if (isAvailable && !isHoliday) {
        // Simple logic: generate time slots between start and end time
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        
        while (start < end) {
          availableTimes.push(start.toTimeString().substring(0, 5));
          start.setHours(start.getHours() + 1);
        }
      }
      
      // Prepare the availability data
      const payload = {
        date: selectedDate,
        status,
        availableTimes,
        therapistId: currentUser?._id // Use actual therapist ID from current user
      };
      
      // Check if availability already exists for this date
      const existingAvailability = availability.find(item => item.date === selectedDate);
      
      if (existingAvailability) {
        // Update existing availability
        await dispatch(updateAvailability({ id: existingAvailability._id, availabilityData: payload }));
        toast({
          title: 'Success',
          description: 'Availability updated successfully',
        });
      } else {
        // Create new availability
        await dispatch(createAvailability(payload));
        toast({
          title: 'Success',
          description: 'Availability created successfully',
        });
      }
      
      // Refresh the availability data to ensure UI updates immediately
      await dispatch(getAllAvailability());
      
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to save availability',
        variant: 'destructive',
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
      
      // Determine status based on isHoliday flag
      const status = isHoliday ? 'unavailable' : 'available';
      
      // Generate available times based on start and end times
      const availableTimes = [];
      if (isAvailable && !isHoliday) {
        // Simple logic: generate time slots between start and end time
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        
        while (start < end) {
          availableTimes.push(start.toTimeString().substring(0, 5));
          start.setHours(start.getHours() + 1);
        }
      }
      
      // Process each date individually since backend bulk update affects entire month
      const promises = bulkApplyDates.map(async (date) => {
        const payload = {
          date,
          status,
          availableTimes,
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

     <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Calendar Section */}
        <div className="lg:col-span-3">
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
                          className={`h-16 p-2 border rounded-lg flex flex-col items-center justify-center transition-all ${
                            day 
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
                                  <div className={`w-2 h-2 rounded-full ${
                                    day.status === 0 ? 'bg-green-500' :
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
                                    if (dayAvailability && dayAvailability.availableTimes && dayAvailability.availableTimes.length > 0) {
                                      return `${dayAvailability.availableTimes[0]} - ${dayAvailability.availableTimes[dayAvailability.availableTimes.length - 1]}`;
                                    }
                                    return 'Not set';
                                  })()}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Available Time Slots</p>
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  const dateToCheck = selectedDate || todayStr;
                                  const dayAvailability = availability.find(item => item.date === dateToCheck);
                                  if (dayAvailability && dayAvailability.availableTimes && dayAvailability.availableTimes.length > 0) {
                                    return dayAvailability.availableTimes.map((time, index) => (
                                      <Badge key={index} variant="secondary" className="px-3 py-1">
                                        {time}
                                      </Badge>
                                    ));
                                  }
                                  return <p className="text-muted-foreground">No time slots set</p>;
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
                              className={`p-2 border rounded-lg flex flex-col items-center justify-center transition-all ${
                                isPastDate(dateStr)
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
                                  <div className={`w-2 h-2 rounded-full ${
                                    status === 0 ? 'bg-green-500' :
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
    <div className="lg:col-span-2 sticky top-4">

          {selectedDate ? (
            <Card className="shadow-lg rounded-xl border border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Edit Availability</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedDate(null)}
                    className="h-8 w-8 p-0"
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Label className="text-sm font-medium">Selected Date</Label>
                  <p className="text-lg font-semibold mt-1">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime" className="text-sm font-medium">Start Time</Label>
                      <Input 
                        id="startTime" 
                        type="time" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="mt-1 p-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime" className="text-sm font-medium">End Time</Label>
                      <Input 
                        id="endTime" 
                        type="time" 
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="mt-1 p-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <Label htmlFor="available" className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Available
                      </Label>
                      <Switch
                        id="available"
                        checked={isAvailable}
                        onCheckedChange={setIsAvailable}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <Label htmlFor="holiday" className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Mark as Holiday
                      </Label>
                      <Switch
                        id="holiday"
                        checked={isHoliday}
                        onCheckedChange={setIsHoliday}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {!bulkApplyPreview ? (
                      <>
                        <Button 
                          className="w-full mt-4" 
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          className="w-full mt-4" 
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
                          className="w-full" 
                          variant="outline"
                          onClick={clearBulkApplyPreview}
                        >
                          Cancel Bulk Apply
                        </Button>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800 font-medium">Bulk Apply Preview</p>
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
                <CardTitle className="text-lg">Availability Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-1">No Date Selected</p>
                  <p className="text-sm">Select a date to edit availability</p>
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