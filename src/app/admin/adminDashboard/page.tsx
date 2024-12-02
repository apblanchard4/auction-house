"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


function AdminDashboard() {
    const router = useRouter();


    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
            <p> Admin Dashboard</p>
        </div >
    );
}

export default AdminDashboard;
