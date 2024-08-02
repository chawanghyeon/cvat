import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Modal from 'antd/lib/modal';
import Menu from 'antd/lib/menu';
import Icon from '@ant-design/icons';
import Text from 'antd/lib/typography/Text';

import { UserIcon, TrashIcon } from 'icons';
import { Input } from 'antd';
import { removeOrganizationAsync } from 'actions/organization-actions';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useTranslation } from 'react-i18next';
import OrganizationInvitationModal from './organization-invitation-modal';

interface Props {
    organizationInstance: any;
}

export default function OrganizationActionsMenuComponent(props: Props): JSX.Element {
    const { organizationInstance } = props;

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [visibleInviteModal, setVisibleInviteModal] = useState<boolean>(false);

    const menuItem: ItemType[] = [
        {
            key: 'invite-user',
            title: 'Invite user',
            label: t('organizations.actionMenu.inviteUser'),
            itemIcon: <Icon component={UserIcon} className='cvat-organization-actions-menu-icon' />,
            onClick: () => setVisibleInviteModal(true),
        },
        {
            key: 'remove-org',
            title: 'Remove Organization',
            label: t('organizations.actionMenu.removeOrganization'),
            itemIcon: <Icon component={TrashIcon} className='cvat-organization-actions-menu-icon' />,
            onClick: () => {
                const modal = Modal.confirm({
                    onOk: () => {
                        dispatch(removeOrganizationAsync(organizationInstance));
                    },
                    content: (
                        <div className='cvat-remove-organization-submit'>
                            <Text type='warning'>To remove the organization, enter its short name below</Text>
                            <Input
                                placeholder={t('organizations.actionMenu.placeholder')}
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
                    title: t('organizations.actionMenu.removeOrganization'),
                    okButtonProps: {
                        disabled: true,
                        danger: true,
                    },
                    okText: t('organizations.actionMenu.remove'),
                    cancelText: t('organizations.actionMenu.cancel'),
                    className: 'cvat-remove-organization',
                });
            },
        },
    ];

    return (
        <>
            <Menu selectable={false} className='cvat-organization-actions-menu' items={menuItem} />
            <OrganizationInvitationModal
                organizationInstance={organizationInstance}
                visible={visibleInviteModal}
                setVisible={(visible: boolean) => setVisibleInviteModal(visible)}
            />
        </>
    );
}
