import React from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import Text from 'antd/lib/typography/Text';
import Card from 'antd/lib/card';
import Dropdown from 'antd/lib/dropdown';
import { MoreOutlined } from '@ant-design/icons';

import { CombinedState, Project } from 'reducers';
// import { useCardHeightHOC } from 'utils/hooks';
import { Col, Row } from 'antd';
// import { IllustFileIcon } from 'icons';
import Preview from 'components/common/preview';
import { useTranslation } from 'react-i18next';
import ProjectActionsMenuComponent from './actions-menu';

interface Props {
    projectInstance: Project;
}

export default function ProjectItemComponent(props: Props): JSX.Element {
    const { projectInstance: instance } = props;
    const { t } = useTranslation();

    const history = useHistory();
    const ownerName = instance.owner ? instance.owner.username : null;
    const updated = moment(instance.updatedDate).fromNow();
    const deletes = useSelector((state: CombinedState) => state.projects.activities.deletes);
    const deleted = instance.id in deletes ? deletes[instance.id] : false;

    const onOpenProject = (): void => {
        history.push(`/projects/${instance.id}`);
    };

    const style: React.CSSProperties = deleted ? { pointerEvents: 'none', opacity: 0.5 } : {};

    const renderDescription = (): JSX.Element => (
        <Row className='cvat-projects-item-description'>
            <Col span={22}>
                <span className='cvat-projects-item-name'>
                    {instance.name.substring(0, 70)}
                    {instance.name.length > 70 ? '...' : ''}
                </span>
                <br />
                <Text type='secondary'>{ownerName || ''}</Text>
            </Col>
            <Col span={2} onClick={(e) => e.stopPropagation()}>
                <Dropdown dropdownRender={() => <ProjectActionsMenuComponent projectInstance={instance} />}>
                    <MoreOutlined className='cvat-menu-icon' />
                </Dropdown>
            </Col>
        </Row>
    );

    const renderFooter = (): JSX.Element => (
        <div className='cvat-projects-item-footer'>
            <Text type='secondary'>{t('time.LastUpdated')} | </Text>
            <Text type='secondary'>{updated}</Text>
        </div>
    );

    return (
        <Card
            cover={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <Preview
                    project={instance}
                    loadingClassName='cvat-projects-loading-preview'
                    previewWrapperClassName='cvat-projects-preview-wrapper'
                    emptyPreviewClassName='cvat-projects-empty-preview'
                />
            }
            bordered={false}
            style={style}
            className='cvat-projects-list-item'
            onClick={onOpenProject}
        >
            {renderDescription()}
            {renderFooter()}
        </Card>
    );
}
