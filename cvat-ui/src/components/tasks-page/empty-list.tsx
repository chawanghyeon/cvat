import React from 'react';
import { Link } from 'react-router-dom';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';

import { TasksQuery } from 'reducers';
import Empty from 'antd/lib/empty';
import { IllustEmptyIcon } from 'icons';
import { useTranslation } from 'react-i18next';

interface Props {
    query: TasksQuery;
}

function EmptyListComponent(props: Props): JSX.Element {
    const { query } = props;

    const { t } = useTranslation();

    return (
        <div className='cvat-empty-tasks-list'>
            <Empty
                image={<IllustEmptyIcon />}
                description={
                    !query.filter && !query.search && !query.page ? (
                        <>
                            <Row justify='center' align='middle'>
                                <Col>
                                    <Text strong>No tasks created yet ...</Text>
                                </Col>
                            </Row>
                            <Row justify='center' align='middle'>
                                <Col>
                                    <Text type='secondary'>To get started with your annotation project</Text>
                                </Col>
                            </Row>
                            <Row justify='center' align='middle'>
                                <Col>
                                    <Link to='/tasks/create'>create a new task</Link>
                                    <Text type='secondary'> or try to </Text>
                                    <Link to='/projects/create'>create a new project</Link>
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

export default React.memo(EmptyListComponent);
