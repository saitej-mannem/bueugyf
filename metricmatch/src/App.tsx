import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, GraduationCap, Filter, ChevronRight, Info, AlertCircle, CheckCircle2, HelpCircle, ArrowRight, School, Trophy, ArrowLeft } from 'lucide-react';
import { iitData, IITRecord } from './data/iitData';

type Category = 'Safety' | 'Medium' | 'Reach' | 'Unlikely';
type Page = 'home' | 'predictor';
type PredictorType = 'iit' | 'nit';

interface Prediction extends IITRecord {
  predictionCategory: Category;
  margin: number;
  isVerySafe: boolean;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [predictorType, setPredictorType] = useState<PredictorType | null>(null);
  const [rank, setRank] = useState<string>('');
  const [category, setCategory] = useState<string>('OPEN');
  const [gender, setGender] = useState<string>('Gender-Neutral');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = useMemo(() => Array.from(new Set(iitData.map(d => d.category))), []);
  const genders = useMemo(() => Array.from(new Set(iitData.map(d => d.gender))), []);
  const normalizeBranch = (name: string) => {
    let normalized = name.split('(')[0].trim();
    const lower = normalized.toLowerCase();
    
    if (lower.includes('computer science')) return 'Computer Science & Engineering';
    if (lower.includes('electrical')) return 'Electrical Engineering';
    if (lower.includes('mechanical')) return 'Mechanical Engineering';
    if (lower.includes('civil')) return 'Civil Engineering';
    if (lower.includes('chemical')) return 'Chemical Engineering';
    if (lower.includes('bio') || lower.includes('biotech')) return 'Bio Engineering & Biotechnology';
    if (lower.includes('metallurg') || lower.includes('material')) return 'Metallurgical & Materials Engineering';
    if (lower.includes('aerospace')) return 'Aerospace Engineering';
    if (lower.includes('math') || lower.includes('comput')) {
      if (lower.includes('data science') || lower.includes('artificial intelligence')) return 'Data Science & AI';
      return 'Mathematics & Computing';
    }
    if (lower.includes('physics')) return 'Engineering Physics';
    if (lower.includes('econom')) return 'Economics';
    
    return normalized;
  };

  const allBranches = useMemo(() => 
    Array.from(new Set(iitData.map(d => normalizeBranch(d.branch)))).sort()
  , []);

  const predictions = useMemo(() => {
    if (!isSubmitted || !rank) return [];

    const userRank = parseInt(rank);
    if (isNaN(userRank) || userRank <= 0) return [];

    return iitData
      .filter(d => d.category === category && d.gender === gender)
      .filter(d => selectedBranches.length === 0 || selectedBranches.includes(normalizeBranch(d.branch)))
      .map(d => {
        let predictionCategory: Category = 'Unlikely';
        const margin = d.closingRank - userRank;
        const isVerySafe = userRank <= d.openingRank;

        // Safety: User rank is significantly better than closing rank or better than opening rank
        if (userRank <= d.openingRank || userRank <= d.closingRank * 0.85) {
          predictionCategory = 'Safety';
        }
        // Medium: User rank is close to closing rank
        else if (userRank <= d.closingRank * 1.05) {
          predictionCategory = 'Medium';
        }
        // Reach: User rank is slightly above closing rank
        else if (userRank <= d.closingRank * 1.25) {
          predictionCategory = 'Reach';
        }

        return { ...d, predictionCategory, margin, isVerySafe };
      })
      .filter(d => 
        d.institute.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.branch.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const order = { 'Safety': 0, 'Medium': 1, 'Reach': 2, 'Unlikely': 3 };
        if (a.predictionCategory !== b.predictionCategory) {
          return order[a.predictionCategory] - order[b.predictionCategory];
        }
        return a.closingRank - b.closingRank;
      });
  }, [rank, category, gender, searchQuery, isSubmitted, selectedBranches]);

  const groupedPredictions = useMemo(() => {
    const groups: Record<Category, Record<string, Prediction[]>> = {
      'Safety': {},
      'Medium': {},
      'Reach': {},
      'Unlikely': {}
    };

    predictions.forEach(p => {
      const branchName = normalizeBranch(p.branch);
      if (!groups[p.predictionCategory][branchName]) {
        groups[p.predictionCategory][branchName] = [];
      }
      groups[p.predictionCategory][branchName].push(p);
    });

    return groups;
  }, [predictions]);

  const handleGoHome = () => {
    setCurrentPage('home');
    setPredictorType(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFeedback = () => {
    window.location.href = 'mailto:feedback@metricmatch.in?subject=Feedback for MetricMatch';
  };

  const scrollToSection = (id: string) => {
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setPredictorType(null);
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userRank = parseInt(rank);
    if (isNaN(userRank) || userRank <= 0) {
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans selection:bg-[#4b90ff]/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#000000]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={handleGoHome}
          >
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform border border-white/10">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-light tracking-tight glow-text">
              MetricMatch
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-white/60">
            {currentPage === 'predictor' && (
              <button 
                onClick={handleGoHome}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </button>
            )}
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-white transition-colors"
            >
              How it works
            </button>
            <button 
              onClick={() => scrollToSection('data-source')}
              className="hover:text-white transition-colors"
            >
              Data Source
            </button>
            <button 
              onClick={handleFeedback}
              className="px-5 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              Feedback
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {currentPage === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-4 py-20"
          >
            <div className="text-center mb-32">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] uppercase tracking-[0.2em] font-medium mb-12"
              >
                <Trophy className="w-3 h-3" />
                Trusted by 50,000+ Students
              </motion.div>
              <h2 className="text-6xl md:text-9xl font-light mb-10 tracking-tighter glow-text leading-[0.85]">
                Find Your Dream <br />
                <span className="font-medium italic">Engineering Future</span>
              </h2>
              <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                Precision JoSAA predictions based on historical data. 
                Navigate your path to India's premier institutes with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* IIT Card */}
              <motion.button
                whileHover={{ y: -10 }}
                onClick={() => {
                  setPredictorType('iit');
                  setCurrentPage('predictor');
                }}
                className="group relative bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 text-left overflow-hidden transition-all hover:bg-white/[0.04]"
              >
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#4b90ff]/10 rounded-full blur-[100px] group-hover:bg-[#4b90ff]/20 transition-all" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-10 border border-white/10">
                    <GraduationCap className="w-7 h-7 text-[#8ab4f8]" />
                  </div>
                  <h3 className="text-3xl font-light mb-4 glow-text-blue">JEE Advanced</h3>
                  <p className="text-white/40 text-sm mb-12 leading-relaxed max-w-[280px]">
                    Comprehensive predictor for all 23 Indian Institutes of Technology (IITs).
                  </p>
                  <div className="flex items-center gap-2 text-[#8ab4f8] text-xs uppercase tracking-widest font-medium group-hover:gap-4 transition-all">
                    Start IIT Predictor
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>

              {/* NIT Card */}
              <motion.button
                whileHover={{ y: -10 }}
                onClick={() => {
                  setPredictorType('nit');
                  setCurrentPage('predictor');
                }}
                className="group relative bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 text-left overflow-hidden transition-all hover:bg-white/[0.04]"
              >
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#ff5546]/10 rounded-full blur-[100px] group-hover:bg-[#ff5546]/20 transition-all" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-10 border border-white/10">
                    <School className="w-7 h-7 text-[#ff5546]" />
                  </div>
                  <h3 className="text-3xl font-light mb-4 glow-text-red">JEE Mains</h3>
                  <p className="text-white/40 text-sm mb-12 leading-relaxed max-w-[280px]">
                    Predict admission chances for NITs, IIITs, and GFTIs across India.
                  </p>
                  <div className="flex items-center gap-2 text-[#ff5546] text-xs uppercase tracking-widest font-medium group-hover:gap-4 transition-all">
                    Coming Soon
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            </div>

            <div className="mt-32 flex flex-wrap justify-center gap-12 opacity-20 grayscale hover:opacity-40 transition-all duration-700">
              <div className="text-sm tracking-[0.4em] font-light">IIT BOMBAY</div>
              <div className="text-sm tracking-[0.4em] font-light">IIT DELHI</div>
              <div className="text-sm tracking-[0.4em] font-light">IIT MADRAS</div>
              <div className="text-sm tracking-[0.4em] font-light">IIT KANPUR</div>
            </div>

            {/* How it works section */}
            <section id="how-it-works" className="mt-48 pt-24 border-t border-white/5">
              <h3 className="text-5xl font-light mb-24 text-center glow-text tracking-tight">How it works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                <div className="space-y-8">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-white/30">Step 01</div>
                  <h4 className="text-2xl font-light">Enter Rank</h4>
                  <p className="text-white/40 text-sm leading-relaxed font-light">Input your JEE Advanced or Mains rank along with your category and gender details.</p>
                </div>
                <div className="space-y-8">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-white/30">Step 02</div>
                  <h4 className="text-2xl font-light">Filter Preferences</h4>
                  <p className="text-white/40 text-sm leading-relaxed font-light">Select your preferred engineering branches to narrow down the search results.</p>
                </div>
                <div className="space-y-8">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-white/30">Step 03</div>
                  <h4 className="text-2xl font-light">Get Predictions</h4>
                  <p className="text-white/40 text-sm leading-relaxed font-light">Our algorithm compares your rank with historical JoSAA data to predict your chances.</p>
                </div>
              </div>
            </section>

            {/* Data Source section */}
            <section id="data-source" className="mt-48 pt-24 border-t border-white/5">
              <div className="bg-white/[0.02] p-24 rounded-[4rem] border border-white/5 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-12 border border-white/10">
                  <Info className="w-10 h-10 text-white/40" />
                </div>
                <h3 className="text-5xl font-light mb-10 glow-text tracking-tight">Data Source & Accuracy</h3>
                <p className="text-white/40 text-xl max-w-3xl mx-auto leading-relaxed mb-16 font-light">
                  All prediction data is sourced directly from the official <strong>JoSAA (Joint Seat Allocation Authority)</strong> previous year opening and closing ranks. 
                  We update our database annually to ensure the highest possible accuracy for aspiring engineering students.
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] uppercase tracking-[0.2em] font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#34a853]" />
                  Verified JoSAA 2024-25 Data
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="predictor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <main className="max-w-6xl mx-auto px-4 py-12">
              <div className="mb-12 flex items-center gap-6">
                <button 
                  onClick={handleGoHome}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors border border-white/5"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-4xl font-light tracking-tight glow-text">
                    {predictorType === 'iit' ? 'IIT Predictor' : 'NIT Predictor'}
                  </h2>
                  <p className="text-white/40 text-sm mt-1 font-light uppercase tracking-widest">
                    {predictorType === 'iit' 
                      ? 'Based on JEE Advanced 2024-25 Cutoffs' 
                      : 'Based on JEE Mains 2024-25 Cutoffs (Coming Soon)'}
                  </p>
                </div>
              </div>

              {predictorType === 'nit' ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12 bg-white/[0.02] rounded-[4rem] border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff5546] rounded-full blur-[120px]" />
                  </div>
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
                    <School className="w-10 h-10 text-[#ff5546]" />
                  </div>
                  <h3 className="text-4xl font-light mb-4 glow-text-red">NIT Predictor Coming Soon</h3>
                  <p className="text-white/40 max-w-md mx-auto text-lg leading-relaxed mb-12 font-light">
                    We are currently processing the latest JoSAA data for NITs, IIITs, and GFTIs. 
                    This feature will be available very soon!
                  </p>
                  <button 
                    onClick={() => {
                      setPredictorType('iit');
                    }}
                    className="px-10 py-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all font-medium flex items-center gap-2 text-sm uppercase tracking-widest"
                  >
                    Try IIT Predictor Instead
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Input Panel */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/[0.02] rounded-[3rem] p-8 border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-white/40 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Your Details
                </h2>
                <button 
                  type="button"
                  onClick={() => {
                    setRank('');
                    setCategory('OPEN');
                    setGender('Gender-Neutral');
                    setSelectedBranches([]);
                    setSearchQuery('');
                    setIsSubmitted(false);
                  }}
                  className="text-[10px] text-[#ea4335] hover:underline font-bold uppercase tracking-widest"
                >
                  Clear All
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-white/30 mb-3">
                    {predictorType === 'iit' ? 'JEE Advanced Rank' : 'JEE Mains Rank'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={rank}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setRank('');
                        return;
                      }
                      // Remove any non-digit characters (like - or e) just in case
                      const sanitized = val.replace(/\D/g, '');
                      if (sanitized === '') {
                        setRank('');
                        return;
                      }
                      const num = parseInt(sanitized);
                      if (num > 0) {
                        setRank(num.toString());
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent negative sign, decimal point, and exponent
                      if (['-', 'e', '.', '+'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter your rank"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10 font-mono text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-white/30 mb-3">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer text-sm"
                  >
                    {categories.map(c => (
                      <option key={c} value={c} className="bg-[#131314]">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-white/30 mb-3">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer text-sm"
                  >
                    {genders.map(g => (
                      <option key={g} value={g} className="bg-[#131314]">{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[10px] uppercase tracking-widest font-medium text-white/30">Preferred Branches</label>
                    <button 
                      type="button"
                      onClick={() => setSelectedBranches(selectedBranches.length === allBranches.length ? [] : [...allBranches])}
                      className="text-[9px] text-white/40 hover:text-white uppercase font-bold tracking-widest transition-colors"
                    >
                      {selectedBranches.length === allBranches.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-56 overflow-y-auto space-y-3 custom-scrollbar">
                    {allBranches.map(branch => (
                      <label key={branch} className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative flex items-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={selectedBranches.includes(branch)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBranches([...selectedBranches, branch]);
                              } else {
                                setSelectedBranches(selectedBranches.filter(b => b !== branch));
                              }
                            }}
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-white/10 bg-white/5 checked:bg-white checked:border-white transition-all"
                          />
                          <svg
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="text-[11px] text-white/40 group-hover:text-white transition-colors leading-tight font-light">
                          {branch}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs"
                >
                  Predict Chances
                </button>
              </form>
            </div>

            <div className="bg-white/[0.02] rounded-[3rem] p-8 border border-white/5">
              <h3 className="text-[10px] uppercase tracking-widest font-medium text-white/30 mb-6 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Category Guide
              </h3>
              <ul className="space-y-4 text-[11px] text-white/40 font-light">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34a853] mt-1 shrink-0 shadow-[0_0_8px_rgba(52,168,83,0.5)]" />
                  <span><strong>Very Safe:</strong> Your rank is better than the previous year's opening rank.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34a853] mt-1 shrink-0" />
                  <span><strong>Safety:</strong> Highly likely to get admission. Rank is well within closing limits.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fbbc04] mt-1 shrink-0" />
                  <span><strong>Medium:</strong> Good chance. Rank is close to the previous year's closing rank.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea4335] mt-1 shrink-0" />
                  <span><strong>Reach:</strong> Borderline. Might get in during later rounds or spot rounds.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8 space-y-8">
            {!isSubmitted ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white/[0.02] rounded-[4rem] border border-white/5 border-dashed">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
                  <Search className="w-10 h-10 text-white/10" />
                </div>
                <h3 className="text-3xl font-light mb-4 glow-text tracking-tight">Ready to predict?</h3>
                <p className="text-white/30 max-w-sm font-light">
                  Enter your rank and details to see which IITs and branches you might qualify for.
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex items-start gap-4 mb-8">
                  <Info className="w-5 h-5 text-[#8ab4f8] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-light text-white/80">
                      Predictions are based on JoSAA 2024-25 Round 6 closing ranks.
                    </p>
                    <p className="text-xs text-white/40 font-light leading-relaxed">
                      This tool provides a statistical probability based on historical data. Actual seat allocation depends on the current year's competition, seat matrix changes, and student preferences.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <h2 className="text-3xl font-light tracking-tight glow-text">Predicted Options</h2>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        setCategory('OPEN');
                        setGender('Gender-Neutral');
                        setSelectedBranches([]);
                        setSearchQuery('');
                      }}
                      className="text-[10px] text-white/40 hover:text-white uppercase font-bold tracking-widest transition-colors whitespace-nowrap"
                    >
                      Reset Filters
                    </button>
                    <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search IIT or Branch..."
                      className="bg-white/5 border border-white/10 rounded-full pl-12 pr-12 py-3 text-sm focus:outline-none focus:border-white/30 transition-all w-full md:w-72 font-light"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                      >
                        <AlertCircle className="w-4 h-4 rotate-45" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-12">
                  <AnimatePresence mode="popLayout">
                    {predictions.length > 0 ? (
                      (['Safety', 'Medium', 'Reach', 'Unlikely'] as Category[]).map((cat) => {
                        const branchGroups = groupedPredictions[cat];
                        if (Object.keys(branchGroups).length === 0) return null;

                        return (
                          <motion.div 
                            key={cat}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                          >
                            <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                              <div className={`w-2 h-2 rounded-full ${
                                cat === 'Safety' ? 'bg-[#34a853]' :
                                cat === 'Medium' ? 'bg-[#fbbc04]' :
                                cat === 'Reach' ? 'bg-[#ea4335]' :
                                'bg-white/20'
                              }`} />
                              <h3 className="text-2xl font-light tracking-tight">{cat} {cat === 'Unlikely' ? 'Options' : 'Chances'}</h3>
                              <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium ml-auto">
                                {Object.values(branchGroups).flat().length} Results
                              </span>
                            </div>

                            <div className="space-y-12">
                              {(Object.entries(branchGroups) as [string, Prediction[]][]).map(([branch, branchPredictions]) => (
                                <div key={branch} className="space-y-6">
                                  <div className="flex items-center gap-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                                      {branch}
                                    </h4>
                                    <div className="h-px flex-1 bg-white/5" />
                                  </div>
                                  
                                  <div className="grid grid-cols-1 gap-4">
                                    {branchPredictions.map((p, idx) => (
                                      <motion.div
                                        key={`${p.institute}-${p.branch}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className="bg-white/[0.02] rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
                                      >
                                        <div className="flex items-start justify-between gap-6 relative z-10">
                                          <div className="space-y-2">
                                            <h3 className="text-lg font-light text-white/80 group-hover:text-white transition-colors">
                                              {p.institute}
                                            </h3>
                                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/30 font-medium">
                                              <span>{p.category}</span>
                                              <span className="w-1 h-1 rounded-full bg-white/10" />
                                              <span>{p.gender}</span>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-end gap-1">
                                            <span className="text-white/20 uppercase font-bold tracking-tighter text-[8px]">Closing Rank</span>
                                            <span className="text-white font-mono text-2xl leading-none tracking-tighter">{p.closingRank}</span>
                                          </div>
                                        </div>
                                        
                                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] relative z-10">
                                          <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                              <span className="text-white/20 uppercase font-bold tracking-tighter text-[8px]">Margin</span>
                                              <span className={`font-mono font-bold ${p.margin >= 0 ? 'text-[#34a853]' : 'text-[#ea4335]'}`}>
                                                {p.margin > 0 ? `+${p.margin}` : p.margin}
                                              </span>
                                            </div>
                                            {p.isVerySafe && (
                                              <div className="flex items-center gap-1.5 text-[#34a853] font-bold uppercase tracking-widest bg-[#34a853]/5 px-3 py-1 rounded-full border border-[#34a853]/10">
                                                <CheckCircle2 className="w-3 h-3" /> Very Safe
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 text-white/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer uppercase tracking-widest font-bold">
                                            Details <ChevronRight className="w-3 h-3" />
                                          </div>
                                        </div>

                                        <div className={`absolute -right-12 -top-12 w-32 h-32 blur-3xl opacity-0 transition-opacity group-hover:opacity-5 ${
                                          cat === 'Safety' ? 'bg-[#34a853]' :
                                          cat === 'Medium' ? 'bg-[#fbbc04]' :
                                          cat === 'Reach' ? 'bg-[#ea4335]' :
                                          'bg-white'
                                        }`} />
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="py-32 text-center space-y-6">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                          <AlertCircle className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/40 font-light">No matches found for your rank and filters.</p>
                        <button 
                          onClick={() => {setIsSubmitted(false); setRank('');}}
                          className="text-white text-xs uppercase tracking-widest font-bold hover:underline"
                        >
                          Try a different rank
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  </motion.div>
)}
</AnimatePresence>

      {/* Footer */}
      <footer className="mt-32 border-t border-white/5 py-16 bg-[#000000]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm text-white/40">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/5 rounded flex items-center justify-center border border-white/10">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-light tracking-tight text-white glow-text">MetricMatch</span>
            </div>
            <p className="leading-relaxed font-light">
              Helping students make informed decisions about their future in engineering since 2026.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-white font-medium uppercase tracking-widest text-[10px]">Resources</h4>
            <ul className="space-y-3 font-light">
              <li><a href="#" className="hover:text-white transition-colors">JoSAA Counseling</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Previous Year Cutoffs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">IIT Rankings</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-white font-medium uppercase tracking-widest text-[10px]">Disclaimer</h4>
            <p className="text-[11px] leading-relaxed font-light">
              This tool is for informational purposes only. Actual cutoffs may vary based on various factors including number of applicants, difficulty level, and seat availability.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
