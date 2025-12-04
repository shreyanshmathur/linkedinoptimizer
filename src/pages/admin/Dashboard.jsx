import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users, CreditCard, TrendingUp, BarChart3,
    LogOut, Settings, Home, DollarSign, Activity,
    ArrowUp, ArrowDown, Calendar
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        analysesToday: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch users
            const usersSnap = await getDocs(collection(db, 'users'));
            const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch payments
            const paymentsQuery = query(
                collection(db, 'payments'),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            const paymentsSnap = await getDocs(paymentsQuery);
            const payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate stats
            const activeSubscriptions = users.filter(u => u.subscription !== 'free').length;
            const totalRevenue = payments
                .filter(p => p.status === 'success')
                .reduce((sum, p) => sum + (p.amount || 0), 0);

            setStats({
                totalUsers: users.length,
                activeSubscriptions,
                totalRevenue,
                analysesToday: Math.floor(Math.random() * 50) + 10 // Placeholder
            });

            setRecentUsers(users.slice(0, 5));
            setRecentPayments(payments.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/admin/login');
    };

    const StatCard = ({ title, value, icon: Icon, change, color }) => (
        <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${color}-400`} />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm text-gray-400">{title}</div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <Settings className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold">Admin Panel</div>
                        <div className="text-xs text-gray-400">LinkedIn Optimizer</div>
                    </div>
                </div>

                <nav className="space-y-2">
                    <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/10"
                    >
                        <Home className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/admin/users"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                        <Users className="w-5 h-5" />
                        <span>Users</span>
                    </Link>
                    <Link
                        to="/admin/payments"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                        <CreditCard className="w-5 h-5" />
                        <span>Payments</span>
                    </Link>
                    <Link
                        to="/admin/analytics"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                        <BarChart3 className="w-5 h-5" />
                        <span>Analytics</span>
                    </Link>
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 transition-colors w-full text-red-400"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 p-8">
                <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers.toLocaleString()}
                        icon={Users}
                        change={12}
                        color="blue"
                    />
                    <StatCard
                        title="Active Subscriptions"
                        value={stats.activeSubscriptions}
                        icon={CreditCard}
                        change={8}
                        color="green"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats.totalRevenue.toLocaleString()}`}
                        icon={DollarSign}
                        change={23}
                        color="yellow"
                    />
                    <StatCard
                        title="Analyses Today"
                        value={stats.analysesToday}
                        icon={Activity}
                        color="purple"
                    />
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Recent Users */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Recent Users</h2>
                            <Link to="/admin/users" className="text-sm text-linkedin-400 hover:underline">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                    <img
                                        src={user.photoURL || 'https://via.placeholder.com/40'}
                                        alt=""
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{user.displayName || 'Unknown'}</div>
                                        <div className="text-sm text-gray-400">{user.email}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.subscription === 'free'
                                            ? 'bg-gray-500/20 text-gray-400'
                                            : 'bg-green-500/20 text-green-400'
                                        }`}>
                                        {user.subscription === 'free' ? 'Free' : 'Pro'}
                                    </span>
                                </div>
                            ))}
                            {recentUsers.length === 0 && (
                                <p className="text-gray-400 text-center py-4">No users yet</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Recent Payments</h2>
                            <Link to="/admin/payments" className="text-sm text-linkedin-400 hover:underline">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">₹{payment.amount?.toLocaleString()}</div>
                                        <div className="text-sm text-gray-400">{payment.plan}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${payment.status === 'success'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {payment.status}
                                    </span>
                                </div>
                            ))}
                            {recentPayments.length === 0 && (
                                <p className="text-gray-400 text-center py-4">No payments yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
