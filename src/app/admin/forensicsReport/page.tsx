"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./forensicsReport.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Define TypeScript interfaces
interface ForensicsData {
    bidId: number;
    itemId: number;
    itemName: string;
    buyerUsername: string;
    amount: number;
    dateMade: string;
    fulfilled: boolean;
    commission: string;
}

interface ForensicsSummary {
    totalBids: number;
    totalEarnings: number;
    totalFulfilledItems: number;
    averageBidAmount: number;
    highestBid?: {
        amount: number;
        buyerUsername: string;
        itemName: string;
    };
    topBuyer?: {
        buyer: string;
        spend: number;
    };
}

interface ForensicsTrends {
    dailyBids?: Record<string, number>; // A map of date to bid count
    popularItems?: { itemId: number; count: number }[];
}

const downloadExcel = async (forensicsData: ForensicsData[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Forensics Report");

    // Add headers
    worksheet.columns = [
        { header: "Bid ID", key: "bidId", width: 10 },
        { header: "Item ID", key: "itemId", width: 10 },
        { header: "Item Name", key: "itemName", width: 20 },
        { header: "Buyer Username", key: "buyerUsername", width: 20 },
        { header: "Bid Amount", key: "amount", width: 15 },
        { header: "Date Made", key: "dateMade", width: 15 },
        { header: "Fulfilled", key: "fulfilled", width: 10 },
        { header: "Commission", key: "commission", width: 15 },
    ];

    // Add rows
    forensicsData.forEach((entry) => {
        worksheet.addRow({
            bidId: entry.bidId,
            itemId: entry.itemId,
            itemName: entry.itemName,
            buyerUsername: entry.buyerUsername,
            amount: `$${Number(entry.amount || 0).toFixed(2)}`,
            dateMade: new Date(entry.dateMade).toLocaleDateString(),
            fulfilled: entry.fulfilled ? "Yes" : "No",
            commission: `$${Number(entry.commission || 0).toFixed(2)}`,
        });
    });

    // Generate Excel file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "forensics_report.xlsx");
};

function ForensicsReport() {
    const router = useRouter();
    const [forensicsData, setForensicsData] = useState<ForensicsData[]>([]);
    const [forensicsSummary, setForensicsSummary] = useState<ForensicsSummary | null>(null);
    const [forensicsTrends, setForensicsTrends] = useState<ForensicsTrends | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const fetchForensicsReport = async () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://fhe5bsrfch.execute-api.us-east-1.amazonaws.com/prod/admin/generateForensicsReport`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ startDate, endDate }),
                }
            );

            const responseData = await response.json();

            let parsedBody: {
                details?: ForensicsData[];
                summary?: ForensicsSummary;
                trends?: ForensicsTrends;
            } = {};

            if (responseData.body) {
                parsedBody = JSON.parse(responseData.body);
            }

            if (parsedBody.details && Array.isArray(parsedBody.details)) {
                setForensicsData(parsedBody.details);
            } else {
                setForensicsData([]);
                alert(responseData?.message || "No data found for the selected date range.");
            }

            setForensicsSummary(parsedBody.summary || null);
            setForensicsTrends(parsedBody.trends || null);

            if (!parsedBody.details?.length && !parsedBody.summary) {
                alert(responseData?.message || "No data found for the selected date range.");
            }
        } catch (error) {
            console.error("Error fetching forensics report:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Forensics Report</h1>
                <div className="text-gray-700">
                    <span className="font-semibold">Admin</span> | <span>Admin</span>
                </div>
            </header>

            <div className="navigation">
                <button onClick={() => router.push("/admin/auctionReport")}>Auction Report</button>
                <button className="active" onClick={() => router.push("/admin/forensicsReport")}>
                    Forensics Report
                </button>
                <button onClick={() => router.push("/admin/dashboard")}>Item List</button>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-bold mb-4">Select Date Range</h2>
                <div className="date-range-picker mb-6">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="date-input"
                    />
                    <span className="mx-4">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="date-input"
                    />
                    <button onClick={fetchForensicsReport} className="fetch-btn">
                        Generate Report
                    </button>
                </div>

                {loading ? (
                    <p>Loading forensics report...</p>
                ) : (
                    <div>
                        {/* Summary Section */}
                        {forensicsSummary && (
                            <div className="summary-container bg-white p-4 rounded-lg shadow-md mt-6">
                                <h2 className="text-xl font-bold mb-4">Summary</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p><strong>Total Bids:</strong> {forensicsSummary.totalBids}</p>
                                        <p><strong>Total Earnings:</strong> ${forensicsSummary.totalEarnings}</p>
                                        <p><strong>Total Fulfilled Items:</strong> {forensicsSummary.totalFulfilledItems}</p>
                                    </div>
                                    <div>
                                        <p><strong>Average Bid Amount:</strong> {isNaN(forensicsSummary.averageBidAmount) ? 'N/A' : `$${forensicsSummary.averageBidAmount}`}</p>
                                        {forensicsSummary.highestBid && (
                                            <p>
                                                <strong>Highest Bid:</strong> ${forensicsSummary.highestBid.amount}
                                                (by {forensicsSummary.highestBid.buyerUsername} on {forensicsSummary.highestBid.itemName})
                                            </p>
                                        )}
                                        {forensicsSummary.topBuyer && (
                                            <p>
                                                <strong>Top Buyer:</strong> {forensicsSummary.topBuyer.buyer}
                                                (spent ${forensicsSummary.topBuyer.spend})
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Trends Section */}
                        {forensicsTrends && (
                            <div className="trends-container bg-white p-4 rounded-lg shadow-md mt-6">
                                <h3 className="text-lg font-semibold mb-4">Trends</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <strong>Daily Bids:</strong>
                                        {forensicsTrends.dailyBids ? (
                                            <ul className="list-disc list-inside">
                                                {Object.entries(forensicsTrends.dailyBids).map(([date, count]) => (
                                                    <li key={date}>
                                                        {date}: {count} bid{count > 1 ? "s" : ""}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No daily bids data available.</p>
                                        )}
                                    </div>
                                    <div>
                                        <strong>Popular Items:</strong>
                                        {forensicsTrends.popularItems && forensicsTrends.popularItems.length > 0 ? (
                                            <ul className="list-disc list-inside">
                                                {forensicsTrends.popularItems.map((item) => (
                                                    <li key={item.itemId}>
                                                        Item ID {item.itemId}: {item.count} bid{item.count > 1 ? "s" : ""}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No popular items data available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Forensics Data Table */}
                        <h2 className="text-xl font-bold mt-10">All Bids in Date Range:</h2>
                        <button
                            onClick={() => downloadExcel(forensicsData)}
                            className="download-btn mt-2"
                            disabled={!forensicsData.length}
                        >
                            Download as Excel
                        </button>
                        <table className="min-w-full bg-white border rounded-lg shadow-md mt-2">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Bid ID</th>
                                    <th className="py-2 px-4 border-b">Item ID</th>
                                    <th className="py-2 px-4 border-b">Item Name</th>
                                    <th className="py-2 px-4 border-b">Buyer Username</th>
                                    <th className="py-2 px-4 border-b">Bid Amount</th>
                                    <th className="py-2 px-4 border-b">Date Made</th>
                                    <th className="py-2 px-4 border-b">Fulfilled</th>
                                    <th className="py-2 px-4 border-b">Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {forensicsData.length > 0 ? (
                                    forensicsData.map((entry) => (
                                        <tr key={entry.bidId}>
                                            <td className="py-2 px-4 border-b">{entry.bidId}</td>
                                            <td className="py-2 px-4 border-b">{entry.itemId}</td>
                                            <td className="py-2 px-4 border-b">{entry.itemName}</td>
                                            <td className="py-2 px-4 border-b">{entry.buyerUsername}</td>
                                            <td className="py-2 px-4 border-b">${Number(entry.amount).toFixed(2)}</td>
                                            <td className="py-2 px-4 border-b">
                                                {new Date(entry.dateMade).toLocaleDateString()}
                                            </td>
                                            <td className="py-2 px-4 border-b">{entry.fulfilled ? "Yes" : "No"}</td>
                                            <td className="py-2 px-4 border-b">${entry.commission}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-4 text-center">
                                            No data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForensicsReport;
