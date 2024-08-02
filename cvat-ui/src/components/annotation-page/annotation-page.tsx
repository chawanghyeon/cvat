import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import Layout from 'antd/lib/layout';
import Result from 'antd/lib/result';
import Spin from 'antd/lib/spin';
import notification from 'antd/lib/notification';

import AttributeAnnotationWorkspace from 'components/annotation-page/attribute-annotation-workspace/attribute-annotation-workspace';
import ReviewAnnotationsWorkspace from 'components/annotation-page/review-workspace/review-workspace';
import StandardWorkspaceComponent from 'components/annotation-page/standard-workspace/standard-workspace';
import StandardWorkspace3DComponent from 'components/annotation-page/standard3D-workspace/standard3D-workspace';
import TagAnnotationWorkspace from 'components/annotation-page/tag-annotation-workspace/tag-annotation-workspace';
import FiltersModalComponent from 'components/header/top-bar/filters-modal';
import StatisticsModalComponent from 'components/header/top-bar/statistics-modal';
import { Workspace } from 'reducers';
import { usePrevious } from 'utils/hooks';
import './styles.scss';
import Button from 'antd/lib/button';
import { SALMONLogo } from 'icons';
import { useTranslation } from 'react-i18next';

interface Props {
    job: any | null | undefined;
    fetching: boolean;
    frameNumber: number;
    workspace: Workspace;
    frameID: number;
    getJob(): void;
    saveLogs(): void;
    closeJob(): void;
    changeFrame(frame: number): void;
}

export default function AnnotationPageComponent(props: Props): JSX.Element {
    const { t } = useTranslation();
    const { job, fetching, workspace, frameNumber, frameID, getJob, closeJob, saveLogs, changeFrame } = props;
    const prevJob = usePrevious(job);
    const prevFetching = usePrevious(fetching);
    const history = useHistory();

    useEffect(() => {
        saveLogs();
        const root = window.document.getElementById('root');
        if (root) {
            root.style.minHeight = '720px';
        }

        return () => {
            saveLogs();
            if (root) {
                root.style.minHeight = '';
            }

            if (!history.location.pathname.includes('/jobs')) {
                closeJob();
            }
        };
    }, []);

    useEffect(() => {
        if (job === null && !fetching) {
            getJob();
        }
    }, [job, fetching]);

    useEffect(() => {
        if (prevFetching && !fetching && !prevJob && job) {
            const latestFrame = localStorage.getItem(`Job_${job.id}_frame`);
            if (latestFrame && Number.isInteger(+latestFrame)) {
                const parsedFrame = +latestFrame;
                if (parsedFrame !== frameNumber && parsedFrame >= job.startFrame && parsedFrame <= job.stopFrame) {
                    const notificationKey = `cvat-notification-continue-job-${job.id}`;
                    notification.info({
                        key: notificationKey,
                        message: `${t('message.annotation.frame_1')} ${parsedFrame} ${t('message.annotation.frame_2')}`,
                        description: (
                            <span>
                                Press
                                <Button
                                    className='cvat-notification-continue-job-button'
                                    type='link'
                                    onClick={() => {
                                        changeFrame(parsedFrame);
                                        notification.close(notificationKey);
                                    }}
                                >
                                    {t('message.annotation.button.here')}
                                </Button>
                                {t('message.annotation.button.if you would like to continue')}
                            </span>
                        ),
                        placement: 'topRight',
                        className: 'cvat-notification-continue-job',
                    });
                }
            }
            if (frameID > 0) {
                changeFrame(frameID);
            } else if (!job.labels.length) {
                notification.warning({
                    message: t('message.annotation.notification.No labels'),
                    description: (
                        <span>
                            {`${job.projectId ? 'Project' : 'Task'} ${job.projectId || job.taskId} ${t(
                                'message.annotation.notification.label_description',
                            )} `}
                            <a href={`/${job.projectId ? 'projects' : 'tasks'}/${job.projectId || job.taskId}/`}>Add</a>
                            {t('message.annotation.notification.description')}
                        </span>
                    ),
                    placement: 'topRight',
                    className: 'cvat-notification-no-labels',
                });
            }
        }
    }, [job, fetching, prevJob, prevFetching, frameID]);

    if (job === null) {
        return <Spin size='large' className='cvat-spinner' />;
    }

    if (typeof job === 'undefined') {
        return (
            <Result
                className='cvat-not-found'
                icon={<SALMONLogo />}
                status='404'
                title={t('message.annotation.result.title')}
                subTitle={t('message.annotation.result.subTitle')}
                extra={
                    <Button type='primary' onClick={() => history.replace('/tasks')}>
                        {t('message.annotation.result.Go Tasks page')}
                    </Button>
                }
            />
        );
    }

    return (
        <Layout className='cvat-annotation-page'>
            {/* <Layout.Header className='cvat-annotation-header'>
                <AnnotationTopBarContainer />
            </Layout.Header> */}
            {workspace === Workspace.STANDARD3D && <StandardWorkspace3DComponent />}
            {workspace === Workspace.STANDARD && <StandardWorkspaceComponent />}
            {workspace === Workspace.ATTRIBUTE_ANNOTATION && (
                <Layout.Content className='cvat-annotation-layout-content'>
                    <AttributeAnnotationWorkspace />
                </Layout.Content>
            )}
            {workspace === Workspace.TAG_ANNOTATION && (
                <Layout.Content className='cvat-annotation-layout-content'>
                    <TagAnnotationWorkspace />
                </Layout.Content>
            )}
            {workspace === Workspace.REVIEW_WORKSPACE && <ReviewAnnotationsWorkspace />}
            <FiltersModalComponent />
            <StatisticsModalComponent />
        </Layout>
    );
}
