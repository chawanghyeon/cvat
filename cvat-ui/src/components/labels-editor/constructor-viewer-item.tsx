import React from 'react';
import Text from 'antd/lib/typography/Text';

import CVATTooltip from 'components/common/cvat-tooltip';
import config from 'config';
import { EditWeakGrayIcon, TrashWeakGrayIcon } from 'icons';
import { LabelOptColor } from './common';
import { useDispatch } from 'react-redux';
import { openModal } from 'actions/modal-actions';

interface ConstructorViewerItemProps {
    label: LabelOptColor;
    color?: string;
    onUpdate: (label: LabelOptColor) => void;
    onDelete: (label: LabelOptColor) => void;
    visible?: boolean;
}

export default function ConstructorViewerItem(props: ConstructorViewerItemProps): JSX.Element {
    const { color, label, onUpdate, onDelete, visible } = props;

    const dispatch = useDispatch();

    const openUmap = () => {
        console.log('openUmap');
        dispatch(openModal('Umap', { label: label.name }));
    };

    return (
        <div style={{ background: '#000' || config.NEW_LABEL_COLOR }} className='cvat-constructor-viewer-item'>
            <svg height='8' width='8' style={{ fill: color || config.NEW_LABEL_COLOR }}>
                <circle cx='4' cy='4' r='4' strokeWidth='0' />
            </svg>

            <Text
                style={{
                    cursor: 'pointer',
                }}
                onClick={openUmap}
            >
                {label.name}
            </Text>
            {visible && (
                <>
                    <CVATTooltip title='Update attributes'>
                        <span role='button' tabIndex={0} onClick={(): void => onUpdate(label)} aria-hidden>
                            <EditWeakGrayIcon />
                        </span>
                    </CVATTooltip>
                    <CVATTooltip title='Delete label'>
                        <span role='button' tabIndex={0} onClick={(): void => onDelete(label)} aria-hidden>
                            <TrashWeakGrayIcon />
                        </span>
                    </CVATTooltip>
                </>
            )}
        </div>
    );
}
