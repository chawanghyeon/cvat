import React, { useState } from 'react';
import {
    ActiveControl, ObjectType, Rotation, ShapeType,
} from 'reducers';
import GlobalHotKeys, { KeyMap } from 'utils/mousetrap-react';
import {
    Canvas, CanvasMode, CuboidDrawingMethod, RectDrawingMethod,
} from 'cvat-canvas-wrapper';
import { Divider, RadioChangeEvent } from 'antd';

import { Label } from 'cvat-core-wrapper';
import ControlVisibilityObserver, { ExtraControlsControl } from './control-visibility-observer';
import RotateControl, { Props as RotateControlProps } from './rotate-control';
import CursorControl, { Props as CursorControlProps } from './cursor-control';
import MoveControl, { Props as MoveControlProps } from './move-control';
import FitControl, { Props as FitControlProps } from './fit-control';
import ResizeControl, { Props as ResizeControlProps } from './resize-control';
import ToolsControl from './tools-control';
import OpenCVControl from './opencv-control';
import drawShapeControl, { Props as DrawShapeControlProps } from './draw-shape-control';
import SetupTagControl, { Props as SetupTagControlProps } from './setup-tag-control';
import MergeControl, { Props as MergeControlProps } from './merge-control';
import GroupControl, { Props as GroupControlProps } from './group-control';
import SplitControl, { Props as SplitControlProps } from './split-control';
import DrawSettingsControl from './draw-settings-control';

interface Props {
    canvasInstance: Canvas;
    activeControl: ActiveControl;
    keyMap: KeyMap;
    normalizedKeyMap: Record<string, string>;
    labels: any[];
    frameData: any;
    activeShapeType: ShapeType;
    selectedLabelID: number | null;

    mergeObjects(enabled: boolean): void;
    groupObjects(enabled: boolean): void;
    splitTrack(enabled: boolean): void;
    rotateFrame(rotation: Rotation): void;
    repeatDrawShape(): void;
    pasteShape(): void;
    resetGroup(): void;
    redrawShape(): void;
    onDrawStart(
        shapeType: ShapeType,
        labelID: number,
        objectType: ObjectType,
        points?: number,
        rectDrawingMethod?: RectDrawingMethod,
        cuboidDrawingMethod?: CuboidDrawingMethod,
    ): void;
}

// We use the observer to see if these controls are in the viewport
// They automatically put to extra if not
const ObservedCursorControl = ControlVisibilityObserver<CursorControlProps>(CursorControl);
const ObservedMoveControl = ControlVisibilityObserver<MoveControlProps>(MoveControl);
const ObservedRotateControl = ControlVisibilityObserver<RotateControlProps>(RotateControl);
const ObservedFitControl = ControlVisibilityObserver<FitControlProps>(FitControl);
const ObservedResizeControl = ControlVisibilityObserver<ResizeControlProps>(ResizeControl);
const ObservedToolsControl = ControlVisibilityObserver(ToolsControl);
const ObservedOpenCVControl = ControlVisibilityObserver(OpenCVControl);
const ObservedDrawShapeControl = ControlVisibilityObserver<DrawShapeControlProps>(drawShapeControl);
const ObservedSetupTagControl = ControlVisibilityObserver<SetupTagControlProps>(SetupTagControl);
const ObservedMergeControl = ControlVisibilityObserver<MergeControlProps>(MergeControl);
const ObservedGroupControl = ControlVisibilityObserver<GroupControlProps>(GroupControl);
const ObservedSplitControl = ControlVisibilityObserver<SplitControlProps>(SplitControl);

export default function ControlsSideBarComponent(props: Props): JSX.Element {
    const {
        activeControl,
        canvasInstance,
        normalizedKeyMap,
        keyMap,
        labels,
        selectedLabelID,
        mergeObjects,
        groupObjects,
        splitTrack,
        rotateFrame,
        repeatDrawShape,
        pasteShape,
        resetGroup,
        redrawShape,
        frameData,
        activeShapeType,
        onDrawStart,
    } = props;

    const controlsDisabled = !labels.length || frameData.deleted;
    const [labelID, setLabelID] = useState(selectedLabelID);
    const [rectDrawingMethod, setRectDrawingMethod] =
        useState(ShapeType.RECTANGLE ? RectDrawingMethod.CLASSIC : undefined);
    const [cuboidDrawingMethod, setCuboidDrawingMethod] =
        useState(ShapeType.CUBOID ? CuboidDrawingMethod.CLASSIC : undefined);
    const [objectType, setObjectType] = useState<ObjectType>(ObjectType.SHAPE);
    const [numberOfPoints, setNumberOfPoints] = useState<number | undefined>(undefined);

    // const shapeControlVisible = labels.some((label: any) => label.type === 'any' && !label.hasParent);
    const shapeControlVisible = labels.some((label: any) => label.type === 'any' || label.type === 'skeleton');
    const tagControlVisible = shapeControlVisible;

    const isDrawing = activeControl === ActiveControl.DRAW_RECTANGLE ||
        activeControl === ActiveControl.DRAW_POLYGON ||
        activeControl === ActiveControl.DRAW_POLYLINE ||
        activeControl === ActiveControl.DRAW_POINTS ||
        activeControl === ActiveControl.DRAW_ELLIPSE ||
        activeControl === ActiveControl.DRAW_CUBOID ||
        activeControl === ActiveControl.DRAW_SKELETON ||
        activeControl === ActiveControl.DRAW_MASK;

    let minimumPoints = 3;
    if (activeShapeType === ShapeType.POLYLINE) {
        minimumPoints = 2;
    } else if (activeShapeType === ShapeType.POINTS) {
        minimumPoints = 1;
    }

    const preventDefault = (event: KeyboardEvent | undefined): void => {
        if (event) {
            event.preventDefault();
        }
    };

    /** 라벨 변경 이벤트 */
    const onChangeLabel = (value: Label | null) : void => {
        if (value == null) {
            return;
        }
        setLabelID(value.id as number);

        onDrawStart(activeShapeType, value.id as number, objectType,
            numberOfPoints, rectDrawingMethod, cuboidDrawingMethod);
    };

    /** 포인트 변경 이벤트 */
    const onChangePoints = (value: number | undefined): void => {
        canvasInstance.cancel();
        setNumberOfPoints(value);
        canvasInstance.draw({
            enabled: true,
            shapeType: activeShapeType,
            numberOfPoints: value,
        });

        onDrawStart(activeShapeType, labelID as number, objectType,
            value, rectDrawingMethod, cuboidDrawingMethod);
    };

    /** rectangle 그리기 방식 변경 이벤트 */
    const onChangeRectDrawingMethod = (event: RadioChangeEvent): void => {
        canvasInstance.cancel();
        setRectDrawingMethod(event.target.value);
        canvasInstance.draw({
            enabled: true,
            shapeType: activeShapeType,
            rectDrawingMethod: event.target.value,
        });

        onDrawStart(activeShapeType, labelID as number, objectType,
            numberOfPoints, event.target.value, cuboidDrawingMethod);
    };

    /** Cuboid 그리기 방식 변경 이벤트 */
    const onChangeCuboidDrawingMethod = (event: RadioChangeEvent): void => {
        canvasInstance.cancel();
        setCuboidDrawingMethod(event.target.value);
        canvasInstance.draw({
            enabled: true,
            shapeType: activeShapeType,
            cuboidDrawingMethod: event.target.value,
        });

        onDrawStart(activeShapeType, labelID as number, objectType,
            numberOfPoints, rectDrawingMethod, event.target.value);
    };

    /** 그리기/트랙모드 switch 변경 이벤트 */
    const onChangeObjectType = (checked: boolean): void => {
        const value = checked ? ObjectType.TRACK : ObjectType.SHAPE;
        setObjectType(value);

        onDrawStart(activeShapeType, labelID as number, value,
            numberOfPoints, rectDrawingMethod, cuboidDrawingMethod);
    };

    let subKeyMap: any = {
        CANCEL: keyMap.CANCEL,
        CLOCKWISE_ROTATION: keyMap.CLOCKWISE_ROTATION,
        ANTICLOCKWISE_ROTATION: keyMap.ANTICLOCKWISE_ROTATION,
    };

    let handlers: any = {
        CANCEL: (event: KeyboardEvent | undefined) => {
            preventDefault(event);
            if (activeControl !== ActiveControl.CURSOR) {
                canvasInstance.cancel();
            }
        },
        CLOCKWISE_ROTATION: (event: KeyboardEvent | undefined) => {
            preventDefault(event);
            rotateFrame(Rotation.CLOCKWISE90);
        },
        ANTICLOCKWISE_ROTATION: (event: KeyboardEvent | undefined) => {
            preventDefault(event);
            rotateFrame(Rotation.ANTICLOCKWISE90);
        },
    };

    if (!controlsDisabled) {
        handlers = {
            ...handlers,
            PASTE_SHAPE: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                canvasInstance.cancel();
                pasteShape();
            },
            SWITCH_DRAW_MODE: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                const drawing = [
                    ActiveControl.DRAW_POINTS,
                    ActiveControl.DRAW_POLYGON,
                    ActiveControl.DRAW_POLYLINE,
                    ActiveControl.DRAW_RECTANGLE,
                    ActiveControl.DRAW_CUBOID,
                    ActiveControl.DRAW_ELLIPSE,
                    ActiveControl.DRAW_SKELETON,
                    ActiveControl.DRAW_MASK,
                    ActiveControl.AI_TOOLS,
                    ActiveControl.OPENCV_TOOLS,
                ].includes(activeControl);
                const editing = canvasInstance.mode() === CanvasMode.EDIT;

                if (!drawing) {
                    if (editing) {
                        // users probably will press N as they are used to do when they want to finish editing
                        // in this case, if a mask is being edited we probably want to finish editing first
                        canvasInstance.edit({ enabled: false });
                        return;
                    }

                    canvasInstance.cancel();
                    // repeateDrawShapes gets all the latest parameters
                    // and calls canvasInstance.draw() with them

                    if (event && event.shiftKey) {
                        redrawShape();
                    } else {
                        repeatDrawShape();
                    }
                } else {
                    if ([ActiveControl.AI_TOOLS, ActiveControl.OPENCV_TOOLS].includes(activeControl)) {
                        // separated API method
                        canvasInstance.interact({ enabled: false });
                        return;
                    }

                    canvasInstance.draw({ enabled: false });
                }
            },
        };
        subKeyMap = {
            ...subKeyMap,
            PASTE_SHAPE: keyMap.PASTE_SHAPE,
            SWITCH_DRAW_MODE: keyMap.SWITCH_DRAW_MODE,
        };
    }

    return (
        <div className='cvat-canvas-controls-sidebar'>
            <GlobalHotKeys keyMap={subKeyMap} handlers={handlers} />
            <ObservedCursorControl
                cursorShortkey={normalizedKeyMap.CANCEL}
                canvasInstance={canvasInstance}
                activeControl={activeControl}
            />
            <ObservedMoveControl canvasInstance={canvasInstance} activeControl={activeControl} />
            <ObservedRotateControl
                anticlockwiseShortcut={normalizedKeyMap.ANTICLOCKWISE_ROTATION}
                clockwiseShortcut={normalizedKeyMap.CLOCKWISE_ROTATION}
                rotateFrame={rotateFrame}
            />

            <Divider type='vertical' />

            <ObservedFitControl canvasInstance={canvasInstance} />
            <ObservedResizeControl canvasInstance={canvasInstance} activeControl={activeControl} />

            <Divider type='vertical' />
            <ObservedToolsControl />
            <ObservedOpenCVControl />
            {
                shapeControlVisible && (
                    <ObservedDrawShapeControl
                        canvasInstance={canvasInstance}
                        isDrawing={isDrawing}
                        disabled={controlsDisabled}
                        activeControl={activeControl}
                        activeShapeType={activeShapeType}
                        onDrawStart={onDrawStart}
                        labels={labels}
                        selectedLabelID={labelID}
                        numberOfPoints={numberOfPoints}
                        rectDrawingMethod={rectDrawingMethod}
                        cuboidDrawingMethod={cuboidDrawingMethod}
                        obejctType={objectType}
                        onChangePoints={onChangePoints}
                    />
                )
            }
            {
                tagControlVisible && (
                    <ObservedSetupTagControl
                        canvasInstance={canvasInstance}
                        disabled={controlsDisabled}
                    />
                )
            }
            <Divider type='vertical' />

            <ObservedMergeControl
                mergeObjects={mergeObjects}
                canvasInstance={canvasInstance}
                activeControl={activeControl}
                disabled={controlsDisabled}
                shortcuts={{
                    SWITCH_MERGE_MODE: {
                        details: keyMap.SWITCH_MERGE_MODE,
                        displayValue: normalizedKeyMap.SWITCH_MERGE_MODE,
                    },
                }}
            />
            <ObservedGroupControl
                groupObjects={groupObjects}
                resetGroup={resetGroup}
                canvasInstance={canvasInstance}
                activeControl={activeControl}
                disabled={controlsDisabled}
                shortcuts={{
                    SWITCH_GROUP_MODE: {
                        details: keyMap.SWITCH_GROUP_MODE,
                        displayValue: normalizedKeyMap.SWITCH_GROUP_MODE,
                    },
                    RESET_GROUP: {
                        details: keyMap.RESET_GROUP,
                        displayValue: normalizedKeyMap.RESET_GROUP,
                    },
                }}
            />
            <ObservedSplitControl
                splitTrack={splitTrack}
                canvasInstance={canvasInstance}
                activeControl={activeControl}
                disabled={controlsDisabled}
                shortcuts={{
                    SWITCH_SPLIT_MODE: {
                        details: keyMap.SWITCH_SPLIT_MODE,
                        displayValue: normalizedKeyMap.SWITCH_SPLIT_MODE,
                    },
                }}
            />

            <ExtraControlsControl />

            {isDrawing && (
                <DrawSettingsControl
                    canvasInstance={canvasInstance}
                    activeControl={activeControl}
                    activeShapeType={activeShapeType}
                    labels={labels}
                    selectedLabelID={labelID}
                    minimumPoints={minimumPoints}
                    numberOfPoints={numberOfPoints}
                    rectDrawingMethod={rectDrawingMethod}
                    cuboidDrawingMethod={cuboidDrawingMethod}
                    objectType={objectType}
                    onChangeLabel={onChangeLabel}
                    onChangePoints={onChangePoints}
                    onChangeRectDrawingMethod={onChangeRectDrawingMethod}
                    onChangeCuboidDrawingMethod={onChangeCuboidDrawingMethod}
                    onChangeObjectType={onChangeObjectType}
                />
            )}
        </div>
    );
}
