import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, Sprout, ShieldCheck, ClipboardList } from 'lucide-react';

export default function DiagnosisReport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
        try {
            // 1. Get the string from storage
            const savedData = localStorage.getItem('plantz_user');
            
            if (!savedData) {
                console.error("No user data found");
                navigate('/auth');
                return;
            }

            // 2. Parse the JSON to get the token
            const userData = JSON.parse(savedData);
            const token = userData.token; // Access the token property

            if (!token) {
                console.error("Token missing from user data");
                navigate('/auth');
                return;
            }

            const { data } = await axios.get(`http://localhost:5000/api/dashboard/details/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReport(data.data);
        } catch (err) {
            console.error("Fetch error:", err);
            if (err.response?.status === 401) navigate('/auth');
        } finally {
            setLoading(false);
        }
    };
    fetchReport();
}, [id, navigate]);

    if (loading) return <div className="pt-32 text-center text-green-600 font-bold">Fetching report...</div>;
    if (!report) return <div className="pt-32 text-center">Report not found.</div>;

    return (
        <div className="pt-28 px-6 max-w-4xl mx-auto pb-20">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 transition"
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
            >
                {/* Header Section */}
                <div className="bg-green-600 p-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Sprout size={32} />
                        <span className="uppercase tracking-widest text-sm font-bold opacity-80">Diagnostic Results</span>
                    </div>
                    <h1 className="text-4xl font-bold">{report.disease.replace(/___/g, ' ')}</h1>
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                        <ShieldCheck size={18} />
                        <span className="font-medium">{report.confidence} Confidence Score</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8">
                    <div className="flex items-center gap-2 text-gray-800 mb-4">
                        <ClipboardList className="text-green-600" />
                        <h2 className="text-xl font-bold">Organic Treatment Plan</h2>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-gray-700 leading-relaxed whitespace-pre-line">
                        {report.treatment}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center text-sm text-gray-400">
                        <p>Scanned on: {new Date(report.createdAt || report.date).toLocaleString()}</p>
                        <p>ID: {id}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}