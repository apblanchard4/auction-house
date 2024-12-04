"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './auctionReport.css';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface Bid {
    bidId: string;
    itemId: string;
    itemName: string;
    buyerUsername: string;
    amount: number;
    dateMade: string;
    fulfilled: boolean;
    earnings: string;
  }



function AuctionReport() {
    const router = useRouter();
    const [auctionData, setAuctionData] = useState<Bid[]>([]);
    const [totalAuctionEarnings, setTotalAuctionEarnings] = useState<string>("0.00");
    const [loading, setLoading] = useState<boolean>(false);

    const fetchAuctionReport = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/auctionReport'); // Replace with your Lambda endpoint
            const data = await response.json();
            setAuctionData(data.auctionReport);
            setTotalAuctionEarnings(data.totalAuctionEarnings);
        } catch (error) {
            console.error("Error fetching auction report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctionReport();
    }, []);

    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Assembly Auction</h1>
                <div className="text-gray-700">
                    <span className="font-semibold">Admin</span> | <span>Admin</span>
                </div>
            </header>

            <div className="navigation">
                <button className="active" onClick={() => router.push('/admin/auctionReport')}>Auction Report</button>
                <button onClick={() => router.push('/admin/forensicsReport')}>Forensics Report</button>
                <button onClick={() => router.push('/admin/dashboard')}>Item List</button>
            </div>

            <div className="mt-6">
                {loading ? (
                    <p>Loading auction report...</p>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Auction Report</h2>
                        <table className="min-w-full bg-white border rounded-lg shadow-md">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Item Name</th>
                                    <th className="py-2 px-4 border-b">Buyer Username</th>
                                    <th className="py-2 px-4 border-b">Bid Amount</th>
                                    <th className="py-2 px-4 border-b">Date Made</th>
                                    <th className="py-2 px-4 border-b">Fulfilled</th>
                                    <th className="py-2 px-4 border-b">Earnings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auctionData.map((bid) => (
                                    <tr key={bid.bidId}>
                                        <td className="py-2 px-4 border-b">{bid.itemName}</td>
                                        <td className="py-2 px-4 border-b">{bid.buyerUsername}</td>
                                        <td className="py-2 px-4 border-b">${bid.amount.toFixed(2)}</td>
                                        <td className="py-2 px-4 border-b">{new Date(bid.dateMade).toLocaleDateString()}</td>
                                        <td className="py-2 px-4 border-b">
                                            {bid.fulfilled ? "Yes" : "No"}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            ${parseFloat(bid.earnings).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4">
                            <strong>Total Earnings for Auction House:</strong> $
                            {parseFloat(totalAuctionEarnings).toFixed(2)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}



export default AuctionReport;