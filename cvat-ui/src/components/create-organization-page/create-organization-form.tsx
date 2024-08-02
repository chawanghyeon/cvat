import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Space from 'antd/lib/space';
import Divider from 'antd/lib/divider';
import { Store } from 'antd/lib/form/interface';
import { useForm } from 'antd/lib/form/Form';
import notification from 'antd/lib/notification';

import { createOrganizationAsync } from 'actions/organization-actions';
import validationPatterns from 'utils/validation-patterns';
import { CombinedState } from 'reducers';
import { useTranslation } from 'react-i18next';

function CreateOrganizationForm(): JSX.Element {
    const [form] = useForm<Store>();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const creating = useSelector((state: CombinedState) => state.organizations.creating);
    const MAX_SLUG_LEN = 16;
    const MAX_NAME_LEN = 64;

    const onFinish = (values: Store): void => {
        const { phoneNumber, email, ...rest } = values;

        rest.contact = {
            ...(phoneNumber ? { phoneNumber } : {}),
            ...(email ? { email } : {}),
        };

        dispatch(
            createOrganizationAsync(rest, (createdSlug: string): void => {
                form.resetFields();
                notification.info({ message: `Organization ${createdSlug} has been successfully created` });
            }),
        );
    };

    return (
        <Form
            form={form}
            autoComplete='off'
            onFinish={onFinish}
            className='cvat-create-organization-form'
            labelCol={{ span: 4 }}
        >
            <Divider />
            <Form.Item
                hasFeedback
                name='slug'
                label={t('organizations.create.shortName')}
                rules={[
                    { required: true, message: t('organizations.validation.shortNameRequire') },
                    {
                        max: MAX_SLUG_LEN,
                        message: `${t('organizations.validation.shortNameLen_1')} ${MAX_SLUG_LEN} ${t(
                            'organizations.validation.shortNameLen_2',
                        )}`,
                    },
                    { ...validationPatterns.validateOrganizationSlug },
                ]}
            >
                <Input placeholder='AgileGrowth' />
            </Form.Item>
            <Divider />
            <Form.Item
                hasFeedback
                name='name'
                label={t('organizations.create.fullName')}
                rules={[
                    {
                        max: MAX_NAME_LEN,
                        message: `${t('organizations.validation.fullNameLen_1')} ${MAX_NAME_LEN} ${t(
                            'organizations.validation.fullNameLen_2',
                        )}`,
                    },
                ]}
            >
                <Input placeholder='AgileGrowth corp.' />
            </Form.Item>
            <Divider />
            <Form.Item hasFeedback name='description' label='Description'>
                <Input.TextArea rows={3} />
            </Form.Item>
            <Divider />
            <Form.Item
                hasFeedback
                name='email'
                label={t('organizations.create.email')}
                rules={[{ type: 'email', message: t('organizations.validation.email') }]}
            >
                <Input autoComplete='email' placeholder='support@agilegrowth.co.kr' />
            </Form.Item>
            <Divider />
            <Form.Item
                hasFeedback
                name='phoneNumber'
                label={t('organizations.create.phoneNumber')}
                rules={[{ ...validationPatterns.validatePhoneNumber }]}
            >
                <Input autoComplete='phoneNumber' placeholder='010-1234-5678' />
            </Form.Item>
            <Divider />
            <Form.Item>
                <Space className='cvat-create-organization-form-buttons-block' align='center'>
                    <Button
                        className='cvat-submit-new-organization-button'
                        loading={creating}
                        disabled={creating}
                        htmlType='submit'
                        type='primary'
                    >
                        Submit
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}

export default React.memo(CreateOrganizationForm);
