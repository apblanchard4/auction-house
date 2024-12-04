"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './adminDashboard.css';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface Item {
    id: number;
    itemName: string;
    price: number;
    startDate: string;
    endDate: string;
    status: string;
}


function AdminDashboard() {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [selectedActions, setSelectedActions] = useState<{ [key: number]: string }>({});
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleSort = (key: keyof Item) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedItems = [...filteredItems].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setFilteredItems(sortedItems);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
        if (value) {
            setFilteredItems(items.filter(item => item.itemName.toLowerCase().includes(value.toLowerCase())));
        } else {
            setFilteredItems(items);
        }
    };

    const handleActionChange = (itemId: number, action: string) => {
        setSelectedActions((prevState) => ({
            ...prevState,
            [itemId]: action,
        }));
    };

    const handleActionButtonClick = async (itemId: number) => {
        const action = selectedActions[itemId];
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            alert('You must log in first');
            router.push('/');
            return;
        }

        // Add other actions here
    }


    //Lambda function to get all items


    return (

        <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Assembly Auction</h1>
                <div className="text-gray-700">
                    <span className="font-semibold">Admin</span> | <span>Admin</span>
                </div>
            </header>

            <div className="navigation">
                <button onClick={() => router.push('/admin/auctionReport')}>Auction Report</button>
                <button onClick={() => router.push('/admin/forensicsReport')}>Forensics Report</button>
                <button className="active" onClick={() => router.push('/admin/dashboard')}>Item List</button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Enter text to search"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <button>🔍</button>
            </div>


            <table className="item-table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Username</th>
                        <th onClick={() => handleSort('price')}>Price <span className="sort-arrows">⇅</span></th>
                        <th onClick={() => handleSort('startDate')}>Start Date <span className="sort-arrows">⇅</span></th>
                        <th onClick={() => handleSort('endDate')}>End Date <span className="sort-arrows">⇅</span></th>
                        <th>Status</th>
                        <th>Admin Actions</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <button className="item-name" onClick={() => router.push(`/seller/viewItem?itemId=${item.id}`)}>
                                        {item.itemName}
                                    </button>
                                </td>
                                <td>${item.price}</td>
                                <td>{item.startDate}</td>
                                <td>{item.endDate}</td>
                                <td>{item.status}</td>
                                <td>
                                    <select
                                        onChange={(e) => handleActionChange(item.id, e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="">Select Action</option>
                                        <option value="Publish">Publish Item</option>
                                        <option value="Unpublish">Unpublish Item</option>
                                        <option value="Edit">Edit Item</option>
                                        <option value="Fulfill">Fulfill Item</option>
                                        <option value="Unfreeze">Unfreeze</option>
                                        <option value="Archive">Archive Item</option>
                                        <option value="Remove">Remove Item</option>
                                    </select>
                                </td>
                                <td>
                                    <button
                                        className="bg-gray-400 text-white py-2 px-4 rounded-lg"
                                        onClick={() => handleActionButtonClick(item.id)}
                                        disabled={!selectedActions[item.id]}
                                    >
                                        Perform Action
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7}>No items found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

    );
}

export default AdminDashboard;
