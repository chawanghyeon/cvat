import React, { useEffect, useState } from 'react';
import Text from 'antd/lib/typography/Text';
import { Card, Row, Spin, Table, Tag, Tooltip } from 'antd';
import UserSelector, { User } from 'components/task-page/user-selector';
import config from 'config';
import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { CombinedState } from 'reducers';
// import { getJobsAsync } from 'actions/jobs-actions';
import { getStatistic } from 'actions/organization-actions';
import { SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface TableItem {
    key: number | string;
    state: 'Over' | 'Regular';
    stage: 'Accepted' | 'Not accepted';
    worker: string;
    object: number;
    project: string;
    task: string;
    job: string;
    labels: string[];
}

export default function StatisticsPageComponent(): JSX.Element {
    const { t } = useTranslation();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<TableItem[]>([]);
    const [regular, setRegular] = useState<number>(0);
    const [over, setOver] = useState<number>(0);
    const [regularAccepted, setRegularAccepted] = useState<number>(0);
    const [overAccepted, setOverAccepted] = useState<number>(0);
    const dispatch = useDispatch();
    const fetching = useSelector((state: CombinedState) => state.jobs.fetching);
    const statistic = useSelector((state: CombinedState) => state.organizations.statistic);
    const [projects, setProjects] = useState<string[]>([]);
    const [tasks, setTasks] = useState<string[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [filteredData, setFilteredData] = useState<any>([]);

    const [allObjectReady, setAllObjectReady] = useState(0);
    const [allObjectComplete, setAllObjectComplete] = useState(0);
    const [regularObjectReady, setRegularObjectReady] = useState(0);
    const [regularObjectComplete, setRegularObjectComplete] = useState(0);
    const [overObjectReady, setOverObjectReady] = useState(0);
    const [overObjectComplete, setOverObjectComplete] = useState(0);

    const getJobs = (): void => {
        setLoading(true);
        dispatch(getStatistic(selectedUser?.id ?? null));
    };

    useEffect(() => {
        getJobs();
    }, [selectedUser]);

    useEffect(() => {
        setFilteredData(statistic?.jobs);
        setProjects(Array.from(new Set(statistic?.jobs.map((job: any) => job.project))));
        setTasks(Array.from(new Set(statistic?.jobs.map((job: any) => job.task))));
    }, [statistic]);

    useEffect(() => {
        const newData = filteredData?.reduce((acc: any[], job: any) => {
            acc.push({
                key: job.id,
                etc: job.etc,
                state: job.state,
                stage: job.stage,
                worker: job.worker,
                object: {
                    count: Object.values(job.labels)?.reduce((a: number, b: number) => a + b, 0) ?? 0,
                    labelsCount: job.labels,
                },
                project: job.project,
                task: job.task,
                job: `ID: ${job.id}`,
                labels: job.labels.toString().replace(',', ', '),
            });

            return acc;
        }, []);

        setData(newData);

        let regular = 0;
        let over = 0;
        let regularAccepted = 0;
        let overAccepted = 0;

        newData?.forEach((job: any) => {
            if (job.etc) {
                over += Number(job.object);
                if (job.stage === 'acceptance' && job.state === 'completed') {
                    overAccepted += Number(job.object);
                }
            } else {
                regular += Number(job.object);
                if (job.stage === 'acceptance' && job.state === 'completed') {
                    regularAccepted += Number(job.object);
                }
            }
        });

        setRegular(regular);
        setOver(over);
        setRegularAccepted(regularAccepted);
        setOverAccepted(overAccepted);

        let labels: string[] = [];
        filteredData?.forEach((job: any) => {
            labels = labels.concat(Object.keys(job.labels));
        });
        labels = Array.from(new Set(labels));
        labels = labels.map((label: number) => `${label}_${statistic?.labels[label]}`);
        setLabels(labels);

        setLoading(false);
    }, [filteredData]);

    const handleTableChange = (pagination, filters, sorter) => {
        let newData = [];
        if (filters.labels) {
            newData = statistic.jobs.reduce((acc: any[], job: any) => {
                const tempLabels = {};
                filters.labels.forEach((label: string) => {
                    const labelId = label.split('_')[0];
                    if (job.labels[labelId]) {
                        tempLabels[labelId] = job.labels[labelId];
                    }
                });
                if (Object.keys(tempLabels).length > 0) {
                    acc.push({ ...job, labels: tempLabels });
                }
                return acc;
            }, []);
        } else {
            newData = statistic.jobs.filter((item) =>
                Object.keys(filters).every((columnKey) => {
                    const filterValues = filters[columnKey];
                    if (filterValues && filterValues.length > 0) {
                        return filterValues.includes(item[columnKey]);
                    }
                    return true;
                }),
            );
        }

        setFilteredData(newData);
    };
    function easeOutExpo(t: number): number {
        return t === 1 ? 1 : 1 - 2 ** (-10 * t);
    }
    // eslint-disable-next-line consistent-return
    useEffect(() => {
        if (!loading) {
            console.log('loading : ', loading);

            const frameRate = 1000 / 60;
            const totalFrame = Math.round(1000 / frameRate);

            const startAnimation = (
                startValue: number,
                endValue: number,
                setState: Function,
                isObjectReady: boolean,
            ) => {
                let counter = 0;
                const timer = setInterval(() => {
                    const progress = easeOutExpo(++counter / totalFrame);
                    setState(Math.round((endValue - startValue) * progress + startValue));

                    if (progress === 1) {
                        clearInterval(timer);
                    }
                }, frameRate);
                return timer;
            };

            let allObjectReadyNumCounter: NodeJS.Timeout | null = null;
            let allObjectCompleteNumCounter: NodeJS.Timeout | null = null;
            let regularObjectReadyNumCounter: NodeJS.Timeout | null = null;
            let regularObjectCompleteNumCounter: NodeJS.Timeout | null = null;
            let overObjectReadyNumCounter: NodeJS.Timeout | null = null;
            let overObjectCompleteNumCounter: NodeJS.Timeout | null = null;

            if (!allObjectReadyNumCounter) {
                allObjectReadyNumCounter = startAnimation(0, regular + over, setAllObjectReady, true);
            }
            if (!allObjectCompleteNumCounter) {
                allObjectCompleteNumCounter = startAnimation(
                    0,
                    regularAccepted + overAccepted,
                    setAllObjectComplete,
                    false,
                );
            }
            if (!regularObjectReadyNumCounter) {
                regularObjectReadyNumCounter = startAnimation(0, regular, setRegularObjectReady, true);
            }
            if (!regularObjectCompleteNumCounter) {
                regularObjectCompleteNumCounter = startAnimation(0, overAccepted, setRegularObjectComplete, false);
            }
            if (!overObjectReadyNumCounter) {
                overObjectReadyNumCounter = startAnimation(0, over, setOverObjectReady, true);
            }
            if (!overObjectCompleteNumCounter) {
                overObjectCompleteNumCounter = startAnimation(0, overAccepted, setOverObjectComplete, false);
            }

            return () => {
                clearInterval(allObjectReadyNumCounter!);
                clearInterval(allObjectCompleteNumCounter!);
                clearInterval(regularObjectReadyNumCounter!);
                clearInterval(regularObjectCompleteNumCounter!);
                clearInterval(overObjectReadyNumCounter!);
                clearInterval(overObjectCompleteNumCounter!);
            };
        }
    }, [loading, regular, over, regularAccepted, overAccepted]);

    const columns = [
        {
            width: '90px',
            title: `${t('statistics.grid.etc.title')}`,
            dataIndex: 'etc',
            key: 'etc',
            filters: [
                { text: 'Regular', value: false },
                { text: 'Over', value: true },
            ],
            render: (etc: boolean) => {
                let color;
                if (etc === false) color = 'geekblue';
                else color = 'volcano';
                return (
                    <Tag color={color} style={{ width: 67 }}>
                        {etc ? t('statistics.grid.etc.over') : t('statistics.grid.etc.regular')}
                    </Tag>
                );
            },
        },
        {
            width: '115px',
            title: `${t('statistics.grid.stage.title')}`,
            dataIndex: 'stage',
            key: 'stage',
            filters: [
                { text: 'Accepted', value: 'Accepted' },
                { text: 'Not accepted', value: 'Not accepted' },
            ],
            render: (stage: string) => {
                let color;
                if (stage === 'Accepted') color = 'geekblue';
                else color = 'volcano';
                return (
                    <Tag color={color} style={{ width: 100 }}>
                        {t(`statistics.grid.stage.${stage}`)}
                    </Tag>
                );
            },
        },
        {
            title: `${t('statistics.grid.worker')}`,
            dataIndex: 'worker',
            key: 'worker',
        },
        {
            title: `${t('statistics.grid.object')}`,
            dataIndex: 'object',
            key: 'object',
            sorter: (a: any, b: any) => Number(a.object) - Number(b.object),
            render: (objectInstance: any): JSX.Element => {
                const { count, labelsCount } = objectInstance;

                let jobLabels: string[] = [];
                filteredData?.forEach((job: any) => {
                    jobLabels = jobLabels.concat(Object.keys(job.labels));
                });
                jobLabels = Array.from(new Set(jobLabels)).filter(
                    (label: string) => label === Object.keys(labelsCount)[0],
                );
                const newLabels = jobLabels.map((label: string) => ({
                    id: label,
                    count: labelsCount[label],
                    name: statistic?.labels[label],
                }));

                return (
                    <Tooltip
                        title={
                            newLabels?.map((label: any) => (
                                <div
                                    key={label?.id}
                                    style={{ background: '#000' || config.NEW_LABEL_COLOR }}
                                    className='cvat-constructor-viewer-item'
                                >
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
            title: `${t('statistics.grid.project')}`,
            dataIndex: 'project',
            key: 'project',
            filters: projects.map((project: string) => ({ text: project, value: project })),
        },
        {
            title: `${t('statistics.grid.task')}`,
            dataIndex: 'task',
            key: 'task',
            filters: tasks.map((task: string) => ({ text: task, value: task })),
        },
        {
            title: `${t('statistics.grid.job')}`,
            dataIndex: 'job',
            key: 'job',
        },
        {
            title: `${t('statistics.grid.labels')}`,
            // dataIndex: 'labels',
            key: 'labels',
            filters: labels.map((label: string) => ({ text: label, value: label })),
        },
    ];

    return (
        <Row className='cvat-jobs-page-top-bar' justify='center' align='middle'>
            <Row justify='center'>
                <div
                    style={{
                        width: 1250,
                        display: 'flex',
                        justifyContent: 'space-between',
                        verticalAlign: 'middle',
                    }}
                >
                    <Text className='cvat-statistics-header'>
                        {t('title.statistics')}
                        <SyncOutlined
                            spin={loading || fetching}
                            disabled={loading || fetching}
                            style={{ marginLeft: 15 }}
                            onClick={getJobs}
                        />
                    </Text>
                    <span style={{ marginTop: 20 }}>
                        <UserSelector
                            className='cvat-job-assignee-selector'
                            value={selectedUser}
                            onSelect={(value: User | null): void => {
                                if (value !== null) setSelectedUser({ id: value?.id, username: value?.username });
                                else setSelectedUser(null);
                            }}
                            suffix
                        />
                    </span>
                </div>
            </Row>

            {/* <Row justify='start' style={{ width: 1250 }}>
                <Spin spinning={loading || fetching}>
                    <Row justify='space-between' style={{ width: selectedUser ? 430 : 350 }}>
                        <Text className='cvat-statistics-header sub'>
                            {t('statistics.allObjects')} :{(regular + over).toLocaleString()}
                            {' / '}
                            {(regularAccepted + overAccepted).toLocaleString()}
                        </Text>
                        <Card title={t('statistics.allObjects')} style={{ width: 200 }}>
                            <div>{(regular + over).toLocaleString()}</div>
                            <Space align='baseline'>
                                <div>{(regular + over).toLocaleString()}</div>
                                <div>{(regularAccepted + overAccepted).toLocaleString()}</div>
                            </Space>
                        </Card>
                    </Row>
                </Spin>
            </Row>

            <Row justify='start' style={{ width: 1250 }}>
                <Spin spinning={loading || fetching}>
                    <Row justify='space-between' style={{ width: selectedUser ? 430 : 350 }}>
                        <Text className='cvat-statistics-header sub2'>
                            {t('statistics.regularObjects')} :{regular.toLocaleString()}
                            {' / '}
                            {regularAccepted.toLocaleString()}
                        </Text>
                    </Row>
                </Spin>
            </Row>

            <Row justify='start' style={{ width: 1250 }}>
                <Spin spinning={loading || fetching}>
                    <Row justify='space-between' style={{ width: selectedUser ? 430 : 350 }}>
                        <Text className='cvat-statistics-header sub3'>
                            {t('statistics.overObjects')} :{over.toLocaleString()}
                            {' / '}
                            {overAccepted.toLocaleString()}
                        </Text>
                    </Row>
                </Spin>
            </Row> */}

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Row justify='space-evenly' align='middle' style={{ width: 1250 }}>
                    {/* <Space direction='horizontal' size='large'> */}
                    <Card
                        title={t('statistics.allObjects')}
                        style={{
                            width: 300,
                            backgroundColor: '#656568',
                            borderRadius: 14,
                        }}
                        headStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '22', textAlign: 'center' }}
                    >
                        <Spin spinning={loading || fetching}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        flex: 1,
                                        borderRight: '1px solid #e8e8e8',
                                        padding: '16px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <Text className='cvat-statistics-header sub'>
                                        {(allObjectReady || 0).toLocaleString()}
                                    </Text>
                                </div>
                                <div style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                                    <Text className='cvat-statistics-header sub'>
                                        {(allObjectComplete || 0).toLocaleString()}
                                    </Text>
                                </div>
                            </div>
                        </Spin>
                    </Card>
                    <Card
                        title={t('statistics.regularObjects')}
                        style={{
                            width: 300,
                            backgroundColor: '#656568',
                            borderRadius: 14,
                        }}
                        headStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '22', textAlign: 'center' }}
                    >
                        <Spin spinning={loading || fetching}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        flex: 1,
                                        borderRight: '1px solid #e8e8e8',
                                        padding: '16px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <Text className='cvat-statistics-header sub'>
                                        {(regularObjectReady || 0).toLocaleString()}
                                    </Text>
                                </div>
                                <div style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                                    <Text className='cvat-statistics-header sub'>
                                        {(regularObjectComplete || 0).toLocaleString()}
                                    </Text>
                                </div>
                            </div>
                        </Spin>
                    </Card>
                    <Card
                        title={t('statistics.overObjects')}
                        style={{
                            width: 300,
                            backgroundColor: '#656568',
                            borderRadius: 14,
                        }}
                        headStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '22', textAlign: 'center' }}
                    >
                        <Spin spinning={loading || fetching}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        flex: 1,
                                        borderRight: '1px solid #e8e8e8',
                                        padding: '16px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <Text className='cvat-statistics-header sub'>
                                        {(overObjectReady || 0).toLocaleString()}
                                    </Text>
                                </div>
                                <div style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                                    <Text className='cvat-statistics-header sub'>
                                        {(overObjectComplete || 0).toLocaleString()}
                                    </Text>
                                </div>
                            </div>
                        </Spin>
                    </Card>
                    {/* </Space> */}
                </Row>
            </div>
            <Row justify='center'>
                <Spin size='large' spinning={loading || fetching}>
                    <Table
                        style={{ width: 1250, marginTop: 20 }}
                        rowClassName='cvat-statistics-table-row'
                        dataSource={data}
                        pagination={false}
                        scroll={{ y: 530 }}
                        columns={columns}
                        onChange={handleTableChange}
                    />
                </Spin>
            </Row>
        </Row>
    );
}
