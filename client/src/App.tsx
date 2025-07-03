
import { useState, useEffect, useCallback, useRef } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Mic, 
  MicOff, 
  Eye, 
  Palette, 
  Bot, 
  Users, 
  TrendingUp, 
  FileText, 
  Play, 
  Pause, 
  Zap,
  Sparkles,
  Star,
  Github,
  ExternalLink,
  Calendar,
  Clock,
  Target,
  Activity,
  Camera,
  Navigation,
  Layers,
  Monitor,
  Keyboard,
  Accessibility,
  Shield,
  Heart,
  Coffee,
  Contrast,
  Type,
  Wind,
  TreePine,
  Leaf,
  AlertTriangle
} from 'lucide-react';

// Import types
import type { 
  User, 
  PortfolioArtifact, 
  ProgressTracker,
  DailyChangeLog,
  AiCuratorInteraction,
  CollaborativeSpace,
  CreateAiCuratorInteractionInput
} from '../../server/src/schema';

// Default fallback data for demonstration
const defaultUser: User = {
  id: 1,
  name: "Corey Alejandro",
  title: "AI & Data Engineer",
  bio: "Passionate about creating intelligent systems and beautiful data visualizations with a focus on accessibility and neurodivergent-friendly design.",
  avatar_url: null,
  created_at: new Date(),
  updated_at: new Date()
};

const defaultFeaturedArtifacts: PortfolioArtifact[] = [
  {
    id: 1,
    title: "Neural Network Visualization Engine",
    description: "Interactive 3D visualization tool for neural network architectures with real-time training progress.",
    category: "ai_project" as const,
    tags: ["AI", "Visualization", "Three.js", "Neural Networks"],
    thumbnail_url: null,
    model_url: null,
    demo_url: "https://demo.example.com",
    github_url: "https://github.com/corey/neural-viz",
    position_x: 0,
    position_y: 0,
    position_z: 0,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    scale: 1,
    is_featured: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    title: "Accessible Data Dashboard",
    description: "Screen reader compatible dashboard with voice navigation and high contrast mode for data analytics.",
    category: "visualization" as const,
    tags: ["Accessibility", "Dashboard", "Data Viz", "WCAG"],
    thumbnail_url: null,
    model_url: null,
    demo_url: "https://demo.example.com",
    github_url: "https://github.com/corey/accessible-dash",
    position_x: 2,
    position_y: 1,
    position_z: -1,
    rotation_x: 0,
    rotation_y: 45,
    rotation_z: 0,
    scale: 1,
    is_featured: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    title: "Collaborative ML Pipeline",
    description: "Real-time collaborative machine learning pipeline with trauma-informed design principles.",
    category: "collaboration" as const,
    tags: ["Machine Learning", "Collaboration", "Pipeline", "Trauma-Informed"],
    thumbnail_url: null,
    model_url: null,
    demo_url: "https://demo.example.com",
    github_url: "https://github.com/corey/ml-collab",
    position_x: -2,
    position_y: 0,
    position_z: 1,
    rotation_x: 0,
    rotation_y: -30,
    rotation_z: 0,
    scale: 1,
    is_featured: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const defaultProgressTrackers: ProgressTracker[] = [
  {
    id: 1,
    project_name: "3D Portfolio Gallery",
    current_phase: "Frontend Development",
    completion_percentage: 85,
    milestones: [
      { name: "Initial Setup", completed: true, due_date: new Date("2024-01-15") },
      { name: "3D Engine Integration", completed: true, due_date: new Date("2024-02-01") },
      { name: "Accessibility Features", completed: true, due_date: new Date("2024-02-15") },
      { name: "AI Curator Integration", completed: false, due_date: new Date("2024-03-01") },
      { name: "Testing & Optimization", completed: false, due_date: new Date("2024-03-15") }
    ],
    created_at: new Date(),
    updated_at: new Date()
  }
];

const defaultChangeLogs: DailyChangeLog[] = [
  {
    id: 1,
    date: new Date(),
    changes: [
      {
        type: "feature" as const,
        description: "Added Studio Ghibli-inspired design system with gentle animations",
        impact: "medium" as const
      },
      {
        type: "improvement" as const,
        description: "Enhanced accessibility features with better keyboard navigation",
        impact: "high" as const
      },
      {
        type: "bugfix" as const,
        description: "Fixed voice recognition compatibility across different browsers",
        impact: "low" as const
      }
    ],
    created_at: new Date()
  }
];

const defaultCollaborativeSpaces: CollaborativeSpace[] = [
  {
    id: 1,
    name: "Design Review Room",
    description: "A safe space for collaborative design reviews with trauma-informed facilitation.",
    space_type: "meeting_room" as const,
    max_participants: 8,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: "Feedback Garden",
    description: "Gentle feedback environment inspired by Studio Ghibli aesthetics.",
    space_type: "feedback_space" as const,
    max_participants: 12,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Speech Recognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface WindowWithSpeechRecognition extends Window {
  webkitSpeechRecognition: new () => SpeechRecognition;
}

// Accessibility and neurodivergent-friendly settings
interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  voiceEnabled: boolean;
  soundEnabled: boolean;
  largeText: boolean;
  focusRing: boolean;
  predictableUI: boolean;
  clearInstructions: boolean;
}

// 3D Gallery State
interface GalleryState {
  isActive: boolean;
  selectedArtifact: PortfolioArtifact | null;
  cameraPosition: { x: number; y: number; z: number };
  cameraRotation: { x: number; y: number; z: number };
  isTransitioning: boolean;
  tourMode: boolean;
  tourStep: number;
}

// AI Curator State
interface CuratorState {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  currentSession: string;
  interactions: AiCuratorInteraction[];
  context: PortfolioArtifact | null;
  mood: 'helpful' | 'excited' | 'thoughtful' | 'curious';
}

function App() {
  // Core data state
  const [user, setUser] = useState<User | null>(null);
  const [featuredArtifacts, setFeaturedArtifacts] = useState<PortfolioArtifact[]>([]);
  const [progressTrackers, setProgressTrackers] = useState<ProgressTracker[]>([]);
  const [changeLogs, setChangeLogs] = useState<DailyChangeLog[]>([]);
  const [collaborativeSpaces, setCollaborativeSpaces] = useState<CollaborativeSpace[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<string>('gallery');
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  
  // Accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    voiceEnabled: true,
    soundEnabled: true,
    largeText: false,
    focusRing: true,
    predictableUI: true,
    clearInstructions: true
  });
  
  // 3D Gallery state
  const [galleryState, setGalleryState] = useState<GalleryState>({
    isActive: false,
    selectedArtifact: null,
    cameraPosition: { x: 0, y: 0, z: 5 },
    cameraRotation: { x: 0, y: 0, z: 0 },
    isTransitioning: false,
    tourMode: false,
    tourStep: 0
  });
  
  // AI Curator state
  const [curatorState, setCuratorState] = useState<CuratorState>({
    isActive: false,
    isListening: false,
    isSpeaking: false,
    currentSession: '',
    interactions: [],
    context: null,
    mood: 'helpful'
  });
  
  // Form state for interactions
  const [curatorInput, setCuratorInput] = useState<string>('');
  
  // Refs for 3D
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load initial data with fallback to default data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setUsingFallbackData(false);
      
      const [
        userProfile,
        featuredItems,
        progressData,
        changeLogData,
        collaborativeData
      ] = await Promise.all([
        trpc.getUserProfile.query(),
        trpc.getFeaturedArtifacts.query(),
        trpc.getProgressTrackers.query(),
        trpc.getDailyChangeLogs.query(),
        trpc.getCollaborativeSpaces.query()
      ]);
      
      setUser(userProfile);
      setFeaturedArtifacts(featuredItems);
      setProgressTrackers(progressData);
      setChangeLogs(changeLogData);
      setCollaborativeSpaces(collaborativeData);
      
      // Initialize curator session
      setCuratorState(prev => ({
        ...prev,
        currentSession: `session_${Date.now()}`
      }));
      
      console.log('Data loaded successfully from backend');
      
    } catch (err) {
      console.error('Backend unavailable, using fallback data for frontend demonstration:', err);
      
      // Use fallback data to demonstrate frontend functionality
      setUsingFallbackData(true);
      setUser(defaultUser);
      setFeaturedArtifacts(defaultFeaturedArtifacts);
      setProgressTrackers(defaultProgressTrackers);
      setChangeLogs(defaultChangeLogs);
      setCollaborativeSpaces(defaultCollaborativeSpaces);
      
      // Initialize curator session
      setCuratorState(prev => ({
        ...prev,
        currentSession: `session_${Date.now()}`
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Voice recognition setup
  useEffect(() => {
    if (accessibilitySettings.voiceEnabled && 'webkitSpeechRecognition' in window) {
      const windowWithSpeech = window as WindowWithSpeechRecognition;
      const recognition = new windowWithSpeech.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result: SpeechRecognitionResult) => result[0])
          .map((result: SpeechRecognitionAlternative) => result.transcript)
          .join('');
        
        console.log('Voice input received:', transcript);
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
      };
      
      return () => {
        recognition.stop();
      };
    }
  }, [accessibilitySettings.voiceEnabled]);
  
  // AI Curator interaction handler
  const handleCuratorInteraction = async (input: string, type: 'voice' | 'text' | 'gesture') => {
    if (!input.trim()) return;
    
    setCuratorState(prev => ({ ...prev, isSpeaking: true }));
    
    try {
      if (usingFallbackData) {
        // Fallback curator response for frontend demonstration
        const fallbackResponse = {
          curator_response: `Thank you for asking "${input}". I'm currently in demonstration mode with fallback data. This shows how the AI curator would respond to your questions about Corey's projects with gentle, helpful guidance.`,
          id: Date.now(),
          session_id: curatorState.currentSession,
          user_input: input,
          interaction_type: type,
          context_artifact_id: curatorState.context?.id || null,
          created_at: new Date()
        };
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCuratorState(prev => ({
          ...prev,
          interactions: [...prev.interactions, fallbackResponse],
          isSpeaking: false
        }));
        
        // Text-to-speech for response
        if (accessibilitySettings.soundEnabled && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(fallbackResponse.curator_response);
          utterance.rate = 0.8;
          utterance.pitch = 1.1;
          speechSynthesis.speak(utterance);
        }
      } else {
        // Real backend interaction
        const interactionData: CreateAiCuratorInteractionInput = {
          session_id: curatorState.currentSession,
          user_input: input,
          interaction_type: type,
          context_artifact_id: curatorState.context?.id || null
        };
        
        const response = await trpc.createAiCuratorInteraction.mutate(interactionData);
        const updatedInteractions = await trpc.getAiCuratorInteractions.query(curatorState.currentSession);
        
        setCuratorState(prev => ({
          ...prev,
          interactions: updatedInteractions,
          isSpeaking: false
        }));
        
        if (accessibilitySettings.soundEnabled && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(response.curator_response);
          utterance.rate = 0.8;
          utterance.pitch = 1.1;
          speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error('Failed to process curator interaction:', err);
      setCuratorState(prev => ({ ...prev, isSpeaking: false }));
    }
    
    setCuratorInput('');
  };
  
  // 3D Gallery navigation
  const navigateToArtifact = (artifact: PortfolioArtifact) => {
    setGalleryState(prev => ({
      ...prev,
      isTransitioning: true,
      selectedArtifact: artifact,
      cameraPosition: {
        x: artifact.position_x,
        y: artifact.position_y,
        z: artifact.position_z + 2
      }
    }));
    
    // Update curator context
    setCuratorState(prev => ({
      ...prev,
      context: artifact
    }));
    
    // Simulate transition completion
    setTimeout(() => {
      setGalleryState(prev => ({
        ...prev,
        isTransitioning: false
      }));
    }, 1000);
  };
  
  // Start gallery tour
  const startGalleryTour = () => {
    if (featuredArtifacts.length === 0) return;
    
    setGalleryState(prev => ({
      ...prev,
      tourMode: true,
      tourStep: 0
    }));
    
    navigateToArtifact(featuredArtifacts[0]);
  };
  
  // Accessibility setting handlers
  const toggleAccessibilitySetting = (setting: keyof AccessibilitySettings) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Dynamic CSS classes based on accessibility settings
  const getAccessibilityClasses = () => {
    return [
      accessibilitySettings.highContrast ? 'contrast-150' : '',
      accessibilitySettings.reducedMotion ? 'motion-reduce' : '',
      accessibilitySettings.largeText ? 'text-lg' : '',
      accessibilitySettings.focusRing ? 'focus-visible:ring-2 focus-visible:ring-offset-2' : ''
    ].filter(Boolean).join(' ');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg font-medium text-slate-600">Loading Portfolio...</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Initializing 3D Gallery</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${getAccessibilityClasses()}`}>
      {/* Fallback Data Banner */}
      {usingFallbackData && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Demo Mode: Displaying fallback data for frontend demonstration</span>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
                <AvatarImage src={user?.avatar_url || ''} alt={user?.name || ''} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'CA'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center">
                  {user?.name || 'Corey Alejandro'}
                  <Sparkles className="h-4 w-4 ml-2 text-yellow-500" />
                </h1>
                <p className="text-slate-600 text-sm">{user?.title || 'AI & Data Engineer'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* AI Curator Toggle */}
              <Button
                variant={curatorState.isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCuratorState(prev => ({ ...prev, isActive: !prev.isActive }))}
                className="hidden md:flex"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Curator
              </Button>
              
              {/* Voice Control */}
              <Button
                variant={curatorState.isListening ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCuratorState(prev => ({ ...prev, isListening: !prev.isListening }))}
                disabled={!accessibilitySettings.voiceEnabled}
              >
                {curatorState.isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              {/* Accessibility Settings */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Accessibility className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Accessibility Settings</DialogTitle>
                    <DialogDescription>
                      Customize your experience for better accessibility and comfort.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {Object.entries(accessibilitySettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key} className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={() => toggleAccessibilitySetting(key as keyof AccessibilitySettings)}
                        />
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8">
            <TabsTrigger value="gallery" className="flex items-center">
              <Layers className="h-4 w-4 mr-2" />
              3D Gallery
            </TabsTrigger>
            <TabsTrigger value="curator" className="flex items-center">
              <Bot className="h-4 w-4 mr-2" />
              AI Curator
            </TabsTrigger>
            <TabsTrigger value="collaborate" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Collaborate
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="changelog" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Changes
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>
          
          {/* 3D Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center">
                <Sparkles className="h-8 w-8 mr-3 text-yellow-500" />
                Immersive 3D Portfolio Gallery
                <Wind className="h-8 w-8 ml-3 text-blue-500" />
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Explore my work in a cinematic 3D environment. Use voice commands or the AI curator 
                to navigate through projects with smooth camera transitions.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={startGalleryTour} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Play className="h-4 w-4 mr-2" />
                  Start Guided Tour
                </Button>
                <Button variant="outline" onClick={() => setGalleryState(prev => ({ ...prev, isActive: !prev.isActive }))}>
                  <Camera className="h-4 w-4 mr-2" />
                  {galleryState.isActive ? 'Exit Gallery' : 'Enter Gallery'}
                </Button>
              </div>
            </div>
            
            {/* 3D Gallery Canvas */}
            <div className="relative bg-gradient-to-br from-slate-900 to-indigo-900 rounded-xl overflow-hidden shadow-2xl">
              <canvas
                ref={canvasRef}
                className="w-full h-96 md:h-[600px]"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)'
                }}
              />
              
              {/* Gallery overlay with Studio Ghibli aesthetic */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white">
                  <div className="flex items-center space-x-2 text-sm">
                    <Navigation className="h-4 w-4" />
                    <span>Use WASD keys to navigate</span>
                  </div>
                </div>
                
                {/* Floating particles for Ghibli aesthetic */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-300/30 rounded-full animate-pulse"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${2 + Math.random() * 3}s`
                      }}
                    />
                  ))}
                </div>
                
                {/* Tron-like grid overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
                </div>
                
                {galleryState.selectedArtifact && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white border border-cyan-500/20">
                    <h3 className="font-bold text-lg mb-2">{galleryState.selectedArtifact.title}</h3>
                    <p className="text-sm opacity-90 mb-3">{galleryState.selectedArtifact.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {galleryState.selectedArtifact.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-white/20 text-white border-cyan-400/50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Featured Artifacts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtifacts.map((artifact: PortfolioArtifact) => (
                <Card 
                  key={artifact.id} 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border-l-4 border-l-blue-500/50"
                  onClick={() => navigateToArtifact(artifact)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-lg">
                        <Star className="h-5 w-5 mr-2 text-yellow-500" />
                        {artifact.title}
                      </CardTitle>
                      <Badge variant="outline" className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300">
                        {artifact.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {artifact.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {artifact.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      {artifact.github_url && (
                        <a href={artifact.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {artifact.demo_url && (
                        <a href={artifact.demo_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* AI Curator Tab */}
          <TabsContent value="curator" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center">
                <Bot className="h-8 w-8 mr-3 text-blue-500" />
                AI Portfolio Curator
                <Sparkles className="h-8 w-8 ml-3 text-yellow-500" />
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Chat with my AI curator to learn about my projects, get personalized recommendations, 
                and receive guided tours through my portfolio.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Chat Interface */}
              <Card className="border-l-4 border-l-green-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-green-600" />
                    Chat with AI Curator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full border rounded-md p-4 mb-4 bg-gradient-to-b from-slate-50 to-white">
                    {curatorState.interactions.length === 0 ? (
                      <div className="text-center text-slate-500 py-8">
                        <Bot className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-lg font-medium mb-2">Hello! I'm your AI curator.</p>
                        <p className="text-sm">Ask me about Corey's projects, skills, or request a guided tour!</p>
                        <div className="flex items-center justify-center mt-4 space-x-2">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          <span className="text-xs text-slate-400">Try: "Tell me about the Neural Network project"</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {curatorState.interactions.map((interaction: AiCuratorInteraction) => (
                          <div key={interaction.id} className="space-y-2">
                            <div className="bg-blue-50 rounded-lg p-3 ml-12 border border-blue-200">
                              <p className="text-sm">{interaction.user_input}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 mr-12 border border-green-200">
                              <p className="text-sm">{interaction.curator_response}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {interaction.created_at.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask about projects, skills, or request a tour..."
                      value={curatorInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCuratorInput(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') {
                          handleCuratorInteraction(curatorInput, 'text');
                        }
                      }}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      onClick={() => handleCuratorInteraction(curatorInput, 'text')}
                      disabled={!curatorInput.trim() || curatorState.isSpeaking}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600"
                    >
                      {curatorState.isSpeaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Curator Status */}
              <Card className="border-l-4 border-l-purple-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-600" />
                    Curator Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Status</span>
                      <Badge variant={curatorState.isActive ? 'default' : 'secondary'} className="bg-gradient-to-r from-green-500 to-green-600">
                        {curatorState.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Voice Recognition</span>
                      <Badge variant={curatorState.isListening ? 'default' : 'secondary'}>
                        {curatorState.isListening ? 'Listening' : 'Paused'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Mood</span>
                      <Badge variant="outline" className="capitalize border-yellow-300 text-yellow-700 bg-yellow-50">
                        {curatorState.mood}
                      </Badge>
                    </div>
                    {curatorState.context && (
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <span className="text-sm text-slate-600">Current Context</span>
                        <p className="text-sm font-medium">{curatorState.context.title}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Collaborative Spaces Tab */}
          <TabsContent value="collaborate" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center">
                <Users className="h-8 w-8 mr-3 text-green-500" />
                Collaborative Spaces
                <Coffee className="h-8 w-8 ml-3 text-orange-500" />
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Join virtual meeting rooms, provide feedback on projects, and collaborate in real-time 
                with trauma-informed design principles.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborativeSpaces.map((space: CollaborativeSpace) => (
                <Card key={space.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Monitor className="h-5 w-5 mr-2 text-green-600" />
                      {space.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {space.description}
                    </CardDescription>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Type</span>
                        <Badge variant="outline" className="capitalize border-green-300 text-green-700 bg-green-50">
                          {space.space_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Max Participants</span>
                        <span className="font-medium">{space.max_participants}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Status</span>
                        <Badge variant={space.is_active ? 'default' : 'secondary'} className="bg-gradient-to-r from-green-500 to-green-600">
                          {space.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" disabled={!space.is_active}>
                      <Users className="h-4 w-4 mr-2" />
                      Join Space
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Progress Tracker Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 mr-3 text-green-500" />
                Progress Tracker
                <Target className="h-8 w-8 ml-3 text-blue-500" />
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Track project milestones and completion progress with visual indicators 
                and predictable updates.
              </p>
            </div>
            
            <div className="space-y-6">
              {progressTrackers.map((tracker: ProgressTracker) => (
                <Card key={tracker.id} className="border-l-4 border-l-blue-500/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2 text-blue-600" />
                        {tracker.project_name}
                      </CardTitle>
                      <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-700">
                        {tracker.completion_percentage}% Complete
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600">Current Phase</span>
                          <span className="font-medium text-blue-700">{tracker.current_phase}</span>
                        </div>
                        <Progress value={tracker.completion_percentage} className="h-3 bg-gradient-to-r from-blue-100 to-indigo-100" />
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-slate-800 mb-3 flex items-center">
                          <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                          Milestones
                        </h4>
                        <div className="space-y-2">
                          {tracker.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  milestone.completed ? 'bg-green-500' : 'bg-slate-300'
                                }`} />
                                <span className={`text-sm ${
                                  milestone.completed ? 'text-slate-800 font-medium' : 'text-slate-500'
                                }`}>
                                  {milestone.name}
                                </span>
                              </div>
                              {milestone.due_date && (
                                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded">
                                  {milestone.due_date.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Daily Change Log Tab */}
          <TabsContent value="changelog" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center">
                <FileText className="h-8 w-8 mr-3 text-blue-500" />
                Daily Change Log
                <Clock className="h-8 w-8 ml-3 text-slate-500" />
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Track daily updates, improvements, and changes to projects with clear 
                documentation and impact assessments.
              </p>
            </div>
            
            <div className="space-y-6">
              {changeLogs.map((log: DailyChangeLog) => (
                <Card key={log.id} className="border-l-4 border-l-indigo-500/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                      {log.date.toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {log.changes.map((change, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <Badge 
                            variant={change.type === 'feature' ? 'default' : 'secondary'}
                            className={`mt-0.5 ${
                              change.type === 'feature' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                              change.type === 'improvement' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                              'bg-gradient-to-r from-orange-500 to-red-600'
                            }`}
                          >
                            {change.type}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm text-slate-800 font-medium">{change.description}</p>
                            <div className="flex items-center mt-2">
                              <span className="text-xs text-slate-500 mr-2">Impact:</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  change.impact === 'high' ? 'border-red-300 text-red-600 bg-red-50' :
                                  change.impact === 'medium' ? 'border-yellow-300 text-yellow-600 bg-yellow-50' :
                                  'border-green-300 text-green-600 bg-green-50'
                                }`}
                              >
                                {change.impact}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center">
                <Heart className="h-8 w-8 mr-3 text-red-500" />
                About This Portfolio
                <Leaf className="h-8 w-8 ml-3 text-green-500" />
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                A trauma-informed, neurodivergent-friendly portfolio experience with 
                Studio Ghibli-inspired design and Tron-like technological aesthetics.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-blue-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Accessibility className="h-5 w-5 mr-2 text-blue-600" />
                    Accessibility Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                      <Mic className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Voice commands and recognition</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                      <Keyboard className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Full keyboard navigation</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Screen reader compatibility</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                      <Contrast className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">High contrast mode</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                      <Type className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Adjustable text size</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-green-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-green-600" />
                    Design Philosophy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                      <Wind className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Studio Ghibli-inspired gentle aesthetics</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-cyan-50 rounded-lg">
                      <Zap className="h-4 w-4 text-cyan-500" />
                      <span className="text-sm">Tron-like technological elements</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Trauma-informed design principles</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Neurodivergent-friendly interface</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Predictable and clear interactions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-l-4 border-l-purple-500/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coffee className="h-5 w-5 mr-2 text-purple-600" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                      <Layers className="h-4 w-4 mr-2 text-blue-500" />
                      Frontend
                    </h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>React + TypeScript</div>
                      <div>Radix UI Components</div>
                      <div>Tailwind CSS</div>
                      <div>Three.js for 3D</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-500" />
                      Backend
                    </h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>tRPC API</div>
                      <div>Drizzle ORM</div>
                      <div>PostgreSQL</div>
                      <div>Zod Validation</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                      Features
                    </h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>3D Gallery</div>
                      <div>AI Curator</div>
                      <div>Voice Controls</div>
                      <div>Real-time Collaboration</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">Corey Alejandro</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-blue-400" />
                <span className="text-sm">AI & Data Engineer</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <TreePine className="h-4 w-4" />
                <span>Studio Ghibli Inspired</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Zap className="h-4 w-4" />
                <span>Tron Aesthetic</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Heart className="h-4 w-4" />
                <span>Trauma-Informed</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-700 text-center text-sm text-slate-400">
            <p>© 2024 Corey Alejandro. Designed with accessibility and neurodivergent users in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
