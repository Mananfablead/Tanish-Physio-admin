import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff, Settings, Users, MessageSquare, MoreVertical, Copy, Share2, Maximize, Minimize, X, ArrowRight } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

interface VideoCallProps {
  sessionId: string;
  user: string;
  therapist: string;
  onLeaveCall: () => void;
}

export function VideoCall({ sessionId, user, therapist, onLeaveCall }: VideoCallProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleAudio = () => setIsAudioOn(!isAudioOn);
  const toggleScreenShare = () => setIsScreenShared(!isScreenShared);
  
  const handleEndCall = () => {
    onLeaveCall();
  };
  
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessage('');
    }
  };

  // Simulate participants list
  const participants = [
    { id: 1, name: therapist, isTherapist: true },
    { id: 2, name: user, isTherapist: false },
  ];

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
            <Video className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0">Live Session</Badge>
              <span className="text-slate-500 text-xs font-medium">• 10:00 AM - 10:45 AM</span>
            </div>
            <h1 className="text-white font-semibold tracking-tight">{therapist}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={`text-slate-400 hover:text-white hover:bg-slate-800 ${showParticipants ? 'bg-slate-800 text-white' : ''}`}
            onClick={() => {
              setShowParticipants(!showParticipants);
              setShowChat(false);
              setShowSettings(false);
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Participants</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-slate-400 hover:text-white hover:bg-slate-800 ${showChat ? 'bg-slate-800 text-white' : ''}`}
            onClick={() => {
              setShowChat(!showChat);
              setShowParticipants(false);
              setShowSettings(false);
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Clinical Chat</span>
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-slate-950 flex overflow-hidden">
        {/* Main Video (Doctor) */}
        <div className={`flex-1 relative flex items-center justify-center transition-all duration-500 ${showParticipants || showChat ? 'md:mr-0' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950/50 pointer-events-none" />

          <div className="text-center">
            <div className="w-40 h-40 bg-slate-900 rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center border border-slate-800 shadow-2xl relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face" 
                alt="{therapist}" 
                className="w-full h-full object-cover opacity-60" 
              />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">{therapist}</h2>
            <p className="text-slate-500 font-medium">Clinical Physiotherapist • Spinal Recovery</p>
          </div>
        </div>

        {/* Side Panels */}
        {showParticipants && (
          <div className="md:w-80 w-full bg-slate-900 md:border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 md:relative absolute inset-0 md:inset-auto md:right-0 z-50">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Participants</h3>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setShowParticipants(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">{therapist.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium text-sm">{therapist}</p>
                    <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4">Host</Badge>
                  </div>
                  <p className="text-slate-500 text-xs">Active</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">{user.charAt(0)}</div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{user}</p>
                  <p className="text-slate-500 text-xs">You</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showChat && (
          <div className="md:w-80 w-full bg-slate-900 md:border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 md:relative absolute inset-0 md:inset-auto md:right-0 z-50">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Clinical Chat</h3>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setShowChat(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                <MessageSquare className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm font-medium">Chat is secure and encrypted</p>
              <p className="text-slate-600 text-[10px] mt-2 px-6">All clinical notes shared here will be saved to your recovery record.</p>
            </div>
            <div className="p-6 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Clinical note..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-600"
                />
                <Button size="icon" className="bg-slate-100 hover:bg-white text-slate-900 rounded-xl" onClick={handleSendMessage}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Self Video (Patient) */}
        <div className={`absolute md:bottom-8 md:right-8 bottom-4 right-4 md:w-64 md:h-44 w-44 h-36 rounded-[2rem] overflow-hidden border-4 border-slate-900 shadow-2xl transition-all duration-500 ${showParticipants || showChat ? 'md:translate-x-[-320px]' : ''}`}>
          <div className="w-full h-full bg-slate-800 relative flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 bg-slate-700 rounded-2xl mx-auto mb-2 flex items-center justify-center border border-slate-600">
                <Video className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">You</p>
            </div>
            {!isVideoOn && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                <VideoOff className="h-6 w-6 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 px-4 py-4 md:px-8 md:py-8 border-t border-slate-800 md:relative fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="w-32 hidden md:flex items-center gap-2">
            <Badge variant="outline" className="border-slate-700 text-slate-500">HD 1080p</Badge>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isAudioOn ? "secondary" : "destructive"}
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700"
              onClick={toggleAudio}
            >
              {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isVideoOn ? "secondary" : "destructive"}
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700"
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isScreenShared ? "default" : "secondary"}
              size="icon"
              className={`rounded-2xl md:w-14 md:h-14 w-12 h-12 border-slate-700 ${isScreenShared ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              onClick={toggleScreenShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="rounded-2xl md:w-16 md:h-14 w-14 h-12 bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 ml-4"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          <div className="w-32 flex justify-end">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-gray-900 rounded-t-lg md:rounded-lg p-4 md:p-6 w-11/12 md:w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Settings</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm font-medium">Video Quality</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mt-1 text-white">
                  <option>Auto</option>
                  <option>720p</option>
                  <option>1080p</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm font-medium">Audio Input</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mt-1 text-white">
                  <option>Default Microphone</option>
                  <option>Headset Microphone</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm font-medium">Audio Output</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mt-1 text-white">
                  <option>Default Speaker</option>
                  <option>Headset Speaker</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowSettings(false)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}