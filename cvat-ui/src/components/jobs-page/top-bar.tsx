import React, { useState } from 'react';
import { CombinedState, JobsQuery, JobStage } from 'reducers';
import { Button, Checkbox, Dropdown, Space, Col, Row } from 'antd';
import Text from 'antd/lib/typography/Text';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useSelector } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
import { JobState } from 'cvat-core/src/enums';
import Icon from '@ant-design/icons';
import { FilterIcon, FilterSolidIcon } from 'icons';
import { useTranslation } from 'react-i18next';

interface Props {
    query: JobsQuery;
    onApplyFilter(filter: string | null): void;
    onApplySorting(sorting: string | null): void;
    onApplySearch(search: string | null): void;
    // onFilterDataSource: React.Dispatch<React.SetStateAction<any[]>>;
    onFilterDataSource(dataSource: any[]): void;
}

const changeToDataSource = (arr: any[]): any[] => arr.reduce((acc: any[], job: any) => {
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
}, []);

function TopBarComponent(props: Props): JSX.Element {
    const { onFilterDataSource } = props;

    const { t } = useTranslation();

    // dropdown checked 여부
    const [stageChecked, setStageChecked] = useState<string[]>([]);
    const [stateChecked, setStateChecked] = useState<string[]>([]);

    // dropdown menu open/close
    const [stageOpen, setStageOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);

    const jobs = useSelector((state: CombinedState) => state.jobs.current);
    const jobStageList = [JobStage.ANNOTATION, JobStage.REVIEW, JobStage.ACCEPTANCE];
    const jobStateList = [JobState.NEW, JobState.IN_PROGRESS, JobState.REJECTED, JobState.COMPLETED];

    const dimensions = {
        md: 22,
        lg: 22,
        xl: 18,
        xxl: 16,
    };

    return (
        <Row className='cvat-jobs-page-top-bar' justify='center' align='middle'>
            <Col {...dimensions}>
                <Text className='cvat-text-color cvat-jobs-header'> {t('title.jobs')} </Text>
                <Space>
                    <Dropdown
                        destroyPopupOnHide
                        open={stageOpen}
                        onOpenChange={() => setStageOpen(!stageOpen)}
                        trigger={['click']}
                        placement='bottomLeft'
                        dropdownRender={() => (
                            <div className='cvat-resource-page-predefined-filters-list'>
                                {jobStageList.map(
                                    (stage: string): JSX.Element => (
                                        <Checkbox
                                            checked={stageChecked.some((data) => data === stage)}
                                            onChange={(event: CheckboxChangeEvent) => {
                                                if (event.target.checked) {
                                                    setStageChecked([...stageChecked, stage]);
                                                } else {
                                                    setStageChecked(stageChecked.filter((data) => data !== stage));
                                                }
                                            }}
                                            key={stage}
                                        >
                                            {t(`filter.jobs.stage.${stage}`)}
                                        </Checkbox>
                                    ),
                                )}
                                <Row style={{ padding: 6 }} justify='center'>
                                    <Col>
                                        <Button
                                            type='default'
                                            onClick={() => {
                                                setStageChecked([]);
                                                onFilterDataSource(changeToDataSource(jobs));
                                                setStageOpen(false);
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    </Col>
                                    <Col offset={2}>
                                        <Button
                                            type='primary'
                                            onClick={() => {
                                                if (stageChecked.length === 0) {
                                                    return;
                                                }
                                                const data = jobs.filter(
                                                    (jobInstance) => stageChecked.includes(jobInstance.stage) &&
                                                        (stateChecked.length > 0
                                                            ? stateChecked.includes(jobInstance.state)
                                                            : true),
                                                );
                                                onFilterDataSource(changeToDataSource(data));
                                                setStageOpen(false);
                                            }}
                                        >
                                            OK
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    >
                        <Button type='default' className={`filter-btn ${stageChecked.length > 0 && 'filtered'}`}>
                            <span>{t('filter.stage')}</span>
                            {stageChecked.length > 0 ? (
                                <Icon component={FilterSolidIcon} />
                            ) : (
                                <Icon component={FilterIcon} style={{ fill: '#fff' }} />
                            )}
                        </Button>
                    </Dropdown>
                    <Dropdown
                        destroyPopupOnHide
                        open={stateOpen}
                        onOpenChange={() => setStateOpen(!stateOpen)}
                        trigger={['click']}
                        placement='bottomLeft'
                        dropdownRender={() => (
                            <div className='cvat-resource-page-predefined-filters-list'>
                                {jobStateList.map(
                                    (state: string): JSX.Element => (
                                        <Checkbox
                                            checked={stateChecked.some((data) => data === state)}
                                            onChange={(event: CheckboxChangeEvent) => {
                                                if (event.target.checked) {
                                                    setStateChecked([...stateChecked, state]);
                                                } else {
                                                    setStateChecked(stateChecked.filter((data) => data !== state));
                                                }
                                            }}
                                            key={state}
                                        >
                                            {t(`filter.jobs.state.${state}`)}
                                        </Checkbox>
                                    ),
                                )}
                                <Row style={{ padding: 6 }} justify='center'>
                                    <Col>
                                        <Button
                                            type='default'
                                            onClick={() => {
                                                setStateChecked([]);
                                                onFilterDataSource(changeToDataSource(jobs));
                                                setStateOpen(false);
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    </Col>
                                    <Col offset={2}>
                                        <Button
                                            type='primary'
                                            onClick={() => {
                                                if (stateChecked.length === 0) {
                                                    return;
                                                }
                                                const data = jobs.filter(
                                                    (jobInstance) => stateChecked.includes(jobInstance.state) &&
                                                        (stageChecked.length > 0
                                                            ? stageChecked.includes(jobInstance.stage)
                                                            : true),
                                                );
                                                onFilterDataSource(changeToDataSource(data));
                                                setStateOpen(false);
                                            }}
                                        >
                                            OK
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    >
                        <Button type='default' className={`filter-btn ${stateChecked.length > 0 && 'filtered'}`}>
                            <span> {t('filter.state')}</span>
                            {stateChecked.length > 0 ? (
                                <Icon component={FilterSolidIcon} />
                            ) : (
                                <Icon component={FilterIcon} style={{ fill: '#fff' }} />
                            )}
                        </Button>
                    </Dropdown>
                </Space>
            </Col>
        </Row>
    );
}

export default React.memo(TopBarComponent);
