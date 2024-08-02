import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'antd/lib/modal';
import Form, { RuleObject } from 'antd/lib/form';
import Text from 'antd/lib/typography/Text';
import Notification from 'antd/lib/notification';
import message from 'antd/lib/message';
import Upload, { RcFile } from 'antd/lib/upload';
import { CombinedState, StorageLocation } from 'reducers';
import { importActions, importBackupAsync } from 'actions/import-actions';
import SourceStorageField from 'components/storage/source-storage-field';
import Input from 'antd/lib/input/Input';
import { useTranslation } from 'react-i18next';

import { Storage, StorageData } from 'cvat-core-wrapper';
import { IllustFileIcon } from 'icons';
import './styles.scss';

type FormValues = {
    fileName?: string | undefined;
    sourceStorage: StorageData;
};

const initialValues: FormValues = {
    fileName: undefined,
    sourceStorage: {
        location: StorageLocation.LOCAL,
        cloudStorageId: undefined,
    },
};

function ImportBackupModal(): JSX.Element {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const instanceType = useSelector((state: CombinedState) => state.import.instanceType);
    const modalVisible = useSelector((state: CombinedState) => {
        if (instanceType && ['project', 'task'].includes(instanceType)) {
            return state.import[`${instanceType}s` as 'projects' | 'tasks'].backup.modalVisible;
        }
        return false;
    });
    const dispatch = useDispatch();
    const [selectedSourceStorage, setSelectedSourceStorage] = useState<StorageData>({
        location: StorageLocation.LOCAL,
    });

    const uploadLocalFile = (): JSX.Element => (
        <Form.Item
            getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                    return e;
                }
                return e?.fileList[0];
            }}
            name='dragger'
            rules={[{ required: true, message: t('drageAndDrop.message.require') }]}
        >
            <Upload.Dragger
                listType='text'
                fileList={file ? [file] : ([] as any[])}
                beforeUpload={(_file: RcFile): boolean => {
                    if (!['application/zip', 'application/x-zip-compressed'].includes(_file.type)) {
                        message.error(t('drageAndDrop.message.error'));
                    } else {
                        setFile(_file);
                    }
                    return false;
                }}
                onRemove={() => {
                    setFile(null);
                }}
            >
                <p className='ant-upload-drag-icon'>
                    <IllustFileIcon />
                </p>
                <p className='ant-upload-text'>{t('drageAndDrop.text')}</p>
            </Upload.Dragger>
        </Form.Item>
    );

    const validateFileName = (_: RuleObject, value: string): Promise<void> => {
        if (value) {
            const extension = value.toLowerCase().split('.')[1];
            if (extension !== 'zip') {
                return Promise.reject(new Error(t('drageAndDrop.message.error')));
            }
        }

        return Promise.resolve();
    };

    const renderCustomName = (): JSX.Element => (
        <Form.Item
            label={<Text strong>File name</Text>}
            name='fileName'
            rules={[{ validator: validateFileName }, { required: true, message: t('drageAndDrop.message.specify') }]}
        >
            <Input
                placeholder={t('drageAndDrop.message.backupFileName')}
                className='cvat-modal-import-filename-input'
            />
        </Form.Item>
    );

    const closeModal = useCallback((): void => {
        setSelectedSourceStorage({
            location: StorageLocation.LOCAL,
        });
        setFile(null);
        dispatch(importActions.closeImportBackupModal(instanceType as 'project' | 'task'));
        form.resetFields();
    }, [form, instanceType]);

    const handleImport = useCallback(
        (values: FormValues): void => {
            if (file === null && !values.fileName) {
                Notification.error({
                    message: t('drageAndDrop.message.noBackupSpecified'),
                });
                return;
            }
            const sourceStorage = new Storage({
                location: values.sourceStorage.location,
                cloudStorageId: values.sourceStorage?.cloudStorageId,
            });

            dispatch(importBackupAsync(instanceType, sourceStorage, file || (values.fileName as string)));

            Notification.info({
                message: `${t('drageAndDrop.message.create_1')} ${instanceType} ${t('drageAndDrop.message.create_2')}`,
                className: 'cvat-notification-notice-import-backup-start',
            });
            closeModal();
        },
        [instanceType, file],
    );

    return (
        <>
            <Modal
                title={
                    // eslint-disable-next-line react/jsx-wrap-multilines
                    <Text strong>
                        {`${t('drageAndDrop.message.createBackup_1')} ${instanceType} ${t(
                            'drageAndDrop.message.createBackup_2',
                        )}`}
                    </Text>
                }
                open={modalVisible}
                onCancel={closeModal}
                onOk={() => form.submit()}
                className='cvat-modal-import-backup'
            >
                <Form
                    name={`${t('drageAndDrop.message.createFileBackup_1')}${instanceType}${t(
                        'drageAndDrop.message.createFileBackup_2',
                    )}`}
                    form={form}
                    onFinish={handleImport}
                    layout='vertical'
                    initialValues={initialValues}
                >
                    <SourceStorageField
                        instanceId={null}
                        storageDescription={t('drageAndDrop.message.storageWithBackup')}
                        locationValue={selectedSourceStorage.location}
                        onChangeStorage={(value: StorageData) => setSelectedSourceStorage(new Storage(value))}
                        onChangeLocationValue={(value: StorageLocation) => {
                            setSelectedSourceStorage({
                                location: value,
                            });
                        }}
                    />
                    {selectedSourceStorage?.location === StorageLocation.CLOUD_STORAGE && renderCustomName()}
                    {selectedSourceStorage?.location === StorageLocation.LOCAL && uploadLocalFile()}
                </Form>
            </Modal>
        </>
    );
}

export default React.memo(ImportBackupModal);
