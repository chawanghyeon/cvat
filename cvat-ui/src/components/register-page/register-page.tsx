import React from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import { Link, withRouter } from 'react-router-dom';
import { Row, Col } from 'antd/lib/grid';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Icon from '@ant-design/icons';
import { SignUpIcon, SALMONLogo } from 'icons';

import { UserAgreement } from 'reducers';
import RegisterForm, { RegisterData, UserConfirmation } from './register-form';

interface RegisterPageComponentProps {
    fetching: boolean;
    userAgreements: UserAgreement[];
    onRegister: (
        username: string,
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        confirmations: UserConfirmation[],
    ) => void;
}

function RegisterPageComponent(props: RegisterPageComponentProps & RouteComponentProps): JSX.Element {
    const sizes = {
        style: {
            width: 640,
            padding: '140px 110px',
        },
    };

    const { fetching, userAgreements, onRegister } = props;
    const { Content } = Layout;
    const history = useHistory();

    return (
        <Layout>
            <Content>
                <Row justify='center' align='middle' style={{ height: '100%' }}>
                    <Col {...sizes} className='shadow-box'>
                        <Row justify='center' align='top'>
                            <Icon component={SignUpIcon} className='top-icon' />
                        </Row>
                        <RegisterForm
                            fetching={fetching}
                            userAgreements={userAgreements}
                            onSubmit={(registerData: RegisterData): void => {
                                onRegister(
                                    registerData.username,
                                    registerData.firstName,
                                    registerData.lastName,
                                    registerData.username + '@salmon.com',
                                    registerData.password,
                                    registerData.confirmations,
                                );
                            }}
                        />
                        <Col>
                            <Button
                                size='large'
                                type='default'
                                onClick={() => history.push('/auth/login')}
                                block
                            >
                                Go to login page
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

export default withRouter(RegisterPageComponent);
