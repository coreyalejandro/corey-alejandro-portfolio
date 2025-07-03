
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  ArrowRight, 
  Eye,
  Headphones,
  Sparkles,
  Zap,
  Globe,
  Users,
  Calendar,
  TrendingUp,
  Bot,
  Camera,
  Mic,
  MicOff,
  MousePointer
} from 'lucide-react';

// Import type definitions
import type { 
  User, 
  PortfolioArtifact, 
  ProgressTracker,
  DailyChangeLog,
  CollaborativeSpace
} from '../../server/src/schema';

function App() {
  // User profile state
  const [user, setUser] = useState<User | null>(null);
  
  // Portfolio artifacts state
  const [featuredArtifacts, setFeaturedArtifacts] = useState<PortfolioArtifact[]>([]);
  
  // Progress and change log state
  const [progressTrackers, setProgressTrackers] = useState<ProgressTracker[]>([]);
  const [changeLogs, setChangeLogs] = useState<DailyChangeLog[]>([]);
  
  // Collaborative spaces state
  const [collaborativeSpaces, setCollaborativeSpaces] = useState<CollaborativeSpace[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'gallery' | 'curator' | 'progress' | 'collaboration'>('gallery');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  
  // AI Curator state
  const [curatorMessage, setCuratorMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Load initial data
  const loadUserProfile = useCallback(async () => {
    try {
      const userProfile = await trpc.getUserProfile.query();
      setUser(userProfile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }, []);
  
  const loadDesignTheme = useCallback(async () => {
    try {
      const theme = await trpc.getActiveDesignTheme.query();
      // Theme is loaded but not used in current implementation
      if (theme) {
        console.log('Design theme loaded:', theme.name);
      }
    } catch (error) {
      console.error('Failed to load design theme:', error);
    }
  }, []);
  
  const loadPortfolioData = useCallback(async () => {
    try {
      const [allArtifacts, featured, trackers, logs, spaces] = await Promise.all([
        trpc.getPortfolioArtifacts.query(),
        trpc.getFeaturedArtifacts.query(),
        trpc.getProgressTrackers.query(),
        trpc.getDailyChangeLogs.query(),
        trpc.getCollaborativeSpaces.query()
      ]);
      
      // Store all artifacts but only use featured for now
      console.log('All artifacts loaded:', allArtifacts.length);
      setFeaturedArtifacts(featured);
      setProgressTrackers(trackers);
      setChangeLogs(logs);
      setCollaborativeSpaces(spaces);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    }
  }, []);
  
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      loadUserProfile(),
      loadDesignTheme(),
      loadPortfolioData()
    ]);
    setIsLoading(false);
  }, [loadUserProfile, loadDesignTheme, loadPortfolioData]);
  
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  
  // Voice control handlers
  const toggleVoiceControl = useCallback(() => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      // Start voice recognition
      setIsListening(true);
      setCuratorMessage('🎙️ Voice controls activated. Say "help" for commands.');
    } else {
      // Stop voice recognition
      setIsListening(false);
      setCuratorMessage('');
    }
  }, [isVoiceActive]);
  
  const toggleCinematicMode = useCallback(() => {
    setIsCinematicMode(!isCinematicMode);
  }, [isCinematicMode]);
  
  const toggleAccessibilityMode = useCallback(() => {
    setIsAccessibilityMode(!isAccessibilityMode);
  }, [isAccessibilityMode]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setCurrentView('gallery');
            break;
          case '2':
            event.preventDefault();
            setCurrentView('curator');
            break;
          case '3':
            event.preventDefault();
            setCurrentView('progress');
            break;
          case '4':
            event.preventDefault();
            setCurrentView('collaboration');
            break;
          case 'v':
            event.preventDefault();
            toggleVoiceControl();
            break;
          case 'c':
            event.preventDefault();
            toggleCinematicMode();
            break;
          case 'a':
            event.preventDefault();
            toggleAccessibilityMode();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleVoiceControl, toggleCinematicMode, toggleAccessibilityMode]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
            <Sparkles className="absolute top-4 left-4 w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <p className="text-purple-200 text-lg font-medium">Loading Corey's Portfolio...</p>
          <p className="text-purple-400 text-sm">Initializing 3D gallery and AI curator</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isCinematicMode 
        ? 'bg-black' 
        : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
    } ${isAccessibilityMode ? 'contrast-125' : ''}`}>
      
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10 border-2 border-purple-500/50">
                <AvatarImage src={user?.avatar_url || undefined} alt={user?.name} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'CA'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-white">{user?.name}</h1>
                <p className="text-purple-300 text-sm">{user?.title}</p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant={isVoiceActive ? "default" : "outline"}
                size="sm"
                onClick={toggleVoiceControl}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-600"
                aria-label="Toggle voice controls"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={isCinematicMode ? "default" : "outline"}
                size="sm"
                onClick={toggleCinematicMode}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-600"
                aria-label="Toggle cinematic mode"
              >
                {isCinematicMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={isAccessibilityMode ? "default" : "outline"}
                size="sm"
                onClick={toggleAccessibilityMode}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-600"
                aria-label="Toggle accessibility mode"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Voice Control Status */}
      {isVoiceActive && (
        <Alert className="mx-4 mt-4 border-purple-500/50 bg-purple-900/20 text-purple-200">
          <Bot className="h-4 w-4" />
          <AlertDescription>
            {curatorMessage || 'Voice controls active. Say "help" for commands, "navigate gallery" to explore, or "show progress" to see project status.'}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Navigation */}
      <nav className="border-b border-purple-800/30 bg-black/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as typeof currentView)}>
            <TabsList className="grid w-full grid-cols-4 bg-transparent border-none">
              <TabsTrigger 
                value="gallery" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-300 hover:bg-purple-800/50"
              >
                <Camera className="h-4 w-4 mr-2" />
                3D Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="curator"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-300 hover:bg-purple-800/50"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Curator
              </TabsTrigger>
              <TabsTrigger 
                value="progress"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-300 hover:bg-purple-800/50"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger 
                value="collaboration"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-300 hover:bg-purple-800/50"
              >
                <Users className="h-4 w-4 mr-2" />
                Collaborate
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'gallery' && (
          <div className="space-y-8">
            {/* 3D Gallery Header */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-white mb-4">
                ✨ Immersive Portfolio Gallery
              </h2>
              <p className="text-purple-300 text-lg max-w-2xl mx-auto">
                Explore Corey's work through an interactive 3D space. Each artifact tells a story of innovation in AI and data engineering.
              </p>
            </div>
            
            {/* Featured Artifacts */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-white flex items-center">
                  <Sparkles className="h-6 w-6 mr-2 text-purple-400" />
                  Featured Projects
                </h3>
                <Button 
                  variant="outline" 
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-600"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start 3D Tour
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArtifacts.length > 0 ? (
                  featuredArtifacts.map((artifact: PortfolioArtifact) => (
                    <Card key={artifact.id} className="bg-black/30 border-purple-500/50 hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="secondary" 
                            className="bg-purple-600 text-white capitalize"
                          >
                            {artifact.category.replace('_', ' ')}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-purple-300 hover:text-white"
                            onClick={() => console.log('View artifact:', artifact.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardTitle className="text-white">{artifact.title}</CardTitle>
                        <CardDescription className="text-purple-300">
                          {artifact.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {artifact.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          {artifact.demo_url && (
                            <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-600">
                              <Globe className="h-4 w-4 mr-2" />
                              Demo
                            </Button>
                          )}
                          {artifact.github_url && (
                            <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-600">
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Code
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-purple-300 space-y-4">
                      <div className="relative inline-block">
                        <div className="w-16 h-16 border-2 border-purple-500/30 rounded-full animate-pulse"></div>
                        <Sparkles className="absolute top-4 left-4 w-8 h-8 text-purple-400 animate-bounce" />
                      </div>
                      <p className="text-lg">🎨 Gallery is being curated...</p>
                      <p className="text-sm text-purple-400">Corey's amazing projects will appear here soon!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 3D Space Placeholder */}
            <div className="bg-black/40 border border-purple-500/50 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <MousePointer className="h-12 w-12 text-white animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-white">3D Interactive Space</h3>
                <p className="text-purple-300 max-w-md mx-auto">
                  This space will host the immersive 3D gallery where you can navigate through Corey's portfolio artifacts in a cinematic environment.
                </p>
                <div className="flex justify-center space-x-4 mt-6">
                  <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-600">
                    <Camera className="h-4 w-4 mr-2" />
                    Enter 3D Mode
                  </Button>
                  <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-600">
                    <Headphones className="h-4 w-4 mr-2" />
                    Audio Guide
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentView === 'curator' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-white mb-4">
                🤖 AI Curator Assistant
              </h2>
              <p className="text-purple-300 text-lg max-w-2xl mx-auto">
                Your personal guide through Corey's portfolio. Ask questions, request tours, or get detailed explanations about any project.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-black/30 border-purple-500/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-purple-400" />
                    Voice Interaction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                      isListening 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse' 
                        : 'bg-purple-600/20 border-2 border-purple-500/50'
                    }`}>
                      {isListening ? (
                        <Volume2 className="h-10 w-10 text-white" />
                      ) : (
                        <VolumeX className="h-10 w-10 text-purple-400" />
                      )}
                    </div>
                    <p className="text-purple-300 mb-4">
                      {isListening ? 'Listening...' : 'Click to start voice interaction'}
                    </p>
                    <Button 
                      onClick={() => setIsListening(!isListening)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isListening ? 'Stop Listening' : 'Start Voice Chat'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/30 border-purple-500/50">
                <CardHeader>
                  <CardTitle className="text-white">Quick Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { command: '"Show me AI projects"', description: 'Filter by AI category' },
                      { command: '"Tell me about featured work"', description: 'Highlight featured projects' },
                      { command: '"Start gallery tour"', description: 'Begin guided 3D tour' },
                      { command: '"Show progress updates"', description: 'View current project status' },
                      { command: '"Explain this project"', description: 'Get detailed information' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-purple-900/20 hover:bg-purple-900/30 transition-colors">
                        <Zap className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-purple-200 font-medium">{item.command}</p>
                          <p className="text-purple-400 text-sm">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {currentView === 'progress' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-white mb-4">
                📊 Project Progress & Updates
              </h2>
              <p className="text-purple-300 text-lg max-w-2xl mx-auto">
                Track ongoing projects, milestones, and daily changes in Corey's portfolio development.
              </p>
            </div>
            
            <div className="space-y-6">
              {progressTrackers.length > 0 ? (
                progressTrackers.map((tracker: ProgressTracker) => (
                  <Card key={tracker.id} className="bg-black/30 border-purple-500/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{tracker.project_name}</CardTitle>
                        <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                          {tracker.completion_percentage}% Complete
                        </Badge>
                      </div>
                      <CardDescription className="text-purple-300">
                        Current Phase: {tracker.current_phase}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Progress 
                          value={tracker.completion_percentage} 
                          className="h-2"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tracker.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                milestone.completed ? 'bg-green-500' : 'bg-purple-500/50'
                              }`} />
                              <span className={`text-sm ${
                                milestone.completed ? 'text-green-300' : 'text-purple-300'
                              }`}>
                                {milestone.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-purple-300 space-y-4">
                    <TrendingUp className="h-16 w-16 mx-auto text-purple-400 animate-pulse" />
                    <p className="text-lg">📈 Progress tracking coming soon...</p>
                    <p className="text-sm text-purple-400">Project milestones and updates will appear here!</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Daily Change Logs */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-purple-400" />
                Daily Change Log
              </h3>
              
              {changeLogs.length > 0 ? (
                <div className="space-y-4">
                  {changeLogs.map((log: DailyChangeLog) => (
                    <Card key={log.id} className="bg-black/30 border-purple-500/50">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">
                          {log.date.toLocaleDateString()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {log.changes.map((change, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <Badge 
                                variant={change.type === 'feature' ? 'default' : 'outline'}
                                className="mt-0.5 text-xs"
                              >
                                {change.type}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-purple-200">{change.description}</p>
                                <p className="text-purple-400 text-xs">
                                  Impact: {change.impact}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-purple-300 space-y-4">
                    <Calendar className="h-12 w-12 mx-auto text-purple-400 animate-pulse" />
                    <p className="text-lg">📅 Change logs will appear here...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {currentView === 'collaboration' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-white mb-4">
                🤝 Collaborative Spaces
              </h2>
              <p className="text-purple-300 text-lg max-w-2xl mx-auto">
                Connect with Corey in virtual meeting rooms, feedback spaces, and presentation areas designed for productive collaboration.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborativeSpaces.length > 0 ? (
                collaborativeSpaces.map((space: CollaborativeSpace) => (
                  <Card key={space.id} className="bg-black/30 border-purple-500/50 hover:border-purple-400 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{space.name}</CardTitle>
                        <Badge 
                          variant={space.is_active ? 'default' : 'outline'}
                          className={space.is_active ? 'bg-green-600' : 'border-purple-500/50 text-purple-300'}
                        >
                          {space.is_active ? 'Active' : 'Available'}
                        </Badge>
                      </div>
                      <CardDescription className="text-purple-300">
                        {space.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-purple-300">Type:</span>
                          <span className="text-purple-200 capitalize">
                            {space.space_type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-purple-300">Max Participants:</span>
                          <span className="text-purple-200">{space.max_participants}</span>
                        </div>
                        <Separator className="bg-purple-500/30" />
                        <Button 
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          disabled={!space.is_active}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {space.is_active ? 'Join Space' : 'Space Unavailable'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-purple-300 space-y-4">
                    <Users className="h-16 w-16 mx-auto text-purple-400 animate-pulse" />
                    <p className="text-lg">🏢 Collaboration spaces coming soon...</p>
                    <p className="text-sm text-purple-400">Virtual meeting rooms and feedback areas will be available here!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-purple-800/30 bg-black/20 backdrop-blur-md mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <p className="text-purple-300">
              ✨ Built with passion by Corey Alejandro
            </p>
            <div className="flex justify-center space-x-6 text-sm text-purple-400">
              <span>🎮 Tron-inspired Design</span>
              <span>🎬 Cinematic Experience</span>
              <span>🌟 Studio Ghibli Aesthetics</span>
              <span>♿ Accessibility First</span>
            </div>
            <p className="text-xs text-purple-500">
              Keyboard shortcuts: Ctrl+1-4 (Navigation), Ctrl+V (Voice), Ctrl+C (Cinema), Ctrl+A (Accessibility)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
