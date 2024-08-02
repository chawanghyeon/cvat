import './styles.scss';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import Spin from 'antd/lib/spin';
import Empty from 'antd/lib/empty';
import Text from 'antd/lib/typography/Text';
// import FeedbackComponent from 'components/feedback/feedback';
import { updateHistoryFromQuery } from 'components/resource-sorting-filtering';
import { CombinedState, Indexable } from 'reducers';
import { getJobsAsync } from 'actions/jobs-actions';
import JobsCards from 'components/jobs-page/jobs-cards';
import { IllustEmptyIcon } from 'icons';
import { useTranslation } from 'react-i18next';
import TopBarComponent from './top-bar';
import JobsContentComponent from './jobs-content';

function JobsPageComponent(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();
    const { t } = useTranslation();
    const [isMounted, setIsMounted] = useState(false);
    const [dataSource, setDataSource] = useState<any[]>([]);
    const query = useSelector((state: CombinedState) => state.jobs.query);
    const fetching = useSelector((state: CombinedState) => state.jobs.fetching);
    const count = useSelector((state: CombinedState) => state.jobs.count);
    const jobs = useSelector((state: CombinedState) => state.jobs.current);
    const { username } = useSelector((state: CombinedState) => state.auth.user);
    const queryParams = new URLSearchParams(history.location.search);
    const updatedQuery = { ...query };
    for (const key of Object.keys(updatedQuery)) {
        (updatedQuery as Indexable)[key] = queryParams.get(key) || null;
        if (key === 'page') {
            updatedQuery.page = updatedQuery.page ? +updatedQuery.page : 1;
        }
    }
    updatedQuery.username = username;

    useEffect(() => {
        dispatch(getJobsAsync({ ...updatedQuery }));
        setIsMounted(true);
    }, [username]);

    useEffect(() => {
        setDataSource(
            jobs.reduce((acc: any[], job: any) => {
                acc.push({
                    key: job.id,
                    job: job.id,
                    projectName: job.projectName,
                    taskName: job.taskName,
                    worker: job.worker,
                    checker: job.checker,
                    size: job,
                    state: job,
                    stage: job,
                    actions: job,
                    etc: job,
                });
                return acc;
            }, []),
        );
    }, [jobs]);

    useEffect(() => {
        if (isMounted) {
            history.replace({
                search: updateHistoryFromQuery(query),
            });
        }
    }, [query]);

    const content = count ? (
        <JobsContentComponent dataSource={dataSource} />
    ) : (
        <Empty image={<IllustEmptyIcon />} description={<Text>{t('message.notFound')}</Text>} />
    );
    return (
        <div className='cvat-jobs-page'>
            <JobsCards />
            <TopBarComponent
                query={updatedQuery}
                onApplySearch={(search: string | null) => {
                    dispatch(
                        getJobsAsync({
                            ...query,
                            username: username as string,
                            search,
                            page: 1,
                        }),
                    );
                }}
                onApplyFilter={(filter: string | null) => {
                    dispatch(
                        getJobsAsync({
                            ...query,
                            username: username as string,
                            filter,
                            page: 1,
                        }),
                    );
                }}
                onApplySorting={(sorting: string | null) => {
                    dispatch(
                        getJobsAsync({
                            ...query,
                            username: username as string,
                            sort: sorting,
                            page: 1,
                        }),
                    );
                }}
                onFilterDataSource={(data: any[]) => setDataSource(data)}
            />
            {fetching ? <Spin size='large' className='cvat-spinner' /> : content}
            {/* <FeedbackComponent /> */}
        </div>
    );
}

export default React.memo(JobsPageComponent);
