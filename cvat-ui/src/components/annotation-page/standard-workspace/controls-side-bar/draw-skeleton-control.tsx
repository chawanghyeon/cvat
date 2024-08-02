import React from 'react';
import Icon from '@ant-design/icons';

import { Canvas } from 'cvat-canvas-wrapper';
import { Canvas3d } from 'cvat-canvas3d-wrapper';

import { SkeletonIcon } from 'icons';

export interface Props {
    canvasInstance: Canvas | Canvas3d;
    isDrawing: boolean;
    disabled?: boolean;
    onDraw: () => void;
}

function DrawSkeletonControl(props: Props): JSX.Element {
    const {
        canvasInstance,
        isDrawing,
        disabled,
        onDraw,
    } = props;

    const dynamicIconProps = isDrawing ? {
        className: 'cvat-draw-skeleton-control cvat-active-canvas-control',
        onClick: (): void => {
            canvasInstance.draw({ enabled: false });
        },
    } : {
        className: 'cvat-draw-skeleton-control',
        onClick: (): void => {
            onDraw();
        },
    };

    return disabled ? (
        <Icon className='cvat-draw-skeleton-control cvat-disabled-canvas-control' component={SkeletonIcon} />
    ) : (
        <Icon {...dynamicIconProps} component={SkeletonIcon} />
    );
}

export default React.memo(DrawSkeletonControl);
