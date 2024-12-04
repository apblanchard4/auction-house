"use client";

import React, { useEffect} from 'react';
import { useRouter } from 'next/navigation';
import './forensicsReport.css';


// interface Item {
//     id: number;
//     itemName: string;
//     price: number;
//     startDate: string;
//     endDate: string;
//     status: string;
// }




function ForensicsReport() {
    const router = useRouter();

    useEffect(() => {

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
            <button  onClick={() => router.push('/admin/auctionReport')}>Auction Report</button>
            <button className="active" onClick={() => router.push('/admin/forensicsReport')}>Forensics Report</button>
            <button onClick={() => router.push('/admin/dashboard')}>Item List</button>
        </div>

        </div>

    );

}



export default ForensicsReport;