import React from 'react';
import Popover from 'antd/lib/popover';
import Icon from '@ant-design/icons';

import { Canvas, CuboidDrawingMethod, RectDrawingMethod } from 'cvat-canvas-wrapper';
import {
    BrushIcon,
    CubeIcon, EllipseIcon, PointIcon, PolygonIcon, PolylineIcon, RectangleIcon, SkeletonIcon,
} from 'icons';
import { ActiveControl, ObjectType, ShapeType } from 'reducers';

import withVisibilityHandling from './handle-popover-visibility';
import DrawShapePopover from './draw-shape-popover';

export interface Props {
    canvasInstance: Canvas;
    isDrawing: boolean;
    disabled?: boolean;
    activeShapeType: ShapeType;
    onDrawStart(
        shapeType: ShapeType,
        labelID: number,
        objectType: ObjectType,
        points?: number,
        rectDrawingMethod?: RectDrawingMethod,
        cuboidDrawingMethod?: CuboidDrawingMethod,
    ): void;
    labels: any[];
    selectedLabelID: number | null;
    activeControl: ActiveControl;
    numberOfPoints?: number;
    rectDrawingMethod: RectDrawingMethod | undefined;
    cuboidDrawingMethod: CuboidDrawingMethod | undefined;
    obejctType: ObjectType;
    onChangePoints(value: number | undefined): void;
}

const CustomPopover = withVisibilityHandling(Popover, 'draw-shape');
function DrawShapeControl(props: Props): JSX.Element {
    const {
        canvasInstance,
        isDrawing,
        disabled,
        activeShapeType,
        onDrawStart,
        labels,
        selectedLabelID,
        activeControl,
        numberOfPoints,
        rectDrawingMethod,
        cuboidDrawingMethod,
        obejctType,
        onChangePoints,
    } = props;

    const activeIcon = (): React.MemoExoticComponent<() => JSX.Element> => {
        switch (activeShapeType) {
            case ShapeType.RECTANGLE:
                return RectangleIcon;
            case ShapeType.POLYGON:
                return PolygonIcon;
            case ShapeType.POLYLINE:
                return PolylineIcon;
            case ShapeType.POINTS:
                return PointIcon;
            case ShapeType.ELLIPSE:
                return EllipseIcon;
            case ShapeType.CUBOID:
                return CubeIcon;
            case ShapeType.SKELETON:
                return SkeletonIcon;
            case ShapeType.MASK:
                return BrushIcon;
            default:
                return RectangleIcon;
        }
    };

    const onDraw = (shape: ShapeType, objectType: ObjectType): void => {
        canvasInstance.cancel();
        let minimumPoints = 3;
        if (shape === ShapeType.POLYLINE) {
            minimumPoints = 2;
        } else if (shape === ShapeType.POINTS) {
            minimumPoints = 1;
        }

        const isInvalidPoint = numberOfPoints !== undefined && minimumPoints > numberOfPoints;

        // numberOfPoints가 minimunPoints 보다 작을 경우 - 라벨링 객체를 변경했을 경우에 해당
        if (isInvalidPoint) {
            onChangePoints(undefined);
            canvasInstance.cancel();
        }

        let selectedLabel = labels.find((label) => label.id === selectedLabelID);

        // 이미 선택한 label이 skeleton 타입이 아닐 경우 강제 초기화
        if (shape === ShapeType.SKELETON && selectedLabel.type !== 'skeleton') {
            selectedLabel = labels.find((label) => label.type === 'skeleton');
        }

        if (selectedLabel) {
            canvasInstance.draw({
                enabled: true,
                numberOfPoints: isInvalidPoint ? undefined : numberOfPoints,
                rectDrawingMethod,
                cuboidDrawingMethod,
                brushTool: {
                    type: 'brush',
                    size: 10,
                    form: 'circle',
                    color: selectedLabel.color,
                },
                shapeType: shape,
                skeletonSVG: selectedLabel && selectedLabel.type === ShapeType.SKELETON ?
                    selectedLabel.structure.svg : undefined,
                crosshair: [ShapeType.RECTANGLE, ShapeType.CUBOID, ShapeType.ELLIPSE].includes(shape),
            });

            onDrawStart(
                shape, selectedLabel.id, objectType,
                isInvalidPoint ? undefined : numberOfPoints, rectDrawingMethod, cuboidDrawingMethod,
            );
        }
    };

    const dynamicPopoverProps = isDrawing ? {
        overlayStyle: {
            display: 'none',
        },
    } : {};

    const dynamicIconProps = isDrawing ? {
        className: 'cvat-draw-shape-control cvat-active-canvas-control',
        onClick: (): void => {
            canvasInstance.draw({ enabled: false });
        },
    } : {
        className: 'cvat-draw-shape-control',
        onClick: (): void => {
            onDraw(activeShapeType, obejctType);
        },
    };

    return disabled ? (
        <Icon className='cvat-draw-rectangle-control cvat-disabled-canvas-control' component={activeIcon()} />
    ) : (
        <CustomPopover
            {...dynamicPopoverProps}
            overlayClassName='cvat-draw-shape-popover'
            placement='bottom'
            content={(
                <DrawShapePopover
                    selectedLabelID={selectedLabelID}
                    shapeType={ShapeType.SHAPE}
                    labels={labels}
                    canvasInstance={canvasInstance}
                    activeControl={activeControl}
                    onDraw={onDraw}
                    obejctType={obejctType}
                />
            )}
        >
            <Icon
                {...dynamicIconProps}
                component={activeIcon()}
            />
        </CustomPopover>
    );
}

export default React.memo(DrawShapeControl);
