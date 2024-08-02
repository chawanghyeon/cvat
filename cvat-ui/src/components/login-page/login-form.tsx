import React from 'react';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

export interface LoginData {
    credential: string;
    password: string;
}

interface Props {
    renderResetPassword: boolean;
    fetching: boolean;
    socialAuthentication: JSX.Element | null;
    onSubmit(loginData: LoginData): void;
}

function LoginFormComponent(props: Props): JSX.Element {
    const { fetching, onSubmit, socialAuthentication } = props;
    return (
        <Form onFinish={onSubmit}>
            <Form.Item
                hasFeedback
                name='credential'
                rules={[
                    {
                        required: true,
                        message: 'Please specify a username',
                    },
                ]}
            >
                <Input
                    size='large'
                    autoComplete='credential'
                    prefix={<UserOutlined />}
                    placeholder='Username'
                />
            </Form.Item>

            <Form.Item
                hasFeedback
                name='password'
                rules={[
                    {
                        required: true,
                        message: 'Please specify a password',
                    },
                ]}
            >
                <Input
                    size='large'
                    autoComplete='current-password'
                    prefix={<LockOutlined />}
                    placeholder='Password'
                    type='password'
                />
            </Form.Item>

            <Form.Item>
                <Button
                    size='large'
                    type='primary'
                    loading={fetching}
                    disabled={fetching}
                    htmlType='submit'
                    block
                >
                    로그인
                </Button>
            </Form.Item>
            { socialAuthentication && socialAuthentication }
        </Form>
    );
}

export default React.memo(LoginFormComponent);
