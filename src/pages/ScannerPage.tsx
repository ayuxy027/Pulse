import React, { useState } from 'react';
import { Upload, Camera, Sparkles, Zap, Shield, TrendingUp, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { analyzeFoodImage, FoodAnalysisResult } from '../services/foodAnalysisService';

/**
 * ScannerPage - AI-Based Food Scanner Interface
 * Purpose: Let users upload or snap a picture of their meal to get instant nutrition analysis
 */
const ScannerPage: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

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
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!uploadedImage) return;

        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeFoodImage(uploadedImage);
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="w-full bg-[#f8f6f1] min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
                        🍱 AI Food Scanner
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Snap your meal and get instant nutrition analysis with AI-powered insights
                    </p>
                </div>

                {/* Main Scanner Interface */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

                    {/* Upload Section */}
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                                <Camera size={24} className="text-gray-700" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900">
                                Upload Your Food Image
                            </h2>
                        </div>

                        <div
                            className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${dragActive
                                ? 'border-gray-400 bg-gray-50'
                                : 'border-gray-300 bg-gray-25 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {uploadedImage ? (
                                <div className="space-y-4">
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded food"
                                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                                    />
                                    <p className="text-gray-600">Image uploaded successfully!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-center">
                                        <div className="p-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                                            <Upload size={48} className="text-gray-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xl font-medium text-gray-700 mb-2">
                                            Drag and Drop your food image here
                                        </p>
                                        <p className="text-gray-500 mb-6">or</p>
                                        <button className="px-8 py-4 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-200 shadow-sm">
                                            Browse Files
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Camera Upload Option */}
                        <div className="mt-6 flex justify-center">
                            <button className="flex items-center gap-3 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 border border-gray-200">
                                <Camera size={20} className="text-gray-600" />
                                Take Photo with Camera
                            </button>
                        </div>

                        {/* Analysis Button */}
                        {uploadedImage && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAnalyzing ? (
                                        <div className="flex items-center gap-3">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Analyzing with AI...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Sparkles size={20} />
                                            Analyze Nutrition
                                        </div>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Analysis Results */}
                    {analysisResult && (
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h3 className="text-2xl font-semibold text-gray-900 text-center mb-8">
                                🍽️ Analysis Results
                            </h3>

                            {/* Food Name and Summary */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8">
                                <h4 className="text-xl font-bold text-gray-900 mb-2">{analysisResult.foodName}</h4>
                                <p className="text-gray-600">{analysisResult.analysisSummary}</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Confidence:</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${analysisResult.confidenceLevel}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{analysisResult.confidenceLevel}%</span>
                                </div>
                            </div>

                            {/* Nutrition Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                                    <div className="p-3 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 mx-auto mb-4 w-fit">
                                        <TrendingUp size={24} className="text-orange-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Calories</h4>
                                    <p className="text-2xl font-bold text-orange-600">{analysisResult.calories}</p>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                                    <div className="p-3 rounded-full bg-gradient-to-br from-green-100 to-green-200 mx-auto mb-4 w-fit">
                                        <Zap size={24} className="text-green-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Protein</h4>
                                    <p className="text-2xl font-bold text-green-600">{analysisResult.nutrientBreakdown.protein}g</p>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mx-auto mb-4 w-fit">
                                        <Shield size={24} className="text-blue-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Carbs</h4>
                                    <p className="text-2xl font-bold text-blue-600">{analysisResult.nutrientBreakdown.carbs}g</p>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                                    <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 mx-auto mb-4 w-fit">
                                        <Sparkles size={24} className="text-purple-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Fat</h4>
                                    <p className="text-2xl font-bold text-purple-600">{analysisResult.nutrientBreakdown.fat}g</p>
                                </div>
                            </div>

                            {/* Health Verdict */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    {analysisResult.healthVerdict.isHealthy ? (
                                        <CheckCircle size={24} className="text-green-600" />
                                    ) : (
                                        <XCircle size={24} className="text-red-600" />
                                    )}
                                    <h4 className="text-lg font-semibold text-gray-900">Health Verdict</h4>
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Rating:</span>
                                        <div className="flex items-center gap-1">
                                            {[...Array(10)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-3 h-3 rounded-full ${i < analysisResult.healthVerdict.rating
                                                            ? 'bg-green-500'
                                                            : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{analysisResult.healthVerdict.rating}/10</span>
                                    </div>
                                </div>
                                <p className="text-gray-600">{analysisResult.healthVerdict.reason}</p>
                            </div>

                            {/* Immunity Impact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <CheckCircle size={20} className="text-green-600" />
                                        Immunity Boosting
                                    </h4>
                                    <ul className="space-y-2">
                                        {analysisResult.immunityImpact.boosting.map((item, index) => (
                                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                                <span className="text-green-500 mt-1">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <AlertCircle size={20} className="text-orange-600" />
                                        Immunity Suppressing
                                    </h4>
                                    <ul className="space-y-2">
                                        {analysisResult.immunityImpact.suppressing.length > 0 ? (
                                            analysisResult.immunityImpact.suppressing.map((item, index) => (
                                                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                                    <span className="text-orange-500 mt-1">•</span>
                                                    {item}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-gray-500">No significant immunity suppression detected</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Pros and Cons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <CheckCircle size={20} className="text-green-600" />
                                        Pros
                                    </h4>
                                    <ul className="space-y-2">
                                        {analysisResult.prosAndCons.pros.map((item, index) => (
                                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                                <span className="text-green-500 mt-1">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <XCircle size={20} className="text-red-600" />
                                        Cons
                                    </h4>
                                    <ul className="space-y-2">
                                        {analysisResult.prosAndCons.cons.length > 0 ? (
                                            analysisResult.prosAndCons.cons.map((item, index) => (
                                                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                                    <span className="text-red-500 mt-1">•</span>
                                                    {item}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-gray-500">No significant cons identified</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles size={20} className="text-blue-600" />
                                    Recommendations
                                </h4>
                                <ul className="space-y-2">
                                    {analysisResult.recommendations.map((item, index) => (
                                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
                            <div className="flex items-center gap-3">
                                <XCircle size={24} className="text-red-600" />
                                <h4 className="font-semibold text-red-900">Analysis Error</h4>
                            </div>
                            <p className="text-red-700 mt-2">{error}</p>
                        </div>
                    )}

                    {/* What You'll Get Section */}
                    {!analysisResult && (
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
                                What You'll Get
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center p-6 bg-gray-50 rounded-xl">
                                    <div className="p-3 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 mx-auto mb-4 w-fit">
                                        <TrendingUp size={24} className="text-orange-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Calories</h4>
                                    <p className="text-sm text-gray-600">Precise calorie count for your meal</p>
                                </div>
                                <div className="text-center p-6 bg-gray-50 rounded-xl">
                                    <div className="p-3 rounded-full bg-gradient-to-br from-green-100 to-green-200 mx-auto mb-4 w-fit">
                                        <Zap size={24} className="text-green-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Nutrient Breakdown</h4>
                                    <p className="text-sm text-gray-600">Detailed macro and micronutrients</p>
                                </div>
                                <div className="text-center p-6 bg-gray-50 rounded-xl">
                                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mx-auto mb-4 w-fit">
                                        <Shield size={24} className="text-blue-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Health Verdict</h4>
                                    <p className="text-sm text-gray-600">Healthy or not assessment</p>
                                </div>
                                <div className="text-center p-6 bg-gray-50 rounded-xl">
                                    <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 mx-auto mb-4 w-fit">
                                        <Sparkles size={24} className="text-purple-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Immunity Impact</h4>
                                    <p className="text-sm text-gray-600">Boosting or suppressing effects</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScannerPage;