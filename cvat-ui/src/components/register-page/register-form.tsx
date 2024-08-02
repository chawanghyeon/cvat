import React from 'react';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import Form, { RuleRender, RuleObject } from 'antd/lib/form';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Checkbox from 'antd/lib/checkbox';
// import { Link } from 'react-router-dom';
// import { BackArrowIcon } from 'icons';

import patterns from 'utils/validation-patterns';

import { UserAgreement } from 'reducers';
// import CVATSigningInput, { CVATInputType } from 'components/signing-common/cvat-signing-input';

export interface UserConfirmation {
    name: string;
    value: boolean;
}

export interface RegisterData {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmations: UserConfirmation[];
}

interface Props {
    fetching: boolean;
    userAgreements: UserAgreement[];
    onSubmit(registerData: RegisterData): void;
}

export const validatePassword: RuleRender = (): RuleObject => ({
    validator(_: RuleObject, value: string): Promise<void> {
        if (!patterns.validatePasswordLength.pattern.test(value)) {
            return Promise.reject(new Error(patterns.validatePasswordLength.message));
        }

        return Promise.resolve();
    },
});

export const validateConfirmation: (firstFieldName: string) => RuleRender =
    (firstFieldName: string): RuleRender => ({ getFieldValue }): RuleObject => ({
        validator(_: RuleObject, value: string): Promise<void> {
            if (value && value !== getFieldValue(firstFieldName)) {
                return Promise.reject(new Error('Two passwords that you enter is inconsistent!'));
            }

            return Promise.resolve();
        },
    });

const validateAgreement: (userAgreements: UserAgreement[]) => RuleRender =
    (userAgreements: UserAgreement[]): RuleRender => () => ({
        validator(rule: any, value: boolean): Promise<void> {
            const [, name] = rule.field.split(':');
            const [agreement] = userAgreements.filter(
                (userAgreement: UserAgreement): boolean => userAgreement.name === name,
            );
            if (agreement.required && !value) {
                return Promise.reject(new Error(`You must accept ${agreement.urlDisplayText} to continue!`));
            }
            return Promise.resolve();
        },
    });

function RegisterFormComponent(props: Props): JSX.Element {
    const { fetching, onSubmit, userAgreements } = props;
    // const [form] = Form.useForm();
    return (
        <Form
            layout='vertical'
            onFinish={(values: Record<string, string | boolean>) => {
                const agreements = Object.keys(values).filter((key: string): boolean => key.startsWith('agreement:'));
                const confirmations = agreements.map(
                    (key: string): UserConfirmation => ({ name: key.split(':')[1], value: values[key] as boolean }),
                );
                const rest = Object.entries(values).filter(
                    (entry: (string | boolean)[]) => !agreements.includes(entry[0] as string),
                );

                onSubmit({
                    ...(Object.fromEntries(rest) as any as RegisterData),
                    confirmations,
                });
            }}
        >
            <Form.Item
                label={<span style={{ color: 'white' }}>Username</span>}
                hasFeedback
                name='username'
                rules={[
                    {
                        type: 'username',
                        message: 'The input is not valid E-mail!',
                    },
                    {
                        required: true,
                        message: 'Please specify an username address',
                    },
                ]}
            >
                <Input
                    type='username'
                    autoComplete='username'
                    prefix={<MailOutlined />}
                    size='large'
                    style={{ color: 'white' }}
                />
            </Form.Item>

            <Form.Item
                label={<span style={{ color: 'white' }}>Password</span>}
                hasFeedback
                name='password'
                rules={[
                    {
                        required: true,
                        message: 'Please input your password!',
                    },
                    validatePassword,
                ]}
                labelCol={{ style: { color: 'white' } }}
            >
                <Input.Password
                    type='password'
                    name='password'
                    id='new-password'
                    autoComplete='new-password'
                    prefix={<LockOutlined />}
                    size='large'
                />
            </Form.Item>

            <Form.Item
                label={<div style={{ color: 'white' }}>Confirm Password</div>}
                hasFeedback
                name='confirm-password'
                dependencies={['password']}
                rules={[
                    {
                        required: true,
                        message: 'Please confirm your password!',
                    },
                    validateConfirmation('password'),
                ]}
            >
                <Input.Password
                    type='password'
                    name='password'
                    id='new-password'
                    autoComplete='confirm-password'
                    prefix={<LockOutlined />}
                    size='large'
                />
            </Form.Item>

            {userAgreements.map(
                (userAgreement: UserAgreement): JSX.Element => (
                    <Form.Item
                        name={`agreement:${userAgreement.name}`}
                        key={userAgreement.name}
                        initialValue={false}
                        valuePropName='checked'
                        rules={[
                            {
                                required: true,
                                message: 'You must accept to continue!',
                            },
                            validateAgreement(userAgreements),
                        ]}
                    >
                        <Checkbox>
                            {userAgreement.textPrefix}
                            {!!userAgreement.url && (
                                <a rel='noopener noreferrer' target='_blank' href={userAgreement.url}>
                                    {` ${userAgreement.urlDisplayText}`}
                                </a>
                            )}
                        </Checkbox>
                    </Form.Item>
                ),
            )}

            <Form.Item>
                <Button type='primary' size='large' htmlType='submit' loading={fetching} disabled={fetching} block>
                    Create account
                </Button>
            </Form.Item>
        </Form>
    );
}

export default React.memo(RegisterFormComponent);
