import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Shield, TrendingUp, CheckCircle, BrainCircuit, Microscope, Leaf, XCircle, Activity, Target, Image as ImageIcon } from 'lucide-react';
import { analyzeFoodImage, FoodAnalysisResult } from '../services/foodAnalysisService';
import { motion, AnimatePresence } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { BsDatabaseCheck } from "react-icons/bs";
import { LuFileHeart } from "react-icons/lu";
import { MdOutlineZoomInMap } from "react-icons/md";
import { GiMuscleUp } from 'react-icons/gi';
import Button from '../components/ui/Button';

/**
 * ScannerPage - AI-Based Food Scanner Interface
 * Purpose: Let users upload or snap a picture of their meal to get instant nutrition analysis
 */
// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 },
};


const ScannerPage: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isImageUploaded, setIsImageUploaded] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [processingSteps, setProcessingSteps] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('foodAnalysis');
        const savedImage = localStorage.getItem('uploadedImage');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setAnalysisResult(data);
                setAnalysisProgress(100);
                if (savedImage) {
                    setUploadedImage(savedImage);
                }
            } catch (e) {
                console.error('Failed to load saved analysis');
            }
        }
    }, []);

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
                setIsImageUploaded(true);
                // Auto-analyze when image is uploaded
                setTimeout(() => {
                    handleAnalyze();
                }, 500); // Small delay to ensure state is set
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
            // Start API request immediately
            const apiPromise = analyzeFoodImage(uploadedImage);

            // Start progress animation immediately in parallel
            addProcessingStep("Initializing AI analysis pipeline...");
            setAnalysisProgress(15);

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

            // Run progress animation in parallel with API request
            const progressAnimation = async () => {
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
            };

            // Run both API request and progress animation concurrently
            const [, result] = await Promise.all([
                progressAnimation(),
                apiPromise
            ]);

            setAnalysisProgress(100);
            await new Promise((r) => setTimeout(r, 300));
            addProcessingStep("Analysis complete!");
            setAnalysisResult(result);
            localStorage.setItem('foodAnalysis', JSON.stringify(result));
            localStorage.setItem('uploadedImage', uploadedImage || '');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#f8f6f1]">
            <div className="px-4 py-8 mx-auto max-w-7xl md:py-12 sm:px-6 lg:px-8">
                {/* Enhanced Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900 leading-tight max-w-4xl mx-auto text-center"
                    >
                        Smart Food Scanner
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-600 max-w-3xl mx-auto mb-8"
                    >
                        Upload a photo of your meal and get instant AI-powered nutrition analysis,
                        health insights, and personalized recommendations.
                    </motion.p>

                    {!import.meta.env.VITE_GEMINI_API_KEY && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl max-w-lg mx-auto"
                        >
                            <p className="text-sm text-yellow-800">
                                <strong>Demo Mode:</strong> API key not configured. Using mock data for demonstration.
                            </p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8"
                >
                    <div className="text-center p-4">
                        <div className="flex justify-center mb-2">
                            <BsDatabaseCheck size={24} className="text-gray-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Instant Analysis</h3>
                        <p className="text-gray-600 text-xs">Get nutrition breakdown in seconds with advanced AI recognition</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="flex justify-center mb-2">
                            <LuFileHeart size={24} className="text-gray-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Health Insights</h3>
                        <p className="text-gray-600 text-xs">Receive personalized recommendations based on your meal</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="flex justify-center mb-2">
                            <MdOutlineZoomInMap size={24} className="text-gray-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Smart Tracking</h3>
                        <p className="text-gray-600 text-xs">Monitor your nutrition intake and health progress over time</p>
                    </div>
                </motion.div>


                {/* Upload Section */}
                <AnimatePresence mode="wait">
                    {!isImageUploaded && !analysisResult && (
                        <motion.div
                            key="upload-section"
                            variants={fadeInUp}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="mb-8"
                        >
                            <div className="relative">
                                <motion.div
                                    whileHover={{
                                        boxShadow: isAnalyzing
                                            ? "none"
                                            : "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                                    }}
                                    animate={
                                        dragActive
                                            ? {
                                                borderColor: "#6B7280",
                                                backgroundColor: "#F9FAFB",
                                            }
                                            : {
                                                borderColor: "#D1D5DB",
                                                backgroundColor: "#FFFFFF",
                                            }
                                    }
                                    className="relative p-6 rounded-xl border-2 border-dashed transition-all duration-300 bg-gradient-to-r from-gray-50 to-white"
                                    style={{ opacity: isAnalyzing ? 0.6 : 1 }}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        ref={fileInputRef}
                                        aria-label="Upload food image"
                                    />
                                    <div className="flex flex-col items-center">
                                        <motion.div
                                            className={`p-4 mb-4 rounded-full transition-all duration-300 ${dragActive ? "bg-gray-100" : "bg-gray-100"
                                                }`}
                                            whileHover={{
                                                backgroundColor: isAnalyzing ? "#F3F4F6" : "#E5E7EB",
                                            }}
                                        >
                                            <Upload className="w-10 h-10 text-gray-600" />
                                        </motion.div>
                                        <motion.h3
                                            className="mb-2 text-xl font-semibold text-gray-900"
                                            animate={{ scale: dragActive ? 1.1 : 1 }}
                                        >
                                            Drag and drop your food image here
                                        </motion.h3>
                                        <motion.p
                                            className="mb-4 text-sm text-gray-600"
                                            animate={{ opacity: dragActive ? 0.7 : 1 }}
                                        >
                                            or click to select a file - analysis starts automatically
                                        </motion.p>
                                        <motion.button
                                            className="px-6 py-2 text-sm font-medium text-white rounded-full bg-gray-600"
                                            whileHover={{
                                                backgroundColor: isAnalyzing ? "#6B7280" : "#4B5563",
                                            }}
                                            disabled={isAnalyzing}
                                            onClick={handleBrowseClick}
                                        >
                                            {isAnalyzing ? "Processing..." : "Select File"}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Image Preview and Analyze Button */}
                <AnimatePresence mode="wait">
                    {isImageUploaded && uploadedImage && !isAnalyzing && !analysisResult && (
                        <motion.div
                            key="preview-section"
                            variants={fadeInUp}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="relative mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200"
                        >
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                                        Image Preview
                                    </h3>
                                    <div className="relative h-64 w-full overflow-hidden rounded-lg shadow-md aspect-[4/3]">
                                        <img
                                            src={uploadedImage}
                                            alt="Uploaded food"
                                            className="absolute inset-0 w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <motion.button
                                        className="px-6 py-3 text-white font-medium rounded-full flex items-center gap-2 bg-gray-600"
                                        whileHover={{ backgroundColor: "#4B5563" }}
                                        onClick={handleAnalyze}
                                    >
                                        <Sparkles className="w-5 h-5" /> Analyze Food
                                    </motion.button>
                                </div>
                            </div>
                            <motion.button
                                className="absolute top-3 right-3 p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                                whileHover={{ backgroundColor: "#FECACA" }}
                                onClick={() => {
                                    setUploadedImage(null);
                                    setIsImageUploaded(false);
                                    setAnalysisResult(null);
                                    setError(null);
                                    setIsAnalyzing(false);
                                    setAnalysisProgress(0);
                                    setProcessingSteps([]);
                                    setCurrentStep(0);
                                }}
                                aria-label="Remove uploaded image"
                            >
                                <XCircle className="w-5 h-5 text-red-700" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Analysis Component */}
                <AnimatePresence mode="wait">
                    {isAnalyzing && (
                        <motion.div
                            key="analysis-section"
                            variants={fadeInUp}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="mb-8 p-8 flex flex-col items-center justify-center text-center bg-white rounded-xl shadow-lg border border-gray-200"
                        >
                            <h3 className="text-2xl font-bold text-gray-900">
                                Analyzing Food Nutrition
                            </h3>
                            <p className="mt-2 mb-8 text-base text-gray-600">
                                Please wait while our AI examines your food...
                            </p>

                            {/* Circular Progress Indicator */}
                            <div className="relative w-40 h-40 mb-6">
                                <svg
                                    className="absolute top-0 left-0 w-full h-full"
                                    viewBox="0 0 100 100"
                                >
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        stroke="#E5E7EB"
                                        strokeWidth="10"
                                        fill="transparent"
                                    />
                                    <motion.circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        stroke="url(#progressGradient)"
                                        strokeWidth="10"
                                        fill="transparent"
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)"
                                        style={{
                                            strokeDasharray: "282.74",
                                            strokeDashoffset: "282.74",
                                        }}
                                        animate={{
                                            strokeDashoffset:
                                                282.74 - (analysisProgress / 100) * 282.74,
                                        }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                    <defs>
                                        <linearGradient
                                            id="progressGradient"
                                            x1="0%"
                                            y1="0%"
                                            x2="100%"
                                            y2="100%"
                                        >
                                            <stop offset="0%" stopColor="#6B7280" />
                                            <stop offset="100%" stopColor="#374151" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{ duration: 0.3, ease: "backInOut" }}
                                        >
                                            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-50">
                                                {[
                                                    <Upload key="upload" className="w-10 h-10 text-gray-600" />,
                                                    <ImageIcon key="image" className="w-10 h-10 text-gray-600" />,
                                                    <BrainCircuit key="brain" className="w-10 h-10 text-gray-600" />,
                                                    <Microscope key="microscope" className="w-10 h-10 text-gray-600" />,
                                                    <Activity key="activity" className="w-10 h-10 text-gray-600" />,
                                                    <Target key="target" className="w-10 h-10 text-gray-600" />,
                                                    <CheckCircle key="check" className="w-10 h-10 text-gray-600" />,
                                                ][currentStep] || (
                                                        <CheckCircle key="default" className="w-10 h-10 text-gray-600" />
                                                    )}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="h-12 w-full max-w-xs mx-auto">
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={currentStep}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="text-lg font-medium text-gray-900"
                                    >
                                        {processingSteps[currentStep] || "Finalizing report..."}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                            <span className="text-xl font-bold mt-2 text-gray-600">
                                {analysisProgress.toFixed(0)}%
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Enhanced Results Section */}
                <AnimatePresence mode="wait">
                    {analysisResult && analysisProgress === 100 && (
                        <motion.div
                            key="results-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Success Banner */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex justify-center items-center p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm"
                            >
                                <CheckCircle className="mr-2 w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-700">
                                    Food Analysis completed successfully
                                </span>
                            </motion.div>

                            {/* Scanned Image Section */}
                            {uploadedImage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="p-6 bg-white rounded-xl shadow-lg border border-gray-200"
                                >
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                                        Scanned Image
                                    </h3>
                                    <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-md">
                                        <img
                                            src={uploadedImage}
                                            alt="Scanned food"
                                            className="absolute inset-0 w-full h-full object-contain bg-gray-50"
                                        />
                                        <div className="absolute top-3 right-3 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-md">
                                            <GiMuscleUp className="w-4 h-4 text-gray-600" />
                                            <span className="text-xs font-semibold text-gray-700">AI Analyzed</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Top Row - Key Metrics */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 md:grid-cols-2">
                                {/* Food Name Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border shadow-lg hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="flex gap-3 items-center mb-6">
                                        <div className="p-3 bg-gray-100 rounded-xl">
                                            <Leaf className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Food Identified
                                        </h3>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                                            {analysisResult.foodName}
                                        </div>
                                        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block">
                                            AI Confidence: {analysisResult.confidenceLevel}%
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Calories Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border shadow-lg hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="flex gap-3 items-center mb-6">
                                        <div className="p-3 bg-gray-100 rounded-xl">
                                            <TrendingUp className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Calories
                                        </h3>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-gray-900 mb-3">
                                            {analysisResult.calories}
                                        </div>
                                        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block">
                                            Per {analysisResult.servingSize || '100g'}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Health Score Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border shadow-lg hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="flex gap-3 items-center mb-6">
                                        <div className="p-3 bg-gray-100 rounded-xl">
                                            <CheckCircle className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Health Score
                                        </h3>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-gray-900 mb-3">
                                            {analysisResult.healthVerdict.rating}/10
                                        </div>
                                        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block">
                                            {analysisResult.healthVerdict.isHealthy ? 'HEALTHY' : 'MODERATE'}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Immunity Score Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className={`p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-shadow duration-300 ${analysisResult.immunityImpact.overall === 'positive'
                                        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-100/50'
                                        : analysisResult.immunityImpact.overall === 'negative'
                                            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-100/50'
                                            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-100/50'
                                        }`}
                                >
                                    <div className="flex gap-3 items-center mb-6">
                                        <div className={`p-3 rounded-xl ${analysisResult.immunityImpact.overall === 'positive'
                                            ? 'bg-green-100'
                                            : analysisResult.immunityImpact.overall === 'negative'
                                                ? 'bg-red-100'
                                                : 'bg-gray-100'
                                            }`}>
                                            <Shield className={`w-6 h-6 ${analysisResult.immunityImpact.overall === 'positive'
                                                ? 'text-green-600'
                                                : analysisResult.immunityImpact.overall === 'negative'
                                                    ? 'text-red-600'
                                                    : 'text-gray-600'
                                                }`} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Immunity Score
                                        </h3>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-4xl font-bold mb-3 ${analysisResult.immunityImpact.overall === 'positive'
                                            ? 'text-green-600'
                                            : analysisResult.immunityImpact.overall === 'negative'
                                                ? 'text-red-600'
                                                : 'text-gray-600'
                                            }`}>
                                            {analysisResult.immunityImpact?.immunityScore || analysisResult.immunityImpact.overall === 'positive' ? '92' : analysisResult.immunityImpact.overall === 'negative' ? '35' : '65'}/100
                                        </div>
                                        <div className={`text-sm px-3 py-1 rounded-full inline-block ${analysisResult.immunityImpact.overall === 'positive'
                                            ? 'bg-green-50 text-green-700'
                                            : analysisResult.immunityImpact.overall === 'negative'
                                                ? 'bg-red-50 text-red-700'
                                                : 'bg-gray-50 text-gray-600'
                                            }`}>
                                            {analysisResult.immunityImpact.overall.toUpperCase()}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Nutrition Breakdown Chart */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="p-6 bg-white rounded-xl border border-gray-200"
                            >
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Macronutrients</h3>
                                    <p className="text-sm text-gray-600">Per {analysisResult.servingSize || '100g'} serving</p>
                                </div>

                                <div className="h-64 min-h-[256px] w-full">
                                    <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                                        <BarChart data={[
                                            { name: 'Protein', value: analysisResult.nutrientBreakdown.protein || 0, color: '#10B981', fill: '#10B981' },
                                            { name: 'Carbs', value: analysisResult.nutrientBreakdown.carbs || 0, color: '#3B82F6', fill: '#3B82F6' },
                                            { name: 'Fat', value: analysisResult.nutrientBreakdown.fat || 0, color: '#F59E0B', fill: '#F59E0B' },
                                            { name: 'Fiber', value: analysisResult.nutrientBreakdown.fiber || 0, color: '#8B5CF6', fill: '#8B5CF6' },
                                            { name: 'Sugar', value: analysisResult.nutrientBreakdown.sugar || 0, color: '#EF4444', fill: '#EF4444' },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.6} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#666"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#666"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => `${value}g`}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #E5E7EB',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}
                                                formatter={(value) => [`${value}g`, '']}
                                            />
                                            <Bar
                                                dataKey="value"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Micronutrients Grid */}
                            {analysisResult.micronutrients && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    {/* Vitamins */}
                                    <div className="p-6 bg-white rounded-xl border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Microscope className="w-5 h-5 text-gray-600" />
                                            Key Vitamins
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(analysisResult.micronutrients.vitamins).map(([vitamin, value], idx) => (
                                                value > 0 && (
                                                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                                        <div className="text-sm font-medium text-gray-700">{vitamin}</div>
                                                        <div className="text-xs text-gray-500">{value}mg</div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>

                                    {/* Minerals */}
                                    <div className="p-6 bg-white rounded-xl border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-gray-600" />
                                            Essential Minerals
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(analysisResult.micronutrients.minerals).map(([mineral, value], idx) => (
                                                value > 0 && (
                                                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                                        <div className="text-sm font-medium text-gray-700">{mineral}</div>
                                                        <div className="text-xs text-gray-500">{value}mg</div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Immunity Properties */}
                            {analysisResult.immunityImpact?.immuneProperties && analysisResult.immunityImpact.immuneProperties.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-100"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-green-600" />
                                        Immune-Boosting Properties
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.immunityImpact.immuneProperties.map((prop, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-white/80 text-sm font-medium text-gray-700 rounded-lg border border-green-200">
                                                {prop}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Dietary Tags & Allergenic Properties */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {/* Dietary Tags */}
                                {analysisResult.dietaryTags && analysisResult.dietaryTags.length > 0 && (
                                    <div className="p-6 bg-white rounded-xl border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisResult.dietaryTags.map((tag, idx) => (
                                                <span key={idx} className="px-3 py-1.5 bg-gray-100 text-sm font-medium text-gray-700 rounded-lg">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Allergenic Properties */}
                                {analysisResult.allergenicProperties && (
                                    <div className="p-6 bg-white rounded-xl border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergen Info</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className={`p-2 rounded-lg text-sm text-center font-medium ${analysisResult.allergenicProperties.glutenFree ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {analysisResult.allergenicProperties.glutenFree ? '✓ Gluten Free' : '✗ Contains Gluten'}
                                            </div>
                                            <div className={`p-2 rounded-lg text-sm text-center font-medium ${analysisResult.allergenicProperties.dairyFree ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {analysisResult.allergenicProperties.dairyFree ? '✓ Dairy Free' : '✗ Contains Dairy'}
                                            </div>
                                            <div className={`p-2 rounded-lg text-sm text-center font-medium ${analysisResult.allergenicProperties.vegan ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {analysisResult.allergenicProperties.vegan ? '✓ Vegan' : 'Not Vegan'}
                                            </div>
                                            <div className={`p-2 rounded-lg text-sm text-center font-medium ${analysisResult.allergenicProperties.vegetarian ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {analysisResult.allergenicProperties.vegetarian ? '✓ Vegetarian' : 'Not Vegetarian'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Personalized Insights */}
                            {analysisResult.personalizedInsights && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                    className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Target className="w-5 h-5 text-purple-600" />
                                        Personalized Insights
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/80 rounded-lg">
                                            <div className="text-sm font-medium text-gray-600 mb-1">Best Meal Timing</div>
                                            <div className="text-base font-semibold text-gray-900">{analysisResult.personalizedInsights.mealTiming}</div>
                                        </div>
                                        <div className="p-4 bg-white/80 rounded-lg">
                                            <div className="text-sm font-medium text-gray-600 mb-1">Portion Recommendation</div>
                                            <div className="text-base font-semibold text-gray-900">{analysisResult.personalizedInsights.portionRecommendation}</div>
                                        </div>
                                        <div className="p-4 bg-white/80 rounded-lg md:col-span-2">
                                            <div className="text-sm font-medium text-gray-600 mb-2">Diet Compatibility</div>
                                            <div className="text-base text-gray-900">{analysisResult.personalizedInsights.suitabilityForDiet}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* AI Analysis Summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0 }}
                                className="p-8 bg-white rounded-2xl border shadow-xl border-gray-200"
                            >
                                <div className="text-center mb-6">
                                    <div className="flex gap-3 items-center justify-center mb-4">
                                        <div className="p-3 bg-gray-100 rounded-xl">
                                            <BrainCircuit className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            AI Analysis Summary
                                        </h3>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                                    <p className="text-gray-700 text-lg leading-relaxed text-center mb-6">{analysisResult.analysisSummary}</p>
                                    <div className="flex items-center gap-3 max-w-md mx-auto">
                                        <span className="text-sm font-medium text-gray-600">AI Confidence:</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                                            <motion.div
                                                className="bg-gradient-to-r from-gray-600 to-gray-700 h-3 rounded-full"
                                                initial={{ width: "0%" }}
                                                animate={{ width: `${analysisResult.confidenceLevel}%` }}
                                                transition={{ duration: 1, delay: 1.1 }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{analysisResult.confidenceLevel}%</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Pros and Cons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                <div className="p-6 bg-white rounded-2xl border shadow-lg border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <CheckCircle size={20} className="text-green-600" />
                                        Health Benefits
                                    </h4>
                                    <ul className="space-y-2">
                                        {analysisResult.prosAndCons.pros.map((item, index) => (
                                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                                <span className="text-green-600 mt-1">✓</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 bg-white rounded-2xl border shadow-lg border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <XCircle size={20} className="text-red-600" />
                                        Health Concerns
                                    </h4>
                                    <ul className="space-y-2">
                                        {analysisResult.prosAndCons.cons.length > 0 ? (
                                            analysisResult.prosAndCons.cons.map((item, index) => (
                                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <span className="text-red-600 mt-1">⚠</span>
                                                    {item}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-gray-500">No significant health concerns identified</li>
                                        )}
                                    </ul>
                                </div>
                            </motion.div>

                            {/* Recommendations */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6"
                            >
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles size={20} className="text-blue-600" />
                                    AI Recommendations
                                </h4>
                                <ul className="space-y-2">
                                    {analysisResult.recommendations.map((item, index) => (
                                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="text-blue-600 mt-1">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Restart Analysis Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="flex justify-center"
                            >
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setUploadedImage(null);
                                        setIsImageUploaded(false);
                                        setAnalysisResult(null);
                                        setAnalysisProgress(0);
                                        setProcessingSteps([]);
                                        setCurrentStep(0);
                                        setError(null);
                                        setIsAnalyzing(false);
                                        localStorage.removeItem('foodAnalysis');
                                        localStorage.removeItem('uploadedImage');
                                    }}
                                    className="w-auto"
                                >
                                    <GiMuscleUp size={20} />
                                    New Analysis
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg"
                    >
                        {error}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ScannerPage;