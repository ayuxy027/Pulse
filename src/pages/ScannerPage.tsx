import React, { useState, useRef } from 'react';
import { Upload, Sparkles, TrendingUp, CheckCircle, Leaf, XCircle, Activity, Camera, RefreshCw, Loader } from 'lucide-react';
import { analyzeFoodImage, FoodAnalysisResult } from '../services/foodAnalysisService';
import { motion, AnimatePresence } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';

/**
 * ScannerPage - Modern Food Scanner Interface
 * Clean, dashboard-inspired design with persistent image display
 */
const ScannerPage: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [processingSteps, setProcessingSteps] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileUpload = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const addProcessingStep = (step: string) => {
        setProcessingSteps((prev) => [...prev, step]);
    };

    const handleAnalyze = async () => {
        if (!uploadedImage) return;

        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);
        setAnalysisProgress(0);
        setProcessingSteps([]);
        setCurrentStep(0);

        try {
            // Send API request and run progress animation concurrently
            addProcessingStep("Initializing AI analysis pipeline...");
            setAnalysisProgress(15);

            // Start API request
            const apiPromise = analyzeFoodImage(uploadedImage);

            // Run progress animation concurrently
            const steps = [
                { message: "Uploading image to cloud...", duration: 1500 },
                { message: "Performing cloud-based image analysis...", duration: 2000 },
                { message: "Running AI model predictions...", duration: 2000 },
                { message: "Analyzing nutrition patterns...", duration: 1500 },
                { message: "Generating health recommendations...", duration: 1500 },
                { message: "Finalizing analysis report...", duration: 1000 },
            ];

            let progress = 15;
            const progressIncrement = (85) / steps.length;

            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                setCurrentStep(i);
                addProcessingStep(step.message);

                const startProgress = progress;
                const endProgress = progress + progressIncrement;
                const duration = step.duration;
                const stepStart = Date.now();

                while (progress < endProgress) {
                    const elapsed = Date.now() - stepStart;
                    const percentage = Math.min(elapsed / duration, 1);
                    progress = startProgress + progressIncrement * percentage;
                    setAnalysisProgress(Math.min(progress, 99));
                    await new Promise((r) => setTimeout(r, 50));
                }
                await new Promise((r) => setTimeout(r, 100));
            }

            // Wait for API to complete
            const result = await apiPromise;

            setAnalysisProgress(100);
            await new Promise((r) => setTimeout(r, 300));
            addProcessingStep("Analysis complete!");
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f6f1]">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Modern Hero Header - Flat Design */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-5 mb-6">
                        {/* Icon */}
                        <motion.div 
                            className="p-4 bg-[#1a1a1a] rounded-2xl"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Camera className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        {/* Title & Description */}
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-1 tracking-tight">
                                Smart Food Scanner
                            </h1>
                            <p className="text-lg text-gray-600">
                                Snap your meal and get instant nutrition analysis
                            </p>
                        </div>
                    </div>
                    
                    {/* Feature Pills - Flat */}
                    <div className="flex flex-wrap gap-3 pl-16">
                        <span className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Instant Analysis
                        </span>
                        <span className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Smart Insights
                        </span>
                        <span className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            AI Powered
                        </span>
                    </div>
                </motion.div>

                {/* Single Column Layout */}
                <div className="space-y-6">
                    {/* Image Upload/Display - Smaller & Flat */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="bg-white rounded-2xl border border-gray-200 p-5">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-1 h-5 bg-[#1a1a1a] rounded-full"></div>
                                <h3 className="text-base font-bold text-gray-900">Food Image</h3>
                            </div>
                            
                            {uploadedImage ? (
                                <div className="relative max-w-xl mx-auto aspect-[16/10] rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                                    <img
                                        src={uploadedImage}
                                        alt="Food"
                                        className="w-full h-full object-contain"
                                    />
                                    {!isAnalyzing && !analysisResult && (
                                        <button
                                            onClick={() => {
                                                setUploadedImage(null);
                                            }}
                                            className="absolute top-2.5 right-2.5 p-2 bg-white/95 rounded-full hover:bg-white shadow-md transition-colors"
                                        >
                                            <XCircle className="w-4 h-4 text-gray-600" />
                                        </button>
                                    )}
                                    {analysisResult && (
                                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full shadow-md">
                                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                            <span className="text-xs font-semibold text-gray-700">Analyzed</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`max-w-xl mx-auto aspect-[16/10] rounded-xl border-2 border-dashed transition-colors ${
                                        dragActive ? 'border-gray-400 bg-gray-50' : 'border-gray-300 bg-gray-50/50'
                                    }`}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        ref={fileInputRef}
                                    />
                                    <div className="h-full flex flex-col items-center justify-center p-6">
                                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                        <p className="text-base font-semibold text-gray-700 mb-1">
                                            Drop image here or click to browse
                                        </p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Supports JPG, PNG, WEBP
                                        </p>
                                        <button
                                            onClick={handleBrowseClick}
                                            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1a1a1a] rounded-xl hover:bg-black transition-colors"
                                        >
                                            Select Image
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons - Below Image */}
                            {uploadedImage && !analysisResult && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className={`w-full mt-4 py-3.5 rounded-xl font-bold text-base transition-all ${
                                        isAnalyzing
                                            ? 'bg-gray-400 cursor-not-allowed text-white'
                                            : 'bg-[#1a1a1a] hover:bg-black text-white'
                                    }`}
                                >
                                    {isAnalyzing ? (
                                        <span className="flex items-center justify-center gap-2.5">
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Analyzing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2.5">
                                            <Sparkles className="w-5 h-5" />
                                            Analyze Food
                                        </span>
                                    )}
                                </motion.button>
                            )}

                            {analysisResult && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => {
                                        setUploadedImage(null);
                                        setAnalysisResult(null);
                                        setAnalysisProgress(0);
                                        setProcessingSteps([]);
                                        setCurrentStep(0);
                                        setError(null);
                                    }}
                                    className="w-full mt-4 py-3.5 bg-[#1a1a1a] text-white rounded-xl font-bold text-base hover:bg-black transition-all flex items-center justify-center gap-2.5"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    New Analysis
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    {/* Loading State or Results */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Loading State */}
                        {isAnalyzing && (
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-8 shadow-sm">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative w-36 h-36 mb-6">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle
                                                cx="72"
                                                cy="72"
                                                r="68"
                                                stroke="#E5E7EB"
                                                strokeWidth="8"
                                                fill="none"
                                            />
                                            <circle
                                                cx="72"
                                                cy="72"
                                                r="68"
                                                stroke="url(#gradient)"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 68}`}
                                                strokeDashoffset={`${2 * Math.PI * 68 * (1 - analysisProgress / 100)}`}
                                                strokeLinecap="round"
                                                className="transition-all duration-500"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#374151" />
                                                    <stop offset="50%" stopColor="#4B5563" />
                                                    <stop offset="100%" stopColor="#6B7280" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold bg-gradient-to-br from-gray-700 to-gray-600 bg-clip-text text-transparent">
                                                {Math.round(analysisProgress)}%
                                            </span>
                                            <Sparkles className="w-4 h-4 text-gray-400 mt-1" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        Analyzing Food
                                    </h3>
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={currentStep}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-sm text-gray-600 font-medium"
                                        >
                                            {processingSteps[currentStep] || "Processing..."}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* Results Display - Single Column with Larger Components */}
                        {analysisResult && !isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-5"
                            >
                                {/* Stats Grid - Larger Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <Leaf className="w-5 h-5 text-gray-700" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">Food Item</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 truncate mb-1">
                                            {analysisResult.foodName}
                                        </p>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {analysisResult.confidenceLevel}% confidence
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <TrendingUp className="w-5 h-5 text-gray-700" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">Calories</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 mb-1">
                                            {analysisResult.calories}
                                        </p>
                                        <p className="text-sm text-gray-500 font-medium">
                                            Total energy
                                        </p>
                                    </div>

                                    <div className={`rounded-2xl border p-5 ${
                                        analysisResult.healthVerdict.isHealthy 
                                            ? 'bg-white border-gray-200' 
                                            : 'bg-white border-gray-200'
                                    }`}>
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <div className={`p-2 rounded-lg ${
                                                analysisResult.healthVerdict.isHealthy ? 'bg-gray-100' : 'bg-gray-100'
                                            }`}>
                                                {analysisResult.healthVerdict.isHealthy ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-orange-600" />
                                                )}
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">Health Score</span>
                                        </div>
                                        <p className={`text-2xl font-bold mb-1 ${
                                            analysisResult.healthVerdict.isHealthy ? 'text-green-600' : 'text-orange-600'
                                        }`}>
                                            {analysisResult.healthVerdict.isHealthy ? 'Healthy' : 'Moderate'}
                                        </p>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {analysisResult.healthVerdict.rating}/10 rating
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <Activity className="w-5 h-5 text-gray-700" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">Immunity</span>
                                        </div>
                                        <p className={`text-2xl font-bold capitalize mb-1 ${
                                            analysisResult.immunityImpact.overall === 'positive' ? 'text-green-600' :
                                            analysisResult.immunityImpact.overall === 'negative' ? 'text-red-600' : 'text-gray-700'
                                        }`}>
                                            {analysisResult.immunityImpact.overall}
                                        </p>
                                        <p className="text-sm text-gray-500 font-medium">
                                            Impact level
                                        </p>
                                    </div>
                                </div>

                                {/* Nutrition Chart - Full Width & Larger */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-1.5 h-6 bg-[#1a1a1a] rounded-full"></div>
                                        <h3 className="text-lg font-bold text-gray-800">Nutrition Breakdown</h3>
                                    </div>
                                    <div className="h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Protein', value: analysisResult.nutrientBreakdown.protein },
                                                { name: 'Carbs', value: analysisResult.nutrientBreakdown.carbs },
                                                { name: 'Fat', value: analysisResult.nutrientBreakdown.fat },
                                                { name: 'Fiber', value: analysisResult.nutrientBreakdown.fiber },
                                                { name: 'Sugar', value: analysisResult.nutrientBreakdown.sugar },
                                                { name: 'Sodium', value: analysisResult.nutrientBreakdown.sodium },
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="name" stroke="#666" fontSize={11} />
                                                <YAxis stroke="#666" fontSize={11} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill="#4B5563" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* AI Analysis - Full Width & Larger */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-[#1a1a1a] rounded-xl">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">AI Analysis</h3>
                                            <p className="text-sm text-gray-500 font-medium">Intelligent food insights</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                        <p className="text-base text-gray-800 leading-relaxed font-medium">
                                            {analysisResult.analysisSummary}
                                        </p>
                                    </div>
                                </div>

                                {/* Benefits & Concerns - Side by Side, Larger */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Health Benefits */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900">
                                                Health Benefits
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {analysisResult.prosAndCons.pros.map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-start gap-3 bg-gray-50 rounded-lg p-3.5 border border-gray-100"
                                                >
                                                    <div className="mt-0.5">
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <p className="text-sm text-gray-700 font-medium leading-relaxed flex-1">
                                                        {item}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Health Concerns */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900">
                                                Health Concerns
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {analysisResult.prosAndCons.cons.length > 0 ? (
                                                analysisResult.prosAndCons.cons.map((item, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-start gap-3 bg-gray-50 rounded-lg p-3.5 border border-gray-100"
                                                    >
                                                        <div className="mt-0.5">
                                                            <XCircle className="w-4 h-4 text-red-600" />
                                                        </div>
                                                        <p className="text-sm text-gray-700 font-medium leading-relaxed flex-1">
                                                            {item}
                                                        </p>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                    <p className="text-sm text-gray-600 font-medium">
                                                        No major health concerns identified
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendations - Wider & Larger */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2.5 bg-[#1a1a1a] rounded-xl">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Recommendations
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium">Personalized nutrition tips</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {analysisResult.recommendations.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                                            >
                                                <div className="mt-0.5 p-2 bg-gray-200 rounded-lg flex-shrink-0">
                                                    <Sparkles className="w-4 h-4 text-gray-700" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-bold text-gray-700">Tip #{index + 1}</span>
                                                        <div className="h-px flex-1 bg-gray-200"></div>
                                                    </div>
                                                    <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                                        {item}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 rounded-xl p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-base font-bold text-red-900 mb-1">Analysis Failed</h4>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ScannerPage;
