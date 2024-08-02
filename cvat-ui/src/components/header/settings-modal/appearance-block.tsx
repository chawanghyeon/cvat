import React, { Dispatch, useState } from 'react';
import './styles.scss';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import Text from 'antd/lib/typography/Text';
import { RadioChangeEvent } from 'antd/lib/radio';
import { Radio } from 'antd';
import Slider from 'antd/lib/slider';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Button from 'antd/lib/button';

import { Row, Col } from 'antd/lib/grid';

import ColorPicker from 'components/annotation-page/standard-workspace/objects-side-bar/color-picker';
import { SelectColorIcon } from 'icons';

import { ColorBy, CombinedState } from 'reducers';
import { DimensionType } from 'cvat-core-wrapper';
import { collapseAppearance as collapseAppearanceAction } from 'actions/annotation-actions';
import {
    changeShapesColorBy as changeShapesColorByAction,
    changeShapesOpacity as changeShapesOpacityAction,
    changeSelectedShapesOpacity as changeSelectedShapesOpacityAction,
    changeShapesOutlinedBorders as changeShapesOutlinedBordersAction,
    changeShowBitmap as changeShowBitmapAction,
    changeShowProjections as changeShowProjectionsAction,
} from 'actions/settings-actions';
import { useTranslation } from 'react-i18next';

interface StateToProps {
    appearanceCollapsed: boolean;
    colorBy: ColorBy;
    opacity: number;
    selectedOpacity: number;
    outlined: boolean;
    outlineColor: string;
    showBitmap: boolean;
    showProjections: boolean;
    jobInstance: any;
}

interface DispatchToProps {
    collapseAppearance(): void;
    changeShapesColorBy(event: RadioChangeEvent): void;
    changeShapesOpacity(value: number): void;
    changeSelectedShapesOpacity(value: number): void;
    changeShapesOutlinedBorders(outlined: boolean, color: string): void;
    changeShowBitmap(event: CheckboxChangeEvent): void;
    changeShowProjections(event: CheckboxChangeEvent): void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            appearanceCollapsed,
            job: { instance: jobInstance },
        },
        settings: {
            shapes: { colorBy, opacity, selectedOpacity, outlined, outlineColor, showBitmap, showProjections },
        },
    } = state;

    return {
        appearanceCollapsed,
        colorBy,
        opacity,
        selectedOpacity,
        outlined,
        outlineColor,
        showBitmap,
        showProjections,
        jobInstance,
    };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): DispatchToProps {
    return {
        collapseAppearance(): void {
            dispatch(collapseAppearanceAction());
        },
        changeShapesColorBy(event: RadioChangeEvent): void {
            dispatch(changeShapesColorByAction(event.target.value));
        },
        changeShapesOpacity(value: number): void {
            dispatch(changeShapesOpacityAction(value));
        },
        changeSelectedShapesOpacity(value: number): void {
            dispatch(changeSelectedShapesOpacityAction(value));
        },
        changeShapesOutlinedBorders(outlined: boolean, color: string): void {
            dispatch(changeShapesOutlinedBordersAction(outlined, color));
        },
        changeShowBitmap(event: CheckboxChangeEvent): void {
            dispatch(changeShowBitmapAction(event.target.checked));
        },
        changeShowProjections(event: CheckboxChangeEvent): void {
            dispatch(changeShowProjectionsAction(event.target.checked));
        },
    };
}

type Props = StateToProps & DispatchToProps;

function AppearanceBlock(props: Props): JSX.Element {
    const {
        colorBy,
        opacity,
        selectedOpacity,
        outlined,
        outlineColor,
        showBitmap,
        showProjections,
        changeShapesColorBy,
        changeShapesOpacity,
        changeSelectedShapesOpacity,
        changeShapesOutlinedBorders,
        changeShowBitmap,
        changeShowProjections,
        jobInstance,
    } = props;

    let is2D = true;
    if (jobInstance != null) {
        is2D = jobInstance.dimension === DimensionType.DIMENSION_2D;
    }
    const { t } = useTranslation();
    const translationText = 'settings.design.appearance';

    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const changeColorPickerVisible = (visible: boolean): void => {
        setColorPickerVisible(visible);
    };

    return (
        <Row className='cvat-objects-appearance'>
            <Col span={5}>
                <Text className='cvat-text-color'> {t(`${translationText}.title`)}</Text>
            </Col>
            <Col span={19} className='cvat-objects-appearance-content'>
                <Row>
                    <Radio.Group
                        className='cvat-objects-appearance-radio-group'
                        value={colorBy}
                        onChange={changeShapesColorBy}
                    >
                        <Radio value={ColorBy.LABEL}> {t(`${translationText}.label`)}</Radio>
                        <Radio value={ColorBy.INSTANCE}> {t(`${translationText}.instance`)}</Radio>
                        <Radio value={ColorBy.GROUP}> {t(`${translationText}.group`)}</Radio>
                    </Radio.Group>
                </Row>
                <Row>
                    <Col span={7}>
                        <Text> {t(`${translationText}.opacity`)}</Text>
                    </Col>
                    <Col span={14} pull={3}>
                        <Slider
                            className='cvat-appearance-opacity-slider'
                            onChange={changeShapesOpacity}
                            value={opacity}
                            trackStyle={{ backgroundColor: '#FFFFFF' }}
                            handleStyle={{ borderColor: '#FFFFFF' }}
                            min={0}
                            max={100}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={7}>
                        <Text> {t(`${translationText}.selectedOpacity`)}</Text>
                    </Col>
                    <Col span={14} pull={3}>
                        <Slider
                            className='cvat-appearance-selected-opacity-slider'
                            onChange={changeSelectedShapesOpacity}
                            value={selectedOpacity}
                            trackStyle={{ backgroundColor: '#FFFFFF' }}
                            handleStyle={{ borderColor: '#FFFFFF' }}
                            min={0}
                            max={100}
                        />
                    </Col>
                </Row>
                <Row align='middle'>
                    <Checkbox
                        className='cvat-appearance-outlinded-borders-checkbox'
                        onChange={(event: CheckboxChangeEvent) => {
                            changeShapesOutlinedBorders(event.target.checked, outlineColor);
                        }}
                        checked={outlined}
                        style={{ width: '50%', color: 'white' }}
                    >
                        {t(`${translationText}.outlinedBorders`)}
                        <Button
                            className='cvat-appearance-outlined-borders-button'
                            type='link'
                            shape='circle'
                            onClick={() => setColorPickerVisible(!colorPickerVisible)}
                        >
                            <SelectColorIcon />
                        </Button>
                        <ColorPicker
                            onChange={(color) => changeShapesOutlinedBorders(outlined, color)}
                            value={outlineColor}
                            visible={colorPickerVisible}
                            resetVisible={false}
                            onVisibleChange={changeColorPickerVisible}
                        />
                    </Checkbox>
                    {is2D && (
                        <Checkbox
                            className='cvat-appearance-bitmap-checkbox'
                            onChange={changeShowBitmap}
                            checked={showBitmap}
                            style={{ width: '50%', color: 'white' }}
                        >
                            {t(`${translationText}.showBitmaps`)}
                        </Checkbox>
                    )}
                </Row>
                <Row>
                    {is2D && (
                        <Checkbox
                            className='cvat-appearance-cuboid-projections-checkbox'
                            onChange={changeShowProjections}
                            checked={showProjections}
                            style={{ width: '100%', color: 'white' }}
                        >
                            {t(`${translationText}.showProjections`)}
                        </Checkbox>
                    )}
                </Row>
            </Col>
        </Row>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(AppearanceBlock));
