import React, { RefObject } from 'react';
import { Row, Col } from 'antd/lib/grid';
import { MinusOutlined, PercentageOutlined, PlusOutlined } from '@ant-design/icons';
import Select from 'antd/lib/select';
import Radio from 'antd/lib/radio';
import Checkbox from 'antd/lib/checkbox';
import Form, { FormInstance, RuleObject, RuleRender } from 'antd/lib/form';
import Text from 'antd/lib/typography/Text';
import { Store } from 'antd/lib/form/interface';
import CVATTooltip from 'components/common/cvat-tooltip';
import patterns from 'utils/validation-patterns';
import { InputNumber } from 'antd';
import { StorageLocation } from 'reducers';

import { getCore, Storage, StorageData } from 'cvat-core-wrapper';

const core = getCore();

const { Option } = Select;

export enum SortingMethod {
    LEXICOGRAPHICAL = 'lexicographical',
    NATURAL = 'natural',
    PREDEFINED = 'predefined',
    RANDOM = 'random',
}

export interface AdvancedConfiguration {
    bugTracker?: string;
    imageQuality?: number;
    overlapSize?: number;
    segmentSize?: number;
    startFrame?: number;
    stopFrame?: number;
    frameFilter?: string;
    lfs: boolean;
    format?: string,
    repository?: string;
    useZipChunks: boolean;
    dataChunkSize?: number;
    useCache: boolean;
    copyData?: boolean;
    sortingMethod: SortingMethod;
    useProjectSourceStorage: boolean;
    useProjectTargetStorage: boolean;
    sourceStorage: StorageData;
    targetStorage: StorageData;
}

const initialValues: AdvancedConfiguration = {
    imageQuality: 70,
    lfs: false,
    useZipChunks: true,
    useCache: true,
    copyData: false,
    sortingMethod: SortingMethod.LEXICOGRAPHICAL,
    useProjectSourceStorage: true,
    useProjectTargetStorage: true,

    sourceStorage: {
        location: StorageLocation.LOCAL,
        cloudStorageId: undefined,
    },
    targetStorage: {
        location: StorageLocation.LOCAL,
        cloudStorageId: undefined,
    },
};

interface Props {
    onSubmit(values: AdvancedConfiguration): void;
    onChangeUseProjectSourceStorage(value: boolean): void;
    onChangeUseProjectTargetStorage(value: boolean): void;
    onChangeSourceStorageLocation: (value: StorageLocation) => void;
    onChangeTargetStorageLocation: (value: StorageLocation) => void;
    installedGit: boolean;
    projectId: number | null;
    useProjectSourceStorage: boolean;
    useProjectTargetStorage: boolean;
    activeFileManagerTab: string;
    dumpers: [];
    sourceStorageLocation: StorageLocation;
    targetStorageLocation: StorageLocation;
}

function validateURL(_: RuleObject, value: string): Promise<void> {
    if (value && !patterns.validateURL.pattern.test(value)) {
        return Promise.reject(new Error('URL is not a valid URL'));
    }

    return Promise.resolve();
}

function validateRepositoryPath(_: RuleObject, value: string): Promise<void> {
    if (value && !patterns.validatePath.pattern.test(value)) {
        return Promise.reject(new Error('Repository path is not a valid path'));
    }

    return Promise.resolve();
}

function validateRepository(_: RuleObject, value: string): Promise<[void, void]> | Promise<void> {
    if (value) {
        const [url, path] = value.split(/\s+/);
        return Promise.all([validateURL(_, url), validateRepositoryPath(_, path)]);
    }

    return Promise.resolve();
}

const isInteger = ({ min, max }: { min?: number; max?: number }) => (
    _: RuleObject,
    value?: number | string,
): Promise<void> => {
    if (typeof value === 'undefined' || value === '') {
        return Promise.resolve();
    }

    const intValue = +value;
    if (Number.isNaN(intValue) || !Number.isInteger(intValue)) {
        return Promise.reject(new Error('Value must be a positive integer'));
    }

    if (typeof min !== 'undefined' && intValue < min) {
        return Promise.reject(new Error(`Value must be more than ${min}`));
    }

    if (typeof max !== 'undefined' && intValue > max) {
        return Promise.reject(new Error(`Value must be less than ${max}`));
    }

    return Promise.resolve();
};

const validateOverlapSize: RuleRender = ({ getFieldValue }): RuleObject => ({
    validator(_: RuleObject, value?: string | number): Promise<void> {
        if (typeof value !== 'undefined' && value !== '') {
            const segmentSize = getFieldValue('segmentSize');
            if (typeof segmentSize !== 'undefined' && segmentSize !== '') {
                if (+segmentSize <= +value) {
                    return Promise.reject(new Error('Segment size must be more than overlap size'));
                }
            }
        }

        return Promise.resolve();
    },
});

const validateStopFrame: RuleRender = ({ getFieldValue }): RuleObject => ({
    validator(_: RuleObject, value?: string | number): Promise<void> {
        if (typeof value !== 'undefined' && value !== '') {
            const startFrame = getFieldValue('startFrame');
            if (typeof startFrame !== 'undefined' && startFrame !== '') {
                if (+startFrame > +value) {
                    return Promise.reject(new Error('Start frame must not be more than stop frame'));
                }
            }
        }

        return Promise.resolve();
    },
});

class AdvancedConfigurationForm extends React.PureComponent<Props> {
    private formRef: RefObject<FormInstance>;

    public constructor(props: Props) {
        super(props);
        this.formRef = React.createRef<FormInstance>();
    }

    public submit(): Promise<void> {
        const { onSubmit, projectId } = this.props;
        if (this.formRef.current) {
            if (projectId) {
                return Promise.all([
                    core.projects.get({ id: projectId }),
                    this.formRef.current.validateFields(),
                ]).then(([getProjectResponse, values]) => {
                    const [project] = getProjectResponse;
                    const frameFilter = values.frameStep ? `step=${values.frameStep}` : undefined;
                    const entries = Object.entries(values).filter(
                        (entry: [string, unknown]): boolean => entry[0] !== frameFilter,
                    );

                    onSubmit({
                        ...((Object.fromEntries(entries) as any) as AdvancedConfiguration),
                        frameFilter,
                        sourceStorage: values.useProjectSourceStorage ?
                            new Storage(project.sourceStorage || { location: StorageLocation.LOCAL }) :
                            new Storage(values.sourceStorage),
                        targetStorage: values.useProjectTargetStorage ?
                            new Storage(project.targetStorage || { location: StorageLocation.LOCAL }) :
                            new Storage(values.targetStorage),
                    });
                    return Promise.resolve();
                });
            }
            return this.formRef.current.validateFields()
                .then(
                    (values: Store): Promise<void> => {
                        const frameFilter = values.frameStep ? `step=${values.frameStep}` : undefined;
                        const entries = Object.entries(values).filter(
                            (entry: [string, unknown]): boolean => entry[0] !== frameFilter,
                        );
                        onSubmit({
                            ...((Object.fromEntries(entries) as any) as AdvancedConfiguration),
                            frameFilter,
                            sourceStorage: new Storage({ location: StorageLocation.LOCAL }),
                            targetStorage: new Storage({ location: StorageLocation.LOCAL }),
                        });
                        return Promise.resolve();
                    },
                );
        }

        return Promise.reject(new Error('Form ref is empty'));
    }

    public resetFields(): void {
        if (this.formRef.current) {
            this.formRef.current.resetFields();
        }
    }

    /* eslint-disable class-methods-use-this */
    private renderCopyDataChechbox(): JSX.Element {
        return (
            <Form.Item
                help='If you have a low data transfer rate over the network you can copy data into CVAT to speed up work'
                name='copyData'
                valuePropName='checked'
            >
                <Checkbox>
                    <Text className='cvat-text-color'>Copy data into CVAT</Text>
                </Checkbox>
            </Form.Item>
        );
    }

    private renderSortingMethodRadio(): JSX.Element {
        return (
            <Form.Item
                label={<Text className='cvat-text-color'>Sorting Method</Text>}
                name='sortingMethod'
                rules={[
                    {
                        required: true,
                        message: 'The field is required.',
                    },
                ]}
            >
                <Radio.Group>
                    <Radio value={SortingMethod.LEXICOGRAPHICAL} key={SortingMethod.LEXICOGRAPHICAL}>
                        Lexicographical
                    </Radio>
                    <Radio value={SortingMethod.NATURAL} key={SortingMethod.NATURAL}>Natural</Radio>
                    <Radio value={SortingMethod.PREDEFINED} key={SortingMethod.PREDEFINED}>
                        Predefined
                    </Radio>
                    <Radio value={SortingMethod.RANDOM} key={SortingMethod.RANDOM}>Random</Radio>
                </Radio.Group>
            </Form.Item>
        );
    }

    private renderImageQuality(): JSX.Element {
        return (
            <CVATTooltip title='Defines images compression level'>
                <Form.Item
                    label={<Text className='cvat-text-color'>Image quality</Text>}
                    name='imageQuality'
                    rules={[
                        {
                            required: true,
                            message: 'The field is required.',
                        },
                        { validator: isInteger({ min: 5, max: 100 }) },
                    ]}
                >
                    <InputNumber
                        size='large'
                        min={5}
                        max={100}
                        upHandler={<PlusOutlined />}
                        downHandler={<MinusOutlined />}
                        addonAfter={<PercentageOutlined />}
                    />
                </Form.Item>
            </CVATTooltip>
        );
    }

    private renderOverlap(): JSX.Element {
        return (
            <CVATTooltip title='Defines a number of intersected frames between different segments'>
                <Form.Item
                    label={<Text className='cvat-text-color'>Overlap size</Text>}
                    name='overlapSize'
                    dependencies={['segmentSize']}
                    rules={[{ validator: isInteger({ min: 0 }) }, validateOverlapSize]}
                >
                    <InputNumber
                        size='large'
                        min={0}
                        upHandler={<PlusOutlined />}
                        downHandler={<MinusOutlined />}
                    />
                </Form.Item>
            </CVATTooltip>
        );
    }

    private renderSegmentSize(): JSX.Element {
        return (
            <CVATTooltip title='Defines a number of frames in a segment'>
                <Form.Item label={<Text className='cvat-text-color'>Segment size</Text>} name='segmentSize' rules={[{ validator: isInteger({ min: 1 }) }]}>
                    <InputNumber
                        size='large'
                        min={1}
                        upHandler={<PlusOutlined />}
                        downHandler={<MinusOutlined />}
                    />
                </Form.Item>
            </CVATTooltip>
        );
    }

    private renderStartFrame(): JSX.Element {
        return (
            <Form.Item label={<Text className='cvat-text-color'>Start frame</Text>} name='startFrame' rules={[{ validator: isInteger({ min: 0 }) }]}>
                <InputNumber
                    size='large'
                    min={0}
                    step={1}
                    upHandler={<PlusOutlined />}
                    downHandler={<MinusOutlined />}
                />
            </Form.Item>
        );
    }

    private renderStopFrame(): JSX.Element {
        return (
            <Form.Item
                label={<Text className='cvat-text-color'>Stop frame</Text>}
                name='stopFrame'
                dependencies={['startFrame']}
                rules={[{ validator: isInteger({ min: 0 }) }, validateStopFrame]}
            >
                <InputNumber
                    size='large'
                    min={0}
                    step={1}
                    upHandler={<PlusOutlined />}
                    downHandler={<MinusOutlined />}
                />
            </Form.Item>
        );
    }

    private renderFrameStep(): JSX.Element {
        return (
            <Form.Item label={<Text className='cvat-text-color'>Frame step</Text>} name='frameStep' rules={[{ validator: isInteger({ min: 1 }) }]}>
                <InputNumber
                    size='large'
                    min={1}
                    step={1}
                    upHandler={<PlusOutlined />}
                    downHandler={<MinusOutlined />}
                />
            </Form.Item>
        );
    }

    private renderGitLFSBox(): JSX.Element {
        return (
            <CVATTooltip
                title={(
                    <>
                        If annotation files are large, you can use git LFS feature
                    </>
                )}
                placement='topLeft'
            >
                <Form.Item
                    name='lfs'
                    label={<Text className='cvat-text-color'>LFS</Text>}
                    valuePropName='checked'
                >
                    <Checkbox>
                        <span className='cvat-text-color' style={{ fontWeight: 300 }}>Use LFS (Large File Support)</span>
                    </Checkbox>
                </Form.Item>
            </CVATTooltip>
        );
    }

    private renderGitFormat(): JSX.Element {
        const { dumpers } = this.props;
        return (
            <Form.Item
                initialValue='CVAT for video 1.1'
                name='format'
                label={<Text className='cvat-text-color'>Choose format</Text>}
            >
                <Select style={{ width: '100%' }}>
                    {
                        dumpers.map((dumper: any) => (
                            <Option
                                key={dumper.name}
                                value={dumper.name}
                            >
                                {dumper.name}
                            </Option>
                        ))
                    }
                </Select>
            </Form.Item>
        );
    }

    private renderGit(): JSX.Element {
        return (
            <>
                <Row>
                    <Col span={24}>{this.renderGitFormat()}</Col>
                </Row>
                <Row>
                    <Col span={24}>{this.renderGitLFSBox()}</Col>
                </Row>

            </>
        );
    }

    private renderUzeZipChunks(): JSX.Element {
        return (
            <CVATTooltip
                title={(
                    <>
                        Force to use zip chunks as compressed data. Cut out content for videos only.
                    </>
                )}
            >
                <Form.Item
                    name='useZipChunks'
                    valuePropName='checked'
                >
                    <Checkbox>
                        <span className='cvat-text-color' style={{ fontWeight: 300 }}>Use zip/video chunks</span>
                    </Checkbox>
                </Form.Item>
            </CVATTooltip>
        );
    }

    private renderCreateTaskMethod(): JSX.Element {
        return (
            <CVATTooltip
                title={(
                    <>
                        Using cache to store data.
                    </>
                )}
            >
                <Form.Item name='useCache' valuePropName='checked'>
                    <Checkbox>
                        <span className='cvat-text-color' style={{ fontWeight: 300 }}>Use cache</span>
                    </Checkbox>
                </Form.Item>
            </CVATTooltip>
        );
    }

    private renderChunkSize(): JSX.Element {
        return (
            <CVATTooltip
                title={(
                    <>
                        Defines a number of frames to be packed in a chunk when send from client to server. Server
                        defines automatically if empty.
                        <br />
                        Recommended values:
                        <br />
                        1080p or less: 36
                        <br />
                        2k or less: 8 - 16
                        <br />
                        4k or less: 4 - 8
                        <br />
                        More: 1 - 4
                    </>
                )}
            >
                <Form.Item label={<Text className='cvat-text-color'>Chunk size</Text>} name='dataChunkSize' rules={[{ validator: isInteger({ min: 1 }) }]}>
                    <InputNumber
                        size='large'
                        upHandler={<PlusOutlined />}
                        downHandler={<MinusOutlined />}
                    />
                </Form.Item>
            </CVATTooltip>
        );
    }

    public render(): JSX.Element {
        const { installedGit, activeFileManagerTab } = this.props;
        return (
            <Form initialValues={initialValues} ref={this.formRef}>
                <Row align='middle'>
                    <Col>{this.renderSortingMethodRadio()}</Col>
                </Row>
                {activeFileManagerTab === 'share' ? (
                    <Row>
                        <Col>{this.renderCopyDataChechbox()}</Col>
                    </Row>
                ) : null}
                <Row>
                    <Col span={3}>
                        <Text className='cvat-text-color'>Options</Text>
                    </Col>
                    <Col span={6}>
                        {this.renderUzeZipChunks()}
                    </Col>
                    <Col span={4}>
                        {this.renderCreateTaskMethod()}
                    </Col>
                    <Col span={11}>
                        {this.renderImageQuality()}
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        {this.renderOverlap()}
                    </Col>
                    <Col span={11} offset={2}>
                        {this.renderSegmentSize()}
                    </Col>
                </Row>

                <Row>
                    <Col span={11}>{this.renderStartFrame()}</Col>
                    <Col span={11} offset={2}>
                        {this.renderStopFrame()}
                    </Col>
                </Row>

                <Row>
                    <Col span={11}>
                        {this.renderFrameStep()}
                    </Col>
                    <Col span={11} offset={2}>
                        {this.renderChunkSize()}
                    </Col>
                </Row>

                {installedGit ? this.renderGit() : null}
            </Form>
        );
    }
}

export default AdvancedConfigurationForm;
