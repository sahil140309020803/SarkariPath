import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchUsers, setSearchUsers] = useState([]);
    const {isLoggedIn, backend_url} = useAuth();

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
            <h2 className="text-3xl font-bold text-gray-800 mb-4.5">User Management</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                <input
                    onChange={handleSearch}
                    id="search"
                    type="text"
                    className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:border-blue-800 focus:outline-0 w-full md:w-1/3 p-2.5 mb-4"
                    placeholder="Search by Name or Email..."
                />
                <div className="relative overflow-y-auto max-h-[60vh]">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 w-1/5">Name</th>
                                <th className="px-6 py-3 w-1/3">Email</th>
                                <th className="px-6 py-3 w-1/3">Registration Date</th>
                                <th className='px-1 py-3 w-1/7'>Tests Attempted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchUsers.map(user => (
                                <tr key={user.id} className="bg-white border-b border-gray-200 text-gray-800">
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