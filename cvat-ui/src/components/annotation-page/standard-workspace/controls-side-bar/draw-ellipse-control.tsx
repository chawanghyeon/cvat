import React from 'react';
import Icon from '@ant-design/icons';

import { Canvas } from 'cvat-canvas-wrapper';
import { EllipseIcon } from 'icons';

export interface Props {
    canvasInstance: Canvas;
    isDrawing: boolean;
    disabled?: boolean;
    onDraw: () => void;
}

function DrawEllipseControl(props: Props): JSX.Element {
    const {
        canvasInstance,
        isDrawing,
        disabled,
        onDraw,
    } = props;

    const dynamicIconProps = isDrawing ? {
        className: 'cvat-draw-ellipse-control cvat-active-canvas-control',
        onClick: (): void => {
            canvasInstance.draw({ enabled: false });
        },
    } : {
        className: 'cvat-draw-ellipse-control',
        onClick: (): void => {
            onDraw();
        },
    };

    return disabled ? (
        <Icon className='cvat-draw-ellipse-control cvat-disabled-canvas-control' component={EllipseIcon} />
    ) : (
        <Icon {...dynamicIconProps} component={EllipseIcon} />
    );
}

export default React.memo(DrawEllipseControl);
