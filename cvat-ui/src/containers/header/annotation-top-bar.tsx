import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import copy from 'copy-to-clipboard';

import {
    changeFrameAsync,
    searchAnnotationsAsync,
    searchEmptyFrameAsync,
    setForceExitAnnotationFlag as setForceExitAnnotationFlagAction,
    switchPlay,
    deleteFrameAsync,
    restoreFrameAsync,
    switchNavigationBlocked as switchNavigationBlockedAction,
} from 'actions/annotation-actions';
import AnnotationTopBarComponent from 'components/header/top-bar';
import { DimensionType } from 'cvat-core-wrapper';
import { Canvas } from 'cvat-canvas-wrapper';
import { Canvas3d } from 'cvat-canvas3d-wrapper';
import {
    CombinedState,
    FrameSpeed,
    Workspace,
} from 'reducers';
import isAbleToChangeFrame from 'utils/is-able-to-change-frame';
import GlobalHotKeys, { KeyMap } from 'utils/mousetrap-react';

interface StateToProps {
    jobInstance: any;
    frameIsDeleted: boolean;
    frameNumber: number;
    frameFilename: string;
    frameStep: number;
    frameSpeed: FrameSpeed;
    frameDelay: number;
    frameFetching: boolean;
    playing: boolean;
    canvasIsReady: boolean;
    showDeletedFrames: boolean;
    workspace: Workspace;
    keyMap: KeyMap;
    normalizedKeyMap: Record<string, string>;
    canvasInstance: Canvas | Canvas3d | null;
}

interface DispatchToProps {
    onChangeFrame(frame: number, fillBuffer?: boolean, frameStep?: number): void;
    onSwitchPlay(playing: boolean): void;
    searchAnnotations(sessionInstance: any, frameFrom: number, frameTo: number): void;
    searchEmptyFrame(sessionInstance: any, frameFrom: number, frameTo: number): void;
    setForceExitAnnotationFlag(forceExit: boolean): void;
    deleteFrame(frame: number): void;
    restoreFrame(frame: number): void;
    switchNavigationBlocked(blocked: boolean): void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            player: {
                playing,
                frame: {
                    data: { deleted: frameIsDeleted },
                    filename: frameFilename,
                    number: frameNumber,
                    delay: frameDelay,
                    fetching: frameFetching,
                },
            },
            job: { instance: jobInstance },
            canvas: { ready: canvasIsReady, instance: canvasInstance },
            workspace,
        },
        settings: {
            player: { frameSpeed, frameStep, showDeletedFrames },
        },
        shortcuts: { keyMap, normalizedKeyMap },
    } = state;

    return {
        frameIsDeleted,
        frameStep,
        frameSpeed,
        frameDelay,
        frameFetching,
        playing,
        canvasIsReady,
        frameNumber,
        frameFilename,
        jobInstance,
        showDeletedFrames,
        workspace,
        keyMap,
        normalizedKeyMap,
        canvasInstance,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        onChangeFrame(frame: number, fillBuffer?: boolean, frameStep?: number): void {
            dispatch(changeFrameAsync(frame, fillBuffer, frameStep));
        },
        onSwitchPlay(playing: boolean): void {
            dispatch(switchPlay(playing));
        },
        searchAnnotations(sessionInstance: any, frameFrom: number, frameTo: number): void {
            dispatch(searchAnnotationsAsync(sessionInstance, frameFrom, frameTo));
        },
        searchEmptyFrame(sessionInstance: any, frameFrom: number, frameTo: number): void {
            dispatch(searchEmptyFrameAsync(sessionInstance, frameFrom, frameTo));
        },
        setForceExitAnnotationFlag(forceExit: boolean): void {
            dispatch(setForceExitAnnotationFlagAction(forceExit));
        },
        deleteFrame(frame: number): void {
            dispatch(deleteFrameAsync(frame));
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
class AnnotationTopBarContainer extends React.PureComponent<Props, State> {
    private inputFrameRef: RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);
        this.inputFrameRef = React.createRef();
        this.state = {
            prevButtonType: 'regular',
            nextButtonType: 'regular',
        };
    }

    public componentDidUpdate(): void {
        this.play();
    }

    private onSwitchPlay = (): void => {
        const {
            frameNumber, jobInstance, onSwitchPlay, playing,
        } = this.props;

        if (playing) {
            onSwitchPlay(false);
        } else if (frameNumber < jobInstance.stopFrame) {
            onSwitchPlay(true);
        }
    };

    private onFirstFrame = async (): Promise<void> => {
        const {
            frameNumber, jobInstance, playing, onSwitchPlay, showDeletedFrames,
        } = this.props;

        const newFrame = showDeletedFrames ? jobInstance.startFrame :
            await jobInstance.frames.search({ notDeleted: true }, jobInstance.startFrame, frameNumber);
        if (newFrame !== frameNumber && newFrame !== null) {
            if (playing) {
                onSwitchPlay(false);
            }
            this.changeFrame(newFrame);
        }
    };

    private onBackward = async (): Promise<void> => {
        const {
            frameNumber, frameStep, jobInstance, playing, onSwitchPlay, showDeletedFrames,
        } = this.props;

        let newFrame = Math.max(jobInstance.startFrame, frameNumber - frameStep);
        if (!showDeletedFrames) {
            newFrame = await jobInstance.frames.search(
                { notDeleted: true, offset: frameStep }, frameNumber - 1, jobInstance.startFrame,
            );
        }

        if (newFrame !== frameNumber && newFrame !== null) {
            if (playing) {
                onSwitchPlay(false);
            }
            this.changeFrame(newFrame);
        }
    };

    private onPrevFrame = async (): Promise<void> => {
        const { prevButtonType } = this.state;
        const {
            frameNumber, jobInstance, playing, onSwitchPlay, showDeletedFrames,
        } = this.props;
        const { startFrame } = jobInstance;

        const frameFrom = Math.max(jobInstance.startFrame, frameNumber - 1);
        const newFrame = showDeletedFrames ? frameFrom :
            await jobInstance.frames.search({ notDeleted: true }, frameFrom, jobInstance.startFrame);
        if (newFrame !== frameNumber && newFrame !== null) {
            if (playing) {
                onSwitchPlay(false);
            }

            if (prevButtonType === 'regular') {
                this.changeFrame(newFrame);
            } else if (prevButtonType === 'filtered') {
                this.searchAnnotations(newFrame, startFrame);
            } else {
                this.searchEmptyFrame(newFrame, startFrame);
            }
        }
    };

    private onNextFrame = async (): Promise<void> => {
        const { nextButtonType } = this.state;
        const {
            frameNumber, jobInstance, playing, onSwitchPlay, showDeletedFrames,
        } = this.props;
        const { stopFrame } = jobInstance;

        const frameFrom = Math.min(jobInstance.stopFrame, frameNumber + 1);
        const newFrame = showDeletedFrames ? frameFrom :
            await jobInstance.frames.search({ notDeleted: true }, frameFrom, jobInstance.stopFrame);
        if (newFrame !== frameNumber && newFrame !== null) {
            if (playing) {
                onSwitchPlay(false);
            }

            if (nextButtonType === 'regular') {
                this.changeFrame(newFrame);
            } else if (nextButtonType === 'filtered') {
                this.searchAnnotations(newFrame, stopFrame);
            } else {
                this.searchEmptyFrame(newFrame, stopFrame);
            }
        }
    };

    private onForward = async (): Promise<void> => {
        const {
            frameNumber, frameStep, jobInstance, playing, onSwitchPlay, showDeletedFrames,
        } = this.props;
        let newFrame = Math.min(jobInstance.stopFrame, frameNumber + frameStep);
        if (!showDeletedFrames) {
            newFrame = await jobInstance.frames.search(
                { notDeleted: true, offset: frameStep }, frameNumber + 1, jobInstance.stopFrame,
            );
        }

        if (newFrame !== frameNumber && newFrame !== null) {
            if (playing) {
                onSwitchPlay(false);
            }
            this.changeFrame(newFrame);
        }
    };

    private onLastFrame = async (): Promise<void> => {
        const {
            frameNumber, jobInstance, playing, onSwitchPlay, showDeletedFrames,
        } = this.props;

        const newFrame = showDeletedFrames ? jobInstance.stopFrame :
            await jobInstance.frames.search({ notDeleted: true }, jobInstance.stopFrame, frameNumber);
        if (newFrame !== frameNumber && frameNumber !== null) {
            if (playing) {
                onSwitchPlay(false);
            }
            this.changeFrame(newFrame);
        }
    };

    private onSetPreviousButtonType = (type: 'regular' | 'filtered' | 'empty'): void => {
        this.setState({
            prevButtonType: type,
        });
    };

    private onSetNextButtonType = (type: 'regular' | 'filtered' | 'empty'): void => {
        this.setState({
            nextButtonType: type,
        });
    };

    private onChangePlayerSliderValue = (value: number): void => {
        const { playing, onSwitchPlay } = this.props;
        if (playing) {
            onSwitchPlay(false);
        }
        this.changeFrame(value);
    };

    private onChangePlayerInputValue = (value: number): void => {
        const { frameNumber, onSwitchPlay, playing } = this.props;
        if (value !== frameNumber) {
            if (playing) {
                onSwitchPlay(false);
            }
            this.changeFrame(value);
        }
    };

    private onURLIconClick = (): void => {
        const { frameNumber } = this.props;
        const { origin, pathname } = window.location;
        const url = `${origin}${pathname}?frame=${frameNumber}`;
        copy(url);
    };

    private onDeleteFrame = (): void => {
        const { deleteFrame, frameNumber } = this.props;
        deleteFrame(frameNumber);
    };

    private onRestoreFrame = (): void => {
        const { restoreFrame, frameNumber } = this.props;
        restoreFrame(frameNumber);
    };

    private play(): void {
        const {
            jobInstance,
            frameSpeed,
            frameNumber,
            frameDelay,
            frameFetching,
            playing,
            canvasIsReady,
            onSwitchPlay,
            onChangeFrame,
        } = this.props;

        if (playing && canvasIsReady && !frameFetching) {
            if (frameNumber < jobInstance.stopFrame) {
                let framesSkipped = 0;
                if (frameSpeed === FrameSpeed.Fast && frameNumber + 1 < jobInstance.stopFrame) {
                    framesSkipped = 1;
                }
                if (frameSpeed === FrameSpeed.Fastest && frameNumber + 2 < jobInstance.stopFrame) {
                    framesSkipped = 2;
                }

                setTimeout(() => {
                    const { playing: stillPlaying } = this.props;
                    if (stillPlaying) {
                        if (isAbleToChangeFrame()) {
                            onChangeFrame(frameNumber + 1 + framesSkipped, stillPlaying, framesSkipped + 1);
                        } else if (jobInstance.dimension === DimensionType.DIM_2D) {
                            onSwitchPlay(false);
                        } else {
                            setTimeout(() => this.play(), frameDelay);
                        }
                    }
                }, frameDelay);
            } else {
                onSwitchPlay(false);
            }
        }
    }

    private changeFrame(frame: number): void {
        const { onChangeFrame } = this.props;
        if (isAbleToChangeFrame()) {
            onChangeFrame(frame);
        }
    }

    private searchAnnotations(start: number, stop: number): void {
        const { jobInstance, searchAnnotations } = this.props;
        if (isAbleToChangeFrame()) {
            searchAnnotations(jobInstance, start, stop);
        }
    }

    private searchEmptyFrame(start: number, stop: number): void {
        const { jobInstance, searchEmptyFrame } = this.props;
        if (isAbleToChangeFrame()) {
            searchEmptyFrame(jobInstance, start, stop);
        }
    }

    public render(): JSX.Element {
        const { nextButtonType, prevButtonType } = this.state;
        const {
            playing,
            jobInstance,
            jobInstance: { startFrame, stopFrame },
            frameNumber,
            frameFilename,
            frameIsDeleted,
            canvasIsReady,
            keyMap,
            normalizedKeyMap,
            searchAnnotations,
            switchNavigationBlocked,
        } = this.props;
        const preventDefault = (event: KeyboardEvent | undefined): void => {
            if (event) {
                event.preventDefault();
            }
        };

        const subKeyMap = {
            NEXT_FRAME: keyMap.NEXT_FRAME,
            PREV_FRAME: keyMap.PREV_FRAME,
            FORWARD_FRAME: keyMap.FORWARD_FRAME,
            BACKWARD_FRAME: keyMap.BACKWARD_FRAME,
            SEARCH_FORWARD: keyMap.SEARCH_FORWARD,
            SEARCH_BACKWARD: keyMap.SEARCH_BACKWARD,
            PLAY_PAUSE: keyMap.PLAY_PAUSE,
            FOCUS_INPUT_FRAME: keyMap.FOCUS_INPUT_FRAME,
        };

        const handlers = {
            NEXT_FRAME: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                if (canvasIsReady) {
                    this.onNextFrame();
                }
            },
            PREV_FRAME: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                if (canvasIsReady) {
                    this.onPrevFrame();
                }
            },
            FORWARD_FRAME: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                if (canvasIsReady) {
                    this.onForward();
                }
            },
            BACKWARD_FRAME: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                if (canvasIsReady) {
                    this.onBackward();
                }
            },
            SEARCH_FORWARD: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                if (frameNumber + 1 <= stopFrame && canvasIsReady && isAbleToChangeFrame()) {
                    searchAnnotations(jobInstance, frameNumber + 1, stopFrame);
                }
            },
            SEARCH_BACKWARD: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                if (frameNumber - 1 >= startFrame && canvasIsReady && isAbleToChangeFrame()) {
                    searchAnnotations(jobInstance, frameNumber - 1, startFrame);
                }
            },
            PLAY_PAUSE: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                this.onSwitchPlay();
            },
            FOCUS_INPUT_FRAME: (event: KeyboardEvent | undefined) => {
                preventDefault(event);
                if (this.inputFrameRef.current) {
                    this.inputFrameRef.current.focus();
                }
            },
        };

        return (
            <>
                <GlobalHotKeys keyMap={subKeyMap} handlers={handlers} />
                <AnnotationTopBarComponent
                    onSwitchPlay={this.onSwitchPlay}
                    onPrevFrame={this.onPrevFrame}
                    onNextFrame={this.onNextFrame}
                    onForward={this.onForward}
                    onBackward={this.onBackward}
                    onFirstFrame={this.onFirstFrame}
                    onLastFrame={this.onLastFrame}
                    setNextButtonType={this.onSetNextButtonType}
                    setPrevButtonType={this.onSetPreviousButtonType}
                    onSliderChange={this.onChangePlayerSliderValue}
                    onInputChange={this.onChangePlayerInputValue}
                    onURLIconClick={this.onURLIconClick}
                    onDeleteFrame={this.onDeleteFrame}
                    onRestoreFrame={this.onRestoreFrame}
                    switchNavigationBlocked={switchNavigationBlocked}
                    playing={playing}
                    startFrame={startFrame}
                    stopFrame={stopFrame}
                    frameNumber={frameNumber}
                    frameFilename={frameFilename}
                    frameDeleted={frameIsDeleted}
                    inputFrameRef={this.inputFrameRef}
                    playPauseShortcut={normalizedKeyMap.PLAY_PAUSE}
                    nextFrameShortcut={normalizedKeyMap.NEXT_FRAME}
                    previousFrameShortcut={normalizedKeyMap.PREV_FRAME}
                    forwardShortcut={normalizedKeyMap.FORWARD_FRAME}
                    backwardShortcut={normalizedKeyMap.BACKWARD_FRAME}
                    nextButtonType={nextButtonType}
                    prevButtonType={prevButtonType}
                    focusFrameInputShortcut={normalizedKeyMap.FOCUS_INPUT_FRAME}
                    jobInstance={jobInstance}
                />
            </>
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AnnotationTopBarContainer));
