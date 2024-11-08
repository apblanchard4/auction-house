"use client";
import React, { useEffect, useState } from 'react';
import './reviewItem.css';

interface Item {
    id: number;
    name: string;
    initialPrice: number;
    startDate: string;
    endDate: string;
    image: string;
    description: string;
}

function CustomerReviewItems() {
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Item; direction: 'ascending' | 'descending' } | null>(null);

    const fetchItems = async () => {
        try {
            const response = await fetch(
                `https://6haebl2d68.execute-api.us-east-1.amazonaws.com/prod/customerReviewItems`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const responseData = await response.json();
            console.log("Response data:", responseData);

            if (response.status !== 200) {
                const message = responseData.body ? JSON.parse(responseData.body).message : 'Request failed';
                throw new Error(message);
            }

            const itemsData = responseData;
<<<<<<< HEAD
            if (Array.isArray(itemsData)) {
                setItems(itemsData);
                setFilteredItems(itemsData);
=======
            if (itemsData.length) {

                const updatedItems = itemsData.map((item: Item) => ({
                    ...item,
                    image: item.image.replace('s3://', 'https://auctionhousec0fa4b6d5a2641a187df78aa6945b28f5f64c-prod.s3.amazonaws.com/')
                }));
                setItems(updatedItems);
                setFilteredItems(updatedItems);
>>>>>>> recovery-branch
            } else {
                throw new Error('Response body is not an array');
            }
        } catch (err) {
            const typedError = err instanceof Error ? err : new Error('An unknown error occurred');
            setError(typedError.message);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

<<<<<<< HEAD
    useEffect(() => {
        const filtered = items.filter(item => {
            return (
                (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.initialPrice && item.initialPrice.toString().includes(searchTerm)) ||
                (item.startDate && item.startDate.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.endDate && item.endDate.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        });
        setFilteredItems(filtered);
    }, [searchTerm, items]);

    const handleItemClick = (itemId: number) => {
        router.push(`/viewItem/${itemId}`);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value); // Update search term on change
    };

    const handleSort = (key: keyof Item) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sortedItems = [...filteredItems].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        setFilteredItems(sortedItems);
    };

    const getSortArrow = (key: keyof Item) => {
        if (!sortConfig || sortConfig.key !== key) return '⇅';
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

=======
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value.toLowerCase();
        setSearchTerm(searchValue);

        // Filter items based on the search term across all columns
        const filtered = items.filter(item => {
            return (
                (item.name && item.name.toLowerCase().includes(searchValue)) ||
                (item.initialPrice && item.initialPrice.toString().includes(searchValue)) ||
                (item.startDate && item.startDate.toLowerCase().includes(searchValue)) ||
                (item.endDate && item.endDate.toLowerCase().includes(searchValue)) || (item.description && item.description.toLowerCase().includes(searchValue))
            );
        });
        setFilteredItems(filtered);
    };

>>>>>>> recovery-branch
    return (
        <div className="seller-review-items">
            <header className="header">
                <h1>Assembly Auction</h1>
                <div className="user-info">
                    <span>Customer</span> | <button>Create an Account</button>
                </div>
            </header>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Enter text to search"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <button>🔍</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <table className="item-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Item Name</th>
<<<<<<< HEAD
                        <th onClick={() => handleSort('initialPrice')}>
                            Price <span className="sort-arrows">{getSortArrow('initialPrice')}</span>
                        </th>
                        <th onClick={() => handleSort('startDate')}>
                            Start Date <span className="sort-arrows">{getSortArrow('startDate')}</span>
                        </th>
                        <th onClick={() => handleSort('endDate')}>
                            End Date <span className="sort-arrows">{getSortArrow('endDate')}</span>
                        </th>
=======
                        <th>Price <span className="sort-arrows">⇅</span></th>
                        <th>Start Date <span className="sort-arrows">⇅</span></th>
                        <th>End Date <span className="sort-arrows">⇅</span></th>
                        <th>Description</th>
>>>>>>> recovery-branch
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <img src={item.image} alt={item.name} className="item-image" />
                                </td>
                                <td>{item.name}</td>
                                <td>${item.initialPrice}</td>
                                <td>{item.startDate}</td>
                                <td>{item.endDate}</td>
                                <td>{item.description}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6}>No items found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default CustomerReviewItems;
