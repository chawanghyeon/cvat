import './styles.scss';
import React, {
    useState, useEffect, useCallback, useRef,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from 'antd/lib/modal';
import { Row, Col } from 'antd/lib/grid';
import Divider from 'antd/lib/divider';
import notification from 'antd/lib/notification';
import { QuestionCircleOutlined } from '@ant-design/icons';

import ProjectSearch from 'components/create-task-page/project-search-field';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import CVATTooltip from 'components/common/cvat-tooltip';
import { CombinedState } from 'reducers';
import { switchMoveTaskModalVisible } from 'actions/tasks-actions';
import { getCore, Task, Label } from 'cvat-core-wrapper';
import Text from 'antd/lib/typography/Text';
import LabelMapperItem, { LabelMapperItemValue } from './label-mapper-item';

const core = getCore();

function MoveTaskModal({
    onUpdateTask,
}: {
    onUpdateTask?: (task: Task) => Promise<void>,
}): JSX.Element {
    const dispatch = useDispatch();
    const visible = useSelector((state: CombinedState) => state.tasks.moveTask.modalVisible);
    const taskId = useSelector((state: CombinedState) => state.tasks.moveTask.taskId);
    const mounted = useRef(false);

    const [taskFetching, setTaskFetching] = useState(false);
    const [taskInstance, setTaskInstance] = useState<Task | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [projectId, setProjectId] = useState<number | null>(null);
    const [project, setProject] = useState<any>(null);
    const [labelMap, setLabelMap] = useState<{ [key: string]: LabelMapperItemValue }>({});

    const initValues = useCallback(() => {
        const labelValues: { [key: string]: LabelMapperItemValue } = {};
        if (taskInstance) {
            taskInstance.labels.forEach((label: Label) => {
                const labelId = label.id as number;
                labelValues[labelId] = {
                    labelId,
                    newLabelName: null,
                };
            });
        }

        setLabelMap(labelValues);
    }, [taskInstance]);

    const onCancel = useCallback(() => {
        dispatch(switchMoveTaskModalVisible(false));
        initValues();
        setProject(null);
        setProjectId(null);
    }, [initValues]);

    const projectsFilter = useCallback((_project: { id: number }) => (
        _project.id !== taskInstance?.projectId
    ), [taskInstance]);

    const submitMove = async (): Promise<void> => {
        if (!taskInstance) {
            throw new Error('Task to move is not specified');
        }

        if (!projectId) {
            notification.error({ message: 'Please, select a project' });
            return;
        }

        if (Object.values(labelMap).some((map) => map.newLabelName === null)) {
            notification.error({
                message: 'Please, specify mapping for all the labels',
            });
            return;
        }

        const agree = confirm('만약 타겟 프로젝트에서 특정 라벨에 속성이 없다면, 해당 라벨로 매핑되는 이전 태스크 라벨의 모든 속성이 제거됩니다. 계속하시겠습니까?');
        if (!agree) {
            onCancel();
        }

        taskInstance.projectId = projectId;
        taskInstance.labels = Object.values(labelMap).map((mapper) => ({
            id: mapper.labelId,
            name: mapper.newLabelName,
        })).map(({ id, name }) => {
            const [label] = taskInstance.labels.filter((_label: Label) => _label.id === id);
            (label as Label).name = name as string;
            return label;
        });

        setIsUpdating(true);
        if (onUpdateTask) {
            onUpdateTask(taskInstance).finally(() => {
                if (mounted.current) {
                    setIsUpdating(false);
                }
            });
        } else {
            taskInstance.save().finally(() => {
                if (mounted.current) {
                    setIsUpdating(false);
                }
            }).catch((error: Error) => notification.error({
                message: 'Could not update the task',
                className: 'cvat-notification-notice-update-task-failed',
                description: error.toString(),
            }));
        }

        onCancel();
    };

    useEffect(() => {
        if (visible && Number.isInteger(taskId)) {
            setTaskFetching(true);
            core.tasks.get({ id: taskId })
                .then(([task]: Task[]) => {
                    if (mounted.current) {
                        setLabelMap({});
                        setTaskInstance(task);
                    }
                })
                .catch((error: Error) => notification.error({
                    message: 'Could not fetch task from the server',
                    description: error.toString(),
                })).finally(() => {
                    if (mounted.current) {
                        setTaskFetching(false);
                    }
                });
        }
    }, [visible, taskId]);

    useEffect(() => {
        if (projectId && taskInstance) {
            core.projects.get({ id: projectId }).then(([_project]: any) => {
                if (_project) {
                    setProject(_project);
                    const { labels } = _project;
                    const labelValues: { [key: string]: LabelMapperItemValue } = {};
                    Object.entries(labelMap).forEach(([id, label]) => {
                        const taskLabelName = taskInstance
                            .labels.filter((_label: any) => _label.id === label.labelId)[0].name;
                        const [autoNewLabel] = labels.filter((_label: any) => _label.name === taskLabelName);
                        labelValues[id] = {
                            labelId: label.labelId,
                            newLabelName: autoNewLabel ? autoNewLabel.name : null,
                        };
                    });
                    setLabelMap(labelValues);
                }
            });
        } else {
            setProject(null);
        }
    }, [projectId, taskInstance]);

    useEffect(() => {
        initValues();
    }, [taskInstance]);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            onOk={submitMove}
            okButtonProps={{ disabled: isUpdating }}
            title={(
                <span>
                    {`Move task ${taskInstance?.id} to project`}
                    {/* TODO: replace placeholder */}
                    <CVATTooltip title='Some moving process description here'>
                        <QuestionCircleOutlined className='ant-typography-secondary' />
                    </CVATTooltip>
                </span>
            )}
            className='cvat-task-move-modal'
        >
            { taskFetching && <CVATLoadingSpinner size='large' /> }
            <Row align='middle'>
                <Col span={5} className='cvat-text-color'>Project:</Col>
                <Col span={19}>
                    <ProjectSearch
                        value={projectId}
                        onSelect={setProjectId}
                        filter={projectsFilter}
                    />
                </Col>
            </Row>
            <Divider />
            <Text className='cvat-text-color'>Label mapping</Text>
            {!!Object.keys(labelMap).length &&
                !isUpdating &&
                taskInstance?.labels.map((label: any) => (
                    <LabelMapperItem
                        label={label}
                        key={label.id}
                        projectLabels={project?.labels}
                        value={labelMap[label.id]}
                        labelMappers={Object.values(labelMap)}
                        onChange={(value) => {
                            setLabelMap({
                                ...labelMap,
                                [value.labelId]: value,
                            });
                        }}
                    />
                ))}
        </Modal>
    );
}

export default React.memo(MoveTaskModal);
