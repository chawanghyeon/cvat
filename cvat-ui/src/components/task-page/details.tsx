import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { Row, Col } from 'antd/lib/grid';
import Tag from 'antd/lib/tag';
import { CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';
import moment from 'moment';
import Paragraph from 'antd/lib/typography/Paragraph';
import Select from 'antd/lib/select';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';

import { getCore, Task } from 'cvat-core-wrapper';
import { getReposData, syncRepos, changeRepo } from 'utils/git-utils';
import Space from 'antd/lib/space';
import { Divider, Progress } from 'antd';
import Preview from 'components/common/preview';
import { cancelInferenceAsync } from 'actions/models-actions';
import { CombinedState, ActiveInference } from 'reducers';
import { useTranslation } from 'react-i18next';
import UserSelector, { User } from './user-selector';
import LabelsEditorComponent from '../labels-editor/labels-editor';
import ProjectSubsetField from '../create-task-page/project-subset-field';

interface OwnProps {
    task: Task;
    onUpdateTask: (task: Task) => Promise<void>;
}

interface StateToProps {
    activeInference: ActiveInference | null;
    installedGit: boolean;
    projectSubsets: string[];
    dumpers: any[];
    user: any;
}

interface DispatchToProps {
    cancelAutoAnnotation(): void;
}

const core = getCore();

const DetailsComponent = ({
    task,
    onUpdateTask,
    activeInference,
    installedGit,
    projectSubsets,
    dumpers,
    user,
    cancelAutoAnnotation,
}: any) => {
    const { t, i18n } = useTranslation();
    const [name, setName] = useState(task.name);
    const [subset, setSubset] = useState(task.subset);
    const [repository, setRepository] = useState('');
    const [repositoryStatus, setRepositoryStatus] = useState('');
    const [format, setFormat] = useState('');
    const [lfs, setLfs] = useState(false);
    const [updatingRepository, setUpdatingRepository] = useState(false);

    useEffect(() => {
        let isMounted = true;
        getReposData(task.id)
            .then((data) => {
                if (!isMounted) return;
                if (data !== null) {
                    if (data.status.error) {
                        notification.error({
                            message: 'Could not receive repository status',
                            description: data.status.error,
                        });
                    } else {
                        setRepositoryStatus(data.status.value);
                    }

                    setRepository(data.url);
                    setFormat(data.format);
                    setLfs(!!data.lfs);
                }
            })
            .catch((error) => {
                if (!isMounted) return;
                notification.error({
                    message: 'Could not receive repository status',
                    description: error.toString(),
                });
            });

        return () => {
            isMounted = false;
        };
    }, [task.id]);

    useEffect(() => {
        setName(task.name);
    }, [task.name]);

    const onChangeRepoValue = (value: string) => {
        const old = repository;
        setRepository(value);
        setUpdatingRepository(true);
        changeRepo(task.id, 'url', value)
            .catch((error) => {
                setRepository(old);
                notification.error({
                    message: 'Could not update repository',
                    description: error,
                });
            })
            .finally(() => setUpdatingRepository(false));
    };

    const onChangeLFSValue = (event: CheckboxChangeEvent) => {
        const old = lfs;
        setLfs(event.target.checked);
        setUpdatingRepository(true);
        changeRepo(task.id, 'lfs', event.target.checked)
            .catch((error) => {
                setLfs(old);
                notification.error({
                    message: 'Could not update LFS',
                    description: error,
                });
            })
            .finally(() => setUpdatingRepository(false));
    };

    const onChangeFormatValue = (value: string) => {
        const old = format;
        setFormat(value);
        setUpdatingRepository(true);
        changeRepo(task.id, 'format', value)
            .catch((error) => {
                setFormat(old);
                notification.error({
                    message: 'Could not update format',
                    description: error,
                });
            })
            .finally(() => setUpdatingRepository(false));
    };

    const renderTaskName = () => {
        const owner = task.owner ? task.owner.username : null;
        const created = moment(task.createdDate).format('YYYY.MM.DD');

        return (
            <>
                <Title
                    level={4}
                    editable={{
                        onChange: (value: string) => {
                            setName(value);
                            task.name = value;
                            onUpdateTask(task);
                        },
                    }}
                    className='cvat-text-color'
                >
                    {name}
                </Title>
                <div className='cvat-task-description'>
                    <Text>{`#${task.id}`}</Text>
                    <Divider type='vertical' />
                    {owner && <Text>{owner}</Text>}
                    <Divider type='vertical' />
                    <Text>{created}</Text>
                </div>
            </>
        );
    };

    const renderProgress = () => {
        const totalJobs = task.jobs.length;
        const completedJobs = task.jobs.filter(
            (job: any) => job.stage === 'acceptance' && job.state === 'completed',
        ).length;
        const jobProgress = (completedJobs / totalJobs) * 100;

        return (
            <Row style={{ justifyContent: 'space-between' }}>
                <Col style={{ marginBottom: 10 }}>
                    {totalJobs === completedJobs && (
                        <Text className='cvat-task-completed-progress'>{t('filter.jobs.state.completed')}</Text>
                    )}
                    {completedJobs !== 0 && totalJobs !== completedJobs && (
                        <Text className='cvat-task-progress-progress'>{t('filter.jobs.state.in progress')}</Text>
                    )}
                    {completedJobs === 0 && (
                        <Text className='cvat-task-pending-progress'>{t('filter.jobs.state.new')}</Text>
                    )}
                </Col>
                <Col>
                    <Text>
                        {i18n.language === 'ko' ?
                            `${totalJobs}개의 하위 작업 중 ${completedJobs}` :
                            `${completedJobs} of ${totalJobs} jobs`}
                    </Text>
                </Col>
                <Progress
                    className='cvat-task-progress'
                    percent={jobProgress}
                    strokeColor='#FFFFFF'
                    showInfo={false}
                    strokeWidth={5}
                    size='small'
                />
            </Row>
        );
    };

    const renderParameters = () => (
        <Paragraph>
            <ul>
                <li>
                    {t('projects.detail.overlapSize')} :<span>{task.overlap}</span>
                </li>
                <li>
                    {t('projects.detail.segmentSize')} :<span>{task.segmentSize}</span>
                </li>
                <li>
                    {t('projects.detail.imageQuality')} :<span>{task.imageQuality}</span>
                </li>
            </ul>
        </Paragraph>
    );

    const renderUserBlock = () => {
        const assignee = task.assignee ? task.assignee : null;

        return (
            <Col>
                <Text>{t('projects.detail.assignee')}</Text>
                <UserSelector
                    value={assignee}
                    onSelect={(value: User | null) => {
                        if (task?.assignee?.id === value?.id) return;
                        task.assignee = value;
                        onUpdateTask(task);
                    }}
                    prefix
                    suffix
                />
            </Col>
        );
    };

    const renderDatasetRepository = () => !!repository && (
        <Row>
            <Col className='cvat-dataset-repository-url'>
                <Text strong className='cvat-text-color'>
                    Dataset Repository
                </Text>
                <Paragraph>
                    <Text editable={{ onChange: onChangeRepoValue }} disabled={updatingRepository}>
                        {repository}
                    </Text>
                    {repositoryStatus === 'sync' && (
                        <Tag color='blue'>
                            <CheckCircleOutlined />
                            Synchronized
                        </Tag>
                    )}
                    {repositoryStatus === 'merged' && (
                        <Tag color='green'>
                            <CheckCircleOutlined />
                            Merged
                        </Tag>
                    )}
                    {repositoryStatus === 'syncing' && (
                        <Tag color='purple'>
                            <LoadingOutlined />
                            Syncing
                        </Tag>
                    )}
                    {repositoryStatus === '!sync' && (
                        <Tag
                            color='red'
                            onClick={() => {
                                setRepositoryStatus('syncing');
                                syncRepos(task.id)
                                    .then(() => {
                                        setRepositoryStatus('sync');
                                    })
                                    .catch((error) => {
                                        Modal.error({
                                            width: 800,
                                            title: 'Could not synchronize the repository',
                                            content: error.toString(),
                                        });
                                        setRepositoryStatus('!sync');
                                    });
                            }}
                        >
                            <ExclamationCircleOutlined />
                            Synchronize
                        </Tag>
                    )}
                </Paragraph>
                <Text strong className='cvat-text-color'>
                    Using format:{' '}
                </Text>
                <Space>
                    <Select
                        disabled={updatingRepository}
                        onChange={onChangeFormatValue}
                        className='cvat-repository-format-select'
                        value={format}
                    >
                        {dumpers.map((dumper: any) => (
                            <Select.Option key={dumper.name} value={dumper.name}>
                                {dumper.name}
                            </Select.Option>
                        ))}
                    </Select>
                    <Checkbox disabled={updatingRepository} onChange={onChangeLFSValue} checked={lfs}>
                        Large file support
                    </Checkbox>
                    {updatingRepository && <LoadingOutlined style={{ fontSize: 14 }} spin />}
                </Space>
            </Col>
        </Row>
    );

    const renderLabelsEditor = () => (
        <LabelsEditorComponent
            labels={task.labels.map((label: any) => label.toJSON())}
            onSubmit={(labels: any[]) => {
                task.labels = labels.map((labelData) => new core.classes.Label(labelData));
                onUpdateTask(task);
            }}
            hasProject={!!task.projectId}
        />
    );

    const renderSubsetField = () => (
        <Row>
            <Col span={24}>
                <Text className='cvat-text-color'>Subset:</Text>
            </Col>
            <Col span={24}>
                <ProjectSubsetField
                    value={subset}
                    projectId={task.projectId}
                    projectSubsets={projectSubsets}
                    onChange={(value) => {
                        setSubset(value);
                        if (task.subset !== value) {
                            task.subset = value;
                            onUpdateTask(task);
                        }
                    }}
                />
            </Col>
        </Row>
    );

    return (
        <Row className='cvat-task-details'>
            <Col className='cvat-task-details-left-group' span={11}>
                {renderTaskName()}
                <Row>
                    <Col span={12}>
                        <Row className='cvat-task-details-progress'>
                            <Col>{renderProgress()}</Col>
                            {renderUserBlock()}
                        </Row>
                    </Col>
                    <Col span={10} offset={2}>
                        <div>
                            <Preview
                                task={task}
                                loadingClassName='cvat-task-item-loading-preview'
                                previewWrapperClassName='cvat-task-preview-wrapper'
                            />
                            {renderParameters()}
                        </div>
                    </Col>
                </Row>
            </Col>
            <Col span={12} offset={1}>
                {renderLabelsEditor()}
            </Col>
        </Row>
    );
};

const mapStateToProps = (state: CombinedState, own: OwnProps) => {
    const { list } = state.plugins;
    const [taskProject] = state.projects.current.filter((project) => project.id === own.task.projectId);

    return {
        ...own,
        dumpers: state.formats.annotationFormats.dumpers,
        user: state.auth.user,
        installedGit: list.GIT_INTEGRATION,
        activeInference: state.models.inferences[own.task.id] || null,
        projectSubsets: taskProject ? ([...new Set(taskProject.subsets)] as string[]) : [],
    };
};

const mapDispatchToProps = (dispatch: any, own: OwnProps) => ({
    cancelAutoAnnotation: () => {
        dispatch(cancelInferenceAsync(own.task.id));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(DetailsComponent);
