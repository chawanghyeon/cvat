import './styles.scss';
import React from 'react';
import { Row, Col } from 'antd/lib/grid';
import Text from 'antd/lib/typography/Text';

import { useTranslation } from 'react-i18next';
import CreateOrganizationForm from './create-organization-form';

function CreateOrganizationComponent(): JSX.Element {
    const { t } = useTranslation();
    return (
        <Row justify='center' align='top' className='cvat-create-organization-page'>
            <Col md={20} lg={16} xl={14} xxl={11}>
                <Text className='cvat-title'>{t('organizations.create.title')}</Text>
                <CreateOrganizationForm />
            </Col>
        </Row>
    );
}

export default React.memo(CreateOrganizationComponent);
