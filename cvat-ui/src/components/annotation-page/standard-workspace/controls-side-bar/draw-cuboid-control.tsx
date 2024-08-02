import React from 'react';
import Icon from '@ant-design/icons';

import { Canvas } from 'cvat-canvas-wrapper';
import { Canvas3d } from 'cvat-canvas3d-wrapper';

import { CubeIcon } from 'icons';
import CvatTooltip from 'components/common/cvat-tooltip';

export interface Props {
    canvasInstance: Canvas | Canvas3d;
    isDrawing: boolean;
    disabled?: boolean;
    onDraw: () => void;
}

function DrawCuboidControl(props: Props): JSX.Element {
    const {
        canvasInstance,
        isDrawing,
        disabled,
        onDraw,
    } = props;

    const dynamicIconProps = isDrawing ? {
        className: 'cvat-draw-cuboid-control cvat-active-canvas-control',
        onClick: (): void => {
            canvasInstance.draw({ enabled: false });
        },
    } : {
        className: 'cvat-draw-cuboid-control',
        onClick: (): void => {
            onDraw();
        },
    };

    return disabled ? (
        <Icon className='cvat-draw-cuboid-control cvat-disabled-canvas-control' component={CubeIcon} />
    ) : (
        <CvatTooltip
            placement='bottomLeft'
            title={canvasInstance instanceof Canvas && 'Press Shift + D / G / R / V to rotate or Press Shift + F to Switch'}
        >
            <Icon {...dynamicIconProps} component={CubeIcon} />
        </CvatTooltip>
    );
}

export default React.memo(DrawCuboidControl);
