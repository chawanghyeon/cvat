import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';
import { MoreOutlined } from '@ant-design/icons';
import Dropdown from 'antd/lib/dropdown';
import Progress from 'antd/lib/progress';
import moment from 'moment';

import ActionsMenuContainer from 'containers/actions-menu/actions-menu';
import Preview from 'components/common/preview';
import { ActiveInference } from 'reducers';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';

interface TaskItemProps {
    taskInstance: any;
    deleted: boolean;
    hidden: boolean;
    activeInference: ActiveInference | null;
    cancelAutoAnnotation(): void;
}

const TaskItemComponent: React.FC<TaskItemProps & RouteComponentProps> = ({
    taskInstance,
    deleted,
    hidden,
    activeInference,
    cancelAutoAnnotation,
    history,
}) => {
    const { t } = useTranslation();
    // eslint-disable-next-line arrow-body-style
    const renderPreview = (): JSX.Element => {
        return (
            <Preview
                task={taskInstance}
                loadingClassName='cvat-task-item-loading-preview'
                previewWrapperClassName='cvat-task-item-preview-wrapper'
            />
        );
    };

    const renderDescription = (): JSX.Element => {
        const owner = taskInstance.owner ? taskInstance.owner.username : null;
        const name = `${taskInstance.name.substring(0, 70)}${taskInstance.name.length > 70 ? '...' : ''}`;

        return (
            <Row className='cvat-task-item-description'>
                <Col span={22}>
                    <span className='cvat-item-task-name'>{name}</span>
                    <br />
                    {owner && <Text type='secondary'>{owner}</Text>}
                </Col>
                <Col span={2} onClick={(e) => e.stopPropagation()}>
                    <Dropdown dropdownRender={() => <ActionsMenuContainer taskInstance={taskInstance} />}>
                        <MoreOutlined className='cvat-menu-icon' />
                    </Dropdown>
                </Col>
            </Row>
        );
    };

    const renderProgress = (): JSX.Element => {
        const numOfJobs = taskInstance.progress.totalJobs;
        const numOfCompleted = taskInstance.progress.completedJobs;
        const jobIds = taskInstance.progress.ids;

        let progressColor = null;
        let progressText = null;
        if (numOfCompleted && numOfCompleted === numOfJobs) {
            progressColor = 'cvat-task-completed-progress';
            progressText = <Text className={progressColor}>{t('filter.jobs.state.completed')}</Text>;
        } else if (numOfCompleted) {
            progressColor = 'cvat-task-progress-progress';
            progressText = <Text className={progressColor}>{t('filter.jobs.state.in Progress')}</Text>;
        } else {
            progressColor = 'cvat-task-pending-progress';
            progressText = <Text className={progressColor}>{t('filter.jobs.state.new')}</Text>;
        }

        const jobsProgress = numOfCompleted / numOfJobs;

        return (
            <>
                <Row justify='space-between' align='top'>
                    <Col>{progressText}</Col>
                    <Col>
                        <Text type='secondary'>{`Job ID: ${Math.min(...jobIds)} ~ ${Math.max(...jobIds)}`}</Text>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Progress
                            className='cvat-task-progress'
                            percent={jobsProgress * 100}
                            strokeColor='#FFFFFF'
                            showInfo={false}
                            strokeWidth={5}
                            size='small'
                        />
                    </Col>
                </Row>
            </>
        );
    };

    const renderFooter = (): JSX.Element => {
        const { updatedDate } = taskInstance;

        return (
            <>
                <Text type='secondary'>{t('time.LastUpdated')} | </Text>
                <Text type='secondary'>{moment(updatedDate).fromNow()}</Text>
            </>
        );
    };

    const handleClick = () => {
        if (!deleted) {
            history.push(`/tasks/${taskInstance.id}`);
        }
    };

    const style = {
        ...(deleted && { pointerEvents: 'none', opacity: 0.5 }),
        ...(hidden && { display: 'none' }),
    };

    return (
        <Card bordered={false} cover={renderPreview()} onClick={handleClick} style={style}>
            {renderDescription()}
            <div style={{ marginTop: 'auto' }}>
                {renderProgress()}
                {renderFooter()}
            </div>
        </Card>
    );
};

export default withRouter(TaskItemComponent);
