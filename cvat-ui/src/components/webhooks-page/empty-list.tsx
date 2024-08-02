import React from 'react';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';

import Empty from 'antd/lib/empty';
import { WebhooksQuery } from 'reducers';
import { useTranslation } from 'react-i18next';

interface Props {
    query: WebhooksQuery;
}

function EmptyWebhooksListComponent(props: Props): JSX.Element {
    const { query } = props;
    const { t } = useTranslation();
    return (
        <div className='cvat-empty-webhooks-list'>
            <Empty
                description={
                    !query.filter && !query.search ? (
                        <>
                            <Row justify='center' align='middle'>
                                <Col>
                                    <Text strong>{t('message.noWebhooksCreatedYet')}</Text>
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <Text>{t('message.notFound')}</Text>
                    )
                }
            />
        </div>
    );
}

export default React.memo(EmptyWebhooksListComponent);
