import React, { useState, useEffect, RefObject } from 'react';
import { Col } from 'antd/lib/grid';
import Slider from 'antd/lib/slider';
import InputNumber from 'antd/lib/input-number';
import { clamp } from 'utils/math';

interface Props {
    startFrame: number;
    stopFrame: number;
    playing: boolean;
    frameNumber: number;
    frameFilename: string;
    frameDeleted: boolean;
    focusFrameInputShortcut: string;
    inputFrameRef: RefObject<HTMLInputElement>;
    onSliderChange(value: number): void;
    onInputChange(value: number): void;
    onURLIconClick(): void;
    onDeleteFrame(): void;
    onRestoreFrame(): void;
    switchNavigationBlocked(blocked: boolean): void;
}

function PlayerNavigation(props: Props): JSX.Element {
    const {
        startFrame,
        stopFrame,
        frameNumber,
        frameFilename,
        inputFrameRef,
        onSliderChange,
        onInputChange,
    } = props;

    const [frameInputValue, setFrameInputValue] = useState<number>(frameNumber);
    useEffect(() => {
        if (frameNumber !== frameInputValue) {
            setFrameInputValue(frameNumber);
        }
    }, [frameNumber]);

    return (
        <>
            <Col className='cvat-player-controls'>
                <Slider
                    className='cvat-player-slider'
                    min={startFrame}
                    max={stopFrame}
                    value={frameNumber || 0}
                    onChange={onSliderChange}
                    tooltip={{ open: false }}
                    trackStyle={{ backgroundColor: '#3B00AB' }}
                    handleStyle={{ borderColor: '#3B00AB' }}
                />
                <InputNumber
                    ref={inputFrameRef}
                    className='cvat-player-frame-selector'
                    type='number'
                    value={frameInputValue}
                    controls={false}
                    onChange={(value: number | undefined | string | null) => {
                        if (typeof value !== 'undefined' && value !== null) {
                            setFrameInputValue(Math.floor(clamp(+value, startFrame, stopFrame)));
                        }
                    }}
                    onBlur={() => {
                        onInputChange(frameInputValue);
                    }}
                    onPressEnter={() => {
                        onInputChange(frameInputValue);
                    }}
                />
                <span>
                    {' / '}
                    {stopFrame}
                </span>
                <span style={{ fontSize: 12, color: '#ACACB5' }}>
                    {frameFilename.length > 25 ?
                        (`..${frameFilename.substring(25, frameFilename.length)}`) :
                        frameFilename}
                </span>
            </Col>
        </>
    );
}

export default React.memo(PlayerNavigation);
