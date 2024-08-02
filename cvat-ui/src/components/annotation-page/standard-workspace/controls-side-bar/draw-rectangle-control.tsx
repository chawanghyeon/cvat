import React from 'react';
import Icon from '@ant-design/icons';

import { Canvas } from 'cvat-canvas-wrapper';
import { RectangleIcon } from 'icons';
import CvatTooltip from 'components/common/cvat-tooltip';

export interface Props {
    canvasInstance: Canvas;
    isDrawing: boolean;
    disabled?: boolean;
    onDraw: () => void;
}

function DrawRectangleControl(props: Props): JSX.Element {
    const {
        canvasInstance,
        isDrawing,
        disabled,
        onDraw,
    } = props;

    const dynamicIconProps = isDrawing ? {
        className: 'cvat-draw-rectangle-control cvat-active-canvas-control',
        onClick: (): void => {
            canvasInstance.draw({ enabled: false });
        },
    } : {
        className: 'cvat-draw-rectangle-control',
        onClick: (): void => {
            onDraw();
        },
    };

    return disabled ? (
        <Icon className='cvat-draw-rectangle-control cvat-disabled-canvas-control' component={RectangleIcon} />
    ) : (
        <CvatTooltip placement='bottomLeft' title='Press Shift + F or D to adjust the size'>
            <Icon {...dynamicIconProps} component={RectangleIcon} />
        </CvatTooltip>
    );
}

export default React.memo(DrawRectangleControl);
