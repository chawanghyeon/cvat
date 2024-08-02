import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Row, Col } from 'antd/lib/grid';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Icon from '@ant-design/icons';
import { PasswordIcon, SALMONLogo } from 'icons';

import { requestPasswordResetAsync } from 'actions/auth-actions';
import { CombinedState } from 'reducers';
import ResetPasswordForm, { ResetPasswordData } from './reset-password-form';

interface StateToProps {
    fetching: boolean;
}

interface DispatchToProps {
    onResetPassword: typeof requestPasswordResetAsync;
}

interface ResetPasswordPageComponentProps {
    fetching: boolean;
    onResetPassword: (email: string) => void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    return {
        fetching: state.auth.fetching,
    };
}

const mapDispatchToProps: DispatchToProps = {
    onResetPassword: requestPasswordResetAsync,
};

function ResetPasswordPagePageComponent(props: ResetPasswordPageComponentProps): JSX.Element {
    const sizes = {
        style: {
            width: 640,
            padding: '170px 110px',
        },
    };

    const { fetching, onResetPassword } = props;
    const { Content } = Layout;

    return (
        <Layout>
            <Content>
                <Row justify='center' align='middle' style={{ height: '100%' }}>
                    <Col {...sizes} className='shadow-box'>
                        <Row justify='center' align='top'>
                            <Icon component={PasswordIcon} className='top-icon' />
                        </Row>
                        <ResetPasswordForm
                            fetching={fetching}
                            onSubmit={(resetPasswordData: ResetPasswordData): void => {
                                onResetPassword(resetPasswordData.email);
                            }}
                        />
                        <Col>
                            <Button
                                size='large'
                                type='default'
                                block
                            >
                                <Link to='/auth/login'> 로그인 페이지로 이동 </Link>
                            </Button>
                        </Col>
                        <Row justify='center' align='bottom'>
                            <Icon component={SALMONLogo} className='logo-icon' />
                        </Row>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetPasswordPagePageComponent);
