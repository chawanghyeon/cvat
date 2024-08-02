import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Modal from 'antd/lib/modal';
import InputNumber from 'antd/lib/input-number';
import Text from 'antd/lib/typography/Text';
import { clamp } from 'utils/math';
import { Slider } from 'antd';
import { propagateObjectAsync, switchPropagateVisibility } from 'actions/annotation-actions';
import { CombinedState } from 'reducers';

export enum PropagateDirection {
    FORWARD = 'forward',
    BACKWARD = 'backward',
}

function PropagateConfirmComponent(): JSX.Element {
    const dispatch = useDispatch();
    const visible = useSelector((state: CombinedState) => state.annotation.propagate.visible);
    const frameNumber = useSelector((state: CombinedState) => state.annotation.player.frame.number);
    const startFrame = useSelector((state: CombinedState) => state.annotation.job.instance.startFrame);
    const stopFrame = useSelector((state: CombinedState) => state.annotation.job.instance.stopFrame);
    const [targetFrame, setTargetFrame] = useState<number>(frameNumber);

    const propagateFrames = Math.abs(targetFrame - frameNumber);

    return (
        <Modal
            okType='primary'
            okText='확인'
            cancelText='취소'
            onOk={() => {
                dispatch(propagateObjectAsync(frameNumber, targetFrame))
                    .then(() => dispatch(switchPropagateVisibility(false)));
            }}
            onCancel={() => dispatch(switchPropagateVisibility(false))}
            title='Confirm propagate'
            open={visible}
            destroyOnClose
            okButtonProps={{ disabled: !propagateFrames }}
            className='cvat-propagate-confirm'
        >
            <Slider
                range={{ draggableTrack: true }}
                value={[frameNumber, targetFrame] as [number, number]}
                onChange={([value1, value2]: [number, number]) => {
                    const value = value1 === frameNumber || value1 === targetFrame ? value2 : value1;
                    if (value < frameNumber) {
                        setTargetFrame(clamp(value, startFrame, frameNumber));
                    } else {
                        setTargetFrame(clamp(value, frameNumber, stopFrame));
                    }
                }}
                min={startFrame}
                max={stopFrame}
            />
            <Text>Specify a range where copies will be created</Text>
            <InputNumber
                className='cvat-propagate-confirm-object-on-frames'
                size='small'
                min={startFrame}
                max={stopFrame}
                value={targetFrame}
                disabled
                controls={false}
                onChange={(value: number | null) => {
                    if (typeof value !== 'undefined' && value !== null) {
                        if (value > frameNumber) {
                            setTargetFrame(clamp(+value, frameNumber, stopFrame));
                        } else if (value < frameNumber) {
                            setTargetFrame(clamp(+value, startFrame, frameNumber));
                        } else {
                            setTargetFrame(frameNumber);
                        }
                    }
                }}
            />
        </Modal>
    );
}

export default React.memo(PropagateConfirmComponent);
