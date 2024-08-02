import React from 'react';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import { MailOutlined } from '@ant-design/icons';
import Input from 'antd/lib/input';

export interface ResetPasswordData {
    email: string;
}

interface Props {
    fetching: boolean;
    onSubmit(resetPasswordData: ResetPasswordData): void;
}

function ResetPasswordFormComponent({ fetching, onSubmit }: Props): JSX.Element {
    return (
        <Form onFinish={onSubmit}>
            <Form.Item
                hasFeedback
                name='email'
                rules={[
                    {
                        type: 'email',
                        message: 'The input is not valid E-mail!',
                    },
                    {
                        required: true,
                        message: 'Please specify an email address',
                    },
                ]}
            >
                <Input
                    autoComplete='email'
                    prefix={<MailOutlined />}
                    placeholder='Email address'
                    size='large'
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type='primary'
                    size='large'
                    loading={fetching}
                    disabled={fetching}
                    htmlType='submit'
                    block
                >
                    비밀번호 재설정 메일전송
                </Button>
            </Form.Item>
        </Form>
    );
}

export default React.memo(ResetPasswordFormComponent);
