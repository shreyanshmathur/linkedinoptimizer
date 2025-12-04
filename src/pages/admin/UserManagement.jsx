import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Search, Filter, MoreVertical,
    Mail, Calendar, CreditCard, BarChart3,
    ChevronLeft, ChevronRight, Ban, CheckCircle
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, filterPlan]);

    const fetchUsers = async () => {
        try {
            const usersSnap = await getDocs(collection(db, 'users'));
            const usersData = usersSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoading(false);
    };

    const filterUsers = () => {
        let result = users;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(user =>
                user.displayName?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query)
            );
        }

        // Plan filter
        if (filterPlan !== 'all') {
            result = result.filter(user => {
                if (filterPlan === 'free') return user.subscription === 'free';
                if (filterPlan === 'pro') return user.subscription !== 'free';
                return true;
            });
        }

        setFilteredUsers(result);
        setCurrentPage(1);
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                disabled: !currentStatus
            });
            setUsers(users.map(u =>
                u.id === userId ? { ...u, disabled: !currentStatus } : u
            ));
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    if (loading) {
        return (
            <div className="min-h-screen ml-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen ml-64 p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">User Management</h1>
                <div className="text-gray-400">
                    {users.length} total users
                </div>
            </div>

            {/* Filters */}
            <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-linkedin-500 focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none"
                    >
                        <option value="all">All Plans</option>
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="text-left p-4 font-medium text-gray-400">User</th>
                            <th className="text-left p-4 font-medium text-gray-400">Plan</th>
                            <th className="text-left p-4 font-medium text-gray-400">Usage</th>
                            <th className="text-left p-4 font-medium text-gray-400">Joined</th>
                            <th className="text-left p-4 font-medium text-gray-400">Status</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map((user) => (
                            <tr key={user.id} className="border-t border-white/5 hover:bg-white/5">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={user.photoURL || 'https://via.placeholder.com/40'}
                                            alt=""
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <div className="font-medium">{user.displayName || 'Unknown'}</div>
                                            <div className="text-sm text-gray-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.subscription === 'free'
                                            ? 'bg-gray-500/20 text-gray-400'
                                            : user.subscription === 'lifetime'
                                                ? 'bg-purple-500/20 text-purple-400'
                                                : 'bg-green-500/20 text-green-400'
                                        }`}>
                                        {user.subscription === 'free' ? 'Free' :
                                            user.subscription === 'lifetime' ? 'Lifetime' : 'Pro'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm">
                                        <div>{user.usage?.analysesCount || 0} analyses</div>
                                        <div className="text-gray-400">{user.usage?.exportsCount || 0} exports</div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400">
                                    {user.createdAt instanceof Date
                                        ? user.createdAt.toLocaleDateString()
                                        : 'Unknown'
                                    }
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.disabled
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-green-500/20 text-green-400'
                                        }`}>
                                        {user.disabled ? 'Disabled' : 'Active'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => toggleUserStatus(user.id, user.disabled)}
                                        className={`p-2 rounded-lg transition-colors ${user.disabled
                                                ? 'hover:bg-green-500/20 text-green-400'
                                                : 'hover:bg-red-500/20 text-red-400'
                                            }`}
                                        title={user.disabled ? 'Enable user' : 'Disable user'}
                                    >
                                        {user.disabled ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            <Ban className="w-5 h-5" />
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {paginatedUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        No users found
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="text-gray-400 text-sm">
                        Showing {(currentPage - 1) * usersPerPage + 1} - {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-lg ${currentPage === i + 1
                                        ? 'bg-linkedin-500'
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
