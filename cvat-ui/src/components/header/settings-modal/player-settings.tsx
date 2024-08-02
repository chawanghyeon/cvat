import React from 'react';

import './styles.scss';
import { useTranslation } from 'react-i18next';

import { Row, Col } from 'antd/lib/grid';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Popover from 'antd/lib/popover';
import Icon from '@ant-design/icons';
import Text from 'antd/lib/typography/Text';
import ReactCircleColorPicker from 'react-circle-color-picker';

import { EyedropperIcon } from 'icons';
import { FrameSpeed } from 'reducers';
import config from 'config';
import { Input } from 'antd';

interface Props {
    frameStep: number;
    frameSpeed: FrameSpeed;
    resetZoom: boolean;
    rotateAll: boolean;
    smoothImage: boolean;
    showDeletedFrames: boolean;
    canvasBackgroundColor: string;
    onChangeFrameStep(step: number): void;
    onChangeFrameSpeed(speed: FrameSpeed): void;
    onSwitchResetZoom(enabled: boolean): void;
    onSwitchRotateAll(rotateAll: boolean): void;
    onChangeCanvasBackgroundColor(color: string): void;
    onSwitchSmoothImage(enabled: boolean): void;
    onSwitchShowingDeletedFrames(enabled: boolean): void;
}

export default function PlayerSettingsComponent(props: Props): JSX.Element {
    const {
        frameSpeed,
        resetZoom,
        rotateAll,
        smoothImage,
        canvasBackgroundColor,
        onChangeFrameSpeed,
        onSwitchResetZoom,
        onSwitchRotateAll,
        onSwitchSmoothImage,
        onChangeCanvasBackgroundColor,
    } = props;

    const { t } = useTranslation();
    const translationText = 'settings.player';

    const colorMap = config.CANVAS_BACKGROUND_COLORS.map((color) => ({
        hex: color,
        selected: color === canvasBackgroundColor,
    }));

    function hexToRgb(hex: string): any | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : null;
    }

    return (
        <div className='cvat-player-settings'>
            <Row align='middle' className='cvat-player-settings-speed'>
                <Col span={6}>
                    <Text className='common-text-color'> {t(`${translationText}.playerSpeed.title`)}</Text>
                </Col>
                <Col span={6}>
                    <Select
                        className='cvat-player-settings-speed-select'
                        value={frameSpeed}
                        onChange={(speed: FrameSpeed): void => {
                            onChangeFrameSpeed(speed);
                        }}
                    >
                        <Select.Option
                            key='fastest'
                            value={FrameSpeed.Fastest}
                            className='cvat-player-settings-speed-fastest'
                        >
                            {t(`${translationText}.playerSpeed.fastest`)}
                        </Select.Option>
                        <Select.Option key='fast' value={FrameSpeed.Fast} className='cvat-player-settings-speed-fast'>
                            {t(`${translationText}.playerSpeed.fast`)}
                        </Select.Option>
                        <Select.Option
                            key='usual'
                            value={FrameSpeed.Usual}
                            className='cvat-player-settings-speed-usual'
                        >
                            {t(`${translationText}.playerSpeed.usual`)}
                        </Select.Option>
                        <Select.Option key='slow' value={FrameSpeed.Slow} className='cvat-player-settings-speed-slow'>
                            {t(`${translationText}.playerSpeed.slow`)}
                        </Select.Option>
                        <Select.Option
                            key='slower'
                            value={FrameSpeed.Slower}
                            className='cvat-player-settings-speed-slower'
                        >
                            {t(`${translationText}.playerSpeed.slower`)}
                        </Select.Option>
                        <Select.Option
                            key='slowest'
                            value={FrameSpeed.Slowest}
                            className='cvat-player-settings-speed-slowest'
                        >
                            {t(`${translationText}.playerSpeed.slowest`)}
                        </Select.Option>
                    </Select>
                </Col>
            </Row>
            <Row className='cvat-player-settings-canvas-background' style={{ height: '80px' }}>
                <Col span={10}>
                    <Text className='cvat-text-color'>{t(`${translationText}.canvasBackgroundColor`)}</Text>
                </Col>
                <Col span={6}>
                    <Popover
                        placement='right'
                        content={
                            // eslint-disable-next-line react/jsx-wrap-multilines
                            <div style={{ display: 'block', width: '300px' }}>
                                <Row style={{ width: '300px' }}>
                                    <Col span={8}>
                                        <Input value={canvasBackgroundColor} />
                                    </Col>
                                    <Col span={5} offset={1}>
                                        <Input value={hexToRgb(canvasBackgroundColor).r} />
                                    </Col>
                                    <Col span={5}>
                                        <Input value={hexToRgb(canvasBackgroundColor).g} />
                                    </Col>
                                    <Col span={5}>
                                        <Input value={hexToRgb(canvasBackgroundColor).b} />
                                    </Col>
                                </Row>
                                <Row style={{ color: '#ACACB5' }}>
                                    <Col span={8}>Hex</Col>
                                    <Col span={5} offset={1}>
                                        R
                                    </Col>
                                    <Col span={5}>G</Col>
                                    <Col span={5}>B</Col>
                                </Row>
                                <Row>
                                    <ReactCircleColorPicker
                                        color={canvasBackgroundColor}
                                        onChange={(e: any[]) => {
                                            console.log(e);
                                            const selectedList = e.filter((color) => color.selected === true);
                                            // selectedValue is same as previous canvasBackgroundColor
                                            // when select the same color
                                            let selectedValue = selectedList[0]
                                                ? selectedList[0].hex
                                                : canvasBackgroundColor;
                                            // selectedList.length is 0 if all color.selected are false
                                            // Get color.hex has canvasBackgroundColor
                                            // and force to make it true then exit
                                            if (selectedList.length === 0) {
                                                // eslint-disable-next-line max-len
                                                const isSame = e.filter(
                                                    (color) => color.hex === canvasBackgroundColor,
                                                )[0];
                                                isSame.selected = true;
                                                return;
                                            }
                                            // Change canvasBackgroundColor
                                            // if current selected hex is different than previous canvasBackgroundColor
                                            selectedList.forEach((item) => {
                                                if (item.hex === canvasBackgroundColor) {
                                                    item.selected = false;
                                                } else selectedValue = item.hex;
                                            });
                                            onChangeCanvasBackgroundColor(selectedValue);
                                        }}
                                        width='300px'
                                        colors={colorMap}
                                    />
                                </Row>
                            </div>
                        }
                        overlayClassName='cvat-player-settings-color-picker'
                        trigger='click'
                    >
                        <Button className='cvat-select-canvas-background-color-button' type='default'>
                            <svg
                                height='20'
                                width='20'
                                style={{ fill: canvasBackgroundColor || config.NEW_LABEL_COLOR }}
                            >
                                <circle cx='10' cy='10' r='10' strokeWidth='0' />
                            </svg>
                            <Icon component={EyedropperIcon} className='icon-rotate-icon' />
                        </Button>
                    </Popover>
                </Col>
            </Row>
            <Row className='cvat-player-settings-reset-zoom'>
                <Col className='cvat-player-settings-reset-zoom-checkbox'>
                    <Checkbox
                        className='common-text-color'
                        checked={resetZoom}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchResetZoom(event.target.checked);
                        }}
                    >
                        {t(`${translationText}.resetZoom.title`)}
                    </Checkbox>
                </Col>
                <Col>
                    <Text> {t(`${translationText}.resetZoom.description`)}</Text>
                </Col>
            </Row>
            <Row className='cvat-player-settings-rotate-all'>
                <Col className='cvat-player-settings-rotate-all-checkbox'>
                    <Checkbox
                        className='common-text-color'
                        checked={rotateAll}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchRotateAll(event.target.checked);
                        }}
                    >
                        {t(`${translationText}.rotateAllImages.title`)}
                    </Checkbox>
                </Col>
                <Col>
                    <Text> {t(`${translationText}.rotateAllImages.description`)}</Text>
                </Col>
            </Row>
            <Row className='cvat-player-settings-smooth-image'>
                <Col className='cvat-player-settings-smooth-image-checkbox'>
                    <Checkbox
                        className='common-text-color'
                        checked={smoothImage}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchSmoothImage(event.target.checked);
                        }}
                    >
                        {t(`${translationText}.smoothImage.title`)}
                    </Checkbox>
                </Col>
                <Col>
                    <Text> {t(`${translationText}.smoothImage.description`)}</Text>
                </Col>
            </Row>
        </div>
    );
}
