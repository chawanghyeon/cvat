import React from 'react';

type ChartTitleProps = {
    title: string;
};
export default function ChartTitle({ title }: ChartTitleProps) {
    return (
        <div className='cvat-billing-chart-title'>
            <h2 className='cvat-billing-chart-title-text'>{title}</h2>
        </div>
    );
}
