import './styles.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import Spin from 'antd/lib/spin';
import { Row, Col } from 'antd/lib/grid';
import Result from 'antd/lib/result';
import Button from 'antd/lib/button';
import Text from 'antd/lib/typography/Text';
import Pagination from 'antd/lib/pagination';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Empty from 'antd/lib/empty';
import Input from 'antd/lib/input';
import notification from 'antd/lib/notification';

import { getCore, Project, Task } from 'cvat-core-wrapper';
import { CombinedState, Indexable } from 'reducers';
import { getProjectTasksAsync } from 'actions/projects-actions';
import { cancelInferenceAsync } from 'actions/models-actions';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import TaskItem from 'components/tasks-page/task-item';
import MoveTaskModal from 'components/move-task-modal/move-task-modal';
import ModelRunnerDialog from 'components/model-runner-modal/model-runner-dialog';
import ImportDatasetModal from 'components/import-dataset/import-dataset-modal';
import { updateHistoryFromQuery } from 'components/resource-sorting-filtering';
import CVATTooltip from 'components/common/cvat-tooltip';
import { Space } from 'antd';
import { IllustEmptyIcon, SALMONLogo } from 'icons';
import { useTranslation } from 'react-i18next';
import DetailsComponent from './details';
import ProjectTopBar from './top-bar';

const core = getCore();

interface ParamType {
    id: string;
}

export default function ProjectPageComponent(): JSX.Element {
    const id = +useParams<ParamType>().id;
    const dispatch = useDispatch();
    const history = useHistory();
    const { t } = useTranslation();

    const [projectInstance, setProjectInstance] = useState<Project | null>(null);
    const [fechingProject, setFetchingProject] = useState(true);
    const [updatingProject, setUpdatingProject] = useState(false);
    const mounted = useRef(false);

    const deletes = useSelector((state: CombinedState) => state.projects.activities.deletes);
    const taskDeletes = useSelector((state: CombinedState) => state.tasks.activities.deletes);
    const tasksActiveInferences = useSelector((state: CombinedState) => state.models.inferences);
    const tasks = useSelector((state: CombinedState) => state.tasks.current);
    const tasksCount = useSelector((state: CombinedState) => state.tasks.count);
    const tasksQuery = useSelector((state: CombinedState) => state.projects.tasksGettingQuery);
    const tasksFetching = useSelector((state: CombinedState) => state.tasks.fetching);
    // const [visibility, setVisibility] = useState(defaultVisibility);

    const queryParams = new URLSearchParams(history.location.search);
    const updatedQuery = { ...tasksQuery };
    for (const key of Object.keys(updatedQuery)) {
        (updatedQuery as Indexable)[key] = queryParams.get(key) || null;
        if (key === 'page') {
            updatedQuery.page = updatedQuery.page ? +updatedQuery.page : 1;
        }
    }

    useEffect(() => {
        if (Number.isInteger(id)) {
            core.projects
                .get({ id })
                .then(([project]: Project[]) => {
                    if (project && mounted.current) {
                        dispatch(getProjectTasksAsync({ ...updatedQuery, projectId: id }));
                        setProjectInstance(project);
                    }
                })
                .catch((error: Error) => {
                    if (mounted.current) {
                        notification.error({
                            message: t('message.project.error'),
                            description: error.toString(),
                        });
                    }
                })
                .finally(() => {
                    if (mounted.current) {
                        setFetchingProject(false);
                    }
                });
        } else {
            notification.error({
                message: t('message.project.notification.title'),
                description: `${t('message.project.notification.description_1')} "${id}" ${t(
                    'message.project.notification.description_2',
                )}`,
            });
            setFetchingProject(false);
        }

        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        history.replace({
            search: updateHistoryFromQuery(tasksQuery),
        });
    }, [tasksQuery]);

    useEffect(() => {
        if (projectInstance && id in deletes && deletes[id]) {
            history.push('/projects');
        }
    }, [deletes]);

    if (fechingProject) {
        return <Spin size='large' className='cvat-spinner' />;
    }

    if (!projectInstance) {
        return (
            <Result
                className='cvat-not-found'
                icon={<SALMONLogo />}
                title={t('message.project.result.title')}
                subTitle={t('message.project.result.subTitle')}
                extra={
                    <Button type='primary' onClick={() => history.replace('/tasks')}>
                        {t('message.project.result.Go Tasks page')}
                    </Button>
                }
            />
        );
    }

    const content = tasksCount ? (
        <>
            <Row className='cvat-project-tasks-list' gutter={[16, 16]}>
                {tasks
                    .filter((task) => task.projectId === projectInstance.id)
                    .map((task: Task) => (
                        <Col span={6} key={task.id}>
                            <TaskItem
                                key={task.id}
                                deleted={task.id in taskDeletes ? taskDeletes[task.id] : false}
                                hidden={false}
                                activeInference={tasksActiveInferences[task.id] || null}
                                cancelAutoAnnotation={() => {
                                    dispatch(cancelInferenceAsync(task.id));
                                }}
                                taskInstance={task}
                            />
                        </Col>
                    ))}
            </Row>
            <Row justify='center' align='middle' style={{ width: '100%' }}>
                <Col md={22} lg={18} xl={16} xxl={14}>
                    <Pagination
                        className='cvat-projects-pagination'
                        onChange={(page: number) => {
                            dispatch(
                                getProjectTasksAsync({
                                    ...tasksQuery,
                                    projectId: id,
                                    page,
                                }),
                            );
                        }}
                        showSizeChanger={false}
                        total={tasksCount}
                        pageSize={10}
                        current={tasksQuery.page}
                        showQuickJumper
                    />
                </Col>
            </Row>
        </>
    ) : (
        <Empty description={<Text>{t('message.project.No tasks found')}</Text>} image={<IllustEmptyIcon />} />
    );

    return (
        <Row justify='center' align='top' className='cvat-project-page'>
            {updatingProject ? <CVATLoadingSpinner size='large' /> : null}
            <Col
                md={22}
                lg={20}
                xl={18}
                xxl={16}
                style={
                    updatingProject
                        ? {
                              pointerEvents: 'none',
                              opacity: 0.7,
                          }
                        : {}
                }
            >
                <ProjectTopBar projectInstance={projectInstance} />
                <DetailsComponent
                    onUpdateProject={(project: Project) => {
                        setUpdatingProject(true);
                        project
                            .save()
                            .then((updatedProject: Project) => {
                                if (mounted.current) {
                                    dispatch(getProjectTasksAsync({ ...updatedQuery, projectId: id }));
                                    setProjectInstance(updatedProject);
                                }
                            })
                            .catch((error: Error) => {
                                if (mounted.current) {
                                    notification.error({
                                        message: t('message.project.notification.notUpdate'),
                                        description: error.toString(),
                                    });
                                }
                            })
                            .finally(() => {
                                if (mounted.current) {
                                    setUpdatingProject(false);
                                }
                            });
                    }}
                    project={projectInstance}
                />
                <Row justify='space-between' align='middle' className='cvat-project-page-tasks-bar'>
                    <Col span={18} className='cvat-project-page-tasks-header'>
                        <Text strong className='cvat-text-color'>
                            {t('title.tasks')}
                        </Text>
                    </Col>
                    <Col span={6}>
                        <Space className='cvat-project-search-box'>
                            <Input.Search
                                enterButton
                                onSearch={(_search: string) => {
                                    dispatch(
                                        getProjectTasksAsync({
                                            ...tasksQuery,
                                            page: 1,
                                            projectId: id,
                                            search: _search,
                                        }),
                                    );
                                }}
                                defaultValue={tasksQuery.search || ''}
                                className='cvat-project-page-tasks-search-bar'
                                placeholder={t('search.placeholder')}
                                suffix={<SearchOutlined />}
                            />
                            <CVATTooltip title={t('message.project.CVATTooltip.title')}>
                                <Button
                                    type='primary'
                                    icon={<PlusOutlined />}
                                    className='cvat-create-task-button'
                                    onClick={() => history.push(`/tasks/create?projectId=${id}`)}
                                />
                            </CVATTooltip>
                        </Space>
                    </Col>
                </Row>
                {tasksFetching ? <Spin size='large' className='cvat-spinner' /> : content}
            </Col>

            <MoveTaskModal />
            <ModelRunnerDialog />
            <ImportDatasetModal />
        </Row>
    );
}
