import React from 'react';
import Icon from '@ant-design/icons';

import { Canvas } from 'cvat-canvas-wrapper';
import { PointIcon } from 'icons';

export interface Props {
    canvasInstance: Canvas;
    isDrawing: boolean;
    disabled?: boolean;
    onDraw: () => void;
}

function DrawPointsControl(props: Props): JSX.Element {
    const {
        canvasInstance,
        isDrawing,
        disabled,
        onDraw,
    } = props;

    const dynamicIconProps = isDrawing ? {
        className: 'cvat-draw-points-control cvat-active-canvas-control',
        onClick: (): void => {
            canvasInstance.draw({ enabled: false });
        },
    } : {
        className: 'cvat-draw-points-control',
        onClick: (): void => {
            onDraw();
        },
    };

    return disabled ? (
        <Icon className='cvat-draw-points-control cvat-disabled-canvas-control' component={PointIcon} />
    ) : (
        <Icon {...dynamicIconProps} component={PointIcon} />
    );
}

export default React.memo(DrawPointsControl);
