import React, { useState } from 'react';
import { Row, Col } from 'antd/lib/grid';
import Button from 'antd/lib/button';
import Text from 'antd/lib/typography/Text';
import Icon from '@ant-design/icons';

import CVATTooltip from 'components/common/cvat-tooltip';
import {
    EyeIcon, EyeOffIcon, LockIcon, UnlockIcon,
} from 'icons';
import { Modal } from 'antd';
import { MemoizedContent } from './label-key-selector-popover';

interface Props {
    labelName: string;
    labelColor: string;
    labelID: number;
    visible: boolean;
    statesHidden: boolean;
    statesLocked: boolean;
    keyToLabelMapping: Record<string, number>;
    hideStates(): void;
    showStates(): void;
    lockStates(): void;
    unlockStates(): void;
    updateLabelShortcutKey(updatedKey: string, labelID: number): void;
}

function LabelItemComponent(props: Props): JSX.Element {
    const {
        labelName,
        labelColor,
        labelID,
        keyToLabelMapping,
        visible,
        statesHidden,
        statesLocked,
        hideStates,
        showStates,
        lockStates,
        unlockStates,
        updateLabelShortcutKey,
    } = props;

    // create reversed mapping just to receive key easily
    const labelToKeyMapping: Record<string, string> = Object.fromEntries(
        Object.entries(keyToLabelMapping).map(([key, _labelID]) => [_labelID, key]),
    );
    const labelShortcutKey = labelToKeyMapping[labelID] || '?';
    const classes = {
        lock: {
            enabled: { className: 'cvat-label-item-button-lock cvat-label-item-button-lock-enabled' },
            disabled: { className: 'cvat-label-item-button-lock' },
        },
        hidden: {
            enabled: { className: 'cvat-label-item-button-hidden cvat-label-item-button-hidden-enabled' },
            disabled: { className: 'cvat-label-item-button-hidden' },
        },
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = (): void => {
        setIsModalOpen(true);
    };

    return (
        <Row
            align='stretch'
            justify='space-around'
            className={[
                'cvat-objects-sidebar-label-item',
                visible ? '' : 'cvat-objects-sidebar-label-item-disabled',
            ].join(' ')}
        >
            <Col span={3}>
                <div style={{ background: labelColor }} className='cvat-label-item-color'>
                    <div
                        className={visible ? '' : 'cvat-label-item-color-disabled'}
                        style={{ borderColor: labelColor }}
                    >
                        {' '}
                    </div>
                </div>
            </Col>
            <Col span={10}>
                <CVATTooltip title={labelName}>
                    <Text className='cvat-text'>
                        {labelName}
                    </Text>
                </CVATTooltip>
            </Col>
            <Col span={4}>
                <Button className='cvat-label-item-setup-shortcut-button' size='small' onClick={showModal}>
                    {labelShortcutKey}
                </Button>
            </Col>
            <Col span={3}>
                {statesLocked ? (
                    <Icon {...classes.lock.enabled} component={LockIcon} onClick={unlockStates} />
                ) : (
                    <Icon {...classes.lock.disabled} component={UnlockIcon} onClick={lockStates} />
                )}
            </Col>
            <Col span={3}>
                {statesHidden ? (
                    <Icon {...classes.hidden.enabled} component={EyeOffIcon} onClick={showStates} />
                ) : (
                    <Icon {...classes.hidden.disabled} component={EyeIcon} onClick={hideStates} />
                )}
            </Col>
            <Modal
                title='Label shortcut'
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width='fit-content'
            >
                <MemoizedContent
                    keyToLabelMapping={keyToLabelMapping}
                    labelID={labelID}
                    updateLabelShortcutKey={updateLabelShortcutKey}
                />
            </Modal>
        </Row>
    );
}

export default React.memo(LabelItemComponent);
