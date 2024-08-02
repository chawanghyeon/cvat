import React from 'react';
import { useHistory } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import { LeftOutlined, MoreOutlined } from '@ant-design/icons';
import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';

import { Project } from 'reducers';
import ActionsMenu from 'components/projects-page/actions-menu';
import { useTranslation } from 'react-i18next';

interface DetailsComponentProps {
    projectInstance: Project;
}

export default function ProjectTopBar(props: DetailsComponentProps): JSX.Element {
    const { projectInstance } = props;

    const history = useHistory();
    const { t } = useTranslation();

    return (
        <>
            <Row className='cvat-task-top-bar' justify='space-between' align='middle'>
                <Col>
                    <Button
                        onClick={() => history.push('/projects')}
                        type='link'
                        size='large'
                        className='cvat-project-page-goback-button'
                    >
                        <LeftOutlined className='cvat-back-icon' />
                        {t('header.Back to projects')}
                    </Button>
                </Col>
                <Col className='cvat-project-top-bar-actions'>
                    <Dropdown dropdownRender={() => <ActionsMenu projectInstance={projectInstance} />}>
                        <Button size='middle' className='cvat-project-page-actions-button'>
                            Actions
                            <MoreOutlined className='cvat-menu-icon' />
                        </Button>
                    </Dropdown>
                </Col>
            </Row>
        </>
    );
}
