import React from 'react';
import { Canvas } from 'cvat-canvas-wrapper';
import { Canvas3d } from 'cvat-canvas3d-wrapper';

import { ActiveControl, ObjectType, ShapeType } from 'reducers';
import DrawRectangleControl from './draw-rectangle-control';
import DrawPolygonControl from './draw-polygon-control';
import DrawPolylineControl from './draw-polyline-control';
import DrawPointsControl from './draw-points-control';
import DrawEllipseControl from './draw-ellipse-control';
import DrawCuboidControl from './draw-cuboid-control';
import DrawSkeletonControl from './draw-skeleton-control';
import DrawMaskControl from './draw-mask-control';

interface Props {
    shapeType: ShapeType;
    labels: any[];
    selectedLabelID: number | null;
    canvasInstance: Canvas;
    activeControl: ActiveControl;
    obejctType: ObjectType;
    onDraw: (shape: ShapeType, objectType: ObjectType) => void;
}

function DrawShapePopoverComponent(props: Props): JSX.Element {
    const {
        labels,
        canvasInstance,
        activeControl,
        obejctType,
        onDraw,
    } = props;

    const controlsDisabled = !labels.length;
    const shapeControlVisible = labels.some((label: any) => label.type === 'any' && !label.hasParent);
    const skeletonControlVisible = labels.some((label: any) => label.type === ShapeType.SKELETON);

    return (
        <div className='cvat-draw-shape-popover-content'>
            { shapeControlVisible && (
                <>
                    <DrawRectangleControl
                        canvasInstance={canvasInstance}
                        isDrawing={activeControl === ActiveControl.DRAW_RECTANGLE}
                        disabled={controlsDisabled}
                        onDraw={() => onDraw(ShapeType.RECTANGLE, obejctType)}
                    />
                    <DrawPolygonControl
                        canvasInstance={canvasInstance}
                        isDrawing={activeControl === ActiveControl.DRAW_POLYGON}
                        disabled={controlsDisabled}
                        onDraw={() => onDraw(ShapeType.POLYGON, obejctType)}
                    />
                    <DrawPolylineControl
                        canvasInstance={canvasInstance}
                        isDrawing={activeControl === ActiveControl.DRAW_POLYLINE}
                        disabled={controlsDisabled}
                        onDraw={() => onDraw(ShapeType.POLYLINE, obejctType)}
                    />
                    <DrawPointsControl
                        canvasInstance={canvasInstance}
                        isDrawing={activeControl === ActiveControl.DRAW_POINTS}
                        disabled={controlsDisabled}
                        onDraw={() => onDraw(ShapeType.POINTS, obejctType)}
                    />
                    <DrawEllipseControl
                        canvasInstance={canvasInstance}
                        isDrawing={activeControl === ActiveControl.DRAW_ELLIPSE}
                        disabled={controlsDisabled}
                        onDraw={() => onDraw(ShapeType.ELLIPSE, obejctType)}
                    />
                    <DrawCuboidControl
                        canvasInstance={canvasInstance}
                        isDrawing={activeControl === ActiveControl.DRAW_CUBOID}
                        disabled={controlsDisabled}
                        onDraw={() => onDraw(ShapeType.CUBOID, obejctType)}
                    />
                    <DrawMaskControl
                        canvasInstance={canvasInstance}
                        isDrawing={activeControl === ActiveControl.DRAW_MASK}
                        disabled={controlsDisabled}
                        onDraw={() => onDraw(ShapeType.MASK, obejctType)}
                    />
                </>
            )}
            { skeletonControlVisible && (
                <DrawSkeletonControl
                    canvasInstance={canvasInstance}
                    isDrawing={activeControl === ActiveControl.DRAW_SKELETON}
                    disabled={controlsDisabled}
                    onDraw={() => onDraw(ShapeType.SKELETON, obejctType)}
                />
            )}
        </div>
    );
}

export default React.memo(DrawShapePopoverComponent);
