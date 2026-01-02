import React, { useState } from 'react';
import { Calendar, Clock, Sun, Moon, Check, X, Plus, Save, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const Availability = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isHoliday, setIsHoliday] = useState(false);

  // Mock calendar data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
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

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-green-50 border-green-200 hover:bg-green-100'; // Available
      case 1: return 'bg-blue-50 border-blue-200 hover:bg-blue-100';   // Booked
      case 2: return 'bg-red-50 border-red-200 hover:bg-red-100';     // Holiday/Not available
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
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
            Manage your monthly availability, holidays, and working hours
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-3">
          <Card className="shadow-sm rounded-xl border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-5 h-5" />
                Monthly Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {weeks.flat().map((day, index) => (
                    <div 
                      key={index} 
                      className={`h-16 p-2 border rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                        day 
                          ? getStatusColor(day.status) 
                          : 'border-transparent'
                      } ${day ? 'hover:shadow-sm' : ''}`}
                      onClick={() => day && handleDateClick(day.date)}
                    >
                      {day ? (
                        <>
                          <span className="text-sm font-medium">{day.day}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            day.status === 0 ? 'bg-green-500 text-white' :
                            day.status === 1 ? 'bg-blue-500 text-white' :
                            'bg-red-500 text-white'
                          }`}>
                            {getStatusText(day.status).charAt(0)}
                          </span>
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Holiday/Not Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Availability Editor Panel */}
        <div className="lg:col-span-1">
          {selectedDate ? (
            <Card className="shadow-sm rounded-xl border border-border">
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
                <div>
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
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime" className="text-sm font-medium">End Time</Label>
                      <Input 
                        id="endTime" 
                        type="time" 
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
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
                    
                    <div className="flex items-center justify-between">
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
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm rounded-xl border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Availability Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-muted-foreground">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p>Select a date to edit availability</p>
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