import React from 'react';
import { useDispatch } from 'react-redux';
import { Row, Col } from 'antd/lib/grid';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import { useForm } from 'antd/lib/form/Form';
import { Store } from 'antd/lib/form/interface';
import Icon from '@ant-design/icons';

import { inviteOrganizationMembersAsync } from 'actions/organization-actions';
import { PlusIcon, TrashGrayIcon } from 'icons';
import { useTranslation } from 'react-i18next';

export interface Props {
    organizationInstance: any;
    visible: boolean;
    fetchMembers?: () => void;
    setVisible: (visible: boolean) => void;
}

function OrganizationInvitationModal(props: Props): JSX.Element {
    const { t } = useTranslation();
    const { organizationInstance, visible, fetchMembers, setVisible } = props;
    const [form] = useForm();
    const dispatch = useDispatch();

    return (
        <Modal
            className='cvat-organization-invitation-modal'
            open={visible}
            onCancel={() => {
                setVisible(false);
                form.resetFields(['users']);
            }}
            destroyOnClose
            onOk={() => {
                form.submit();
            }}
            title={t('organizations.actionMenu.inviteUsers')}
            width={450}
        >
            <Form
                initialValues={{
                    users: [{ email: '' }],
                }}
                onFinish={(values: Store) => {
                    dispatch(
                        inviteOrganizationMembersAsync(organizationInstance, values.users, () => {
                            if (fetchMembers !== undefined) {
                                fetchMembers();
                            }
                        }),
                    );
                    setVisible(false);
                    form.resetFields(['users']);
                }}
                layout='vertical'
                form={form}
            >
                <Form.List name='users'>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field: any, index: number) => (
                                <Row className='cvat-organization-invitation-field' key={field.key}>
                                    <Col span={13}>
                                        <Form.Item
                                            className='cvat-organization-invitation-field-email'
                                            hasFeedback
                                            name={[field.name, 'email']}
                                            key={field.fieldKey}
                                            rules={[
                                                { required: true, message: t('organizations.message.require') },
                                                // { type: 'email', message: 'The input is not a valid email' },
                                            ]}
                                        >
                                            <Input placeholder={t('organizations.message.emailPlaceholder')} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={9}>
                                        <Form.Item
                                            className='cvat-organization-invitation-field-role'
                                            name={[field.name, 'role']}
                                            key={field.fieldKey}
                                            initialValue='worker'
                                            rules={[{ required: true, message: t('organizations.message.require') }]}
                                        >
                                            <Select>
                                                <Select.Option value='worker'>
                                                    {t('organizations.user.worker')}
                                                </Select.Option>
                                                <Select.Option value='supervisor'>
                                                    {t('organizations.user.supervisor')}
                                                </Select.Option>
                                                <Select.Option value='maintainer'>
                                                    {t('organizations.user.maintainer')}
                                                </Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={1}>
                                        {index > 0 ? (
                                            <Icon component={TrashGrayIcon} onClick={() => remove(field.name)} />
                                        ) : null}
                                    </Col>
                                </Row>
                            ))}
                            <Form.Item>
                                <Button
                                    icon={<Icon component={PlusIcon} />}
                                    onClick={() => add()}
                                    className='cvat-add-field'
                                >
                                    Invite more
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
}

export default React.memo(OrganizationInvitationModal);
