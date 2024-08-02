import { connect } from 'react-redux';
import { KeyMap } from 'utils/mousetrap-react';
import { CuboidDrawingMethod, RectDrawingMethod } from 'cvat-canvas-wrapper';
import { Canvas3d } from 'cvat-canvas3d-wrapper';
import {
    groupObjects,
    splitTrack,
    mergeObjects,
    pasteShapeAsync,
    redrawShapeAsync,
    rememberObject,
    repeatDrawShapeAsync,
    resetAnnotationsGroup,
} from 'actions/annotation-actions';
import ControlsSideBarComponent from 'components/annotation-page/standard3D-workspace/controls-side-bar/controls-side-bar';
import { ActiveControl, CombinedState, ObjectType, ShapeType } from 'reducers';

interface StateToProps {
    canvasInstance: Canvas3d | null;
    activeControl: ActiveControl;
    keyMap: KeyMap;
    normalizedKeyMap: Record<string, string>;
    labels: any[];
    jobInstance: any;
    activeShapeType: ShapeType;
    selectedLabelID: number;
}

interface DispatchToProps {
    repeatDrawShape(): void;
    redrawShape(): void;
    pasteShape(): void;
    resetGroup(): void;
    groupObjects(enabled: boolean): void;
    onDrawStart(
        shapeType: ShapeType,
        labelID: number,
        objectType: ObjectType,
        points?: number,
        rectDrawingMethod?: RectDrawingMethod,
        cuboidDrawingMethod?: CuboidDrawingMethod,
    ): void;
    mergeObjects(enabled: boolean): void;
    splitTrack(enabled: boolean): void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            canvas: { instance: canvasInstance, activeControl },
            drawing: { activeShapeType, activeLabelID },
            job: { labels, instance: jobInstance },
        },
        shortcuts: { keyMap, normalizedKeyMap },
    } = state;

    const selectedLabelID = activeLabelID ?? labels[0].id;

    return {
        canvasInstance: canvasInstance as Canvas3d,
        activeControl,
        normalizedKeyMap,
        keyMap,
        labels,
        jobInstance,
        activeShapeType,
        selectedLabelID,
    };
}

function dispatchToProps(dispatch: any): DispatchToProps {
    return {
        repeatDrawShape(): void {
            dispatch(repeatDrawShapeAsync());
        },
        redrawShape(): void {
            dispatch(redrawShapeAsync());
        },
        pasteShape(): void {
            dispatch(pasteShapeAsync());
        },
        groupObjects(enabled: boolean): void {
            dispatch(groupObjects(enabled));
        },
        resetGroup(): void {
            dispatch(resetAnnotationsGroup());
        },
        onDrawStart(
            shapeType: ShapeType,
            labelID: number,
            objectType: ObjectType,
            points?: number,
            rectDrawingMethod?: RectDrawingMethod,
            cuboidDrawingMethod?: CuboidDrawingMethod,
        ): void {
            dispatch(
                rememberObject({
                    activeObjectType: objectType,
                    activeShapeType: shapeType,
                    activeLabelID: labelID,
                    activeNumOfPoints: points,
                    activeRectDrawingMethod: rectDrawingMethod,
                    activeCuboidDrawingMethod: cuboidDrawingMethod,
                }),
            );
        },
        mergeObjects(enabled: boolean): void {
            dispatch(mergeObjects(enabled));
        },
        splitTrack(enabled: boolean): void {
            dispatch(splitTrack(enabled));
        },
    };
}

export default connect(mapStateToProps, dispatchToProps)(ControlsSideBarComponent);
