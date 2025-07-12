'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './components/AuthProvider';

import { StaggerContainer, StaggerItem, FadeInUp } from './components/MotionWrapper';
import { Providers } from './components/Providers';
import { 
  ArrowRight,
  CheckCircle,
  Play,
  BarChart3,
  Brain,
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
  Target,
  Award,
  Rocket,
  Star
} from 'lucide-react';

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const onboardingSteps = [
    {
      title: "Welcome to Oil Palm AGS",
      subtitle: "Your AI-Powered Agricultural Intelligence Platform",
      description: "Transform your farming data into actionable insights with cutting-edge machine learning technology."
    },
    {
      title: "Upload & Analyze",
      subtitle: "Smart Data Processing",
      description: "Simply upload your agricultural data files - our AI instantly analyzes soil conditions, leaf health, and crop performance."
    },
    {
      title: "Get Insights",
      subtitle: "Personalized Recommendations",
      description: "Receive detailed reports with actionable recommendations tailored to your specific plantation needs."
    },
    {
      title: "Track Progress",
      subtitle: "Monitor Your Success",
      description: "Track improvements over time with comprehensive analytics and performance metrics."
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your agricultural data with 95% accuracy",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Get instant results and recommendations as soon as you upload your data",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected with enterprise-grade security",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: TrendingUp,
      title: "Growth Optimization",
      description: "Maximize yield potential with data-driven insights and actionable recommendations",
      color: "from-orange-500 to-red-600"
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      // Role-based routing
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
      router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  };

  const handleStartDemo = () => {
    if (user) {
      // Role-based routing
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
      router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  };

  return (
    <Providers>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-emerald-950/20 dark:to-teal-950/30">
        {/* Navigation Header */}
        <nav className="relative z-50 px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                  Oil Palm AGS
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">AI Agricultural Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Go to Dashboard
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-300"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-transparent rounded-full blur-3xl animate-float"></div>
              <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-bl from-cyan-400/15 via-blue-400/10 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
              <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-tr from-teal-400/20 via-emerald-400/10 to-transparent rounded-full blur-3xl animate-float-slow"></div>
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <FadeInUp delay={0.2}>
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/80 dark:bg-emerald-900/30 rounded-full mb-8 border border-emerald-200 dark:border-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">AI-Powered Agriculture</span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-tight">
                    <span className="bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-800 dark:from-slate-100 dark:via-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
                      Transform Your
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                      Oil Palm Farm
                    </span>
                  </h1>
                  
                  <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-2xl">
                    Harness the power of artificial intelligence to optimize your crop yields, predict issues before they occur, and make data-driven decisions that maximize your farm&apos;s potential.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                    <button
                      onClick={handleGetStarted}
                      className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Rocket className="w-6 h-6" />
                      {user ? 'Go to Dashboard' : 'Start Free Trial'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                    <button
                      onClick={handleStartDemo}
                      className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-lg hover:shadow-lg transition-all duration-300"
                    >
                      <Play className="w-6 h-6" />
                      Watch Demo
                    </button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap items-center gap-8 justify-center lg:justify-start">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white dark:border-slate-900"></div>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">500+ farmers trust us</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">4.9/5 rating</span>
                    </div>
                  </div>
                </div>
              </FadeInUp>

              {/* Right Visual */}
              <FadeInUp delay={0.4}>
                <div className="relative">
                  <div className="relative z-10 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-950/20 rounded-3xl p-8 lg:p-12 shadow-2xl border border-emerald-100 dark:border-emerald-900/50">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 flex items-center justify-center mb-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                          <BarChart3 className="w-16 h-16 text-white" />
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border border-blue-200 dark:border-blue-800/50">
                        <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                        <div className="text-lg font-bold text-slate-800 dark:text-white">+35%</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Yield Increase</div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-800/50">
                        <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
                        <div className="text-lg font-bold text-slate-800 dark:text-white">95%</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Accuracy</div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border border-purple-200 dark:border-purple-800/50">
                        <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                        <div className="text-lg font-bold text-slate-800 dark:text-white">24/7</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Monitoring</div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border border-orange-200 dark:border-orange-800/50">
                        <Award className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
                        <div className="text-lg font-bold text-slate-800 dark:text-white">50%</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Cost Reduction</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg transform rotate-12 opacity-80"></div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl shadow-lg transform -rotate-6 opacity-60"></div>
                </div>
              </FadeInUp>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <FadeInUp delay={0.2}>
              <div className="text-center mb-16 lg:mb-20">
                <h2 className="text-3xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-emerald-700 dark:from-slate-100 dark:to-emerald-300 bg-clip-text text-transparent">
                  Why Choose Oil Palm AGS?
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Experience the future of agriculture with our comprehensive AI-powered platform designed specifically for oil palm cultivation.
                </p>
              </div>
            </FadeInUp>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {features.map((feature, index) => (
                <StaggerItem key={index}>
                  <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50 p-8 lg:p-10 shadow-xl border border-slate-200 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-4">
                        {feature.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative px-6 lg:px-8 py-16 lg:py-24 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30">
          <div className="max-w-7xl mx-auto">
            <FadeInUp delay={0.2}>
              <div className="text-center mb-16 lg:mb-20">
                <h2 className="text-3xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-emerald-700 dark:from-slate-100 dark:to-emerald-300 bg-clip-text text-transparent">
                  How It Works
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Get started in minutes with our simple 4-step process designed for farmers of all technical levels.
                </p>
              </div>
            </FadeInUp>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
              {onboardingSteps.map((step, index) => (
                <FadeInUp key={index} delay={0.2 + index * 0.1}>
                  <div className="relative">
                    {/* Connection Line */}
                    {index < onboardingSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700 transform translate-x-6 z-0"></div>
                    )}
                    
                    <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 lg:p-10 shadow-xl border border-emerald-100 dark:border-emerald-900/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 z-10">
                      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-6 mx-auto">
                        <span className="text-2xl font-bold text-white">{index + 1}</span>
                      </div>
                      
                      <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-3 text-center">
                        {step.title}
                      </h3>
                      
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-4 text-center">
                        {step.subtitle}
                      </p>
                      
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-center">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </FadeInUp>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-5xl mx-auto">
            <FadeInUp delay={0.2}>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-12 lg:p-16 text-center shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/15 to-transparent rounded-full blur-2xl"></div>
                
                <div className="relative">
                  <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                    Ready to Transform Your Farm?
                  </h2>
                  <p className="text-xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                    Join thousands of farmers who have already increased their yields by 35% using our AI-powered agricultural intelligence platform.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleGetStarted}
                      className="group flex items-center justify-center gap-3 px-10 py-4 bg-white text-emerald-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Rocket className="w-6 h-6" />
                      {user ? 'Access Dashboard' : 'Start Free Trial'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                    <button
                      onClick={handleStartDemo}
                      className="group flex items-center justify-center gap-3 px-10 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/30 transition-all duration-300"
                    >
                      <Play className="w-6 h-6" />
                      Watch Demo
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-8 mt-12 text-emerald-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>14-day free trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 lg:px-8 py-12 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Oil Palm AGS</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">AI Agricultural Intelligence</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                <span>© 2025 Oil Palm AGS. All rights reserved.</span>
                <div className="flex items-center gap-6">
                  <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300">Privacy Policy</a>
                  <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300">Terms of Service</a>
                  <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300">Support</a>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Floating Animation Styles */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-25px) rotate(1deg); }
            66% { transform: translateY(-15px) rotate(-1deg); }
          }
          
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(-1deg); }
            66% { transform: translateY(-30px) rotate(1deg); }
          }
          
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-35px) scale(1.05); }
          }
          
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
          
          .animate-float-delayed {
            animation: float-delayed 10s ease-in-out infinite;
          }
          
          .animate-float-slow {
            animation: float-slow 12s ease-in-out infinite;
          }
        `}</style>
      </div>
    </Providers>
  );
}