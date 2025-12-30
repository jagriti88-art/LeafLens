import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Search, Leaf, AlertCircle, CheckCircle2 } from 'lucide-react';
import { diagnosePlant } from '../api/api';

export default function Diagnosis() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null); // Clear previous results on new upload
        }
    };

    const runDiagnosis = async () => {
        if (!image) return;
        
        setLoading(true);
        const formData = new FormData();
        // The key 'image' must match upload.single('image') in server.js
        formData.append('image', image);

        try {
            // Ensure your api.js passes this correctly to Axios
            const { data } = await diagnosePlant(formData);
            setResult(data);
        } catch (err) {
            console.error("Diagnosis Error:", err);
            const errorMsg = err.response?.data?.message || "Diagnosis failed. Check your API key or server status.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-white to-green-50 px-4">
            <div className="max-w-3xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] shadow-xl shadow-green-900/5 p-8 md:p-12 border border-green-100"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800">New Diagnosis</h2>
                        <p className="text-gray-500 mt-2">Upload a clear photo of the affected leaf</p>
                    </div>

                    {/* Upload Area */}
                    <div className="relative group">
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        />
                        <div className={`border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center 
                            ${preview ? 'border-green-500 bg-green-50/30' : 'border-gray-200 group-hover:border-green-400 bg-gray-50'}`}>
                            
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-48 h-48 object-cover rounded-2xl shadow-md" />
                            ) : (
                                <>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                                        <Upload className="text-green-600" size={32} />
                                    </div>
                                    <p className="text-gray-600 font-medium">Click or drag to upload</p>
                                    <p className="text-gray-400 text-sm mt-1">Supports JPG, PNG</p>
                                </>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={runDiagnosis}
                        disabled={!image || loading}
                        className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                            ${loading ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg active:scale-[0.98]'}`}
                    >
                        {loading ? (
                            <> <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Search size={20}/></motion.div> Analyzing... </>
                        ) : (
                            <> <Leaf size={20} /> Analyze Leaf </>
                        )}
                    </button>

                    {/* Result Area */}
                    <AnimatePresence>
                        {result && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-10 pt-10 border-t border-gray-100"
                            >
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{result.disease || result.status}</h3>
                                        <p className="text-green-600 font-semibold">Confidence Score: {result.confidence || "High"}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100">
                                    <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                                        <AlertCircle size={18} /> Recommended Treatment
                                    </h4>
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {result.treatment || result.recommendation || "No treatment found."}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}