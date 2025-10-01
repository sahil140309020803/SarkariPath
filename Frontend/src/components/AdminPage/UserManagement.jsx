import React, { useState } from 'react';

const UserManagement = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@example.com', date: '2023-09-01' },
        { id: 2, name: 'Priya Singh', email: 'priya.singh@example.com', date: '2023-09-05' },
        // ... more users
    ]);

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4.5">User Management</h2>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                <input
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
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b border-gray-200 text-gray-800">
                                    <td className="px-6 py-4 font-medium">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.date}</td>
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