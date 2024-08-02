import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type Datasets = {
    label: string;
    data: number[] | [];
    backgroundColor: string[] | [];
    borderColor: string[] | [];
    borderWidth: string | number;
};
export interface IDoughnutChartProps {
    labels: string[] | [];
    datasets: Datasets[] | [];
}
export default function DoughnutChart({ labels: labelsProp, datasets: datasetsProp }: IDoughnutChartProps) {
    const chartRef = useRef(null);
    const [chartData, setChartData] = useState<any>({
        labels: labelsProp,
        datasets: datasetsProp,
        text: 'Total: 9000+',
    });

    useEffect(() => {
        const chart = chartRef.current;

        if (chart) {
            setChartData({
                labels: labelsProp,
                datasets: datasetsProp,
                text: 'Total: 9000+',
            });
        }
    }, [chartRef, datasetsProp, labelsProp]);

    useEffect(() => {
        console.log('chartData :', chartData);
        console.log('labels :', datasetsProp);
        console.log('datasets :', datasetsProp);
    }, [chartData]);

    return (
        <div style={{ width: '300px', height: '300px', position: 'relative' }}>
            <Doughnut
                ref={chartRef}
                data={chartData}
                options={{
                    animation: {
                        easing: 'easeOutSine',
                        // segmentShowStroke: false,
                    },
                    responsive: true,
                }}
            />
            <div className='cvat-billing-chart-text'>
                <div>100%</div>
            </div>
        </div>
    );
}
