import React from 'react';

import Empty from 'antd/lib/empty';
import { Row, Col } from 'antd/lib/grid';
import Text from 'antd/lib/typography/Text';
import { CloudOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Props {
    notFound: boolean;
}

export default function EmptyStoragesListComponent(props: Props): JSX.Element {
    const { notFound } = props;

    const { t } = useTranslation();

    const description = notFound ? (
        <Row justify='center' align='middle'>
            <Col>
                <Text strong>{t('message.notFound')}</Text>
            </Col>
        </Row>
    ) : (
        <>
            <Row justify='center' align='middle'>
                <Col>
                    <Text strong>{t('message.noStorageAttached')}</Text>
                </Col>
            </Row>
            <Row justify='center' align='middle'>
                <Col>
                    <Text type='secondary'>{t('message.toGetStarted')}</Text>
                </Col>
            </Row>
            <Row justify='center' align='middle'>
                <Col>
                    <Link to='/cloudstorages/create'>{t('message.attachANewOne')}</Link>
                </Col>
            </Row>
        </>
    );

    return (
        <div className='cvat-empty-cloud-storages-list'>
            <Empty
                description={description}
                image={<CloudOutlined className='cvat-empty-cloud-storages-list-icon' />}
            />
        </div>
    );
}
