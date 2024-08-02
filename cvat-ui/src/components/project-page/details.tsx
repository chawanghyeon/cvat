import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Row, Col } from 'antd/lib/grid';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import Progress from 'antd/lib/progress';

import { CombinedState } from 'reducers';
import { getCore, Project } from 'cvat-core-wrapper';
import LabelsEditor from 'components/labels-editor/labels-editor';
import UserSelector from 'components/task-page/user-selector';
import { Divider, Space } from 'antd';
import { useTranslation } from 'react-i18next';

const core = getCore();

interface DetailsComponentProps {
    project: Project;
    onUpdateProject: (project: Project) => void;
}

export default function DetailsComponent(props: DetailsComponentProps): JSX.Element {
    const { t, i18n } = useTranslation();
    const { project, onUpdateProject } = props;

    const [projectName, setProjectName] = useState(project.name);
    // let lastSelected: CheckboxValueType[] = project.boxSize.split(',');

    const numOfTasks = useSelector((state: CombinedState) => state.tasks.count);
    const taskList = useSelector((state: CombinedState) => state.tasks.current);
    let numOfCompleted = 0;

    for (const task of taskList) {
        if (task.progress.totalJobs === task.progress.completedJobs) {
            numOfCompleted += 1;
        }
    }

    const tasksProgress = numOfCompleted / numOfTasks;

    // Progress appearance depends on number of tasks
    let progressColor = null;
    let progressText = null;
    if (numOfCompleted && numOfCompleted === numOfTasks) {
        progressColor = 'cvat-task-completed-progress';
        progressText = <Text className={progressColor}>{t('filter.jobs.state.completed')}</Text>;
    } else if (numOfCompleted) {
        progressColor = 'cvat-task-progress-progress';
        progressText = <Text className={progressColor}>{t('filter.jobs.state.in progress')}</Text>;
    } else {
        progressColor = 'cvat-task-pending-progress';
        progressText = (
            <Text className={progressColor}>
                <span>{t('filter.jobs.state.new')}</span>
            </Text>
        );
    }

    return (
        <div data-cvat-project-id={project.id} className='cvat-project-details'>
            <Row>
                <Col span={8}>
                    <Title
                        level={4}
                        editable={{
                            onChange: (value: string): void => {
                                setProjectName(value);
                                project.name = value;
                                onUpdateProject(project);
                            },
                        }}
                        className='cvat-text-color cvat-project-name'
                    >
                        {projectName}
                    </Title>
                    <Space className='cvat-project-description'>
                        <Text type='secondary'>{`#${project.id}`}</Text>
                        <Divider type='vertical' />
                        <Text type='secondary'>{project.owner ? `${project.owner.username}` : null}</Text>
                        <Divider type='vertical' />
                        <Text type='secondary'>{`${moment(project.createdDate).format('YYYY.MM.DD')}`}</Text>
                    </Space>
                    <Row className='cvat-project-details-progressbar'>
                        <Row>
                            <Col>{progressText}</Col>
                            <Col>
                                <Text type='secondary'>
                                    {i18n.language === 'ko' ?
                                        `${numOfTasks}개 작업중 ${numOfCompleted}` :
                                        `${numOfCompleted} of ${numOfTasks} tasks`}
                                </Text>
                            </Col>
                        </Row>
                        <Col span={24}>
                            <Progress
                                className='cvat-task-progress'
                                percent={tasksProgress * 100}
                                strokeColor='#FFFFFF'
                                showInfo={false}
                                strokeWidth={5}
                                size='small'
                            />
                        </Col>
                    </Row>

                    <Text className='cvat-project-details-user-selector-header'>{t('projects.detail.assignee')}</Text>
                    <UserSelector
                        className='cvat-project-details-user-selector'
                        value={project.assignee}
                        onSelect={(user: any) => {
                            const updatedProject: Project = {
                                ...project,
                                assignee: user,
                                preview: project.preview,
                                save: project.save,
                                delete: project.delete,
                                backup: project.backup,
                            };
                            onUpdateProject(updatedProject);
                        }}
                        prefix
                        suffix
                    />

                    {/* <Row style={{ marginBottom: '20px' }}>
                        <Col>
                            <Text type='secondary'>바운딩 박스 크기</Text>
                            <Checkbox.Group
                                style={{ display: 'flex' }}
                                defaultValue={project.boxSize.split(',')}
                                onChange={(item): void => {
                                    let arr = [];
                                    if (item.includes('none') && !lastSelected.includes('none')) {
                                        arr = item.filter((v) => v === 'none');
                                    } else {
                                        arr = item.filter((v) => v !== 'none');
                                    }
                                    if (item.length === 0) arr.push('none');
                                    project.boxSize = arr.join(',');
                                    lastSelected = arr;
                                    onUpdateProject(project);
                                }}
                                value={project.boxSize.split(',')}
                            >
                                <Checkbox value='none' style={{ width: 'auto' }}>
                                    설정 안함
                                </Checkbox>
                                <Checkbox value='small' style={{ width: 'auto' }}>
                                    small
                                </Checkbox>
                                <Checkbox value='medium' style={{ width: 'auto' }}>
                                    medium
                                </Checkbox>
                            </Checkbox.Group>
                        </Col>
                    </Row> */}
                </Col>
                <Col span={15} offset={1}>
                    <LabelsEditor
                        labels={project.labels.map((label: any): string => label.toJSON())}
                        onSubmit={(labels: any[]): void => {
                            project.labels = labels.map((labelData): any => new core.classes.Label(labelData));
                            onUpdateProject(project);
                        }}
                    />
                </Col>
            </Row>
        </div>
    );
}
