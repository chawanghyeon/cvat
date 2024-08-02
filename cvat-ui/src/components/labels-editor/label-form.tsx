import React, { useState, useRef } from 'react';
import { Row, Col } from 'antd/lib/grid';
import Icon from '@ant-design/icons';
import Input, { InputRef } from 'antd/lib/input';
import Button from 'antd/lib/button';
import Checkbox from 'antd/lib/checkbox';
import Select from 'antd/lib/select';
import Form, { FormInstance } from 'antd/lib/form';
import Badge from 'antd/lib/badge';
import { Store } from 'antd/lib/form/interface';
import Text from 'antd/lib/typography/Text';

import { SerializedAttribute, LabelType } from 'cvat-core-wrapper';
import CVATTooltip from 'components/common/cvat-tooltip';
import ColorPicker from 'components/annotation-page/standard-workspace/objects-side-bar/color-picker';
import { PlusIcon, EyedropperIcon, TrashGrayIcon } from 'icons';
import patterns from 'utils/validation-patterns';
import config from 'config';
import { equalArrayHead, idGenerator, LabelOptColor, SkeletonConfiguration } from './common';

export enum AttributeType {
    SELECT = 'SELECT',
    RADIO = 'RADIO',
    CHECKBOX = 'CHECKBOX',
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
}

interface Props {
    label: LabelOptColor | null;
    labelNames: string[];
    onSubmit: (label: LabelOptColor) => void;
    onSkeletonSubmit?: () => SkeletonConfiguration | null;
    resetSkeleton?: () => void;
    onCancel: () => void;
}

interface AddedLabels {
    name: string;
    color: string;
}

const LabelForm: React.FC<Props> = (props) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [color, setColor] = useState<string | undefined>(props.label?.color);
    const [addedLabels, setAddedLabels] = useState<AddedLabels[]>([]);
    const formRef = useRef<FormInstance>(null);
    const inputNameRef = useRef<InputRef>(null);

    const focus = (): void => {
        inputNameRef.current?.focus({
            cursor: 'end',
        });
    };

    const handleSubmit = async (values: Store): Promise<void> => {
        const { label, onSubmit, onSkeletonSubmit, onCancel, resetSkeleton } = props;

        if (color === undefined) {
            values.color = label?.color;
        } else {
            values.color = color;
        }

        if (!values.name) {
            await onCancel();
            return;
        }

        let skeletonConfiguration: SkeletonConfiguration | null = null;
        if (onSkeletonSubmit) {
            skeletonConfiguration = await onSkeletonSubmit();
            if (!skeletonConfiguration) {
                return;
            }
        }

        await onSubmit({
            name: values.name,
            id: label ? label.id : idGenerator(),
            color,
            type: values.type || label?.type || LabelType.ANY,
            attributes: (values.attributes || []).map((attribute: Store) => {
                let attrValues: string | string[] = attribute.values;
                if (!Array.isArray(attrValues)) {
                    if (attribute.type === AttributeType.NUMBER) {
                        attrValues = attrValues.split(';');
                    } else {
                        attrValues = [attrValues];
                    }
                }
                attrValues = attrValues.map((value: string) => value.trim());

                return {
                    ...attribute,
                    values: attrValues,
                    input_type: attribute.type.toLowerCase(),
                };
            }),
            ...(skeletonConfiguration || {}),
        });

        setColor(undefined);
        setAddedLabels([...addedLabels, { name: values.name, color: values.color }]);

        if (formRef.current) {
            formRef.current.setFieldsValue({ attributes: undefined });
            formRef.current.resetFields();
            if (resetSkeleton) {
                await resetSkeleton();
            }

            if (!label) {
                focus();
            }
        }
    };

    const addAttribute = (): void => {
        if (formRef.current) {
            const attributes = formRef.current.getFieldValue('attributes');
            formRef.current.setFieldsValue({ attributes: [...(attributes || []), { id: idGenerator() }] });
        }
    };

    const removeAttribute = (key: number): void => {
        if (formRef.current) {
            const attributes = formRef.current.getFieldValue('attributes');
            formRef.current.setFieldsValue({
                attributes: attributes.filter((_: any, id: number) => id !== key),
            });
        }
    };

    const renderAttributeNameInput = (fieldInstance: any, attr: SerializedAttribute | null): JSX.Element => {
        const { key } = fieldInstance;
        const locked = attr ? (attr.id as number) >= 0 : false;
        const value = attr ? attr.name : '';

        return (
            <Form.Item
                hasFeedback
                name={[key, 'name']}
                fieldKey={[fieldInstance.fieldKey, 'name']}
                initialValue={value}
                rules={[
                    {
                        required: true,
                        message: 'Please specify a name',
                    },
                    {
                        pattern: patterns.validateAttributeName.pattern,
                        message: patterns.validateAttributeName.message,
                    },
                ]}
            >
                <Input className='cvat-attribute-name-input' disabled={locked} placeholder='Name' />
            </Form.Item>
        );
    };

    const renderAttributeTypeInput = (fieldInstance: any, attr: SerializedAttribute | null): JSX.Element => {
        const { key } = fieldInstance;
        const locked = attr ? (attr.id as number) >= 0 : false;
        const type = attr ? attr.input_type.toUpperCase() : AttributeType.SELECT;

        return (
            <CVATTooltip title='An HTML element representing the attribute'>
                <Form.Item name={[key, 'type']} fieldKey={[fieldInstance.fieldKey, 'type']} initialValue={type}>
                    <Select className='cvat-attribute-type-input' disabled={locked}>
                        <Select.Option value={AttributeType.SELECT} className='cvat-attribute-type-input-select'>
                            Type
                        </Select.Option>
                        <Select.Option value={AttributeType.RADIO} className='cvat-attribute-type-input-radio'>
                            Radio
                        </Select.Option>
                        <Select.Option value={AttributeType.CHECKBOX} className='cvat-attribute-type-input-checkbox'>
                            Checkbox
                        </Select.Option>
                        <Select.Option value={AttributeType.TEXT} className='cvat-attribute-type-input-text'>
                            Text
                        </Select.Option>
                        <Select.Option value={AttributeType.NUMBER} className='cvat-attribute-type-input-number'>
                            Number
                        </Select.Option>
                    </Select>
                </Form.Item>
            </CVATTooltip>
        );
    };

    const renderAttribute = (fieldInstance: any): JSX.Element => {
        const { key, name, type } = fieldInstance;

        return (
            <Row key={key} gutter={4}>
                <Col span={9}>{renderAttributeNameInput(fieldInstance, null)}</Col>
                <Col span={9}>{renderAttributeTypeInput(fieldInstance, null)}</Col>
                <Col span={6}>
                    <CVATTooltip title='Remove attribute'>
                        <Button
                            type='link'
                            style={{ padding: 0 }}
                            onClick={(): void => {
                                removeAttribute(key);
                            }}
                        >
                            <Icon component={TrashGrayIcon} />
                        </Button>
                    </CVATTooltip>
                </Col>
            </Row>
        );
    };

    const renderLabelNameInput = (): JSX.Element => {
        const { label } = props;
        const labelName = label ? label.name : '';

        return (
            <Form.Item
                hasFeedback
                name='name'
                initialValue={labelName}
                rules={[
                    {
                        required: true,
                        message: 'Please specify a label name',
                    },
                    {
                        pattern: patterns.validateAttributeName.pattern,
                        message: patterns.validateAttributeName.message,
                    },
                ]}
            >
                <Input ref={inputNameRef} className='cvat-label-name-input' placeholder='Name' />
            </Form.Item>
        );
    };

    const renderLabelTypeInput = (): JSX.Element => {
        const { label } = props;
        const type = label ? label.type : LabelType.ANY;

        return (
            <Form.Item name='type' initialValue={type}>
                <Select className='cvat-label-type-input'>
                    {Object.values(LabelType).map((labelType) => (
                        <Select.Option key={labelType} value={labelType}>
                            {labelType}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        );
    };

    const renderChangeColorButton = (): JSX.Element => {
        const { label } = props;

        return (
            <Form.Item>
                <ColorPicker
                    placement='topRight'
                    value={color || (label ? label.color : config.DEFAULT_LABEL_COLOR)}
                    onChange={(newColor: string): void => {
                        setColor(newColor);
                    }}
                />
            </Form.Item>
        );
    };

    const renderNewAttributeButton = (): JSX.Element => {
        return (
            <CVATTooltip title='Add a new attribute'>
                <Button
                    type='link'
                    style={{ padding: 0 }}
                    onClick={(): void => {
                        addAttribute();
                    }}
                >
                    <Icon component={PlusIcon} />
                </Button>
            </CVATTooltip>
        );
    };

    const renderAttributes =
        () =>
        (fieldInstances: any[]): JSX.Element[] =>
            fieldInstances.map(renderAttribute);

    const renderFormItems = () => {
        return (
            <>
                <Col span={12}>{renderLabelNameInput()}</Col>
                <Col span={4}>{renderLabelTypeInput()}</Col>
                <Col span={4}>{renderChangeColorButton()}</Col>
                <Col span={4}>{renderNewAttributeButton()}</Col>
            </>
        );
    };

    const renderSaveButton = (): JSX.Element => {
        const { label } = props;
        const tooltipTitle = label ? 'Save the label and return' : 'Save the label and create one more';
        const buttonText = label ? 'Done' : 'Continue';

        return (
            <CVATTooltip title={tooltipTitle}>
                <Button style={{ width: '150px' }} type='primary' htmlType='submit'>
                    {buttonText}
                </Button>
            </CVATTooltip>
        );
    };

    const renderCancelButton = (): JSX.Element => {
        const { onCancel } = props;

        return (
            <CVATTooltip title='Do not save the label and return'>
                <Button
                    type='primary'
                    danger
                    style={{ width: '150px' }}
                    onClick={(): void => {
                        onCancel();
                    }}
                >
                    Cancel
                </Button>
            </CVATTooltip>
        );
    };

    const renderFormItemsAndButtons = () => {
        return (
            <>
                <Row className='cvat-label-form-constructor' justify='start' align='top'>
                    {renderFormItems()}
                </Row>
                <hr style={{ borderTop: '1px solid #414142' }} />
                <Row justify='start' align='top'>
                    <Col span={24}>
                        <Form.List name='attributes'>{renderAttributes()}</Form.List>
                    </Col>
                </Row>
                {props.label == null && (
                    <Row className='cvat-label-form-constructor-added' align='middle'>
                        <Col style={{ color: 'white' }} span={4}>
                            Added Label
                        </Col>
                        <Col span={20}>
                            <Row>
                                {addedLabels.map((addedLabel) => (
                                    <span
                                        key={addedLabel.name}
                                        style={{ background: '#1F1F20' || config.NEW_LABEL_COLOR }}
                                        className='cvat-constructor-viewer-item'
                                    >
                                        <svg
                                            height='8'
                                            width='8'
                                            style={{ fill: addedLabel.color || config.NEW_LABEL_COLOR }}
                                        >
                                            <circle cx='4' cy='4' r='4' strokeWidth='0' />
                                        </svg>
                                        <Text>{addedLabel.name}</Text>
                                    </span>
                                ))}
                            </Row>
                        </Col>
                    </Row>
                )}
                <Row justify='start' align='middle'>
                    <Col>{renderSaveButton()}</Col>
                    <Col offset={1}>{renderCancelButton()}</Col>
                </Row>
            </>
        );
    };

    // eslint-disable-next-line react/sort-comp
    React.useEffect(() => {
        const { label } = props;
        if (formRef.current && label && label.attributes.length) {
            const convertedAttributes = label.attributes.map(
                (attribute: SerializedAttribute): Store => ({
                    ...attribute,
                    values:
                        attribute.input_type.toUpperCase() === 'NUMBER' ? attribute.values.join(';') : attribute.values,
                    type: attribute.input_type.toUpperCase(),
                }),
            );

            for (const attr of convertedAttributes) {
                delete attr.input_type;
            }

            formRef.current.setFieldsValue({ attributes: convertedAttributes });
        }

        focus();
    }, []);

    return (
        <Form onFinish={handleSubmit} layout='vertical' ref={formRef}>
            {renderFormItemsAndButtons()}
        </Form>
    );
};

export default LabelForm;
