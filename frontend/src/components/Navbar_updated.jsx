import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-green-100 px-6 py-4 flex justify-between items-center">
   
<Link to="/" className="flex items-center gap-2 text-2xl font-bold text-green-700 italic">
    <div className="bg-green-600 p-1.5 rounded-lg text-white">
        <Leaf size={20} />
    </div>
    LeafLens
</Link>
            <div className="flex gap-6 items-center font-medium">
                {user ? (
                    <>
                        <Link to="/diagnose" className="hover:text-green-600">Scan</Link>
                        <Link to="/dashboard" className="hover:text-green-600">History</Link>
                        <button onClick={logout} className="flex items-center gap-1 text-red-500"><LogOut size={18}/> Logout</button>
                    </>
                ) : (
                    <Link to="/auth" className="bg-green-600 text-white px-5 py-2 rounded-full">Login</Link>
                )}
            </div>
        </nav>
    );
}