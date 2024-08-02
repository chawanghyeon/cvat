import React from 'react';
import Icon from '@ant-design/icons';

import { Canvas } from 'cvat-canvas-wrapper';
import { BrushIcon } from 'icons';

export interface Props {
    canvasInstance: Canvas;
    isDrawing: boolean;
    disabled?: boolean;
    onDraw: () => void;
}

function DrawMaskControl(props: Props): JSX.Element {
    const {
        canvasInstance, isDrawing, disabled, onDraw,
    } = props;

    const dynamicIconProps = isDrawing ? {
        className: 'cvat-draw-mask-control cvat-active-canvas-control',
        onClick: (): void => {
            canvasInstance.draw({ enabled: false });
        },
    } : {
        className: 'cvat-draw-mask-control',
        onClick: (): void => {
            onDraw();
        },
    };

    return disabled ? (
        <Icon className='cvat-draw-mask-control cvat-disabled-canvas-control' component={BrushIcon} />
    ) : (
        <Icon {...dynamicIconProps} component={BrushIcon} />
    );
}

export default React.memo(DrawMaskControl);
