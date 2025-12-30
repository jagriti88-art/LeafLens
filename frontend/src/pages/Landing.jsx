import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Zap, Sprout, History as HistoryIcon } from 'lucide-react';

export default function Landing() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-green-50 to-white">
            
            {/* Animated Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-20 -left-20 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-30" 
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], x: [0, -40, 0] }}
                    transition={{ duration: 12, repeat: Infinity, delay: 1 }}
                    className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-30" 
                />
            </div>

            <div className="pt-32 pb-20 flex flex-col items-center justify-center text-center px-4 max-w-6xl mx-auto">
                
                {/* Logo Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mb-8 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-sm border border-green-100"
                >
                    <Leaf className="text-green-600" size={24} />
                    <span className="text-xl font-bold text-gray-800 tracking-tight">LeafLens AI</span>
                </motion.div>

                {/* Hero Title */}
                <motion.h1 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl md:text-7xl font-black text-gray-900 leading-tight"
                >
                    Heal Your Plants with <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                        Smart AI Diagnosis
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-xl text-gray-600 max-w-2xl leading-relaxed"
                >
                    Upload a photo and let our advanced CNN model detect diseases instantly. 
                    Receive organic treatment plans tailored for your garden.
                </motion.p>

                {/* Centered Primary Button */}
                <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    className="mt-12"
                >
                    <Link to="/auth" className="group relative inline-flex items-center gap-3 bg-green-600 text-white text-xl px-12 py-5 rounded-2xl shadow-[0_20px_50px_rgba(22,_163,_74,_0.3)] hover:bg-green-700 transition-all duration-300 overflow-hidden">
                        <span className="relative z-10">Start Diagnosis Now</span>
                        <Zap className="relative z-10 group-hover:fill-current" size={20} />
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
                    </Link>
                </motion.div>

                {/* Feature Grid (Makes the page feel full) */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full"
                >
                    <FeatureCard 
                        icon={<ShieldCheck className="text-green-600" />} 
                        title="98% Accuracy" 
                        desc="Trained on 50,000+ leaf samples for precise detection." 
                    />
                    <FeatureCard 
                        icon={<Sprout className="text-green-600" />} 
                        title="Organic Fixes" 
                        desc="Get eco-friendly treatment suggestions for every disease." 
                    />
                    <FeatureCard 
                        icon={<HistoryIcon className="text-green-600" />} 
                        title="Track Growth" 
                        desc="Save your diagnosis history to monitor plant health." 
                    />
                </motion.div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col items-center text-center hover:translate-y-[-5px] transition-transform">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}