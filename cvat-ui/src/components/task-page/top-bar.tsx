import React from 'react';
import { useHistory } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import { LeftOutlined, MoreOutlined } from '@ant-design/icons';
import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';

import ActionsMenuContainer from 'containers/actions-menu/actions-menu';
import { useTranslation } from 'react-i18next';

interface DetailsComponentProps {
    taskInstance: any;
}

export default function DetailsComponent(props: DetailsComponentProps): JSX.Element {
    const { taskInstance } = props;

    const history = useHistory();
    const { t } = useTranslation();
    return (
        <Row className='cvat-task-top-bar' justify='space-between' align='middle'>
            <Col>
                {taskInstance.projectId ? (
                    <Button
                        className='cvat-back-to-project-button'
                        onClick={() => history.push(`/projects/${taskInstance.projectId}`)}
                        type='link'
                        size='large'
                    >
                        <LeftOutlined />
                        {t('header.Back to projects')}
                    </Button>
                ) : (
                    <Button
                        className='cvat-back-to-tasks-button'
                        onClick={() => history.push('/tasks')}
                        type='link'
                        size='large'
                    >
                        <LeftOutlined />
                        {t('header.Back to tasks')}
                    </Button>
                )}
            </Col>
            <Col>
                <Dropdown dropdownRender={() => <ActionsMenuContainer taskInstance={taskInstance} />}>
                    <Button size='middle' className='cvat-task-page-actions-button'>
                        Actions
                        <MoreOutlined className='cvat-menu-icon' />
                    </Button>
                </Dropdown>
            </Col>
        </Row>
    );
}
