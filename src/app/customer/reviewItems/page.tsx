'use client';
import React, { useEffect, useState, useMemo } from 'react';

import { useRouter } from "next/navigation";
import './reviewItem.css'; // Change the imported CSS to match the style

interface Item {
    id: number;
    name: string;
    currentPrice: string;
    startDate: string;
    endDate: string;
    image: string;
    description: string;
}

function CustomerReviewItems() {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Item; direction: 'ascending' | 'descending' } | null>(null);
    const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });

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

            if (response.status !== 200) {
                const message = responseData.body ? JSON.parse(responseData.body).message : 'Request failed';
                throw new Error(message);
            }

            const itemsData = responseData.body;
            if (itemsData.length) {
                const updatedItems = itemsData.map((item: Item) => ({
                    ...item,
                    image: item.image.replace('s3://', 'https://auctionhousec0fa4b6d5a2641a187df78aa6945b28f5f64c-prod.s3.amazonaws.com/')
                }));
                setItems(updatedItems);
            } else {
                throw new Error('Response body is not an array');
            }
        } catch (err) {
            const typedError = err instanceof Error ? err : new Error('An unknown error occurred');
            console.error(typedError.message);
            alert(typedError.message);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMinPrice(event.target.value);
    };

    const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMaxPrice(event.target.value);
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const handleSort = (key: keyof Item) => {
        setSortConfig(prevSortConfig => ({
            key,
            direction: prevSortConfig?.key === key
                ? prevSortConfig.direction === 'ascending' ? 'descending' : 'ascending'
                : 'ascending' // Set ascending for new key
        }));
    };

    const sortItems = (array: Item[], key: keyof Item, direction: 'ascending' | 'descending') => {
        return array.sort((a, b) => {
            let comparisonResult = 0;

            const aValue = a[key];
            const bValue = b[key];

            if (key === 'currentPrice') {
                const aPrice = parseFloat(aValue as string);
                const bPrice = parseFloat(bValue as string);
                comparisonResult = aPrice - bPrice;
            }
            else if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparisonResult = aValue.localeCompare(bValue);
            }
            else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparisonResult = aValue - bValue;
            }
            else if (typeof aValue === 'string' && typeof bValue === 'string' && Date.parse(aValue) && Date.parse(bValue)) {
                const aDate = new Date(aValue).getTime();
                const bDate = new Date(bValue).getTime();
                comparisonResult = aDate - bDate;
            }

            if (direction === 'descending') {
                comparisonResult = -comparisonResult;
            }

            return comparisonResult;
        });
    };

    const filteredAndSortedItems = useMemo(() => {
        let filtered = items;

        // Filter items based on the search term
        if (searchTerm) {
            const searchValue = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchValue) ||
                item.currentPrice.toString().includes(searchValue) ||
                item.startDate.toLowerCase().includes(searchValue) ||
                item.endDate.toLowerCase().includes(searchValue) ||
                item.description.toLowerCase().includes(searchValue)
            );
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            filtered = filtered.filter(item => {
                const price = parseFloat(item.currentPrice);
                const min = minPrice ? parseFloat(minPrice) : -Infinity;
                const max = maxPrice ? parseFloat(maxPrice) : Infinity;
                return price >= min && price <= max;
            });
        }

        // Filter by date range
        if (dateRange.startDate || dateRange.endDate) {
            filtered = filtered.filter(item => {
                const itemStartDate = new Date(item.startDate).getTime();
                const itemEndDate = new Date(item.endDate).getTime();
                const filterStartDate = dateRange.startDate ? new Date(dateRange.startDate).getTime() : null;
                const filterEndDate = dateRange.endDate ? new Date(dateRange.endDate).getTime() : null;

                const isWithinStartDate = filterStartDate ? itemStartDate >= filterStartDate : true;
                const isWithinEndDate = filterEndDate ? itemEndDate <= filterEndDate : true;

                return isWithinStartDate && isWithinEndDate;
            });
        }

        // Sort items based on sortConfig
        if (sortConfig) {
            const { key, direction } = sortConfig;
            filtered = sortItems(filtered, key, direction);
        }

        return filtered;
    }, [items, searchTerm, minPrice, maxPrice, dateRange, sortConfig]);

    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Assembly Auction</h1>
                <div className="text-gray-700">
                    <span className="font-semibold">Customer</span> |   <button onClick={() => router.push("/")}>Create an Account</button>
                </div>
            </header>
            <div className="search-bar flex flex-wrap items-center justify-between bg-white p-4 rounded-lg shadow-md mb-8">
                <div className="search-field">
                    <label htmlFor="searchTerm" className="search-label">Search</label>
                    <input
                        id="searchTerm"
                        type="text"
                        placeholder="Search by Name/Description"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>

                <div className="search-field">
                    <label htmlFor="startDate" className="search-label">Start Date</label>
                    <input
                        id="startDate"
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                        className="search-input"
                    />
                </div>

                <div className="search-field">
                    <label htmlFor="endDate" className="search-label">End Date</label>
                    <input
                        id="endDate"
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                        className="search-input"
                    />
                </div>

                <div className="search-field">
                    <label htmlFor="minPrice" className="search-label">Min Price</label>
                    <input
                        id="minPrice"
                        type="number"
                        value={minPrice}
                        onChange={handleMinPriceChange}
                        className="search-input"
                    />
                </div>

                <div className="search-field">
                    <label htmlFor="maxPrice" className="search-label">Max Price</label>
                    <input
                        id="maxPrice"
                        type="number"
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                        className="search-input"
                    />
                </div>
                <button className="search-button">Search</button>
            </div>

            <table className="item-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th onClick={() => handleSort('name')}>Name</th>
                        <th onClick={() => handleSort('currentPrice')}>Price</th>
                        <th onClick={() => handleSort('startDate')}>Start Date</th>
                        <th onClick={() => handleSort('endDate')}>End Date</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAndSortedItems.map(item => (
                        <tr key={item.id}>
                            <td>
                                <img src={item.image} alt={item.name} className="item-image" />
                            </td>
                            <td>{item.name}</td>
                            <td>{item.currentPrice}</td>
                            <td>{item.startDate}</td>
                            <td>{item.endDate}</td>
                            <td>{item.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CustomerReviewItems;
