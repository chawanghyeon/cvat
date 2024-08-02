import React from 'react';
import { PlusIcon } from 'icons';
import Button from 'antd/lib/button';
import Text from 'antd/lib/typography/Text';

import { useTranslation } from 'react-i18next';
import ConstructorViewerItem from './constructor-viewer-item';
import { LabelOptColor } from './common';

interface ConstructorViewerProps {
    labels: LabelOptColor[];
    onUpdate: (label: LabelOptColor) => void;
    onDelete: (label: LabelOptColor) => void;
    onCreate: (creatorType: 'basic' | 'skeleton') => void;
    visible?: boolean;
}

function ConstructorViewer(props: ConstructorViewerProps): JSX.Element {
    const { onCreate, onUpdate, onDelete, labels, visible } = props;

    const { t } = useTranslation();
    const style: React.CSSProperties = visible ? {} : { display: 'none' };

    const list = [
        <Button
            key='create'
            type='primary'
            icon={<PlusIcon />}
            onClick={() => onCreate('basic')}
            className='cvat-constructor-viewer-new-item'
            style={style}
        >
            {t('projects.button.addLabel')}
        </Button>,
        <Button
            key='create_skeleton'
            type='primary'
            icon={<PlusIcon />}
            onClick={() => onCreate('skeleton')}
            className='cvat-constructor-viewer-new-skeleton-item'
            style={style}
        >
            {t('projects.button.setupSkeleton')}
        </Button>,
    ];
    for (const label of labels) {
        list.push(
            <ConstructorViewerItem
                onUpdate={onUpdate}
                onDelete={onDelete}
                label={label}
                key={label.id}
                color={label.color}
                visible={visible}
            />,
        );
    }

    return (
        <div className='cvat-constructor-viewer'>
            {!visible && (
                <Text style={{ width: '100%' }} type='secondary'>
                    {t('tasks.constructor.description')}
                </Text>
            )}
            {list}
        </div>
    );
}

export default React.memo(ConstructorViewer);
