import React from 'react';
import { Row, Col } from 'antd/lib/grid';
import Button from 'antd/lib/button';
import Text from 'antd/lib/typography/Text';

import LabelSelector from 'components/label-selector/label-selector';
import CVATTooltip from 'components/common/cvat-tooltip';

interface Props {
    labels: any[];
    selectedLabelID: number | null;
    repeatShapeShortcut: string;
    onChangeLabel(value: string): void;
    onSetup(): void;
}

function SetupTagPopover(props: Props): JSX.Element {
    const {
        labels, selectedLabelID, repeatShapeShortcut, onChangeLabel, onSetup,
    } = props;

    return (
        <div id='cvat-setup-tag-popover-content'>
            <Row justify='start'>
                <Col>
                    <Text className='cvat-text-color popover-title' strong>
                        Setup tag
                    </Text>
                </Col>
            </Row>
            <Row justify='start'>
                <Col span={8}>
                    <Text className='cvat-text-color'>Label</Text>
                </Col>
                <Col span={16}>
                    <LabelSelector
                        labels={labels}
                        value={selectedLabelID}
                        onChange={onChangeLabel}
                        onEnterPress={() => onSetup()}
                        style={{ width: '100%' }}
                    />
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <CVATTooltip title={`Press ${repeatShapeShortcut} to add a tag again`} placement='bottom'>
                        <Button
                            type='primary'
                            className='cvat-add-tag-button'
                            onClick={() => onSetup()}
                            style={{ width: '100%' }}
                        >
                            Generate
                        </Button>
                    </CVATTooltip>
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(SetupTagPopover);
