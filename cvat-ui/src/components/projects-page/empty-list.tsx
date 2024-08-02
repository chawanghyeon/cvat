import React from 'react';
// import { Link } from 'react-router-dom';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';
import Empty from 'antd/lib/empty';

import { IllustEmptyIcon } from 'icons';
import { useTranslation } from 'react-i18next';

interface Props {
    notFound: boolean;
}

export default function EmptyListComponent(props: Props): JSX.Element {
    const { notFound } = props;

    const { t } = useTranslation();
    return (
        <div className='cvat-empty-projects-list'>
            <Empty
                image={<IllustEmptyIcon />}
                description={
                    notFound ? (
                        <Text strong>{t('message.notFound')}</Text>
                    ) : (
                        <>
                            <Row justify='center' align='middle'>
                                <Col>
                                    <Text strong>{t('message.noProjectsCreatedYet')}</Text>
                                </Col>
                            </Row>
                        </>
                    )
                }
            />
        </div>
    );
}
