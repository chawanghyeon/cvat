import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import { PlusOutlined, UploadOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Text from 'antd/lib/typography/Text';

import { TasksQuery } from 'reducers';
import { usePrevious } from 'utils/hooks';
import CvatTooltip from 'components/common/cvat-tooltip';
import { Space } from 'antd';
import { importActions } from 'actions/import-actions';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

interface VisibleTopBarProps {
    onApplyFilter(filter: string | null): void;
    onApplySorting(sorting: string | null): void;
    onApplySearch(search: string | null): void;
    query: TasksQuery;
    importing: boolean;
}

export default function TopBarComponent(props: VisibleTopBarProps): JSX.Element {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { importing, query, onApplyFilter, onApplySearch } = props;
    const history = useHistory();
    const prevImporting = usePrevious(importing);

    useEffect(() => {
        if (prevImporting && !importing) {
            onApplyFilter(query.filter);
        }
    }, [importing]);

    return (
        <Row className='cvat-tasks-page-top-bar' justify='center' align='middle'>
            <Col md={22} lg={20} xl={18} xxl={14}>
                <div className='cvat-tasks-page-header'>
                    <Text strong className='cvat-text-color'>
                        {t('title.tasks')}
                    </Text>
                </div>
                <Space>
                    <Input.Search
                        enterButton={false}
                        onSearch={(phrase: string) => {
                            onApplySearch(phrase);
                        }}
                        defaultValue={query.search || ''}
                        className='cvat-tasks-page-search-bar'
                        placeholder={t('search.placeholder')}
                        suffix={<SearchOutlined />}
                    />
                    <CvatTooltip title='Create a Task from a backup'>
                        <Button
                            className='cvat-import-task-button'
                            type='primary'
                            disabled={importing}
                            icon={importing ? <LoadingOutlined /> : <UploadOutlined />}
                            onClick={() => dispatch(importActions.openImportBackupModal('task'))}
                        />
                    </CvatTooltip>
                    <CvatTooltip title='Create a Task'>
                        <Button
                            className='cvat-create-task-button'
                            type='primary'
                            onClick={(): void => history.push('/tasks/create')}
                            icon={<PlusOutlined />}
                        />
                    </CvatTooltip>
                </Space>
            </Col>
        </Row>
    );
}
