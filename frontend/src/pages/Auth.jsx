import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { login, register } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { setUser } = useAuth();
    const navigate = useNavigate();

   const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Create a clean object to send
        const payload = isLogin 
            ? { email: formData.email, password: formData.password } 
            : formData;

        const { data } = isLogin ? await login(payload) : await register(payload);
        
        localStorage.setItem('plantz_user', JSON.stringify(data));
        setUser(data);
        navigate('/diagnose'); 
    } catch (err) {
        // This alert is your best friend—tell me what it says!
        alert(err.response?.data?.message || "Authentication failed");
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F0F4F0] px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-green-100"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-green-600 p-3 rounded-2xl text-white mb-4 shadow-lg shadow-green-200">
                        <Leaf size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-500 mt-2 text-center">
                        {isLogin ? 'Login to check your plants' : 'Join the community of healthy gardens'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode='wait'>
                        {!isLogin && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                <div className="relative">
                                    <User className="absolute left-4 top-4 text-gray-400" size={20} />
                                    <input 
                                        type="text" placeholder="Full Name" required
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
                        <input 
                            type="email" placeholder="Email Address" required
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
                        <input 
                            type="password" placeholder="Password" required
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <button className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                        {isLogin ? 'Login' : 'Sign Up'} <ArrowRight size={20} />
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"} 
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 text-green-600 font-bold hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}