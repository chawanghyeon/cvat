import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { Button, Dropdown, MenuProps, Table, Col, Row } from 'antd';
import Icon from '@ant-design/icons/lib/components/Icon';
import { MoreOutlined } from '@ant-design/icons';
import { exportActions } from 'actions/export-actions';
import { JobStage } from 'reducers';
import { DataDownloadIcon, ExitIcon, JobActionIcon } from 'icons';
import { useTranslation } from 'react-i18next';

interface Props {
    dataSource: any[];
}

function JobsContentComponent(props: Props): JSX.Element {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { dataSource } = props;
    const history = useHistory();
    const { push } = history;
    const dimensions = {
        md: 22,
        lg: 22,
        xl: 18,
        xxl: 16,
    };
    function sorter(path: string) {
        return (obj1: any, obj2: any): number => {
            let currentObj1 = obj1;
            let currentObj2 = obj2;
            let field1: string | null = null;
            let field2: string | null = null;
            for (const pathSegment of path.split('.')) {
                field1 = currentObj1 && pathSegment in currentObj1 ? currentObj1[pathSegment] : null;
                field2 = currentObj2 && pathSegment in currentObj2 ? currentObj2[pathSegment] : null;
                currentObj1 = currentObj1 && pathSegment in currentObj1 ? currentObj1[pathSegment] : null;
                currentObj2 = currentObj2 && pathSegment in currentObj2 ? currentObj2[pathSegment] : null;
            }

            if (field1 && field2) {
                return field1.localeCompare(field2);
            }

            if (field1 === null) {
                return 1;
            }

            return -1;
        };
    }

    const columns = [
        {
            title: t('job.grid.job'),
            dataIndex: 'job',
            key: 'job',
            render: (id: number): JSX.Element => <div className='job-id'>{id}</div>,
            sorter: sorter('id'),
        },
        {
            title: t('job.grid.worker'),
            dataIndex: 'worker',
            key: 'worker',
            className: 'cvat-text-color cvat-job-item-assignee',
            render: (worker: any): JSX.Element => (
                <span className='cvat-job-item-assignee' style={worker === null ? { opacity: 0.4 } : {}}>
                    {worker ? worker.username : t('job.grid.no assignee')}
                </span>
            ),
        },
        {
            title: t('job.grid.checker'),
            dataIndex: 'checker',
            key: 'checker',
            className: 'cvat-text-color cvat-job-item-assignee',
            render: (checker: any): JSX.Element => (
                <span className='cvat-job-item-assignee' style={checker === null ? { opacity: 0.4 } : {}}>
                    {checker ? checker.username : t('job.grid.no assignee')}
                </span>
            ),
        },
        {
            title: t('job.grid.size'),
            dataIndex: 'size',
            key: 'size',
            className: 'cvat-text-color',
            render: (jobInstance: any): JSX.Element => (
                <span>{jobInstance.stopFrame - jobInstance.startFrame + 1}</span>
            ),
        },
        {
            title: t('job.grid.stage.title'),
            dataIndex: 'stage',
            key: 'stage',
            render: (jobInstance: any): JSX.Element => {
                const { stage } = jobInstance;
                const stageConfig = [
                    { key: JobStage.ANNOTATION, color: '#FB6E77', step: '1' },
                    { key: JobStage.REVIEW, color: '#9AB0FF', step: '2' },
                    { key: JobStage.ACCEPTANCE, color: '#31D2B5', step: '3' },
                ];
                return (
                    <div
                        className='cvat-job-item-stage'
                        style={{
                            borderColor: stageConfig.find((c) => c.key === stage)?.color,
                            color: stageConfig.find((c) => c.key === stage)?.color,
                            width: 120,
                        }}
                    >
                        {`${stageConfig.find((c) => c.key === stage)?.step} : ${t(`job.grid.stage.${stage}`)}`}
                    </div>
                );
            },
        },
        {
            title: t('job.grid.state.title'),
            dataIndex: 'state',
            key: 'state',
            className: 'cvat-job-item-state',
            render: (jobInstance: any): JSX.Element => {
                const { state } = jobInstance;
                const colorList = [
                    { key: 'new', color: '#31D2B5' },
                    { key: 'in progress', color: '#9AB0FF' },
                    { key: 'completed', color: '#D0D0D8' },
                    { key: 'rejected', color: '#FB6E77' },
                ];
                return (
                    <div
                        className='state-box'
                        style={{
                            borderColor: colorList.find((c) => c.key === state)?.color,
                            color: colorList.find((c) => c.key === state)?.color,
                            width: 115,
                        }}
                    >
                        {t(`job.grid.state.${state}`)}
                    </div>
                );
            },
        },
        {
            title: t(`job.grid.actions`),
            dataIndex: 'actions',
            key: 'actions',
            className: 'cvat-job-actions',
            render: (jobInstance: any): JSX.Element => (
                <div
                    onClick={(e: React.MouseEvent): void => {
                        e.preventDefault();
                        push(`/tasks/${jobInstance.taskId}/jobs/${jobInstance.id}`);
                    }}
                    aria-hidden='true'
                >
                    <JobActionIcon />
                </div>
            ),
        },
        {
            title: t(`job.grid.etc.title`),
            dataIndex: 'etc',
            key: 'etc',
            className: 'cvat-job-etc',
            render: (jobInstance: any): JSX.Element => {
                const items: MenuProps['items'] = [
                    {
                        key: 'task',
                        label: (
                            <Button
                                type='link'
                                icon={<Icon component={ExitIcon} />}
                                onClick={() => {
                                    history.push(`/tasks/${jobInstance.taskId}`);
                                }}
                            >
                                {t(`job.grid.etc.button.goToTask`)}
                            </Button>
                        ),
                        disabled: jobInstance.taskId === null,
                        className: 'cvat-job-etc-dropdown-item',
                    },
                    {
                        key: 'project',
                        label: (
                            <Button
                                type='link'
                                icon={<Icon component={ExitIcon} />}
                                onClick={() => {
                                    history.push(`/projects/${jobInstance.projectId}`);
                                }}
                            >
                                {t(`job.grid.etc.button.goToProject`)}
                            </Button>
                        ),
                        disabled: jobInstance.projectId === null,
                        className: 'cvat-job-etc-dropdown-item',
                    },
                    {
                        key: 'export_job',
                        label: (
                            <Button
                                type='link'
                                icon={<Icon component={DataDownloadIcon} />}
                                onClick={(e) => {
                                    e.preventDefault();
                                    dispatch(exportActions.openExportDatasetModal(jobInstance));
                                }}
                            >
                                {t(`job.grid.etc.button.exportJob`)}
                            </Button>
                        ),
                        className: 'cvat-job-etc-dropdown-item',
                    },
                ];
                return (
                    <Dropdown menu={{ items }}>
                        <MoreOutlined className='cvat-job-card-more-button' />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <Row justify='center' align='middle'>
            <Col className='cvat-jobs-page-list' {...dimensions}>
                <Table
                    rowClassName={() => 'cvat-jobs-table-row'}
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{ position: ['bottomCenter'], pageSize: 5 }}
                />
            </Col>
        </Row>
    );
}

export default React.memo(JobsContentComponent);
