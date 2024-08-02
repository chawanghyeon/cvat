import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartInfoProps {
    fee?: any;
    usage?: any;
    limit?: any;
}
export default function ChartInfo({ fee, usage, limit }: ChartInfoProps) {
    return (
        <div className='billing-cart-info'>
            <div>{fee}</div>
            <div>{`/ ${limit} limit`}</div>
            <div className='cvat-billing-chart-button'>Increase limit</div>
        </div>
    );
}
