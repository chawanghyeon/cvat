import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CombinedState, ObjectType } from 'reducers';
import Text from 'antd/lib/typography/Text';
import Modal from 'antd/lib/modal';

import config from 'config';
import { removeObjectAsync, removeObject as removeObjectAction } from 'actions/annotation-actions';

export default function RemoveConfirmComponent(): JSX.Element | null {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState<JSX.Element>(<></>);
    const objectState = useSelector((state: CombinedState) => state.annotation.remove.objectState);
    const { activatedStateID, states } = useSelector((state: CombinedState) => state.annotation.annotations);
    const { workspace } = useSelector((state: CombinedState) => state.annotation);
    const force = useSelector((state: CombinedState) => state.annotation.remove.force);
    const jobInstance = useSelector((state: CombinedState) => state.annotation.job.instance);
    const dispatch = useDispatch();

    const onOk = useCallback(() => {
        dispatch(removeObjectAsync(jobInstance, objectState, true));
    }, [jobInstance, objectState]);

    const onCancel = useCallback(() => {
        dispatch(removeObjectAction(null, false));
    }, []);
    // front-custom key function active label delete
    const keyFunction = (e: KeyboardEvent): void => {
        if (
            (e.key === 'p' || e.code === 'keyP') &&
            workspace === 'Standard' &&
            activatedStateID &&
            states &&
            !e.ctrlKey &&
            !e.altKey &&
            !e.shiftKey
        ) {
            const filterdState = states.filter((s) => s.clientID === activatedStateID);
            if (filterdState[0]) {
                dispatch(removeObjectAction(filterdState[0], true));
                setTimeout(() => {
                    dispatch(removeObjectAsync(jobInstance, filterdState[0], true));
                }, 100);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', keyFunction);
        return () => window.removeEventListener('keydown', keyFunction);
    }, [activatedStateID, states, workspace]);

    useEffect(() => {
        const newVisible =
            (!!objectState && !force && objectState.lock) || (objectState?.objectType === ObjectType.TRACK && !force);
        setTitle(objectState?.lock ? 'Object is locked' : 'Remove object');
        let descriptionMessage: string | JSX.Element = 'Are you sure you want to remove it?';

        if (objectState?.objectType === ObjectType.TRACK && !force) {
            descriptionMessage = (
                <>
                    <Text>
                        {`The object you are trying to remove is a track.
                            If you continue, it removes many drawn objects on different frames.
                            If you want to hide it only on this frame, use the outside feature instead.
                            ${descriptionMessage}`}
                    </Text>
                    <div className='cvat-remove-object-confirm-wrapper'>
                        {/* eslint-disable-next-line */}
                        <img src={config.OUTSIDE_PIC_URL} />
                    </div>
                </>
            );
        }

        setDescription(descriptionMessage);
        setVisible(newVisible);
        if (!newVisible && objectState) {
            dispatch(removeObjectAsync(jobInstance, objectState, true));
        }
    }, [objectState, force]);

    return (
        <Modal
            okType='primary'
            okText='Yes'
            cancelText='Cancel'
            title={title}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            className='cvat-modal-confirm'
        >
            <div>{description}</div>
        </Modal>
    );
}
