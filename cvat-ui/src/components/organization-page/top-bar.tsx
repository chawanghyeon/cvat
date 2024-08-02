import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import moment from 'moment';
import { Row, Col } from 'antd/lib/grid';
import { Divider } from 'antd';
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import Space from 'antd/lib/space';
import Input from 'antd/lib/input';
import {
    LeftOutlined,
    MailOutlined,
    PhoneOutlined,
    DeleteOutlined,
    UserAddOutlined,
    FileTextOutlined,
    EditOutlined,
} from '@ant-design/icons';

import { leaveOrganizationAsync, removeOrganizationAsync, updateOrganizationAsync } from 'actions/organization-actions';
import { EditIcon } from 'icons';
import { useTranslation } from 'react-i18next';
import OrganizationInvitationModal from './organization-invitation-modal';

export interface Props {
    organizationInstance: any;
    userInstance: any;
    fetchMembers: () => void;
}

function OrganizationTopBar(props: Props): JSX.Element {
    const { t } = useTranslation();
    const { organizationInstance, userInstance, fetchMembers } = props;
    const { owner, createdDate, description, updatedDate, slug, name, contact } = organizationInstance;
    const { id: userID } = userInstance;
    const descriptionEditingRef = useRef<HTMLDivElement>(null);
    const [visibleInviteModal, setVisibleInviteModal] = useState<boolean>(false);
    const [editingDescription, setEditingDescription] = useState<boolean>(false);
    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        const listener = (event: MouseEvent): void => {
            const divElement = descriptionEditingRef.current;
            if (editingDescription && divElement && !event.composedPath().includes(divElement)) {
                setEditingDescription(false);
            }
        };

        window.addEventListener('mousedown', listener);
        return () => {
            window.removeEventListener('mousedown', listener);
        };
    });

    const onRemove = (): void => {
        const modal = Modal.confirm({
            onOk: () => {
                dispatch(removeOrganizationAsync(organizationInstance));
            },
            content: (
                <div className='cvat-remove-organization-submit'>
                    <Text type='warning'>To remove the organization, enter its short name below</Text>
                    <Input
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            modal.update({
                                okButtonProps: {
                                    disabled: event.target.value !== organizationInstance.slug,
                                    danger: true,
                                },
                            });
                        }}
                    />
                </div>
            ),
            okButtonProps: {
                disabled: true,
                danger: true,
            },
            okText: 'Remove',
        });
    };

    let organizationName = name;
    let organizationDescription = description;
    let organizationContacts = contact;
    return (
        <>
            <div className='cvat-organization-top-bar'>
                <Button onClick={() => history.push('/organizations')} type='link' size='large'>
                    <LeftOutlined />
                    이전으로 이동
                </Button>
            </div>
            <Row className='cvat-organization-details'>
                <Col span={14}>
                    <Title level={4}>{slug}</Title>
                </Col>
                <Col span={10} className='cvat-organization-top-bar-buttons-block'>
                    <Space align='end'>
                        {!(owner && userID === owner.id) ? (
                            <Button
                                type='primary'
                                danger
                                onClick={() => {
                                    Modal.confirm({
                                        onOk: () => {
                                            dispatch(leaveOrganizationAsync(organizationInstance));
                                        },
                                        className: 'cvat-modal-organization-leave-confirm',
                                        content: (
                                            <>
                                                <Text>Please, confirm leaving the organization</Text>
                                                <Text strong>{` ${organizationInstance.slug}`}</Text>
                                                <Text>. You will not have access to the organization data anymore</Text>
                                            </>
                                        ),
                                        okText: 'Leave',
                                        okButtonProps: {
                                            danger: true,
                                        },
                                    });
                                }}
                            >
                                Leave organization
                            </Button>
                        ) : null}
                        {owner && userID === owner.id ? (
                            <Button type='primary' danger onClick={onRemove}>
                                {t('organizations.button.removeOrganization')}
                                <DeleteOutlined />
                            </Button>
                        ) : null}
                        <Button type='primary' onClick={() => setVisibleInviteModal(true)}>
                            {t('organizations.button.inviteMembers')}
                            <UserAddOutlined />
                        </Button>
                    </Space>
                </Col>
                <Col span={24} style={{ paddingBottom: 20 }}>
                    <Text type='secondary'>{`Created ${moment(createdDate).format('YYYY.MM.DD')}`}</Text>
                    <Divider type='vertical' />
                    <Text type='secondary'>{`Updated ${moment(updatedDate).fromNow()}`}</Text>
                </Col>
                <Row justify='space-between' gutter={16}>
                    <Col span={6}>
                        <Text className='cvat-organization-details-label'>{t('organizations.fullName')}</Text>
                        <Text
                            editable={{
                                onChange: (value: string) => {
                                    organizationName = value;
                                },
                                onEnd: () => {
                                    organizationInstance.name = organizationName;
                                    dispatch(updateOrganizationAsync(organizationInstance));
                                },
                                icon: <EditIcon />,
                            }}
                            className='cvat-organization-top-bar-editable'
                        >
                            <span>
                                <FileTextOutlined />
                                {name}
                            </span>
                        </Text>
                    </Col>
                    <Col span={18}>
                        <Text className='cvat-organization-details-label'>{t('organizations.description')}</Text>
                        <Text
                            type={organizationInstance.description ? undefined : 'secondary'}
                            editable={{
                                onChange: (value: string) => {
                                    organizationDescription = value;
                                },
                                onEnd: () => {
                                    organizationInstance.description = organizationDescription;
                                    dispatch(updateOrganizationAsync(organizationInstance));
                                },
                                icon: <EditIcon />,
                            }}
                            className='cvat-organization-top-bar-editable'
                        >
                            <span>
                                <EditOutlined />
                                {organizationInstance.description ?
                                    t('organizations.description') :
                                    t('organizations.addDescription')}
                            </span>
                        </Text>
                    </Col>
                </Row>
                <Row justify='space-between' gutter={16}>
                    <Col span={8}>
                        <Text className='cvat-organization-details-label'>{t('organizations.phoneNumber')}</Text>
                        <Text
                            type={contact.phoneNumber ? undefined : 'secondary'}
                            editable={{
                                onChange: (value: string) => {
                                    organizationContacts = {
                                        ...organizationInstance.contact,
                                        phoneNumber: value,
                                    };
                                },
                                onEnd: () => {
                                    organizationInstance.contact = organizationContacts;
                                    dispatch(updateOrganizationAsync(organizationInstance));
                                },
                                icon: <EditIcon />,
                            }}
                            className='cvat-organization-top-bar-editable'
                        >
                            <span>
                                <PhoneOutlined />
                                {contact.phoneNumber ? contact.phoneNumber : t('organizations.addPhoneNumber')}
                            </span>
                        </Text>
                    </Col>
                    <Col span={16}>
                        <Text className='cvat-organization-details-label'>{t('organizations.email')}</Text>
                        <Text
                            type={contact.email ? undefined : 'secondary'}
                            editable={{
                                onChange: (value: string) => {
                                    organizationContacts = {
                                        ...organizationInstance.contact,
                                        email: value,
                                    };
                                },
                                onEnd: () => {
                                    organizationInstance.contact = organizationContacts;
                                    dispatch(updateOrganizationAsync(organizationInstance));
                                },
                                icon: <EditIcon />,
                            }}
                            className='cvat-organization-top-bar-editable'
                        >
                            <span>
                                <MailOutlined />
                                {contact.email ? contact.email : t('organizations.addEmail')}
                            </span>
                        </Text>
                    </Col>
                </Row>
            </Row>
            <OrganizationInvitationModal
                organizationInstance={organizationInstance}
                visible={visibleInviteModal}
                setVisible={(_visible: boolean) => setVisibleInviteModal(_visible)}
                fetchMembers={fetchMembers}
            />
        </>
    );
}

export default React.memo(OrganizationTopBar);
