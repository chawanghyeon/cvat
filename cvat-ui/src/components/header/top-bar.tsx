import React, { RefObject } from 'react';
import PlayerButtons from './top-bar/player-buttons';
import PlayerNavigation from './top-bar/player-navigation';

interface Props {
    playing: boolean;
    frameNumber: number;
    frameFilename: string;
    frameDeleted: boolean;
    inputFrameRef: RefObject<HTMLInputElement>;
    startFrame: number;
    stopFrame: number;
    playPauseShortcut: string;
    nextFrameShortcut: string;
    previousFrameShortcut: string;
    forwardShortcut: string;
    backwardShortcut: string;
    prevButtonType: string;
    nextButtonType: string;
    focusFrameInputShortcut: string;
    jobInstance: any;
    onSwitchPlay(): void;
    onPrevFrame(): void;
    onNextFrame(): void;
    onForward(): void;
    onBackward(): void;
    onFirstFrame(): void;
    onLastFrame(): void;
    setPrevButtonType(type: 'regular' | 'filtered' | 'empty'): void;
    setNextButtonType(type: 'regular' | 'filtered' | 'empty'): void;
    onSliderChange(value: number): void;
    onInputChange(value: number): void;
    onURLIconClick(): void;
    onDeleteFrame(): void;
    onRestoreFrame(): void;
    switchNavigationBlocked(blocked: boolean): void;
}

export default function AnnotationTopBarComponent(props: Props): JSX.Element {
    const {
        playing,
        frameNumber,
        frameFilename,
        frameDeleted,
        inputFrameRef,
        startFrame,
        stopFrame,
        playPauseShortcut,
        nextFrameShortcut,
        previousFrameShortcut,
        forwardShortcut,
        backwardShortcut,
        prevButtonType,
        nextButtonType,
        focusFrameInputShortcut,
        onSwitchPlay,
        onPrevFrame,
        onNextFrame,
        onForward,
        onBackward,
        onFirstFrame,
        onLastFrame,
        setPrevButtonType,
        setNextButtonType,
        onSliderChange,
        onInputChange,
        onURLIconClick,
        onDeleteFrame,
        onRestoreFrame,
        switchNavigationBlocked,
    } = props;

    return (
        <>
            <PlayerButtons
                playing={playing}
                playPauseShortcut={playPauseShortcut}
                nextFrameShortcut={nextFrameShortcut}
                previousFrameShortcut={previousFrameShortcut}
                forwardShortcut={forwardShortcut}
                backwardShortcut={backwardShortcut}
                prevButtonType={prevButtonType}
                nextButtonType={nextButtonType}
                onPrevFrame={onPrevFrame}
                onNextFrame={onNextFrame}
                onForward={onForward}
                onBackward={onBackward}
                onFirstFrame={onFirstFrame}
                onLastFrame={onLastFrame}
                onSwitchPlay={onSwitchPlay}
                setPrevButton={setPrevButtonType}
                setNextButton={setNextButtonType}
            />
            <PlayerNavigation
                startFrame={startFrame}
                stopFrame={stopFrame}
                playing={playing}
                frameNumber={frameNumber}
                frameFilename={frameFilename}
                frameDeleted={frameDeleted}
                focusFrameInputShortcut={focusFrameInputShortcut}
                inputFrameRef={inputFrameRef}
                onSliderChange={onSliderChange}
                onInputChange={onInputChange}
                onURLIconClick={onURLIconClick}
                onDeleteFrame={onDeleteFrame}
                onRestoreFrame={onRestoreFrame}
                switchNavigationBlocked={switchNavigationBlocked}
            />
        </>
    );
}
