import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { fetchDashboard } from '../api/api';
import { LayoutDashboard, CheckCircle, AlertTriangle, History, ArrowRight } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getStats = async () => {
            try {
                const { data } = await fetchDashboard();
                setStats(data.data);
            } catch (err) {
                console.error("Dashboard load failed");
            } finally {
                setLoading(false);
            }
        };
        getStats();
    }, []);

    if (loading) return <div className="pt-32 text-center text-green-600 font-bold">Loading your garden...</div>;

    return (
        <div className="pt-28 px-6 max-w-7xl mx-auto pb-20">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                    <LayoutDashboard className="text-green-600" /> Garden Insights
                </h1>
                <p className="text-gray-500 mt-2">Track your plant health and diagnostic history.</p>
            </header>

            {/* --- Stats Grid --- */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
                <motion.div variants={cardVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><History /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Scans</p>
                        <h3 className="text-3xl font-bold">{stats?.totalScans || 0}</h3>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="bg-green-100 p-4 rounded-2xl text-green-600"><CheckCircle /></div>
                    <div>
                        <p className="text-sm text-gray-500">Healthy Samples</p>
                        <h3 className="text-3xl font-bold">{stats?.healthy || 0}</h3>
                    </div>
                </motion.div>

                <motion.div variants={cardVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="bg-orange-100 p-4 rounded-2xl text-orange-600"><AlertTriangle /></div>
                    <div>
                        <p className="text-sm text-gray-500">Needs Attention</p>
                        <h3 className="text-3xl font-bold text-orange-600">{stats?.needsAttention || 0}</h3>
                    </div>
                </motion.div>
            </motion.div>

            {/* --- Recent Activity Section --- */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Diagnoses</h2>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Plant/Disease</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats?.recentActivity?.length > 0 ? (
                                stats.recentActivity.map((item) => (
                                    <tr key={item._id} className="hover:bg-green-50/30 transition">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-800">
                                                {item.disease.replace(/___/g, ' ')}
                                            </span>
                                            <div className="text-xs text-gray-400">{item.confidence} match</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {/* Fix: Date parsing and formatting */}
                                            {new Date(item.createdAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Fix: Link to specific report using item._id */}
                                            <Link 
                                                to={`/report/${item._id}`} 
                                                className="inline-flex items-center gap-1 text-green-600 font-semibold hover:text-green-700 hover:underline"
                                            >
                                                View Report <ArrowRight size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-center text-gray-400">No scans yet. Start by uploading a leaf image!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}