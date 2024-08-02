import React from 'react';
import Select from 'antd/lib/select';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';
import moment from 'moment';
import Icon from '@ant-design/icons';
import Modal from 'antd/lib/modal';
import { IllustWarningIcon, TrashGrayIcon } from 'icons';
import { useTranslation } from 'react-i18next';

export interface Props {
    membershipInstance: any;
    onRemoveMembership(): void;
    onUpdateMembershipRole(role: string): void;
}

function MemberItem(props: Props): JSX.Element {
    const { t } = useTranslation();
    const { membershipInstance, onRemoveMembership, onUpdateMembershipRole } = props;
    const { user, joined_date: joinedDate, role, invitation } = membershipInstance;
    const { username } = user;

    return (
        <Row className='cvat-organization-member-item' justify='space-between'>
            <Col span={5} className='cvat-organization-member-item-username'>
                <Text strong className='cvat-text-color'>
                    {username}
                </Text>
            </Col>
            <Col span={12} offset={1} className='cvat-organization-member-item-dates'>
                {invitation ? (
                    <Text type='secondary'>
                        {`Invited ${moment(invitation.created_date).fromNow()} `}
                        {invitation.owner ? (
                            <>
                                {'by '}
                                <span className='cvat-text-color'>{invitation.owner.username}</span>
                            </>
                        ) : (
                            ''
                        )}
                        {joinedDate ? `  (Joined ${moment(joinedDate).fromNow()})` : ''}
                    </Text>
                ) : null}
            </Col>
            <Col span={4} className='cvat-organization-member-item-role'>
                <Select
                    onChange={(_role: string) => {
                        onUpdateMembershipRole(_role);
                    }}
                    value={role}
                    disabled={role === 'owner'}
                >
                    {role === 'owner' ? (
                        <Select.Option value='owner'>Owner</Select.Option>
                    ) : (
                        <>
                            <Select.Option value='worker'>{t('organizations.user.worker')}</Select.Option>
                            <Select.Option value='supervisor'>{t('organizations.user.supervisor')}</Select.Option>
                            <Select.Option value='maintainer'>{t('organizations.user.maintainer')}</Select.Option>
                        </>
                    )}
                </Select>
            </Col>
            <Col span={1} className='cvat-organization-member-item-remove'>
                {role !== 'owner' ? (
                    <Icon
                        component={TrashGrayIcon}
                        onClick={() => {
                            Modal.confirm({
                                className: 'cvat-modal-organization-member-remove',
                                title: `You are removing "${username}" from this organization`,
                                content: (
                                    <div style={{ textAlign: 'center' }}>
                                        <Icon component={IllustWarningIcon} />
                                        <br />
                                        <Text>
                                            The person will not have access to the organization data anymore. Continue?
                                        </Text>
                                    </div>
                                ),
                                okText: 'Yes, remove',
                                okButtonProps: {
                                    danger: true,
                                },
                                onOk: () => {
                                    onRemoveMembership();
                                },
                            });
                        }}
                    />
                ) : null}
            </Col>
        </Row>
    );
}

export default React.memo(MemberItem);
