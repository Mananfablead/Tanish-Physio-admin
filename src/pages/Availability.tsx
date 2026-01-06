import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sun, Moon, Check, X, Plus, Save, X as XIcon, ChevronLeft, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Availability = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isHoliday, setIsHoliday] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  
  // State for bulk apply preview
  const [bulkApplyPreview, setBulkApplyPreview] = useState<boolean>(false);
  
  // State for warnings
  const [warnings, setWarnings] = useState<string[]>([]);
  
  // Get today's date for highlighting
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Mock calendar data
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Memoize the calendar weeks to avoid regenerating on every render
  const calendarWeeks = React.useMemo(() => {
    // Generate days for the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Create an array of days with their availability status
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Mock status: 0 = available, 1 = booked, 2 = holiday/unavailable
      const status = Math.floor(Math.random() * 3);
      
      return {
        date: dateStr,
        day,
        status, // 0 = available (green), 1 = booked (blue), 2 = holiday (red)
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
  }, [currentMonth, currentYear]);

  const handleDateClick = (date: string | null) => {
    setSelectedDate(date);
    if (date) {
      // Reset to default values when a date is selected
      setStartTime('09:00');
      setEndTime('17:00');
      setIsAvailable(true);
      setIsHoliday(false);
    }
  };

  const isToday = (dateStr: string) => dateStr === todayStr;
  const isSelected = (dateStr: string) => dateStr === selectedDate;

  const handleSave = () => {
    // Mock save functionality
    console.log('Saving availability for', selectedDate, {
      startTime,
      endTime,
      isAvailable,
      isHoliday
    });
    setSelectedDate(null);
  };

  // Function to handle bulk apply
  const handleBulkApply = () => {
    setBulkApplyPreview(true);
    // Add warning about bulk apply
    setWarnings(['Bulk apply will update all selected dates with the same availability settings']);
  };

  // Function to clear bulk apply preview
  const clearBulkApplyPreview = () => {
    setBulkApplyPreview(false);
    setWarnings([]);
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
          <h1 className="text-3xl font-bold tracking-tight">Availability & Schedule</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                {viewMode === 'month' ? (
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
                      
                      return (
                        <div 
                          key={index} 
                          className={`h-16 p-2 border rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                            day 
                              ? `${getStatusColor(day.status)} ${isCurrentDay ? 'ring-2 ring-primary ring-offset-2' : ''} ${isCurrentSelected ? 'ring-2 ring-primary-foreground ring-offset-2' : ''}`
                              : 'border-transparent'
                          } ${day ? 'hover:shadow-sm hover:scale-[1.02]' : ''}`}
                          onClick={() => day && handleDateClick(day.date)}
                        >
                          {day ? (
                            <>
                              <span className={`text-sm font-medium ${isCurrentDay ? 'font-bold' : ''}`}>
                                {day.day}
                              </span>
                              <div className="flex justify-center mt-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  day.status === 0 ? 'bg-green-500' :
                                  day.status === 1 ? 'bg-blue-500' :
                                  'bg-red-500'
                                }`} />
                              </div>
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{viewMode === 'day' ? 'Day View' : 'Week View'}</h3>
                    <p className="text-muted-foreground max-w-md">
                      {viewMode === 'day' 
                        ? 'Day view shows detailed availability for a single day with hourly breakdown.'
                        : 'Week view shows availability across all days in the selected week.'}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={() => setViewMode('month')}>
                        Switch to Month View
                      </Button>
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
        <div className="lg:col-span-1 sticky top-4">
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
                    <Button 
                      className="w-full mt-4" 
                      onClick={handleSave}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    {bulkApplyPreview && (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={clearBulkApplyPreview}
                      >
                        Cancel Bulk Apply
                      </Button>
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