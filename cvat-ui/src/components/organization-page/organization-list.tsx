import './styles.scss';
import React from 'react';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import Empty from 'antd/lib/empty';
import Spin from 'antd/lib/spin';
import moment from 'moment';

import { CombinedState } from 'reducers';
import { Button, Card, Col, Dropdown, Row } from 'antd';
import Text from 'antd/lib/typography/Text';
import Icon, { MoreOutlined } from '@ant-design/icons';
import { PlusIcon } from 'icons';
import { useTranslation } from 'react-i18next';
import OrganizationActionsMenuComponent from './actions-menu';

function OrganizationList(): JSX.Element | null {
    const organizations = useSelector((state: CombinedState) => state.organizations.list);
    const fetching = useSelector((state: CombinedState) => state.organizations.fetching);
    const history = useHistory();

    const { t } = useTranslation();

    const dimensions = {
        md: 22,
        lg: 22,
        xl: 18,
        xxl: 16,
    };

    if (fetching) {
        return <Spin className='cvat-spinner' />;
    }

    return (
        <div className='cvat-organization-list'>
            <Row className='cvat-organization-list-top-bar' justify='space-evenly' align='middle'>
                <Col {...dimensions}>
                    <Text className='cvat-organization-header'> {t('title.organizations')}</Text>
                    <Button
                        type='primary'
                        icon={<Icon component={PlusIcon} />}
                        onClick={() => history.push('organizations/create')}
                        style={{ float: 'right' }}
                    />
                </Col>
            </Row>
            <Row justify='center' align='middle' className='cvat-organization-list-content'>
                <Col {...dimensions}>
                    {!organizations ? (
                        <Empty description='You are not in an organization' />
                    ) : (
                        <Row gutter={[16, 16]}>
                            {organizations.map((org) => (
                                <Col span={6} key={org.id}>
                                    <Card
                                        onClick={() => {
                                            // TODO: 현재는 localstorage에 강제로 값을 변경하기 때문에 페이지를 강제 refresh 해야 한다.
                                            localStorage.setItem('currentOrganization', org.slug);
                                            window.location.href = '/organization';
                                        }}
                                        bordered={false}
                                    >
                                        <Row>
                                            <Col span={22}>
                                                <div className='cvat-text-color'>{org.slug}</div>
                                                <Text type='secondary'>{org.name}</Text>
                                            </Col>
                                        </Row>
                                        <div
                                            role='button'
                                            tabIndex={0}
                                            className='more-btn'
                                            onClick={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        >
                                            <Dropdown
                                                dropdownRender={() => (
                                                    <OrganizationActionsMenuComponent organizationInstance={org} />
                                                )}
                                            >
                                                <Button type='link' icon={<MoreOutlined />} />
                                            </Dropdown>
                                        </div>
                                        <Row className='cvat-organization-bottom-box'>
                                            <Col span={24}>
                                                {`${moment(org.createdDate).format('YYYY.MM.DD')} Created `}
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(OrganizationList);
