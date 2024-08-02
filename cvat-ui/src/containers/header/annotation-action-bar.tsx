import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import {
    redoActionAsync,
    saveAnnotationsAsync,
    setForceExitAnnotationFlag as setForceExitAnnotationFlagAction,
    undoActionAsync,
    restoreFrameAsync,
    switchNavigationBlocked as switchNavigationBlockedAction,
} from 'actions/annotation-actions';
import { Canvas } from 'cvat-canvas-wrapper';
import { Canvas3d } from 'cvat-canvas3d-wrapper';
import {
    CombinedState,
    ActiveControl,
    ToolsBlockerState,
} from 'reducers';
import isAbleToChangeFrame from 'utils/is-able-to-change-frame';
import GlobalHotKeys, { KeyMap } from 'utils/mousetrap-react';
import { switchToolsBlockerState } from 'actions/settings-actions';
import AnnotationActionBarComponent from 'components/header/action-bar';
import { updateJobAsync } from 'actions/tasks-actions';

interface StateToProps {
    jobInstance: any;
    frameNumber: number;
    saving: boolean;
    canvasIsReady: boolean;
    undoAction?: string;
    redoAction?: string;
    autoSave: boolean;
    autoSaveInterval: number;
    toolsBlockerState: ToolsBlockerState;
    keyMap: KeyMap;
    normalizedKeyMap: Record<string, string>;
    canvasInstance: Canvas | Canvas3d | null;
    forceExit: boolean;
    activeControl: ActiveControl;
}

interface DispatchToProps {
    onSaveAnnotation(sessionInstance: any): void;
    onCompleteAnnotation(sessionInstance: any, afterSave: any): void;
    onJobUpdate(jobInstance: any, stage: string): void;
    onJobStateUpdate(jobInstance: any, state: string): void;
    undo(sessionInstance: any, frameNumber: any): void;
    redo(sessionInstance: any, frameNumber: any): void;
    setForceExitAnnotationFlag(forceExit: boolean): void;
    onSwitchToolsBlockerState(toolsBlockerState: ToolsBlockerState): void;
    restoreFrame(frame: number): void;
    switchNavigationBlocked(blocked: boolean): void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            player: {
                frame: {
                    number: frameNumber,
                },
            },
            annotations: {
                saving: { uploading: saving, forceExit },
                history,
            },
            job: { instance: jobInstance },
            canvas: { ready: canvasIsReady, instance: canvasInstance, activeControl },
        },
        settings: {
            workspace: {
                autoSave,
                autoSaveInterval,
                toolsBlockerState,
            },
        },
        shortcuts: { keyMap, normalizedKeyMap },
    } = state;

    return {
        canvasIsReady,
        saving,
        frameNumber,
        jobInstance,
        undoAction: history.undo.length ? history.undo[history.undo.length - 1][0] : undefined,
        redoAction: history.redo.length ? history.redo[history.redo.length - 1][0] : undefined,
        autoSave,
        autoSaveInterval,
        toolsBlockerState,
        keyMap,
        normalizedKeyMap,
        canvasInstance,
        forceExit,
        activeControl,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        onSaveAnnotation(sessionInstance: any): void {
            dispatch(saveAnnotationsAsync(sessionInstance));
        },
        onCompleteAnnotation(sessionInstance: any, afterSave: any): void {
            dispatch(saveAnnotationsAsync(sessionInstance, afterSave));
        },
        onJobUpdate(jobInstance: any, stage: string): void {
            jobInstance.stage = stage;
            dispatch(updateJobAsync(jobInstance));
        },
        onJobStateUpdate(jobInstance: any, state: string): void {
            jobInstance.state = state;
            dispatch(updateJobAsync(jobInstance));
        },
        undo(sessionInstance: any, frameNumber: any): void {
            dispatch(undoActionAsync(sessionInstance, frameNumber));
        },
        redo(sessionInstance: any, frameNumber: any): void {
            dispatch(redoActionAsync(sessionInstance, frameNumber));
        },
        setForceExitAnnotationFlag(forceExit: boolean): void {
            dispatch(setForceExitAnnotationFlagAction(forceExit));
        },
        onSwitchToolsBlockerState(toolsBlockerState: ToolsBlockerState): void {
            dispatch(switchToolsBlockerState(toolsBlockerState));
        },
        restoreFrame(frame: number): void {
            dispatch(restoreFrameAsync(frame));
        },
        switchNavigationBlocked(blocked: boolean): void {
            dispatch(switchNavigationBlockedAction(blocked));
        },
    };
}

interface State {
    prevButtonType: 'regular' | 'filtered' | 'empty';
    nextButtonType: 'regular' | 'filtered' | 'empty';
}

type Props = StateToProps & DispatchToProps & RouteComponentProps;
class AnnotationActionBarContainer extends React.PureComponent<Props, State> {
    private autoSaveInterval: number | undefined;
    private unblock: any;

    public componentDidMount(): void {
        const {
            autoSaveInterval, history, jobInstance, setForceExitAnnotationFlag,
        } = this.props;
        this.autoSaveInterval = window.setInterval(this.autoSave.bind(this), autoSaveInterval);

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        this.unblock = history.block((location: any) => {
            const { forceExit } = self.props;
            const { id: jobID, taskId: taskID } = jobInstance;

            if (
                jobInstance.annotations.hasUnsavedChanges() &&
                location.pathname !== `/tasks/${taskID}/jobs/${jobID}` &&
                !forceExit
            ) {
                return 'You have unsaved changes, please confirm leaving this page.';
            }

            if (forceExit) {
                setForceExitAnnotationFlag(false);
            }

            return undefined;
        });

        window.addEventListener('beforeunload', this.beforeUnloadCallback);
    }

    public componentDidUpdate(prevProps: Props): void {
        const { autoSaveInterval } = this.props;

        if (autoSaveInterval !== prevProps.autoSaveInterval) {
            if (this.autoSaveInterval) window.clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = window.setInterval(this.autoSave.bind(this), autoSaveInterval);
        }
    }

    public componentWillUnmount(): void {
        window.clearInterval(this.autoSaveInterval);
        window.removeEventListener('beforeunload', this.beforeUnloadCallback);
        this.unblock();
    }

    private undo = (): void => {
        const { undo, jobInstance, frameNumber } = this.props;

        if (isAbleToChangeFrame()) {
            undo(jobInstance, frameNumber);
        }
    };

    private redo = (): void => {
        const { redo, jobInstance, frameNumber } = this.props;

        if (isAbleToChangeFrame()) {
            redo(jobInstance, frameNumber);
        }
    };

    private onSaveAnnotation = (): void => {
        const { onSaveAnnotation, jobInstance } = this.props;
        onSaveAnnotation(jobInstance);
    };

    private onCompleteAnnotation = (): void => {
        const { onCompleteAnnotation, jobInstance, history } = this.props;
        onCompleteAnnotation(jobInstance, () => history.push('/jobs'));
    };

    private onJobUpdate = (stage: string): void => {
        const { onJobUpdate, jobInstance } = this.props;
        onJobUpdate(jobInstance, stage);
    };

    private onJobStateUpdate = (state: string): void => {
        const { onJobStateUpdate, jobInstance } = this.props;
        onJobStateUpdate(jobInstance, state);
    };

    private onFinishDraw = (): void => {
        const { activeControl, canvasInstance } = this.props;
        if (
            [ActiveControl.AI_TOOLS, ActiveControl.OPENCV_TOOLS].includes(activeControl) &&
            canvasInstance instanceof Canvas
        ) {
            canvasInstance.interact({ enabled: false });
            return;
        }

        if (canvasInstance != null) {
            canvasInstance.draw({ enabled: false });
        }
    };

    private onSwitchToolsBlockerState = (): void => {
        const {
            toolsBlockerState, onSwitchToolsBlockerState, canvasInstance, activeControl,
        } = this.props;
        if (canvasInstance instanceof Canvas) {
            if (activeControl.includes(ActiveControl.OPENCV_TOOLS)) {
                canvasInstance.interact({
                    enabled: true,
                    crosshair: toolsBlockerState.algorithmsLocked,
                    enableThreshold: toolsBlockerState.algorithmsLocked,
                });
            }
        }
        onSwitchToolsBlockerState({ algorithmsLocked: !toolsBlockerState.algorithmsLocked });
    };

    private beforeUnloadCallback = (event: BeforeUnloadEvent): string | undefined => {
        const { jobInstance, forceExit, setForceExitAnnotationFlag } = this.props;
        if (jobInstance.annotations.hasUnsavedChanges() && !forceExit) {
            const confirmationMessage = 'You have unsaved changes, please confirm leaving this page.';
            // eslint-disable-next-line no-param-reassign
            event.returnValue = confirmationMessage;
            return confirmationMessage;
        }

        if (forceExit) {
            setForceExitAnnotationFlag(false);
        }
        return undefined;
    };

    private autoSave(): void {
        const { autoSave, saving } = this.props;

        if (autoSave && !saving) {
            this.onSaveAnnotation();
        }
    }

    public render(): JSX.Element {
        const {
            saving,
            undoAction,
            redoAction,
            keyMap,
            normalizedKeyMap,
            activeControl,
            toolsBlockerState,
            jobInstance,
        } = this.props;

        const preventDefault = (event: KeyboardEvent | undefined): void => {
            if (event) {
                event.preventDefault();
            }
        };

        const subKeyMap = {
            SAVE_JOB: keyMap.SAVE_JOB,
            UNDO: keyMap.UNDO,
            REDO: keyMap.REDO,
        };

        const handlers = {
            UNDO: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                if (undoAction) {
                    this.undo();
                }
            },
            REDO: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                if (redoAction) {
                    this.redo();
                }
            },
            SAVE_JOB: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                if (!saving) {
                    this.onSaveAnnotation();
                }
            },
        };

        return (
            <>
                <GlobalHotKeys keyMap={subKeyMap} handlers={handlers} />
                <AnnotationActionBarComponent
                    anntationStatus={jobInstance.stage}
                    anntationState={jobInstance.state}
                    saving={saving}
                    undoAction={undoAction}
                    redoAction={redoAction}
                    saveShortcut={normalizedKeyMap.SAVE_JOB}
                    undoShortcut={normalizedKeyMap.UNDO}
                    redoShortcut={normalizedKeyMap.REDO}
                    drawShortcut={normalizedKeyMap.SWITCH_DRAW_MODE}
                    switchToolsBlockerShortcut={normalizedKeyMap.SWITCH_TOOLS_BLOCKER_STATE}
                    activeControl={activeControl}
                    toolsBlockerState={toolsBlockerState}
                    onSaveAnnotation={this.onSaveAnnotation}
                    onCompleteAnnotation={this.onCompleteAnnotation}
                    onJobUpdate={this.onJobUpdate}
                    onJobStateUpdate={this.onJobStateUpdate}
                    onUndoClick={this.undo}
                    onRedoClick={this.redo}
                    onFinishDraw={this.onFinishDraw}
                    onSwitchToolsBlockerState={this.onSwitchToolsBlockerState}
                />
            </>
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AnnotationActionBarContainer));
