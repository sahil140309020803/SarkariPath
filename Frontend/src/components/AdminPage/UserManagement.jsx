import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchUsers, setSearchUsers] = useState([]);
    const {isLoggedIn, backend_url} = useUser();

    const convertDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    const fetchUsers = async () => {
        axios.defaults.withCredentials = true;
        try {
            const {data} = await axios.get(`${backend_url}/api/users`);
            if(data.success){
                setUsers(data.users);
                setSearchUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };


    useEffect(() => {
        fetchUsers();
    },[]);

    // Search functionality 
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        const filteredUsers = users.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
        setSearchUsers(filteredUsers);
    };


    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4.5 transition-colors">User Management</h2>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-md dark:shadow-none transition-colors">
                <input
                    onChange={handleSearch}
                    id="search"
                    type="text"
                    className="bg-gray-50 dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg focus:border-blue-800 dark:focus:border-indigo-500 focus:outline-0 w-full md:w-1/3 p-2.5 mb-4 transition-colors"
                    placeholder="Search by Name or Email..."
                />
                <div className="relative overflow-y-auto max-h-[60vh]">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400 transition-colors">
                        <thead className="text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-800 sticky top-0 transition-colors">
                            <tr>
                                <th className="px-6 py-3 w-1/5">Name</th>
                                <th className="px-6 py-3 w-1/3">Email</th>
                                <th className="px-6 py-3 w-1/3">Registration Date</th>
                                <th className='px-1 py-3 w-1/7'>Tests Attempted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchUsers.map(user => (
                                <tr key={user.id} className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{convertDate(user.createdAt)}</td>
                                    <td className="px-6 py-4">{user.testsAttempted}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;