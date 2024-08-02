import React from 'react';
import Icon from '@ant-design/icons';

import { Canvas } from 'cvat-canvas-wrapper';
import { PolylineIcon } from 'icons';

export interface Props {
    canvasInstance: Canvas;
    isDrawing: boolean;
    disabled?: boolean;
    onDraw: () => void;
}

function DrawPolylineControl(props: Props): JSX.Element {
    const {
        canvasInstance,
        isDrawing,
        disabled,
        onDraw,
    } = props;

    const dynamicIconProps = isDrawing ? {
        className: 'cvat-draw-polyline-control cvat-active-canvas-control',
        onClick: (): void => {
            canvasInstance.draw({ enabled: false });
        },
    } : {
        className: 'cvat-draw-polyline-control',
        onClick: (): void => {
            onDraw();
        },
    };

    return disabled ? (
        <Icon className='cvat-draw-polyline-control cvat-disabled-canvas-control' component={PolylineIcon} />
    ) : (
        <Icon {...dynamicIconProps} component={PolylineIcon} />
    );
}

export default React.memo(DrawPolylineControl);
