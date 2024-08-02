import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import { ColumnFilterItem } from 'antd/lib/table/interface';
import Table from 'antd/lib/table';
import Text from 'antd/lib/typography/Text';
import moment from 'moment';
import config from 'config';
import { Task, Job } from 'cvat-core-wrapper';
import { JobStage } from 'reducers';
import { Steps, Tooltip } from 'antd';
import Icon from '@ant-design/icons/lib/components/Icon';
import { FilterIcon, JobActionIcon } from 'icons';
import { useTranslation } from 'react-i18next';
import UserSelector, { User } from './user-selector';
import JobListCheckBox from './job-list-checkbox';

interface Props {
    task: Task;
    onUpdateJob(jobInstance: Job): void;
}

// function ReviewSummaryComponent({ jobInstance }: { jobInstance: any }): JSX.Element {
//     const [summary, setSummary] = useState<Record<string, any> | null>(null);
//     const [error, setError] = useState<any>(null);
//     useEffect(() => {
//         setError(null);
//         jobInstance
//             .issues(jobInstance.id)
//             .then((issues: any[]) => {
//                 setSummary({
//                     issues_unsolved: issues.filter((issue) => !issue.resolved).length,
//                     issues_resolved: issues.filter((issue) => issue.resolved).length,
//                 });
//             })
//             .catch((_error: any) => {
//                 // eslint-disable-next-line
//                 console.log(_error);
//                 setError(_error);
//             });
//     }, []);

//     if (!summary) {
//         if (error) {
//             if (error.toString().includes('403')) {
//                 return <p>You do not have permissions</p>;
//             }

//             return <p>Could not fetch, check console output</p>;
//         }

//         return (
//             <>
//                 <p>Loading.. </p>
//                 <LoadingOutlined />
//             </>
//         );
//     }

//     return (
//         <table className='cvat-review-summary-description'>
//             <tbody>
//                 <tr>
//                     <td>
//                         <Text strong>Unsolved issues</Text>
//                     </td>
//                     <td>{summary.issues_unsolved}</td>
//                 </tr>
//                 <tr>
//                     <td>
//                         <Text strong>Resolved issues</Text>
//                     </td>
//                     <td>{summary.issues_resolved}</td>
//                 </tr>
//             </tbody>
//         </table>
//     );
// }

function JobListComponent(props: Props): JSX.Element {
    const { task: taskInstance, onUpdateJob } = props;

    console.log('taskInstance : ', taskInstance);

    const { t } = useTranslation();
    const history = useHistory();
    const [allCount, SetAllCount] = useState<number>(0);
    const { jobs, id: taskId, labels } = taskInstance;

    // task 상세 페이지에서 job list를 보여줄 때, 오름차순으로 정렬
    jobs.sort((a, b) => a.id - b.id);

    const stepItem = [
        { title: t(`job.grid.stage.${JobStage.ANNOTATION}`), key: `${JobStage.ANNOTATION}` },
        { title: t(`job.grid.stage.${JobStage.REVIEW}`), key: `${JobStage.REVIEW}` },
        { title: t(`job.grid.stage.${JobStage.ACCEPTANCE}`), key: `${JobStage.ACCEPTANCE}` },
    ];

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

    function collectUsers(path: string): ColumnFilterItem[] {
        return Array.from<string | null>(
            new Set(
                jobs.map((job: any) => {
                    if (job[path] === null) {
                        return null;
                    }

                    return job[path].username;
                }),
            ),
        ).map((value: string | null) => ({ text: value || 'Is Empty', value: value || false }));
    }

    const columns = [
        {
            title: 'R/O',
            dataIndex: 'etc',
            key: 'etc',
            render: (_: any, jobInstance: any): JSX.Element => (
                <JobListCheckBox etc={jobInstance.etc} jid={jobInstance.key} jobs={jobs} onUpdateJob={onUpdateJob} />
            ),
        },
        {
            title: t('tasks.grid.job'),
            dataIndex: 'job',
            key: 'job',
            render: (id: number): JSX.Element => <div className='job-id'>{id}</div>,
        },
        {
            title: t('tasks.grid.objects'),
            dataIndex: 'object',
            key: 'object',
            className: 'cvat-text-color cvat-job-item-frames',
            render: (objectInstance: any): JSX.Element => {
                const { count, labelsCount, labels: jobLabels } = objectInstance;
                console.log('objectInstance : ', objectInstance);

                const newLabels = jobLabels?.map((label: any) => {
                    const labelCount = labelsCount[label.id];
                    return {
                        id: label?.id,
                        name: label?.name,
                        color: label?.color,
                        count: labelCount,
                    };
                });

                console.log('newLabels: ', newLabels);

                return (
                    <Tooltip
                        title={
                            newLabels?.map((label: any) => (
                                <div
                                    key={label?.id}
                                    style={{ background: '#000' || config.NEW_LABEL_COLOR }}
                                    className='cvat-constructor-viewer-item'
                                >
                                    <svg height='8' width='8' style={{ fill: label?.color || config.NEW_LABEL_COLOR }}>
                                        <circle cx='4' cy='4' r='4' strokeWidth='0' />
                                    </svg>

                                    <Text>{label?.name}</Text>
                                    <Text>{' : '}</Text>
                                    <Text>{label?.count}</Text>
                                </div>
                            )) || ''
                        }
                    >
                        <div
                            style={{
                                cursor: 'pointer',
                            }}
                        >
                            {count}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: t('tasks.grid.frames'),
            dataIndex: 'frames',
            key: 'frames',
            className: 'cvat-text-color cvat-job-item-frames',
        },
        {
            title: `${t('filter.stage')}`,
            dataIndex: 'stage',
            key: 'stage',
            render: (jobInstance: any): JSX.Element => {
                const { stage } = jobInstance;

                return (
                    <div id='cvat-job-item-stage'>
                        <Steps
                            size='small'
                            current={stepItem.findIndex((item) => item.key === stage)}
                            onChange={(idx: number) => {
                                const stageValue = stepItem[idx].title;
                                jobInstance.stage = t(`filter.jobs.stage.${stageValue}`);
                                onUpdateJob(jobInstance);
                            }}
                            items={stepItem}
                        />
                    </div>
                );
            },
            sorter: sorter('stage.stage'),
            filters: [
                { text: `${t('filter.jobs.stage.annotation')}`, value: 'annotation' },
                { text: `${t('filter.jobs.stage.validation')}`, value: 'validation' },
                { text: `${t('filter.jobs.stage.acceptance')}`, value: 'acceptance' },
            ],
            filterIcon: <Icon component={FilterIcon} style={{ fill: '#fff' }} />,
            onFilter: (value: string | number | boolean, record: any) => record.stage.stage === value,
        },
        {
            title: `${t('filter.state')}`,
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
                        }}
                    >
                        {t(`filter.jobs.state.${state}`)}
                    </div>
                );
            },
            sorter: sorter('state.state'),
            filters: [
                { text: `${t('filter.jobs.state.new')}`, value: 'new' },
                { text: `${t('filter.jobs.state.in progress')}`, value: 'in progress' },
                { text: `${t('filter.jobs.state.rejected')}`, value: 'completed' },
                { text: `${t('filter.jobs.state.completed')}`, value: 'rejected' },
            ],
            filterIcon: <Icon component={FilterIcon} style={{ fill: '#fff' }} />,
            onFilter: (value: string | number | boolean, record: any) => record.state.state === value,
        },
        {
            title: t('tasks.grid.started'),
            dataIndex: 'started',
            key: 'started',
            className: 'cvat-text-color',
        },
        {
            title: t('tasks.grid.lastWorked'),
            dataIndex: 'updated',
            key: 'updated',
            className: 'cvat-text-color',
        },
        {
            title: t('tasks.grid.worker'),
            dataIndex: 'worker',
            key: 'worker',
            className: 'cvat-job-item-assignee',
            render: (jobInstance: any): JSX.Element => (
                <UserSelector
                    className='cvat-job-assignee-selector'
                    value={jobInstance.worker}
                    onSelect={(value: User | null): void => {
                        if (jobInstance?.worker?.id === value?.id) return;
                        jobInstance.worker = value;
                        onUpdateJob(jobInstance);
                    }}
                    suffix
                />
            ),
            sorter: sorter('worker.worker.username'),
            filters: collectUsers('worker'),
            filterIcon: <Icon component={FilterIcon} style={{ fill: '#fff' }} />,
            // eslint-disable-next-line max-len
            onFilter: (value: string | number | boolean, record: any) =>
                (record.worker.worker?.username || false) === value,
        },
        {
            title: t('job.grid.checker'),
            dataIndex: 'checker',
            key: 'checker',
            className: 'cvat-job-item-assignee',
            render: (jobInstance: any): JSX.Element => (
                <UserSelector
                    className='cvat-job-assignee-selector'
                    value={jobInstance.checker}
                    onSelect={(value: User | null): void => {
                        if (jobInstance?.checker?.id === value?.id) return;
                        jobInstance.checker = value;
                        onUpdateJob(jobInstance);
                    }}
                    suffix
                />
            ),
            sorter: sorter('checker.checker.username'),
            filters: collectUsers('checker'),
            filterIcon: <Icon component={FilterIcon} style={{ fill: '#fff' }} />,
            // eslint-disable-next-line max-len
            onFilter: (value: string | number | boolean, record: any) =>
                (record.checker.checker?.username || false) === value,
        },
        {
            title: t('tasks.grid.actions'),
            dataIndex: 'actions',
            key: 'actions',
            className: 'cvat-job-actions',
            render: (id: number): JSX.Element => (
                <a
                    onClick={(e: React.MouseEvent): void => {
                        e.preventDefault();
                        history.push(`/tasks/${taskId}/jobs/${id}`);
                    }}
                    href={`/tasks/${taskId}/jobs/${id}`}
                >
                    <JobActionIcon />
                </a>
            ),
        },
    ];

    useEffect(() => {
        const count = jobs.reduce((sum: number, job: any) => sum + job.labeled_annotation_count, 0);
        SetAllCount(count);
    }, [jobs]);

    const data = jobs.reduce((acc: any[], job: any) => {
        console.log('job : ', job);
        acc.push({
            key: job.id,
            job: job.id,
            object: {
                count: Number(job.labeled_annotation_count).toLocaleString(),
                labelsCount: job.labeled_annotations,
                labels: job.labels,
            },
            frames: `${job.startFrame}-${job.stopFrame}`,
            state: job,
            stage: job,
            started: `${job.updatedDate ? moment(job.updatedDate).format('YYYY.MM.DD HH:mm:ss') : '-'}`,
            updated: `${job.savedDate ? moment(job.savedDate).format('YYYY.MM.DD HH:mm:ss') : '-'}`,
            worker: job,
            checker: job,
            actions: job.id,
            etc: job.etc,
        });
        return acc;
    }, []);

    return (
        <div className='cvat-task-job-list'>
            <Row justify='space-between' align='middle'>
                <Col>
                    <Text className='cvat-text-color cvat-jobs-header'>
                        {t('job.Jobs Objects')} : {allCount.toLocaleString()}{' '}
                    </Text>
                </Col>
            </Row>
            <Table
                className='cvat-task-jobs-table'
                rowClassName={(record) =>
                    record.etc
                        ? 'cvat-task-jobs-table-row-selected cvat-task-jobs-table-row'
                        : 'cvat-task-jobs-table-row'
                }
                columns={columns}
                dataSource={data}
                pagination={{ position: ['bottomCenter'] }}
            />
        </div>
    );
}

export default React.memo(JobListComponent);
