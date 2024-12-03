"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './admin.css';
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

    return (
        <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
            <p> Admin Dashboard</p>
        </div >
    );
}

export default AdminDashboard;
