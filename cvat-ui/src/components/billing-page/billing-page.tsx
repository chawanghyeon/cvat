import React, { useState, useEffect, useRef } from 'react';
import DoughnutChart, { IDoughnutChartProps } from './chart/doughnut-chart';
import ChartInfo from './total/chart-info';
import ChartTitle from './chart-title';
import './styles.scss';

interface ChartInfoProps extends IDoughnutChartProps {
    fee?: string;
    usage?: string;
    limit?: string;
}
export default function BillingPageComponent() {
    const [chartInfo, setChartInfo] = useState<ChartInfoProps>({
        labels: [],
        datasets: [],
        fee: '',
        usage: '',
        limit: '',
    });
    useEffect(() => {
        // fetch Billing Data

        setChartInfo({
            labels: [],
            datasets: [
                {
                    label: '# of Votes',
                    data: [75, 25],
                    backgroundColor: ['rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 0.2)'],
                    borderColor: ['rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)'],
                    borderWidth: 1,
                },
            ],
            fee: '$80.87',
            usage: '',
            limit: '$120.00',
        });
    }, []);

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10',
                }}
            >
                <ChartTitle title='Monthly Bill 4월1-30' />
                <div className='cvat-billing-chart-container'>
                    <DoughnutChart labels={chartInfo.labels} datasets={chartInfo.datasets} />
                    <ChartInfo fee={chartInfo.fee} usage={chartInfo.usage} limit={chartInfo.limit} />
                </div>
            </div>
        </>
    );
}
