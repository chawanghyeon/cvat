import './styles.scss';
import React from 'react';
import { Col, Row } from 'antd/lib/grid';
import Button from 'antd/lib/button/button';
import { LoginOutlined } from '@ant-design/icons';
import AuthenticationProviderIcon from './auth-provider-icon';

export interface SocialAccountLinkProps {
    children: string;
    className?: string;
    href: string;
    icon: string;
}

function SocialAccountLink(props: SocialAccountLinkProps): JSX.Element {
    const {
        children, className, href, icon,
    } = props;

    return (
        <Col flex='auto'>
            <Button
                style={{ width: '100%' }}
                type='primary'
                size='large'
                href={href}
                className={`cvat-social-authentication-button ${className}`}
            >
                <Row align='middle' style={{ width: '100%' }}>
                    <Col>
                        {(icon) ?
                            <AuthenticationProviderIcon iconData={icon} provider={children} /> :
                            <LoginOutlined className='cvat-social-authentication-icon' />}
                    </Col>
                    <Col flex='auto'>
                        {children}
                    </Col>
                </Row>
            </Button>
        </Col>
    );
}

export default React.memo(SocialAccountLink);
