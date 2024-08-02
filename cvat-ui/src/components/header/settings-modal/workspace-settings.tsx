import React from 'react';

import './styles.scss';

import { Row, Col } from 'antd/lib/grid';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import InputNumber from 'antd/lib/input-number';
import Text from 'antd/lib/typography/Text';
import Slider from 'antd/lib/slider';
import Select from 'antd/lib/select';
import { TrashIcon } from 'icons';

import {
    MAX_ACCURACY,
    marks,
} from 'components/annotation-page/standard-workspace/controls-side-bar/approximation-accuracy';
import { clamp } from 'utils/math';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface Props {
    autoSave: boolean;
    autoSaveInterval: number;
    aamZoomMargin: number;
    showAllInterpolationTracks: boolean;
    showObjectsTextAlways: boolean;
    automaticBordering: boolean;
    intelligentPolygonCrop: boolean;
    defaultApproxPolyAccuracy: number;
    textFontSize: number;
    controlPointsSize: number;
    textPosition: 'center' | 'auto';
    textContent: string;
    showTagsOnFrame: boolean;
    onSwitchAutoSave(enabled: boolean): void;
    onChangeAutoSaveInterval(interval: number): void;
    onChangeAAMZoomMargin(margin: number): void;
    onChangeDefaultApproxPolyAccuracy(approxPolyAccuracy: number): void;
    onSwitchShowingInterpolatedTracks(enabled: boolean): void;
    onSwitchShowingObjectsTextAlways(enabled: boolean): void;
    onSwitchAutomaticBordering(enabled: boolean): void;
    onSwitchIntelligentPolygonCrop(enabled: boolean): void;
    onChangeTextFontSize(fontSize: number): void;
    onChangeControlPointsSize(pointsSize: number): void;
    onChangeTextPosition(position: 'auto' | 'center'): void;
    onChangeTextContent(textContent: string[]): void;
    onSwitchShowingTagsOnFrame(enabled: boolean): void;
}

function WorkspaceSettingsComponent(props: Props): JSX.Element {
    const {
        autoSave,
        autoSaveInterval,
        aamZoomMargin,
        showAllInterpolationTracks,
        showObjectsTextAlways,
        automaticBordering,
        intelligentPolygonCrop,
        defaultApproxPolyAccuracy,
        textFontSize,
        textPosition,
        textContent,
        onSwitchAutoSave,
        onChangeAutoSaveInterval,
        onChangeAAMZoomMargin,
        onSwitchShowingInterpolatedTracks,
        onSwitchShowingObjectsTextAlways,
        onSwitchAutomaticBordering,
        onSwitchIntelligentPolygonCrop,
        onChangeDefaultApproxPolyAccuracy,
        onChangeTextFontSize,
        onChangeTextPosition,
        onChangeTextContent,
    } = props;

    const minAutoSaveInterval = 1;
    const maxAutoSaveInterval = 60;
    const minAAMMargin = 0;
    const maxAAMMargin = 1000;
    const { t } = useTranslation();
    const translationText = 'settings.workspace';

    return (
        <div className='cvat-workspace-settings'>
            <Row>
                <Checkbox
                    className='cvat-text-color cvat-workspace-settings-auto-save'
                    checked={autoSave}
                    onChange={(event: CheckboxChangeEvent): void => {
                        onSwitchAutoSave(event.target.checked);
                    }}
                >
                    <Text className='cvat-text-color'>{t(`${translationText}.enableAutoSave.title`)}</Text>
                </Checkbox>
                <div className='cvat-workspace-settings-auto-save-interval'>
                    <Text>{t(`${translationText}.enableAutoSave.description`)}</Text>
                    <InputNumber
                        min={minAutoSaveInterval}
                        max={maxAutoSaveInterval}
                        step={1}
                        value={Math.round(autoSaveInterval / (60 * 1000))}
                        onChange={(value: number | undefined | string): void => {
                            if (typeof value !== 'undefined') {
                                onChangeAutoSaveInterval(
                                    Math.floor(clamp(+value, minAutoSaveInterval, maxAutoSaveInterval)) * 60 * 1000,
                                );
                            }
                        }}
                        bordered={false}
                        upHandler={<PlusOutlined />}
                        downHandler={<MinusOutlined />}
                    />
                    <Text>{t('time.minutes')}</Text>
                </div>
            </Row>
            <Row className='cvat-workspace-settings-show-interpolated'>
                <Checkbox
                    className='cvat-text-color'
                    checked={showAllInterpolationTracks}
                    onChange={(event: CheckboxChangeEvent): void => {
                        onSwitchShowingInterpolatedTracks(event.target.checked);
                    }}
                >
                    <Text className='cvat-text-color'>{t(`${translationText}.showAllInterpolationTracks.title`)}</Text>
                </Checkbox>
                <Text>{t(`${translationText}.showAllInterpolationTracks.description`)}</Text>
            </Row>
            <Row className='cvat-workspace-settings-show-text-always'>
                <Checkbox
                    className='cvat-text-color'
                    checked={showObjectsTextAlways}
                    onChange={(event: CheckboxChangeEvent): void => {
                        onSwitchShowingObjectsTextAlways(event.target.checked);
                    }}
                >
                    <Text className='cvat-text-color'>{t(`${translationText}.alwaysShowObjectDetails.title`)}</Text>
                </Checkbox>
                <Text> {t(`${translationText}.alwaysShowObjectDetails.description`)}</Text>
            </Row>
            <Row className='cvat-workspace-settings-text-settings'>
                <Col span={6}>
                    <Text className='cvat-text-color'> {t(`${translationText}.contentOfAText.title`)}</Text>
                </Col>
                <Col span={18}>
                    <Select
                        className='cvat-workspace-settings-text-content'
                        mode='multiple'
                        value={textContent.split(',').filter((entry: string) => !!entry)}
                        onChange={onChangeTextContent}
                        removeIcon={<TrashIcon />}
                        dropdownMatchSelectWidth={false}
                    >
                        <Select.Option value='id'>ID</Select.Option>
                        <Select.Option value='label'>Label</Select.Option>
                        <Select.Option value='attributes'>Attributes</Select.Option>
                        <Select.Option value='source'>Source</Select.Option>
                        <Select.Option value='descriptions'>Descriptions</Select.Option>
                    </Select>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-text-settings'>
                <Col span={12}>
                    <Text className='cvat-text-color'>{t(`${translationText}.positionOfAText.title`)}</Text>
                    <Select
                        className='cvat-workspace-settings-text-position'
                        value={textPosition}
                        onChange={onChangeTextPosition}
                    >
                        <Select.Option value='auto'>Auto</Select.Option>
                        <Select.Option value='center'>Center</Select.Option>
                    </Select>
                </Col>
                <Col>
                    <Text className='cvat-text-color'>{t(`${translationText}.fontSizeOfAText.title`)}</Text>
                    <InputNumber
                        className='cvat-workspace-settings-text-size'
                        onChange={onChangeTextFontSize}
                        min={8}
                        max={20}
                        value={textFontSize}
                        bordered={false}
                        upHandler={<PlusOutlined />}
                        downHandler={<MinusOutlined />}
                    />
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-autoborders'>
                <Checkbox
                    className='cvat-text-color'
                    checked={automaticBordering}
                    onChange={(event: CheckboxChangeEvent): void => {
                        onSwitchAutomaticBordering(event.target.checked);
                    }}
                >
                    {t(`${translationText}.automaticBordering.title`)}
                </Checkbox>
                <Text> {t(`${translationText}.automaticBordering.description`)}</Text>
            </Row>
            <Row className='cvat-workspace-settings-intelligent-polygon-cropping'>
                <Checkbox
                    className='cvat-text-color'
                    checked={intelligentPolygonCrop}
                    onChange={(event: CheckboxChangeEvent): void => {
                        onSwitchIntelligentPolygonCrop(event.target.checked);
                    }}
                >
                    {t(`${translationText}.intelligentPolygonCropping.title`)}
                </Checkbox>
                <Text> {t(`${translationText}.intelligentPolygonCropping.description`)}</Text>
            </Row>
            <Row className='cvat-workspace-settings-aam-zoom-margin'>
                <Col>
                    <Text className='cvat-text-color'>{t(`${translationText}.annotationZoomMargin.title`)}</Text>
                    <InputNumber
                        min={minAAMMargin}
                        max={maxAAMMargin}
                        value={aamZoomMargin}
                        onChange={(value: number | undefined | string): void => {
                            if (typeof value !== 'undefined') {
                                onChangeAAMZoomMargin(Math.floor(clamp(+value, minAAMMargin, maxAAMMargin)));
                            }
                        }}
                        bordered={false}
                        upHandler={<PlusOutlined />}
                        downHandler={<MinusOutlined />}
                    />
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-approx-poly-threshold'>
                <Col span={16}>
                    <Text className='cvat-text-color'>{t(`${translationText}.polygonApproximation.title`)}</Text>
                </Col>
                <Col span={6} offset={2}>
                    <Slider
                        min={0}
                        max={MAX_ACCURACY}
                        step={1}
                        value={defaultApproxPolyAccuracy}
                        onChange={onChangeDefaultApproxPolyAccuracy}
                        marks={marks}
                    />
                </Col>
                <Col span={24}>
                    <Text>{t(`${translationText}.polygonApproximation.description`)}</Text>
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(WorkspaceSettingsComponent);
