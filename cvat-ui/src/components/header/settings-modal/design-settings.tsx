import React from 'react';
import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'antd/lib/grid';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Text from 'antd/lib/typography/Text';
import InputNumber from 'antd/lib/input-number';
import Select from 'antd/lib/select';
import Slider from 'antd/lib/slider';
import Button from 'antd/lib/button';
import Icon, { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { IconRotateIcon } from 'icons';

import {
    switchGrid,
    changeGridColor,
    changeGridOpacity,
    changeBrightnessLevel,
    changeContrastLevel,
    changeSaturationLevel,
    changeGridSize,
} from 'actions/settings-actions';
import { clamp } from 'utils/math';
import { GridColor, CombinedState, PlayerSettingsState } from 'reducers';

import AppearanceBlock from 'components/header/settings-modal/appearance-block';
import { useTranslation } from 'react-i18next';

const minGridSize = 5;
const maxGridSize = 1000;

export default function DesignSettingsComponent(): JSX.Element {
    const dispatch = useDispatch();
    const {
        brightnessLevel,
        contrastLevel,
        saturationLevel,
        gridOpacity,
        gridColor,
        gridSize,
        grid: gridEnabled,
    } = useSelector((state: CombinedState): PlayerSettingsState => state.settings.player);

    const { t } = useTranslation();
    const translationText = 'settings.design.imageSettings';
    return (
        <div className='cvat-design-settings'>
            <AppearanceBlock />
            <hr />
            <Row className='cvat-image-setups'>
                <Col span={5}>
                    <Text className='cvat-text-color'>{t(`${translationText}.title`)}</Text>
                </Col>
                <Col span={19}>
                    <Row>
                        <Checkbox
                            className='cvat-text-color cvat-image-setups-grid'
                            checked={gridEnabled}
                            onChange={(event: CheckboxChangeEvent): void => {
                                dispatch(switchGrid(event.target.checked));
                            }}
                        >
                            {t(`${translationText}.imageGrid`)}
                        </Checkbox>
                    </Row>
                    <Row justify='space-between' className={!gridEnabled ? 'disabled' : ''}>
                        <Col span={7} className='cvat-image-setups-grid-size'>
                            <Text className='cvat-text-color' disabled={!gridEnabled}>
                                {t(`${translationText}.size`)}
                            </Text>
                            <InputNumber
                                className='cvat-image-setups-grid-size-input'
                                min={minGridSize}
                                max={maxGridSize}
                                value={gridSize}
                                disabled={!gridEnabled}
                                onChange={(value: number | undefined | null | string): void => {
                                    if (typeof value !== 'undefined' && value !== null) {
                                        const converted = Math.floor(clamp(+value, minGridSize, maxGridSize));
                                        dispatch(changeGridSize(converted));
                                    }
                                }}
                                bordered={false}
                                upHandler={<PlusOutlined />}
                                downHandler={<MinusOutlined />}
                            />
                        </Col>
                        <Col span={7} className='cvat-image-setups-grid-color'>
                            <Text className='cvat-text-color' disabled={!gridEnabled}>
                                {t(`${translationText}.color`)}
                            </Text>
                            <Select
                                className='cvat-image-setups-grid-color-input'
                                value={gridColor}
                                disabled={!gridEnabled}
                                onChange={(color: GridColor): void => {
                                    dispatch(changeGridColor(color));
                                }}
                            >
                                <Select.Option key='white' value={GridColor.White}>
                                    White
                                </Select.Option>
                                <Select.Option key='black' value={GridColor.Black}>
                                    Black
                                </Select.Option>
                                <Select.Option key='red' value={GridColor.Red}>
                                    Red
                                </Select.Option>
                                <Select.Option key='green' value={GridColor.Green}>
                                    Green
                                </Select.Option>
                                <Select.Option key='blue' value={GridColor.Blue}>
                                    Blue
                                </Select.Option>
                            </Select>
                        </Col>
                        <Col span={7} pull={2} className='cvat-image-setups-grid-opacity'>
                            <Text className='cvat-text-color' disabled={!gridEnabled}>
                                {t(`${translationText}.opacity`)}
                            </Text>
                            <Slider
                                className='cvat-image-setups-grid-opacity-input'
                                min={0}
                                max={100}
                                value={gridOpacity}
                                disabled={!gridEnabled}
                                onChange={(value: number | [number, number]): void => {
                                    dispatch(changeGridOpacity(value as number));
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className='cvat-image-setups-color-settings'>
                        <Col>
                            <Text className='cvat-text-color'>{t(`${translationText}.colorSettings.title`)}</Text>
                        </Col>
                        <Col span={24}>
                            <Row className='cvat-image-setups-brightness'>
                                <Col span={5}>
                                    <Text>{t(`${translationText}.colorSettings.brightness`)}</Text>
                                </Col>
                                <Col span={19}>
                                    <Slider
                                        min={50}
                                        max={200}
                                        value={brightnessLevel}
                                        onChange={(value: number | [number, number]): void => {
                                            dispatch(changeBrightnessLevel(value as number));
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row className='cvat-image-setups-contrast'>
                                <Col span={5}>
                                    <Text>{t(`${translationText}.colorSettings.contrast`)}</Text>
                                </Col>
                                <Col span={19}>
                                    <Slider
                                        min={50}
                                        max={200}
                                        value={contrastLevel}
                                        onChange={(value: number | [number, number]): void => {
                                            dispatch(changeContrastLevel(value as number));
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row className='cvat-image-setups-saturation'>
                                <Col span={5}>
                                    <Text>{t(`${translationText}.colorSettings.saturation`)}</Text>
                                </Col>
                                <Col span={19}>
                                    <Slider
                                        min={0}
                                        max={300}
                                        value={saturationLevel}
                                        onChange={(value: number | [number, number]): void => {
                                            dispatch(changeSaturationLevel(value as number));
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row className='cvat-image-setups-reset-color-settings' justify='end'>
                                <Button
                                    onClick={() => {
                                        const defaultValue = 100;
                                        dispatch(changeBrightnessLevel(defaultValue));
                                        dispatch(changeContrastLevel(defaultValue));
                                        dispatch(changeSaturationLevel(defaultValue));
                                    }}
                                    icon={<Icon component={IconRotateIcon} className='icon-rotate-icon' />}
                                >
                                    {t(`${translationText}.resetColorSetting`)}
                                </Button>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
}
