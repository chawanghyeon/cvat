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
    canvasInstance: Canvas;
    activeControl: ActiveControl;
    activeShapeType: ShapeType;
    labels: any[];
    selectedLabelID: number | null;
    minimumPoints: number;
    numberOfPoints?: number;
    rectDrawingMethod: RectDrawingMethod | undefined;
    cuboidDrawingMethod: CuboidDrawingMethod | undefined;
    objectType: ObjectType;

    onChangeLabel(value: Label | null): void;
    onChangePoints(value: number | undefined): void;
    onChangeRectDrawingMethod: (event: RadioChangeEvent) => void;
    onChangeCuboidDrawingMethod: (event: RadioChangeEvent) => void;
    onChangeObjectType: (checked: boolean) => void;
}

function DrawSettingsControl(props: Props): JSX.Element {
    const {
        canvasInstance,
        activeControl,
        activeShapeType,
        labels,
        selectedLabelID,
        minimumPoints,
        numberOfPoints,
        rectDrawingMethod,
        cuboidDrawingMethod,
        objectType,
        onChangeLabel,
        onChangePoints,
        onChangeRectDrawingMethod,
        onChangeCuboidDrawingMethod,
        onChangeObjectType,
    } = props;

    const includesDoneButton = [
        ActiveControl.DRAW_POLYGON,
        ActiveControl.DRAW_POLYLINE,
        ActiveControl.DRAW_POINTS,
    ].includes(activeControl);

    const onFinishDraw = (): void => {
        if (canvasInstance != null) {
            canvasInstance.draw({ enabled: false });
        }
    };

    const labelsByShapeType: Label[] = activeShapeType === ShapeType.SKELETON ?
        labels.filter((label: any) => label.type === 'skeleton') :
        labels.filter((label: any) => label.type === 'any' && !label.hasParent);

    return (
        <div className='cvat-drawing-setting-panel'>
            {includesDoneButton ? (
                <Button
                    type='primary'
                    icon={<CheckCircleOutlined />}
                    className='cvat-annotation-header-button'
                    onClick={onFinishDraw}
                >
                    Done
                </Button>
            ) : null}
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
            {activeShapeType === ShapeType.RECTANGLE && (
                <>
                    <Divider type='vertical' />
                    <Row align='middle' className='drawing-method'>
                        <Col span={7}>
                            <Text className='cvat-text-color'>Method</Text>
                        </Col>
                        <Col offset={1} span={16}>
                            <Radio.Group
                                style={{ display: 'flex' }}
                                value={rectDrawingMethod}
                                onChange={onChangeRectDrawingMethod}
                            >
                                <Radio value={RectDrawingMethod.CLASSIC} style={{ width: 'auto' }}>
                                    2 points
                                </Radio>
                                <Radio value={RectDrawingMethod.EXTREME_POINTS} style={{ width: 'auto' }}>
                                    4 points
                                </Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                </>
            )}
            {activeShapeType === ShapeType.CUBOID && (
                <>
                    <Divider type='vertical' />
                    <Row align='middle' className='drawing-method'>
                        <Col span={6}>
                            <Text className='cvat-text-color'>Method</Text>
                        </Col>
                        <Col offset={1} span={17}>
                            <Radio.Group
                                style={{ display: 'flex' }}
                                value={cuboidDrawingMethod}
                                onChange={onChangeCuboidDrawingMethod}
                            >
                                <Radio value={CuboidDrawingMethod.CLASSIC} style={{ width: 'auto' }}>
                                    rectangle
                                </Radio>
                                <Radio value={CuboidDrawingMethod.CORNER_POINTS} style={{ width: 'auto' }}>
                                    4 points
                                </Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                </>
            )}
            {[ShapeType.POLYGON, ShapeType.POLYLINE, ShapeType.POINTS].includes(activeShapeType) && (
                <>
                    <Divider type='vertical' />
                    <Row align='middle' className='point-setting'>
                        <Col span={13}>
                            <Text className='cvat-text-color'>Number of points</Text>
                        </Col>
                        <Col offset={1} span={10}>
                            <InputNumber
                                onChange={(value: number | undefined | string | null) => {
                                    if (typeof value === 'undefined' || value === null) {
                                        onChangePoints(undefined);
                                    } else {
                                        onChangePoints(
                                            Math.floor(clamp(+value, minimumPoints, Number.MAX_SAFE_INTEGER)),
                                        );
                                    }
                                }}
                                className='cvat-draw-shape-popover-points-selector'
                                min={minimumPoints}
                                value={numberOfPoints}
                                step={1}
                                bordered={false}
                                upHandler={<PlusOutlined />}
                                downHandler={<MinusOutlined />}
                            />
                        </Col>
                    </Row>
                </>
            )}
            <Divider type='vertical' />
            {activeShapeType !== ShapeType.MASK && (
                <Row align='middle' className='object-method'>
                    <Col span={8}>
                        <span>Shape</span>
                    </Col>
                    <Col span={8}>
                        <Switch checked={objectType !== ObjectType.SHAPE} onChange={onChangeObjectType} />
                    </Col>
                    <Col span={8}>
                        <span>Track</span>
                    </Col>
                </Row>
            )}
        </div>
    );
}

export default React.memo(DrawSettingsControl);
