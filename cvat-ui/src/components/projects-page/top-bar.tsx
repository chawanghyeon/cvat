import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Button from 'antd/lib/button';
import { Space, Tooltip } from 'antd';
import Input from 'antd/lib/input';
import Text from 'antd/lib/typography/Text';
import { PlusOutlined, UploadOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { importActions } from 'actions/import-actions';

import { usePrevious } from 'utils/hooks';
import { ProjectsQuery } from 'reducers';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

interface Props {
    onApplyFilter(filter: string | null): void;
    onApplySorting(sorting: string | null): void;
    onApplySearch(search: string | null): void;
    query: ProjectsQuery;
    importing: boolean;
}

function TopBarComponent(props: Props): JSX.Element {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { importing, query, onApplyFilter, onApplySearch } = props;
    const prevImporting = usePrevious(importing);

    useEffect(() => {
        if (prevImporting && !importing) {
            onApplyFilter(query.filter);
        }
    }, [importing]);
    const history = useHistory();

    const dimensions = {
        md: 20,
        lg: 20,
        xl: 18,
        xxl: 14,
    };

    return (
        <Row className='cvat-projects-page-top-bar' justify='center' align='middle'>
            <Col {...dimensions}>
                <div>
                    <Text strong className='cvat-projects-page-title'>
                        {t('title.projects')}
                    </Text>
                </div>
                <Space className='cvat-projects-page-filters-wrapper'>
                    <Input.Search
                        enterButton
                        onSearch={(phrase: string) => {
                            onApplySearch(phrase);
                        }}
                        defaultValue={query.search || ''}
                        className='cvat-projects-page-search-bar'
                        placeholder={t('search.placeholder')}
                        suffix={<SearchOutlined />}
                    />
                    <Button
                        className='cvat-import-project-button'
                        type='primary'
                        disabled={importing}
                        icon={
                            importing ? (
                                <LoadingOutlined className='cvat-import-project-button-loading' />
                            ) : (
                                <UploadOutlined />
                            )
                        }
                        onClick={() => dispatch(importActions.openImportBackupModal('project'))}
                    />
                    <Button
                        className='cvat-create-project-button'
                        type='primary'
                        onClick={(): void => history.push('/projects/create')}
                        icon={<PlusOutlined />}
                    />
                </Space>
                {/* <ModalContainer /> */}
            </Col>
        </Row>
    );
}

export default React.memo(TopBarComponent);
