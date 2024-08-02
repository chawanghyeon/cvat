import React from 'react';
import Text from 'antd/lib/typography/Text';
import { CheckCircleOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';

import { Canvas, CuboidDrawingMethod, RectDrawingMethod } from 'cvat-canvas-wrapper';
import { ActiveControl, ObjectType, ShapeType } from 'reducers';

import {
    Button, Col, Divider, InputNumber, Radio, RadioChangeEvent, Row, Switch,
} from 'antd';
import LabelSelector from 'components/label-selector/label-selector';
import { clamp } from 'utils/math';
import { Label } from 'cvat-core-wrapper';

export interface Props {
    activeShapeType: ShapeType;
    labels: any[];
    selectedLabelID: number | null;
    onChangeLabel(value: Label | null): void;
}

function DrawSettingsControl(props: Props): JSX.Element {
    const {
        activeShapeType,
        labels,
        selectedLabelID,
        onChangeLabel,
    } = props;

    const labelsByShapeType: Label[] = activeShapeType === ShapeType.SKELETON ?
        labels.filter((label: any) => label.type === 'skeleton') :
        labels.filter((label: any) => label.type === 'any' && !label.hasParent);

    return (
        <div className='cvat-drawing-setting-panel'>
            <Row align='middle' className='label-setting'>
                <Col span={6}>
                    <Text className='cvat-text-color'>Label</Text>
                </Col>
                <Col offset={1} span={17}>
                    <LabelSelector
                        style={{ width: '100%' }}
                        labels={labelsByShapeType}
                        value={labels.find((label) => label.id === selectedLabelID).name}
                        defaultValue={labels.find((label) => label.id === selectedLabelID).name}
                        onChange={onChangeLabel}
                    />
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(DrawSettingsControl);
