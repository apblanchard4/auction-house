"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './auctionReport.css';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface Bid {
    bidId: string;
    itemId: string;
    itemName: string;
    buyerUsername: string;
    amount: number;
    dateMade: string;
    fulfilled: boolean;
    isBuyNow: boolean;
    earnings: string;
}

const downloadExcel = async (auctionData: Bid[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Auction Report");

    // Add headers
    worksheet.columns = [
        { header: "Item Name", key: "itemName", width: 20 },
        { header: "Buyer Username", key: "buyerUsername", width: 20 },
        { header: "Bid Amount", key: "bidAmount", width: 15 },
        { header: "Date Made", key: "dateMade", width: 15 },
        { header: "Fulfilled", key: "fulfilled", width: 10 },
        { header: "Is Buy Now", key: "isBuyNow", width: 15 },
        { header: "Auction House Profit", key: "earnings", width: 20 },
    ];

    // Add rows
    auctionData.forEach((bid) => {
        worksheet.addRow({
            itemName: bid.itemName,
            buyerUsername: bid.buyerUsername,
            bidAmount: `$${Number(bid.amount || 0).toFixed(2)}`,
            dateMade: new Date(bid.dateMade).toLocaleDateString(),
            fulfilled: bid.fulfilled ? "Yes" : "No",
            isBuyNow: bid.isBuyNow ? "Yes" : "No",
            earnings: `$${Number(bid.earnings || 0).toFixed(2)}`,
        });
    });

    // Generate Excel file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "auction_report.xlsx");
};

function AuctionReport() {
    const router = useRouter();
    const [auctionData, setAuctionData] = useState<Bid[]>([]);
    const [totalAuctionEarnings, setTotalAuctionEarnings] = useState<string>("0.00");
    const [loading, setLoading] = useState<boolean>(false);

    const fetchAuctionReport = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://7ttxb2kws7.execute-api.us-east-1.amazonaws.com/prod/admin/generateAuctionReport'); // Replace with your Lambda endpoint
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
                        <button onClick={() => downloadExcel(auctionData)} className="download-btn">
                            Download as Excel
                        </button>
                        <table className="min-w-full bg-white border rounded-lg shadow-md">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Item Name</th>
                                    <th className="py-2 px-4 border-b">Buyer Username</th>
                                    <th className="py-2 px-4 border-b">Bid Amount</th>
                                    <th className="py-2 px-4 border-b">Date Made</th>
                                    <th className="py-2 px-4 border-b">Fulfilled</th>
                                    <th className="py-2 px-4 border-b">Is Buy Now</th>
                                    <th className="py-2 px-4 border-b">Auction House Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auctionData.map((bid) => (
                                    <tr key={bid.bidId}>
                                        <td className="py-2 px-4 border-b">{bid.itemName}</td>
                                        <td className="py-2 px-4 border-b">{bid.buyerUsername}</td>
                                        <td className="py-2 px-4 border-b">${Number(bid.amount || 0).toFixed(2)}</td>
                                        <td className="py-2 px-4 border-b">{new Date(bid.dateMade).toLocaleDateString()}</td>
                                        <td className="py-2 px-4 border-b">
                                            {bid.fulfilled ? "Yes" : "No"}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            {bid.isBuyNow ? "Yes" : "No"}
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