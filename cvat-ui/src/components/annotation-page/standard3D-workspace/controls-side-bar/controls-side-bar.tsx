import React, { useState } from 'react';
import Layout from 'antd/lib/layout';
import { ActiveControl, ObjectType, ShapeType } from 'reducers';
import { Label, LabelType } from 'cvat-core-wrapper';
import { Canvas3d as Canvas } from 'cvat-canvas3d-wrapper';
import MoveControl, {
    Props as MoveControlProps,
} from 'components/annotation-page/standard-workspace/controls-side-bar/move-control';
import CursorControl, {
    Props as CursorControlProps,
} from 'components/annotation-page/standard-workspace/controls-side-bar/cursor-control';
import DrawCuboidControl, {
    Props as DrawCuboidControlProps,
} from 'components/annotation-page/standard-workspace/controls-side-bar/draw-cuboid-control';
import GroupControl, {
    Props as GroupControlProps,
} from 'components/annotation-page/standard-workspace/controls-side-bar/group-control';
import MergeControl, {
    Props as MergeControlProps,
} from 'components/annotation-page/standard-workspace/controls-side-bar/merge-control';
import SplitControl, {
    Props as SplitControlProps,
} from 'components/annotation-page/standard-workspace/controls-side-bar/split-control';
import GlobalHotKeys, { KeyMap } from 'utils/mousetrap-react';
import ControlVisibilityObserver from 'components/annotation-page/standard-workspace/controls-side-bar/control-visibility-observer';
import { filterApplicableForType } from 'utils/filter-applicable-labels';
import { CuboidDrawingMethod, RectDrawingMethod } from 'cvat-canvas-wrapper';
import DrawSettingsControl from './draw-settings-control';
import DrawBrushControl from './draw-brush-control';

interface Props {
    keyMap: KeyMap;
    canvasInstance: Canvas;
    activeControl: ActiveControl;
    normalizedKeyMap: Record<string, string>;
    labels: Label[];
    jobInstance: any;
    activeShapeType: ShapeType;
    selectedLabelID: number;
    repeatDrawShape(): void;
    redrawShape(): void;
    pasteShape(): void;
    groupObjects(enabled: boolean): void;
    mergeObjects(enabled: boolean): void;
    splitTrack(enabled: boolean): void;
    resetGroup(): void;
    onDrawStart(
        shapeType: ShapeType,
        labelID: number,
        objectType: ObjectType,
        points?: number,
        rectDrawingMethod?: RectDrawingMethod,
        cuboidDrawingMethod?: CuboidDrawingMethod,
    ): void;
}

const ObservedCursorControl = ControlVisibilityObserver<CursorControlProps>(CursorControl);
const ObservedMoveControl = ControlVisibilityObserver<MoveControlProps>(MoveControl);
const ObservedDrawCuboidControl = ControlVisibilityObserver<DrawCuboidControlProps>(DrawCuboidControl);
const ObservedGroupControl = ControlVisibilityObserver<GroupControlProps>(GroupControl);
const ObservedMergeControl = ControlVisibilityObserver<MergeControlProps>(MergeControl);
const ObservedSplitControl = ControlVisibilityObserver<SplitControlProps>(SplitControl);

export default function ControlsSideBarComponent(props: Props): JSX.Element {
    const {
        canvasInstance,
        pasteShape,
        activeControl,
        normalizedKeyMap,
        keyMap,
        labels,
        redrawShape,
        repeatDrawShape,
        groupObjects,
        mergeObjects,
        splitTrack,
        resetGroup,
        activeShapeType,
        selectedLabelID,
        onDrawStart,
    } = props;

    const [labelID, setLabelID] = useState(selectedLabelID);
    const applicableLabels = filterApplicableForType(LabelType.CUBOID, labels);

    const isDrawing = activeControl === ActiveControl.DRAW_CUBOID;
    const preventDefault = (event: KeyboardEvent | undefined): void => {
        if (event) {
            event.preventDefault();
        }
    };

    let subKeyMap: any = {
        CANCEL: keyMap.CANCEL,
    };

    let handlers: any = {
        CANCEL: (event: KeyboardEvent | undefined) => {
            preventDefault(event);
            if (activeControl !== ActiveControl.CURSOR) {
                canvasInstance.cancel();
            }
        },
    };

    if (applicableLabels.length) {
        handlers = {
            ...handlers,
            PASTE_SHAPE: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                canvasInstance.cancel();
                pasteShape();
            },
            SWITCH_DRAW_MODE: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                const drawing = [ActiveControl.DRAW_CUBOID].includes(activeControl);

                if (!drawing) {
                    canvasInstance.cancel();
                    if (event && event.shiftKey) {
                        redrawShape();
                    } else {
                        repeatDrawShape();
                    }
                } else {
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

    const controlsDisabled = !applicableLabels.length;

    /** 라벨 변경 이벤트 */
    const onChangeLabel = (value: Label | null) : void => {
        canvasInstance.cancel();
        if (value == null) {
            return;
        }

        setLabelID(value.id as number);
        onDrawStart(ShapeType.CUBOID, value.id as number, ObjectType.SHAPE);
        repeatDrawShape();
    };
    return (
        <div className='cvat-canvas-controls-sidebar'>
            <GlobalHotKeys keyMap={subKeyMap} handlers={handlers} />
            <ObservedCursorControl
                cursorShortkey={normalizedKeyMap.CANCEL}
                canvasInstance={canvasInstance}
                activeControl={activeControl}
            />
            <ObservedMoveControl canvasInstance={canvasInstance} activeControl={activeControl} />
            <ObservedDrawCuboidControl
                canvasInstance={canvasInstance}
                isDrawing={activeControl === ActiveControl.DRAW_CUBOID}
                disabled={controlsDisabled}
                onDraw={repeatDrawShape}
            />
            <DrawBrushControl
                canvasInstance={canvasInstance}
                disabled={!applicableLabels.length}
            />
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
            {isDrawing && (
                <DrawSettingsControl
                    activeShapeType={activeShapeType}
                    labels={applicableLabels}
                    selectedLabelID={labelID}
                    onChangeLabel={onChangeLabel}
                />
            )}
        </div>
    );
}
