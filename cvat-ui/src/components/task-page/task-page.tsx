import './styles.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Spin from 'antd/lib/spin';
import Result from 'antd/lib/result';
import { useSelector, connect } from 'react-redux';
import notification from 'antd/lib/notification';

import { getCore, Task, Job } from 'cvat-core-wrapper';
import JobListComponent from 'components/task-page/job-list';
import ModelRunnerModal from 'components/model-runner-modal/model-runner-dialog';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import MoveTaskModal from 'components/move-task-modal/move-task-modal';
import { CombinedState } from 'reducers';
import { SALMONLogo } from 'icons';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import TopBarComponent from './top-bar';
import DetailsComponent from './details';

const core = getCore();

function TaskPageComponent(): JSX.Element {
    const { t } = useTranslation();
    const history = useHistory();
    const id = +useParams<{ id: string }>().id;

    const [taskInstance, setTaskInstance] = useState<Task | null>(null);
    const [fetchingTask, setFetchingTask] = useState(true);
    const [updatingTask, setUpdatingTask] = useState(false);
    const mounted = useRef(false);

    const deletes = useSelector((state: CombinedState) => state.tasks.activities.deletes);

    const receieveTask = (): void => {
        if (Number.isInteger(id)) {
            console.log('id : ', id);
            core.tasks
                .get({ id })
                .then(([task]: Task[]) => {
                    if (task && mounted.current) {
                        setTaskInstance(task);
                    }
                    window.scrollTo(0, Number(sessionStorage.getItem('salmon-scroll')));
                })
                .catch((error: Error) => {
                    if (mounted.current) {
                        notification.error({
                            message: t('message.task.error'),
                            description: error.toString(),
                        });
                    }
                })
                .finally(() => {
                    if (mounted.current) {
                        setFetchingTask(false);
                    }
                });
        } else {
            notification.error({
                message: t('message.task.notification.title'),
                description: `${t('message.task.notification.description_1')} "${id}" ${t(
                    'message.task.notification.description_2',
                )}}`,
            });
            setFetchingTask(false);
        }
    };

    useEffect(() => {
        receieveTask();
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (taskInstance && id in deletes && deletes[id]) {
            history.push('/tasks');
        }
    }, [deletes]);

    if (fetchingTask) {
        return <Spin size='large' className='cvat-spinner' />;
    }

    if (!taskInstance) {
        return (
            <Result
                className='cvat-not-found'
                icon={<SALMONLogo />}
                title={t('message.task.result.title')}
                subTitle={t('message.task.result.subTitle')}
                extra={
                    <Button type='primary' onClick={() => history.replace('/tasks')}>
                        {t('message.task.result.Go Tasks page')}
                    </Button>
                }
            />
        );
    }

    const onUpdateTask = (task: Task): Promise<void> =>
        new Promise((resolve, reject) => {
            setUpdatingTask(true);
            task.save()
                .then((updatedTask: Task) => {
                    if (mounted.current) {
                        setTaskInstance(updatedTask);
                    }
                    resolve();
                })
                .catch((error: Error) => {
                    notification.error({
                        message: t('message.task.notification.notUpdate'),
                        className: 'cvat-notification-notice-update-task-failed',
                        description: error.toString(),
                    });
                    reject();
                })
                .finally(() => {
                    if (mounted.current) {
                        setUpdatingTask(false);
                    }
                });
        });

    const onJobUpdate = (job: Job): void => {
        setUpdatingTask(true);
        job.save()
            .then(() => {
                if (mounted.current) {
                    receieveTask();
                }
            })
            .catch((error: Error) => {
                notification.error({
                    message: 'Could not update the job',
                    description: error.toString(),
                });
            })
            .finally(() => {
                if (mounted.current) {
                    setUpdatingTask(false);
                }
            });
    };

    return (
        <div className='cvat-task-page'>
            {updatingTask ? <CVATLoadingSpinner size='large' /> : null}
            <Row justify='center' align='top' className='cvat-task-details-wrapper'>
                <Col md={24} lg={24} xl={22} xxl={18}>
                    <TopBarComponent taskInstance={taskInstance} />
                    <DetailsComponent task={taskInstance} onUpdateTask={onUpdateTask} />
                    <JobListComponent task={taskInstance} onUpdateJob={onJobUpdate} />
                </Col>
            </Row>
            <ModelRunnerModal />
            <MoveTaskModal onUpdateTask={onUpdateTask} />
        </div>
    );
}

export default React.memo(TaskPageComponent);
