"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode, JwtPayload } from "jwt-decode";
import "./viewItems.css";

interface Item {
    id: number;
    name: string;
    initialPrice: number;
    startDate: string;
    endDate: string;
    description: string;
}

// Helper function to extract the username from the token
function getUsernameFromToken(idToken: string) {
    if (idToken) {
        const decoded = jwtDecode(idToken);
        return (decoded as JwtPayload & { "cognito:username": string })["cognito:username"];
    }
    return null;
}

function BuyerReviewItems() {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [username, setUsername] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Item; direction: "asc" | "desc" } | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: "", endDate: "" });
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });

    // Function to sort items
    const handleSort = (key: keyof Item) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sortedItems = [...filteredItems].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
            return 0;
        });
        setFilteredItems(sortedItems);
    };

    // Function to filter items based on user input
    const filterItems = () => {
        let result = items;

        // Combined search by name and description
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((item) => item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term));
        }

        // Filter by date range
        if (dateRange.startDate && dateRange.endDate) {
            result = result.filter((item) => {
                const start = new Date(item.startDate);
                const end = new Date(item.endDate);
                const filterStart = new Date(dateRange.startDate);
                const filterEnd = new Date(dateRange.endDate);
                return start >= filterStart && end <= filterEnd;
            });
        }

        // Filter by price range
        if (priceRange.min || priceRange.max) {
            result = result.filter((item) => {
                return item.initialPrice >= priceRange.min && (priceRange.max === 0 || item.initialPrice <= priceRange.max);
            });
        }

        setFilteredItems(result);
    };

    // Event handlers for search inputs
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setDateRange((prev) => ({ ...prev, [name]: value }));
    };

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setPriceRange((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    // Reapply filters whenever search criteria change
    useEffect(() => {
        filterItems();
    }, [searchTerm, dateRange, priceRange]);

    // Fetch items on component mount
    useEffect(() => {
        const fetchItems = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                alert("You must log in first.");
                router.push("/");
                return;
            }

            try {
                const response = await fetch(`https://2vnz0axf3c.execute-api.us-east-1.amazonaws.com/prod/buyer/viewItems`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                });

                const responseData = await response.json();

                if (responseData.statusCode !== 200) {
                    const message = responseData.body ? JSON.parse(responseData.body).message : "Request failed";
                    throw new Error(message);
                }

                let itemsData = responseData.body;
                if (typeof itemsData === "string") {
                    itemsData = JSON.parse(itemsData);
                }

                if (Array.isArray(itemsData)) {
                    setItems(itemsData);
                    setFilteredItems(itemsData);
                } else {
                    throw new Error("Response body is not an array");
                }
            } catch {
                alert("An error occurred while fetching items");
            }
        };

        const idToken = localStorage.getItem("idToken");
        if (idToken) {
            const decodedUsername = getUsernameFromToken(idToken);
            if (decodedUsername) {
                setUsername(decodedUsername);
                fetchItems();
            } else {
                alert("Failed to decode token or username not found.");
                router.push("/");
            }
        } else {
            alert("No token found. Please log in.");
            router.push("/");
        }
    }, [router]);

    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Assembly Auction</h1>
                <div className="text-gray-700">
                    <span className="font-semibold">{username}</span> | <span>Buyer</span>
                </div>
            </header>

            <div className="navigation">
                <button onClick={() => router.push("/buyer/viewAccount")}>Account</button>
                <button className="active" onClick={() => router.push("/buyer/reviewItems")}>
                    My Items
                </button>
            </div>

            <div className="search-bar flex flex-wrap items-center justify-between bg-white p-4 rounded-lg shadow-md mb-8">
                <div className="search-field">
                    <label htmlFor="searchTerm" className="search-label">Search by Name/Description</label>
                    <input
                        id="searchTerm"
                        type="text"
                        placeholder="Enter keywords"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>


                <div className="search-field">
                    <label htmlFor="minPrice" className="search-label">Min Price</label>
                    <input
                        id="minPrice"
                        type="number"
                        name="min"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={handlePriceChange}
                        className="search-input"
                    />
                </div>

                <div className="search-field">
                    <label htmlFor="maxPrice" className="search-label">Max Price</label>
                    <input
                        id="maxPrice"
                        type="number"
                        name="max"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={handlePriceChange}
                        className="search-input"
                    />
                </div>

                <button className="search-button">🔍 Search</button>
            </div>


            <table className="item-table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th onClick={() => handleSort("initialPrice")}>
                            Price <span className="sort-arrows">⇅</span>
                        </th>
                        <th onClick={() => handleSort("startDate")}>
                            Start Date <span className="sort-arrows">⇅</span>
                        </th>
                        <th onClick={() => handleSort("endDate")}>
                            End Date <span className="sort-arrows">⇅</span>
                        </th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <button className="item-name" onClick={() => router.push(`/buyer/viewItem?itemId=${item.id}`)}>
                                        {item.name}
                                    </button>
                                </td>
                                <td>${item.initialPrice}</td>
                                <td>{item.startDate}</td>
                                <td>{item.endDate}</td>
                                <td>{item.description}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5}>No items found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default BuyerReviewItems;
