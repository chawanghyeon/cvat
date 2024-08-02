import React, { useEffect } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import { Link, withRouter } from 'react-router-dom';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';

import SocialAccountLink from 'components/signing-common/social-account-link';

import { getCore, SocialAuthMethods, SocialAuthMethod } from 'cvat-core-wrapper';
import { SignInIcon, SALMONLogo } from 'icons';

import Layout from 'antd/lib/layout';
import { Divider } from 'antd';
import Icon from '@ant-design/icons';
import config from 'config';
import LoginForm, { LoginData } from './login-form';

const cvat = getCore();

interface LoginPageComponentProps {
    fetching: boolean;
    renderResetPassword: boolean;
    hasEmailVerificationBeenSent: boolean;
    socialAuthMethods: SocialAuthMethods;
    onLogin: (credential: string, password: string) => void;
    loadSocialAuthenticationMethods: () => void;
}

const renderSocialAuthMethods = (methods: SocialAuthMethods): JSX.Element | null => {
    const { backendAPI } = cvat.config;
    const activeMethods = methods.filter((item: SocialAuthMethod) => item.isEnabled);

    if (!activeMethods.length) {
        return null;
    }

    return (
        <div className='cvat-social-authentication-row-with-icons'>
            {activeMethods.map((method: SocialAuthMethod) => (
                <SocialAccountLink
                    key={method.provider}
                    icon={method.icon}
                    href={(method.provider !== config.SSO_PROVIDER_KEY) ? `${backendAPI}/auth/social/${method.provider}/login/` : '/auth/oidc/select-identity-provider/'}
                    className={`cvat-social-authentication-${method.provider}`}
                >
                    {`Continue with ${method.publicName}`}
                </SocialAccountLink>
            ))}
        </div>
    );
};

function LoginPageComponent(props: LoginPageComponentProps & RouteComponentProps): JSX.Element {
    const history = useHistory();
    const {
        fetching, renderResetPassword, hasEmailVerificationBeenSent,
        socialAuthMethods, onLogin, loadSocialAuthenticationMethods,
    } = props;

    const sizes = {
        style: {
            width: 640,
            padding: '140px 110px',
        },
    };

    const { Content } = Layout;

    if (hasEmailVerificationBeenSent) {
        history.push('/auth/email-verification-sent');
    }

    useEffect(() => {
        loadSocialAuthenticationMethods();
    }, []);

    return (
        <Layout>
            <Content>
                <Row justify='center' align='middle' style={{ height: '100%' }}>
                    <Col {...sizes} className='shadow-box'>
                        <Row justify='center' align='top'>
                            <Icon component={SignInIcon} className='top-icon' />
                        </Row>
                        <LoginForm
                            fetching={fetching}
                            renderResetPassword={renderResetPassword}
                            socialAuthentication={(socialAuthMethods) ? (
                                <Row className='cvat-social-authentication'>
                                    {renderSocialAuthMethods(socialAuthMethods)}
                                </Row>
                            ) : null}
                            onSubmit={(loginData: LoginData): void => {
                                onLogin(loginData.credential, loginData.password);
                            }}
                        />
                        <Row justify='center' align='middle'>
                            <Col>
                                <Text>
                                    <Link to='/auth/register' style={{ color: '#fff' }}>계정 생성</Link>
                                </Text>
                            </Col>
                            {renderResetPassword && (
                                <Col>
                                    <Divider type='vertical' style={{ borderTop: '6px soild red' }} />
                                    <Text>
                                        <Link to='/auth/password/reset' style={{ color: '#fff' }}>비밀번호 찾기</Link>
                                    </Text>
                                </Col>
                            )}
                        </Row>
                        <Row justify='center' align='bottom'>
                            <Icon component={SALMONLogo} className='logo-icon' />
                        </Row>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}

export default withRouter(LoginPageComponent);
