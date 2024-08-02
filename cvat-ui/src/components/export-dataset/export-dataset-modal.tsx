import './styles.scss';
import React, { useState, useEffect, useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import Modal from 'antd/lib/modal';
import Notification from 'antd/lib/notification';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import Text from 'antd/lib/typography/Text';
import Select from 'antd/lib/select';
import Checkbox from 'antd/lib/checkbox';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import { CombinedState, StorageLocation } from 'reducers';
import { Row, Col } from 'antd/lib/grid';

import { exportActions, exportDatasetAsync } from 'actions/export-actions';
import { getCore, Storage, StorageData } from 'cvat-core-wrapper';

const core = getCore();

type FormValues = {
    selectedFormat: string | undefined;
    saveImages: boolean;
    customName: string | undefined;
    targetStorage: StorageData;
    useProjectTargetStorage: boolean;
    downloadOnlyAccepted: boolean;
};

const initialValues: FormValues = {
    selectedFormat: undefined,
    saveImages: false,
    customName: undefined,
    targetStorage: {
        location: StorageLocation.LOCAL,
        cloudStorageId: undefined,
    },
    useProjectTargetStorage: true,
    downloadOnlyAccepted: false,
};

function ExportDatasetModal(props: StateToProps): JSX.Element {
    const {
        dumpers,
        instance,
        current,
    } = props;
    const [instanceType, setInstanceType] = useState('');
    const [useDefaultTargetStorage, setUseDefaultTargetStorage] = useState(true);
    const [form] = Form.useForm();
    const [targetStorage, setTargetStorage] = useState<StorageData>({
        location: StorageLocation.LOCAL,
    });
    const [defaultStorageLocation, setDefaultStorageLocation] = useState(StorageLocation.LOCAL);
    const [defaultStorageCloudId, setDefaultStorageCloudId] = useState<number | null>(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (instance instanceof core.classes.Project) {
            setInstanceType(`project #${instance.id}`);
        } else if (instance instanceof core.classes.Task || instance instanceof core.classes.Job) {
            if (instance instanceof core.classes.Task) {
                setInstanceType(`task #${instance.id}`);
            } else {
                setInstanceType(`job #${instance.id}`);
            }
            if (instance.mode === 'interpolation' && instance.dimension === '2d') {
                form.setFieldsValue({ selectedFormat: 'CVAT for video 1.1' });
            } else if (instance.mode === 'annotation' && instance.dimension === '2d') {
                form.setFieldsValue({ selectedFormat: 'CVAT for images 1.1' });
            }
        }
    }, [instance]);

    useEffect(() => {
        if (instance) {
            if (instance instanceof core.classes.Project || instance instanceof core.classes.Task) {
                setDefaultStorageLocation(instance.targetStorage?.location || StorageLocation.LOCAL);
                setDefaultStorageCloudId(instance.targetStorage?.cloudStorageId || null);
            } else {
                core.tasks.get({ id: instance.taskId })
                    .then((response: any) => {
                        if (response.length) {
                            const [taskInstance] = response;
                            setDefaultStorageLocation(taskInstance.targetStorage?.location || StorageLocation.LOCAL);
                            setDefaultStorageCloudId(taskInstance.targetStorage?.cloudStorageId || null);
                        }
                    })
                    .catch((error: Error) => {
                        if ((error as any).code !== 403) {
                            Notification.error({
                                message: `Could not fetch the task ${instance.taskId}`,
                                description: error.toString(),
                            });
                        }
                    });
            }
        }
    }, [instance]);

    const closeModal = (): void => {
        setUseDefaultTargetStorage(true);
        setTargetStorage({ location: StorageLocation.LOCAL });
        form.resetFields();
        dispatch(exportActions.closeExportDatasetModal(instance));
    };

    const handleExport = useCallback(
        (values: FormValues): void => {
            // have to validate format before so it would not be undefined
            dispatch(
                exportDatasetAsync(
                    instance,
                    values.selectedFormat as string,
                    values.saveImages,
                    useDefaultTargetStorage,
                    useDefaultTargetStorage ? new Storage({
                        location: defaultStorageLocation,
                        cloudStorageId: defaultStorageCloudId || undefined,
                    }) : new Storage(targetStorage),
                    values.downloadOnlyAccepted,
                    values.customName ? `${values.customName}.zip` : undefined,
                ),
            );
            closeModal();
            const resource = values.saveImages ? 'Dataset' : 'Annotations';
            Notification.info({
                message: `${resource} export started`,
                description:
                `${resource} export was started for ${instanceType}. ` +
                `Download will start automatically as soon as the ${resource} is ready.`,
                className: `cvat-notification-notice-export-${instanceType.split(' ')[0]}-start`,
            });
        },
        [instance, instanceType, useDefaultTargetStorage, defaultStorageLocation, defaultStorageCloudId, targetStorage],
    );

    return (
        <Modal
            title={`Export ${instanceType} as a dataset`}
            open={!!instance}
            onCancel={closeModal}
            onOk={() => form.submit()}
            className={`cvat-modal-export-${instanceType.split(' ')[0]} cvat-modal-export-form`}
            destroyOnClose
            width={450}
        >
            <Form
                name='Export dataset'
                form={form}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                initialValues={initialValues}
                onFinish={handleExport}
            >
                <Row className='cvat-modal-export-form-format'>
                    <Form.Item
                        name='selectedFormat'
                        label='Format'
                        rules={[{ required: true, message: 'Format must be selected' }]}
                    >
                        <Select virtual={false} placeholder='Select dataset format' className='cvat-modal-export-select'>
                            {dumpers
                                .sort((a: any, b: any) => a.name.localeCompare(b.name))
                                .filter((dumper: any): boolean => dumper.dimension === instance?.dimension)
                                .map(
                                    (dumper: any): JSX.Element => {
                                        const pending = (instance && current ? current : [])
                                            .includes(dumper.name);
                                        const disabled = !dumper.enabled || pending;
                                        return (
                                            <Select.Option
                                                value={dumper.name}
                                                key={dumper.name}
                                                disabled={disabled}
                                                className='cvat-modal-export-option-item'
                                            >
                                                <DownloadOutlined />
                                                <Text disabled={disabled}>{dumper.name}</Text>
                                                {pending && <LoadingOutlined style={{ marginLeft: 10 }} />}
                                            </Select.Option>
                                        );
                                    },
                                )}
                        </Select>
                    </Form.Item>
                </Row>
                <Row>
                    <Col push={4} span={20}>
                        <Form.Item name='saveImages' valuePropName='checked'>
                            <Checkbox>Save images</Checkbox>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name='customName' label='Name'>
                    <Input
                        placeholder='Custom name for a dataset'
                        className='cvat-modal-export-filename-input'
                        suffix={<Text>.zip</Text>}
                    />
                </Form.Item>
                <Row>
                    <Col push={4} span={20}>
                        <Form.Item name='downloadOnlyAccepted' valuePropName='checked'>
                            <Checkbox
                                defaultChecked={false}
                                onChange={(event: any): void => {
                                    initialValues.downloadOnlyAccepted = event.target.checked;
                                }}
                            >
                                Download only accepted jobs
                            </Checkbox>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}

interface StateToProps {
    dumpers: any;
    instance: any;
    current: any;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const { instanceType } = state.export;
    const instance = !instanceType ? null : (
        state.export[`${instanceType}s` as 'projects' | 'tasks' | 'jobs']
    ).dataset.modalInstance;

    return {
        instance,
        current: !instanceType ? [] : (
            state.export[`${instanceType}s` as 'projects' | 'tasks' | 'jobs']
        ).dataset.current[instance.id],
        dumpers: state.formats.annotationFormats.dumpers,
    };
}

export default connect(mapStateToProps)(ExportDatasetModal);
